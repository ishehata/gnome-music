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

#include <string.h>

#include "gd-bookmarks.h"

enum {
        PROP_0,
        PROP_METADATA,
        PROP_N_ITEMS
};

enum {
        CHANGED,
        N_SIGNALS
};

struct _GdBookmarks {
        GObject base;

        GdMetadata *metadata;
        GList *items;
};

struct _GdBookmarksClass {
        GObjectClass base_class;

        void (*changed) (GdBookmarks *bookmarks);
};

G_DEFINE_TYPE (GdBookmarks, gd_bookmarks, G_TYPE_OBJECT)

static guint signals[N_SIGNALS];

static void
gd_bookmarks_finalize (GObject *object)
{
        GdBookmarks *self = GD_BOOKMARKS (object);

        g_list_free_full (self->items, g_object_unref);

        g_clear_object (&self->metadata);

        G_OBJECT_CLASS (gd_bookmarks_parent_class)->finalize (object);
}

static void
gd_bookmarks_init (GdBookmarks *bookmarks)
{
}

guint
gd_bookmarks_get_n_items (GdBookmarks *bookmarks)
{
        g_return_val_if_fail (GD_IS_BOOKMARKS (bookmarks), 0);

        return g_list_length (bookmarks->items);
}

static void
gd_bookmarks_get_property (GObject      *object,
                           guint         prop_id,
                           GValue       *value,
                           GParamSpec   *pspec)
{
        GdBookmarks *self = GD_BOOKMARKS (object);

        switch (prop_id) {
        case PROP_N_ITEMS:
                g_value_set_uint (value, gd_bookmarks_get_n_items (self));
                break;
        default:
                G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
        }
}

static void
gd_bookmarks_set_property (GObject      *object,
                           guint         prop_id,
                           const GValue *value,
                           GParamSpec   *pspec)
{
        GdBookmarks *self = GD_BOOKMARKS (object);

        switch (prop_id) {
        case PROP_METADATA:
                self->metadata = (GdMetadata *)g_value_dup_object (value);
                break;
        default:
                G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
        }
}

static void
gd_bookmarks_constructed (GObject *object)
{
        GdBookmarks *self = GD_BOOKMARKS (object);
        const char  *bm_list_str;
        GVariant    *bm_list;
        GVariantIter iter;
        GVariant    *child;
        GError      *error = NULL;

        if (!gd_metadata_get_string (self->metadata, "bookmarks", &bm_list_str)) {
                return;
        }

        if (bm_list_str == NULL || bm_list_str[0] == '\0') {
                return;
        }

        bm_list = g_variant_parse ((const GVariantType *)"a(us)",
                                   bm_list_str, NULL, NULL,
                                   &error);
        if (bm_list == NULL) {
                g_warning ("Error getting bookmarks: %s\n", error->message);
                g_error_free (error);

                return;
        }

        g_variant_iter_init (&iter, bm_list);
        while ((child = g_variant_iter_next_value (&iter))) {
                guint page_num;
                const char *title = NULL;

                g_variant_get (child, "(u&s)", &page_num, &title);
                if (title != NULL) {
                        GdBookmark *bm = gd_bookmark_new ();
                        gd_bookmark_set_title (bm, title);
                        gd_bookmark_set_page_number (bm, page_num);
                        self->items = g_list_prepend (self->items, bm);
                        g_object_notify (G_OBJECT (self), "n-items");
                }
                g_variant_unref (child);
        }
        g_variant_unref (bm_list);

        self->items = g_list_reverse (self->items);
}

static void
gd_bookmarks_class_init (GdBookmarksClass *klass)
{
        GObjectClass *gobject_class = G_OBJECT_CLASS (klass);

        gobject_class->get_property = gd_bookmarks_get_property;
        gobject_class->set_property = gd_bookmarks_set_property;
        gobject_class->finalize = gd_bookmarks_finalize;
        gobject_class->constructed = gd_bookmarks_constructed;

        g_object_class_install_property (gobject_class,
                                         PROP_METADATA,
                                         g_param_spec_object ("metadata",
                                                              "Metadata",
                                                              "The document metadata",
                                                              GD_TYPE_METADATA,
                                                              G_PARAM_CONSTRUCT_ONLY | G_PARAM_WRITABLE |
                                                              G_PARAM_STATIC_STRINGS));
        g_object_class_install_property (gobject_class,
                                         PROP_N_ITEMS,
                                         g_param_spec_uint ("n-items",
                                                            "N Items",
                                                            "Number of bookmark items",
                                                            0,
                                                            G_MAXUINT,
                                                            0,
                                                            G_PARAM_READABLE |
                                                            G_PARAM_STATIC_STRINGS));

        /* Signals */
        signals[CHANGED] = g_signal_new ("changed",
                                         GD_TYPE_BOOKMARKS,
                                         G_SIGNAL_RUN_LAST,
                                         G_STRUCT_OFFSET (GdBookmarksClass, changed),
                                         NULL, NULL,
                                         g_cclosure_marshal_VOID__VOID,
                                         G_TYPE_NONE, 0);
}

