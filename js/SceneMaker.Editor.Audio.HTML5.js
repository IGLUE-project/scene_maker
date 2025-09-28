SceneMaker.Editor.Audio.HTML5 = (function(SM,$,undefined){

	var init = function(){	
	};

	var drawAudioWithWrapper = function(audioTag){
		var sources = SM.Audio.HTML5.getSources(audioTag);
		if(sources.length > 0){
			var options = {};
			options.timestamp = true;
			drawAudio(sources,options);
		}
	};

	var drawAudioWithUrl = function(url){
		var options = {};
		options.timestamp = true;
		drawAudio([{src: url}],options);
	};

	var drawAudio = function(sources,options,area,style){
		var current_area;
		if(area){
			current_area = area;
		}	else {
			current_area = SM.Editor.getCurrentArea();
		}
		current_area.attr('type','audio');

		//Default options
		var autoplay = false;
			
		//Replace defeault options if options hash is defined
		if(options){
			if(options['autoplay']){
				autoplay = options['autoplay'];
			}
		}

		var audioTag = document.createElement('audio');
		audioTag.setAttribute('class', "view_content_audio");
		audioTag.setAttribute('controls', "controls");
		audioTag.setAttribute('preload', "metadata");
		audioTag.setAttribute('autoplayonslideenter',autoplay);
		if(style){
			audioTag.setAttribute('style', style);
		}
		
		$(current_area).html("");
		$(current_area).append(audioTag);

		//Insert sources after append audio
		SM.Audio.HTML5.addSourcesToAudioTag(sources,audioTag,{timestamp:true});

		SM.Editor.addDeleteButton($(current_area));

		SM.Editor.Tools.loadToolsForZone(current_area);
	};


	/*
	 * Renderer
	 */
	var renderAudioFromWrapper = function(audioTag,options){
		var sources = SM.Audio.HTML5.getSources(audioTag);
		if(sources.length > 0){
			var options = options || {};
			return SM.Audio.HTML5.renderAudioFromSources(sources,options);
		}
	};

	var renderAudioWithURL = function(url,options){
		return SM.Audio.HTML5.renderAudioFromSources([{src: url}],options);
	};


	return {
		init 						: init,
		drawAudioWithWrapper		: drawAudioWithWrapper,
		drawAudioWithUrl			: drawAudioWithUrl,
		drawAudio 					: drawAudio,
		renderAudioFromWrapper		: renderAudioFromWrapper,
		renderAudioWithURL			: renderAudioWithURL
	};

}) (SceneMaker, jQuery);
