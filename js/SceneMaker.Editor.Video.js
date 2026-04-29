SceneMaker.Editor.Video = (function(SM,$,undefined){
	var initialized = false;
	var contentToAdd = null;
	var contentAddMode = SM.Constant.NONE;
	var urlDivId = "tab_video_from_url_content";
		
	var init = function(){
		if(initialized) return;
		initialized = true;

		SM.Editor.Video.HTML5.init();

		var urlInput = $("#"+urlDivId).find("input");
		$("#tab_video_from_url_content .previewButton").click(function(event){
			if(SM.Validator.validateObject($(urlInput).val())){
				contentToAdd = SM.Editor.Utils.autocompleteUrls($(urlInput).val());
				SM.Editor.Object.drawPreview("tab_video_from_url_content", contentToAdd);
			} else {
				contentToAdd = null;
			}
		});

		//Multimedia Settings
		_hiddenLinkToInitMultimediaSettings = $('<a href="#multimediaSettings_fancybox" style="display:none"></a>');
		$(_hiddenLinkToInitMultimediaSettings).fancybox({
			'autoDimensions' : false,
			'height': 400,
			'width': 400,
			'scrolling': 'no',
			'showCloseButton': false,
			'padding' : 0,
			"onStart"  : function(data){
				_onStartMultimediaSettingsFancybox();
			},
			"onComplete" : function(data){
			},
			"onClosed"  : function(data){
			}
		});
	};

	var onLoadTab = function(tab){
		//Load Video from URL
		$("#tab_video_from_url_content").find("input").val("");
		SM.Editor.Object.resetPreview("tab_video_from_url_content");
	};

	var addVideo = function(video){
		if(video){
			contentToAdd = video;
			addContent();
		}
	};
	
	var addContent = function(){
		switch(contentAddMode){
			case SM.Constant.EVIDEO:
				SM.Editor.EVideo.onVideoSelected(contentToAdd);
				break;
			default:
				SM.Editor.Object.drawPreviewObject(contentToAdd);
		}
		contentAddMode = SM.Constant.NONE;
	};

	var getAddContentMode = function(){
		return contentAddMode;
	};

	var setAddContentMode = function(mode){
		SM.Editor.Utils.hideNonDefaultTabs();
		switch(mode){
			case SM.Constant.NONE:
				break;
			case SM.Constant.EVIDEO:
				$("#tab_audio_soundcloud").hide();
				break;
		}
		contentAddMode = mode;
	};

	var getDefaultTab = function(){
		var defaultTab = 'tab_video_from_url';
		if(SM.Configuration.getConfiguration()["Youtube"]){
			defaultTab = 'tab_video_youtube';
		}
		return defaultTab;
	};


	/////////////////
	// Multimedia Settings
	/////////////////

	var showMultimediaSettings = function(){
		$(_hiddenLinkToInitMultimediaSettings).trigger("click");
	};

	var _onStartMultimediaSettingsFancybox = function(){
		var $mSF = $("#multimediaSettings_fancybox");

		//Get area
		var $area = $(SM.Editor.getCurrentArea());
		$mSF.find("input[type='hidden'][name='elId']").val($area.attr("id"));

		//Get object
		// var $object = $area.find("audio, video").first();
		// if ($object.length !== 1) {
		// 	return;
		// }
		// var isAudio = ($object.prop("tagName").toLowerCase() === "audio");

		//Load settings
		var mSettings = {};
		try {
			mSettings = JSON.parse($area.attr("elSettings"));
		} catch(e){}

		//Default settings
		if(typeof mSettings.autoplay === "undefined"){
			mSettings.autoplay = false;
		}
		if(typeof mSettings.loop === "undefined"){
			mSettings.loop = false;
		}
		if(typeof mSettings.controls === "undefined"){
			mSettings.controls = true;
		}
		if(typeof mSettings.resume === "undefined"){
			mSettings.resume = false;
		}

		//Fill and reset form
		var $autoplayObjectCheckbox = $mSF.find("input[type='checkbox'][name='autoplay']");
		$autoplayObjectCheckbox.prop('checked', mSettings.autoplay);
		var $loopObjectCheckbox = $mSF.find("input[type='checkbox'][name='loop']");
		$loopObjectCheckbox.prop('checked', mSettings.loop);
		var $controlsObjectCheckbox = $mSF.find("input[type='checkbox'][name='controls']");
		$controlsObjectCheckbox.prop('checked', mSettings.controls);
		var $resumeCheckbox = $mSF.find("input[type='checkbox'][name='resume']");
		$resumeCheckbox.prop('checked', mSettings.resume);
	};

	var onMultimediaSettingsDone = function(){
		var $mSF = $("#multimediaSettings_fancybox");

		//Get area
		var areaId = $mSF.find("input[type='hidden'][name='elId']").val();
		var $area = $("#"+areaId);
		//Get object
		//var $object = $area.find("audio, video").first();

		//Get previous settings
		var mSettings = {};
		try {
			mSettings = JSON.parse($(area).attr("elsettings"));
		} catch(e) {}
		
		//Get new settings
		mSettings.autoplay = $mSF.find("input[type='checkbox'][name='autoplay']").is(":checked");
		mSettings.loop = $mSF.find("input[type='checkbox'][name='loop']").is(":checked");
		mSettings.controls = $mSF.find("input[type='checkbox'][name='controls']").is(":checked");
		mSettings.resume = $mSF.find("input[type='checkbox'][name='resume']").is(":checked");

		//Save Settings
		var mSSerialized = JSON.stringify(mSettings);
		$area.attr("elSettings",mSSerialized);

		$.fancybox.close();
	};
	
	return {
		init						: init,
		onLoadTab 					: onLoadTab,
		addVideo					: addVideo,
		addContent 					: addContent,
		getAddContentMode			: getAddContentMode,
		setAddContentMode			: setAddContentMode,
		getDefaultTab				: getDefaultTab,
		showMultimediaSettings		: showMultimediaSettings,
		onMultimediaSettingsDone	: onMultimediaSettingsDone
	};

}) (SceneMaker, jQuery);
