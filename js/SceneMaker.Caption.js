SceneMaker.Caption = (function(SM,$,undefined){

	var init = function(){
	};

	var drawCaption = function(slide,captionJSON){
		if(_isValidCaption(captionJSON) === false){
			return;
		}
		var $slide = $(slide);
		var $captionWrapperDiv = $("div.captionWrapperTemplate").clone().removeClass("captionWrapperTemplate");
		$captionWrapperDiv.find("div.captionBodyWrapper").html(captionJSON.text);

		if(typeof captionJSON.mode !== "undefined"){
			$captionWrapperDiv.attr("mode",captionJSON.mode);
		}

		switch(captionJSON.mode){
			case "minimizable":
				break;
			case "closable":
				break;
			case "fixed":
				$captionWrapperDiv.find("div.captionHeaderWrapper").remove();
				break;
		}

		$slide.append($captionWrapperDiv);
		$captionWrapperDiv.show()
	};

	var _isValidCaption = function(caption){
		if(typeof caption !== "object"){
			return false;
		}
		if(typeof caption.text !== "string"){
			return false;
		}
		if(caption.text.trim() === ""){
			return false;
		}
		return true;
	};

	var onCaptionButtonClicked = function(event){
		var $captionWrapperDiv = $(event.target).closest('.captionWrapper');
		if ($captionWrapperDiv.length === 1) {
			_toggleCaption($captionWrapperDiv);
		}
	};

	var _toggleCaption = function($captionWrapperDiv){
		var captionMode = $captionWrapperDiv.attr("mode");
		switch(captionMode){
			case "minimizable":
				var currentStatus = $captionWrapperDiv.attr("state");
				if(currentStatus === "minimized"){
					//Maximize
					$captionWrapperDiv.find("div.captionHeaderWrapper img").attr("src", SM.ImagesPath + "vicons/close.png");
					$captionWrapperDiv.attr("state","maximized");
				} else {
					//Minimize
					$captionWrapperDiv.find("div.captionHeaderWrapper img").attr("src", SM.ImagesPath + "vicons/maximize.png");
					$captionWrapperDiv.attr("state","minimized");
				}
				break;
			case "closable":
				$captionWrapperDiv.hide();
				break;
			case "fixed":
				//Do nothing
				break;
		}
	};

	var loadScreenCaptionAfterCloseView = function(screen){
		var $captionWrapperDiv = $(screen).children('.captionWrapper');
		if ($captionWrapperDiv.length !== 1) return;
		setTimeout(function(){
			if((SM.Screen.getCurrentScreen() === screen)&&(SM.View.getCurrentView() !== null)){
				return;
			}
			$captionWrapperDiv.animate({ opacity: 1 }, 400);
			$captionWrapperDiv.css("z-index",9999);
		}, 600);
	};

	var unloadScreenCaptionBeforeOpenView = function(screen){
		var $captionWrapperDiv = $(screen).children('.captionWrapper');
		if ($captionWrapperDiv.length !== 1) return;
		$captionWrapperDiv.css("opacity",0);
		$captionWrapperDiv.css("z-index",1);
	};

	return {
		init 								: init,
		drawCaption							: drawCaption,
		onCaptionButtonClicked				: onCaptionButtonClicked,
		loadScreenCaptionAfterCloseView		: loadScreenCaptionAfterCloseView,
		unloadScreenCaptionBeforeOpenView	: unloadScreenCaptionBeforeOpenView
	};

}) (SceneMaker, jQuery);