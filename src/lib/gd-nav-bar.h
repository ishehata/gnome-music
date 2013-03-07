/*
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

#ifndef __GD_NAV_BAR_H__
#define __GD_NAV_BAR_H__

#include <gtk/gtk.h>
#include <glib.h>
#include <glib-object.h>

#include <evince-view.h>

G_BEGIN_DECLS

typedef struct _GdNavBar GdNavBar;
typedef struct _GdNavBarClass GdNavBarClass;
typedef struct _GdNavBarPrivate GdNavBarPrivate;

#define GD_TYPE_NAV_BAR            (gd_nav_bar_get_type ())
#define GD_NAV_BAR(obj)            (G_TYPE_CHECK_INSTANCE_CAST((obj), GD_TYPE_NAV_BAR, GdNavBar))
#define GD_NAV_BAR_CLASS(klass)    (G_TYPE_CHECK_CLASS_CAST((klass),  GD_TYPE_NAV_BAR, GdNavBarClass))
#define GD_IS_NAV_BAR(obj)         (G_TYPE_CHECK_INSTANCE_TYPE((obj), GD_TYPE_NAV_BAR))
#define GD_IS_NAV_BAR_CLASS(klass) (G_TYPE_CHECK_CLASS_TYPE((klass),  GD_TYPE_NAV_BAR))
#define GD_NAV_BAR_GET_CLASS(obj)  (G_TYPE_INSTANCE_GET_CLASS((obj),  GD_TYPE_NAV_BAR, GdNavBarClass))

struct _GdNavBar {
        GtkBox base_instance;

        GdNavBarPrivate *priv;
};

struct _GdNavBarClass {
        GtkBoxClass parent_class;
};

GType            gd_nav_bar_get_type           (void) G_GNUC_CONST;

GtkWidget       *gd_nav_bar_new                (EvDocumentModel *model);
GtkWidget       *gd_nav_bar_get_button_area    (GdNavBar        *bar);

G_END_DECLS

#endif /* __GD_NAV_BAR_H__ */
