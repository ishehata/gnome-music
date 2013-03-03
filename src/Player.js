const Gtk = imports.gi.Gtk;
const Lang = imports.lang;


const Player = new Lang.Class({
	Name: "Player",
	
	_init: function(){		
		this.playlist = new Array();
	},
	
	get_current_song: function(){
	},
	
	get_previous_song: function(){
	},
	
	get_next_song: function(){
	},
	
	play: function(){
	},
	
	pause: function() {
	},
	
	stop: function(){
	},
	
	get_playlist: function(){
		return this.playlist;
	},
	
	add_to_playlist: function(order){
	},
	
	append_to_playlist: function(){
	},
	
	remove_from_playlist: function(){
	},
	
});
