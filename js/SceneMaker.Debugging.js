SceneMaker.Debugging = (function(SM,$,undefined){
	
	var developping = false;
	var settings;

	var init = function(options){
		if((options)&&(typeof options["developping"] == "boolean")){
			developping = options["developping"];
			if(developping){
				if(options["developmentSettings"]){
					settings = options["developmentSettings"];
				}
			}
		} else {
			developping = false;
			settings = null;
		}
	};
	
	var log = function(text){
		if ((window.console && window.console.log) && (developping)) {
			console.log(text);
		}
	};
	
	var enableDevelopingMode = function(){
		developping = true;
	};
	
	var disableDevelopingMode = function(){
		developping = false;
	};
	
	var isDevelopping = function(){
		return developping;
	};
	
	var getActionInit = function(){
		if(settings){
			return settings.actionInit;
		} else {
			//Default action
			return "nothing";
		}
	};
	
	var getTestingScene = function(){
		if((settings)&&(settings.testing_scene)){
			return settings.testing_scene;
		} else {
			log("Error: Please specify development settings");
			return null;
		}
	};
	
	return {
		init 						: init,
		log 						: log,
		enableDevelopingMode 		: enableDevelopingMode,
		disableDevelopingMode		: disableDevelopingMode,
		isDevelopping				: isDevelopping,
		getActionInit				: getActionInit,
		getTestingScene				: getTestingScene
	};

}) (SceneMaker, jQuery);
