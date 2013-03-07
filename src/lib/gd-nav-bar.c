/* -*- Mode: C; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 8 -*-
 *
 * Copyright (C) 2012 Red Hat, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 */

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include "gd-nav-bar.h"
#include <evince-view.h>
#include <evince-document.h>

#include <math.h>
#include <glib.h>
#include <glib/gi18n.h>
#include <glib-object.h>
#include <gtk/gtk.h>
#include <string.h>

#define GD_NAV_BAR_GET_PRIVATE(object) \
        (G_TYPE_INSTANCE_GET_PRIVATE ((object), GD_TYPE_NAV_BAR, GdNavBarPrivate))

G_DEFINE_TYPE (GdNavBar, gd_nav_bar, GTK_TYPE_BOX);

enum {
        PROP_DOCUMENT_MODEL = 1,
        NUM_PROPERTIES
};

typedef struct {
        gboolean uniform;
        gint uniform_width;
        gint uniform_height;
        GtkRequisition *sizes;
} GdPreviewSizeCache;

typedef struct {
        GdkPixbuf *pixbuf;
        gboolean   loaded;
        char      *label;
        int        page;
        EvJob     *job;
} PreviewItem;

struct _GdNavBarPrivate {
        GtkWidget *button_area;
        GtkWidget *scale;
        GtkWidget *page_label;
        GtkWidget *preview_window;
        GtkWidget *preview_image;
        GtkWidget *preview_label;

        EvDocumentModel *model;

        EvDocument *document;
        GdPreviewSizeCache *size_cache;
        int n_pages;
        int rotation;
        gboolean inverted_colors;

        GHashTable *loading_icons;
        PreviewItem *previews;
        guint update_id;
        guint show_id;
        int current_page;
        int preview_page;
        int page_start;
        int page_end;
        gboolean scrubbing;
};

/* Thumbnails dimensions cache */
#define PREVIEW_SIZE_CACHE_KEY "gd-preview-size-cache"
#define PREVIEW_WIDTH 144
#define PRELOAD_RANGE 5

static void previews_update_range (GdNavBar *self, int page);

static void
get_preview_size_for_page (EvDocument *document,
                           guint       page,
                           gint       *width,
                           gint       *height)
{
        gdouble scale;
        gdouble w, h;

        ev_document_get_page_size (document, page, &w, &h);
        scale = (gdouble)PREVIEW_WIDTH / w;

        *width = MAX ((gint)(w * scale + 0.5), 1);
        *height = MAX ((gint)(h * scale + 0.5), 1);
}

static GdPreviewSizeCache *
gd_preview_size_cache_new (EvDocument *document)
{
        GdPreviewSizeCache *cache;
        gint               i, n_pages;
        GtkRequisition    *thumb_size;

        cache = g_new0 (GdPreviewSizeCache, 1);

        if (ev_document_is_page_size_uniform (document)) {
                cache->uniform = TRUE;
                get_preview_size_for_page (document, 0,
                                           &cache->uniform_width,
                                           &cache->uniform_height);
                return cache;
        }

        n_pages = ev_document_get_n_pages (document);
        cache->sizes = g_new0 (GtkRequisition, n_pages);

        for (i = 0; i < n_pages; i++) {
                thumb_size = &(cache->sizes[i]);
                get_preview_size_for_page (document, i,
                                           &thumb_size->width,
                                           &thumb_size->height);
        }

        return cache;
}

static void
gd_preview_size_cache_get_size (GdPreviewSizeCache *cache,
                                gint               page,
                                gint               rotation,
                                gint              *width,
                                gint              *height)
{
        gint w, h;

        if (cache->uniform) {
                w = cache->uniform_width;
                h = cache->uniform_height;
        } else {
                GtkRequisition *thumb_size;

                thumb_size = &(cache->sizes[page]);

                w = thumb_size->width;
                h = thumb_size->height;
        }

        if (rotation == 0 || rotation == 180) {
                if (width) {
                        *width = w;
                }
                if (height) {
                        *height = h;
                }
        } else {
                if (width) {
                        *width = h;
                }
                if (height) {
                        *height = w;
                }
        }
}

