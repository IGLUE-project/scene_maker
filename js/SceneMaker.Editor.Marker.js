SceneMaker.Editor.Marker = (function(SM,$,undefined){
	var slideData;
	var currentHotspot;
	var currentHotzoneId;
	var hotzoneIdsAlias;
	var currentEditingMode = "NONE"; //Can be "NONE", "HOTSPOT" or "HOTZONE".
	var hiddenLinkToInitHotspotSettings;
	var hiddenLinkToInitHotzoneSettings;

	var init = function(){
		slideData = {};
		hotzoneIdsAlias = {};

		//Hotspot Settings
		hiddenLinkToInitHotspotSettings = $('<a href="#hotspotSettings_fancybox" style="display:none"></a>');
		$(hiddenLinkToInitHotspotSettings).fancybox({
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

		//Hotzone Settings
		hiddenLinkToInitHotzoneSettings = $('<a href="#hotzoneSettings_fancybox" style="display:none"></a>');
		$(hiddenLinkToInitHotzoneSettings).fancybox({
			'autoDimensions' : false,
			'height': 690,
			'width': 920,
			'scrolling': 'no',
			'showCloseButton': false,
			'padding' : 0,
			"onStart"  : function(data){
				_onStartHotzoneSettingsFancybox();
			},
			"onComplete" : function(data){
			},
			"onClosed"  : function(data){
			}
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
			_drawHotzones(slideJSON.id,slideJSON.hotzones);
			_drawHotspots(slideJSON.id,slideJSON.hotspots);
		}
	};

	var _drawHotspots = function(slideId,hotspots){
		if (Array.isArray(hotspots)) {
			hotspots.forEach(function(hotspot, index) {
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

				_drawHotspot(slideId,hotspot.id,hotspotX,hotspotY,hotspot.image,hotspot.lockAspectRatio,hotspot.visibility,hotspotWidth,hotspotHeight,hotspot.rotationAngle);
				if (Array.isArray(hotspot.actions)&&hotspot.actions.length>0) {
					slideData[slideId].hotspots[hotspot.id].actions = hotspot.actions;
				}
			});
		}
	};

	var _drawHotzones = function(slideId,hotzones){
		if (Array.isArray(hotzones)) {
			$(hotzones).each(function(index,hotzoneJSON){
				_drawHotzone(slideId,hotzoneJSON);
			});
		}
	};

	var _drawHotzone = function(slideId,hotzoneJSON){
		if(Array.isArray(hotzoneJSON.points)){
			var hotzoneId;
			if(typeof hotzoneJSON.id === "string"){
				hotzoneId = hotzoneJSON.id;
			} else {
				hotzoneId = SM.Utils.getId("annotation-");
			}
			var hotzoneIdAlias;
			if(typeof hotzoneJSON.id_alias === "string"){
				hotzoneIdAlias = hotzoneJSON.id_alias;
			} else {
				hotzoneIdAlias = SM.Utils.getId("zone-");
			}
			hotzoneIdsAlias[hotzoneId] = hotzoneIdAlias;
			SM.Utils.registerId(hotzoneIdAlias);

			var annotation = SM.Marker.createAnnotationFromPointsArray(hotzoneId,hotzoneJSON.points);
			var annotator = _createAnnotatorForSlide(slideId);
			annotator.addAnnotation(annotation);
			slideData[slideId].hotzones[hotzoneId] = {};
			slideData[slideId].hotzones[hotzoneId].visibility = hotzoneJSON.visibility;
			slideData[slideId].hotzones[hotzoneId].enabled = hotzoneJSON.enabled;
			if (Array.isArray(hotzoneJSON.actions)&&(hotzoneJSON.actions.length>0)) {
				slideData[slideId].hotzones[hotzoneId].actions = hotzoneJSON.actions;
			}
		}
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
				setCurrentHotspot(undefined);
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
				//Click outside a slide
				_enableEditingMode("NONE");
			} else {
				//Click inside a slide
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
			imgURL = SM.Marker.getDefaultHotspotImg();
		}
		if(typeof lockAspectRatio !== "boolean"){
			lockAspectRatio = true;
		}
		if(typeof visibility !== "string"){
			visibility = "visible";
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

		var $slide = $("#"+slideId);
		var $imgBackground = SM.Slides.getSlideBackgroundImg($slide);
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
		}).appendTo($imgBackground.parent());
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

	var _validateHotspotPosition = function($hotspot, margin = 15) {
		const $slide = $hotspot.parent();
		if (_fullyOutside($slide, $hotspot, margin)) {
			_moveInside($slide, $hotspot);
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

	var _fullyOutside = function($container, $el, margin = 0) {
		const cw = $container.innerWidth();
		const ch = $container.innerHeight();
		const ew = $el.outerWidth();
		const eh = $el.outerHeight();
		const pos = $el.position();

		return (
			pos.left + ew <= +margin ||
			pos.top + eh <= +margin ||
			pos.left >= cw - margin ||
			pos.top >= ch - margin
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

	var refreshDraggables = function(slide){
		//Refresh hotspots
		$(slide).find('img.hotspot').each(function() {
			var $hotspot = $(this);
			_enableDraggableHotspot($hotspot);
		});
	};

	var copyMarkers = function(oldScreenId,newScreenId){
		_copyMarkersInSlide(oldScreenId,newScreenId);
		$("#"+newScreenId).children("article").each(function(index, view) {
			var newViewId = $(view).attr("id");
			var oldViewId = oldScreenId + newViewId.slice(newScreenId.length);
			_copyMarkersInSlide(oldViewId,newViewId);
		});
	};

	var _copyMarkersInSlide = function(oldSlideId,newSlideId){
		if(typeof slideData[newSlideId] === "undefined"){
			slideData[newSlideId] = _getDefaultSlideConfig();
		}
		if(typeof slideData[oldSlideId] === "undefined"){
			//Nothing to copy
			return;
		}

		slideData[newSlideId] = JSON.parse(JSON.stringify(slideData[oldSlideId]));
		var $newSlide = $("#" + newSlideId);
		
		//Undo annotator
		if(typeof slideData[newSlideId].annotator !== "undefined"){
			delete slideData[newSlideId].annotator;
			slideData[newSlideId].hotzones = {};
			var $imgBackground = SM.Slides.getSlideBackgroundImg($newSlide);
			$imgBackground.parent("div[data-theme]").remove();
			$imgBackground.prependTo($newSlide);
		}

		//Change hotspot ids in config
		var hotspotIdsMapping = {};
		$newSlide.children("img.hotspot").each(function(index, hotspot){
			var oldHotspotId = $(hotspot).attr("id");
			var newHotspotId = SM.Utils.getId("hotspot-");
			$(hotspot).attr("id",newHotspotId);
			hotspotIdsMapping[oldHotspotId] = newHotspotId;
		});

		for (var oldHotspotId in hotspotIdsMapping) {
			var newHotspotId = hotspotIdsMapping[oldHotspotId];
			var oldHotspotData = Object.assign({}, slideData[newSlideId].hotspots[oldHotspotId]);
			if((typeof oldHotspotData !== "undefined")&&(Object.keys(oldHotspotData).length > 0)){
				slideData[newSlideId].hotspots[newHotspotId] = oldHotspotData;
			}
			delete slideData[newSlideId].hotspots[oldHotspotId];
		}

		//Change hotzone ids in config
		var oldSlideJSON = saveSlideWithMarkers($("#"+oldSlideId));
		var hotzones = oldSlideJSON.hotzones;
		var hotzoneIdsMapping = {};
		for (var i = 0; i < hotzones.length; i++) {
			var oldHotzoneId = hotzones[i].id;
			hotzones[i].id = SM.Utils.getId("annotation-");
			hotzoneIdsMapping[oldHotzoneId] = hotzones[i].id;
			delete hotzones[i].id_alias;
		}

		//Change ids in hotspot actions
		for (var hotspotId in slideData[newSlideId].hotspots) {
			var hotspot = slideData[newSlideId].hotspots[hotspotId];
			slideData[newSlideId].hotspots[hotspotId].actions = _changeIdsInActions(hotspot.actions,hotspotId,oldSlideId,newSlideId,hotspotIdsMapping,hotzoneIdsMapping);
		}
		//Change ids in hotzone actions
		for (var j = 0; j < hotzones.length; j++) {
			hotzones[j].actions = _changeIdsInActions(hotzones[j].actions,hotzones[j].id,oldSlideId,newSlideId,hotspotIdsMapping,hotzoneIdsMapping);
		}

		if (Array.isArray(hotzones) && hotzones.length > 0) {
			_drawHotzones(newSlideId,hotzones);
		}
	};

	var _changeIdsInActions = function(actions,elementId,oldSlideId,newSlideId,hotspotIdsMapping,hotzoneIdsMapping){
		if (Array.isArray(actions)) {
			var nActions = actions.length;
			for(var i=0; i<nActions; i++){
				var action = actions[i];
				switch(action.actionType){
					case 'openView':
						//open the same view but in the copy screen
						if((action.actionParams)&&(typeof action.actionParams.view === "string")){
							var oldViewId = action.actionParams.view;
							var newViewId;
							if (oldViewId.startsWith(oldSlideId)) {
								//newSlide is a screen containing a copy of oldView
								newViewId = newSlideId + oldViewId.slice(oldSlideId.length);
							} else if(oldViewId.split("_")[0] === oldSlideId.split("_")[0]){
								//newSlide is a view of a screen containing a copy of oldView
								var screenId = newSlideId.split("_")[0];
								newViewId = screenId + oldViewId.slice(screenId.length);
							}
							if(typeof newViewId === "string"){
								actions[i].actionParams.view = newViewId;
							}
						}
						break;
					case 'showHotspot':
					case 'hideHotspot':
						//Keep behaviour if the target hotspot belongs to the old slide
						if((action.actionParams)&&(typeof action.actionParams.hotspotId === "string")){
							var targetHotspotId = action.actionParams.hotspotId;						
							var targetHotspotBelongsToOldSlideId = (Object.keys(hotspotIdsMapping).includes(targetHotspotId));
							if(targetHotspotBelongsToOldSlideId){
								action.actionParams.hotspotId = hotspotIdsMapping[targetHotspotId];
							}
						}
						break;
					case 'enableHotzone':
					case 'disableHotzone':
						//Keep behaviour if the target hotzone belongs to the old slide
						if((action.actionParams)&&(typeof action.actionParams.hotzoneId === "string")){
							var targetHotzoneId = action.actionParams.hotzoneId;						
							var targetHotzoneBelongsToOldSlideId = (Object.keys(hotzoneIdsMapping).includes(targetHotzoneId));
							if(targetHotzoneBelongsToOldSlideId){
								action.actionParams.hotzoneId = hotzoneIdsMapping[targetHotzoneId];
							}
						}
						break;
				}
			}
		}
		return actions;
	};

	var _onSelectHotspot = function($hotspot){
		setCurrentHotspot($hotspot);
		SM.Editor.Tools.loadToolsForElement("hotspot");
	};

	var showHotspotSettings = function(){
		$(hiddenLinkToInitHotspotSettings).trigger("click");
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
		SM.Editor.Actions.loadActions($("#hotspotActions"),hotspotSettings,"HOTSPOT");
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
			{ src: SM.ImagesPath + "hotspotgallery/close.png" },
			{ src: SM.ImagesPath + "hotspotgallery/key.png" },
			{ src: SM.ImagesPath + "hotspotgallery/painting.png" },
			{ src: SM.ImagesPath + "hotspotgallery/keypad_standard.png" },
			{ src: SM.ImagesPath + "hotspotgallery/keypad_retro.png" },
			{ src: SM.ImagesPath + "hotspotgallery/keypad_futuristic.png" },
			{ src: SM.ImagesPath + "hotspotgallery/decoderdisk_standard.png" },
			{ src: SM.ImagesPath + "hotspotgallery/decoderdisk_basic.png" },
			{ src: SM.ImagesPath + "hotspotgallery/decoderdisk_retro.png" },
			{ src: SM.ImagesPath + "hotspotgallery/decoderdisk_futuristic.png" },
			{ src: SM.ImagesPath + "hotspotgallery/safebox_standard.png" },
			{ src: SM.ImagesPath + "hotspotgallery/safebox_retro.png" },
			{ src: SM.ImagesPath + "hotspotgallery/safebox_futuristic.png" },
			{ src: SM.ImagesPath + "hotspotgallery/signal_generator.png" },
			{ src: SM.ImagesPath + "hotspotgallery/basic_switch_off.png" },
			{ src: SM.ImagesPath + "hotspotgallery/basic_switch_on.png" },
			{ src: SM.ImagesPath + "hotspotgallery/retro_switch_off.png" },
			{ src: SM.ImagesPath + "hotspotgallery/retro_switch_on.png" },
			
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
			hotspotImg = SM.Marker.getDefaultHotspotImg();
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
		var actions = SM.Editor.Actions.getActionsJSON($("#hotspotActions"));
		if(actions.length > 0){
			hotspotSettings.actions = actions;
		}

		slideData[slideId].hotspots[hotspotId] = hotspotSettings;

		$.fancybox.close();
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
		
		$currentSlide.find("div > svg.a9s-annotationlayer").css("pointer-events","auto");
		slideData[currentSlideId].annotator.setDrawingEnabled(true);
		slideData[currentSlideId].annotator.setUserSelectAction('NONE');
		slideData[currentSlideId].annotator.off('selectionChanged', _onAnnotationSelectionChange);
	};

	var _disableHotzones = function(){
		var $currentSlide = $(SM.Slides.getCurrentSlide());
		var currentSlideId = $currentSlide.attr("id");
		$currentSlide.find("div > svg.a9s-annotationlayer").css("pointer-events","none");
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

		var $slide = $("#" + slideId);
		var $imgBackground = SM.Slides.getSlideBackgroundImg($slide);
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
			hotzoneIdsAlias[annotation.id] = SM.Utils.getId("zone-");
			slideData[slideId].hotzones[annotation.id] = {};
			slideData[slideId].hotzones[annotation.id].visibility = "hidden";
			slideData[slideId].hotzones[annotation.id].enabled = true;
			_disableEditingMode("HOTZONE");
		});
		annotator.on('selectionChanged', _onAnnotationSelectionChange);

		//Move hotspots inside the annotator div
		var $container = $($slide.find("div > svg.a9s-annotationlayer").parent());
		$slide.children("img.hotspot").each(function(index,hotspotDOM){
			$container.append(hotspotDOM);
		});
		
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

	var showHotzoneSettings = function(){
		$(hiddenLinkToInitHotzoneSettings).trigger("click");
	};

	var _onStartHotzoneSettingsFancybox = function(){
		var slideId = $(SM.Slides.getCurrentSlide()).attr("id");
		var hotzoneId = currentHotzoneId;
		var hotzoneSettings = slideData[slideId].hotzones[hotzoneId];

		//ID
		$("#hotzoneIdInput").val(hotzoneIdsAlias[hotzoneId]);

		//Visibility
		if(typeof slideData[slideId].hotzones[hotzoneId].visibility === "string"){
			$("#hotzoneVisibility").val(slideData[slideId].hotzones[hotzoneId].visibility);
		} else {
			$("#hotzoneVisibility").val("hidden");
		}

		//Enabled
		if(slideData[slideId].hotzones[hotzoneId].enabled === false){
			$("#hotzoneEnabled").val("false");
		} else {
			$("#hotzoneEnabled").val("true");
		}

		//Actions
		SM.Editor.Actions.loadActions($("#hotzoneActions"),hotzoneSettings,"HOTZONE");
	};

	var onHotzoneSettingsDone = function(event){
		var slideId = $(SM.Slides.getCurrentSlide()).attr("id");
		var hotzoneId = currentHotzoneId;
		var hotzoneSettings = {};

		//Hotzone visibility
		hotzoneSettings.visibility = $("#hotzoneVisibility").val();

		//Hotzone enabled
		hotzoneSettings.enabled = !($("#hotzoneEnabled").val()==="false");

		//Hotzone actions
		var actions = SM.Editor.Actions.getActionsJSON($("#hotzoneActions"));
		if(actions.length > 0){
			hotzoneSettings.actions = actions;
		}

		slideData[slideId].hotzones[hotzoneId] = hotzoneSettings;

		$.fancybox.close();
	};


	////////////////////
	// Getters & setters
	////////////////////

	var getSlideData = function(){
		return slideData;
	};

	var getCurrentHotspot = function(){
		return currentHotspot;
	};

	var setCurrentHotspot = function(newHotspot){
		currentHotspot = newHotspot;
		$("img.hotspot").removeClass("hotspot_selected");
		if(typeof newHotspot !== "undefined"){
			$(newHotspot).addClass("hotspot_selected");
		}
	};

	var getCurrentHotzoneId = function(){
		return currentHotzoneId;
	};

	var setCurrentHotzoneId = function(newHotzoneId){
		currentHotzoneId = newHotzoneId;
		if(typeof newHotzoneId === "undefined"){
			cancelAnnotationSelectedForSlide($(SM.Slides.getCurrentSlide()).attr("id"));
		}
	};

	var getAliasForHotzone = function(hotzoneId){
		return hotzoneIdsAlias[hotzoneId];
	};

	var cancelAnnotationSelectedForSlide = function(slideId){
		if((typeof slideData[slideId] !== "undefined")&&(typeof slideData[slideId].annotator !== "undefined")){
			slideData[slideId].annotator.cancelSelected();
		}
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
				setCurrentHotspot(undefined);
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


	////////////////////
	// JSON Manipulation
	////////////////////

	var saveSlideWithMarkers = function(slideDOM){
		var slide = {};
		slide.id = $(slideDOM).attr('id');
		slide.type = $(slideDOM).attr('type');

		var slideBackground = SM.Slides.getSlideBackground(slideDOM);
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
			var annotator = slideData[slide.id].annotator;
			if(typeof annotator !== "undefined") {
				var annotations = annotator.getAnnotations();
				if(annotations.length > 0){
					slide.hotzones = [];
		
					annotations.forEach(annotation => {
						var hotzoneId = annotation.id;
						var hotzoneSettings = slideData[slide.id].hotzones[hotzoneId];
						var points = annotation.target.selector.geometry.points;
						var hotzoneJSON = {
							"id": hotzoneId,
							"id_alias": hotzoneIdsAlias[hotzoneId],
							"points": points,
							"visibility": hotzoneSettings.visibility,
							"enabled": hotzoneSettings.enabled,
						};
						if (Array.isArray(hotzoneSettings.actions) && hotzoneSettings.actions.length > 0) {
							hotzoneJSON.actions = hotzoneSettings.actions;
						}
						slide.hotzones.push(hotzoneJSON);
					});
				}
			}
		}

		return slide;
	};

	return {
		init 								: init,
		drawSlideWithMakers					: drawSlideWithMakers,
		refreshDraggables					: refreshDraggables,
		copyMarkers							: copyMarkers,
		addHotspot							: addHotspot,
		addHotzone							: addHotzone,
		onClick 							: onClick,
		getSlideData						: getSlideData,
		getCurrentHotspot					: getCurrentHotspot,
		setCurrentHotspot					: setCurrentHotspot,
		showHotspotSettings					: showHotspotSettings,
		getCurrentHotzoneId					: getCurrentHotzoneId,
		setCurrentHotzoneId					: setCurrentHotzoneId,
		getAliasForHotzone					: getAliasForHotzone,
		showHotzoneSettings					: showHotzoneSettings,
		cancelAnnotationSelectedForSlide	: cancelAnnotationSelectedForSlide,
		deleteCurrentHotmarker				: deleteCurrentHotmarker,
		onHotspotImageSourceChange			: onHotspotImageSourceChange,
		onClickHotspotImageGallery			: onClickHotspotImageGallery,
		checkHotspotImageURLPreview			: checkHotspotImageURLPreview,
		onInputHotspotSizeWidth				: onInputHotspotSizeWidth,
		onInputHotspotSizeHeight			: onInputHotspotSizeHeight,
		onHotspotSettingsDone				: onHotspotSettingsDone,
		onHotzoneSettingsDone				: onHotzoneSettingsDone,
		saveSlideWithMarkers				: saveSlideWithMarkers
	};

}) (SceneMaker, jQuery);