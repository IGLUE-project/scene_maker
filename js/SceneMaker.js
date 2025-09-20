/**
 * Scene Maker
 * Scene Maker is a web application for creating web scenes for escape rooms in a simple and user-friendly way
 */
var SceneMaker = SceneMaker || {};

SceneMaker.VERSION = '0.0.1';
SceneMaker.AUTHORS = 'GING UPM';
SceneMaker.URL = "https://github.com/agordillo/scene_maker";

SceneMaker.getOptions = function(){
	try {
		if(window.parent.SCENE_MAKER_OPTIONS_PREVIEW){
			return window.parent.SCENE_MAKER_OPTIONS_PREVIEW;
		}
		if(window.SCENE_MAKER_OPTIONS){
			return window.SCENE_MAKER_OPTIONS;
		}
		if(window.parent.SCENE_MAKER_OPTIONS){
			return window.parent.SCENE_MAKER_OPTIONS;
		}
	} catch (e){}
	return;
};