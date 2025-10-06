SceneMaker.Escapp = (function(SM,undefined){
	var escapp;

	var init = function(options, scene){
		var linkedPuzzleIds = _getLinkedPuzzleIdsForScene(scene);
		var relatedPuzzleIds = _getRelatedPuzzleIdsForScene(scene);
		if((linkedPuzzleIds.length === 0)&&(relatedPuzzleIds.length === 0)){
			//No need to use Escapp.
			return;
		}

		var defaultEscappSettings = _getDefaultEscappSettings(options, scene, linkedPuzzleIds, relatedPuzzleIds);
		var escappSettings = SM.Utils.deepMerge((options.escapp || {}), defaultEscappSettings);

		//Add callbacks
		escappSettings.onNewErStateCallback = function(erState){
			//TODO
			//console.log("onNewErStateCallback");
			//console.log(erState);
		};
		escappSettings.onErRestartCallback = function(erState){
			//TODO
			//console.log("onErRestartCallback");
			//console.log(erState);
		};

		escapp = new ESCAPP(escappSettings);
		SM.Debugging.log("Escapp client initiated with settings:", escapp.getSettings());

		//Authenticate user in Escapp
		escapp.validate((success, erState) => {
			try {
				//console.log("Escapp validation", success, erState);
				if(success){
					_restoreSceneState(erState);
				}
			} catch (e){
				SM.Debugging.log("Error in escapp validate callback", e);
			}
		});
	};

	var _getDefaultEscappSettings = function(options, scene, linkedPuzzleIds, relatedPuzzleIds){
		var settings = {
			imagesPath: SM.ImagesPath + "libs/escapp/",
			resourceId: scene.id,
			linkedPuzzleIds: linkedPuzzleIds,
			relatedPuzzleIds: relatedPuzzleIds,
			preview: false,
			silent: false,
			forceValidation: true,
			notifications: "FALSE",
			rtc: false,
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
		var relatedPuzzleIds = [];

		//TODO

		//Remove duplicates and convert to numbers
		relatedPuzzleIds = [...new Set(relatedPuzzleIds
		.map(Number)
		.filter(n => !isNaN(n))
		)].sort((a, b) => a - b);

		return relatedPuzzleIds;
	};

	var _restoreSceneState = function(erState){
		//TODO
	};

	var submitPuzzleSolution = function(puzzleId, puzzleSolution){
		if(typeof escapp !== "undefined"){
			escapp.submitPuzzle(puzzleId, puzzleSolution, {}, (success, erState) => {
				SM.Debugging.log("Solution submitted to Escapp", puzzleId, puzzleSolution, success, erState);
			});
		}
	};

	var getEscapp = function(){
		return escapp;
	};

	return {
		init 					: init,
		getEscapp 				: getEscapp,
		submitPuzzleSolution	: submitPuzzleSolution
	};

}) (SceneMaker);