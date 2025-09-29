SceneMaker.Marker = (function(SM,$,undefined){
	var slideData;
	var slideIdsAlias;
	var hotspotData;
	var hotzoneData;
	var defaultHotspotImg;

	var init = function(){
		slideData = {};
		slideIdsAlias = {};
		hotspotData = {};
		hotzoneData = {};
		defaultHotspotImg = SM.ImagesPath + "hotspotgallery/hotspot.png";
	};

	var getDefaultHotspotImg = function(){
		return defaultHotspotImg;
	};

	var _getSlideIdAlias = function(slideId){
		if(typeof slideIdsAlias[slideId] === "string"){
			return slideIdsAlias[slideId];
		}
		return slideId;
	};

	var _registerSlideIdAlias = function(slideId,slideIdAlias){
		if((typeof slideIdAlias !== "string")||(slideIdAlias === slideId)||($("#" + slideIdAlias).length === 0)){
			return;
		}
		for (var _slideId in slideIdsAlias) {
			if(slideId === slideIdsAlias[_slideId]){
				if(_slideId === slideIdAlias){
					delete slideIdsAlias[_slideId];
					continue;
				} else {
					slideIdsAlias[_slideId] = slideIdAlias;
				}
			}
		}
		slideIdsAlias[slideId] = slideIdAlias;
	};

	var drawSlideWithMarkers = function(slideJSON){
		var $slide = $("#" + slideJSON.id);

		//Background image
		if(typeof slideJSON.background === "string"){
			var imgBackgroundId = slideJSON.id + "_background";
			var imgBackground = $("<img>", {
				id: imgBackgroundId,
				class: "slide_background",
				src: slideJSON.background
			});
			$slide.append(imgBackground);
		}

		//Hotzones
		if (Array.isArray(slideJSON.hotzones)&&(slideJSON.hotzones.length > 0)){
			for(j in slideJSON.hotzones){
				_drawHotzone($slide, slideJSON.hotzones[j]);
			}
		}

		//Hotspots
		if (Array.isArray(slideJSON.hotspots)&&(slideJSON.hotspots.length > 0)){
			for(i in slideJSON.hotspots){
				_drawHotspot($slide, slideJSON.hotspots[i]);
			}
		}
	};

	var _drawHotspot = function($slide, hotspotJSON){
		if((!hotspotJSON)||(!hotspotJSON.id)){
			return;
		}
		var coordinatesMargin = 10;
		if(!hotspotJSON.x){
			return;
		}
		if(!hotspotJSON.y){
			return;
		}
		if((!hotspotJSON.width)||(hotspotJSON.width <= 0)){
			return;
		}
		if((!hotspotJSON.height)||(hotspotJSON.height <= 0)){
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
		var cursorVisible = (hotspotJSON.cursorVisibility === "pointer");
		if(cursorVisible === true){
			extraClasses += " hotspot_cursor_pointer";
		}

		var $imgBackground = SM.Slides.getSlideBackgroundImg($slide);
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
		}).appendTo($imgBackground.parent());

		if (Array.isArray(hotspotJSON.actions)&&(hotspotJSON.actions.length > 0)) {
			$hotspot.addClass("hotspot_with_actions");
			
			hotspotData[hotspotJSON.id] = hotspotJSON.actions;
			$hotspot.on('click', function(){
				_onClickHotspot(hotspotJSON.id);
			});

			for(i in hotspotJSON.actions){
				_addActionToHotspot($hotspot, hotspotJSON.actions[i]);
			}
		}
	};

	var _drawHotzone = function($slide, hotzoneJSON){
		if((!hotzoneJSON)||(!hotzoneJSON.id)){
			return;
		}
		if(!Array.isArray(hotzoneJSON.points)){
			return;
		}
		var slideId = $slide.attr("id");
		var hotzoneId = hotzoneJSON.id;
		var annotator = _createAnnotatorForSlide(slideId);
		var annotation = createAnnotationFromPointsArray(hotzoneId,hotzoneJSON.points);
		annotator.addAnnotation(annotation);
		
		_waitForAnnotationRendering(annotation.id, function(hotzoneDOM){
			if(hotzoneJSON.cursorVisibility === "pointer"){
				$(hotzoneDOM).attr("hotzone_cursor_visibility",hotzoneJSON.cursorVisibility);
			}
			if(hotzoneJSON.enabled === false){
				$(hotzoneDOM).attr("hotzone_enabled","false");
			} else {
				$(hotzoneDOM).attr("hotzone_enabled","true");
			}
			if (Array.isArray(hotzoneJSON.actions)&&(hotzoneJSON.actions.length > 0)) {
				hotzoneData[hotzoneId] = hotzoneJSON.actions;
				for(i in hotzoneJSON.actions){
					_addActionToHotzone(hotzoneDOM,hotzoneId,hotzoneJSON.actions[i]);
				}
			}
		});
	};

	var _waitForAnnotationRendering = function(annotationId, callback) {
		var timer;
		var initTime = Date.now();
		
		function check() {
			var $hotzoneDOM = getHotzoneDOM(annotationId);
			if ($hotzoneDOM.length > 0) {
				clearInterval(timer);
				callback($hotzoneDOM);
				return true;
			} else if (Date.now() - initTime >= 1000) {
				clearInterval(timer);
				return false;
			}
			return false;
		}

		setTimeout(function() {
			if (!check()) {
				timer = setInterval(check, 200);
			}
		}, 0);
	};

	var _createAnnotatorForSlide = function(slideId){
		if(typeof slideData[slideId] === "undefined"){
			slideData[slideId] = {};
		}
		if(typeof slideData[slideId].annotator !== "undefined"){
			return slideData[slideId].annotator; //already created
		}

		var $imgBackground = SM.Slides.getSlideBackgroundImg($("#" + slideId));
		var annotator = Annotorious.createImageAnnotator($imgBackground.attr("id"), {
			drawingEnabled: false,
			userSelectAction: 'SELECT',
			style: {
				fill: '#dddddd00',
				fillOpacity: 0,
				stroke: '#00000000',
				//stroke: '#000000ff', //for testing
				strokeWidth: 1
			}
		});
		annotator.on('selectionChanged', function(annotations){
			if(Array.isArray(annotations)){
				if (annotations.length === 1){
					_onClickHotzone(annotations[0].id);
				}
			}
		});
		
		slideData[slideId].annotator = annotator;
		return annotator;
	};

	var createAnnotationFromPointsArray = function(id, pointsArray){
		var xs = pointsArray.map(([x]) => x);
		var ys = pointsArray.map(([, y]) => y);
		var minX = Math.min(...xs);
		var maxX = Math.max(...xs);
		var minY = Math.min(...ys);
		var maxY = Math.max(...ys);

		var annotation = {
			"id": id,
			"target": {
				"selector": {
					"type": "POLYGON",
					"geometry": {
						"bounds": {
							"minX": minX,
							"minY": minY,
							"maxX": maxX,
							"maxY": maxY
						},
						"points": pointsArray
					}
				}
			}
		};
		return annotation;
	};

	var getHotzoneDOM = function(hotzoneId){
		return $("g.[data-id='" + hotzoneId + "']");
	};


	/* Actions */

	var _addActionToHotspot = function($hotspot, action){
		switch(action.actionType){
			case "showText":
				if((action.actionParams)&&(typeof action.actionParams.text === "string")){
					_addTooltip($hotspot[0],action.actionParams.text);
				};
				break;
			default:
				break;
		};
	};

	var _addActionToHotzone = function(hotzoneDOM, hotzoneId, action){
		switch(action.actionType){
			case "showText":
				if((action.actionParams)&&(typeof action.actionParams.text === "string")){
					_addTooltip($(hotzoneDOM)[0],action.actionParams.text);
				};
				break;
			default:
				break;
		};
	};

	var _addTooltip = function(elementDOM,text){
		tippy(elementDOM, {
			content: text,
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
				$(elementDOM).attr("markertooltipid",toolTipId);
			}
		});
	};

	var _onClickHotspot = function(hotspotId){
		_performActions(hotspotData[hotspotId]);
	};

	var _onClickHotzone = function(hotzoneId){
		var hotzoneDOM = getHotzoneDOM(hotzoneId);
		if($(hotzoneDOM).attr("hotzone_enabled") === "false"){
			return;
		}
		_performActions(hotzoneData[hotzoneId]);
	};

	var _performActions = function(actions){
		if (Array.isArray(actions)) {
			actions.forEach((action, index) => {
				_performAction(action);
			});
		}
	};

	var _performAction = function(action){
		switch(action.actionType){
			case "goToScreen":
				if((action.actionParams)&&(typeof action.actionParams.screen === "string")){
					var screenId = _getSlideIdAlias(action.actionParams.screen);
					var $screen = $("#" + screenId);
					if ($screen.length > 0) {
						if($screen[0] === SM.Screen.getCurrentScreen()){
							var currentView = SM.View.getCurrentView();
							if((typeof currentView !== "undefined")&&(currentView !== null)){
								SM.View.closeView($(currentView).attr("id"));
							}
						}
						SM.Screen.goToScreenWithNumber($screen.attr("slideNumber"));
					}
				}
				break;
			case "openView":
				if((action.actionParams)&&(typeof action.actionParams.view === "string")){
					var viewId = action.actionParams.view;
					var $view = $("#" + viewId);
					if ($view.length > 0) {
						SM.View.openView(viewId);
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
					SM.Slides.changeSlideBackground($("#" + action.actionParams.slide),action.actionParams.url);
				}
				break;
			case "changeScreen":
				if((action.actionParams)&&(typeof action.actionParams.screen === "string")&&(typeof action.actionParams.screenReplacement === "string")){
					var screenId = action.actionParams.screen;
					var screenReplacementId = action.actionParams.screenReplacement;
					_registerSlideIdAlias(screenId,screenReplacementId);
					if($(SM.Screen.getCurrentScreen()).attr("id") === screenId){
						_performAction({actionType: "goToScreen", actionParams:{screen: screenId}});
					}
				}
				break;
			case "showHotspot":
			case "hideHotspot":
				if((action.actionParams)&&(typeof action.actionParams.hotspotId === "string")){
					var hotspotId = action.actionParams.hotspotId;
					var $hotspot = $("#" + hotspotId);
					if ($hotspot.length > 0) {
						if(action.actionType === "showHotspot"){
							$hotspot.show();
						} else {
							$hotspot.hide();
						}
					}
				}
				break;
			case "enableHotzone":
			case "disableHotzone":
				if((action.actionParams)&&(typeof action.actionParams.hotzoneId === "string")){
					var $hotzoneDOM = getHotzoneDOM(action.actionParams.hotzoneId);
					if ($hotzoneDOM.length > 0) {
						if(action.actionType === "enableHotzone"){
							$hotzoneDOM.attr("hotzone_enabled","true");
						} else {
							$hotzoneDOM.attr("hotzone_enabled","false");
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
	};

	return {
		init 							: init,
		getDefaultHotspotImg			: getDefaultHotspotImg,
		getHotzoneDOM					: getHotzoneDOM,
		drawSlideWithMarkers			: drawSlideWithMarkers,
		createAnnotationFromPointsArray : createAnnotationFromPointsArray
	};

}) (SceneMaker, jQuery);