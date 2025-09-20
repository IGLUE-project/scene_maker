SceneMaker.Status.Device.Browser = (function(SM,$,undefined){
	//Constants
	var _UA_IE = 'Microsoft Internet Explorer';
	var _UA_NETSCAPE = 'Netscape';

	var init = function(){
	};

	var fillBrowser = function(){
		var browser = {};

		var _version = _getFirefoxVersion();
		if(_version!==-1){
			browser.name = SM.Constant.FIREFOX;
			browser.version = _version;
			return browser;
		}

		_version = _getGoogleChromeVersion();
		if(_version!==-1){
			browser.name = SM.Constant.CHROME;
			browser.version = _version;
			return browser;
		}

		_version = _getInternetExplorerVersion();
		if(_version!==-1){
			browser.name = SM.Constant.IE;
			browser.version = _version;
			return browser;
		}

		//Look for Safari and Android Native browser
		//They have the same user agent type
		_version = _getSafariVersion();
		if(_version!==-1){
			var _isAndroid = /android/i.test(navigator.userAgent);
			if(_isAndroid){
				browser.name = SM.Constant.ANDROID_BROWSER;
			} else {
				browser.name = SM.Constant.SAFARI;
			}
			browser.version = _version;
			return browser;
		}

		//No browser founded
		browser.name = SM.Constant.UNKNOWN;
		browser.version = -1;

		return browser;
	};

	var _getInternetExplorerVersion = function(){
		var rv = -1; //No explorer
		if (navigator.appName === _UA_IE) {
			var ua = navigator.userAgent;
			var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null){
				rv = parseFloat(RegExp.$1);
			} 
		} else if(navigator.appName === _UA_NETSCAPE){
			//Try to detect IE11
			var ua = navigator.userAgent;
			var re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
			if (re.exec(ua) != null){
				rv = parseFloat(RegExp.$1);
			}
		}
		return rv;
	};
			
	var _getFirefoxVersion = function(){
      var rv = -1; //No firefox
      if (navigator.appName === _UA_NETSCAPE) {
          var ua = navigator.userAgent;
          var re = new RegExp(".* Firefox/([0-9.]+)");
          if (re.exec(ua) != null){
           	rv = parseFloat(RegExp.$1);
          } 
      }
      return rv;
    };

	var _getGoogleChromeVersion = function(){
      var rv = -1; //No Google Chrome
      if (navigator.appName === _UA_NETSCAPE) {
          var ua = navigator.userAgent;
          var re = new RegExp(".* Chrome/([0-9.]+)");
           if (re.exec(ua) != null){
           	rv = parseFloat(RegExp.$1);
           }
      }
      return rv;
    };

	var _getSafariVersion = function(){
		var rv = -1; //No Safari
		if (navigator.appName === _UA_NETSCAPE){
			var ua = navigator.userAgent;
			if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf("crmo")==-1) {
				var rv = -2; //Safari with unknown version

				//Try to get Safari Version
				var re = new RegExp(".* Version/([0-9.]+)");
				if (re.exec(ua) != null){
					rv = parseFloat(RegExp.$1);
				}
			}
		}
		return rv;
	};
	
	return {
		init            		: init,
		fillBrowser				: fillBrowser
	};

}) (SceneMaker, jQuery);
