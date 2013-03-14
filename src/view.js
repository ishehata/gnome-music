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
//const Widgets = imports.widgets;
const Tracker = imports.gi.Tracker;
const Application = imports.application

const tracker = Tracker.SparqlConnection.get (null);



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
        this.view.set_view_type(Gd.MainViewType.LIST);
        //print(this.view.get_view_type());
        this.show_all();
    },

    _add_list_renderers: function() {
        let listWidget = this.view.get_generic_view();

        let typeRenderer = new Gd.StyledTextRenderer({ xpad: 16 });
        typeRenderer.add_class('dim-label');
        listWidget.add_renderer(typeRenderer, Lang.bind(this,
            function(col, cell, model, iter) {
                let id = model.get_value(iter, Gd.MainColumns.ID);
                let doc = Application.SongsManager.getItemById(id);

                typeRenderer.text = doc.typeDescription;
            }));

        let whereRenderer =
            new Gd.StyledTextRenderer({ xpad: 16 });
        whereRenderer.add_class('dim-label');
        listWidget.add_renderer(whereRenderer, Lang.bind(this,
            function(col, cell, model, iter) {
                let id = model.get_value(iter, Gd.MainColumns.ID);
                let doc = Application.documentManager.getItemById(id);

                whereRenderer.text = doc.sourceName;
            }));

        let dateRenderer =
            new Gtk.CellRendererText({ xpad: 32 });
        listWidget.add_renderer(dateRenderer, Lang.bind(this,
            function(col, cell, model, iter) {
                let id = model.get_value(iter, Gd.MainColumns.ID);
                let doc = Application.documentManager.getItemById(id);
                let DAY = 86400000000;

                let now = GLib.DateTime.new_now_local();
                let mtime = GLib.DateTime.new_from_unix_local(doc.mtime);
                let difference = now.difference(mtime);
                let days = Math.floor(difference / DAY);
                let weeks = Math.floor(difference / (7 * DAY));
                let months = Math.floor(difference / (30 * DAY));
                let years = Math.floor(difference / (365 * DAY));

                if (difference < DAY) {
                    dateRenderer.text = mtime.format('%X');
                } else if (difference < 2 * DAY) {
                    dateRenderer.text = _("Yesterday");
                } else if (difference < 7 * DAY) {
                    dateRenderer.text = Gettext.ngettext("%d day ago",
                                                         "%d days ago",
                                                         days).format(days);
                } else if (difference < 14 * DAY) {
                    dateRenderer.text = _("Last week");
                } else if (difference < 28 * DAY) {
                    dateRenderer.text = Gettext.ngettext("%d week ago",
                                                         "%d weeks ago",
                                                         weeks).format(weeks);
                } else if (difference < 60 * DAY) {
                    dateRenderer.text = _("Last month");
                } else if (difference < 360 * DAY) {
                    dateRenderer.text = Gettext.ngettext("%d month ago",
                                                         "%d months ago",
                                                         months).format(months);
                } else if (difference < 730 * DAY) {
                    dateRenderer.text = _("Last year");
                } else {
                    dateRenderer.text = Gettext.ngettext("%d year ago",
                                                         "%d years ago",
                                                         years).format(years);
                }
            }));
    },
    
    _on_selection_mode_changed: function() {
    },
    
    

});

const Albums = new Lang.Class({
    Name: "AlbumsView",
    Extends: ViewContainer,
    
    _init: function(header_bar){
        this.parent("Albums", header_bar);
        
        this._list_store = Gtk.ListStore.new(
            [ GObject.TYPE_LONG,   // Album id 
              GObject.TYPE_STRING, // Album title
              GObject.TYPE_STRING, // Album author
              GObject.TYPE_LONG,   // Album date
              GObject.TYPE_STRING, // Album url
              GdkPixbuf.Pixbuf]);    // Album image

        this.query = "SELECT rdf:type(?album) ?album tracker:id(?album) AS id ?title ?author SUM(?length) AS duration tracker:coalesce (fn:year-from-dateTime(?date), 'Unknown') WHERE {?album a nmm:MusicAlbum ; nie:title ?title; nmm:albumArtist [ nmm:artistName ?author ] . ?song nmm:musicAlbum ?album ; nfo:duration ?length OPTIONAL { ?song nie:informationElementDate ?date } }  GROUP BY ?album ORDER BY ?author ?title"

        this.view.set_model(this._list_store);
        tracker.query_async(this.query, null, Lang.bind(this, this._queueCollector, null));
        this.populate();

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
        //print(title);
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
            [ GObject.TYPE_LONG,   // Album id
              GObject.TYPE_STRING, // Album name
              GObject.TYPE_STRING, // Album url
              GdkPixbuf.Pixbuf,    // Album image
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
