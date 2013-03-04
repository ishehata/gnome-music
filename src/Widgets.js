const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;

const SymbolicToolButton = new Lang.Class({
	Name: "Symbolic Tool Button",
	
    _init: function(iconName){        
		this.btn = new Gtk.Button();		
        let icon = new Gio.ThemedIcon.new_with_default_fallbacks(iconName);
        let image = new Gtk.Image();
        image.set_from_gicon(icon, Gtk.IconSize.MENU);
        image.show();
        this.btn.add(image);
        this.btn.set_size_request(34, 34);
     },
});


const MediaBar = new Lang.Class({
	Name: "MediaBar",
		
	_init: function(){
		this.mediabar = new Gtk.Toolbar();
		this.mediabar.set_size_request(-1, 42);
		this._buildToolbar();
	},
	
	_buildToolbar: function(){		
		let leftItem = new Gtk.ToolItem();
		let centerItem = new Gtk.ToolItem();
		let rightItem = new Gtk.ToolItem();
		let leftBox = new Gtk.Box()
		let centerBox = new Gtk.Box()
		let rightBox = new Gtk.Box()
		let spacer = new Gtk.ToolItem()
		let rewindBtn  = new SymbolicToolButton("media-seek-backward-symbolic");
		let playBtn = new SymbolicToolButton("media-playback-start-symbolic");
		let forwardBtn = new SymbolicToolButton("media-seek-forward-symbolic");
		let shuffleBtn = new SymbolicToolButton("media-seek-forward-symbolic");
		this.scale = new Gtk.Scale();
				
		this.scale.set_slider_size_fixed(true);
		//this.scale.set_digits(2);
		this.scale.set_value_pos(Gtk.PositionType.RIGHT);
		this.scale.set_range(0.00,4.00);		
		leftItem.add(leftBox);
		centerItem.add(centerBox);
		rightItem.add(rightBox);
		spacer.set_expand(true);
		leftBox.get_style_context().add_class("linked");
		leftBox.pack_start(rewindBtn.btn, true, false, 0);
		leftBox.pack_start(playBtn.btn, true, false, 0);
		leftBox.pack_start(forwardBtn.btn, true, false, 0);
		centerBox.pack_start(this.scale, true, false, 3);
		rightBox.pack_start(shuffleBtn.btn, true, false, 3);
		
		this.mediabar.insert(leftItem, -1);
		this.mediabar.insert(centerItem, -1);
		this.mediabar.insert(spacer, -1);
		this.mediabar.insert(rightItem, -1);
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
		let leftItem    = new Gtk.ToolItem();
		let rightItem   = new Gtk.ToolItem();
		let centerItem  = new Gtk.ToolItem();
		let leftBox   = new Gtk.Box();		
		let centerBox   = new Gtk.Box();		
		let rightBox   = new Gtk.Box();		
		let backBtn = new SymbolicToolButton("go-previous-symbolic");
		let newBtn     = new Gtk.Button({label : "New"});		
		let rightBtn    = new SymbolicToolButton("object-select-symbolic");
		let leftSpacer  = new Gtk.ToolItem();		
		let rightSpacer = new Gtk.ToolItem({expand : true});		
		
		this.btns = {}		
		this.btns['artists'] = new Gtk.ToggleButton({label : "Artists"});
		this.btns['albums'] = new Gtk.ToggleButton({label : "Albums"});				
		this.btns['songs'] = new Gtk.ToggleButton({label : "Songs"});
		this.btns['playlists']  = new Gtk.ToggleButton({label : "Playlists"});
				
		leftItem.add(leftBox);
		centerItem.add(centerBox);
		rightItem.add(rightBox);
		leftSpacer.set_expand(true);
		rightSpacer.set_expand(true);
		leftBox.pack_start(backBtn.btn, false, false, 0);		
		leftBox.pack_start(newBtn, false, false, 0);		
		rightBox.pack_start(rightBtn.btn, false, false, 0);
		centerBox.get_style_context().add_class("linked");		
		for(btn in this.btns)
		{
			centerBox.pack_start(this.btns[btn], false, false, 0);			
		}		
				
		this.toolbar.insert(leftItem, -1);
		this.toolbar.insert(leftSpacer, -1);
		this.toolbar.insert(centerItem, -1);
		this.toolbar.insert(rightSpacer, -1);
		this.toolbar.insert(rightItem, -1);
	},
});