static void
gd_preview_size_cache_free (GdPreviewSizeCache *cache)
{
        if (cache->sizes) {
                g_free (cache->sizes);
                cache->sizes = NULL;
        }

        g_free (cache);
}

static GdPreviewSizeCache *
gd_preview_size_cache_get (EvDocument *document)
{
        GdPreviewSizeCache *cache;

        cache = g_object_get_data (G_OBJECT (document), PREVIEW_SIZE_CACHE_KEY);
        if (!cache) {
                cache = gd_preview_size_cache_new (document);
                g_object_set_data_full (G_OBJECT (document),
                                        PREVIEW_SIZE_CACHE_KEY,
                                        cache,
                                        (GDestroyNotify)gd_preview_size_cache_free);
        }

        return cache;
}

static GdkPixbuf *
preview_get_loading_icon (GdNavBar *self,
                          int       width,
                          int       height)
{
        GdNavBarPrivate *priv = self->priv;
        GdkPixbuf *icon;
        char      *key;

        key = g_strdup_printf ("%dx%d", width, height);
        icon = g_hash_table_lookup (priv->loading_icons, key);
        if (icon == NULL) {
                gboolean inverted_colors;

                inverted_colors = ev_document_model_get_inverted_colors (priv->model);
                icon = ev_document_misc_render_loading_thumbnail (GTK_WIDGET (self), width, height, inverted_colors);
                g_hash_table_insert (priv->loading_icons, key, icon);
        } else {
                g_free (key);
        }

        return g_object_ref (icon);
}

static void
update_page_label (GdNavBar *self)
{
        char *text;

        text = g_strdup_printf (_("Page %u of %u"), self->priv->current_page + 1, self->priv->n_pages);
        gtk_label_set_text (GTK_LABEL (self->priv->page_label), text);
        g_free (text);
}

static void
update_scale (GdNavBar *self)
{
        gtk_range_set_value (GTK_RANGE (self->priv->scale), self->priv->current_page);
}

static void
update_page (GdNavBar *self)
{
        self->priv->current_page = ev_document_model_get_page (self->priv->model);
        update_page_label (self);
        update_scale (self);
        previews_update_range (self, self->priv->current_page);
}

static void
thumbnail_job_completed_cb (EvJobThumbnail *job,
                            GdNavBar       *self)
{
        GdNavBarPrivate *priv = self->priv;
        GdkPixbuf *pixbuf;
        PreviewItem *item;

        pixbuf = ev_document_misc_render_thumbnail_with_frame (GTK_WIDGET (self), job->thumbnail);

        if (priv->inverted_colors) {
                ev_document_misc_invert_pixbuf (pixbuf);
        }

        item = &self->priv->previews[job->page];
        g_clear_object (&item->pixbuf);
        item->pixbuf = pixbuf;
        item->loaded = TRUE;
        g_clear_object (&item->job);

        /* check to see if preview needs updating */
        if (self->priv->preview_page == job->page) {
                gtk_image_set_from_pixbuf (GTK_IMAGE (self->priv->preview_image), item->pixbuf);
        }
}

static void
previews_clear_range (GdNavBar *self,
                      int       start_page,
                      int       end_page)
{
        int i;

        g_assert (start_page <= end_page);

        for (i = start_page; i < end_page; i++) {
                PreviewItem *item = &self->priv->previews[i];

                if (item != NULL && item->job != NULL) {
                        g_signal_handlers_disconnect_by_func (item->job, thumbnail_job_completed_cb, self);
                        ev_job_cancel (item->job);
                        g_clear_object (&item->job);
                }
        }
}
static gdouble
get_scale_for_page (GdNavBar *self,
                    int       page)
{
        gdouble width;

        ev_document_get_page_size (self->priv->document, page, &width, NULL);

        return (gdouble)PREVIEW_WIDTH / width;
}

