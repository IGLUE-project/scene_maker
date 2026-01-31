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

		//Caption
		if (typeof slideJSON.caption !== "undefined"){
			SM.Caption.drawCaption($slide, slideJSON.caption);
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
			
			hotspotData[hotspotJSON.id] = hotspotJSON;
			$hotspot.on('click', function(){
				_onClickHotspot(hotspotJSON.id);
			});

			for(i in hotspotJSON.actions){
				SM.Actions.addActionToHotspot($hotspot, hotspotJSON.actions[i]);
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
				hotzoneData[hotzoneId] = hotzoneJSON;
				for(i in hotzoneJSON.actions){
					SM.Actions.addActionToHotzone(hotzoneDOM,hotzoneJSON.actions[i]);
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

	var _onClickHotspot = function(hotspotId){
		if((typeof hotspotData[hotspotId] !== "object")||(typeof hotspotData[hotspotId].actions === "undefined")){
			return;
		}
		SM.Actions.performActions(hotspotData[hotspotId].actions,hotspotId);
	};

	var _onClickHotzone = function(hotzoneId){
		var hotzoneDOM = getHotzoneDOM(hotzoneId);
		if($(hotzoneDOM).attr("hotzone_enabled") === "false"){
			return;
		}
		if((typeof hotzoneData[hotzoneId] !== "object")||(typeof hotzoneData[hotzoneId].actions === "undefined")){
			return;
		}
		SM.Actions.performActions(hotzoneData[hotzoneId].actions,hotzoneData[hotzoneId].idAlias);
	};

	return {
		init 							: init,
		getDefaultHotspotImg			: getDefaultHotspotImg,
		getHotzoneDOM					: getHotzoneDOM,
		drawSlideWithMarkers			: drawSlideWithMarkers,
		createAnnotationFromPointsArray : createAnnotationFromPointsArray
	};

}) (SceneMaker, jQuery);