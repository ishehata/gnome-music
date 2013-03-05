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
		let rewindBtn  = new Widgets.SymbolicToggleButton("media-skip-backward-symbolic");
		let playBtn = new Widgets.SymbolicToolButton("media-playback-start-symbolic");
		let forwardBtn = new Widgets.SymbolicToolButton("media-skip-forward-symbolic");
		let shuffleBtn = new Widgets.SymbolicToolButton("media-playlist-shuffle-symbolic");
		//this.scale = new Gtk.Scale();
		this.scale = Gtk.Scale.new_with_range (Gtk.Orientation.HORIZONTAL, 0.0, 100.0, 5.0);
				
		//this.scale.set_slider_size_fixed(true);
		this.scale.set_digits(0);
		this.scale.set_value(50);
		this.scale.set_valign (Gtk.Align.START);
		this.scale.set_value_pos(Gtk.PositionType.RIGHT);
		//this.scale.set_range(0.0,4.0);		
		leftItem.add(leftBox);
		centerItem.add(centerBox);
		rightItem.add(rightBox);
		spacer.set_expand(true);
		leftBox.get_style_context().add_class("linked");
		leftBox.pack_start(rewindBtn, true, false, 0);
		leftBox.pack_start(playBtn, true, false, 0);
		leftBox.pack_start(forwardBtn, true, false, 0);
		centerBox.pack_start(this.scale, true, false, 3);
		rightBox.pack_start(shuffleBtn, true, false, 3);
		
		this.insert(leftItem, -1);
		this.insert(centerItem, -1);
		this.insert(spacer, -1);
		this.insert(rightItem, -1);
	},
		
});
