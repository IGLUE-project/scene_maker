VISH.Editor.Settings = (function(V,$,undefined){

	var init = function(){
	};

	var displaySettings = function(){
		// fancybox to edit presentation settings
		$("a#edit_presentation_details").fancybox({
			'autoDimensions' : false,
			'autoScale' : true,
			'scrolling': 'no',
			'width': 1000,
			'height': 700,
			'padding': 0,
			'hideOnOverlayClick': false,
			'hideOnContentClick': false,
			'showCloseButton': true,
			"onComplete"  : function(data){
				$("#fancybox-wrap").css("margin-top", "20px");
				_onDisplaySettings();
			}
		});

		$("a#edit_presentation_details").trigger('click');
	};

	var _onDisplaySettings = function(){
		_checkIfEnableContinueButton();
	};

	var loadPresentationSettings = function(presentation){
		//Prevent to check presentation var in all cases
		if(!presentation){
			presentation = {};
		}

		//Title
		if(presentation.title){
			$("#presentation_details_preview_addtitle_textarea").val(presentation.title); //preview title textarea
			$("#presentation_details_input_title").val(presentation.title); //data input
		}
	};
	
	var _checkIfEnableContinueButton = function(){
		var enable = checkMandatoryFields();
		if(enable){
			$("#save_presentation_details").removeClass("buttonDisabledOnSettings");
			$("#save_presentation_details").removeAttr("disabled");
			$("#save_presentation_details").removeAttr("title");
		} else {
			$("#save_presentation_details").addClass("buttonDisabledOnSettings");
			$("#save_presentation_details").attr("disabled","true");
		}
	};

	var checkMandatoryFields = function(){
		//Check that mandatory params are filled appropiately.
		// var title = $('#presentation_details_input_title').val();
		// if((typeof title != "string")||(title.trim()=="")){
		// 	return false;
		// }
		return true;
	};

	/**
	 * function called when the user clicks on the save button in the initial details fancybox   
	 */
	var onSavePresentationDetailsButtonClicked = function(event){
		event.preventDefault();

		//Check if is disabled
		if($(event.target).hasClass("buttonDisabledOnSettings")){
			return;
		}

		$.fancybox.close();
	};

	var saveSettings = function(){
		var settings = {};

		settings.VEVersion = V.VERSION;
		settings.type = V.Constant.PRESENTATION;

		var draftPresentation = V.Editor.getDraftPresentation();

		var title = $('#presentation_details_input_title').val();
		if((typeof title == "string")&&(title.trim()!="")){
			settings.title = title;
		}

		return settings;
	};

	return {
		init									: init,
		displaySettings							: displaySettings,
		loadPresentationSettings				: loadPresentationSettings,
		onSavePresentationDetailsButtonClicked	: onSavePresentationDetailsButtonClicked,
		saveSettings							: saveSettings
	};

}) (VISH, jQuery);