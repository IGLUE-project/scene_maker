SceneMaker.Editor.Video.Youtube = (function(SM,$,undefined){

	var generateWrapperForYoutubeVideoUrl = function (url){
		var videoId = SM.Video.Youtube.getYoutubeIdFromURL(url);
		if(videoId!=null){
			return _generateWrapper(videoId);
		} else {
			return "Youtube Video ID can't be founded.";
		}
	};

	var _generateWrapper = function(videoId){
		var videoURL = "https://www.youtube.com/embed/"+videoId;
		videoURL = SM.Utils.addParamToUrl(videoURL,"wmode","opaque");
		var currentArea = SM.Editor.getCurrentArea();
		var videoWContainer = ((typeof currentArea != "undefined")&&(currentArea != null)) ? currentArea : SM.Editor.getCurrentContainer();
		var dimensionsToDraw = SM.Editor.Utils.dimentionsToDraw($(videoWContainer).width(), $(videoWContainer).height(),325,243);
		var wrapper = "<iframe src='"+videoURL+"' frameborder='0' style='width:"+dimensionsToDraw.width+"px; height:"+dimensionsToDraw.height+"px;'></iframe>";
		return wrapper;
	};

	var generatePreviewWrapperForYoutubeVideoUrl = function(url){
		var videoId = SM.Video.Youtube.getYoutubeIdFromURL(url);
		if(videoId!=null){
			return _generatePreviewWrapper(videoId);
		} else {
			return "<p class='objectPreview'>Youtube Video ID can't be founded.</p>"
		}
	};

	var _generatePreviewWrapper = function(videoId){
		var videoURL = "https://www.youtube.com/embed/"+videoId;
		videoURL = SM.Utils.addParamToUrl(videoURL,"wmode","opaque");
		var wrapper = '<iframe class="objectPreview" src="'+videoURL+'" frameborder="0"></iframe>';
		return wrapper;
	};

	return {
		generateWrapperForYoutubeVideoUrl 			: generateWrapperForYoutubeVideoUrl,
		generatePreviewWrapperForYoutubeVideoUrl 	: generatePreviewWrapperForYoutubeVideoUrl
	};

}) (SceneMaker, jQuery);
