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
			settings.aspectRatio = "4:3";
		}
		SM.ViewerAdapter.applyAspectRatio(settings.aspectRatio);
	};

	var getSettings = function(){
		return settings;
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

	var onSaveSceneSettingsButtonClicked = function(event){
		event.preventDefault();
		if($(event.target).hasClass("buttonDisabledOnSettings")){
			return;
		}
		settings = _saveSettings();

		SM.ViewerAdapter.applyAspectRatio(settings.aspectRatio);
		$.fancybox.close();
	};

	var _saveSettings = function(){
		var settings = {};
		settings.SMVersion = SM.VERSION;

		var title = $('#scene_details_input_title').val();
		if((typeof title == "string")&&(title.trim()!="")){
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