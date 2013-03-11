/*
 * Copyright (C) 2012 Cesar Garcia Tapia <tapia@openshine.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const ClickableLabel = imports.clickable_label;

const PlayListSongs = new Lang.bind({
    Name: "PlayListSongs",
    
    actor: function(){ return alignement; },
    
    _alignment: null,
    
    _grid: new Gtk.Grid(),
    
    _current_song: 0,
    
    _playlist:,
    
    _init: function(playlist) {
        this._playlist = playlist;
        this._playlist.connect("changed", Lang.bind(this, this._on_playlist_changed);
        this._playlist.connect("song_selected", Lang.bind(this, this._on_playlist_song_selected);
        this._alignment = new Gtk.Alignment({xalign: 0.5, yalign: 0.5, xscale: 0, yscale: 0}),
        
        this._alignment.show_all();
    },
    
    _on_play_list_changed() {
        this.clear_grid();
        
        for(let media in this._playlist) {
            let image = new Gtk.Image.new_from_icon_name("media-playback-start-symbolic", Gtk.IconSize.BUTTON);
            image.hidden();
            
            let title = new ClickableLabel.ClickableLabel(media.get_title());
            title.set_alignment(0, 0.5);
            title.connect("clicked", Lang.bind(this, this._on_title_clicked, media));
            
            let duration = media.get_duration();
            let length = new Gtk.Label({label : String(duration)});
            length.set_alignment(1, 0.5);
            length.get_style_context().add_class("dim-label");
            
            grid.attach_next_to (image, null, Gtk.PositionType.BOTTOM, 1, 1);
            grid.attach_next_to (title, image, Gtk.PositionType.RIGHT, 1, 1);
            grid.attach_next_to (length, title, Gtk.PositionType.RIGHT, 1, 1);
            
            image.hide();
            title.show();
            length.show();
        }
    },
    
    clear_grid: function() {
        let child = this._alignment.get_child();
        if(child != null) {
            this._alignment.remove(child);
        }
        
        let grid = new Gtk.Grid();
        grid.set_column_spacing (10);
        grid.set_row_spacing (10);
        this._alignment.add (grid);
        grid.show_all ();
    },
    
    _on_title_clicked: function (media) {
        this._playlist.select (media);
    },

    _on_playlist_song_selected: function(media, index) {
        debug (current_song.to_string());
        let image = this._grid.get_child_at(0, this._current_song);
        if (image != null) {
            image.hide();
        },

        image = this._grid.get_child_at(0, index);
        image.show();

        this._current_song = index;
    }

});

