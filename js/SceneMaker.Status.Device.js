SceneMaker.Status.Device = (function(SM,$,undefined){

	var init = function(callback){
		SM.Status.Device.Browser.init();
		SM.Status.Device.Features.init();
		_fillDevice(callback);
	};

	var _fillDevice = function(callback){
		var device = {};
		device.browser = SM.Status.Device.Browser.fillBrowser();
		device.features = {};
 
		_fillUserAgentBeforeViewport(device);
		_loadViewportForDevice(device,function(){
			//On viewport loaded
			device.features = SM.Status.Device.Features.fillFeatures();

			if(typeof callback === "function"){
				callback(device);
			}
		});
	};

	var _fillUserAgentBeforeViewport = function(device){
		//Apple devices
		device.iPhone = /iPhone/i.test(navigator.userAgent);
		device.iPad = /iPad/i.test(navigator.userAgent);
		device.iOS = device.iPhone || device.iPad;

		//Android devices
		device.android = /android/i.test(navigator.userAgent);
	};

	var _loadViewportForDevice = function(device,callback){
		if((device.iOS)&&(device.browser.name===SM.Constant.SAFARI)){
			_setViewportForSafariForIphone(callback);
		} else if(device.android){
			if(device.browser.name===SM.Constant.CHROME){
				_setViewportForChromeForAndroid(callback);
			} else if(device.browser.name===SM.Constant.ANDROID_BROWSER){
				_setViewportForAndroidBrowser(callback);
			}
		} else {
			if(typeof callback === "function"){
				callback();
			}
		}
	};

	/*
	 * Take a look at meta viewport browser compatibility
	 * http://www.quirksmode.org/mobile/tableViewport.html#metaviewport
	 *
	 * Totally remove viewport is not supported in Safari or Android browsers
	 * Change its content "on fly" fails in some devices.
	 * So, its preferable to load an initial suitable viewport according to the specific device
	 */
	var _setViewport = function(viewportContent,callback){
		var viewport = $("head>meta[name='viewport']");
		if(viewport.length===0){
			//Insert viewport
			$("head").prepend('<meta name="viewport" content="'+viewportContent+'"/>');
		} else {
			//Change viewport
			$(viewport).attr("content",viewportContent);
		}
		setTimeout(function(){
			if(typeof callback === "function"){
				callback();
			}
		},1250);
	};

	var _setViewportForAndroidBrowser = function(callback){
		_setViewport("user-scalable=yes",callback);
	};

	var _setViewportForChromeForAndroid = function(callback){
		_setViewport("width=device-width,height=device-height,user-scalable=yes",callback);
	}

	var _setViewportForSafariForIphone = function(callback){
		_setViewport("user-scalable=yes",callback);
	};

	return {
		init  : init
	};

}) (SceneMaker, jQuery);
