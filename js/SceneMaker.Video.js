SceneMaker.Video = (function(SM,$,undefined){
	
	var init = function(){
		SM.Video.HTML5.init();
		SM.Video.Youtube.init();
	};

	return {
		init : init
	};

})(SceneMaker,jQuery);