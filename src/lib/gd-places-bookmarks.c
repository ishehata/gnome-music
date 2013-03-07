/* -*- Mode: C; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 8;  -*-
 *
 *  Copyright (C) 2010 Carlos Garcia Campos  <carlosgc@gnome.org>
 *  Copyright (C) 2013 Red Hat, Inc.
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2, or (at your option)
 *  any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

#include "config.h"

#include <glib/gi18n.h>

#include <evince-document.h>
#include <evince-view.h>

#include <libgd/gd.h>

#include "gd-places-bookmarks.h"
#include "gd-places-page.h"

struct _GdPlacesBookmarksPrivate {
        EvDocumentModel *document_model;
        GdBookmarks     *bookmarks;
        const char      *name;
        GtkWidget       *tree_view;

        EvJob           *job;

        guint            activated_id;
};

enum {
        PROP_0,
        PROP_NAME,
        PROP_DOCUMENT_MODEL,
        PROP_BOOKMARKS,
};

enum {
        COLUMN_MARKUP,
        COLUMN_PAGE_LABEL,
        COLUMN_BOOKMARK,
        N_COLUMNS
};

enum {
        BOOKMARK_ACTIVATED,
        N_SIGNALS
};

static guint signals[N_SIGNALS];

static void gd_places_bookmarks_page_iface_init (GdPlacesPageInterface *iface);

G_DEFINE_TYPE_EXTENDED (GdPlacesBookmarks,
                        gd_places_bookmarks,
                        GTK_TYPE_BOX,
                        0,
                        G_IMPLEMENT_INTERFACE (GD_TYPE_PLACES_PAGE,
                                               gd_places_bookmarks_page_iface_init))

static GdBookmark *
gd_places_bookmarks_get_selected_bookmark (GdPlacesBookmarks *self,
                                           GtkTreeSelection  *selection)
{
        GtkTreeModel *model;
        GtkTreeIter   iter;

        if (gtk_tree_selection_get_selected (selection, &model, &iter)) {
                GdBookmark *bookmark;

                gtk_tree_model_get (model, &iter,
                                    COLUMN_BOOKMARK, &bookmark,
                                    -1);
                return bookmark;
        }

        return NULL;
}

typedef struct {
        EvDocument *document;
        guint page_number;
        char *markup;
} LinkModelData;

static gboolean
link_model_foreach (GtkTreeModel *model,
                    GtkTreePath  *path,
                    GtkTreeIter  *iter,
                    gpointer      user_data)
{
        LinkModelData *data = user_data;
        EvLink *link = NULL;
        char *markup = NULL;
        int link_page;
        gboolean ret = FALSE;

        gtk_tree_model_get (model, iter,
                            EV_DOCUMENT_LINKS_COLUMN_LINK, &link,
                            EV_DOCUMENT_LINKS_COLUMN_MARKUP, &markup,
                            -1);
        if (link != NULL) {
                link_page = ev_document_links_get_link_page (EV_DOCUMENT_LINKS (data->document), link);
                if (link_page == data->page_number) {
                        GtkTreeIter parent;

                        if (gtk_tree_model_iter_parent (model, &parent, iter)) {
                                char *parent_markup = NULL;
                                gtk_tree_model_get (model, &parent,
                                                    EV_DOCUMENT_LINKS_COLUMN_MARKUP, &parent_markup,
                                                    -1);
                                if (parent_markup != NULL) {
                                        data->markup = g_strdup_printf ("%s ﹥ %s", parent_markup, markup);
                                        g_free (parent_markup);
                                }
                        }

                        if (data->markup == NULL) {
                                data->markup = g_strdup (markup);
                        }

                        ret = TRUE;
                }
        }

        g_free (markup);
        g_clear_object (&link);

        return ret;
}

static char *
get_link_title_for_page (EvDocument   *document,
                         GtkTreeModel *links_model,
                         guint         page)
{
        LinkModelData *data;
        char *ret;

        data = g_new0 (LinkModelData, 1);
        data->page_number = page;
        data->document = document;
        gtk_tree_model_foreach (links_model, link_model_foreach, data);
        ret = data->markup;
        g_free (data);

        return ret;
}

static void
enable_selection (GdPlacesBookmarks *self,
                  gboolean           enabled)
{
        GtkTreeSelection *selection;

        selection = gtk_tree_view_get_selection (GTK_TREE_VIEW (self->priv->tree_view));
        gtk_tree_selection_set_mode (selection, enabled ? GTK_SELECTION_SINGLE : GTK_SELECTION_NONE);
}

#define MAX_LEN_LABEL 200
#define MIN_LEN_LABEL 20

static char *
get_pretty_name (const char *text)
{
        char *name = NULL;
        char trimmed[MAX_LEN_LABEL];
        char basename[MAX_LEN_LABEL];
        int i;
        int last_word = -1;
        int last_sentence = -1;
        int last_nonspace = -1;
        int num_attrs;
        PangoLogAttr *attrs;
        gboolean ellipse = TRUE;

        num_attrs = MIN (g_utf8_strlen (text, -1) + 1, MAX_LEN_LABEL);
        attrs = g_new (PangoLogAttr, num_attrs);
        g_utf8_strncpy (trimmed, text, num_attrs - 1);
        pango_get_log_attrs (trimmed, -1, -1, pango_language_get_default (), attrs, num_attrs);

        /* since the end of the text will always match a word boundary don't include it */
        for (i = 0; (i < num_attrs - 1); i++) {
                if (!attrs[i].is_white) {
                        last_nonspace = i;
                }
                if (attrs[i].is_sentence_end) {
                        last_sentence = i;
                }
                if (attrs[i].is_word_boundary) {
                        last_word = last_nonspace;
                }
        }
        g_free (attrs);

        if (last_sentence > 0) {
                i = last_sentence;
                ellipse = FALSE;
        } else {
                i = last_word;
        }

        g_utf8_strncpy (basename, trimmed, i);
        if (ellipse) {
                name = g_strdup_printf ("“%s…”", basename);
        } else {
                name = g_strdup_printf ("“%s”", basename);
        }

        return name;
}

