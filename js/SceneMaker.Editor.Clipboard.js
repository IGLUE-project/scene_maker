SceneMaker.Editor.Clipboard = (function(SM,$,undefined){

	var stack;
	var _lastTimestamp;
	var _localStorageKey = "SceneMakerClipboard";

	var init = function() {
		stack = [null,null,null];
		// stack = [ElementToCopy,typeOfElement,Params];
	};

	var copy = function(element) {
		if((!element)||(!SM.Slides.isScreen(element))){
			return;
		}

		stack[0] = SM.Utils.getOuterHTML($(element).clone()[0]);
		var params = {};
		//Store WYSIWYG values
		params.textAreas = SM.Editor.Slides.copyTextAreasOfSlide(element);
		stack[1] = params;
		
		if(SM.Status.getDevice().features.localStorage){
			localStorage.setItem(_localStorageKey,JSON.stringify(stack));
		}
	};

	var paste = function() {
		//Prevent massive copy
		if(_lastTimestamp){
			var elapsed = new Date().getTime() - _lastTimestamp;
			if(elapsed < 500){
				return;
			}
		}
		_lastTimestamp = new Date().getTime();

		//Select the stack
		if(SM.Status.getDevice().features.localStorage){
			var storedStack = localStorage.getItem(_localStorageKey);
			if(storedStack!==null){
				var myStack = JSON.parse(storedStack);
			}
		}

		if(!myStack){
			myStack = stack;
		}

		//Check selected stack and parse object to be copied
		if(!myStack[0]){
			return;
		} else {
			myStack[0] = $(myStack[0])[0];
		}

		//Copy screen
		var slideToCopy = $(myStack[0]).clone()[0];

		var options = {};
		if(myStack[1]){
			if(myStack[1].textAreas){
				options.textAreas = myStack[1].textAreas;
			}
		}
		SM.Editor.Screen.copyScreen(slideToCopy,options);
	};

	return {
			init 		: init,
			copy		: copy,
			paste		: paste
	};

}) (SceneMaker,jQuery);