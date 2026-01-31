SceneMaker.Editor.Settings = (function(SM,$,undefined){
	var settings;

	var init = function(){
	};

	var loadSceneSettings = function(scene){
		if(typeof scene !== "undefined"){
			settings = JSON.parse(JSON.stringify(scene));
			delete settings.screens;
		} else {
			settings = {};
		}

		//Version
		settings.SMVersion = SM.VERSION;
		
		//Aspect ratio
		if((typeof settings.aspectRatio !== "string")||(["4:3","16:9"].indexOf(settings.aspectRatio)===-1)){
			settings.aspectRatio = "16:9";
		}
		SM.ViewerAdapter.applyAspectRatio(settings.aspectRatio);
	};

	var getSettings = function(){
		var rSettings = JSON.parse(JSON.stringify(settings));
		if((typeof rSettings.title !== "string")||(rSettings.title.trim()==="")){
			rSettings.title = SM.I18n.getTrans("i.Untitled");
		}
		rSettings.avatar = _getSceneAvatar();
		return rSettings;
	};

	var _getSceneAvatar = function(){
		var screens = $('section.slides > article');
		for (var i = 0; i < screens.length; i++) {
			var screenDOM = screens[i];
			if (SM.Slides.isScreen(screenDOM)) {
				var screenBackground = SM.Slides.getSlideBackground(screenDOM);
				if (typeof screenBackground !== "undefined") {
					return screenBackground;
				}
			}
		}
		// Return default avatar
		return SM.ImagesPath + "logos/scene_maker_escapp_thumbnail.png";
	};

	var displaySettings = function(){
		// fancybox to edit scene settings
		$("a#edit_scene_details").fancybox({
			'autoDimensions' : false,
			'autoScale' : true,
			'scrolling': 'no',
			'width': 1000,
			'height': 700,
			'padding': 0,
			'hideOnOverlayClick': false,
			'hideOnContentClick': false,
			'showCloseButton': true,
			'onStart' : function(){
				_onStartSceneSettingsFancybox();
			},
			"onComplete"  : function(data){
			}
		});
		$("a#edit_scene_details").trigger('click');
	};

	var _onStartSceneSettingsFancybox = function(){
		//Title
		if(typeof settings.title === "string"){
			$("#scene_details_input_title").val(settings.title);
		} else {
			$("#scene_details_input_title").val("");
		}

		//Aspect ratio
		var aspectRatio = SM.ViewerAdapter.getAspectRatio();
		if(typeof aspectRatio !== "undefined"){
			$('#scene_details_select_aspectRatio').val(aspectRatio);
		}

		//Actions
		SM.Editor.Actions.loadActions($("#sceneActions"),settings,"SCENE");

		//Done button
		_checkIfEnableDoneButton();
	};

	var _checkIfEnableDoneButton = function(){
		var enable = _checkMandatoryFields();
		if(enable){
			$("#save_scene_details").removeClass("buttonDisabledOnSettings");
			$("#save_scene_details").removeAttr("disabled");
			$("#save_scene_details").removeAttr("title");
		} else {
			$("#save_scene_details").addClass("buttonDisabledOnSettings");
			$("#save_scene_details").attr("disabled","true");
		}
	};

	var _checkMandatoryFields = function(){
		//Check that mandatory params are filled appropiately.
		// var title = $('#scene_details_input_title').val();
		// if((typeof title != "string")||(title.trim()=="")){
		// 	return false;
		// }
		return true;
	};

	var _applyAspectRatio = function(aspectRatio){
		SM.ViewerAdapter.applyAspectRatio(aspectRatio);
		SM.Editor.Thumbnails.drawScreenThumbnails(function(){
			SM.Editor.Thumbnails.selectThumbnail(SM.Screen.getCurrentScreenNumber());
		});
	};

	var onSaveSceneSettingsButtonClicked = function(event){
		event.preventDefault();
		if($(event.target).hasClass("buttonDisabledOnSettings")){
			return;
		}
		settings = _saveSettings();

		_applyAspectRatio(settings.aspectRatio);
		$.fancybox.close();
	};

	var _saveSettings = function(){
		var settings = {};
		settings.SMVersion = SM.VERSION;

		var title = $('#scene_details_input_title').val();
		if(typeof title === "string"){
			settings.title = title;
		}

		var aspectRatio = $('#scene_details_select_aspectRatio').val();
		if((typeof aspectRatio === "string")&&(["4:3","16:9"].indexOf(aspectRatio)!==-1)){
			settings.aspectRatio = aspectRatio;
		} else {
			settings.aspectRatio = "4:3";
		}

		//Actions
		var actions = SM.Editor.Actions.getActionsJSON($("#sceneActions"));
		if(actions.length > 0){
			settings.actions = actions;
		} else if(typeof settings.actions !== "undefined"){
			delete settings.actions;
		}

		return settings;
	};


	return {
		init									: init,
		loadSceneSettings						: loadSceneSettings,
		getSettings								: getSettings,
		displaySettings							: displaySettings,
		onSaveSceneSettingsButtonClicked		: onSaveSceneSettingsButtonClicked
	};

}) (SceneMaker, jQuery);