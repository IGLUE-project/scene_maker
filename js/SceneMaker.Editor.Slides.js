SceneMaker.Editor.Slides = (function(SM,$,undefined){

	/* Screen features */

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
	}

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

		var article_to_move = screen_to_move;
		var article_reference = reference_screen;

		var moving_current_screen = false;
		var currentScreen = SM.Slides.getCurrentScreen();
		var oldCurrentScreenNumber = parseInt($(currentScreen).attr("slidenumber"));
		if(currentScreen === article_to_move){
			moving_current_screen = true;
		}

		var textAreas = copyTextAreasOfSlide(article_to_move);
		$(article_to_move).remove();
		if(movement=="after"){
			$(article_reference).after(article_to_move);
		} else if(movement=="before") {
			$(article_reference).before(article_to_move);
		} else {
			// SM.Debugging.log("SM.Slides: Error. Movement not defined... !");
			return;
		}

		SM.Utils.addTempShown(article_to_move);

		//Refresh Draggable Objects
		SM.Editor.Screen.refreshDraggables(article_to_move);
		
		//Reload text areas
		_cleanTextAreas(article_to_move);
		_loadTextAreasOfSlide(article_to_move,textAreas);

		SM.Utils.removeTempShown(article_to_move);

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

		_cleanTextAreas(screenToCopy);
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
		SM.Editor.Screen.refreshDraggables(screenCopied);
		
		//Restore text areas
		if(options.textAreas){
			_loadTextAreasOfSlide(screenCopied,options.textAreas,true);
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

	var _cleanTextAreas = function(slide){
		$(slide).find("div[type='text'],div.wysiwygTextArea").each(function(index,textArea){
			$(textArea).html("");
		});
	};

	var copyTextAreasOfSlide = function(slide){
		var textAreas = {};
		$(slide).find("div[type='text']").each(function(index,textArea){
			var zoneId = $(textArea).attr("id");
			var ckEditor = SM.Editor.Text.getCKEditorFromZone(textArea);
			if((zoneId)&&(ckEditor!==null)){
				textAreas[zoneId] = ckEditor.getData();
			}
		});
		return textAreas;
	};

	var _loadTextAreasOfSlide = function(slide,textAreas,isCopy){
		if(isCopy !== true){
			isCopy = false;
		}
		var views = $(slide).find("article[type='" + SM.Constant.VIEW_CONTENT + "']");
		SM.Utils.addTempShown(slide);
		SM.Utils.addTempShown(views);
		$(slide).find("div[type='text']").each(function(index,textArea){
			var zoneId;
			if(isCopy){
				zoneId = $(textArea).attr("copyid");
			} else {
				zoneId = $(textArea).attr("id");
			}
			if((zoneId)&&(textAreas[zoneId])){
				var data = textAreas[zoneId];
				SM.Editor.Text.launchTextEditor({}, $(textArea), data);
			}
		});
		SM.Utils.removeTempShown(views);
		SM.Utils.removeTempShown(slide);
	};


	var _replaceIdsForCopyScreen = function(screen){
		var oldScreenId = $(screen).attr("id");
		var newScreenId  = SM.Utils.getId("article");
		$(screen).attr("id",newScreenId);

		//Hotspots
		var hotspotIdsMapping = {};
		$(screen).children("img.hotspot").each(function(index, hotspot) {
			var oldHotspotId = $(hotspot).attr("id");
			var newHotspotId = SM.Utils.getId("hotspot-");
			$(hotspot).attr("id",newHotspotId);
			hotspotIdsMapping[oldHotspotId] = newHotspotId;
		});
		// Copy hotspot config
		SM.Editor.Screen.copyHotspotConfig(oldScreenId,newScreenId,hotspotIdsMapping);

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
		SM.Editor.Screen.copyHotspotConfig(oldViewId,newViewId,hotspotIdsMapping);
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


	/* Remove slide features */

	var removeCurrentSlide = function(){
		_removeSlide(SM.Slides.getCurrentSlide());
	};

	var onDeleteScreenClicked = function(event){
		var screenNumber = $(event.target).prev("img").attr("slidenumber");
		var screenToDelete = $("article[type='screen'][slidenumber='" + screenNumber + "']")[0];
		_removeSlide(screenToDelete);
	};

	var onDeleteViewClicked = function(event){
		var currentScreen = SM.Slides.getCurrentScreen();
		var viewNumber = $(event.target).prev("img").attr("slidenumber");
		var viewToDelete = $(currentScreen).find("article[slidenumber='" + viewNumber + "']")[0];
		_removeSlide(viewToDelete);
	};

	var _removeSlide = function(slideToDelete){
		var removeView = SM.Slides.isView(slideToDelete);

		var options = {};
		options.width = 375;
		options.height = 130;
		options.notificationIconSrc = SM.Editor.Thumbnails.getThumbnailURLForSlide(slideToDelete);
		options.notificationIconClass = "notificationIconDelete";
		if(removeView===true){
			options.text = SM.I18n.getTrans("i.AreYouSureDeleteView");
		} else {
			options.text = SM.I18n.getTrans("i.AreYouSureDeleteScreen");
		}

		var button1 = {};
		button1.text = SM.I18n.getTrans("i.no");
		button1.callback = function(){
			$.fancybox.close();
		}
		var button2 = {};
		button2.text = SM.I18n.getTrans("i.delete");
		button2.callback = function(){
			if(removeView){
				_removeView(slideToDelete);
			} else {
				_removeScreen(slideToDelete);
			}
			$.fancybox.close();
		}
		options.buttons = [button1,button2];
		SM.Utils.showDialog(options);
	};

	var _removeScreen = function(screen){
		if(screen===null){
			return;
		}

		if(SM.Slides.isScreen(screen)){
			SM.Editor.Screen.beforeRemoveScreen(screen);
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

	var _removeView = function(view){
		if(typeof view !== "object"){
			return;
		}

		var screen = $(view).parent();
		var currentView = SM.Slides.getCurrentView();
		var removingCurrentView = (currentView === view);

		SM.Editor.Screen.beforeRemoveView(screen,view);
		$(view).remove();

		//Update view numbers
		var views = $(screen).find("article");
		$(views).each(function(index,view){
			$(view).attr("slidenumber",index+1);
		});	

		SM.Editor.Thumbnails.drawViewThumbnails(views,function(){
			//Views thumbnails drawed succesfully
			if(removingCurrentView === false){
				SM.Editor.Thumbnails.selectViewThumbnail($(currentView).attr("slidenumber"));
			}
		});

		//After remove a view, load screen if the current view was deleted
		if(removingCurrentView){
			SM.Editor.Screen.openScreen(screen);
		}
	};


	/* Views */

	var addView = function(screen,view){ 
		var view = $(view).css("display","none")[0];
		appendView(screen,view);
		SM.Editor.Tools.addTooltipsToSlide(view);
		SM.Editor.Screen.openView(view);
		SM.Editor.Thumbnails.drawViewThumbnails($(screen).find("article"),function(){
			//Views thumbnails drawed succesfully
			SM.Editor.Thumbnails.selectViewThumbnail($(view).attr("slidenumber"));
		});
		SM.Editor.Screen.afterCreateView(screen,view);
	};

	var appendView = function(screen,view){
		$(screen).append(view);
	}


	/* View movement (with keyboard) */

	var forwardOneView = function(event){
		_moveViews(1);
	};

	var backwardOneView = function(){
		_moveViews(-1);
	};

	var _moveViews = function(n){
		var cSlide = SM.Slides.getCurrentScreen();
		if(!SM.Slides.isScreen(cSlide)){
			return;
		}
		var currentViewNumber = SM.Slides.getCurrentViewNumber();
		if(typeof currentViewNumber == "undefined"){
			currentViewNumber = 0;
		}
		//Get views quantity
		var viewsQuantity = SM.Editor.Screen.getViewsQuantity(cSlide);

		var no = currentViewNumber+n;
		var cno = Math.min(Math.max(0,no),viewsQuantity);
		if(no===cno){
			_goToView(no);
		}
	};

	var _goToView = function(no){
		if(no===0){
			//Select screen
			SM.Editor.Screen.onClickOpenScreen();
		} else {
			SM.Editor.Screen.openViewWithNumber(no);
		}
	};


	/* Utils */

	var updateThumbnail = function(slide){
		var slideThumbnail = SM.Editor.Thumbnails.getThumbnailForSlide(slide);
		var thumbnailURL = SM.Editor.Thumbnails.getThumbnailURLForSlide(slide);

		//Capure load img error
		$(slideThumbnail).error(function(response){
			//Load the default image
			_updateThumbnail(slide,slideThumbnail,SM.Editor.Thumbnails.getDefaultThumbnailURLSlide(slide));
		});

		_updateThumbnail(slide,slideThumbnail,thumbnailURL);
	};

	var _updateThumbnail = function(slide,slideThumbnail,thumbnailURL){
		if(SM.Slides.isScreen(slide)){
			$("#screen_selected > img").attr("src",thumbnailURL);
		}
		$(slideThumbnail).attr("src",thumbnailURL);
	};

	var isSlideFocused = function(){
		//Wysiwyg is focused.
		if($(".wysiwygInstance").is(":focus")){
			return false;
		}
		
		//Fancybox is showing
		if($("#fancybox-content").is(":visible")){
			return false;
		}

		//Generic input is focused
		if($("input").is(":focus")){
			return false;
		}

		//A content area is focused
		if(SM.Editor && SM.Editor.getCurrentArea()!==null){
			return false;
		}

		return true;
	};

	return {
		addScreen 					: addScreen,
		appendScreen				: appendScreen,
		moveScreenTo				: moveScreenTo,
		copyScreen					: copyScreen,
		copyTextAreasOfSlide		: copyTextAreasOfSlide,
		removeCurrentSlide			: removeCurrentSlide,
		onDeleteScreenClicked		: onDeleteScreenClicked,
		onDeleteViewClicked			: onDeleteViewClicked,
		addView						: addView,
		appendView					: appendView,
		forwardOneView				: forwardOneView,
		backwardOneView				: backwardOneView,
		updateThumbnail				: updateThumbnail,
		isSlideFocused				: isSlideFocused
	}; 

}) (SceneMaker, jQuery);