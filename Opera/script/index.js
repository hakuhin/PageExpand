// --------------------------------------------------------------------------------
// PageExpand
//
// Hakuhin 2010-2019  https://hakuhin.jp
// --------------------------------------------------------------------------------


// --------------------------------------------------------------------------------
// PageExpand クラス
// --------------------------------------------------------------------------------
function PageExpand(page_expand_arguments){

	// --------------------------------------------------------------------------------
	// PageExpand 初期化
	// --------------------------------------------------------------------------------
	function PageExpandInitialize(){

		// PageExpand ノード
		if(!page_expand_node){
			page_expand_node = new PageExpandNode();
			if(page_expand_arguments.page_expand_parent){
				page_expand_arguments.page_expand_parent.attachChild(page_expand_node);
			}
			page_expand_root = page_expand_node.getPageExpandRoot();
		}

		// イベントディスパッチャー
		if(!page_expand_event_dispatcher){
			page_expand_event_dispatcher = new EventDispatcher();

			// アンロード監視
			if(WindowIsChild(window)){
				PageExpandObserverUnload();
			}
		}

	}

	// --------------------------------------------------------------------------------
	// PageExpand コンストラクタ
	// --------------------------------------------------------------------------------
	function PageExpandConstructor(){

		// マウス入力
		if(!input_mouse){
			input_mouse = new InputMouse(window);
		}

		// 実行キュー
		if(!execute_queue){
			execute_queue = new ExecuteQueue();
		}

		// ローダーキュー
		if(!loader_queue){
			loader_queue = new LoaderQueue();
		}

		// ダウンローダーキュー
		if(!downloader_queue){
			downloader_queue = new DownloaderQueue();
		}

		// アドレスコレクション
		if(!address_collection){
			address_collection = new AddressCollection();
		}

		// ダウンロードリスト
		if(!download_list_image){
			download_list_image = new DownloadList();
		}
		if(!download_list_user){
			download_list_user = new DownloadList();
		}

		// タスクコンテナを生成
		if(!task_container){
			task_container = new TaskContainer();
			task_execute_level = 0xffffffff;

			// --------------------------------------------------------------------------------
			// 実行ループ
			// --------------------------------------------------------------------------------
			(function(){
				var time_handle = null;

				// 開始関数をセット
				task_container.setStartFunc(function(){
					if(time_handle !== null) return;
					time_handle = setInterval(function (){
						task_container.execute(task_execute_level);
					}, 1000 / 60);
				});

				// 終了関数をセット
				task_container.setEndFunc(function(){
					if(time_handle === null) return;
					clearInterval(time_handle);
					time_handle = null;
				});
			})();
		}

		// 最速実行
		if(!page_expand_execute_faster){
			page_expand_execute_faster = new PageExpandExecuteFaster();
		}

		// デバッグ
		if(!page_expand_debug){
			page_expand_debug = new PageExpandDebug();
		}

		// DOMノードが外れたか監視
		if(!document_observer_remove_node){
			document_observer_remove_node = new DocumentObserverRemoveDomNode();
		}

		// プロパティ変更を監視
		if(!document_observer_modify_node){
			document_observer_modify_node = new DocumentObserverModifyProperty();
		}

		// スクロール監視
		if(!document_observer_scroll){
			document_observer_scroll = new DocumentObserverScroll();
		}

		// 進捗通知
		if(!notify_progress){
			notify_progress = new NotifyProgress();
		}

		// イメージ管理
		if(!element_limitter_image){
			element_limitter_image = new ElementLimiterByByteSize();
		}
		if(!popup_image_container){
			popup_image_container = new PopupImageContainer();
		}

		// サウンド管理
		if(!element_limitter_sound){
			element_limitter_sound = new ElementLimiterByCount();
		}

		// ビデオ管理
		if(!element_limitter_video){
			element_limitter_video = new ElementLimiterByCount();
		}

		// リダイレクト辞書
		if(!redirect_url_dictionary){
			redirect_url_dictionary = new RedirectUrlDictionary();
		}

		// 解析辞書
		if(!analyze_work_dictionary){
			analyze_work_dictionary = new AnalyzeWorkDictionary();
		}

		// 掲示板辞書
		if(!bbs_dictionary){
			bbs_dictionary = new BbsDictionary();
		}

		// ウィンドウ管理
		if(!window_manager){
			window_manager = new WindowManager(window);
		}

		// 掲示板拡張
		if(!expand_bbs){
			expand_bbs = {
				enable:false,
				initialized:false,
				node_queue:new Array(),
				work:new Object()
			};
		}

	}

	// --------------------------------------------------------------------------------
	// PageExpand から実行されるか調べる
	// --------------------------------------------------------------------------------
	function WindowIsExecutedByPageExpand(window_obj){
		try{
			var re = new RegExp("^(data|blob|about):","i");
			if(window_obj.location.href){}
			if(window_obj.document.URL.match(re)){
				return true;
			}
		}catch(e){
		}

		return false;
	}




	// --------------------------------------------------------------------------------
	// PageExpand バックグラウンド Opera 用
	// --------------------------------------------------------------------------------
	function PageExpandBackGroundForOpera(){
		var _this = this;

		// --------------------------------------------------------------------------------
		// プロジェクトをロード（内部用）
		// --------------------------------------------------------------------------------
		function loadPageExpandProject(func){
			var proj = new PageExpandProject();

			// プロジェクトをロード
			proj.loadLocalStorage(function(e){

				// プロジェクトを更新
				page_expand_project = proj;
				updateProject("");

				// 設定更新
				loader_queue.setMaxThread(project.getLoadThreadMax());
				downloader_queue.setMaxThread(project.getDownloadThreadMax());
				execute_queue.setOccupancyTime(project.getExecuteQueueOccupancyTime());
				execute_queue.setSleepTime(project.getExecuteQueueSleepTime());

				// ロケール
				_i18n = new InternationalMessage(page_expand_project.getLanguage());

				// コンテキストメニューを再構築
				createContextMenu();

				// ツールバーメニューを更新
				updateToolBarMenu();

				// URLフィルタを更新
				updateUrlFilter();

				func(e);
			});

		}

		// --------------------------------------------------------------------------------
		// プロジェクトを更新（内部用）
		// --------------------------------------------------------------------------------
		function updateProject(url){
			project = new Project();
			project.importObjectForBackground(page_expand_project.getProject(url));
		}

		// --------------------------------------------------------------------------------
		// コンテキストメニューを作成（内部用）
		// --------------------------------------------------------------------------------
		function createContextMenu(){

			if (!(opera.contexts.menu))	return;

			var context_menu = opera.contexts.menu;

			// すべてのアイテムを破棄
			while(true){
				var item = context_menu.item(0);
				if(!item)	break;

				context_menu.removeItem(0);
			}
			_context_menu_items = new Array();

			// 再登録
			if(project.getEnableContextMenu()){

				var item_folder = context_menu.createItem({
					title: _i18n.getMessage("context_menu_pageexpand_config"),
					icon: 'icons/icon16.png',
					type: 'folder'
				});
				context_menu.addItem(item_folder);

				// 一括ダウンロード（画像）
				item_folder.addItem(context_menu.createItem({
					title: _i18n.getMessage("context_menu_batch_download_image"),
					onclick: function (e) {
						var tab = OperaExtensionGetSelectedTab();
						if(tab){
							extension_message.sendRequestToContent(tab, {command: "batchDownloadImage"});
						}
					}
				}));
				_context_menu_items[0] = true;

				// 一括ダウンロード（ユーザー）
				item_folder.addItem(context_menu.createItem({
					title: _i18n.getMessage("context_menu_batch_download_user"),
					onclick: function (e) {
						var tab = OperaExtensionGetSelectedTab();
						if(tab){
							extension_message.sendRequestToContent(tab, {command: "batchDownloadUser"});
						}
					}
				}));
				_context_menu_items[1] = true;

				item_folder.addItem(context_menu.createItem({
					type: "line"
				}));

				// 掲示板ボードを開く
				item_folder.addItem(context_menu.createItem({
					title: _i18n.getMessage("context_menu_pageexpand_open_bbs_board"),
					onclick: function (e) {
						var query = new Object();
						var tab = OperaExtensionGetSelectedTab();
						if(tab){
							if(tab.url){
								query.referer = encodeURIComponent(tab.url);
							}
						}
						OperaExtensionOpenBbsBoard(query);
					}
				}));
				_context_menu_items[2] = true;

				item_folder.addItem(context_menu.createItem({
					type: "line"
				}));

				// 現在のページの設定を編集
				item_folder.addItem(context_menu.createItem({
					title: _i18n.getMessage("context_menu_pageexpand_config_current_page"),
					onclick: function (e) {
						var query = new Object();
						query.type = "urlmap";
						var tab = OperaExtensionGetSelectedTab();
						if(tab){
							if(tab.url){
								query.url = encodeURIComponent(tab.url);
							}
						}
						OperaExtensionOpenPageExpandConfig(query);
					}
				}));
				_context_menu_items[3] = true;

				// 現在の掲示板の設定を編集
				if(project.getEnableExpandBbs()){
					item_folder.addItem(context_menu.createItem({
						title: _i18n.getMessage("context_menu_pageexpand_config_current_bbs"),
						onclick: function (e) {
							var query = new Object();
							query.type = "expand_bbs";
							var tab = OperaExtensionGetSelectedTab();
							if(tab){
								if(tab.url){
									query.url = encodeURIComponent(tab.url);
								}
							}
							OperaExtensionOpenPageExpandConfig(query);
						}
					}));
					_context_menu_items[4] = true;
				}

				item_folder.addItem(context_menu.createItem({
					type: "line"
				}));

				// PageExpand の開始
				if(!(project.getEnableStartup())){
					item_folder.addItem(context_menu.createItem({
						title: _i18n.getMessage("context_menu_pageexpand_start"),
						onclick: function (e) {
							var tab = OperaExtensionGetSelectedTab();
							if(tab){
								extension_message.sendRequestToContent(tab, {command: "startPageExpand"});
							}
						}
					}));
					_context_menu_items[5] = true;
				}

				// PageExpand の中止
				item_folder.addItem(context_menu.createItem({
					title: _i18n.getMessage("context_menu_pageexpand_abort"),
					onclick: function (e) {
						var tab = OperaExtensionGetSelectedTab();
						if(tab){
							extension_message.sendRequestToContent(tab, {command: "abortPageExpand"});
						}
					}
				}));
				_context_menu_items[6] = true;

				// PageExpand の最速実行
				item_folder.addItem(context_menu.createItem({
					title: _i18n.getMessage("context_menu_pageexpand_execute_fastest"),
					onclick: function (e) {
						var tab = OperaExtensionGetSelectedTab();
						if(tab){
							extension_message.sendRequestToContent(tab, {command: "executeFastest"});
						}
					}
				}));
				_context_menu_items[7] = true;

				// PageExpand デバッグ
				item_folder.addItem(context_menu.createItem({
					title: _i18n.getMessage("context_menu_pageexpand_debug"),
					onclick: function (e) {
						var tab = OperaExtensionGetSelectedTab();
						if(tab){
							extension_message.sendRequestToContent(tab, {command: "executeDebug"});
						}
					}
				}));
				_context_menu_items[8] = true;

			}
		}

		// --------------------------------------------------------------------------------
		// コンテキストメニューを更新（内部用）
		// --------------------------------------------------------------------------------
		function updateContextMenu(){
			var items = new Array();

			if(!(project.getEnable())){
			}else if(!(project.getEnableContextMenu())){
			}else{
				items[0] = true;
				items[1] = true;
				items[2] = true;
				items[3] = true;
				if(project.getEnableExpandBbs()){
					items[4] = true;
				}
				if(!(project.getEnableStartup())){
					items[5] = true;
				}
				items[6] = true;
				items[7] = true;
				items[8] = true;
			}

			var i;
			var num = _context_menu_items.length;
			if(num == items.length){
				for(i=0;i<num;i++){
					if(_context_menu_items[i] != items[i]){
						break;
					}
				}
				if(i >= num){
					return;
				}
			}

			// コンテキストメニューを再構築
			createContextMenu();
		}

		// --------------------------------------------------------------------------------
		// ツールバーメニューを更新（内部用）
		// --------------------------------------------------------------------------------
		function updateToolBarMenu(){

			if (!(opera.contexts.toolbar))	return;

			var toolbar = opera.contexts.toolbar;
			
			if(_toolbar_button){
				toolbar.removeItem(_toolbar_button);
				_toolbar_button = null;
			}

			// 再登録
			if(project.getEnableIconAddressBar()){

				// --------------------------------------------------------------------------------
				// ポップアップメニューを追加
				// --------------------------------------------------------------------------------
				var tool_bar_param = {
					title: "PageExpand",
					icon: "icons/icon18.png",
					popup:{
						href: "popup.html",
						width: 300,
						height: 300
					}
				};
				_toolbar_button = toolbar.createItem(tool_bar_param);
				toolbar.addItem(_toolbar_button);

			}
		}

		// --------------------------------------------------------------------------------
		// URLフィルタを更新（内部用）
		// --------------------------------------------------------------------------------
		function updateUrlFilter(){

			if (!(opera.extension.urlfilter))	return;

			var url_filter = opera.extension.urlfilter;

			var i;
			var num;

			// クリア
			num = _url_filter.length;
			for(i=0;i<num;i++){
				url_filter.block.remove(_url_filter.pop());
			}

			// 登録
			var defines = page_expand_project.getAccessBlockForOperaExtension();
			if(defines){
				var i;
				var j;
				var filters;
				var filter_num;
				var define;
				var define_num = defines.length;
				for(i=0;i<define_num;i++){
					define = defines[i];
					filters = define.filter.asterisk.filter;
					filter_num = filters.length;
					for(j=0;j<filter_num;j++){
						_url_filter.push(filters[j]);
						url_filter.block.add(filters[j]);
					}
				}
			}
		}

		// --------------------------------------------------------------------------------
		// プライベート変数
		// --------------------------------------------------------------------------------
		var _i18n;
		var _toolbar_button;
		var _url_filter;
		var _context_menu_items;

		// --------------------------------------------------------------------------------
		// 初期化
		// --------------------------------------------------------------------------------
		(function(){

			_context_menu_items = new Array();
			_url_filter = new Array();

			// Opera拡張機能通信
			extension_message = new OperaExtensionMessageForBackground();

			// --------------------------------------------------------------------------------
			// コマンド辞書
			// --------------------------------------------------------------------------------
			var command_dictionary = new Object();

			// PageExpandProject 取得
			command_dictionary["getPageExpandProject"] = function(param,sender,sendResponse){
				// JSON 文字列を返す
				sendResponse(page_expand_project.exportJSON(),{complete:true});
			};

			// Project 取得
			command_dictionary["getProject"] = function(param,sender,sendResponse){
				// JSON 文字列を返す
				sendResponse(JsonStringify(page_expand_project.getProject(param.url)),{complete:true});

				var tab = OperaExtensionGetSelectedTab();
				if(tab){
					if(tab.url){
						updateProject(tab.url);
						updateContextMenu();
					}
				}
			};

			// プロジェクト設定をリロード
			command_dictionary["reloadPageExpandProject"] = function(param,sender,sendResponse){
				loadPageExpandProject(function(e){});
			};

			// XMLHttpRequest 通信
			function requestXHR(param,sender,sendResponse){
				var loader_queue_element = loader_queue.createElement();
				loader_queue_element.onstart = function(){
					var request = param.request;
					var xhr = XMLHttpRequestCreate();

					xhr.onloadend = function(r){
						xhr_complete();
					};
					xhr.onprogress = function(e){
						sendResponse({type:"progress",data:{
							loaded:(e.loaded || 0),
							total:(e.total || 0),
						}},{complete:false});
					};
					var xhr_complete = function(){
						if(!loader_queue_element) return;
						loader_queue_element.complete();
						loader_queue_element.release();
						loader_queue_element = null;

						xhr.onloadend = null;
						xhr.onprogress = null;

						request.oncomplete(xhr,function(){
							var response = new Object();
							response.readyState = 4;
							response.status = xhr.status;
							response.responseHeaders = xhr.getAllResponseHeaders() || "";
							sendResponse({type:"xhr",data:response},{complete:true});
						});
					};

					try{
						xhr.open(request.method,request.url,true);
						var headers = request.headers;
						for(var name in headers){
							xhr.setRequestHeader(name,headers[name]);
						}
						if(xhr.overrideMimeType && request.override_mime_type){
							xhr.overrideMimeType(request.override_mime_type);
						}
						if(request.timeout){
							xhr.timeout = request.timeout;
						}
						if(request.responseType){
							xhr.responseType = request.responseType;
						}
						xhr.send(request.data);
					}catch(e){
						xhr_complete();
					}
				};
				if(param.single){
					loader_queue_element.attachSingle();
				}else{
					loader_queue_element.attachLast();
				}
			};

			// XMLHttpRequest 通信
			command_dictionary["loadXMLHttpRequest"] = function(param,sender,sendResponse){
				var request = param.request;
				request.oncomplete = function(xhr,callback){
					var text = "";
					var text_size = 1024 * 1024 * 16;
					var text_pos = text_size;
					var pos = 0;
					var total = xhr.responseText.length;
					var send_size = text_size / 128;
					var f = function (){
						if(text_size <= text_pos){
							text = xhr.responseText.substr(pos,text_size);
							text_pos = 0;
						}
						sendResponse({type:"data",pos:pos,total:total,data:text.substr(text_pos,send_size)},{complete:false});

						text_pos += send_size;
						pos += send_size;
						if(pos < total){
							execute_queue.attachLast(f,null);
							return;
						}
						callback();
					};
					execute_queue.attachLast(f,null);
				};
				requestXHR(param,sender,sendResponse);
			};

			// data URI scheme 読み込み
			command_dictionary["loadDataUriScheme"] = function(param,sender,sendResponse){
				var request = param.request;
				request.responseType = "blob";
				request.oncomplete = function(xhr,callback){
					if(!(xhr.response)){
						callback();
						return;
					}
					var file_reader = new FileReader();
					file_reader.onloadend = function(){
						if(file_reader.error){
							callback();
							return;
						}
						var i = 0;
						var size = 1024 * 128;
						var total = file_reader.result.length;
						var f = function (){
							sendResponse({type:"data",pos:i,total:total,data:file_reader.result.substr(i,size)},{complete:false});

							i += size;
							if(i < total){
								execute_queue.attachLast(f,null);
								return;
							}
							callback();
						};
						execute_queue.attachLast(f,null);
					};
					var blob = xhr.response;
					if(!(blob.type)) blob = new Blob([blob],{type:xhr.getResponseHeader("Content-Type")});
					file_reader.readAsDataURL(blob);
				};
				requestXHR(param,sender,sendResponse);
			};

			// BinaryString 読み込み
			command_dictionary["loadBinaryString"] = function(param,sender,sendResponse){
				var request = param.request;
				request.responseType = "blob";
				request.oncomplete = function(xhr,callback){
					if(!(xhr.response)){
						callback();
						return;
					}
					var file_reader = new FileReader();
					file_reader.onloadend = function(){
						if(file_reader.error){
							callback();
							return;
						}
						var i = 0;
						var size = 1024 * 128;
						var total = file_reader.result.length;
						var f = function (){
							sendResponse({type:"data",pos:i,total:total,data:file_reader.result.substr(i,size)},{complete:false});

							i += size;
							if(i < total){
								execute_queue.attachLast(f,null);
								return;
							}
							callback();
						};
						execute_queue.attachLast(f,null);
					};
					file_reader.readAsBinaryString(xhr.response);
				};
				requestXHR(param,sender,sendResponse);
			};

			// キャッシュへ読み込み
			command_dictionary["loadToCache"] = function(param,sender,sendResponse){
				var request = param.request;
				request.responseType = "blob";
				request.oncomplete = function(xhr,callback){
					callback();
				};
				requestXHR(param,sender,sendResponse);
			};

			// 掲示板ボードを開く
			command_dictionary["openBbsBoard"] = function(param,sender,sendResponse){
				var query = new Object();
				var tab = OperaExtensionGetSelectedTab();
				if(tab){
					if(tab.url){
						query.referer = encodeURIComponent(tab.url);
					}
				}
				OperaExtensionOpenBbsBoard(query);
			};

			// 現在のページの設定を編集
			command_dictionary["configCurrentPage"] = function(param,sender,sendResponse){
				var query = new Object();
				query.type = "urlmap";
				var tab = OperaExtensionGetSelectedTab();
				if(tab){
					if(tab.url){
						query.url = encodeURIComponent(tab.url);
					}
				}
				OperaExtensionOpenPageExpandConfig(query);
			};

			// 現在の掲示板の設定を編集
			command_dictionary["configCurrentBbs"] = function(param,sender,sendResponse){
				var query = new Object();
				query.type = "expand_bbs";
				var tab = OperaExtensionGetSelectedTab();
				if(tab){
					if(tab.url){
						query.url = encodeURIComponent(tab.url);
					}
				}
				OperaExtensionOpenPageExpandConfig(query);
			};

			// コマンド
			command_dictionary["startPageExpand"] =
			command_dictionary["abortPageExpand"] =
			command_dictionary["executeFastest"] =
			command_dictionary["executeDebug"] =
			command_dictionary["batchDownloadImage"] =
			command_dictionary["batchDownloadUser"] = function(param,sender,sendResponse){
				var tab = OperaExtensionGetSelectedTab();
				if(tab){
					extension_message.sendRequestToContent(tab, {command: param.command});
				}
			};

			// 現在アクティブなタブの URL を取得
			command_dictionary["getActiveURL"] = function(param,sender,sendResponse){
				var tab = OperaExtensionGetSelectedTab();
				var url = "";
				if(tab){
					if(tab.url){
						url = tab.url;
					}
				}
				sendResponse(url,{complete:true});
			};

			// --------------------------------------------------------------------------------
			// プロジェクトをロード
			// --------------------------------------------------------------------------------
			loadPageExpandProject(function(e){

				// --------------------------------------------------------------------------------
				// タブの状態
				// --------------------------------------------------------------------------------
				opera.extension.tabs.addEventListener("focus",function() {
					var tab = OperaExtensionGetSelectedTab();
					if(tab){
						if(tab.url){
							updateProject(tab.url);
							updateContextMenu();
						}
					}
				},false);

				// --------------------------------------------------------------------------------
				// コンテンツスクリプトとの通信
				// --------------------------------------------------------------------------------
				extension_message.addListener(function(request, sender, sendResponse) {
					var param = request;

					var callback = command_dictionary[param.command];
					if(callback){
						callback(param,sender,sendResponse);
					}else{
						sendResponse("",{complete:true});
					}
				});

			});

		})();
	}



	// --------------------------------------------------------------------------------
	// 初期化
	// --------------------------------------------------------------------------------
	switch(page_expand_arguments.execute_type){

	// --------------------------------------------------------------------------------
	// Opera のバックグラウンドとして動作
	// --------------------------------------------------------------------------------
	case "OperaExtensionBackGround":
		// --------------------------------------------------------------------------------
		// バックグラウンド用初期化
		// --------------------------------------------------------------------------------
		{
			// 実行キュー
			execute_queue = new ExecuteQueue();

			// ローダーキュー
			loader_queue = new LoaderQueue();

			// ダウンローダーキュー
			downloader_queue = new DownloaderQueue();
		}

		PageExpandBackGroundForOpera();
		break;

	};

}
