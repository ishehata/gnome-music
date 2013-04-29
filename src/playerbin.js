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

//Class with play, pause, stop functions
const Playerbin = new Lang.Class({
    Name: "Playerbin",

    _init: function() {
        this.playlist = null;
        this.playlist_type = null;
        this.playlist_id = null;
        this.playlist_field = null;
        this.currentTrack = null;
        this.repeat = RepeatType.NONE;
        this.cache = AlbumArtCache.AlbumArtCache.getDefault();

   /*     Gst.init(null, 0);
        this.player = Gst.ElementFactory.make("playbin", "player");
        this.player.connect("about-to-finish", Lang.bind(this,
            function() {
                GLib.idle_add(0, Lang.bind(this, function () {
                if (this.timeout) {
                    GLib.source_remove(this.timeout);
                }
                if (!this.playlist || !this.currentTrack || !this.playlist.iter_next(this.currentTrack))
                    this.currentTrack=null;
                else {
                    this.load( this.playlist.get_value( this.currentTrack, this.playlist_field));
                    this.timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, Lang.bind(this, this._updatePositionCallback));
                }
                return false;}))
            }));*/
        this.bus = this.player.get_bus();
        this.bus.add_signal_watch()
        this.bus.connect("message", Lang.bind(this,
            function(bus, message) {
            if (message.type == Gst.MessageType.ERROR) {
                let uri;
            	if (this.playlist[this.currentTrack])
			 uri = this.playlist[this.currentTrack].get_url();
                else
                    uri = "none"
                log("URI:" + uri);
                log("Error:" + message.parse_error());
                this.stop();
            }
        }));

        this._setup_view();
    },

    play: function() {
        if (this.timeout) {
            GLib.source_remove(this.timeout);
        }
        if(this.player.get_state(1)[1] != Gst.State.PAUSED) {
            this.stop();
        }
      //  this.load( this.playlist.get_value( this.currentTrack, this.playlist_field));

        this.player.set_state(Gst.State.PLAYING);
        this._updatePositionCallback();
        this.timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, Lang.bind(this, this._updatePositionCallback));
    },

    pause: function () {
        this.play_btn.set_active(false);
    },

    stop: function() {
        this.player.set_state(Gst.State.NULL);
        if (this.timeout) {
            GLib.source_remove(this.timeout);
        }
    },
