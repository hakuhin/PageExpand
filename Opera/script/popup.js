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
//				ElementSetStyle(_item,"font-size:12px; color:#000; margin:0px 0px 2px; padding:2px 20px; border-radius:5px; box-shadow:0px 0px 2px #888;");
				ElementSetStyle(_item,"display:block; text-decoration: none; font-size:13px; color:#000; margin:0px 0px 2px; padding:4px 20px; border-radius:5px;");
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
			ElementSetStyle(body,'background-color:#ccc; font-family:"Meiryo"; margin:0px; padding:0px; width:300px; border:0px solid #000;');

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

			// PageExpand の実行
			if(!(project.getEnableStartup())){
				var button_execute_pageexpand = new UI_LineButton(_menu_window,_i18n.getMessage("context_menu_pageexpand_execute"));
				button_execute_pageexpand.onclick = function(){
					click("executePageExpand");
				};
			}

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
