/*
 * Events for Viewer
 */
SceneMaker.Events = (function(SM,$,undefined){

	var _bindedViewerEventListeners = false;

	var init = function(){
		bindViewerEventListeners();
	};

	var bindViewerEventListeners = function(){
		if(_bindedViewerEventListeners){
			return;
		}

		//Enter and leave events
		$('article').live('slideenter', SM.Viewer.onSlideEnterViewer);
		$('article').live('slideleave', SM.Viewer.onSlideLeaveViewer);

		$(document).on('click','.close_view', SM.View.onCloseViewClicked);

		//Focus
		// $(window).focus(function(){
		// }).blur(function(){
		// });

		//Load onresize event
		//Prevent multiple consecutively calls
		var multipleOnResize = undefined;
		window.onresize = function(){
			if(typeof multipleOnResize == "undefined"){
				multipleOnResize = false;
				setTimeout(function(){
					if(!multipleOnResize){
						multipleOnResize = undefined;
						_onResizeActions();
					} else {
						multipleOnResize = undefined;
						window.onresize();
					}
				},600);
			} else {
				multipleOnResize = true;
			}
		};

		$(window).on('orientationchange',function(){
			$(window).trigger('resize'); //It will call SM.ViewerAdapter.updateInterface();
		});

		window.onbeforeunload = function(){
			SM.EventsNotifier.notifyEvent("EXIT");
		};

		_bindedViewerEventListeners = true;
	};


	var _onResizeActions = function(){
		SM.ViewerAdapter.updateInterface();
	};

	return {
			init 							: init,
			bindViewerEventListeners		: bindViewerEventListeners
	};

}) (SceneMaker,jQuery);