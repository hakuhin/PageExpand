// --------------------------------------------------------------------------------
// PageExpand
//
// Hakuhin 2010-2014  http://hakuhin.jp
// --------------------------------------------------------------------------------


// --------------------------------------------------------------------------------
// PageExpand クラス
// --------------------------------------------------------------------------------
function PageExpand(page_expand_arguments){



	// --------------------------------------------------------------------------------
	// PageExpand バックグラウンド Opera 用
	// --------------------------------------------------------------------------------
	function PageExpandBackGroundForOpera(){

		var _container = new Object();

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
				_context_menu_items[0] = true;

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
					_context_menu_items[1] = true;
				}

				if(!(project.getEnableStartup())){
					item_folder.addItem(context_menu.createItem({
						title: _i18n.getMessage("context_menu_pageexpand_execute"),
						onclick: function (e) {
							var tab = OperaExtensionGetSelectedTab();
							if(tab){
								extension_message.sendRequestToContent(tab, {command: "executePageExpand"});
							}
						}
					}));
					_context_menu_items[2] = true;
				}

				item_folder.addItem(context_menu.createItem({
					title: _i18n.getMessage("context_menu_pageexpand_debug"),
					onclick: function (e) {
						var tab = OperaExtensionGetSelectedTab();
						if(tab){
							extension_message.sendRequestToContent(tab, {command: "executeDebug"});
						}
					}
				}));
				_context_menu_items[3] = true;

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
				if(project.getEnableExpandBbs()){
					items[1] = true;
				}
				if(!(project.getEnableStartup())){
					items[2] = true;
				}
				items[3] = true;
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
					title: "Hello World",
					icon: "icons/icon18.png",
					popup:{
						href: "popup.html",
						width: 300,
						height: 250
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
			command_dictionary["loadXMLHttpRequest"] = function(param,sender,sendResponse){
				var queue_element = loader_queue.createElement();
				queue_element.onstart = function(){
					var completed = false;
					try{
						var request = param.request;
						var xhr = XMLHttpRequestCreate();

						// ステート変更時に実行されるイベント
						xhr.onreadystatechange = function(r){
							switch(xhr.readyState){
							case 4:
								if(!completed){
									completed = true;

									queue_element.complete();
									queue_element.release();

									var response = new Object();
									response.readyState = xhr.readyState;
									response.status = xhr.status;
									response.responseHeaders = xhr.getAllResponseHeaders();

									var i = 0;
									var size = 1024 * 128;
									var total = xhr.responseText.length;
									function f(){
										sendResponse({type:"data",pos:i,total:total,data:xhr.responseText.substr(i,size)},{complete:false});

										i += size;
										if(i < total){
											execute_queue.attachLast(f,null);
											return;
										}
										sendResponse({type:"xhr",data:response},{complete:true});
									}
									execute_queue.attachLast(f,null);
								}
								break;
							}
						};

						// 読み込み開始
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
						xhr.send(request.data);
					}catch(e){
						if(!completed){
							completed = true;

							queue_element.complete();
							queue_element.release();

							var response = new Object();
							response.readyState = 4;
							response.status = 0;
							response.responseHeaders = {};
							sendResponse({type:"xhr",data:response},{complete:true});
						}
					}
				};
				if(param.single){
					queue_element.attachSingle();
				}else{
					queue_element.attachLast();
				}
			};

			// data URI scheme 読み込み
			command_dictionary["loadDataUriScheme"] = function(param,sender,sendResponse){
				var queue_element = loader_queue.createElement();
				queue_element.onstart = function(){
					var completed = false;
					try{
						var request = param.request;
						var xhr = XMLHttpRequestCreate();

						// ステート変更時に実行されるイベント
						xhr.onreadystatechange = function(r){
							switch(xhr.readyState){
							case 4:
								if(!completed){
									completed = true;

									queue_element.complete();
									queue_element.release();

									var response = new Object();
									response.readyState = xhr.readyState;
									response.status = xhr.status;
									response.responseHeaders = xhr.getAllResponseHeaders();
									if(xhr.response){
										var file_reader = new FileReader();
										file_reader.onload = function(){
											var i = 0;
											var size = 1024 * 128;
											var total = file_reader.result.length;
											function f(){
												sendResponse({type:"data",pos:i,total:total,data:file_reader.result.substr(i,size)},{complete:false});

												i += size;
												if(i < total){
													execute_queue.attachLast(f,null);
													return;
												}
												sendResponse({type:"xhr",data:response},{complete:true});
											}
											execute_queue.attachLast(f,null);
										};
										file_reader.onerror = function(){
											sendResponse({type:"xhr",data:response},{complete:true});
										};
										file_reader.readAsDataURL(xhr.response);
									}else{
										sendResponse({type:"xhr",data:response},{complete:true});
									}
								}
								break;
							}
						};

						// 読み込み開始
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
						xhr.responseType = "blob";
						xhr.send(request.data);
					}catch(e){
						if(!completed){
							completed = true;

							queue_element.complete();
							queue_element.release();

							var response = new Object();
							response.readyState = 4;
							response.status = 0;
							response.response = null;
							response.responseHeaders = {};
							sendResponse({type:"xhr",data:response},{complete:true});
						}
					}
				};
				if(param.single){
					queue_element.attachSingle();
				}else{
					queue_element.attachLast();
				}
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

			// PageExpand の実行
			command_dictionary["executePageExpand"] = function(param,sender,sendResponse){
				var tab = OperaExtensionGetSelectedTab();
				if(tab){
					extension_message.sendRequestToContent(tab, {command: "executePageExpand"});
				}
			};

			// PageExpand デバッグ
			command_dictionary["executeDebug"] = function(param,sender,sendResponse){
				var tab = OperaExtensionGetSelectedTab();
				if(tab){
					extension_message.sendRequestToContent(tab, {command: "executeDebug"});
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

		return _container;
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
		}

		PageExpandBackGroundForOpera();
		break;

	};

}
