SceneMaker.Slides = (function(SM,$,undefined){

	var init = function(){
	};


	/* Getters  */

	var getCurrentSlide = function(){
		var currentView = SM.View.getCurrentView();
		if((typeof currentView === "undefined") || (currentView === null)){
			return SM.Screen.getCurrentScreen();
		} else {
			return currentView;
		}
	};

	var getCurrentSlideNumber = function(){
		var currentViewNumber = SM.View.getCurrentViewNumber();
		if(typeof currentViewNumber !== "undefined"){
			return currentViewNumber;
		} else {
			return SM.Screen.getCurrentScreenNumber();
		}
	};

	/* Background  */

	var getSlideBackgroundImg = function(slide){
		var $slide = $(slide);
		var slideId = $slide.attr("id");
		return $slide.find("img.slide_background#" + slideId + "_background");
	};

	var getSlideBackground = function(slide){
		var $imgBackground = getSlideBackgroundImg(slide);
		if ($imgBackground.length > 0) {
			return $imgBackground.attr("src");
		} else {
			return undefined;
		}
	};

	var changeSlideBackground = function(slide,backgroundURL){
		var $slide = $(slide);
		if($slide.attr("type")!==SM.Constant.VIEW_CONTENT){
			var $imgBackground = getSlideBackgroundImg($slide);
			$imgBackground.attr("src",backgroundURL);
		}
	};


	/* Slide types  */

	var getSlideType = function(slideEl){
		if ((slideEl)&&(slideEl.tagName==="ARTICLE")){
			//slide in DOM element
			return $(slideEl).attr("type");
		} else if ((typeof slideEl == "object")&&(slideEl.length === 1)&&(slideEl[0].tagName==="ARTICLE")){
			//slide in DOM element, passed as a jQuery selector
			return $(slideEl).attr("type");
		} else if ((typeof slideEl == "object")&&(typeof slideEl.type == "string")){
			//slide in JSON
			return slideEl.type;
		} else {
			//slideEl is not a slide
			return null;
		}
	};

	var isScreen = function(obj){
		var type;
		if(typeof obj == "string"){
			type = obj;
		} else {
			type = $(obj).attr("type");
		}
		return (type === SM.Constant.SCREEN);
	};

	var isView = function(obj){
		var type;
		if(typeof obj == "string"){
			type = obj;
		} else {
			type = $(obj).attr("type");
		}
		return ((type === SM.Constant.VIEW_IMAGE)||(type === SM.Constant.VIEW_CONTENT));
	};


	/* Slide events */

	var triggerSlideEnterEvent = function(slideId) {
		var el = $("#" +slideId)[0];
		if(typeof el === "undefined"){
			return
		};
		if(document.createEvent){
			var evt = document.createEvent('Event');
			evt.initEvent('slideenter', true, true); // event type,bubbling,cancelable
			el.dispatchEvent(evt);
		} else if(document.createEventObject){
			//IE 8 and below
			var evt = document.createEventObject();
			el.fireEvent('onslideenter',evt);
		}
	};

	var triggerSlideLeaveEvent = function(slideId) {
		var el = $("#" + slideId)[0];
		if(typeof el === "undefined"){
			return
		};
		if(document.createEvent){
			var evt = document.createEvent('Event');
			evt.initEvent('slideleave', true, true);
			el.dispatchEvent(evt);
		} else if(document.createEventObject){
			//IE 8 and below
			var evt = document.createEventObject();
			el.fireEvent('onslideleave',evt);
		}
	};

	return {
			init          				: init,
			getCurrentSlide				: getCurrentSlide,
			getCurrentSlideNumber		: getCurrentSlideNumber,
			getSlideBackgroundImg		: getSlideBackgroundImg,
			getSlideBackground			: getSlideBackground,
			changeSlideBackground		: changeSlideBackground,
			getSlideType 				: getSlideType,
			isScreen					: isScreen,
			isView						: isView,
			triggerSlideEnterEvent		: triggerSlideEnterEvent,
			triggerSlideLeaveEvent		: triggerSlideLeaveEvent
	};

}) (SceneMaker,jQuery);