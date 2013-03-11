/*
 * Copyright (c) 2013 Gnome.
 *
 * Gnome Music is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * Gnome Music is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with Gnome Music; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * Author: Eslam Mostafa <cseslam@gmail.com>
 *
 */
 
const Lang = imports.lang;

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gd = imports.gi.Gd;
const Pango = imports.gi.Pango;

const Gettext = imports.gettext;
const _ = imports.gettext.gettext;

const Searchbar = imports.searchbar;

const MainToolbar = new Lang.Class({
    Name: 'MainToolbar',

    _init: function() {
        this._model = null;

        this.widget = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        this.widget.show();

        this.toolbar = new Gd.HeaderBar();
        this.widget.add(this.toolbar);
        this.toolbar.show();

        //this._searchbar = this.createSearchbar();
        //if (this._searchbar)
        //    this.widget.add(this._searchbar.widget);
    },

    handle_event: function(event) {
        let res = this._searchbar.handle_event(event);
        return res;
    },

    add_search_button: function() {
        let search_button = new Gd.HeaderToggleButton({ symbolic_icon_name: 'edit-find-symbolic',
                                                       label: _("Search"),
                                                       action_name: 'app.search' });
        this.toolbar.pack_end(search_button, false, false, 0);
        return searchButton;
    },

    add_back_button: function() {
        let icon_name =
            (this.toolbar.get_direction() == Gtk.TextDirection.RTL) ?
            'go-next-symbolic' : 'go-previous-symbolic';
        let back_button = new Gd.HeaderSimpleButton({ symbolic_icon_name: icon_name,
                                                     label: _("Back") });
        this.toolbar.pack_start(back_button, false, false, 0);
        return backButton;
    }
});

const Toolbar = new Lang.Class({
    Name: "OverviewToolbar",
    Extends: MainToolbar,

    _init: function(overlay) {
        this._overlay = overlay;
        this._collBackButton = null;
        this._collectionId = 0;
        this._selectionChangedId = 0;
        this._selectionMenu = null;

        this.parent();
        this._populate_for_overview();
     },
});

