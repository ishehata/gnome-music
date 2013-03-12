/*
 * Copyright (c) 2013 Eslam Mostafa.
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
 * Author: Eslam Mostafa <cseslam@gmail.com>
 *
 */
 
const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
const GdkPixbuf = imports.gi.GdkPixbuf;
const GObject = imports.gi.GObject;
const Gd = imports.gi.Gd;
const Gio = imports.gi.Gio;
const Widgets = imports.widgets;


const ViewContainer = new Lang.Class({
    Name: "ViewContainer",
    Extend: Gtk.Grid,
    
    _init: function(){
        this.parent();
        this.set_orientation(Gtk.Orientation.VERTICAL );
        this.view = new Gd.MainView({ shadow_type : Gtk.ShadowType.NONE});
        this._model = new ViewModel();
        
        this.widget.add(this.view);
        this.widget.show_all();
    }
});


const Default = new Lang.Class({
    Name: "DefaultView",
    Extends: Gtk.Box,
    
    _init: function(title){
        this.parent();

    },
});

const ViewModel = new Lang.Class ({
    Name: "ViewModel",
    
    _init: function() {
        this.model = new Gtk.ListStore(
            [ GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GdkPixbuf.Pixbuf,
              GObject.TYPE_LONG]);
        this.model.set_sort_column_id(Gd.MainColumns.MTIME,
                                      Gtk.SortType.DESCENDING);
    },
    
});

const Albums = new Lang.Class({
    Name: "AlbumsView",
    Extends: ViewContainer,
    
    _init: function(title){
        this.parent();
        
        let box = new Gtk.HBox();
        this.title = title;
        let img = Gtk.Image.new_from_icon_name("audio-x-generic-symbolic", Gtk.IconSize.BUTTON);
        let label = new Gtk.Label({label : "No albums were found !"});

        box.pack_start(new Gtk.Label({label : ""}), true, true, 6);
        box.pack_start(img, false, false, 6);
        box.pack_start(label, false, false, 6);
        box.pack_start(new Gtk.Label({label : ""}), true, true, 6);
        this.view.attach(box, 0 ,1, 0, 1);
        this.wdiget.show_all();
    },
    
});

const Artists = new Lang.Class({
    Name: "ArtistsView",
    Extends: Gtk.Box,
    
    _init: function(title){
        this.parent();
        this.title = title;
    },
    
});

const Songs = new Lang.Class({
    Name: "SongsView",
    Extends: ViewContainer,
    
    _init: function(title){
        this.parent();
        this.title = title;
    },
    
});

const Playlists = new Lang.Class({
    Name: "PlaylistsView",
    Extends: Gtk.Box,
    
    _init: function(title){
        this.parent();
        this.title = title;
    },
    
});
