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
const Grl = imports.gi.Grl; //??

const Playlist = new Lang.Class({
    Name: "Playlist",
    
    _init: function(){
        this.list = new Array();
        this.currentIndex = 0;
        this._shuffle = false;
        this._source_list = new Array();
        this.settings = new GLib.Settings("org.gnome.Music");
        /* convert to js
         public signal void song_selected (Grl.Media media, int index);
         public signal void changed ();
         public signal void shuffle_mode_changed (bool mode);
         */ 
        
        this.settings.changed.connect (Lang.bind(this, this._on_settings_key_changed));
    },    
    
    get_shuffle: function(){
        return this._shuffle;
    },
    
    set_shuffle: function(value){
        this._shuffle = value;
        this.settings.set_boolean("shuffle", value);
    },
    
    select: function(media){
        if(list.indexOf(2) >= 0) {
            this.currentIndex = list.indexOf(2); 
        }
    },
    
    load_next: function(){
        if(this.currentIndex+ 1 < this.list.length){
            this.currentIndex++;
            this.song_selected(this.list[this.currentIndex], this.currentIndex);
        }
    },
    
    load_previous: function(){
        if(this.currentIndex > 0) {
            this.currentIndex--;
            this.song_selected(this.list[this.currentIndex], this.currentIndex);
        }
    },
    
    load_album: function(){
    },
    
    _load_item_cb: function(media, remaining){
        if(media != null) {
            this.list.add(media);
        }
        if(remaining == 0){
            this.changed();
        }
    },
    
    _set_grl: function(){
        let register = Grl.Registery.get_default();
        
        registery.source_added.connect(Lang.bind(this, this.source_added_cb));
        registery.source_removed.connect(Lang.bind(this, this.source_removed_cb));
    },
    
    _source_added_cb: function(source){
        if (source.get_id() != "grl-tracker-source") {
            return;
        }
        
        debug ("Checking source: %s", source.get_id()); //??
        
        let ops = source.supported_operations ();
        if ((ops & Grl.SupportedOps.QUERY) != 0) {
            debug ("Detected new source availabe: '%s' and it supports queries", source.get_name ());
            this._source_list.set (source.get_id(), source);
        }
    },
    
    _source_removed_cb: function(source){
        for(let id in this._source_list.keys) {
            if (id == source.get_id()) {
                debug ("Source '%s' is gone", source.get_name ());
                this._source_list.unset (id);
            }
        }
    },
    
    _on_settings_key_changed: function(key){
        if(key == "shuffle"){
            this.shuffle_mode_changed(this.settings.get_boolean("shuffle"));
        }
    },

});
