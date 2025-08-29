VISH.Editor.Screen = (function(V,$,undefined){

	var initialized = false;

	//Point to the current subslide
	var currentSubslide;

	var init = function(){
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
	* Methods from VISH.Editor.Flashcard
	*/

	/*
	 * Complete the fc scaffold to draw the flashcard in the presentation
	 */
	var draw = function(slidesetJSON,scaffoldDOM){
		if(slidesetJSON){
			if((typeof slidesetJSON.background == "string")&&(slidesetJSON.background!="none")){
				onBackgroundSelected(V.Utils.getSrcFromCSS(slidesetJSON.background));
			};
			if(slidesetJSON.pois){
				//Prevent corrupted pois to be drawed
				var validPois = [];
				$(slidesetJSON.pois).each(function(index,poi){
					if((poi.x)&&(poi.y)&&(poi.x<=100)&&(poi.y<=100)){
						validPois.push(poi);
					}
				});
				
				if(validPois.length > 0){
					_savePoisJSONToDom(scaffoldDOM,validPois);
				}
			};
		}
	};



	/*
	 * Redraw the pois of the flashcard
	 * This actions must be called after thumbnails have been rewritten
	 */
	var _drawPois = function(fc,POIdata){
		var pois = {};
		var fc_offset = $(fc).offset();

		//Translate relative POI top and left to pixels and index pois based on slide_id
		for(var i=0; i<POIdata.length; i++){
			var myPoi = POIdata[i];

			//Create new POI
			pois[myPoi.slide_id] = {};
			pois[myPoi.slide_id].x = (myPoi.x*800/100)+fc_offset.left;
			pois[myPoi.slide_id].y = (myPoi.y*600/100)+fc_offset.top;
			pois[myPoi.slide_id].slide_id = myPoi.slide_id;
		};

		var subslides = $(fc).find("article");

		$("#subslides_list").find("div.wrapper_barbutton").each(function(index,div){
			var slide = subslides[index];
			if(slide){
				var slide_id = $(slide).attr("id");
				var arrowDiv = $('<div class="draggable_sc_div" slide_id="'+ slide_id +'" >');
				$(arrowDiv).append($('<img src="'+V.ImagesPath+'icons/flashcard_button.png" class="fc_draggable_arrow">'));
				$(arrowDiv).append($('<p class="draggable_number">'+String.fromCharCode(64+index+1)+'</p>'));
				$(div).prepend(arrowDiv);

				var poi = pois[slide_id];
				if(poi){
					//Draw on background
					$(arrowDiv).css("position", "fixed");
					$(arrowDiv).css("margin-top", "0px");
					$(arrowDiv).css("margin-left", "0px");
					$(arrowDiv).css("top", poi.y + "px");
					$(arrowDiv).css("left", poi.x + "px");
					$(arrowDiv).attr("ddstart","scrollbar");
					$(arrowDiv).attr("ddend","background");
				};
			};
		});

		var isBackgroundShowing = (V.Editor.Screen.getCurrentSubslide()==null);
		if(!isBackgroundShowing){
			$("#subslides_list").find("div.draggable_sc_div[ddend='background']").hide();
		}

		//Drag&Drop POIs

		$("div.draggable_sc_div").draggable({
			start: function( event, ui ) {
				var position = $(event.target).css("position");
				if(position==="fixed"){
					//Start d&d in background
					$(event.target).attr("ddstart","background");
				} else {
					//Start d&d in scrollbar
					//Compensate change to position fixed with margins
					var current_offset = $(event.target).offset();
					$(event.target).css("position", "fixed");
					$(event.target).css("margin-top", (current_offset.top) + "px");
					$(event.target).css("margin-left", (current_offset.left) + "px");
					$(event.target).attr("ddstart","scrollbar");
				}
			},
			stop: function(event, ui) {
				//Chek if poi is inside background
				var current_offset = $(event.target).offset();
				var fc_offset = $(fc).offset();
				var yOk = ((current_offset.top > (fc_offset.top-10))&&(current_offset.top < (fc_offset.top+$(fc).outerHeight()-38)));
				var xOk = ((current_offset.left > (fc_offset.left-5))&&(current_offset.left < (fc_offset.left+$(fc).outerWidth()-44)));
				var insideBackground = ((yOk)&&(xOk));

				//Check that the flashcard is showed at the current moment
				insideBackground = (insideBackground && V.Editor.Screen.getCurrentSubslide()==null);

				if(insideBackground){
					$(event.target).attr("ddend","background");

					if($(event.target).attr("ddstart")==="scrollbar"){
						//Drop inside background from scrollbar
						//Transform margins to top and left
						var newTop = $(event.target).cssNumber("margin-top") +  $(event.target).cssNumber("top");
						var newLeft = $(event.target).cssNumber("margin-left") +  $(event.target).cssNumber("left");
						$(event.target).css("margin-top", "0px");
						$(event.target).css("margin-left", "0px");
						$(event.target).css("top", newTop+"px");
						$(event.target).css("left", newLeft+"px");
					} else {
						//Drop inside background from background
						//Do nothing
					}
				} else {
					//Drop outside background
					//Return to original position

					if($(event.target).attr("ddstart")==="scrollbar"){
						//Do nothing
					} else if($(event.target).attr("ddstart")==="background"){
						//Decompose top and left, in top,left,margin-top and margin-left
						//This way, top:0 and left:0 will lead to the original position

						//Get the parent (container in scrollbar)
						var parent = $(event.target).parent();
						var parent_offset = $(parent).offset();

						var newMarginTop = parent_offset.top - 20;
						var newMarginLeft = parent_offset.left + 15;
						var newTop = $(event.target).cssNumber("top") - newMarginTop;
						var newLeft = $(event.target).cssNumber("left") - newMarginLeft;
						$(event.target).css("margin-top", newMarginTop+"px");
						$(event.target).css("margin-left", newMarginLeft+"px");
						$(event.target).css("top", newTop+"px");
						$(event.target).css("left", newLeft+"px");	
					}

					$(event.target).animate({ top: 0, left: 0 }, 'slow', function(){
						//Animate complete
						$(event.target).css("position", "absolute");
						//Original margins
						$(event.target).css("margin-top","-20px");
						$(event.target).css("margin-left","15px");
						$(event.target).attr("ddend","scrollbar");
					});
				}
			}
		});
	};


	var _savePoisToJson = function(fc){
		var pois = [];
		var poisDOM = $("#subslides_list").find("div.draggable_sc_div[ddend='background']");

		var hasCurrentClass = $(fc).hasClass("current");
		if(!hasCurrentClass){
			$(fc).addClass("current");
		}

		V.Utils.addTempShown([fc,poisDOM]);
		
		var fc_offset = $(fc).offset();

		$(poisDOM).each(function(index,poi){
				pois[index]= {};
				pois[index].x = (100*($(poi).offset().left - fc_offset.left)/800).toString();
				pois[index].y = (100*($(poi).offset().top - fc_offset.top)/600).toString();
				pois[index].slide_id = $(poi).attr('slide_id');
		});

		if(!hasCurrentClass){
			$(fc).removeClass("current");
		}
		
		V.Utils.removeTempShown([fc,poisDOM]);

		return pois;
	};

	var _savePoisToDom = function(fc){
		var poisJSON = _savePoisToJson(fc);
		_savePoisJSONToDom(fc,poisJSON);
		return poisJSON;
	};

	var _savePoisJSONToDom = function(fc,poisJSON){
		$(fc).attr("poisData",JSON.stringify(poisJSON));
	};

	var _getPoisFromDoom = function(fc){
		var poisData = $(fc).attr("poisData");
		if(poisData){
			return JSON.parse($(fc).attr("poisData"));
		} else {
			return [];
		}
	};

	/*
	 * Callback from the V.Editor.Image module to add the background
	 */
	var onBackgroundSelected = function(contentToAdd,fc){
		if(!fc){
			fc = V.Slides.getCurrentSlide();
		}

		if($(fc).attr("type")===V.Constant.FLASHCARD){
			$(fc).css("background-image", "url("+contentToAdd+")");
			$(fc).attr("avatar", "url('"+contentToAdd+"')");
			$(fc).find("div.change_bg_button").hide();

			V.Editor.Slides.updateThumbnail(fc);
			V.Editor.Tools.loadToolsForSlide(fc);
		}

		$.fancybox.close();
	};

	var getThumbnailURL = function(fc){
		var avatar = $(fc).attr('avatar');
		if(avatar){
			return V.Utils.getSrcFromCSS(avatar);
		} else {
			return getDefaultThumbnailURL();
		}
	};

	var getDefaultThumbnailURL = function(){
		return (V.ImagesPath + "templatesthumbs/flashcard_template.png");
	};

	var onThumbnailLoadFail = function(fc){
		var thumbnailURL = getDefaultThumbnailURL();
		$(fc).css("background-image", "none");
		$(fc).attr("dirtyavatar", $(fc).attr("avatar"));
		$(fc).attr("avatar", "url('"+thumbnailURL+"')");
		$(fc).find("div.change_bg_button").show();

		if(V.Slides.getCurrentSlide()==fc){
			$("#slideset_selected > img").attr("src",thumbnailURL);
		}
		var slideThumbnail = V.Editor.Thumbnails.getThumbnailForSlide(fc);
		$(slideThumbnail).attr("src",thumbnailURL);
	};


	////////////////////
	// JSON Manipulation
	////////////////////

	/*
	 * Used by VISH.Editor module to save the flashcard in the JSON
	 */
	var getSlideHeader = function(fc){
		var slide = {};
		slide.id = $(fc).attr('id');
		slide.type = V.Constant.FLASHCARD;

		var currentBackground = $(fc).css("background-image");
		var dirtyAvatar = $(fc).attr("dirtyavatar");
		if((currentBackground=="none")&&(dirtyAvatar)){
			slide.background = dirtyAvatar;
		} else {
			slide.background = currentBackground;
		}
		
		if(V.Slides.getCurrentSlide()===fc){
			_savePoisToDom(fc);
		}
		slide.pois = _getPoisFromDoom(fc);
		slide.slides = [];
		return slide;
	};

	var getDummy = function(slidesetId,options){
		return "<article id='"+slidesetId+"' type='"+V.Constant.FLASHCARD+"' slidenumber='"+options.slideNumber+"'><div class='change_bg_button'></div></article>";
	};

	var getCurrentSubslide = function(){
		return currentSubslide;
	};

	var setCurrentSubslide = function(newSubslide){
		currentSubslide = newSubslide;
	};

	var getSubslidesQuantity = function(slideset){
		return $(slideset).children("article").length;
	};


	/////////////////
	// Callbacks
	////////////////

	/*
	 * Update UI when enter in a slideset
	 */
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

	/*
	 * Update UI when leave from a slideset
	 */
	var onLeaveSlideset = function(slideset){
		closeSlideset(slideset);

		var currentSubslide = getCurrentSubslide();
		if(currentSubslide){
			closeSubslide(currentSubslide);
		}

		$("#bottomside").hide();
		$("#slideset_selected > img").attr("src","");
	};

	var openSlideset = function(slideset){
		//Show slideset delete and help buttons
		_showSlideButtons(slideset);

		//Mark slideset thumbnail as selected
		$("#slideset_selected_img").addClass("selectedSlidesetThumbnail");

		var currentSubslide = getCurrentSubslide();
		if(currentSubslide){
			closeSubslide(currentSubslide);
		}

		V.Editor.Tools.loadToolsForSlide(slideset);

		//Show POIs
		$("#subslides_list").find("div.draggable_sc_div").show();
	};

	var closeSlideset = function(slideset){
		//Hide slideset delete and help buttons
		_hideSlideButtons(slideset);

		//Mark slideset thumbnail as unselected
		$("#slideset_selected_img").removeClass("selectedSlidesetThumbnail");

		//Unload slideset
		if(!V.Editor.Renderer.isRendering()){
			//Save POI info
			_savePoisToDom(slideset);
		}
		
		//Hide POIs
		$("#subslides_list").find("div.draggable_sc_div[ddend='background']").hide();
	};

	var beforeCreateSlidesetThumbnails = function(){
		var slideset = V.Slides.getCurrentSlide();
		if(V.Slideset.isSlideset(slideset)){
			//Load POI data
			var POIdata = _getPoisFromDoom(slideset);
			//Draw POIS
			_drawPois(slideset,POIdata);
		}
	};

	var beforeRemoveSlideset = function(slideset){
		onLeaveSlideset(slideset);
	};

	var beforeRemoveSubslide = function(slideset,subslide){
		closeSubslide(subslide);
	};

	var afterCreateSubslide = function(slideset,subslide){
	};


	/////////////////
	// Methods
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

		setCurrentSubslide(subslide);
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
		setCurrentSubslide(null);
		V.Editor.Thumbnails.selectSubslideThumbnail(null);
		_hideSubslide(subslide);
		V.Slides.triggerLeaveEventById($(subslide).attr("id"));
	};

	var _showSlideButtons = function(slide){
		$(slide).find("div.delete_slide:first").show();
	};

	var _hideSlideButtons = function(slide){
		$(slide).find("div.delete_slide:first").hide();
	};


	/////////////////
	// Events
	////////////////

	var onClickOpenSlideset = function(){
		var slideset = V.Slides.getCurrentSlide();
		openSlideset(slideset);
	};

	return {
		init 							: init,
		addScreen						: addScreen,
		draw 							: draw,
		getThumbnailURL 				: getThumbnailURL,
		getDefaultThumbnailURL			: getDefaultThumbnailURL,
		onBackgroundSelected 			: onBackgroundSelected,
		getSlideHeader					: getSlideHeader,
		getDummy						: getDummy,
		onEnterSlideset					: onEnterSlideset,
		onLeaveSlideset					: onLeaveSlideset,
		openSlideset					: openSlideset,
		closeSlideset					: closeSlideset,
		beforeCreateSlidesetThumbnails	: beforeCreateSlidesetThumbnails,
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