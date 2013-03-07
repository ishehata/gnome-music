/* -*- Mode: C; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 8;  -*-
 *
 *  Copyright (C) 2004 Red Hat, Inc.
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

#ifndef __GD_PLACES_LINKS_H__
#define __GD_PLACES_LINKS_H__

#include <gtk/gtk.h>

#include <evince-document.h>
#include <evince-view.h>

G_BEGIN_DECLS

typedef struct _GdPlacesLinks GdPlacesLinks;
typedef struct _GdPlacesLinksClass GdPlacesLinksClass;
typedef struct _GdPlacesLinksPrivate GdPlacesLinksPrivate;

#define GD_TYPE_PLACES_LINKS              (gd_places_links_get_type())
#define GD_PLACES_LINKS(object)           (G_TYPE_CHECK_INSTANCE_CAST((object), GD_TYPE_PLACES_LINKS, GdPlacesLinks))
#define GD_PLACES_LINKS_CLASS(klass)      (G_TYPE_CHECK_CLASS_CAST((klass), GD_TYPE_PLACES_LINKS, GdPlacesLinksClass))
#define GD_IS_PLACES_LINKS(object)        (G_TYPE_CHECK_INSTANCE_TYPE((object), GD_TYPE_PLACES_LINKS))
#define GD_IS_PLACES_LINKS_CLASS(klass)   (G_TYPE_CHECK_CLASS_TYPE((klass), GD_TYPE_PLACES_LINKS))
#define GD_PLACES_LINKS_GET_CLASS(object) (G_TYPE_INSTANCE_GET_CLASS((object), GD_TYPE_PLACES_LINKS, GdPlacesLinksClass))

struct _GdPlacesLinks {
        GtkBox base_instance;

        GdPlacesLinksPrivate *priv;
};

struct _GdPlacesLinksClass {
        GtkBoxClass base_class;
};

GType      gd_places_links_get_type       (void);
GtkWidget *gd_places_links_new            (void);

G_END_DECLS

#endif /* __GD_PLACES_LINKS_H__ */


