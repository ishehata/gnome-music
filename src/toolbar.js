/*
 * Copyright (c) 2013 Next Tuesday GmbH
 *
 * Gnome Music is free software; you can Public License as published by the
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
 * Author: Seif Lotfy <sfl@nexttuesday.de>
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

const Toolbar = new Lang.Class({
    Name: 'MainToolbar',
    Extends: Gd.HeaderBar,

    _init: function() {
        this.parent();
        this._stack_switcher = new Gd.StackSwitcher ();
        this.set_custom_title (this._stack_switcher);
        //this.get_style_context().add_class("music-topbar");
    },
    
    set_stack: function (stack) {
        this._stack_switcher.set_stack (stack);
    },
});

