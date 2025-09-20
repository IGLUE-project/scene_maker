SceneMaker.Slides = (function(SM,$,undefined){
	// Array of screen DOM elements
	var _sceneScreens;
	// Pointer to the current screen. Index of the _sceneScreens array.
	var _currentScreenIndex;
	//Pointer to the id of the current view.
	var _currentViewId = null;
	

	var init = function(){
	};

	var updateScreens = function(){
		var screens = $('section.slides > article');
		setScreens(screens);
		screens.removeClass("current");
		$(getScreenWithNumber(_currentScreenIndex+1)).addClass('current');
	};

	var getScreens = function(){
		return _sceneScreens;
	};

	var setScreens = function(newScreens){
		_sceneScreens = newScreens;

		//Update slidenumber param
		$.each(_sceneScreens, function(index, value) {
			$(value).attr("slidenumber",index+1);
		});
	};

	var getCurrentScreen = function(){
		return _sceneScreens[_currentScreenIndex];
	};

	var getCurrentView = function(){
		if(SM.Editing){
			return SM.Editor.Screen.getCurrentView();
		}

		if(_currentViewId === null){
			return null;
		} else {
			return $("#"+_currentViewId);
		}
	};

	var getCurrentSlide = function(){
		var currentView = getCurrentView();
		if((typeof currentView == "undefined") || (currentView === null)){
			return getCurrentScreen();
		} else {
			return currentView;
		}
	};

	var getCurrentScreenNumber = function(){
		return _currentScreenIndex+1;
	};

	var setCurrentScreenNumber = function(currentScreenNumber){
		_setCurrentScreenIndex(currentScreenNumber-1);
	};

	var _setCurrentScreenIndex = function(newIndex){
		_currentScreenIndex = newIndex;
	};

	var getCurrentViewNumber = function(){
		var currentView = getCurrentView();
		if((typeof currentView == "undefined") || (currentView === null)){
			return undefined;
		}
		var currentViewNumber = $(currentView).attr("slidenumber");
		if(typeof currentViewNumber == "string"){
			try {
				return parseInt(currentViewNumber);
			} catch(err) {
				return undefined;
			}
		}
	};

	var getCurrentSlideNumber = function(){
		var currentView = getCurrentView();
		if((typeof currentView == "undefined") || (currentView === null)){
			return getCurrentViewNumber();
		} else {
			return getCurrentScreenNumber();
		}
	};

	var getScreenWithNumber = function(slideNumber){
		var no = slideNumber-1;
		if ((no < 0) || (no >= _sceneScreens.length)) {
			return null;
		} else {
			return _sceneScreens[no];
		}
	};

	var getViewWithNumber = function(screen,viewNumber){
		return $(screen).children("article[slidenumber='" + viewNumber + "']");
	};

	var getNumberOfSlide = function(slide){
		if(_sceneScreens){
			var result = 0;
			$.each(_sceneScreens, function(index, value) { 
		  		if($(value).attr("id")==$(slide).attr("id")){
		  			result = index + 1;
		  			return;
		  		}
			});
			return result;
		} else {
			return 0;
		}
	};

	var getScreensQuantity = function(){
		return $('section.slides > article').length;
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

	var isCurrentFirstSlide = function(){
		return _currentScreenIndex===0;
	};

	var isCurrentLastSlide = function(){
		return _currentScreenIndex===_sceneScreens.length-1;
	};

	var updateCurrentScreenFromHash = function() {
		var screenNo = SM.Utils.getScreenNumberFromHash();
		if (screenNo) {
			setCurrentScreenNumber(screenNo);
		} else {
			//Start in 1 (first screen)
			setCurrentScreenNumber(1);
		}
	};


	/* Slide events */

	var triggerEnterEvent = function(slideNumber) {
		var el = getScreenWithNumber(slideNumber);
		if (!el) {
			return;
		}
		triggerEnterEventById(el.id);
	};

	var triggerLeaveEvent = function(slideNumber) {
		var el = getScreenWithNumber(slideNumber);
		if (!el) {    
			return;
		}
		triggerLeaveEventById(el.id);
	};

	var triggerEnterEventById = function(slide_id) {
		var el = $("#" +slide_id)[0];

		if(typeof el == "undefined"){
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

	var triggerLeaveEventById = function(slide_id) {
		var el = $("#" + slide_id)[0];

		if(typeof el == "undefined"){
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


   /* Screen movement */

	var forwardOneScreen = function(event){
		_moveScreens(1);
	};

	var backwardOneScreen = function(){
		_moveScreens(-1);
	};

	var _moveScreens = function(n){
		var no = _currentScreenIndex+n+1;
		no = Math.min(Math.max(1,no),_sceneScreens.length);
		goToScreenWithNumber(no);
	};

	var goToScreenWithNumber = function(no,ignoreCurrentScreenNumber){
		if((ignoreCurrentScreenNumber!== true && no === getCurrentScreenNumber())||(no > _sceneScreens.length)||(no <= 0)){
			//Do nothing
			return;
		};

		//Close fancybox
		if((!SM.Editing)&&($.fancybox)){
			$.fancybox.close();
		}

		_goToScreenWithNumber(no);
	};

	var _goToScreenWithNumber = function(no){
		var nextScreenIndex = no - 1;
		if ((nextScreenIndex < _sceneScreens.length)&&(nextScreenIndex >= 0)) {
			triggerLeaveEvent(_currentScreenIndex+1);
			_setCurrentScreenIndex(nextScreenIndex);
			updateScreens();
			triggerEnterEvent(_currentScreenIndex+1);
		}
	};
  
	var goToLastScreen = function(){
		goToScreenWithNumber(_sceneScreens.length);
	};


	/* Slide types  */
	
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


	/* 
	 * Views management
	 */

	var openView = function(view_id){
		var currentView = getCurrentView();
		if((typeof currentView !== "undefined")&&(currentView !== null)){
			var currentViewId = $(currentView).attr("id");
			if(view_id === currentViewId){
				return;
			} else {
				closeView(currentViewId);
			}
		}

		_currentViewId = view_id;
		$("#" + view_id).removeClass("hide_in_screen");
		$("#" + view_id).addClass("show_in_screen");
		triggerEnterEventById(view_id);	
	};

	var closeView = function(view_id){
		_currentViewId = null;
		$("#" + view_id).removeClass("show_in_screen");
		$("#" + view_id).addClass("hide_in_screen");
		triggerLeaveEventById(view_id);	
	};


	return {	
			init          				: init,
			updateScreens				: updateScreens,
			updateCurrentScreenFromHash	: updateCurrentScreenFromHash,
			getScreens 					: getScreens,
			setScreens					: setScreens,
			getCurrentScreen 			: getCurrentScreen,
			getCurrentView 				: getCurrentView,
			getCurrentSlide				: getCurrentSlide,
			getCurrentScreenNumber		: getCurrentScreenNumber,
			setCurrentScreenNumber		: setCurrentScreenNumber,
			getCurrentViewNumber		: getCurrentViewNumber,
			getCurrentSlideNumber		: getCurrentSlideNumber,
			getScreenWithNumber			: getScreenWithNumber,
			getViewWithNumber			: getViewWithNumber,
			getNumberOfSlide			: getNumberOfSlide,
			getScreensQuantity			: getScreensQuantity,
			getSlideType 				: getSlideType,
			isCurrentFirstSlide			: isCurrentFirstSlide,
			isCurrentLastSlide			: isCurrentLastSlide,
			forwardOneScreen			: forwardOneScreen,
			backwardOneScreen			: backwardOneScreen,	
			goToScreenWithNumber		: goToScreenWithNumber,
			goToLastScreen				: goToLastScreen,
			isScreen					: isScreen,
			isView						: isView,
			openView					: openView,
			closeView					: closeView,
			triggerEnterEvent 			: triggerEnterEvent,
			triggerEnterEventById		: triggerEnterEventById,
			triggerLeaveEvent 			: triggerLeaveEvent,
			triggerLeaveEventById		: triggerLeaveEventById
	};

}) (SceneMaker,jQuery);