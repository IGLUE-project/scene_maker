SceneMaker.Editor.Object.Web = (function(SM,$,undefined){

	var init = function(){
	};	

	var generateWrapperForWeb = function(url){
		url = SM.Utils.checkUrlProtocol(SM.Utils.addParamToUrl(url,"wmode","opaque"));
		return "<iframe src='" + url + "' wmode='opaque'></iframe>";
	}
	
	var generatePreviewWrapperForWeb = function(url){
		url = SM.Utils.checkUrlProtocol(SM.Utils.addParamToUrl(url,"wmode","opaque"));
		return "<iframe class='objectPreview' src='" + url + "' wmode='opaque'></iframe>";
	};
			
	return {
		init : 							init,
		generatePreviewWrapperForWeb : 	generatePreviewWrapperForWeb,
		generateWrapperForWeb : 		generateWrapperForWeb
	};

}) (SceneMaker, jQuery);