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
const Application = imports.application;

const tracker = Tracker.SparqlConnection.get (null);
const AlbumArtCache = imports.album_art_cache;
const albumArtCache = AlbumArtCache.AlbumArtCache.get_default ();

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
        this.offset = 1;
        this.header_bar = header_bar;
        this.title = title;
        this.view = new Gd.MainView({ shadow_type: Gtk.ShadowType.NONE });
        this.view.selection_mode = false;
        this.view.set_view_type(Gd.MainViewType.ICON);
        this.add(this.view);
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


        this.view.set_view_type(Gd.MainViewType.ICON);
        this.view.set_model(this.model);

        this.query = 'SELECT tracker:id(?album) nie:title(?album) tracker:coalesce( (SELECT GROUP_CONCAT(nmm:artistName(?artist), ",") WHERE { ?album nmm:albumArtist ?artist }), (SELECT GROUP_CONCAT((SELECT nmm:artistName(nmm:performer(?_12)) as perf WHERE { ?_12 nmm:musicAlbum ?album } GROUP BY ?perf), ",") as album_performer WHERE { }) ) as album_artist tracker:coalesce(nmm:albumTrackCount(?album), (SELECT COUNT(?_1) WHERE { ?_1 nmm:musicAlbum ?album; tracker:available "true" })) (SELECT GROUP_CONCAT(fn:year-from-dateTime(?c), ",") WHERE { ?_2 nmm:musicAlbum ?album; nie:contentCreated ?c; tracker:available "true" }) as albumyear { ?album a nmm:MusicAlbum FILTER (EXISTS { ?_3 nmm:musicAlbum ?album; tracker:available "true" }) } ORDER BY ?album_artist ?albumyear nie:title(?album)'

    },

    populate: function() {
        this.model.clear();
        this.offset = 1;
        tracker.query_async(this.query, null, Lang.bind(this, this._queueCollector, null));
    },

    _queueCollector: function(connection, res, params) {
        print("queueCollector");
        let cursor = tracker.query_finish(res);
        while(cursor.next(null)){
            if (this.offset % 150 != 0){
                var album = {
                    "id": cursor.get_string(0)[0],
                    "title": cursor.get_string(1)[0],
                    "artist": cursor.get_string(2)[0],
                    "num_tracks": cursor.get_integer(3),
                    "year": cursor.get_integer(4),
                    "icon": GdkPixbuf.Pixbuf.new_from_file('/usr/share/icons/gnome/scalable/places/folder-music-symbolic.svg')
                }
                var icon = albumArtCache.lookup (128, album["artist"], album["title"]);
                this.offset += 1;
                album["icon"] = icon
                let iter = this.model.append();
                this.model.set(iter, [ 0, 1, 2, 3, 4, 5 ],
                    [ album["id"], "", album["title"], album["artist"], album["icon"], album["num_tracks"]]);
            }
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
        this.query = "SELECT tracker:id(?song) nie:url(?song) nie:title(?song) nmm:artistName(nmm:performer(?song)) tracker:id(nmm:musicAlbum(?song)) nie:title(nmm:musicAlbum(?song)) nfo:duration(?song) { ?song a nmm:MusicPiece } ORDER BY tracker:added(?song)"
        this._items = {}
        this.model = Gtk.ListStore.new(
            [ GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GdkPixbuf.Pixbuf,
              GObject.TYPE_LONG,
              GObject.TYPE_BOOLEAN ]);
        this.view.set_view_type(Gd.MainViewType.LIST);
        this.view.set_model(this.model);


        let listWidget = this.view.get_generic_view();
        listWidget.selection_mode = false;

        let albumRenderer =
            new Gd.StyledTextRenderer({ xpad: 0 });
        albumRenderer.add_class('dim-label');

        listWidget.add_renderer(albumRenderer, Lang.bind(this,
            function(col, cell, model, iter) {
                let id = model.get_value(iter, 0);
                let doc = this._getItem(id);
                albumRenderer.text = doc["album"];
            }));


        let whereRenderer =
            new Gd.StyledTextRenderer({ xpad: 16 });
        whereRenderer.add_class('dim-label');

        listWidget.add_renderer(whereRenderer, Lang.bind(this,
            function(col, cell, model, iter) {
                let id = model.get_value(iter, 0);
                let doc = this._getItem(id);
                var duration = doc["duration"]
                var minutes = parseInt(duration/60);
                var seconds = duration%60
                var time = ""
                if (seconds < 10)
                    time = minutes + ":0" + seconds
                else
                    time = minutes + ":" + seconds
                whereRenderer.text = time;
            }));
    },

    _getItem: function(id) {
        return this._items[id]
    },

    populate: function() {
        this.model.clear();
        this.offset = 1;
        tracker.query_async(this.query,
                            null, Lang.bind(this, this._queueCollector, null));
    },

    _queueCollector: function(connection, res, params) {
        print("queueCollector");
        let cursor = tracker.query_finish(res);
        while(cursor.next(null)){
            if (this.offset % 600 != 0){
                let id =cursor.get_string(0)[0]
                let song = {
                    "id": id,
                    "url": cursor.get_string(1)[0],
                    "title": cursor.get_string(2)[0],
                    "artist": cursor.get_string(3)[0],
                    "album_id": cursor.get_string(4)[0],
                    "album": cursor.get_string(5)[0],
                    "duration": parseInt(cursor.get_string(6)[0]),
                    "icon": GdkPixbuf.Pixbuf.new_from_file('/usr/share/icons/gnome/scalable/places/folder-music-symbolic.svg'),
                }
                this.offset += 1;
                //this.model.append([tracker_id, title, artist, album, null])
                this._items[id] = song

                if (song["title"] != null) {
                    var icon = albumArtCache.lookup (48, song["artist"], song["album"]);
                    song["icon"] = icon;
                    let iter = this.model.append();
                    this.model.set(iter,
                        [0, 1, 2, 3, 4, 5],
                        [song["id"],
                        song["album"],
                        song["title"],
                        song["artist"],
                        song["icon"],
                        song["duration"]]);
                }
                else
                    print (song["url"])
            }
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