static char *
remove_duplicate_whitespace (const char *old)
{
        char   *new;
        GRegex *re;
        GError *error;

        error = NULL;
        re = g_regex_new ("[ \t\n\r]+", G_REGEX_MULTILINE, 0, &error);
        if (re == NULL) {
                g_warning ("Error building regex: %s", error->message);
                g_error_free (error);
                return g_strdup (old);
        }

        new = g_regex_replace (re, old, -1, 0, " ", 0, &error);
        g_regex_unref (re);
        if (new == NULL) {
                g_warning ("Error replacing string: %s", error->message);
                g_error_free (error);
                return g_strdup (old);
        }

        return new;
}

static void
load_bookmark_model (GdPlacesBookmarks *self,
                     GtkTreeModel      *links_model)
{
        GtkListStore *model;
        GList *items;
        GList *l;
        EvDocument *document;

        if (self->priv->bookmarks == NULL) {
                return;
        }

        model = GTK_LIST_STORE (gtk_tree_view_get_model (GTK_TREE_VIEW (self->priv->tree_view)));

        document = ev_document_model_get_document (self->priv->document_model);

        items = gd_bookmarks_get_bookmarks (self->priv->bookmarks);
        items = g_list_sort (items, (GCompareFunc)gd_bookmark_compare);
        for (l = items; l; l = g_list_next (l)) {
                GdBookmark *bookmark = (GdBookmark *)l->data;
                GtkTreeIter iter;
                const char *title;
                char *label = NULL;
                char *markup = NULL;
                guint page;

                title = gd_bookmark_get_title (bookmark);
                page = gd_bookmark_get_page_number (bookmark);

                if (ev_document_has_text_page_labels (document)) {
                        label = ev_document_get_page_label (document, page);
                } else {
                        label = g_strdup_printf ("%d", page + 1);
                }

                if (links_model != NULL) {
                        markup = get_link_title_for_page (document, links_model, page);
                }

                if (markup == NULL && EV_IS_DOCUMENT_TEXT (document)) {
                        char *text;
                        char *trimmed;
                        char *stripped;
                        EvPage *ev_page;

                        ev_page = ev_document_get_page (document, page);
                        text = ev_document_text_get_text (EV_DOCUMENT_TEXT (document), ev_page);
                        trimmed = g_utf8_substring (text, 0, MAX_LEN_LABEL * 2);
                        g_free (text);
                        stripped = remove_duplicate_whitespace (trimmed);
                        g_free (trimmed);
                        markup = get_pretty_name (stripped);
                        g_free (stripped);
                }

                if (markup == NULL) {
                        markup = g_strdup_printf (_("Page %s"), label);
                }

                gtk_list_store_append (model, &iter);
                gtk_list_store_set (model, &iter,
                                    COLUMN_MARKUP, markup != NULL ? markup : title,
                                    COLUMN_PAGE_LABEL, label,
                                    COLUMN_BOOKMARK, bookmark,
                                    -1);
                g_free (label);
                g_free (markup);
        }

        enable_selection (self, TRUE);

        g_list_free (items);
}

