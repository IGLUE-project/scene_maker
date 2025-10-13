SceneMaker.Editor.Object = (function(SM,$,undefined){
	var contentToAdd = null;
	var urlDivId = "tab_object_from_url_content";
	var urlInputId = "object_web_input";

	var _hiddenLinkToInitObjectSettings;
		
	var init = function(){
		SM.Editor.Object.Web.init();
		SM.Editor.Object.GoogleDOC.init();
		SM.Editor.Object.PDF.init();

		//Load from URL (embed)
		$("#" + urlDivId + " .previewButton").click(function(event){
			if(SM.Validator.validateObject($("#" + urlInputId).val())){
				contentToAdd = SM.Editor.Utils.autocompleteUrls($("#" + urlInputId).val());
				drawPreview(urlDivId, contentToAdd);
			}
		});

		//Object Settings
		_hiddenLinkToInitObjectSettings = $('<a href="#objectSettings_fancybox" style="display:none"></a>');
		$(_hiddenLinkToInitObjectSettings).fancybox({
			'autoDimensions' : false,
			'height': 400,
			'width': 400,
			'scrolling': 'no',
			'showCloseButton': false,
			'padding' : 0,
			"onStart"  : function(data){
				_onStartObjectSettingsFancybox();
			},
			"onComplete" : function(data){
			},
			"onClosed"  : function(data){
			}
		});
	};
	
	var onLoadTab = function(){
		contentToAdd = null;
		resetPreview(urlDivId);
		$("#" + urlInputId).val("");
	};
	
	var drawPreview = function(divId,src,options){
		$("#" + divId + " .previewimgbox").css("background-image","none");
		$("#" + divId + " .previewimgbox img.imagePreview").remove();
		$("#" + divId + " .previewimgbox .objectPreview").remove();
		
		var wrapper = $(renderObjectPreview(src));
		$("#" + divId + " .previewimgbox").append(wrapper);
		_loadSources(src,wrapper);
		$("#" + divId + " .previewimgbox button").show();
	};

	var _loadSources = function(object,tag){
		var objectInfo = SM.Object.getObjectInfo(object);
		if((objectInfo.wrapper===SM.Constant.WRAPPER.VIDEO)||((objectInfo.wrapper===null)&&(objectInfo.type===SM.Constant.MEDIA.HTML5_VIDEO))){
			var sources = (typeof objectInfo.source == "object") ? objectInfo.source : [{src: objectInfo.source}];
			SM.Video.HTML5.addSourcesToVideoTag(sources,tag,{timestamp:true});
		} else if((objectInfo.wrapper===SM.Constant.WRAPPER.AUDIO)||((objectInfo.wrapper===null)&&(objectInfo.type===SM.Constant.MEDIA.HTML5_AUDIO))){
			var sources = (typeof objectInfo.source == "object") ? objectInfo.source : [{src: objectInfo.source}];
			SM.Audio.HTML5.addSourcesToAudioTag(sources,tag,{timestamp:true});
		}
	};
	
	var resetPreview = function(divId){
		$("#" + divId + " .previewimgbox button").hide();
		$("#" + divId + " .previewimgbox img.imagePreview").remove();
		$("#" + divId + " .previewimgbox .objectPreview").remove();
		$("#" + divId + " .previewimgbox").css("background-image", "");
	};
	
	var drawPreviewElement = function(){
		drawPreviewObject(contentToAdd);
	};
	
	var drawPreviewObject = function(content,options){
		if(content){
			drawObject(content,options);
			$.fancybox.close();
		}
	};



	///////////////////////////////////////
	/// OBJECT RESIZING
	///////////////////////////////////////
	
	/*
	* Resize object and its wrapper automatically
	*/
	var resizeObject = function(id,newWidth){
		var parent = $("#" + id).parent();
		var aspectRatio = $("#" + id).width()/$("#" + id).height();

		var newWrapperHeight = Math.round(newWidth/aspectRatio);
		var newWrapperWidth = Math.round(newWidth);
		$(parent).width(newWrapperWidth);
		$(parent).height(newWrapperHeight);

		var newHeight = newWrapperHeight;
		var newWidth = newWrapperWidth;
		
		$("#" + id).width(newWidth);
		$("#" + id).height(newHeight);
	};
	

	///////////////////////////////////////
	/// OBJECT DRAW: PREVIEWS
	///////////////////////////////////////
	
	var renderObjectPreview = function(object, options){
		var objectInfo = SM.Object.getObjectInfo(object);
		var objectType = objectInfo.type;
		
		if((options)&&(typeof options.forceType === "string")){
			objectType = options.forceType;
		}

		if(objectType === SM.Constant.MEDIA.REUSABLE_PUZZLE_INSTANCE){
			return SM.Editor.Object.Web.generatePreviewWrapperForReusablePuzzleInstance(objectInfo.source);
		}

		switch (objectInfo.wrapper){
			case null:
				//Draw object preview from source
				switch (objectType) {
					case SM.Constant.MEDIA.IMAGE:
						return "<img class='imagePreview' src='" + object + "'></img>";
					case SM.Constant.MEDIA.PDF:
						return SM.Editor.Object.PDF.generatePreviewWrapper(object);
					case SM.Constant.MEDIA.DOC:
					case SM.Constant.MEDIA.PPT:
						return SM.Editor.Object.GoogleDOC.generatePreviewWrapper(object);
					case SM.Constant.MEDIA.YOUTUBE_VIDEO:
						return SM.Editor.Video.Youtube.generatePreviewWrapperForYoutubeVideoUrl(object);
					case SM.Constant.MEDIA.HTML5_VIDEO:
						return SM.Editor.Video.HTML5.renderVideoWithURL(object,{loadSources: false, extraClasses: ["objectPreview"]});
					case SM.Constant.MEDIA.HTML5_AUDIO:
						return SM.Editor.Audio.HTML5.renderAudioWithURL(object,{loadSources: false, extraClasses: ["objectPreview"]});
					case SM.Constant.MEDIA.WEB:
						return SM.Editor.Object.Web.generatePreviewWrapperForWeb(object);
					default:
						SM.Debugging.log("Unrecognized object source type");
				}
				break;
			case SM.Constant.WRAPPER.EMBED:
				return _genericWrapperPreview(object);
			case SM.Constant.WRAPPER.OBJECT:
				return _genericWrapperPreview(object);
			case SM.Constant.WRAPPER.IFRAME:
				return _genericWrapperPreview(object);
			case SM.Constant.WRAPPER.VIDEO:
				return SM.Editor.Video.HTML5.renderVideoFromWrapper(object,{loadSources: false, extraClasses: ["objectPreview"]});
			case SM.Constant.WRAPPER.AUDIO:
				return SM.Editor.Audio.HTML5.renderAudioFromWrapper(object,{loadSources: false, extraClasses: ["objectPreview"]});
			default:
				SM.Debugging.log("Unrecognized object wrapper: " + objectInfo.wrapper);
				break;
		}
	};
	
	var _genericWrapperPreview = function(object){
		var wrapperPreview = $(object);
		$(wrapperPreview).addClass('objectPreview');
		$(wrapperPreview).attr('wmode','opaque');
		$(wrapperPreview).removeAttr('width');
		$(wrapperPreview).removeAttr('height');
		if(typeof $(wrapperPreview).attr("src") != "undefined"){
			$(wrapperPreview).attr("src",SM.Utils.checkObjectUrl($(wrapperPreview).attr("src")));
		}
		//Force scrolling auto if the wrapper has specified the scrolling param
		if(typeof $(wrapperPreview).attr("scrolling") != "undefined"){
			$(wrapperPreview).attr("scrolling","auto");
		}
		return wrapperPreview;
	};
	
	
	
	///////////////////////////////////////
	/// OBJECT DRAW: Draw objects in slides
	///////////////////////////////////////
	
   /**
	* Returns a object prepared to draw.
	* param options.area: optional param indicating the area to add the object, used for editing scenes
	* param options.style: optional param with the style, used in editing scene
	*/
	var drawObject = function(object,options){
		if(!SM.Validator.validateObject(object)){
			return;
		}

		//Defaults
		options = (typeof options == "undefined" ? {} : options);
		var objectInfo = SM.Object.getObjectInfo(object);
		var current_area = SM.Editor.getCurrentArea();
		var object_style = "";

		if(options){
			if(options.area){
				current_area = options.area;
			}
			if(options.style){
				object_style = options.style;
			}
			if(options.forceType){
				objectInfo.type = options.forceType;
			}
		}

		if(objectInfo.type === SM.Constant.MEDIA.REUSABLE_PUZZLE_INSTANCE){
			return drawObject(SM.Editor.Object.Web.generateWrapperForReusablePuzzleInstance(objectInfo.source),options);
		}

		switch (objectInfo.wrapper) {
			case null:
				//Draw object from source
				switch (objectInfo.type) {
					case SM.Constant.MEDIA.IMAGE:
						SM.Editor.Image.drawImage(object);
						break;
					case SM.Constant.MEDIA.PDF:
						options.wrapperGenerated = true;
						return drawObject(SM.Editor.Object.PDF.generateWrapper(objectInfo.source),options);
					case SM.Constant.MEDIA.DOC:
					case SM.Constant.MEDIA.PPT:
						return drawObject(SM.Editor.Object.GoogleDOC.generateWrapper(object),options);
					case SM.Constant.MEDIA.YOUTUBE_VIDEO:
						return drawObject(SM.Editor.Video.Youtube.generateWrapperForYoutubeVideoUrl(object),options);
					case SM.Constant.MEDIA.HTML5_VIDEO:
						SM.Editor.Video.HTML5.drawVideoWithUrl(object);
						break;
					case SM.Constant.MEDIA.HTML5_AUDIO:
						SM.Editor.Audio.HTML5.drawAudioWithUrl(object);
						break;
					case SM.Constant.MEDIA.WEB:
						return drawObject(SM.Editor.Object.Web.generateWrapperForWeb(object),options);
					default:
						SM.Debugging.log("Unrecognized object source type: " + objectInfo.type);
						break;
				}
				break;
			case SM.Constant.WRAPPER.EMBED:
			case SM.Constant.WRAPPER.OBJECT:
			case SM.Constant.WRAPPER.IFRAME:
				if(([SM.Constant.MEDIA.PDF].indexOf(objectInfo.type)!=-1)&&(!options.wrapperGenerated)){
					return drawObject(objectInfo.source,options);
				}
				drawObjectWithWrapper(object, current_area, object_style);
				break;
			case SM.Constant.WRAPPER.VIDEO:
				SM.Editor.Video.HTML5.drawVideoWithWrapper(object);
				break;
			case SM.Constant.WRAPPER.AUDIO:
				SM.Editor.Audio.HTML5.drawAudioWithWrapper(object);
				break;
			default:
				SM.Debugging.log("Unrecognized object wrapper: " + objectInfo.wrapper);
				break;
		}

		//Finally load the tools in the toolbar
		SM.Editor.Tools.loadToolsForZone(current_area);
	};
	
	var drawObjectWithWrapper = function(wrapper, current_area, style){
		current_area.attr('type', 'object');
		var wrapperDiv = document.createElement('div');
		if(style){
			wrapperDiv.setAttribute('style', style);
		}
		$(wrapperDiv).addClass('object_wrapper');

		var wrapperTag = $(wrapper);
		$(wrapperTag).css('pointer-events', "none");
		$(wrapperTag).attr('class', "view_content_object");
		$(wrapperTag).attr('wmode', "opaque");
		if(typeof $(wrapperTag).attr("scrolling") !== "undefined"){
			$(wrapperTag).attr("scrolling","auto");
		}

		$(current_area).html("");
		$(current_area).append(wrapperDiv);

		SM.Editor.addDeleteButton($(current_area));
			
		$(wrapperDiv).append(wrapperTag);

		_adjustWrapperOfObject(wrapperTag, current_area);

		//Load toolbar
		SM.Editor.Tools.loadToolbarForObject(wrapper);
	};

	var _adjustWrapperOfObject = function($object, current_area){
		var maxWidth = current_area.width();
		var maxHeight = current_area.height();
		var width = $object.width();
		var height = $object.height();
		var proportion = height/width;

		if(width > maxWidth){
			$object.width(maxWidth);
			$object.height(width*proportion);
			width = maxWidth;
			height = $object.height();
		}

		if(height > maxHeight){
			$object.height(maxHeight);
			$object.width(height/proportion);
			width = $object.width();
			height = maxHeight;
		}

		var wrapper = $object.parent();
		if($(wrapper).hasClass("object_wrapper")){
			$(wrapper).height($object.height());
			$(wrapper).width($object.width());
		}
	};

	/////////////////
	// Object Settings
	/////////////////

	var showObjectSettings = function(){
		$(_hiddenLinkToInitObjectSettings).trigger("click");
	};

	var _onStartObjectSettingsFancybox = function(){
		var $oSF = $("#objectSettings_fancybox");

		//Get object
		var $area = $(SM.Editor.getCurrentArea());
		var $object = $area.find("div.object_wrapper").children().first();
		var isReusablePuzzleInstance = ($object.attr("reusablepuzzleinstance") === "true");
		$oSF.find("input[type='hidden'][name='elId']").val($area.attr("id"));
		
		//Load Settings
		var oSettings = {};
		var unloadObject = (isReusablePuzzleInstance===false);
		var addEscappCredentialsToObject = isReusablePuzzleInstance;
		
		try {
			oSettings = JSON.parse($area.attr("elSettings"));
		} catch(e){}

		if(typeof oSettings.unloadObject !== "undefined"){
			unloadObject = oSettings.unloadObject;
		}
		if(typeof oSettings.addEscappCredentialsToObject !== "undefined"){
			addEscappCredentialsToObject = oSettings.addEscappCredentialsToObject;
		}

		//Fill and reset form
		var $unloadObjectCheckbox = $oSF.find("input[type='checkbox'][name='unloadObject']");
		$unloadObjectCheckbox.prop('checked', unloadObject);
		var $addEscappCredentialsToObjectCheckbox = $oSF.find("input[type='checkbox'][name='addEscappCredentialsToObject']");
		$addEscappCredentialsToObjectCheckbox.prop('checked', addEscappCredentialsToObject);
		$addEscappCredentialsToObjectCheckbox.attr("defaultvalue",isReusablePuzzleInstance);

		SM.Editor.Utils.enableElementSettingsField($unloadObjectCheckbox,true);
		SM.Editor.Utils.enableElementSettingsField($addEscappCredentialsToObjectCheckbox,(isReusablePuzzleInstance===false));
	};

	var onObjectSettingsDone = function(){
		var $oSF = $("#objectSettings_fancybox");

		//Get area and object
		var areaId = $oSF.find("input[type='hidden'][name='elId']").val();
		var $area = $("#"+areaId);
		var $object = $area.find("div.object_wrapper").children().first();

		//Get previous settings
		var oSettings = {};
		try {
			oSettings = JSON.parse($(area).attr("elsettings"));
		} catch(e) {}
		
		//Get new settings
		oSettings.unloadObject = $oSF.find("input[type='checkbox'][name='unloadObject']").is(":checked");
		oSettings.addEscappCredentialsToObject = $oSF.find("input[type='checkbox'][name='addEscappCredentialsToObject']").is(":checked");

		//Save Settings
		var oSSerialized = JSON.stringify(oSettings);
		$area.attr("elSettings",oSSerialized);

		//Apply settings
		var objectURL = $object.attr("src");
		//var objectURL = oSettings.url;
		if(oSettings.addEscappCredentialsToObject){
			objectURL = SM.Utils.addEscappCrendentialsToUrl(objectURL);
		} else {
			objectURL = SM.Utils.removeEscappCrendentialsFromUrl(objectURL);
		}

		$object.attr("src",objectURL);

		$.fancybox.close();
	};
	
	
	return {
		init							: init,
		onLoadTab 						: onLoadTab,
		drawObject						: drawObject,
		renderObjectPreview 			: renderObjectPreview,
		resizeObject 					: resizeObject,
		drawPreview 					: drawPreview,
		resetPreview 					: resetPreview,
		drawPreviewElement				: drawPreviewElement,
		drawPreviewObject				: drawPreviewObject,
		showObjectSettings				: showObjectSettings,
		onObjectSettingsDone			: onObjectSettingsDone
	};

}) (SceneMaker, jQuery);
