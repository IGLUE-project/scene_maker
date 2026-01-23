SceneMaker.Video.Youtube = (function(SM,$,undefined){

	var init = function(){
	};

	var renderVideoFromJSON = function(videoJSON, options){
		var source = videoJSON['body'] || videoJSON['source'];
		var options = options || {};
		options.id = (videoJSON['id']) ? videoJSON['id'] : SM.Utils.getId();
		options.objectStyle = videoJSON['style'];
		return renderVideoFromSource(source,options);
	};

	var _generateWrapper = function(url){
		var iframeURL = "https://www.youtube.com/embed/" + getYoutubeIdFromURL(url);
		var iframe = "<iframe src='" + iframeURL + "' title='YouTube video player' frameborder='0' allowfullscreen></iframe>";
		return iframe;
	};

	var renderVideoFromSource = function(source,options){
		var videoId = ((options)&&(options.id)) ? options.id : SM.Utils.getId();
		var videoClasses = "";
		var objectStyle = "";
		if(options){
			if(options.extraClasses){
				videoClasses = videoClasses + " " + options.extraClasses;
			}
			if(options.objectStyle){
				objectStyle = options.objectStyle;
			} else if(options.style){
				objectStyle = options.style;
			}
		};

		var videoWrapper = _generateWrapper(source);
		return "<div id='"+videoId+"' class='"+ videoClasses +"' objectStyle='" + objectStyle + "' objectWrapper=\"" + videoWrapper + "\"></div>";
	};

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

	return {
		init 					: init,
		renderVideoFromJSON		: renderVideoFromJSON,
		renderVideoFromSource	: renderVideoFromSource,
		getYoutubeIdFromURL		: getYoutubeIdFromURL
	};

})(SceneMaker,jQuery);