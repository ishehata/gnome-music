/*/*
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
const Gd = imports.gi.Gd;
const Grl = imports.gi.Grl;
const AlbumArtCache = import.album_art_cache;

const ModelColumns = {
    ID : Gd.MainColumns.ID,
    ART : Gd.MainColumns.ICON,
    TITLE : Gd.MainColumns.PRIMARY_TEXT,
    INFO : Gd.MainColumns.SECONDARY_TEXT,
    SELECTED : Gd.MainColumns.SELECTED,
    TYPE : Gd.MainColumns.LAST,
    MEDIA,
    LAST,
};

const ItemType = {
    ARTIST,
    ALBUM,
    SONG,
};

const ListStore = new Lang.Class({
    Name: "ListStore",
    Extends: Gtk.ListStore,
    
    _init: function() {
        this._source_list = {};
        this._running_query = "";
        this._running_query_params = "";
        this._cache = new AlbumArtCache.AlbumArtCache().get_default();
        this._icon_size = 96;
        let types = new Array();
        
        this.parent();
        types = { 
            typeof (string),      // Music.ModelColumns.ID
            typeof (string),
            typeof (string),      // Music.ModelColumns.TITLE
            typeof (string),      // Music.ModelColumns.INFO
            typeof (Gdk.Pixbuf),  // Music.ModelColumns.ART
            typeof (long),
            typeof (bool),        // Music.ModelColumns.SELECTED
            typeof (ItemType),    // Music.ModelColumns.TYPE
            typeof (Grl.Media),   // Music.ModelColumns.MEDIA
       };
       this.set_column_types (types);
    },
    
    connect_signals: function() {
        let registery = Grl.Registery.get_default();
        
        registery.connect("source_added", Lang.bind(this, this._source_added_cb);
        registery.connect("source_removed", Lang.bind(this, this._source_removed_cb);
        
        if(registery.load_all_plugins() == false) {
            error("Failed to load plugins");
        }
    },
    
    load_item: function(id, type) {
        if(type != null) {
            switch(type) {
                case ItemType.ARTIST:
                    this._load_albums_by_artist_id(id);
                    break;
                case ItemType.ALBUM:
                    this._load_album_songs_by_id(id);
                    break;
                case ItemType.SONG:
                    break;
            }
        }
        else {
            switch (id) {
                case "all_artists":
                    this._load_all_artists ();
                    break;
                case "all_albums":
                    this._load_all_albums ();
                    break;
                case "all_songs":
                    this._load_all_songs ();
                    break;
            }
        }
    },
    
    this._load_all_artists: function() {
        this._running_query = "load_all_artists";
        this._running_query_params = "";
        this._running_query_type = ItemType.ARTIST;
        
        let query = "SELECT rdf:type (?artist) 
                            tracker:id(?artist) AS id 
                            nmm:artistName(?artist) AS title
                    Where { ?artist a nmm:Artist}
                    ORDER BY ?title";
                    
        this._make_query(query);
    },
    
    _load_all_albums: function(){
        this._running_query = "load_all_albums";
        this._running_query_params = "";
        this._running_query_type = ItemType.ALBUM;
        
        let query = "SELECT rdf:type (?album)
                            ?album
                            tracker:id(?album) AS id
                            ?title
                            ?author
                            SUM(?length) AS duration
                            tracker:coalesce (fn:year-from-dateTime(?date), 'Unknown')
                     WHERE {
                            ?album a nmm:MusicAlbum ;
                                   nie:title ?title;
                                   nmm:albumArtist [ nmm:artistName ?author ] .
                            ?song nmm:musicAlbum ?album ;
                                  nfo:duration ?length
                            OPTIONAL { ?song nie:informationElementDate ?date }
                     } 
                     GROUP BY ?album
                     ORDER BY ?author ?title";

        this._make_query();
    },
    
    _load_albuums_by_artist_id: function(id){
        this._running_query = "load_albums_by_artist_id";
        this._running_query_params = id;
        this._running_query_type = ItemType.ALBUM;

        let query = @"SELECT rdf:type (?album)
                             ?album
                             tracker:id(?album) AS id
                             ?title
                             nmm:artistName(?artist) AS author
                             SUM(?length) AS duration
                             tracker:coalesce (fn:year-from-dateTime(?date), 'Unknown')
                      WHERE { ?album a nmm:MusicAlbum;
                                     nie:title ?title;
                                     nmm:albumArtist ?artist FILTER (tracker:id (?artist) = $id) .
                              ?song nmm:musicAlbum ?album ;
                                    nfo:duration ?length .
                              OPTIONAL { ?song nie:informationElementDate ?date }
                      }
                      GROUP BY ?album
                      ORDER BY ?title";

        this._make_query(query);
    },
    
    _load_all_songs: function() {
        this._running_query = "load_all_songs";
        this._running_query_params = "";
        this._running_query_type = ItemType.SONG;
        
        // FIXME: site contains the album's name. It's obviously a hack to remove
        let query =  "SELECT rdf:type (?song)
                             ?song
                             tracker:id(?song) AS id
                             nie:title(?song) AS title
                             ?duration
                             ?url
                             tracker:coalesce (nie:title(?album), '') AS site
                             tracker:coalesce (nmm:artistName(?artist), '') AS author
                      WHERE { ?song a nmm:MusicPiece ;
                                    nfo:duration ?duration;
                                    nie:isStoredAs ?as .
                              ?as nie:url ?url .
                              OPTIONAL { ?song nmm:musicAlbum ?album } .
                              OPTIONAL { ?album nmm:albumArtist ?artist }
                      }
                      GROUP BY ?song
                      ORDER BY ?author ?album";

        this._make_query(query);
    },
    
    _load_album_songs_by_id: function(id) {
        this._running_query = "load_album_songs_by_id";
        this._running_query_params = id;
        this._running_query_type = ItemType.SONG;

        let query = "SELECT rdf:type (?song)
                             ?song
                             tracker:id(?song) AS id
                             nie:title(?song) AS title
                      WHERE { ?song a nmm:MusicPiece;
                              nmm:musicAlbum ?album FILTER (tracker:id (?album) = $id ) }";

        this._make_query(query);
    },
    
    this._make_query(query) {
        this.clear();
        
        lset keys = Gtk.MetadataKey.list_new(Grl.MetadataKey.ID,
                                             Grl.MetadataKey.TITLE,
                                             Grl.MetadataKey.URL);
                                             
        let caps = null;
        let options = new OperationOptions(caps); //what is Operation Options?
        
        options.set_skip(0);
        options.set_count(1000000);
        options.set_flags(Gdk.ResolitionFlags.NORMAL);
        
        for(let source in this._source_list){
            source.query(query, keys, options, Lang.bind(this, this._load_item_cb, source, query_id, media, remaining, error)); //FIX PARAMS
        }
    },
    
    _load_item_cb: function(media, remaining){
        if(media != null) {
            let iter = null;
            this.append(iter);
            
            switch(this._running_query_type) {
                case ItemType.ARTIST:
                    let pixbuf = this._cache.lookup (this._icon_size, media.get_title (), null);

                    set (iter, _ModelColumns.ID, media.get_id());
                    set (iter, _ModelColumns.ART, pixbuf);
                    set (iter, _ModelColumns.TITLE, media.get_title ());
                    set (iter, _ModelColumns.INFO, "");
                    set (iter, _ModelColumns.SELECTED, false);
                    set (iter, _ModelColumns.TYPE, Music.ItemType.ARTIST);
                    set (iter, _ModelColumns.MEDIA, media);
                    break;
                case ItemType.ALBUM:
                    let pixbuf = this._cache.lookup (this._icon_size, media.get_author (), media.get_title());

                    set (iter, _ModelColumns.ID, media.get_id());
                    set (iter, _ModelColumns.ART, pixbuf);
                    set (iter, _ModelColumns.TITLE, media.get_title ());
                    set (iter, _ModelColumns.INFO, media.get_author ());
                    set (iter, _ModelColumns.SELECTED, false);
                    set (iter, _ModelColumns.TYPE, Music.ItemType.ALBUM);
                    set (iter, _ModelColumns.MEDIA, media);
                    break;
                case ItemType.SONG:
                    // FIXME: site contains the album's name. It's obviously a hack to remove
                    let pixbuf = this._cache.lookup (this._icon_size, media.get_author (), media.get_site ());

                    set (iter, _ModelColumns.ID, media.get_id());
                    set (iter, _ModelColumns.ART, pixbuf);

                    if (media.get_title () != null) {
                        set (iter, _ModelColumns.TITLE, media.get_title ());
                    }
                    else {
                        let url = media.get_url();
                        let file = GLib.File.new_for_path (url);
                        let basename = file.get_basename ();
                        let to_show = GLib.Uri.unescape_string (basename, null);
                        set (iter, _ModelColumns.TITLE, to_show);
                    }

                    if (media.get_site() != "") {
                        set (iter, _ModelColumns.INFO, "%s\n%s".printf (media.get_author(), media.get_site()));
                    }
                    else {
                        set (iter, _ModelColumns.INFO, media.get_author());
                    }

                    set (iter, _ModelColumns.SELECTED, false);
                    set (iter, _ModelColumns.TYPE, ItemType.SONG);
                    set (iter, _ModelColumns.MEDIA, media);
                    break;
            }
        }
    },
    
    _re_run_query: function() {
        if(this._running_query != null) {
            switch (this._running_query) {
                case "load_all_artists":
                    this._load_all_artists ();
                    break;
                case "load_all_albums":
                    this._load_all_albums ();
                    break;
                case "load_all_songs":
                    this._load_all_songs ();
                    break;
                case "load_albums_by_artist_id":
                    this._load_albums_by_artist_id (running_query_params);
                    break;
            }
        }
    },
    
    _source_added_cb: function(source) {
        // FIXME: We're only handling Tracker by now
        if (source.get_id() != "grl-tracker-source") {
            return;
        }

        debug ("Checking source: %s", source.get_id());

        let ops = source.supported_operations ();
        if ((ops & Grl.SupportedOps.QUERY) != 0) {
            debug ("Detected new source availabe: '%s' and it supports queries", source.get_name ());
            this._source_list.set (source.get_id(), source);

            this._re_run_query ();
        }
    },

    _source_removed_cb: function(source) {
        for(let id in source_list.get_keys()) {
            if (id == source.get_id()) {
                debug ("Source '%s' is gone", source.get_name ());
                this._source_list.splice(id, 1);
            }
        }
    },

//    finished: signal();

});


