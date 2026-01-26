SceneMaker.Editor.Utils = (function(SM,$,undefined){

	var dimentionsToDraw = function(w_zone, h_zone, w_content, h_content){
		var dimentions = {width:  w_content, height: h_content};
		var aspect_ratio_zone = w_zone/h_zone;
		var aspect_ratio_content = w_content/h_content;
		
		if (aspect_ratio_zone>aspect_ratio_content) {
			dimentions.width = aspect_ratio_content*h_zone;
			dimentions.height = h_zone;
			return dimentions;
		} else {
			dimentions.width = w_zone;
			dimentions.height = w_zone/aspect_ratio_content;
			return  dimentions;
		}
	};

	var setStyleInPixels = function(style,area){
		var filterStyle = "";
		$.each(style.split(";"), function(index, property){
			if ((property.indexOf("width") === -1)&&(property.indexOf("height")) === -1) {
				filterStyle = filterStyle + property + "; ";
			}
		});
		
		var dimensions = SM.Utils.getPixelDimensionsFromStyle(style,area);

		if((dimensions)&&(dimensions[0])){
			filterStyle = filterStyle + "width: " + dimensions[0] + "px; ";
			if(dimensions[1]){
				filterStyle = filterStyle + "height: " + dimensions[1] + "px; ";
			}
		}
		return filterStyle;
	};
	
	/**
	 * function to get the styles in percentages
	 */
	var getStylesInPercentages = function(parent, element){
		var WidthPercent = element.width()*100/parent.width();
		var HeightPercent = element.height()*100/parent.height();
		var TopPercent = element.position().top*100/parent.height();
		var LeftPercent = element.position().left*100/parent.width();
		return "position: relative; width:" + WidthPercent + "%; height:" + HeightPercent + "%; top:" + TopPercent + "%; left:" + LeftPercent + "%;";
	}; 

	var getStylesForFitContent = function(){
		return "position: relative; width:100%; height:100%; top:0%; left:0%;";
	};
	
	//Help function to autocomplete user inputs.
	//Add HTTP if is not present.
	var autocompleteUrls = function(input){
		var http_urls_pattern=/(^http(s)?:\/\/)/g
		var anchor_urls_pattern=/(^#)/g
		var objectInfo = SM.Object.getObjectInfo(input);
		if((objectInfo.wrapper===null)&&(input.match(http_urls_pattern)===null)&&(input.match(anchor_urls_pattern)===null)){
			return "http://" + input;
		} else {
			return input;
		}
	};


	/////////////////////////
	/// Fancy Box Functions
	/////////////////////////

	var loadTabTimer;

	/**
	 * Function to load a tab and its content in the fancybox
	 * also changes the help button to show the correct help
	 */
	var loadTab = function (tab_id){
		//hide previous tab
		$(".fancy_tab_content").hide();
		//show content
		$("#" + tab_id + "_content").show();
		//deselect all of them
		$(".fancy_tab").removeClass("fancy_selected");
		//select the correct one
		$("#" + tab_id).addClass("fancy_selected");

		//Submodule callbacks
		switch (tab_id) {
			//Image
			case "tab_pic_from_url":
				SM.Editor.Image.onLoadTab("url");
				break;
			//Video
			case "tab_video_from_url":
				SM.Editor.Video.onLoadTab();
				break;
			//Objects
			case "tab_object_from_url":
				SM.Editor.Object.onLoadTab("url");
				break;
			default:
				break;
		}
		return false;
	};

	var hideNonDefaultTabs = function(){
		$("div.fancy_tabs a.fancy_tab:not(.disabled)").show();
	};

	var showErrorDialog = function(msg){
		var options = {};
		options.width = 650;
		options.height = 190;
		options.text = msg;
		var button1 = {};
		button1.text = SM.I18n.getTrans("i.Ok");
		button1.callback = function(){
			$.fancybox.close();
		}
		options.buttons = [button1];
		SM.Utils.showDialog(options);
	};

	var enableElementSettingsField = function(element,enable){
		if(element instanceof Array){
			for(var i=0; i<element.length; i++){
				enableElementSettingsField(element[i],enable);
			}
			return;
		}

		if(enable){
			$(element).parent().removeClass("disableSettingsField");
			$(element).removeAttr('disabled');
		} else {
			if ($(element).is("input")){
				if ($(element).attr("type")==="checkbox"){
					var defaultCheckboxValue = ($(element).attr("defaultvalue")==="true") ? true : false;
					$(element).prop('checked', defaultCheckboxValue);
				}
			} else if ($(element).is("select")){
				var defaultSelectValue = $(element).find("option[selected='selected']").val();
				$(element).val(defaultSelectValue);
			}
			$(element).parent().addClass("disableSettingsField");
			$(element).attr('disabled', 'disabled');
		}
	};

	var toPascalCase = function(str) {
		return str
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.replace(/\s+(.)/g, (_, c) => c.toUpperCase())
		.replace(/^\w/, c => c.toUpperCase())
		.replace(/\s/g, "");
	};

	var getDateISO = function(){
		const d = new Date();
		const pad = n => String(n).padStart(2, "0");
		return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` +
		     `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
	};



	return {
		dimentionsToDraw			: dimentionsToDraw,
		setStyleInPixels  			: setStyleInPixels,		
		getStylesInPercentages 		: getStylesInPercentages,
		getStylesForFitContent		: getStylesForFitContent,
		autocompleteUrls 			: autocompleteUrls,
		loadTab						: loadTab,
		hideNonDefaultTabs			: hideNonDefaultTabs,
		showErrorDialog				: showErrorDialog,
		enableElementSettingsField	: enableElementSettingsField,
		toPascalCase				: toPascalCase,
		getDateISO					: getDateISO
	};

}) (SceneMaker, jQuery);

