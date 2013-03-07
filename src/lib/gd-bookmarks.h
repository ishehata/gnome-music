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

#ifndef GD_BOOKMARKS_H
#define GD_BOOKMARKS_H

#include <glib-object.h>

#include "gd-bookmark.h"
#include "gd-metadata.h"

G_BEGIN_DECLS

#define GD_TYPE_BOOKMARKS         (gd_bookmarks_get_type())
#define GD_BOOKMARKS(object)      (G_TYPE_CHECK_INSTANCE_CAST((object), GD_TYPE_BOOKMARKS, GdBookmarks))
#define GD_BOOKMARKS_CLASS(klass) (G_TYPE_CHECK_CLASS_CAST((klass), GD_TYPE_BOOKMARKS, GdBookmarksClass))
#define GD_IS_BOOKMARKS(object)   (G_TYPE_CHECK_INSTANCE_TYPE((object), GD_TYPE_BOOKMARKS))

typedef struct _GdBookmarks      GdBookmarks;
typedef struct _GdBookmarksClass GdBookmarksClass;

GType        gd_bookmarks_get_type      (void) G_GNUC_CONST;

GdBookmarks *gd_bookmarks_new           (GdMetadata  *metadata);
guint        gd_bookmarks_get_n_items   (GdBookmarks *bookmarks);
GList       *gd_bookmarks_get_bookmarks (GdBookmarks *bookmarks);
GdBookmark  *gd_bookmarks_find_bookmark (GdBookmarks *bookmarks,
                                         GdBookmark  *bookmark);
void         gd_bookmarks_add           (GdBookmarks *bookmarks,
                                         GdBookmark  *bookmark);
void         gd_bookmarks_remove        (GdBookmarks *bookmarks,
                                         GdBookmark  *bookmark);
void         gd_bookmarks_update        (GdBookmarks *bookmarks,
                                         GdBookmark  *bookmark);

G_END_DECLS

#endif /* GD_BOOKMARKS_H */
