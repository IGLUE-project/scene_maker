SceneMaker.ObjectPlayer = (function(SM,$,undefined){
	
	var loadObject = function(slide){
		$.each(slide.children('.objectelement'),function(index,objectWrapper){
			if($(objectWrapper).hasClass('loadedObject')){
				return;
			} else {
				$(objectWrapper).addClass('loadedObject');
			}

			var object = $($(objectWrapper).attr("objectWrapper"));
			$(objectWrapper).html("<div style='" + $(objectWrapper).attr("objectStyle") + "'>" + SM.Utils.getOuterHTML(object) + "</div>");

			//Adjust dimensions
			// var objectToAdjust = ($($(objectWrapper).children()[0]).children()[0]);
			// var parent = $(objectToAdjust).parent();
			// var parentHeight = $(parent).height();
			// var parentWidth = $(parent).width();
			// var percentHeight = (parentHeight)/parentHeight*100;
			// var percentWidth = (parentWidth)/parentWidth*100;
			// $(objectToAdjust).height(percentHeight+"%");
			// $(objectToAdjust).width(percentWidth+"%");
		});
	};

	var unloadObject= function(slide){
		$.each($(slide).children('.objectelement:not(".unloadableObject")'),function(index,objectWrapper){
			$(objectWrapper).removeClass('loadedObject');
			$(objectWrapper).html("");
		});
	};
	
	var aftersetupSize = function(increase){
		if($(".current").hasClass("object")){
			loadObject($(".current"));
		}
	};
	
	return {
		loadObject 					: loadObject,
		unloadObject 				: unloadObject,
		aftersetupSize 				: aftersetupSize
	};

})(SceneMaker,jQuery);