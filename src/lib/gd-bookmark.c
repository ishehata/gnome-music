/* -*- Mode: C; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 8;  -*-
 *
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

#include "gd-bookmark.h"

enum {
        PROP_0,
        PROP_PAGE_NUMBER,
        PROP_TITLE,
};

struct _GdBookmark {
        GObject base;

        char   *title;
        guint   page_num;
};

struct _GdBookmarkClass {
        GObjectClass base_class;
};

G_DEFINE_TYPE (GdBookmark, gd_bookmark, G_TYPE_OBJECT)

int
gd_bookmark_compare (GdBookmark *a,
                     GdBookmark *b)
{
        if (a->page_num < b->page_num) {
                return -1;
        }
        if (a->page_num > b->page_num) {
                return 1;
        }

        return 0;
}

const char *
gd_bookmark_get_title (GdBookmark *bookmark)
{
        return bookmark->title;
}

void
gd_bookmark_set_title (GdBookmark *bookmark,
                       const char *title)
{
        if (g_strcmp0 (title, bookmark->title) == 0) {
                return;
        }

        g_free (bookmark->title);
        bookmark->title = g_strdup (title);
        g_object_notify (G_OBJECT (bookmark), "title");
}

guint
gd_bookmark_get_page_number (GdBookmark *bookmark)
{
        return bookmark->page_num;
}

void
gd_bookmark_set_page_number (GdBookmark *bookmark,
                             guint       page_num)
{
        if (page_num == bookmark->page_num) {
                return;
        }

        bookmark->page_num = page_num;
        g_object_notify (G_OBJECT (bookmark), "page-number");
}

static void
gd_bookmark_finalize (GObject *object)
{
        GdBookmark *bookmark = GD_BOOKMARK (object);

        g_free (bookmark->title);

        G_OBJECT_CLASS (gd_bookmark_parent_class)->finalize (object);
}

static void
gd_bookmark_init (GdBookmark *bookmark)
{
}

static void
gd_bookmark_get_property (GObject    *object,
                          guint       prop_id,
                          GValue     *value,
                          GParamSpec *pspec)
{
        GdBookmark *self = GD_BOOKMARK (object);

        switch (prop_id) {
        case PROP_TITLE:
                g_value_set_string (value, self->title);
                break;
        case PROP_PAGE_NUMBER:
                g_value_set_uint (value, self->page_num);
                break;
        default:
                G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
                break;
        }
}

static void
gd_bookmark_set_property (GObject      *object,
                          guint         prop_id,
                          const GValue *value,
                          GParamSpec   *pspec)
{
        GdBookmark *self = GD_BOOKMARK (object);

        switch (prop_id) {
        case PROP_TITLE:
                gd_bookmark_set_title (self, g_value_get_string (value));
                break;
        case PROP_PAGE_NUMBER:
                gd_bookmark_set_page_number (self, g_value_get_uint (value));
                break;
        default:
                G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
        }
}

static void
gd_bookmark_class_init (GdBookmarkClass *klass)
{
        GObjectClass *gobject_class = G_OBJECT_CLASS (klass);

        gobject_class->get_property = gd_bookmark_get_property;
        gobject_class->set_property = gd_bookmark_set_property;
        gobject_class->finalize = gd_bookmark_finalize;

        g_object_class_install_property (gobject_class,
                                         PROP_PAGE_NUMBER,
                                         g_param_spec_uint ("page-number",
                                                            "Page Number",
                                                            "Page Number",
                                                            0,
                                                            G_MAXUINT,
                                                            0,
                                                            G_PARAM_READWRITE |
                                                            G_PARAM_STATIC_STRINGS));
        g_object_class_install_property (gobject_class,
                                         PROP_TITLE,
                                         g_param_spec_string ("title",
                                                              "Title",
                                                              "Title",
                                                              NULL,
                                                              G_PARAM_READWRITE |
                                                              G_PARAM_STATIC_STRINGS));
}

GdBookmark *
gd_bookmark_new (void)
{
        return GD_BOOKMARK (g_object_new (GD_TYPE_BOOKMARK, NULL));
}
