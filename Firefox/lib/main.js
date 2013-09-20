
// --------------------------------------------------------------------------------
// nsIXMLHttpRequest 作成
// --------------------------------------------------------------------------------
function XPCOM_Create_nsIXMLHttpRequest(){
	var {Cc,Ci} = require("chrome");
	return Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
}

// --------------------------------------------------------------------------------
// mozIJSSubScriptLoader 取得
// --------------------------------------------------------------------------------
function XPCOM_Get_mozIJSSubScriptLoader(){
	var {Cc,Ci} = require("chrome");
	return Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader);
}

// --------------------------------------------------------------------------------
// nsIObserverService 取得
// --------------------------------------------------------------------------------
function XPCOM_Get_nsIObserverService(){
	var {Cc,Ci} = require("chrome");
	return Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
}

// --------------------------------------------------------------------------------
// nsIsupports から nsIHttpChannel 取得
// --------------------------------------------------------------------------------
function XPCOM_nsIsupports_Get_nsIHttpChannel(nsi_supports){
	try{
		var {Ci} = require("chrome");
		return nsi_supports.QueryInterface(Ci.nsIHttpChannel);
	}catch(e){}
	
	return null;
}

// --------------------------------------------------------------------------------
// nsIsupports から nsIChannel 取得
// --------------------------------------------------------------------------------
function XPCOM_nsIsupports_Get_nsIChannel(nsi_supports){
	try{
		var {Ci} = require("chrome");
		return nsi_supports.QueryInterface(Ci.nsIChannel);
	}catch(e){}
	
	return null;
}

// --------------------------------------------------------------------------------
// nsIsupports から nsIRequest 取得
// --------------------------------------------------------------------------------
function XPCOM_nsIsupports_Get_nsIRequest(nsi_supports){
	try{
		var {Ci} = require("chrome");
		return nsi_supports.QueryInterface(Ci.nsIRequest);
	}catch(e){}
	
	return null;
}

// --------------------------------------------------------------------------------
// nsIRequest の中断
// --------------------------------------------------------------------------------
function XPCOM_nsIRequest_Abort(nsi_request){
	try{
		var {Cr} = require("chrome");
		nsi_request.cancel(Cr.NS_ERROR_ABORT);
	}catch(e){}
}

// --------------------------------------------------------------------------------
// nsIChannel からカレントの URL 取得
// --------------------------------------------------------------------------------
function XPCOM_nsIRequest_GetCurrentUrl(nsi_channel){
    var {Cc,Ci} = require("chrome");
	try{
		var interface_requestor = nsi_channel.notificationCallbacks;
		if(interface_requestor){
			var web_avigation = interface_requestor.getInterface(Ci.nsIWebNavigation);
			var tree_item = web_avigation.QueryInterface(Ci.nsIDocShellTreeItem);
			var tree_root = tree_item.rootTreeItem;
			interface_requestor = tree_root.QueryInterface(Ci.nsIInterfaceRequestor);
			var w = interface_requestor.getInterface(Ci.nsIDOMWindow);
			return w.getBrowser().selectedBrowser.contentWindow.location.href;
		}
	}catch(e){
	}

	return "";
}

// --------------------------------------------------------------------------------
// Firefox アドオン用言語取得
// --------------------------------------------------------------------------------
function FirefoxAddonGetLanguage(){
	var _ = require("sdk/l10n").get;
	var language = _("language");
	if(language == "language"){
		return "en";
	}

	return language;
}

// --------------------------------------------------------------------------------
// Firefox アドオン用ストレージ取得
// --------------------------------------------------------------------------------
function FirefoxAddonGetSimpleStorage(){
	return require("sdk/simple-storage");
}

// --------------------------------------------------------------------------------
// Firefox アドオン用コンテキストメニュー取得
// --------------------------------------------------------------------------------
function FirefoxAddonGetContextMenu(){
	return  require("sdk/context-menu");
}

// --------------------------------------------------------------------------------
// Firefox アドオン用パネル取得
// --------------------------------------------------------------------------------
function FirefoxAddonGetPanel(){
	return  require("sdk/panel");
}

// --------------------------------------------------------------------------------
// Firefox アドオン用ウィジット取得
// --------------------------------------------------------------------------------
function FirefoxAddonGetWidget(){
	return  require("sdk/widget");
}

// --------------------------------------------------------------------------------
// Firefox アドオン用タブ取得
// --------------------------------------------------------------------------------
function FirefoxAddonGetTabs(){
	return  require("sdk/tabs");
}

// --------------------------------------------------------------------------------
// Firefox アドオン用 PageMod 取得
// --------------------------------------------------------------------------------
function FirefoxAddonGetClipboard(){
	return  require("sdk/clipboard");
}

// --------------------------------------------------------------------------------
// Firefox アドオン用 SimplePrefs 取得
// --------------------------------------------------------------------------------
function FirefoxAddonGetSimplePrefs(){
	return  require("sdk/simple-prefs");
}

// --------------------------------------------------------------------------------
// Firefox アドオン用 PageMod 取得
// --------------------------------------------------------------------------------
function FirefoxAddonGetPageMod(){
	return  require("sdk/page-mod");
}

// --------------------------------------------------------------------------------
// Firefox アドオン用 self 取得
// --------------------------------------------------------------------------------
function FirefoxAddonGetSelf(){
	return  require("sdk/self");
}

// --------------------------------------------------------------------------------
// アドオン開始
// --------------------------------------------------------------------------------
exports.main = function(options, callback) {
	var obj = new Object();
    var data = FirefoxAddonGetSelf().data;

	var loader = XPCOM_Get_mozIJSSubScriptLoader();
	loader.loadSubScript(data.url("PageExpand.js"),obj,"UTF-8");

	// バックグラウンド実行
	obj.PageExpand("FirefoxExtensionBackGround");
};

// --------------------------------------------------------------------------------
// アドオン終了
// --------------------------------------------------------------------------------
exports.onUnload = function(){
};
