const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const MediaBar = new Lang.Class({
	Name: "MediaBar",
		
	_init: function(){
		this.mediabar = new Gtk.Toolbar();
		this.mediabar.set_size_request(-1, 42);
		this._buildToolbar();
	},
	
	_buildToolbar: function(){
		let box = new Gtk.Box()
		let leftItem = new Gtk.ToolItem();
		let rewindBtn = new Gtk.Button({label:"Rewind"});
		let playBtn = new Gtk.Button({label:"Play"});
		let forwardBtn = new Gtk.Button({label:"Forward"});
		
		//rewindBtn.set_stock_id(Gtk.STOCK_MEDIA_REWIND);
		
		leftItem.add(box);
		box.pack_start(rewindBtn, true, false, 3);
		box.pack_start(playBtn, true, false, 3);
		box.pack_start(forwardBtn, true, false, 3);
		
		this.mediabar.insert(leftItem, -1);
	},
		
});

const Toolbar = new Lang.Class({
	Name: "Toolbar",
	
	_init: function(){
		this.toolbar = new Gtk.Toolbar();
		this.toolbar.get_style_context().add_class('menubar');
		this.toolbar.set_size_request(-1, 42);
		this._buildToolbar();
	},
	
	_buildToolbar: function(){
		let leftBtn     = new Gtk.Button({label : "New"});
		let leftItem    = new Gtk.ToolItem({});
		let leftSpacer  = new Gtk.ToolItem();
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
		leftSpacer.set_expand(true);
		rightSpacer.set_expand(true);
		centerBox.get_style_context().add_class("linked");
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

