SceneMaker.Editor.Video.HTML5 = (function(SM,$,undefined){
	
	var init = function(){
	};

	var drawVideoWithWrapper = function(videoTag){
		var sources = SM.Video.HTML5.getSources(videoTag);
		if(sources.length > 0){
			var options = {};

			//Look for poster
			var poster = SM.Video.HTML5.getPoster(videoTag);
			if(typeof poster == "string"){
				options.poster = poster;
			}
			//Look for autoplay...
			options.timestamp = true;

			drawVideo(sources,options);
		}
	};

	var drawVideoWithUrl = function(url){
		var options = {};
		options.timestamp = true;
		drawVideo([{src: url}],options);
	};
	
	/**
	* Returns a video object prepared to draw.
	*/
	var drawVideo = function(sources,options,area,style){
		var current_area;
		if(area){
			current_area = area;
		}	else {
			current_area = SM.Editor.getCurrentArea();
		}
		current_area.attr('type','video');

		//Default options
		var posterUrl;
		var autoplay = false;
			
		//Replace defeault options if options hash is defined
		if(options){
			if(options['poster']){
				posterUrl = options['poster'];
			}
			if(options['autoplay']){
				autoplay = options['autoplay'];
			}
		}
			
		var videoTag = document.createElement('video');
		videoTag.setAttribute('class', "view_content_video");
		videoTag.setAttribute('controls', "controls");
		videoTag.setAttribute('preload', "metadata");
		if(typeof posterUrl === "string"){
			videoTag.setAttribute('poster', posterUrl);
		}
		videoTag.setAttribute('autoplayonslideenter',autoplay);
		if(style){
			videoTag.setAttribute('style', style);
		}

		$(current_area).html("");
		$(current_area).append(videoTag);

		//Insert sources after append video
		SM.Video.HTML5.addSourcesToVideoTag(sources,videoTag,{timestamp:true});

		SM.Editor.addDeleteButton($(current_area));

		SM.Editor.Tools.loadToolsForZone(current_area);
	};


	/*
	 * Renderer
	 */
	var renderVideoFromWrapper = function(videoTag,options){
		var sources = SM.Video.HTML5.getSources(videoTag);
		if(sources.length > 0){
			var options = options || {};
			//Look for poster
			var poster = SM.Video.HTML5.getPoster(videoTag);
			if(typeof poster == "string"){
				options.poster = poster;
			}
			return SM.Video.HTML5.renderVideoFromSources(sources,options);
		}
	};

	var renderVideoWithURL = function(url,options){
		return SM.Video.HTML5.renderVideoFromSources([{src: url}],options);
	};


	return {
		init 					: init,
		drawVideoWithUrl 		: drawVideoWithUrl,
		drawVideo 				: drawVideo,
		drawVideoWithWrapper	: drawVideoWithWrapper,
		renderVideoFromWrapper	: renderVideoFromWrapper,
		renderVideoWithURL		: renderVideoWithURL
	};

}) (SceneMaker, jQuery);
