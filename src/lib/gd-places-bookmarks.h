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

#ifndef __GD_PLACES_BOOKMARKS_H__
#define __GD_PLACES_BOOKMARKS_H__

#include <gtk/gtk.h>
#include <glib-object.h>

#include "gd-bookmarks.h"

G_BEGIN_DECLS

typedef struct _GdPlacesBookmarks        GdPlacesBookmarks;
typedef struct _GdPlacesBookmarksClass   GdPlacesBookmarksClass;
typedef struct _GdPlacesBookmarksPrivate GdPlacesBookmarksPrivate;

#define GD_TYPE_PLACES_BOOKMARKS              (gd_places_bookmarks_get_type())
#define GD_PLACES_BOOKMARKS(object)           (G_TYPE_CHECK_INSTANCE_CAST((object), GD_TYPE_PLACES_BOOKMARKS, GdPlacesBookmarks))
#define GD_PLACES_BOOKMARKS_CLASS(klass)      (G_TYPE_CHECK_CLASS_CAST((klass), GD_TYPE_PLACES_BOOKMARKS, GdPlacesBookmarksClass))
#define GD_IS_PLACES_BOOKMARKS(object)        (G_TYPE_CHECK_INSTANCE_TYPE((object), GD_TYPE_PLACES_BOOKMARKS))
#define GD_IS_PLACES_BOOKMARKS_CLASS(klass)   (G_TYPE_CHECK_CLASS_TYPE((klass), GD_TYPE_PLACES_BOOKMARKS))
#define GD_PLACES_BOOKMARKS_GET_CLASS(object) (G_TYPE_INSTANCE_GET_CLASS((object), GD_TYPE_PLACES_BOOKMARKS, GdPlacesBookmarksClass))

struct _GdPlacesBookmarks {
        GtkBox base_instance;

        GdPlacesBookmarksPrivate *priv;
};

struct _GdPlacesBookmarksClass {
        GtkBoxClass base_class;
};

GType      gd_places_bookmarks_get_type      (void) G_GNUC_CONST;
GtkWidget *gd_places_bookmarks_new           (void);
void       gd_places_bookmarks_set_bookmarks (GdPlacesBookmarks *places_bookmarks,
                                              GdBookmarks       *bookmarks);
G_END_DECLS

#endif /* __GD_PLACES_BOOKMARKS_H__ */
