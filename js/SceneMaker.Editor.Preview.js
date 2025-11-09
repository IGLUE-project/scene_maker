SceneMaker.Editor.Preview = (function(SM,$,undefined){

	var init = function(){
	};

	var preview = function(){
		var slideNumberToPreview = 1;
		if(typeof SM.PreviewPath !== "undefined"){
			$("#preview_action").attr("href", SM.PreviewPath + "#" + slideNumberToPreview);
		}
		window.SCENE_MAKER_OPTIONS_PREVIEW = JSON.parse(JSON.stringify(SM.getOptions()));
		window.SCENE_MAKER_OPTIONS_PREVIEW.preview = true;
		window.SCENE_MAKER_OPTIONS_PREVIEW.scene = SM.Editor.saveScene();

		_initFancybox();
		$("#preview_action").trigger('click');
	};

	var _initFancybox = function(){
		$("#preview_action").fancybox({
			'width'				: _getFancyboxDimensions().width,
			'height'			: _getFancyboxDimensions().height,
			'padding'			: 0,
			'autoScale'     	: false,
			'transitionIn'		: 'none',
			'transitionOut'		: 'none',
			'type'				: 'iframe',
			'onStart'			: function(){
				SM.Editor.Utils.Loader.unloadObjectsInEditorSlide(SM.Screen.getCurrentScreen());
			},
			'onClosed'			: function() {
				SM.Editor.Utils.Loader.loadObjectsInEditorSlide(SM.Screen.getCurrentScreen());
			},
			'onComplete': function() {
			}
		});
	};

	var _getFancyboxDimensions = function(){
		var dimensions = {};
		if($("body").attr("aspectRatio")==="16:9"){
			dimensions.width = 1000;
			dimensions.height = 670;
		} else {
			dimensions.width = 910;
			dimensions.height = 680;
		}
		return dimensions;
	};

	var getPreview = function(){
		return scenePreview;
	};

	return {
		init 			: init,
		preview 		: preview,
		getPreview 		: getPreview
	};

}) (SceneMaker, jQuery);