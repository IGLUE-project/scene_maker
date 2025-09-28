SceneMaker.Validator = (function(SM,$,undefined){
	
	var init = function(){
	};
	
	var validateObject = function(object){
		if(!object){
			return false;
		}
		
		if((typeof object === "string")&&(object.trim()==="")){
			return false;
		}

		var objectInfo = SM.Object.getObjectInfo(object);
		if(!objectInfo){
			return false;
		}
		if((!objectInfo.source)||(!objectInfo.type)){
			return false;
		}
		if(typeof objectInfo.source === "string"){
			if(objectInfo.source.trim()===""){
				return false;
			}
		} else if(typeof objectInfo.source === "object"){
			if(objectInfo.source.length<1){
				return false;
			}
		} else {
			return false;
		}

		return true;
	};
	
	return {
		init            	: init,
		validateObject  	: validateObject
	};

}) (SceneMaker, jQuery);