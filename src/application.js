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
const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gd = imports.gi.Gd;

const Toolbar = imports.toolbar;
const Widgets = imports.widgets;
const Views = imports.view;
const Player = imports.player;
const BrowseHistory = imports.browse_history;
const Playlist = imports.playlist;

const Gettext = imports.gettext;
const _ = imports.gettext.gettext;

var AppState = {
    ARTISTS: 0,
    ALBUMS: 1,
    SONGS: 2,
    PLAYLISTS: 3,
    PLAYLIST: 4,
    PLAYLIST_NEW: 5,
    
};

const Application = new Lang.Class({
        Name: 'Music',
        Extends: Gtk.Application,
        
        _init: function(){
            this.parent({ application_id: 'org.gnome.Music',
                      flags: Gio.ApplicationFlags.FLAGS_NONE,
                      inactivity_timeout: 12000 });

            //this._settings = new Gio.Settings({ schema: 'org.gnome.music' });
            this.browse_history = new BrowseHistory.BrowseHistory ();

            //Gettext.bindtextdomain('gnome-music', Path.LOCALE_DIR);
            //Gettext.textdomain('gnome-music');
            //this._build_app_menu();
            //this._define_style_and_themes();
            
            this.connect('activate', Lang.bind(this, this._onActivate));
            this.connect('startup', Lang.bind(this, this._onStartup));
            //this._settings.connect("changed", Lang.bind(this, this._on_settings_key_changed));
            //this.browse_history.connect ("changed", Lang.bind(this, this._on_browse_history_changed));
       },
       
       _define_style_and_themes : function() {
            let provider = new Gtk.CssProvider();
            provider.load_from_path('resources/gtk-style.css');
            Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
                                                     provider,
                                                     600);

            let settings = Gtk.Settings.get_default();
            //settings.gtk_application_prefer_dark_theme = true;
        },

        _build_app: function(){
                this._window = new Gtk.ApplicationWindow({application: this,
                                                          title: _("Music"),
                                                          });

                this.vbox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, spacing: 0});
                this.toolbar = new Gd.MainToolbar({ icon_size: Gtk.IconSize.MENU,
                                             show_modes: true,
                                             vexpand: false });
                this._stack = new Gd.Stack();
                this.playlist = new Playlist.Playlist();
                this.player = new Player.Player(this.playlist);

                this.views = new Array();
                
                this._window.set_default_size(640, 400);
                this._window.show_menubar = false;
                this.vbox.set_homogenous = false;
                this.vbox.pack_start(this.toolbar, false, false, 0);
                this.vbox.pack_start(this._stack, true, true, 0);
                this.vbox.pack_start(this.player.eventbox, false, false, 0);
                this._window.add(this.vbox);

                this.views[0] = new Views.Albums(this.toolbar.add_mode("Albums"));
                this.views[1] = new Views.Artists(this.toolbar.add_mode("Artists"));
                this.views[2] = new Views.Songs(this.toolbar.add_mode("Songs"));
                this.views[3] = new Views.Playlists(this.toolbar.add_mode("Playlists"));

                for (var i in this.views) {
                    this._stack.add(this.views[i]);
                    this.views[i].button.connect('toggled',
                        Lang.bind(this, this._toggleView, i));
                }


                //this.toolbar.show_all();
                this._stack.show_all();
                this.player.eventbox.show_all();
                this.vbox.show_all();
        },

        _on_settings_key_changed: function(){
        },
        
        _on_browse_history_changed: function(){
        },
        
        _build_app_menu: function(){
            let builder = new Gtk.Builder();
            builder.add_from_file('resources/app-menu.ui'); //fix this
            let menu = builder.get_object('app-menu');
            this.set_app_menu(menu);
        },

        _toggleView: function(btn, i) {
            this._stack.set_visible_child(this.views[i])
        },

        switchToView: function(view){
            if (view == 'artists')
                this.notebook.set_current_page(0);
            else if (view == 'albums')
                this.notebook.set_current_page(1);
            else if (view == 'songs')
                this.notebook.set_current_page(2);
            else if (view == 'playlists')
                this.notebook.set_current_page(3);
            this.notebook.show_all();
        },

        _onActivate: function(){
                this._window.show();
        },

        _onStartup: function(){
                this._build_app();
        },
});

