SceneMaker.Editor.Tools = (function(SM,$,undefined){
	
	var toolbarEventsLoaded = false;
	var INCREASE_SIZE = 1.05; //Constant to multiply or divide the actual size of the element


	/*
	 * Toolbar is divided in three zones.
	 * 1) Menu
	 * 2) Scene toolbar (always visible)
	 * 3) Element toolbar
	 */

	var init = function(){
		cleanToolbar();

		if(!toolbarEventsLoaded){
			//Add listeners to toolbar buttons
			$.each($("#toolbar_wrapper a.tool_action, div.tool_action"), function(index, toolbarButton) {
				$(toolbarButton).on("click", function(event){
					if(typeof SM.Editor.Tools[$(toolbarButton).attr("action")] == "function"){
						if(!$(toolbarButton).find(".toolbar_scene_wrapper").hasClass("toolbar_scene_wrapper_disabled")){
							SM.Editor.Tools[$(toolbarButton).attr("action")](this);
						}
					}
					return false; //Prevent iframe to move
				});
			});

			toolbarEventsLoaded = true;
		}

		SM.Editor.Tools.Menu.init();
	};
	 
	var cleanToolbar = function(){
		var cSlide = SM.Screen.getCurrentScreen();
		if(typeof cSlide !== "undefined"){
			loadToolsForSlide(cSlide);
		}
	};

	var enableToolbar = function(){
		$("#toolbar_wrapper").show();
	};

	var disableToolbar = function(){
		$("#toolbar_wrapper").hide();
	};


   /*
	* Menu Toolbar and overall Menu 
	*/
	//Enable and disable menu methods in SceneMaker.Editor.Tools.Menu.js


   /*
	* Scene Toolbar
	*/

	/*
	 * Update toolbar when load slide or events
	 */
	var loadToolsForSlide = function(slide){
		_cleanSceneToolbar();

		var type = $(slide).attr("type");
		$(".toolbar_scene_wrapper_slideTools:not(.toolbar_" + type + ")").hide();
		$("#toolbar_slide .toolbar_btn.tool_action:not(.toolbar_" + type + ")").hide();

		switch(type){
			case SM.Constant.VIEW_CONTENT:
				$("#toolbar_slide").removeClass("toolbar_slide_screen").addClass("toolbar_slide_view_content");
				break;
			case SM.Constant.VIEW_IMAGE:
			case SM.Constant.SCREEN:
				$("#toolbar_slide").removeClass("toolbar_slide_view_content").addClass("toolbar_slide_screen");
				$("div.tool_action[action='changeBackground']").show();
				if(typeof SM.Slides.getSlideBackground(slide) !== "undefined"){
					$("div.tool_action[action='addHotspot']").show();
					$("div.tool_action[action='addHotzone']").show();
					$("div.tool_action[action='addCaption']").show();
				} else {
					$("div.tool_action[action='addHotspot']").hide();
					$("div.tool_action[action='addHotzone']").hide();
					$("div.tool_action[action='addCaption']").hide();
				}
				break;
			default:
				return;
		}
	};

	var _cleanSceneToolbar = function(){
		//Enable all buttons
		$(".toolbar_scene_wrapper_slideTools").removeClass("toolbar_scene_wrapper_disabled");
		//cleanZoneTools
		$(".menuselect_hide").hide();
		$(".delete_content").hide();
		_cleanElementToolbar();
	};

	var saveButtonTimeout;
	var saveButtonStatus = "enabled";
	var changeSaveButtonStatus = function(status){
		switch(status){
			case "enabled":
				_enableSaveButton();
				break;
			case "loading":
				_loadingSaveButton();
				break;
			case "disabled":
				_disableSaveButton();
				break;
			default:
				return;
		}
	};

	var _enableSaveButton = function(){
		if(saveButtonStatus === "enabled"){
			return;
		}
		saveButtonStatus = "enabled";
		_stopSaveButtonTimeout();
		$("#toolbar_save").find(".toolbar_scene_wrapper").removeClass("toolbar_scene_wrapper_loading");
		$("#toolbar_save").find(".toolbar_scene_wrapper").removeClass("toolbar_scene_wrapper_disabled");
		$("#toolbar_save").find("p.toolbar_scene_title").html(SM.I18n.getTrans("i.Save"));

		//Menu
		$(".menu_option.menu_action[action='onSaveButtonClicked']").parent().removeClass("menu_item_disabled");
		$(".menu_option.menu_action[action='onSaveButtonClicked']").find("span").html(SM.I18n.getTrans("i.Save"));
	};

	var _loadingSaveButton = function(){
		if(saveButtonStatus === "loading"){
			return;
		}
		saveButtonStatus = "loading";
		$("#toolbar_save").find(".toolbar_scene_wrapper").addClass("toolbar_scene_wrapper_disabled");
		$("#toolbar_save").find(".toolbar_scene_wrapper").addClass("toolbar_scene_wrapper_loading");
		$("#toolbar_save").find("p.toolbar_scene_title").html(SM.I18n.getTrans("i.Saving"));

		//Menu
		$(".menu_option.menu_action[action='onSaveButtonClicked']").parent().addClass("menu_item_disabled");
		$(".menu_option.menu_action[action='onSaveButtonClicked']").find("span").html(SM.I18n.getTrans("i.Saving"));
	};

	var _disableSaveButton = function(){
		if(saveButtonStatus === "disabled"){
			return;
		}
		saveButtonStatus = "disabled";
		$("#toolbar_save").find(".toolbar_scene_wrapper").removeClass("toolbar_scene_wrapper_loading");
		$("#toolbar_save").find(".toolbar_scene_wrapper").addClass("toolbar_scene_wrapper_disabled");
		$("#toolbar_save").find("p.toolbar_scene_title").html(SM.I18n.getTrans("i.Saved"));

		_stopSaveButtonTimeout();
		saveButtonTimeout = setTimeout(function(){
			changeSaveButtonStatus("enabled");
		}, 5000);

		//Menu
		$(".menu_option.menu_action[action='onSaveButtonClicked']").parent().addClass("menu_item_disabled");
		$(".menu_option.menu_action[action='onSaveButtonClicked']").find("span").html(SM.I18n.getTrans("i.Saved"));
	};

	var _stopSaveButtonTimeout = function(){
		if(typeof saveButtonTimeout != "undefined"){
			clearTimeout(saveButtonTimeout);
		}
	};

   /*
	* Zone Tools
	*/
	var loadToolsForZone = function(zone){
		cleanZoneTool(SM.Editor.getLastArea());
		
		var type = $(zone).attr("type");
		switch(type){
			case "text":  
				_loadToolbarForElement(type);
				break;
			case "image":
				_loadToolbarForElement(type);
				break;
			case "video":
				_loadToolbarForElement(type);
				break;
			case "object":
				var object = $(zone).find(".object_wrapper").children()[0];
				loadToolbarForObject(object);
				break;
			case undefined:
				//Add menuselect button and hide tooltips
				$(zone).find(".menuselect_hide").show();
				hideZoneToolTip($(zone).find(".zone_tooltip"));
				return;
			default:
				break;
		}

		//Add delete content button
		$(zone).find(".delete_content").show();
	};

	var addTooltipsToSlide = function(slide){
		var zones = $(slide).find("div.view_content_zone");
		for (var i = 0; i < zones.length; i++) {
			addTooltipToZone(zones[i]);
		};
	};

	var addTooltipToZone = function(zone,hidden){
		var style = "";
		var visible = "true";
		if(hidden === true){
			style = "style='display:none'";
			visible = "false";
		}
		var tooltip = "<span class='zone_tooltip' visible='" + visible + "' " + style + " >"+SM.I18n.getTrans('i.ZoneTooltip')+"</span>";
		$(zone).append(tooltip);

		tooltip = $(zone).find(".zone_tooltip");
		if(hidden === true){
			hideZoneToolTip(tooltip);
		} else {
			showZoneToolTip(tooltip);
		}
	};

	var showZoneToolTip = function(tooltip){
		var zone = $("div").has(tooltip);

		$(tooltip).show();
		$(tooltip).attr("visible","true");
		$(zone).attr("tooltip","true");

		if($(tooltip).css("margin-top")==="0px"){	
			_setTooltipMargins(tooltip);
		}
	};

	var _setTooltipMargins = function(tooltip){
		var zone = $("div").has(tooltip);
		var slide = $("article").has(zone);

		SM.Utils.addTempShown([slide,zone,tooltip]);

		//Adjust margin-top
		var zoneHeight = $(zone).height();
		var spanHeight = $(tooltip).height();
		var marginTop = ((zoneHeight-spanHeight)/2);
		
		SM.Utils.removeTempShown([slide,zone,tooltip]);

		$(tooltip).css("margin-top",marginTop+"px");
	};

	var setAllTooltipMargins = function(callback){
		$("span.zone_tooltip").each(function(index,tooltip){
			_setTooltipMargins(tooltip);
		});
		if(typeof callback == "function"){
			callback(true);
		}
	};

	var hideZoneToolTip = function(tooltip){
		var zone = $("div").has(tooltip);
		$(tooltip).hide();
		$(tooltip).attr("visible","false");
		$(zone).attr("tooltip","false");
	};

	var cleanZoneTool = function(zone){
		_cleanElementToolbar();

		var tooltip = $(zone).find(".zone_tooltip");
		if(SM.Editor.isZoneEmpty(zone)){
			$(zone).find(".menuselect_hide").remove();
			$(zone).removeClass("zoneUnselected").removeClass("zoneSelected").addClass("editable");
			showZoneToolTip(tooltip);
		} else {
			$(zone).find(".menuselect_hide").hide();
			$(zone).find(".delete_content").hide();
			hideZoneToolTip(tooltip);
		}
	};

	var loadToolsForElement = function(element){
		_loadToolbarForElement(element);
	};


   /*
	* Element Toolbar
	*/
	var _loadToolbarForElement = function(type){
		_cleanElementToolbar(type);

		var toolbarClass = "toolbar_" + type;
		$("#toolbar_element").children().hide();
		$("#toolbar_element").find("." + toolbarClass).css("display","inline-block");
		document.getElementById("toolbar_settings_wrapper").style.top = "-4px";
	};

	var loadToolbarForObject = function(object){
		var objectInfo = SM.Object.getObjectInfo(object);

		switch(objectInfo.type){
			case SM.Constant.MEDIA.WEB:
				_loadToolbarForElement(SM.Constant.MEDIA.WEB);
				break;
			default:
				_loadToolbarForElement("object");
				//object default toolbar
				break;
		}
	};

	var _cleanElementToolbar = function(type){
		if(type !== "hotspot"){
			SM.Editor.Marker.setCurrentHotspot(undefined);
		} 
		if(type !== "hotzone"){
			SM.Editor.Marker.setCurrentHotzoneId(undefined);
		}
		$("#toolbar_element").children().hide();
	};

	/*
	 * General actions
	 */
	 var exit = function(){
	 	SM.Editor.Tools.Menu.exit();
	 }

   /*
	* Scene actions
    */

  	var displaySettings = function(){
  		_cleanElementToolbar();
		SM.Editor.Settings.displaySettings();
	};

  	var save = function(){
  		_cleanElementToolbar();
		SM.Editor.Tools.Menu.onSaveButtonClicked();
	};

	var preview = function(){
		_cleanElementToolbar();
		SM.Editor.Preview.preview();
	};

   /*
	* Screen actions
	*/

	var changeBackground = function(){
		$("#hidden_button_to_change_slide_background").trigger("click");
	};

	var deleteSlide = function(){
		SM.Editor.Slides.removeCurrentSlide();
	};

	var addHotspot = function(){
		SM.Editor.Marker.addHotspot();
	};

	var addHotzone = function(){
		SM.Editor.Marker.addHotzone();
	};

	var addCaption = function(){
		_cleanElementToolbar();
		SM.Editor.Caption.addCaption();
	};

	var deleteHotmarker = function(){
		SM.Editor.Marker.deleteCurrentHotmarker();
	};

   /*
	* Element actions
	*/

	var showElementSettings = function(target){
		switch(SM.Editor.getCurrentElementType()){
			case "HOTSPOT":
				SM.Editor.Marker.showHotspotSettings();
				break;
			case "HOTZONE":
				SM.Editor.Marker.showHotzoneSettings();
				break;
			case "ZONE":
			switch($(SM.Editor.getCurrentArea()).attr("type")){
				case SM.Constant.OBJECT:
					SM.Editor.Object.showObjectSettings();
					break;
				default:
					break;
			}
				break;
		}
	};

	return {		
		init							: init,
		loadToolsForSlide				: loadToolsForSlide,
		loadToolsForElement				: loadToolsForElement,
		loadToolsForZone				: loadToolsForZone,
		loadToolbarForObject			: loadToolbarForObject,
		cleanZoneTool 					: cleanZoneTool,
		cleanToolbar					: cleanToolbar,
		enableToolbar					: enableToolbar,
		disableToolbar					: disableToolbar,
		save 							: save,
		displaySettings   				: displaySettings,
		preview 						: preview,
		deleteSlide 					: deleteSlide,
		changeBackground				: changeBackground,
		addHotspot						: addHotspot,
		addHotzone						: addHotzone,
		addCaption						: addCaption,
		deleteHotmarker 				: deleteHotmarker,
		addTooltipsToSlide				: addTooltipsToSlide,
		addTooltipToZone				: addTooltipToZone,
		showZoneToolTip					: showZoneToolTip,
		hideZoneToolTip					: hideZoneToolTip,
		setAllTooltipMargins			: setAllTooltipMargins,
		changeSaveButtonStatus			: changeSaveButtonStatus,
		showElementSettings 			: showElementSettings,
		exit							: exit
	};

}) (SceneMaker, jQuery);