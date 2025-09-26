SceneMaker.Editor.Marker = (function(SM,$,undefined){

	var currentEditingMode = "NONE"; //Can be "NONE", HOTSPOT" or "HOTZONE".
	var _hiddenLinkToInitHotspotSettings;
	var slideData;
	var currentHotspot;
	var currentHotzoneId;

	var init = function(){
		slideData = {};

		//Hotspot Settings
		_hiddenLinkToInitHotspotSettings = $('<a href="#hotspotSettings_fancybox" style="display:none"></a>');
		$(_hiddenLinkToInitHotspotSettings).fancybox({
			'autoDimensions' : false,
			'height': 690,
			'width': 920,
			'scrolling': 'no',
			'showCloseButton': false,
			'padding' : 0,
			"onStart"  : function(data){
				_onStartHotspotSettingsFancybox();
			},
			"onComplete" : function(data){
			},
			"onClosed"  : function(data){
			}
		});

		//Fill action template with current puzzles
		var nPuzzles = SM.Editor.getOptions().nPuzzles;

		if((typeof nPuzzles === "number")&&(nPuzzles > 0)){
			var currentOptionsPuzzles = [];
			for(var inp = 0; inp < nPuzzles; inp++){
				var nPuzzle = (inp+1);
				currentOptionsPuzzles.push({
					value: nPuzzle,
					text: (SM.I18n.getTrans("i.PuzzleOption", {number: nPuzzle}))
				});
			}
		}

		$("div.hotspotActionWrapperTemplate div.hotspotActionParamsPuzzle select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsPuzzles, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});
	};

	var _getDefaultSlideConfig = function(slideId){
		var defaultConfig = {
			hotspots: {},
			hotzones: {}
		};
		return defaultConfig;
	};

	var drawSlideWithMakers = function(slideJSON,scaffoldDOM){
		if(slideJSON){
			if(typeof slideJSON.background === "string"){
				SM.Editor.Slides.setSlideBackground(scaffoldDOM, slideJSON.background);
			};
			drawHotspots(slideJSON,scaffoldDOM);
			drawHotzones(slideJSON,scaffoldDOM);
		}
	};

	var drawHotspots = function(slideJSON,scaffoldDOM){
		if (Array.isArray(slideJSON.hotspots)) {
			$(slideJSON.hotspots).each(function(index,hotspot){
				SM.Utils.registerId(hotspot.id);

				//Transform dimensions from percentage to absolute numbers for the current container.
				//If aspect ratio is 4:3, the dimensions of the container are 800x600
				//If aspect ratio is 16:9, the dimensions of the container are 1024x576
				var slideContainerWidth;
				var slideContainerHeight;

				if($("body").attr("aspectRatio")==="16:9"){
					slideContainerWidth = 1024;
					slideContainerHeight = 576;
				} else {
					slideContainerWidth = 800;
					slideContainerHeight = 600;
				}

				var hotspotX = hotspot.x*slideContainerWidth/100;
				var hotspotY = hotspot.y*slideContainerHeight/100;
				var hotspotWidth = hotspot.width*slideContainerWidth/100;
				var hotspotHeight = hotspot.height*slideContainerHeight/100;

				_drawHotspot(slideJSON.id,hotspot.id,hotspotX,hotspotY,hotspot.image,hotspot.lockAspectRatio,hotspot.visibility,hotspotWidth,hotspotHeight,hotspot.rotationAngle);
				if (Array.isArray(hotspot.actions)&&hotspot.actions.length>0) {
					slideData[slideJSON.id].hotspots[hotspot.id].actions = hotspot.actions;
				}
			});
		}
	};

	var drawHotzones = function(slideJSON,scaffoldDOM){
		if (Array.isArray(slideJSON.hotzones)) {
			$(slideJSON.hotzones).each(function(index,hotzoneJSON){
				_drawHotzone(slideJSON.id,hotzoneJSON);
				if (Array.isArray(hotzoneJSON.actions)&&(hotzoneJSON.actions.length>0)) {
					slideData[slideJSON.id].hotzones[hotzoneJSON.id].actions = hotzoneJSON.actions;
				}
			});
		}
	};

	var _drawHotzone = function(slideId,hotzoneJSON){
		if(Array.isArray(hotzoneJSON.points)){
			var annotation = _createAnnotationFromPointsArray(hotzoneJSON.points);
			var annotator = _createAnnotatorForSlide(slideId);
			annotator.setAnnotations([annotation]);
		}
	};

	var _createAnnotationFromPointsArray = function(pointsArray){
		var xs = pointsArray.map(([x]) => x);
		var ys = pointsArray.map(([, y]) => y);
		var minX = Math.min(...xs);
		var maxX = Math.max(...xs);
		var minY = Math.min(...ys);
		var maxY = Math.max(...ys);

		var annotation = {
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

   /*
	* Toolbar: Hotspots and Hotzones
	*/
	var addHotspot = function(){
		if(currentEditingMode === "HOTSPOT"){
			_disableEditingMode("HOTSPOT");
		} else {
			_enableEditingMode("HOTSPOT");
		}
	};

	var addHotzone = function(){
		if(currentEditingMode === "HOTZONE"){
			_disableEditingMode("HOTZONE");
		} else {
			_enableEditingMode("HOTZONE");
		}
	};

	var _enableEditingMode = function(mode){
		currentEditingMode = mode;
		switch(mode){
			case "HOTSPOT":
				_disableEditingMode("HOTZONE");
				$("#slides_panel").addClass("hotspot_active");
				break;
			case "HOTZONE":
				_disableEditingMode("HOTSPOT");
				$("#slides_panel").addClass("hotzone_active");
				_enableHotzones();
				break;
			case "NONE":
				_disableEditingMode("HOTSPOT");
				_disableEditingMode("HOTZONE");
				break;
		}
	};

	var _disableEditingMode = function(mode){
		if(currentEditingMode === mode){
			currentEditingMode = "NONE";
		}
		switch(mode){
			case "HOTSPOT":
				$("#slides_panel").removeClass("hotspot_active");
				currentHotspot = undefined;
				break;
			case "HOTZONE":
				$("#slides_panel").removeClass("hotzone_active");
				currentHotzoneId = undefined;
				_disableHotzones();
				break;
			default:
				break;
		}
	};

	var onClick = function(event){
		var $target = $(event.target);
		if(currentEditingMode !== "NONE"){
			if ($target.closest('article[type="' + SM.Constant.SCREEN + '"]').length === 0) {
				//Click outside a screen
				_enableEditingMode("NONE");
			} else {
				//Click inside a screen
				switch(currentEditingMode){
					case "HOTSPOT":
						_onClickInHotspotMode(event);
						break;
					case "HOTZONE":
						//Do nothing. Handled by Annotorious.
						break;
					default:
						break;
				}
			}
		} else {
			if ($target.hasClass('hotspot')){
				_onSelectHotspot($target);
			}
			//Hotzones are handleded using Annotorious events.
		}
	};


	/////////
	// Hotzones
	////////

	var _enableHotzones = function(){
		var $currentSlide = $(SM.Slides.getCurrentSlide());
		var currentSlideId = $currentSlide.attr("id");

		if((typeof slideData[currentSlideId] === "undefined")||(typeof slideData[currentSlideId].annotator === "undefined")){
			var imgBackground = $currentSlide.children("img.slide_background");
			if(imgBackground.length === 0){
				//No background
				_disableEditingMode("HOTZONE");
				return;
			}
			_createAnnotatorForSlide(currentSlideId);
		} 
		slideData[currentSlideId].annotator.setDrawingEnabled(true);
		slideData[currentSlideId].annotator.setUserSelectAction('NONE');
		slideData[currentSlideId].annotator.off('selectionChanged', _onAnnotationSelectionChange);
	};

	var _disableHotzones = function(){
		var currentSlideId = $(SM.Slides.getCurrentSlide()).attr("id");
		if((typeof slideData[currentSlideId] !== "undefined") && (typeof slideData[currentSlideId].annotator !== "undefined")){
			slideData[currentSlideId].annotator.setDrawingEnabled(false);
			slideData[currentSlideId].annotator.setUserSelectAction('EDIT');
			slideData[currentSlideId].annotator.on('selectionChanged', _onAnnotationSelectionChange);
		}
	};

	var _createAnnotatorForSlide = function(slideId){
		if(typeof slideData[slideId] === "undefined"){
			slideData[slideId] = _getDefaultSlideConfig();
		}
		if(typeof slideData[slideId].annotator !== "undefined"){
			return slideData[slideId].annotator; //already created
		}

		var $imgBackground = $("#" + slideId).children("img.slide_background");
		var annotator = Annotorious.createImageAnnotator($imgBackground.attr("id"), {
			drawingEnabled: false,
			drawingMode: "click",
			userSelectAction: 'EDIT',
			style: {
				fill: '#dddddd',
				fillOpacity: 0.25,
				stroke: '#000000',
				strokeWidth: 1
			}
		});
		annotator.setDrawingTool('polygon');
		annotator.on('createAnnotation', (annotation) => {
			slideData[slideId].hotzones[annotation.id] = {};
			_disableEditingMode("HOTZONE");
		});
		annotator.on('selectionChanged', _onAnnotationSelectionChange);
		
		slideData[slideId].annotator = annotator;
		return annotator;
	};

	var _onAnnotationSelectionChange = function(annotations){
		if(Array.isArray(annotations)){
			if (annotations.length === 1){
				//Annotation selected
				_onSelectHotzone(annotations[0].id);
			} 
			// if(annotations.length === 0){
			// 	//Annotation unselected
			// }
		}
	};

	var _onSelectHotzone = function(hotzoneId){
		currentHotzoneId = hotzoneId;
		SM.Editor.Tools.loadToolsForElement("hotzone");
	};


	/////
	// Hotspots
	/////

	var _onClickInHotspotMode = function(event){
		event.preventDefault();
		event.stopPropagation();

		var slide = SM.Slides.getCurrentSlide();
		var slideId = $(slide).attr("id");
		var hotspotId = SM.Utils.getId("hotspot-");
		var hotspotSize = 42;
		var rect = slide.getBoundingClientRect();
		var x = event.clientX - rect.left - hotspotSize/2;
		var y = event.clientY - rect.top - hotspotSize/2;
		
		_drawHotspot(slideId,hotspotId,x,y);
		_enableEditingMode("NONE");
	};

	var _drawHotspot = function(slideId,hotspotId,x,y,imgURL,lockAspectRatio,visibility,width,height,rotationAngle){
		if(typeof imgURL !== "string"){
			imgURL = SM.Screen.getDefaultHotspotImg();
		}
		if(typeof lockAspectRatio !== "boolean"){
			lockAspectRatio = true;
		}
		if(typeof width !== "number"){
			width = 42;
		}
		if(typeof height !== "number"){
			height = 42;
		}

		var rotationAngle = parseFloat(rotationAngle);
		if (typeof rotationAngle !== "number" || isNaN(rotationAngle) || rotationAngle < 0 || rotationAngle > 360) {
			rotationAngle = 0;
		}

		var screen = $("#"+slideId);
		var $hotspot = $('<img>', {
			src: imgURL,
			class: 'hotspot',
			id: hotspotId,
			rotationAngle: rotationAngle,
			css: {
				position: 'absolute',
				left: x,
				top: y,
				width: (width + "px"),
				height: (height + "px"),
				transform: "rotate(" + rotationAngle + "deg)"
			}
		}).appendTo(screen);
		_validateHotspotPosition($hotspot);

		if(typeof slideData[slideId] === "undefined"){
			slideData[slideId] = _getDefaultSlideConfig();
		}
		slideData[slideId].hotspots[hotspotId] = {};
		slideData[slideId].hotspots[hotspotId].lockAspectRatio = lockAspectRatio;
		slideData[slideId].hotspots[hotspotId].visibility = visibility;

		_enableDraggableHotspot($hotspot);
	};

	var _enableDraggableHotspot = function($hotspot){
		$hotspot.draggable({
			start: function(event, ui) {
				_onSelectHotspot($hotspot);
			},
			stop: function(event, ui) {
				_validateHotspotPosition($hotspot);
			}
		});
	};

	var _validateHotspotPosition = function($hotspot, margin = 4) {
		const $screen = $hotspot.parent();

		if (!$screen.is('article[type="screen"]')) {
		  return;
		}

		if (!_fullyInside($screen, $hotspot, margin)) {
			_moveInside($screen, $hotspot);
		}
	};

	var _fullyInside = function($container, $el, margin = 0) {
		const cw = $container.innerWidth();
		const ch = $container.innerHeight();
		const ew = $el.outerWidth();
		const eh = $el.outerHeight();
		const pos = $el.position();

		return (
			pos.left >= -margin &&
			pos.top  >= -margin &&
			(pos.left + ew) <= (cw + margin) &&
			(pos.top  + eh) <= (ch + margin)
		);
	};

	var _moveInside = function($container, $el, margin = 0) {
		const cw = $container.innerWidth();
		const ch = $container.innerHeight();
		const ew = $el.outerWidth();
		const eh = $el.outerHeight();
		let { left, top } = $el.position();

		left = Math.max(margin, Math.min(left, cw - ew - margin));
		top  = Math.max(margin, Math.min(top,  ch - eh - margin));

		//$el.css({ left, top });
		$el.stop(true).animate({ left, top }, 1000);
	};

	var refreshDraggables = function(screen){
		//Refresh hotspots
		$(screen).find('img.hotspot').each(function() {
			var $hotspot = $(this);
			_enableDraggableHotspot($hotspot);
		});
	};

	var copyHotspotConfig = function(oldScreenId,newScreenId,hotspotIdsMapping){
		if(slideData[newScreenId] === "undefined"){
			slideData[newScreenId] = _getDefaultSlideConfig();
		}
		if(slideData[oldScreenId] === "undefined"){
			//Nothing to copy
			return;
		}
		slideData[newScreenId] = JSON.parse(JSON.stringify(slideData[oldScreenId]));

		//Change ids in config
		//Hotspot ids
		for (var oldHotspotId in hotspotIdsMapping) {
			var newHotspotId = hotspotIdsMapping[oldHotspotId];
			var oldHotspotData = Object.assign({}, slideData[newScreenId].hotspots[oldHotspotId]);
			if((typeof oldHotspotData !== "undefined")&&(Object.keys(oldHotspotData).length > 0)){
				slideData[newScreenId].hotspots[newHotspotId] = oldHotspotData;
			}
			delete slideData[newScreenId].hotspots[oldHotspotId];
		}

		//Ids in actions
		for (var key in slideData[newScreenId].hotspots) {
			var hotspot = slideData[newScreenId].hotspots[key];
			if (Array.isArray(hotspot.actions)) {
				var nActions = hotspot.actions.length;
				for(var i=0; i<nActions; i++){
					var action = hotspot.actions[i];
					switch(action.actionType){
						case 'openView':
							//open the same view but in the copy screen
							if((action.actionParams)&&(typeof action.actionParams.view === "string")){
								var oldViewId = action.actionParams.view;
								if (oldViewId.startsWith(oldScreenId)) {
								  var newViewId = newScreenId + oldViewId.slice(oldScreenId.length);
								  slideData[newScreenId].hotspots[key].actions[i].actionParams.view = newViewId;
								}
							}
							break;
						case 'hideElement':
							//Keep behaviour if the hotspot hide itself
							if((action.actionParams)&&(typeof action.actionParams.elementId === "string")){
								var oldHotspotId = Object.keys(hotspotIdsMapping).find(k => hotspotIdsMapping[k] === key);
								if(action.actionParams.elementId === oldHotspotId){
									action.actionParams.elementId = key;
								}
							}
							break;
					}
				}
			}
		}
	};

	var _onSelectHotspot = function($hotspot){
		currentHotspot = $hotspot;
		SM.Editor.Tools.loadToolsForElement("hotspot");
	};

	var showHotspotSettings = function(){
		$(_hiddenLinkToInitHotspotSettings).trigger("click");
	};

	var _onStartHotspotSettingsFancybox = function(){
		var slideId = $(SM.Slides.getCurrentSlide()).attr("id");
		var $hotspot = $(currentHotspot);
		var hotspotId = $hotspot.attr("id");
		var hotspotSettings = slideData[slideId].hotspots[hotspotId];

		//ID
		$("#hotspotIdInput").val(hotspotId);

		//Image
		//Redraw gallery
		_drawHotspotGalleryCarousel(function(){
			$("#hotspotImageGallery img").removeClass("selected");
			var hotspotImageSource = $hotspot.attr("src");
			//Check if image belongs to gallery
			var imgGallery = $("#hotspotImageGallery").find("img[src='" + hotspotImageSource + "']")[0];
			if(typeof imgGallery === "undefined"){
				//Image does not belong to the gallery
				$("#hotspotImageURL").val(hotspotImageSource);
				$("#hotspotImageSource").val("url").trigger("change");
			} else {
				$(imgGallery).addClass("selected");
				$("#hotspotImageSource").val("gallery").trigger("change");
				SM.Editor.Carousel.goToElement("hotspotImageGallery",imgGallery);
			}
		});

		//Position
		//var hotspotPosition = $hotspot.position();
		var hotspotX = parseFloat($hotspot.css("left"));
		var hotspotY = parseFloat($hotspot.css("top"));
		$("#hotspotPositionX").val(hotspotX);
		$("#hotspotPositionY").val(hotspotY);

		//Size
		if(typeof slideData[slideId].hotspots[hotspotId].lockAspectRatio === "boolean"){
			$("#hotspotLockAspectRatio").prop("checked", slideData[slideId].hotspots[hotspotId].lockAspectRatio);
		}
		
		var hotspotWidth = $hotspot.width();
		var hotspotHeight = $hotspot.height();
		var hotspotAspectRatio = Math.round((hotspotWidth/hotspotHeight) * 100) / 100;
		$("#hotspotSizeWidth").val(hotspotWidth);
		$("#hotspotSizeHeight").val(hotspotHeight);
		$("#hotspotAspectRatio").val(hotspotAspectRatio);
		
		//Rotation
		var rotationAngle = $hotspot.attr("rotationAngle");
		if (!isNaN(rotationAngle) && rotationAngle >= 0 && rotationAngle <= 360) {
			$("#hotspotRotation").val(rotationAngle);
		} else {
			$("#hotspotRotation").val(0);
		}

		//Visibility
		if(typeof slideData[slideId].hotspots[hotspotId].visibility === "string"){
			$("#hotspotVisibility").val(slideData[slideId].hotspots[hotspotId].visibility);
		} else {
			$("#hotspotVisibility").val("visible");
		}

		//Actions

		//Remove prior actions
		$("div.hotspotActionWrapper:not(.hotspotActionWrapperTemplate)").remove();

		//Fill action template with current screens
		var currentOptionsScreens = [];
		$('article[type="screen"]').each(function() {
		  var $screen = $(this);
		  currentOptionsScreens.push({
		    value: $screen.attr('id'),
		    text: (SM.I18n.getTrans("i.ScreenOption", {number: $screen.attr('slidenumber')}))
		  });
		});

		$("div.hotspotActionParamsScreen select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsScreens, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});

		$("div.hotspotActionParamsScreenReplacement select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsScreens, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});

		//Fill action template with current views
		var currentOptionsViews = [];
		var currentOptionsScreenViews = [];
		var currentOptionsImageViews = [];

		var $currentScreen = $(SM.Screen.getCurrentScreen());
		var currentScreenId = $currentScreen.attr('id');
		$("article[type='screen'] > article").each(function(){
			var $view = $(this);
			var $screen = $(this).parent();
			var option = {
				value: $view.attr('id'),
				text: (SM.I18n.getTrans("i.ViewOption", {screenNumber: $screen.attr('slidenumber'), viewNumber: $view.attr('slidenumber')}))
			};
			currentOptionsViews.push(option);

			if($screen.attr('id') === currentScreenId){
				currentOptionsScreenViews.push(option);
			}
			if($view.attr("type") === SM.Constant.VIEW_IMAGE){
				currentOptionsImageViews.push(option);
			}
		});

		$("div.hotspotActionParamsView select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsScreenViews, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});

		//Fill action template with current slides with background (screens and image views)
		$("div.hotspotActionParamsSlide select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			//Fill with screens
			$.each(currentOptionsScreens, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
			//Fill with views
			$.each(currentOptionsImageViews, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});
		
		//Fill action template with current element ids (hotspots and hotzones)
		var currentOptionsElementIds = [];
		//Hotspots
		$('img.hotspot').each(function() {
		  var $hotspot = $(this);
		  currentOptionsElementIds.push({
		    value: $hotspot.attr('id'),
		    text: $hotspot.attr('id')
		  });
		});

		$("div.hotspotActionParamsElementId select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsElementIds, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});

		//Fill properties with hotspotSettings
		if (Array.isArray(hotspotSettings.actions) && hotspotSettings.actions.length > 0) {
			for(var i=0; i<hotspotSettings.actions.length; i++){
				var hotspotAction = hotspotSettings.actions[i];
				if((typeof hotspotAction.actionType === "string")&&(hotspotAction.actionType !== "none")){
					var $actionWrapper = onHotspotNewAction();
					$actionWrapper.find("select.hotspotActionType").val(hotspotAction.actionType).trigger('change');
					if(typeof hotspotAction.actionParams !== "undefined"){
						if(typeof hotspotAction.actionParams.screen === "string"){
							var $actionParamsScreenSelect = $actionWrapper.find("div.hotspotActionParamsScreen select");
							$actionParamsScreenSelect.val(hotspotAction.actionParams.screen);
						}
						if(typeof hotspotAction.actionParams.screenReplacement === "string"){
							var $actionParamsScreenSelectReplacement = $actionWrapper.find("div.hotspotActionParamsScreenReplacement select");
							$actionParamsScreenSelectReplacement.val(hotspotAction.actionParams.screenReplacement);
						}
						if(typeof hotspotAction.actionParams.view === "string"){
							var $actionParamsViewSelect = $actionWrapper.find("div.hotspotActionParamsView select");
							$actionParamsViewSelect.val(hotspotAction.actionParams.view);
						}
						if(typeof hotspotAction.actionParams.slide === "string"){
							var $actionParamsSlideSelect = $actionWrapper.find("div.hotspotActionParamsSlide select");
							$actionParamsSlideSelect.val(hotspotAction.actionParams.slide);
						}
						if(typeof hotspotAction.actionParams.text === "string"){
							var $actionParamsTextAreaText = $actionWrapper.find("div.hotspotActionParamsText textarea");
							$actionParamsTextAreaText.val(hotspotAction.actionParams.text);
						}
						if(typeof hotspotAction.actionParams.url === "string"){
							var $actionParamsUrlInput = $actionWrapper.find("div.hotspotActionParamsURL input");
							$actionParamsUrlInput.val(hotspotAction.actionParams.url);
						}
						if(typeof hotspotAction.actionParams.elementId === "string"){
							var $actionParamsElementIdSelect = $actionWrapper.find("div.hotspotActionParamsElementId select");
							$actionParamsElementIdSelect.val(hotspotAction.actionParams.elementId);
						}
						if(typeof hotspotAction.actionParams.puzzle === "string"){
							var $actionParamsPuzzleSelect = $actionWrapper.find("div.hotspotActionParamsPuzzle select");
							$actionParamsPuzzleSelect.val(hotspotAction.actionParams.puzzle);
						}
					}
				}
			}	
		}
	};

	var _drawHotspotGalleryCarousel = function(callback){
		_cleanHotspotGalleryCarousel();

		var hotspotGalleryImgs = [
			{ src: SM.ImagesPath + "hotspotgallery/hotspot.png" },
			{ src: SM.ImagesPath + "hotspotgallery/arrow.png" },
			{ src: SM.ImagesPath + "hotspotgallery/magnifying_glass.png" },
			{ src: SM.ImagesPath + "hotspotgallery/eye.png" },
			{ src: SM.ImagesPath + "hotspotgallery/hand.png" },
			{ src: SM.ImagesPath + "hotspotgallery/hand2.png" },
			{ src: SM.ImagesPath + "hotspotgallery/wheel.png" },
			{ src: SM.ImagesPath + "hotspotgallery/info.png" },
			{ src: SM.ImagesPath + "hotspotgallery/dialogue.png" },
			{ src: SM.ImagesPath + "hotspotgallery/dialogue2.png" },
			{ src: SM.ImagesPath + "hotspotgallery/pin.png" },
			{ src: SM.ImagesPath + "vicons/close.png" },
			{ src: SM.ImagesPath + "hotspotgallery/keypad_standard.png" },
			{ src: SM.ImagesPath + "hotspotgallery/keypad_retro.png" },
			{ src: SM.ImagesPath + "hotspotgallery/keypad_futuristic.png" },
		];

		var carouselImages = [];
		$.each(hotspotGalleryImgs, function(index, image){
			var myImg = $("<img src='" + image.src + "'/>");
			carouselImages.push(myImg);
		});

		var options = {};
		options.callback = _drawHotspotGalleryCarouselAfterLoadImages;
		options.afterDrawCarouselCallback = callback;
		SM.Editor.Utils.Loader.loadImagesOnContainer(carouselImages,"hotspotImageGallery",options);
	};

	var _drawHotspotGalleryCarouselAfterLoadImages = function(loadImagesOnContainerOptions){
		var $carouselDiv = $("#hotspotImageGallery");
		var $containerCarouselDiv = $carouselDiv.parent();
		$carouselDiv.show();
		SM.Utils.addTempShown([$containerCarouselDiv,$carouselDiv]);

		var options = new Array();
		options.rows = 1;
		//options.callback = _onClickCarouselElement;
		options.rowItems = 9;
		options.scrollItems = 9;
		//options.styleClass = "hotspotgallery";
		options.afterCreateCarruselFunction = function(){
			setTimeout(function(){
				SM.Utils.removeTempShown([$containerCarouselDiv,$carouselDiv]);
				if(typeof loadImagesOnContainerOptions.afterDrawCarouselCallback === "function"){
					loadImagesOnContainerOptions.afterDrawCarouselCallback();
				}
			},100);
		}
		SM.Editor.Carousel.createCarousel("hotspotImageGallery", options);
	};

	var _cleanHotspotGalleryCarousel = function(){
		SM.Editor.Carousel.cleanCarousel("hotspotImageGallery");
		$("#hotspotImageGallery").hide();
	};

	var onHotspotImageSourceChange = function(event){
		var option = event.target.value;
		if(option === "gallery"){
			var carouselWrapper = $("#hotspotImageGallery").parent().parent();
			$(carouselWrapper).show();
			$("#hotspotImageURLWrapper").hide();
			$("#hotspotImageURL").val("");
			checkHotspotImageURLPreview();
		} else if(option === "url"){
			var carouselWrapper = $("#hotspotImageGallery").parent().parent();
			$(carouselWrapper).hide();
			$("#hotspotImageURLWrapper").show();
			checkHotspotImageURLPreview();
		}
	};

	var checkHotspotImageURLPreview = function(){
		var $hotspotImageURLPreviewWrapper = $("#hotspotImageURLPreviewWrapper");
		var imgUrl = $("#hotspotImageURL").val();
		if((typeof imgUrl === "string")&&(imgUrl.trim() !== "")){
			$hotspotImageURLPreviewWrapper.html("<img src='" + imgUrl + "'>").show();
		} else {
			$hotspotImageURLPreviewWrapper.html("").hide();
		}
	};

	var onClickHotspotImageGallery = function(event){
		var $img = $(event.target);
		$("#hotspotImageGallery").find("img").removeClass("selected");
		$img.addClass("selected");
	};


	var onInputHotspotSizeWidth = function(event){
		var lockAspectRatio = $("#hotspotLockAspectRatio").prop("checked");
		if(lockAspectRatio){
			var aspectRatio = parseFloat($("#hotspotAspectRatio").val());
			$("#hotspotSizeHeight").val($("#hotspotSizeWidth").val()/aspectRatio);
		}
	};

	var onInputHotspotSizeHeight = function(event){
		var lockAspectRatio = $("#hotspotLockAspectRatio").prop("checked");
		if(lockAspectRatio){
			var aspectRatio = parseFloat($("#hotspotAspectRatio").val());
			$("#hotspotSizeWidth").val($("#hotspotSizeHeight").val()*aspectRatio);
		}
	};

	var onHotspotNewAction = function(){
		var $actionWrapperDiv = $(".hotspotActionWrapperTemplate").clone().removeClass("hotspotActionWrapperTemplate").show();
		$("#hotspotNewAction").closest(".new_hotspot_settings_field").append($actionWrapperDiv);
		return $actionWrapperDiv;
	};

	var onHotspotDeleteAction = function(event){
		$(event.target).closest(".hotspotActionWrapper").remove();
	};

	var onHotspotPuzzleChange = function(event){
		var option = event.target.value;
		var $actionWrapperDiv = $(event.target).closest("div.hotspotActionWrapper");
		var $inputPuzzleSolutionWrapper = $actionWrapperDiv.find("div.hotspotActionParamsPuzzleSolution");
		var $inputPuzzleSolution = $inputPuzzleSolutionWrapper.find("input");
		if(option != "none"){
			$inputPuzzleSolution.val($("#hotspotIdInput").val());
			$inputPuzzleSolutionWrapper.show();
		} else {
			$inputPuzzleSolution.val();
			$inputPuzzleSolutionWrapper.hide();
		}
	};

	var onHotspotActionChange = function(event){
		var option = event.target.value;
		var $actionWrapperDiv = $(event.target).closest("div.hotspotActionWrapper");
		var $selectScreenWrapper = $actionWrapperDiv.find("div.hotspotActionParamsScreen");
		var $selectScreen = $selectScreenWrapper.find("select");
		var $selectScreenReplacementWrapper = $actionWrapperDiv.find("div.hotspotActionParamsScreenReplacement");
		var $selectScreenReplacement = $selectScreenReplacementWrapper.find("select");
		var $selectViewWrapper = $actionWrapperDiv.find("div.hotspotActionParamsView");
		var $selectView = $selectViewWrapper.find("select");
		var $selectSlideWrapper = $actionWrapperDiv.find("div.hotspotActionParamsSlide");
		var $selectSlide = $selectSlideWrapper.find("select");
		var $textAreaTextWrapper = $actionWrapperDiv.find("div.hotspotActionParamsText");
		var $textAreaText = $textAreaTextWrapper.find("textarea");
		var $inputURLWrapper = $actionWrapperDiv.find("div.hotspotActionParamsURL");
		var $inputURL = $inputURLWrapper.find("input");
		var $selectElementIdWrapper = $actionWrapperDiv.find("div.hotspotActionParamsElementId");
		var $selectElementId = $selectElementIdWrapper.find("select");
		var $selectPuzzleWrapper = $actionWrapperDiv.find("div.hotspotActionParamsPuzzle");
		var $selectPuzzle = $selectPuzzleWrapper.find("select");
		var $inputPuzzleSolutionWrapper = $actionWrapperDiv.find("div.hotspotActionParamsPuzzleSolution");
		
		if((option === "goToScreen")||(option === "changeScreen")){
			$selectScreen.prop("selectedIndex", 0);
			$selectScreenWrapper.show();
		} else {
			$selectScreenWrapper.hide();
		}
		if(option === "changeScreen"){
			$selectScreenReplacement.prop("selectedIndex", 0);
			$selectScreenReplacementWrapper.show();
		} else {
			$selectScreenReplacementWrapper.hide();
		}
		if(option === "openView"){
			$selectView.prop("selectedIndex", 0);
			$selectViewWrapper.show();
		} else {
			$selectViewWrapper.hide();
		}
		if(option === "changeBackground"){
			$selectSlide.prop("selectedIndex", 0);
			$selectSlideWrapper.show();
		} else {
			$selectSlideWrapper.hide();
		}
		if(option === "showText"){
			$textAreaText.val("");
			$textAreaTextWrapper.show();
		} else {
			$textAreaTextWrapper.hide();
		}
		if((option === "openLink")||(option === "changeBackground")||(option === "playSound")||(option === "stopSound")){
			$inputURL.val("");
			$inputURLWrapper.show();
		} else {
			$inputURLWrapper.hide();
		}
		if((option === "showElement")||(option === "hideElement")){
			$selectElementId.prop("selectedIndex", 0);
			$selectElementIdWrapper.show();
		} else {
			$selectElementIdWrapper.hide();
		}
		if(option === "solvePuzzle"){
			$selectPuzzle.prop("selectedIndex", 0);
			$selectPuzzleWrapper.show();
		} else {
			$selectPuzzleWrapper.hide();
		}
		$inputPuzzleSolutionWrapper.hide();
	};

	var onHotspotSettingsDone = function(event){
		var slideId = $(SM.Slides.getCurrentSlide()).attr("id");
		var $hotspot = $(currentHotspot);
		var hotspotId = $hotspot.attr("id");
		var hotspotSettings = {};

		//Hotspot image
		var hotspotImg;
		switch($("#hotspotImageSource").val()){
			case "gallery":
				var $selectedGalleryImg = $("#hotspotImageGallery img.selected");
				if ($selectedGalleryImg.length) {
					hotspotImg = $selectedGalleryImg.attr("src");
				}
				break;
			case "url":
				hotspotImg = $("#hotspotImageURL").val();
				break;
			default:
				break;
		}
		if(typeof hotspotImg !== "string"){
			hotspotImg = SM.Screen.getDefaultHotspotImg();
		}
		$hotspot.attr("src", hotspotImg);

		//Hotspot position
		var hotspotX = parseFloat($("#hotspotPositionX").val());
		var hotspotY = parseFloat($("#hotspotPositionY").val());
		if((typeof hotspotX === "number")&&(!Number.isNaN(hotspotX))&&(hotspotX >= 0)){
			$hotspot.css("left",hotspotX + "px");
		}
		if((typeof hotspotY === "number")&&(!Number.isNaN(hotspotY))&&(hotspotY >= 0)){
			$hotspot.css("top",hotspotY + "px");
		}

		//Hotspot size
		hotspotSettings.lockAspectRatio = $("#hotspotLockAspectRatio").prop("checked");
		var hotspotWidth = $("#hotspotSizeWidth").val();
		var hotspotHeight = $("#hotspotSizeHeight").val();
		if(hotspotWidth > 0){
			$hotspot.width(hotspotWidth);
		}
		if(hotspotHeight > 0){
			$hotspot.height(hotspotHeight);
		}

		//Hotspot rotation
		var rotationAngle = parseFloat($("#hotspotRotation").val());
		if (!isNaN(rotationAngle) && rotationAngle >= 0 && rotationAngle <= 360) {
		  	$hotspot.attr("rotationAngle",rotationAngle);
			$hotspot.css("transform", "rotate(" + rotationAngle + "deg)");
		}

		//Hotspot visibility
		hotspotSettings.visibility = $("#hotspotVisibility").val();

		//Validate position
		_validateHotspotPosition($hotspot);

		//Hotspot actions
		var actions = [];

		$("div.hotspotActionWrapper").each(function(index, element) {
			var $actionWrapper = $(this);
			var actionType = $actionWrapper.find("select.hotspotActionType").val();
			if(actionType !== "none"){
				var action = {actionType: actionType, actionParams: {}};
				var $actionParamsScreenSelect = $actionWrapper.find("div.hotspotActionParamsScreen select");
				if($actionParamsScreenSelect.is(":visible")){
					action.actionParams.screen = $actionParamsScreenSelect.val();
				}
				var $actionParamsScreenReplacementSelect = $actionWrapper.find("div.hotspotActionParamsScreenReplacement select");
				if($actionParamsScreenReplacementSelect.is(":visible")){
					action.actionParams.screenReplacement = $actionParamsScreenReplacementSelect.val();
				}
				var $actionParamsViewSelect = $actionWrapper.find("div.hotspotActionParamsView select");
				if($actionParamsViewSelect.is(":visible")){
					action.actionParams.view = $actionParamsViewSelect.val();
				}
				var $actionParamsSlideSelect = $actionWrapper.find("div.hotspotActionParamsSlide select");
				if($actionParamsSlideSelect.is(":visible")){
					action.actionParams.slide = $actionParamsSlideSelect.val();
				}
				var $actionParamsTextAreaText = $actionWrapper.find("div.hotspotActionParamsText textarea");
				if($actionParamsTextAreaText.is(":visible")){
					action.actionParams.text = $actionParamsTextAreaText.val();
				}
				var $actionParamsUrlInput = $actionWrapper.find("div.hotspotActionParamsURL input");
				if($actionParamsUrlInput.is(":visible")){
					action.actionParams.url = SM.Editor.Utils.autocompleteUrls($actionParamsUrlInput.val());
				}
				var $actionParamsElementIdSelect = $actionWrapper.find("div.hotspotActionParamsElementId select");
				if($actionParamsElementIdSelect.is(":visible")){
					action.actionParams.elementId = $actionParamsElementIdSelect.val();
				}
				var $actionParamsPuzzleSelect = $actionWrapper.find("div.hotspotActionParamsPuzzle select");
				if($actionParamsPuzzleSelect.is(":visible")){
					action.actionParams.puzzle = $actionParamsPuzzleSelect.val();
				}
				if (Object.keys(action.actionParams).length === 0) {
					delete action.actionParams;
				}
				actions.push(action);
			}
		});

		if(actions.length > 0){
			hotspotSettings.actions = actions;
		}

		slideData[slideId].hotspots[hotspotId] = hotspotSettings;

		$.fancybox.close();
	};


	////////////////////
	// JSON Manipulation
	////////////////////


	////////////////////
	// Getters & setters
	////////////////////

	var getCurrentHotspot = function(){
		return currentHotspot;
	};

	var setCurrentHotspot = function(newHotspot){
		currentHotspot = newHotspot;
	};

	var getCurrentHotzoneId = function(){
		return currentHotzoneId;
	};

	var setCurrentHotzoneId = function(newHotszoneId){
		currentHotzoneId = newHotszoneId;
	};

	////////////////////
	// Delete
	////////////////////

	var deleteCurrentHotmarker = function(){
		var isDeletingHotspot;
		if(typeof currentHotspot !== "undefined"){
			isDeletingHotspot = true;
		} else {
			if(typeof currentHotzoneId === "undefined"){
				//No current element
				return;
			}
		}

		var options = {};
		options.width = 375;
		options.height = 130;
		if(isDeletingHotspot){
			options.text = SM.I18n.getTrans("i.AreYouSureDeleteHotspot");
			options.notificationIconSrc = $(currentHotspot).attr("src");
			options.notificationIconClass = "notificationIconDeleteHotspot";
		} else {
			options.text = SM.I18n.getTrans("i.AreYouSureDeleteHotzone");
			options.notificationIconSrc = SM.ImagesPath + "thumbs/hotzone.png";
		}
		
		var button1 = {};
		button1.text = SM.I18n.getTrans("i.no");
		button1.callback = function(){
			$.fancybox.close();
		}
		var button2 = {};
		button2.text = SM.I18n.getTrans("i.delete");
		button2.callback = function(){
			var currentSlideId = $(SM.Slides.getCurrentSlide()).attr("id");
			if(isDeletingHotspot){
				//Delete current hotspot
				var $hotspot = $(currentHotspot);
				var hotspotId = $hotspot.attr("id");
				$hotspot.remove();
				delete slideData[currentSlideId].hotspots[hotspotId];
				currentHotspot = undefined;
			} else {
				//Delete current hotzone
				var annotator = slideData[currentSlideId].annotator;
				if(typeof annotator !== "undefined"){
					//Remove hotzone using Annotorious
					annotator.removeAnnotation(currentHotzoneId);
				}
				delete slideData[currentSlideId].hotzones[currentHotzoneId];
				currentHotzoneId = undefined;
			}
			SM.Editor.Tools.cleanToolbar();
			$.fancybox.close();
		}
		options.buttons = [button1,button2];
		SM.Utils.showDialog(options);
	};

	var saveSlideWithMarkers = function(slideDOM){
		var slide = {};
		slide.id = $(slideDOM).attr('id');
		slide.type = $(slideDOM).attr('type');

		var slideBackground = SM.Editor.Slides.getSlideBackground(slideDOM);
		if(typeof slideBackground === "string"){
			slide.background = slideBackground;
		}

		if(typeof slideData[slide.id] !== "undefined"){
			//Hotspots
			var hotspotsIds = Object.keys(slideData[slide.id].hotspots);
			if(hotspotsIds.length > 0) {
				slide.hotspots = [];
				hotspotsIds.forEach(hotspotId => {
					var hotspotDOM = $("img.hotspot[id='" + hotspotId + "']");
					//var hotspotPosition = $(hotspotDOM).position();
					//var hotspotX = hotspotPosition.left;
					//var hotspotY = hotspotPosition.top;
					var hotspotX = parseFloat(hotspotDOM.css("left"));
					var hotspotY = parseFloat(hotspotDOM.css("top"));

					var hotspotSettings = slideData[slide.id].hotspots[hotspotId];

					//Transform dimensions to percentage instead of absolute numbers.
					//If aspect ratio is 4:3, dimensions are calculated for a container with dimensions 800x600
					//If aspect ratio is 16:9, dimensions are calculated for a container with dimensions 1024x576
					var slideContainerWidth;
					var slideContainerHeight;
					if($("body").attr("aspectRatio")==="16:9"){
						slideContainerWidth = 1024;
						slideContainerHeight = 576;
					} else {
						slideContainerWidth = 800;
						slideContainerHeight = 600;
					}

					var hotspotAdaptiveX = (hotspotX*100/slideContainerWidth).toFixed(4);
					var hotspotAdaptiveY = (hotspotY*100/slideContainerHeight).toFixed(4);
					var hotspotAdaptiveWidth = (hotspotDOM.width()*100/slideContainerWidth).toFixed(4);
					var hotspotAdaptiveHeight = (hotspotDOM.height()*100/slideContainerHeight).toFixed(4);

					var hotspotJSON = {
						"id": hotspotId,
						"x": hotspotAdaptiveX,
						"y": hotspotAdaptiveY,
						"image": hotspotDOM.attr("src"),
						"width": hotspotAdaptiveWidth,
						"height": hotspotAdaptiveHeight,
						"lockAspectRatio": hotspotSettings.lockAspectRatio,
						"rotationAngle": hotspotDOM.attr("rotationAngle"),
						"visibility": hotspotSettings.visibility,
					};

					if (Array.isArray(hotspotSettings.actions) && hotspotSettings.actions.length > 0) {
						hotspotJSON.actions = hotspotSettings.actions;
					}
					slide.hotspots.push(hotspotJSON);
				});
			}

			//Hotzones
			var hotzonesIds = Object.keys(slideData[slide.id].hotzones);
			var annotator = slideData[slide.id].annotator;
			if((hotzonesIds.length > 0)&&(typeof annotator !== "undefined")) {
				slide.hotzones = [];
				hotzonesIds.forEach(hotzoneId => {
					//var hotzoneDOM = $("[data-id=" + hotzoneId + "]");
					var annotation = annotator.getAnnotationById(hotzoneId);
					var points = annotation.target.selector.geometry.points;
					var hotzoneJSON = {
						"id": hotzoneId,
						"points": points,
					};

					var hotzoneSettings = slideData[slide.id].hotzones[hotzoneId];
					//console.log("hotzoneSettings", hotzoneSettings);
					if (Array.isArray(hotzoneSettings.actions) && hotzoneSettings.actions.length > 0) {
						hotzoneJSON.actions = hotzoneSettings.actions;
					}

					slide.hotzones.push(hotzoneJSON);
				});
			}
			
		}

		return slide;
	};

	return {
		init 							: init,
		drawSlideWithMakers				: drawSlideWithMakers,
		drawHotspots 					: drawHotspots,
		drawHotzones					: drawHotzones,
		refreshDraggables				: refreshDraggables,
		copyHotspotConfig				: copyHotspotConfig,
		addHotspot						: addHotspot,
		addHotzone						: addHotzone,
		onClick 						: onClick,
		showHotspotSettings				: showHotspotSettings,
		getCurrentHotspot				: getCurrentHotspot,
		getCurrentHotzoneId				: getCurrentHotzoneId,
		setCurrentHotspot				: setCurrentHotspot,
		setCurrentHotzoneId				: setCurrentHotzoneId,
		deleteCurrentHotmarker			: deleteCurrentHotmarker,
		onHotspotNewAction				: onHotspotNewAction,
		onHotspotDeleteAction			: onHotspotDeleteAction,
		onHotspotActionChange			: onHotspotActionChange,
		onHotspotPuzzleChange			: onHotspotPuzzleChange,
		onHotspotImageSourceChange		: onHotspotImageSourceChange,
		onClickHotspotImageGallery		: onClickHotspotImageGallery,
		checkHotspotImageURLPreview		: checkHotspotImageURLPreview,
		onInputHotspotSizeWidth			: onInputHotspotSizeWidth,
		onInputHotspotSizeHeight		: onInputHotspotSizeHeight,
		onHotspotSettingsDone			: onHotspotSettingsDone,
		saveSlideWithMarkers			: saveSlideWithMarkers
	};

}) (SceneMaker, jQuery);