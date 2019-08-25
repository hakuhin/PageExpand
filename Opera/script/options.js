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
	// PageExpand コンフィグ
	// --------------------------------------------------------------------------------
	function PageExpandConfig(){

		var _config = new Object();

		// --------------------------------------------------------------------------------
		// メニューアイテム
		// --------------------------------------------------------------------------------
		function MenuItemCreate(label,id){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 通常状態
			// --------------------------------------------------------------------------------
			_this.normal = function(){
				_item.onmouseout = _this.normal;
				_item.onmouseover = _this.over;
				_item.onmousedown = click;
				_style.fontSize = "12px";
				_style.width = "230px";
				_style.boxShadow = "";
				_style.padding = "5px 10px 5px 0px";
				_style.marginTop = "0px";
				_style.marginBottom = "1px";

				_brightness = 0.75;
				updateBackgroundColor();
			};

			// --------------------------------------------------------------------------------
			// マウスオーバー状態
			// --------------------------------------------------------------------------------
			_this.over = function(){
				_this.normal();
				_style.width = "240px";

				_brightness = 0.9375;
				updateBackgroundColor();
			};

			// --------------------------------------------------------------------------------
			// 選択状態
			// --------------------------------------------------------------------------------
			_this.active = function(){
				_item.onmouseover = null;
				_item.onmouseout = null;
				_item.onmousedown = null;
				_style.fontSize = "16px";
				_style.width = "250px";
				_style.padding = "14px 5px 14px 0px";
				_style.marginTop = "2px";
				_style.marginBottom = "3px";

				var brightness = 0.25;
				var r = (_color >> 16) & 0xFF;
				var g = (_color >>  8) & 0xFF;
				var b = (_color >>  0) & 0xFF;
				r = Math.floor(r * brightness);
				g = Math.floor(g * brightness);
				b = Math.floor(b * brightness);
				_style.boxShadow = "0px 1px 2px #" + r.toString(16) + g.toString(16) + b.toString(16);

				var brightness = 1.0;
				var r = (_color >> 16) & 0xFF;
				var g = (_color >>  8) & 0xFF;
				var b = (_color >>  0) & 0xFF;
				r = Math.floor(r * brightness);
				g = Math.floor(g * brightness);
				b = Math.floor(b * brightness);
				var liner_gradient = "linear-gradient(left, #" + r.toString(16) + g.toString(16) + b.toString(16) + " 25px, #ffffff 25px)";
				_style.background = "#FFF";
				_style.backgroundImage = liner_gradient;
				var none = {"none":1,"initial":1};
				if(none[_style.backgroundImage]) _style.backgroundImage = "-webkit-" + liner_gradient;
				if(none[_style.backgroundImage]) _style.backgroundImage = "-moz-" + liner_gradient;
				if(none[_style.backgroundImage]) _style.backgroundImage = "-ms-" + liner_gradient;
				if(none[_style.backgroundImage]) _style.backgroundImage = "-o-" + liner_gradient;

				_brightness = 1.0;
			};

			// --------------------------------------------------------------------------------
			// サポート状態をセット
			// --------------------------------------------------------------------------------
			_this.setSupport = function(type){
				if(type)	_item.style.color = "#000";
				else		_item.style.color = "#888";
			};

			// --------------------------------------------------------------------------------
			// 背景カラーをセット
			// --------------------------------------------------------------------------------
			_this.setBackgroundColor = function(argb){
				_color = argb;
				updateBackgroundColor();
			};

			// --------------------------------------------------------------------------------
			// 背景カラー更新
			// --------------------------------------------------------------------------------
			function updateBackgroundColor(){
				var r = (_color >> 16) & 0xFF;
				var g = (_color >>  8) & 0xFF;
				var b = (_color >>  0) & 0xFF;
				r = Math.floor(r * _brightness);
				g = Math.floor(g * _brightness);
				b = Math.floor(b * _brightness);
				_style.background = "#" + r.toString(16) + g.toString(16) + b.toString(16);
			}

			// --------------------------------------------------------------------------------
			// クリック時のイベント
			// --------------------------------------------------------------------------------
			function click(){
				_config.pushHistory(id);
				_config.MenuItemSelect(id);
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _item;
			var _style;
			var _color;
			var _brightness;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			_item = DocumentCreateElement("a");
			_item.href = "";
			_item.onclick = function(){ return false; };
			ElementSetStyle(_item,"display:block; width:250px; text-decoration:none; text-align:right; margin:0px 0px 2px auto; line-height:1.0; border-radius:5px 0px 0px 5px;");
			_style = _item.style;
			ElementSetTextContent(_item,label);
			_menu_window.appendChild(_item);

			_color = 0xFFFFFFFF;
			_brightness = 1.0;
			updateBackgroundColor();
		}

		// --------------------------------------------------------------------------------
		// 履歴を作成
		// --------------------------------------------------------------------------------
		_config.pushHistory = function(id){

			// 履歴更新
			var index = _history_state.index;
			_history_state.scroll_pos = WindowGetScrollPosition(window);
			history.replaceState({ index:index , menu:_history_state.selected_menu }, "", "");

			// 履歴作成
			index += 1;
			_history_state_list[index] = _history_state = { index:index , selected_menu:id };
			history.pushState({ index:index , menu:id }, "", "");
		};

		// --------------------------------------------------------------------------------
		// メニューアイテム選択
		// --------------------------------------------------------------------------------
		_config.MenuItemSelect = function(id){
			var param = _menu_item_param[id];

			var i;
			var num = _menu_items.length;
			var item;
			for(i=0;i<num;i++){
				// すべて未選択
				item = _menu_items[i];
				item.normal();
			}

			item = _menu_items[id];
			item.active();

			ContentClear();
			_history_state.selected_menu = id;

			if(param.callback){
				return (new param.callback());
			}

			return null;
		};

		// --------------------------------------------------------------------------------
		// コンテンツクリア
		// --------------------------------------------------------------------------------
		function ContentClear(){
			// エレメントを全てクリア
			var child_nodes = _content_window.childNodes;
			var i;
			var num = child_nodes.length;
			for(i=num-1;i >= 0;i--){
			var node = child_nodes[i];
				DomNodeRemove(node);
			}
			WindowSetScrollPositionY (window,0);
		}

		// --------------------------------------------------------------------------------
		// 基本設定
		// --------------------------------------------------------------------------------
		function ContentSettingStandard(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _combo_box_filter_url;
			var _text_area_filter_url;
			var _check_box_enable_icon_address_bar;
			var _check_box_enable_context_menu;
			var _check_box_enable_startup;
			var _check_box_enable_debug_mode;
			var _check_box_enable_output_log;
			var _check_box_enable_input_touch;
			var _check_box_enable_double_touch_assist;
			var _stepper_execute_queue_time_occupancy;
			var _stepper_execute_queue_sleep_time;
			var _button_storage_sync_load;
			var _button_storage_sync_save;
			var _button_storage_sync_delete;
			var _button_export;
			var _button_import;
			var _button_reset;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var standard = page_expand_project.getObject().standard;

				// タイトル
				var title = new UI_Title(_content_window,_i18n.getMessage("menu_setting_standard"));

				// 動作を制限する
				var container = new UI_LineContainer(_content_window,_i18n.getMessage("menu_setting_standard_filter_url"));
				var parent = container.getElement();
				_combo_box_filter_url = new UI_ComboBox(parent);
				_combo_box_filter_url.attachItem(_i18n.getMessage("menu_setting_standard_filter_url_combo_box_item_deny"),"deny");
				_combo_box_filter_url.attachItem(_i18n.getMessage("menu_setting_standard_filter_url_combo_box_item_allow"),"allow");
				_combo_box_filter_url.onchange = function(v){
					standard.filter_type = v;
					filterTypeUpdate();
					projectModify();
				};
				_text_area_filter_url = new UI_TextArea(parent);
				_text_area_filter_url.oninput = function(v){
					var filter = _text_area_filter_url.spiritByLine();
					switch(standard.filter_type){
					case "deny":
						standard.filter_deny = filter;
						break;
					default:
						standard.filter_allow = filter;
						break;
					}
					projectModify();
				};
				new UI_TextHint(parent,_i18n.getMessage("menu_setting_standard_filter_url_hint"));

				// 基本設定
				var container = new UI_InlineContainer(_content_window,_i18n.getMessage("menu_setting_standard_check_box_container"));
				container.setWidth(400);
				var parent = container.getElement();

				// アドレスバーアイコンが有効であるか
				_check_box_enable_icon_address_bar = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_standard_enable_icon_address_bar"));
				_check_box_enable_icon_address_bar.onchange = function(v){
					standard.enable_icon_address_bar = v;
					projectModify();
				};

				// コンテキストメニューが有効か
				_check_box_enable_context_menu = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_standard_enable_context_menu"));
				_check_box_enable_context_menu.onchange = function(v){
					standard.enable_context_menu = v;
					projectModify();
				};

				// ロード完了時から動作を開始するか
				_check_box_enable_startup = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_standard_enable_startup"));
				_check_box_enable_startup.onchange = function(v){
					standard.enable_startup = v;
					projectModify();
				};

				// デバッグモードが有効であるか
				_check_box_enable_debug_mode = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_standard_enable_debug_mode"));
				_check_box_enable_debug_mode.onchange = function(v){
					standard.enable_debug_mode = v;
					projectModify();
				};

				// ログ出力が有効であるか
				_check_box_enable_output_log = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_standard_enable_output_log"));
				_check_box_enable_output_log.onchange = function(v){
					standard.enable_output_log = v;
					projectModify();
				};

				// タッチ操作設定
				var container = new UI_InlineContainer(_content_window,_i18n.getMessage("menu_setting_standard_touch"));
				container.setWidth(400);
				var parent = container.getElement();

				// タッチ操作を有効
				_check_box_enable_input_touch = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_standard_enable_input_touch"));
				_check_box_enable_input_touch.onchange = function(v){
					standard.enable_input_touch = v;
					projectModify();
				};

				// ダブルタッチ補助線を表示
				_check_box_enable_double_touch_assist = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_standard_enable_double_touch_assist"));
				_check_box_enable_double_touch_assist.onchange = function(v){
					standard.enable_double_touch_assist = v;
					projectModify();
				};

				// 実行キュー設定
				var container = new UI_LineContainer(_content_window,_i18n.getMessage("menu_setting_standard_execute_queue"));
				var parent = container.getElement();

				// 最大CPU占有時間
				var parent = container.getElement();
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_standard_execute_queue_time_occupancy"));
				_stepper_execute_queue_time_occupancy = new UI_NumericStepper(parent);
				_stepper_execute_queue_time_occupancy.setMinimum(0);
				_stepper_execute_queue_time_occupancy.setMaximum(5000);
				_stepper_execute_queue_time_occupancy.oninput = function(v){
					standard.execute_queue.time_occupancy = v;
					projectModify();
				};
				new UI_BreakItem(parent);

				// スリープ時間
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_standard_execute_queue_time_sleep"));
				_stepper_execute_queue_sleep_time = new UI_NumericStepper(parent);
				_stepper_execute_queue_sleep_time.setMinimum(0);
				_stepper_execute_queue_sleep_time.setMaximum(1000);
				_stepper_execute_queue_sleep_time.oninput = function(v){
					standard.execute_queue.time_sleep = v;
					projectModify();
				};
				new UI_TextHint(parent,_i18n.getMessage("menu_setting_standard_execute_queue_hint"));


				// 設定のエクスポート / インポート
				var container = new UI_LineContainer(_content_window,_i18n.getMessage("menu_setting_standard_export_import"));
				var parent = container.getElement();

				// エクスポート
				_button_export = new UI_InlineButton(parent,_i18n.getMessage("menu_setting_standard_export_button"));
				_button_export.onclick = function(){

					// モーダルダイアログ作成
					var dialog = new UI_ModalDialog(_content_window);
					var dialog_parent = dialog.getElement();

					// タイトル
					var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_standard_export_dialog"));

					var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_standard_export_dialog_export"));
					var parent = container.getElement();

					var text_area = new UI_TextArea(parent);

					new UI_TextHint(parent,_i18n.getMessage("menu_setting_standard_export_dialog_export_hint"));

					// Ok ボタン
					var yes_no_button = new UI_OkButton(dialog_parent);
					yes_no_button.setEnable(false);
					yes_no_button.onclick = function(v){
						// ダイアログ終了
						dialog.close();
					};

					projectSave(function(e){
						var export_obj = page_expand_project.exportObject();
						// プリセットを除去
						export_obj = PageExpandProjectObjectRemovePreset(export_obj);
						export_obj.setting_export = {
							type:"setting"
						};
						text_area.setValue(JsonStringify(export_obj));
						yes_no_button.setEnable(true);
					});

					// ダイアログ開始
					dialog.open();
				};

				// インポート
				_button_import = new UI_InlineButton(parent,_i18n.getMessage("menu_setting_standard_import_button"));
				_button_import.onclick = function(){

					// モーダルダイアログ作成
					var dialog = new UI_ModalDialog(_content_window);
					var dialog_parent = dialog.getElement();

					// タイトル
					var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_standard_import_dialog"));

					// 名前
					var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_standard_import_dialog_explanation"));
					var parent = container.getElement();
					var unordered_list = new UI_UnorderedList(parent);
					unordered_list.addListItem(_i18n.getMessage("menu_setting_standard_import_dialog_explanation_0"));
					unordered_list.addListItem(_i18n.getMessage("menu_setting_standard_import_dialog_explanation_1"));
					unordered_list.addListItem(_i18n.getMessage("menu_setting_standard_import_dialog_explanation_2"));

					var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_standard_import_dialog_import"));
					var parent = container.getElement();

					var text_area_import = new UI_TextArea(parent);

					new UI_TextHint(parent,_i18n.getMessage("menu_setting_standard_import_dialog_import_hint"));

					// 実行しますか？
					var container = new UI_LineContainer(dialog_parent,null);
					var parent = container.getElement();
					new UI_Text(parent,_i18n.getMessage("menu_setting_standard_import_dialog_confirm"));

					// Yes No ボタン
					var yes_no_button = new UI_YesNoButton(dialog_parent);
					yes_no_button.onclick = function(v){

						if(!v){
							// ダイアログ終了
							dialog.close();
							return;
						}

						function ImportFailure(message){
							// 結果を表示
							var alert_dialog = new UI_AlertDialog(dialog_parent,_i18n.getMessage("menu_setting_standard_import_alert"));
							new UI_Text(alert_dialog.getElement(),_i18n.getMessage("menu_setting_standard_import_alert_failure"));
							new UI_Text(alert_dialog.getElement(),message);
							alert_dialog.oncomplete = function(){
								// ダイアログ終了
								dialog.close();
							};
							alert_dialog.open();
						}

						try{
							var proj_obj = page_expand_project.getObject();
							var proj_new = new PageExpandProject();
							var import_obj = JsonParse(text_area_import.getValue());

							// バージョンが一致しない
							if(import_obj.version > proj_obj.version){
								throw "Error: It is a version not supported.";
							}

							// 出力タイプチェック
							var error = true;
							try{
								// v1.0.3 以前
								if(!(import_obj.setting_export)){
									error = false;
								}else{
									switch(import_obj.setting_export.type){
									case "setting":
										error = false;
										break;
									}
								}
							}catch(e){}

							if(error){
								throw "Error: It is a type not supported.";
							}

							delete import_obj.setting_export;

							// プリセットを付加
							import_obj = PageExpandProjectObjectAppendPreset(import_obj);

							proj_new.importObject(import_obj);
							page_expand_project = proj_new;
							projectSave(function(e){
								if(!e.result){
									ImportFailure(e.message);
									return;
								}

								text_area_import.setValue("");

								// 結果を表示
								var alert_dialog = new UI_AlertDialog(dialog_parent,_i18n.getMessage("menu_setting_standard_import_alert"));
								new UI_Text(alert_dialog.getElement(),_i18n.getMessage("menu_setting_standard_import_alert_success"));
								alert_dialog.oncomplete = function(){

									// フェードアウト完了後
									dialog.oncomplete = function(){

										// PageExpandConfig を再構築
										initialize();

										// 基本設定を選択
										_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_STANDARD);

									};

									// ダイアログ終了
									dialog.close();
								};
								alert_dialog.open();
							});

						}catch(e){
							ImportFailure(e);
						}
					};

					// ダイアログ開始
					dialog.open();
				};


				// 設定の初期化
				var container = new UI_LineContainer(_content_window,_i18n.getMessage("menu_setting_standard_reset"));
				var parent = container.getElement();
				_button_reset = new UI_LineButton(parent,_i18n.getMessage("menu_setting_standard_reset_button"));
				_button_reset.onclick = function(){
					// モーダルダイアログ作成
					var dialog = new UI_ModalDialog(_content_window);
					var dialog_parent = dialog.getElement();

					// タイトル
					var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_standard_reset_dialog"));

					// 名前
					var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_standard_reset_dialog_explanation"));
					var parent = container.getElement();
					var unordered_list = new UI_UnorderedList(parent);
					unordered_list.addListItem(_i18n.getMessage("menu_setting_standard_reset_dialog_explanation_0"));
					unordered_list.addListItem(_i18n.getMessage("menu_setting_standard_reset_dialog_explanation_1"));
					new UI_Text(parent,_i18n.getMessage("menu_setting_standard_reset_dialog_confirm"));

					// Yes No ボタン
					var yes_no_button = new UI_YesNoButton(dialog_parent);
					yes_no_button.onclick = function(v){

						if(!v){
							// ダイアログ終了
							dialog.close();
							return;
						}

						function LocalStorageDeleteFailure(message){
							// 結果を表示
							var alert_dialog = new UI_AlertDialog(dialog_parent,_i18n.getMessage("menu_setting_standard_reset_alert"));
							new UI_Text(alert_dialog.getElement(),_i18n.getMessage("menu_setting_standard_reset_alert_failure"));
							new UI_Text(alert_dialog.getElement(),message);
							alert_dialog.oncomplete = function(){
								// ダイアログ終了
								dialog.close();
							};
							alert_dialog.open();
						}

						try{
							// プロジェクトを破棄
							projectDelete(function(result){

								page_expand_project = new PageExpandProject();
								page_expand_project.initialize();
								projectSave(function(e){
									if(!e.result){
										LocalStorageDeleteFailure(e.message);
										return;
									}

									// 結果を表示
									var alert_dialog = new UI_AlertDialog(dialog_parent,_i18n.getMessage("menu_setting_standard_reset_alert"));
									new UI_Text(alert_dialog.getElement(),_i18n.getMessage("menu_setting_standard_reset_alert_success"));
									alert_dialog.oncomplete = function(){

										// フェードアウト完了後
										dialog.oncomplete = function(){

											// PageExpandConfig を再構築
											initialize();

											// 基本設定を選択
											_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_STANDARD);

										};

										// ダイアログ終了
										dialog.close();
									};
									alert_dialog.open();
								});
							});

						}catch(e){
							LocalStorageDeleteFailure(e);
						}
					};

					// ダイアログ開始
					dialog.open();
				};

				// フィルタタイプ
				_combo_box_filter_url.setValue( standard.filter_type);
				function filterTypeUpdate(){
					switch(standard.filter_type){
					case "deny":
						_text_area_filter_url.joinArray(standard.filter_deny,"\n");
						break;
					default:
						_text_area_filter_url.joinArray(standard.filter_allow,"\n");
						break;
					}
				}
				filterTypeUpdate();

				// アドレスバーアイコンが有効であるか
				_check_box_enable_icon_address_bar.setValue(standard.enable_icon_address_bar);

				// コンテキストメニューが有効か
				_check_box_enable_context_menu.setValue(standard.enable_context_menu);

				// ロード完了時から動作を開始するか
				_check_box_enable_startup.setValue(standard.enable_startup);

				// デバッグモードが有効であるか
				_check_box_enable_debug_mode.setValue(standard.enable_debug_mode);

				// ログ出力が有効であるか
				_check_box_enable_output_log.setValue(standard.enable_output_log);

				// タッチ操作が有効であるか
				_check_box_enable_input_touch.setValue(standard.enable_input_touch);

				// ダブルタッチ操作補助線を表示するか
				_check_box_enable_double_touch_assist.setValue(standard.enable_double_touch_assist);

				// 最大CPU占有時間
				_stepper_execute_queue_time_occupancy.setValue(standard.execute_queue.time_occupancy);

				// スリープ時間
				_stepper_execute_queue_sleep_time.setValue(standard.execute_queue.time_sleep);

			})();
		}

		// --------------------------------------------------------------------------------
		// ダウンロード設定
		// --------------------------------------------------------------------------------
		function ContentSettingDownload(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _stepper_load_thread_max;
			var _stepper_load_timeout;
			var _stepper_download_thread_max;
			var _combo_box_conflict_type;			
			var _form_container_download_save_file_simple;
			var _form_container_download_save_file_detail;
			var _combo_box_download_save_file_type;
			var _combo_box_download_save_file_simple;
			var _text_input_download_save_file_detail;
			var _form_container_batch_download_save_file_simple;
			var _form_container_batch_download_save_file_detail;
			var _combo_box_batch_download_save_file_type;
			var _combo_box_batch_download_save_file_simple;
			var _text_input_batch_download_save_file_detail;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var download = page_expand_project.getObject().download;

				// タイトル
				var title = new UI_Title(_content_window,_i18n.getMessage("menu_setting_download"));

				// ロード設定
				var title = new UI_TitleSub(_content_window,_i18n.getMessage("menu_setting_download_load"));

				// グループ
				var group = new UI_GroupContainer(_content_window);
				var group_parent = group.getElement();

				// 最大同時ロード数
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_download_load_thread_max"));
				var parent = container.getElement();
				_stepper_load_thread_max = new UI_NumericStepper(parent);
				_stepper_load_thread_max.setMinimum(1);
				_stepper_load_thread_max.setMaximum(99999);
				_stepper_load_thread_max.oninput = function(v){
					download.load.thread_max = v;
					projectModify();
				};

				// タイムアウト
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_download_load_timeout"));
				var parent = container.getElement();
				_stepper_load_timeout = new UI_NumericStepper(parent);
				_stepper_load_timeout.setMinimum(0);
				_stepper_load_timeout.setMaximum(1000 * 60 * 10);
				_stepper_load_timeout.oninput = function(v){
					download.load.timeout = v;
					projectModify();
				};
				new UI_TextHint(parent,_i18n.getMessage("menu_setting_download_load_timeout_hint"));
				new UI_Break(_content_window);

				// ダウンロード設定
				var title = new UI_TitleSub(_content_window,_i18n.getMessage("menu_setting_download_download"));

				// グループ
				var group = new UI_GroupContainer(_content_window);
				var group_parent = group.getElement();

				// 最大同時ダウンロード数
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_download_download_thread_max"));
				var parent = container.getElement();
				_stepper_download_thread_max = new UI_NumericStepper(parent);
				_stepper_download_thread_max.setMinimum(1);
				_stepper_download_thread_max.setMaximum(99999);
				_stepper_download_thread_max.oninput = function(v){
					download.download.thread_max = v;
					projectModify();
				};

				// 保存先の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_download_download_save_file"));
				var parent = container.getElement();

				_combo_box_download_save_file_type = new UI_ComboBox(parent);
				_combo_box_download_save_file_type.attachItem(_i18n.getMessage("menu_setting_download_download_save_file_combo_box_item_simple"),"simple");
				_combo_box_download_save_file_type.attachItem(_i18n.getMessage("menu_setting_download_download_save_file_combo_box_item_detail"),"detail");
				_combo_box_download_save_file_type.onchange = function(v){
					download.download.save_file.type = v;
					autoDownloadUpdateSaveFile(true);
					projectModify();
				};
				new UI_BreakItem(parent);

				// フィルタ更新
				function autoDownloadUpdateSaveFile(update){
					var detail = Boolean(download.download.save_file.type === "detail");
					if(detail && update){
						var save_file_detail = "PageExpand/" + ProjectDownloadSaveFile_DetailFromSimple(download.download.save_file.simple);
						_text_input_download_save_file_detail.setValue(save_file_detail);
						download.download.save_file.detail = save_file_detail;
					}
					_form_container_download_save_file_simple.setVisible(!detail);
					_form_container_download_save_file_detail.setVisible(detail);
				}

				_form_container_download_save_file_simple = new UI_FormContainer(parent);
				_form_container_download_save_file_simple.setVisible(true);
				var form_parent_download_simple = _form_container_download_save_file_simple.getElement();

				// 保存先を選択
				new UI_TitleItem(form_parent_download_simple,_i18n.getMessage("menu_setting_download_download_save_file_simple"));
				_combo_box_download_save_file_simple = new UI_ComboBox(form_parent_download_simple);
				_combo_box_download_save_file_simple.attachItem("PageExpand / <url>","url");
				_combo_box_download_save_file_simple.attachItem("PageExpand / <kebab-url>","kebab_url");
				_combo_box_download_save_file_simple.attachItem("PageExpand / <filename>","filename");
				_combo_box_download_save_file_simple.attachItem("PageExpand / <domain> - <filename>","domain");
				_combo_box_download_save_file_simple.attachItem("PageExpand / <year> <month> <day> / <filename>","date");
				_combo_box_download_save_file_simple.onchange = function(v){
					download.download.save_file.simple = v;
					projectModify();
				};
				new UI_BreakItem(form_parent_download_simple);

				_form_container_download_save_file_detail = new UI_FormContainer(parent);
				_form_container_download_save_file_detail.setVisible(false);
				var form_parent_download_detail = _form_container_download_save_file_detail.getElement();

				// 保存先を編集
				new UI_TitleItem(form_parent_download_detail,_i18n.getMessage("menu_setting_download_download_save_file_detail"));
				_text_input_download_save_file_detail = new UI_TextInput(form_parent_download_detail);
				_text_input_download_save_file_detail.oninput = function(v){
					download.download.save_file.detail = v;
					projectModify();
				};
				new UI_BreakItem(form_parent_download_detail);

				function downloadInsertSaveFileVariable(parent){
					new UI_TitleItem(parent,_i18n.getMessage("menu_setting_download_download_save_file_variable"));
					new UI_TextItem(parent,"<url> <kebab-url> <origin> <domain> <filename> <name> <ext> <query> <fragment>");
					new UI_TextItem(parent,"<year> <month> <day> <hour> <minute> <second> <millisecond> <unixtime>");				
				}
				downloadInsertSaveFileVariable(form_parent_download_detail);

				// ファイル名衝突時の処理
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_download_download_conflict_type"));
				var parent = container.getElement();
				_combo_box_conflict_type = new UI_ComboBox(parent);
				_combo_box_conflict_type.attachItem(_i18n.getMessage("menu_setting_download_download_conflict_type_combo_box_item_rename"),"rename");
				_combo_box_conflict_type.attachItem(_i18n.getMessage("menu_setting_download_download_conflict_type_combo_box_item_overwrite"),"overwrite");
				_combo_box_conflict_type.onchange = function(v){
					download.download.conflict_type = v;
					projectModify();
				};

				new UI_Break(_content_window);


				// 一括ダウンロード設定
				var title = new UI_TitleSub(_content_window,_i18n.getMessage("menu_setting_download_batch_download"));

				// グループ
				var group = new UI_GroupContainer(_content_window);
				var group_parent = group.getElement();

				// 保存先の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_download_download_save_file"));
				var parent = container.getElement();

				_combo_box_batch_download_save_file_type = new UI_ComboBox(parent);
				_combo_box_batch_download_save_file_type.attachItem(_i18n.getMessage("menu_setting_download_download_save_file_combo_box_item_simple"),"simple");
				_combo_box_batch_download_save_file_type.attachItem(_i18n.getMessage("menu_setting_download_download_save_file_combo_box_item_detail"),"detail");
				_combo_box_batch_download_save_file_type.onchange = function(v){
					download.batch_download.save_file.type = v;
					batchDownloadUpdateSaveFile(true);
					projectModify();
				};
				new UI_BreakItem(parent);

				// フィルタ更新
				function batchDownloadUpdateSaveFile(update){
					var detail = Boolean(download.batch_download.save_file.type === "detail");
					if(detail && update){
						var save_file_detail = ProjectDownloadSaveFile_DetailFromSimple(download.batch_download.save_file.simple);
						_text_input_batch_download_save_file_detail.setValue(save_file_detail);
						download.batch_download.save_file.detail = save_file_detail;
					}
					_form_container_batch_download_save_file_simple.setVisible(!detail);
					_form_container_batch_download_save_file_detail.setVisible(detail);
				}

				_form_container_batch_download_save_file_simple = new UI_FormContainer(parent);
				_form_container_batch_download_save_file_simple.setVisible(true);
				var form_parent_batch_download_simple = _form_container_batch_download_save_file_simple.getElement();

				// 保存先を選択
				new UI_TitleItem(form_parent_batch_download_simple,_i18n.getMessage("menu_setting_download_download_save_file_simple"));
				_combo_box_batch_download_save_file_simple = new UI_ComboBox(form_parent_batch_download_simple);
				_combo_box_batch_download_save_file_simple.attachItem("<url>","url");
				_combo_box_batch_download_save_file_simple.attachItem("<kebab-url>","kebab_url");
				_combo_box_batch_download_save_file_simple.attachItem("<filename>","filename");
				_combo_box_batch_download_save_file_simple.attachItem("<domain> - <filename>","domain");
				_combo_box_batch_download_save_file_simple.attachItem("<year> <month> <day> / <filename>","date");
				_combo_box_batch_download_save_file_simple.onchange = function(v){
					download.batch_download.save_file.simple = v;
					projectModify();
				};
				new UI_BreakItem(form_parent_batch_download_simple);

				_form_container_batch_download_save_file_detail = new UI_FormContainer(parent);
				_form_container_batch_download_save_file_detail.setVisible(false);
				var form_parent_batch_download_detail = _form_container_batch_download_save_file_detail.getElement();

				// 保存先を編集
				new UI_TitleItem(form_parent_batch_download_detail,_i18n.getMessage("menu_setting_download_download_save_file_detail"));
				_text_input_batch_download_save_file_detail = new UI_TextInput(form_parent_batch_download_detail);
				_text_input_batch_download_save_file_detail.oninput = function(v){
					download.batch_download.save_file.detail = v;
					projectModify();
				};
				new UI_BreakItem(form_parent_batch_download_detail);

				downloadInsertSaveFileVariable(form_parent_batch_download_detail);

				new UI_Break(_content_window);


				// 最大同時ロード数
				_stepper_load_thread_max.setValue(download.load.thread_max);
				// タイムアウト
				_stepper_load_timeout.setValue(download.load.timeout);
				// 最大同時ダウンロード数
				_stepper_download_thread_max.setValue(download.download.thread_max);
				// ファイル名衝突時の処理
				_combo_box_conflict_type.setValue(download.download.conflict_type);
				// 設定タイプ
				_combo_box_download_save_file_type.setValue(download.download.save_file.type);
				// 保存先を選択
				_combo_box_download_save_file_simple.setValue(download.download.save_file.simple);
				// 保存先を編集
				_text_input_download_save_file_detail.setValue(download.download.save_file.detail);	
				// 設定タイプ
				_combo_box_batch_download_save_file_type.setValue(download.batch_download.save_file.type);
				// 保存先を選択
				_combo_box_batch_download_save_file_simple.setValue(download.batch_download.save_file.simple);
				// 保存先を編集
				_text_input_batch_download_save_file_detail.setValue(download.batch_download.save_file.detail);
				
				autoDownloadUpdateSaveFile(false);
				batchDownloadUpdateSaveFile(false);
			})();
		}

		// --------------------------------------------------------------------------------
		// スレッド掲示板拡張設定
		// --------------------------------------------------------------------------------
		function ContentSettingExpandBbs(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// URLからリストを選択
			// --------------------------------------------------------------------------------
			_this.selectFromURL = function(url){
				var expand_bbs = page_expand_project.getObject().expand_bbs;
				var i;
				var j;
				var num = expand_bbs.length;
				for(i=0;i<num;i++){
					var c = ProjectObjectGetActiveData(expand_bbs[i]);
					if(!c)	continue;

					// アドレスチェック
					switch(c.filter.type){
					case "asterisk":
						var filter = c.filter.asterisk.filter;
						var filter_num = filter.length;
						for(j=0;j<filter_num;j++){
							if(StringUrlMatchAsteriskWord(url,filter[j])){
								_expand_bbs_list.select(i);
								_expand_bbs_list.replaceHistory();
								return;
							}
						}
						break;
					case "regexp":
						var filter = c.filter.regexp.filter;
						var filter_num = filter.length;
						for(j=0;j<filter_num;j++){
							var regexp = RegExpObjectGetRegExp(filter[j]);
							if(regexp){
								if(StringUrlMatchRegExpList(url,[regexp])){
									_expand_bbs_list.select(i);
									_expand_bbs_list.replaceHistory();
									return;
								}
							}
						}
						break;
					}
				}
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_expand_bbs_list.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_expand_bbs_list.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// 選択（内部用）
			// --------------------------------------------------------------------------------
			function select(id){
				var proj = page_expand_project.getObject();
				var expand_bbs = proj.expand_bbs;
				var c = ProjectObjectGetActiveData(expand_bbs[id]);
				if(!c)	return;

				_text_input_name.setValue(LocaleObjectGetString(c.name));
				_check_box_enable_expand_bbs.setValue(c.enable);
				_form_container_enable.setVisible(c.enable);
				_url_edit_container.attachObject(c.filter);
				_script_obj_editer_initialize.setScriptObject(c.script_initialize);
				_check_box_popup_enable_animation.setValue(c.popup.enable_animation);
				_combo_box_popup_origin_type.setValue(c.popup.origin_type);
				_combo_box_popup_position_type.setValue(c.popup.position_type);
				_stepper_popup_percent_h.setValue(c.popup.percent.x);
				_stepper_popup_percent_v.setValue(c.popup.percent.y);
				_stepper_popup_time_wait_open.setValue(c.popup.time_wait_open);
				_stepper_popup_time_wait_close.setValue(c.popup.time_wait_close);
				_text_input_popup_style_sheet.setValue(c.popup.style_sheet);
				_script_obj_editer_callback.setScriptObject(c.script_callback);
			}

			// --------------------------------------------------------------------------------
			// 選択しているURLマッピングオブジェクトを取得（内部用）
			// --------------------------------------------------------------------------------
			function getSelectedExpandBbs(func){
				var expand_bbs = page_expand_project.getObject().expand_bbs;
				var c;
				var p;
				var a = _expand_bbs_list.getSelectedIndices();
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					p = null;
					c = expand_bbs[a[i]];
					if(c.user){
						p = c.user;
					}else{
						if(c.preset){
							// プリセットを昇格
							p = c.user = ObjectCopy(c.preset);
						}
					}
					if(p)	func(p);
				}
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _expand_bbs_list;
			var _form_container;
			var _form_container_enable;
			var _text_input_name;
			var _check_box_enable_expand_bbs;
			var _url_edit_container;
			var _script_obj_editer_initialize;
			var _check_box_popup_enable_animation;
			var _combo_box_popup_origin_type;
			var _combo_box_popup_position_type;
			var _stepper_popup_percent_h;
			var _stepper_popup_percent_v;
			var _stepper_popup_time_wait_open;
			var _stepper_popup_time_wait_close;
			var _text_input_popup_style_sheet;
			var _script_obj_editer_callback;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var expand_bbs = page_expand_project.getObject().expand_bbs;

				// タイトル
				var title = new UI_Title(_content_window,_i18n.getMessage("menu_setting_expand_bbs"));

				// 掲示板拡張設定一覧
				var container = new UI_LineContainer(_content_window,_i18n.getMessage("menu_setting_expand_bbs_list"));
				var parent = container.getElement();
				_expand_bbs_list = new UI_ExpandBbsList(parent);
				_expand_bbs_list.attachExpandBbsData(expand_bbs);
				_expand_bbs_list.onselect = function(id){
					if(id < 0 || expand_bbs.length <= id){
						_form_container.setVisible(false);
					}else{
						_form_container.setVisible(true);
						select(id);
					}
				};
				_expand_bbs_list.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_EXPAND_BBS);
				};

				// フォームコンテナ
				_form_container = new UI_FormContainer(_content_window);
				var form_parent = _form_container.getElement();
				_form_container.setVisible(false);

				// 名前
				var container = new UI_LineContainer(form_parent,_i18n.getMessage("menu_setting_expand_bbs_name"));
				var parent = container.getElement();
				_text_input_name = new UI_TextInput(parent);
				_text_input_name.oninput = function(v){
					getSelectedExpandBbs(function(c){
						LocaleObjectSetString(c.name,v);
					});
					_expand_bbs_list.update();
					projectModify();
				};

				// 掲示板拡張設定
				var container = new UI_LineContainer(form_parent,_i18n.getMessage("menu_setting_expand_bbs_check_box_container"));
				var parent = container.getElement();

				// 有効であるか
				_check_box_enable_expand_bbs = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_bbs_enable_setting"));
				_check_box_enable_expand_bbs.onchange = function(v){
					getSelectedExpandBbs(function(c){
						c.enable = v;
					});
					_form_container_enable.setVisible(v);
					_expand_bbs_list.update();
					projectModify();
				};

				_form_container_enable = new UI_FormContainer(form_parent);
				_form_container_enable.setVisible(false);
				var form_parent_enable = _form_container_enable.getElement();

				// 動作URLの設定
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_expand_bbs_filter_url"));
				var parent = container.getElement();
				_url_edit_container = new UI_UrlEditContainer(parent);
				_url_edit_container.onchange = function(v){
					getSelectedExpandBbs(function(c){
						c.filter = ObjectCopy(v);
					});
					_expand_bbs_list.update();
					projectModify();
				};

				// ポップアップの設定
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_expand_bbs_popup_check_box_container"));
				var parent = container.getElement();

				// ポップアップ時のアニメーション動作を有効
				_check_box_popup_enable_animation = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_bbs_popup_enable_animation"));
				_check_box_popup_enable_animation.onchange = function(v){
					getSelectedExpandBbs(function(c){
						c.popup.enable_animation = v;
					});
					_expand_bbs_list.update();
					projectModify();
				};

				// ポップアップの配置基点
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_expand_bbs_popup_origin_type"));
				var parent = container.getElement();
				_combo_box_popup_origin_type = new UI_ComboBox(parent);
				_combo_box_popup_origin_type.attachItem(_i18n.getMessage("menu_setting_expand_bbs_popup_origin_type_combo_box_item_adsorb_top_bottom"),"adsorb_top_bottom");
				_combo_box_popup_origin_type.attachItem(_i18n.getMessage("menu_setting_expand_bbs_popup_origin_type_combo_box_item_adsorb_left_right"),"adsorb_left_right");
				_combo_box_popup_origin_type.onchange = function(v){
					getSelectedExpandBbs(function(c){
						c.popup.origin_type = v;
					});
					_expand_bbs_list.update();
					projectModify();
				};

				// ポップアップの配置位置
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_expand_bbs_popup_position_type"));
				var parent = container.getElement();
				_combo_box_popup_position_type = new UI_ComboBox(parent);
				_combo_box_popup_position_type.attachItem(_i18n.getMessage("menu_setting_expand_bbs_popup_position_type_combo_box_item_absolute"),"absolute");
				_combo_box_popup_position_type.attachItem(_i18n.getMessage("menu_setting_expand_bbs_popup_position_type_combo_box_item_fixed"),"fixed");
				_combo_box_popup_position_type.onchange = function(v){
					getSelectedExpandBbs(function(c){
						c.popup.position_type = v;
					});
					_expand_bbs_list.update();
					projectModify();
				};

				// ポップアップサイズ
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_expand_bbs_popup_percent"));
				var parent = container.getElement();
				// 横方向パーセント (0～100)
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_expand_bbs_popup_percent_h"));
				_stepper_popup_percent_h = new UI_NumericStepper(parent);
				_stepper_popup_percent_h.setMinimum(0);
				_stepper_popup_percent_h.setMaximum(100);
				_stepper_popup_percent_h.oninput = function(v){
					getSelectedExpandBbs(function(c){
						c.popup.percent.x = v;
					});
					_expand_bbs_list.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				// 縦方向パーセント (0～100)
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_expand_bbs_popup_percent_v"));
				_stepper_popup_percent_v = new UI_NumericStepper(parent);
				_stepper_popup_percent_v.setMinimum(0);
				_stepper_popup_percent_v.setMaximum(100);
				_stepper_popup_percent_v.oninput = function(v){
					getSelectedExpandBbs(function(c){
						c.popup.percent.y = v;
					});
					_expand_bbs_list.update();
					projectModify();
				};

				// ポップアップ時間
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_expand_bbs_popup_time"));
				var parent = container.getElement();
				// 開くまでに待機する時間（ミリ秒）
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_expand_bbs_popup_time_wait_open"));
				_stepper_popup_time_wait_open = new UI_NumericStepper(parent);
				_stepper_popup_time_wait_open.setMinimum(0);
				_stepper_popup_time_wait_open.setMaximum(9999999);
				_stepper_popup_time_wait_open.oninput = function(v){
					getSelectedExpandBbs(function(c){
						c.popup.time_wait_open = v;
					});
					_expand_bbs_list.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				// 閉じるまでに待機する時間（ミリ秒）
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_expand_bbs_popup_time_wait_close"));
				_stepper_popup_time_wait_close = new UI_NumericStepper(parent);
				_stepper_popup_time_wait_close.setMinimum(0);
				_stepper_popup_time_wait_close.setMaximum(9999999);
				_stepper_popup_time_wait_close.oninput = function(v){
					getSelectedExpandBbs(function(c){
						c.popup.time_wait_close = v;
					});
					_expand_bbs_list.update();
					projectModify();
				};

				// ポップアップのスタイル
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_expand_bbs_popup_style_sheet"));
				var parent = container.getElement();
				_text_input_popup_style_sheet = new UI_TextInput(parent);
				_text_input_popup_style_sheet.oninput = function(v){
					getSelectedExpandBbs(function(c){
						c.popup.style_sheet = v;
					});
					_expand_bbs_list.update();
					projectModify();
				};

				// 初期化スクリプト
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_expand_bbs_script_initialize"));
				var parent = container.getElement();
				_script_obj_editer_initialize = new UI_ScriptObjectEditer(parent);
				_script_obj_editer_initialize.onchange = function(v){
					getSelectedExpandBbs(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.script_initialize , v);
					});
					_expand_bbs_list.update();
					projectModify();
				};

				// コールバックスクリプト
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_expand_bbs_script_callback"));
				var parent = container.getElement();
				_script_obj_editer_callback = new UI_ScriptObjectEditer(parent);
				_script_obj_editer_callback.onchange = function(v){
					getSelectedExpandBbs(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.script_callback , v);
					});
					_expand_bbs_list.update();
					projectModify();
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// URLマッピング設定
		// --------------------------------------------------------------------------------
		function ContentSettingUrlMap(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// URLからリストを選択
			// --------------------------------------------------------------------------------
			_this.selectFromURL = function(url){
				var urlmap = page_expand_project.getObject().urlmap;
				var i;
				var j;
				var num = urlmap.length;
				for(i=0;i<num;i++){
					var c = ProjectObjectGetActiveData(urlmap[i]);
					if(!c)	continue;

					// アドレスチェック
					switch(c.filter.type){
					case "asterisk":
						var filter = c.filter.asterisk.filter;
						var filter_num = filter.length;
						for(j=0;j<filter_num;j++){
							if(StringUrlMatchAsteriskWord(url,filter[j])){
								_urlmap_list.select(i);
								_urlmap_list.replaceHistory();
								return;
							}
						}
						break;
					case "regexp":
						var filter = c.filter.regexp.filter;
						var filter_num = filter.length;
						for(j=0;j<filter_num;j++){
							var regexp = RegExpObjectGetRegExp(filter[j]);
							if(regexp){
								if(StringUrlMatchRegExpList(url,[regexp])){
									_urlmap_list.select(i);
									_urlmap_list.replaceHistory();
									return;
								}
							}
						}
						break;
					}
				}
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_urlmap_list.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_urlmap_list.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// 選択（内部用）
			// --------------------------------------------------------------------------------
			function select(id){
				var proj = page_expand_project.getObject();
				var urlmap = proj.urlmap;
				var c = ProjectObjectGetActiveData(urlmap[id]);
				if(!c)	return;

				// 名前
				_text_input_name.setValue(LocaleObjectGetString(c.name));

				// 有効
				_check_box_enable_urlmap.setValue(c.enable);
				_form_container_enable.setVisible(c.enable);

				// フィルタ
				_url_edit_container.attachObject(c.filter);

				// セキュリティ
				_check_box_enable_unsecure.setValue(c.enable_unsecure);
				_check_box_enable_mixed_content.setValue(c.enable_mixed_content);

				// 定義
				var i;
				var num = _ui_define.length;
				for(i=0;i<num;i++){
					var param = _ui_define_select_params[i];
					switch(param.select){
					case "single":
						var combo_box = _ui_define[i];
						var define = c[param.asset];
						if(define.enable){
							combo_box.setValue(define.id);
						}else{
							combo_box.setValue("");
						}
						break;
					case "multiple":
						var multi_list = _ui_define[i];
						// フィルタ
						var ary = new Array();
						var indices = _urlmap_list.getSelectedIndices();
						for(var p in indices){
							ary.push(urlmap[indices[p]]);
						}
						multi_list.attachUrlMaps(ary,urlmap[id]);
						break;
					}
				}

			}

			// --------------------------------------------------------------------------------
			// 選択しているURLマッピングオブジェクトを取得（内部用）
			// --------------------------------------------------------------------------------
			function getSelectedUrlMaps(func){
				var urlmap = page_expand_project.getObject().urlmap;
				var c;
				var p;
				var a = _urlmap_list.getSelectedIndices();
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					p = null;
					c = urlmap[a[i]];
					if(c.user){
						p = c.user;
					}else{
						if(c.preset){
							// プリセットを昇格
							p = c.user = ObjectCopy(c.preset);
						}
					}
					if(p)	func(p);
				}
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _urlmap_list;
			var _form_container;
			var _form_container_enable;
			var _text_input_name;
			var _check_box_enable_urlmap;
			var _url_edit_container;
			var _check_box_enable_unsecure;
			var _check_box_enable_mixed_content;
			var _ui_define;
			var _ui_define_select_params = [
				{asset:"access_block",type:PageExpandConfig.MENU_TYPE_SETTING_ACCESS_BLOCK,select:"multiple" },
				{asset:"replacement_to_referer",type:PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_REFERER,select:"multiple" },
				{asset:"replacement_to_useragent",type:PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_USERAGENT,select:"multiple" },
				{asset:"replacement_to_element",type:PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_ELEMENT,select:"multiple" },
				{asset:"replacement_to_text",type:PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_TEXT,select:"multiple" },
				{asset:"replacement_to_anchor",type:PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_ANCHOR,select:"multiple" },
				{asset:"replacement_to_link",type:PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_LINK,select:"multiple" },
				{asset:"make_link_to_text",type:PageExpandConfig.MENU_TYPE_SETTING_MAKE_LINK_TO_TEXT,select:"single" },
				{asset:"expand_short_url",type:PageExpandConfig.MENU_TYPE_SETTING_EXPAND_SHORT_URL,select:"single" },
				{asset:"expand_text",type:PageExpandConfig.MENU_TYPE_SETTING_EXPAND_TEXT,select:"single" },
				{asset:"expand_image",type:PageExpandConfig.MENU_TYPE_SETTING_EXPAND_IMAGE,select:"single" },
				{asset:"expand_sound",type:PageExpandConfig.MENU_TYPE_SETTING_EXPAND_SOUND,select:"single" },
				{asset:"expand_video",type:PageExpandConfig.MENU_TYPE_SETTING_EXPAND_VIDEO,select:"single" },
				{asset:"expand_iframe",type:PageExpandConfig.MENU_TYPE_SETTING_EXPAND_IFRAME,select:"single" },
				{asset:"style_sheet",type:PageExpandConfig.MENU_TYPE_SETTING_STYLE_SHEET,select:"single" },
				{asset:"experimental",type:PageExpandConfig.MENU_TYPE_SETTING_EXPERIMENTAL,select:"single" }
			];

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var proj = page_expand_project.getObject();
				var urlmap = proj.urlmap;

				// タイトル
				var title = new UI_Title(_content_window,_i18n.getMessage("menu_setting_urlmap"));

				// URLマッピング設定一覧
				var container = new UI_LineContainer(_content_window,_i18n.getMessage("menu_setting_urlmap_list"));
				var parent = container.getElement();
				_urlmap_list = new UI_UrlMapList(parent);
				_urlmap_list.attachUrlMapData(urlmap);
				_urlmap_list.onselect = function(id){
					if(id < 0 || urlmap.length <= id){
						_form_container.setVisible(false);
					}else{
						_form_container.setVisible(true);
						select(id);
					}
				};

				// フォームコンテナ
				_form_container = new UI_FormContainer(_content_window);
				var form_parent = _form_container.getElement();
				_form_container.setVisible(false);

				// URLマッピング設定名
				var container = new UI_LineContainer(form_parent,_i18n.getMessage("menu_setting_urlmap_name"));
				var parent = container.getElement();
				_text_input_name = new UI_TextInput(parent);
				_text_input_name.oninput = function(v){
					getSelectedUrlMaps(function(c){
						LocaleObjectSetString(c.name,v);
					});
					_urlmap_list.update();
					projectModify();
				};

				// URLマッピング設定
				var container = new UI_LineContainer(form_parent,_i18n.getMessage("menu_setting_urlmap_check_box_container"));
				var parent = container.getElement();

				// 有効であるか
				_check_box_enable_urlmap = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_urlmap_enable_setting"));
				_check_box_enable_urlmap.onchange = function(v){
					getSelectedUrlMaps(function(c){
						c.enable = v;
					});
					_form_container_enable.setVisible(v);
					_urlmap_list.update();
					projectModify();
				};

				_form_container_enable = new UI_FormContainer(form_parent);
				_form_container_enable.setVisible(false);
				var form_parent_enable = _form_container_enable.getElement();

				// 動作 URL
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_urlmap_filter_url"));
				var parent = container.getElement();
				_url_edit_container = new UI_UrlEditContainer(parent);
				_url_edit_container.onchange = function(v){
					getSelectedUrlMaps(function(c){
						c.filter = ObjectCopy(v);
					});
					_urlmap_list.update();
					projectModify();
				};

				// セキュリティ
				var container = new UI_LineContainer(form_parent_enable,_i18n.getMessage("menu_setting_urlmap_unsecure_check_box_container"));
				var parent = container.getElement();

				// アンセキュア
				_check_box_enable_unsecure = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_urlmap_enable_unsecure"));
				_check_box_enable_unsecure.onchange = function(v){
					getSelectedUrlMaps(function(c){
						c.enable_unsecure = v;
					});
					_urlmap_list.update();
					projectModify();
				};
				new UI_TextHint(parent,_i18n.getMessage("menu_setting_urlmap_enable_unsecure_hint"));
				new UI_BreakItem(parent);

				// 混在コンテンツ
				_check_box_enable_mixed_content = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_urlmap_enable_mixed_content"));
				_check_box_enable_mixed_content.onchange = function(v){
					getSelectedUrlMaps(function(c){
						c.enable_mixed_content = v;
					});
					_urlmap_list.update();
					projectModify();
				};
				new UI_TextHint(parent,_i18n.getMessage("menu_setting_urlmap_enable_mixed_content_hint"));

				// 定義
				_ui_define = new Array();
				var i;
				var num = _ui_define_select_params.length;
				for(i=0;i<num;i++){
					(function(){
						var param = _ui_define_select_params[i];
						var type = param.type;
						var asset = param.asset;

						// 各定義
						var container = new UI_InlineContainer(form_parent_enable,_i18n.getMessage("menu_setting_" + param.asset));
						container.setWidth(280);
						var parent = container.getElement();
						
						if(!_menu_support_param[type].urlmap){
							container.setAlpha(0.5);
						}
						container.setBackgroundColor(_menu_item_param[type].bgcolor);

						switch(param.select){
						case "single":
							var combo_box = new UI_ComboBoxButton(parent,_i18n.getMessage("menu_setting_urlmap_define_button_edit"));
							_ui_define.push(combo_box);

							// 定義リストを登録
							(function(){
								var define = proj[param.asset];
								var i=0;
								var num = define.length;
								for(i=0;i<num;i++){
									var d = define[i];
									var c = ProjectObjectGetActiveData(d);
									combo_box.attachItem(LocaleObjectGetString(c.name),d.id);
								}
								combo_box.attachItem(_i18n.getMessage("menu_setting_urlmap_define_combo_box_item_no_use"),"");
							})();

							// コンボボックス変更
							combo_box.onchange = function(v){
								getSelectedUrlMaps(function(c){
									var define = c[asset];
									if(v){
										define.enable = true;
										define.id = v;
									}else{
										define.enable = false;
										define.id = "";
									}
								});
								_urlmap_list.update();
								projectModify();
							};

							// ボタン押下
							combo_box.onclick = function(){
								_config.pushHistory(type);
								var content = _config.MenuItemSelect(type);
								content.select(combo_box.getSelectedIndex());
								content.replaceHistory();
							};
							break;
						case "multiple":
							var multi_list = new UI_DefineMultiSelectList(parent);
							_ui_define.push(multi_list);

							multi_list.setAsset(param.asset);
							multi_list.setMenuId(type);
							multi_list.setDefineData(proj[param.asset]);
							multi_list.onchange = function(){
								_urlmap_list.update();
							};
							break;
						}
					})();
				}
			})();
		}

		// --------------------------------------------------------------------------------
		// 定義関連のクラス
		// --------------------------------------------------------------------------------
		function ContentSettingDefine(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_define_list.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_define_list.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_define_list.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// 選択（内部用 ）
			// --------------------------------------------------------------------------------
			function select(id){
				var c = ProjectObjectGetActiveData(_define[id]);
				if(!c)	return;

				// ワイルドカード
				if(_define[id].id == "wildcard"){
					_wildcard_container.setVisible(true);
				}else{
					_wildcard_container.setVisible(false);
				}

				// 名前
				_text_input_name.setValue(LocaleObjectGetString(c.name));

				_this.onselect(id);
			}

			// --------------------------------------------------------------------------------
			// 更新
			// --------------------------------------------------------------------------------
			_this.update = function(){
				_define_list.update();
			};

			// --------------------------------------------------------------------------------
			// 選択イベント
			// --------------------------------------------------------------------------------
			_this.onselect = function(){};

			// --------------------------------------------------------------------------------
			// リロードイベント
			// --------------------------------------------------------------------------------
			_this.onreload = function(){};

			// --------------------------------------------------------------------------------
			// データを関連付け
			// --------------------------------------------------------------------------------
			_this.attachDefineData = function(data){
				_define = data;

				// リスト選択時
				_define_list.onselect = function(id){
					if(id < 0 || _define.length <= id){
						_form_container_inner.setVisible(false);
						_form_container_outer.setVisible(false);
					}else{
						_form_container_inner.setVisible(true);
						_form_container_outer.setVisible(true);
						select(id);
					}
				};

				// 定義リスト
				_define_list.attachDefineData(_define);
			};

			// --------------------------------------------------------------------------------
			// 定義の識別名をセット
			// --------------------------------------------------------------------------------
			_this.setDefineAssetName = function(asset){
				_define_list.setDefineAssetName(asset);
			};

			// --------------------------------------------------------------------------------
			// タイトルをセット
			// --------------------------------------------------------------------------------
			_this.setTitle = function(v){
				_title.setValue(v);
			};

			// --------------------------------------------------------------------------------
			// 新規データ作成用関数をセット
			// --------------------------------------------------------------------------------
			_this.setFunctionForNewData = function(f){
				_define_list.setFunctionForNewData(f);
			};

			// --------------------------------------------------------------------------------
			// フォームエレメントを取得
			// --------------------------------------------------------------------------------
			_this.getElementForm = function(){
				return _form_container_outer.getElement();
			};

			// --------------------------------------------------------------------------------
			// 選択している定義オブジェクトを取得
			// --------------------------------------------------------------------------------
			_this.getSelectedDefinitions = function(func){
				var c;
				var p;
				var a = _define_list.getSelectedIndices();
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					p = null;
					c = _define[a[i]];
					if(c.user){
						p = c.user;
					}else{
						if(c.preset){
							// プリセットを昇格
							p = c.user = ObjectCopy(c.preset);
						}
					}
					if(p)	func(p);
				}
			};

			// --------------------------------------------------------------------------------
			// 選択しているアイテムを取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndex = function(){
				return _define_list.getSelectedIndex();
			};

			// --------------------------------------------------------------------------------
			// 選択されたアイテムをすべて取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndices = function(){
				return ObjectCopy(_define_list.getSelectedIndices());
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _title;
			var _form_container_inner;
			var _form_container_outer;
			var _wildcard_container;
			var _text_input_name;
			var _define_list;
			var _define;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_title = new UI_Title(_content_window,"");

				// グループ
				var group = new UI_GroupContainer(_content_window);
				var group_parent = group.getElement();

				// 定義一覧
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_define_list"));
				var parent = container.getElement();
				_define_list = new UI_DefineList(parent);
				_define_list.onreload = function(){
					_this.onreload();
				};

				// フォームコンテナ
				_form_container_inner = new UI_FormContainer(group_parent);
				var form_parent = _form_container_inner.getElement();
				_form_container_inner.setVisible(false);

				// ワイルドカードについて
				_wildcard_container = new UI_FormContainer(form_parent);
				var wildcard_parent = _wildcard_container.getElement();
				_wildcard_container.setVisible(false);

				// ワイルドカードについて
				var container = new UI_LineContainer(wildcard_parent,_i18n.getMessage("menu_setting_define_wildcard_detail"));
				var parent = container.getElement();
				var unordered_list = new UI_UnorderedList(parent);
				unordered_list.addListItem(_i18n.getMessage("menu_setting_define_wildcard_detail_0"));
				unordered_list.addListItem(_i18n.getMessage("menu_setting_define_wildcard_detail_1"));
				unordered_list.addListItem(_i18n.getMessage("menu_setting_define_wildcard_detail_2"));

				// 定義名
				var container = new UI_LineContainer(form_parent,_i18n.getMessage("menu_setting_define_name"));
				var parent = container.getElement();
				_text_input_name = new UI_TextInput(parent);
				_text_input_name.oninput = function(v){
					_this.getSelectedDefinitions(function(c){
						LocaleObjectSetString(c.name,v);
					});
					_this.update();
					projectModify();
				};
				new UI_Break(_content_window);

				// フォームコンテナ
				_form_container_outer = new UI_FormContainer(_content_window);
				var form_parent = _form_container_outer.getElement();
				_form_container_outer.setVisible(false);
			})();
		}

		// --------------------------------------------------------------------------------
		// アクセス遮断の定義
		// --------------------------------------------------------------------------------
		function ContentSettingAccessBlock(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _url_edit_container;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().access_block;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_access_block"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// アクセス遮断 URL
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_access_block_filter_url"));
				var parent = container.getElement();
				_url_edit_container = new UI_UrlEditContainer(parent);
				_url_edit_container.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.filter = ObjectCopy(v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("access_block");
				_setting_define.setFunctionForNewData(createAccessBlockData);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// アクセス遮断 URL
					_url_edit_container.attachObject(c.filter);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_ACCESS_BLOCK);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// エレメントの置換定義
		// --------------------------------------------------------------------------------
		function ContentSettingReplacementToElement(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _script_obj_editer;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().replacement_to_element;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_replacement_to_element"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// コールバックスクリプト
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_element_script"));
				var parent = container.getElement();
				_script_obj_editer = new UI_ScriptObjectEditer(parent);
				_script_obj_editer.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.script , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("replacement_to_element");
				_setting_define.setFunctionForNewData(createReplacementToElementData);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// コールバックスクリプト
					_script_obj_editer.setScriptObject(c.script);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_ELEMENT);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// テキストの置換定義
		// --------------------------------------------------------------------------------
		function ContentSettingReplacementToText(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _script_obj_editer;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().replacement_to_text;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_replacement_to_text"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// コールバックスクリプト
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_text_script"));
				var parent = container.getElement();
				_script_obj_editer = new UI_ScriptObjectEditer(parent);
				_script_obj_editer.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.script , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("replacement_to_text");
				_setting_define.setFunctionForNewData(createReplacementToTextData);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// コールバックスクリプト
					_script_obj_editer.setScriptObject(c.script);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_TEXT);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// アンカー置換定義
		// --------------------------------------------------------------------------------
		function ContentSettingReplacementToAnchor(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _form_container;
			var _script_obj_editer_allow_url;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().replacement_to_anchor;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_replacement_to_anchor"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// コールバックスクリプト
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_anchor_script"));
				var parent = container.getElement();
				_script_obj_editer_allow_url = new UI_ScriptObjectEditer(parent);
				_script_obj_editer_allow_url.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.script , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("replacement_to_anchor");
				_setting_define.setFunctionForNewData(createReplacementToAnchorData);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// コールバックスクリプト
					_script_obj_editer_allow_url.setScriptObject(c.script);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_ANCHOR);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// ハイパーリンク置換定義
		// --------------------------------------------------------------------------------
		function ContentSettingReplacementToLink(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// リストからフィルタを選択
			// --------------------------------------------------------------------------------
			_this.selectFilterFromList = function(list){
				_filter_list.selectFromList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
				_filter_list.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _filter_list;
			var _text_input_name;
			var _url_edit_container;
			var _script_obj_editer;
			var _check_box_enable_reflect_to_anchor;
			var _check_box_enable_cache;
			var _form_container_filter_inner;
			var _form_container_filter_outer;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().replacement_to_link;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_replacement_to_link"));

				// フィルタ一覧
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_replacement_to_link_filter_list"));

				// フィルタ更新
				function filterListUpdate(id){
					var visible = false;
					var c = ProjectObjectGetActiveData(_filter_list.getDefinitionActive());
					if(c){
						var filter = c.filter;
						if(0 <= id && id < filter.length){
							var filter = filter[id];
							_text_input_name.setValue(LocaleObjectGetString(filter.name));
							_url_edit_container.attachObject(filter.filter);
							_script_obj_editer.setScriptObject(filter.script);
							_check_box_enable_reflect_to_anchor.setValue(filter.enable_reflect_to_anchor);
							_check_box_enable_cache.setValue(filter.enable_cache);

							visible = true;
						}
					}

					_form_container_filter_inner.setVisible(visible);
					_form_container_filter_outer.setVisible(visible);
				}

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// ファイルタリスト
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_link_filter_list"));
				var parent = container.getElement();
				_filter_list = new UI_FilterList(parent);
				_filter_list.onselect = function(id){
					filterListUpdate(id);
				};
				_filter_list.onchange = function(id){
					_setting_define.update();
				};

				_form_container_filter_inner = new UI_FormContainer(group_parent);
				_form_container_filter_inner.setVisible(false);
				var form_parent_filter = _form_container_filter_inner.getElement();

				// フィルタ名
				var container = new UI_LineContainer(form_parent_filter,_i18n.getMessage("menu_setting_replacement_to_link_filter_name"));
				var parent = container.getElement();
				_text_input_name = new UI_TextInput(parent);
				_text_input_name.oninput = function(v){
					_filter_list.writeFilters(function(c){
						LocaleObjectSetString(c.name,v);
					});
					_filter_list.update();
					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				_form_container_filter_outer = new UI_FormContainer(form_parent);
				_form_container_filter_outer.setVisible(false);
				var form_parent_filter = _form_container_filter_outer.getElement();

				// フィルタ設定
				var title = new UI_TitleSub(form_parent_filter,_i18n.getMessage("menu_setting_replacement_to_link_filter"));

				// グループ
				var group = new UI_GroupContainer(form_parent_filter);
				var group_parent = group.getElement();

				// 対象 URL
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_link_filter_filter_url"));
				var parent = container.getElement();
				_url_edit_container = new UI_UrlEditContainer(parent);
				_url_edit_container.onchange = function(v){
					_filter_list.writeFilters(function(c){
						c.filter = ObjectCopy(v);
					});
					_setting_define.update();
					projectModify();
				};

				// ハイパーリンクの設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_link_check_box_container"));
				var parent = container.getElement();

				//リンクの変更をアンカーに反映する
				_check_box_enable_reflect_to_anchor = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_replacement_to_link_enable_reflect_to_anchor"));
				_check_box_enable_reflect_to_anchor.onchange = function(v){
					_filter_list.writeFilters(function(c){
						c.enable_reflect_to_anchor = v;
					});

					_setting_define.update();
					projectModify();
				};

				//コールバックスクリプトの実行結果をキャッシュする
				_check_box_enable_cache = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_replacement_to_link_enable_cache"));
				_check_box_enable_cache.onchange = function(v){
					_filter_list.writeFilters(function(c){
						c.enable_cache = v;
					});

					_setting_define.update();
					projectModify();
				};
				

				// コールバックスクリプト
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_link_filter_script"));
				var parent = container.getElement();
				_script_obj_editer = new UI_ScriptObjectEditer(parent);
				_script_obj_editer.onchange = function(v){
					_filter_list.writeFilters(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.script , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent_filter);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("replacement_to_link");
				_setting_define.setFunctionForNewData(createReplacementToLinkData);
				_filter_list.setFunctionForNewDefineData(createReplacementToLinkData);
				_filter_list.setFunctionForNewFilterData(createReplacementToLinkFilterItemData);
				_filter_list.setDefineAssetName("replacement_to_link");

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// フィルタ
					var ary = new Array();
					var indices = _setting_define.getSelectedIndices();
					for(var p in indices){
						ary.push(define[indices[p]]);
					}
					_filter_list.attachDefinitions(ary,define[id]);

					// フィルタ選択
					filterListUpdate(-1);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_LINK);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// リファラ置換定義
		// --------------------------------------------------------------------------------
		function ContentSettingReplacementToReferer(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// リストからフィルタを選択
			// --------------------------------------------------------------------------------
			_this.selectFilterFromList = function(list){
				_filter_list.selectFromList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
				_filter_list.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _filter_list;
			var _text_input_name;
			var _url_edit_container;
			var _combo_box_send_type;
			var _text_input_send_custom;
			var _text_regexp_send_regexp;
			var _text_input_send_replacement;
			var _form_container_filter_inner;
			var _form_container_filter_outer;
			var _form_container_send_custom;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().replacement_to_referer;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_replacement_to_referer"));

				// フィルタ一覧
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_replacement_to_referer_filter_list"));

				// フィルタ更新
				function filterListUpdate(id){
					var visible = false;
					var c = ProjectObjectGetActiveData(_filter_list.getDefinitionActive());
					if(c){
						var filter = c.filter;
						if(0 <= id && id < filter.length){
							var filter = filter[id];
							_text_input_name.setValue(LocaleObjectGetString(filter.name));
							_url_edit_container.attachObject(filter.filter);
							_combo_box_send_type.setValue(filter.send_referer.type);
							_text_input_send_custom.setValue(filter.send_referer.custom);
							_text_regexp_send_regexp.setValue(filter.send_referer.regexp);
							_text_input_send_replacement.setValue(filter.send_referer.replacement);
							sendTypeUpdate();

							visible = true;
						}
					}

					_form_container_filter_inner.setVisible(visible);
					_form_container_filter_outer.setVisible(visible);
				}

				// 送信タイプ更新
				function sendTypeUpdate(){
					_form_container_send_custom.setVisible(_combo_box_send_type.getValue() == "custom");
				}

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// ファイルタリスト
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_referer_filter_list"));
				var parent = container.getElement();
				_filter_list = new UI_FilterList(parent);
				_filter_list.onselect = function(id){
					filterListUpdate(id);
				};
				_filter_list.onchange = function(id){
					_setting_define.update();
				};

				_form_container_filter_inner = new UI_FormContainer(group_parent);
				_form_container_filter_inner.setVisible(false);
				var form_parent_filter = _form_container_filter_inner.getElement();

				// フィルタ名
				var container = new UI_LineContainer(form_parent_filter,_i18n.getMessage("menu_setting_replacement_to_referer_filter_name"));
				var parent = container.getElement();
				_text_input_name = new UI_TextInput(parent);
				_text_input_name.oninput = function(v){
					_filter_list.writeFilters(function(c){
						LocaleObjectSetString(c.name,v);
					});
					_filter_list.update();
					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				_form_container_filter_outer = new UI_FormContainer(form_parent);
				_form_container_filter_outer.setVisible(false);
				var form_parent_filter = _form_container_filter_outer.getElement();

				// フィルタ設定
				var title = new UI_TitleSub(form_parent_filter,_i18n.getMessage("menu_setting_replacement_to_referer_filter"));

				// グループ
				var group = new UI_GroupContainer(form_parent_filter);
				var group_parent = group.getElement();

				// 対象 URL
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_referer_filter_filter_url"));
				var parent = container.getElement();
				_url_edit_container = new UI_UrlEditContainer(parent);
				_url_edit_container.onchange = function(v){
					_filter_list.writeFilters(function(c){
						c.filter = ObjectCopy(v);
					});
					_setting_define.update();
					projectModify();
				};

				// 基本送信データ
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_type"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_type_combo_box_item"));
				_combo_box_send_type = new UI_ComboBox(parent);
				_combo_box_send_type.attachItem(_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_type_combo_box_item_default"),"default");
				_combo_box_send_type.attachItem(_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_type_combo_box_item_current_url"),"current_url");
				_combo_box_send_type.attachItem(_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_type_combo_box_item_link_url"),"link_url");
				_combo_box_send_type.attachItem(_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_type_combo_box_item_custom"),"custom");
				_combo_box_send_type.onchange = function(v){
					_filter_list.writeFilters(function(c){
						c.send_referer.type = v;
					});
					_setting_define.update();
					projectModify();
					sendTypeUpdate();
				};

				_form_container_send_custom = new UI_FormContainer(parent);
				_form_container_send_custom.setVisible(false);
				var form_parent_send_custom = _form_container_send_custom.getElement();

				new UI_BreakItem(form_parent_send_custom);
				new UI_TitleItem(form_parent_send_custom,_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_custom"));
				_text_input_send_custom = new UI_TextInput(form_parent_send_custom);
				_text_input_send_custom.oninput = function(v){
					_filter_list.writeFilters(function(c){
						c.send_referer.custom = v;
					});
					_setting_define.update();
					projectModify();
				};

				// 基本送信データを正規表現で置換
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_regexp"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_regexp_match"));
				_text_regexp_send_regexp = new UI_TextRegExp(parent);
				_text_regexp_send_regexp.oninput = function(v){
					_filter_list.writeFilters(function(c){
						c.send_referer.regexp = ObjectCopy(v);
					});
					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_regexp_replacement"));
				_text_input_send_replacement = new UI_TextInput(parent);
				_text_input_send_replacement.oninput = function(v){
					_filter_list.writeFilters(function(c){
						c.send_referer.replacement = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_TextHint(parent,_i18n.getMessage("menu_setting_replacement_to_referer_filter_send_regexp_replacement_hint"));
				new UI_Break(form_parent_filter);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("replacement_to_referer");
				_setting_define.setFunctionForNewData(createReplacementToRefererData);
				_filter_list.setFunctionForNewDefineData(createReplacementToRefererData);
				_filter_list.setFunctionForNewFilterData(createReplacementToRefererFilterItemData);
				_filter_list.setDefineAssetName("replacement_to_referer");

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// フィルタ
					var ary = new Array();
					var indices = _setting_define.getSelectedIndices();
					for(var p in indices){
						ary.push(define[indices[p]]);
					}
					_filter_list.attachDefinitions(ary,define[id]);

					// フィルタ選択
					filterListUpdate(-1);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_REFERER);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// ユーザーエージェント置換定義
		// --------------------------------------------------------------------------------
		function ContentSettingReplacementToUserAgent(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// リストからフィルタを選択
			// --------------------------------------------------------------------------------
			_this.selectFilterFromList = function(list){
				_filter_list.selectFromList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
				_filter_list.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _filter_list;
			var _text_input_name;
			var _url_edit_container;
			var _text_input_send_custom;
			var _form_container_filter_inner;
			var _form_container_filter_outer;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().replacement_to_useragent;

				// フィルタ一覧
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_replacement_to_useragent_filter_list"));

				// フィルタ更新
				function filterListUpdate(id){
					var visible = false;
					var c = ProjectObjectGetActiveData(_filter_list.getDefinitionActive());
					if(c){
						var filter = c.filter;
						if(0 <= id && id < filter.length){
							var filter = filter[id];
							_text_input_name.setValue(LocaleObjectGetString(filter.name));
							_url_edit_container.attachObject(filter.filter);
							_text_input_send_custom.setValue(filter.send_useragent.custom);

							visible = true;
						}
					}

					_form_container_filter_inner.setVisible(visible);
					_form_container_filter_outer.setVisible(visible);
				}

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// ファイルタリスト
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_useragent_filter_list"));
				var parent = container.getElement();
				_filter_list = new UI_FilterList(parent);
				_filter_list.onselect = function(id){
					filterListUpdate(id);
				};
				_filter_list.onchange = function(id){
					_setting_define.update();
				};

				_form_container_filter_inner = new UI_FormContainer(group_parent);
				_form_container_filter_inner.setVisible(false);
				var form_parent_filter = _form_container_filter_inner.getElement();

				// フィルタ名
				var container = new UI_LineContainer(form_parent_filter,_i18n.getMessage("menu_setting_replacement_to_useragent_filter_name"));
				var parent = container.getElement();
				_text_input_name = new UI_TextInput(parent);
				_text_input_name.oninput = function(v){
					_filter_list.writeFilters(function(c){
						LocaleObjectSetString(c.name,v);
					});
					_filter_list.update();
					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				_form_container_filter_outer = new UI_FormContainer(form_parent);
				_form_container_filter_outer.setVisible(false);
				var form_parent_filter = _form_container_filter_outer.getElement();

				// フィルタ設定
				var title = new UI_TitleSub(form_parent_filter,_i18n.getMessage("menu_setting_replacement_to_useragent_filter"));

				// グループ
				var group = new UI_GroupContainer(form_parent_filter);
				var group_parent = group.getElement();

				// 対象 URL
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_useragent_filter_filter_url"));
				var parent = container.getElement();
				_url_edit_container = new UI_UrlEditContainer(parent);
				_url_edit_container.onchange = function(v){
					_filter_list.writeFilters(function(c){
						c.filter = ObjectCopy(v);
					});
					_setting_define.update();
					projectModify();
				};

				// 基本送信データ
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_replacement_to_useragent_filter_send"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_replacement_to_useragent_filter_send_custom"));
				_text_input_send_custom = new UI_TextInput(parent);
				_text_input_send_custom.oninput = function(v){
					_filter_list.writeFilters(function(c){
						c.send_useragent.custom = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent_filter);

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_replacement_to_useragent"));

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("replacement_to_useragent");
				_setting_define.setFunctionForNewData(createReplacementToUserAgentData);
				_filter_list.setFunctionForNewDefineData(createReplacementToUserAgentData);
				_filter_list.setFunctionForNewFilterData(createReplacementToUserAgentFilterItemData);
				_filter_list.setDefineAssetName("replacement_to_useragent");

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// フィルタ
					var ary = new Array();
					var indices = _setting_define.getSelectedIndices();
					for(var p in indices){
						ary.push(define[indices[p]]);
					}
					_filter_list.attachDefinitions(ary,define[id]);

					// フィルタ選択
					filterListUpdate(-1);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_USERAGENT);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// ハイパーリンク化定義
		// --------------------------------------------------------------------------------
		function ContentSettingMakeLinkToText(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _script_obj_editer;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().make_link_to_text;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_make_link_to_text"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// コールバックスクリプト
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_make_link_to_text_script"));
				var parent = container.getElement();
				_script_obj_editer = new UI_ScriptObjectEditer(parent);
				_script_obj_editer.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.script , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("make_link_to_text");
				_setting_define.setFunctionForNewData(createMakeLinkToTextData);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// コールバックスクリプト
					_script_obj_editer.setScriptObject(c.script);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_MAKE_LINK_TO_TEXT);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// 短縮 URL の展開の定義
		// --------------------------------------------------------------------------------
		function ContentSettingExpandShortUrl(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _form_container;
			var _url_edit_container;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().expand_short_url;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_expand_short_url"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// 対象 URL
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_short_url_filter_url"));
				var parent = container.getElement();
				_url_edit_container = new UI_UrlEditContainer(parent);
				_url_edit_container.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.filter = ObjectCopy(v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("expand_short_url");
				_setting_define.setFunctionForNewData(createExpandShortUrlData);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// 対象 URL
					_url_edit_container.attachObject(c.filter);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_EXPAND_SHORT_URL);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// テキストの展開の定義
		// --------------------------------------------------------------------------------
		function ContentSettingExpandText(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _form_container;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().expand_text;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_expand_text"));

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_text_inline"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// インライン表示の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_text_inline_check_box_container"));
				var parent = container.getElement();

				// 同じURLは展開しない
				var check_box_disable_same_text = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_text_inline_disable_same_text"));
				check_box_disable_same_text.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.inline.disable_same_text = v;
					});

					_setting_define.update();
					projectModify();
				};

				// リンクからインライン表示する条件
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_text_inline_script_allow"));
				var parent = container.getElement();
				var script_obj_editer_inline_script_allow = new UI_ScriptObjectEditer(parent);
				script_obj_editer_inline_script_allow.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.inline.script_allow , v);
					});

					_setting_define.update();
					projectModify();
				};

				// テキストの挿入位置
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_text_inline_script_insert"));
				var parent = container.getElement();
				var script_obj_editer_inline_script_insert = new UI_ScriptObjectEditer(parent);
				script_obj_editer_inline_script_insert.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.inline.script_insert , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("expand_text");
				_setting_define.setFunctionForNewData(createExpandText);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// 同じURLは展開しない
					check_box_disable_same_text.setValue(c.inline.disable_same_text);
					// リンクからインライン表示する条件
					script_obj_editer_inline_script_allow.setScriptObject(c.inline.script_allow);
					// テキストの挿入位置
					script_obj_editer_inline_script_insert.setScriptObject(c.inline.script_insert);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_EXPAND_TEXT);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// 画像の展開の定義
		// --------------------------------------------------------------------------------
		function ContentSettingExpandImage(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _form_container;
			var _form_container_thumbnail;
			var _form_container_popup;
			var _form_container_reduced_image;
			var _form_container_unload;
			var _selected_id;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().expand_image;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_expand_image"));

				// フォーム更新
				function formUpdate(){
					var c = ProjectObjectGetActiveData(define[_selected_id]);
					if(c){
						_form_container_thumbnail.setVisible(c.thumbnail.enable_thumbnail);
						_form_container_popup.setVisible((c.thumbnail.enable_thumbnail || c.popup.enable_popup_mouseover || c.reduced_image.enable_popup));
						_form_container_reduced_image.setVisible(c.reduced_image.enable_popup);
					}
				}

				// 縮小イメージ設定
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_image_reduced_image"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// 有効/無効
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_image_reduced_image_check_box_container"));
				var parent = container.getElement();

				// 縮小されたイメージをマウスオーバーするとポップアップ表示
				var check_box_reduced_image_enable_popup = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_image_popup_enable_popup"));
				check_box_reduced_image_enable_popup.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.reduced_image.enable_popup = v;
					});

					formUpdate();
					_setting_define.update();
					projectModify();
				};

				_form_container_reduced_image = new UI_FormContainer(group_parent);
				_form_container_reduced_image.setVisible(false);
				var form_parent_reduced_image = _form_container_reduced_image.getElement();


				// 縮小イメージのポップアップ化条件
				var container = new UI_LineContainer(form_parent_reduced_image,_i18n.getMessage("menu_setting_expand_image_reduced_image_allow_slcale_less_then"));
				var parent = container.getElement();

				// 縮小率
				var stepper_popup_allow_slcale_less_then = new UI_NumericStepper(parent);
				stepper_popup_allow_slcale_less_then.setMinimum(0);
				stepper_popup_allow_slcale_less_then.setMaximum(100);
				stepper_popup_allow_slcale_less_then.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.reduced_image.popup_allow_slcale_less_then = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_TextItem(parent,_i18n.getMessage("menu_setting_expand_image_reduced_image_allow_slcale_less_then_text"));
				new UI_Break(form_parent);

				// サムネイル表示設定
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_image_thumbnail"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// 有効/無効
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_image_thumbnail_enable_check_box_container"));
				var parent = container.getElement();

				// サムネイルを表示する
				var check_box_enable_thumbnail = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_image_thumbnail_enable_thumbnail"));
				check_box_enable_thumbnail.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.thumbnail.enable_thumbnail = v;
					});

					formUpdate();
					_setting_define.update();
					projectModify();
				};

				_form_container_thumbnail = new UI_FormContainer(group_parent);
				_form_container_thumbnail.setVisible(false);
				var form_parent_thumbnail = _form_container_thumbnail.getElement();

				// サムネイル表示設定
				var container = new UI_LineContainer(form_parent_thumbnail,_i18n.getMessage("menu_setting_expand_image_thumbnail_check_box_container"));
				var parent = container.getElement();

				// サムネイルにマウスオーバーするとポップアップ表示
				var check_box_enable_popup_mouseover = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_image_thumbnail_enable_popup_mouseover"));
				check_box_enable_popup_mouseover.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.thumbnail.enable_popup_mouseover = v;
					});

					_setting_define.update();
					projectModify();
				};

				// 同じイメージがすでに配置されている場合サムネイルを表示しない
				var check_box_disable_same_thumbnail_image = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_image_thumbnail_disable_same_thumbnail_image"));
				check_box_disable_same_thumbnail_image.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.thumbnail.disable_same_image = v;
					});

					_setting_define.update();
					projectModify();
				};

				// サムネイルの表示サイズ
				var container = new UI_LineContainer(form_parent_thumbnail,_i18n.getMessage("menu_setting_expand_image_thumbnail_size"));
				var parent = container.getElement();
				// 最小許容限界（ピクセル値）
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_expand_image_thumbnail_size_min"));
				var stepper_thumbnail_width_min = new UI_NumericStepper(parent);
				stepper_thumbnail_width_min.setMinimum(0);
				stepper_thumbnail_width_min.setMaximum(9999999);
				stepper_thumbnail_width_min.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.thumbnail.width_min = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				// 基本拡大率（パーセント）
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_expand_image_thumbnail_size_scale"));
				var stepper_thumbnail_scale_percent = new UI_NumericStepper(parent);
				stepper_thumbnail_scale_percent.setMinimum(0);
				stepper_thumbnail_scale_percent.setMaximum(9999999);
				stepper_thumbnail_scale_percent.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.thumbnail.scale_percent = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				// 最大許容限界（ピクセル値）
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_expand_image_thumbnail_size_max"));
				var stepper_thumbnail_width_max = new UI_NumericStepper(parent);
				stepper_thumbnail_width_max.setMinimum(0);
				stepper_thumbnail_width_max.setMaximum(9999999);
				stepper_thumbnail_width_max.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.thumbnail.width_max = v;
					});

					_setting_define.update();
					projectModify();
				};

				// イメージのロード設定
				var container = new UI_LineContainer(form_parent_thumbnail,_i18n.getMessage("menu_setting_expand_image_load_start_type"));
				var parent = container.getElement();
				var combo_box_thumbnail_load_type = new UI_ComboBox(parent);
				combo_box_thumbnail_load_type.attachItem(_i18n.getMessage("menu_setting_expand_image_load_start_type_preload"),"preload");
				combo_box_thumbnail_load_type.attachItem(_i18n.getMessage("menu_setting_expand_image_load_start_type_scroll"),"scroll");
				combo_box_thumbnail_load_type.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.thumbnail.load_type = v;
					});

					_setting_define.update();
					projectModify();
				};

				// リンクからサムネイル化する条件
				var container = new UI_LineContainer(form_parent_thumbnail,_i18n.getMessage("menu_setting_expand_image_thumbnail_script_allow"));
				var parent = container.getElement();
				var script_obj_editer_thumbnail_script_allow = new UI_ScriptObjectEditer(parent);
				script_obj_editer_thumbnail_script_allow.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.thumbnail.script_allow , v);
					});

					_setting_define.update();
					projectModify();
				};

				// サムネイルの挿入位置
				var container = new UI_LineContainer(form_parent_thumbnail,_i18n.getMessage("menu_setting_expand_image_thumbnail_script_insert"));
				var parent = container.getElement();
				var script_obj_editer_thumbnail_script_insert = new UI_ScriptObjectEditer(parent);
				script_obj_editer_thumbnail_script_insert.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.thumbnail.script_insert , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// ポップアップ表示設定
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_image_popup"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// 有効/無効
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_image_popup_enable_check_box_container"));
				var parent = container.getElement();

				// ポップアップ表示の有無
				var check_box_popup_enable_popup_mouseover = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_image_popup_enable_popup_mouseover"));
				check_box_popup_enable_popup_mouseover.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.popup.enable_popup_mouseover = v;
					});

					formUpdate();
					_setting_define.update();
					projectModify();
				};

				_form_container_popup = new UI_FormContainer(group_parent);
				_form_container_popup.setVisible(false);
				var form_parent_popup = _form_container_popup.getElement();

				// ポップアップ表示設定
				var container = new UI_LineContainer(form_parent_popup,_i18n.getMessage("menu_setting_expand_image_popup_check_box_container"));
				var parent = container.getElement();

				// ポップアップ時のスケールアニメーション動作を有効
				var check_box_enable_animation_scale = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_image_popup_enable_animation_scale"));
				check_box_enable_animation_scale.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.popup.enable_animation_scale = v;
					});

					_setting_define.update();
					projectModify();
				};
				// ポップアップ時のアルファアニメーション動作を有効
				var check_box_enable_animation_alpha = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_image_popup_enable_animation_alpha"));
				check_box_enable_animation_alpha.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.popup.enable_animation_alpha = v;
					});

					_setting_define.update();
					projectModify();
				};

				// イメージのロード設定
				var container = new UI_LineContainer(form_parent_popup,_i18n.getMessage("menu_setting_expand_image_load_start_type"));
				var parent = container.getElement();
				var combo_box_popup_load_type = new UI_ComboBox(parent);
				combo_box_popup_load_type.attachItem(_i18n.getMessage("menu_setting_expand_image_load_start_type_preload"),"preload");
				combo_box_popup_load_type.attachItem(_i18n.getMessage("menu_setting_expand_image_load_start_type_scroll"),"scroll");
				combo_box_popup_load_type.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.popup.load_type = v;
					});

					_setting_define.update();
					projectModify();
				};

				// ポップアップイメージの配置基点
				var container = new UI_LineContainer(form_parent_popup,_i18n.getMessage("menu_setting_expand_image_popup_origin_type"));
				var parent = container.getElement();
				var combo_box_popup_origin_type = new UI_ComboBox(parent);
				combo_box_popup_origin_type.attachItem(_i18n.getMessage("menu_setting_expand_image_popup_origin_type_combo_box_item_center"),"center");
				combo_box_popup_origin_type.attachItem(_i18n.getMessage("menu_setting_expand_image_popup_origin_type_combo_box_item_upper_left"),"upper_left");
				combo_box_popup_origin_type.attachItem(_i18n.getMessage("menu_setting_expand_image_popup_origin_type_combo_box_item_upper_right"),"upper_right");
				combo_box_popup_origin_type.attachItem(_i18n.getMessage("menu_setting_expand_image_popup_origin_type_combo_box_item_client_center"),"client_center");
				combo_box_popup_origin_type.attachItem(_i18n.getMessage("menu_setting_expand_image_popup_origin_type_combo_box_item_adsorb_element"),"adsorb_element");
				combo_box_popup_origin_type.attachItem(_i18n.getMessage("menu_setting_expand_image_popup_origin_type_combo_box_item_adsorb_mouse"),"adsorb_mouse");
				combo_box_popup_origin_type.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.popup.origin_type = v;
					});

					_setting_define.update();
					projectModify();
				};

				// ポップアップイメージの配置位置
				var container = new UI_LineContainer(form_parent_popup,_i18n.getMessage("menu_setting_expand_image_popup_position_type"));
				var parent = container.getElement();
				var combo_box_popup_position_type = new UI_ComboBox(parent);
				combo_box_popup_position_type.attachItem(_i18n.getMessage("menu_setting_expand_image_popup_position_type_combo_box_item_absolute"),"absolute");
				combo_box_popup_position_type.attachItem(_i18n.getMessage("menu_setting_expand_image_popup_position_type_combo_box_item_fixed"),"fixed");
				combo_box_popup_position_type.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.popup.position_type = v;
					});

					_setting_define.update();
					projectModify();
				};

				// ポップアップイメージの表示サイズ
				var container = new UI_LineContainer(form_parent_popup,_i18n.getMessage("menu_setting_expand_image_popup_size"));
				var parent = container.getElement();
				// 拡大率（パーセント）
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_expand_image_popup_size_scale"));
				var stepper_popup_scale_percent = new UI_NumericStepper(parent);
				stepper_popup_scale_percent.setMinimum(0);
				stepper_popup_scale_percent.setMaximum(9999999);
				stepper_popup_scale_percent.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.popup.scale_percent = v;
					});

					_setting_define.update();
					projectModify();
				};

				// ポップアップ時間
				var container = new UI_LineContainer(form_parent_popup,_i18n.getMessage("menu_setting_expand_image_popup_time"));
				var parent = container.getElement();
				// 開くまでに待機する時間（ミリ秒）
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_expand_image_popup_time_wait_open"));
				var stepper_popup_time_wait_open = new UI_NumericStepper(parent);
				stepper_popup_time_wait_open.setMinimum(0);
				stepper_popup_time_wait_open.setMaximum(9999999);
				stepper_popup_time_wait_open.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.popup.time_wait_open = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				// 閉じるまでに待機する時間（ミリ秒）
				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_expand_image_popup_time_wait_close"));
				var stepper_popup_time_wait_close = new UI_NumericStepper(parent);
				stepper_popup_time_wait_close.setMinimum(0);
				stepper_popup_time_wait_close.setMaximum(9999999);
				stepper_popup_time_wait_close.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.popup.time_wait_close = v;
					});

					_setting_define.update();
					projectModify();
				};

				// リンクからポップアップ表示する条件
				var container = new UI_LineContainer(form_parent_popup,_i18n.getMessage("menu_setting_expand_image_popup_script_allow"));
				var parent = container.getElement();
				var script_obj_editer_popup_script_allow = new UI_ScriptObjectEditer(parent);
				script_obj_editer_popup_script_allow.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.popup.script_allow , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// イメージのロード設定
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_image_load"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// イメージ読み込み設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_image_load_check_box_container"));
				var parent = container.getElement();

				// 読み込み進捗表示を有効
				var check_box_image_load_enable_notify = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_image_load_enable_notify"));
				check_box_image_load_enable_notify.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.load.enable_notify = v;
					});

					_setting_define.update();
					projectModify();
				};

				// イメージのソースタイプ
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_image_load_src_type"));
				var parent = container.getElement();
				var combo_box_load_src_type = new UI_ComboBox(parent);
				combo_box_load_src_type.attachItem(_i18n.getMessage("menu_setting_expand_image_load_src_type_combo_box_item_url"),"url");
				combo_box_load_src_type.attachItem(_i18n.getMessage("menu_setting_expand_image_load_src_type_combo_box_item_mixed_content"),"mixed_content");
				combo_box_load_src_type.attachItem(_i18n.getMessage("menu_setting_expand_image_load_src_type_combo_box_item_data_uri_scheme"),"data_uri_scheme");
				combo_box_load_src_type.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.load.src_type = v;
					});

					_setting_define.update();
					projectModify();
				};

				// イメージのアンロード設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_image_load_unload_check_box_container"));
				var parent = container.getElement();

				// イメージのアンロードを有効
				var check_box_enable_unload = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_image_load_enable_unload"));
				check_box_enable_unload.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.load.enable_unload = v;
					});

					_form_container_unload.setVisible(v);
					_setting_define.update();
					projectModify();
				};

				_form_container_unload = new UI_FormContainer(group_parent);
				_form_container_unload.setVisible(false);
				var form_parent_unload = _form_container_unload.getElement();

				// イメージのアンロード条件
				var container = new UI_LineContainer(form_parent_unload,_i18n.getMessage("menu_setting_expand_image_load_unload"));
				var parent = container.getElement();

				var stepper_unload_allow_size_more_then = new UI_NumericStepper(parent);
				stepper_unload_allow_size_more_then.setMinimum(0);
				stepper_unload_allow_size_more_then.setMaximum(99999);
				stepper_unload_allow_size_more_then.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.load.unload_allow_size_more_then = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_TextItem(parent,_i18n.getMessage("menu_setting_expand_image_load_allow_unload_more_then_text"));
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("expand_image");
				_setting_define.setFunctionForNewData(createExpandImage);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// サムネイルを表示
					check_box_enable_thumbnail.setValue(c.thumbnail.enable_thumbnail);
					// サムネイルにマウスオーバーするとポップアップ表示
					check_box_enable_popup_mouseover.setValue(c.thumbnail.enable_popup_mouseover);
					// 同じイメージがすでに配置されている場合サムネイルを表示しない
					check_box_disable_same_thumbnail_image.setValue(c.thumbnail.disable_same_image);
					// 最小許容限界（ピクセル値）
					stepper_thumbnail_width_min.setValue(c.thumbnail.width_min);
					// 基本拡大率（パーセント）
					stepper_thumbnail_scale_percent.setValue(c.thumbnail.scale_percent);
					// 最大許容限界（ピクセル値）
					stepper_thumbnail_width_max.setValue(c.thumbnail.width_max);
					// サムネイルイメージの読み込み設定
					combo_box_thumbnail_load_type.setValue(c.thumbnail.load_type);
					// リンクからサムネイル化する条件
					script_obj_editer_thumbnail_script_allow.setScriptObject(c.thumbnail.script_allow);
					// サムネイルの挿入位置
					script_obj_editer_thumbnail_script_insert.setScriptObject(c.thumbnail.script_insert);
					// ポップアップ表示の有無
					check_box_popup_enable_popup_mouseover.setValue(c.popup.enable_popup_mouseover);
					// ポップアップ時のアニメーション動作を有効
					check_box_enable_animation_scale.setValue(c.popup.enable_animation_scale);
					check_box_enable_animation_alpha.setValue(c.popup.enable_animation_alpha);
					// ポップアップイメージの読み込み設定
					combo_box_popup_load_type.setValue(c.popup.load_type);
					// ポップアップイメージの配置基点
					combo_box_popup_origin_type.setValue(c.popup.origin_type);
					// ポップアップイメージの配置位置
					combo_box_popup_position_type.setValue(c.popup.position_type);
					// 拡大率（パーセント）
					stepper_popup_scale_percent.setValue(c.popup.scale_percent);
					// 開くまでに待機する時間（ミリ秒）
					stepper_popup_time_wait_open.setValue(c.popup.time_wait_open);
					// 閉じるまでに待機する時間（ミリ秒）
					stepper_popup_time_wait_close.setValue(c.popup.time_wait_close);
					// リンクからポップアップ表示する条件
					script_obj_editer_popup_script_allow.setScriptObject(c.popup.script_allow);
					// 縮小されたイメージをマウスオーバーするとポップアップ表示
					check_box_reduced_image_enable_popup.setValue(c.reduced_image.enable_popup);
					// 縮小率
					stepper_popup_allow_slcale_less_then.setValue(c.reduced_image.popup_allow_slcale_less_then);
					// 読み込み進捗表示
					check_box_image_load_enable_notify.setValue(c.load.enable_notify);
					// 読み込みソースタイプ
					combo_box_load_src_type.setValue(c.load.src_type);
					// イメージのアンロードを有効
					check_box_enable_unload.setValue(c.load.enable_unload);
					_form_container_unload.setVisible(c.load.enable_unload);
					// イメージのアンロード条件
					stepper_unload_allow_size_more_then.setValue(c.load.unload_allow_size_more_then);

					_selected_id = id;
					formUpdate();
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_EXPAND_IMAGE);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// サウンドの展開の定義
		// --------------------------------------------------------------------------------
		function ContentSettingExpandSound(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _form_container;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().expand_sound;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_expand_sound"));

				// インライン表示の設定
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_sound_inline"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// インライン表示の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_sound_inline_check_box_container"));
				var parent = container.getElement();

				// 同じオーディオがすでに配置されている場合サムネイルを表示しない
				var check_box_disable_same_sound = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_sound_inline_disable_same_text"));
				check_box_disable_same_sound.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.inline.disable_same_audio = v;
					});

					_setting_define.update();
					projectModify();
				};

				// 最大同時表示数
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_sound_inline_sound_max"));
				var parent = container.getElement();

				var stepper_inline_sound_max = new UI_NumericStepper(parent);
				stepper_inline_sound_max.setMinimum(1);
				stepper_inline_sound_max.setMaximum(99999);
				stepper_inline_sound_max.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.inline.sound_max = v;
					});

					_setting_define.update();
					projectModify();
				};

				// リンクからインライン表示する条件
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_sound_inline_script_allow"));
				var parent = container.getElement();
				var script_obj_editer_inline_script_allow = new UI_ScriptObjectEditer(parent);
				script_obj_editer_inline_script_allow.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.inline.script_allow , v);
					});

					_setting_define.update();
					projectModify();
				};

				// オーディオの挿入位置
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_sound_inline_script_insert"));
				var parent = container.getElement();
				var script_obj_editer_inline_script_insert = new UI_ScriptObjectEditer(parent);
				script_obj_editer_inline_script_insert.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.inline.script_insert , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// HTMLAudioElement の設定
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_sound_inline_element"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// リンクからインライン表示する条件
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_sound_inline_element_script_allow"));
				var parent = container.getElement();
				var script_obj_editer_audio_element_script_allow = new UI_ScriptObjectEditer(parent);
				script_obj_editer_audio_element_script_allow.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.audio_element.script_allow , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_sound_inline_soundcloud"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// soundcloud.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_sound_inline_soundcloud_check_box_container"));
				var parent = container.getElement();

				// HTML5 版プレイヤーを表示
				var check_box_soundcloud_visible_player_html5 = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_sound_inline_soundcloud_visible_player_html5"));
				check_box_soundcloud_visible_player_html5.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.soundcloud.visible_player_html5 = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_sound_inline_mixcloud"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// www.mixcloud.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_sound_inline_mixcloud_check_box_container"));
				var parent = container.getElement();

				// プレイヤーを表示
				var check_box_mixcloud_visible_player = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_sound_inline_mixcloud_visible_player"));
				check_box_mixcloud_visible_player.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.mixcloud.visible_player = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("expand_sound");
				_setting_define.setFunctionForNewData(createExpandSound);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// 同じオーディオがすでに配置されている場合サムネイルを表示しない
					check_box_disable_same_sound.setValue(c.inline.disable_same_audio);
					// 最大同時表示数
					stepper_inline_sound_max.setValue(c.inline.sound_max);
					// リンクからインライン表示する条件
					script_obj_editer_inline_script_allow.setScriptObject(c.inline.script_allow);
					// サウンドの挿入位置
					script_obj_editer_inline_script_insert.setScriptObject(c.inline.script_insert);
					// HTMLAudioElement を表示する条件
					script_obj_editer_audio_element_script_allow.setScriptObject(c.audio_element.script_allow);
					// soundcloud プレイヤー表示
					check_box_soundcloud_visible_player_html5.setValue(c.soundcloud.visible_player_html5);
					// mixcloud プレイヤー表示
					check_box_mixcloud_visible_player.setValue(c.mixcloud.visible_player);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_EXPAND_SOUND);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// ビデオの展開の定義
		// --------------------------------------------------------------------------------
		function ContentSettingExpandVideo(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _form_container;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().expand_video;

				// インライン表示の設定
				_setting_define.setTitle(_i18n.getMessage("menu_setting_expand_video"));

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_video_inline"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// インライン表示の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_check_box_container"));
				var parent = container.getElement();

				// 同じURLは展開しない
				var check_box_inline_disable_same_video = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_disable_same_video"));
				check_box_inline_disable_same_video.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.inline.disable_same_video = v;
					});

					_setting_define.update();
					projectModify();
				};

				// 最大同時表示数
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_video_max"));
				var parent = container.getElement();

				var stepper_inline_video_max = new UI_NumericStepper(parent);
				stepper_inline_video_max.setMinimum(1);
				stepper_inline_video_max.setMaximum(99999);
				stepper_inline_video_max.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.inline.video_max = v;
					});

					_setting_define.update();
					projectModify();
				};

				// リンクからインライン表示する条件
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_script_allow"));
				var parent = container.getElement();
				var script_obj_editer_inline_script_allow = new UI_ScriptObjectEditer(parent);
				script_obj_editer_inline_script_allow.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.inline.script_allow , v);
					});

					_setting_define.update();
					projectModify();
				};

				// エレメントの挿入位置
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_script_insert"));
				var parent = container.getElement();
				var script_obj_editer_inline_script_insert = new UI_ScriptObjectEditer(parent);
				script_obj_editer_inline_script_insert.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.inline.script_insert , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// HTMLVideoElement の設定
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_video_inline_element"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// リンクからインライン表示する条件
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_element_script_allow"));
				var parent = container.getElement();
				var script_obj_editer_video_element_script_allow = new UI_ScriptObjectEditer(parent);
				script_obj_editer_video_element_script_allow.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.video_element.script_allow , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_video_inline_youtube"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// www.youtube.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_youtube_check_box_container"));
				var parent = container.getElement();

				// ビデオを表示
				var check_box_youtube_visible_video = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_youtube_visible_video"));
				check_box_youtube_visible_video.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.youtube.visible_video = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_video_inline_nicovideo"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// www.nicovideo.jp の設定"
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_nicovideo_check_box_container"));
				var parent = container.getElement();

				// ビデオを表示
				var check_box_nicovideo_visible_video = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_nicovideo_visible_video"));
				check_box_nicovideo_visible_video.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.nicovideo.visible_video = v;
					});

					_setting_define.update();
					projectModify();
				};

				// ビデオサムネイルを表示
				var check_box_nicovideo_visible_thumbnail_video = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_nicovideo_visible_thumbnail_video"));
				check_box_nicovideo_visible_thumbnail_video.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.nicovideo.visible_thumbnail_video = v;
					});

					_setting_define.update();
					projectModify();
				};

				// マイリストサムネイルを表示
				var check_box_nicovideo_visible_thumbnail_mylist = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_nicovideo_visible_thumbnail_mylist"));
				check_box_nicovideo_visible_thumbnail_mylist.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.nicovideo.visible_thumbnail_mylist = v;
					});

					_setting_define.update();
					projectModify();
				};

				// ユーザーサムネイルを表示
				var check_box_nicovideo_visible_thumbnail_user = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_nicovideo_visible_thumbnail_user"));
				check_box_nicovideo_visible_thumbnail_user.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.nicovideo.visible_thumbnail_user = v;
					});

					_setting_define.update();
					projectModify();
				};

				// コミュニティサムネイルを表示
				var check_box_nicovideo_visible_thumbnail_community = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_nicovideo_visible_thumbnail_community"));
				check_box_nicovideo_visible_thumbnail_community.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.nicovideo.visible_thumbnail_community = v;
					});

					_setting_define.update();
					projectModify();
				};

				// 生放送サムネイルを表示
				var check_box_nicovideo_visible_thumbnail_live = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_nicovideo_visible_thumbnail_live"));
				check_box_nicovideo_visible_thumbnail_live.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.nicovideo.visible_thumbnail_live = v;
					});

					_setting_define.update();
					projectModify();
				};

				// 静画サムネイルを表示
				var check_box_nicovideo_visible_thumbnail_seiga = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_nicovideo_visible_thumbnail_seiga"));
				check_box_nicovideo_visible_thumbnail_seiga.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.nicovideo.visible_thumbnail_seiga = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_video_inline_dailymotion"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// www.dailymotion.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_dailymotion_check_box_container"));
				var parent = container.getElement();

				// ビデオを表示
				var check_box_dailymotion_visible_video = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_dailymotion_visible_video"));
				check_box_dailymotion_visible_video.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.dailymotion.visible_video = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_video_inline_video"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// vimeo.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_video_check_box_container"));
				var parent = container.getElement();

				// ビデオを表示
				var check_box_vimeo_visible_video = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_video_visible_video"));
				check_box_vimeo_visible_video.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.vimeo.visible_video = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_video_inline_fc2video"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// video.fc2.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_fc2video_check_box_container"));
				var parent = container.getElement();

				// ビデオを表示
				var check_box_fc2video_visible_video = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_fc2video_visible_video"));
				check_box_fc2video_visible_video.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.fc2video.visible_video = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_video_inline_liveleak"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// www.liveleak.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_video_inline_liveleak_check_box_container"));
				var parent = container.getElement();

				// ビデオを表示
				var check_box_liveleak_visible_video = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_video_inline_liveleak_visible_video"));
				check_box_liveleak_visible_video.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.liveleak.visible_video = v;
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("expand_video");
				_setting_define.setFunctionForNewData(createExpandVideo);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// 同じURLは展開しない
					check_box_inline_disable_same_video.setValue(c.inline.disable_same_video);
					// 最大同時表示数
					stepper_inline_video_max.setValue(c.inline.video_max);
					// リンクからインライン表示する条件
					script_obj_editer_inline_script_allow.setScriptObject(c.inline.script_allow);
					// エレメントの挿入位置
					script_obj_editer_inline_script_insert.setScriptObject(c.inline.script_insert);
					// HTMLVideoElement を表示する条件
					script_obj_editer_video_element_script_allow.setScriptObject(c.video_element.script_allow);
					// youtube ビデオ表示
					check_box_youtube_visible_video.setValue(c.youtube.visible_video);
					// nicovideo ビデオ表示
					check_box_nicovideo_visible_video.setValue(c.nicovideo.visible_video);
					// nicovideo ビデオサムネイル表示
					check_box_nicovideo_visible_thumbnail_video.setValue(c.nicovideo.visible_thumbnail_video);
					// nicovideo マイリストサムネイル表示
					check_box_nicovideo_visible_thumbnail_mylist.setValue(c.nicovideo.visible_thumbnail_mylist);
					// nicovideo ユーザーサムネイル表示
					check_box_nicovideo_visible_thumbnail_user.setValue(c.nicovideo.visible_thumbnail_user);
					// nicovideo コミュニティサムネイル表示
					check_box_nicovideo_visible_thumbnail_community.setValue(c.nicovideo.visible_thumbnail_community);
					// nicovideo 生放送サムネイル表示
					check_box_nicovideo_visible_thumbnail_live.setValue(c.nicovideo.visible_thumbnail_live);
					// nicovideo 静画サムネイル表示
					check_box_nicovideo_visible_thumbnail_seiga.setValue(c.nicovideo.visible_thumbnail_seiga);
					// dailymotion ビデオ表示
					check_box_dailymotion_visible_video.setValue(c.dailymotion.visible_video);
					// vimeo ビデオ表示
					check_box_vimeo_visible_video.setValue(c.vimeo.visible_video);
					// fc2video ビデオ表示
					check_box_fc2video_visible_video.setValue(c.fc2video.visible_video);
					// LiveLeak ビデオ表示
					check_box_liveleak_visible_video.setValue(c.liveleak.visible_video);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_EXPAND_VIDEO);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// インラインフレームの展開の定義
		// --------------------------------------------------------------------------------
		function ContentSettingExpandIframe(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _form_container;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().expand_iframe;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_expand_iframe"));

				// インライン表示の設定
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_expand_iframe_inline"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// インライン表示の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_iframe_inline_check_box_container"));
				var parent = container.getElement();

				// 同じURLは展開しない
				var check_box_disable_same_iframe = new UI_CheckBox(parent,_i18n.getMessage("menu_setting_expand_iframe_inline_disable_same_iframe"));
				check_box_disable_same_iframe.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.inline.disable_same_iframe = v;
					});

					_setting_define.update();
					projectModify();
				};

				// リンクからインライン表示する条件
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_iframe_inline_script_allow"));
				var parent = container.getElement();
				var script_obj_editer_inline_script_allow = new UI_ScriptObjectEditer(parent);
				script_obj_editer_inline_script_allow.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.inline.script_allow , v);
					});

					_setting_define.update();
					projectModify();
				};

				// HTMLIFrameElement の挿入位置
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_expand_iframe_inline_script_insert"));
				var parent = container.getElement();
				var script_obj_editer_inline_script_insert = new UI_ScriptObjectEditer(parent);
				script_obj_editer_inline_script_insert.onchange = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						PageExpandProjectScriptObject_CopyUserScript(c.inline.script_insert , v);
					});

					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("expand_iframe");
				_setting_define.setFunctionForNewData(createExpandIframe);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					// 同じURLは展開しない
					check_box_disable_same_iframe.setValue(c.inline.disable_same_iframe);
					// リンクからインライン表示する条件
					script_obj_editer_inline_script_allow.setScriptObject(c.inline.script_allow);
					// インラインフレームの挿入位置
					script_obj_editer_inline_script_insert.setScriptObject(c.inline.script_insert);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_EXPAND_IFRAME);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// スタイルシートの定義
		// --------------------------------------------------------------------------------
		function ContentSettingStyleSheet(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _form_container;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().style_sheet;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_style_sheet"));

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_style_sheet_expand_text"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// HTMLTextAreaElement の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_text_element"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_text_element_inline"));
				var text_input_expand_text_inline = new UI_TextInput(parent);
				text_input_expand_text_inline.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_text.inline = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_style_sheet_expand_image"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// HTMImageElement の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_image_element"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_image_element_inline"));
				var text_input_expand_image_thumbnail = new UI_TextInput(parent);
				text_input_expand_image_thumbnail.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_image.thumbnail = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_image_element_popup"));
				var text_input_expand_image_popup = new UI_TextInput(parent);
				text_input_expand_image_popup.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_image.popup = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_style_sheet_expand_sound"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// HTMLAudioElement の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_sound_element"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_sound_element_inline_audio"));
				var text_input_expand_sound_inline_audio_element = new UI_TextInput(parent);
				text_input_expand_sound_inline_audio_element.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_sound.inline.audio_element.audio = v;
					});
					_setting_define.update();
					projectModify();
				};

				// SoundCloud の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_sound_soundcloud"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_sound_soundcloud_inline_player_html5"));
				var text_input_expand_sound_soundcloud_inline_player_html5 = new UI_TextInput(parent);
				text_input_expand_sound_soundcloud_inline_player_html5.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_sound.inline.soundcloud.player_html5 = v;
					});
					_setting_define.update();
					projectModify();
				};

				// MixCloud の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_sound_mixcloud"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_sound_mixcloud_inline_player"));
				var text_input_expand_sound_mixcloud_inline_player = new UI_TextInput(parent);
				text_input_expand_sound_mixcloud_inline_player.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_sound.inline.mixcloud.player = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_style_sheet_expand_video"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// HTMLVideoElement の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_element"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_element_inline_video"));
				var text_input_expand_video_inline_video_element = new UI_TextInput(parent);
				text_input_expand_video_inline_video_element.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.video_element.video = v;
					});
					_setting_define.update();
					projectModify();
				};

				// www.youtube.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_youtube"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_youtube_inline_video"));
				var text_input_expand_video_youtube_inline_video = new UI_TextInput(parent);
				text_input_expand_video_youtube_inline_video.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.youtube.video = v;
					});
					_setting_define.update();
					projectModify();
				};

				// www.nicovideo.jp の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_nicovideo"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_nicovideo_inline_video"));
				var text_input_expand_video_nicovideo_inline_video = new UI_TextInput(parent);
				text_input_expand_video_nicovideo_inline_video.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.nicovideo.video = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_nicovideo_inline_thumbnail_video"));
				var text_input_expand_video_nicovideo_inline_thumbnail_video = new UI_TextInput(parent);
				text_input_expand_video_nicovideo_inline_thumbnail_video.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.nicovideo.thumbnail_video = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_nicovideo_inline_thumbnail_mylist"));
				var text_input_expand_video_nicovideo_inline_thumbnail_mylist = new UI_TextInput(parent);
				text_input_expand_video_nicovideo_inline_thumbnail_mylist.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.nicovideo.thumbnail_mylist = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_nicovideo_inline_thumbnail_user"));
				var text_input_expand_video_nicovideo_inline_thumbnail_user = new UI_TextInput(parent);
				text_input_expand_video_nicovideo_inline_thumbnail_user.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.nicovideo.thumbnail_user = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_nicovideo_inline_thumbnail_community"));
				var text_input_expand_video_nicovideo_inline_thumbnail_community = new UI_TextInput(parent);
				text_input_expand_video_nicovideo_inline_thumbnail_community.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.nicovideo.thumbnail_community = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_nicovideo_inline_thumbnail_live"));
				var text_input_expand_video_nicovideo_inline_thumbnail_live = new UI_TextInput(parent);
				text_input_expand_video_nicovideo_inline_thumbnail_live.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.nicovideo.thumbnail_live = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_BreakItem(parent);

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_nicovideo_inline_thumbnail_seiga"));
				var text_input_expand_video_nicovideo_inline_thumbnail_seiga = new UI_TextInput(parent);
				text_input_expand_video_nicovideo_inline_thumbnail_seiga.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.nicovideo.thumbnail_seiga = v;
					});
					_setting_define.update();
					projectModify();
				};

				// www.dailymotion.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_dailymotion"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_dailymotion_inline_video"));
				var text_input_expand_video_dailymotion_inline_video = new UI_TextInput(parent);
				text_input_expand_video_dailymotion_inline_video.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.dailymotion.video = v;
					});
					_setting_define.update();
					projectModify();
				};

				// vimeo.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_vimeo"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_vimeo_inline_video"));
				var text_input_expand_video_vimeo_inline_video = new UI_TextInput(parent);
				text_input_expand_video_vimeo_inline_video.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.vimeo.video = v;
					});
					_setting_define.update();
					projectModify();
				};

				// video.fc2.com の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_fc2video"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_fc2video_inline_video"));
				var text_input_expand_video_fc2video_inline_video = new UI_TextInput(parent);
				text_input_expand_video_fc2video_inline_video.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.fc2video.video = v;
					});
					_setting_define.update();
					projectModify();
				};

				// LiveLeak の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_liveleak"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_video_liveleak_inline_video"));
				var text_input_expand_video_liveleak_inline_video = new UI_TextInput(parent);
				text_input_expand_video_liveleak_inline_video.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_video.inline.liveleak.video = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// タイトル
				var title = new UI_TitleSub(form_parent,_i18n.getMessage("menu_setting_style_sheet_expand_iframe"));

				// グループ
				var group = new UI_GroupContainer(form_parent);
				var group_parent = group.getElement();

				// HTMLIFrameElement の設定
				var container = new UI_LineContainer(group_parent,_i18n.getMessage("menu_setting_style_sheet_expand_iframe_element"));
				var parent = container.getElement();

				new UI_TitleItem(parent,_i18n.getMessage("menu_setting_style_sheet_expand_iframe_element_inline"));
				var text_input_expand_iframe_inline = new UI_TextInput(parent);
				text_input_expand_iframe_inline.oninput = function(v){
					_setting_define.getSelectedDefinitions(function(c){
						c.expand_iframe.inline = v;
					});
					_setting_define.update();
					projectModify();
				};
				new UI_Break(form_parent);

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("style_sheet");
				_setting_define.setFunctionForNewData(createStyleSheet);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;

					text_input_expand_text_inline.setValue(c.expand_text.inline);
					text_input_expand_image_thumbnail.setValue(c.expand_image.thumbnail);
					text_input_expand_image_popup.setValue(c.expand_image.popup);
					text_input_expand_sound_inline_audio_element.setValue(c.expand_sound.inline.audio_element.audio);
					text_input_expand_sound_soundcloud_inline_player_html5.setValue(c.expand_sound.inline.soundcloud.player_html5);
					text_input_expand_sound_mixcloud_inline_player.setValue(c.expand_sound.inline.mixcloud.player);
					text_input_expand_video_inline_video_element.setValue(c.expand_video.inline.video_element.video);
					text_input_expand_video_youtube_inline_video.setValue(c.expand_video.inline.youtube.video);
					text_input_expand_video_nicovideo_inline_video.setValue(c.expand_video.inline.nicovideo.video);
					text_input_expand_video_nicovideo_inline_thumbnail_video.setValue(c.expand_video.inline.nicovideo.thumbnail_video);
					text_input_expand_video_nicovideo_inline_thumbnail_mylist.setValue(c.expand_video.inline.nicovideo.thumbnail_mylist);
					text_input_expand_video_nicovideo_inline_thumbnail_user.setValue(c.expand_video.inline.nicovideo.thumbnail_user);
					text_input_expand_video_nicovideo_inline_thumbnail_community.setValue(c.expand_video.inline.nicovideo.thumbnail_community);
					text_input_expand_video_nicovideo_inline_thumbnail_live.setValue(c.expand_video.inline.nicovideo.thumbnail_live);
					text_input_expand_video_nicovideo_inline_thumbnail_seiga.setValue(c.expand_video.inline.nicovideo.thumbnail_seiga);
					text_input_expand_video_dailymotion_inline_video.setValue(c.expand_video.inline.dailymotion.video);
					text_input_expand_video_vimeo_inline_video.setValue(c.expand_video.inline.vimeo.video);
					text_input_expand_video_fc2video_inline_video.setValue(c.expand_video.inline.fc2video.video);
					text_input_expand_video_liveleak_inline_video.setValue(c.expand_video.inline.liveleak.video);
					text_input_expand_iframe_inline.setValue(c.expand_iframe.inline);
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_STYLE_SHEET);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// 試験運用の定義
		// --------------------------------------------------------------------------------
		function ContentSettingExperimental(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_setting_define.select(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				_setting_define.selectFromIdList(list);
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				_setting_define.replaceHistory();
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _setting_define;
			var _form_container;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_setting_define = new ContentSettingDefine();
				var form_parent = _setting_define.getElementForm();
				var define = page_expand_project.getObject().experimental;

				// タイトル
				_setting_define.setTitle(_i18n.getMessage("menu_setting_experimental"));

				// データの関連付け
				_setting_define.attachDefineData(define);
				_setting_define.setDefineAssetName("experimental");
				_setting_define.setFunctionForNewData(createExperimental);

				// リスト選択
				_setting_define.onselect = function(id){
					var c = ProjectObjectGetActiveData(define[id]);
					if(!c)	return;
				};

				// リロード
				_setting_define.onreload = function(){
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_EXPERIMENTAL);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// 言語設定
		// --------------------------------------------------------------------------------
		function ContentSettingLanguage(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _combo_box_language;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var language = page_expand_project.getObject().language;

				// タイトル
				var title = new UI_Title(_content_window,_i18n.getMessage("menu_setting_language"));

				// 言語設定
				var container = new UI_LineContainer(_content_window,"Language");
				var parent = container.getElement();
				_combo_box_language = new UI_ComboBox(parent);
				_combo_box_language.attachItem("BROWSER LANGUAGE","auto");
				_combo_box_language.attachItem("English","en");
				_combo_box_language.attachItem("中文（简体中文）","zh");
				_combo_box_language.attachItem("日本語","ja");
				_combo_box_language.onchange = function(v){
					language.auto = (v === "auto");
					if(!(language.auto)) language.code = v;
					projectModify();

					// PageExpandConfig を再構築
					initialize();
					_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_LANGUAGE);
				};

				// 言語タイプ
				if(language.auto){
					_combo_box_language.setValue("auto");
				}else{
					_combo_box_language.setValue(language.code);
				}
			})();
		}

		// --------------------------------------------------------------------------------
		// クレジット
		// --------------------------------------------------------------------------------
		function ContentCredit(){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var title = new UI_Title(_content_window,_i18n.getMessage("menu_credit"));

				// バージョン情報
				var container = new UI_LineContainer(_content_window,_i18n.getMessage("menu_credit_info_version"));
				var parent = container.getElement();
				new UI_Text(parent,"PageExpand ver.1.5.17");

				// 製作
				var container = new UI_LineContainer(_content_window,_i18n.getMessage("menu_credit_info_copyright"));
				var parent = container.getElement();
				var table = document.createElement("table");
				parent.appendChild(table);
				var tr = table.insertRow(-1);
				new UI_Text(tr.insertCell(-1),'by');
				new UI_AnchorText(tr.insertCell(-1),"Hakuhin","https://hakuhin.jp/");
				new UI_Text(tr.insertCell(-1),'2010-2019');
				new UI_AnchorText(parent,"https://github.com/hakuhin/PageExpand","https://github.com/hakuhin/PageExpand");

				// 翻訳者
				var container = new UI_LineContainer(_content_window,_i18n.getMessage("menu_credit_info_translator"));
				var parent = container.getElement();
				var table = document.createElement("table");
				parent.appendChild(table);

				var tr = table.insertRow(-1);
				new UI_Text(tr.insertCell(-1),'中文（简体中文）');
				new UI_Text(tr.insertCell(-1),'by');
				new UI_AnchorText(tr.insertCell(-1),"weiq530","https://github.com/weiq530");
				new UI_Text(tr.insertCell(-1),'(ver.1.4.9)');
			})();
		}

		// --------------------------------------------------------------------------------
		// ラインコンテナ
		// --------------------------------------------------------------------------------
		function UI_LineContainer(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 透明度をセット
			// --------------------------------------------------------------------------------
			_this.setAlpha = function(v){
				_window.style.opacity = v;
			};

			// --------------------------------------------------------------------------------
			// エレメント取得
			// --------------------------------------------------------------------------------
			_this.getElement = function(){
				return _body;
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _window;
			var _body;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_window = DocumentCreateElement("div");
				ElementSetStyle(_window,"margin:0px 0px 20px; padding:10px; background:#fcfcfc; border-radius:10px; box-shadow:0px 0px 2px #ccc;");
				parent.appendChild(_window);

				if(label){
					var div = DocumentCreateElement("div");
					ElementSetStyle(div,"padding:5px 0px 5px 20px; margin:0px 0px 10px; background:#666; font-size:16px; color:#fff; border-radius:10px; box-shadow:0px 1px 1px #000;");
					ElementSetTextContent(div,label);
					_window.appendChild(div);
				}

				_body = DocumentCreateElement("div");
				ElementSetStyle(_body,"margin:0px 10px 0px 10px;");
				_window.appendChild(_body);
			})();
		}

		// --------------------------------------------------------------------------------
		// インラインコンテナ
		// --------------------------------------------------------------------------------
		function UI_InlineContainer(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 幅をセット
			// --------------------------------------------------------------------------------
			_this.setWidth = function(v){
				_window.style.width = v + "px";
			};

			// --------------------------------------------------------------------------------
			// 透明度をセット
			// --------------------------------------------------------------------------------
			_this.setAlpha = function(v){
				_window.style.opacity = v;
			};

			// --------------------------------------------------------------------------------
			// 背景カラーをセット
			// --------------------------------------------------------------------------------
			_this.setBackgroundColor = function(argb){
				var color = argb;
				var brightness = 0.9;
				var r = (color >> 16) & 0xFF;
				var g = (color >>  8) & 0xFF;
				var b = (color >>  0) & 0xFF;
				r = Math.floor(r * brightness);
				g = Math.floor(g * brightness);
				b = Math.floor(b * brightness);
				var style = _label.style;
				var liner_gradient = "linear-gradient(right, #" + r.toString(16) + g.toString(16) + b.toString(16) + " 25px, #666 25px)";
				style.backgroundImage = liner_gradient;
				var none = {"none":1,"initial":1};
				if(none[style.backgroundImage]) style.backgroundImage = "-webkit-" + liner_gradient;
				if(none[style.backgroundImage]) style.backgroundImage = "-moz-" + liner_gradient;
				if(none[style.backgroundImage]) style.backgroundImage = "-ms-" + liner_gradient;
				if(none[style.backgroundImage]) style.backgroundImage = "-o-" + liner_gradient;
			};

			// --------------------------------------------------------------------------------
			// エレメント取得
			// --------------------------------------------------------------------------------
			_this.getElement = function(){
				return _body;
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _window;
			var _label;
			var _body;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_window = DocumentCreateElement("div");
				ElementSetStyle(_window,"width:350px; margin:0px 5px 20px 0px; padding:10px; background:#fcfcfc; display:inline-table; vertical-align:top; border-radius:10px; box-shadow:0px 0px 2px #ccc;");
				parent.appendChild(_window);

				if(label){
					_label = DocumentCreateElement("div");
					ElementSetStyle(_label,"padding:5px 0px 5px 20px; margin:0px 0px 10px; background:#666; font-size:16px; color:#fff; border-radius:10px; box-shadow:0px 1px 1px #000;");
					ElementSetTextContent(_label,label);
					_window.appendChild(_label);
				}

				_body = DocumentCreateElement("div");
				ElementSetStyle(_body,"margin:0px 10px 0px 10px;");
				_window.appendChild(_body);
			})();
		}

		// --------------------------------------------------------------------------------
		// フォームコンテナ
		// --------------------------------------------------------------------------------
		function UI_FormContainer(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 可視状態セット
			// --------------------------------------------------------------------------------
			_this.setVisible = function(type){
				if(type){
					_form.style.display = "";
				}else{
					_form.style.display = "none";
				}
			};

			// --------------------------------------------------------------------------------
			// エレメント取得
			// --------------------------------------------------------------------------------
			_this.getElement = function(){
				return _form;
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _form;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_form = DocumentCreateElement("form");
				parent.appendChild(_form);
				_this.setVisible(true);
			})();
		}

		// --------------------------------------------------------------------------------
		// グループコンテナ
		// --------------------------------------------------------------------------------
		function UI_GroupContainer(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// エレメント取得
			// --------------------------------------------------------------------------------
			_this.getElement = function(){
				return _div;
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _div;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_div = DocumentCreateElement("div");
				_div.style.cssText = "padding-left:10px; padding-right:10px; border-left:20px #f4f4f4 solid; border-right:20px #f4f4f4 solid;";
				parent.appendChild(_div);
			})();
		}

		// --------------------------------------------------------------------------------
		// モーダルダイアログ
		// --------------------------------------------------------------------------------
		function UI_ModalDialog(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 幅を変更
			// --------------------------------------------------------------------------------
			_this.setWidth = function(v){
				_window.style.width = v + "px";
			};

			// --------------------------------------------------------------------------------
			// 開く
			// --------------------------------------------------------------------------------
			_this.open = function(){
				var task = task_container.createTask(null);

				var d = 0.0;
				parent.appendChild(_window);

				// イベントを登録
				addEvent();

				// リサイズ
				resize();

				task.setExecuteFunc(function(){
					var complete = false;
					d += 0.2;
					if(d > 1.0){
						d = 1.0;
						complete = true;
					}
					_background.style.opacity = d * 0.5;

					if(complete){
						task.release();
					}
				});
				task.execute(0xffffffff);
			};

			// --------------------------------------------------------------------------------
			// 閉じる
			// --------------------------------------------------------------------------------
			_this.close = function(){
				var task = task_container.createTask(null);

				var d = 1.0;
				DomNodeRemove(_window);
				task.setExecuteFunc(function(){
					var complete = false;
					d -= 0.2;
					if(d < 0.0){
						d = 0.0;
						complete = true;
					}
					_background.style.opacity = d * 0.5;

					if(complete){
						DomNodeRemove(_background);
						_this.oncomplete();
						task.release();
						return;
					}
				});
				task.execute(0xffffffff);

				// イベントを破棄
				removeEvent();
			};

			// --------------------------------------------------------------------------------
			// エレメント取得
			// --------------------------------------------------------------------------------
			_this.getElement = function(){
				return _window;
			};

			// --------------------------------------------------------------------------------
			// 完了イベント
			// --------------------------------------------------------------------------------
			_this.oncomplete = function(){};

			// --------------------------------------------------------------------------------
			// リサイズ（内部用 ）
			// --------------------------------------------------------------------------------
			function resize(){
				var scroll_pos = WindowGetScrollPosition(window);
				var client_size = DocumentGetClientSize(document);
				var dialog_rect = ElementGetBoundingClientRect(_window);

				var w = dialog_rect.right - dialog_rect.left;
				var h = dialog_rect.bottom - dialog_rect.top;

				_window.style.left = (client_size.width  / 2 - w / 2 + scroll_pos.x) + "px";
				if(client_size.height > h){
					_window.style.top  = (client_size.height / 2 - h / 2 + scroll_pos.y) + "px";
					_fitted_top = false;
				}else{
					if(!_fitted_top){
						_window.style.top  = (scroll_pos.y) + "px";
						_fitted_top = true;
					}
				}
			}

			// --------------------------------------------------------------------------------
			// イベント登録（内部用 ）
			// --------------------------------------------------------------------------------
			function addEvent(){
				// イベントリスナーに対応している
				if(window.addEventListener){

					window.addEventListener("scroll" ,resize);
					window.addEventListener("resize" ,resize);

				// アタッチイベントに対応している
				}else if(window.attachEvent){

					window.attachEvent("onscroll" ,resize);
					window.attachEvent("onresize" ,resize);

				}

			}

			// --------------------------------------------------------------------------------
			// イベント破棄（内部用 ）
			// --------------------------------------------------------------------------------
			function removeEvent(){
				// イベントリスナーに対応している
				if(window.removeEventListener){

					window.removeEventListener("scroll" ,resize);
					window.removeEventListener("resize" ,resize);

				// アタッチイベントに対応している
				}else if(window.detachEvent){

					window.detachEvent("onscroll" ,resize);
					window.detachEvent("onresize" ,resize);

				}
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _background;
			var _window;
			var _fitted_top;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){

				_background = DocumentCreateElement("div");
				ElementSetStyle(_background,"position:fixed; top:0px; bottom:0px; left:0px; right:0px; opacity:0.0; background:#000;");
				parent.appendChild(_background);

				_window = DocumentCreateElement("div");
				ElementSetStyle(_window,"position:absolute; width:800px; padding:10px 20px 5px; background:#00F; background-color:#FFF; border-radius:5px; box-shadow:5px 5px 10px #444;");

			})();
		}

		// --------------------------------------------------------------------------------
		// アラートダイアログ
		// --------------------------------------------------------------------------------
		function UI_AlertDialog(parent,title){
			var _this = this;

			// --------------------------------------------------------------------------------
			// エレメント取得
			// --------------------------------------------------------------------------------
			_this.getElement = function(){
				return _element;
			};

			// --------------------------------------------------------------------------------
			// 開く
			// --------------------------------------------------------------------------------
			_this.open = function(){
				// ダイアログ開始
				_dialog.open();
			};

			// --------------------------------------------------------------------------------
			// 完了イベント
			// --------------------------------------------------------------------------------
			_this.oncomplete = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _dialog;
			var _element;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){

				// モーダルダイアログ作成
				_dialog = new UI_ModalDialog(_content_window);
				_dialog.setWidth(600);
				var dialog_parent = _dialog.getElement();

				// タイトル
				new UI_Title(dialog_parent,title);

				var container = new UI_LineContainer(dialog_parent,null);
				_element = container.getElement();

				// ボタン
				var ok_button = new UI_OkButton(dialog_parent);
				ok_button.onclick = function(){
					// ダイアログ終了
					_dialog.close();
					_this.oncomplete();
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// タイトル
		// --------------------------------------------------------------------------------
		function UI_Title(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				ElementSetTextContent(_body,v);
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _body;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_body = DocumentCreateElement("div");
				ElementSetStyle(_body,"margin:0px 0px 10px; font-size:32px; text-align:right;");
				ElementSetTextContent(_body,label);
				parent.appendChild(_body);
			})();
		}

		// --------------------------------------------------------------------------------
		// サブタイトル
		// --------------------------------------------------------------------------------
		function UI_TitleSub(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				ElementSetTextContent(_body,v);
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _body;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_body = DocumentCreateElement("div");
				ElementSetStyle(_body,"margin:0px 0px 10px; font-size:24px; text-align:left;");
				ElementSetTextContent(_body,label);
				parent.appendChild(_body);
			})();
		}

		// --------------------------------------------------------------------------------
		// アイテム用タイトル
		// --------------------------------------------------------------------------------
		function UI_TitleItem(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				ElementSetTextContent(_body,v);
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _body;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_body = DocumentCreateElement("div");
				ElementSetStyle(_body,"margin:0px 0px 3px; font-size:14px; line-height:1.0; text-align:left;");
				ElementSetTextContent(_body,label);
				parent.appendChild(_body);
			})();
		}

		// --------------------------------------------------------------------------------
		// 改行
		// --------------------------------------------------------------------------------
		function UI_Break(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setHeight = function(v){
				_body.style.height = (v) + "px";
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _body;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_body = DocumentCreateElement("div");
				ElementSetStyle(_body,"margin:0px; height:20px;");
				parent.appendChild(_body);
			})();
		}

		// --------------------------------------------------------------------------------
		// アイテム用改行
		// --------------------------------------------------------------------------------
		function UI_BreakItem(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _body;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_body = DocumentCreateElement("div");
				ElementSetStyle(_body,"margin:0px; height:8px;");
				parent.appendChild(_body);
			})();
		}

		// --------------------------------------------------------------------------------
		// テキスト
		// --------------------------------------------------------------------------------
		function UI_Text(parent,label){
			var div = DocumentCreateElement("div");
			ElementSetStyle(div,"margin:0px 0px 3px; line-height:1.0; font-size:14px;");
			ElementSetTextContent(div,label);
			parent.appendChild(div);
			return div;
		}

		// --------------------------------------------------------------------------------
		// アイテム用テキスト
		// --------------------------------------------------------------------------------
		function UI_TextItem(parent,label){
			var div = DocumentCreateElement("div");
			ElementSetStyle(div,"margin:0px 0px 3px; line-height:1.0; font-size:12px; color:#444;");
			ElementSetTextContent(div,label);
			parent.appendChild(div);
			return div;
		}

		// --------------------------------------------------------------------------------
		// テキストヒント
		// --------------------------------------------------------------------------------
		function UI_TextHint(parent,label){
			var div = DocumentCreateElement("div");
			ElementSetStyle(div,"margin:-3px 0px 3px 0px; line-height:1.0; font-size:11px; color:#aaa;");
			ElementSetTextContent(div,label);
			parent.appendChild(div);
			return div;
		}

		// --------------------------------------------------------------------------------
		// アンカーテキスト
		// --------------------------------------------------------------------------------
		function UI_AnchorText(parent,label,url){
			var div = DocumentCreateElement("div");
			ElementSetStyle(div,"margin:0px 0px 5px;");

			var anchor = DocumentCreateElement("a");
			anchor.href = url;
			ElementSetTextContent(anchor,label);
			div.appendChild(anchor);

			parent.appendChild(div);
			return div;
		}

		// --------------------------------------------------------------------------------
		// 順序無しリスト
		// --------------------------------------------------------------------------------
		function UI_UnorderedList(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// アイテムを追加
			// --------------------------------------------------------------------------------
			_this.addListItem = function(label){
				var li = DocumentCreateElement("li");
				ElementSetTextContent(li,label);
				_ul.appendChild(li);
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _ul;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px;");
				parent.appendChild(container);

				_ul = DocumentCreateElement("ul");
				container.appendChild(_ul);
			})();
		}

		// --------------------------------------------------------------------------------
		// チェックボックス
		// --------------------------------------------------------------------------------
		function UI_CheckBox(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値を取得
			// --------------------------------------------------------------------------------
			_this.getValue = function(){
				return _input.checked;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				_input.checked = v;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _input;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px;");
				parent.appendChild(container);

				var _label = DocumentCreateElement("label");
				ElementSetStyle(_label,"cursor:pointer; user-select:none; -webkit-user-select:none; -moz-user-select:none; -khtml-user-select:none;");
				container.appendChild(_label);

				_input = DocumentCreateElement("input");
				ElementSetStyle(_input,"margin:0px 2px 0px 0px;");
				_input.type = "checkbox";
				_label.appendChild(_input);
				_input.onchange = function(){
					_this.onchange(_input.checked);
				};

				var span = DocumentCreateElement("span");
				ElementSetStyle(span,"font-size:14px;");
				ElementSetTextContent(span,":" + label);
				_label.appendChild(span);
			})();
		}

		// --------------------------------------------------------------------------------
		// チェックボックス
		// --------------------------------------------------------------------------------
		function UI_LineCheckBox(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値を取得
			// --------------------------------------------------------------------------------
			_this.getValue = function(){
				return _input.checked;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				_input.checked = v;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _input;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("span");
				ElementSetStyle(container,"margin:0px 10px 5px 0px;");
				parent.appendChild(container);

				var _label = DocumentCreateElement("label");
				ElementSetStyle(_label,"user-select:none; -webkit-user-select:none; -moz-user-select:none; -khtml-user-select:none;");
				container.appendChild(_label);

				_input = DocumentCreateElement("input");
				ElementSetStyle(_input,"margin:0px 2px 0px 0px;");
				_input.type = "checkbox";
				_label.appendChild(_input);
				_input.onchange = function(){
					_this.onchange(_input.checked);
				};

				var span = DocumentCreateElement("span");
				ElementSetStyle(span,"font-size:14px;");
				ElementSetTextContent(span,":" + label);
				_label.appendChild(span);
			})();
		}

		// --------------------------------------------------------------------------------
		// テキストダイナミック
		// --------------------------------------------------------------------------------
		function UI_TextDynamic(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値を取得
			// --------------------------------------------------------------------------------
			_this.getValue = function(){
				return _input.value;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				_input.value = v;
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _input;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 8px 5px 0px;");
				parent.appendChild(container);

				_input = DocumentCreateElement("input");
				_input.readOnly = "readonly";
				ElementSetStyle(_input,"width:100%; padding:2px; background:#f8f8f8; color:#888;");
				container.appendChild(_input);
			})();
		}

		// --------------------------------------------------------------------------------
		// テキストインプット
		// --------------------------------------------------------------------------------
		function UI_TextInput(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値を取得
			// --------------------------------------------------------------------------------
			_this.getValue = function(){
				return _input.value;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				_input.value = v;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.oninput = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _input;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 8px 5px 0px;");
				parent.appendChild(container);

				_input = DocumentCreateElement("input");
				ElementSetStyle(_input,"width:100%; padding:2px; background-color:#fff;");
				container.appendChild(_input);

				_input.oninput = function(){
					_this.oninput(_input.value);
				};
			})();
		}

		// --------------------------------------------------------------------------------
		// 正規表現入力
		// --------------------------------------------------------------------------------
		function UI_TextRegExp(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値を取得
			// --------------------------------------------------------------------------------
			_this.getValue = function(){
				return getValue();
			};

			// --------------------------------------------------------------------------------
			// 値を取得
			// --------------------------------------------------------------------------------
			function getValue(){
				return {
					pattern:_input_pattern.value,
					flags:{
						i:_check_box_enable_i.getValue(),
						g:_check_box_enable_g.getValue()
					}
				};
			}

			// --------------------------------------------------------------------------------
			// エレメント取得
			// --------------------------------------------------------------------------------
			_this.getElement = function(){
				return _body;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				_input_pattern.value = v.pattern;
				_check_box_enable_i.setValue(v.flags.i);
				_check_box_enable_g.setValue(v.flags.g);

				errorCheck();
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.oninput = function(){};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			function oninput(){
				errorCheck();

				if(!_visible){
					_this.oninput(getValue());
				}
			}

			// --------------------------------------------------------------------------------
			// エラーチェック
			// --------------------------------------------------------------------------------
			function errorCheck(){
				try{
					var reg_exp = new RegExp(_input_pattern.value);
					setVisibleResult(false);
				}catch(e){
					_input_result.value = e;
					setVisibleResult(true);
				}
			}

			// --------------------------------------------------------------------------------
			// 可視状態セット
			// --------------------------------------------------------------------------------
			function setVisibleResult(type){
				if(type){
					_input_result_container.appendChild(_input_result);
				}else{
					if(_visible){
						DomNodeRemove(_input_result);
					}
				}
				_visible = type;
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _body;
			var _input_pattern;
			var _input_result;
			var _visible;
			var _input_result_container;
			var _check_box_enable_i;
			var _check_box_enable_g;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){

				_visible = false;

				_body = DocumentCreateElement("div");
				parent.appendChild(_body);

				var table = DocumentCreateElement("div");
				ElementSetStyle(table,"margin:0px 0px 0px 0px; display:table; width:100%;");
				_body.appendChild(table);

				var input_pattern_container = DocumentCreateElement("div");
				ElementSetStyle(input_pattern_container,"display:table-cell; widht:auto; padding-right:8px;");
				table.appendChild(input_pattern_container);

				_input_pattern = DocumentCreateElement("input");
				ElementSetStyle(_input_pattern,"width:100%; padding:2px; background-color:#fff;");
				input_pattern_container.appendChild(_input_pattern);

				_input_pattern.oninput = function(){
					oninput();
				};

				var input_flags_container = DocumentCreateElement("div");
				ElementSetStyle(input_flags_container,"display:table-cell; width:100px; padding-left:10px;");
				table.appendChild(input_flags_container);

				// g チェック
				_check_box_enable_g = new UI_LineCheckBox(input_flags_container,"g");
				_check_box_enable_g.onchange = function(v){
					oninput();
				};
				// i チェック
				_check_box_enable_i = new UI_LineCheckBox(input_flags_container,"i");
				_check_box_enable_i.onchange = function(v){
					oninput();
				};

				_input_result_container = DocumentCreateElement("div");
				ElementSetStyle(_input_result_container,"margin:0px 8px 5px 0px;");
				_body.appendChild(_input_result_container);

				_input_result = DocumentCreateElement("input");
				_input_result.readOnly = "readonly";
				ElementSetStyle(_input_result,"width:100%; font-size:12px; padding:2px; background:#f88;");

				new UI_TextHint(_body,_i18n.getMessage("menu_text_regexp_hint"));

			})();
		}

		// --------------------------------------------------------------------------------
		// テキストエリア
		// --------------------------------------------------------------------------------
		function UI_TextArea(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値を取得
			// --------------------------------------------------------------------------------
			_this.getValue = function(){
				return _textarea.value;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				_textarea.value = v;
			};

			// --------------------------------------------------------------------------------
			// 改行コードで分割した配列を取得
			// --------------------------------------------------------------------------------
			_this.spiritByLine = function(v){
				// 改行コードを統一
				var s = _textarea.value.replace(/\r\n?/g,"\n");
				var a = s.split("\n");
				var n = a.length;
				var i;
				for(i=n-1;i>=0;i--){
					if(!a[i])	a.splice(i,1);
				}
				return a;
			};

			// --------------------------------------------------------------------------------
			// 配列の各番地のデータに文字を挟んだ文字列をセット
			// --------------------------------------------------------------------------------
			_this.joinArray = function(ary,v){
				_textarea.value = ary.join(v);
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.oninput = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _textarea;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px;");
				parent.appendChild(container);

				_textarea = DocumentCreateElement("textarea");
				ElementSetStyle(_textarea,"width:100%; height:100px; box-sizing:border-box; display:block;");
				container.appendChild(_textarea);

				_textarea.oninput = function(){
					_this.oninput(_textarea.value);
				};
			})();
		}

		// --------------------------------------------------------------------------------
		// スクリプトオブジェクトエディタ
		// --------------------------------------------------------------------------------
		function UI_ScriptObjectEditer(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// スクリプトオブジェクトをセット
			// --------------------------------------------------------------------------------
			_this.setScriptObject = function(v){
				_script_obj = ObjectCopy(v);
				update();
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// 更新イベント発行
			// --------------------------------------------------------------------------------
			function dispatchChange(){
				if(_this.onchange){
					_this.onchange(ObjectCopy(_script_obj));
				}
			}

			// --------------------------------------------------------------------------------
			// 更新
			// --------------------------------------------------------------------------------
			function update(){
				var enable = PageExpandProjectScriptObject_HasUserScript(_script_obj);
				if(enable){
					_button.setLabel(_i18n.getMessage("menu_script_obj_editer_delete_script"));
					var script = PageExpandProjectScriptObject_ToString(_script_obj);
					_script_area.setValue(script);
				}else{
					_button.setLabel(_i18n.getMessage("menu_script_obj_editer_edit_script"));
				}
				_script_area.setVisible(enable);
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _body;
			var _script_obj;
			var _button;
			var _script_area;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_visible = false;

				_body = DocumentCreateElement("div");
				ElementSetStyle(_body,"margin:0px 0px 0px 0px;");
				parent.appendChild(_body);

				_button = new UI_InlineButton(_body,"");
				_button.onclick = function(){
					if(PageExpandProjectScriptObject_HasUserScript(_script_obj)){
						PageExpandProjectScriptObject_ReturnPreset(_script_obj);
					}else{
						var script = PageExpandProjectScriptObject_ToString(_script_obj);
						PageExpandProjectScriptObject_SetUserScript(_script_obj,script);
					}
					update();
					dispatchChange();
				};

				_script_area = new UI_ScriptArea(_body);
				_script_area.oninput = function(v){
					PageExpandProjectScriptObject_SetUserScript(_script_obj,v);
					dispatchChange();
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// スクリプトエリア
		// --------------------------------------------------------------------------------
		function UI_ScriptArea(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値を取得
			// --------------------------------------------------------------------------------
			_this.getValue = function(){
				return _textarea.value;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				_textarea.value = v;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.oninput = function(){};

			// --------------------------------------------------------------------------------
			// 可視状態セット
			// --------------------------------------------------------------------------------
			_this.setVisible = function(type){
				if(type){
					_body.style.display = "";
				}else{
					_body.style.display = "none";
				}
			};

			// --------------------------------------------------------------------------------
			// 可視状態セット
			// --------------------------------------------------------------------------------
			function setVisibleResult(type){
				if(type){
					_body.appendChild(_input_container);
				}else{
					if(_visible){
						DomNodeRemove(_input_container);
					}
				}
				_visible = type;
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _body;
			var _textarea;
			var _input_container;
			var _input;
			var _visible;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_visible = false;

				_body = DocumentCreateElement("div");
				ElementSetStyle(_body,"margin:0px 0px 5px 0px;");
				parent.appendChild(_body);

				_textarea = DocumentCreateElement("textarea");
				ElementSetStyle(_textarea,"width:100%; height:300px; box-sizing:border-box; display:block; background-color:#fff; margin-bottom:5px;");
				_body.appendChild(_textarea);
				_textarea.oninput = function(){

					try{
						(function(){
							eval("[function(){" + _textarea.value + "}]");
						})();
						setVisibleResult(false);
						_this.oninput(_textarea.value);
					}catch(e){
						_input.value = e;
						setVisibleResult(true);
					}
				};

				_input_container = DocumentCreateElement("div");
				ElementSetStyle(_input_container,"margin:0px 0px 5px 0px;");

				_input = DocumentCreateElement("input");
				_input.readOnly = "readonly";
				ElementSetStyle(_input,"width:100%; box-sizing:border-box; display:block; font-size:12px; padding:2px; background:#f88;");
				_input_container.appendChild(_input);

				new UI_TextHint(_body,_i18n.getMessage("menu_scriptarea_hint"));
			})();
		}

		// --------------------------------------------------------------------------------
		// ステッパー
		// --------------------------------------------------------------------------------
		function UI_NumericStepper(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 値取得
			// --------------------------------------------------------------------------------
			_this.getValue = function(){
				var v = parseInt(_input.value);
				if(isNaN(v)) v = 0;
				if(v < _min) v = _min;
				if(v > _max) v = _max;
				return v;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				if(isNaN(v)) v = 0;
				if(v < _min) v = _min;
				if(v > _max) v = _max;
				_input.value = v;
			};

			// --------------------------------------------------------------------------------
			// 最小値をセット
			// --------------------------------------------------------------------------------
			_this.setMinimum = function(v){
				_min = v;
				_input.min = v;
			};

			// --------------------------------------------------------------------------------
			// 最大値をセット
			// --------------------------------------------------------------------------------
			_this.setMaximum = function(v){
				_max = v;
				_input.max = v;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.oninput = function(){};

			// --------------------------------------------------------------------------------
			// 更新イベント発行
			// --------------------------------------------------------------------------------
			function dispatchInput(v){
				if(_this.oninput){
					_this.oninput(v);
				}
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _input;
			var _min;
			var _max;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 8px 5px 0px;");
				parent.appendChild(container);

				_input = DocumentCreateElement("input");
				_input.type = "number";
				ElementSetStyle(_input,"width:auto; min-width:200px; padding:2px; background-color:#fff;");
				container.appendChild(_input);

				_input.oninput = function(){
					var v = _this.getValue();
					dispatchInput(v);
				};
				_input.onchange = function(){
					var v = _this.getValue();
					_this.setValue(v);
					dispatchInput(v);
				};

				_this.setMinimum(-0x80000000);
				_this.setMaximum( 0x7fffffff);
			})();
		}

		// --------------------------------------------------------------------------------
		// ラインボタン
		// --------------------------------------------------------------------------------
		function UI_LineButton(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// ラベルを編集
			// --------------------------------------------------------------------------------
			_this.setLabel = function(label){
				_input.value = label;
			};

			// --------------------------------------------------------------------------------
			// クリックイベント
			// --------------------------------------------------------------------------------
			_this.onclick = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _input;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px -1px 5px 0px;");
				parent.appendChild(container);

				function ButtonOnClick(){
					_this.onclick();
				}

				_input = DocumentCreateElement("input");
				ElementSetStyle(_input,"width:100%; padding:20px 0px;");
				_input.type = "button";
				_input.value = label;
				container.appendChild(_input);
				_input.onclick = function(){
					ButtonOnClick();
				};
			})();
		}

		// --------------------------------------------------------------------------------
		// インラインボタン
		// --------------------------------------------------------------------------------
		function UI_InlineButton(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// ラベルを編集
			// --------------------------------------------------------------------------------
			_this.setLabel = function(label){
				_input.value = label;
			};

			// --------------------------------------------------------------------------------
			// クリックイベント
			// --------------------------------------------------------------------------------
			_this.onclick = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _input;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_input = DocumentCreateElement("input");
				ElementSetStyle(_input,"padding:4px 10px; margin:0px 2px 5px 0px; box-sizing:border-box;");
				_input.type = "button";
				_input.value = label;
				parent.appendChild(_input);

				function ButtonOnClick(){
					_this.onclick();
				}

				_input.onclick = function(){
					ButtonOnClick();
				};
			})();
		}

		// --------------------------------------------------------------------------------
		// YES NO ボタン
		// --------------------------------------------------------------------------------
		function UI_YesNoButton(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// クリックイベント
			// --------------------------------------------------------------------------------
			_this.onclick = function(){};

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px; text-align:center;");
				parent.appendChild(container);

				function ButtonOnClick(result){
					input_yes.disabled = true;
					input_no.disabled = true;
					_this.onclick(result);
				}

				var input_yes = DocumentCreateElement("input");
				ElementSetStyle(input_yes,"padding:10px; width:200px; box-sizing:border-box;");
				input_yes.type = "button";
				input_yes.value = _i18n.getMessage("menu_button_yes");
				container.appendChild(input_yes);
				input_yes.onclick = function(){
					ButtonOnClick(true);
				};

				var input_no = DocumentCreateElement("input");
				ElementSetStyle(input_no,"padding:10px; width:200px; box-sizing:border-box;");
				input_no.type = "button";
				input_no.value = _i18n.getMessage("menu_button_no");
				container.appendChild(input_no);
				input_no.onclick = function(){
					ButtonOnClick(false);
				};
			})();
		}

		// --------------------------------------------------------------------------------
		// OK ボタン
		// --------------------------------------------------------------------------------
		function UI_OkButton(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// クリックイベント
			// --------------------------------------------------------------------------------
			_this.onclick = function(){};

			// --------------------------------------------------------------------------------
			// 有無の設定
			// --------------------------------------------------------------------------------
			_this.setEnable = function(type){
				input_ok.disabled = ((!type) ? true : false);
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var input_ok;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px; text-align:center;");
				parent.appendChild(container);

				function ButtonOnClick(){
					_this.setEnable(false);
					_this.onclick();
				}

				input_ok = DocumentCreateElement("input");
				ElementSetStyle(input_ok,"padding:10px; width:200px; box-sizing:border-box;");
				input_ok.type = "button";
				input_ok.value = _i18n.getMessage("menu_button_ok");
				container.appendChild(input_ok);
				input_ok.onclick = function(){
					ButtonOnClick();
				};
			})();
		}

		// --------------------------------------------------------------------------------
		// コンボボックス
		// --------------------------------------------------------------------------------
		function UI_ComboBox(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// アイテム追加
			// --------------------------------------------------------------------------------
			_this.attachItem = function(label,value){
				var item = DocumentCreateElement("option");
				ElementSetStyle(item,"margin:2px 0px;");
				ElementSetTextContent(item,label);
				item.value = value;
				_combo_box.appendChild(item);
			};

			// --------------------------------------------------------------------------------
			// 値を取得
			// --------------------------------------------------------------------------------
			_this.getValue = function(){
				return _combo_box.value;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				_combo_box.value = v;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _combo_box;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px;");
				parent.appendChild(container);

				_combo_box = DocumentCreateElement("select");
				ElementSetStyle(_combo_box,"width:auto; min-width:200px; height:22px; font-size:14px; box-sizing:border-box; display:block;");
				container.appendChild(_combo_box);

				_combo_box.onchange = function(){
					_this.onchange(_combo_box.value);
				};
			})();
		}

		// --------------------------------------------------------------------------------
		// リストボックス
		// --------------------------------------------------------------------------------
		function UI_ListBox(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// アイテム追加
			// --------------------------------------------------------------------------------
			_this.attachItem = function(label,value){
				var item = DocumentCreateElement("option");
				ElementSetStyle(item,"margin:2px 0px;");
				ElementSetTextContent(item,label);
				item.value = value;
				_list.appendChild(item);
			};

			// --------------------------------------------------------------------------------
			// 値を取得
			// --------------------------------------------------------------------------------
			_this.getValue = function(v){
				return _list.value;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				_list.value = v;
			};

			// --------------------------------------------------------------------------------
			// 有無の設定
			// --------------------------------------------------------------------------------
			_this.setEnable = function(type){
				_list.disabled = ((!type) ? true : false);
			};

			// --------------------------------------------------------------------------------
			// 複数選択設定
			// --------------------------------------------------------------------------------
			_this.setMultiple = function(type){
				_list.multiple = type;
			};

			// --------------------------------------------------------------------------------
			// リストサイズをセット
			// --------------------------------------------------------------------------------
			_this.setListSize = function(v){
				_list.size = v;
			};

			// --------------------------------------------------------------------------------
			// 選択されたアイテムをすべて取得
			// --------------------------------------------------------------------------------
			_this.getSelectedValues = function(){
				var ary = new Array();
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					var option = a[i];
					if(option.selected){
						ary.push(option.value);
					}
				}
				return ary;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _list;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px;");
				parent.appendChild(container);

				_list = DocumentCreateElement("select");
				_list.size = 10;
				ElementSetStyle(_list,"width:100%; box-sizing:border-box; display:block; font-size:14px; background:#fff;");
				container.appendChild(_list);

				_list.onchange = function(){
					_this.onchange(_list.value);
				};
			})();
		}

		// --------------------------------------------------------------------------------
		// 正規表現リスト
		// --------------------------------------------------------------------------------
		function UI_RegExpList(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// カスタムオブジェクトを関連付け
			// --------------------------------------------------------------------------------
			_this.attachArray = function(ary){
				// クリア
				_this.clear();

				_regexp_list = ObjectCopy(ary);

				// リストに登録
				var i;
				var num = _regexp_list.length;
				for(i=0;i<num;i++){
					attachItem(i);
				}
				
				_this.select(-1);
			};

			// --------------------------------------------------------------------------------
			// クリア
			// --------------------------------------------------------------------------------
			_this.clear = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=num-1;i>=0;i--){
					removeItem(a[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 表示更新
			// --------------------------------------------------------------------------------
			_this.update = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					updateItem(a[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 追加
			// --------------------------------------------------------------------------------
			function addClick(){
				_regexp_list.push(RegExpObjectCreate());

				var id = _regexp_list.length - 1;
				attachItem(id);
				_this.update();
				_this.select(id);
				_this.onchange(_regexp_list);
			}

			// --------------------------------------------------------------------------------
			// 削除
			// --------------------------------------------------------------------------------
			function deleteClick(){
				var changed = false;
				var a = _list.options;
				var i;
				var num = a.length;

				for(i=num-1;i>=0;i--){
					var item = a[i];
					if(item.selected){
						// 抹消
						_regexp_list.splice(i,1);
						removeItem(item);
						changed = true;
					}
				}

				if(changed){
					var a = _list.options;
					var i;
					var num = a.length;
					for(i=0;i<num;i++){
						a[i].value = i;
					}

					_this.update();
					onselect(_list.selectedIndex);
					_this.onchange(_regexp_list);
				}
			}

			// --------------------------------------------------------------------------------
			// 優先度アップ（内部用 ）
			// --------------------------------------------------------------------------------
			function moveUpClick(){
				var changed = false;
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 先頭が選択されている
				if(a[0].selected)	return;

				for(i=1;i<num;i++){
					if(a[i].selected){
						var c = a[i];
						var t = c.previousSibling;
						t.selected = true;
						c.selected = false;

						var j = i;
						var k = (i-1);
						t = _regexp_list[k];
						_regexp_list[k] = _regexp_list[j];
						_regexp_list[j] = t;
						changed = true;
					}
				}

				if(changed){
					_this.update();
					_this.onchange(_regexp_list);
				}
			}

			// --------------------------------------------------------------------------------
			// 優先度ダウン（内部用 ）
			// --------------------------------------------------------------------------------
			function moveDownClick(){
				var changed = false;
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 先頭が選択されている
				if(a[num - 1].selected)	return;

				for(i=num - 2;i>=0;i--){
					if(a[i].selected){
						var c = a[i];
						var t = c.nextSibling;
						t.selected = true;
						c.selected = false;

						var j = i;
						var k = (i+1);
						t = _regexp_list[k];
						_regexp_list[k] = _regexp_list[j];
						_regexp_list[j] = t;
						changed = true;
					}
				}

				if(changed){
					_this.update();
					_this.onchange(_regexp_list);
				}
			}

			// --------------------------------------------------------------------------------
			// 選択されたアイテムをすべて取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndices = function(){
				var ary = new Array();
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					if(a[i].selected){
						ary.push(i);
					}
				}
				return ary;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// 選択イベント
			// --------------------------------------------------------------------------------
			_this.onselect = function(){};

			// --------------------------------------------------------------------------------
			// 選択イベント（内部用）
			// --------------------------------------------------------------------------------
			function onselect(id){
				var text_regexp = _text_regexp.getElement();
				if(id >= 0){
					_text_regexp.setValue(_regexp_list[id]);
					parent.appendChild(text_regexp);
				}else{
					DomNodeRemove(text_regexp);
				}
				_this.onselect(id);
			}

			// --------------------------------------------------------------------------------
			// リストを選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_list.selectedIndex = id;
				onselect(id);
			};

			// --------------------------------------------------------------------------------
			// アイテム追加（内部用 ）
			// --------------------------------------------------------------------------------
			function attachItem(id){
				var item = DocumentCreateElement("option");
				ElementSetStyle(item,"margin:2px 0px;");

				item.value = id;
				_list.appendChild(item);

				item.onmousedown = item.onmouseup = function(){
					_select_mouse = id;
				};
				updateItem(item);
			}

			// --------------------------------------------------------------------------------
			// アイテム更新（内部用 ）
			// --------------------------------------------------------------------------------
			function updateItem(item){
				var id = parseInt(item.value);
				ElementSetTextContent(item,"" + RegExpObjectGetRegExp(_regexp_list[id]));
			}

			// --------------------------------------------------------------------------------
			// アイテム削除（内部用 ）
			// --------------------------------------------------------------------------------
			function removeItem(item){
				DomNodeRemove(item);
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _regexp_list;
			var _list;
			var _select_id;
			var _select_mouse;
			var _text_regexp;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px; display:table; width:100%;");
				parent.appendChild(container);

				var list_container = DocumentCreateElement("div");
				ElementSetStyle(list_container,"display:table-cell; vertical-align:top; width:auto;");
				container.appendChild(list_container);

				// リスト
				_list = DocumentCreateElement("select");
				_list.size = 8;
				_list.multiple = true;
				ElementSetStyle(_list,"width:100%; box-sizing:border-box; display:block; font-size:14px; background:#fff;");
				list_container.appendChild(_list);
				_list.onchange = function(e){
					_select_id = _list.selectedIndex;
					var o = _list.options[_select_mouse];
					if(o !== undefined){
						if(o.selected){
							_select_id = _select_mouse;
						}
					}
					onselect(_select_id);
				};

				var button_container = DocumentCreateElement("div");
				ElementSetStyle(button_container,"display:table-cell; vertical-align:top; width:150px;");
				container.appendChild(button_container);

				var button_add = DocumentCreateElement("input");
				button_add.type = "button";
				button_add.value = _i18n.getMessage("menu_regexp_list_button_add");
				ElementSetStyle(button_add,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_add);
				button_add.onclick = function(){
					addClick();
				};

				var button_delete = DocumentCreateElement("input");
				button_delete.type = "button";
				button_delete.value = _i18n.getMessage("menu_regexp_list_button_delete");
				ElementSetStyle(button_delete,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_delete);
				button_delete.onclick = function(){
					deleteClick();
				};

				var button_move_up = DocumentCreateElement("input");
				button_move_up.type = "button";
				button_move_up.value = _i18n.getMessage("menu_regexp_list_button_move_up");
				ElementSetStyle(button_move_up,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_move_up);
				button_move_up.onclick = function(){
					moveUpClick();
				};

				var button_move_down = DocumentCreateElement("input");
				button_move_down.type = "button";
				button_move_down.value = _i18n.getMessage("menu_regexp_list_button_move_down");
				ElementSetStyle(button_move_down,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_move_down);
				button_move_down.onclick = function(){
					moveDownClick();
				};

				_text_regexp = new UI_TextRegExp(parent);
				_text_regexp.oninput = function(v){
					var a = _list.options;
					var i;
					var num = a.length;
					for(i=0;i<num;i++){
						if(a[i].selected){
							_regexp_list[i] = ObjectCopy(v);
							updateItem(a[i]);
						}
					}
					_this.onchange(_regexp_list);
				};

			})();
		}

		// --------------------------------------------------------------------------------
		// コンボボックス+ボタン
		// --------------------------------------------------------------------------------
		function UI_ComboBoxButton(parent,label){
			var _this = this;

			// --------------------------------------------------------------------------------
			// アイテム追加
			// --------------------------------------------------------------------------------
			_this.attachItem = function(label,value){
				var item = DocumentCreateElement("option");
				ElementSetStyle(item,"margin:2px 0px;");
				ElementSetTextContent(item,label);
				item.value = value;
				_combo_box.appendChild(item);
			};

			// --------------------------------------------------------------------------------
			// アイテムクリア
			// --------------------------------------------------------------------------------
			_this.clearItem = function(){
				var options = _combo_box.options;
				var i;
				var num = options.length;
				for(i=num-1;i>=0;i--){
					DomNodeRemove(options[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 選択番号を取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndex = function(){
				return _combo_box.selectedIndex;
			};

			// --------------------------------------------------------------------------------
			// 値をセット
			// --------------------------------------------------------------------------------
			_this.setValue = function(v){
				_combo_box.value = v;
			};

			// --------------------------------------------------------------------------------
			// ボタンクリックイベント
			// --------------------------------------------------------------------------------
			_this.onclick = function(){};

			// --------------------------------------------------------------------------------
			// 変更イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _combo_box;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px; display:table; width:100%;");
				parent.appendChild(container);

				var combo_box_container = DocumentCreateElement("div");
				ElementSetStyle(combo_box_container,"display:table-cell; widht:auto;");
				container.appendChild(combo_box_container);

				_combo_box = DocumentCreateElement("select");
				ElementSetStyle(_combo_box,"width:100%; height:22px; box-sizing:border-box; display:block; font-size:14px;");
				combo_box_container.appendChild(_combo_box);
				_combo_box.onchange = function(){
					_this.onchange(_combo_box.value);
				};

				var button_container = DocumentCreateElement("div");
				ElementSetStyle(button_container,"display:table-cell; width:50px;");
				container.appendChild(button_container);

				var button = DocumentCreateElement("input");
				button.type = "button";
				ElementSetStyle(button,"width:100%; padding:2px 0px;");
				button.value = label;
				button_container.appendChild(button);
				button.onclick = function(){
					_this.onclick();
				};
			})();
		}

		// --------------------------------------------------------------------------------
		// 掲示板拡張用リスト
		// --------------------------------------------------------------------------------
		function UI_ExpandBbsList(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// カスタムオブジェクトを関連付け
			// --------------------------------------------------------------------------------
			_this.attachExpandBbsData = function(obj){
				_expand_bbs = obj;

				// リストに登録
				var i;
				var num = _expand_bbs.length;
				for(i=0;i<num;i++){
					attachItem(i);
				}
			};

			// --------------------------------------------------------------------------------
			// クリア
			// --------------------------------------------------------------------------------
			_this.clear = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=num-1;i>=0;i--){
					removeItem(a[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 表示更新
			// --------------------------------------------------------------------------------
			_this.update = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					updateItem(a[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 追加
			// --------------------------------------------------------------------------------
			function addClick(){

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_expand_bbs_add_dialog"));

				// 名前
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_expand_bbs_add_dialog_name"));
				var parent = container.getElement();
				var text_input_name = new UI_TextInput(parent);

				// 既存のURLマッピング設定から複製する
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_expand_bbs_add_dialog_copy_define"));
				var parent = container.getElement();
				var list_box_expand_bbs = new UI_ListBox(parent);

				var i;
				var num = _expand_bbs.length;
				for(i=0;i<num;i++){
					var urlmap = ProjectObjectGetActiveData(_expand_bbs[i]);
					list_box_expand_bbs.attachItem(LocaleObjectGetString(urlmap.name),_expand_bbs[i].id);
				}
				list_box_expand_bbs.attachItem(_i18n.getMessage("menu_setting_expand_bbs_add_dialog_define_list_box_item_new"),"");
				list_box_expand_bbs.setValue("");

				// Yes No ボタン
				var yes_no_button = new UI_YesNoButton(dialog_parent);
				yes_no_button.onclick = function(v){

					if(v){
						// 辞書作成
						var dic = new Object();
						var i;
						var num = _expand_bbs.length;
						for(i=0;i<num;i++){
							dic[_expand_bbs[i].id] = _expand_bbs[i];
						}

						// ユニーク名を作成
						i = 0;
						while(dic["user" + i]){
							i++;
						}
						var id = "user" + i;

						var obj;
						if(dic[list_box_expand_bbs.getValue()]){
							// 設定を複製
							obj = ObjectCopy(dic[list_box_expand_bbs.getValue()]);
							// プリセットを昇格
							if(!(obj.user))	obj.user = obj.preset;
							// プリセットを破棄
							delete obj.preset;
						}else{
							// 新規作成
							obj = createExpandBbsData();
						}

						// 名前をセット
						var c = ProjectObjectGetActiveData(obj);
						c.name = LocaleObjectCreate();
						LocaleObjectSetString(c.name,text_input_name.getValue());

						// IDをセット
						obj.id = id;

						// 先頭に挿入
						_expand_bbs.unshift(obj);

						// 再構築
						_this.clear();
						_this.attachExpandBbsData(_expand_bbs);
						projectModify();

						// 選択
						_this.select(0);
					}

					// ダイアログ終了
					dialog.close();
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// 削除
			// --------------------------------------------------------------------------------
			function deleteClick(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=num-1;i>=0;i--){
					var item = a[i];
					if(item.selected){
						var c = _dictionary[item.value];
						if(c.preset){
							// プリセットに降格
							delete c.user;
						}else{
							// 抹消
							_expand_bbs.splice(i,1);
							removeItem(item);
						}
					}
				}

				_this.update();
				_this.onselect(_list.selectedIndex);
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// 優先度アップ（内部用 ）
			// --------------------------------------------------------------------------------
			function prioUpClick(){
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 先頭が選択されている
				if(a[0].selected)	return;

				for(i=1;i<num;i++){
					if(a[i].selected){
						var c = a[i];
						var t = c.previousSibling;
						DomNodeRemove(c);
						_list.insertBefore(c,t);

						var j = i;
						var k = (i-1);
						t = _expand_bbs[k];
						_expand_bbs[k] = _expand_bbs[j];
						_expand_bbs[j] = t;
					}
				}

				_this.update();
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// 優先度ダウン（内部用 ）
			// --------------------------------------------------------------------------------
			function prioDownClick(){
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 先頭が選択されている
				if(a[num - 1].selected)	return;

				for(i=num - 2;i>=0;i--){
					if(a[i].selected){
						var c = a[i];
						var t = c.nextSibling;
						DomNodeRemove(c);
						_list.insertBefore(c,t.nextSibling);

						var j = i;
						var k = (i+1);
						t = _expand_bbs[k];
						_expand_bbs[k] = _expand_bbs[j];
						_expand_bbs[j] = t;
					}
				}

				_this.update();
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// エクスポート（内部用 ）
			// --------------------------------------------------------------------------------
			function exportClick(){

				var proj = page_expand_project.getObject();
				var export_obj = new Object();
				var ary = new Array();

				var a = _list.options;
				var i;
				var num = a.length;

				for(i=0;i<num;i++){
					if(a[i].selected){
						ary.push(ObjectCopy(_expand_bbs[i]));
					}
				}

				export_obj.version = proj.version;
				export_obj.setting_export = {
					type:"expand_bbs"
				};
				export_obj.expand_bbs = ary;

				// プリセットを除去
				export_obj = PageExpandProjectObjectRemovePreset(export_obj);

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_expand_bbs_export_dialog"));

				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_expand_bbs_export_dialog_export"));
				var parent = container.getElement();

				var text_area = new UI_TextArea(parent);
				text_area.setValue(JsonStringify(export_obj));

				new UI_TextHint(parent,_i18n.getMessage("menu_setting_expand_bbs_export_dialog_export_hint"));

				// Ok ボタン
				var yes_no_button = new UI_OkButton(dialog_parent);
				yes_no_button.onclick = function(v){
					// ダイアログ終了
					dialog.close();
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// インポート（内部用 ）
			// --------------------------------------------------------------------------------
			function importClick(){

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_expand_bbs_import_dialog"));

				// 名前
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_expand_bbs_import_dialog_explanation"));
				var parent = container.getElement();
				var unordered_list = new UI_UnorderedList(parent);
				unordered_list.addListItem(_i18n.getMessage("menu_setting_expand_bbs_import_dialog_explanation_0"));
				unordered_list.addListItem(_i18n.getMessage("menu_setting_expand_bbs_import_dialog_explanation_1"));
				unordered_list.addListItem(_i18n.getMessage("menu_setting_expand_bbs_import_dialog_explanation_2"));

				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_expand_bbs_import_dialog_import"));
				var parent = container.getElement();

				var text_area_import = new UI_TextArea(parent);

				new UI_TextHint(parent,_i18n.getMessage("menu_setting_expand_bbs_import_dialog_import_hint"));

				// 実行しますか？
				var container = new UI_LineContainer(dialog_parent,null);
				var parent = container.getElement();
				new UI_Text(parent,_i18n.getMessage("menu_setting_expand_bbs_import_dialog_confirm"));

				// Yes No ボタン
				var yes_no_button = new UI_YesNoButton(dialog_parent);
				yes_no_button.onclick = function(v){

					if(!v){
						// ダイアログ終了
						dialog.close();
						return;
					}

					function ExpandBbsImportFailure(message){
						// 結果を表示
						var alert_dialog = new UI_AlertDialog(dialog_parent,_i18n.getMessage("menu_setting_expand_bbs_import_alert"));
						new UI_Text(alert_dialog.getElement(),_i18n.getMessage("menu_setting_expand_bbs_import_alert_failure"));
						new UI_Text(alert_dialog.getElement(),message);
						alert_dialog.oncomplete = function(){
							// ダイアログ終了
							dialog.close();
						};
						alert_dialog.open();
					}

					try{
						var proj_obj = page_expand_project.getObject();
						var import_obj = JsonParse(text_area_import.getValue());

						// バージョンが一致しない
						if(import_obj.version > proj_obj.version){
							throw "Error: It is a version not supported.";
						}

						// 出力タイプチェック
						var error = true;
						try{
							switch(import_obj.setting_export.type){
							case "expand_bbs":
								error = false;
								break;
							}
						}catch(e){}

						if(error){
							throw "Error: It is a type not supported.";
						}

						// 定義をインポート
						PageExpandProjectObjectImportExpandBbs(proj_obj,import_obj);

						projectSave(function(e){
							if(!e.result){
								ExpandBbsImportFailure(e.message);
								return;
							}

							text_area_import.setValue("");

							// 結果を表示
							var alert_dialog = new UI_AlertDialog(dialog_parent,_i18n.getMessage("menu_setting_expand_bbs_import_alert"));
							new UI_Text(alert_dialog.getElement(),_i18n.getMessage("menu_setting_expand_bbs_import_alert_success"));
							alert_dialog.oncomplete = function(){

								// フェードアウト完了後
								dialog.oncomplete = function(){

									// リロード
									_this.onreload();
								};

								// ダイアログ終了
								dialog.close();
							};
							alert_dialog.open();
						});

					}catch(e){
						ExpandBbsImportFailure(e);
					}
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// 選択されたアイテムをすべて取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndices = function(){
				var ary = new Array();
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					if(a[i].selected){
						ary.push(i);
					}
				}
				return ary;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// 選択イベント
			// --------------------------------------------------------------------------------
			_this.onselect = function(){};

			// --------------------------------------------------------------------------------
			// リロードイベント
			// --------------------------------------------------------------------------------
			_this.onreload = function(){};

			// --------------------------------------------------------------------------------
			// リストを選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_list.selectedIndex = _select_id = _select_mouse = id;
				_this.onselect(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				var dic = new Object();
				var i;
				var num = _expand_bbs.length;
				for(i=0;i<num;i++){
					dic[_expand_bbs[i].id] = i;
				}
				
				num = list.length;
				var index = dic[list[num - 1]];
				if(index !== undefined){
					_list.selectedIndex = _select_id = index;
				}
				var a = _list.options;
				for(i=0;i<num;i++){
					if(dic[list[i]] !== undefined){
						var o = a[dic[list[i]]];
						if(o) o.selected = true;
					}
				}
				if(index !== undefined){
					_this.onselect(index);
				}
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				var selected_defines = new Array();
				var a = _this.getSelectedIndices();
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					selected_defines.push(_expand_bbs[a[i]].id);
				}
				if(_expand_bbs[_select_id]){
					selected_defines.push(_expand_bbs[_select_id].id);
				}

				// 履歴更新
				_history_state.selected_defines = selected_defines;
				delete _history_state.selected_filters;
			};

			// --------------------------------------------------------------------------------
			// アイテム追加（内部用 ）
			// --------------------------------------------------------------------------------
			function attachItem(id){
				var item = DocumentCreateElement("option");
				ElementSetStyle(item,"margin:2px 0px;");

				item.value = _expand_bbs[id].id;
				_dictionary[item.value] = _expand_bbs[id];
				_list.appendChild(item);

				item.onmousedown = item.onmouseup = function(){
					_select_mouse = id;
				};
				updateItem(item);
			}

			// --------------------------------------------------------------------------------
			// アイテム更新（内部用 ）
			// --------------------------------------------------------------------------------
			function updateItem(item){
				var urlmap;
				var c = _dictionary[item.value];
				if(c.preset){
					item.style.color = "#ccc";
				}
				if(c.user){
					item.style.color = "#000";
				}
				urlmap = ProjectObjectGetActiveData(c);
				ElementSetTextContent(item,LocaleObjectGetString(urlmap.name));
			}

			// --------------------------------------------------------------------------------
			// アイテム削除（内部用 ）
			// --------------------------------------------------------------------------------
			function removeItem(item){
				var c = _dictionary[item.value];
				DomNodeRemove(item);
				delete _dictionary[item.value];
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _expand_bbs;
			var _dictionary;
			var _list;
			var _select_id;
			var _select_mouse;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_dictionary = new Object();

				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px; display:table; width:100%;");
				parent.appendChild(container);

				var list_container = DocumentCreateElement("div");
				ElementSetStyle(list_container,"display:table-cell; vertical-align:top; width:auto;");
				container.appendChild(list_container);

				// リスト
				_list = DocumentCreateElement("select");
				_list.size = 10;
				_list.multiple = true;
				ElementSetStyle(_list,"width:100%; box-sizing:border-box; display:block; font-size:14px; background:#fff;");
				list_container.appendChild(_list);
				_list.onchange = function(e){
					_select_id = _list.selectedIndex;
					var o = _list.options[_select_mouse];
					if(o !== undefined){
						if(o.selected){
							_select_id = _select_mouse;
						}
					}
					_this.onselect(_select_id);
					_this.replaceHistory();
				};

				var button_container = DocumentCreateElement("div");
				ElementSetStyle(button_container,"display:table-cell; vertical-align:top; width:150px;");
				container.appendChild(button_container);

				var button_add = DocumentCreateElement("input");
				button_add.type = "button";
				button_add.value = _i18n.getMessage("menu_setting_expand_bbs_button_add");
				ElementSetStyle(button_add,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_add);
				button_add.onclick = function(){
					addClick();
				};

				var button_delete = DocumentCreateElement("input");
				button_delete.type = "button";
				button_delete.value = _i18n.getMessage("menu_setting_expand_bbs_button_delete");
				ElementSetStyle(button_delete,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_delete);
				button_delete.onclick = function(){
					deleteClick();
				};

				var button_prio_up = DocumentCreateElement("input");
				button_prio_up.type = "button";
				button_prio_up.value = _i18n.getMessage("menu_setting_expand_bbs_button_prio_up");
				ElementSetStyle(button_prio_up,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_prio_up);
				button_prio_up.onclick = function(){
					prioUpClick();
				};

				var button_prio_down = DocumentCreateElement("input");
				button_prio_down.type = "button";
				button_prio_down.value = _i18n.getMessage("menu_setting_expand_bbs_button_prio_down");
				ElementSetStyle(button_prio_down,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_prio_down);
				button_prio_down.onclick = function(){
					prioDownClick();
				};

				var button_export = DocumentCreateElement("input");
				button_export.type = "button";
				button_export.value = _i18n.getMessage("menu_setting_expand_bbs_button_export");
				ElementSetStyle(button_export,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_export);
				button_export.onclick = function(){
					exportClick();
				};

				var button_import = DocumentCreateElement("input");
				button_import.type = "button";
				button_import.value = _i18n.getMessage("menu_setting_expand_bbs_button_import");
				ElementSetStyle(button_import,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_import);
				button_import.onclick = function(){
					importClick();
				};

				new UI_TextHint(parent,_i18n.getMessage("menu_setting_expand_bbs_list_hint"));
			})();
		}

		// --------------------------------------------------------------------------------
		// URLマッピング用リスト
		// --------------------------------------------------------------------------------
		function UI_UrlMapList(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// カスタムオブジェクトを関連付け
			// --------------------------------------------------------------------------------
			_this.attachUrlMapData = function(obj){
				_urlmap = obj;

				// リストに登録
				var i;
				var num = _urlmap.length;
				for(i=0;i<num;i++){
					attachItem(i);
				}
			};

			// --------------------------------------------------------------------------------
			// クリア
			// --------------------------------------------------------------------------------
			_this.clear = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=num-1;i>=0;i--){
					removeItem(a[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 表示更新
			// --------------------------------------------------------------------------------
			_this.update = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					updateItem(a[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 追加
			// --------------------------------------------------------------------------------
			function addClick(){

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_urlmap_add_dialog"));

				// 名前
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_urlmap_add_dialog_name"));
				var parent = container.getElement();
				var text_input_name = new UI_TextInput(parent);

				// 既存のURLマッピング設定から複製する
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_urlmap_add_dialog_copy_define"));
				var parent = container.getElement();
				var list_box_urlmap = new UI_ListBox(parent);

				var i;
				var num = _urlmap.length;
				for(i=0;i<num;i++){
					var urlmap = ProjectObjectGetActiveData(_urlmap[i]);
					list_box_urlmap.attachItem(LocaleObjectGetString(urlmap.name),_urlmap[i].id);
				}
				list_box_urlmap.attachItem(_i18n.getMessage("menu_setting_urlmap_add_dialog_define_list_box_item_new"),"");
				list_box_urlmap.setValue("");

				// Yes No ボタン
				var yes_no_button = new UI_YesNoButton(dialog_parent);
				yes_no_button.onclick = function(v){

					if(v){
						// 辞書作成
						var dic = new Object();
						var i;
						var num = _urlmap.length;
						for(i=0;i<num;i++){
							dic[_urlmap[i].id] = _urlmap[i];
						}

						// ユニーク名を作成
						i = 0;
						while(dic["user" + i]){
							i++;
						}
						var id = "user" + i;

						var obj;
						if(dic[list_box_urlmap.getValue()]){
							// 設定を複製
							obj = ObjectCopy(dic[list_box_urlmap.getValue()]);
							// プリセットを昇格
							if(!(obj.user))	obj.user = obj.preset;
							// プリセットを破棄
							delete obj.preset;
						}else{
							// 新規作成
							obj = createUrlMapData();
						}

						// 名前をセット
						var c = ProjectObjectGetActiveData(obj);
						c.name = LocaleObjectCreate();
						LocaleObjectSetString(c.name,text_input_name.getValue());

						// IDをセット
						obj.id = id;

						// 先頭に挿入
						_urlmap.unshift(obj);

						// 再構築
						_this.clear();
						_this.attachUrlMapData(_urlmap);
						projectModify();

						// 選択
						_this.select(0);
					}

					// ダイアログ終了
					dialog.close();
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// 削除
			// --------------------------------------------------------------------------------
			function deleteClick(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=num-1;i>=0;i--){
					var item = a[i];
					if(item.selected){
						var c = _dictionary[item.value];
						if(c.preset){
							// プリセットに降格
							delete c.user;
						}else{
							// 抹消
							_urlmap.splice(i,1);
							removeItem(item);
						}
					}
				}

				_this.update();
				_this.onselect(_list.selectedIndex);
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// 優先度アップ（内部用 ）
			// --------------------------------------------------------------------------------
			function prioUpClick(){
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 先頭が選択されている
				if(a[0].selected)	return;

				for(i=1;i<num;i++){
					if(a[i].selected){
						var c = a[i];
						var t = c.previousSibling;
						DomNodeRemove(c);
						_list.insertBefore(c,t);

						var j = i;
						var k = (i-1);
						t = _urlmap[k];
						_urlmap[k] = _urlmap[j];
						_urlmap[j] = t;
					}
				}

				_this.update();
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// 優先度ダウン（内部用 ）
			// --------------------------------------------------------------------------------
			function prioDownClick(){
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 先頭が選択されている
				if(a[num - 1].selected)	return;

				for(i=num - 2;i>=0;i--){
					if(a[i].selected){
						var c = a[i];
						var t = c.nextSibling;
						DomNodeRemove(c);
						_list.insertBefore(c,t.nextSibling);

						var j = i;
						var k = (i+1);
						t = _urlmap[k];
						_urlmap[k] = _urlmap[j];
						_urlmap[j] = t;
					}
				}

				_this.update();
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// 選択されたアイテムをすべて取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndices = function(){
				var ary = new Array();
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					if(a[i].selected){
						ary.push(i);
					}
				}
				return ary;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// 選択イベント
			// --------------------------------------------------------------------------------
			_this.onselect = function(){};

			// --------------------------------------------------------------------------------
			// リストを選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_list.selectedIndex = id;
				_this.onselect(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				var dic = new Object();
				var i;
				var num = _urlmap.length;
				for(i=0;i<num;i++){
					dic[_urlmap[i].id] = i;
				}
				
				num = list.length;
				var index = dic[list[num - 1]];
				if(index !== undefined){
					_list.selectedIndex = _select_id = index;
				}
				var a = _list.options;
				for(i=0;i<num;i++){
					if(dic[list[i]] !== undefined){
						var o = a[dic[list[i]]];
						if(o) o.selected = true;
					}
				}
				if(index !== undefined){
					_this.onselect(index);
				}
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				var selected_defines = new Array();
				var a = _this.getSelectedIndices();
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					selected_defines.push(_urlmap[a[i]].id);
				}
				if(_urlmap[_select_id]){
					selected_defines.push(_urlmap[_select_id].id);
				}

				// 履歴更新
				_history_state.selected_defines = selected_defines;
				delete _history_state.selected_filters;
			};

			// --------------------------------------------------------------------------------
			// アイテム追加（内部用 ）
			// --------------------------------------------------------------------------------
			function attachItem(id){
				var item = DocumentCreateElement("option");
				ElementSetStyle(item,"margin:2px 0px;");

				item.value = _urlmap[id].id;
				_dictionary[item.value] = _urlmap[id];
				_list.appendChild(item);

				item.onmousedown = item.onmouseup = function(){
					_select_mouse = id;
				};
				updateItem(item);
			}

			// --------------------------------------------------------------------------------
			// アイテム更新（内部用 ）
			// --------------------------------------------------------------------------------
			function updateItem(item){
				var urlmap;
				var c = _dictionary[item.value];
				if(c.preset){
					item.style.color = "#ccc";
				}
				if(c.user){
					item.style.color = "#000";
				}
				urlmap = ProjectObjectGetActiveData(c);
				ElementSetTextContent(item,LocaleObjectGetString(urlmap.name));
			}

			// --------------------------------------------------------------------------------
			// アイテム削除（内部用 ）
			// --------------------------------------------------------------------------------
			function removeItem(item){
				var c = _dictionary[item.value];
				DomNodeRemove(item);
				delete _dictionary[item.value];
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _urlmap;
			var _dictionary;
			var _list;
			var _select_id;
			var _select_mouse;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_dictionary = new Object();

				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px; display:table; width:100%;");
				parent.appendChild(container);

				var list_container = DocumentCreateElement("div");
				ElementSetStyle(list_container,"display:table-cell; vertical-align:top; width:auto;");
				container.appendChild(list_container);

				// リスト
				_list = DocumentCreateElement("select");
				_list.size = 10;
				_list.multiple = true;
				ElementSetStyle(_list,"width:100%; box-sizing:border-box; display:block; font-size:14px; background:#fff;");
				list_container.appendChild(_list);
				_list.onchange = function(e){
					_select_id = _list.selectedIndex;
					var o = _list.options[_select_mouse];
					if(o !== undefined){
						if(o.selected){
							_select_id = _select_mouse;
						}
					}
					_this.onselect(_select_id);
					_this.replaceHistory();
				};

				var button_container = DocumentCreateElement("div");
				ElementSetStyle(button_container,"display:table-cell; vertical-align:top; width:150px;");
				container.appendChild(button_container);

				var button_add = DocumentCreateElement("input");
				button_add.type = "button";
				button_add.value = _i18n.getMessage("menu_setting_urlmap_button_add");
				ElementSetStyle(button_add,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_add);
				button_add.onclick = function(){
					addClick();
				};

				var button_delete = DocumentCreateElement("input");
				button_delete.type = "button";
				button_delete.value = _i18n.getMessage("menu_setting_urlmap_button_delete");
				ElementSetStyle(button_delete,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_delete);
				button_delete.onclick = function(){
					deleteClick();
				};

				var button_prio_up = DocumentCreateElement("input");
				button_prio_up.type = "button";
				button_prio_up.value = _i18n.getMessage("menu_setting_urlmap_button_prio_up");
				ElementSetStyle(button_prio_up,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_prio_up);
				button_prio_up.onclick = function(){
					prioUpClick();
				};

				var button_prio_down = DocumentCreateElement("input");
				button_prio_down.type = "button";
				button_prio_down.value = _i18n.getMessage("menu_setting_urlmap_button_prio_down");
				ElementSetStyle(button_prio_down,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_prio_down);
				button_prio_down.onclick = function(){
					prioDownClick();
				};

				new UI_TextHint(parent,_i18n.getMessage("menu_setting_urlmap_list_hint"));
			})();
		}

		// --------------------------------------------------------------------------------
		// 定義用リスト
		// --------------------------------------------------------------------------------
		function UI_DefineList(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// カスタムオブジェクトを関連付け
			// --------------------------------------------------------------------------------
			_this.attachDefineData = function(obj){
				_define = obj;

				// リストに登録
				var i;
				var num = _define.length;
				for(i=0;i<num;i++){
					attachItem(i);
				}
			};

			// --------------------------------------------------------------------------------
			// 定義の識別名をセット
			// --------------------------------------------------------------------------------
			_this.setDefineAssetName = function(asset){
				_define_id = asset;
			};

			// --------------------------------------------------------------------------------
			// 新規データ作成用関数をセット
			// --------------------------------------------------------------------------------
			_this.setFunctionForNewData = function(f){
				_new_data_func = f;
			};

			// --------------------------------------------------------------------------------
			// クリア
			// --------------------------------------------------------------------------------
			_this.clear = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=num-1;i>=0;i--){
					removeItem(a[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 表示更新
			// --------------------------------------------------------------------------------
			_this.update = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					updateItem(a[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 追加
			// --------------------------------------------------------------------------------
			function addClick(){

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_define_add_dialog"));

				// 名前
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_define_add_dialog_name"));
				var parent = container.getElement();
				var text_input_name = new UI_TextInput(parent);

				// 既存のURLマッピング設定から複製する
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_define_add_dialog_copy_define"));
				var parent = container.getElement();
				var list_box_define = new UI_ListBox(parent);

				var i;
				var num = _define.length;
				for(i=0;i<num;i++){
					var define = ProjectObjectGetActiveData(_define[i]);
					list_box_define.attachItem(LocaleObjectGetString(define.name),_define[i].id);
				}
				list_box_define.attachItem(_i18n.getMessage("menu_setting_define_add_dialog_define_list_box_item_new"),"");
				list_box_define.setValue("");

				// Yes No ボタン
				var yes_no_button = new UI_YesNoButton(dialog_parent);
				yes_no_button.onclick = function(v){

					if(v){
						// 辞書作成
						var dic = new Object();
						var i;
						var num = _define.length;
						for(i=0;i<num;i++){
							dic[_define[i].id] = _define[i];
						}

						// ユニーク名を作成
						i = 0;
						while(dic["user" + i]){
							i++;
						}
						var id = "user" + i;

						var obj;
						if(dic[list_box_define.getValue()]){
							// 設定を複製
							obj = ObjectCopy(dic[list_box_define.getValue()]);
							// プリセットを昇格
							if(!(obj.user))	obj.user = obj.preset;
							// プリセットを破棄
							delete obj.preset;
						}else{
							// 新規作成
							obj = _new_data_func();
						}

						// 名前をセット
						var c = ProjectObjectGetActiveData(obj);
						c.name = LocaleObjectCreate();
						LocaleObjectSetString(c.name,text_input_name.getValue());

						// IDをセット
						obj.id = id;

						// 先頭に挿入
						_define.unshift(obj);

						// 再構築
						_this.clear();
						_this.attachDefineData(_define);
						projectModify();

						// 選択
						_this.select(0);
					}

					// ダイアログ終了
					dialog.close();
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// 削除
			// --------------------------------------------------------------------------------
			function deleteClick(){

				var proj = page_expand_project.getObject();
				var urlmap = proj.urlmap;

				// 削除対象をスタックに登録
				var stack = new Array();
				(function(){
					var a = _list.options;
					var i;
					var num = a.length;
					for(i=0;i<num;i++){
						var item = a[i];
						if(item.selected){
							stack.push({item:item,id:i});
						}
					}
				})();

				// 代替リスト
				var alive = new Array();
				(function(){
					var dictionary = new Object();
					var i;
					var num;
					num = stack.length;
					for(i=0;i<num;i++){
						var p = _dictionary[stack[i].item.value];
						if(p.preset){
						}else{
							dictionary[p.id] = p;
						}
					}
					num = _define.length;
					for(i=0;i<num;i++){
						var p = _define[i];
						if(!dictionary[p.id]){
							alive.push(p);
						}
					}
				})();

				// 逐次実行
				function execute(){
					while(true){
						var param = stack.pop();
						if(!param){
							_this.update();
							_this.onselect(_list.selectedIndex);
							projectModify();
							return;
						}

						// プリセットを保有するなら降格
						var define = _dictionary[param.item.value];
						if(define.preset){
							// プリセットに降格
							delete define.user;
							continue;
						}

						// URLマッピングで使用中か調べる
						var urlmap_use = new Array();
						(function(){
							var i;
							var num = urlmap.length;
							for(i=0;i<num;i++){
								var c = ProjectObjectGetActiveData(urlmap[i]);
								if(!c)	continue;
								var d = c[_define_id];
								if(d.enable){
									if((d.id) && (typeof(d.id) == "object")){
										var ary = d.id;
										var j;
										var ary_num = ary.length;
										for(j=0;j<ary_num;j++){
											if(ary[j] == define.id){
												urlmap_use.push(urlmap[i]);
												break;
											}
										}
									}else{
										if(d.id == define.id){
											urlmap_use.push(urlmap[i]);
										}
									}
								}
							}
						})();

						// ダイアログを表示して確認
						if(urlmap_use.length){

							// モーダルダイアログ作成
							var dialog = new UI_ModalDialog(_content_window);
							var dialog_parent = dialog.getElement();

							// タイトル
							var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_define_delete_dialog"));

							// 名前
							var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_define_delete_dialog_name"));
							var parent = container.getElement();
							var text_name = new UI_TextDynamic(parent);
							text_name.setValue(LocaleObjectGetString(define.user.name));

							// 既存のURLマッピング設定から複製する
							var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_define_delete_dialog_change_define"));
							var parent = container.getElement();
							var list_box_define = new UI_ListBox(parent);

							// 代替リスト
							(function(){
								var i;
								var num = alive.length;
								for(i=0;i<num;i++){
									var d = ProjectObjectGetActiveData(alive[i]);
									list_box_define.attachItem(LocaleObjectGetString(d.name),alive[i].id);
								}
								list_box_define.attachItem(_i18n.getMessage("menu_setting_define_delete_dialog_define_list_box_item_no_use"),"");
								list_box_define.setValue("");
							})();

							// Yes No ボタン
							var yes_no_button = new UI_YesNoButton(dialog_parent);
							yes_no_button.onclick = function(v){

								if(v){
									var i;
									var num = urlmap_use.length;
									for(i=0;i<num;i++){
										var c = urlmap_use[i].user;
										if(!c)	continue;
										var d = c[_define_id];
										if((d.id) && (typeof(d.id) == "object")){
											var ary = d.id;
											var j;
											var ary_num = ary.length;
											for(j=ary_num-1;j>=0;j--){
												if(ary[j] == define.id){
													if(list_box_define.getValue()){
														ary[j] = list_box_define.getValue();
													}else{
														ary.splice(j,1);
													}
												}
											}
											if(!(ary.length)){
												d.enable = false;
											}
										}else{
											if(list_box_define.getValue()){
												d.id = list_box_define.getValue();
												d.enable = true;
											}else{
												d.id = "";
												d.enable = false;
											}
										}
									}

									// 抹消
									_define.splice(param.id,1);
									removeItem(param.item);

									// 実行再開
									execute();
								}

								// ダイアログ終了
								dialog.close();
							};

							// ダイアログ開始
							dialog.open();

							// 表示更新
							_this.update();
							_this.onselect(_list.selectedIndex);
							projectModify();
							return;
						}else{
							// 抹消
							_define.splice(param.id,1);
							removeItem(param.item);
						}
					}
				}

				// 実行開始
				execute();

			}

			// --------------------------------------------------------------------------------
			// 上に移動（内部用 ）
			// --------------------------------------------------------------------------------
			function moveUpClick(){
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 先頭が選択されている
				if(a[0].selected)	return;

				for(i=1;i<num;i++){
					if(a[i].selected){
						var c = a[i];
						var t = c.previousSibling;
						DomNodeRemove(c);
						_list.insertBefore(c,t);

						var j = i;
						var k = (i-1);
						t = _define[k];
						_define[k] = _define[j];
						_define[j] = t;
					}
				}

				_this.update();
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// 下に移動（内部用 ）
			// --------------------------------------------------------------------------------
			function moveDownClick(){
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 先頭が選択されている
				if(a[num - 1].selected)	return;

				for(i=num - 2;i>=0;i--){
					if(a[i].selected){
						var c = a[i];
						var t = c.nextSibling;
						DomNodeRemove(c);
						_list.insertBefore(c,t.nextSibling);

						var j = i;
						var k = (i+1);
						t = _define[k];
						_define[k] = _define[j];
						_define[j] = t;
					}
				}

				_this.update();
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// エクスポート（内部用 ）
			// --------------------------------------------------------------------------------
			function exportClick(){

				var proj = page_expand_project.getObject();
				var export_obj = new Object();
				var ary = new Array();

				var a = _list.options;
				var i;
				var num = a.length;

				for(i=0;i<num;i++){
					if(a[i].selected){
						ary.push(ObjectCopy(_define[i]));
					}
				}

				export_obj.version = proj.version;
				export_obj.setting_export = {
					type:"define",
					asset:_define_id
				};
				export_obj[_define_id] = ary;

				// プリセットを除去
				export_obj = PageExpandProjectObjectRemovePreset(export_obj);

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_define_export_dialog"));

				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_define_export_dialog_export"));
				var parent = container.getElement();

				var text_area = new UI_TextArea(parent);
				text_area.setValue(JsonStringify(export_obj));

				new UI_TextHint(parent,_i18n.getMessage("menu_setting_define_export_dialog_export_hint"));

				// Ok ボタン
				var yes_no_button = new UI_OkButton(dialog_parent);
				yes_no_button.onclick = function(v){
					// ダイアログ終了
					dialog.close();
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// インポート（内部用 ）
			// --------------------------------------------------------------------------------
			function importClick(){

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_define_import_dialog"));

				// 名前
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_define_import_dialog_explanation"));
				var parent = container.getElement();
				var unordered_list = new UI_UnorderedList(parent);
				unordered_list.addListItem(_i18n.getMessage("menu_setting_define_import_dialog_explanation_0"));
				unordered_list.addListItem(_i18n.getMessage("menu_setting_define_import_dialog_explanation_1"));
				unordered_list.addListItem(_i18n.getMessage("menu_setting_define_import_dialog_explanation_2"));

				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_define_import_dialog_import"));
				var parent = container.getElement();

				var text_area_import = new UI_TextArea(parent);

				new UI_TextHint(parent,_i18n.getMessage("menu_setting_define_import_dialog_import_hint"));

				// 実行しますか？
				var container = new UI_LineContainer(dialog_parent,null);
				var parent = container.getElement();
				new UI_Text(parent,_i18n.getMessage("menu_setting_define_import_dialog_confirm"));

				// Yes No ボタン
				var yes_no_button = new UI_YesNoButton(dialog_parent);
				yes_no_button.onclick = function(v){

					if(!v){
						// ダイアログ終了
						dialog.close();
						return;
					}

					function DefineImportFailure(message){
						// 結果を表示
						var alert_dialog = new UI_AlertDialog(dialog_parent,_i18n.getMessage("menu_setting_define_import_alert"));
						new UI_Text(alert_dialog.getElement(),_i18n.getMessage("menu_setting_define_import_alert_failure"));
						new UI_Text(alert_dialog.getElement(),message);
						alert_dialog.oncomplete = function(){
							// ダイアログ終了
							dialog.close();
						};
						alert_dialog.open();
					}

					try{
						var proj_obj = page_expand_project.getObject();
						var import_obj = JsonParse(text_area_import.getValue());

						// バージョンが一致しない
						if(import_obj.version > proj_obj.version){
							throw "Error: It is a version not supported.";
						}

						// 出力タイプチェック
						var error = true;
						try{
							switch(import_obj.setting_export.type){
							case "setting":
							case "define":
								error = false;
								break;
							}
						}catch(e){}

						if(error){
							throw "Error: It is a type not supported.";
						}

						// 定義をインポート
						PageExpandProjectObjectImportDefine(proj_obj,import_obj,_define_id);

						projectSave(function(e){
							if(!e.result){
								DefineImportFailure(e.message);
								return;
							}

							text_area_import.setValue("");

							// 結果を表示
							var alert_dialog = new UI_AlertDialog(dialog_parent,_i18n.getMessage("menu_setting_define_import_alert"));
							new UI_Text(alert_dialog.getElement(),_i18n.getMessage("menu_setting_define_import_alert_success"));
							alert_dialog.oncomplete = function(){

								// フェードアウト完了後
								dialog.oncomplete = function(){

									// リロード
									_this.onreload();
								};

								// ダイアログ終了
								dialog.close();
							};
							alert_dialog.open();
						});

					}catch(e){
						DefineImportFailure(e);
					}
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// 選択されたアイテムを取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndex = function(){
				return _select_id = _list.selectedIndex;
			};

			// --------------------------------------------------------------------------------
			// 選択されたアイテムをすべて取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndices = function(){
				var ary = new Array();
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					if(a[i].selected){
						ary.push(i);
					}
				}
				return ary;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// 選択イベント
			// --------------------------------------------------------------------------------
			_this.onselect = function(){};

			// --------------------------------------------------------------------------------
			// リロードイベント
			// --------------------------------------------------------------------------------
			_this.onreload = function(){};

			// --------------------------------------------------------------------------------
			// リストを選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_list.selectedIndex = _select_id = _select_mouse = id;
				_this.onselect(id);
			};

			// --------------------------------------------------------------------------------
			// リストから選択
			// --------------------------------------------------------------------------------
			_this.selectFromIdList = function(list){
				var dic = new Object();
				var i;
				var num = _define.length;
				for(i=0;i<num;i++){
					dic[_define[i].id] = i;
				}
				
				num = list.length;
				var index = dic[list[num - 1]];
				if(index !== undefined){
					_list.selectedIndex = _select_id = index;
				}
				var a = _list.options;
				for(i=0;i<num;i++){
					if(dic[list[i]] !== undefined){
						var o = a[dic[list[i]]];
						if(o) o.selected = true;
					}
				}
				if(index !== undefined){
					_this.onselect(index);
				}
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				var selected_defines = new Array();
				var a = _this.getSelectedIndices();
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					selected_defines.push(_define[a[i]].id);
				}
				if(_define[_select_id]){
					selected_defines.push(_define[_select_id].id);
				}

				// 履歴更新
				_history_state.selected_defines = selected_defines;
				delete _history_state.selected_filters;
			};

			// --------------------------------------------------------------------------------
			// アイテム追加（内部用 ）
			// --------------------------------------------------------------------------------
			function attachItem(id){
				var item = DocumentCreateElement("option");
				ElementSetStyle(item,"margin:2px 0px;");

				item.value = _define[id].id;
				_dictionary[item.value] = _define[id];
				_list.appendChild(item);

				item.onmousedown = item.onmouseup = function(){
					_select_mouse = id;
				};
				updateItem(item);
			}

			// --------------------------------------------------------------------------------
			// アイテム更新（内部用 ）
			// --------------------------------------------------------------------------------
			function updateItem(item){
				var define;
				var c = _dictionary[item.value];
				if(c.preset){
					item.style.color = "#ccc";
				}
				if(c.user){
					item.style.color = "#000";
				}
				if(c.id == "wildcard"){
					if(c.preset){
						item.style.color = "#f88";
					}
					if(c.user){
						item.style.color = "#c00";
					}
				}
				define = ProjectObjectGetActiveData(c);
				ElementSetTextContent(item,LocaleObjectGetString(define.name));
			}

			// --------------------------------------------------------------------------------
			// アイテム削除（内部用 ）
			// --------------------------------------------------------------------------------
			function removeItem(item){
				var c = _dictionary[item.value];
				DomNodeRemove(item);
				delete _dictionary[item.value];
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _define;
			var _define_id;
			var _new_data_func;
			var _dictionary;
			var _list;
			var _select_id;
			var _select_mouse;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_dictionary = new Object();

				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px; display:table; width:100%;");
				parent.appendChild(container);

				var list_container = DocumentCreateElement("div");
				ElementSetStyle(list_container,"display:table-cell; vertical-align:top; width:auto;");
				container.appendChild(list_container);

				// リスト
				_list = DocumentCreateElement("select");
				_list.size = 10;
				_list.multiple = true;
				ElementSetStyle(_list,"width:100%; box-sizing:border-box; display:block; font-size:14px; background:#fff;");
				list_container.appendChild(_list);
				_list.onchange = function(e){
					_select_id = _list.selectedIndex;
					var o = _list.options[_select_mouse];
					if(o !== undefined){
						if(o.selected){
							_select_id = _select_mouse;
						}
					}
					_this.onselect(_select_id);
					_this.replaceHistory();
				};

				var button_container = DocumentCreateElement("div");
				ElementSetStyle(button_container,"display:table-cell; vertical-align:top; width:150px;");
				container.appendChild(button_container);

				var button_add = DocumentCreateElement("input");
				button_add.type = "button";
				button_add.value = _i18n.getMessage("menu_setting_define_button_add");
				ElementSetStyle(button_add,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_add);
				button_add.onclick = function(){
					addClick();
				};

				var button_delete = DocumentCreateElement("input");
				button_delete.type = "button";
				button_delete.value = _i18n.getMessage("menu_setting_define_button_delete");
				ElementSetStyle(button_delete,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_delete);
				button_delete.onclick = function(){
					deleteClick();
				};

				var button_move_up = DocumentCreateElement("input");
				button_move_up.type = "button";
				button_move_up.value = _i18n.getMessage("menu_setting_define_button_move_up");
				ElementSetStyle(button_move_up,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_move_up);
				button_move_up.onclick = function(){
					moveUpClick();
				};

				var button_move_down = DocumentCreateElement("input");
				button_move_down.type = "button";
				button_move_down.value = _i18n.getMessage("menu_setting_define_button_move_down");
				ElementSetStyle(button_move_down,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_move_down);
				button_move_down.onclick = function(){
					moveDownClick();
				};

				var button_export = DocumentCreateElement("input");
				button_export.type = "button";
				button_export.value = _i18n.getMessage("menu_setting_define_button_export");
				ElementSetStyle(button_export,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_export);
				button_export.onclick = function(){
					exportClick();
				};

				var button_import = DocumentCreateElement("input");
				button_import.type = "button";
				button_import.value = _i18n.getMessage("menu_setting_define_button_import");
				ElementSetStyle(button_import,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_import);
				button_import.onclick = function(){
					importClick();
				};

				new UI_TextHint(parent,_i18n.getMessage("menu_setting_define_list_hint"));
			})();
		}

		// --------------------------------------------------------------------------------
		// フィルタ用リスト
		// --------------------------------------------------------------------------------
		function UI_FilterList(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// フィルタを関連付け
			// --------------------------------------------------------------------------------
			_this.attachDefinitions = function(ary,active){

				// 全てクリア
				_this.clear();

				_definitions = ary;
				_definition_active = active;

				_definition_multiple = false;
				if(_definitions.length > 1){
					_definition_multiple = true;
				}

				_definitions_min = 0x7fffffff;
				_definitions_max = 0;

				var i;
				var num = _definitions.length;
				for(i=0;i<num;i++){
					var filter = ProjectObjectGetActiveData(_definitions[i]).filter;
					if(filter.length > _definitions_max)	_definitions_max = filter.length;
					if(filter.length < _definitions_min)	_definitions_min = filter.length;
				}

				for(i=0;i<_definitions_max;i++){
					attachItem(i);
				}
			};

			// --------------------------------------------------------------------------------
			// アクティブなフィルタを取得
			// --------------------------------------------------------------------------------
			_this.getDefinitionActive = function(){
				return _definition_active;
			};

			// --------------------------------------------------------------------------------
			// 定義の識別名をセット
			// --------------------------------------------------------------------------------
			_this.setDefineAssetName = function(asset){
				_define_id = asset;
			};

			// --------------------------------------------------------------------------------
			// 新規定義データ作成用関数をセット
			// --------------------------------------------------------------------------------
			_this.setFunctionForNewDefineData = function(f){
				_new_define_data_func = f;
			};

			// --------------------------------------------------------------------------------
			// 新規フィルタデータ作成用関数をセット
			// --------------------------------------------------------------------------------
			_this.setFunctionForNewFilterData = function(f){
				_new_filter_data_func = f;
			};

			// --------------------------------------------------------------------------------
			// クリア
			// --------------------------------------------------------------------------------
			_this.clear = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=num-1;i>=0;i--){
					removeItem(a[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 表示更新
			// --------------------------------------------------------------------------------
			_this.update = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					updateItem(a[i]);
				}
			};

			// --------------------------------------------------------------------------------
			// 表示更新（内部用）
			// --------------------------------------------------------------------------------
			function update(){
				_this.attachDefinitions(_definitions,_definition_active);
			}

			// --------------------------------------------------------------------------------
			// フィルタを書き込み更新
			// --------------------------------------------------------------------------------
			_this.writeDefinitions = function(func){
				var c;
				var p;
				var i;
				var num = _definitions.length;
				for(i=0;i<num;i++){
					c = _definitions[i];
					if(c.user){
						p = c.user;
					}else{
						if(c.preset){
							// プリセットを昇格
							p = c.user = ObjectCopy(c.preset);
						}
					}
					if(p)	func(p);
				}
			};

			// --------------------------------------------------------------------------------
			// フィルタを書き込み更新
			// --------------------------------------------------------------------------------
			_this.writeFilters = function(func){
				var ary = _this.getSelectedIndices();
				var i;
				var num = ary.length;
				_this.writeDefinitions(function(c){
					var filter = c.filter;
					for(i=0;i<num;i++){
						if(ary[i] < filter.length){
							func(filter[ary[i]]);
						}
					}
				});
			};

			// --------------------------------------------------------------------------------
			// 追加
			// --------------------------------------------------------------------------------
			function addClick(){

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_filter_add_dialog"));

				// 名前
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_filter_add_dialog_name"));
				var parent = container.getElement();
				var text_input_name = new UI_TextInput(parent);

				// 既存のURLマッピング設定から複製する
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_filter_add_dialog_copy_define"));
				var parent = container.getElement();
				var list_box_filter = new UI_ListBox(parent);

				var dictionary = new Object();
				var unique = 0;
				var i;
				var j;
				var num = _definitions.length;
				for(i=0;i<num;i++){
					var filters = ProjectObjectGetActiveData(_definitions[i]).filter;
					var filters_num = filters.length;
					for(j=0;j<filters_num;j++){
						var filter = filters[j];
						list_box_filter.attachItem(LocaleObjectGetString(filter.name),unique);
						dictionary[unique] = filter;
						unique ++;
					}
				}

				list_box_filter.attachItem(_i18n.getMessage("menu_setting_filter_add_dialog_define_list_box_item_new"),"");
				list_box_filter.setValue("");

				// Yes No ボタン
				var yes_no_button = new UI_YesNoButton(dialog_parent);
				yes_no_button.onclick = function(v){

					if(v){
						var filter = dictionary[list_box_filter.getValue()];
						if(filter){
							_this.writeDefinitions(function(c){
								var filter_copy = ObjectCopy(filter);
								c.filter.unshift(filter_copy);
								filter_copy.name = LocaleObjectCreate();
								LocaleObjectSetString(filter_copy.name,text_input_name.getValue());
							});
						}else{
							_this.writeDefinitions(function(c){
								if(_new_filter_data_func){
									var filter_new = _new_filter_data_func();
									c.filter.unshift(filter_new);
									filter_new.name = LocaleObjectCreate();
									LocaleObjectSetString(filter_new.name,text_input_name.getValue());
								}
							});
						}

						update();
						projectModify();
						_this.select(0);
						_this.onchange();
					}

					// ダイアログ終了
					dialog.close();
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// 削除
			// --------------------------------------------------------------------------------
			function deleteClick(){
				var a = _list.options;
				var i;
				var j;
				var num = a.length;
				for(i=num-1;i>=0;i--){
					var item = a[i];
					if(item.selected){
						var id = parseInt(item.value);
						_this.writeDefinitions(function(c){
							var filter = c.filter;
							if(filter.length > id){
								filter.splice(id,1);
							}
						});

						removeItem(item);
					}
				}

				update();
				projectModify();
				_this.onselect(_list.selectedIndex);
				_this.onchange();
			}

			// --------------------------------------------------------------------------------
			// 優先度アップ（内部用 ）
			// --------------------------------------------------------------------------------
			function prioUpClick(){
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 複数選択オーバー
				for(i=_definitions_min;i<num;i++){
					if(a[i].selected){
						return;
					}
				}

				// 先頭が選択されている
				if(a[0].selected)	return;

				for(i=1;i<num;i++){
					if(a[i].selected){
						var c = a[i];
						var t = c.previousSibling;
						t.selected = true;
						c.selected = false;

						var j = i;
						var k = (i-1);
						_this.writeDefinitions(function(c){
							var filter = c.filter;
							t = filter[k];
							filter[k] = filter[j];
							filter[j] = t;
						});
					}
				}

				_this.update();
				projectModify();
				_this.onchange();
			}

			// --------------------------------------------------------------------------------
			// 優先度ダウン（内部用 ）
			// --------------------------------------------------------------------------------
			function prioDownClick(){
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 複数選択オーバー
				for(i=_definitions_min;i<num;i++){
					if(a[i].selected){
						return;
					}
				}

				// 先頭が選択されている
				if(a[_definitions_min - 1].selected)	return;

				for(i=num - 2;i>=0;i--){
					if(a[i].selected){
						var c = a[i];
						var t = c.nextSibling;
						t.selected = true;
						c.selected = false;

						var j = i;
						var k = (i+1);
						_this.writeDefinitions(function(c){
							var filter = c.filter;
							t = filter[k];
							filter[k] = filter[j];
							filter[j] = t;
						});
					}
				}

				_this.update();
				projectModify();
				_this.onchange();
			}

			// --------------------------------------------------------------------------------
			// エクスポート（内部用 ）
			// --------------------------------------------------------------------------------
			function exportClick(){

				var proj = page_expand_project.getObject();
				var export_obj = new Object();
				var ary = new Array();

				var a = _list.options;
				var i;
				var num = a.length;

				var filter = ProjectObjectGetActiveData(_definition_active).filter;
				for(i=0;i<num;i++){
					if(a[i].selected){
						if(filter[i]){
							ary.push(ObjectCopy(filter[i]));
						}
					}
				}

				export_obj.version = proj.version;
				export_obj.setting_export = {
					type:"filter",
					asset:_define_id
				};

				var define = _new_define_data_func();
				define.id = PageExpandProjectObjectDefineGenerateNewUserId(_definitions);
				define.user.filter = ary;
				export_obj[_define_id] = [define];

				// プリセットを除去
				export_obj = PageExpandProjectObjectRemovePreset(export_obj);

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_filter_export_dialog"));

				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_filter_export_dialog_export"));
				var parent = container.getElement();

				var text_area = new UI_TextArea(parent);
				text_area.setValue(JsonStringify(export_obj));

				new UI_TextHint(parent,_i18n.getMessage("menu_setting_filter_export_dialog_export_hint"));

				// Ok ボタン
				var yes_no_button = new UI_OkButton(dialog_parent);
				yes_no_button.onclick = function(v){
					// ダイアログ終了
					dialog.close();
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// インポート（内部用 ）
			// --------------------------------------------------------------------------------
			function importClick(){

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_filter_import_dialog"));

				// 名前
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_filter_import_dialog_explanation"));
				var parent = container.getElement();
				var unordered_list = new UI_UnorderedList(parent);
				unordered_list.addListItem(_i18n.getMessage("menu_setting_filter_import_dialog_explanation_0"));
				unordered_list.addListItem(_i18n.getMessage("menu_setting_filter_import_dialog_explanation_1"));
				unordered_list.addListItem(_i18n.getMessage("menu_setting_filter_import_dialog_explanation_2"));

				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_filter_import_dialog_import"));
				var parent = container.getElement();

				var text_area_import = new UI_TextArea(parent);

				new UI_TextHint(parent,_i18n.getMessage("menu_setting_filter_import_dialog_import_hint"));

				// 実行しますか？
				var container = new UI_LineContainer(dialog_parent,null);
				var parent = container.getElement();
				new UI_Text(parent,_i18n.getMessage("menu_setting_filter_import_dialog_confirm"));

				// Yes No ボタン
				var yes_no_button = new UI_YesNoButton(dialog_parent);
				yes_no_button.onclick = function(v){

					if(!v){
						// ダイアログ終了
						dialog.close();
						return;
					}

					function ExpandBbsImportFailure(message){
						// 結果を表示
						var alert_dialog = new UI_AlertDialog(dialog_parent,_i18n.getMessage("menu_setting_filter_import_alert"));
						new UI_Text(alert_dialog.getElement(),_i18n.getMessage("menu_setting_filter_import_alert_failure"));
						new UI_Text(alert_dialog.getElement(),message);
						alert_dialog.oncomplete = function(){
							// ダイアログ終了
							dialog.close();
						};
						alert_dialog.open();
					}

					try{
						var proj_obj = page_expand_project.getObject();
						var import_obj = JsonParse(text_area_import.getValue());

						// バージョンが一致しない
						if(import_obj.version > proj_obj.version){
							throw "Error: It is a version not supported.";
						}

						// 出力タイプチェック
						var error = false;
						try{
							var setting_export = import_obj.setting_export;
							if(setting_export.type != "filter"){
								error = true;
							}
							if(setting_export.asset != _define_id){
								error = true;
							}
						}catch(e){
							error = true;
						}

						if(error){
							throw "Error: It is a type not supported.";
						}

						// 最新のフィルタを追加
						var filter_latest = PageExpandProjectObjectGetDefineFilterLatest(import_obj,_define_id);
						_this.writeDefinitions(function(c){
							var filter = c.filter;
							c.filter = c.filter.concat(filter_latest);
						});

						projectSave(function(e){
							if(!e.result){
								ExpandBbsImportFailure(e.message);
								return;
							}

							text_area_import.setValue("");

							// 結果を表示
							var alert_dialog = new UI_AlertDialog(dialog_parent,_i18n.getMessage("menu_setting_filter_import_alert"));
							new UI_Text(alert_dialog.getElement(),_i18n.getMessage("menu_setting_filter_import_alert_success"));
							alert_dialog.oncomplete = function(){

								// フェードアウト完了後
								dialog.oncomplete = function(){
									update();
									projectModify();
									_this.onchange();
								};

								// ダイアログ終了
								dialog.close();
							};
							alert_dialog.open();
						});

					}catch(e){
						ExpandBbsImportFailure(e);
					}
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// 選択されたアイテムをすべて取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndices = function(){
				var ary = new Array();
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					if(a[i].selected){
						ary.push(i);
					}
				}
				return ary;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// 選択イベント
			// --------------------------------------------------------------------------------
			_this.onselect = function(){};

			// --------------------------------------------------------------------------------
			// リストを選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_list.selectedIndex = _select_id = _select_mouse = id;
				_this.onselect(id);
			};

			// --------------------------------------------------------------------------------
			// リストを選択
			// --------------------------------------------------------------------------------
			_this.selectFromList = function(list){
				var dic = new Object();
				var i;
				var num = list.length;
				var index = list[num - 1];
				if(_definitions[index] !== undefined){
					_list.selectedIndex = _select_id = index;
				}
				var a = _list.options;
				for(i=0;i<num;i++){
					var o = a[list[i]];
					if(o) o.selected = true;
				}
				if(index !== undefined){
					_this.onselect(index);
				}
			};

			// --------------------------------------------------------------------------------
			// 履歴を上書き
			// --------------------------------------------------------------------------------
			_this.replaceHistory = function(){
				var selected_filters = new Array();
				var a = _this.getSelectedIndices();
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					selected_filters.push(a[i]);
				}
				if(_definitions[_select_id]){
					selected_filters.push(_select_id);
				}

				// 履歴更新
				_history_state.selected_filters = selected_filters;
			};

			// --------------------------------------------------------------------------------
			// アイテム追加（内部用 ）
			// --------------------------------------------------------------------------------
			function attachItem(id){
				var item = DocumentCreateElement("option");
				ElementSetStyle(item,"margin:2px 0px;");

				item.value = id;
				_list.appendChild(item);

				item.onmousedown = item.onmouseup = function(){
					_select_mouse = id;
				};
				updateItem(item);
			}

			// --------------------------------------------------------------------------------
			// アイテム更新（内部用 ）
			// --------------------------------------------------------------------------------
			function updateItem(item){

				item.style.color = "#000";
				var id = parseInt(item.value);

				if(_definition_multiple){
					if(_definitions_min <= id){
						item.style.color = "#ccc";
					}
					var filter = ProjectObjectGetActiveData(_definition_active).filter;
					if(filter.length <= id){
						ElementSetTextContent(item," *");
					}else{
						ElementSetTextContent(item,LocaleObjectGetString(filter[id].name) + " *");
					}
				}else{
					var filter = ProjectObjectGetActiveData(_definition_active).filter;
					ElementSetTextContent(item,LocaleObjectGetString(filter[id].name));
				}
			}

			// --------------------------------------------------------------------------------
			// アイテム削除（内部用 ）
			// --------------------------------------------------------------------------------
			function removeItem(item){
				DomNodeRemove(item);
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _definitions;
			var _definitions_min;
			var _definitions_max;
			var _definition_active;
			var _definition_multiple;
			var _list;
			var _define_id;
			var _select_id;
			var _select_mouse;
			var _new_define_data_func;
			var _new_filter_data_func;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px; display:table; width:100%;");
				parent.appendChild(container);

				var list_container = DocumentCreateElement("div");
				ElementSetStyle(list_container,"display:table-cell; vertical-align:top; width:auto;");
				container.appendChild(list_container);

				// リスト
				_list = DocumentCreateElement("select");
				_list.size = 10;
				_list.multiple = true;
				ElementSetStyle(_list,"width:100%; box-sizing:border-box; display:block; font-size:14px; background:#fff;");
				list_container.appendChild(_list);
				_list.onchange = function(e){
					_select_id = _list.selectedIndex;
					var o = _list.options[_select_mouse];
					if(o !== undefined){
						if(o.selected){
							_select_id = _select_mouse;
						}
					}
					_this.onselect(_select_id);
					_this.replaceHistory();
				};

				var button_container = DocumentCreateElement("div");
				ElementSetStyle(button_container,"display:table-cell; vertical-align:top; width:150px;");
				container.appendChild(button_container);

				var button_add = DocumentCreateElement("input");
				button_add.type = "button";
				button_add.value = _i18n.getMessage("menu_setting_filter_button_add");
				ElementSetStyle(button_add,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_add);
				button_add.onclick = function(){
					addClick();
				};

				var button_delete = DocumentCreateElement("input");
				button_delete.type = "button";
				button_delete.value = _i18n.getMessage("menu_setting_filter_button_delete");
				ElementSetStyle(button_delete,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_delete);
				button_delete.onclick = function(){
					deleteClick();
				};

				var button_prio_up = DocumentCreateElement("input");
				button_prio_up.type = "button";
				button_prio_up.value = _i18n.getMessage("menu_setting_filter_button_prio_up");
				ElementSetStyle(button_prio_up,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_prio_up);
				button_prio_up.onclick = function(){
					prioUpClick();
				};

				var button_prio_down = DocumentCreateElement("input");
				button_prio_down.type = "button";
				button_prio_down.value = _i18n.getMessage("menu_setting_filter_button_prio_down");
				ElementSetStyle(button_prio_down,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_prio_down);
				button_prio_down.onclick = function(){
					prioDownClick();
				};

				var button_export = DocumentCreateElement("input");
				button_export.type = "button";
				button_export.value = _i18n.getMessage("menu_setting_filter_button_export");
				ElementSetStyle(button_export,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_export);
				button_export.onclick = function(){
					exportClick();
				};

				var button_import = DocumentCreateElement("input");
				button_import.type = "button";
				button_import.value = _i18n.getMessage("menu_setting_filter_button_import");
				ElementSetStyle(button_import,"width:100%; padding:4px 0px; margin:0px;");
				button_container.appendChild(button_import);
				button_import.onclick = function(){
					importClick();
				};

				new UI_TextHint(parent,_i18n.getMessage("menu_setting_filter_list_hint"));
			})();
		}

		// --------------------------------------------------------------------------------
		// 定義複数選択用リスト
		// --------------------------------------------------------------------------------
		function UI_DefineMultiSelectList(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 識別名をセット
			// --------------------------------------------------------------------------------
			_this.setAsset = function(asset){
				_asset = asset;
			};

			// --------------------------------------------------------------------------------
			// メニュー番号をセット
			// --------------------------------------------------------------------------------
			_this.setMenuId = function(id){
				_menu_id = id;
			};

			// --------------------------------------------------------------------------------
			// 定義データをセット
			// --------------------------------------------------------------------------------
			_this.setDefineData = function(define_data){
				_define_data = define_data;
				_define_dictionary = new Object();
				var i;
				var num = define_data.length;
				for(i=0;i<num;i++){
					var d = define_data[i];
					var p = ProjectObjectGetActiveData(d);
					_define_dictionary[d.id] = p;
				}
			};

			// --------------------------------------------------------------------------------
			// URLマップを関連付け
			// --------------------------------------------------------------------------------
			_this.attachUrlMaps = function(ary,active){

				// 全てクリア
				_this.clear();

				_urlmaps = ary;
				_urlmap_active = active;

				_urlmap_multiple = false;
				if(_urlmaps.length > 1){
					_urlmap_multiple = true;
				}

				_urlmaps_min = 0x7fffffff;
				_urlmaps_max = 0;

				var i;
				var num = _urlmaps.length;
				for(i=0;i<num;i++){
					var p = ProjectObjectGetActiveData(_urlmaps[i])[_asset];
					if(p.enable){
						var l = p.id.length;
						if(l > _urlmaps_max)	_urlmaps_max = l;
						if(l < _urlmaps_min)	_urlmaps_min = l;
					}else{
						_urlmaps_min = 0;
					}
				}

				for(i=0;i<_urlmaps_max;i++){
					attachItem(i);
				}
				updateUI();
			};

			// --------------------------------------------------------------------------------
			// アクティブなフィルタを取得
			// --------------------------------------------------------------------------------
			_this.getUrlmapActive = function(){
				return _urlmap_active;
			};

			// --------------------------------------------------------------------------------
			// クリア
			// --------------------------------------------------------------------------------
			_this.clear = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=num-1;i>=0;i--){
					removeItem(a[i]);
				}
				updateUI();
			};

			// --------------------------------------------------------------------------------
			// 表示更新
			// --------------------------------------------------------------------------------
			_this.update = function(){
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					updateItem(a[i]);
				}
				updateUI();
			};

			// --------------------------------------------------------------------------------
			// 表示更新（内部用）
			// --------------------------------------------------------------------------------
			function update(){
				_this.attachUrlMaps(_urlmaps,_urlmap_active);
			}

			// --------------------------------------------------------------------------------
			// UI 表示更新（内部用）
			// --------------------------------------------------------------------------------
			function updateUI(){
				var _selected_index = _this.getSelectedIndex();
				var disabled = (_selected_index < 0);

				_button_prio_up.disabled = disabled;
				_button_prio_down.disabled = disabled;
				var a = _list.options;
				var num = a.length;
				if(num){
					if(a[0].selected){
						_button_prio_up.disabled = true;
					}
					if(a[num-1].selected){
						_button_prio_down.disabled = true;
					}
				}

				var display = "";
				if(disabled) display = "none";
				_button_prio_up.style.display = display;
				_button_prio_down.style.display = display;
				_button_delete.style.display = display;

				num += 1;
				if(num < 3) num = 3;
				if(num > 10) num = 10;
				if(!disabled){
					if(num < 6) num = 6;
				}
				_list.size = num;
			}

			// --------------------------------------------------------------------------------
			// 書き込み更新
			// --------------------------------------------------------------------------------
			_this.writeUrlmaps = function(func){
				var c;
				var p;
				var i;
				var num = _urlmaps.length;
				for(i=0;i<num;i++){
					c = _urlmaps[i];
					if(c.user){
						p = c.user;
					}else{
						if(c.preset){
							// プリセットを昇格
							p = c.user = ObjectCopy(c.preset);
						}
					}
					if(p)	func(p);
				}
			};

			// --------------------------------------------------------------------------------
			// 追加
			// --------------------------------------------------------------------------------
			function addClick(){

				// モーダルダイアログ作成
				var dialog = new UI_ModalDialog(_content_window);
				var dialog_parent = dialog.getElement();
				dialog.setWidth(600);

				// タイトル
				var title = new UI_Title(dialog_parent,_i18n.getMessage("menu_setting_define_multi_select_add_dialog"));

				// 定義の一覧
				var container = new UI_LineContainer(dialog_parent,_i18n.getMessage("menu_setting_define_multi_select_add_dialog_list"));
				var parent = container.getElement();
				var list_box_filter = new UI_ListBox(parent);
				list_box_filter.setMultiple(true);

				var i;
				var num = _define_data.length;
				for(i=0;i<num;i++){
					if(_define_data[i].id == "wildcard") continue;
					var c = ProjectObjectGetActiveData(_define_data[i]);
					list_box_filter.attachItem(LocaleObjectGetString(c.name),i);
				}

				// Yes No ボタン
				var yes_no_button = new UI_YesNoButton(dialog_parent);
				yes_no_button.onclick = function(v){

					if(v){
						var indeices = list_box_filter.getSelectedValues();
						_this.writeUrlmaps(function(c){
							var i;
							var num = indeices.length;
							for(i=0;i<num;i++){
								var p = _define_data[indeices[i]];
								if(c[_asset].enable){
									c[_asset].id.push(p.id);
								}else{
									c[_asset].id = [p.id];
									c[_asset].enable = true;
								}
							}
						});

						update();
						onchange();
						projectModify();
					}

					// ダイアログ終了
					dialog.close();
				};

				// ダイアログ開始
				dialog.open();
			}

			// --------------------------------------------------------------------------------
			// 削除
			// --------------------------------------------------------------------------------
			function deleteClick(){
				var a = _list.options;
				var i;
				var j;
				var num = a.length;
				for(i=num-1;i>=0;i--){
					var item = a[i];
					if(item.selected){
						var id = parseInt(item.value);
						_this.writeUrlmaps(function(c){
							var ary = c[_asset].id;
							if(ary.length > id){
								ary.splice(id,1);
							}
							if(!(ary.length)){
								c[_asset].enable = false;
							}
						});

						removeItem(item);
					}
				}

				update();
				onchange();
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// 編集（内部用 ）
			// --------------------------------------------------------------------------------
			function editClick(){
				var _selected_index = _this.getSelectedIndex();
				var selected_defines = new Array();

				if(_selected_index >= 0){
					var ary = ProjectObjectGetActiveData(_urlmap_active)[_asset].id;

					var a = _this.getSelectedIndices();
					var i;
					var num = a.length;
					for(i=0;i<num;i++){
						selected_defines.push(ary[a[i]]);
					}
					if(ary[_selected_index]){
						selected_defines.push(ary[_selected_index]);
					}
				}

				_config.pushHistory(_menu_id);
				var content = _config.MenuItemSelect(_menu_id);
				content.selectFromIdList(selected_defines);
				content.replaceHistory();
			}

			// --------------------------------------------------------------------------------
			// 優先度アップ（内部用 ）
			// --------------------------------------------------------------------------------
			function prioUpClick(){
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 複数選択オーバー
				for(i=_urlmaps_min;i<num;i++){
					if(a[i].selected){
						return;
					}
				}

				// 先頭が選択されている
				if(a[0].selected)	return;

				for(i=1;i<num;i++){
					if(a[i].selected){
						var c = a[i];
						var t = c.previousSibling;
						t.selected = true;
						c.selected = false;

						var j = i;
						var k = (i-1);
						_this.writeUrlmaps(function(c){
							var ary = c[_asset].id;
							t = ary[k];
							ary[k] = ary[j];
							ary[j] = t;
						});
					}
				}

				_this.update();
				onchange();
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// 優先度ダウン（内部用 ）
			// --------------------------------------------------------------------------------
			function prioDownClick(){
				var t;
				var a = _list.options;
				var i;
				var num = a.length;

				// アイテムなし
				if(!num)	return;

				// 複数選択オーバー
				for(i=_urlmaps_min;i<num;i++){
					if(a[i].selected){
						return;
					}
				}

				// 先頭が選択されている
				if(a[_urlmaps_min - 1].selected)	return;

				for(i=num - 2;i>=0;i--){
					if(a[i].selected){
						var c = a[i];
						var t = c.nextSibling;
						t.selected = true;
						c.selected = false;

						var j = i;
						var k = (i+1);
						_this.writeUrlmaps(function(c){
							var ary = c[_asset].id;
							t = ary[k];
							ary[k] = ary[j];
							ary[j] = t;
						});
					}
				}

				_this.update();
				onchange();
				projectModify();
			}

			// --------------------------------------------------------------------------------
			// 選択されたアイテムを取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndex = function(){
				return _select_id = _list.selectedIndex;
			};

			// --------------------------------------------------------------------------------
			// 選択されたアイテムをすべて取得
			// --------------------------------------------------------------------------------
			_this.getSelectedIndices = function(){
				var ary = new Array();
				var a = _list.options;
				var i;
				var num = a.length;
				for(i=0;i<num;i++){
					if(a[i].selected){
						ary.push(i);
					}
				}
				return ary;
			};

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// 更新イベント（内部用）
			// --------------------------------------------------------------------------------
			function onchange(){
				if(_this.onchange){
					_this.onchange();
				}
			}

			// --------------------------------------------------------------------------------
			// 選択イベント
			// --------------------------------------------------------------------------------
			_this.onselect = function(){};

			// --------------------------------------------------------------------------------
			// リストを選択
			// --------------------------------------------------------------------------------
			_this.select = function(id){
				_list.selectedIndex = _select_id = _select_mouse = id;
				_this.onselect(id);
			};

			// --------------------------------------------------------------------------------
			// アイテム追加（内部用 ）
			// --------------------------------------------------------------------------------
			function attachItem(id){
				var item = DocumentCreateElement("option");
				ElementSetStyle(item,"margin:2px 0px;");

				item.value = id;
				_list.appendChild(item);

				item.onmousedown = item.onmouseup = function(){
					_select_mouse = id;
				};
				updateItem(item);
			}

			// --------------------------------------------------------------------------------
			// アイテム更新（内部用 ）
			// --------------------------------------------------------------------------------
			function updateItem(item){

				item.style.color = "#000";
				var id = parseInt(item.value);

				if(_urlmap_multiple){
					if(_urlmaps_min <= id){
						item.style.color = "#ccc";
					}

					var p = ProjectObjectGetActiveData(_urlmap_active)[_asset];
					var ary = p.id;
					var l = ary.length;
					if(!(p.enable))	l = 0;
					if(l <= id){
						ElementSetTextContent(item," *");
					}else{
						ElementSetTextContent(item,LocaleObjectGetString(_define_dictionary[ary[id]].name) + " *");
					}
				}else{
					var ary = ProjectObjectGetActiveData(_urlmap_active)[_asset].id;
					ElementSetTextContent(item,LocaleObjectGetString(_define_dictionary[ary[id]].name));
				}
			}

			// --------------------------------------------------------------------------------
			// アイテム削除（内部用 ）
			// --------------------------------------------------------------------------------
			function removeItem(item){
				DomNodeRemove(item);
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _urlmaps;
			var _urlmaps_min;
			var _urlmaps_max;
			var _urlmap_active;
			var _urlmap_multiple;
			var _list;
			var _select_id;
			var _select_mouse;
			var _asset;
			var _menu_id;
			var _define_dictionary;
			var _define_data;
			var _button_add;
			var _button_delete;
			var _button_edit;
			var _button_prio_up;
			var _button_prio_down;


			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				var container = DocumentCreateElement("div");
				ElementSetStyle(container,"margin:0px 0px 5px 0px; display:table; width:100%;");
				parent.appendChild(container);

				var list_container = DocumentCreateElement("div");
				ElementSetStyle(list_container,"display:table-cell; vertical-align:top; width:auto;");
				container.appendChild(list_container);

				// リスト
				_list = DocumentCreateElement("select");
				_list.multiple = true;
				ElementSetStyle(_list,"width:100%; box-sizing:border-box; display:block; font-size:14px; background:#fff;");
				list_container.appendChild(_list);
				_list.onchange = function(e){
					_select_id = _list.selectedIndex;
					var o = _list.options[_select_mouse];
					if(o !== undefined){
						if(o.selected){
							_select_id = _select_mouse;
						}
					}
					updateUI();
					_this.onselect(_select_id);
				};

				var button_container = DocumentCreateElement("div");
				ElementSetStyle(button_container,"display:table-cell; vertical-align:top; width:50px; line-height:0;");
				container.appendChild(button_container);

				_button_add = DocumentCreateElement("input");
				_button_add.type = "button";
				_button_add.value = _i18n.getMessage("menu_setting_urlmap_define_button_add");
				ElementSetStyle(_button_add,"width:100%; padding:1px 0px; margin:0px;");
				button_container.appendChild(_button_add);
				_button_add.onclick = function(){
					addClick();
				};

				_button_delete = DocumentCreateElement("input");
				_button_delete.type = "button";
				_button_delete.value = _i18n.getMessage("menu_setting_urlmap_define_button_remove");
				ElementSetStyle(_button_delete,"width:100%; padding:1px 0px; margin:0px;");
				button_container.appendChild(_button_delete);
				_button_delete.onclick = function(){
					deleteClick();
				};

				_button_edit = DocumentCreateElement("input");
				_button_edit.type = "button";
				_button_edit.value = _i18n.getMessage("menu_setting_urlmap_define_button_edit");
				ElementSetStyle(_button_edit,"width:100%; padding:1px 0px; margin:0px;");
				button_container.appendChild(_button_edit);
				_button_edit.onclick = function(){
					editClick();
				};

				_button_prio_up = DocumentCreateElement("input");
				_button_prio_up.type = "button";
				_button_prio_up.value = _i18n.getMessage("menu_setting_urlmap_define_button_prio_up");
				ElementSetStyle(_button_prio_up,"width:100%; padding:1px 0px; margin:0px;");
				button_container.appendChild(_button_prio_up);
				_button_prio_up.onclick = function(){
					prioUpClick();
				};

				_button_prio_down = DocumentCreateElement("input");
				_button_prio_down.type = "button";
				_button_prio_down.value = _i18n.getMessage("menu_setting_urlmap_define_button_prio_down");
				ElementSetStyle(_button_prio_down,"width:100%; padding:1px 0px; margin:0px;");
				button_container.appendChild(_button_prio_down);
				_button_prio_down.onclick = function(){
					prioDownClick();
				};

				updateUI();
			})();
		}

		// --------------------------------------------------------------------------------
		// URL エディットコンテナ
		// --------------------------------------------------------------------------------
		function UI_UrlEditContainer(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// カスタムオブジェクトを関連付け
			// --------------------------------------------------------------------------------
			_this.attachObject = function(obj){
				// クリア
				_this.clear();

				_filter_container = ObjectCopy(obj);
				update();
			};

			// --------------------------------------------------------------------------------
			// クリア
			// --------------------------------------------------------------------------------
			_this.clear = function(){
				_text_area_filter_url.setValue("");
				_regexp_list_filter.clear();
			};

			// --------------------------------------------------------------------------------
			// 表示更新
			// --------------------------------------------------------------------------------
			function update(){
				_form_container_asterisk.setVisible(false);
				_form_container_regexp.setVisible(false);

				_combo_box_type.setValue(_filter_container.type);

				switch(_filter_container.type){
				case "asterisk":
					_text_area_filter_url.joinArray(_filter_container.asterisk.filter,"\n");
					_form_container_asterisk.setVisible(true);
					break;
				case "regexp":
					_regexp_list_filter.attachArray(_filter_container.regexp.filter);
					_form_container_regexp.setVisible(true);
					break;
				}
			}

			// --------------------------------------------------------------------------------
			// 更新イベント
			// --------------------------------------------------------------------------------
			_this.onchange = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _filter_container;
			var _combo_box_type;
			var _regexp_list_filter;
			var _text_area_filter_url;
			var _form_container_asterisk;
			var _form_container_regexp;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_combo_box_type = new UI_ComboBox(parent);
				_combo_box_type.attachItem(_i18n.getMessage("menu_setting_url_edit_container_combo_box_item_asterisk"),"asterisk");
				_combo_box_type.attachItem(_i18n.getMessage("menu_setting_url_edit_container_combo_box_item_regexp"),"regexp");
				_combo_box_type.onchange = function(v){
					_filter_container.type = v;
					update();
					_this.onchange(_filter_container);
				};

				_form_container_asterisk = new UI_FormContainer(parent);
				_form_container_asterisk.setVisible(false);
				var form_parent_asterisk = _form_container_asterisk.getElement();

				// アスタリスクリスト
				_text_area_filter_url = new UI_TextArea(form_parent_asterisk);
				_text_area_filter_url.oninput = function(v){
					_filter_container.asterisk.filter = _text_area_filter_url.spiritByLine();
					_this.onchange(_filter_container);
				};
				new UI_TextHint(form_parent_asterisk,_i18n.getMessage("menu_setting_url_edit_container_type_asterisk_hint"));

				_form_container_regexp = new UI_FormContainer(parent);
				_form_container_regexp.setVisible(false);
				var form_parent_regexp = _form_container_regexp.getElement();

				// 正規表現リスト
				_regexp_list_filter = new UI_RegExpList(form_parent_regexp);
				_regexp_list_filter.onchange = function(v){
					_filter_container.regexp.filter = ObjectCopy(v);
					_this.onchange(_filter_container);
				};
			})();
		}

		// --------------------------------------------------------------------------------
		// プロジェクト用データからアクティブなオブジェクトを取得
		// --------------------------------------------------------------------------------
		function ProjectObjectGetActiveData(obj){
			if(obj.user)	return obj.user;
			if(obj.preset)	return obj.preset;
			return null;
		}

		// --------------------------------------------------------------------------------
		// ロケールオブジェクトを作成
		// --------------------------------------------------------------------------------
		function LocaleObjectCreate(){
			return {
				standard:"",
				locales:{}
			};
		}

		// --------------------------------------------------------------------------------
		// ロケールオブジェクトから文字を取得
		// --------------------------------------------------------------------------------
		function LocaleObjectGetString(obj){
			var language = page_expand_project.getLanguage();
			if(obj.locales.hasOwnProperty(language)){
				return obj.locales[language];
			}else{
				return obj.standard;
			}
		}

		// --------------------------------------------------------------------------------
		// ロケールオブジェクトに文字をセット
		// --------------------------------------------------------------------------------
		function LocaleObjectSetString(obj,str){
			obj.locales[page_expand_project.getLanguage()] = str;
			obj.standard = str;
		}

		// --------------------------------------------------------------------------------
		// 掲示板拡張設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createExpandBbsData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					enable:true,
					filter:{
						type:"asterisk",
						asterisk:{
							filter:[]
						},
						regexp:{
							filter:[]
						}
					},
					script_initialize:PageExpandProjectScriptObject_Create("ExpandBbs_ScriptInitialize_Default"),
					script_callback:PageExpandProjectScriptObject_Create("ExpandBbs_ScriptCallback_Default"),
					popup:{
						origin_type:"adsorb_top_bottom",
						position_type:"absolute",
						enable_animation:true,
						percent:{x:50,y:50},
						time_wait_open:0,
						time_wait_close:0,
						style_sheet:""
					}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// URLマッピング設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createUrlMapData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					enable:false,
					filter:{
						type:"asterisk",
						asterisk:{
							filter:[]
						},
						regexp:{
							filter:[]
						}
					},
					enable_unsecure:false,
					enable_mixed_content:false,
					access_block:{enable:false,id:[]},
					replacement_to_element:{enable:false,id:[]},
					replacement_to_text:{enable:false,id:[]},
					replacement_to_anchor:{enable:false,id:[]},
					replacement_to_link:{enable:false,id:[]},
					replacement_to_referer:{enable:false,id:[]},
					replacement_to_useragent:{enable:false,id:[]},
					make_link_to_text:{enable:false,id:""},
					expand_short_url:{enable:false,id:""},
					expand_text:{enable:false,id:""},
					expand_image:{enable:false,id:""},
					expand_sound:{enable:false,id:""},
					expand_video:{enable:false,id:""},
					expand_iframe:{enable:false,id:""},
					style_sheet:{enable:false,id:""},
					experimental:{enable:false,id:""}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// アクセス遮断設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createAccessBlockData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					filter:{
						type:"asterisk",
						asterisk:{
							filter:[]
						},
						regexp:{
							filter:[]
						}
					}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// エレメント置換設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createReplacementToElementData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					script:PageExpandProjectScriptObject_Create("ReplacementToElement_Default")
				}
			};
		}

		// --------------------------------------------------------------------------------
		// テキスト置換設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createReplacementToTextData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					script:PageExpandProjectScriptObject_Create("ReplacementToText_Default")
				}
			};
		}

		// --------------------------------------------------------------------------------
		// アンカー置換設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createReplacementToAnchorData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					script:PageExpandProjectScriptObject_Create("ReplacementToAnchor_Default")
				}
			};
		}

		// --------------------------------------------------------------------------------
		// ハイパーリンク置換設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createReplacementToLinkData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					filter:[]
				}
			};
		}

		// --------------------------------------------------------------------------------
		// ハイパーリンク置換設定のフィルタアイテムを生成（内部）
		// --------------------------------------------------------------------------------
		function createReplacementToLinkFilterItemData(){
			return {
				name:{
					standard:"",
					locales:{
						ja:"",
						en:""
					}
				},
				filter:{
					type:"asterisk",
					asterisk:{
						filter:[]
					},
					regexp:{
						filter:[]
					}
				},
				enable_reflect_to_anchor:false,
				enable_cache:false,
				script:PageExpandProjectScriptObject_Create("ReplacementToLink_Default")
			};
		}

		// --------------------------------------------------------------------------------
		// リファラ置換設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createReplacementToRefererData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					filter:[]
				}
			};
		}

		// --------------------------------------------------------------------------------
		// リファラ置換設定のフィルタアイテムを生成（内部）
		// --------------------------------------------------------------------------------
		function createReplacementToRefererFilterItemData(){
			return {
				name:{
					standard:"",
					locales:{
						ja:"",
						en:""
					}
				},
				filter:{
					type:"asterisk",
					asterisk:{
						filter:[]
					},
					regexp:{
						filter:[]
					}
				},
				send_referer:{
					type:"default",
					custom:"",
					regexp:{
						pattern:"",
						flags:{i:false,g:false}
					},
					replacement:""
				}
			};
		}

		// --------------------------------------------------------------------------------
		// ユーザーエージェント置換設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createReplacementToUserAgentData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					filter:[]
				}
			};
		}

		// --------------------------------------------------------------------------------
		// ユーザーエージェント置換設定のフィルタアイテムを生成（内部）
		// --------------------------------------------------------------------------------
		function createReplacementToUserAgentFilterItemData(){
			return {
				name:{
					standard:"",
					locales:{
						ja:"",
						en:""
					}
				},
				filter:{
					type:"asterisk",
					asterisk:{
						filter:[]
					},
					regexp:{
						filter:[]
					}
				},
				send_useragent:{
					custom:""
				}
			};
		}

		// --------------------------------------------------------------------------------
		// ハイパーリンク化設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createMakeLinkToTextData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					script:PageExpandProjectScriptObject_Create("MakeLinkToText_Default")
				}
			};
		}

		// --------------------------------------------------------------------------------
		// 短縮 URL の展開設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createExpandShortUrlData(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					filter:{
						type:"asterisk",
						asterisk:{
							filter:[]
						},
						regexp:{
							filter:[]
						}
					}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// テキストの展開設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createExpandText(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					inline:{
						disable_same_text:false,
						script_allow:PageExpandProjectScriptObject_Create("ExpandText_InlineScriptAllow_Default"),
						script_insert:PageExpandProjectScriptObject_Create("ExpandText_InlineScriptInsert_Default")
					}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// イメージの展開設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createExpandImage(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					thumbnail:{
						enable_thumbnail:false,
						enable_popup_mouseover:false,
						scale_percent:50,
						width_min:0,
						width_max:300,
						disable_same_image:false,
						load_type:"preload",
						script_allow:PageExpandProjectScriptObject_Create("ExpandImage_ThumbnailScriptAllow_Default"),
						script_insert:PageExpandProjectScriptObject_Create("ExpandImage_ThumbnailScriptInsert_Default")
					},
					popup:{
						enable_popup_mouseover:false,
						enable_animation_scale:false,
						enable_animation_alpha:false,
						load_type:"preload",
						origin_type:"center",
						position_type:"absolute",
						scale_percent:100,
						time_wait_open:0,
						time_wait_close:0,
						script_allow:PageExpandProjectScriptObject_Create("ExpandImage_PopupScriptAllow_Default")
					},
					reduced_image:{
						enable_popup:false,
						popup_allow_slcale_less_then:0
					},
					load:{
						enable_notify:false,
						enable_unload:false,
						src_type:"mixed_content",
						unload_allow_size_more_then:0
					}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// サウンドの展開設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createExpandSound(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					inline:{
						disable_same_audio:false,
						sound_max:10,
						script_allow:PageExpandProjectScriptObject_Create("ExpandSound_InlineScriptAllow_Default"),
						script_insert:PageExpandProjectScriptObject_Create("ExpandSound_InlineScriptInsert_Default")
					},
					audio_element:{
						script_allow:PageExpandProjectScriptObject_Create("ExpandSound_AudioElementScriptAllow_Default")
					},
					soundcloud:{
						visible_player_html5:false
					},
					mixcloud:{
						visible_player:false
					}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// ビデオの展開設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createExpandVideo(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					inline:{
						disable_same_video:false,
						video_max:10,
						script_allow:PageExpandProjectScriptObject_Create("ExpandVideo_InlineScriptAllow_Default"),
						script_insert:PageExpandProjectScriptObject_Create("ExpandVideo_InlineScriptInsert_Default")
					},
					video_element:{
						script_allow:PageExpandProjectScriptObject_Create("ExpandVideo_VideoElementScriptAllow_Default")
					},
					youtube:{
						visible_video:false
					},
					nicovideo:{
						visible_video:false,
						visible_thumbnail_video:false,
						visible_thumbnail_mylist:false,
						visible_thumbnail_user:false,
						visible_thumbnail_community:false,
						visible_thumbnail_live:false,
						visible_thumbnail_seiga:false
					},
					dailymotion:{
						visible_video:false
					},
					vimeo:{
						visible_video:false
					},
					fc2video:{
						visible_video:false
					},
					liveleak:{
						visible_video:false
					}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// インラインフレームの展開設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createExpandIframe(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					inline:{
						disable_same_iframe:false,
						script_allow:PageExpandProjectScriptObject_Create("ExpandIframe_InlineScriptAllow_Default"),
						script_insert:PageExpandProjectScriptObject_Create("ExpandIframe_InlineScriptInsert_Default")
					}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// スタイルシート設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createStyleSheet(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					},
					expand_text:{
						inline:""
					},
					expand_image:{
						thumbnail:"",
						popup:""
					},
					expand_sound:{
						inline:{
							audio_element:{
								audio:""
							},
							soundcloud:{
								player_html5:""
							},
							mixcloud:{
								player:""
							}
						}
					},
					expand_video:{
						inline:{
							video_element:{
								video:""
							},
							youtube:{
								video:""
							},
							nicovideo:{
								video:"",
								thumbnail_video:"",
								thumbnail_mylist:"",
								thumbnail_user:"",
								thumbnail_community:"",
								thumbnail_live:"",
								thumbnail_seiga:""
							},
							dailymotion:{
								video:""
							},
							vimeo:{
								video:""
							},
							fc2video:{
								video:""
							},
							liveleak:{
								video:""
							}
						}
					},
					expand_iframe:{
						inline:""
					}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// 試験運用設定を生成（内部）
		// --------------------------------------------------------------------------------
		function createExperimental(){
			return {
				id:null,
				user:{
					name:{
						standard:"",
						locales:{}
					}
				}
			};
		}

		// --------------------------------------------------------------------------------
		// プロジェクトを修正（内部用）
		// --------------------------------------------------------------------------------
		function projectModify(){
			projectSave(function(e){});
		}

		// --------------------------------------------------------------------------------
		// ロード（内部用）
		// --------------------------------------------------------------------------------
		function projectLoad(func){
			if(!page_expand_project){
				// プロジェクト
				page_expand_project = new PageExpandProject();

				// ローカルストレージからロード
				page_expand_project.loadLocalStorage(function(e){
					func(e);
				});
			}else{
				func({result:false});
			}
		}

		// --------------------------------------------------------------------------------
		// セーブ（内部用）
		// --------------------------------------------------------------------------------
		function projectSave(func){
			// ローカルストレージに保存
			page_expand_project.saveLocalStorage(function(e){
				func(e);

				// バックグラウンドへプロジェクト更新を通知
				extension_message.sendRequest({command:"reloadPageExpandProject"});
			});
		}

		// --------------------------------------------------------------------------------
		// 破棄（内部用）
		// --------------------------------------------------------------------------------
		function projectDelete(func){
			page_expand_project.removeLocalStorage(function(e){
				func(e);
			});
		}

		// --------------------------------------------------------------------------------
		// 同期ストレージロード（内部用）
		// --------------------------------------------------------------------------------
		function projectLoadFromSyncStorage(func){
		}

		// --------------------------------------------------------------------------------
		// 同期ストレージセーブ（内部用）
		// --------------------------------------------------------------------------------
		function projectSaveFromSyncStorage(func){
		}

		// --------------------------------------------------------------------------------
		// 同期ストレージ破棄（内部用）
		// --------------------------------------------------------------------------------
		function projectDeleteFromSyncStorage(func){
		}

		// --------------------------------------------------------------------------------
		// プライベート変数
		// --------------------------------------------------------------------------------
		var _menu_window;
		var _content_window;
		var _i18n;
		var _menu_items;
		var _history_state;
		var _history_state_list;
		var _menu_item_param = [
			{asset:"menu_setting_standard",callback:ContentSettingStandard,bgcolor:0xFFFFFFFF},
			{asset:"menu_setting_access_block",callback:ContentSettingAccessBlock,bgcolor:0xFFFFE0F0},
			{asset:"menu_setting_replacement_to_referer",callback:ContentSettingReplacementToReferer,bgcolor:0xFFFFE0F0},
			{asset:"menu_setting_replacement_to_useragent",callback:ContentSettingReplacementToUserAgent,bgcolor:0xFFFFE0F0},
			{asset:"menu_setting_replacement_to_element",callback:ContentSettingReplacementToElement,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_replacement_to_text",callback:ContentSettingReplacementToText,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_replacement_to_anchor",callback:ContentSettingReplacementToAnchor,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_replacement_to_link",callback:ContentSettingReplacementToLink,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_make_link_to_text",callback:ContentSettingMakeLinkToText,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_expand_short_url",callback:ContentSettingExpandShortUrl,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_expand_text",callback:ContentSettingExpandText,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_expand_image",callback:ContentSettingExpandImage,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_expand_sound",callback:ContentSettingExpandSound,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_expand_video",callback:ContentSettingExpandVideo,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_expand_iframe",callback:ContentSettingExpandIframe,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_style_sheet",callback:ContentSettingStyleSheet,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_experimental",callback:ContentSettingExperimental,bgcolor:0xFFE0E0FF},
			{asset:"menu_setting_urlmap",callback:ContentSettingUrlMap,bgcolor:0xFFFFF0D8},
			{asset:"menu_setting_expand_bbs",callback:ContentSettingExpandBbs,bgcolor:0xFFE0FDE0},
			{asset:"menu_setting_download",callback:ContentSettingDownload,bgcolor:0xFFFFFFFF},
			{asset:"menu_setting_language",callback:ContentSettingLanguage,bgcolor:0xFFFFFFFF},
			{asset:"menu_credit",callback:ContentCredit,bgcolor:0xFFFFFFFF}
		];
		var _menu_support_param = [
			{menu:true,urlmap:true},
			{menu:true,urlmap:false},
			{menu:false,urlmap:false},
			{menu:false,urlmap:false},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true},
			{menu:true,urlmap:true}
		];


		// --------------------------------------------------------------------------------
		// 初期化関数（内部用）
		// --------------------------------------------------------------------------------
		function initialize(){

			_menu_items = new Array();

			// 履歴オブジェクト
			_history_state_list = new Array();
			_history_state_list[0] = _history_state = {index:0};

			// エレメントを全てクリア
			var child_nodes = document.childNodes;
			var i;
			var num = child_nodes.length;
			for(i=num-1;i >= 0;i--){
				var node = child_nodes[i];
				DomNodeRemove(node);
			}

			// HTML
			var html = DocumentCreateElement("html");
			document.appendChild(html);

			// ヘッダ
			var head = DocumentCreateElement("head");
			html.appendChild(head);

			// ボディ
			var body = DocumentCreateElement("body");
			ElementSetStyle(body,'background-color:#CCC; font-family:"Meiryo","sans-serif"; margin:0px; padding:0px; overflow-y:scroll;');
			html.appendChild(body);

			// ロケール
			_i18n = new InternationalMessage(page_expand_project.getLanguage());

			// タイトル
			document.title = _i18n.getMessage("page_expand_config");

			// ヘッダ
			var head_window = DocumentCreateElement("div");
			ElementSetStyle(head_window,"background-color:#000; color:#fff; font-size:12px; font-weight:bold; padding:2px 5px; margin:0px 0px 20px;");
			ElementSetTextContent(head_window,_i18n.getMessage("page_expand_config"));
			body.appendChild(head_window);

			// 外周
			var out_window = DocumentCreateElement("div");
			ElementSetStyle(out_window,"margin:0px 15px 15px 5px;");
			body.appendChild(out_window);

			// 外周
			var out_table = DocumentCreateElement("div");
			ElementSetStyle(out_table,"width:100%; display:table;");
			out_window.appendChild(out_table);

			// メニュー部
			_menu_window = DocumentCreateElement("div");
			ElementSetStyle(_menu_window,"width:250px; display:table-cell; vertical-align:top; user-select:none; -webkit-user-select:none; -moz-user-select:none; -khtml-user-select:none; margin:20px;");
			out_table.appendChild(_menu_window);

				// メニュー上部
				var menu_item_top = DocumentCreateElement("div");
				ElementSetStyle(menu_item_top,"height:10px;");
				_menu_window.appendChild(menu_item_top);

				{
					// メニュー
					var i;
					var num = _menu_item_param.length;
					for(i=0;i<num;i++){
						var param = _menu_item_param[i];
						var item = new MenuItemCreate(_i18n.getMessage(param.asset),i);
						item.setBackgroundColor(param.bgcolor);
						item.setSupport(_menu_support_param[i].menu);
						_menu_items.push(item);
					}
				}

				// メニュー下部
				var menu_item_bottom = DocumentCreateElement("div");
				ElementSetStyle(menu_item_bottom,"height:50px;");
				_menu_window.appendChild(menu_item_bottom);

			// コンテンツ部
			_content_window = DocumentCreateElement("div");
			ElementSetStyle(_content_window,"width:auto; min-width:500px; display:table-cell; vertical-align:top; padding:10px 20px 50px; background-color:#FFF; border-radius:5px; box-shadow:3px 3px 3px #888;");
			out_table.appendChild(_content_window);

			// 基本設定
			_config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_STANDARD);

			// --------------------------------------------------------------------------------
			// 履歴復元
			// --------------------------------------------------------------------------------
			window.onpopstate = function(e){
				var state = e.state;
				if(!state) return;

				// 履歴オブジェクト変更
				_history_state = _history_state_list[state.index];
				if(!_history_state){
					_history_state_list[state.index] = _history_state = { index:state.index , selected_menu:state.menu };
				}

				var content;
				if(_history_state.selected_menu !== undefined){
					content = _config.MenuItemSelect(_history_state.selected_menu);
				}
				if(_history_state.selected_defines !== undefined){
					content.selectFromIdList(_history_state.selected_defines);
				}
				if(_history_state.selected_filters !== undefined){
					if(content.selectFilterFromList){
						content.selectFilterFromList(_history_state.selected_filters);
					}
				}
				if(_history_state.scroll_pos !== undefined){
					WindowSetScrollPosition(window,_history_state.scroll_pos);
				}
			};

			// --------------------------------------------------------------------------------
			// スクロール
			// --------------------------------------------------------------------------------
			window.onscroll = function(e){
				_history_state.scroll_pos = WindowGetScrollPosition(window);
			};

		}

		// --------------------------------------------------------------------------------
		// 初期化関数
		// --------------------------------------------------------------------------------
		_config.initialize = function(func){
			// フレームは動作させない
			if (WindowIsChild(window)){
				func(false);
				return;
			}

			// BODY が存在しない
			var body = document.body;
			if(!body){
				func(false);
				return;
			}

			// プロジェクトをロード
			projectLoad(function(e){
				initialize();
				func(true);
			});

		};

		return _config;
	}

	// --------------------------------------------------------------------------------
	// 定数
	// --------------------------------------------------------------------------------
	PageExpandConfig.MENU_TYPE_SETTING_STANDARD = 0;
	PageExpandConfig.MENU_TYPE_SETTING_ACCESS_BLOCK = 1;
	PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_REFERER = 2;
	PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_USERAGENT = 3;
	PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_ELEMENT = 4;
	PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_TEXT = 5;
	PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_ANCHOR = 6;
	PageExpandConfig.MENU_TYPE_SETTING_REPLACEMENT_TO_LINK = 7;
	PageExpandConfig.MENU_TYPE_SETTING_MAKE_LINK_TO_TEXT = 8;
	PageExpandConfig.MENU_TYPE_SETTING_EXPAND_SHORT_URL = 9;
	PageExpandConfig.MENU_TYPE_SETTING_EXPAND_TEXT = 10;
	PageExpandConfig.MENU_TYPE_SETTING_EXPAND_IMAGE = 11;
	PageExpandConfig.MENU_TYPE_SETTING_EXPAND_SOUND = 12;
	PageExpandConfig.MENU_TYPE_SETTING_EXPAND_VIDEO = 13;
	PageExpandConfig.MENU_TYPE_SETTING_EXPAND_IFRAME = 14;
	PageExpandConfig.MENU_TYPE_SETTING_STYLE_SHEET = 15;
	PageExpandConfig.MENU_TYPE_SETTING_EXPERIMENTAL = 16;
	PageExpandConfig.MENU_TYPE_SETTING_URL_MAPPING = 17;
	PageExpandConfig.MENU_TYPE_SETTING_EXPAND_BBS = 18;
	PageExpandConfig.MENU_TYPE_SETTING_DOWNLOAD = 19;
	PageExpandConfig.MENU_TYPE_SETTING_LANGUAGE = 20;
	PageExpandConfig.MENU_TYPE_CREDIT = 21;


	// --------------------------------------------------------------------------------
	// 初期化
	// --------------------------------------------------------------------------------
	switch(page_expand_arguments.execute_type){

	// --------------------------------------------------------------------------------
	// Opera のオプションとして動作
	// --------------------------------------------------------------------------------
	case "OperaExtensionOption":

		// PageExpand 初期化
		PageExpandInitialize();

		// Opera拡張機能通信
		extension_message = new OperaExtensionMessageForContent();

		// PageExpand コンストラクタ
		PageExpandConstructor();

		var config = new PageExpandConfig();
		config.initialize(function(result){
			var query = DocumentGetQuery();
			var content;

			switch(query.type){
			case "urlmap":
				content = config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_URL_MAPPING);
				content.selectFromURL(decodeURIComponent(query.url));
				break;
			case "expand_bbs":
				content = config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_EXPAND_BBS);
				content.selectFromURL(decodeURIComponent(query.url));
				break;
			default:
				content = config.MenuItemSelect(PageExpandConfig.MENU_TYPE_SETTING_STANDARD);
				break;
			}
		});

		break;

	};

}
