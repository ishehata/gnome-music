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
const Toolbar = imports.toolbar;
const Widgets = imports.widgets;
const Views = imports.view;
const Player = imports.player;
const Gettext = imports.gettext;
const _ = imports.gettext.gettext;

const Application = new Lang.Class({
        Name: 'Music',
        Extends: Gtk.Application,
        
        _init: function(){
            this.parent({ application_id: 'org.gnome.Music',
                      flags: Gio.ApplicationFlags.FLAGS_NONE,
                      inactivity_timeout: 12000 });
            this.player = new Player.Player();

            //Gettext.bindtextdomain('gnome-music', Path.LOCALE_DIR);
            //Gettext.textdomain('gnome-music');
            //this._build_app_menu();
            //this._define_style_and_themes();
            
            this.connect('activate', Lang.bind(this, this._onActivate));
            this.connect('startup', Lang.bind(this, this._onStartup));
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

        _buildUI: function(){
                this._window = new Gtk.ApplicationWindow({application: this,
                                                          title: _("Music"),
                                                          hide_titlebar_when_maximized: true});

                this.vbox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, spacing: 0});
                this.toolbar = new Toolbar.Toolbar(this);
                this.notebook = new Gtk.Notebook();

                this.views = new Array();
                
                this._window.set_default_size(640, 400);
                this.vbox.set_homogenous = false;
                this.vbox.pack_start(this.toolbar, false, false, 0);
                this.vbox.pack_start(this.notebook, true, true, 0);
                this.vbox.pack_start(this.player, false, false, 0);                               
                this._window.add(this.vbox);

                this.views[0] = new Views.Artists();
                this.views[1] = new Views.Albums();
                this.views[2] = new Views.Songs();
                this.views[3] = new Views.Playlists();
                this.notebook.set_show_tabs(false);
                this.notebook.append_page(this.views[0], new Gtk.Label({label: "Artists"}));
                this.notebook.append_page(this.views[1], new Gtk.Label({label: "Albums"}));
                this.notebook.append_page(this.views[2], new Gtk.Label({label: "Songs"}));
                this.notebook.append_page(this.views[3], new Gtk.Label({label: "Playlists"}));
                this.notebook.set_current_page(1);

                
                //this.toolbar.show_all();
                this.notebook.show_all();
                //this.mediabar.show_all();
                this.vbox.show_all();

        }, 
        
        _build_app_menu: function(){
            let builder = new Gtk.Builder();
            
            builder.add_from_file('resources/app-menu.ui'); //fix this
            let menu = builder.get_object('app-menu');
            this.set_app_menu(menu);
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
                this._buildUI();
        },
});

