/*
 * Configure ViSH Editor
 */

var options;

var getOptions = function(){
	if(!options){
		options = {};
		
		var configuration = {};

		//Paths
		configuration["ImagesPath"] = "/images/";
		configuration["StylesheetsPath"] = "/stylesheets/";
		configuration["PreviewPath"] = "/viewer.html";

		//Locales
		// configuration["defaultLanguage"] = "en";
		// configuration["locales"] = {
		// 	"en": {
		// 		"i.Settings"	: "Settings"
		// 	},
		// 	"es": {
		// 		"i.Settings"	: "Ajustes"
		// 	}
		// }

		options["configuration"] = configuration;


		// Options to initialize Scene Maker
		options["developping"] = true;

		if(options["developping"]==true){
			//Setting developping options
			var developmentSettings = new Object();
			developmentSettings.actionInit = "loadSamples"; // Possible action: "nothing" or "loadSamples".

			//Select your samples
			if((typeof VISH != "undefined")&&(typeof VISH.Samples != "undefined")){
				developmentSettings.samples = VISH.Samples.scene_hotspot_samples;
			}

			options["developmentSettings"] = developmentSettings;
		}

		//Preview mode
		// options["preview"] = true;

		//Specify a default language
		options["lang"] = "en";

		//Specify number of puzzles
		options["nPuzzles"] = 1;

		if((typeof window != "undefined")&&(window.console) && (window.console.log)){
			console.log("Scene Maker Configuration");
			console.log(options);
		}

	}

	return options;
};