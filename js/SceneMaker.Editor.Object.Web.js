SceneMaker.Editor.Object.Web = (function(SM,$,undefined){

	var init = function(){
	};	

	var generateWrapperForWeb = function(url){
		url = SM.Utils.checkWebUrl(url);
		return "<iframe src='" + url + "' wmode='opaque'></iframe>";
	};

	var generateWrapperForReusablePuzzleInstance = function(url){
		url = SM.Utils.checkReusablePuzzleInstanceUrl(url);
		return "<iframe src='" + url + "' reusablepuzzleinstance='true' wmode='opaque'></iframe>";
	};
	
	var generatePreviewWrapperForWeb = function(url){
		url = SM.Utils.checkWebUrl(url);
		return "<iframe class='objectPreview' src='" + url + "' wmode='opaque'></iframe>";
	};

	var generatePreviewWrapperForReusablePuzzleInstance = function(url){
		url = SM.Utils.checkReusablePuzzleInstanceUrl(url);
		return generatePreviewWrapperForWeb(url);
	};
			
	return {
		init 											: 	init,
		generatePreviewWrapperForWeb 					: 	generatePreviewWrapperForWeb,
		generateWrapperForReusablePuzzleInstance 		: 	generateWrapperForReusablePuzzleInstance,
		generateWrapperForWeb 							: 	generateWrapperForWeb,
		generatePreviewWrapperForReusablePuzzleInstance	: 	generatePreviewWrapperForReusablePuzzleInstance
	};

}) (SceneMaker, jQuery);