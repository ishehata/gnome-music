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
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Widgets = imports.widgets;

const Default = new Lang.Class({
    Name: "DefaultView",
    Extends: Gtk.Box,
    
    _init: function(){
        this.parent();
    },
});

const Artists = new Lang.Class({
    Name: "ArtistsView",
    Extends: Gtk.Box,
    
    _init: function(){
        this.parent();
    },
    
});

const Albums = new Lang.Class({
    Name: "AlbumsView",
    Extends: Gtk.Box,
    
    _init: function(){
        this.parent();
        this.box = new Gtk.HBox();
        let img = Gtk.Image.new_from_icon_name("audio-x-generic-symbolic", Gtk.IconSize.BUTTON);
        let label = new Gtk.Label({label : "No albums were found !"});

        this.pack_start(new Gtk.Label({label : ""}), true, true, 6);
        this.pack_start(img, false, false, 6);
        this.pack_start(label, false, false, 6);
        this.pack_start(new Gtk.Label({label : ""}), true, true, 6);
        this.show_all();
    },
    
});

const Songs = new Lang.Class({
    Name: "SongsView",
    Extends: Gtk.Box,
    
    _init: function(){
        this.parent();
    },
    
});

const Playlists = new Lang.Class({
    Name: "PlaylistsView",
    Extends: Gtk.Box,
    
    _init: function(){
        this.parent();
    },
    
});