static void
previews_load_range (GdNavBar *self,
                     int       start_page,
                     int       end_page)
{
        int i;

        g_assert (start_page <= end_page);

        for (i = start_page; i < end_page; i++) {
                PreviewItem *item = &self->priv->previews[i];

                if (item != NULL && !item->loaded && item->job == NULL) {
                        item->job = ev_job_thumbnail_new (self->priv->document,
                                                          i,
                                                          self->priv->rotation,
                                                          get_scale_for_page (self, i));
                        ev_job_thumbnail_set_has_frame (EV_JOB_THUMBNAIL (item->job), FALSE);
                        ev_job_scheduler_push_job (EV_JOB (item->job), EV_JOB_PRIORITY_HIGH);

                        g_signal_connect (item->job, "finished",
                                          G_CALLBACK (thumbnail_job_completed_cb),
                                          self);
                }
        }
}

static void
previews_update_range (GdNavBar *self,
                       int       page)
{
        int old_start_page;
        int old_end_page;

        old_start_page = self->priv->page_start;
        old_end_page = self->priv->page_end;

        self->priv->page_start = MAX (page - PRELOAD_RANGE / 2, 0);
        self->priv->page_end = MIN (page + PRELOAD_RANGE / 2, self->priv->n_pages);

        if (self->priv->page_start == old_start_page &&
            self->priv->page_end == old_end_page) {
                return;
        }

        /* Clear the areas we no longer display */
        if (old_start_page >= 0 && old_start_page < self->priv->page_start) {
                previews_clear_range (self, old_start_page, MIN (self->priv->page_start - 1, old_end_page));
        }

        if (old_end_page > 0 && old_end_page > self->priv->page_end) {
                previews_clear_range (self, MAX (self->priv->page_end + 1, old_start_page), old_end_page);
        }

        previews_load_range (self, self->priv->page_start, self->priv->page_end);
}

static void
previews_create (GdNavBar *self)
{
        int i;

        self->priv->previews = g_new0 (PreviewItem, self->priv->n_pages);

        for (i = 0; i < self->priv->n_pages; i++) {
                PreviewItem *item = &self->priv->previews[i];
                char        *label;
                int          width;
                int          height;

                label = ev_document_get_page_label (self->priv->document, i);

                gd_preview_size_cache_get_size (self->priv->size_cache,
                                                i,
                                                self->priv->rotation,
                                                &width, &height);
                item->page = i;
                item->label = g_markup_printf_escaped ("%s", label);
                item->pixbuf = preview_get_loading_icon (self, width, height);
                item->loaded = FALSE;
                item->job = NULL;

                g_free (label);
        }
}

static void
preview_item_clear (PreviewItem *item)
{
        g_clear_object (&item->job);
        g_clear_object (&item->pixbuf);
        g_free (item->label);
        item->label = NULL;
}

static void
previews_clear (GdNavBar *self)
{
        int i;

        if (self->priv->previews == NULL) {
                return;
        }

        for (i = 0; i < self->priv->n_pages; i++) {
                PreviewItem *item = &self->priv->previews[i];

                preview_item_clear (item);
        }

        g_free (self->priv->previews);
        self->priv->previews = NULL;
}

static void
previews_reload (GdNavBar *self)
{
        if (self->priv->document == NULL ||
            self->priv->n_pages <= 0) {
                return;
        }

        previews_clear (self);
        previews_create (self);
}

static void
rotation_changed_cb (EvDocumentModel *model,
                     GParamSpec      *pspec,
                     GdNavBar        *self)
{
        self->priv->rotation = ev_document_model_get_rotation (model);
        previews_reload (self);
}

static void
inverted_colors_changed_cb (EvDocumentModel *model,
                            GParamSpec      *pspec,
                            GdNavBar        *self)
{
        self->priv->inverted_colors = ev_document_model_get_inverted_colors (model);
        previews_reload (self);
}

