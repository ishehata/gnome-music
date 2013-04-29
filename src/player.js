const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const Gd = imports.gi.Gd;
const Gst = imports.gi.Gst;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Grl = imports.gi.Grl;
const Signals = imports.signals;

//pkg.initSubmodule('libgd');

const Mainloop = imports.mainloop;
const AlbumArtCache = imports.albumArtCache;

const ART_SIZE = 36;
const RepeatType = {
    NONE: 0,
    SONG: 1,
    ALL:  2
}


/****************Play-pause Button functions**********************************/

const PlayPauseButton = new Lang.Class({
    Name: "PlayPauseButton",
    Extends: Gtk.ToggleButton,

    _init: function() {
        this.play_image = Gtk.Image.new_from_icon_name("media-playback-start-symbolic", Gtk.IconSize.MENU);
        this.pause_image = Gtk.Image.new_from_icon_name("media-playback-pause-symbolic", Gtk.IconSize.MENU);

        this.parent();
        this.set_playing();
    },

    set_playing: function() {
        this.set_active(true);
        this.set_image(this.pause_image);
        this.show_all();
    },

    set_paused: function() {
        this.set_active(false);
        this.set_image(this.play_image);
        this.show_all();
    },

});





