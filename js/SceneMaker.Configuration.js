SceneMaker.Configuration = (function(SM,$,undefined){
  
  var configuration;
  
  var init = function(_configuration){
    if(typeof _configuration === "undefined"){
      _configuration = {};
    }
    configuration = _configuration;

    SM.ImagesPath = configuration["ImagesPath"];
    SM.StylesheetsPath = configuration["StylesheetsPath"];
    SM.PreviewPath = configuration["PreviewPath"];
    SM.UploadScenePath = configuration["UploadScenePath"];
  };
  
  var getConfiguration = function(){
    if(typeof configuration === "undefined"){
      return {};
    }
    return configuration;
  };
  
  return {
      init                : init,
      getConfiguration    : getConfiguration
    };
  
}) (SceneMaker, jQuery);