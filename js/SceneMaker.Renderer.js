SceneMaker.Renderer = (function(SM,$,undefined){
	
	var init  = function(){
	}

	var renderScreen = function(screenJSON){
		var screenDOM = _renderScreen(screenJSON);
		if(screenDOM){
			$('section.slides').append($(screenDOM));
			SM.Marker.drawSlideWithMarkers(screenJSON);
			//Draw views with type VIEWS_IMAGE
			var viewsL = screenJSON.views.length;
			for(var i=0; i<viewsL; i++){
				var viewJSON = screenJSON.views[i];
				SM.Marker.drawSlideWithMarkers(viewJSON);
			}
		}
	};

	var _renderScreen = function(screenJSON){
		var allViews = "";
		var viewsL = screenJSON.views.length;
		for(var i=0; i<viewsL; i++){
			var view = screenJSON.views[i];
			allViews += _renderView(view);
		}
		return $("<article type='"+screenJSON.type+"' id='"+screenJSON.id+"'>"+allViews+"</article>");
	};

	var _renderView = function(view){
		if(view.type === SM.Constant.VIEW_CONTENT){
			return _renderViewContent(view);
		} else if(view.type === SM.Constant.VIEW_IMAGE){
			return _renderViewImage(view);
		}
	};

	var _renderViewImage = function(view){
		var classes = "hide_in_screen";
		var buttons = "<div class='close_view' id='close"+view.id+"'></div>";
		return "<article class='"+ classes +"' type='"+SM.Constant.VIEW_IMAGE+"' id='"+view.id+"'>"+ buttons +"</article>";
	};

	var _renderViewContent = function(view){
		var content = "";
		var classes = "hide_in_screen";
		var buttons = "<div class='close_view' id='close"+view.id+"'></div>";

		var elL = view.elements.length;
		for(var i=0; i<elL; i++){
			var element = view.elements[i];

			if(element.type === SM.Constant.TEXT){
				content += _renderText(element);
			} else if(element.type === SM.Constant.IMAGE){
				content += _renderImage(element);
			} else if(element.type === SM.Constant.VIDEO){
				content += _renderHTML5Video(element);
			} else if(element.type === SM.Constant.AUDIO){
				content += _renderHTML5Audio(element);
			} else if(element.type === SM.Constant.OBJECT){
				content += _renderObject(element);
				classes += " object";
			} else {
				content += _renderEmpty(element);
			}
		}

		return "<article class='"+ classes +"' type='"+SM.Constant.VIEW_CONTENT+"' id='"+view.id+"'>"+ buttons + content+"</article>";
	};


	/*
	 * Render elements
	 */

	var _renderEmpty = function(element){
		return "<div id='"+element['id']+"' class='view_content_text'></div>";
	};

	var _renderText = function(element){
		return "<div id='"+element['id']+"' class='view_content_text textArea'>"+element['body']+"</div>";
	};
	
	var _renderImage = function(element){
		var div = $("<div id='"+element['id']+"' class='view_content_image_wrapper'></div>");
		var img = $("<img class='view_content_image' src='"+element['body']+"' style='"+element['style']+"' />");

		if(element['hyperlink']){
			var a = $("<a href='" + element['hyperlink'] + "' target='blank_'></a>");
			$(a).append(img);
			$(div).append(a);
		} else {
			$(div).append(img);
		}
		
		return SM.Utils.getOuterHTML(div);
	};
	
	var _renderHTML5Video = function(videoJSON){
		var rendered = "<div id='"+videoJSON['id']+"' class='view_content_video_wrapper'>";
		var video = SM.Video.HTML5.renderVideoFromJSON(videoJSON,{id: SM.Utils.getId(videoJSON['id'] + "_video"),extraClasses: ['view_content_video'], timestamp: true});
		rendered = rendered + video + "</div>";
		return rendered;
	};

	var _renderHTML5Audio = function(audioJSON){
		var rendered = "<div id='"+audioJSON['id']+"' class='view_content_audio_wrapper'>";
		var audio = SM.Audio.HTML5.renderAudioFromJSON(audioJSON,{id: SM.Utils.getId(audioJSON['id'] + "_audio"),extraClasses: ['view_content_audio'], timestamp: true});
		rendered = rendered + audio + "</div>";
		return rendered;
	};
	
	var _renderObject = function(element){
		var objectSettings = element.settings || {};
		var loadingObjectClass = (objectSettings.unloadObject===false) ? "unloadableObject" : "";
		
		var objectInfo = SM.Object.getObjectInfo(element.body);
		switch(objectInfo.type){
			case SM.Constant.MEDIA.YOUTUBE_VIDEO:
				return SM.Video.Youtube.renderVideoFromJSON(element,{extraClasses: "objectelement youtubeelement " + loadingObjectClass});
			case SM.Constant.MEDIA.PDF:
				return SM.Object.PDF.renderPDFFromJSON(element,{extraClasses: loadingObjectClass, source: objectInfo.source});
			default:
				var $body = $(element['body']);
				var bodySrc = $body.attr("src");
				if(typeof bodySrc !== "undefined"){
					bodySrc = SM.Utils.checkWebUrl(bodySrc);
					if((objectInfo.type === SM.Constant.MEDIA.REUSABLE_PUZZLE_INSTANCE)||(objectSettings.addPreviewParamToObject === true)){
						bodySrc = SM.Utils.addParamToUrl(bodySrc,"escapp_preview",(""+SM.Status.isPreview()));
					}
					$body.attr("src",bodySrc);
				}
				if(objectInfo.type === SM.Constant.MEDIA.REUSABLE_PUZZLE_INSTANCE){
					$body.attr("reusablepuzzleinstance","true");
				}
				var body = SM.Utils.getOuterHTML($body);
				var style = (element['style'])? element['style'] : "";
				return "<div id='"+ element['id'] +"' class='objectelement " + loadingObjectClass + "' objectStyle='" + style + "' objectWrapper='" + body + "'>" + "" + "</div>";
		}
	};

	return {
		init        		: init,
		renderScreen 		: renderScreen
	};

}) (SceneMaker,jQuery);

