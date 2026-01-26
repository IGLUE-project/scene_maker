SceneMaker.Editor.Text = (function(SM,$,undefined){
	var initialized = false;
	var _initializedCKEditorInstances = {};

	var init = function(){
		if(initialized) return;
		initialized = true;

		$(document).on('click','.textthumb', launchTextEditor);

		CKEDITOR.on( 'dialogDefinition', function(ev){
			// Take the dialog name and its definition from the event data.
			var dialogName = ev.data.name;
			var dialogDefinition = ev.data.definition;

			switch(dialogName){
				case 'link':
					//Customize Link window
					// Remove unused link type options
					// var linkType = dialogDefinition.getContents('info').get("linkType");
					// linkType.items.splice(2,1);
					// linkType.items.splice(1,1);

					//Remove LinkType
					dialogDefinition.getContents('info').remove("linkType");
					//Remove unuseful protocols
					var protocols = dialogDefinition.getContents('info').get("protocol").items;
					protocols.splice(3,1);
					protocols.splice(2,1);

					//Remove advanced options
					dialogDefinition.removeContents('advanced');

					//Customize target window
					var targetTab = dialogDefinition.getContents('target');
					var targetField = targetTab.get('linkTargetType');
					targetField['default'] ='_blank';
					targetField.items.splice(6,1);
					targetField.items.splice(4,1);
					targetField.items.splice(1,1);
					targetField.items.splice(0,1);
					// dialogDefinition.removeContents( 'target' ); //To remove targets

					break;
				case 'table':
					dialogDefinition.removeContents('advanced');
					var info = dialogDefinition.getContents('info');
					//Set center as default alignment
					var alignment = info.get("cmbAlign");
					alignment.items.splice(0,1);
					//Keep ["default"] to prevent Google closure compiler errors
					alignment["default"] = "center";
					//Remove self-headers
					info.remove("selHeaders");

					break;
				case 'image':
					//Remove advanced options
					dialogDefinition.removeContents('advanced');

					//Customize target window
					var linkTab = dialogDefinition.getContents('Link');
					var targetField = linkTab.get("cmbTarget");
					targetField['default'] ='_blank';
					targetField.items.splice(4,1);
					targetField.items.splice(2,1);
					targetField.items.splice(0,1);

					break;
				case 'MediaEmbedDialog':
					break;
			}
		});
	}

	/**
	* Function called when user clicks on the text thumb
	* Allows users to include text content in the slide using a WYSIWYG editor
	*/
	var launchTextEditor = function(event, area, initial_text, options){
		init();

		var current_area;
		if(area){
			current_area = area;
		} else {
			current_area = $(this).parents(".selectable");
		}
		current_area.attr('type','text');
		
		var screen = $("article").has(current_area);
		var view = $("article > article").has(current_area);

		if(typeof $(current_area).attr("id") == "undefined"){
			//We need an ID to call addTempShown properly
			$(current_area).attr("id",SM.Utils.getId("TmpShownId")); 
		}

		var disableTmpShown = (options)&&(options.disableTmpShown);

		if(!disableTmpShown){
			SM.Utils.addTempShown(current_area);
		}
		var currentAreaHeight = $(current_area).height();
		var currentAreaWidth = $(current_area).width();
		if(!disableTmpShown){
			SM.Utils.removeTempShown(current_area);
		}

		//Create the wysiwyg container and add to the area
		var wysiwygContainerId = SM.Utils.getId();
		var wysiwygContainer = $("<div id='"+wysiwygContainerId+"' class='wysiwygTextArea'></div>")
		$(wysiwygContainer).attr('style','width: 100%; height: 100%');
		$(current_area).append(wysiwygContainer);

		//Specified CKEditor configuration
		var config = {};

		//Select the features of the toolbar
		config.toolbar = 'Full';
		config.toolbar_Full =
		[
			{ name: 'first', items : ['Bold','Italic','Underline','-','Subscript','Superscript','Font','FontSize','TextColor','BGColor'] },
			'/',
			{ name: 'lists', items : ['NumberedList','BulletedList','Table'] },
			{ name: 'alignment', items : ['JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'] },
			{ name: 'link', items : ['Link'] },
			{ name: 'Objects', items : ['Image','MediaEmbed'] },
			{ name: 'symbols', items : ['SpecialChar'] }
		];

		//Singleton toolbar
		config.sharedSpaces =
		{
			top : 'toolbar_text'
		};

		//Disable toolbar expansion
		config.toolbarCanCollapse = false;
		//Disable resizing
		config.resize_enabled = false;
		//Disable bottom tags
		config.removePlugins = 'elementspath';
		//Enable table resize and autogrow
		config.extraPlugins = 'tableresize,autogrow,specialchar,mediaembed';

		if((options)&&(options.autogrow)){
			config.autoGrow_minHeight = 34;
			config.autoGrow_maxHeight = 800;
		}

		//See http://www.htmlhelp.com/reference/html40/entities/symbols.html and/or http://htmlentities.net/html/entities for possible symbols
		config.specialChars = [];
		config.specialChars = config.specialChars.concat(
			[[ '&alpha;', 'Alpha' ]],
			[[ '&beta;', 'Beta' ]],
			[[ '&gamma;', 'Gamma' ]],
			[[ '&delta;', 'Delta' ]],
			[[ '&epsilon;', 'Epsilon']],
			[[ '&zeta;', 'Zeta' ]],
			[[ '&eta;', 'Eta' ]],
			[[ '&theta;', 'Theta' ]],
			[[ '&iota;', 'Iota' ]],
			[[ '&kappa;', 'Kappa' ]],
			[[ '&lambda;', 'Lambda' ]],
			[[ '&mu;', 'Mu' ]],
			[[ '&nu;', 'Nu' ]],
			[[ '&xi;', 'Xi' ]],
			[[ '&omicron;', 'Omicron' ]],
			[[ '&pi;', 'Pi' ]],
			[[ '&rho;', 'Rho' ]],
			[[ '&sigma;', 'Sigma' ]],
			[[ '&tau;', 'Tau' ]],
			[[ '&upsilon;', 'Upsilon' ]],
			[[ '&phi;', 'Phi' ]],
			[[ '&chi;', 'Chi' ]],
			[[ '&psi;', 'Psi' ]],
			[[ '&omega;', 'Omega' ]],

			//Math symbols
			[[ '&divide;', '' ]],
			[[ '&radic;', '' ]],
			[[ '&bull;', '' ]],
			[[ '&middot;', '' ]],
			[[ '&plusmn;', '' ]],
			[[ '&frac14;', '' ]],
			[[ '&frac12;', '' ]],
			[[ '&frac34;', '' ]],
			[[ '&permil;', '' ]],
			[[ '&weierp;', '' ]],
			[[ '&image;', '' ]],
			[[ '&real;', '' ]],
			[[ '&forall;', '' ]],
			[[ '&part;', '' ]],
			[[ '&exist;', '' ]],
			[[ '&empty;', '' ]],
			[[ '&nabla;', '' ]],
			[[ '&isin;', '' ]],
			[[ '&notin;', '' ]],
			[[ '&ni;', '' ]],
			[[ '&prod;', '' ]],
			[[ '&sum;', '' ]],
			[[ '&minus;', '' ]],
			[[ '&lowast;', '' ]],
			[[ '&prop;', '' ]],
			[[ '&infin;', '' ]],
			[[ '&ang;', '' ]],
			[[ '&and;', '' ]],
			[[ '&or;', '' ]],
			[[ '&cap;', '' ]],
			[[ '&cup;', '' ]],
			[[ '&int;', '' ]],
			[[ '&cong;', '' ]],
			[[ '&asymp;', '' ]],
			[[ '&ne;', '' ]],
			[[ '&equiv;', '' ]],
			[[ '&le;', '' ]],
			[[ '&ge;', '' ]],
			[[ '&sub;', '' ]],
			[[ '&sup;', '' ]],
			[[ '&nsub;', '' ]],
			[[ '&sube;', '' ]],
			[[ '&supe;', '' ]],
			[[ '&oplus;', '' ]],
			[[ '&otimes;', '' ]],
			[[ '&perp;', '' ]],
			[[ '&lang;', '' ]],
			[[ '&rang;', '' ]],
			[[ '&lceil;', '' ]],
			[[ '&rceil;', '' ]],
			[[ '&lfloor;', '' ]],
			[[ '&rfloor;', '' ]],
			[[ '&fnof;', '' ]],

			// '' and ""
			[[ '&lsquo;', '' ]],
			[[ '&rsquo;', '' ]],
			[[ '&ldquo;', '' ]],
			[[ '&rdquo;', '' ]],

			//Arrows
			[[ '&larr;', '' ]],
			[[ '&uarr;', '' ]],
			[[ '&darr;', '' ]],
			[[ '&rarr;', '' ]],
			[[ '&harr;', '' ]],
			[[ '&crarr;', '' ]],
			[[ '&lArr;', '' ]],
			[[ '&uArr;', '' ]],
			[[ '&dArr;', '' ]],
			[[ '&rArr;', '' ]],
			[[ '&hArr;', '' ]],

			//Currency
			[[ '&euro;', 'Euro' ]],
			[[ '&cent;', 'Cent' ]],
			[[ '&pound;', 'Pound' ]],
			[[ '&yen;', '' ]],
			[[ '&curren;', '' ]],

			// Other
			[[ '&brvbar;', '' ]],
			[[ '&sect;', '' ]],
			[[ '&copy;', '' ]],
			[[ '&reg;', '' ]],
			[[ '&ordf;', '' ]],
			[[ '&ordm;', '' ]],
			[[ '&deg;', '' ]],
			[[ '&laquo;', '' ]],
			[[ '&raquo;', '' ]],
			[[ '&not;', '' ]],
			[[ '&para;', '' ]],
			[[ '&loz;', '' ]],
			[[ '&spades;', '' ]],
			[[ '&clubs;', '' ]],
			[[ '&hearts;', '' ]],
			[[ '&diams;', '' ]],
			[[ '&dagger;', '' ]]
		);

		//Fit the current area
		config.width = '100%';
		//The height value defines the height of CKEditor editing area and can be given in pixels or em. Percent values are not supported. 
		//http://docs.cksource.com/CKEditor_3.x/Howto/Editor_Size_On_The_Fly
		config.height = currentAreaHeight;

		//Toolbar defaults
		config.fontSize_defaultLabel = '12';

		//Apply sceneMaker skin
		var ckeditorBasePath = CKEDITOR.basePath.substr(0, CKEDITOR.basePath.indexOf("editor/"));
		config.skin = 'sceneMaker,' + ckeditorBasePath + 'editor/skins/sceneMaker/';

		var newInstance = !(typeof initial_text === "string")||((options)&&(options.forceNew));
		if(newInstance){
			var defaultFontSize = 36;
			var defaultAlignment = "center";
			var initialTextColor = "color:#000";
			var blankTextColor = initialTextColor; //For placeholders

			//We can also specify initial_texts style in the options param
			//This options override defaults
			if(options){
				//Font size
				if(typeof options.fontSize == "number"){
					defaultFontSize = options.fontSize;
				}

				//Placeholder
				if(options.placeholder === true){
					initialTextColor = "color:#ccc";
				}
			}

			initial_text = "<p style='text-align:"+defaultAlignment+";'><span autoColor='true' style='"+initialTextColor+"'><span style='font-size:"+defaultFontSize+"px;'>"+"&shy"+"</span></span></p>";
			initial_text_blank = "<p style='text-align:"+defaultAlignment+";'><span autoColor='true' style='"+blankTextColor+"'><span style='font-size:"+defaultFontSize+"px;'>"+"&shy"+"</span></span></p>";
		}

		//Add ckeditor wysiwyg instance
		var ckeditor = CKEDITOR.appendTo(wysiwygContainerId,config);

		var myWidth = currentAreaWidth;
		var myHeight = currentAreaHeight;

		if(!newInstance){
			//Keep screen and view visible until the text has been drawed
			if(!disableTmpShown){
				SM.Utils.addTempShown([screen,view,current_area]);
			}
			setTimeout(function(){
				if(_initializedCKEditorInstances[ckeditor.name] !== true){
					_initializedCKEditorInstances[ckeditor.name] = false;
					if(!disableTmpShown){
						SM.Utils.removeTempShown([screen,view,current_area]);
					}
				} else {
					_initializedCKEditorInstances[ckeditor.name] = undefined;
				}
			},6000);
		}

		ckeditor.on("instanceReady", function(){
			if(initial_text){
				ckeditor.setData(initial_text, function(){
					//Apply fix for a official CKEditor bug
					_fixCKEDITORBug(ckeditor);

					if(newInstance){
						ckeditor.focus();
					}

					if((options)&&(typeof options.callback == "function")){
						options.callback();
					}
				});
			}

			if(!newInstance){
				if(typeof _initializedCKEditorInstances[ckeditor.name] == "undefined"){
					_initializedCKEditorInstances[ckeditor.name] = true;
					if(!disableTmpShown){
						SM.Utils.removeTempShown([screen,view,current_area]);
					}
				} else {
					_initializedCKEditorInstances[ckeditor.name] = undefined;
				}
			}

			if((options)&&(typeof options.onKeyup==="function")&&(options.placeholder!=true)){
				ckeditor.document.on('keyup', function(event){
					options.onKeyup(current_area,ckeditor,event);
				});
			}

			if((!initial_text)&&((options)&&(typeof options.callback == "function"))){
				options.callback();
			}

		});

		ckeditor.on("resize", function(event){
			//onResize
		});

		//Catch the focus event
		ckeditor.on('focus', function(event){
			if((options)&&(options.placeholder===true)){
				var a = $(initial_text).text().replace(/\s+/g,'');
				var b = $(event.editor.getData()).text().replace(/\s+/g,'');
				if(a==b){
					setTimeout(function(){
						event.editor.setData(initial_text_blank, function(){
							if((options)&&(typeof options.onKeyup==="function")){
								ckeditor.document.on('keyup', function(event){
									options.onKeyup(current_area,ckeditor,event);
								});
							}
						});
						event.editor.focus();
					},20);
				}
			}

			var area = getZoneForCKContainer(event.editor.container.$);
			SM.Editor.selectContentZone(area);
		});

		// ckeditor.on('blur', function(event){
		// });

		//Exnteds CKEditor functionality
		ckeditor.getPlainText = _getPlainText;

		//Add a button to delete the current text area
		SM.Editor.addDeleteButton(current_area);
	};
	

	var getCKEditorFromZone = function(zone){
		if((!zone)||(typeof CKEDITOR === 'undefined')||(typeof CKEDITOR.instances === 'undefined')){
			return null;
		}

		var CKEditorInstance = null;

		jQuery.each(CKEDITOR.instances, function(name, CKinstance){
			var CKzone = getZoneForCKContainer(CKinstance.container.$);

			if($(CKzone).attr("id")===$(zone).attr("id")){
				CKEditorInstance = CKinstance;
				return;
			}
		});
		return CKEditorInstance;
	};

	var getZoneForCKContainer = function(container){
		return $("div[type='text']").has(container);
	};

	var getCKEditorIframeContentFromZone = function(zone){
		var editor = getCKEditorFromZone(zone);
		if(!editor){
			return null;
		}
		return _getCKEditorIframeContentFromInstance(editor);
	};

	var _getCKEditorIframeContentFromInstance = function(editor){
		var iframe = $(document.getElementById('cke_contents_' + editor.name)).find("iframe")[0];
		return $(iframe).contents()[0];
	};


	var getCKEditorFromTextArea = function(textArea){
		if((!textArea)||(typeof CKEDITOR === 'undefined')||(typeof CKEDITOR.instances === 'undefined')){
			return null;
		}

		if(!$(textArea).hasClass(".cke_skin_sceneMaker")){
			textArea = $(textArea).find(".cke_skin_sceneMaker");
			if(textArea.length>0){
				textArea = textArea[0];
			}
		}
		
		var CKEditorInstance = null;
		jQuery.each(CKEDITOR.instances, function(name, CKinstance) {
			if(textArea===CKinstance.container.$){
				CKEditorInstance = CKinstance;
				return;
			}
		});
		return CKEditorInstance;
	};

	var _getPlainText = function(){
		var _plainText = "";
		var validIndex = 0;

		$(this.getSnapshot()).each(function(index,p){
			if(p.tagName=="SCRIPT"){
				return;
			}
			if(validIndex!=0){
				_plainText = _plainText + "\n";
			}
			_plainText = _plainText + $(p).text();
			validIndex += 1;
		});

		// return $(this.getSnapshot()).text();
		return _plainText;
	};

	/*
	 * Fix oficial WebKit bug: http://ckeditor.com/forums/CKEditor-3.x/Minimum-Editor-Width-Safari#comment-48574
	 */
	var _fixCKEDITORBug = function(editor){
	    //webkit not redraw iframe correctly when editor's width is < 310px (300px iframe + 10px paddings)
	    if (CKEDITOR.env.webkit) {
	        var iframe = $(document.getElementById('cke_contents_' + editor.name)).find("iframe")[0];
	        iframe.style.display = 'none';
	        iframe.style.display = 'block';
	    }
	};

	return {
		init								: init,
		launchTextEditor					: launchTextEditor,
		getCKEditorFromZone					: getCKEditorFromZone,
		getCKEditorIframeContentFromZone	: getCKEditorIframeContentFromZone,
		getCKEditorFromTextArea				: getCKEditorFromTextArea
	};

}) (SceneMaker, jQuery);
