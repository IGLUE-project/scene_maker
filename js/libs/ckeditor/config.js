CKEDITOR.editorConfig = function( config )
{
	// Define changes to default configuration here. For example:
	// config.uiColor = '#AADC6E';
	if((VISH)&&(VISH.I18n)&&(typeof VISH.I18n.getLanguage == "function")){
		config.language = VISH.I18n.getLanguage();
	}
};