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
const Gd = imports.gi.Gd;
const Gst = imports.gi.Gst;
const GLib = imports.gi.GLib;

//pkg.initSubmodule('libgd');

const Mainloop = imports.mainloop;
const AlbumArtCache = imports.album_art_cache;

const ART_SIZE = 240;


const PlayPauseButton = new Lang.Class({
    Name: "PlayPauseButton",
    Extends: Gtk.ToggleButton,
    
    _init: function() {
        this.play_image = Gtk.Image.new_from_icon_name("media-playback-start-symbolic", Gtk.IconSize.BUTTON);
        this.pause_image = Gtk.Image.new_from_icon_name("media-playback-pause-symbolic", Gtk.IconSize.BUTTON);                
              
        this.parent();
        this.set_image(this.play_image);
    },
});


const Player = new Lang.Class({
    Name: "Player",
    //Extends: GLib.Object,

    _init: function(){//parameter: playlist
        //this.playlist = playlist;
        //this.cache = new AlbumArtCache.AlbumArtCache().get_default();
        //Gst.init(null, 0);
        //this.source = new Gst.ElementFactory.make("audiotestrc", "source");
        //this.sink = new Gst.ElementFactory.make("autoaudiosink", "output"); 
        //this.playbin = new Gst.ElementFactory.make("playbin2", "playbin");
        //this.playbin = null;
        //this.bus = this.playbin.get_bus();
        
        //this.parent();
        this._setup_view();
        //playlist.shuffle_mode_changed.connect(Lang.bind(this, this.on_playlist_shuffle_mode_changed));
    },

    _setup_view: function() {
        this.eventbox = new Gtk.EventBox ();
        this.eventbox.get_style_context ().add_class ("music-player");
        
        let box = new Gtk.Box({orientation : Gtk.Orientation.HORIZONTAL, spacing : 0});
        let alignment = new Gtk.Alignment({xalign:0, yalign:0.5, xscale:1, yscale:1});
        alignment.set_padding(15, 15, 15, 15);
        alignment.add(box);
        this.eventbox.add (alignment);
        
        let toolbar_start = new Gtk.Box({orientation : Gtk.Orientation.HORIZONTAL, spacing : 0});
        toolbar_start.get_style_context().add_class(Gtk.STYLE_CLASS_LINKED);
        let algmnt = new Gtk.Alignment({xalign:0, yalign:0.5, xscale:1, yscale:1});
        algmnt.add(toolbar_start);
        box.pack_start(algmnt, false, false, 0);
        
        let prev_btn = new Gtk.Button();
        prev_btn.set_image(Gtk.Image.new_from_icon_name("media-skip-backward-symbolic", Gtk.IconSize.BUTTON));
        prev_btn.connect("clicked", Lang.bind(this, this._on_prev_btn_clicked));
        toolbar_start.pack_start(prev_btn, false, false, 0);

        let play_btn = new PlayPauseButton();
        play_btn.connect("toggled", Lang.bind(this, this._on_play_btn_toggled));
        toolbar_start.pack_start(play_btn, false, false, 0);

        let next_btn = new Gtk.Button();
        next_btn.set_image(Gtk.Image.new_from_icon_name ("media-skip-forward-symbolic", Gtk.IconSize.BUTTON));
        next_btn.connect("clicked", Lang.bind(this, this._on_next_btn_clicked));
        toolbar_start.pack_start(next_btn, false, false, 0);

        let toolbar_song_info = new Gtk.Box({orientation : Gtk.Orientation.HORIZONTAL, spacing : 0});
        //let algmnt = new Gtk.Alignment({xalign:0, yalign:0.5, xscale:0, yscale:0});
        //algmnt.add (toolbar_song_info);
        //box.pack_start (algmnt, false, false, 10);

        this.cover_img = new Gtk.Image();
        toolbar_song_info.pack_start (this.cover_img, false, false, 5);

        /*let databox = new Gtk.Box({orientation : Gtk.Orientation.VERTICAL, spacing : 0});
        toolbar_song_info.pack_start (databox, false, false, 0);

        this.title_lbl = new Gtk.Label (null);
        databox.pack_start (this.title_lbl, false, false, 0);

        let artist_lbl = new Gtk.Label (null);
        artist_lbl.get_style_context ().add_class ("dim-label");
        databox.pack_start (artist_lbl, false, false, 0);

        let toolbar_center = new Gtk.Box({orientation : Gtk.Orientation.HORIZONTAL, spacing : 0});
        box.pack_start (toolbar_center, true, true, 10);

        this.progress_scale = new Gtk.Scale (Orientation.HORIZONTAL, null);
        this.progress_scale.set_draw_value (false);
        this._set_duration (1);
        this.progress_scale.sensitive = false;
        this.progress_scale.connect ("change_value", Lang.bind(this, this.on_progress_scale_change_value));
        toolbar_center.pack_start (this.progress_scale);

        this.song_playback_time_lbl = new Gtk.Label({label:"00:00"});
        toolbar_center.pack_start (this.song_playback_time_lbl, false, false, 0);
        let label = new Gtk.Label ("/");
        toolbar_center.pack_start (label, false, false, 0);
        this.song_total_time_lbl = new Gtk.Label({label:"00:00"});
        toolbar_center.pack_start (this.song_total_time_lbl, false, false, 0);

        let toolbar_end = new Gtk.Box({orientation : Gtk.Orientation.HORIZONTAL, spacing : 5});
        let alignment = new Gtk.Alignment({xalign:1, yalign:0.5, xscale:0, yscale:0});
        alignment.add (toolbar_end);
        box.pack_start (alignment, false, false, 10);

        let rate_btn = new Gtk.Button ();
        rate_btn.set_image (new Gtk.Image.from_icon_name ("bookmark-new-symbolic", IconSize.BUTTON));
        //rate_btn.clicked.connect ((button) => {});
        toolbar_end.pack_start (rate_btn, false, false, 0);

        let shuffle_btn = new Gtk.ToggleButton ();
        shuffle_btn.set_image (new Gtk.Image.from_icon_name ("media-playlist-shuffle-symbolic", IconSize.BUTTON));
        shuffle_btn.connect ("clicked", Lang.bind(this, this.on_shuffle_btn_clicked));
        toolbar_end.pack_start (shuffle_btn, false, false, 0);
        */
        this.eventbox.show_all(); 
    },

    load: function(media){
        this._set_duration (media.get_duration());
        this.song_total_time_lbl.set_label (this.seconds_to_string (media.get_duration()));
        this.progress_scale.sensitive = true;

        // FIXME: site contains the album's name. It's obviously a hack to remove
        let pixbuf = this.cache.lookup (ART_SIZE, media.get_author (), media.get_site ());
        this.cover_img.set_from_pixbuf (pixbuf);

        if (media.get_title () != null) {
            this.title_lbl.set_label (media.get_title ());
        }
        else {
            let url = media.get_url();
            let file = GLib.File.new_for_path (url);
            let basename = file.get_basename ();
            let to_show = GLib.Uri.unescape_string (basename, null);
            this.title_lbl.set_label (to_show);
        }

        artist_lbl.set_label (media.get_author());

        let uri = media.get_url();
    },
    uri: function(){
    },
    
    _on_play_btn_toggled: function(btn){
        
    },

    _on_next_btn_clicked: function(btn){
        this._need_next();
    },

    _on_prev_btn_clicked: function(btn) {
        this._need_previous();
    },

    _need_next: function(){
        this.playlist.load_next();
    },

    _need_previous: function(){
        this.playlist.load_previous();
    },

    _on_shuffle_btn_clicked: function(order){
        this.playlist.set_shuffle(this.shuffle_btn.get_active());
    },

    _on_playlist_shuffle_mode_changed: function(mode){
        this.shuffle_btn.set_active(mode);
    },

    _set_duration: function(duration){
        this.scale.set_range(0.0, duration*60);
        this.scale.set_value(0.0);
    },
    
    _upadte_position: function(update){
        if(update){
            if(this.position_update_timeout == 0){
                Timeout.add_seconds (1, Lang.bind(this, this.update_position_cb));
            }
        } else {
            if(this.position_update_timeout != 0){
                this.Source.remove (position_update_timeout);
                this.position_update_timeout = 0;
            }
        }
    },
    
    _update_position_cb: function(){
        let format = Gst.Format.TIME;
        let duration = 0;

        this.playbin.query_position (format, duration);
        this.progress_scale.set_value (duration);
        let seconds = duration / Gst.SECOND;
        this.song_playback_time_lbl.set_label (seconds_to_string (seconds));

        return true;
    },
    
    _on_progress_scale_change_value: function(scroll, newValue){
        this.playbin.seek_simple (Gst.Format.TIME, Gst.SeekFlags.FLUSH|Gst.SeekFlags.KEY_UNIT, newValue);
        return false;
     },

});
