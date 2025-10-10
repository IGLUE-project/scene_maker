SceneMaker.Viewer = (function(SM,$,undefined){

	//Initial options
	var initOptions;
	//Pointer to the current scene
	var current_scene;

	/**
	 * Function to initialize the Viewer
	 */
	var init = function(){
		_init(SM.getOptions())
	};

	var _init = function(options){
		SM.Editing = false;
		$("body").addClass("SceneMakerViewerBody");
		
		initOptions = (typeof options == "object") ? options : {};

		SM.Debugging.init(options);
		
		if((initOptions["configuration"])&&(SM.Configuration)){
			SM.Configuration.init(initOptions["configuration"]);
		}

		var scene = options.scene;
		SM.Utils.init();
		SM.I18n.init(initOptions,scene);

		SM.Debugging.log("\n\nScene Maker initiated with scene:\n"); 
		SM.Debugging.log(JSON.stringify(scene));

		scene = SM.Utils.fixScene(scene);
		if(scene===null){
			SM.Utils.showPNotValidDialog();
			return;
		}
		current_scene = scene;
		
		SM.Status.init(function(){
			//Status loading finishes
			_initAferStatusLoaded(options,scene);
		});
	};

	var _initAferStatusLoaded = function(options,scene){
		SM.Utils.Loader.loadLanguageCSS();
		SM.EventsNotifier.init();
		SM.Object.init();
		SM.Screen.init();
		SM.View.init();
		SM.Marker.init();
		SM.Actions.init();
		SM.Caption.init();
		SM.Slides.init();
		SM.I18n.translateUI();
		SM.User.init(options);
		SM.Events.init();
		SM.Video.init();
		SM.Audio.init();
		SM.FullScreen.init();
		SM.Scene.init(scene, function(){
			_initAferRenderScene(options,scene);
		});
	};

	var _initAferRenderScene = function(options,scene){
		SM.Video.HTML5.setMultimediaEvents();
		SM.Screen.updateCurrentScreenFromHash();
		SM.Screen.updateScreens();
		SM.ViewerAdapter.init(options);
		SM.Utils.Loader.preloadResources(scene);

		if(SM.Screen.getCurrentScreenNumber()>0){
			SM.Slides.triggerSlideEnterEvent($(SM.Screen.getCurrentScreen()).attr("id"));
		}

		if(!SM.Status.isExternalDomain()){
			//Try to win focus
			window.focus();
		}

		//Init Escapp client
		SM.Escapp.init(options,scene);
	};

	var getOptions = function(){	
		return initOptions;
	};

	var onSlideEnterViewer = function(e){
		var slide = e.target;
		var cSlideNumber = SM.Screen.getCurrentScreenNumber();
		var isView = SM.Slides.isView(slide);
		var isScreen = ((!isView)&&(SM.Slides.isScreen(slide)));

		//Prevent parent to trigger onSlideEnterViewer
		//Use to prevent screens to be called when enter in one of their views
		e.stopPropagation();

		var timeToLoadObjects = 500;

		setTimeout(function(){
			if(!isView){
				if(cSlideNumber!==SM.Screen.getCurrentScreenNumber()){
					//Prevent objects to load when the slide isn't focused
					return;
				}
			}
			if(!isScreen){
				if($(slide).hasClass(SM.Constant.OBJECT)){
					SM.ObjectPlayer.loadObject($(slide));
				}
			}
		},timeToLoadObjects);

		if(!isScreen){
			SM.Video.HTML5.playMultimedia(slide);
		}

		if(isScreen){
			SM.Screen.onEnterScreen(slide);
		}
	};

	var onSlideLeaveViewer = function(e){
		var slide = e.target;
		var isView = SM.Slides.isView(slide);
		var isScreen = ((!isView)&&(SM.Slides.isScreen(slide)));

		e.stopPropagation();

		if(!isScreen){
			if($(slide).hasClass(SM.Constant.OBJECT)){
				SM.ObjectPlayer.unloadObject($(slide));
			} else if($(slide).hasClass(SM.Constant.SNAPSHOT)){
				SM.SnapshotPlayer.unloadSnapshot($(slide));
			}
			SM.Video.HTML5.stopMultimedia(slide);
		} else {
			SM.Screen.onLeaveScreen(slide);
		}
	};
	
	var getCurrentScene = function(){
		return current_scene;
	};

	return {
		init 						: init, 
		getOptions					: getOptions,
		getCurrentScene				: getCurrentScene,
		onSlideEnterViewer			: onSlideEnterViewer,
		onSlideLeaveViewer			: onSlideLeaveViewer
	};

}) (SceneMaker,jQuery);