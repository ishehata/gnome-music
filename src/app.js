#!/usr/bin/gjs

const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const tr = imports.toolbar;

const Application = new Lang.Class({
        
        Name: 'gnome-documents',
        
        _init: function(){
                this.application = new Gtk.Application();

                this.application.connect('activate', Lang.bind(this, this._onActivate));
                this.application.connect('startup', Lang.bind(this, this._onStartup));
        },

        _buildUI: function(){
                this._window = new Gtk.ApplicationWindow({application: this.application,
                                                          title: "Music"});
				this._window.set_default_size(640, 400);
                this._vbox = new Gtk.VBox();
                this.toolbar = new tr.Toolbar();
                this.notebook = new Gtk.Notebook();
                this.mediabar = new Gtk.Toolbar();                
				this._vbox.pack_start(this.toolbar.toolbar, true, false, 0);
				this._vbox.pack_start(this.notebook, true, true, 0);
				this._vbox.pack_end(this.mediabar, true, false, 0);
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
