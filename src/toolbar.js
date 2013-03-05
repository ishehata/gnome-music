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

const Toolbar = new Lang.Class({
    Name: "Toolbar",
    Extends: Gtk.Toolbar,
    
    _init: function(){      
        this.parent();
        this.get_style_context().add_class('menubar');
        this.set_size_request(-1, 42);
        this._buildToolbar();
    },
    
    _buildToolbar: function(){
        let leftItem    = new Gtk.ToolItem();
        let rightItem   = new Gtk.ToolItem();
        let centerItem  = new Gtk.ToolItem();
        let leftBox   = new Gtk.Box();      
        let centerBox   = new Gtk.Box();        
        let rightBox   = new Gtk.Box();     
        let backBtn = new Widgets.SymbolicToolButton("go-previous-symbolic");
        let newBtn     = new Gtk.Button({label : "New"});       
        let rightBtn    = new Widgets.SymbolicToolButton("object-select-symbolic");
        let leftSpacer  = new Gtk.ToolItem();       
        let rightSpacer = new Gtk.ToolItem();       
        
        this.btns = {}      
        this.btns['artists'] = new Gtk.ToggleButton({label : "Artists"});
        this.btns['albums'] = new Gtk.ToggleButton({label : "Albums"});             
        this.btns['songs'] = new Gtk.ToggleButton({label : "Songs"});
        this.btns['playlists']  = new Gtk.ToggleButton({label : "Playlists"});
                
        leftItem.add(leftBox);
        centerItem.add(centerBox);
        rightItem.add(rightBox);
        leftSpacer.set_expand(true);
        rightSpacer.set_expand(true);
        leftBox.pack_start(backBtn, false, false, 0);       
        leftBox.pack_start(newBtn, false, false, 0);        
        rightBox.pack_start(rightBtn, false, false, 0);
        centerBox.get_style_context().add_class("linked");      
        for(var btn in this.btns)
        {
            centerBox.pack_start(this.btns[btn], false, false, 0);          
        }       
                
        this.insert(leftItem, -1);
        this.insert(leftSpacer, -1);
        this.insert(centerItem, -1);
        this.insert(rightSpacer, -1);
        this.insert(rightItem, -1);
        
        this.btns['artists'].connect('clicked', Lang.bind(this, this._onToggleArtists));
        this.btns['albums'].connect('clicked', Lang.bind(this, this._onToggleAlbums));
        this.btns['songs'].connect('clicked', Lang.bind(this, this._onToggleSongs));
        this.btns['playlists'].connect('clicked', Lang.bind(this, this._onTogglePlaylists));
    },
    
    _onToggleArtists: function(){},    
    _onToggleAlbums: function(){},    
    _onToggleSongs: function(){},    
    _onTogglePlaylists: function(){},    
});
