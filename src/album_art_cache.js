/*/*
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
const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;

const invalid_chars = "()[]<>{}_!@#$^&*+=|\\/\"'?~";
const convert_chars = "\t";
const block_pattern = "%s[^%s]*%s";
const blocks = new Array("()", "{}", "[]", "<>");
const instance = null;
const chache_dir = "";

const AlbumArtCache = new Lang.Class({
    Name: "AlbumArtCache",
    Extends: GLib.Object,
    
    
    _init: function() {
        this.parent();
    },
    
    get_default: function() {
        if (instance == null) {
            instance = new AlbumArtCache();
        }

        return instance;
    },
});

