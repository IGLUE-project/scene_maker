SceneMaker.Editor.Video = (function(SM,$,undefined){
		
	var contentToAdd = null;
	var contentAddMode = SM.Constant.NONE;

	var urlDivId = "tab_video_from_url_content";
		
	var init = function(){
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
			
	return {
		init				: init,
		onLoadTab 			: onLoadTab,
		addVideo			: addVideo,
		addContent 			: addContent,
		getAddContentMode	: getAddContentMode,
		setAddContentMode	: setAddContentMode,
		getDefaultTab		: getDefaultTab
	};

}) (SceneMaker, jQuery);
