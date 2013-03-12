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
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;

const ClickableLabel: new Lang.Class({
    Name: "ClickableLabel",
    Extends: Gtk.Event,

    _init: function(text){
        this.label = new Gtk.Label({label : text});
        let hbox = new Gtk.HBox();

        this.parent();
        this.add(hbox);
        hbox.add(label);
        
        this.enter_notify_event.connect("enter_notify_event", Lang.bind(this, this._on_enter_notify_event);

        this.connect ("leave_notify_event", Lang.bind(this, this._on_leave_notify_event);

        this.connect ("button_release_event", Lang.bind(this, this._on_button_release_event);
    },
    
    _on_enter_notify_event: function() {
        cursor: new Gdk.Cursor(Gdk.CursorType.HAND2), 
        this.get_window().set_cursor(cursor),
        return false;
    },
    
    _on_leave_notify_event: function() {
        Gdk.Cursor cursor = new Gdk.Cursor (Gdk.CursorType.ARROW);
        this.get_window().set_cursor (cursor);
        return false;
    },
    
    _on_button_release_event: function() {
        this._clicked();
        return false;
    },
    
    set_label: function(text) {
        this.label.set_label(text);
    },
    
    get_label: function() {
        return this.label.get_label();
    },
    
    show: function() {
        this.show_all();
     },
     
     set_style: function(style) {
        this.label.get_style_context().add_class(style);
     },
     
     set_alignment: function(x, y) {
        this.label.set_alignment ({xalign : x, yalign : y});
     },
    
//    _clicked: signal();
});
