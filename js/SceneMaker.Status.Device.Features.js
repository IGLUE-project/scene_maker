SceneMaker.Status.Device.Features = (function(SM,$,undefined){
	
	var init = function(){
	};

	var fillFeatures = function(){
		var features = {};

		//Fullscreen support
		features.fullscreen = SM.FullScreen.isFullScreenSupported();
		
		//Touchscreen detection
		features.touchScreen = !!('ontouchstart' in window);

		//LocalStorage detection
		features.localStorage = _checkLocalStorageSupport();

		//Session management
		features.history = ((typeof history === "object")&&(typeof history.back === "function")&&(typeof history.go === "function"));

		if((features.history)&&(typeof history.pushState == "function")){
			features.historypushState = true;
		} else {
			features.historypushState = false;
		}

		//FileReader API
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			features.reader = true;
		} else {
			features.reader = false;
		}

		//PDF native reader
		features.pdfReader = false;
		if((typeof navigator.mimeTypes == "object")&&("application/pdf" in navigator.mimeTypes)){
			features.pdfReader = true;
		}

		return features;
	};

	var _checkLocalStorageSupport = function(){
		var LSSupported = (typeof(Storage)!=="undefined");
		if(LSSupported){
			//Check if there is no security restrictions
			try {
				localStorage.setItem("myKey","myKeyValue");
				localStorage.getItem("myKey");
				localStorage.removeItem("myKey");
				return true;
			} catch(e){
				return false;
			}
		} else {
			return false;
		}
	};
	
	return {
		init            		: init,
		fillFeatures 			: fillFeatures
	};

}) (SceneMaker, jQuery);
