SceneMaker.Text = (function(SM,$,undefined){
	var fontSizeReference = 12;

	/*
	 * Translate font-size params of HTML tags (<p>,<span>,...) from px to rems (http://caniuse.com/rem)
	 * Also convert <font> tags into <span> tags with the font-size param specified in rems
	 */
	var init = function(){
		//Adapt area text fields
		_makeTextResponsive($("article > div.textArea"));

		//Make Tables responsive
		$("article > div.textArea > table").each(function(index,table){
			//Table text
			_makeTextResponsive($(table).find("caption"));

			$(table).find("td").each(function(index,td){
				_makeTextResponsive(td);
			});

			//Table dimensions
			var tableOrgStyle = $(table).attr("style");
			if(tableOrgStyle){
				var tableStyle = "";

				//Original Height: 600, Original width: 800
				//Make table width and height relative (%)
				var tableWidth = SM.Utils.getWidthFromStyle(tableOrgStyle);
				if(tableWidth){
					var percentWidth = (tableWidth*100)/800;
					tableStyle += "width:"+percentWidth+"%;";
				}
				var tableHeight = SM.Utils.getHeightFromStyle(tableOrgStyle);
				if(tableHeight){
					var percentHeight = (tableHeight*100)/600;
					tableStyle += "height:"+percentHeight+"%;";
				}
				if(tableStyle!==""){
					$(table).attr("style",tableStyle);
				}
			}
		});
	};

	var _makeTextResponsive = function(container){
		_adaptFonts($(container).find("font"));
		_setStyleInRem($(container).find("[style]"));
	};

	var _setStyleInRem = function(els){
		$(els).each(function(index,el){

			var oldStyle = $(el).attr("style");
			if(typeof oldStyle !== "string"){
				return;
			}

			var fontSize = SM.Utils.getFontSizeFromStyle(oldStyle);
			if((typeof fontSize != "number")||(isNaN(fontSize))){
				return;
			}

			//Convert to rem (http://pxtoem.com/)
			var rem = (fontSize/fontSizeReference) + "rem";
			var newStyle = SM.Utils.addFontSizeToStyle(oldStyle,rem);
			$(el).attr("style",newStyle);
		});
	};

	var _adaptFonts = function(fonts){
		$(fonts).each(function(index,font){
			//Get font size in px
			var fSize = $(font).attr("size");
			if(!fSize){
				return;
			}
			var fontSize = parseInt(fSize);
			if (isNaN(fontSize)){
				return;
			}
			$(font).hide();

			//Convert to rem
			var pxfontSize = _font_to_px(fontSize);
			var rem = (pxfontSize/fontSizeReference) + "rem";
			var span = $("<span style='font-size:"+rem+"'></span>");
			$(span).html($(font).html());
			$(font).before(span);
			$(font).remove();
		});
	};

    /*
     * Update Text-base size
     */
	var aftersetupSize = function(increase){
		increase = increase*_correctionFactor(increase);
		var reference_font_size = fontSizeReference;
		var texts = $("html");
		$(texts).css("font-size", reference_font_size*increase + "px");
	};

	/*
	 * A correction factor to better adapt text to screens size.
	 * Increase factor is not accuracy enough, specially for small screens.
	 * For increaseFactor=1 and around, the correction factor is 0.
	 * Correction factor is calculated empirically.
	 * @param {number} factor Increase factor.
	 * @return {number} correctionFactor Correction factor to fix increase factor.
	 */
	var _correctionFactor = function(factor){
		if(factor < 0.25) {
			return 0.5;
		} else if(_isInRange(factor,0.25,0.3)){
			return 0.55;
		} else if(_isInRange(factor,0.3,0.35)){
			return 0.65;
		} else if(_isInRange(factor,0.35,0.4)){
			return 0.7;
		} else if(_isInRange(factor,0.4,0.5)){
			return 0.8;
		} else if(_isInRange(factor,0.5,0.6)){
			return 0.85;
		} else if(_isInRange(factor,0.6,0.75)){
			return 0.9;
		} else if(_isInRange(factor,0.75,0.95)){
			return 0.95;
		} else if(_isInRange(factor,0.95,1.5)){
			return 1;
		} else if (factor > 1.5){
			return 1;
		}
		return 1;
	};

	var _isInRange = function(number, min, max){
		return number > min && number <= max;
	};

	/* Convert <font size="x"> tags to <span style="font-size:y px"> tags
	 * Where 'x' is fz and 'y' is px.
	 * Is not exactly, because this conversion depends of the browser.
	 * Anyway, is a good aproximation.
	 * Ideally, Wysiwyg should not generate <font> tags since they are deprecated in HTMl5.
	 * Neverthless, sometimes, it does.
	 */
	var _font_to_px = function(fz){
		switch(fz){
			case 7:
				return 48;
				break;
			case 6:
				return 32;
				break;
			case 5:
				return 24;
				break;
			case 4:
				return 18;
				break;
			case 3:
				return 16;
				break;
			case 2:
				return 14;
				break;
			case 1:
				return 12;
				break;
			default:
				break;
		}
	};

    return {
        init			: init,
		aftersetupSize 	: aftersetupSize
    };
    
})(SceneMaker, jQuery);