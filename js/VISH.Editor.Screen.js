VISH.Editor.Screen = (function(V,$,undefined){

	var initialized = false;
	var currentEditingMode = "NONE"; //Can be "NONE", HOTSPOT" or "ZONE".
	var _hiddenLinkToInitHotspotSettings;
	var screenData;
	var currentHotspot;
	var currentSubslide;
	var defaultHotspotImg;

	var init = function(){
		screenData = {};

		//Hotspot Settings
		_hiddenLinkToInitHotspotSettings = $('<a href="#hotspotSettings_fancybox" style="display:none"></a>');
		$(_hiddenLinkToInitHotspotSettings).fancybox({
			'autoDimensions' : false,
			'height': 600,
			'width': 800,
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

		defaultHotspotImg = V.ImagesPath + "icons/hotspot.png";
	};

	/*
	 * Add new screen to the scene
	 */
	var addScreen = function(){
		var options = {};
		options.slideNumber = V.Slides.getSlidesQuantity()+1;
		var slidesetId = V.Utils.getId("article");
		var slide = getDummy(slidesetId,options);
		V.Editor.Slides.addSlide(slide);
		$.fancybox.close();
	};

	/*
	* Draw
	*/
	var draw = function(screenJSON,scaffoldDOM){
		if(screenJSON){
			if((typeof screenJSON.background === "string")&&(screenJSON.background !== "none")){
				onBackgroundSelected(V.Utils.getSrcFromCSS(screenJSON.background));
			};
			//Draw hotspots
			if (Array.isArray(screenJSON.hotspots)) {
				$(screenJSON.hotspots).each(function(index,hotspot){
					 V.Utils.registerId(hotspot.id);
					_drawHotspot(screenJSON.id,hotspot.id,hotspot.x,hotspot.y,hotspot.image,hotspot.lockAspectRatio,hotspot.width,hotspot.height,hotspot.rotationAngle);
					if (Array.isArray(hotspot.actions)&&hotspot.actions.length>0) {
						screenData[screenJSON.id].hotspots[hotspot.id].actions = hotspot.actions;
					}
				});
			}
		}
	};

   /*
	* Tools: Hotspots and zones
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
			if ($target.closest('article[type="flashcard"]').length === 0) {
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

		var screen = V.Slides.getCurrentSlide();
		var screenId = $(screen).attr("id");
		var hotspotId = V.Utils.getId("id-");
		var hotspotSize = 42;
		var rect = screen.getBoundingClientRect();
	    var x = event.clientX - rect.left - hotspotSize/2;
	    var y = event.clientY - rect.top - hotspotSize/2;
		
		_drawHotspot(screenId,hotspotId,x,y);

		currentEditingMode = "NONE";
		_enableEditingMode("NONE");
	};

	var _drawHotspot = function(screenId,hotspotId,x,y,imgURL,lockAspectRatio,width,height,rotationAngle){
		if(typeof imgURL !== "string"){
			imgURL = defaultHotspotImg;
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
		if (typeof rotationAngle !== "number" || isNaN(rotationAngle) || rotationAngle < 0 || rotationAngle > 360) {
			rotationAngle = 0;
		}

		var screen = $("#"+screenId);
		var $hotspot = $('<img>', {
			src: imgURL,
			class: 'hotspot',
			hotspotid: hotspotId,
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

		if(typeof screenData[screenId] === "undefined"){
			screenData[screenId] = {
				hotspots: {},
				zones: {}
			};
		}
		screenData[screenId].hotspots[hotspotId] = {};
		
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

		if (!$screen.is('article[type="flashcard"]')) {
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

	var _onSelectHotspot = function($hotspot){
		currentHotspot = $hotspot;
		V.Editor.Tools.loadToolsForElement("hotspot");
	};

	var showHotspotSettings = function(){
		$(_hiddenLinkToInitHotspotSettings).trigger("click");
	};

	var _onStartHotspotSettingsFancybox = function(){
		var screenId = $(V.Slides.getCurrentSlide()).attr("id");
		var $hotspot = $(currentHotspot);
		var hotspotId = $hotspot.attr("hotspotid");
		var hotspotSettings = screenData[screenId].hotspots[hotspotId];

		//ID
		$("#hotspotId").val(hotspotId);

		//Image
		//Reset gallery
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
		}

		//Size
		if(typeof screenData[screenId].hotspots[hotspotId].lockAspectRatio === "boolean"){
			$("#hotspotLockAspectRatio").prop("checked", screenData[screenId].hotspots[hotspotId].lockAspectRatio);
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
		
		//Screen
		$("#hotspotScreen").parent().hide();
		var $hotspotScreenSelect = $("#hotspotScreen");
		$hotspotScreenSelect.empty();
		$hotspotScreenSelect.append($('<option>', { value: "none", text: ("None") }))
		$('article[type="flashcard"]').each(function(){
			var screenId = $(this).attr('id');
			var screenNumber = $(this).attr('slidenumber');
			$hotspotScreenSelect.append($('<option>', { value: screenId, text: ("Screen " + screenNumber) }))
		});

		if (Array.isArray(hotspotSettings.actions) && hotspotSettings.actions.length > 0) {
			if(typeof hotspotSettings.actions[0].actionType === "string"){
				$("#hotspotAction").val(hotspotSettings.actions[0].actionType).trigger('change');
				if((typeof hotspotSettings.actions[0].actionParams !== "undefined")&&(typeof hotspotSettings.actions[0].actionParams.screen === "string")){
					$("#hotspotScreen").val(hotspotSettings.actions[0].actionParams.screen);
				}
			}
		}
	};

	var onHotspotImageSourceChange = function(event){
		var option = event.target.value;
		if(option === "gallery"){
			$("#hotspotImageGallery").show();
			$("#hotspotImageURLWrapper").hide();
			$("#hotspotImageURL").val("");
			checkHotspotImageURLPreview();
		} else if(option === "url"){
			$("#hotspotImageGallery").hide();
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
		$img.siblings("img").removeClass("selected");
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

	var onHotspotActionChange = function(event){
		var option = event.target.value;
		if(option === "goToScreen"){
			$("#hotspotScreen").parent().show();
		} else {
			$("#hotspotScreen").parent().hide();
		}
		// switch(event.target.value){
		// 	case "goToScreen":
				
		// 		break;
		// 	case "changeScreenBackground":
		// 		break;
		// 	case "removeElement":
		// 		break;
		// 	case "solvePuzzle":
		// 		break;
		// 	case "none":
		// 	default:
		// 		break;
		// }
	};

	var onHotspotSettingsDone = function(event){
		var screenId = $(V.Slides.getCurrentSlide()).attr("id");
		var $hotspot = $(currentHotspot);
		var hotspotId = $hotspot.attr("hotspotid");
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
			hotspotImg = defaultHotspotImg;
		}
		$hotspot.attr("src", hotspotImg);

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

		//Hotspot actions
		var actions = [];
		var actionType = $("#hotspotAction").val();
		if(actionType !== "none"){
			actions[0] = {actionType: $("#hotspotAction").val()};
			if($("#hotspotScreen").is(":visible")){
				actions[0].actionParams = {screen: $("#hotspotScreen").val()};
			}
		}

		if(actions.length > 0){
			hotspotSettings.actions = actions;
		}

		screenData[screenId].hotspots[hotspotId] = hotspotSettings;
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
	 * Callback from the V.Editor.Image module to add the background
	 */
	var onBackgroundSelected = function(contentToAdd,screen){
		if(!screen){
			screen = V.Slides.getCurrentSlide();
		}

		if($(screen).attr("type")===V.Constant.FLASHCARD){
			$(screen).css("background-image", "url("+contentToAdd+")");
			$(screen).attr("avatar", "url('"+contentToAdd+"')");
			$(screen).find("div.change_bg_button").hide();

			V.Editor.Slides.updateThumbnail(screen);
			V.Editor.Tools.loadToolsForSlide(screen);
		}

		$.fancybox.close();
	};

	var getThumbnailURL = function(screen){
		var avatar = $(screen).attr('avatar');
		if(avatar){
			return V.Utils.getSrcFromCSS(avatar);
		} else {
			return getDefaultThumbnailURL();
		}
	};

	var getDefaultThumbnailURL = function(){
		return (V.ImagesPath + "templatesthumbs/flashcard_template.png");
	};

	var onThumbnailLoadFail = function(screen){
		var thumbnailURL = getDefaultThumbnailURL();
		$(screen).css("background-image", "none");
		$(screen).attr("avatar", "url('"+thumbnailURL+"')");
		$(screen).find("div.change_bg_button").show();

		if(V.Slides.getCurrentSlide()==screen){
			$("#slideset_selected > img").attr("src",thumbnailURL);
		}
		var slideThumbnail = V.Editor.Thumbnails.getThumbnailForSlide(screen);
		$(slideThumbnail).attr("src",thumbnailURL);
	};


	////////////////////
	// JSON Manipulation
	////////////////////

	/*
	 * Used by VISH.Editor module to save the screen in the JSON
	 */
	var saveScreen = function(screenDOM){
		var screen = {};
		screen.id = $(screenDOM).attr('id');
		screen.type = V.Constant.FLASHCARD;

		var screenBackground = $(screenDOM).css("background-image");
		if((screenBackground && screenBackground !== "none")){
			screen.background = screenBackground;
		}

		if(typeof screenData[screen.id] !== "undefined"){
			var hotspotsIds = Object.keys(screenData[screen.id].hotspots);
			if(hotspotsIds.length > 0) {
				screen.hotspots = [];
				hotspotsIds.forEach(hotspotId => {
				  var hotspotDOM = $("img.hotspot[hotspotid='" + hotspotId + "']");
				  var hotspotPosition = $(hotspotDOM).position();
				  var hotspotSettings = screenData[screen.id].hotspots[hotspotId];
				  //console.log(hotspotId, hotspotSettings);
				  var hotspotJSON = {
				  	"id": hotspotId,
				  	"x": hotspotPosition.left,
				  	"y": hotspotPosition.top,
				  	"image": hotspotDOM.attr("src"),
				  	"width": hotspotDOM.width(),
				  	"height": hotspotDOM.height(),
				  	"lockAspectRatio": hotspotSettings.lockAspectRatio,
				  	"rotationAngle": hotspotDOM.attr("rotationAngle")
				  };

				  if (Array.isArray(hotspotSettings.actions) && hotspotSettings.actions.length > 0) {
				  	hotspotJSON.actions = hotspotSettings.actions;
				  }
				  screen.hotspots.push(hotspotJSON);
				});
			}
			if(Object.keys(screenData[screen.id].zones).length > 0) {
				screen.zones = screenData[screen.id].zones;
			}
		}

		screen.slides = [];
		return screen;
	};

	var getDummy = function(slidesetId,options){
		return "<article id='"+slidesetId+"' type='"+V.Constant.FLASHCARD+"' slidenumber='"+options.slideNumber+"'><div class='change_bg_button'></div></article>";
	};

	var getCurrentSubslide = function(){
		return currentSubslide;
	};

	var _setCurrentSubslide = function(newSubslide){
		currentSubslide = newSubslide;
	};

	var setCurrentHotspot = function(newHotspot){
		currentHotspot = newHotspot;
	};

	var deleteCurrentHotspot = function(){
		var options = {};
		options.width = 375;
		options.height = 130;
		//options.notificationIconSrc = V.Editor.Thumbnails.getThumbnailURL(slideToDelete);
		//options.notificationIconClass = "notificationIconDelete";
		options.text = V.I18n.getTrans("i.areYouSureDeleteHotspot");

		var button1 = {};
		button1.text = V.I18n.getTrans("i.no");
		button1.callback = function(){
			$.fancybox.close();
		}
		var button2 = {};
		button2.text = V.I18n.getTrans("i.delete");
		button2.callback = function(){
			//Delete current hotspot
			var $hotspot = $(currentHotspot);
			var hotspotId = $hotspot.attr("hotspotid");
			$hotspot.remove();
			var screenId = $(V.Slides.getCurrentSlide()).attr("id");
			delete screenData[screenId].hotspots[hotspotId];

			currentHotspot = undefined;
			V.Editor.Tools.cleanToolbar();
			$.fancybox.close();
		}
		options.buttons = [button1,button2];
		V.Utils.showDialog(options);
	};
	
	var getSubslidesQuantity = function(slideset){
		return $(slideset).children("article").length;
	};


	/////////////////
	// Slidesets
	////////////////

	var onEnterSlideset = function(slideset){
		V.Editor.Slides.updateThumbnail(slideset);
		$("#bottomside").show();
		openSlideset(slideset);

		var slidesetId = $(slideset).attr("id");
		var subslides = $("#" + slidesetId + " > article");
		V.Editor.Thumbnails.drawSlidesetThumbnails(subslides,function(){
			//Subslides Thumbnails drawed succesfully
		});
	};

	var onLeaveSlideset = function(slideset){
		closeSlideset(slideset);

		var currentSubslide = getCurrentSubslide();
		if(currentSubslide){
			closeSubslide(currentSubslide);
		}

		$("#bottomside").hide();
		$("#slideset_selected > img").attr("src","");
	};

	var onClickOpenSlideset = function(){
		var slideset = V.Slides.getCurrentSlide();
		openSlideset(slideset);
	};

	var openSlideset = function(slideset){
		//Mark slideset thumbnail as selected
		$("#slideset_selected_img").addClass("selectedSlidesetThumbnail");

		var currentSubslide = getCurrentSubslide();
		if(currentSubslide){
			closeSubslide(currentSubslide);
		}

		V.Editor.Tools.loadToolsForSlide(slideset);
	};

	var closeSlideset = function(slideset){
		//Hide slideset delete and help buttons
		_hideSlideButtons(slideset);

		//Mark slideset thumbnail as unselected
		$("#slideset_selected_img").removeClass("selectedSlidesetThumbnail");
	};

	var beforeRemoveSlideset = function(slideset){
		if(V.Slides.getCurrentSlide() === slideset){
			onLeaveSlideset(slideset);
		}
	};

	var beforeRemoveSubslide = function(slideset,subslide){
		if(V.Slides.getCurrentSubslide() === subslide){
			closeSubslide(subslide);
		}
	};

	var afterCreateSubslide = function(slideset,subslide){
	};


	/////////////////
	// Subslides
	////////////////

	var openSubslideWithNumber = function(subslideNumber){
		var slideset = V.Slides.getCurrentSlide();
		var subslides = $(slideset).find("article");
		var subslide = subslides[subslideNumber-1];
		openSubslide(subslide);
	};

	var openSubslide = function(subslide){
		var currentSubslide = getCurrentSubslide();

		if(currentSubslide){
			closeSubslide(currentSubslide);
		} else {
			var slideset = $(subslide).parent();
			closeSlideset(slideset);
		}

		_setCurrentSubslide(subslide);
		_showSubslide(subslide);
		V.Editor.Thumbnails.selectSubslideThumbnail($(subslide).attr("slidenumber"));
		V.Slides.triggerEnterEventById($(subslide).attr("id"));
	};

	var _showSubslide = function(subslide){
		$(subslide).css("display","block");
	};

	var _hideSubslide = function(subslide){
		$(subslide).css("display","none");
	};

	var closeSubslideWithNumber = function(subslideNumber){
		var slideset = V.Slides.getCurrentSlide();
		var subslides = $(slideset).find("article");
		var subslide = subslides[subslideNumber-1];
		closeSubslide(subslide);
	};

	var closeSubslide = function(subslide){
		_setCurrentSubslide(null);
		V.Editor.Thumbnails.selectSubslideThumbnail(null);
		_hideSubslide(subslide);
		V.Slides.triggerLeaveEventById($(subslide).attr("id"));
	};

	var _hideSlideButtons = function(slide){
		$(slide).find("div.delete_slide:first").hide();
	};

	return {
		init 							: init,
		getDummy						: getDummy,
		addScreen						: addScreen,
		draw 							: draw,
		onBackgroundSelected 			: onBackgroundSelected,
		addHotspot						: addHotspot,
		addZone							: addZone,
		onClick 						: onClick,
		showHotspotSettings				: showHotspotSettings,
		setCurrentHotspot				: setCurrentHotspot,
		deleteCurrentHotspot			: deleteCurrentHotspot,
		onHotspotActionChange			: onHotspotActionChange,
		onHotspotImageSourceChange		: onHotspotImageSourceChange,
		onClickHotspotImageGallery		: onClickHotspotImageGallery,
		checkHotspotImageURLPreview		: checkHotspotImageURLPreview,
		onInputHotspotSizeWidth			: onInputHotspotSizeWidth,
		onInputHotspotSizeHeight		: onInputHotspotSizeHeight,
		onHotspotSettingsDone			: onHotspotSettingsDone,
		saveScreen						: saveScreen,
		getThumbnailURL 				: getThumbnailURL,
		getDefaultThumbnailURL			: getDefaultThumbnailURL,
		onEnterSlideset					: onEnterSlideset,
		onLeaveSlideset					: onLeaveSlideset,
		openSlideset					: openSlideset,
		closeSlideset					: closeSlideset,
		beforeRemoveSlideset			: beforeRemoveSlideset,
		beforeRemoveSubslide			: beforeRemoveSubslide,
		afterCreateSubslide				: afterCreateSubslide,
		getCurrentSubslide				: getCurrentSubslide,
		openSubslideWithNumber 			: openSubslideWithNumber,
		openSubslide					: openSubslide,
		closeSubslideWithNumber			: closeSubslideWithNumber,
		closeSubslide 					: closeSubslide,
		onClickOpenSlideset				: onClickOpenSlideset,
		getSubslidesQuantity			: getSubslidesQuantity
	};

}) (VISH, jQuery);