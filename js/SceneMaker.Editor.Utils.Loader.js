SceneMaker.Editor.Utils.Loader = (function(SM,$,undefined){

	var loadObjectsInEditorSlide = function(slide){
		_loadObjectsInEditor($(slide).find(".object_wrapper"));
	};

	var unloadObjectsInEditorSlide = function(slide){
		_unloadObjectsInEditor($(slide).find(".object_wrapper"));
	};

	var loadAllObjects = function(){
		_loadObjectsInEditor($(".object_wrapper"));
	};

	var unloadAllObjects = function(){
		_unloadObjectsInEditor($(".object_wrapper"));
	};

	var _loadObjectsInEditor = function(objects){
		$.each(objects, function(index, object){
			var htmlContent = $(object).attr("htmlContent");
			if(typeof htmlContent !== "undefined"){
				$(object).html(htmlContent);
				$(object).removeAttr("htmlContent");
			}
		});
	};

	var _unloadObjectsInEditor = function(objects){
		$.each(objects, function(index, object){
			var htmlContent = $(object).html();
			if((typeof htmlContent !== "undefined")&&(htmlContent!=="")){
				$(object).attr("htmlContent",$(object).html());
				$(object).html("");
			}
		});
	};

	var loadImagesOnContainer = function(imagesArray,containerId,options){
		var validImagesArray = imagesArray;
		var imagesLength = imagesArray.length;
		var imagesLoaded = 0;

		$.each(imagesArray, function(i, image){
			$(image).load(function(response) {
				imagesLoaded = imagesLoaded + 1;
				if(imagesLoaded === imagesLength){
					_insertElements(validImagesArray,containerId,options);
				}
			});
			$(image).error(function(response){
				imagesLoaded = imagesLoaded + 1;
				if(options.filterUnloadedImages === true){
					validImagesArray.splice(validImagesArray.indexOf(image),1);
				}
				if(imagesLoaded === imagesLength){
					_insertElements(validImagesArray,containerId,options);
				}
				
			});
		});
	};

	var _insertElements = function(imagesArray,containerId,options){
		$.each(imagesArray, function(i, image) {
			_insertElementOnContainer(image,imagesArray,containerId,options);
		});
		if(typeof options.callback === "function"){
			options.callback(options);
		}
	};

	var _insertElementOnContainer = function(image,imagesArray,containerId,options){
		var titleArray = options.titleArray;
		if((titleArray)&&(titleArray[imagesArray.indexOf(image)])){
			$("#" + containerId).append("<div><p>"+titleArray[imagesArray.indexOf(image)]+"</p>" + SM.Utils.getOuterHTML(image) + "</div>");
		} else {
			$("#" + containerId).append('<div>' + SM.Utils.getOuterHTML(image) + '</div>');
		}
	};

	return {
		loadObjectsInEditorSlide 	: loadObjectsInEditorSlide,
		unloadObjectsInEditorSlide 	: unloadObjectsInEditorSlide,
		loadAllObjects 				: loadAllObjects,
		unloadAllObjects			: unloadAllObjects,
		loadImagesOnContainer       : loadImagesOnContainer
	};

}) (SceneMaker, jQuery);