static void
job_finished_cb (EvJobLinks        *job,
                 GdPlacesBookmarks *self)
{
        GdPlacesBookmarksPrivate *priv = self->priv;
        GtkListStore             *model;

        model = GTK_LIST_STORE (gtk_tree_view_get_model (GTK_TREE_VIEW (priv->tree_view)));
        gtk_list_store_clear (model);
        load_bookmark_model (self, job->model);

        g_clear_object (&priv->job);
}

static void
gd_places_bookmarks_update (GdPlacesBookmarks *self)
{
        GdPlacesBookmarksPrivate *priv = self->priv;
        GtkListStore             *model;
        GtkTreeIter               iter;
        guint                     n_items = 0;
        EvDocument               *document;

        if (priv->document_model == NULL) {
                /* not loaded yet */
                return;
        }

        if (priv->job != NULL) {
                ev_job_cancel (priv->job);
                g_clear_object (&priv->job);
        }

        model = GTK_LIST_STORE (gtk_tree_view_get_model (GTK_TREE_VIEW (priv->tree_view)));
        gtk_list_store_clear (model);
        enable_selection (self, FALSE);

        if (priv->bookmarks != NULL) {
                n_items = gd_bookmarks_get_n_items (priv->bookmarks);
        }

        document = ev_document_model_get_document (priv->document_model);
        if (n_items == 0) {
                gtk_list_store_append (model, &iter);
                gtk_list_store_set (model, &iter,
                                    COLUMN_MARKUP, _("No bookmarks"),
                                    COLUMN_PAGE_LABEL, NULL,
                                    COLUMN_BOOKMARK, NULL,
                                    -1);
        } else if (ev_document_links_has_document_links (EV_DOCUMENT_LINKS (document))) {
                gtk_list_store_append (model, &iter);
                gtk_list_store_set (model, &iter,
                                    COLUMN_MARKUP, _("Loading…"),
                                    COLUMN_PAGE_LABEL, NULL,
                                    COLUMN_BOOKMARK, NULL,
                                    -1);
                priv->job = ev_job_links_new (document);
                g_signal_connect (priv->job,
                                  "finished",
                                  G_CALLBACK (job_finished_cb),
                                  self);

                /* The priority doesn't matter for this job */
                ev_job_scheduler_push_job (priv->job, EV_JOB_PRIORITY_NONE);
        } else {
                load_bookmark_model (self, NULL);
        }
}

static void
gd_places_bookmarks_changed (GdBookmarks       *bookmarks,
                             GdPlacesBookmarks *self)
{
        gd_places_bookmarks_update (self);
}

static gboolean
emit_activated (GdPlacesBookmarks *self)
{
        GtkTreeSelection *selection;
        GdBookmark       *bookmark;

        selection = gtk_tree_view_get_selection (GTK_TREE_VIEW (self->priv->tree_view));
        bookmark = gd_places_bookmarks_get_selected_bookmark (self, selection);

        if (bookmark != NULL) {
                g_signal_emit (self, signals[BOOKMARK_ACTIVATED], 0, bookmark);

                g_object_unref (bookmark);
        }

        self->priv->activated_id = 0;

        return FALSE;
}

static void
schedule_emit_activated (GdPlacesBookmarks *self)
{
        /* jump through some hoops to avoid destroying in the middle
           of a button release handler */
        if (self->priv->activated_id == 0) {
                self->priv->activated_id = g_idle_add ((GSourceFunc) emit_activated, self);
        }
}

static void
gd_places_bookmarks_set_document_model (GdPlacesPage    *page,
                                        EvDocumentModel *model)
{
        GdPlacesBookmarks *self = GD_PLACES_BOOKMARKS (page);
        GdPlacesBookmarksPrivate *priv = self->priv;

        if (priv->document_model == model)
                return;

        if (priv->document_model != NULL) {
                g_signal_handlers_disconnect_by_func (priv->document_model,
                                                      gd_places_bookmarks_update,
                                                      page);
        }

        g_clear_object (&priv->document_model);
        priv->document_model = model;

        if (priv->document_model != NULL) {
                g_object_ref (priv->document_model);
                g_signal_connect_swapped (priv->document_model,
                                          "notify::document",
                                          G_CALLBACK (gd_places_bookmarks_update),
                                          page);
        }

        gd_places_bookmarks_update (self);
}

