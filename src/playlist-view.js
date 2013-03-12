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

const AlbumInfoBox = imports.album_info_box;
const PlaylistSongs = imports.playlist_songs;

const PlayListView = new Lang.Class({
    Name: "PlayListView",
    
    actor: function(){ return this._scrolled_window; },
    
    _playlist: null,
    
    _scrolled_window: null, 
    
    _album_info_box: null,
    
    playlist_songs: null,
    
    _init: function (playlist) {
        this._playlist = playlist;
        
        this._setup_view();
    },
    
    _setup_view: function() {
        let layout = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 0});
        layout.set_homogeneous(false);
        
        let alignment = new Gtk.Alignment({xalign: 0.5, yalign: 0.5});
        
        /* Album Info Box */
        this._album_info_box = new AlbumInfoBox.AlbumInfoBox ();
        layout.pack_start (this._album_info_box.actor, false, false);
        
        /* Playlist songs Box */
        playlist_songs = new Music.PlaylistSongs (playlist);
        layout.pack_start (playlist_songs.actor, false, false);

        this._scrolled_window = new Gtk.ScrolledWindow (null, null);
        this._scrolled_window.hscrollbar_policy = Gtk.PolicyType.NEVER;
        this._scrolled_window.vscrollbar_policy = Gtk.PolicyType.AUTOMATIC;
        this._scrolled_window.add_with_viewport (this._alignment);

        scrolled_window.show_all ();
    },
    
    load: function(media) {
        this._album_info_box.load (media);
        this._playlist.load_album (media);
    },
});
