SceneMaker.Editor.Image = (function(SM,$,undefined){
	var initialized = false;
	var contentToAdd = null;
	var contentAddMode = SM.Constant.NONE;
	var urlDivId = "tab_pic_from_url_content";
	var urlInputId = "picture_url";
	
	var init = function(){
		if(initialized) return;
		initialized = true;

		$("#" + urlDivId + " .previewButton").click(function(event){
			var imageInputVal = $("#" + urlInputId).val();
			if(SM.Validator.validateObject(imageInputVal)){
				var imageURL = SM.Object.getObjectInfo(imageInputVal).source;
				if(imageURL !== null){
					contentToAdd = SM.Editor.Utils.autocompleteUrls(imageURL);
					SM.Editor.Object.drawPreview(urlDivId, contentToAdd, {"contentAddMode": contentAddMode});
				}
			}
		});	
	};
	
	var onLoadTab = function(tab){
		if(tab=="url"){
			_onLoadURLTab();
		}
	};
	
	var _onLoadURLTab = function(){
		if(contentAddMode === SM.Constant.SCREEN){
			var $slide = $(SM.Slides.getCurrentSlide());
			var slideBackgroundURL = SM.Slides.getSlideBackground($slide);
			if(typeof slideBackgroundURL === "string"){
				$("#" + urlInputId).val(slideBackgroundURL);
				$("#" + urlDivId + " .previewButton").trigger("click");
				$("#" + urlDivId + " .previewimgbox button").hide();
				return;
			}
		}

		contentToAdd = null;
		SM.Editor.Object.resetPreview(urlDivId);
		$("#" + urlInputId).val("");
	};
	
	var addContent = function(){
		switch(contentAddMode){
			case SM.Constant.SCREEN:
				SM.Editor.Slides.setSlideBackground(SM.Slides.getCurrentSlide(),contentToAdd);
				break;
			default:
				SM.Editor.Object.drawPreviewObject(contentToAdd, {forceType: SM.Constant.MEDIA.IMAGE});
		}
		//Reset contentAddMode
		contentAddMode = SM.Constant.NONE;
	};
	
   /**
	* Function to draw an image in a zone
	* the zone to draw is the one in current_area
	* this function also makes the image draggable
	* param area: optional param indicating the area to add the image, used for editing scenes
	* param style: optional param with the style, used in editing scenes
	*/
	var drawImage = function(image_url, area, style, hyperlink, options){
		var current_area;
		var renderOnInit = false;

		if(area){
			current_area = area;
			renderOnInit = true;
		}	else {
			current_area = SM.Editor.getCurrentArea();
		}

		if((typeof current_area === "undefined")||(current_area === null)){
			return;
		}

		var newStyle;
		if(style){
			newStyle = SM.Editor.Utils.setStyleInPixels(style,current_area);
		} else {
			var image_width = $(current_area).width(); //default image width
			newStyle = "width:"+image_width+"px;";
		}

		var nextImageId = SM.Utils.getId();
		var idToDragAndResize = "draggable" + nextImageId;
		current_area.attr('type','image');
		if(hyperlink){
			current_area.attr('hyperlink',hyperlink);
		}
		current_area.html("<img class='view_content_image' id='"+idToDragAndResize+"' draggable='true' title='Click to drag' src='"+image_url+"' style='"+newStyle+"'/>");

		if(!style){
			//Adjust dimensions after drawing (Only after insert new images)
			var theImg = $("#"+idToDragAndResize);
			$(theImg).load(function(){
				SM.Utils.addTempShown([$(current_area).parent(),$(current_area),$(theImg)]);
				var dimentionsToDraw = SM.Editor.Utils.dimentionsToDraw($(current_area).width(), $(current_area).height(), $(theImg).width(), $(theImg).height());
				SM.Utils.removeTempShown([$(current_area).parent(),$(current_area),$(theImg)]);

				$(theImg).width(dimentionsToDraw.width);
				//Prevent incorrect height detections
				if(dimentionsToDraw.height>0){
					$(theImg).height(dimentionsToDraw.height);
				}
			});
		};

		SM.Editor.addDeleteButton(current_area);
		
		$("#" + idToDragAndResize).draggable({
			cursor: "move",
			stop: function(){
				$(this).parent().click();  //call parent click to select it in case it was unselected	
			}
		});

		if(renderOnInit === false){
			SM.Editor.Slides.updateThumbnail(SM.Slides.getCurrentSlide());
		};
	};

	var getAddContentMode = function(){
		return contentAddMode;
	};

	var setAddContentMode = function(mode){
		SM.Editor.Utils.hideNonDefaultTabs();
		contentAddMode = mode;
	};

	return {
		init 				: init,
		onLoadTab 			: onLoadTab,
		drawImage 			: drawImage,
		addContent 			: addContent,
		getAddContentMode	: getAddContentMode,
		setAddContentMode	: setAddContentMode
	};

}) (SceneMaker, jQuery);
