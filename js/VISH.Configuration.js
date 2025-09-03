VISH.Configuration = (function(V,$,undefined){
  
  var configuration;
  
  var init = function(VEconfiguration){ 
    configuration = VEconfiguration;
    _applyConfiguration();
  };

  var _applyConfiguration = function(){
    V.ImagesPath = configuration["ImagesPath"];
    V.StylesheetsPath = configuration["StylesheetsPath"];
    V.PreviewPath = configuration["PreviewPath"];
  };
  
  var getConfiguration = function(){
    return configuration;
  };
  
  return {
      init                : init,
      getConfiguration    : getConfiguration
    };
  
}) (VISH, jQuery);