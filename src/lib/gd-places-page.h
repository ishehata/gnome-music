/* -*- Mode: C; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 8;  -*-
 *
 *  Copyright (C) 2005 Marco Pesenti Gritti
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
 *
 */

#ifndef GD_PLACES_PAGE_H
#define GD_PLACES_PAGE_H

#include <glib-object.h>
#include <glib.h>

#include <evince-document.h>
#include <evince-view.h>

G_BEGIN_DECLS

#define GD_TYPE_PLACES_PAGE            (gd_places_page_get_type ())
#define GD_PLACES_PAGE(o)              (G_TYPE_CHECK_INSTANCE_CAST ((o), GD_TYPE_PLACES_PAGE, GdPlacesPage))
#define GD_PLACES_PAGE_IFACE(k)        (G_TYPE_CHECK_CLASS_CAST((k), GD_TYPE_PLACES_PAGE, GdPlacesPageInterface))
#define GD_IS_PLACES_PAGE(o)           (G_TYPE_CHECK_INSTANCE_TYPE ((o), GD_TYPE_PLACES_PAGE))
#define GD_IS_PLACES_PAGE_IFACE(k)     (G_TYPE_CHECK_CLASS_TYPE ((k), GD_TYPE_PLACES_PAGE))
#define GD_PLACES_PAGE_GET_IFACE(inst) (G_TYPE_INSTANCE_GET_INTERFACE ((inst), GD_TYPE_PLACES_PAGE, GdPlacesPageInterface))

typedef struct _GdPlacesPage            GdPlacesPage;
typedef struct _GdPlacesPageInterface   GdPlacesPageInterface;

struct _GdPlacesPageInterface
{
        GTypeInterface base_iface;

        /* Methods  */
        gboolean     (* supports_document)  (GdPlacesPage    *places_page,
                                             EvDocument      *document);
        void         (* set_document_model) (GdPlacesPage    *places_page,
                                             EvDocumentModel *model);
        const char * (* get_name)           (GdPlacesPage    *places_page);
};

GType         gd_places_page_get_type           (void) G_GNUC_CONST;
gboolean      gd_places_page_supports_document  (GdPlacesPage    *places_page,
                                                 EvDocument      *document);
void          gd_places_page_set_document_model (GdPlacesPage    *places_page,
                                                 EvDocumentModel *model);
const char *  gd_places_page_get_name           (GdPlacesPage    *page);

G_END_DECLS

#endif /* GD_PLACES_PAGE */
