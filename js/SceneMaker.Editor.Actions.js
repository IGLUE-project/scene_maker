SceneMaker.Editor.Actions = (function(SM,$,undefined){

	var init = function(){
		//Fill action template with current puzzles
		var currentOptionsPuzzles = [];
		var nPuzzles = SM.Editor.getOptions().nPuzzles;
		if((typeof nPuzzles === "number")&&(nPuzzles > 0)){
			for(var inp = 0; inp < nPuzzles; inp++){
				var nPuzzle = (inp+1);
				currentOptionsPuzzles.push({
					value: nPuzzle,
					text: (SM.I18n.getTrans("i.PuzzleOption", {number: nPuzzle}))
				});
			}
		}

		$("div.actionWrapperTemplate div.actionParamsPuzzle select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsPuzzles, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});
	};

	var _refreshActionTemplate = function(){
		var $actionTemplateDiv = $("div.actionWrapperTemplate");

		var currentOptionsScreens = [];
		$('article[type="' + SM.Constant.SCREEN + '"]').each(function() {
			var $screen = $(this);
			currentOptionsScreens.push({
				value: $screen.attr('id'),
				text: (SM.I18n.getTrans("i.ScreenOption", {number: $screen.attr('slidenumber')}))
			});
		});

		$actionTemplateDiv.find("div.actionParamsScreen select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsScreens, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});

		$actionTemplateDiv.find("div.actionParamsScreenReplacement select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsScreens, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});

		//Fill action template with current views
		var currentOptionsViews = [];
		var currentOptionsScreenViews = [];
		var currentOptionsImageViews = [];

		var $currentScreen = $(SM.Screen.getCurrentScreen());
		var currentScreenId = $currentScreen.attr('id');
		$("article[type='screen'] > article").each(function(){
			var $view = $(this);
			var $screen = $(this).parent();
			var option = {
				value: $view.attr('id'),
				text: (SM.I18n.getTrans("i.ViewOption", {screenNumber: $screen.attr('slidenumber'), viewNumber: $view.attr('slidenumber')}))
			};
			currentOptionsViews.push(option);

			if($screen.attr('id') === currentScreenId){
				currentOptionsScreenViews.push(option);
			}
			if($view.attr("type") === SM.Constant.VIEW_IMAGE){
				currentOptionsImageViews.push(option);
			}
		});

		$actionTemplateDiv.find("div.actionParamsView select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsScreenViews, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});

		//Fill action template with current slides with background (screens and image views)
		$actionTemplateDiv.find("div.actionParamsSlide select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			//Fill with screens
			$.each(currentOptionsScreens, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
			//Fill with views
			$.each(currentOptionsImageViews, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});
		
		//Fill action template with current hotspots
		var currentOptionsHotspotIds = [];
		$('img.hotspot').each(function() {
			var $hotspot = $(this);
			currentOptionsHotspotIds.push({
				value: $hotspot.attr('id'),
				text: $hotspot.attr('id')
			});
		});

		$actionTemplateDiv.find("div.actionParamsHotspotId select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsHotspotIds, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});

		//Fill action template with current hotzones
		var currentOptionsHotzonesIds = [];
		var slideData = SM.Editor.Marker.getSlideData();
		Object.keys(slideData).forEach((slideId, index) => {
			Object.keys(slideData[slideId].hotzones).forEach((hotzoneId, index) => {
				//var hotzone = slideData[slideId].hotzones[hotzoneId];
				currentOptionsHotzonesIds.push({
					value: hotzoneId,
					text: SM.Editor.Marker.getAliasForHotzone(hotzoneId)
				})
			});
		});

		$actionTemplateDiv.find("div.actionParamsHotzoneId select").each(function() {
			var $select = $(this);
			$select.empty();
			$select.append($('<option>', { value: "none", text: SM.I18n.getTrans("i.Unspecified") }))
			$.each(currentOptionsHotzonesIds, function(_, opt) {
				$select.append($("<option>", { value: opt.value, text: opt.text }));
			});
		});
	};

	var loadActions = function(container,elSettings,elType){
		//Remove prior actions
		$(container).find("div.actionWrapper:not(.actionWrapperTemplate)").remove();

		_refreshActionTemplate();

		$(container).addClass("actions_container");
		if(typeof elType === "string"){
			$(container).addClass("actions_container_" + elType);
		}

		//Fill properties with settings
		if (Array.isArray(elSettings.actions) && elSettings.actions.length > 0) {
			for(var i=0; i<elSettings.actions.length; i++){
				var action = elSettings.actions[i];
				if((typeof action.actionType === "string")&&(action.actionType !== "none")){
					var $actionWrapper = addNewAction(container);
					$actionWrapper.find("select.actionType").val(action.actionType).trigger('change');
					if(typeof action.actionParams !== "undefined"){
						if(typeof action.actionParams.screen === "string"){
							var $actionParamsScreenSelect = $actionWrapper.find("div.actionParamsScreen select");
							$actionParamsScreenSelect.val(action.actionParams.screen);
						}
						if(typeof action.actionParams.screenReplacement === "string"){
							var $actionParamsScreenSelectReplacement = $actionWrapper.find("div.actionParamsScreenReplacement select");
							$actionParamsScreenSelectReplacement.val(action.actionParams.screenReplacement);
						}
						if(typeof action.actionParams.view === "string"){
							var $actionParamsViewSelect = $actionWrapper.find("div.actionParamsView select");
							$actionParamsViewSelect.val(action.actionParams.view);
						}
						if(typeof action.actionParams.slide === "string"){
							var $actionParamsSlideSelect = $actionWrapper.find("div.actionParamsSlide select");
							$actionParamsSlideSelect.val(action.actionParams.slide);
						}
						if(typeof action.actionParams.text === "string"){
							var $actionParamsTextAreaText = $actionWrapper.find("div.actionParamsText textarea");
							$actionParamsTextAreaText.val(action.actionParams.text);
						}
						if(typeof action.actionParams.url === "string"){
							var $actionParamsUrlInput = $actionWrapper.find("div.actionParamsURL input");
							$actionParamsUrlInput.val(action.actionParams.url);
						}
						if(typeof action.actionParams.hotspotId === "string"){
							var $actionParamsHotspotIdSelect = $actionWrapper.find("div.actionParamsHotspotId select");
							$actionParamsHotspotIdSelect.val(action.actionParams.hotspotId);
						}
						if(typeof action.actionParams.hotzoneId === "string"){
							var $actionParamsHotzoneIdSelect = $actionWrapper.find("div.actionParamsHotzoneId select");
							$actionParamsHotzoneIdSelect.val(action.actionParams.hotzoneId);
						}
						if(typeof action.actionParams.puzzleId === "string"){
							var $actionParamsPuzzleSelect = $actionWrapper.find("div.actionParamsPuzzle select");
							$actionParamsPuzzleSelect.val(action.actionParams.puzzleId);
							_onPuzzleChange(action.actionParams.puzzleId,$actionWrapper);
						}
					}
				}
			}	
		}
	};

	var addNewAction = function(container){
		var $actionWrapperDiv = $("div.actionWrapperTemplate").clone().removeClass("actionWrapperTemplate").show();
		$(container).append($actionWrapperDiv);
		return $actionWrapperDiv;
	};

	var onActionTypeChange = function(event){
		var option = event.target.value;
		var $actionWrapperDiv = $(event.target).closest("div.actionWrapper");
		var $selectScreenWrapper = $actionWrapperDiv.find("div.actionParamsScreen");
		var $selectScreen = $selectScreenWrapper.find("select");
		var $selectScreenReplacementWrapper = $actionWrapperDiv.find("div.actionParamsScreenReplacement");
		var $selectScreenReplacement = $selectScreenReplacementWrapper.find("select");
		var $selectViewWrapper = $actionWrapperDiv.find("div.actionParamsView");
		var $selectView = $selectViewWrapper.find("select");
		var $selectSlideWrapper = $actionWrapperDiv.find("div.actionParamsSlide");
		var $selectSlide = $selectSlideWrapper.find("select");
		var $textAreaTextWrapper = $actionWrapperDiv.find("div.actionParamsText");
		var $textAreaText = $textAreaTextWrapper.find("textarea");
		var $inputURLWrapper = $actionWrapperDiv.find("div.actionParamsURL");
		var $inputURL = $inputURLWrapper.find("input");
		var $selectHotspotIdWrapper = $actionWrapperDiv.find("div.actionParamsHotspotId");
		var $selectHotspotId = $selectHotspotIdWrapper.find("select");
		var $selectHotzoneIdWrapper = $actionWrapperDiv.find("div.actionParamsHotzoneId");
		var $selectHotzoneId = $selectHotzoneIdWrapper.find("select");
		var $selectPuzzleWrapper = $actionWrapperDiv.find("div.actionParamsPuzzle");
		var $selectPuzzle = $selectPuzzleWrapper.find("select");
		var $inputPuzzleSolutionWrapper = $actionWrapperDiv.find("div.actionParamsPuzzleSolution");
		var $warningChangeBackgroundWrapper = $actionWrapperDiv.find("div.ActionWarningChangeBackground");

		if((option === "goToScreen")||(option === "changeScreen")){
			$selectScreen.prop("selectedIndex", 0);
			$selectScreenWrapper.show();
		} else {
			$selectScreenWrapper.hide();
		}
		if(option === "changeScreen"){
			$selectScreenReplacement.prop("selectedIndex", 0);
			$selectScreenReplacementWrapper.show();
		} else {
			$selectScreenReplacementWrapper.hide();
		}
		if(option === "openView"){
			$selectView.prop("selectedIndex", 0);
			$selectViewWrapper.show();
		} else {
			$selectViewWrapper.hide();
		}
		if(option === "changeBackground"){
			$selectSlide.prop("selectedIndex", 0);
			$selectSlideWrapper.show();
			$warningChangeBackgroundWrapper.show();
		} else {
			$selectSlideWrapper.hide();
			$warningChangeBackgroundWrapper.hide();
		}
		if(option === "showText"){
			$textAreaText.val("");
			$textAreaTextWrapper.show();
		} else {
			$textAreaTextWrapper.hide();
		}
		if((option === "openLink")||(option === "changeBackground")||(option === "playSound")||(option === "stopSound")){
			$inputURL.val("");
			$inputURLWrapper.show();
		} else {
			$inputURLWrapper.hide();
		}
		if((option === "showHotspot")||(option === "hideHotspot")){
			$selectHotspotId.prop("selectedIndex", 0);
			$selectHotspotIdWrapper.show();
		} else {
			$selectHotspotIdWrapper.hide();
		}
		if((option === "enableHotzone")||(option === "disableHotzone")){
			$selectHotzoneId.prop("selectedIndex", 0);
			$selectHotzoneIdWrapper.show();
		} else {
			$selectHotzoneIdWrapper.hide();
		}
		if(option === "solvePuzzle"){
			$selectPuzzle.prop("selectedIndex", 0);
			$selectPuzzleWrapper.show();
		} else {
			$selectPuzzleWrapper.hide();
		}
		$inputPuzzleSolutionWrapper.hide();
	};

	var onPuzzleChange = function(event){
		var option = event.target.value;
		var $actionWrapperDiv = $(event.target).closest("div.actionWrapper");
		_onPuzzleChange(option,$actionWrapperDiv);
	};

	var _onPuzzleChange = function(option, $actionWrapperDiv){
		var $inputPuzzleSolutionWrapper = $actionWrapperDiv.find("div.actionParamsPuzzleSolution");
		var $inputPuzzleSolution = $inputPuzzleSolutionWrapper.find("input");
		if(option !== "none"){
			var $actionContainer = $actionWrapperDiv.parent();
			var inputPuzzleSolutionVal = "";
			if ($actionContainer.hasClass("actions_container_HOTSPOT")) {
				inputPuzzleSolutionVal = $("#hotspotIdInput").val();
			} else if ($actionContainer.hasClass("actions_container_HOTZONE")) {
				inputPuzzleSolutionVal = $("#hotzoneIdInput").val();
			}
			$inputPuzzleSolution.val(inputPuzzleSolutionVal);
			$inputPuzzleSolutionWrapper.show();
		} else {
			$inputPuzzleSolution.val();
			$inputPuzzleSolutionWrapper.hide();
		}
	};

	var onDeleteAction = function(event){
		$(event.target).closest(".actionWrapper").remove();
	};

	var getActionsJSON = function(container){
		var actions = [];
		$(container).find("div.actionWrapper").each(function(index, element) {
			var $actionWrapper = $(this);
			var actionType = $actionWrapper.find("select.actionType").val();
			if(actionType !== "none"){
				var action = {actionType: actionType, actionParams: {}};
				var $actionParamsScreenSelect = $actionWrapper.find("div.actionParamsScreen select");
				if($actionParamsScreenSelect.is(":visible")){
					action.actionParams.screen = $actionParamsScreenSelect.val();
				}
				var $actionParamsScreenReplacementSelect = $actionWrapper.find("div.actionParamsScreenReplacement select");
				if($actionParamsScreenReplacementSelect.is(":visible")){
					action.actionParams.screenReplacement = $actionParamsScreenReplacementSelect.val();
				}
				var $actionParamsViewSelect = $actionWrapper.find("div.actionParamsView select");
				if($actionParamsViewSelect.is(":visible")){
					action.actionParams.view = $actionParamsViewSelect.val();
				}
				var $actionParamsSlideSelect = $actionWrapper.find("div.actionParamsSlide select");
				if($actionParamsSlideSelect.is(":visible")){
					action.actionParams.slide = $actionParamsSlideSelect.val();
				}
				var $actionParamsTextAreaText = $actionWrapper.find("div.actionParamsText textarea");
				if($actionParamsTextAreaText.is(":visible")){
					action.actionParams.text = $actionParamsTextAreaText.val();
				}
				var $actionParamsUrlInput = $actionWrapper.find("div.actionParamsURL input");
				if($actionParamsUrlInput.is(":visible")){
					action.actionParams.url = SM.Editor.Utils.autocompleteUrls($actionParamsUrlInput.val());
				}
				var $actionParamsHotspotIdSelect = $actionWrapper.find("div.actionParamsHotspotId select");
				if($actionParamsHotspotIdSelect.is(":visible")){
					action.actionParams.hotspotId = $actionParamsHotspotIdSelect.val();
				}
				var $actionParamsHotzoneIdSelect = $actionWrapper.find("div.actionParamsHotzoneId select");
				if($actionParamsHotzoneIdSelect.is(":visible")){
					action.actionParams.hotzoneId = $actionParamsHotzoneIdSelect.val();
				}
				var $actionParamsPuzzleSelect = $actionWrapper.find("div.actionParamsPuzzle select");
				if($actionParamsPuzzleSelect.is(":visible")){
					action.actionParams.puzzleId = $actionParamsPuzzleSelect.val();
				}
				if (Object.keys(action.actionParams).length === 0) {
					delete action.actionParams;
				}
				actions.push(action);
			}
		});
		return actions;
	};

	return {
		init 					: init,
		loadActions				: loadActions,
		onActionTypeChange		: onActionTypeChange,
		addNewAction			: addNewAction,
		onPuzzleChange			: onPuzzleChange,
		onDeleteAction			: onDeleteAction,
		getActionsJSON			: getActionsJSON
	};

}) (SceneMaker, jQuery);