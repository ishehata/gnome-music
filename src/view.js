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
const Tracker = imports.gi.Tracker;

const tracker = Tracker.SparqlConnection.get (null);

const Application = imports.application

const EmptyView = new Lang.Class ({
    Name: "EmptyView",
    Extends: Gtk.HBox,
    
    _init: function(icon_name, lbl) {
        let box = new Gtk.HBox();
        let image = Gtk.Image.new_from_icon_name(icon_name, Gtk.IconSize.MENU);
        let label = new Gtk.Label({ label : lbl });
        
        this.parent();
        
        box.pack_start(image, false, false, 6);
        box.pack_start(label, false, false, 6);
        
        this.pack_start(new Gtk.Label({ label : ""}), true, true, 0);
        this.pack_start(box, false, false, 6);
        this.pack_start(new Gtk.Label({ label : ""}), true, true, 0);
        
        this.show_all();
    },
});

const ViewContainer = new Lang.Class({
    Name: "ViewContainer",
    Extends: Gtk.Grid,
    
    _init: function(title, header_bar){
        this.parent();

        this.header_bar = header_bar;
        this.title = title;
        this.view = new Gd.MainView({ shadow_type: Gtk.ShadowType.NONE });

        this.add(this.view);
        this.view.set_view_type(Gd.MainViewType.ICON);
        this.view.set_selection_mode(Gtk.SelectionMode.BROWSE);
        this.show_all();
    },

    _on_selection_mode_changed: function() {
    },

});

const Albums = new Lang.Class({
    Name: "AlbumsView",
    Extends: ViewContainer,
    
    _init: function(header_bar){
        this.parent("Albums", header_bar);
        
        //Set Model to MainView
        //this.model = new Models.AlbumModel();
        //this.view.set_model(this.model);

        this.query = "SELECT rdf:type(?album) ?album tracker:id(?album) AS id ?title ?author SUM(?length) AS duration tracker:coalesce (fn:year-from-dateTime(?date), 'Unknown') WHERE {?album a nmm:MusicAlbum ; nie:title ?title; nmm:albumArtist [ nmm:artistName ?author ] . ?song nmm:musicAlbum ?album ; nfo:duration ?length OPTIONAL { ?song nie:informationElementDate ?date } }  GROUP BY ?album ORDER BY ?author ?title"

        tracker.query_async(this.query, null, Lang.bind(this, this._queueCollector, null));

        /* Check if there are albums to be viewed
        if(true) {
            // Empty view if there is no albums to be viewed
            let empty_view = new EmptyView("emblem-music-symbolic", "No Albums Found!");
            this.add(empty_view);
        }
        else {
            // View albums
            /* let items = Application.AlbumsManager.get_items();
               for(let item in items) {
                   this.model.add_item(item);
               }
           
            let label = new Gtk.Label({label : "Albums Should apear here instead of this label"});
            this.pack_start(label, true, true, 0);
        }
        */
    },

    _queueCollector: function(connection, res, params) {
        //print (res);
        print("queueCollector");
        try {
            let cursor = tracker.query_finish(res);
            while(cursor.next(null)){

                var rdf_type = cursor.get_string(0);
                var album = cursor.get_string(1);
                var tracker_id = cursor.get_string(2);
                var title = cursor.get_string(3);
                var artists = cursor.get_string(4);
                var duration = cursor.get_string(6);
                var data = cursor.get_string(6);
                var icon = GdkPixbuf.new_from_filename('/usr/share/icons/gnome/scalable/actions/view-paged-symbolic.svg');

                //this.model.push_item(tracker_id, title, artists, icon, duration, data);
            }
        } catch (e) {
            print('Unable to query collection items ' + e.message);
            return;
        }
    },

});

const Artists = new Lang.Class({
    Name: "ArtistsView",
    Extends: ViewContainer,
    
    _init: function(header_bar){
        this.parent("Artists", header_bar);
        
        let list_store = Gtk.ListStore.new(
            [ GObject.TYPE_LONG,   // Artist id
              GObject.TYPE_STRING, // Artist name
              GObject.TYPE_STRING, // Artist url
              GdkPixbuf.Pixbuf,    // Artist image
        ]);
        this.view.set_model(list_store);
    },
    
});


const Songs = new Lang.Class({
    Name: "SongsView",
    Extends: ViewContainer,
    _init: function(header_bar){
        this.parent("Songs", header_bar);
        
        let list_store = Gtk.ListStore.new(
            [ GObject.TYPE_LONG,   // Song id
              GObject.TYPE_STRING, // Song title
              GObject.TYPE_STRING, // Song url
              GdkPixbuf.Pixbuf,    // Song image
        ]);
        this.view.set_model(list_store);
    },
    
});

const Playlists = new Lang.Class({
    Name: "PlaylistsView",
    Extends: ViewContainer,
    
    _init: function(header_bar){
        this.parent("Playlists", header_bar);
        
        let list_store = Gtk.ListStore.new(
            [ GObject.TYPE_LONG,   // Album id
              GObject.TYPE_STRING, // Album name
              GObject.TYPE_STRING, // Album url
              GdkPixbuf.Pixbuf,    // Album image
        ]);
        this.view.set_model(list_store);
    },
    
});
