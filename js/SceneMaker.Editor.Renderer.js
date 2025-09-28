SceneMaker.Editor.Renderer = (function(SM,$,undefined){
	
	var _isRendering;

	var init = function(scene){
		_isRendering = false;
		_renderScene(scene);
	};

	var _renderScene = function(scene){
		_isRendering = true;

		var screens = scene.screens;
		for(var i=0;i<screens.length;i++){
			_renderScreen(screens[i]);
		}

		_isRendering = false;
	};

	var _renderScreen = function(screenJSON){
		var options = {};
		options.slideNumber = SM.Screen.getScreensQuantity()+1;
		options.screenId = (screenJSON.id).toString();
		var scaffold = SM.Editor.Dummies.getScaffoldForSlide(screenJSON,options);

		if(scaffold){
			SM.Editor.Screen.appendScreen(scaffold);
			SM.Screen.updateScreens();
			SM.Screen.goToLastScreen();  //important to get the browser to draw everything

			//Get screen in DOM
			var screenId = $(scaffold).attr("id");
			var scaffoldDOM = $("#"+screenId);

			//Draw views
			var views = screenJSON.views;
			if(views){
				var ssL = views.length;
				for(var i=0; i<ssL; i++){
					var viewJSON = views[i];
					_renderView(viewJSON, {screenDOM: scaffoldDOM, slideNumber: i+1});
				}
			}

			//Complete scaffold
			SM.Editor.Marker.drawSlideWithMakers(screenJSON,scaffoldDOM);
		}
	};

	var _renderView = function(view,renderOptions){
		if(view.type === SM.Constant.VIEW_CONTENT){
			_renderViewContent(view,renderOptions);
		} else if(view.type === SM.Constant.VIEW_IMAGE){
			_renderViewImage(view,renderOptions);
		}
	};

	var _renderViewCommon = function(view,renderOptions){
		var scaffold = SM.Editor.Dummies.getScaffoldForSlide(view,{slideNumber: renderOptions.slideNumber});
		SM.Editor.View.appendView(renderOptions.screenDOM,scaffold);
	};

	var _renderViewImage = function(view,renderOptions){
		_renderViewCommon(view,renderOptions);
		var scaffoldDOM = $("#"+view.id);
		SM.Editor.Marker.drawSlideWithMakers(view,scaffoldDOM);
	};

	var _renderViewContent = function(view,renderOptions){
		_renderViewCommon(view,renderOptions);
		var scaffoldDOM = $("#"+view.id);

		//Draw elements
		SM.Utils.addTempShown(scaffoldDOM);
		
		var viewElementsLength = view.elements.length;
		for(var i=0; i<viewElementsLength; i++){
			var element = view.elements[i];
			var zoneId = element.id;
			var area = $("div#" + zoneId);

			if(area.length === 0){
				continue;
			}

			//Save element settings
			if(element.settings){
				var serializedSettings = JSON.stringify(element.settings);
				$(area).attr("elSettings",serializedSettings);
			}

			if(element.type === SM.Constant.TEXT){
				SM.Editor.Text.launchTextEditor({}, area, element.body);  //in this case there is no event, so we pass a new empty object
			} else if(element.type === SM.Constant.IMAGE){
				SM.Editor.Image.drawImage(element.body, area, element.style, element.hyperlink, element.options);
			} else if(element.type === SM.Constant.VIDEO){
				var options = [];
				if(typeof element.poster === "string"){
					options['poster'] = element.poster;
				}
				options['autoplay'] = element.autoplay;
				SM.Editor.Video.HTML5.drawVideo(SM.Video.HTML5.getSourcesFromJSON(element), options, area, element.style);
			} else if(element.type === SM.Constant.AUDIO){
				var options = [];
				options['autoplay'] = element.autoplay;
				SM.Editor.Audio.HTML5.drawAudio(SM.Audio.HTML5.getSourcesFromJSON(element), options, area, element.style);
			} else if(element.type === SM.Constant.OBJECT){
				SM.Editor.Object.drawObject(element.body, {area:area, style:element.style});
			}

			//Add tooltips to area
			var hideTooltip = true;
			if(SM.Editor.isZoneEmpty(area)){
				hideTooltip = false;
				//Give class "editable" to the empty areas
				$(area).addClass("editable");
			}
			SM.Editor.Tools.addTooltipToZone(area,hideTooltip);
		}

		SM.Utils.removeTempShown(scaffoldDOM);
	};

	var isRendering = function(){
		return _isRendering;
	};


	return {
		init				: init,
		isRendering			: isRendering
	};

}) (SceneMaker, jQuery);