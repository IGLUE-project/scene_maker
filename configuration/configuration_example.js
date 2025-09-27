/*
 * Scene Maker initialization options
 */

window.SCENE_MAKER_OPTIONS = (function(){
	var options = {};

	var configuration = {};
	//Paths
	configuration["ImagesPath"] = "/images/";
	configuration["StylesheetsPath"] = "/stylesheets/";
	configuration["PreviewPath"] = "/viewer.html";
	configuration["UploadScenePath"] = "/scene";
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

	var scene = {"SMVersion":"0.0.1","aspectRatio":"4:3","screens":[{"id":"article1","type":"screen","background":"url(\"https://vishub.org/pictures/27471.png\")","hotspots":[{"id":"hotspot-1","x":"28.4303","y":"53.2820","image":"/images/hotspotgallery/arrow.png","width":"5.2500","height":"7.0000","lockAspectRatio":true,"rotationAngle":"315","actions":[{"actionType":"goToScreen","actionParams":{"screen":"article2"}}]},{"id":"hotspot-2","x":"54.2500","y":"32.3750","image":"/images/hotspotgallery/eye.png","width":"5.2500","height":"7.0000","lockAspectRatio":true,"rotationAngle":"0","actions":[{"actionType":"openView","actionParams":{"view":"article1_article1"}}]}],"views":[{"id":"article1_article1","type":"view_content","elements":[{"id":"article1_article1_zone1","type":"text","body":"<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t<span autocolor=\"true\" style=\"color:#000\"><span style=\"font-size:36px;\">Red planet</span></span></p>\n"}]}]},{"id":"article2","type":"screen","background":"url(\"https://vishub.org/pictures/27470.png\")","hotspots":[{"id":"hotspot-3","x":"46.2500","y":"90.7083","image":"/images/hotspotgallery/arrow.png","width":"5.2500","height":"7.0000","lockAspectRatio":true,"rotationAngle":"90","actions":[{"actionType":"goToScreen","actionParams":{"screen":"article1"}}]}],"views":[]}]};
	//scene = undefined;
	options.scene = scene;

	//Exit URL
	options.exitURL = "https://escapp.es";

	//Specify a default language
	options["lang"] = "en";

	//Specify number of puzzles
	options["nPuzzles"] = 5;

	if((typeof window !== "undefined")&&(window.console) && (window.console.log)){
		console.log("Scene Maker options", options);
	}
	
	return options;
})();