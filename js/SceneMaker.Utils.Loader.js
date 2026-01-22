SceneMaker.Utils.Loader = (function(SM,undefined){

	var init = function(){
	};

	var preloadResources = function(scene){
		if (scene.screens && Array.isArray(scene.screens)) {
			for (let i = 0; i < scene.screens.length; i++) {
				var screen = scene.screens[i];
				if (screen.hotspots && Array.isArray(screen.hotspots)) {
					for (let j = 0; j < screen.hotspots.length; j++) {
						var hotspot = screen.hotspots[j];
						if (hotspot.actions && Array.isArray(hotspot.actions)) {
							for (let k = 0; k < hotspot.actions.length; k++) {
								_preloadResourcesForAction(hotspot.actions[k]);						
							}
						}
					}
				}	
			}
		}
	};

	var _preloadResourcesForAction = function(action){
		if (action.actionType && action.actionParams && (typeof action.actionParams === "object")) {
			switch(action.actionType){
			case "changeBackground":
				if (typeof action.actionParams.url === "string") {
					_preloadImages([action.actionParams.url]);
				}
				break;
			case "playSound":
				if (typeof action.actionParams.url === "string") {
					_preloadAudios([action.actionParams.url]);
				}
				break;
			default:
				break;
			}
		}
	};

	var _preloadImages = function(urls){
		for (let i = 0; i < urls.length; i++) {
			const img = new Image();
			img.src = urls[i];
		}
	};

	var _preloadAudios = function(urls) {
		for (let i = 0; i < urls.length; i++) {
			const audio = new Audio();
			audio.src = urls[i];
			audio.preload = "auto";
		}
	};

	var loadScript = function(scriptSrc,callback){
		if((typeof scriptSrc !== "string")||(typeof callback !== "function")){
			return;
		}

		var head = document.getElementsByTagName('head')[0];
		if(head){
			var script = document.createElement('script');
			script.setAttribute('src',scriptSrc);
			script.setAttribute('type','text/javascript');

			//Only call callback once
			var callbackCalled = false;

			var callCallback = function(){
				if(!callbackCalled){
					if(typeof callback == "function"){
						callbackCalled = true;
						callback();
					}
				}
			};

			var loadFunction = function(){
				if((this.readyState == 'complete')||(this.readyState == 'loaded')){
					callCallback();
				}
			};
			//calling a function after the js is loaded (IE)
			script.onreadystatechange = loadFunction;

			//calling a function after the js is loaded (Firefox & GChrome)
			script.onload = callCallback;

			head.appendChild(script);
		}
	};

	var loadCSS = function(path,callback){
		var url = path;
		if(url.indexOf("http") != 0){
			url = SM.StylesheetsPath + url;
			if(SM.Status.getProtocol()==="file"){
				if(url.indexOf("/") == 0){
					url = url.replace("/","");
				} 
			}
		}
		
		var head = document.getElementsByTagName('head')[0];
		var link = document.createElement('link');
		link.type = "text/css";
		link.rel = "stylesheet"
		link.href = url;

		//Callback
		if(typeof callback == "function"){

			//Only call callback once
			var callbackCalled = false;

			var callCallback = function(){
				if(!callbackCalled){
					callbackCalled = true;
					callback();
				}
			}

			//calling a function after the css is loaded (Firefox & Google Chrome)
			link.onload = callCallback;
			link.onerror = callCallback;

			var loadFunction = function(){
				if((this.readyState == 'complete')||(this.readyState == 'loaded')){
					callCallback();
				}
			};
			//calling a function after the css is loaded (IE)
			link.onreadystatechange = loadFunction;
		};

		head.appendChild(link);

		if(typeof callback == "function"){
			//Workaround for browsers that don't support LINK onload functions
			var img = document.createElement('img');
			img.onerror = function(){
				callCallback();
			}
			img.src = url;
		}
	};

	var loadLanguageCSS = function(){
		var languagesWithCSS = ["es", "sr"];
		var language = SM.I18n.getLanguage();
		if(languagesWithCSS.indexOf(language)!=-1){
			//Load CSS for this language
			loadCSS("language/" + language + ".css");
		}
	};


	/*
	* Loading dialogs
	*/

	///////////////////
	// Full Loading
	///////////////////

	var t1Loading;

	var startLoading = function(){
		if(!_isFullLoadingActive()){
			t1Loading = Date.now();
			$("#fancyLoad").trigger('click');
		}
	};

	var stopLoading = function(callback){
		var diff = Date.now()-t1Loading;

		if(diff < 1250){
			setTimeout(function(){
				stopLoading(callback);
			},Math.max(0,Math.min(1250-diff,1250)));
		} else {
			var closed = false;
			var tWClose = 0;
			if(_isFullLoadingActive()){
				$.fancybox.close();
				closed = true;
				tWClose = 800;
			}
			if(typeof callback == "function"){
				setTimeout(function(){
					callback(closed);
				},tWClose);
			}
		}
	};

	var prepareFancyboxForFullLoading = function(){
		$("#fancybox-outer").css("background", "rgba(255,255,255,0.9)");
		$("#fancybox-wrap").css("margin-top", "20px");
       	$("#fancybox-wrap").css("margin-left", "20px");
	};

	var _isFullLoadingActive = function(){
		return $("#loading_fancy").is(":visible");
	};

	var startLoadingInContainer = function(container,options){
		var loadImg = document.createElement("img");
		$(loadImg).addClass("loading_fancy_img");
		$(loadImg).attr("src", SM.ImagesPath + "lightbox-ico-loading.gif");
		if((options)&&(options.style)){
			$(loadImg).addClass(options.style);
		}
		var loadingBody = document.createElement("div");
		$(loadingBody).addClass("loading_fancy");
		$(loadingBody).append(loadImg);

		$(container).html("");
		$(container).append(loadingBody);
		$(container).addClass("loadingtmpShown");
	};

	var stopLoadingInContainer = function(container){
		$(container).find(".loading_fancy_img").parent().remove();
		$(container).removeClass("loadingtmpShown");
	};


	return {
		init 							: init,
		preloadResources				: preloadResources,
		loadScript						: loadScript,
		loadCSS							: loadCSS,
		loadLanguageCSS					: loadLanguageCSS,
		prepareFancyboxForFullLoading	: prepareFancyboxForFullLoading,
		startLoading					: startLoading,
		stopLoading						: stopLoading,
		startLoadingInContainer			: startLoadingInContainer,
		stopLoadingInContainer			: stopLoadingInContainer
	};

}) (SceneMaker);