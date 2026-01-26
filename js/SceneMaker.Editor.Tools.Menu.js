SceneMaker.Editor.Tools.Menu = (function(SM,$,undefined){
	var _initialized = false;
	
	var init = function(){
		if(_initialized) return;
		_initialized = true;

		//Add listeners to menu buttons
		$.each($("#menu a.menu_action"), function(index, menuButton) {
			$(menuButton).on("click", function(event){
				event.preventDefault();
				if($(menuButton).parent().hasClass("menu_item_disabled")){
					//Disabled button
					return false;
				}
				if(typeof SM.Editor.Tools.Menu[$(menuButton).attr("action")] == "function"){
					SM.Editor.Tools.Menu[$(menuButton).attr("action")](this);
					_hideMenuAfterAction();
				}
				return false;
			});
		});

		//Prevent iframe to move
		$("a.menu_option_main, a.menu_option:not('.menu_action')").on("click", function(event){
			event.preventDefault();
			return false;
		});
		
		//Exit button
		var options = SM.Utils.getOptions();
		if(typeof options.exitURL !== "string"){
			$(".menu_option.menu_action[action='exit']").parent().hide();
			$("#toolbar_exit_btn").hide();
		} else {
			SM.exitPath = options.exitURL;
		}
			
		$("#menu").show();

		//menu click show withouth css instead of hover
		var _submenu = false;
	
		$("a:.menu_option_main").on('click',function(){
			if($("#menu li > ul.menu_option_main").css('display') === 'none' ){
				$("#menu li > ul.menu_option_main").css('display','block');
				$("ul:.menu_option_main li").hover(function(e){
					$(this).children('ul').css('display','block').on('mouseenter',function(){
						_submenu = true;
						$(this).mouseleave(function(e){
							_submenu= false;
						})
					});
				}, function(){
					if (!_submenu){
						$("ul:.menu_option_main li > ul").css('display','none');
					}
				});
			} else {
				$("#menu li > ul.menu_option_main").css('display','none');
			}
		});
		$(document).click( function(){
			$("#menu li > ul.menu_option_main").hide();
		});
	};

	var _hideMenuAfterAction = function(){
		$("#menu li > ul.menu_option_main").hide();
	};


	//////////////////
	/// Actions
	/////////////////

	var displaySettings = function(){
		SM.Editor.Settings.displaySettings();
	};

	var saveScene = function(){
		if(SM.Screen.getScreens().length === 0){
			var options = {};
			options.width = 600;
			options.height = 150;
			options.text = SM.I18n.getTrans("i.NoSlidesOnSaveNotification");
			var button1 = {};
			button1.text = SM.I18n.getTrans("i.Ok");
			button1.callback = function(){
				$.fancybox.close();
			}
			options.buttons = [button1];
			SM.Utils.showDialog(options);
			return;
		}

		SM.Editor.Tools.changeSaveButtonStatus("loading");
		var scene = SM.Editor.saveScene();
		SM.Editor.sendScene(scene,function(){
			//onSave succesfully
			// SM.Debugging.log("onSave succesfully");
			// SM.Debugging.log(scene);
			SM.Editor.Tools.changeSaveButtonStatus("disabled");
		}, function(){
			//error onSave
			// SM.Debugging.log("onSave failure");
			SM.Editor.Tools.changeSaveButtonStatus("enabled");
		});
	};

	var preview = function(){
		SM.Editor.Preview.preview();
	};

	var exit = function(){
		if(SM.Editor.hasSceneChanged()){
			var options = {};
			options.width = 600;
			options.height = 200;
			options.notificationIconSrc = SM.ImagesPath + "icons/save_document.png";
			options.text = SM.I18n.getTrans("i.ExitConfirmationMenu");
			options.buttons = [];

			var button1 = {};
			button1.text = SM.I18n.getTrans("i.cancel");
			button1.callback = function(){
				$.fancybox.close();
			}
			options.buttons.push(button1);

			var button2 = {};
			button2.text = SM.I18n.getTrans("i.exitWSaving");
			button2.callback = function(){
				_exitFromSM();
				$.fancybox.close();
			}
			options.buttons.push(button2);

			var button3 = {};
			button3.text = SM.I18n.getTrans("i.saveAndExit");
			button3.callback = function(){
				$("#waiting_overlay").show();
				SM.Editor.Tools.changeSaveButtonStatus("loading");
				var scene = SM.Editor.saveScene();
				SM.Editor.sendScene(scene,function(){
					//onSave succesfully
					SM.Editor.Tools.changeSaveButtonStatus("disabled");
					_exitFromSM();
				}, function(){
					//error onSave
					SM.Editor.Tools.changeSaveButtonStatus("enabled");
					$("#waiting_overlay").hide();
				});
				$.fancybox.close();
			}
			options.buttons.push(button3);

			SM.Utils.showDialog(options);

		} else {
			_exitFromSM();
		}
	};

	var _exitFromSM = function(){
		SM.Editor.Events.allowExitWithoutConfirmation();
		window.top.location.href = SM.exitPath;
	};

	var addScreen = function(){
		$("#addScreenButton").trigger('click');
		return false; //Prevent iframe to move
	};

	var addView = function(){
		$("#addViewButton").trigger('click');
		return false; //Prevent iframe to move
	};

	var exportToJSON = function(){
		SM.Editor.exportSceneToJSON();
		return false; //Prevent iframe to move
	};

	var importFromJSON = function(){
		SM.Editor.importSceneFromJSONFancybox();
		return false; //Prevent iframe to move
	};

	return {
		init							: init,
		displaySettings					: displaySettings, 
		saveScene 						: saveScene,
		preview 						: preview,
		addScreen						: addScreen,
		addView							: addView,
		exportToJSON					: exportToJSON,
		importFromJSON					: importFromJSON,
		exit							: exit
	};

}) (SceneMaker, jQuery);