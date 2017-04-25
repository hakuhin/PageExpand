// --------------------------------------------------------------------------------
// PageExpand
//
// Hakuhin 2010-2017  http://hakuhin.jp
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
	// ポップアップメニュー
	// --------------------------------------------------------------------------------
	function PageExpandPopupMenu(){
		var _this = this;

		// --------------------------------------------------------------------------------
		// リロード
		// --------------------------------------------------------------------------------
		_this.reload = function (){
			// プロジェクト読み込み
			projectLoad(function(e){

				// エレメントを全てクリア
				var child_nodes = document.body.childNodes;
				var i;
				var num = child_nodes.length;
				for(i=num-1;i >= 0;i--){
				var node = child_nodes[i];
					DomNodeRemove(node);
				}

				// ロケール
				_i18n = new InternationalMessage(page_expand_project.getLanguage());
				initialize();
			});
		};

		// --------------------------------------------------------------------------------
		// ロード（内部用）
		// --------------------------------------------------------------------------------
		function projectLoad(func){
			var proj = new PageExpandProject();

			// プロジェクトをロード
			proj.loadLocalStorage(function(e){

				// プロジェクトを更新
				page_expand_project = proj;
				project = new Project();
				getActiveURL(function(url){
					project.importObjectForBackground(page_expand_project.getProject(url));
					func(e);
				});
			});
		}

		// --------------------------------------------------------------------------------
		// クリック（内部用）
		// --------------------------------------------------------------------------------
		function click(command){
			switch(command){
			case "openBbsBoard":
				extension_message.sendRequest({command: "openBbsBoard"});
				break;
			case "configCurrentPage":
				extension_message.sendRequest({command: "configCurrentPage"});
				break;
			case "configCurrentBbs":
				extension_message.sendRequest({command: "configCurrentBbs"});
				break;
			default:
				extension_message.sendRequest({command: command});
				break;
			}
		}

		// --------------------------------------------------------------------------------
		// アクティブページのURLを取得（内部用）
		// --------------------------------------------------------------------------------
		function getActiveURL(func){
			extension_message.sendRequest({command: "getActiveURL"},function(response){
				func(response);
			});
		}

		// --------------------------------------------------------------------------------
		// ラインボタン（内部用）
		// --------------------------------------------------------------------------------
		function UI_LineButton(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 通常状態（内部用）
			// --------------------------------------------------------------------------------
			function normal(){
				_style.color = "#222";
				_style.background = "none";
			}

			// --------------------------------------------------------------------------------
			// マウスオーバー状態（内部用）
			// --------------------------------------------------------------------------------
			function mouse_over(){
				_style.color = "#fff";
				_style.background = "#4281F4";
			}

			// --------------------------------------------------------------------------------
			// マウスオーバー状態（内部用）
			// --------------------------------------------------------------------------------
			function mouse_down(){
				_style.color = "#fff";
				_style.background = "#4281F4";
			}

			// --------------------------------------------------------------------------------
			// クリックイベント
			// --------------------------------------------------------------------------------
			_this.onclick = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _item;
			var _style;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_item = DocumentCreateElement("a");
				_item.href = "javascript:void(0);";
				_style = _item.style;
				ElementSetStyle(_item,"display:block; text-decoration: none; font-size:13px; color:#000; margin:0px 0px 2px; padding:5px 20px; border-radius:5px; line-height:1.0;");
				ElementSetTextContent(_item,label);
				parent.appendChild(_item);

				_item.onclick = function(){
					_this.onclick();
				};
				_item.onmouseover = function(){
					mouse_over();
				};
				_item.onmousedown = function(){
					mouse_down();
				};
				_item.onmouseup = function(){
					mouse_over();
				};
				_item.onmouseout = function(){
					normal();
				};
				normal();
			})();
		}

		// --------------------------------------------------------------------------------
		// セパレータ（内部用）
		// --------------------------------------------------------------------------------
		function UI_Separator(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _item;
			var _style;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_item = DocumentCreateElement("div");
				ElementSetStyle(_item,"height: 0px; border-top:1px solid #ddd; margin:2px 0px;");
				parent.appendChild(_item);
			})();
		}

		// --------------------------------------------------------------------------------
		// 初期化（内部用）
		// --------------------------------------------------------------------------------
		function initialize(){

			// タイトル
			document.title = _i18n.getMessage("page_expand_popup_menu");

			// ボディ
			var body = document.body;
			ElementSetStyle(body,'background-color:#ccc; font-family:"Meiryo","sans-serif"; margin:0px; padding:0px; width:300px; border:0px solid #000; overflow-x:hidden; box-sizing:border-box;');

			// ヘッダ
			var head_window = DocumentCreateElement("div");
			ElementSetStyle(head_window,"background-color:#000; color:#fff; font-size:12px; font-weight:bold; padding:2px 5px; margin:0px;");
			ElementSetTextContent(head_window,_i18n.getMessage("page_expand_popup_menu"));
			body.appendChild(head_window);

			// ボディ
			var body_window = DocumentCreateElement("div");
			ElementSetStyle(body_window,"border:2px inset #f0f0f0; background-color:#fcfcfc;");
			body.appendChild(body_window);

			// 外周
			var out_window = DocumentCreateElement("div");
			ElementSetStyle(out_window,"margin:5px 5px 5px 5px;");
			body_window.appendChild(out_window);

			// 外周
			var out_table = DocumentCreateElement("div");
			ElementSetStyle(out_table,"width:100%; display:table;");
			out_window.appendChild(out_table);

			// メニュー部
			var _menu_window = DocumentCreateElement("div");
			ElementSetStyle(_menu_window,"display:table-cell; vertical-align:top; user-select:none; -webkit-user-select:none; -moz-user-select:none; -khtml-user-select:none; margin:0px;");
			out_table.appendChild(_menu_window);

			// 一括ダウンロード（画像）
			var button_config = new UI_LineButton(_menu_window,_i18n.getMessage("context_menu_batch_download_image"));
			button_config.onclick = function(){
				click("batchDownloadImage");
			};

			// 一括ダウンロード（ユーザー）
			var button_config = new UI_LineButton(_menu_window,_i18n.getMessage("context_menu_batch_download_user"));
			button_config.onclick = function(){
				click("batchDownloadUser");
			};

			new UI_Separator(_menu_window);

			// 掲示板ボードを開く
			var button_open_bbs_board = new UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_open_bbs_board"));
			button_open_bbs_board.onclick = function(){
				click("openBbsBoard");
			};

			new UI_Separator(_menu_window);

			// 現在のページの設定を編集
			var button_config = new UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_config_current_page"));
			button_config.onclick = function(){
				click("configCurrentPage");
			};

			// 掲示板拡張の設定
			if(project.getEnableExpandBbs()){
				var button_config = new UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_config_current_bbs"));
				button_config.onclick = function(){
					click("configCurrentBbs");
				};
			}

			new UI_Separator(_menu_window);

			// PageExpand の開始
			if(!(project.getEnableStartup())){
				var button_start_pageexpand = new UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_start"));
				button_start_pageexpand.onclick = function(){
					click("startPageExpand");
				};
			}

			// PageExpand の中止
			var button_abort_pageexpand = new UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_abort"));
			button_abort_pageexpand.onclick = function(){
				click("abortPageExpand");
			};

			// PageExpand の最速実行
			var button_execute_pageexpand_fastest = new UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_execute_fastest"));
			button_execute_pageexpand_fastest.onclick = function(){
				click("executeFastest");
			};

			// PageExpand デバッグ
			var button_execute_debug = new UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_debug"));
			button_execute_debug.onclick = function(){
				click("executeDebug");
			};
		}

		// --------------------------------------------------------------------------------
		// プライベート変数
		// --------------------------------------------------------------------------------
		var _i18n;

		// --------------------------------------------------------------------------------
		// 初期化
		// --------------------------------------------------------------------------------
		(function(){

			// プロジェクト読み込み
			projectLoad(function(e){

				// ロケール
				_i18n = new InternationalMessage(page_expand_project.getLanguage());

				initialize();

			});

		})();
	}


	// --------------------------------------------------------------------------------
	// 初期化
	// --------------------------------------------------------------------------------
	switch(page_expand_arguments.execute_type){

	// --------------------------------------------------------------------------------
	// Opera のポップアップとして動作
	// --------------------------------------------------------------------------------
	case "OperaExtensionPopup":

		// Opera拡張機能通信
		extension_message = new OperaExtensionMessageForContent();

		new PageExpandPopupMenu();
		break;
	};

}
