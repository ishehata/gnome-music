/*
 * Copyright (c) 2013 Seif Lotfy <seif@lotfy.com>.
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
 */

const Lang = imports.lang; 
const GdkPixbuf = imports.gi.GdkPixbuf;
const GLib = imports.gi.GLib;
const Regex = GLib.Regex;
const Path = GLib.Path;

const invalid_chars = /[()<>\[\]{}_!@#$^&*+=|\\/\"'?~]/g;
const convert_chars = /[\t]/g;
const blocks = ["()", "{}", "[]", "<>"];

function escapeRegExp(str) {
  return str.replace(/[\(\)\[\]\<\>\{\}\_\!\@\#\$\^\&\*\+\=\|\\\/\"\'\?\~]/g, "\\$&");
}

String.prototype.printf = function()
{
   var content = this;
   for (var i=0; i < arguments.length; i++)
   {
        var replacement = '{' + i + '}';
        content = content.replace(replacement, arguments[i]);  
   }
   return content;
};

const AlbumArtCache = new Lang.Class({
    Name: "AlbumArtCache",
    Extends: GLib.Object,
    
    _init: function() {
        this.parent();
        this.block_regexes = [];
        this.space_compress_regex = new RegExp ("\\s+");

        for (var i in blocks) {
            var block = blocks[i];
            var block_re = escapeRegExp (block[0]) + "[^" + escapeRegExp (block[1]) + "]*" + escapeRegExp (block[1]);
            this.block_regexes.push(new RegExp (block_re));
        }
        this.cache_dir =  GLib.build_filenamev ([GLib.get_user_cache_dir (), "media-art"]);
    },

    lookup: function(size, artist_, album_) {
        var artist = artist_;
        var album = album_;

        if (artist == null) {
            artist = " " ;
        }

        if (album == null) {
            album = " ";
        }

        try {
            var key = "album-" + this.normalize_and_hash (artist) + "-" + this.normalize_and_hash (album);
            var path = GLib.build_filenamev ([this.cache_dir, key + ".jpeg"]);
            return GdkPixbuf.Pixbuf.new_from_file_at_scale (path, size, -1, true);
        } catch (error) {
            //print (error)
        }
        try {
            var key = "album-" + this.normalize_and_hash (artist, false, true) + "-" + this.normalize_and_hash (album, false, true)
            var path = GLib.build_filenamev ([this.cache_dir, key + ".jpeg"]);
            return GdkPixbuf.Pixbuf.new_from_file_at_scale (path, size, -1, true);
        } catch (error) {
            //print (error)
        }
        try {
            var key = "album-" + this.normalize_and_hash (" ", false, true) + "-" + this.normalize_and_hash (album, false, true)
            var path = GLib.build_filenamev ([this.cache_dir, key + ".jpeg"]);
            return GdkPixbuf.Pixbuf.new_from_file_at_scale (path, size, -1, true);
        } catch (error) {
            //print (error)
        }
        try {
            var key = "album-" + this.normalize_and_hash (artist + "\t" + album, true, true);
            var path = GLib.build_filenamev ([this.cache_dir, key + ".jpeg"]);
            return GdkPixbuf.Pixbuf.new_from_file_at_scale (path, size, -1, true);
        } catch (error) {
            //print (error)
        }
        try {
            var path = "/usr/share/icons/gnome/scalable/places/folder-music-symbolic.svg";
            return GdkPixbuf.Pixbuf.new_from_file_at_scale (path, size, -1, true);
        } catch (error) { 
            //print (error)
        }

        return null;
    },


    normalize_and_hash: function (input, utf8_only, utf8) {
        var normalized = " ";
        if (input != null && input != "") {
            if (utf8_only) {
                normalized = input;
            } else {
                normalized = this.strip_invalid_entities (input);
                normalized = normalized.toLowerCase ();
            }
            if (utf8) {
                normalized = GLib.utf8_normalize(normalized, -1, 2)
            }
        }

        return GLib.compute_checksum_for_string (GLib.ChecksumType.MD5, normalized, -1);
    },

    strip_invalid_entities: function (original) {
        let p = original;
        for (var i in this.block_regexes) {
            var re = this.block_regexes[i];
            p = p.replace (re, "");
        }
        p = p.replace (invalid_chars, "");
        p = p.replace (convert_chars, " ");
        p = p.replace (this.space_compress_regex, " ");
        return p;
    }

});

AlbumArtCache.instance = null;

AlbumArtCache.get_default = function () {
    if (AlbumArtCache.instance == null)
        AlbumArtCache.instance = new AlbumArtCache();
    return AlbumArtCache.instance;
};
