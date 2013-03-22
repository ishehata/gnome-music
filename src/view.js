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


const LoadMoreButton = new Lang.Class({
    Name: 'LoadMoreButton',

    _init: function() {
        this._block = false;

        this._controller = Application.offsetController;
        this._controllerId =
            this._controller.connect('item-count-changed',
                                     Lang.bind(this, this._onItemCountChanged));

        let child = new Gtk.Grid({ column_spacing: 10,
                                   hexpand: true,
                                   halign: Gtk.Align.CENTER,
                                   visible: true });

        this._spinner = new Gtk.Spinner({ halign: Gtk.Align.CENTER,
                                          no_show_all: true });
        this._spinner.set_size_request(16, 16);
        child.add(this._spinner);

        this._label = new Gtk.Label({ label: _("Load More"),
                                      visible: true });
        child.add(this._label);

        this.widget = new Gtk.Button({ no_show_all: true,
                                       child: child });
        this.widget.get_style_context().add_class('music-load-more');
        this.widget.connect('clicked', Lang.bind(this,
            function() {
                this._label.label = _("Loading…");
                this._spinner.show();
                this._spinner.start();

                this._controller.increaseOffset();
            }));

        this.widget.connect('destroy', Lang.bind(this,
            function() {
                this._controller.disconnect(this._controllerId);
            }));

        this._onItemCountChanged();
    },

    _onItemCountChanged: function() {
        let remainingDocs = this._controller.getRemainingDocs();
        let visible = !(remainingDocs <= 0 || this._block);
        this.widget.set_visible(visible);

        if (!visible) {
            this._label.label = _("Load More");
            this._spinner.stop();
            this._spinner.hide();
        }
    },

    setBlock: function(block) {
        if (this._block == block)
            return;

        this._block = block;
        this._onItemCountChanged();
    }
});

const ViewContainer = new Lang.Class({
    Name: "ViewContainer",
    Extends: Gtk.Grid,
    
    _init: function(title, header_bar){
        this.parent({ orientation: Gtk.Orientation.VERTICAL });
        this._adjustmentValueId = 0;
        this._adjustmentChangedId = 0;
        this._scrollbarVisibleId = 0;
        this._model = Gtk.ListStore.new(
            [ GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GdkPixbuf.Pixbuf,
              GObject.TYPE_LONG,
              GObject.TYPE_BOOLEAN ]);
        this.view = new Gd.MainView({ shadow_type: Gtk.ShadowType.NONE });
        this.view.set_view_type(Gd.MainViewType.ICON);
        this.view.set_model(this._model);
        this.add(this.view);

        this._loadMore = new Gtk.Button({label: "Load More..."});
        this.add(this._loadMore);
        
        this.offset = 1;
        this.header_bar = header_bar;
        this.title = title;
        this.loadBtn = new Gtk.Button()

        this.show_all();
        this._loadMore.hide();
        this._connectView();
    },

    _connectView: function() {
        this._adjustmentValueId =
            this.view.vadjustment.connect('value-changed',
                                          Lang.bind(this, this._onScrolledWinChange));
        this._adjustmentChangedId =
            this.view.vadjustment.connect('changed',
                                          Lang.bind(this, this._onScrolledWinChange));
        this._scrollbarVisibleId =
            this.view.get_vscrollbar().connect('notify::visible',
                                               Lang.bind(this, this._onScrolledWinChange));
        this._onScrolledWinChange();
    },

    _onScrolledWinChange: function() {
        let vScrollbar = this.view.get_vscrollbar();
        let adjustment = this.view.vadjustment;
        let revealAreaHeight = 32;

        // if there's no vscrollbar, or if it's not visible, hide the button
        if (!vScrollbar ||
            !vScrollbar.get_visible()) {
            this._loadMore.hide();
            return;
        }
        this._loadMore.show();

        let value = adjustment.value;
        let upper = adjustment.upper;
        let page_size = adjustment.page_size;

        let end = false;

        // special case this values which happen at construction
        if ((value == 0) && (upper == 1) && (page_size == 1))
            end = false;
        else
            end = !(value < (upper - page_size - revealAreaHeight));

        if (end)
            this._loadMore.show();
        else
            this._loadMore.hide();
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
        this.view.set_view_type(Gd.MainViewType.ICON);

        this.query = 'SELECT tracker:id(?album) nie:title(?album) tracker:coalesce( (SELECT GROUP_CONCAT(nmm:artistName(?artist), ",") WHERE { ?album nmm:albumArtist ?artist }), (SELECT GROUP_CONCAT((SELECT nmm:artistName(nmm:performer(?_12)) as perf WHERE { ?_12 nmm:musicAlbum ?album } GROUP BY ?perf), ",") as album_performer WHERE { }) ) as album_artist tracker:coalesce(nmm:albumTrackCount(?album), (SELECT COUNT(?_1) WHERE { ?_1 nmm:musicAlbum ?album; tracker:available "true" })) (SELECT GROUP_CONCAT(fn:year-from-dateTime(?c), ",") WHERE { ?_2 nmm:musicAlbum ?album; nie:contentCreated ?c; tracker:available "true" }) as albumyear { ?album a nmm:MusicAlbum FILTER (EXISTS { ?_3 nmm:musicAlbum ?album; tracker:available "true" }) } ORDER BY ?album_artist ?albumyear nie:title(?album)'

    },

    populate: function() {
        this._model.clear();
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
                let iter = this._model.append();
                this._model.set(iter, [ 0, 1, 2, 3, 4, 5 ],
                    [ album["id"], "", album["title"], album["artist"], album["icon"], album["num_tracks"]]);
            }
        }
    },

});

const Songs = new Lang.Class({
    Name: "SongsView",
    Extends: ViewContainer,
    _init: function(header_bar){
        this.parent("Songs", header_bar);
        this.query = "SELECT tracker:id(?song) nie:url(?song) nie:title(?song) nmm:artistName(nmm:performer(?song)) tracker:id(nmm:musicAlbum(?song)) nie:title(nmm:musicAlbum(?song)) nfo:duration(?song) { ?song a nmm:MusicPiece } ORDER BY tracker:added(?song)"
        this._items = {}
        this.view.set_view_type(Gd.MainViewType.LIST);

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
        this._model.clear();
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
                //this._model.append([tracker_id, title, artist, album, null])
                this._items[id] = song

                if (song["title"] != null) {
                    var icon = albumArtCache.lookup (48, song["artist"], song["album"]);
                    song["icon"] = icon;
                    let iter = this._model.append();
                    this._model.set(iter,
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
    },
});

const Artists = new Lang.Class({
    Name: "ArtistsView",
    Extends: ViewContainer,
    
    _init: function(header_bar){
        this.parent("Artists", header_bar);
    },
});
