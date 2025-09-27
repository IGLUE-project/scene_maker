SceneMaker.Marker = (function(SM,$,undefined){
	var slideData;
	var hotspotData;
	var hotzoneData;
	var defaultHotspotImg;

	var init = function(){
		slideData = {};
		hotspotData = {};
		hotzoneData = {};
		defaultHotspotImg = SM.ImagesPath + "hotspotgallery/hotspot.png";
	};

	var getDefaultHotspotImg = function(){
		return defaultHotspotImg;
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

		//Hotspots
		if (Array.isArray(slideJSON.hotspots)&&(slideJSON.hotspots.length > 0)){
			for(i in slideJSON.hotspots){
				_drawHotspot($slide, slideJSON.hotspots[i]);
			}
		}

		//Hotzones
		if (Array.isArray(slideJSON.hotzones)&&(slideJSON.hotzones.length > 0)){
			for(j in slideJSON.hotzones){
				_drawHotzone($slide, slideJSON.hotzones[j]);
			}
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
			if(hotzoneJSON.visibility === "visible_hover"){
				$(hotzoneDOM).attr("hotzone_visibility",hotzoneJSON.visibility);
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
			var $hotzoneDOM = $("[data-id='" + annotationId + "']");
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
					var screenId = action.actionParams.screen;
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
		SM.Screen.goToScreenWithNumber(SM.Screen.getCurrentScreenNumber(),true);
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

	return {
		init 							: init,
		getDefaultHotspotImg			: getDefaultHotspotImg,
		drawSlideWithMarkers			: drawSlideWithMarkers,
		createAnnotationFromPointsArray : createAnnotationFromPointsArray
	};

}) (SceneMaker, jQuery);