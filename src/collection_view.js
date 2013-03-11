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
const Gd = imports.gi.Gd;
const ListStore = imports.list_store;

/*
internal enum Music.CollectionType {
    ARTISTS = 0,
    ALBUMS,
    SONGS,
    PLAYLISTS
}
*/

const CollectionView = new Lang.Class({
    Name: "CollectionView",
    
    _ModelColumns: {
        SCREENSHOT = Gd.MainColumns.ICON,
        TITLE = Gd.MainColumns.PRIMARY_TEXT,
        INFO = Gd.MainColumns.SECONDARY_TEXT,
        SELECTED = Gd.MainColumns.SELECTED,
        ITEM = Gd.MainColumns.LAST,
        LAST,
    },
    
    _init: function() {
//        this.actor { get { return scrolled_window; } } //FIX THIS
          this._model = new ListStore.ListStore();
          this._scrolled_window = new Gtk.ScrolledWindow(null, null);
          this._icon_view = new Gd.MainIconView();
          this._button_press_item_path = "";          
          App.app.connect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));//FIX THIS
          App.app.connect ("browse_back", Lang.bind(this, this.on_browse_back)); //FIX THIS
          
          this.set_view();
          this.model.connect_signals();
    },
    
    set_view: function() {
        this._IconView.set_model(this.model);
        this._icon_view.get_style_context().add_class("music-collection-view");
        this._icon_view.set_selection_mode(false);
        this._icon_view.connect("button_press_event",Lang.bind(this, this._on_button_press_event));
        this._icon_view.connect ("button_release_event", Lang.bind(this, this._on_button_release_event));
        
        this._scrolled_window.hscrollbar_policy = Gtk.PolicyType.NEVER;
        this._scrolled_window.add (icon_view);

        this._icon_view.show();
        this._scrolled_window.show();
    },
    
    _on_button_press_event: function(view, event) {
        let path = this.icon_view.get_path_at_pos(event.x, event.y);
        if(path != null)
            this.buutton_press_item_path = this.path_to_string();
        
        if(!App.app.selection_mode || path == null ) //FIX App.app
            return false;
    },
    
    _on_button_release_event: function(view, event) {
        if(event.type != Gdk.EventType.BUTTON_RELEASE)
            return true;
        
        let path = this.icon_view.get_path_at_post(event.x, event.y);        
        let same_item = false;
        if(path != null) {
            let button_release_item_path = this.path_to_string();
            same_item = this._button_press_item_path == button_release_item_path;
        }
        
        this.button_press_item_path = null;
        
        if(!same_item)
            return false;
            
        let entered_mode = false;
        if(!App.app.selection_mode) {//Fix App.app
            if (event.button == 3 || (event.button == 1 && Gdk.ModifierType.CONTROL_MASK in event.state)) {
                App.app.selection_mode = true; //FIX App.app
                entered_mode = true;
            }
        }
        
        if(App.app.selection_mode)//Fix App.app
            return this._on_button_release_selection_mode(event, entered_mode, path);
        else
            return this._on_button_release_view_mode(event, path);
    },
    
    _on_button_release_selection_mode: function(event, entered_mode, path) {
        let iter = null;
        if(!this._model.get_iter(iter, path))
            return false;
        
        let selected = false; //not sure if false should be the default value
        model.get(iter, _ModelColumns.SELECTED, selected);
        
        if(selected && !entered_mode)
            this._model.set(iter, _ModelColumns.SELECTED, false);
        else if (!selected)
            this._model.set(iter, _ModelColumns.SELECTED, true);
        this._icon_view.queue_draw();
        
        return false;
    },
    
    _on_button_release_view_mode: function(event, path) {
        let iter = null;
        let iter_id = 0;
        let iter_type = null;
        let iter_media = null;
        
        this._model.get_iter(iter, path);
        this._model.get_value(iter, _ModelColumns.ID, iter_id);
        this._model.get_value(iter, _ModelColumns.TYPE, iter_type);
        this._model.get_value(iter, _ModelColumns.MEDIA, iter_media);
        
        let id = String(iter_id);
        let type = iter_type;
        let media = iter_media;
        
        this._load_item(id, type);
        this.item_selected(id, type, media);
        
        return false;
    },
    
    on_browse_back: function(item_id, item_type) {
        this._load_item(item_id, item_type);
    },
    
    _on_app_state_changed(old_state, new_state) {
        switch(new_state) {
            case AppState.ARTISTS: //FIX THIS
                App.app.browse_history.clear();
                App.app.browse_history.all_artists = null
                this._model.load_item("all_artists", null);
                break;
            case AppState.ALBUMS:
                App.app.browse_history.clear();
                App.app.browse_history.all_albums = null;
                this._model.load_item("all_albums", null);
                break;
            case Music.AppState.PLAYLISTS:
            case Music.AppState.PLAYLIST:
            case Music.AppState.PLAYLIST_NEW:
                break;
    },
    
    _load_item: function (item_id, item_type) {
        this._model.load_item(item_id, item_type);
        
        if(item_type == null) {
            switch(item_id) {
                case "all_artists":
                    App.app.disconnect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));
                    App.app.app_state = AppState.ARTISTS;
                    App.app.connect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));
                    break;
                case "all_albums":
                    App.app.disconnect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));
                    App.app.app_state = Music.AppState.ALBUMS;
                    App.app.connect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));
                    break;
                case "all_songs":
                    App.app.disconnect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));
                    App.app.app_state = Music.AppState.SONGS;
                    App.app.connect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));
                    break;
            }
        }
        else {
            switch (item_type) {
                case ItemType.ARTIST:
                    App.app.disconnect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));
                    App.app.app_state = AppState.ALBUMS;
                    App.app.connect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));
                    break;
                case Music.ItemType.ALBUM:
                    App.app.disconnect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));
                    App.app.app_state = AppState.SONGS;
                    App.app.connect ("app_state_changed", Lang.bind(this, this._on_app_state_changed));
                    break;
                case Music.ItemType.SONG:
                    break;
            }
        }
    },
    
//    item_selected: signal(item_id, item_type, media); FIX THIS
});