static void
gd_nav_bar_document_changed_cb (EvDocumentModel *model,
                                GParamSpec      *pspec,
                                GdNavBar        *self)
{
        GdNavBarPrivate *priv = self->priv;
        EvDocument *document;

        document = ev_document_model_get_document (model);
        if (document == self->priv->document) {
                return;
        }

        previews_clear (self);
        priv->n_pages = 0;
        priv->page_start = -1;
        priv->page_end = -1;

        g_clear_object (&priv->document);
        priv->document = document;
        if (priv->document != NULL) {
                g_object_ref (priv->document);

                priv->size_cache = gd_preview_size_cache_get (document);
                priv->n_pages = ev_document_get_n_pages (document);

                previews_create (self);

                gtk_widget_set_sensitive (priv->scale, (priv->n_pages > 1));
                gtk_range_set_range (GTK_RANGE (priv->scale), 0.0, priv->n_pages - 1);

                update_page (self);
        }
}

static void
page_changed_cb (EvDocumentModel *model,
                 gint             old_page,
                 gint             new_page,
                 GdNavBar        *self)
{
        if (self->priv->current_page != new_page) {
                update_page (self);
        }
}

static void
gd_nav_bar_set_document_model (GdNavBar        *self,
                               EvDocumentModel *model)
{
        GdNavBarPrivate *priv = self->priv;

        if (priv->model == model) {
                return;
        }

        if (priv->model != NULL) {
                g_signal_handlers_disconnect_by_data (priv->model, self);
                g_object_unref (priv->model);
        }

        priv->model = model;

        if (model != NULL) {
                g_object_ref (model);
        }

        priv->rotation = ev_document_model_get_rotation (model);
        priv->inverted_colors = ev_document_model_get_inverted_colors (model);

        gd_nav_bar_document_changed_cb (model, NULL, self);

        g_signal_connect (priv->model,
                          "notify::document",
                          G_CALLBACK (gd_nav_bar_document_changed_cb),
                          self);
        g_signal_connect (priv->model,
                          "notify::rotation",
                          G_CALLBACK (rotation_changed_cb),
                          self);
        g_signal_connect (priv->model,
                          "notify::inverted-colors",
                          G_CALLBACK (inverted_colors_changed_cb),
                          self);
        g_signal_connect (priv->model,
                          "page-changed",
                          G_CALLBACK (page_changed_cb),
                          self);

}

static void
gd_nav_bar_get_property (GObject    *object,
                         guint       prop_id,
                         GValue     *value,
                         GParamSpec *pspec)
{
        GdNavBar *self = GD_NAV_BAR (object);

        switch (prop_id) {
        case PROP_DOCUMENT_MODEL:
                g_value_set_object (value, self->priv->model);
                break;
        default:
                G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
                break;
        }
}

static void
gd_nav_bar_set_property (GObject      *object,
                         guint         prop_id,
                         const GValue *value,
                         GParamSpec   *pspec)
{
        GdNavBar *self = GD_NAV_BAR (object);

        switch (prop_id) {
        case PROP_DOCUMENT_MODEL:
                gd_nav_bar_set_document_model (self, g_value_get_object (value));
                break;
        default:
                G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
                break;
        }
}

static void
gd_nav_bar_dispose (GObject *object)
{
        GdNavBar *self = GD_NAV_BAR (object);

        if (self->priv->update_id != 0) {
                g_source_remove (self->priv->update_id);
                self->priv->update_id = 0;
        }

        if (self->priv->show_id != 0) {
                g_source_remove (self->priv->show_id);
                self->priv->show_id = 0;
        }

        g_clear_object (&self->priv->model);
        g_clear_object (&self->priv->document);

        if (self->priv->loading_icons != NULL) {
                g_hash_table_destroy (self->priv->loading_icons);
                self->priv->loading_icons = NULL;
        }

        previews_clear (self);

        G_OBJECT_CLASS (gd_nav_bar_parent_class)->dispose (object);
}

