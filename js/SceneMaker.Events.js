SceneMaker.Events = (function(SM,$,undefined){
	var _initialized = false;

	var init = function(){
		if(_initialized) return;
		_initialized = true;

		//Enter and leave events
		$('article').live('slideenter', SM.Viewer.onSlideEnterViewer);
		$('article').live('slideleave', SM.Viewer.onSlideLeaveViewer);

		$(document).on('click','.close_view', SM.View.onCloseViewClicked);
		$(document).on('click','.captionHeaderWrapper img', SM.Caption.onCaptionButtonClicked);

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
	};

	var _onResizeActions = function(){
		SM.ViewerAdapter.updateInterface();
	};

	return {
			init : init
	};

}) (SceneMaker,jQuery);