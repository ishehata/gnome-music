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

#ifndef GD_BOOKMARK_H
#define GD_BOOKMARK_H

#include <glib-object.h>

G_BEGIN_DECLS

#define GD_TYPE_BOOKMARK         (gd_bookmark_get_type())
#define GD_BOOKMARK(object)      (G_TYPE_CHECK_INSTANCE_CAST((object), GD_TYPE_BOOKMARK, GdBookmark))
#define GD_BOOKMARK_CLASS(klass) (G_TYPE_CHECK_CLASS_CAST((klass), GD_TYPE_BOOKMARK, GdBookmarkClass))
#define GD_IS_BOOKMARK(object)   (G_TYPE_CHECK_INSTANCE_TYPE((object), GD_TYPE_BOOKMARK))

typedef struct _GdBookmark      GdBookmark;
typedef struct _GdBookmarkClass GdBookmarkClass;

GType        gd_bookmark_get_type         (void) G_GNUC_CONST;

GdBookmark  *gd_bookmark_new              (void);

void         gd_bookmark_set_page_number  (GdBookmark *bookmark,
                                           guint       num);
guint        gd_bookmark_get_page_number  (GdBookmark *bookmark);
void         gd_bookmark_set_title        (GdBookmark *bookmark,
                                           const char *title);
const char * gd_bookmark_get_title        (GdBookmark *bookmark);

int          gd_bookmark_compare          (GdBookmark *a,
                                           GdBookmark *b);
G_END_DECLS

#endif /* GD_BOOKMARK_H */