void
gd_places_bookmarks_set_bookmarks (GdPlacesBookmarks *self,
                                   GdBookmarks       *bookmarks)
{
        GdPlacesBookmarksPrivate *priv = self->priv;

        g_return_if_fail (GD_IS_BOOKMARKS (bookmarks));

        if (priv->bookmarks == bookmarks)
                return;

        if (priv->bookmarks != NULL) {
                g_signal_handlers_disconnect_by_func (priv->bookmarks,
                                                      G_CALLBACK (gd_places_bookmarks_update),
                                                      self);
        }

        g_clear_object (&priv->bookmarks);
        priv->bookmarks = g_object_ref (bookmarks);
        g_signal_connect_swapped (priv->bookmarks, "changed",
                                  G_CALLBACK (gd_places_bookmarks_update),
                                  self);

        gd_places_bookmarks_update (self);
}

static void
gd_places_bookmarks_set_property (GObject      *object,
                                  guint         prop_id,
                                  const GValue *value,
                                  GParamSpec   *pspec)
{

        GdPlacesBookmarks *self = GD_PLACES_BOOKMARKS (object);

        switch (prop_id) {
        case PROP_DOCUMENT_MODEL:
                gd_places_bookmarks_set_document_model (GD_PLACES_PAGE (self), g_value_get_object (value));
                break;
        case PROP_BOOKMARKS:
                gd_places_bookmarks_set_bookmarks (self, g_value_get_object (value));
                break;
        default:
                G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
                break;
        }
}

static void
gd_places_bookmarks_get_property (GObject    *object,
                                  guint       prop_id,
                                  GValue     *value,
                                  GParamSpec *pspec)
{
        GdPlacesBookmarks *self = GD_PLACES_BOOKMARKS (object);

        switch (prop_id) {
        case PROP_NAME:
                g_value_set_string (value, self->priv->name);
                break;
        case PROP_DOCUMENT_MODEL:
                g_value_set_object (value, self->priv->document_model);
                break;
        case PROP_BOOKMARKS:
                g_value_set_object (value, self->priv->bookmarks);
                break;
        default:
                G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
                break;
        }
}

static void
gd_places_bookmarks_dispose (GObject *object)
{
        GdPlacesBookmarks *self = GD_PLACES_BOOKMARKS (object);
        GdPlacesBookmarksPrivate *priv = self->priv;

        if (priv->bookmarks != NULL) {
                g_signal_handlers_disconnect_by_func (priv->bookmarks,
                                                      G_CALLBACK (gd_places_bookmarks_changed),
                                                      self);
        }

        if (priv->document_model != NULL) {
                g_signal_handlers_disconnect_by_func (priv->document_model,
                                                      gd_places_bookmarks_update,
                                                      self);
        }

        if (self->priv->job != NULL) {
                ev_job_cancel (self->priv->job);
                g_clear_object (&self->priv->job);
        }

        if (self->priv->activated_id > 0) {
                g_source_remove (self->priv->activated_id);
                self->priv->activated_id = 0;
        }

        g_clear_object (&priv->document_model);
        g_clear_object (&priv->bookmarks);

        G_OBJECT_CLASS (gd_places_bookmarks_parent_class)->dispose (object);
}

