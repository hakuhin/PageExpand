// --------------------------------------------------------------------------------
// PageExpand
//
// Hakuhin 2010-2013  http://hakuhin.jp
// --------------------------------------------------------------------------------


// --------------------------------------------------------------------------------
// PageExpand クラス
// --------------------------------------------------------------------------------
function PageExpand(execute_type){

	// --------------------------------------------------------------------------------
	// ポップアップメニュー
	// --------------------------------------------------------------------------------
	function PageExpandPopupMenu(){
		var _container = new Object();

		// --------------------------------------------------------------------------------
		// リロード
		// --------------------------------------------------------------------------------
		_container.reload = function (){
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
					project.importObject(ObjectCopy(page_expand_project.getProject(url)));
					func(e);
				});
			});
		}

		// --------------------------------------------------------------------------------
		// クリック（内部用）
		// --------------------------------------------------------------------------------
		function click(command){
			switch(command){
			case "configCurrentPage":
				extension_message.sendRequest(JsonStringify({command: "configCurrentPage"}),function(response){});
				break;
			case "configCurrentBbs":
				extension_message.sendRequest(JsonStringify({command: "configCurrentBbs"}),function(response){});
				break;
			case "executePageExpand":
				extension_message.sendRequest(JsonStringify({command: "executePageExpand"}),function(response){});
				break;
			case "executeDebug":
				extension_message.sendRequest(JsonStringify({command: "executeDebug"}),function(response){});
				break;
			}
		}

		// --------------------------------------------------------------------------------
		// アクティブページのURLを取得（内部用）
		// --------------------------------------------------------------------------------
		function getActiveURL(func){
			extension_message.sendRequest(JsonStringify({command: "getActiveURL"}),function(response){
				func(response);
			});
		}

		// --------------------------------------------------------------------------------
		// ラインボタン（内部用）
		// --------------------------------------------------------------------------------
		function UI_LineButton(parent,label){
			var _container = new Object();

			// --------------------------------------------------------------------------------
			// 通常状態（内部用）
			// --------------------------------------------------------------------------------
			function normal(){
				_style.color = "#222";
				_style.marginLeft = _style.marginRight = "1px";
				_style.background = "#f8f8f8";
			}

			// --------------------------------------------------------------------------------
			// マウスオーバー状態（内部用）
			// --------------------------------------------------------------------------------
			function mouse_over(){
				_style.color = "#000";
				_style.marginLeft = _style.marginRight = "0px";
				_style.background = "#fff";
			}

			// --------------------------------------------------------------------------------
			// マウスオーバー状態（内部用）
			// --------------------------------------------------------------------------------
			function mouse_down(){
				_style.color = "#fff";
				_style.marginLeft = _style.marginRight = "0px";
				_style.background = "#888";
			}

			// --------------------------------------------------------------------------------
			// クリックイベント
			// --------------------------------------------------------------------------------
			_container.onclick = function(){};

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
				_style = _item.style;
				ElementSetStyle(_item,"font-size:13px; color:#000; margin:0px 0px 4px; padding:10px 20px; border-radius:5px; -webkit-border-radius:5px; -moz-border-radius:5px; -webkit-box-shadow:0px 0px 2px #888; -moz-box-shadow:0px 0px 2px #888; box-shadow:0px 0px 2px #888;");
				ElementSetTextContent(_item,label);
				parent.appendChild(_item);

				_item.onclick = function(){
					_container.onclick();
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

			return _container;
		}

		// --------------------------------------------------------------------------------
		// 初期化（内部用）
		// --------------------------------------------------------------------------------
		function initialize(){

			// タイトル
			document.title = _i18n.getMessage("page_expand_popup_menu");

			// ボディ
			var body = document.body;
			ElementSetStyle(body,'background-color:#CCC; font-family:"メイリオ"; margin:0px; padding:0px; width:300px;');

			// ヘッダ
			var head_window = DocumentCreateElement("div");
			ElementSetStyle(head_window,"background-color:#000; color:#fff; font-size:12px; font-weight:bold; padding:2px 5px; margin:0px 0px 20px;");
			ElementSetTextContent(head_window,_i18n.getMessage("page_expand_popup_menu"));
			body.appendChild(head_window);

			// 外周
			var out_window = DocumentCreateElement("div");
			ElementSetStyle(out_window,"margin:0px 5px 0px 5px;");
			body.appendChild(out_window);

			// 外周
			var out_table = DocumentCreateElement("div");
			ElementSetStyle(out_table,"width:100%; display:table;");
			out_window.appendChild(out_table);

			// メニュー部
			var _menu_window = DocumentCreateElement("div");
			ElementSetStyle(_menu_window,"display:table-cell; vertical-align:top; user-select:none; -webkit-user-select:none; -moz-user-select:none; -khtml-user-select:none; margin:0px;");
			out_table.appendChild(_menu_window);

			// PageExpand の設定
			var button_config = UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_config_current_page"));
			button_config.onclick = function(){
				click("configCurrentPage");
			};

			// 掲示板拡張の設定
			if(project.getEnableExpandBbs()){
				var button_config = UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_config_current_bbs"));
				button_config.onclick = function(){
					click("configCurrentBbs");
				};
			}

			// PageExpand の実行
			if(!(project.getEnableStartup())){
				var button_execute_pageexpand = UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_execute"));
				button_execute_pageexpand.onclick = function(){
					click("executePageExpand");
				};
			}

			// PageExpand デバッグ
			var button_execute_debug = UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_debug"));
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

		return _container;
	}


	// --------------------------------------------------------------------------------
	// 初期化
	// --------------------------------------------------------------------------------
	switch(execute_type){

	// --------------------------------------------------------------------------------
	// Opera のポップアップとして動作
	// --------------------------------------------------------------------------------
	case "OperaExtensionPopup":

		// Opera拡張機能通信
		extension_message = new OperaExtensionMessageForContent();

		PageExpandPopupMenu();
		break;
	};

}
