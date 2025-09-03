VISH.Slideset = (function(V,$,undefined){
	var initialized = false;
	var defaultHotspotImg;

	var init = function(){
		if(initialized){
			return;
		}

		defaultHotspotImg = V.ImagesPath + "icons/hotspot.png";

		initialized = true;
	};

	var isSlideset = function(obj){
		var type;
		if(typeof obj == "string"){
			type = obj;
		} else {
			type = $(obj).attr("type");
		}
		return (type === "flashcard");
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
		$screen.css("background-image", screenJSON.background);

		//Hotspots
		for(i in screenJSON.hotspots){
			_drawHotspot($screen, screenJSON.hotspots[i]);
		}
	};

	var _drawHotspot = function($screen, hotspotJSON){
		if((!hotspotJSON)||(!hotspotJSON.id)){
			return;
		}
		if((!hotspotJSON.x)||(hotspotJSON.x < 0)||(hotspotJSON.x > 100)){
			return;
		}
		if((!hotspotJSON.width)||(hotspotJSON.y < 0)||(hotspotJSON.y > 100)){
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

		var $hotspot = $('<img>', {
			src: hotspotJSON.image,
			class: 'hotspot',
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
		}).appendTo($screen);

		if (Array.isArray(hotspotJSON.actions)&&(hotspotJSON.actions.length > 0)) {
			$hotspot.addClass("hotspot_with_actions");
			for(i in hotspotJSON.actions){
				_addActionToHotspot($hotspot, hotspotJSON.actions[i]);
			}
		}
	};

	var _addActionToHotspot = function($hotspot, action){
		$hotspot.on('click', function(){
			switch(action.actionType){
				case "goToScreen":
					if((action.actionParams)&&(typeof action.actionParams.screen === "string")){
						var screenId = action.actionParams.screen;
						var $screen = $("#" + screenId);
						if ($screen.length > 0) {
							V.Slides.goToSlide($screen.attr("slideNumber"));
						}
					}
					break;
				case "openView":
					if((action.actionParams)&&(typeof action.actionParams.view === "string")){
						var viewId = action.actionParams.view;
						var $view = $("#" + viewId);
						if ($view.length > 0) {
							V.Slides.openSubslide(viewId);
						}
					}
					break;	
				case "changeScreenImage":
					//TODO
					break;
				case "removeElement":
					//TODO
					break;
				case "solvePuzzle":
					//TODO
					break;
				default:
					break;
			}
		});
	};

	var onEnterSlideset = function(slideset){
		//Look for opened subslides
		var openSubslides = $(slideset).children("article.show_in_smartcard");
		if(openSubslides.length===1){
			var openSubslide = openSubslides[0];
			var subSlideId = $(openSubslide).attr("id");
			V.Slides.triggerEnterEventById(subSlideId);
		}
	};

	var onLeaveSlideset = function(slideset){
		//Look for opened subslides
		var openSubslides = $(slideset).children("article.show_in_smartcard");
		if(openSubslides.length===1){
			var openSubslide = openSubslides[0];
			var subSlideId = $(openSubslide).attr("id");
			V.Slides.triggerLeaveEventById(subSlideId);
		}
	};

	var afterSetupSize = function(increaseW,increaseH){
/*		var fcArrowIncrease;
		if(increase >= 1){
			fcArrowIncrease = V.ViewerAdapter.getPonderatedIncrease(increase,0.1);
		} else {
			fcArrowIncrease = V.ViewerAdapter.getPonderatedIncrease(increase,0.8);
		}

		//Update arrows
		//Use geometric formulas to properly allocate the arrows after setup size
		//This way, arrows always point to the same spot
		for(var fckey in flashcards) {
			var fc = flashcards[fckey];
			var arrows = fc.arrows;
			$(arrows).each(function(index,arrow){
				var orgX = arrow.x * 8;
				var newWidth = 50*fcArrowIncrease;
				var newLeft = increase * orgX + 25 *(increase - fcArrowIncrease);

				var orgY = arrow.y * 6;
				var newHeight = 40*fcArrowIncrease;
				var newTop = increase * orgY + 40 * 0.8 * (increase - fcArrowIncrease);

				var arrowDom = $("#"+arrow.id);
				$(arrowDom).css("left",newLeft+"px");
				$(arrowDom).width(newWidth+"px");
				$(arrowDom).css("top",newTop+"px");
				$(arrowDom).height(newHeight+"px");
			});
		}*/
	};

	///////////////
	// Events
	///////////////

	var onCloseSubslideClicked = function(event){
		var close_slide_id = event.target.id.substring(5); //the id is close3
		V.Slides.closeSubslide(close_slide_id,true);
	};



	/** Methods from V.Flashcard */

/*	var loadEvents = function(){
		var device = V.Status.getDevice();
		var isIphoneAndSafari = ((device.iPhone)&&(device.browser.name===V.Constant.SAFARI));
		if(isIphoneAndSafari){
			//Fix for Iphone With Safari
			V.EventsNotifier.registerCallback(V.Constant.Event.Touchable.onSimpleClick,_onSimpleClickEvent);
		} else {
			$(document).on("click", '.fc_poi', _onFlashcardPoiClicked);
		}
	};

	var _onSimpleClickEvent = function(params){
		var event = params.event;
		var target = event.target;
		if($(target).hasClass("fc_poi")){
			event.preventDefault();
			var poiId = target.id;
			_onFlashcardPoiSelected(poiId);
		}
	};

	var unloadEvents = function(){
		var device = V.Status.getDevice();
		var isIphoneAndSafari = ((device.iPhone)&&(device.browser.name===V.Constant.SAFARI));
		if(isIphoneAndSafari){
			V.EventsNotifier.unRegisterCallback(V.Constant.Event.Touchable.onSimpleClick, _onSimpleClickEvent);
		} else {
			$(document).off('click', '.fc_poi');
		}
	};*/

	/*
	 * Events
	 */
/*	var _onFlashcardPoiClicked = function(event){
		_onFlashcardPoiSelected($(event.target).attr("id"));
	};

	var _onFlashcardPoiSelected = function(poiId){
		if((typeof pois != "undefined")&&(typeof pois[poiId] != "undefined")){
			var poiJSON = pois[poiId];
			if(typeof poiJSON != "undefined"){
				V.Slides.openSubslide(poiJSON.slide_id,true);
			}
		}
	};*/



	return {
		init 					: init,
		isSlideset				: isSlideset,
		getDefaultHotspotImg	: getDefaultHotspotImg,
		draw					: draw,
		onEnterSlideset			: onEnterSlideset,
		onLeaveSlideset			: onLeaveSlideset,
		onCloseSubslideClicked	: onCloseSubslideClicked,
		afterSetupSize			: afterSetupSize
	};

}) (VISH, jQuery);