static void
gd_places_bookmarks_construct (GdPlacesBookmarks *self)
{
        GdPlacesBookmarksPrivate *priv = self->priv;
        GtkWidget                *swindow;
        GtkWidget                *hbox;
        GtkListStore             *model;
        GtkTreeViewColumn        *column;
        GtkCellRenderer          *renderer;

        swindow = gtk_scrolled_window_new (NULL, NULL);
        gtk_scrolled_window_set_shadow_type (GTK_SCROLLED_WINDOW (swindow),
                                             GTK_SHADOW_IN);
        gtk_box_pack_start (GTK_BOX (self), swindow, TRUE, TRUE, 0);
        gtk_widget_show (swindow);

        model = gtk_list_store_new (N_COLUMNS, G_TYPE_STRING, G_TYPE_STRING, GD_TYPE_BOOKMARK);
        priv->tree_view = gtk_tree_view_new_with_model (GTK_TREE_MODEL (model));
        enable_selection (self, FALSE);
        gtk_tree_view_set_rules_hint (GTK_TREE_VIEW (priv->tree_view), TRUE);
        gtk_tree_view_set_activate_on_single_click (GTK_TREE_VIEW (priv->tree_view), TRUE);
        gtk_tree_view_set_headers_visible (GTK_TREE_VIEW (priv->tree_view), FALSE);
        g_object_unref (model);

        g_signal_connect_swapped (priv->tree_view, "row-activated",
                                  G_CALLBACK (schedule_emit_activated),
                                  self);

        column = gtk_tree_view_column_new ();
        gtk_tree_view_column_set_expand (GTK_TREE_VIEW_COLUMN (column), TRUE);
        gtk_tree_view_append_column (GTK_TREE_VIEW (priv->tree_view), column);

        renderer = gtk_cell_renderer_text_new ();
        g_object_set (renderer,
                      "wrap-mode", PANGO_WRAP_WORD,
                      "wrap-width", 350,
                      "weight", PANGO_WEIGHT_BOLD,
                      "xpad", 10,
                      NULL);
        gtk_tree_view_column_pack_start (GTK_TREE_VIEW_COLUMN (column), renderer, TRUE);
        gtk_tree_view_column_set_attributes (GTK_TREE_VIEW_COLUMN (column), renderer,
                                             "markup", COLUMN_MARKUP,
                                             NULL);

        renderer = gd_styled_text_renderer_new ();
        gd_styled_text_renderer_add_class (GD_STYLED_TEXT_RENDERER (renderer), "dim-label");
        g_object_set (renderer,
                      "max-width-chars", 12,
                      "scale", PANGO_SCALE_SMALL,
                      "xalign", 1.0,
                      "xpad", 10,
                      NULL);
        gtk_tree_view_column_pack_end (GTK_TREE_VIEW_COLUMN (column), renderer, FALSE);
        gtk_tree_view_column_set_attributes (GTK_TREE_VIEW_COLUMN (column), renderer,
                                             "text", COLUMN_PAGE_LABEL,
                                             NULL);

        gtk_container_add (GTK_CONTAINER (swindow), priv->tree_view);
        gtk_widget_show (priv->tree_view);

        hbox = gtk_button_box_new (GTK_ORIENTATION_HORIZONTAL);

        gtk_box_pack_end (GTK_BOX (self), hbox, FALSE, TRUE, 0);
        gtk_widget_show (hbox);
        gtk_widget_show (GTK_WIDGET (self));
}

static void
gd_places_bookmarks_init (GdPlacesBookmarks *self)
{

        self->priv = G_TYPE_INSTANCE_GET_PRIVATE (self,
                                                  GD_TYPE_PLACES_BOOKMARKS,
                                                  GdPlacesBookmarksPrivate);

        self->priv->name = _("Bookmarks");

        gd_places_bookmarks_construct (self);
}

static void
gd_places_bookmarks_class_init (GdPlacesBookmarksClass *klass)
{
        GObjectClass   *oclass = G_OBJECT_CLASS (klass);

        oclass->get_property = gd_places_bookmarks_get_property;
        oclass->set_property = gd_places_bookmarks_set_property;
        oclass->dispose = gd_places_bookmarks_dispose;

        signals[BOOKMARK_ACTIVATED] = g_signal_new ("bookmark-activated",
                                                    G_TYPE_FROM_CLASS (oclass),
                                                    G_SIGNAL_RUN_LAST | G_SIGNAL_ACTION,
                                                    0,
                                                    NULL, NULL,
                                                    g_cclosure_marshal_VOID__OBJECT,
                                                    G_TYPE_NONE, 1, G_TYPE_OBJECT);

        g_object_class_install_property (oclass,
                                         PROP_BOOKMARKS,
                                         g_param_spec_object ("bookmarks",
                                                              "Bookmarks",
                                                              "Bookmarks",
                                                              GD_TYPE_BOOKMARKS,
                                                              G_PARAM_READWRITE |
                                                              G_PARAM_STATIC_STRINGS));

        g_object_class_override_property (oclass, PROP_NAME, "name");
        g_object_class_override_property (oclass, PROP_DOCUMENT_MODEL, "document-model");

        g_type_class_add_private (oclass, sizeof (GdPlacesBookmarksPrivate));
}

GtkWidget *
gd_places_bookmarks_new (void)
{
        return GTK_WIDGET (g_object_new (GD_TYPE_PLACES_BOOKMARKS, NULL));
}

static gboolean
gd_places_bookmarks_supports_document (GdPlacesPage *page,
                                       EvDocument   *document)
{
        return TRUE;
}

static const char *
gd_places_bookmarks_get_name (GdPlacesPage *page)
{
        return GD_PLACES_BOOKMARKS (page)->priv->name;
}

static void
gd_places_bookmarks_page_iface_init (GdPlacesPageInterface *iface)
{
        iface->supports_document = gd_places_bookmarks_supports_document;
        iface->set_document_model = gd_places_bookmarks_set_document_model;
        iface->get_name = gd_places_bookmarks_get_name;
}
