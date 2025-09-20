SceneMaker.Editor.Settings = (function(SM,$,undefined){

	var init = function(){
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
			'onStart'			: function(){
				var aspectRatio = SM.ViewerAdapter.getAspectRatio();
				if(typeof aspectRatio !== "undefined"){
					$('#scene_details_select_aspectRatio').val(aspectRatio);
				}
			},
			"onComplete"  : function(data){
				_onDisplaySettings();
			}
		});

		$("a#edit_scene_details").trigger('click');
	};

	var _onDisplaySettings = function(){
		_checkIfEnableContinueButton();
	};

	var loadSceneSettings = function(scene){
		if(!scene){
			scene = {};
		}

		//Title
		if(scene.title){
			$("#scene_details_input_title").val(scene.title);
		}

		//Aspect ratio
		var aspectRatio = scene.aspectRatio;
		if((typeof aspectRatio !== "string")||(["4:3","16:9"].indexOf(aspectRatio)===-1)){
			aspectRatio = "4:3";
		}
		$('#scene_details_select_aspectRatio').val(aspectRatio);

		SM.ViewerAdapter.applyAspectRatio(aspectRatio);
	};
	
	var _checkIfEnableContinueButton = function(){
		var enable = checkMandatoryFields();
		if(enable){
			$("#save_scene_details").removeClass("buttonDisabledOnSettings");
			$("#save_scene_details").removeAttr("disabled");
			$("#save_scene_details").removeAttr("title");
		} else {
			$("#save_scene_details").addClass("buttonDisabledOnSettings");
			$("#save_scene_details").attr("disabled","true");
		}
	};

	var checkMandatoryFields = function(){
		//Check that mandatory params are filled appropiately.
		// var title = $('#scene_details_input_title').val();
		// if((typeof title != "string")||(title.trim()=="")){
		// 	return false;
		// }
		return true;
	};

	var onSaveSceneDetailsButtonClicked = function(event){
		event.preventDefault();

		//Check if is disabled
		if($(event.target).hasClass("buttonDisabledOnSettings")){
			return;
		}

		$.fancybox.close();

		var settings = saveSettings();
		SM.ViewerAdapter.applyAspectRatio(settings.aspectRatio);
	};

	var saveSettings = function(){
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

		return settings;
	};

	return {
		init									: init,
		displaySettings							: displaySettings,
		loadSceneSettings						: loadSceneSettings,
		onSaveSceneDetailsButtonClicked			: onSaveSceneDetailsButtonClicked,
		saveSettings							: saveSettings
	};

}) (SceneMaker, jQuery);