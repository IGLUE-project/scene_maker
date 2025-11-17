SceneMaker.Status = (function(SM,$,undefined){
	var _device;
	var _isEmbed;
	var _container;
	var _containerType;
	var _isExternalDomain;
	var _isPreview;
	var _protocol;
	
	var init = function(callback){
		_checkEmbed();
		_checkDomain();
		_checkContainer();
		_checkProtocol();
		_checkPreview();

		SM.Status.Device.init(function(returnedDevice){
			//Device and its viewport loaded
			_device = returnedDevice;

			if(typeof callback === "function"){
				callback();
			}
		});
	};

	var _checkEmbed = function(){
		_isEmbed = ((window.location != window.parent.location) ? true : false);
		return _isEmbed;
	};

	var _checkDomain = function(){
		_isExternalDomain = false;

		if(_checkEmbed()){
			try {
				var parent = window.parent;
				while(parent!=window.top){
					if(typeof parent.location.href === "undefined"){
						_isExternalDomain = true;
						break;
					} else {
						parent = parent.parent;
					}
				}
				if(typeof window.top.location.href === "undefined"){
					_isExternalDomain = true;
				}
			} catch(e) {
				_isExternalDomain = true;
			}
		}

		return _isExternalDomain;
	};

	var _checkContainer = function(){
		_container = undefined;
		_containerType = "undefined";

		if((_isEmbed)&&(!_isExternalDomain)){
			try{
				switch(window.frameElement.tagName){
					case "OBJECT":
					case "IFRAME":
					default:
						_containerType = window.frameElement.tagName;
						_container = window.frameElement;
				}
			} catch (e){}
		}
	};

	var _checkProtocol = function(){
		var protocol;
		try {
			protocol = document.location.protocol;
		} catch(e){}

		if(typeof protocol == "string"){
			var protocolMatch = protocol.match(/[\w]+/);
			if((protocolMatch instanceof Array)&&(typeof protocolMatch[0] == "string")){
				protocol = protocolMatch[0];
			} else {
				protocol = undefined;
			}
		}

		if(typeof protocol == "string"){
			_protocol = protocol;
		} else {
			_protocol = "unknown";
		}
	};

	var _checkPreview = function(){
		var options = SM.Utils.getOptions();
		if(typeof options["preview"] === "boolean"){
			_isPreview = options["preview"];
		} else {
			_isPreview = false;
		}
	};


	//////////////////////////
	// Getters and Setters
	//////////////////////////

	var getDevice = function(){
		return _device;
	};

	var isEmbed = function(){
		return _isEmbed;
	};

	var getContainer = function(){
		return _container;
	};

	var getContainerType = function(){
		return _containerType;
	};

	var isExternalDomain = function(){
		return _isExternalDomain;
	};

	var getProtocol = function(){
		if(typeof _protocol == "undefined"){
			_checkProtocol();
		}
		return _protocol;
	};

	var isPreview = function(){
		return _isPreview;
	};

	return {
		init						: init,
		getDevice					: getDevice,
		isExternalDomain 			: isExternalDomain,
		isEmbed						: isEmbed,
		getContainer				: getContainer,
		getContainerType			: getContainerType,
		getProtocol					: getProtocol,
		isPreview 					: isPreview
	};

}) (SceneMaker, jQuery);
