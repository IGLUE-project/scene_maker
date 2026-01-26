SceneMaker.Editor.Caption = (function(SM,$,undefined){
	var initialized = false;
	var hiddenLinkToInitCaptionFancybox;

	var init = function(){
		if(initialized) return;
		initialized = true;
		
		hiddenLinkToInitCaptionFancybox = $('<a href="#caption_fancybox" style="display:none"></a>');
		$(hiddenLinkToInitCaptionFancybox).fancybox({
			'autoDimensions' : false,
			'height': 690,
			'width': 920,
			'scrolling': 'no',
			'showCloseButton': false,
			'padding' : 0,
			"onStart"  : function(data){
				_onStartCaptionFancybox();
			},
			"onComplete" : function(data){
			},
			"onClosed"  : function(data){
			}
		});
	};

	var _onStartCaptionFancybox = function(){
		var slideId = $(SM.Slides.getCurrentSlide()).attr("id");
		var slideData = SM.Editor.Marker.getSlideData();
		var caption = {};
		if((typeof slideData[slideId] !== "undefined")&&(typeof slideData[slideId].caption !== "undefined")){
			caption = slideData[slideId].caption;
		}

		//Text
		if(typeof caption.text === "string"){
			$("#captionText").val(caption.text);
		} else {
			$("#captionText").val("");
		}

		//Mode
		if(typeof caption.mode === "string"){
			$("#captionMode").val(caption.mode);
		} else {
			$("#captionMode").val("minimizable");
		}
	};

	var addCaption = function(){
		$(hiddenLinkToInitCaptionFancybox).trigger("click");
	};

	var onCaptionDone = function(event){
		var slideId = $(SM.Slides.getCurrentSlide()).attr("id");

		var caption = {};
		caption.text = $("#captionText").val();
		caption.mode = $("#captionMode").val();

		var slideData = SM.Editor.Marker.getSlideData();
		if(typeof slideData[slideId] === "undefined"){
			slideData[slideId] = SM.Editor.Marker.getDefaultSlideConfig();
		}
		slideData[slideId].caption = caption;
		SM.Editor.Marker.setSlideData(slideData);

		$.fancybox.close();
	};

	var loadCaption = function(slideId,captionJSON){
		if(_isValidCaption(captionJSON) === false){
			return;
		}
		var slideData = SM.Editor.Marker.getSlideData();
		if(typeof slideData[slideId] === "undefined"){
			slideData[slideId] = SM.Editor.Marker.getDefaultSlideConfig();
		}
		slideData[slideId].caption = captionJSON;
		SM.Editor.Marker.setSlideData(slideData);
	};

	var saveCaption = function(slideJSON){
		var slideData = SM.Editor.Marker.getSlideData();
		if((typeof slideData[slideJSON.id] !== "undefined")&&(_isValidCaption(slideData[slideJSON.id].caption))){
			slideJSON.caption = slideData[slideJSON.id].caption;
		}
		return slideJSON;
	};

	var _isValidCaption = function(caption){
		if(typeof caption !== "object"){
			return false;
		}
		if(typeof caption.text !== "string"){
			return false;
		}
		// if(caption.text.trim() === ""){
		// 	return false;
		// }
		return true;
	};

	return {
		init 			: init,
		addCaption 		: addCaption,
		onCaptionDone	: onCaptionDone,
		loadCaption		: loadCaption,
		saveCaption		: saveCaption
	};

}) (SceneMaker, jQuery);