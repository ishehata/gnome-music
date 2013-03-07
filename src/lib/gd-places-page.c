/* -*- Mode: C; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 8 -*-
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

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <gtk/gtk.h>

#include "gd-places-page.h"

G_DEFINE_INTERFACE (GdPlacesPage, gd_places_page, G_TYPE_INVALID)

gboolean
gd_places_page_supports_document (GdPlacesPage *places_page,
                                  EvDocument   *document)
{
        GdPlacesPageInterface *iface;

        g_return_val_if_fail (GD_IS_PLACES_PAGE (places_page), FALSE);
        g_return_val_if_fail (EV_IS_DOCUMENT (document), FALSE);

        iface = GD_PLACES_PAGE_GET_IFACE (places_page);

        g_return_val_if_fail (iface->supports_document, FALSE);

        return iface->supports_document (places_page, document);
}

void
gd_places_page_set_document_model (GdPlacesPage    *places_page,
                                   EvDocumentModel *model)
{
        GdPlacesPageInterface *iface;

        g_return_if_fail (GD_IS_PLACES_PAGE (places_page));
        g_return_if_fail (EV_IS_DOCUMENT_MODEL (model));

        iface = GD_PLACES_PAGE_GET_IFACE (places_page);

        g_assert (iface->set_document_model);

        iface->set_document_model (places_page, model);
}

const char *
gd_places_page_get_name (GdPlacesPage *places_page)
{
        GdPlacesPageInterface *iface;

        g_return_val_if_fail (GD_IS_PLACES_PAGE (places_page), NULL);

        iface = GD_PLACES_PAGE_GET_IFACE (places_page);

        g_assert (iface->get_name);

        return iface->get_name (places_page);
}

static void
gd_places_page_default_init (GdPlacesPageInterface *iface)
{
        g_object_interface_install_property (iface,
                                             g_param_spec_string ("name",
                                                                  "Name",
                                                                  "Name of the page",
                                                                  NULL,
                                                                  G_PARAM_READABLE));
        g_object_interface_install_property (iface,
                                             g_param_spec_object ("document-model",
                                                                  "Document Model",
                                                                  "Document Model",
                                                                  EV_TYPE_DOCUMENT_MODEL,
                                                                  G_PARAM_READWRITE));
}