static gboolean
gd_nav_bar_draw (GtkWidget *widget,
                 cairo_t   *cr)
{
       GtkStyleContext *context;

        context = gtk_widget_get_style_context (widget);

        gtk_render_background (context, cr, 0, 0,
                               gtk_widget_get_allocated_width (widget),
                               gtk_widget_get_allocated_height (widget));

        gtk_render_frame (context, cr, 0, 0,
                          gtk_widget_get_allocated_width (widget),
                          gtk_widget_get_allocated_height (widget));

        return GTK_WIDGET_CLASS (gd_nav_bar_parent_class)->draw (widget, cr);
}

static void
gd_nav_bar_class_init (GdNavBarClass *class)
{
        GObjectClass *oclass = G_OBJECT_CLASS (class);
        GtkWidgetClass *wclass = GTK_WIDGET_CLASS (class);

        oclass->dispose = gd_nav_bar_dispose;
        oclass->get_property = gd_nav_bar_get_property;
        oclass->set_property = gd_nav_bar_set_property;
        wclass->draw = gd_nav_bar_draw;

        g_object_class_install_property (oclass,
                                         PROP_DOCUMENT_MODEL,
                                         g_param_spec_object ("document-model",
                                                              "Document Model",
                                                              "The document model",
                                                              EV_TYPE_DOCUMENT_MODEL,
                                                              G_PARAM_CONSTRUCT |
                                                              G_PARAM_READWRITE |
                                                              G_PARAM_STATIC_STRINGS));

        g_type_class_add_private (oclass, sizeof (GdNavBarPrivate));
}

static void
update_current_page (GdNavBar *self)
{
        gdouble page;

        page = round (gtk_range_get_value (GTK_RANGE (self->priv->scale)));
        ev_document_model_set_page (self->priv->model, page);
}

static void
hide_preview (GdNavBar *self)
{
        if (self->priv->update_id != 0) {
                g_source_remove (self->priv->update_id);
                self->priv->update_id = 0;
        }

        if (self->priv->show_id != 0) {
                g_source_remove (self->priv->show_id);
                self->priv->show_id = 0;
        }

        gtk_widget_hide (self->priv->preview_window);
}

static void
show_preview (GdNavBar *self)
{
        GdkWindow *window, *toplevel_window;
        GtkWidget *toplevel;
        int x, y;
        int width, height;
        int bx, by;
        int tx, ty;

        gtk_widget_realize (self->priv->preview_window);

        width = gtk_widget_get_allocated_width (GTK_WIDGET (self->priv->preview_window));
        height = gtk_widget_get_allocated_height (GTK_WIDGET (self->priv->preview_window));

        window = gtk_widget_get_window (GTK_WIDGET (self));
        gdk_window_get_position (window, &bx, &by);

        toplevel = gtk_widget_get_toplevel (GTK_WIDGET (self));
        toplevel_window = gtk_widget_get_window (toplevel);
        gdk_window_get_origin (toplevel_window, &tx, &ty);

        x = tx + bx + (gdk_window_get_width (window) - width) / 2;
        y = ty + by - height - 10;

        gtk_window_move (GTK_WINDOW (self->priv->preview_window), x, y);
        gtk_window_present (GTK_WINDOW (self->priv->preview_window));
}

static gboolean
update_jobs_timeout (GdNavBar *self)
{
        PreviewItem *item;

        previews_update_range (self, self->priv->preview_page);

        item = &self->priv->previews[self->priv->preview_page];
        if (item->job != NULL) {
                ev_job_scheduler_update_job (item->job, EV_JOB_PRIORITY_URGENT);
        }

        self->priv->update_id = 0;
        return FALSE;
}

static gboolean
show_preview_timeout (GdNavBar *self)
{
        show_preview (self);

        self->priv->show_id = 0;
        return FALSE;
}

static void
update_preview (GdNavBar *self)
{
        PreviewItem *item;

        item = &self->priv->previews[self->priv->preview_page];

        if (item->pixbuf != NULL) {
                gtk_image_set_from_pixbuf (GTK_IMAGE (self->priv->preview_image), item->pixbuf);
        }

        gtk_label_set_text (GTK_LABEL (self->priv->preview_label), item->label);

        if (self->priv->update_id == 0) {
                self->priv->update_id = g_timeout_add (300, (GSourceFunc)update_jobs_timeout, self);
        }
}

