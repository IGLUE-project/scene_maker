/*
 * Current version uses the Iframe API based on HTML5
 * Doc: https://developers.google.com/youtube/iframe_api_reference
 */

//Var to store youtube players associated with an iframe
var youtubePlayers = {}; 
//Youtube Constants (also accesible in window['YT'].PlayerState when API is loaded)
var YT = YT || {};
YT.PlayerState = YT.PlayerState || {};
YT.PlayerState.UNSTARTED = -1;
YT.PlayerState.ENDED = 0;
YT.PlayerState.PLAYING = 1;
YT.PlayerState.PAUSED = 2;
YT.PlayerState.BUFFERING = 3;
YT.PlayerState.CUED = 5;

//Callback from Youtube Iframe API
var _youTubeIframeApiReady = false;
function onYouTubeIframeAPIReady(){ _youTubeIframeApiReady = true; }


SceneMaker.Video.Youtube = (function(SM,$,undefined){

	var _waitForLoadYouTubeAPI = true;

	var init = function(){
		_loadYouTubeIframeAPILibrary();
		setTimeout(function(){
			_waitForLoadYouTubeAPI = false;
		},11000);
	};

	var _loadYouTubeIframeAPILibrary = function(){
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	};

	var _isYouTubeIframeAPIReady = function(){
		if((window['YT'])&&(_youTubeIframeApiReady===true)){
			return true;
		} else {
			return false;
		}
	};

	var renderVideoFromJSON = function(videoJSON, options){
		var source = videoJSON['body'] || videoJSON['source'];
		var options = options || {};
		options.id = (videoJSON['id']) ? videoJSON['id'] : SM.Utils.getId();
		options.objectStyle = videoJSON['style'];
		return renderVideoFromSource(source,options);
	};

	var renderVideoFromSource = function(source,options){
		var videoId = ((options)&&(options.id)) ? options.id : SM.Utils.getId();
		var ytContainerId = SM.Utils.getId();
		var videoClasses = "";
		var objectStyle = "";
		if(options){
			if(options.extraClasses){
				videoClasses = videoClasses + " " + options.extraClasses;
			}
			if(options.objectStyle){
				objectStyle = "objectStyle='" + options.objectStyle + "' ";
			} else if(options.style){
				objectStyle = "objectStyle='" + options.style + "' ";
			}
		};
		var video = "<div id='"+ videoId + "' ytContainerId='" + ytContainerId + "' class='" + videoClasses + "' " + objectStyle + " source='" + source + "'>" + "</div>";
		return video;
	};

	var loadYoutubeObject = function(container,options){
		var controls = 1;
		var _onReadyCallback = onPlayerReady;
		var _onPlayerError = onPlayerError;

		if(options){
			if(typeof options.controls == "boolean"){
				controls = (options.controls===true) ? 1 : 0;
			}
			if(typeof options.onReadyCallback == "function"){
				_onReadyCallback = options.onReadyCallback;
			}
			if(typeof options.onPlayerError == "function"){
				_onPlayerError = options.onPlayerError;
			}
		}

		// If Youtube Iframe isn't ready, load nothing
		if(!_isYouTubeIframeAPIReady()){
			if(_waitForLoadYouTubeAPI){
				setTimeout(function(){
					loadYoutubeObject(container,options);
				},1000);
			} else {
				$(container).html("<img src='"+SM.ImagesPath+"adverts/advert_content_unavailable.png'/>");
				$(container).addClass("videoOfflineContainer");
				var nonAvailableImg = $(container).find("img");
				$(nonAvailableImg).load(function(response){
					$(nonAvailableImg).css("margin-top",($(container).height()-$(nonAvailableImg).height())/2 + "px");
				});
				_onPlayerError();
			}
			return;
		}

		var youtubeVideoId = getYoutubeIdFromURL($(container).attr("source")); 
		if(youtubeVideoId===null){
			_onPlayerError();
			return;
		}
		
		var iframeId = $(container).attr("ytContainerId");
		var ytStyle = (typeof $(container).attr("objectStyle") != "undefined") ? ("style='" + $(container).attr("objectStyle") + "' ") : "";
		$(container).html("<div id='" + iframeId + "' videotype='"+ SM.Constant.MEDIA.YOUTUBE_VIDEO + "' " + ytStyle + "'></div>");

		youtubePlayers[iframeId] = new YT.Player(iframeId, {
		  height: '100%',
		  width: '100%',
		  videoId: youtubeVideoId,
		  playerVars: { 'autoplay': 0, 'controls': controls, 'enablejsapi': 1, 'showinfo': 0, wmode: "transparent", 'rel': 0 },
		  events: {
			 'onReady': _onReadyCallback,
			 'onError' : _onPlayerError
		  }
		});

		$("#"+iframeId).attr("wmode","transparent");
	};

	var onPlayerReady = function(event){
	};

	var onPlayerError = function(event){
		// if((typeof event == "object")&&(typeof event.data != "undefined")){
		// 	SM.Debugging.log("onPlayerError with error type " + event.data);
		// }
	};


	/////////
	// Youtube Utils
	/////////

	/*
	 * Returns the youtube video id contained in the url
	 */
	var getYoutubeIdFromURL = function(url){
		var id = null;
		if(!url){
			return id;
		}

		var youtube_video_pattern_1 =/https?:\/\/?youtu.be\/([aA-zZ0-9-]+)/g
		var youtube_video_pattern_2 =/(https?:\/\/)?(www.youtube.com\/watch\?v=|embed\/)([aA-zZ0-9-]+)[&=.]*/g
		var youtube_video_pattern_3 =/(https?:\/\/)?(www.youtube.com\/v\/)([aA-zZ0-9-]+)/g
		var youtube_video_pattern_4 =/(https?:\/\/)?(www.youtube.com\/embed\/)([aA-zZ0-9-]+)/g

		if(url.match(youtube_video_pattern_1)!=null){
			var result = youtube_video_pattern_1.exec(url)
			if((result)&&(result[1])){
				id = result[1];
			}
			return id;
		}

		if(url.match(youtube_video_pattern_2)!=null){
			var result = url.split("&")[0];
			var result = youtube_video_pattern_2.exec(url)
			if((result)&&(result[3])){
				id = result[3];
			}
			return id;
		}

		if(url.match(youtube_video_pattern_3)!=null){
			var result = url.split("&")[0];
			var result = youtube_video_pattern_3.exec(url)
			if((result)&&(result[3])){
				id = result[3];
			}
			return id;
		}

		if(url.match(youtube_video_pattern_4)!=null){
			var result = url.split("&")[0];
			var result = youtube_video_pattern_4.exec(url)
			if((result)&&(result[3])){
				id = result[3];
			}
			return id;
		}

		return id;
	};

	var getEmbedSource = function(youTubeVideoDOM){
		return "https://www.youtube.com/embed/" + SM.Video.Youtube.getYoutubeIdFromURL(SM.Object.getObjectInfo(youTubeVideoDOM).source);
	};

	return {
		init 					: init,
		renderVideoFromJSON		: renderVideoFromJSON,
		renderVideoFromSource	: renderVideoFromSource,
		loadYoutubeObject		: loadYoutubeObject,
		getYoutubeIdFromURL		: getYoutubeIdFromURL,
		getEmbedSource			: getEmbedSource
	};

})(SceneMaker,jQuery);



