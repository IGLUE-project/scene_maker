SceneMaker.Object.GoogleDOC = (function(SM,$,undefined){

	var init = function(){
	};

	var generateWrapper = function(url){
		url = SM.Utils.checkUrlProtocol(url);
		return "<iframe src='https://docs.google.com/viewer?url=" + url + "&embedded=true'></iframe>";
	};
		
	return {
		init					: init,
		generateWrapper 		: generateWrapper
	};

}) (SceneMaker, jQuery);
