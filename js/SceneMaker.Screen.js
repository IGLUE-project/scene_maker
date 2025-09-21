SceneMaker.Screen = (function(SM,$,undefined){
	var initialized = false;
	var defaultHotspotImg;

	var init = function(){
		if(initialized){
			return;
		}

		defaultHotspotImg = SM.ImagesPath + "hotspotgallery/hotspot.png";

		initialized = true;
	};

	var getDefaultHotspotImg = function(){
		return defaultHotspotImg;
	};

	/////////////////
	// Callbacks
	////////////////

	var draw = function(screenJSON){
		var $screen = $("#" + screenJSON.id);

		//Background image
		if(typeof screenJSON.background === "string"){
			var imgBackgroundId = SM.Utils.getId(screenJSON.id + "_background");
			var imgBackground = $("<img>", {
				id: imgBackgroundId,
				class: "slide_background",
				src: screenJSON.background
			});
			$screen.append(imgBackground);
		}

		//Hotspots
		for(i in screenJSON.hotspots){
			_drawHotspot($screen, screenJSON.hotspots[i]);
		}
	};

	var _drawHotspot = function($slide, hotspotJSON){
		if((!hotspotJSON)||(!hotspotJSON.id)){
			return;
		}
		var coordinatesMargin = 10;
		if((!hotspotJSON.x)||(hotspotJSON.x < (0-coordinatesMargin)||(hotspotJSON.x > (100+coordinatesMargin)))){
			return;
		}
		if((!hotspotJSON.y)||(hotspotJSON.y < (0-coordinatesMargin)||(hotspotJSON.y > (100+coordinatesMargin)))){
			return;
		}
		if((!hotspotJSON.width)||(hotspotJSON.width < 0)||(hotspotJSON.width > 100)){
			return;
		}
		if((!hotspotJSON.height)||(hotspotJSON.height < 0)||(hotspotJSON.height > 100)){
			return;
		}
		if(typeof hotspotJSON.image !== "string"){
			hotspotJSON.image = defaultHotspotImg;
		}

		var rotationAngle = parseFloat(hotspotJSON.rotationAngle);
		if (typeof rotationAngle !== "number" || isNaN(rotationAngle) || rotationAngle < 0 || rotationAngle > 360) {
			rotationAngle = 0;
		}

		var extraClasses = "";
		var visible = (hotspotJSON.visibility !== "hidden");
		if(visible === false){
			extraClasses += " hotspot_hidden";
		}

		var $hotspot = $('<img>', {
			src: hotspotJSON.image,
			class: ('hotspot' + extraClasses),
			id: hotspotJSON.id,
			rotationAngle: rotationAngle,
			css: {
				position: 'absolute',
				left: (hotspotJSON.x + "%"),
				top: (hotspotJSON.y + "%"),
				width: (hotspotJSON.width + "%"),
				height: (hotspotJSON.height + "%"),
				transform: "rotate(" + rotationAngle + "deg)"
			}
		}).appendTo($slide);

		if (Array.isArray(hotspotJSON.actions)&&(hotspotJSON.actions.length > 0)) {
			$hotspot.addClass("hotspot_with_actions");
			for(i in hotspotJSON.actions){
				_addActionToHotspot($hotspot, hotspotJSON.actions[i]);
			}
		}
	};

	var _addActionToHotspot = function($hotspot, action){
		switch(action.actionType){
			case "showText":
				if((action.actionParams)&&(typeof action.actionParams.text === "string")){
					tippy(('#'+$hotspot.attr("id")), {
						content: action.actionParams.text,
						trigger: 'click',
						placement: 'top',
						inlinePositioning: true,
						arrow: true,
						theme: '',
						animation: 'scale', //fade, scale,
						duration: 1000,
						inertia: false,
						interactive: false,
						interactiveBorder: 2,
						hideOnClick: true,
						maxWidth: 'none',
						offset: [2, 6],
						delay: [0, 0],
						popperOptions: {
							modifiers: [
								{ name: 'eventListeners', options: { scroll: false, resize: false } },
							],
						},
						onCreate(instance) {
							var toolTipId = instance.popper.id;
							$hotspot.attr("tooltipid",toolTipId);
						}
					});
				};
				break;
			default:
				break;
		};

		$hotspot.on('click', function(){
			switch(action.actionType){
				case "goToScreen":
					if((action.actionParams)&&(typeof action.actionParams.screen === "string")){
						var screenId = action.actionParams.screen;
						var $screen = $("#" + screenId);
						if ($screen.length > 0) {
							if($screen[0] === SM.Slides.getCurrentScreen()){
								var currentView = SM.Slides.getCurrentView();
								if((typeof currentView !== "undefined")&&(currentView !== null)){
									SM.Slides.closeView($(currentView).attr("id"));
								}
							}
							SM.Slides.goToScreenWithNumber($screen.attr("slideNumber"));
						}
					}
					break;
				case "openView":
					if((action.actionParams)&&(typeof action.actionParams.view === "string")){
						var viewId = action.actionParams.view;
						var $view = $("#" + viewId);
						if ($view.length > 0) {
							SM.Slides.openView(viewId);
						}
					}
					break;	
				case "openLink":
					if((action.actionParams)&&(typeof action.actionParams.url === "string")){
						window.open(action.actionParams.url, '_blank', 'noopener,noreferrer');
					}
					break;
				case "showText":
					//Do nothing. Tooltips are handled automatically by Tippy.
					// if((action.actionParams)&&(typeof action.actionParams.text === "string")){
					// 	alert(action.actionParams.text);
					// };
					break;
				case "changeBackground":
					if((action.actionParams)&&(typeof action.actionParams.slide === "string")&&(typeof action.actionParams.url === "string")){
						$("#" + action.actionParams.slide).css("background-image","url(" + action.actionParams.url + ")");
					}
					break;
				case "changeScreen":
					if((action.actionParams)&&(typeof action.actionParams.screen === "string")&&(typeof action.actionParams.screenReplacement === "string")){
						var screenId = action.actionParams.screen;
						var screenReplacementId = action.actionParams.screenReplacement;
						_replaceScreen(screenId,screenReplacementId);
					}
					break;
				case "showElement":
				case "hideElement":
					if((action.actionParams)&&(typeof action.actionParams.elementId === "string")){
						var elementId = action.actionParams.elementId;
						var $element = $("#" + elementId);
						if ($element.length > 0) {
							if(action.actionType === "showElement"){
								$element.show();
							} else {
								$element.hide();
							}
						}
					}
					break;
				case "playSound":
					if((action.actionParams)&&(typeof action.actionParams.url === "string")){
						SM.Audio.HTML5.playAudio(action.actionParams.url);
					}
					break;
				case "stopSound":
					if((action.actionParams)&&(typeof action.actionParams.url === "string")){
						SM.Audio.HTML5.stopAudio(action.actionParams.url);
					}
					break;
				case "solvePuzzle":
					//TODO
					break;
				default:
					break;
			}
		});
	};

	var _replaceScreen = function(screenId,screenReplacementId){
		var $screen = $("#" + screenId);
		var $screenReplacement = $("#" + screenReplacementId);
		if (($screen.length !== 1)||($screenReplacement.length !== 1)) {
			return;
		}

		//Change positions in DOM
		var $temp = $("<div>").insertBefore($screen);
		$screen.insertBefore($screenReplacement);
  		$screenReplacement.insertBefore($temp);
		$temp.remove();

		//Change slide numbers
		var slideNumberScreenReplacement = $screenReplacement.attr("slidenumber");
		$screenReplacement.attr("slidenumber",$screen.attr("slidenumber"));
		$screen.attr("slidenumber",slideNumberScreenReplacement);

		//Change ids
		$screenReplacement.attr("id","replaceScreenTmpId");
		$screen.attr("id",screenReplacementId);
		$screenReplacement.attr("id",screenId);

		//Change view ids
		_changeViewsIds($screenReplacement);
		_changeViewsIds($screen);

		//Refresh
		SM.Slides.goToScreenWithNumber(SM.Slides.getCurrentScreenNumber(),true);
	};

	var _changeViewsIds = function($screen){
		var screenId = $screen.attr("id");
		$screen.find("article[type='view']").each(function(index, view) {
			var oldId = $(this).attr("id");
			var suffix = oldId.split('_')[1];
			var newId = screenId + '_' + suffix;
			$(this).attr("id",newId);
		});
	};

	var onEnterScreen = function(screen){
		//Look for opened views
		var openedViews = $(screen).children("article.show_in_screen");
		if(openedViews.length===1){
			var openView = openedViews[0];
			var viewId = $(openView).attr("id");
			SM.Slides.triggerEnterEventById(viewId);
		}
	};

	var onLeaveScreen = function(screen){
		//Look for opened views
		var openedViews = $(screen).children("article.show_in_screen");
		if(openedViews.length===1){
			var openView = openedViews[0];
			var viewId = $(openView).attr("id");
			SM.Slides.triggerLeaveEventById(viewId);
		}
	};

	var afterSetupSize = function(increaseW,increaseH){
	};

	///////////////
	// Events
	///////////////

	var onCloseViewClicked = function(event){
		var close_slide_id = event.target.id.substring(5);
		SM.Slides.closeView(close_slide_id,true);
	};

	return {
		init 					: init,
		getDefaultHotspotImg	: getDefaultHotspotImg,
		draw					: draw,
		onEnterScreen			: onEnterScreen,
		onLeaveScreen			: onLeaveScreen,
		onCloseViewClicked		: onCloseViewClicked,
		afterSetupSize			: afterSetupSize
	};

}) (SceneMaker, jQuery);