GdBookmarks *
gd_bookmarks_new (GdMetadata *metadata)
{
        g_return_val_if_fail (GD_IS_METADATA (metadata), NULL);

        return GD_BOOKMARKS (g_object_new (GD_TYPE_BOOKMARKS,
                                           "metadata", metadata,
                                           NULL));
}

static void
gd_bookmarks_save (GdBookmarks *self)
{
        GList          *l;
        GVariantBuilder builder;
        GVariant       *bm_list;
        char           *bm_list_str;

        if (self->items == NULL) {
                gd_metadata_set_string (self->metadata, "bookmarks", "");
                return;
        }

        g_variant_builder_init (&builder, G_VARIANT_TYPE_ARRAY);
        for (l = self->items; l; l = g_list_next (l)) {
                GdBookmark *bm = (GdBookmark *)l->data;
                const char *title = gd_bookmark_get_title (bm);
                guint page_num = gd_bookmark_get_page_number (bm);

                g_variant_builder_add (&builder, "(u&s)",
                                       page_num,
                                       title != NULL ? title : "");
        }
        bm_list = g_variant_builder_end (&builder);

        bm_list_str = g_variant_print (bm_list, FALSE);
        g_variant_unref (bm_list);
        gd_metadata_set_string (self->metadata, "bookmarks", bm_list_str);
        g_free (bm_list_str);
}

/**
 * gd_bookmarks_find_bookmark:
 * @bookmarks:
 * @bookmark:
 *
 * Returns: (transfer none)
 */
GdBookmark *
gd_bookmarks_find_bookmark (GdBookmarks *bookmarks,
                            GdBookmark  *bookmark)
{
        GList *l;

        l = g_list_find_custom (bookmarks->items, bookmark, (GCompareFunc)gd_bookmark_compare);
        if (l != NULL)
                return l->data;

        return NULL;
}

/**
 * gd_bookmarks_get_bookmarks:
 * @bookmarks:
 *
 * Returns: (transfer container) (element-type GdBookmark): A list of #GdBookmark objects
 */
GList *
gd_bookmarks_get_bookmarks (GdBookmarks *bookmarks)
{
        g_return_val_if_fail (GD_IS_BOOKMARKS (bookmarks), NULL);

        return g_list_copy (bookmarks->items);
}

void
gd_bookmarks_add (GdBookmarks *bookmarks,
                  GdBookmark  *bookmark)
{
        GdBookmark *bm;

        g_return_if_fail (GD_IS_BOOKMARKS (bookmarks));

        bm = gd_bookmarks_find_bookmark (bookmarks, bookmark);
        if (bm != NULL) {
                return;
        }

        bookmarks->items = g_list_append (bookmarks->items, g_object_ref (bookmark));
        g_object_notify (G_OBJECT (bookmarks), "n-items");
        g_signal_emit (bookmarks, signals[CHANGED], 0);
        gd_bookmarks_save (bookmarks);
}

void
gd_bookmarks_remove (GdBookmarks *bookmarks,
                     GdBookmark  *bookmark)
{
        GdBookmark *bm;

        g_return_if_fail (GD_IS_BOOKMARKS (bookmarks));

        bm = gd_bookmarks_find_bookmark (bookmarks, bookmark);
        if (bm == NULL) {
                return;
        }

        bookmarks->items = g_list_remove (bookmarks->items, bm);
        g_object_unref (bm);
        g_object_notify (G_OBJECT (bookmarks), "n-items");
        g_signal_emit (bookmarks, signals[CHANGED], 0);
        gd_bookmarks_save (bookmarks);
}

void
gd_bookmarks_update (GdBookmarks *bookmarks,
                     GdBookmark  *bookmark)
{
        GList      *bm_link;
        GdBookmark *bm;
        const char *title_a;
        const char *title_b;

        g_return_if_fail (GD_IS_BOOKMARKS (bookmarks));

        bm_link = g_list_find_custom (bookmarks->items, bookmark, (GCompareFunc)gd_bookmark_compare);
        if (bm_link == NULL) {
                return;
        }

        bm = (GdBookmark *)bm_link->data;

        title_a = gd_bookmark_get_title (bm);
        title_b = gd_bookmark_get_title (bookmark);

        if (g_strcmp0 (title_a, title_b) == 0) {
                return;
        }

        g_signal_emit (bookmarks, signals[CHANGED], 0);
        gd_bookmarks_save (bookmarks);
}