static void
scale_value_changed_cb (GtkRange *range,
                        GdNavBar *self)
{
        int page;

        page = round (gtk_range_get_value (GTK_RANGE (self->priv->scale)));
        if (page == self->priv->preview_page) {
                return;
        }

        self->priv->preview_page = page;
        if (self->priv->scrubbing) {
                update_preview (self);
                if (self->priv->show_id == 0) {
                        self->priv->show_id = g_timeout_add (300, (GSourceFunc)show_preview_timeout, self);
                }
        } else {
                hide_preview (self);
                update_current_page (self);
        }
}

static gboolean
scale_button_press_cb (GtkWidget *widget,
                       GdkEvent  *event,
                       GdNavBar  *self)
{
        self->priv->scrubbing = TRUE;
        update_preview (self);

        /* delay the show slightly to avoid flashing if the release is
           coming soon */
        if (self->priv->show_id == 0) {
                self->priv->show_id = g_timeout_add (300, (GSourceFunc)show_preview_timeout, self);
        }

        return FALSE;
}

static gboolean
scale_button_release_cb (GtkWidget *widget,
                         GdkEvent  *event,
                         GdNavBar  *self)
{
        self->priv->scrubbing = FALSE;
        hide_preview (self);
        update_current_page (self);

        return FALSE;
}

static gboolean
scale_grab_broken_cb (GtkWidget *widget,
                      GdkEvent  *event,
                      GdNavBar  *self)
{
        self->priv->scrubbing = FALSE;
        hide_preview (self);

        return FALSE;
}

static gboolean
scale_motion_notify_cb (GtkWidget *widget,
                        GdkEvent  *event,
                        GdNavBar  *self)
{
        /* show the preview immediately if we're scrubbing */
        if (self->priv->scrubbing) {
                if (self->priv->show_id != 0) {
                        g_source_remove (self->priv->show_id);
                        self->priv->show_id = 0;
                }
                show_preview (self);
        }

        return FALSE;
}

static void
create_preview_window (GdNavBar *self)
{
        GtkStyleContext *context;
        GtkWidget *box;
        GdkScreen *screen;
        GdkVisual *visual;

        self->priv->preview_window = gtk_window_new (GTK_WINDOW_POPUP);
        screen = gtk_widget_get_screen (self->priv->preview_window);
        visual = gdk_screen_get_rgba_visual (screen);

        if (visual != NULL) {
                gtk_widget_set_visual (self->priv->preview_window, visual);
        }

        gtk_window_set_type_hint (GTK_WINDOW (self->priv->preview_window), GDK_WINDOW_TYPE_HINT_TOOLTIP);
        gtk_window_set_resizable (GTK_WINDOW (self->priv->preview_window), FALSE);

        context = gtk_widget_get_style_context (self->priv->preview_window);
        gtk_style_context_add_class (context, GTK_STYLE_CLASS_TOOLTIP);

        box = gtk_box_new (GTK_ORIENTATION_VERTICAL, 6);
        gtk_widget_set_margin_left (box, 6);
        gtk_widget_set_margin_right (box, 6);
        gtk_widget_set_margin_top (box, 6);
        gtk_widget_set_margin_bottom (box, 6);
        gtk_container_add (GTK_CONTAINER (self->priv->preview_window), box);
        gtk_widget_show (box);

        self->priv->preview_image = gtk_image_new ();
        gtk_widget_set_size_request (self->priv->preview_image, PREVIEW_WIDTH, -1);
        gtk_box_pack_start (GTK_BOX (box), self->priv->preview_image, FALSE, FALSE, 0);

        self->priv->preview_label = gtk_label_new ("");
        gtk_label_set_line_wrap (GTK_LABEL (self->priv->preview_label), TRUE);
        gtk_box_pack_start (GTK_BOX (box), self->priv->preview_label, FALSE, FALSE, 0);

        gtk_widget_show_all (box);
}

