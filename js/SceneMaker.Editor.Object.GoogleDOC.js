SceneMaker.Editor.Object.GoogleDOC = (function(SM,$,undefined){

	var init = function(){
	};

	var generateWrapper = function(url){
		return SM.Object.GoogleDOC.generateWrapper(url);
	};
	
	var generatePreviewWrapper = function(url){
		var objectWrapper = SM.Object.GoogleDOC.generateWrapper(url);
		var previewWrapper = $(objectWrapper);
		$(previewWrapper).addClass("objectPreview");
		return SM.Utils.getOuterHTML(previewWrapper);
	};
		
	return {
		init					: init,
		generatePreviewWrapper 	: generatePreviewWrapper,
		generateWrapper 		: generateWrapper
	};

}) (SceneMaker, jQuery);
