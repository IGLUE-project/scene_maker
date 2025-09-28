SceneMaker.Editor.Object.PDF = (function(SM,$,undefined){

	var init = function(){
	};

	var generateWrapper = function(url){
		return SM.Object.PDF.generateWrapper(url);
	};
	
	var generatePreviewWrapper = function(url){
		var objectWrapper = SM.Object.PDF.generateWrapper(url);
		var previewWrapper = $(objectWrapper);
		$(previewWrapper).addClass("objectPreview");
		return SM.Utils.getOuterHTML(previewWrapper);
	};
		
	return {
		init					: init,
		generateWrapper 		: generateWrapper,
		generatePreviewWrapper 	: generatePreviewWrapper
	};

}) (SceneMaker, jQuery);