/**
 * gd_nav_bar_get_button_area:
 * @bar: a #GdNavBar
 *
 * Returns the button area of @bar.
 *
 * Returns: (transfer none): the button area #GtkBox.
 **/
GtkWidget *
gd_nav_bar_get_button_area (GdNavBar *bar)
{
        g_return_val_if_fail (GD_IS_NAV_BAR (bar), NULL);

        return bar->priv->button_area;
}

static void
gd_nav_bar_init (GdNavBar *self)
{
        GdNavBarPrivate *priv;
        GtkWidget *inner_box;

        self->priv = GD_NAV_BAR_GET_PRIVATE (self);

        priv = self->priv;

        priv->loading_icons = g_hash_table_new_full (g_str_hash,
                                                     g_str_equal,
                                                     (GDestroyNotify)g_free,
                                                     (GDestroyNotify)g_object_unref);

        inner_box = gtk_box_new (GTK_ORIENTATION_HORIZONTAL, 5);
        gtk_container_set_border_width (GTK_CONTAINER (inner_box), 10);
        gtk_box_set_spacing (GTK_BOX (inner_box), 10);
        gtk_widget_show (inner_box);
        gtk_widget_set_hexpand (GTK_WIDGET (inner_box), TRUE);
        gtk_container_add (GTK_CONTAINER (self), inner_box);

        priv->button_area = gtk_box_new (GTK_ORIENTATION_HORIZONTAL, 0);
        gtk_widget_set_margin_left (priv->button_area, 5);
        gtk_widget_set_margin_right (priv->button_area, 5);
        gtk_widget_show (priv->button_area);
        gtk_box_pack_start (GTK_BOX (inner_box), priv->button_area, FALSE, FALSE, 0);

        priv->scale = gtk_scale_new (GTK_ORIENTATION_HORIZONTAL, NULL);
        gtk_scale_set_draw_value (GTK_SCALE (priv->scale), FALSE);
        gtk_scale_set_has_origin (GTK_SCALE (priv->scale), TRUE);
        gtk_range_set_increments (GTK_RANGE (priv->scale), 1.0, 1.0);
        gtk_range_set_range (GTK_RANGE (priv->scale), 0.0, 1.0);
        gtk_widget_show (priv->scale);
        gtk_box_pack_start (GTK_BOX (inner_box), priv->scale, TRUE, TRUE, 0);

        priv->page_label = gtk_label_new (NULL);
        gtk_widget_show (priv->page_label);
        gtk_box_pack_end (GTK_BOX (inner_box), priv->page_label, FALSE, FALSE, 0);

        gtk_container_set_border_width (GTK_CONTAINER (self), 0);

        gtk_style_context_add_class (gtk_widget_get_style_context (GTK_WIDGET (self)),
                                     GTK_STYLE_CLASS_TOOLBAR);

        g_signal_connect (priv->scale, "value-changed",
                          G_CALLBACK (scale_value_changed_cb),
                          self);
        g_signal_connect (priv->scale, "button-press-event",
                          G_CALLBACK (scale_button_press_cb),
                          self);
        g_signal_connect (priv->scale, "button-release-event",
                          G_CALLBACK (scale_button_release_cb),
                          self);
        g_signal_connect (priv->scale, "grab-broken-event",
                          G_CALLBACK (scale_grab_broken_cb),
                          self);
        g_signal_connect (priv->scale, "motion-notify-event",
                          G_CALLBACK (scale_motion_notify_cb),
                          self);

        create_preview_window (self);
}

/**
 * gd_nav_bar_new:
 * @model: the #EvDocumentModel
 *
 * Creates a new page navigation widget.
 *
 * Returns: a new #GdNavBar object.
 **/
GtkWidget *
gd_nav_bar_new (EvDocumentModel *model)
{
        GObject *self;

        self = g_object_new (GD_TYPE_NAV_BAR,
                             "document-model", model,
                             "orientation", GTK_ORIENTATION_HORIZONTAL,
                             NULL);

        return GTK_WIDGET (self);
}
