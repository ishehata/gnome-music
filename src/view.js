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

    populate: function() {
    },

});

const Albums = new Lang.Class({
    Name: "AlbumsView",
    Extends: ViewContainer,
    
    _init: function(header_bar){
        this.parent("Albums", header_bar);
        
        //Set Model to MainView
        this.model = Gtk.ListStore.new(
            [ GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GdkPixbuf.Pixbuf,
              GObject.TYPE_LONG,
              GObject.TYPE_BOOLEAN ]);
        //this.view.set_model(this.model);

        this.query = "SELECT rdf:type(?album) ?album tracker:id(?album) AS id ?title ?author SUM(?length) AS duration tracker:coalesce (fn:year-from-dateTime(?date), 'Unknown') WHERE {?album a nmm:MusicAlbum ; nie:title ?title; nmm:albumArtist [ nmm:artistName ?author ] . ?song nmm:musicAlbum ?album ; nfo:duration ?length OPTIONAL { ?song nie:informationElementDate ?date } }  GROUP BY ?album ORDER BY ?author ?title"

        //tracker.query_async(this.query, null, Lang.bind(this, this._queueCollector, null));

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

    populate: function() {
        print ("===========================")
        tracker.query_async(this.query, null, Lang.bind(this, this._queueCollector, null));
    },

    _queueCollector: function(connection, res, params) {
        //print (res);
        print("queueCollector");
        try {
            let offset = 1;
            let cursor = tracker.query_finish(res);
            while(cursor.next(null)){
                if (offset % 50 != 0){
                    var rdf_type = cursor.get_string(0);
                    var album = cursor.get_string(1);
                    var tracker_id = cursor.get_string(2);
                    var title = cursor.get_string(3);
                    var artists = cursor.get_string(4);
                    var duration = cursor.get_string(5);
                    var data = cursor.get_string(6);
                    //var icon = GdkPixbuf.new_from_filename('/usr/share/icons/gnome/scalable/actions/view-paged-symbolic.svg');
                    offset += 1;
                    
                    print (rdf_type)
                    print (album)
                    print (tracker_id)
                    print (title)
                    print (artists)
                    print (duration)
                    print ("============================")
                }
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

        this.query = "SELECT rdf:type (?song) ?song tracker:id(?song) AS id nie:title(?song) AS title ?duration ?url tracker:coalesce (nie:title(?album), '') AS site tracker:coalesce (nmm:artistName(?artist), '') AS author WHERE { ?song a nmm:MusicPiece ; nfo:duration ?duration; nie:isStoredAs ?as . ?as nie:url ?url . OPTIONAL { ?song nmm:musicAlbum ?album } . OPTIONAL { ?album nmm:albumArtist ?artist }} GROUP BY ?song ORDER BY ?author ?album"
        this._items = {}
        this.model = Gtk.ListStore.new(
            [ GObject.TYPE_LONG,   // Song id
              GObject.TYPE_STRING, // Song title
              GObject.TYPE_STRING, // Song artist
              GObject.TYPE_STRING, // Song album
              GdkPixbuf.Pixbuf,    // Song image
        ]);
        this.view.set_view_type(Gd.MainViewType.LIST);
        this.view.set_model(this.model);
        let listWidget = this.view.get_generic_view();
        let typeRenderer =
            new Gd.StyledTextRenderer({ xpad: 16 });
        typeRenderer.add_class('dim-label');
        listWidget.add_renderer(typeRenderer, Lang.bind(this,
            function(col, cell, model, iter) {
                let id = model.get_value(iter, Gd.MainColumns.ID);
                let doc = this._getItem(id);
                if (doc)
                    typeRenderer.text = doc[1];
            }));
    },

    _getItem: function(id) {
        return this._items[id]
    },

    populate: function() {
        tracker.query_async(this.query,
                            null, Lang.bind(this, this._queueCollector, null));
    },

    _queueCollector: function(connection, res, params) {
        //print (res);
        print("queueCollector");
        try {
            let offset = 1;
            let cursor = tracker.query_finish(res);
            while(cursor.next(null)){
                if (offset % 50 != 0){
                    var rdf_type = cursor.get_string(0)[0];
                    var song = cursor.get_string(1)[0];
                    var tracker_id = cursor.get_string(2)[0];
                    var title = cursor.get_string(3)[0];
                    var duration = cursor.get_string(4)[0];
                    var album = cursor.get_string(5)[0];
                    var artist = cursor.get_string(6)[0];
                    var data = cursor.get_string(7)[0];
                    var data2 = cursor.get_string(8)[0];
                    //var icon = GdkPixbuf.new_from_filename('/usr/share/icons/gnome/scalable/actions/view-paged-symbolic.svg');
                    offset += 1;
                    print (rdf_type)
                    print (song)
                    print (tracker_id)
                    print (title)
                    print (duration)
                    print (album)
                    print (artist)
                    print (data)
                    print (data2)
                    print ("============================")
                    //this.model.append([tracker_id, title, artist, album, null])
                    this._items[song] = [song, title, artist, album];
                    let iter = this.model.append();
                    this.model.set(iter,
                        [ 0, 1, 2, 3],
                        this._items[song]);
                //this.model.push_item(tracker_id, title, artists, icon, duration, data);
                }
            }
        } catch (e) {
            print('Unable to query collection items ' + e.message);
            return;
        }

        

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
