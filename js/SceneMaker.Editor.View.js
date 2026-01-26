SceneMaker.Editor.View = (function(SM,$,undefined){
	var currentView;

	var init = function(){
	};

	var getCurrentView = function(){
		return currentView;
	};

	var _setCurrentView = function(newView){
		currentView = newView;
	};

	var addView = function(screen,view){
		var view = $(view).css("display","none")[0];
		appendView(screen,view);
		SM.Editor.Tools.addTooltipsToSlide(view);
		SM.Editor.View.openView(view);
		SM.Editor.Thumbnails.drawViewThumbnails($(screen).find("article"),function(){
			//Views thumbnails drawed succesfully
			SM.Editor.Thumbnails.selectViewThumbnail($(view).attr("slidenumber"));
		});
	};

	var appendView = function(screen,view){
		$(screen).append(view);
	};

	var onClickAddViewButton = function(){
		$("#addViewFancybox").trigger('click');
		SM.Editor.Utils.loadTab('tab_views');
		return false;
	};

	var onDeleteViewClicked = function(event){
		var currentScreen = SM.Screen.getCurrentScreen();
		var viewNumber = $(event.target).prev("img").attr("slidenumber");
		var viewToDelete = $(currentScreen).find("article[slidenumber='" + viewNumber + "']")[0];
		removeView(viewToDelete);
	};

	var removeView = function(viewToDelete){
		var options = {};
		options.width = 375;
		options.height = 130;
		options.notificationIconSrc = SM.Editor.Thumbnails.getThumbnailURLForSlide(viewToDelete);
		options.notificationIconClass = "notificationIconDeleteSlide";
		options.text = SM.I18n.getTrans("i.AreYouSureDeleteView");
		
		var button1 = {};
		button1.text = SM.I18n.getTrans("i.no");
		button1.callback = function(){
			$.fancybox.close();
		}
		var button2 = {};
		button2.text = SM.I18n.getTrans("i.delete");
		button2.callback = function(){
			_removeView(viewToDelete);
			$.fancybox.close();
		}
		options.buttons = [button1,button2];
		SM.Utils.showDialog(options);
	};

	var _removeView = function(view){
		if(typeof view !== "object"){
			return;
		}

		var screen = $(view).parent();
		var currentView = SM.View.getCurrentView();
		var currentViewId = $(currentView).attr("id");
		var removingCurrentView = (currentView === view);

		if(removingCurrentView){
			closeView(view);
		}
		$(view).remove();
		SM.Editor.Marker.afterDeleteSlide(currentViewId);

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
	
	var openViewWithNumber = function(viewNumber){
		var screen = SM.Screen.getCurrentScreen();
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
			SM.Editor.Screen.closeScreen(screen);
		}

		_setCurrentView(view);
		_showView(view);
		SM.Editor.Thumbnails.selectViewThumbnail($(view).attr("slidenumber"));
		SM.Slides.triggerSlideEnterEvent($(view).attr("id"));
	};

	var _showView = function(view){
		$(view).css("display","block");
	};

	var _hideView = function(view){
		$(view).css("display","none");
	};

	var closeViewWithNumber = function(viewNumber){
		var screen = SM.Screen.getCurrentScreen();
		var views = $(screen).find("article");
		var view = views[viewNumber-1];
		closeView(view);
	};

	var closeView = function(view){
		var viewId = $(view).attr("id");
		_setCurrentView(null);
		SM.Editor.Thumbnails.selectViewThumbnail(null);
		_hideView(view);
		SM.Editor.Marker.cancelAnnotationSelectedForSlide(viewId);
		SM.Slides.triggerSlideLeaveEvent(viewId);
	};


	/* View movement (with keyboard) */

	var forwardOneView = function(event){
		_moveViews(1);
	};

	var backwardOneView = function(){
		_moveViews(-1);
	};

	var _moveViews = function(n){
		var currentViewNumber = SM.View.getCurrentViewNumber();
		if(typeof currentViewNumber === "undefined"){
			currentViewNumber = 0;
		}
		var viewsQuantity = SM.Editor.Screen.getViewsQuantity(SM.Screen.getCurrentScreen());
		var no = currentViewNumber+n;
		var cno = Math.min(Math.max(0,no),viewsQuantity);
		if(no===cno){
			_goToView(no);
		}
	};

	var _goToView = function(no){
		if(no===0){
			SM.Editor.Screen.onClickOpenScreen();
		} else {
			SM.Editor.View.openViewWithNumber(no);
		}
	};

	return {
		init 							: init,
		addView							: addView,
		appendView						: appendView,
		onClickAddViewButton			: onClickAddViewButton,
		onDeleteViewClicked				: onDeleteViewClicked,
		removeView						: removeView,
		getCurrentView					: getCurrentView,
		openViewWithNumber 				: openViewWithNumber,
		openView						: openView,
		closeViewWithNumber				: closeViewWithNumber,
		closeView 						: closeView,
		forwardOneView					: forwardOneView,
		backwardOneView					: backwardOneView
	};

}) (SceneMaker, jQuery);