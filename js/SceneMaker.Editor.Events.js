/*
 * Events for the Editor (the events of the Viewer are handled in SceneMaker.Events.js)
 */
SceneMaker.Editor.Events = (function(SM,$,undefined){
	
	var _bindedEditorEventListeners = false;
	var _confirmOnExit;
	var _isCtrlKeyPressed = false;

	var init = function(){
		bindEditorEventListeners();
	};

	var bindEditorEventListeners = function(){
		if(!_bindedEditorEventListeners){
			$(document).on('click', '#addScreenButton', SM.Editor.Screen.onClickAddScreenButton);
			$(document).on('click', '#addViewButton', SM.Editor.View.onClickAddViewButton);
			$(document).on('click', '#screen_selected_img', SM.Editor.Screen.onClickOpenScreen);
					
			$(document).on('click', '#save_scene_details', SM.Editor.Settings.onSaveSceneDetailsButtonClicked);
			$(document).on('click','div.viewthumb', SM.Editor.onViewThumbClicked);

			$(document).on('click','.editable', SM.Editor.onEditableClicked);
			$(document).on('click','.selectable', SM.Editor.onSelectableClicked);
			$(document).on('click',':not(".selectable"):not(".preventNoselectable")', SM.Editor.onNoSelectableClicked);
			
			$(document).on('click','.delete_screen', SM.Editor.Screen.onDeleteScreenClicked);
			$(document).on('click','.delete_view', SM.Editor.View.onDeleteViewClicked);
			$(document).on('click','.delete_content', SM.Editor.onDeleteItemClicked);

			$(document).on("click", ".change_bg_button", SM.Editor.Tools.changeBackground);

			$(document).on("click", "#tab_pic_from_url_content button.button_addContent", SM.Editor.Image.addContent);
			$(document).on("click", "#tab_object_from_url_content button.button_addContent", SM.Editor.Object.drawPreviewElement);
			$(document).on("click", "#tab_video_from_url_content button.button_addContent", SM.Editor.Video.addContent);

			//Marker settings
			$(document).on("change", "#hotspotImageSource", SM.Editor.Marker.onHotspotImageSourceChange);
			$(document).on("click", "#hotspotImageGallery img", SM.Editor.Marker.onClickHotspotImageGallery);
			$(document).on("blur", "#hotspotImageURL", SM.Editor.Marker.checkHotspotImageURLPreview);
			$(document).on("input", "#hotspotSizeWidth", SM.Editor.Marker.onInputHotspotSizeWidth);
			$(document).on("input", "#hotspotSizeHeight", SM.Editor.Marker.onInputHotspotSizeHeight);
			$(document).on("click", "#hotspotSettingsDone", SM.Editor.Marker.onHotspotSettingsDone);
			$(document).on("click", "#hotzoneSettingsDone", SM.Editor.Marker.onHotzoneSettingsDone);

			//Actions
			$(document).on("click", "div.actions_container button.add_action", function(){
				SM.Editor.Actions.addNewAction($(this).closest("div.actions_container"));
			});
			$(document).on("change", "select.actionType", SM.Editor.Actions.onActionTypeChange);
			$(document).on("click", "div.delete_action", SM.Editor.Actions.onDeleteAction);
			$(document).on("change", "div.actionParamsPuzzle select", SM.Editor.Actions.onPuzzleChange);
			
			//Element settings
			$(document).on("click", "#objectSettingsDone", SM.Editor.Object.onObjectSettingsDone);

			//Captions
			$(document).on("click", "#captionDone", SM.Editor.Caption.onCaptionDone);

			$(document).on('click', handleClick);
			$(document).bind('keydown', handleBodyKeyDown);
			$(document).bind('keyup', handleBodyKeyUp);

			// Slide Enter and Leave events
			$('article').live('slideenter', SM.Editor.onSlideEnterEditor);
			$('article').live('slideleave', SM.Editor.onSlideLeaveEditor);

			//Waiting overlay
			$(document).on('click',"#waiting_overlay", function(event){
				event.stopPropagation();
				event.preventDefault();
			});

			$(window).on('orientationchange',function(){
				$(window).trigger('resize');
			});

			// //Focus
			// $(window).focus(function(){
			// }).blur(function(){
			// });

			//Fancyboxes

			// fancybox to create a new view
			$("a#addViewFancybox").fancybox({
				'autoDimensions' : false,
				'scrolling': 'no',
				'width': 800,
				'height': 740,
				'padding': 0,
				"onStart"  : function(data) {
					SM.Editor.setContentAddMode(SM.Constant.VIEW);
					var clickedZoneId = $(data).attr("zone");
					SM.Editor.setCurrentArea($("#" + clickedZoneId));
					SM.Editor.Utils.loadTab('tab_views');
				},
				"onClosed"  : function(data) {
					SM.Editor.setContentAddMode(SM.Constant.NONE);
				}
			});
			
			//Loading fancybox
			$("#fancyLoad").fancybox({
				'type'		   : 'inline',
				'autoDimensions' : false,
				'scrolling': 'no',
				'autoScale' : true,		      
				'width': '100%',
				'height': '100%',
				'padding': 0,
				'margin' : 0,
				'overlayOpacity': 0.0,
				'overlayColor' : "#fff",
				'showCloseButton'	: false,
				'onComplete'  : function(data) {
					SM.Utils.Loader.prepareFancyboxForFullLoading();
				},
				'onClosed' : function(data) {
				}
			});

			//Change background
			$("#hidden_button_to_change_slide_background").fancybox({
				'autoDimensions' : false,
				'width': 800,
				'scrolling': 'no',
				'height': 600,
				'padding' : 0,
				"onStart"  : function(data) {
					SM.Editor.Image.setAddContentMode(SM.Constant.SCREEN);
					SM.Editor.Utils.loadTab('tab_pic_from_url');
				},
				"onClosed"  : function(data) {
					SM.Editor.Image.setAddContentMode(SM.Constant.NONE);
				}
			});

			//onbeforeunload event
			window.onbeforeunload = _exitConfirmation;
			_confirmOnExit = true;

			_bindedEditorEventListeners = true;
		}
	};

	//////////////
	// Event Listeners
	//////////////
	var addZoneThumbsEvents = function(container){
		$(container).find("a.addpicture").fancybox({
			'autoDimensions' : false,
			'width': 800,
			'scrolling': 'no',
			'height': 600,
			'padding' : 0,
			"onStart"  : function(data) {
				//re-set the current area to the clicked zone, because maybe the user have clicked in another editable zone before this one
				var clickedZoneId = $(data).attr("zone");
				SM.Editor.setCurrentArea($("#" + clickedZoneId));
				SM.Editor.Image.setAddContentMode(SM.Constant.NONE);
				SM.Editor.Utils.loadTab('tab_pic_from_url');
			}
		});

		$(container).find("a.addobject").fancybox({
			'autoDimensions' : false,
			'width': 800,
			'height': 600,
			'scrolling': 'no',
			'padding' : 0,
			"onStart"  : function(data) {
				var clickedZoneId = $(data).attr("zone");
				SM.Editor.setCurrentArea($("#" + clickedZoneId));
				SM.Editor.Utils.loadTab('tab_object_from_url');
			},
			"onClosed"  : function(data){
				SM.Editor.Object.resetPreview("tab_object_from_url_content");
			}
		});

		$(container).find("a.addvideo").fancybox({
			'autoDimensions' : false,
			'width': 800,
			'scrolling': 'no',
			'height': 600,
			'padding' : 0,
			"onStart"  : function(data) {
				var clickedZoneId = $(data).attr("zone");
				SM.Editor.setCurrentArea($("#" + clickedZoneId));
				SM.Editor.Utils.loadTab(SM.Editor.Video.getDefaultTab());
			},
			"onClosed"  : function(data){
				SM.Editor.Object.resetPreview("tab_video_from_url_content");
			}
		});
	};


	//////////////
	// Event Listeners
	//////////////
	
	var handleClick = function(event){
		SM.Editor.Marker.onClick(event);
	};

	var handleBodyKeyDown = function(event){
		switch (event.keyCode) {
		case 39: // right arrow
			if(SM.Editor.Slides.isSlideFocused()){
				if(SM.Slides.isScreen(SM.Screen.getCurrentScreen())){
					SM.Editor.View.forwardOneView();
				}
				event.preventDefault();
			}
			break;
		case 40: //down arrow	    
			if(SM.Editor.Slides.isSlideFocused()){
				SM.Screen.forwardOneScreen();
				event.preventDefault();
			}
			break;
		case 37: // left arrow
			if(SM.Editor.Slides.isSlideFocused()){
				if(SM.Slides.isScreen(SM.Screen.getCurrentScreen())){
					SM.Editor.View.backwardOneView();
				}
				event.preventDefault();
			}
			break;
		case 38: //up arrow	
			if(SM.Editor.Slides.isSlideFocused()){
				SM.Screen.backwardOneScreen();
				event.preventDefault();    		
			}
			break;
		case 17: //ctrl key
			_isCtrlKeyPressed = true;
			break;	
		case 67: //cKey
			if(SM.Editor.Slides.isSlideFocused()){
				if(_isCtrlKeyPressed){
					if(SM.Screen.getCurrentScreenNumber()){
						SM.Editor.Clipboard.copy(SM.Screen.getCurrentScreen());
					}
				}
			}
			break;	
		case 86: //vKey
		    if(SM.Editor.Slides.isSlideFocused()){
			    if(_isCtrlKeyPressed){
			    	SM.Editor.Clipboard.paste();
		    	}
		    }
		    break;
		case 46: //Supr key
			if(SM.Editor.Slides.isSlideFocused()){
				SM.Editor.Slides.removeCurrentSlide();
			}
			break;	
		}
	};

	var handleBodyKeyUp = function(event) {
	  switch (event.keyCode) {
	    case 17: //ctrl key
	    	_isCtrlKeyPressed = false;
	    	break;	     
	  }
	};

	var _exitConfirmation = function(){
		if(_confirmOnExit){
			if(SM.Editor.hasSceneChanged()){
				var confirmationMsg = SM.I18n.getTrans("i.ExitConfirmation");
				return confirmationMsg;
			}
		}
	};

	var allowExitWithoutConfirmation = function(){
		_confirmOnExit = false;
	};

	return {
			init 							: init,
			bindEditorEventListeners		: bindEditorEventListeners,
			addZoneThumbsEvents				: addZoneThumbsEvents,
			allowExitWithoutConfirmation 	: allowExitWithoutConfirmation
	};

}) (SceneMaker,jQuery);
