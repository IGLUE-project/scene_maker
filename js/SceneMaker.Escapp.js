SceneMaker.Escapp = (function(SM,$,undefined){
	var _escapp;
	var _puzzlesSolved;
	var _linkedPuzzleIds;
	var _relatedPuzzleIds;
	var _actionsForRelatedPuzzles;

	var init = function(options, scene){
		_puzzlesSolved = [];
		_actionsForRelatedPuzzles = {};
		_linkedPuzzleIds = _getLinkedPuzzleIdsForScene(scene);
		_relatedPuzzleIds = _getRelatedPuzzleIdsForScene(scene);
		if((_linkedPuzzleIds.length === 0)&&(_relatedPuzzleIds.length === 0)){
			//No need to use Escapp.
			return;
		}
		if(SM.Status.isPreview() === true){
			return;
		}

		var defaultEscappSettings = _getDefaultEscappSettings(options, scene);
		var escappSettings = SM.Utils.deepMerge((options.escapp || {}), defaultEscappSettings);

		//Add callbacks
		escappSettings.onNewErStateCallback = function(erState){
			_updateSceneState(erState);
		};
		escappSettings.onErRestartCallback = function(erState){
			_puzzlesSolved = [];
			_updateSceneState(erState);
		};

		_escapp = new ESCAPP(escappSettings);
		SM.Debugging.log("Escapp client initiated with settings:", _escapp.getSettings());

		//Authenticate user in Escapp
		_escapp.validate((success, erState) => {
			try {
				SM.Debugging.log("Escapp validation", success, erState);
				if(success){
					_updateSceneState(erState);
				}
			} catch (e){
				SM.Debugging.log("Error in escapp validate callback", e);
			}
		});
	};

	var _getDefaultEscappSettings = function(options, scene){
		var settings = {
			imagesPath: SM.ImagesPath + "libs/escapp/",
			linkedPuzzleIds: _linkedPuzzleIds,
			relatedPuzzleIds: _relatedPuzzleIds,
			preview: SM.Status.isPreview(),
			silent: (SM.Debugging.isDevelopping()!==true),
			forceValidation: true,
			notifications: "FALSE",
			rtc: true,
			restoreState: "AUTO",
			I18n: {
				locale: SM.I18n.getLanguage(),
			}
		};
		if(typeof options.user !== "undefined"){
			settings.user = options.user;
		}
		return settings;
	};

	var _getLinkedPuzzleIdsForScene = function(scene){
		var linkedPuzzleIds = [];

		for (var screenIndex in scene.screens) {
			var screen = scene.screens[screenIndex];
			for (var hotspotIndex in screen.hotspots) {
				var hotspot = screen.hotspots[hotspotIndex];
				linkedPuzzleIds = linkedPuzzleIds.concat(_getLinkedPuzzleIdsForActions(hotspot.actions));
			}
			for (var hotzoneIndex in screen.hotzones) {
				var hotzone = screen.hotzones[hotzoneIndex];
				linkedPuzzleIds = linkedPuzzleIds.concat(_getLinkedPuzzleIdsForActions(hotzone.actions));
			}
		}

		//Remove duplicates and convert to numbers
		linkedPuzzleIds = [...new Set(linkedPuzzleIds
		.map(Number)
		.filter(n => !isNaN(n))
		)].sort((a, b) => a - b);

		return linkedPuzzleIds;
	};

	var _getLinkedPuzzleIdsForActions = function(actions){
		var linkedPuzzleIds = [];
		if (Array.isArray(actions)){
			for (var actionIndex in actions) {
				var action = actions[actionIndex];
				if((action.actionType === "solvePuzzle")&&(typeof action.actionParams !== "undefined")&&(typeof action.actionParams.puzzleId === "string")){
					linkedPuzzleIds.push(action.actionParams.puzzleId);
				}
			};
		}
		return linkedPuzzleIds;
	};

	var _getRelatedPuzzleIdsForScene = function(scene){
		var relatedPuzzleIds = _getRelatedPuzzleIdsForActions(scene.actions);
		//Include _linkedPuzzleIds
		relatedPuzzleIds = (relatedPuzzleIds.map(Number).filter(n => !isNaN(n))).concat(_linkedPuzzleIds);

		//Remove duplicates
		relatedPuzzleIds = [...new Set(relatedPuzzleIds)].sort((a, b) => a - b);

		return relatedPuzzleIds;
	};

	var _getRelatedPuzzleIdsForActions = function(actions){
		var relatedPuzzleIds = [];
		if (Array.isArray(actions)){
			for (var actionIndex in actions) {
				var action = actions[actionIndex];
				if(typeof action.event !== "undefined"){
					var event = action.event;
					if((event.eventType === "puzzleSolved")&&(typeof event.eventParams !== "undefined")&&(typeof event.eventParams.puzzleId === "string")){
						relatedPuzzleIds.push(event.eventParams.puzzleId);
						if(typeof _actionsForRelatedPuzzles[event.eventParams.puzzleId] === "undefined"){
							_actionsForRelatedPuzzles[event.eventParams.puzzleId] = [];
						}
						_actionsForRelatedPuzzles[event.eventParams.puzzleId].push(action);
					}
				}
			};
		}
		return relatedPuzzleIds;
	};

	var _updateSceneState = function(erState, afterSubmitPuzzle=false){
		if((typeof erState !== "undefined")&&(Array.isArray(erState.puzzlesSolved))){
			var newPuzzles = erState.puzzlesSolved.filter(
				puzzleId => !_puzzlesSolved.includes(puzzleId) && _relatedPuzzleIds.includes(puzzleId)
			).sort((a, b) => a - b);
			var actions = [];
			newPuzzles.forEach(function(puzzleId) {
				_puzzlesSolved.push(puzzleId);
				var actionsForPuzzle = _actionsForRelatedPuzzles[puzzleId];
				if(Array.isArray(actionsForPuzzle)){
					actions = actions.concat(actionsForPuzzle);
				}
			});
			_puzzlesSolved = _puzzlesSolved.sort((a, b) => a - b);
			_updateSceneWithActions(actions, afterSubmitPuzzle);
		}
	};

	var _updateSceneWithActions = function(actions, afterSubmitPuzzle){
		//If there are several actions with type "goToScreen" or "openView", apply only the last one.
		var lastIndexSlideMovement = actions.map(a => a.actionType).reduce((last, type, i) => 
			(type === "goToScreen" || type === "openView") ? i : last, -1
		);
		actions = actions.filter((a, i) =>
			!(a.actionType === "goToScreen" || a.actionType === "openView") || i === lastIndexSlideMovement
		);

		//If there are several actions with type "playSound", apply only the last one.
		var lastIndexPlaySound = actions.map(a => a.actionType).reduce((last, type, i) => 
			(type === "playSound") ? i : last, -1
		);
		actions = actions.filter((a, i) =>
			!(a.actionType === "playSound") || i === lastIndexPlaySound
		);

		//Ignore delays.
		if(afterSubmitPuzzle === false){
			actions = actions.map(action => ({
			  ...action,
			  actionParams: action.actionParams
			    ? (({ delay, ...rest }) => rest)(action.actionParams)
			    : action.actionParams
			}));
		}

		SM.Actions.performActions(actions);
	};

	var submitPuzzleSolution = function(puzzleId, puzzleSolution){
		var puzzleId = Number(puzzleId);
		if((!isNaN(puzzleId))&&(_linkedPuzzleIds.includes(puzzleId))&&(!_puzzlesSolved.includes(puzzleId))){
			if(SM.Status.isPreview() !== true){
				if(typeof _escapp !== "undefined"){
					_escapp.submitPuzzle(puzzleId, puzzleSolution, {}, (success, res) => {
						//SM.Debugging.log("Solution submitted to Escapp", puzzleId, puzzleSolution, success, res);
						if(success){
							_updateSceneState(res.erState, true);
						}
					});
				}
			} else {
				//Preview
				var erState = {puzzlesSolved: JSON.parse(JSON.stringify(_puzzlesSolved))};
				erState.puzzlesSolved.push(puzzleId);
				_updateSceneState(erState, true);
			}
		}
	};

	var getEscapp = function(){
		return _escapp;
	};

	return {
		init 					: init,
		getEscapp 				: getEscapp,
		submitPuzzleSolution	: submitPuzzleSolution
	};

}) (SceneMaker, jQuery);