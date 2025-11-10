/*
 * Scene Maker initialization options
 * Copy this file to configuration/configuration.js
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

	var scene = {"SMVersion":"0.0.1","title":"Planet B","aspectRatio":"4:3","screens":[{"id":"article1","type":"screen","background":"https://vishub.org/pictures/27471.png","hotspots":[{"id":"hotspot-1","x":"55.0000","y":"31.7083","image":"/images/hotspotgallery/eye.png","width":"5.2500","height":"7.0000","lockAspectRatio":true,"rotationAngle":"0","visibility":"visible","cursorVisibility":"pointer","actions":[{"actionType":"showText","actionParams":{"text":"Planet B"}}]}],"hotzones":[{"id":"9ac069de-017b-41bc-8978-5ed34090dd0d","idAlias":"zone-1","points":[[366.7368469238281,547.122802734375],[401.403564453125,579.9649047851562],[425.1228332519531,572.6666870117188],[406.877197265625,620.1052856445312],[432.42108154296875,600.0350952148438],[456.1403503417969,548.9473876953125],[512.7017822265625,485.08770751953125],[527.2982330322266,444.94737243652344],[527.2982482910156,408.4561462402344],[468.91229248046875,415.75439453125],[412.35089111328125,448.59649658203125],[383.15789794921875,481.4385986328125],[363.0877380371094,485.08770751953125],[330.2456359863281,512.4561157226562],[322.9473876953125,536.1754150390625],[330.2456359863281,538],[366.7368469238281,510.631591796875],[379.5087890625,510.631591796875]],"cursorVisibility":"default","enabled":true,"actions":[{"actionType":"goToScreen","actionParams":{"screen":"article2"}}]}],"views":[]},{"id":"article2","type":"screen","background":"https://vishub.org/pictures/27470.png","hotspots":[{"id":"hotspot-2","x":"45.6250","y":"89.3412","image":"/images/hotspotgallery/arrow.png","width":"6.2500","height":"8.3333","lockAspectRatio":true,"rotationAngle":"90","visibility":"visible","cursorVisibility":"pointer","actions":[{"actionType":"goToScreen","actionParams":{"screen":"article1"}}]}],"hotzones":[{"id":"bc94d94d-596e-4100-b061-c6a69789367b","idAlias":"zone-2","points":[[518.234130859375,644.4013671875],[682.7291259765625,647.5050048828125],[667.210693359375,757.6856079101562],[524.4414672851562,751.478271484375]],"cursorVisibility":"pointer","enabled":true,"actions":[{"actionType":"openView","actionParams":{"view":"article2_article1"}}]}],"views":[{"id":"article2_article1","type":"view_content","elements":[{"id":"article2_article1_zone1","type":"text","body":"<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t&nbsp;</p>\n<p style=\"text-align:center;\">\n\t<span style=\"font-size:72px;\"><span autocolor=\"true\" style=\"color:#000\">Welcome to<br />\n\tPlanet B!</span></span></p>\n"}]}]}]};
	//scene = undefined;
	options.scene = scene;

	//Exit URL
	//options.exitURL = "https://escapp.es";

	//Default language
	options["lang"] = "en";

	//Escape room data
	//Escape room ID
	options["erId"] = 1;
	//Number of puzzles
	options["nPuzzles"] = 5;

	//Escapp client settings
	options["escapp"] = {
		endpoint:"https://escapp.es/api/escapeRooms/id",
	};

	//User credentials
	// options["user"] = {
	// 	email: "user@domain.com", 
	// 	token: "userToken",
	// }

	if((typeof window !== "undefined")&&(window.console) && (window.console.log)){
		console.log("Scene Maker options", options);
	}
	
	return options;
})();