VISH.Slides = (function(V,$,undefined){
	var currentScreenId;
	var currentViewId;
	
	var init = function(){
	};

	var getCurrentScreenId = function(){
		return currentScreenId;
	};

	var setCurrentScreenId = function(screenId){
		currentScreenId = screenId;
	};

	var getCurrentScreenNumber = function(){
		return $(getCurrentScreen()).attr("slidenumber");
	};

	var getCurrentScreen = function(){
		if(typeof currentScreenId === "undefined"){
			return undefined;
		} else {
			return $("#"+currentScreenId);
		}
	};

	var getCurrentViewId = function(){
		return currentViewId;
	};

	var getCurrentView = function(){
		if(typeof currentViewId === "undefined"){
			return undefined;
		} else {
			return $("#"+currentViewId);
		}
	};

	var getCurrentViewNumber = function(){
		return $(getCurrentView()).attr("slidenumber");
	};

	var getCurrentSlideId = function(){
		if(typeof currentViewId === "undefined"){
			return currentScreenId;
		} else {
			return currentViewId;
		}
	};

	var getCurrentSlide = function(){
		if(typeof currentViewId === "undefined"){
			return getCurrentScreen();
		} else {
			return getCurrentView();
		}
	};

	var getScreenWithNumber = function(screenNumber){
		return $("article[type='flashcard'][slidenumber='" + screenNumber + "']")[0];
	};

	var getViewWithNumber = function(screen,viewNumber){
		return $(screen).children("article[type='standard'][slidenumber='" + viewNumber + "']");
	};

	var getScreensQuantity = function(){
		return $("section.slides > article[type='flashcard']").length;
	};

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


	// Slide handling

	var goToScreen = function(screenId){
		var $screen = $("#" + screenId);
		if($screen.length > 0){
			//Close fancybox
			if($.fancybox){
				$.fancybox.close();
			}
			if(typeof currentScreenId !== "undefined"){
				V.EventsNotifier.notifyEvent(V.Constant.Event.onLeaveScreen,{screenId: currentScreenId});
			}
			currentScreenId = screenId;

			//Show current screen
			$("section.slides > article").removeClass("current");
			$screen.addClass('current');

			V.EventsNotifier.notifyEvent(V.Constant.Event.onEnterScreen,{screenId: screenId});
		}
	};

	var goToScreenWithNumber = function(screenNumber){
		return goToScreen($(getScreenWithNumber(screenNumber)).attr("id"));
	};

	var goToLastScreen = function(){
		goToScreen($("article[type='flashcard']").last().attr("id"));
	};


	var updateCurrentScreenId = function(){
		var screenNo = V.Utils.getScreenNumberFromHash();
		var screen = getScreenWithNumber(screenNo);
		if (typeof screen !== "undefined") {
			currentScreenId = $(screen).attr("id");
		} else {
			currentScreenId = $("article[type='flashcard']").first().attr("id");
		}
	};

	var onUpdateScreens = function(){
		//Update slide numbers
		$.each($('section.slides > article'), function(index, value) {
			$(value).attr("slidenumber",index+1);
		});
	};


	/* 
	 * Views management
	 */

	var isSubslide = function(slide){
		var parent = $(slide).parent()[0];
		if(parent){
			return (parent.tagName==="ARTICLE");
		} else {
			return false;
		}
	};

	var openSubslide = function(slide_id){
  		_onOpenSubslide(slide_id);
  		$("#" + slide_id).removeClass("hide_in_smartcard");
  		$("#" + slide_id).addClass("show_in_smartcard");
		V.EventsNotifier.notifyEvent(V.Constant.Event.onEnterScreen,{screenId: slide_id});	
	};

	var closeSubslide = function(slide_id){
  		_onCloseSubslide(slide_id);
  		$("#" + slide_id).removeClass("show_in_smartcard");
  		$("#" + slide_id).addClass("hide_in_smartcard");
		V.EventsNotifier.notifyEvent(V.Constant.Event.onLeaveScreen,{screenId: slide_id});
	};

	var _onOpenSubslide = function(subSlideId){
		curSubSlideId = subSlideId;
	};

	var _onCloseSubslide = function(){
		curSubSlideId = null;
	};

	return {	
			init          					: init,
			getCurrentScreenId				: getCurrentScreenId,
			setCurrentScreenId				: setCurrentScreenId,
			getCurrentScreenNumber			: getCurrentScreenNumber,
			getCurrentScreen 				: getCurrentScreen,
			getCurrentViewId				: getCurrentViewId,
			getCurrentView 					: getCurrentView,
			getCurrentViewNumber			: getCurrentViewNumber,
			getCurrentSlideId				: getCurrentSlideId,
			getCurrentSlide 				: getCurrentSlide,
			getScreenWithNumber				: getScreenWithNumber,
			getViewWithNumber				: getViewWithNumber,
			getScreensQuantity				: getScreensQuantity,
			getSlideType 					: getSlideType,
			goToScreen						: goToScreen,
			goToScreenWithNumber			: goToScreenWithNumber,
			goToLastScreen					: goToLastScreen,
			updateCurrentScreenId			: updateCurrentScreenId,
			onUpdateScreens					: onUpdateScreens,
			isSubslide						: isSubslide,
			openSubslide					: openSubslide,
			closeSubslide					: closeSubslide
	};

}) (VISH,jQuery);