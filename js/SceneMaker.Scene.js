SceneMaker.Scene = (function(SM,undefined){

	var init = function(scene,callback){
		SM.ViewerAdapter.applyAspectRatio(scene.aspectRatio);
		SM.Renderer.init();
		var screens = scene.screens;
		for(var i=0;i<screens.length;i++){
			SM.Renderer.renderScreen(screens[i]);
		}

		if(typeof callback == "function"){
			callback();
		}
	};


	return {
		init: init
	};

}) (SceneMaker);