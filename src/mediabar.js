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
const Gio = imports.gi.Gio;
const Widgets = imports.widgets;

const Mediabar = new Lang.Class({
    Name: "MediaBar",
    Extends: Gtk.Toolbar,
        
    _init: function(){
        this.parent();      
        this.set_size_request(-1, 42);
        this._buildToolbar();
    },
    
    _buildToolbar: function(){      
        let leftItem = new Gtk.ToolItem();
        let centerItem = new Gtk.ToolItem();
        let rightItem = new Gtk.ToolItem();
        let leftBox = new Gtk.Box()
        let centerBox = new Gtk.Box()
        let rightBox = new Gtk.Box()
        let spacer = new Gtk.ToolItem()
        this.rewindBtn  = new Widgets.SymbolicToolButton("media-skip-backward-symbolic", true);
        this.playBtn = new Widgets.SymbolicToolButton("media-playback-start-symbolic", true);
        this.forwardBtn = new Widgets.SymbolicToolButton("media-skip-forward-symbolic", true);
        this.scale = new Widgets.Scale();
        this.star = new Widgets.SymbolicToolButton("non-starred-symbolic", false);
        this.shuffleBtn = new Widgets.SymbolicToggleButton("media-playlist-shuffle-symbolic");                
        
        leftItem.add(leftBox);
        centerItem.add(centerBox);
        rightItem.add(rightBox);
        spacer.set_expand(true);
        leftBox.get_style_context().add_class("linked");
        leftBox.pack_start(this.rewindBtn, true, false, 0);
        leftBox.pack_start(this.playBtn, true, false, 0);
        leftBox.pack_start(this.forwardBtn, true, false, 0);
        centerBox.pack_start(this.scale, true, true, 3);
        rightBox.pack_start(this.star, true, false, 3);
        rightBox.pack_start(this.shuffleBtn, true, false, 3);
        
        this.insert(leftItem, -1);
        this.insert(centerItem, -1);
        this.insert(spacer, -1);
        this.insert(rightItem, -1);
    },
    
    
    setModePlaying: function(){},
    
    setModeEmpty: function(){        
        this.scale.hide();
        this.star.hide();
    },
        
});

