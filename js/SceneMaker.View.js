SceneMaker.View = (function(SM,$,undefined){
	var _currentViewId = null;

	var init = function(){
	};

	var getCurrentView = function(){
		if(SM.Editing){
			return SM.Editor.View.getCurrentView();
		}

		if(_currentViewId === null){
			return null;
		} else {
			return $("#"+_currentViewId);
		}
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

	var getViewWithNumber = function(screen,viewNumber){
		return $(screen).children("article[slidenumber='" + viewNumber + "']");
	};

	var onCloseViewClicked = function(event){
		var viewId = event.target.id.substring(5);
		closeView(viewId);
	};

	var openView = function(viewId){
		var currentView = getCurrentView();
		if((typeof currentView !== "undefined")&&(currentView !== null)){
			var currentViewId = $(currentView).attr("id");
			if(viewId === currentViewId){
				return;
			} else {
				closeView(currentViewId);
			}
		}

		_currentViewId = viewId;
		$("#" + viewId).removeClass("hide_in_screen");
		$("#" + viewId).addClass("show_in_screen");
		SM.Slides.triggerSlideEnterEvent(viewId);	
	};

	var closeView = function(viewId){
		_currentViewId = null;
		$("#" + viewId).removeClass("show_in_screen");
		$("#" + viewId).addClass("hide_in_screen");
		SM.Slides.triggerSlideLeaveEvent(viewId);
	};

	var closeCurrentView = function(){
		var currentView = getCurrentView();
		if((typeof currentView !== "undefined")&&(currentView !== null)){
			closeView($(currentView).attr("id"));
		}
	};

	return {
		init					: init,
		getCurrentView 			: getCurrentView,
		getCurrentViewNumber	: getCurrentViewNumber,
		getViewWithNumber		: getViewWithNumber,
		onCloseViewClicked		: onCloseViewClicked,
		openView				: openView,
		closeView				: closeView,
		closeCurrentView		: closeCurrentView
	};

}) (SceneMaker, jQuery);