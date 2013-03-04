#!/usr/bin/gjs

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const Widgets = imports.Widgets;
const Player = imports.Player;

const Application = new Lang.Class({
        
        Name: 'Music',
        
        _init: function(){
                this.application = new Gtk.Application();
                this.player = new Player.Player();                

                this.application.connect('activate', Lang.bind(this, this._onActivate));
                this.application.connect('startup', Lang.bind(this, this._onStartup));
        },

        _buildUI: function(){
                this._window = new Gtk.ApplicationWindow({application: this.application,
                                                          title: "Music",
                                                          hide_titlebar_when_maximized: true});
				this._window.set_default_size(640, 400);
                this._vbox = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, spacing: 0});
                this._vbox.set_homogenous = false;
                this.toolbar = new Widgets.Toolbar();
                this.notebook = new Gtk.Notebook();
                this.mediabar = new Widgets.MediaBar();                
				this._vbox.pack_start(this.toolbar.toolbar, false, false, 0);
				this._vbox.pack_start(this.notebook, true, true, 0);
				this._vbox.pack_end(this.mediabar.mediabar, false, false, 0);
				this._window.add(this._vbox);
        }, 

        _onActivate: function(){
                this._window.show_all();
        },

        _onStartup: function(){
                this._buildUI();
        },
});

let app = new Application();
app.application.run(ARGV);
