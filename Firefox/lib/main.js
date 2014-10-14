// --------------------------------------------------------------------------------
// アドオン開始
// --------------------------------------------------------------------------------
exports.main = function(options, callback) {
	// 隠しフレームを生成
	var hidden_frames = require("sdk/frame/hidden-frame");
	var hidden_frame = hidden_frames.HiddenFrame({
		onReady: function() {
			var iframe = hidden_frame.element;

			// バックグラウンド実行
			require("PageExpand").PageExpand({execute_type:"FirefoxExtensionBackGround",admin:this,window:iframe.contentWindow});
		}
	});
	hidden_frames.add(hidden_frame);
};

// --------------------------------------------------------------------------------
// アドオン終了
// --------------------------------------------------------------------------------
exports.onUnload = function(){
};
