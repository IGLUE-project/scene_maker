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
		$currentArea = $(current_area);
		$currentArea.attr('type','audio');

		//Default options
		var posterUrl;
		if(options){
			if(options['poster']){
				posterUrl = options['poster'];
			}
		}

		var audioTag = document.createElement('audio');
		audioTag.setAttribute('class', "view_content_audio");
		audioTag.setAttribute('controls', "controls");
		audioTag.setAttribute('preload', "metadata");
		if(style){
			audioTag.setAttribute('style', style);
		}
		
		$currentArea.html("");
		$currentArea.append(audioTag);

		//Insert sources after append audio
		SM.Audio.HTML5.addSourcesToAudioTag(sources,audioTag,{timestamp:true});

		if(typeof posterUrl === "string"){
			//audioTag.setAttribute('poster', posterUrl);
			var $imgAudioPoster = $("<img>", {
				class: "audio_poster",
				src: posterUrl
			});
			$currentArea.prepend($imgAudioPoster);
		}

		SM.Editor.addDeleteButton($currentArea);

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
