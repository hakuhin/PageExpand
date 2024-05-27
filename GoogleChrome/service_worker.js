importScripts("./PageExpand.js");

PageExpand((function(){
	var w = {
		document:{},
		navigator:self.navigator
	};
	return {execute_type:"ChromeExtensionBackGround",admin:self,window:w};
})());