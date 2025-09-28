SceneMaker.Editor.Carousel = (function(SM,$,undefined){
	
	//Available Options: rows,callback,rowItems,scrollItems,styleClass
	
	var createCarousel = function(containerId,options){
		//Necessary params
		if(!containerId){
			return;
		}
		
		//Default values
		var rows = 1;
		var rowItems = 5;
		var scrollItems = null;
		var styleClass = "";
		var titleClass = "";
		var callback = null;
		var width = 790;
		var startAtLastElement = false;
		var pagination = true;
		var sortable = false;
		var afterCreateCarruselFunction = null;
		
		//Read options
		if(options){
			if(options['rows']){
				rows = options['rows'];
			}
			if(options['rowItems']){
				rowItems = options['rowItems']
			}
			if(options['scrollItems']){
				scrollItems = options['scrollItems']
			}
			if(options['styleClass']){
				styleClass = options['styleClass']
			}
			if(options['titleClass']){
				titleClass = options['titleClass']
			}
			if(options['callback']){
				callback = options['callback'];
			}
			if(options['width']){
				width = options['width'];
			}
			if(options['startAtLastElement']){
				startAtLastElement = options['startAtLastElement'];
			}
			if(typeof options['pagination'] == 'boolean'){
				pagination = options['pagination'];
			}
			if(typeof options['sortable'] == 'boolean'){
				sortable = options['sortable'];
			}
			if(options['afterCreateCarruselFunction']){
				afterCreateCarruselFunction = options['afterCreateCarruselFunction'];
			}
		}


		//Define intern variables
		var multipleRow = (rows>1);
		
		var carouselClass = "";
		if(styleClass){
			carouselClass = "_" + styleClass;
		}
		
		if(!scrollItems){
			scrollItems = rowItems;
		}
			
		if(multipleRow){
			var rowClass = "multiple_row" + carouselClass;
		} else {
			var rowClass = "single_row" + carouselClass;
		}		
			
		//Wrapper main div with a image carousel class container.
		var wrapperDiv = $("#" + containerId);
		wrapperDiv.attr("class","image_carousel image_carousel_"+rowClass);
		wrapperDiv.removeAttr("id");
		
		var mainDiv = document.createElement('div');
		$(mainDiv).html($(wrapperDiv).html());
		$(wrapperDiv).html("");
		mainDiv.setAttribute('id', containerId);
			
		//Creating elements
		var clearFix = document.createElement('div');
		clearFix.setAttribute('class', "clearfix");
		
		var button_prev = document.createElement('a');
		var button_next = document.createElement('a');
		
		button_prev.setAttribute('class', "prev");
		button_next.setAttribute('class', "next");
		$(button_prev).addClass("prev_" + rowClass);
		$(button_next).addClass("next_" + rowClass);
		button_prev.setAttribute('href', "#");
		button_next.setAttribute('href', "#");
		button_prev.setAttribute('id', "carousel_prev" + containerId);
		button_next.setAttribute('id', "carousel_next" + containerId);
		$(button_prev).html("<span>prev</span>");
		$(button_next).html("<span>next</span>");
		 
		$(wrapperDiv).append(clearFix);
		$(wrapperDiv).append(button_prev);
		$(wrapperDiv).append(button_next);

		if(pagination){
			var paginationDiv = document.createElement('div');
			paginationDiv.setAttribute('class','pagination pagination_' + rowClass);
			paginationDiv.setAttribute('id','carousel_pag' + containerId);
			$(wrapperDiv).append(paginationDiv);
		}
		 
		//Element stylesheet
		$(mainDiv).children().addClass("carousel_element_" + rowClass);
		
		$(mainDiv).children().each(function(index,value){
			$(value).children().addClass("carousel_element_" + rowClass);
		});
		
		//Callbacks events
		if ((callback)&&(typeof callback == "function")) {
			$(mainDiv).children().click(function(event){
				callback(event);
			});
		}

		if (multipleRow) {
			_applyMultipleRows(containerId, wrapperDiv, mainDiv, rows, rowItems, scrollItems, rowClass, width, afterCreateCarruselFunction);
		} else {
			$(wrapperDiv).prepend(mainDiv);

			//Get start index
			if(startAtLastElement){
				var start = ($(mainDiv).children().length-rowItems+1);
			} else {
				var start = 0;
			}
			
			_setMainCarousel(containerId,containerId, rows,[],rowItems,scrollItems,width,start, function(){
				if(pagination){
					_forceShowPagination(containerId);
				}
		
				if(sortable){
					$("#" + containerId).sortable();
				}

				//Callback
				if(typeof afterCreateCarruselFunction === "function"){
					afterCreateCarruselFunction();
				}
			});
		}
			
		return;
	};

	var _applyMultipleRows = function(containerId,wrapperDiv,mainDiv,rows,rowItems,scrollItems,rowClass,width,afterCreateCarruselFunction){
		var synchronizeIds = [];
		var createdRows = 0;

		//Create one div for each row.
		var i;
		for (i=0;i<rows;i++) {
			window[mainDiv.id + "_row" + i ] = document.createElement('div');
			window[mainDiv.id + "_row" + i ].setAttribute('id',mainDiv.id + "_row" + i);
			window[mainDiv.id + "_row" + i ].setAttribute('class',"carousel_wrapper_" + rowClass);
			if(i!=0){
				synchronizeIds.push(mainDiv.id + "_row" + i);
			}
		}
			
		//Divide children into the different divs.
		$(mainDiv).children().each(function(index,value){
			$(window[mainDiv.id + "_row" + index%rows  ]).append(value);
		});
			
		//Add divs to the wrapper and invoke carousel Plugin
		for (i=rows-1;i>=0;i--) {
			$(wrapperDiv).prepend(window[mainDiv.id + "_row" + i ]);
			if(i==0){
				var newContainerId = mainDiv.id + "_row" + i;
				_setMainCarousel(newContainerId,containerId,rows,synchronizeIds,rowItems,scrollItems,width, null, function(){
					createdRows++;
					_afterCreateRow(createdRows,rows,afterCreateCarruselFunction);
				});
			} else {
				_setRowCarousel(mainDiv.id + "_row" + i,rowItems,scrollItems,width, function(){
					createdRows++;
					_afterCreateRow(createdRows,rows,afterCreateCarruselFunction);
				});
			}
		}
	};

	var _afterCreateRow = function(createdRows,rows,afterCreateCarruselFunction){
		if((createdRows===rows)&&(typeof afterCreateCarruselFunction == "function")){
			afterCreateCarruselFunction();
		}
	};

	var _setRowCarousel = function (id,rowItems,scrollItems,width,afterCreateCarruselFunction){
		$("#" + id).carouFredSel({
			auto    : false,
			circular: false,
			infinite: false,
			width   : width,
			scroll : {
				//items         : "page",
				items           : scrollItems,
				fx              : "scroll",
				duration        : 1000,
				timeoutDuration : 2000                
			},
			items : {
			  visible    : {
			      min : rowItems,
			      max : rowItems
			    }
			},
			onCreate    		: afterCreateCarruselFunction
		}); 
	};

	var _setMainCarousel = function (id,widgetsId,rows,synchronizeIds,rowItems,scrollItems,width,start,afterCreateCarruselFunction){
		if(!start){
			start = 0;
		}

		$("#" + id).carouFredSel({
			circular: false,
			infinite: false,
			auto    : false,
			width   : width,
			scroll : {
				//items         : "page",
				items           : scrollItems,
				//fx              : "scroll",
				duration        : 1000,
				timeoutDuration : 2000                
			},
			items       : {
				visible   : {
					min : rowItems,
					max : rowItems
				},
				start   : start
			},
			prev    : {
				button  : "#carousel_prev" + widgetsId
				// key     : "left"
			},
			next    : {
				button  : "#carousel_next" + widgetsId
				// key     : "right"
			},
			pagination  : "#carousel_pag"  + widgetsId,
			onCreate    : afterCreateCarruselFunction
		});  
			
		if(synchronizeIds){
			var syncString = "";
			$(synchronizeIds).each(function(index,value){
				if(index !=0){
					syncString = syncString + ", ";
				}
				syncString = syncString + "#" + value;
			});
			$("#" + id).trigger("configuration", ["synchronise", syncString]);
		}

		$("#" + id).attr("rows",rows);
	};
	
	
	var cleanCarousel = function(containerId){
		//Remove content
		$("#" + containerId).html("");

		//Check if is a multirow carousel
		var containderIdForMultiRow = containerId + "_row0";
		if($("#" + containderIdForMultiRow).attr("rows")){
			var rows = $("#" + containderIdForMultiRow).attr("rows");
			var i;
			for(i=0; i<rows;i++){
				_cleanOneRowCarousel(containerId + "_row" + i);
			}
			$("#" + containderIdForMultiRow).attr("id",containerId);
		} else {
			_cleanOneRowCarousel(containerId);
		}
	};
  
	var _cleanOneRowCarousel = function(containerId){
		var carouselWrapper = $("#" + containerId).parent().parent();
		if($(carouselWrapper).hasClass('image_carousel')){
			$(carouselWrapper).removeClass();
			$(carouselWrapper).html("");
			$(carouselWrapper).attr("id",containerId);
		}
	};
	
	var _forceShowPagination = function(containerId){
		var parent = $("#" + containerId).parent().parent();
		if ($(parent).hasClass("image_carousel")){
			$(parent).find(".pagination").attr("style","");
		}
	};

	var goToElement = function(carouselDivId,element){
		if($(element).is("IMG")){
			element = $(element).parent();
		}
		$("#" + carouselDivId).trigger("slideTo", element);
	};
  
	var advanceCarousel = function(carouselDivId,no){
		$("#" + carouselDivId).trigger("next", no);
	};

	var backCarousel = function(carouselDivId,no){
		$("#" + carouselDivId).trigger("prev", no);
	};

	var insertElement = function(carouselDivId,element,posc){
		$("#" + carouselDivId).trigger("insertItem", [element, posc]);
	};

	return {
		createCarousel	  	: createCarousel,
		cleanCarousel    	: cleanCarousel,
		goToElement       	: goToElement,
		advanceCarousel  	: advanceCarousel,
		backCarousel     	: backCarousel,
		insertElement	  	: insertElement
	};

}) (SceneMaker, jQuery);
