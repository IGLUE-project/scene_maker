SceneMaker.Editor.Screen = (function(SM,$,undefined){

	var initialized = false;
	var currentEditingMode = "NONE"; //Can be "NONE", HOTSPOT" or "ZONE".
	var _hiddenLinkToInitHotspotSettings;
	var slideData;
	var currentHotspot;
	var currentView;

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

	var addScreen = function(){
		var screen = SM.Editor.Dummies.getDummy(SM.Constant.SCREEN,{slideNumber:SM.Slides.getScreensQuantity()+1});
		SM.Editor.Slides.addScreen(screen);
		$.fancybox.close();
	};

	var draw = function(slideJSON,scaffoldDOM){
		if(slideJSON){
			if((typeof slideJSON.background === "string")&&(slideJSON.background !== "none")){
				onBackgroundSelected(SM.Utils.getSrcFromCSS(slideJSON.background),scaffoldDOM);
			};
			//Draw hotspots
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

					_drawHotspot(slideJSON.id,hotspot.id,hotspotX,hotspotY,hotspot.image,hotspot.lockAspectRatio,hotspotWidth,hotspotHeight,hotspot.rotationAngle);
					if (Array.isArray(hotspot.actions)&&hotspot.actions.length>0) {
						slideData[slideJSON.id].hotspots[hotspot.id].actions = hotspot.actions;
					}
				});
			}
		}
	};

   /*
	* Toolbar: Hotspots and zones
	*/
	var addHotspot = function(){
		if(currentEditingMode === "HOTSPOT"){
			_disableEditingMode("HOTSPOT");
			currentEditingMode = "NONE";
		} else {
			currentEditingMode = "HOTSPOT";
			_enableEditingMode("HOTSPOT");
		}
	};

	var addZone = function(){
		if(currentEditingMode === "ZONE"){
			_disableEditingMode("ZONE");
			currentEditingMode = "NONE";
		} else {
			currentEditingMode = "ZONE";
			_enableEditingMode("ZONE");
		}
	};

	var _enableEditingMode = function(mode){
		switch(mode){
			case "HOTSPOT":
				_disableEditingMode("ZONE");
				$("#slides_panel").addClass("hotspot_active");
				break;
			case "ZONE":
				_disableEditingMode("HOTSPOT");
				$("#slides_panel").addClass("zone_active");
				break;
			case "NONE":
				_disableEditingMode("HOTSPOT");
				_disableEditingMode("ZONE");
				break;
		}
	};

	var _disableEditingMode = function(mode){
		switch(mode){
			case "HOTSPOT":
				$("#slides_panel").removeClass("hotspot_active");
				currentHotspot = undefined;
				break;
			case "ZONE":
				$("#slides_panel").removeClass("zone_active");
				break;
			default:
				break;
		}
	};

	var onClick = function(event){
		var $target = $(event.target);
		if(currentEditingMode !== "NONE"){
			if ($target.closest('article[type="screen"]').length === 0) {
				//Click outside a screen
				currentEditingMode = "NONE";
				_enableEditingMode("NONE");
			} else {
				//Click inside a screen
				switch(currentEditingMode){
					case "HOTSPOT":
						_onClickInHotspotMode(event);
						break;
					case "ZONE":
						_onClickInZoneMode(event);
						break;
					default:
						break;
				}
			}
		} else {
			if ($target.hasClass('hotspot')){
				_onSelectHotspot($target);
			}
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

		currentEditingMode = "NONE";
		_enableEditingMode("NONE");
	};

	var _drawHotspot = function(slideId,hotspotId,x,y,imgURL,lockAspectRatio,width,height,rotationAngle){
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
			slideData[slideId] = {
				hotspots: {},
				zones: {}
			};
		}
		slideData[slideId].hotspots[hotspotId] = {};
		slideData[slideId].hotspots[hotspotId].lockAspectRatio = lockAspectRatio;
		
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
			slideData[newScreenId] = {
				hotspots: {},
				zones: {}
			};
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
					case 'removeElement':
						//Keep behaviour if the hotspot remove itself
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
		_drawHotspotGalleryCarrousel(function(){
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
				SM.Editor.Carrousel.goToElement("hotspotImageGallery",imgGallery);
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
		$(SM.Slides.getCurrentScreen()).children("article").each(function() {
		  var $view = $(this);
		  currentOptionsViews.push({
		    value: $view.attr('id'),
		    text: (SM.I18n.getTrans("i.ViewOption", {number: $view.attr('slidenumber')}))
		  });
		});

		$("div.hotspotActionParamsView select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsViews, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});

		//Fill action template with current element ids (hotspots and zones)
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

	var _drawHotspotGalleryCarrousel = function(callback){
		_cleanHotspotGalleryCarrousel();

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

		var carrouselImages = [];
		$.each(hotspotGalleryImgs, function(index, image){
			var myImg = $("<img src='" + image.src + "'/>");
			carrouselImages.push(myImg);
		});

		var options = {};
		options.callback = _drawHotspotGalleryCarrouselAfterLoadImages;
		options.afterDrawCarrouselCallback = callback;
		SM.Editor.Utils.Loader.loadImagesOnContainer(carrouselImages,"hotspotImageGallery",options);
	};

	var _drawHotspotGalleryCarrouselAfterLoadImages = function(loadImagesOnContainerOptions){
		var $carrouselDiv = $("#hotspotImageGallery");
		var $containerCarouselDiv = $carrouselDiv.parent();
		$carrouselDiv.show();
		SM.Utils.addTempShown([$containerCarouselDiv,$carrouselDiv]);

		var options = new Array();
		options.rows = 1;
		//options.callback = _onClickCarrouselElement;
		options.rowItems = 9;
		options.scrollItems = 9;
		//options.styleClass = "hotspotgallery";
		options.afterCreateCarruselFunction = function(){
			setTimeout(function(){
				SM.Utils.removeTempShown([$containerCarouselDiv,$carrouselDiv]);
				if(typeof loadImagesOnContainerOptions.afterDrawCarrouselCallback === "function"){
					loadImagesOnContainerOptions.afterDrawCarrouselCallback();
				}
			},100);
		}
		SM.Editor.Carrousel.createCarrousel("hotspotImageGallery", options);
	};

	var _cleanHotspotGalleryCarrousel = function(){
		SM.Editor.Carrousel.cleanCarrousel("hotspotImageGallery");
		$("#hotspotImageGallery").hide();
	};

	var onHotspotImageSourceChange = function(event){
		var option = event.target.value;
		if(option === "gallery"){
			var carrouselWrapper = $("#hotspotImageGallery").parent().parent();
			$(carrouselWrapper).show();
			$("#hotspotImageURLWrapper").hide();
			$("#hotspotImageURL").val("");
			checkHotspotImageURLPreview();
		} else if(option === "url"){
			var carrouselWrapper = $("#hotspotImageGallery").parent().parent();
			$(carrouselWrapper).hide();
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
		if(option === "openLink"){
			$inputURL.val("");
			$inputURLWrapper.show();
		} else {
			$inputURLWrapper.hide();
		}
		if(option === "removeElement"){
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

	/////////
	// Zones
	////////

	var _onClickInZoneMode = function(event){
		event.preventDefault();
		event.stopPropagation();
		console.log("TO DO: Add Zone");

		currentEditingMode = "NONE";
		_enableEditingMode("NONE");
	};

	/*
	 * Callback from the SM.Editor.Image module to add the background
	 */
	var onBackgroundSelected = function(contentToAdd,slide){
		if(typeof slide === "undefined"){
			slide = SM.Slides.getCurrentSlide();
		}

		if($(slide).attr("type")!==SM.Constant.VIEW_CONTENT){
			$(slide).css("background-image", "url("+contentToAdd+")");
			$(slide).attr("avatar", "url('"+contentToAdd+"')");
			$(slide).find("div.change_bg_button").hide();

			SM.Editor.Slides.updateThumbnail(slide);
			SM.Editor.Tools.loadToolsForSlide(slide);
		}

		$.fancybox.close();
	};

	var getThumbnailURL = function(screen){
		var avatar = $(screen).attr('avatar');
		if(avatar){
			return SM.Utils.getSrcFromCSS(avatar);
		} else {
			return getDefaultThumbnailURL();
		}
	};

	var getDefaultThumbnailURL = function(){
		return (SM.ImagesPath + "slidesthumbs/screen_template.png");
	};

	var onThumbnailLoadFail = function(screen){
		var thumbnailURL = getDefaultThumbnailURL();
		$(screen).css("background-image", "none");
		$(screen).attr("avatar", "url('"+thumbnailURL+"')");
		$(screen).find("div.change_bg_button").show();

		if(SM.Slides.getCurrentSlide()==screen){
			$("#screen_selected > img").attr("src",thumbnailURL);
		}
		var slideThumbnail = SM.Editor.Thumbnails.getThumbnailForSlide(screen);
		$(slideThumbnail).attr("src",thumbnailURL);
	};


	////////////////////
	// JSON Manipulation
	////////////////////

	/*
	 * Save the screen in JSON format
	 */
	var saveScreen = function(screenDOM){
		var screen = {};
		screen.id = $(screenDOM).attr('id');
		screen.type = $(screenDOM).attr('type');

		var screenBackground = $(screenDOM).css("background-image");
		if((screenBackground && screenBackground !== "none")){
			screen.background = screenBackground;
		}

		if(typeof slideData[screen.id] !== "undefined"){
			var hotspotsIds = Object.keys(slideData[screen.id].hotspots);
			if(hotspotsIds.length > 0) {
				screen.hotspots = [];
				hotspotsIds.forEach(hotspotId => {
					var hotspotDOM = $("img.hotspot[id='" + hotspotId + "']");
					//var hotspotPosition = $(hotspotDOM).position();
					//var hotspotX = hotspotPosition.left;
					//var hotspotY = hotspotPosition.top;
					var hotspotX = parseFloat(hotspotDOM.css("left"));
					var hotspotY = parseFloat(hotspotDOM.css("top"));

					var hotspotSettings = slideData[screen.id].hotspots[hotspotId];

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
						"rotationAngle": hotspotDOM.attr("rotationAngle")
					};

					if (Array.isArray(hotspotSettings.actions) && hotspotSettings.actions.length > 0) {
						hotspotJSON.actions = hotspotSettings.actions;
					}
					screen.hotspots.push(hotspotJSON);
				});
			}
			if(Object.keys(slideData[screen.id].zones).length > 0) {
				screen.zones = slideData[screen.id].zones;
			}
		}

		return screen;
	};

	var getCurrentView = function(){
		return currentView;
	};

	var _setCurrentView = function(newView){
		currentView = newView;
	};

	var getCurrentHotspot = function(){
		return currentHotspot;
	};

	var setCurrentHotspot = function(newHotspot){
		currentHotspot = newHotspot;
	};

	var deleteCurrentHotspot = function(){
		var options = {};
		options.width = 375;
		options.height = 130;
		//options.notificationIconSrc = SM.Editor.Thumbnails.getThumbnailURL(slideToDelete);
		//options.notificationIconClass = "notificationIconDelete";
		options.text = SM.I18n.getTrans("i.AreYouSureDeleteHotspot");

		var button1 = {};
		button1.text = SM.I18n.getTrans("i.no");
		button1.callback = function(){
			$.fancybox.close();
		}
		var button2 = {};
		button2.text = SM.I18n.getTrans("i.delete");
		button2.callback = function(){
			//Delete current hotspot
			var $hotspot = $(currentHotspot);
			var hotspotId = $hotspot.attr("id");
			$hotspot.remove();
			var slideId = $(SM.Slides.getCurrentSlide()).attr("id");
			delete slideData[slideId].hotspots[hotspotId];

			currentHotspot = undefined;
			SM.Editor.Tools.cleanToolbar();
			$.fancybox.close();
		}
		options.buttons = [button1,button2];
		SM.Utils.showDialog(options);
	};
	
	var getViewsQuantity = function(screen){
		return $(screen).children("article").length;
	};


	/////////////////
	// Screens
	////////////////

	var onEnterScreen = function(screen){
		SM.Editor.Slides.updateThumbnail(screen);
		$("#bottomside").show();
		openScreen(screen);

		var screenId = $(screen).attr("id");
		var views = $("#" + screenId + " > article");
		SM.Editor.Thumbnails.drawViewThumbnails(views,function(){
			//Views thumbnails drawed succesfully
		});
	};

	var onLeaveScreen = function(screen){
		closeScreen(screen);

		var currentView = getCurrentView();
		if(currentView){
			closeView(currentView);
		}

		$("#bottomside").hide();
		$("#screen_selected > img").attr("src","");
	};

	var onClickOpenScreen = function(){
		var screen = SM.Slides.getCurrentScreen();
		openScreen(screen);
	};

	var openScreen = function(screen){
		$("#screen_selected_img").addClass("selectedScreenThumbnailInViews");

		var currentView = getCurrentView();
		if(currentView){
			closeView(currentView);
		}

		SM.Editor.Tools.loadToolsForSlide(screen);
	};

	var closeScreen = function(screen){
		_hideSlideButtons(screen);

		//Mark screen thumbnail as unselected
		$("#screen_selected_img").removeClass("selectedScreenThumbnailInViews");
	};

	var beforeRemoveScreen = function(screen){
		if(SM.Slides.getCurrentScreen() === screen){
			onLeaveScreen(screen);
		}
	};

	var beforeRemoveView = function(screen,view){
		if(SM.Slides.getCurrentView() === view){
			closeView(view);
		}
	};

	var afterCreateView = function(screen,view){
	};


	/////////////////
	// Views
	////////////////

	var openViewWithNumber = function(viewNumber){
		var screen = SM.Slides.getCurrentScreen();
		var views = $(screen).find("article");
		var view = views[viewNumber-1];
		openView(view);
	};

	var openView = function(view){
		var currentView = getCurrentView();

		if(currentView){
			closeView(currentView);
		} else {
			var screen = $(view).parent();
			closeScreen(screen);
		}

		_setCurrentView(view);
		_showView(view);
		SM.Editor.Thumbnails.selectViewThumbnail($(view).attr("slidenumber"));
		SM.Slides.triggerEnterEventById($(view).attr("id"));
	};

	var _showView = function(view){
		$(view).css("display","block");
	};

	var _hideView = function(view){
		$(view).css("display","none");
	};

	var closeViewWithNumber = function(viewNumber){
		var screen = SM.Slides.getCurrentScreen();
		var views = $(screen).find("article");
		var view = views[viewNumber-1];
		closeView(view);
	};

	var closeView = function(view){
		_setCurrentView(null);
		SM.Editor.Thumbnails.selectViewThumbnail(null);
		_hideView(view);
		SM.Slides.triggerLeaveEventById($(view).attr("id"));
	};

	var _hideSlideButtons = function(slide){
		$(slide).find("div.delete_slide:first").hide();
	};

	return {
		init 							: init,
		addScreen						: addScreen,
		draw 							: draw,
		refreshDraggables				: refreshDraggables,
		copyHotspotConfig				: copyHotspotConfig,
		onBackgroundSelected 			: onBackgroundSelected,
		addHotspot						: addHotspot,
		addZone							: addZone,
		onClick 						: onClick,
		showHotspotSettings				: showHotspotSettings,
		getCurrentHotspot				: getCurrentHotspot,
		setCurrentHotspot				: setCurrentHotspot,
		deleteCurrentHotspot			: deleteCurrentHotspot,
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
		saveScreen						: saveScreen,
		getThumbnailURL 				: getThumbnailURL,
		getDefaultThumbnailURL			: getDefaultThumbnailURL,
		onEnterScreen					: onEnterScreen,
		onLeaveScreen					: onLeaveScreen,
		openScreen						: openScreen,
		closeScreen						: closeScreen,
		beforeRemoveScreen				: beforeRemoveScreen,
		beforeRemoveView				: beforeRemoveView,
		afterCreateView					: afterCreateView,
		getCurrentView					: getCurrentView,
		openViewWithNumber 				: openViewWithNumber,
		openView						: openView,
		closeViewWithNumber				: closeViewWithNumber,
		closeView 						: closeView,
		onClickOpenScreen				: onClickOpenScreen,
		getViewsQuantity				: getViewsQuantity
	};

}) (SceneMaker, jQuery);