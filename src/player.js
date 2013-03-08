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
const Gst = imports.gi.Gst;

const Mainloop = import.Mainloop;


const Player = new Lang.Class({
    Name: "Player",
    Extends: Gst.Pipeline;

    _init: function(playlist){
        this.playlist = playlist;
        this.source = new Gst.ElementFactory.make("audiotestrc", "source");
        this.sink = new Gst.ElementFactory.make("autoaudiosink", "output"); 
        this.playbin = new Gst.ElementFactory.make("playbin2", null);
        this.bus = this.playbin.get_bus();
        
        this.parent();
        this.playlist.shuffle_mode_changed.connect(Lang.bind(this, this.on_playlist_shuffle_mode_changed);
    },

    _set_ui: function(){
    },

    load: function(){
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
    },
    
    _update_position_cb: function(){
    },
    
    _on_progress_scale_change_value(scroll, newValue){
     },

});
