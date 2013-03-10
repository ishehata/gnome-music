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

//const Gd = imports.gi.Gd;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Pango = imports.gi.Pango;

const Gettext = imports.gettext;
const _ = imports.gettext.gettext;

const Widgets = imports.widgets;

const MainToolbar = new Lang.Class({
    Name: 'MainToolbar',

    _init: function() {
        this._model = null;

        this.widget = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
        this.widget.show();

        this.toolbar = new Gd.HeaderBar();
        this.widget.add(this.toolbar);
        this.toolbar.show();

        this._searchbar = this.createSearchbar();
        if (this._searchbar)
            this.widget.add(this._searchbar.widget);
    },

    handleEvent: function(event) {
        let res = this._searchbar.handleEvent(event);
        return res;
    },

    addSearchButton: function() {
        let searchButton = new Gd.HeaderToggleButton({ symbolic_icon_name: 'edit-find-symbolic',
                                                       label: _("Search"),
                                                       action_name: 'app.search' });
        this.toolbar.pack_end(searchButton);
        return searchButton;
    },

    addBackButton: function() {
        let iconName =
            (this.toolbar.get_direction() == Gtk.TextDirection.RTL) ?
            'go-next-symbolic' : 'go-previous-symbolic';
        let backButton = new Gd.HeaderSimpleButton({ symbolic_icon_name: iconName,
                                                     label: _("Back") });
        this.toolbar.pack_start(backButton);
        return backButton;
    }
});

const Toolbar = new Lang.Class({
    Name: "Toolbar",
    //Extends: MainToolbar,
    Extends: Gtk.Toolbar,
    
    _init: function(application){
        this.app = application;
        
        this.parent();
        //this.get_style_context().add_class('music-topbar');
        this.get_style_context().add_class('menubar');
        this.set_size_request(-1, 42);
        this._buildToolbar();
    },
    
    _buildToolbar: function(){
        this.box = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 0});
        let leftItem    = new Gtk.ToolItem();
        let rightItem   = new Gtk.ToolItem();
        let centerItem  = new Gtk.ToolItem();
        let leftBox   = new Gtk.Box();
        let centerBox   = new Gtk.Box();
        let rightBox   = new Gtk.Box();
        let backBtn = new Widgets.ToolbarButton(null, "go-previous-symbolic", true);
        let newBtn = new Widgets.ToolbarButton("New", null, true);
        //let selectBtn = new Widgets.ToolbarButton(null, "emblem-default-symbolic", true);
        let selectBtn = new Widgets.ToolbarButton(null, "emblem-default-symbolic", true);
        let searchBtn = new Widgets.ToolbarButton(null, "edit-find-symbolic", true);
        let leftSpacer  = new Gtk.ToolItem();
        let rightSpacer = new Gtk.ToolItem();
        this.btns = {};
        this.btns['artists'] = new Widgets.ToolbarButton("Artists", null, true);
        this.btns['albums'] = new Widgets.ToolbarButton("Albums", null, true);
        this.btns['songs'] = new Widgets.ToolbarButton("Songs", null, true);
        this.btns['playlists']  = new Widgets.ToolbarButton("Playlists", null, true);
        this.currentToggled = null;
                
        centerBox.get_style_context().add_class("linked");
        for(var btn in this.btns)
        {
            centerBox.pack_start(this.btns[btn], false, false, 0);          
        }       
         
        this.box.pack_start(backBtn, false, false, 3);
        this.box.pack_start(newBtn, false, false, 3);
        this.box.pack_start(new Gtk.Label({label : ""}), true, true, 0);
        this.box.pack_start(centerBox, false, false, 3);
        this.box.pack_start(new Gtk.Label({label : ""}), true, true, 0);
        this.box.pack_start(searchBtn, false, false, 3);
        this.box.pack_start(selectBtn, false, false, 3);
        //this.vbox.pack_start( , false, false, 3);
        this.add(this.box);
        
        this.btns['artists'].connect('clicked', Lang.bind(this, this._onToggle, "artists"));
        this.btns['albums'].connect('clicked', Lang.bind(this, this._onToggle, "albums"));
        this.btns['songs'].connect('clicked', Lang.bind(this, this._onToggle, "songs"));
        this.btns['playlists'].connect('clicked', Lang.bind(this, this._onToggle, "playlists"));
    },
    
    toggleOffCurrentToggled: function(){
        if (this.currentToggled != null) 
        {
            this.currentToggled.set_sensitive(true);            
        }
    },
    
    _onToggle: function(btn, view){
        this.toggleOffCurrentToggled();
        btn.set_sensitive(false);
        this.currentToggled = btn;        
        this.app.switchToView(view);
    },
});
