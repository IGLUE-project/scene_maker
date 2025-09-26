SceneMaker.Editor.Thumbnails = (function(SM,$,undefined){
	var screenThumbnailsDivId = "screens_list";
	var viewThumbnailsDivId = "views_list";

	//Tmp vars
	var drawScreenThumbnailsCallback;
	var drawViewThumbnailsCallback;

	//State vars
	var lastSelectedScreenThumbnail = undefined;
	var lastSelectedViewThumbnail = undefined;
	
	var init = function(){
	};
	 
	var drawScreenThumbnails = function(successCallback){
		drawScreenThumbnailsCallback = successCallback;

		//Clean previous content
		SM.Editor.Scrollbar.cleanScrollbar(screenThumbnailsDivId);
		$("#" + screenThumbnailsDivId).hide();

		//Generate thumbnail images
		var imagesArray = [];
		var imagesArrayTitles = [];

		var slideElements = 0;
		$('.slides > article').each(function(index,s){
			var srcURL = getThumbnailURLForSlide(s);
			var defaultURL = getDefaultThumbnailURLForSlide(s);
			if(srcURL){
				slideElements += 1;
				imagesArray.push($("<img id='screenThumbnail" + slideElements + "' class='image_slidethumbnail' slideNumber='" + slideElements + "' action='goToScreenWithNumber' src='" + srcURL + "' defaultsrc='" + defaultURL + "'/>"));
				imagesArrayTitles.push(slideElements);
			}
    	});

		var options = {};
		options.titleArray = imagesArrayTitles;
		options.callback = _onImagesLoaded;
		options.onImageErrorCallback = _onImageError;
		SM.Editor.Utils.Loader.loadImagesOnContainer(imagesArray,screenThumbnailsDivId,options);
	};
	 
	var _onImageError = function(image){
		var slide = SM.Screen.getScreenWithNumber($(image).attr("slidenumber"));
		var defaultThumbnailURL = getDefaultThumbnailURLForSlide(slide);

		var slideThumbnail = SM.Editor.Thumbnails.getThumbnailForSlide(slide);
		$(slideThumbnail).attr("src",defaultThumbnailURL);

		if(SM.Screen.getCurrentScreen()===slide){
			$("#screen_selected > img").attr("src",thumbnailURL);
		}
	};

	var _onImagesLoaded = function(){
		//Add class to title elements and events
		$("#" + screenThumbnailsDivId).find("img.image_slidethumbnail").each(function(index,img){
			//Add class to title
			var imgContainer = $(img).parent();
			$(imgContainer).addClass("wrapper_slidethumbnail");
			$(imgContainer).addClass("preventNoselectable");
			$(imgContainer).append("<div class='delete_slide delete_screen'></div>");
			var p = $(imgContainer).find("p");
			$(p).addClass("ptext_barbutton");

			//Add events to imgs
			$(img).click(function(event){
				_onClickSlideElement(event);
			});
		});

		//Unselect all thumbnails
		$(".barbutton").css("background-color", "transparent");

		var options = new Array();
		options['callback'] = _afterCreateSlidesScrollbar;

		//Create scrollbar
		$("#" + screenThumbnailsDivId).show();
		SM.Editor.Scrollbar.createScrollbar(screenThumbnailsDivId, options);
	};
	
	var _afterCreateSlidesScrollbar = function(){
		//Add sortable
		$("#" + screenThumbnailsDivId).sortable({
			items: 'div.wrapper_slidethumbnail:has(img[action="goToScreenWithNumber"])',
			change: function(event, ui) {
				//Do nothing
			},
			start: function(event, ui) { 
				//Do nothing
			},
			stop: function(event, ui) {
				var dragElement = ui.item;

				var img = $(ui.item).find("img.image_slidethumbnail[slidenumber]");
				if(isNaN($(img).attr("slidenumber"))){
					return;
				}

				var orgPosition = parseInt($(img).attr("slidenumber"));
				var destPosition;

				//Detect destPosition
				$("#screens_list").find("img.image_slidethumbnail[slidenumber]").each(function(index,item){
					var beforeIndex = parseInt($(item).attr("slidenumber"));
					var afterIndex = index+1;

					if((beforeIndex===orgPosition)&&(beforeIndex!=afterIndex)){
						destPosition = afterIndex;
					}

				});

				// SM.Debugging.log("Org position: " + orgPosition);
				// SM.Debugging.log("Dest position: " + destPosition);

				SM.Editor.Screen.moveScreenTo(orgPosition, destPosition);
			}
		});

		if(typeof drawScreenThumbnailsCallback == "function"){
			drawScreenThumbnailsCallback();
			drawScreenThumbnailsCallback = undefined;
		}
	};

	var _onClickSlideElement = function(event){
		switch($(event.target).attr("action")){
			case "goToScreenWithNumber":
				SM.Screen.goToScreenWithNumber($(event.target).attr("slideNumber"));
				break;
			default:
			  return;
		}
	};

	/**
	* Function to select the thumbnail
	*/
	var selectThumbnail = function(no){
		$("#screens_list img.image_slidethumbnail").removeClass("selectedScreenThumbnail");
		$("#screens_list img.image_slidethumbnail[slideNumber=" + no + "]").addClass("selectedScreenThumbnail");
		$("#screens_list div.wrapper_slidethumbnail").removeClass("selectedThumbnailBackground");
		$("#screens_list img.image_slidethumbnail[slideNumber=" + no + "]").parent("div.wrapper_slidethumbnail").addClass("selectedThumbnailBackground");

		var advance = ((lastSelectedScreenThumbnail===undefined)||(no > lastSelectedScreenThumbnail));
		lastSelectedScreenThumbnail = no;
		var slide = SM.Screen.getScreenWithNumber(no);
		if(!isThumbnailVisible(slide)){
			if(advance){
				moveThumbnailsToScreenWithNumber(Math.max(no-5,1));
			} else {
				moveThumbnailsToScreenWithNumber(no);
			}
		};
	};

	var moveThumbnailsToScreenWithNumber = function(slideNumber){
		var element = $("img.image_slidethumbnail[slideNumber=" + slideNumber + "]");
		SM.Editor.Scrollbar.goToElement(screenThumbnailsDivId,element);
	};

	var moveThumbnailsToViewWithNumber = function(slideNumber){
		var element = $("#views_list img.image_slidethumbnail[slideNumber=" + slideNumber + "]").parent();
		SM.Editor.Scrollbar.goToElement(viewThumbnailsDivId,element);
	};
  
	var getThumbnailForSlide = function(slide){
		if(SM.Slides.isView(slide)){
			return _getThumbnailForView(slide);
		}
		var slidenumber = $(slide).attr("slidenumber");
		return $("#screens_list img.image_slidethumbnail[slideNumber=" + slidenumber + "]");
	};

	var _getThumbnailForView = function(view){
		var slidenumber = $(view).attr("slidenumber");
		return $("#views_list img.image_slidethumbnail[slideNumber=" + slidenumber + "]");
	};

	var getThumbnailURLForSlide = function(slide){
		if($(slide).attr('type')===SM.Constant.VIEW_CONTENT){
			return _getThumbnailURLForViewContent(slide);
		} else {
			//Screen or VIEW_IMAGE
			return _getThumbnailURLForScreenOrViewImage(slide);
		}
	};

	var _getThumbnailURLForViewContent = function(slide){
		//If the slide only contains one element and it is an image, use it as thumbnail.
		var $zone = $(slide).children("div.view_content_zone");
		if(($zone.length === 1)&&(!SM.Editor.isZoneEmpty($zone))&&($zone.attr("type")=="image")){
			//The slide contains only one image
			var img = $zone.find("img");
			if(($(img).length === 1)&&(typeof $(img).attr("src") == "string")){
				return $(img).attr("src");
			}
		}
		return getDefaultThumbnailURLForSlide(slide);
	};

	var _getThumbnailURLForScreenOrViewImage = function(slide){
		var imgBackground = SM.Slides.getSlideBackground(slide);
		if (typeof imgBackground !== "undefined") {
			return imgBackground;
		} else {
			return getDefaultThumbnailURLForSlide(slide);
		}
	};

	var getDefaultThumbnailURLForSlide = function(slide){
		if($(slide).attr('type')===SM.Constant.VIEW_CONTENT){
			return (SM.ImagesPath + "slidesthumbs/view_content_template.png");
		} else {
			return (SM.ImagesPath + "slidesthumbs/screen_template.png");
		}
	};


	////////////////
	// Views Thumbnails
	///////////////

	var drawViewThumbnails = function(views,successCallback){
		drawViewThumbnailsCallback = successCallback;

		//Clean previous content
		SM.Editor.Scrollbar.cleanScrollbar(viewThumbnailsDivId);
		$("#" + viewThumbnailsDivId).hide();

		//Generate thumbnail images
		var imagesArray = [];

		var slideElements = 0;
		$(views).each(function(index,view){
			if(!SM.Slides.isView(view)){
				SM.Debugging.log("Invalid view type");
				return true; //Continue
			}
			var srcURL = getThumbnailURLForSlide(view);
			var defaultURL = getDefaultThumbnailURLForSlide(view);
			slideElements += 1;
			imagesArray.push($("<img id='viewThumbnail" + slideElements + "' class='image_slidethumbnail' slideNumber='" + slideElements + "' src='" + srcURL + "' defaultsrc='" + defaultURL + "'/>"));
    	});

		var options = {};
		options.callback = _onViewsThumbnailsImagesLoaded;
		SM.Editor.Utils.Loader.loadImagesOnContainer(imagesArray,viewThumbnailsDivId,options);
	};

	var _onViewsThumbnailsImagesLoaded = function(){
		//Add class to title elements and events
		$("#" + viewThumbnailsDivId).find("img.image_slidethumbnail").each(function(index,img){
			//Add class to title
			var imgContainer = $(img).parent();
			$(imgContainer).addClass("wrapper_slidethumbnail");
			$(imgContainer).append("<div class='delete_slide delete_view'></div>");
			$(imgContainer).find("p").addClass("ptext_barbutton");

			//Add events to imgs
			$(img).click(function(event){
				_onClickViewElement(event);
			});
		});

		var options = new Array();
		options['horizontalScroll'] = true;
		options['callback'] = _afterCreateViewsScrollbar;

		//Create scrollbar
		$("#" + viewThumbnailsDivId).show();
		SM.Editor.Scrollbar.createScrollbar(viewThumbnailsDivId, options);
	}

	var _afterCreateViewsScrollbar = function(){
		if(typeof drawViewThumbnailsCallback == "function"){
			drawViewThumbnailsCallback();
			drawViewThumbnailsCallback = undefined;
		}
	};

	var _onClickViewElement = function(event){
		var viewNumber = $(event.target).attr("slideNumber");
		SM.Editor.View.openViewWithNumber(viewNumber);
	};

	var selectViewThumbnail = function(no){
		$("#views_list img.image_slidethumbnail").removeClass("selectedViewThumbnail");
		if(no===null){
			//Used to unselect all view thumbnails
			return;
		}
		$("#views_list img.image_slidethumbnail[slideNumber=" + no + "]").addClass("selectedViewThumbnail");

		var advance = ((lastSelectedViewThumbnail===undefined)||(no > lastSelectedViewThumbnail));
		lastSelectedViewThumbnail = no;
		var view = SM.View.getViewWithNumber(SM.Screen.getCurrentScreen(),no);
		if(!isThumbnailVisible(view)){
			if(advance){
				moveThumbnailsToViewWithNumber(Math.max(no-7,1));
			} else {
				moveThumbnailsToViewWithNumber(no);
			}
		};
	};

	var isThumbnailVisible = function(slide){
		var slideThumbnail = getThumbnailForSlide(slide);
		var offset = $(slideThumbnail).offset();
		if((typeof offset == "undefined")||(offset===null)){
			//Transitory states...
			return true;
		}
		if(SM.Slides.isView(slide)){
			var offsetLeft = offset.left;
			return ((offsetLeft > 466) && (offsetLeft < 1119));
		} else {
			//Screen
			var offsetTop = offset.top;
			return ((offsetTop > 132) && (offsetTop < 667));
		}
	};

	return {
		init              					: init,
		drawScreenThumbnails  				: drawScreenThumbnails,
		drawViewThumbnails  				: drawViewThumbnails,
		selectThumbnail	  					: selectThumbnail,
		selectViewThumbnail					: selectViewThumbnail,
		moveThumbnailsToScreenWithNumber	: moveThumbnailsToScreenWithNumber,
		moveThumbnailsToViewWithNumber		: moveThumbnailsToViewWithNumber,
		getThumbnailURLForSlide				: getThumbnailURLForSlide,
		getDefaultThumbnailURLForSlide 		: getDefaultThumbnailURLForSlide,
		getThumbnailForSlide 				: getThumbnailForSlide,
		isThumbnailVisible					: isThumbnailVisible
	}

}) (SceneMaker, jQuery);