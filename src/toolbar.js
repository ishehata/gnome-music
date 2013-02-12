const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const Toolbar = new Lang.Class({
	Name: "Toolbar",
	
	_init: function(){
		this.toolbar = new Gtk.Toolbar();
		this.toolbar.get_style_context().add_class('menubar');
		this._buildToolbar();
	},
	
	_buildToolbar: function(){
		let leftBtn     = new Gtk.Button({label : "New"});
		let leftItem    = new Gtk.ToolItem({});
		let leftSpacer  = new Gtk.ToolItem({expand : true});
		let centerBox   = new Gtk.Box();
		let firstBtn    = new Gtk.Button({label : "Artists"});
		let secondBtn   = new Gtk.Button({label : "Albums"});
		let thirdBtn    = new Gtk.Button({label : "Songs"});
		let forthBtn    = new Gtk.Button({label : "Playlists"});
		let rightSpacer = new Gtk.ToolItem({expand : true});
		let rightBtn    = new Gtk.Button();
		let rightItem   = new Gtk.ToolItem();
		let centerItem  = new Gtk.ToolItem();
		
		leftItem.add(leftBtn);
		centerItem.add(centerBox);
		rightItem.add(rightBtn);
		centerBox.pack_start(firstBtn, false, false, 0);
		centerBox.pack_start(secondBtn, false, false, 0);
		centerBox.pack_start(thirdBtn, false, false, 0);
		centerBox.pack_end(forthBtn, false, false, 0);
				
		this.toolbar.insert(leftItem, -1);
		this.toolbar.insert(leftSpacer, -1);
		this.toolbar.insert(centerItem, -1);
		this.toolbar.insert(rightSpacer, -1);
		this.toolbar.insert(rightItem, -1);
	},
});

