SceneMaker.Editor.Screen = (function(SM,$,undefined){

	var init = function(){
	};

	var addScreen = function(screen){
		var screen = $(screen);

		if(SM.Slides.getCurrentScreen()){
			$(SM.Slides.getCurrentScreen()).after(screen);
		} else {
			appendScreen(screen);
		}

		var oldCurrentScreenNumber = SM.Slides.getCurrentScreenNumber();
		//currentScreenNumber is next screen
		SM.Slides.setCurrentScreenNumber(oldCurrentScreenNumber+1);

		SM.Slides.triggerLeaveEvent(oldCurrentScreenNumber);
		SM.Slides.updateScreens();
		SM.Slides.triggerEnterEvent(SM.Slides.getCurrentScreenNumber());

		SM.Editor.Thumbnails.drawScreenThumbnails(function(){
			SM.Editor.Thumbnails.selectThumbnail(SM.Slides.getCurrentScreenNumber());
			SM.Editor.Thumbnails.moveThumbnailsToScreenWithNumber(SM.Slides.getCurrentScreenNumber());
		});
	};

	var appendScreen = function(screen){
		$('.slides').append(screen);
	};

	var onClickAddScreenButton = function(){
		var screen = SM.Editor.Dummies.getDummy(SM.Constant.SCREEN,{slideNumber:SM.Slides.getScreensQuantity()+1});
		addScreen(screen);
		$.fancybox.close();
	};

	var getViewsQuantity = function(screen){
		return $(screen).children("article").length;
	};

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

		var currentView = SM.Editor.View.getCurrentView();
		if(currentView){
			SM.Editor.View.closeView(currentView);
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

		var currentView = SM.Editor.View.getCurrentView();
		if(currentView){
			SM.Editor.View.closeView(currentView);
		}

		SM.Editor.Tools.loadToolsForSlide(screen);
	};

	var closeScreen = function(screen){
		//Mark screen thumbnail as unselected
		$("#screen_selected_img").removeClass("selectedScreenThumbnailInViews");
	};

	var onDeleteScreenClicked = function(event){
		var screenNumber = $(event.target).prev("img").attr("slidenumber");
		var screenToDelete = $("article[type='screen'][slidenumber='" + screenNumber + "']")[0];
		removeScreen(screenToDelete);
	};

	var removeScreen = function(screenToDelete){
		var options = {};
		options.width = 375;
		options.height = 130;
		options.notificationIconSrc = SM.Editor.Thumbnails.getThumbnailURLForSlide(screenToDelete);
		options.notificationIconClass = "notificationIconDeleteSlide";
		options.text = SM.I18n.getTrans("i.AreYouSureDeleteScreen");
		
		var button1 = {};
		button1.text = SM.I18n.getTrans("i.no");
		button1.callback = function(){
			$.fancybox.close();
		}
		var button2 = {};
		button2.text = SM.I18n.getTrans("i.delete");
		button2.callback = function(){
			_removeScreen(screenToDelete);
			$.fancybox.close();
		}
		options.buttons = [button1,button2];
		SM.Utils.showDialog(options);
	};

	var _removeScreen = function(screen){
		if(screen===null){
			return;
		}

		if(SM.Slides.getCurrentScreen() === screen){
			onLeaveScreen(screen);
		}

		var screenToDeleteNumber = $(screen).attr("slidenumber");
		var currentScreenNumber = SM.Slides.getCurrentScreenNumber();

		$(screen).remove();

		if(screenToDeleteNumber <= currentScreenNumber){
			if((currentScreenNumber-1) > 0) {
				SM.Slides.setCurrentScreenNumber(currentScreenNumber-1);
			} else if (SM.Slides.getScreensQuantity()>1){
				SM.Slides.setCurrentScreenNumber(1);
			}
		}

		SM.Slides.updateScreens();
		SM.Editor.Thumbnails.drawScreenThumbnails(function(){
			if(typeof SM.Slides.getCurrentScreen() !== "undefined"){
				SM.Editor.Thumbnails.selectThumbnail(SM.Slides.getCurrentScreenNumber());
				SM.Editor.Thumbnails.moveThumbnailsToScreenWithNumber(SM.Slides.getCurrentScreenNumber());
				SM.Slides.triggerEnterEventById($(SM.Slides.getCurrentScreen()).attr("id"));
			}
		});
	};


	/* Move & copy screen features */

	var moveScreenTo = function(orgPosition, destPosition){
		var screen_to_move = SM.Slides.getScreenWithNumber(orgPosition);
		var reference_screen = SM.Slides.getScreenWithNumber(destPosition);

		if((typeof screen_to_move === "undefined")||(typeof reference_screen === "undefined")){
			return;
		}

		if(typeof screen_to_move.length !== undefined){
			screen_to_move = $(screen_to_move)[0];
			if(typeof screen_to_move === "undefined"){
				return;
			}
		}

		if(typeof reference_screen.length !== undefined){
			reference_screen = $(reference_screen)[0];
			if(typeof reference_screen === "undefined"){
				return;
			}
		}

		if((screen_to_move.tagName!="ARTICLE")||(reference_screen.tagName!="ARTICLE")||(screen_to_move==reference_screen)){
			return;
		}

		//We must move screen orgPosition after or before destPosition
		var movement = null;
		if(destPosition > orgPosition){
			movement = "after";
		} else if(destPosition < orgPosition){
			movement = "before";
		} else {
			return;
		}

		var moving_current_screen = false;
		var currentScreen = SM.Slides.getCurrentScreen();
		var oldCurrentScreenNumber = parseInt($(currentScreen).attr("slidenumber"));
		if(currentScreen === screen_to_move){
			moving_current_screen = true;
		}

		var textAreas = SM.Editor.Slides.copyTextAreasOfSlide(screen_to_move);
		$(screen_to_move).remove();
		if(movement=="after"){
			$(reference_screen).after(screen_to_move);
		} else if(movement=="before") {
			$(reference_screen).before(screen_to_move);
		} else {
			return;
		}

		SM.Utils.addTempShown(screen_to_move);

		//Refresh Draggable Objects
		SM.Editor.Marker.refreshDraggables(screen_to_move);
		
		//Reload text areas
		SM.Editor.Slides.cleanTextAreasOfSlide(screen_to_move);
		SM.Editor.Slides.loadTextAreasOfSlide(screen_to_move,textAreas);

		SM.Utils.removeTempShown(screen_to_move);

		//Update screens
		SM.Slides.setScreens($('section.slides > article'));

		//Update scrollbar params and counters
		$("#screens_list").find("div.wrapper_slidethumbnail:has(img[slidenumber])").each(function(index,div){
			var slideNumber = index+1;
			var p = $(div).find("p.ptext_barbutton");
			$(p).html(slideNumber);
			var img = $(div).find("img.image_slidethumbnail");
			$(img).attr("slidenumber",slideNumber);
		});

		//Update current screen number
		var newCurrentScreenNumber;

		if(moving_current_screen){
			newCurrentScreenNumber = destPosition;
		} else {
			if((orgPosition > oldCurrentScreenNumber)&&(destPosition <= oldCurrentScreenNumber)){
				newCurrentScreenNumber = (oldCurrentScreenNumber+1);
			} else if((orgPosition < oldCurrentScreenNumber)&&(destPosition >= oldCurrentScreenNumber)){
				newCurrentScreenNumber = (oldCurrentScreenNumber-1);
			}
		}

		if(typeof newCurrentScreenNumber == "number"){
			SM.Slides.setCurrentScreenNumber(newCurrentScreenNumber);
		}
		
		SM.Slides.updateScreens();
	};

	var copyScreen = function(screenToCopy,options){
		if(typeof screenToCopy == "undefined"){
			return;
		}

		SM.Editor.Slides.cleanTextAreasOfSlide(screenToCopy);
		screenToCopy = _replaceIdsForCopyScreen(screenToCopy);
		var newId = $(screenToCopy).attr("id");

		var currentScreen = SM.Slides.getCurrentScreen();
		if(currentScreen){
			$(currentScreen).after(screenToCopy);
		} else {
			$("section#slides_panel").append(screenToCopy);
		}
		
		var screenCopied = $("#"+newId);

		//Restore draggables
		SM.Editor.Marker.refreshDraggables(screenCopied);
		
		//Restore text areas
		if(options.textAreas){
			SM.Editor.Slides.loadTextAreasOfSlide(screenCopied,options.textAreas,true);
		}
		
		SM.Slides.updateScreens();

		//Redraw thumbnails
		SM.Editor.Thumbnails.drawScreenThumbnails(function(){
			if(currentScreen){
				SM.Slides.goToScreenWithNumber(SM.Slides.getCurrentScreenNumber()+1);
				SM.Editor.Thumbnails.moveThumbnailsToScreenWithNumber(SM.Slides.getCurrentScreenNumber());
			} else {
				SM.Slides.goToScreenWithNumber(1);
				SM.Editor.Thumbnails.moveThumbnailsToScreenWithNumber(1);
			}
		});

		//Clean copyid attributes
		$(screenCopied).find("[copyid]").removeAttr("copyid");
	};

	var _replaceIdsForCopyScreen = function(screen){
		var oldScreenId = $(screen).attr("id");
		var newScreenId  = SM.Utils.getId("article");
		$(screen).attr("id",newScreenId);

		//Background
		var backgroundImg = $(screen).find("img.slide_background#" + oldScreenId + "_background");
		$(backgroundImg).attr("id",newScreenId + "_background");

		//Hotspots
		var hotspotIdsMapping = {};
		$(screen).children("img.hotspot").each(function(index, hotspot) {
			var oldHotspotId = $(hotspot).attr("id");
			var newHotspotId = SM.Utils.getId("hotspot-");
			$(hotspot).attr("id",newHotspotId);
			hotspotIdsMapping[oldHotspotId] = newHotspotId;
		});
		// Copy hotspot config
		SM.Editor.Marker.copyHotspotConfig(oldScreenId,newScreenId,hotspotIdsMapping);

		var views = $(screen).children("article");
		$(views).each(function(index, view) {
			_replaceIdsForCopyView(view,newScreenId,oldScreenId);
		});
		return screen;
	};

	var _replaceIdsForCopyView = function(view,newScreenId){
		switch($(view).attr("type")){
			case SM.Constant.VIEW_IMAGE:
				return _replaceIdsForCopyViewImage(view,newScreenId);
			case SM.Constant.VIEW_CONTENT:
				return _replaceIdsForCopyViewContent(view,newScreenId);
		}
	};

	var _replaceIdsForCopyViewImage = function(view,newScreenId){
		var oldViewId = $(view).attr("id");
		var newViewId = SM.Utils.getId(newScreenId + "_article");
		$(view).attr("id",newViewId);

		//Hotspots
		var hotspotIdsMapping = {};
		$(view).children("img.hotspot").each(function(index, hotspot) {
			var oldHotspotId = $(hotspot).attr("id");
			var newHotspotId = SM.Utils.getId("hotspot-");
			$(hotspot).attr("id",newHotspotId);
			hotspotIdsMapping[oldHotspotId] = newHotspotId;
		});
		// Copy hotspot config
		SM.Editor.Marker.copyHotspotConfig(oldViewId,newViewId,hotspotIdsMapping);
	};

	var _replaceIdsForCopyViewContent = function(view,newScreenId){
		var viewId = SM.Utils.getId(newScreenId + "_article");
		$(view).attr("id",viewId);

		//Replace zone Ids
		$(view).children("div[id].view_content_zone").each(function(index, zone) {
			zone = _replaceIdsForCopyZone(zone,viewId);
		});
	};

	var _replaceIdsForCopyZone = function(zone,viewId){
		$(zone).attr("copyid",$(zone).attr("id"));

		var zoneId = SM.Utils.getId(viewId + "_zone");
		$(zone).attr("id",zoneId);

		$(zone).find("[id]").each(function(index, el) {
			el = _replaceIdsForCopyEl(el,zoneId);
		});

		return zone;
	};

	var _replaceIdsForCopyEl = function(el,zoneId){
		var elName = _getNameOfCopyEl(el);
		var elId = SM.Utils.getId(zoneId + "_" + elName);
		$(el).attr("id",elId);
		return el;
	};

	var _getNameOfCopyEl = function(el){
		var elName = $($(el).attr("id").split("_")).last()[0];
		if (elName.length>1){
			return elName.substring(0,elName.length-1);
		} else {
			return elName;
		}
	};

	return {
		init 							: init,
		addScreen 						: addScreen,
		appendScreen					: appendScreen,
		onClickAddScreenButton			: onClickAddScreenButton,
		onEnterScreen					: onEnterScreen,
		onLeaveScreen					: onLeaveScreen,
		openScreen						: openScreen,
		closeScreen						: closeScreen,
		onDeleteScreenClicked			: onDeleteScreenClicked,
		removeScreen					: removeScreen,
		onClickOpenScreen				: onClickOpenScreen,
		getViewsQuantity				: getViewsQuantity,
		moveScreenTo					: moveScreenTo,
		copyScreen 						: copyScreen
	};

}) (SceneMaker, jQuery);