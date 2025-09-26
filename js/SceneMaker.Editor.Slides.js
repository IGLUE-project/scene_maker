SceneMaker.Editor.Slides = (function(SM,$,undefined){

	var removeCurrentSlide = function(){
		var slideToDelete = SM.Slides.getCurrentSlide();
		if(SM.Slides.isView(slideToDelete)){
			SM.Editor.View.removeView(slideToDelete);
		} else {
			SM.Editor.Screen.removeScreen(slideToDelete);
		}
	};

	var updateThumbnail = function(slide){
		var slideThumbnail = SM.Editor.Thumbnails.getThumbnailForSlide(slide);
		var thumbnailURL = SM.Editor.Thumbnails.getThumbnailURLForSlide(slide);

		//Capure load img error
		$(slideThumbnail).error(function(response){
			//Load the default image
			_updateThumbnail(slide,slideThumbnail,SM.Editor.Thumbnails.getDefaultThumbnailURLForSlide(slide));
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

	var setSlideBackground = function(slide,backgroundURL){
		var $slide = $(slide);
		if($slide.attr("type")!==SM.Constant.VIEW_CONTENT){
			var $imgBackground = SM.Slides.getSlideBackgroundImg($slide);
			if ($imgBackground.length === 0) {
				// Create <img> for background
				var imgBackgroundId = $slide.attr("id") + "_background";
				$imgBackground = $("<img>", {
					id: imgBackgroundId,
					class: "slide_background"
				});
				$slide.append($imgBackground);
			}
			$imgBackground.attr("src",backgroundURL);
			$(slide).find("div.change_bg_button").hide();

			SM.Editor.Slides.updateThumbnail(slide);
			SM.Editor.Tools.loadToolsForSlide(slide);
		}

		$.fancybox.close();
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

	var loadTextAreasOfSlide = function(slide,textAreas,isCopy){
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

	var cleanTextAreasOfSlide = function(slide){
		$(slide).find("div[type='text'],div.wysiwygTextArea").each(function(index,textArea){
			$(textArea).html("");
		});
	};


	return {
		removeCurrentSlide			: removeCurrentSlide,
		updateThumbnail				: updateThumbnail,
		isSlideFocused				: isSlideFocused,
		setSlideBackground 			: setSlideBackground,
		copyTextAreasOfSlide		: copyTextAreasOfSlide,
		loadTextAreasOfSlide		: loadTextAreasOfSlide,
		cleanTextAreasOfSlide		: cleanTextAreasOfSlide
	}; 

}) (SceneMaker, jQuery);