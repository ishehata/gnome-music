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
const Tracker = imports.gi.Tracker;

const tracker = Tracker.SparqlConnection.get (null);


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


const ViewContainer = new Lang.Class({
    Name: "ViewContainer",
    Extends: Gtk.Grid,
    
    _init: function(title, header_bar){
        this.parent();

        this.header_bar = header_bar;
        this.title = title;
        this.show_all();
    },

    _queueCollector: function(connection, res, params) {
        print (res);
        try {
            let cursor = tracker.query_finish(res);
            while(cursor.next(null)){
                
                var rdf_type = cursor.get_string(0);
                var album = cursor.get_string(1);
                var tacker_id = cursor.get_string(2);
                var title = cursor.get_string(3);
                var artists = cursor.get_string(4);
                var duration = cursor.get_string(6);
                var data = cursor.get_string(6);
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
    },
    
});


const Albums = new Lang.Class({
    Name: "AlbumsView",
    Extends: ViewContainer,
    
    _init: function(header_bar){
        this.parent("Albums", header_bar);
        
        this.query = "SELECT rdf:type(?album) ?album tracker:id(?album) AS id ?title ?author SUM(?length) AS duration tracker:coalesce (fn:year-from-dateTime(?date), 'Unknown') WHERE {?album a nmm:MusicAlbum ; nie:title ?title; nmm:albumArtist [ nmm:artistName ?author ] . ?song nmm:musicAlbum ?album ; nfo:duration ?length OPTIONAL { ?song nie:informationElementDate ?date } }  GROUP BY ?album ORDER BY ?author ?title"

        tracker.query_async(this.query, null, Lang.bind(this, this._queueCollector, null));
    },

});

const Songs = new Lang.Class({
    Name: "SongsView",
    Extends: ViewContainer,
    _init: function(header_bar){
        this.parent("Songs", header_bar);
    },
    
});

const Playlists = new Lang.Class({
    Name: "PlaylistsView",
    Extends: ViewContainer,
    
    _init: function(header_bar){
        this.parent("Playlists", header_bar);
    },
    
});
