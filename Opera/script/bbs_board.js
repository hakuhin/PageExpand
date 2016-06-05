// --------------------------------------------------------------------------------
// PageExpand
//
// Hakuhin 2010-2016  http://hakuhin.jp
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
	// PageExpand 開放
	// --------------------------------------------------------------------------------
	function PageExpandRelease(){

		// 開放イベント発火
		if(page_expand_event_dispatcher){
			page_expand_event_dispatcher.dispatchEvent("release",null);
		}

		// ウィンドウ管理
		if(window_manager){
			window_manager.release();
			window_manager = null;
		}

		// 拡張機能通信
		if(extension_message){
			extension_message.release();
			extension_message = null;
		}

		// 最速実行
		if(page_expand_execute_faster){
			page_expand_execute_faster.release();
			page_expand_execute_faster = null;
		}

		// デバッグ関連
		if(page_expand_debug){
			page_expand_debug.release();
			page_expand_debug = null;
		}

		// 掲示板辞書
		if(bbs_dictionary){
			bbs_dictionary.release();
			bbs_dictionary = null;
		}

		// プリセットスクリプト辞書
		if(preset_script_dictionary){
			preset_script_dictionary.release();
			preset_script_dictionary = null;
		}

		// 解析辞書
		if(analyze_work_dictionary){
			analyze_work_dictionary.release();
			analyze_work_dictionary = null;
		}

		// リダイレクト辞書
		if(redirect_url_dictionary){
			redirect_url_dictionary.release();
			redirect_url_dictionary = null;
		}

		// ビデオ管理
		if(element_limitter_video){
			element_limitter_video.release();
			element_limitter_video = null;
		}

		// サウンド管理
		if(element_limitter_sound){
			element_limitter_sound.release();
			element_limitter_sound = null;
		}

		// イメージ管理
		if(element_limitter_image){
			element_limitter_image.release();
			element_limitter_image = null;
		}
		if(popup_image_container){
			popup_image_container.release();
			popup_image_container = null;
		}

		// 進捗通知
		if(notify_progress){
			notify_progress.release();
			notify_progress = null;
		}

		// スクロール監視
		if(document_observer_scroll){
			document_observer_scroll.release();
			document_observer_scroll = null;
		}

		// DOMノードの変更を監視
		if(document_observer_modify_node){
			document_observer_modify_node.release();
			document_observer_modify_node = null;
		}

		// DOMノードが外れたか監視
		if(document_observer_remove_node){
			document_observer_remove_node.release();
			document_observer_remove_node = null;
		}

		// タスク関連
		if(task_container){
			task_container.release();
			task_container = null;
		}

		// アドレス関連
		if(address_collection){
			address_collection.release();
			address_collection = null;
		}

		// ダウンロードリスト
		if(download_list_image){
			download_list_image.release();
			download_list_image = null;
		}
		if(download_list_user){
			download_list_user.release();
			download_list_user = null;
		}

		// ダウンローダーキュー関連
		if(downloader_queue){
			downloader_queue.release();
			downloader_queue = null;
		}

		// ローダーキュー関連
		if(loader_queue){
			loader_queue.release();
			loader_queue = null;
		}

		// 実行キュー関連
		if(execute_queue){
			execute_queue.release();
			execute_queue = null;
		}

		// タッチ入力
		if(input_touch){
			input_touch.release();
			input_touch = null;
		}

		// マウス入力
		if(input_mouse){
			input_mouse.release();
			input_mouse = null;
		}

		// イベントディスパッチャー
		if(page_expand_event_dispatcher){
			page_expand_event_dispatcher.release();
			page_expand_event_dispatcher = null;
		}

		// PageExpand ノード
		if(page_expand_node){
			page_expand_node.release();
			page_expand_node = null;
			page_expand_root = null;
		}

		// プロジェクト
		if(project){
			project.release();
			project = null;
		}

		// PageExpand プロジェクト
		page_expand_project = null;

		// Document オブジェクト
		document = null;

		// Window オブジェクト
		window = null;

		// 特権 オブジェクト
		admin = null;
	}

	// --------------------------------------------------------------------------------
	// アンロード監視
	// --------------------------------------------------------------------------------
	function PageExpandObserverUnload(){
		var event_handler_release;

		var removeEvent = function (e){
			if(event_handler_release){
				event_handler_release.release();
				event_handler_release = null;
			}
			if(window.removeEventListener){
				window.removeEventListener("unload",unload);
			}else if(window.detachEvent){
				window.detachEvent("onunload",unload);
			}
		};

		var unload = function (e){
			removeEvent();
			PageExpandRelease();
		};

		// アンロード監視
		if(window.addEventListener){
			window.addEventListener("unload",unload);
		}else if(window.attachEvent){
			window.attachEvent("onunload",unload);
		}

		// 開放イベント
		event_handler_release = page_expand_event_dispatcher.createEventHandler("release");
		event_handler_release.setFunction(function(){
			removeEvent();
		});
	}


	// --------------------------------------------------------------------------------
	// PageExpand 実行開始
	// --------------------------------------------------------------------------------
	function PageExpandStart(){

		if(started)	return;
		started = true;

		// --------------------------------------------------------------------------------
		// 設定
		// --------------------------------------------------------------------------------
		loader_queue.setMaxThread(project.getLoadThreadMax());
		downloader_queue.setMaxThread(project.getDownloadThreadMax());
		element_limitter_image.setEnableUnload(project.getEnableUnloadExpandImage());
		element_limitter_image.setByteSizeMax(project.getSizeMoreThenAllowUnloadExpandImage());
		element_limitter_sound.setMaxUse(project.getSoundMaxInlineSound());
		element_limitter_video.setMaxUse(project.getVideoMaxInlineVideo());
		execute_queue.setOccupancyTime(project.getExecuteQueueOccupancyTime());
		execute_queue.setSleepTime(project.getExecuteQueueSleepTime());

		// --------------------------------------------------------------------------------
		// タッチ入力
		// --------------------------------------------------------------------------------
		(function(){
			if(project.enableInputTouch()){
				var virtual_mouse_pointer;
				var touch_assist;

				// 開放イベント
				var event_handler_release = page_expand_event_dispatcher.createEventHandler("release");
				event_handler_release.setFunction(function(){
					if(virtual_mouse_pointer){
						virtual_mouse_pointer.release();
						virtual_mouse_pointer = null;
					}
					if(touch_assist){
						touch_assist.release();
						touch_assist = null;
					}
				});

				// タッチ入力
				input_touch = new InputTouch();

				// 仮想マウスポインタ
				virtual_mouse_pointer = new VirtualMousePointer(document);

				// タッチ補助
				if(project.enableDoubleTouchAssist()){
					touch_assist = new DoubleTouchAssist();
				}

				var enable_old = false;
				var touch_max = 0;

				// タッチ入力更新
				var event_update = input_touch.createEventHandler("update");
				event_update.setFunction(function (e){
					var enable_now = e.getEnableTouch();
					if(enable_now){
						var touch_list = e.getTouchList();
						var touch_num = touch_list.length;
						if(touch_max <= 1){
							if(touch_num == 1){
								input_mouse.setInputTouch(e);
								virtual_mouse_pointer.setPosition(input_touch.getPositionAverage());
							}else if(touch_num == 2){
								var touch0 = touch_list[0];
								var touch1 = touch_list[1];
								if(touch0 && touch1){
									var pos = {
										x:touch0.clientX,
										y:touch0.clientY
									};
									var vec = {
										x:touch1.clientX - touch0.clientX,
										y:touch1.clientY - touch0.clientY
									};
									virtual_mouse_pointer.setPosition(pos);
									virtual_mouse_pointer.addVector(vec);

									if(touch_assist){
										touch_assist.setShow(pos,vec);
									}
								}
							}
							touch_max = touch_num;
						}
					}else{
						touch_max = 0;
					}
					enable_old = enable_now;
				});
			}
		})();

		// --------------------------------------------------------------------------------
		// ルートウィンドウのマウス操作
		// --------------------------------------------------------------------------------
		(function(){
			if(!window_manager.existWindowRoot()) return;

			function mouseMove (e){
				if(!(task_container.getCountTask())) return;

				var offset = window_manager.getPositionFromRoot();

				// マウス入力を更新
				input_mouse.setMouseEvent({
					clientX:e.clientX - offset.x,
					clientY:e.clientY - offset.y,
					detail:e.detail,
					screenX:e.screenX,
					screenY:e.screenY,
					ctrlKey:e.ctrlKey,
					shiftKey:e.shiftKey,
					altKey:e.altKey,
					metaKey:e.metaKey,
					button:e.button
				});
			}

			var document_obj = window_manager.getWindowRoot().document;

			// 開放イベント
			var event_handler_release = page_expand_event_dispatcher.createEventHandler("release");
			event_handler_release.setFunction(function(){
				if(document_obj.removeEventListener){
					document_obj.removeEventListener("mousemove",mouseMove);
				}else if(document_obj.detachEvent){
					document_obj.detachEvent("onmousemove",mouseMove);
				}
			});

			if(document_obj.addEventListener){
				document_obj.addEventListener("mousemove",mouseMove);
			}else if(document_obj.attachEvent){
				document_obj.attachEvent("onmousemove",mouseMove);
			}
		})();

		// --------------------------------------------------------------------------------
		// 変更オブザーバー未対応
		// --------------------------------------------------------------------------------
		if(!MutationObserverSupported()){
			(function(){
				// アンカー監視
				var task = task_container.createTask();
				task.setExecuteFunc(function(task){
					document_observer_modify_node.execute();
				});
			})();
		}

		// --------------------------------------------------------------------------------
		// 更新イベント
		// --------------------------------------------------------------------------------
		// ロード完了時に実行
		function DocumentLoaded(){
			if(project.getEnableDebugMode()){
				// デバッグモード
				page_expand_debug.setVisible(true);
			}

			// 掲示板拡張初期化
			if(project.getEnableExpandBbs()){
				project.initializeScriptCallbackExpandBbs(function(response){
					expand_bbs.initialized = true;
					expand_bbs.enable = response.result;

					var ary = expand_bbs.node_queue;
					var num = ary.length;
					var i;
					for(i=0;i<num;i++){
						execute_queue.attachForExpandBbs(ElementAnalyzeBbs,ary[i]);
					}
					expand_bbs.node_queue.length = 0;
				});
			}

			if(document.addEventListener){
				if(MutationObserverSupported()){

					(function(){
						var mutation_observer;
						var event_handler_release;

						mutation_observer = MutationObserverCreate(function(mutations) {
							var i;
							var num = mutations.length;
							for(i=0;i<num;i++){
								var nodes = mutations[i].addedNodes;
								if(nodes){
									var j;
									var node_num = nodes.length;
									for(j=0;j<node_num;j++){
										execute_queue.attachLastForInsertDomNode(DomNodeAnalyzeRoot,nodes[j]);
									}
								}
							}
						});
						mutation_observer.observe(document.documentElement,{subtree:true,childList:true});

						event_handler_release = page_expand_event_dispatcher.createEventHandler("release");
						event_handler_release.setFunction(function(){
							if(mutation_observer){
								mutation_observer.disconnect();
								mutation_observer = null;
							}
						});
					})();

				}else{

					(function(){
						var event_handler_release;

						function DomNodeInsertedFunc(e){
							if(enable_analyze){
								execute_queue.attachLastForInsertDomNode(DomNodeAnalyzeRoot,e.target);
							}
						}

						// 動的追加時に発生するイベント
						document.addEventListener('DOMNodeInserted', DomNodeInsertedFunc, false);

						event_handler_release = page_expand_event_dispatcher.createEventHandler("release");
						event_handler_release.setFunction(function(){
							document.removeEventListener('DOMNodeInserted', DomNodeInsertedFunc, false);
						});
					})();

				}
			}else{
				// DOM の更新を検出できないのでタイマーによるチェック
				(function(){
					var frame = 0;
					var elements = [];
					var element_pos = 0;
					var task = task_container.createTask();
					task.setExecuteFunc(function(task){
						if(frame <= 0){
							var i;
							var num = 5;
							if(num > element_pos)	num = element_pos;
							for(i=0;i<num;i++){
								var element = elements[element_pos];
								element_pos -= 1;
								if(element){
									if(!DomNodeGetInserted(element)){
										execute_queue.attachLastForInsertDomNode(DomNodeAnalyzeRoot,element);
									}
								}
							}
							if(element_pos <= 0){
								elements = ElementGetElementsByTagName(document.body,"*");
								element_pos = elements.length;
								if(element_pos > 0)	element_pos -= 1;
								frame = 60;
							}
						}else if(execute_queue.getCountQueue() <= 0){
							frame -= 1;
						}
					});
				})();
			}

			// 解析開始
			execute_queue.attachLastForInsertDomNode(DomNodeAnalyzeRoot,document.documentElement);
			page_expand_execute_faster.startedAnalyze();
		}

		// DOM 構築完了
		DocumentGetLoadedDomContent(document,function(){
			DocumentLoaded();
		});
	}


	// --------------------------------------------------------------------------------
	// 掲示板ボード
	// --------------------------------------------------------------------------------
	function PageExpandBbsBoard(){
		var _this = this;

		// --------------------------------------------------------------------------------
		// リサイズ
		// --------------------------------------------------------------------------------
		function resize(){
			var client_size = DocumentGetClientSize(document);
			client_size.height -= 28;

			_this.enableCompactMode(client_size.width <= 450);

			var splitter_left_width = _splitter_left_width;
			var splitter_right_width = _splitter_right_width;
			var splitter_bottom_width = _splitter_bottom_width;

			var style;
			var l,r,t,b,w,h;

			if(!(_splitter_left_open)){
				splitter_left_width = 0;
			}
			if(!(_splitter_right_open)){
				splitter_right_width = 0;
			}
			if(!(_splitter_bottom_open)){
				splitter_bottom_width = 0;
			}

			if(splitter_left_width < 0){
				splitter_left_width = 0;
			}
			if(splitter_right_width < 0){
				splitter_right_width = 0;
			}
			if(splitter_bottom_width < 0){
				splitter_bottom_width = 0;
			}

			if(splitter_bottom_width > client_size.height - 6){
				splitter_bottom_width = client_size.height - 6;
			}
			var w = client_size.width - 6 - 6;
			if((splitter_left_width + splitter_right_width) > w){
				var d = splitter_left_width / (splitter_left_width + splitter_right_width);
				splitter_left_width = d * w;
				splitter_right_width = (1.0 - d) * w;
			}

			var w = client_size.width - (24 * 3 + 4 + 4);
			if(w > 150) w = 150;
			if(w < 24) w = 24;
			_select_site.style.width = (w) + "px";

			if(getCompactMode()){
				w = client_size.width;
				h = client_size.height;

				style = _category_container.style;
				style.width  = (w) + "px";

				style = _catalog_container.style;
				style.left   = "0px";
				style.width  = (w) + "px";
				style.height = (h) + "px";

				style = _thread_container.style;
				style.left   = "0px";
				style.right  = "0px";
				style.top	= "0px";
				style.bottom = "0px";
			}else{
				style = _category_container.style;
				w = splitter_left_width;
				style.width  = (w) + "px";
				style.bottom = "0px";

				style = _catalog_container.style;
				l = splitter_left_width + 6;
				w = client_size.width - splitter_left_width - 6 - splitter_right_width;
				if(getVisibleSplitterRight()) w -= 6;
				h = client_size.height - splitter_bottom_width;
				if(getVisibleSplitterBottom()) h -= 6;
				style.left   = (l) + "px";
				style.width  = (w) + "px";
				style.height = (h) + "px";

				if(_splitter_right_open){
					style = _thread_container.style;
					l = client_size.width - splitter_right_width;
					style.left   = (l) + "px";
					style.right  = "0px";
					style.top	= "0px";
					style.bottom = "0px";
				}

				if(_splitter_bottom_open){
					style = _thread_container.style;
					l = splitter_left_width + 6;
					r = 6;
					t = client_size.height - splitter_bottom_width;
					style.left   = (l) + "px";
					style.right  = (r) + "px";
					style.top	= (t) + "px";
					style.bottom = "0px";
				}

				style = _splitter_left.style;
				l = splitter_left_width;
				style.left = (l) + "px";

				style = _splitter_right.style;
				r = splitter_right_width;
				style.right  = (r) + "px";

				style = _splitter_bottom.style;
				l = splitter_left_width + 6;
				r = splitter_right_width + 6;
				b = splitter_bottom_width;
				style.left   = (l) + "px";
				style.right  = (r) + "px";
				style.bottom = (b) + "px";
			}

			_ui_catalog.resize();
		}

		// --------------------------------------------------------------------------------
		// サイト変更
		// --------------------------------------------------------------------------------
		function changeSelectSite(e){
			_current_site = _select_site.value;
			updateSite();
		}

		// --------------------------------------------------------------------------------
		// サイト更新
		// --------------------------------------------------------------------------------
		function updateSite(callback){

			disableCategoryContainer(true);
			disableCatalogContainer(true);
			disableThreadContainer(true);

			_ui_catalog.clearColumn();
			_this.clearThread();
			_active_panel = "category";

			switch(_current_site){
			case "2ch":
			case "open2ch":
			case "shitaraba":
				if(_current_site == "shitaraba"){
					_category_title.nodeValue = _current_site;
					disableCategoryContainer(true);
					openSplitterLeft(false);
				}else{
					_category_title.nodeValue = _current_site;
					disableCategoryContainer(false);
					openSplitterLeft(true);
				}

				var convert_list = new Object();
				convert_list["ppd"] = function(value){
					value = Math.floor(value * 100) / 100;
					return value.toFixed(2);
				};
				convert_list["date_new"] = UNIXTIME_ToString_JP;

				_ui_catalog.onUpdateItem = function (info){
					var parent = info.parent;
					var data = info.data;

					var get_title = function(){
						var title = data.title;
						while(true){
							var m = title.match(new RegExp("(.*)(&#169;|&copy;)(2ch[.]net|bbspink[.]com)[ 	]*$","i"));
							if(m){
								title = m[1];
								continue;
							}
							var m = title.match(new RegExp("(.*)\\[(転載禁止|無断転載禁止)\\]$","i"));
							if(m){
								title = m[1];
								continue;
							}
							break;
						}
						return title;
					};
					var get_date = function(){
						return convert_list["date_new"](data.date_new);
					};
					var get_ppd = function(){
						return convert_list["ppd"](data.ppd);
					};

					switch(info.layout_mode){
					case "list":
						var container = DocumentCreateElement("div");
						ElementSetStyle(container,"margin:2px; margin-left:4px; margin-right:4px;");
						parent.appendChild(container);

						var text_container = DocumentCreateElement("div");
						ElementSetStyle(text_container,"left:0px; right:0px; top:0px; bottom:0px; overflow:hidden;");
						container.appendChild(text_container);

						var text_block0 = DocumentCreateElement("div");
						ElementSetStyle(text_block0,"");
						text_container.appendChild(text_block0);
						var inline_text0 = DocumentCreateElement("span");
						ElementSetStyle(inline_text0,"word-break:break-all;");
						text_block0.appendChild(inline_text0);
						var text_node0 = document.createTextNode("");
						inline_text0.appendChild(text_node0);

						var text_block1 = DocumentCreateElement("div");
						ElementSetStyle(text_block1,"margin-top:2px;");
						text_container.appendChild(text_block1);
						var inline_text1 = DocumentCreateElement("span");
						ElementSetStyle(inline_text1,"color:#888;");
						text_block1.appendChild(inline_text1);
						var text_node1 = document.createTextNode("");
						inline_text1.appendChild(text_node1);

						info.onupdate = function(){
							text_node0.nodeValue = data.number + ":" + get_title() + " (" + data.res + ")";
							text_node1.nodeValue = "[" + get_ppd() + "/d] [" + get_date() + "]";
						};
						break;

					case "small_icon":
						var inline_text = DocumentCreateElement("span");
						ElementSetStyle(inline_text,"text-decoration:underline; word-break:break-all;");
						parent.appendChild(inline_text);
						var text_node = document.createTextNode("");
						inline_text.appendChild(text_node);

						info.onupdate = function(){
							text_node.nodeValue = data.number + ":" + get_title() + " (" + data.res + ")";
						};
						break;

					case "large_icon":
						var container = DocumentCreateElement("div");
						ElementSetStyle(container,"margin:4px;");
						parent.appendChild(container);

						var text_container = DocumentCreateElement("div");
						ElementSetStyle(text_container,"margin:4px; margin-top:0px;");
						container.appendChild(text_container);

						var text_block0 = DocumentCreateElement("div");
						ElementSetStyle(text_block0,"");
						text_container.appendChild(text_block0);
						var inline_text0 = DocumentCreateElement("span");
						ElementSetStyle(inline_text0,"word-break:break-all;");
						text_block0.appendChild(inline_text0);
						var text_node0 = document.createTextNode("");
						inline_text0.appendChild(text_node0);

						var text_block1 = DocumentCreateElement("div");
						ElementSetStyle(text_block1,"margin-top:2px;");
						text_container.appendChild(text_block1);
						var inline_text1 = DocumentCreateElement("span");
						ElementSetStyle(inline_text1,"color:#888;");
						text_block1.appendChild(inline_text1);
						var text_node1 = document.createTextNode("");
						inline_text1.appendChild(text_node1);

						info.onupdate = function(){
							text_node0.nodeValue = data.number + ":" + get_title() + " (" + data.res + ")";
							text_node1.nodeValue = "[" + get_ppd() + "/d] [" + get_date() + "]";
						};
						break;
					}

					return;
					var element;
					switch(info.layout_mode){
					case "small_icon":
						element = DocumentCreateElement("span");
						break;
					default:
						element = DocumentCreateElement("div");
						ElementSetStyle(element,"margin:2px; margin-left:4px; margin-right:4px;");
						break;
					}
					info.parent.appendChild(element);

					var data = info.data;
					ElementSetTextContent(element,data.number + ":" + data.title + "(" + data.res + ")");
				};

				_ui_catalog.onUpdateCell = function (info){
					var callback = convert_list[info.key];
					var parent = info.parent;
					var data = info.data;
					var text_node = document.createTextNode("");
					parent.appendChild(text_node);

					info.onupdate = function(){
						if(callback){
							text_node.nodeValue = callback(data[info.key]);
						}else{
							text_node.nodeValue = data[info.key];
						}
					}
				};

				var column;
				column = _ui_catalog.createColumn("number");
				column.setLabel("No");
				column.setWidthMin(50);
				column.setWidthMax(50);
				column.setTextAlign("center");

				column = _ui_catalog.createColumn("title");
				column.setLabel("Title");
				column.setWidthMin(300);

				column = _ui_catalog.createColumn("res");
				column.setLabel("Res");
				column.setWidthMin(50);
				column.setWidthMax(50);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("ppd");
				column.setLabel("P/d");
				column.setWidthMin(70);
				column.setWidthMax(70);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("date_new");
				column.setLabel("Since");
				column.setWidthMin(150);
				column.setWidthMax(150);
				column.setTextAlign("center");

				_ui_catalog.setBlockSize(180,180 * (1/2));
				_ui_catalog.sort("number",false);
				break;

			case "2chan":
				_category_title.nodeValue = _current_site;
				disableCategoryContainer(false);
				openSplitterLeft(true);

				var convert_list = new Object();
				convert_list["ppd"] = function(value){
					value = Math.floor(value * 100) / 100;
					return value.toFixed(2);
				};
				convert_list["date_new"] = Timestamp_ToString_JP;

				_ui_catalog.onUpdateItem = function (info){
					var parent = info.parent;
					var data = info.data;

					var get_title = function(size){
						if(data.title.length > size){
							return data.title.substr(0,size) + "...";
						}
						return data.title;
					};
					var get_date = function(){
						return convert_list["date_new"](data.date_new);
					};
					var get_ppd = function(){
						return convert_list["ppd"](data.ppd);
					};

					switch(info.layout_mode){
					case "list":
						var container = DocumentCreateElement("div");
						ElementSetStyle(container,"position:relative; margin:2px; margin-left:4px; margin-right:4px; min-height:60px;");
						parent.appendChild(container);

						var img_block = DocumentCreateElement("div");
						ElementSetStyle(img_block,"position:absolute; width:60px; height:60px; text-align:right;");
						container.appendChild(img_block);

						var image = data.image;
						if(image){
							ElementSetStyle(image,"max-width:100%; max-height:60px;");
							img_block.appendChild(image);
						}

						var text_container = DocumentCreateElement("div");
						ElementSetStyle(text_container,"margin-left:65px;");
						container.appendChild(text_container);

						var text_block0 = DocumentCreateElement("div");
						ElementSetStyle(text_block0,"");
						text_container.appendChild(text_block0);
						var inline_text0 = DocumentCreateElement("span");
						ElementSetStyle(inline_text0,"word-break: break-all;");
						text_block0.appendChild(inline_text0);
						var text_node0 = document.createTextNode("");
						inline_text0.appendChild(text_node0);

						var text_block1 = DocumentCreateElement("div");
						ElementSetStyle(text_block1,"margin-top:2px;");
						text_container.appendChild(text_block1);
						var inline_text1 = DocumentCreateElement("span");
						ElementSetStyle(inline_text1,"color:#888;");
						text_block1.appendChild(inline_text1);
						var text_node1 = document.createTextNode("");
						inline_text1.appendChild(text_node1);

						info.onupdate = function(){
							text_node0.nodeValue = data.number + ":" + data.title + " (" + data.res + ")";
							text_node1.nodeValue = "[" + get_ppd() + "/d] [" + get_date() + "]";
						};
						break;

					case "small_icon":
						var inline_text = DocumentCreateElement("span");
						ElementSetStyle(inline_text,"text-decoration:underline; word-break:break-all;");
						parent.appendChild(inline_text);
						var text_node = document.createTextNode("");
						inline_text.appendChild(text_node);

						info.onupdate = function(){
							text_node.nodeValue = data.number + ":" + get_title(100) + " (" + data.res + ")";
						};
						break;

					case "large_icon":
						var img_block = DocumentCreateElement("div");
						ElementSetStyle(img_block,"margin:4px; margin-bottom:0px; text-align:center;");
						parent.appendChild(img_block);

						var image = data.image;
						if(image){
							ElementSetStyle(image,"max-width:100%; max-height:140px;");
							img_block.appendChild(image);
						}

						var text_block = DocumentCreateElement("div");
						ElementSetStyle(text_block,"margin:4px; margin-top:2px;");
						parent.appendChild(text_block);
						var inline_text = DocumentCreateElement("span");
						ElementSetStyle(inline_text,"word-break:break-all;");
						text_block.appendChild(inline_text);
						var text_node = document.createTextNode("");
						inline_text.appendChild(text_node);

						info.onupdate = function(){
							text_node.nodeValue = data.number + ":" + get_title(50) + " (" + data.res + ")";
						};
						break;
					}
				};

				_ui_catalog.onUpdateCell = function (info){
					var callback = convert_list[info.key];
					var parent = info.parent;
					var data = info.data;
					var text_node = document.createTextNode("");
					parent.appendChild(text_node);

					info.onupdate = function(){
						if(callback){
							text_node.nodeValue = callback(data[info.key]);
						}else{
							text_node.nodeValue = data[info.key];
						}
					}
				};

				var column;
				column = _ui_catalog.createColumn("number");
				column.setLabel("No");
				column.setWidthMin(50);
				column.setWidthMax(50);
				column.setTextAlign("center");

				column = _ui_catalog.createColumn("title");
				column.setLabel("Title");
				column.setWidthMin(300);

				column = _ui_catalog.createColumn("res");
				column.setLabel("Res");
				column.setWidthMin(50);
				column.setWidthMax(50);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("ppd");
				column.setLabel("P/d");
				column.setWidthMin(70);
				column.setWidthMax(70);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("id");
				column.setLabel("id");
				column.setWidthMin(100);
				column.setWidthMax(100);
				column.setTextAlign("center");

				column = _ui_catalog.createColumn("date_new");
				column.setLabel("Since");
				column.setWidthMin(150);
				column.setWidthMax(150);
				column.setTextAlign("center");

				_ui_catalog.setBlockSize(140,140 * (4/3));
				_ui_catalog.sort("number",false);
				break;

			case "4chan":
				_category_title.nodeValue = _current_site;
				disableCategoryContainer(false);
				openSplitterLeft(true);

				var convert_list = new Object();
				convert_list["ppd"] = function(value){
					value = Math.floor(value * 100) / 100;
					return value.toFixed(2);
				};
				convert_list["date_new"] = UNIXTIME_ToString_JP;

				_ui_catalog.onUpdateItem = function (info){
					var parent = info.parent;
					var data = info.data;

					var get_title = function(size){
						if(data.title.length > size){
							return data.title.substr(0,size) + "...";
						}
						return data.title;
					};
					var get_date = function(){
						return convert_list["date_new"](data.date_new);
					};
					var get_ppd = function(){
						return convert_list["ppd"](data.ppd);
					};

					switch(info.layout_mode){
					case "list":
						var container = DocumentCreateElement("div");
						ElementSetStyle(container,"position:relative; margin:2px; margin-left:4px; margin-right:4px; min-height:60px;");
						parent.appendChild(container);

						var img_block = DocumentCreateElement("div");
						ElementSetStyle(img_block,"position:absolute; width:60px; height:60px; text-align:right;");
						container.appendChild(img_block);

						var image = data.image;
						if(image){
							ElementSetStyle(image,"max-width:100%; max-height:60px;");
							img_block.appendChild(image);
						}

						var text_container = DocumentCreateElement("div");
						ElementSetStyle(text_container,"margin-left:65px;");
						container.appendChild(text_container);

						var text_block0 = DocumentCreateElement("div");
						ElementSetStyle(text_block0,"");
						text_container.appendChild(text_block0);
						var inline_text0 = DocumentCreateElement("span");
						ElementSetStyle(inline_text0,"word-break: break-all;");
						text_block0.appendChild(inline_text0);
						var text_node0 = document.createTextNode("");
						inline_text0.appendChild(text_node0);

						var text_block1 = DocumentCreateElement("div");
						ElementSetStyle(text_block1,"margin-top:2px;");
						text_container.appendChild(text_block1);
						var inline_text1 = DocumentCreateElement("span");
						ElementSetStyle(inline_text1,"color:#888;");
						text_block1.appendChild(inline_text1);
						var text_node1 = document.createTextNode("");
						inline_text1.appendChild(text_node1);

						info.onupdate = function(){
							text_node0.nodeValue = data.number + ":" + data.title;
							text_node1.nodeValue = "R:" + data.replies + " I:" + data.images + " [" + get_ppd() + "/d] [" + get_date() + "]";
						};
						break;

					case "small_icon":
						var inline_text = DocumentCreateElement("span");
						ElementSetStyle(inline_text,"text-decoration:underline; word-break:break-all;");
						parent.appendChild(inline_text);
						var text_node = document.createTextNode("");
						inline_text.appendChild(text_node);

						info.onupdate = function(){
							text_node.nodeValue = data.number + ":" + get_title(100) + " (" + data.replies + ")";
						};
						break;

					case "large_icon":
						var img_block = DocumentCreateElement("div");
						ElementSetStyle(img_block,"margin:4px; margin-bottom:0px; text-align:center;");
						parent.appendChild(img_block);

						var image = data.image;
						if(image){
							ElementSetStyle(image,"max-width:100%; max-height:140px;");
							img_block.appendChild(image);
						}

						var text_block = DocumentCreateElement("div");
						ElementSetStyle(text_block,"margin:4px; margin-top:2px;");
						parent.appendChild(text_block);
						var inline_text = DocumentCreateElement("span");
						ElementSetStyle(inline_text,"word-break:break-all;");
						text_block.appendChild(inline_text);
						var text_node = document.createTextNode("");
						inline_text.appendChild(text_node);

						info.onupdate = function(){
							text_node.nodeValue = data.number + ":" + get_title(50) + " (" + data.replies + ")";
						};
						break;
					}
				};

				_ui_catalog.onUpdateCell = function (info){
					var callback = convert_list[info.key];
					var parent = info.parent;
					var data = info.data;
					var text_node = document.createTextNode("");
					parent.appendChild(text_node);

					info.onupdate = function(){
						if(callback){
							text_node.nodeValue = callback(data[info.key]);
						}else{
							text_node.nodeValue = data[info.key];
						}
					}
				};

				var column;
				column = _ui_catalog.createColumn("number");
				column.setLabel("No");
				column.setWidthMin(50);
				column.setWidthMax(50);
				column.setTextAlign("center");

				column = _ui_catalog.createColumn("title");
				column.setLabel("Title");
				column.setWidthMin(300);

				column = _ui_catalog.createColumn("replies");
				column.setLabel("Replies");
				column.setWidthMin(50);
				column.setWidthMax(70);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("images");
				column.setLabel("Images");
				column.setWidthMin(50);
				column.setWidthMax(70);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("ppd");
				column.setLabel("P/d");
				column.setWidthMin(70);
				column.setWidthMax(70);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("id");
				column.setLabel("id");
				column.setWidthMin(100);
				column.setWidthMax(100);
				column.setTextAlign("center");

				column = _ui_catalog.createColumn("date_new");
				column.setLabel("Since");
				column.setWidthMin(150);
				column.setWidthMax(150);
				column.setTextAlign("center");

				_ui_catalog.setBlockSize(140,140 * (4/3));
				_ui_catalog.sort("number",false);
				break;

			case "8chan":
				_category_title.nodeValue = _current_site;
				disableCategoryContainer(false);
				openSplitterLeft(true);

				var convert_list = new Object();
				convert_list["ppd"] = function(value){
					value = Math.floor(value * 100) / 100;
					return value.toFixed(2);
				};
				convert_list["date_new"] = UNIXTIME_ToString_JP;

				_ui_catalog.onUpdateItem = function (info){
					var parent = info.parent;
					var data = info.data;

					var get_title = function(size){
						if(data.title.length > size){
							return data.title.substr(0,size) + "...";
						}
						return data.title;
					};
					var get_date = function(){
						return convert_list["date_new"](data.date_new);
					};
					var get_ppd = function(){
						return convert_list["ppd"](data.ppd);
					};

					switch(info.layout_mode){
					case "list":
						var container = DocumentCreateElement("div");
						ElementSetStyle(container,"position:relative; margin:2px; margin-left:4px; margin-right:4px; min-height:60px;");
						parent.appendChild(container);

						var img_block = DocumentCreateElement("div");
						ElementSetStyle(img_block,"position:absolute; width:60px; height:60px; text-align:right;");
						container.appendChild(img_block);

						var image = data.image;
						if(image){
							ElementSetStyle(image,"max-width:100%; max-height:60px;");
							img_block.appendChild(image);
						}

						var text_container = DocumentCreateElement("div");
						ElementSetStyle(text_container,"margin-left:65px;");
						container.appendChild(text_container);

						var text_block0 = DocumentCreateElement("div");
						ElementSetStyle(text_block0,"");
						text_container.appendChild(text_block0);
						var inline_text0 = DocumentCreateElement("span");
						ElementSetStyle(inline_text0,"word-break: break-all;");
						text_block0.appendChild(inline_text0);
						var text_node0 = document.createTextNode("");
						inline_text0.appendChild(text_node0);

						var text_block1 = DocumentCreateElement("div");
						ElementSetStyle(text_block1,"margin-top:2px;");
						text_container.appendChild(text_block1);
						var inline_text1 = DocumentCreateElement("span");
						ElementSetStyle(inline_text1,"color:#888;");
						text_block1.appendChild(inline_text1);
						var text_node1 = document.createTextNode("");
						inline_text1.appendChild(text_node1);

						info.onupdate = function(){
							text_node0.nodeValue = data.number + ":" + data.title;
							text_node1.nodeValue = "R:" + data.replies + " I:" + data.images + " [" + get_ppd() + "/d] [" + get_date() + "]";
						};
						break;

					case "small_icon":
						var inline_text = DocumentCreateElement("span");
						ElementSetStyle(inline_text,"text-decoration:underline; word-break:break-all;");
						parent.appendChild(inline_text);
						var text_node = document.createTextNode("");
						inline_text.appendChild(text_node);

						info.onupdate = function(){
							text_node.nodeValue = data.number + ":" + get_title(100) + " (" + data.replies + ")";
						};
						break;

					case "large_icon":
						var img_block = DocumentCreateElement("div");
						ElementSetStyle(img_block,"margin:4px; margin-bottom:0px; text-align:center;");
						parent.appendChild(img_block);

						var image = data.image;
						if(image){
							ElementSetStyle(image,"max-width:100%; max-height:140px;");
							img_block.appendChild(image);
						}

						var text_block = DocumentCreateElement("div");
						ElementSetStyle(text_block,"margin:4px; margin-top:2px;");
						parent.appendChild(text_block);
						var inline_text = DocumentCreateElement("span");
						ElementSetStyle(inline_text,"word-break:break-all;");
						text_block.appendChild(inline_text);
						var text_node = document.createTextNode("");
						inline_text.appendChild(text_node);

						info.onupdate = function(){
							text_node.nodeValue = data.number + ":" + get_title(50) + " (" + data.replies + ")";
						};
						break;
					}
				};

				_ui_catalog.onUpdateCell = function (info){
					var callback = convert_list[info.key];
					var parent = info.parent;
					var data = info.data;
					var text_node = document.createTextNode("");
					parent.appendChild(text_node);

					info.onupdate = function(){
						if(callback){
							text_node.nodeValue = callback(data[info.key]);
						}else{
							text_node.nodeValue = data[info.key];
						}
					}
				};

				var column;
				column = _ui_catalog.createColumn("number");
				column.setLabel("No");
				column.setWidthMin(50);
				column.setWidthMax(50);
				column.setTextAlign("center");

				column = _ui_catalog.createColumn("title");
				column.setLabel("Title");
				column.setWidthMin(300);

				column = _ui_catalog.createColumn("replies");
				column.setLabel("Replies");
				column.setWidthMin(50);
				column.setWidthMax(70);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("images");
				column.setLabel("Images");
				column.setWidthMin(50);
				column.setWidthMax(70);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("ppd");
				column.setLabel("P/d");
				column.setWidthMin(70);
				column.setWidthMax(70);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("id");
				column.setLabel("id");
				column.setWidthMin(100);
				column.setWidthMax(100);
				column.setTextAlign("center");

				column = _ui_catalog.createColumn("date_new");
				column.setLabel("Since");
				column.setWidthMin(150);
				column.setWidthMax(150);
				column.setTextAlign("center");

				_ui_catalog.setBlockSize(140,140 * (4/3));
				_ui_catalog.sort("number",false);
				break;

			case "reddit":
				_category_title.nodeValue = "reddit";
				disableCategoryContainer(true);
				openSplitterLeft(false);

				var convert_list = new Object();
				convert_list["ppd"] = function(value){
					value = Math.floor(value * 100) / 100;
					return value.toFixed(2);
				};
				convert_list["date_new"] = UNIXTIME_ToString_JP;

				_ui_catalog.onUpdateItem = function (info){
					var parent = info.parent;
					var data = info.data;

					var get_title = function(size){
						if(data.title.length > size){
							return data.title.substr(0,size) + "...";
						}
						return data.title;
					};
					var get_date = function(){
						return convert_list["date_new"](data.date_new);
					};
					var get_ppd = function(){
						return convert_list["ppd"](data.ppd);
					};

					switch(info.layout_mode){
					case "list":
						var container = DocumentCreateElement("div");
						ElementSetStyle(container,"position:relative; margin:2px; margin-left:4px; margin-right:4px; min-height:60px;");
						parent.appendChild(container);

						var img_block = DocumentCreateElement("div");
						ElementSetStyle(img_block,"position:absolute; width:60px; height:60px; text-align:right;");
						container.appendChild(img_block);

						var image = data.image;
						if(image){
							ElementSetStyle(image,"max-width:100%; max-height:60px;");
							img_block.appendChild(image);
						}

						var text_container = DocumentCreateElement("div");
						ElementSetStyle(text_container,"margin-left:65px;");
						container.appendChild(text_container);

						var text_block0 = DocumentCreateElement("div");
						ElementSetStyle(text_block0,"");
						text_container.appendChild(text_block0);
						var inline_text0 = DocumentCreateElement("span");
						ElementSetStyle(inline_text0,"word-break: break-all;");
						text_block0.appendChild(inline_text0);
						var text_node0 = document.createTextNode("");
						inline_text0.appendChild(text_node0);

						var text_block1 = DocumentCreateElement("div");
						ElementSetStyle(text_block1,"margin-top:2px;");
						text_container.appendChild(text_block1);
						var inline_text1 = DocumentCreateElement("span");
						ElementSetStyle(inline_text1,"color:#888;");
						text_block1.appendChild(inline_text1);
						var text_node1 = document.createTextNode("");
						inline_text1.appendChild(text_node1);

						info.onupdate = function(){
							text_node0.nodeValue = data.number + ":" + data.title;
							text_node1.nodeValue = "S:" + data.score + " C:" + data.comments + " [" + get_ppd() + "/d] [" + get_date() + "]";
						};
						break;

					case "small_icon":
						var inline_text = DocumentCreateElement("span");
						ElementSetStyle(inline_text,"text-decoration:underline; word-break:break-all;");
						parent.appendChild(inline_text);
						var text_node = document.createTextNode("");
						inline_text.appendChild(text_node);

						info.onupdate = function(){
							text_node.nodeValue = data.number + ":" + get_title(100) + " (" + data.comments + ")";
						};
						break;

					case "large_icon":
						var img_block = DocumentCreateElement("div");
						ElementSetStyle(img_block,"margin:4px; margin-bottom:0px; text-align:center;");
						parent.appendChild(img_block);

						var image = data.image;
						if(image){
							ElementSetStyle(image,"max-width:100%; max-height:140px;");
							img_block.appendChild(image);
						}

						var text_block = DocumentCreateElement("div");
						ElementSetStyle(text_block,"margin:4px; margin-top:2px;");
						parent.appendChild(text_block);
						var inline_text = DocumentCreateElement("span");
						ElementSetStyle(inline_text,"word-break:break-all;");
						text_block.appendChild(inline_text);
						var text_node = document.createTextNode("");
						inline_text.appendChild(text_node);

						info.onupdate = function(){
							text_node.nodeValue = data.number + ":" + get_title(50) + " (" + data.comments + ")";
						};
						break;
					}
				};

				_ui_catalog.onUpdateCell = function (info){
					var callback = convert_list[info.key];
					var parent = info.parent;
					var data = info.data;
					var text_node = document.createTextNode("");
					parent.appendChild(text_node);

					info.onupdate = function(){
						if(callback){
							text_node.nodeValue = callback(data[info.key]);
						}else{
							text_node.nodeValue = data[info.key];
						}
					}
				};

				var column;
				column = _ui_catalog.createColumn("number");
				column.setLabel("No");
				column.setWidthMin(50);
				column.setWidthMax(50);
				column.setTextAlign("center");

				column = _ui_catalog.createColumn("title");
				column.setLabel("Title");
				column.setWidthMin(300);

				column = _ui_catalog.createColumn("comments");
				column.setLabel("Comments");
				column.setWidthMin(50);
				column.setWidthMax(100);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("score");
				column.setLabel("Score");
				column.setWidthMin(50);
				column.setWidthMax(100);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("ppd");
				column.setLabel("P/d");
				column.setWidthMin(70);
				column.setWidthMax(70);
				column.setTextAlign("right");

				column = _ui_catalog.createColumn("date_new");
				column.setLabel("Since");
				column.setWidthMin(150);
				column.setWidthMax(150);
				column.setTextAlign("center");

				_ui_catalog.setBlockSize(140,140 * (4/3));
				_ui_catalog.sort("number",false);
				break;

			default:
				_category_title.nodeValue = _current_site;
				disableCategoryContainer(true);
				openSplitterLeft(false);
				_active_panel = "";
				break;
			}

			updateCompactMode();
			_ui_catalog.resize();
			updateCategoryReload(callback);
		}

		// --------------------------------------------------------------------------------
		// サイト設定
		// --------------------------------------------------------------------------------
		_this.setSite = function (type,callback){
			if(_current_site == type) return;
			_select_site.value = _current_site = type;
			updateSite(callback);
		};

		// --------------------------------------------------------------------------------
		// カタログ設定
		// --------------------------------------------------------------------------------
		_this.setCatalog = function (url,callback){
				disableCatalogContainer(false);
				_active_panel = "catalog";
				updateCompactMode();
				_catalog_url = url;
				_ui_catalog.clearItem();
				updateCatalogReload(callback);
		};

		// --------------------------------------------------------------------------------
		// スレッド設定
		// --------------------------------------------------------------------------------
		_this.setThread = function (url){
			disableThreadContainer(false);
			_thread_url = url;
			_thread_title.nodeValue = url;
			_thread_iframe.src = url;
		};

		// --------------------------------------------------------------------------------
		// スレッドクリア
		// --------------------------------------------------------------------------------
		_this.clearThread = function (){
			disableThreadContainer(true);
			_thread_url = "about:blank";
			_thread_iframe.src = _thread_url;
			_thread_title.nodeValue = "";
		};

		// --------------------------------------------------------------------------------
		// カテゴリの無効設定
		// --------------------------------------------------------------------------------
		function disableCategoryContainer(disable){
			_category_container_disable = disable;
			updateCategoryContainer();
		}

		// --------------------------------------------------------------------------------
		// カタログの無効設定
		// --------------------------------------------------------------------------------
		function disableCatalogContainer(disable){
			_catalog_container_disable = disable;
			updateCatalogContainer();
		}

		// --------------------------------------------------------------------------------
		// スレッドの無効設定
		// --------------------------------------------------------------------------------
		function disableThreadContainer(disable){
			_thread_container_disable = disable;
			updateThreadContainer();
		}

		// --------------------------------------------------------------------------------
		// カテゴリの表示設定
		// --------------------------------------------------------------------------------
		function visibleCategoryContainer(type){
			var style = _category_container.style;
			if(type){
				style.display = "block";
			}else{
				style.display = "none";
			}
		}

		// --------------------------------------------------------------------------------
		// カタログの表示設定
		// --------------------------------------------------------------------------------
		function visibleCatalogContainer(type){
			var style = _catalog_container.style;
			if(type){
				style.display = "block";
				_ui_catalog.resize();
			}else{
				style.display = "none";
			}
		}

		// --------------------------------------------------------------------------------
		// スレッドの表示設定
		// --------------------------------------------------------------------------------
		function visibleThreadContainer(type){
			var style = _thread_container.style;
			if(type){
				style.display = "block";
				_ui_catalog.setTargetMode("thread");
			}else{
				style.display = "none";
				_ui_catalog.setTargetMode("_blank");
			}
		}

		// --------------------------------------------------------------------------------
		// カテゴリの表示取得
		// --------------------------------------------------------------------------------
		function getVisibleCategoryContainer(){
			if(_category_container_disable){
				return false;
			}
			if(!(_splitter_left_open)){
				return false;
			}
			return true;
		}

		// --------------------------------------------------------------------------------
		// カタログの表示取得
		// --------------------------------------------------------------------------------
		function getVisibleCatalogContainer(){
			if(_catalog_container_disable){
				return false;
			}
			return true;
		}

		// --------------------------------------------------------------------------------
		// スレッドの表示取得
		// --------------------------------------------------------------------------------
		function getVisibleThreadContainer(){
			if(_compact_mode){
				return false;
			}
			if(_thread_container_disable){
				return false;
			}
			if(_splitter_right_open || _splitter_bottom_open){
			}else{
				return false;
			}
			return true;
		}

		// --------------------------------------------------------------------------------
		// カテゴリの表示更新
		// --------------------------------------------------------------------------------
		function updateCategoryContainer(){
			visibleCategoryContainer(getVisibleCategoryContainer());
		}

		// --------------------------------------------------------------------------------
		// カタログの表示更新
		// --------------------------------------------------------------------------------
		function updateCatalogContainer(){
			visibleCatalogContainer(getVisibleCatalogContainer());
		}

		// --------------------------------------------------------------------------------
		// スレッドの表示更新
		// --------------------------------------------------------------------------------
		function updateThreadContainer(){
			visibleThreadContainer(getVisibleThreadContainer());
		}

		// --------------------------------------------------------------------------------
		// メニューカテゴリをクリック
		// --------------------------------------------------------------------------------
		function clickMenuCategory(e){
			if(_compact_mode){
				_active_panel = "category";
				updateCompactMode();
			}else{
				openSplitterLeft(!(_splitter_left_open));
			}
		}

		// --------------------------------------------------------------------------------
		// メニューカタログをクリック
		// --------------------------------------------------------------------------------
		function clickMenuCatalog(e){
			if(_compact_mode){
				_active_panel = "catalog";
				updateCompactMode();
			}
		}

		// --------------------------------------------------------------------------------
		// サイドバーリロードをクリック
		// --------------------------------------------------------------------------------
		function clickMenuSidebarReload(e){
			if(_this.onreload){
				_this.onreload();
			}
		}

		// --------------------------------------------------------------------------------
		// リロードイベント
		// --------------------------------------------------------------------------------
		_this.onreload = function (){};

		// --------------------------------------------------------------------------------
		// メニュースレッドをクリック
		// --------------------------------------------------------------------------------
		function clickMenuThread(e){
			if(_splitter_bottom_open){
				openSplitterBottom(false);
				openSplitterRight(true);
			}else if(_splitter_right_open){
				openSplitterBottom(false);
				openSplitterRight(false);
			}else{
				openSplitterBottom(true);
				openSplitterRight(false);
			}
		}

		// --------------------------------------------------------------------------------
		// メニュースレッドを更新
		// --------------------------------------------------------------------------------
		function updateMenuThread(){
			_button_menu_thread.setVisible(getVisibleMenuThread());
		}
		function getVisibleMenuThread(){
			if(_sidebar_mode) return false;
			if(_compact_mode) return false;
			return true;
		}

		// --------------------------------------------------------------------------------
		// カテゴリレイアウトをクリック
		// --------------------------------------------------------------------------------
		function clickCategoryLayout(e){
			_category_layout_mode ++;
			if(_category_layout_mode >= 4){
				_category_layout_mode = 0;
			}

			updateCategoryLayout(e);
		}

		// --------------------------------------------------------------------------------
		// カテゴリレイアウトを更新
		// --------------------------------------------------------------------------------
		function updateCategoryLayout(e){
			switch(_category_layout_mode){
			case 0:
				_ui_category.setOpenMode(true);
				_ui_category.setLayoutMode("inline");
				break;
			case 1:
				_ui_category.setOpenMode(true);
				_ui_category.setLayoutMode("block");
				break;
			case 2:
				_ui_category.setOpenMode(false);
				_ui_category.setLayoutMode("inline");
				break;
			case 3:
				_ui_category.setOpenMode(false);
				_ui_category.setLayoutMode("block");
				break;
			}
		}

		// --------------------------------------------------------------------------------
		// カテゴリリロードをクリック
		// --------------------------------------------------------------------------------
		function clickCategoryReload(e){
			updateCategoryReload();
		}

		// --------------------------------------------------------------------------------
		// カテゴリリロードを更新
		// --------------------------------------------------------------------------------
		function updateCategoryReload(callback){

			var complete = function(response){
				_button_category_reload.setDisabled(false);

				if(callback){
					callback(response);
				}
			};

			_ui_category.clear();
			_button_category_reload.setDisabled(true);

			// ローダーオブジェクトを作成
			var loader = new Loader();

			switch(_current_site){
			case "2ch":
			case "open2ch":

				// 成功
				loader.onload = function(str){
					var re_folder = new RegExp("^<br><B>(.*)</B><br>","i");
					var re_item = new RegExp("<A HREF=(.*)>(.*)</A>","gi");
					var re_start = new RegExp("<br><b>","gi");
					var re_end = new RegExp("<br><B>","gi");

					var p = 0;
					var n = str.length;
					function f(){
						try{
							if(p >= n) throw 0;

							re_start.lastIndex = p;
							var m = re_start.exec(str);
							if(!m) throw 0;
							p = m.index;

							re_end.lastIndex = re_start.lastIndex;
							var m = re_end.exec(str);
							if(m){
								e = m.index;
							}else{
								e = n;
							}
							var s = str.substring(p,e);
							var m = s.match(re_folder);
							if(m){
								var folder = _ui_category.createFolder(m[1]);
								folder.setLabel(m[1]);

								s.replace(re_item,function(m,p1,p2,index,str){
									var item = folder.createItem(p1);
									item.setLabel(p2);
									item.setURL(p1);
								});
							}

							if(p < e){
								p = e;
								execute_queue.attachFirst(f,null);
								return;
							}
						}catch(e){
						}

						complete({result:true});
					}

					execute_queue.attachLast(f,null);
				};

				// 失敗
				loader.onerror = function(){
					complete({result:false});
				};

				// テキストの読み込み
				loader.setMethod("GET");
				loader.setURL("http://menu." + _current_site + ".net/bbsmenu.html");
				loader.overrideMimeType("text/plain; charset=Shift_JIS");
				loader.loadText();
				break;

			case "2chan":

				// 成功
				loader.onload = function(str){
					var re_folder = new RegExp("^<b>(.*)</b><br>","i");
					var re_item = new RegExp('<a href="([^"]*)"[^>]*>([^<]*)',"gi");

					var p = 0;
					var n = str.length;
					function f(){
						try{
							if(p >= n) throw 0;
							p = str.indexOf("<b>",p);
							if(p < 0) throw 0;
							var e = str.indexOf("<b>",p+3);
							if(e < 0) e = n;
							var s = str.substring(p,e);
							var m = s.match(re_folder);
							if(m){
								var folder = _ui_category.createFolder(m[1]);
								folder.setLabel(m[1]);

								s.replace(re_item,function(m,p1,p2,index,str){
									var item = folder.createItem(p1);
									item.setLabel(p2);
									item.setURL(p1);
								});
							}

							if(p < e){
								p = e;
								execute_queue.attachFirst(f,null);
								return;
							}
						}catch(e){
						}

						complete({result:true});
					}

					execute_queue.attachLast(f,null);
				};

				// 失敗
				loader.onerror = function(){
					complete({result:false});
				};

				// テキストの読み込み
				loader.setMethod("GET");
				loader.setURL("http://www.2chan.net/bbsmenu.html");
				loader.overrideMimeType("text/plain; charset=Shift_JIS");
				loader.loadText();
				break;

			case "4chan":

				// 成功
				loader.onload = function(str){
					var boards = JsonParse(str).boards;

					var folder = _ui_category.createFolder("4chan");
					folder.setLabel("4chan");

					var p = 0;
					var n = boards.length;
					function f(){
						try{
							if(p >= n) throw 0;
							var board = boards[p];
							p += 1;

							var item = folder.createItem(board.board);
							item.setLabel(board.title);
							item.setURL("https://boards.4chan.org/" + (board.board) + "/");

							execute_queue.attachFirst(f,null);
						}catch(e){
						}

						complete({result:true});
					}

					execute_queue.attachLast(f,null);
				};

				// 失敗
				loader.onerror = function(){
					complete({result:false});
				};

				// テキストの読み込み
				loader.setMethod("GET");
				loader.setURL("https://a.4cdn.org/boards.json");
				loader.loadText();
				break;

			case "8chan":

				// 成功
				loader.onload = function(str){
					var boards = JsonParse(str);

					var folder = _ui_category.createFolder("8chan");
					folder.setLabel("8chan");

					var p = 0;
					var n = boards.length;
					if(n > 2000) n = 2000;
					function f(){
						try{
							if(p >= n) throw 0;
							var board = boards[p];
							p += 1;

							var item = folder.createItem(board.title);
							item.setLabel(board.uri);
							item.setURL("https://8ch.net/" + (board.uri) + "/");

							execute_queue.attachFirst(f,null);
						}catch(e){
						}

						complete({result:true});
					}

					execute_queue.attachLast(f,null);
				};

				// 失敗
				loader.onerror = function(){
					complete({result:false});
				};

				// テキストの読み込み
				loader.setMethod("GET");
				loader.setURL("https://8ch.net/boards.json");
				loader.loadText();
				break;

			default:
				complete({result:false});
				break;
			}
		}

		// --------------------------------------------------------------------------------
		// カタログレイアウトをクリック
		// --------------------------------------------------------------------------------
		function clickCatalogLayout(e){
			_catalog_layout_mode ++;
			if(_catalog_layout_mode >= 4){
				_catalog_layout_mode = 0;
			}

			updateCatalogLayout(e);
		}

		// --------------------------------------------------------------------------------
		// カタログレイアウトを更新
		// --------------------------------------------------------------------------------
		function updateCatalogLayout(e){
			switch(_catalog_layout_mode){
			case 0:
					_ui_catalog.setLayoutMode("detail");
					break;
			case 1:
					_ui_catalog.setLayoutMode("list");
					break;
			case 2:
					_ui_catalog.setLayoutMode("large_icon");
					break;
			case 3:
					_ui_catalog.setLayoutMode("small_icon");
					break;
			}
		}

		// --------------------------------------------------------------------------------
		// カタログリロードをクリック
		// --------------------------------------------------------------------------------
		function clickCatalogReload(e){
			updateCatalogReload();
		}

		// --------------------------------------------------------------------------------
		// カタログリロードを更新
		// --------------------------------------------------------------------------------
		function updateCatalogReload(callback){

			var complete = function(response){
				_button_catalog_reload.setDisabled(false);

				if(callback){
					callback(response);
				}
			};

			_button_catalog_reload.setDisabled(true);

			switch(_current_site){
			case "2ch":
			case "open2ch":
			case "shitaraba":
				var domain;
				var directory;
				if(_current_site == "shitaraba"){
					if(!domain){
						var m = _catalog_url.match(new RegExp("http://([^/]+[.](shitaraba)[.]net)/(test|bbs)/[^/]+[.]cgi/([^/]+/[0-9]+)","i"));
						if(m){
							domain = m[1];
							directory = m[4];
						}
					}
					if(!domain){
						var m = _catalog_url.match(new RegExp("http://([^/]+[.](shitaraba)[.]net)/([^/]+/[0-9]+)","i"));
						if(m){
							domain = m[1];
							directory = m[3];
						}
					}
					if(domain){
						_catalog_title.nodeValue = "http://" + domain + "/" + directory + "/";
					}else{
						complete({result:false});
						return;
					}
				}else{
					if(!domain){
						var m = _catalog_url.match(new RegExp("http://([^/]+[.](bbspink[.]com|open2ch[.]net|2ch[.]net))/test/read[.]cgi/([^/]+)","i"));
						if(m){
							domain = m[1];
							directory = m[3];
						}
					}
					if(!domain){
						var m = _catalog_url.match(new RegExp("http://([^/]+[.](bbspink[.]com|open2ch[.]net|2ch[.]net))/([^/]+)","i"));
						if(m){
							domain = m[1];
							directory = m[3];
						}
					}
					if(domain){
						_catalog_title.nodeValue = "http://" + domain + "/" + directory + "/";
					}else{
						complete({result:false});
						return;
					}
				}

				// ローダーオブジェクトを作成
				var loader = new Loader();

				// 成功
				loader.onload = function(str){
					var re = new RegExp("([0-9]+)[.](dat<>[ ]*|cgi,)(.*)[(]([0-9]+)[)]","i");

					var item_list = _ui_catalog.getItemList();
					var i;
					var num = item_list.length;
					for(i=0;i<num;i++){
						var data = item_list[i].getData();
						data.number = "x";
						data.ppd = (function(){
							var now = new Date();
							var old = new Date(data.date_new * 1000);
							var sub = now.getTime() - old.getTime();
							var ppd = 0;
							if(sub > 0){
								ppd = data.res / (sub / 1000 / 60 / 60 / 24);
							}
							return ppd;
						})();
					}

					var p = 0;
					var n = str.length;
					var index = 1;
					function f(){
						try{
							if(p >= n) throw 0;
							var e = str.indexOf("\n",p+1);
							if(e < 0) e = n;
							var s = str.substring(p,e);
							var m = s.match(re);
							if(m){
								var item = _ui_catalog.createItem(m[1]);
								if(_current_site == "shitaraba"){
									item.setURL("http://" + domain + "/bbs/read.cgi/" + directory + "/" + (m[1]));
								}else{
									item.setURL("http://" + domain + "/test/read.cgi/" + directory + "/" + (m[1]));
								}
								var data = item.getData();
								data.number = index;
								data.id = parseInt(m[1]);
								data.title = m[3];
								data.res = parseInt(m[4]);
								data.date_new = parseInt(data.id);
								data.ppd = (function(){
									var now = new Date();
									var old = new Date(data.date_new * 1000);
									var sub = now.getTime() - old.getTime();
									var ppd = 0;
									if(sub > 0){
										ppd = data.res / (sub / 1000 / 60 / 60 / 24);
									}
									return ppd;
								})();
								index += 1;
							}
							if(p < e){
								p = e;
								f();
								return;
							}
						}catch(e){
						}

						_ui_catalog.commit();
						complete({result:true});
					}
					f();
				};

				// 失敗
				loader.onerror = function(){
					complete({result:false});
				};

				// テキストの読み込み
				loader.setMethod("GET");
				loader.setURL("http://" + domain + "/" + directory + "/subject.txt");
				if(_current_site == "shitaraba"){
					loader.overrideMimeType("text/plain; charset=euc-jp");
				}else{
					loader.overrideMimeType("text/plain; charset=Shift_JIS");
				}
				loader.loadText();
				break;

			case "2chan":
				var domain;
				var directory;
				if(!domain){
					var m = _catalog_url.match(new RegExp("http://([^/]+[.]2chan[.]net)/([^/]+)","i"));
					if(m){
						domain = m[1];
						directory = m[2];
					}
				}
				if(domain){
					_catalog_title.nodeValue = "http://" + domain + "/" + directory + "/futaba.htm";
				}else{
					complete({result:false});
					return;
				}

				// ローダーオブジェクトを作成
				var loader = new Loader();

				// 成功
				loader.onload = function(str){
					var re_href = new RegExp("<a href='res/([0-9]+)[.]htm","i");
					var re_image = new RegExp("<img src='(.*)/(cat|thumb)/([^']*)","i");
					var re_title = new RegExp("<small>([^<]*)</small>","i");
					var re_res = new RegExp("<font[^>]*>([0-9]+)</font>","i");
					var re_date = new RegExp("/([0-9]+)s[.]jpg","i");

					var item_list = _ui_catalog.getItemList();
					var i;
					var num = item_list.length;
					for(i=0;i<num;i++){
						var data = item_list[i].getData();
						data.number = "x";
						data.ppd = (function(){
							var now = new Date();
							var old = new Date(data.date_new);
							var sub = now.getTime() - old.getTime();
							var ppd = 0;
							if(sub > 0){
								ppd = data.res / (sub / 1000 / 60 / 60 / 24);
							}
							return ppd;
						})();
					}

					var p = 0;
					var n = str.length;
					var index = 1;
					function f(){
						try{
							if(p >= n) throw 0;
							p = str.indexOf("<tr><td>",p);
							if(p < 0) throw 0;
							var e = str.indexOf("</td>",p+8);
							if(e < 0) e = n;
							var s = str.substring(p,e);
							var m = s.match(re_href);
							if(m){
								var item = _ui_catalog.createItem(m[1]);
								var data = item.getData();
								data.number = index;
								data.id = parseInt(m[1]);
								item.setURL("http://" + domain + "/" + directory + "/res/" + (data.id) + ".htm");

								m = s.match(re_title);
								if(m) data.title = m[1];
								m = s.match(re_res);
								if(m) data.res = parseInt(m[1]);
								m = s.match(re_date);
								if(m){
									data.date_new = parseInt(m[1]);
								}else{
									data.date_new = 0;
								}
								m = s.match(re_image);
								if(m){
									data.image_url = m[1] + "/thumb/" + m[3];
									var image = new Image();
									image.src = data.image_url;
									data.image = image;
								}
								data.ppd = (function(){
									var now = new Date();
									var old = new Date(data.date_new);
									var sub = now.getTime() - old.getTime();
									var ppd = 0;
									if(sub > 0){
										ppd = data.res / (sub / 1000 / 60 / 60 / 24);
									}
									return ppd;
								})();
								index += 1;
							}
							if(p < e){
								p = e;
								f();
								return;
							}
						}catch(e){
						}

						_ui_catalog.commit();
						complete({result:true});
					}

					f();
				};

				// 失敗
				loader.onerror = function(){
					complete({result:false});
				};

				// テキストの読み込み
				loader.setMethod("GET");
				loader.setURL("http://" + domain + "/" + directory + "/futaba.php?mode=cat&cxyl=1x2000x2000x0x6");
				loader.overrideMimeType("text/plain; charset=Shift_JIS");
				loader.loadText();
				break;

			case "4chan":
				var domain;
				var directory;
				if(!domain){
					var m = _catalog_url.match(new RegExp("(http|https)://([^/]+[.]4chan[.]org)/([^/]+)","i"));
					if(m){
						domain = m[2];
						directory = m[3];
					}
				}
				if(domain){
					_catalog_title.nodeValue = "https://" + domain + "/" + directory + "/";
				}else{
					complete({result:false});
					return;
				}

				// ローダーオブジェクトを作成
				var loader = new Loader();

				// 成功
				loader.onload = function(str){
					var item_list = _ui_catalog.getItemList();
					var i;
					var num = item_list.length;
					for(i=0;i<num;i++){
						var data = item_list[i].getData();
						data.number = "x";
						data.ppd = (function(){
							var now = new Date();
							var old = new Date(data.date_new * 1000);
							var sub = now.getTime() - old.getTime();
							var ppd = 0;
							if(sub > 0){
								ppd = data.replies / (sub / 1000 / 60 / 60 / 24);
							}
							return ppd;
						})();
					}

					var index = 1;
					try{
						var pages = JsonParse(str);

						var i,j;
						for(i=0;i<pages.length;i++){
							var threads = pages[i].threads;
							for(j=0;j<threads.length;j++){
								var thread = threads[j];

								var item = _ui_catalog.createItem(thread.no);
								item.setURL("https://" + domain + "/" + directory + "/thread/" + thread.no);
								var data = item.getData();
								data.number = index;
								data.id = thread.no;
								data.title = (function(){
									if(thread.sub) return thread.sub;
									try{
										var dom_parser = new DOMParser();
										var document_obj = dom_parser.parseFromString(thread.com , "text/html");
										return ElementGetTextContent(document_obj.body);
									}catch(e){
									}
									return (thread.com || "");
								})();
								data.replies = thread.replies;
								data.images = thread.images;
								data.date_new = thread.time;
								data.image_url = "https://i.4cdn.org/" + directory + "/" + thread.tim + "s.jpg";
								if(data.image_url){
									var image = new Image();
									image.src = data.image_url;
									data.image = image;
								}
								data.ppd = (function(){
									var now = new Date();
									var old = new Date(data.date_new * 1000);
									var sub = now.getTime() - old.getTime();
									var ppd = 0;
									if(sub > 0){
										ppd = data.replies / (sub / 1000 / 60 / 60 / 24);
									}
									return ppd;
								})();

								index += 1;
							}
						}

					}catch(e){
					}

					_ui_catalog.commit();
					complete({result:true});
				};

				// 失敗
				loader.onerror = function(){
					complete({result:false});
				};

				// テキストの読み込み
				loader.setMethod("GET");
				loader.setURL("https://a.4cdn.org/" + directory + "/catalog.json");
				loader.loadText();
				break;

			case "8chan":
				var domain;
				var directory;
				if(!domain){
					var m = _catalog_url.match(new RegExp("(http|https)://(8ch[.]net)/([^/]+)","i"));
					if(m){
						domain = m[2];
						directory = m[3];
					}
				}
				if(domain){
					_catalog_title.nodeValue = "https://" + domain + "/" + directory + "/";
				}else{
					complete({result:false});
					return;
				}

				// ローダーオブジェクトを作成
				var loader = new Loader();

				// 成功
				loader.onload = function(str){
					var item_list = _ui_catalog.getItemList();
					var i;
					var num = item_list.length;
					for(i=0;i<num;i++){
						var data = item_list[i].getData();
						data.number = "x";
						data.ppd = (function(){
							var now = new Date();
							var old = new Date(data.date_new * 1000);
							var sub = now.getTime() - old.getTime();
							var ppd = 0;
							if(sub > 0){
								ppd = data.replies / (sub / 1000 / 60 / 60 / 24);
							}
							return ppd;
						})();
					}

					var index = 1;
					try{
						var pages = JsonParse(str);

						var i,j;
						for(i=0;i<pages.length;i++){
							var threads = pages[i].threads;
							for(j=0;j<threads.length;j++){
								var thread = threads[j];

								var item = _ui_catalog.createItem(thread.no);
								item.setURL("https://" + domain + "/" + directory + "/res/" + thread.no + ".html");
								var data = item.getData();
								data.number = index;
								data.id = thread.no;
								data.title = (function(){
									if(thread.sub) return thread.sub;
									try{
										var dom_parser = new DOMParser();
										var document_obj = dom_parser.parseFromString(thread.com , "text/html");
										return ElementGetTextContent(document_obj.body);
									}catch(e){
									}
									return (thread.com || "");
								})();
								data.replies = thread.replies;
								data.images = thread.images;
								data.date_new = thread.time;
								data.image_url = (function(){
									var thumb = (function(){
										if(!(thread.tim)) return null;
										return thread.tim + ".jpg";
									})();
									if(thumb){
										return "https://8ch.net/" + directory + "/thumb/" + thumb;
									}
									if(thread.embed){
										var m = thread.embed.match(new RegExp("//img[.]youtube[.]com/vi/[^/]+/[0-9]+[.]jpg","i"));
										if(m) return "https:" + m[0];
									}
									return null;
								})();
								if(data.image_url){
									var image = new Image();
									image.src = data.image_url;
									data.image = image;
								}
								data.ppd = (function(){
									var now = new Date();
									var old = new Date(data.date_new * 1000);
									var sub = now.getTime() - old.getTime();
									var ppd = 0;
									if(sub > 0){
										ppd = data.replies / (sub / 1000 / 60 / 60 / 24);
									}
									return ppd;
								})();

								index += 1;
							}
						}

					}catch(e){
					}

					_ui_catalog.commit();
					complete({result:true});
				};

				// 失敗
				loader.onerror = function(){
					complete({result:false});
				};

				// テキストの読み込み
				loader.setMethod("GET");
				loader.setURL("https://8ch.net/" + directory + "/catalog.json");
				loader.loadText();
				break;

			case "reddit":
				var domain;
				var directory;
				var order;
				if(!domain){
					var m = _catalog_url.match(new RegExp("https://(www[.]reddit[.]com)/r/([^/]+)","i"));
					if(m){
						domain = m[1];
						directory = m[2];
					}
				}
				if(domain){
					var m = _catalog_url.match(new RegExp("reddit[.]com/r/[^/]+/(hot|new|rising|controversial|top)"));
					if(m){
						order = m[1];
					}

					var title = "https://" + domain + "/r/" + directory + "/";
					if(order) title += order + "/";
					_catalog_title.nodeValue = title;
				}else{
					complete({result:false});
					return;
				}

				var index = 0;
				var load_count = 0;
				var load_max = 10;
				var load_func = function (after){

					// ローダーオブジェクトを作成
					var loader = new Loader();

					// 成功
					loader.onload = function(str){
						try{
							var response = JsonParse(str);
							after = response.data.after;
							var children = 	response.data.children;
							var i;
							var num = children.length;
							for(i=0;i<num;i++){
								var thread = children[i].data;

								var item = _ui_catalog.createItem(thread.id);
								item.setURL("https://" + domain + thread.permalink);
								var data = item.getData();
								data.number = (index + 1);
								data.id = thread.id;
								data.title = thread.title;
								data.score = thread.score;
								data.comments = thread.num_comments;
								data.date_new = thread.created_utc;
								if(thread.thumbnail.indexOf("thumbs.redditmedia.com") >= 0){
									data.image_url = thread.thumbnail;
								}
								if(data.image_url){
									var image = new Image();
									image.src = data.image_url;
									data.image = image;
								}
								data.ppd = (function(){
									var now = new Date();
									var old = new Date(data.date_new * 1000);
									var sub = now.getTime() - old.getTime();
									var ppd = 0;
									if(sub > 0){
										ppd = data.comments / (sub / 1000 / 60 / 60 / 24);
									}
									return ppd;
								})();

								index += 1;
							}

						}catch(e){
						}

						_ui_catalog.commit();

						load_count ++;
						if((load_count < load_max) && after){
							load_func(after);
						}else{
							complete({result:true});
						}
					};

					// 失敗
					loader.onerror = function(){
						complete({result:false});
					};

					var loader_url = "https://" + domain + "/r/" + directory;
					if(order){
						loader_url += "/" + order;
					}
					loader_url += ".json?count=" + (index) + "&limit=100";
					if(after){
						loader_url += "&after=" + after;
					}

					// テキストの読み込み
					loader.setMethod("GET");
					loader.setURL(loader_url);
					loader.loadText();
				};
				load_func();


				break;
			default:
				complete({result:false});
				break;
			}
		}

		// --------------------------------------------------------------------------------
		// スレッドリロードをクリック
		// --------------------------------------------------------------------------------
		function clickThreadReload(e){
			_thread_iframe.src = _thread_url;
		}

		// --------------------------------------------------------------------------------
		// 左スプリッタをクリック
		// --------------------------------------------------------------------------------
		function clickSplitterLeft(e){
			openSplitterLeft(!(_splitter_left_open));
		}

		// --------------------------------------------------------------------------------
		// 右スプリッタをクリック
		// --------------------------------------------------------------------------------
		function clickSplitterRight(e){
			openSplitterBottom(false);
			openSplitterRight(!(_splitter_right_open));
		}

		// --------------------------------------------------------------------------------
		// 下スプリッタをクリック
		// --------------------------------------------------------------------------------
		function clickSplitterBottom(e){
			openSplitterRight(false);
			openSplitterBottom(!(_splitter_bottom_open));
		}

		// --------------------------------------------------------------------------------
		// 左スプリッタ開閉
		// --------------------------------------------------------------------------------
		function openSplitterLeft(open){
			_splitter_left_open = open;
			updateCategoryContainer();
			resize();
		}

		// --------------------------------------------------------------------------------
		// 右スプリッタ開閉
		// --------------------------------------------------------------------------------
		function openSplitterRight(open){
			_splitter_right_open = open;
			if(open && (_splitter_right_width <= 0)){
				var client_size = DocumentGetClientSize(document);
				var w = client_size.width - _splitter_left_width - 6 - 6;
				_splitter_right_width = w * (2/3);
				if(_splitter_right_width < 10) _splitter_right_width = 10;
			}
			updateThreadContainer();
			resize();
		}

		// --------------------------------------------------------------------------------
		// 下スプリッタ開閉
		// --------------------------------------------------------------------------------
		function openSplitterBottom(open){
			_splitter_bottom_open = open;
			if(open && (_splitter_bottom_width <= 0)){
				var client_size = DocumentGetClientSize(document);
				var h = client_size.height - 28 - 6;
				_splitter_bottom_width = h * (2/3);
				if(_splitter_bottom_width < 10) _splitter_bottom_width = 10;
			}
			updateThreadContainer();
			resize();
		}

		// --------------------------------------------------------------------------------
		// コンパクトモードを取得
		// --------------------------------------------------------------------------------
		function getCompactMode(){
			return _compact_mode;
		}

		// --------------------------------------------------------------------------------
		// コンパクトモードの有無を設定
		// --------------------------------------------------------------------------------
		_this.enableCompactMode = function (type){
			var update = (_compact_mode != type);
			_compact_mode = type;
			if(update){
				updateCompactMode();
				resize();
			}
		};

		// --------------------------------------------------------------------------------
		// コンパクトモードの更新
		// --------------------------------------------------------------------------------
		function updateCompactMode(){
			updateSplitterLeft();
			updateSplitterBottom();
			updateSplitterRight();
			updateMenuThread();

			if(_compact_mode){
				var category_enable = !Boolean(_category_container_disable);
				var catalog_enable = !Boolean(_catalog_container_disable);

				switch(_active_panel){
				case "category":
					category_enable = false;
					break;
				case "catalog":
					catalog_enable = false;
					break;
				}

				_button_menu_category.setDisabled(!category_enable);
				_button_menu_catalog.setDisabled(!catalog_enable);
				_button_menu_catalog.setVisible(true);
			}else{
				_button_menu_category.setDisabled(false);
				_button_menu_catalog.setDisabled(false);
				_button_menu_catalog.setVisible(false);
			}

			if(_compact_mode){
				visibleCategoryContainer(false);
				visibleCatalogContainer(false);
				visibleThreadContainer(false);
				switch(_active_panel){
				case "category":
					visibleCategoryContainer(true);
					break;
				case "catalog":
					visibleCatalogContainer(true);
					break;
				}
			}else{
				updateCategoryContainer();
				updateCatalogContainer();
				updateThreadContainer();
			}
		}

		// --------------------------------------------------------------------------------
		// サイドバーモードの有無を設定
		// --------------------------------------------------------------------------------
		_this.enableSidebarMode = function (type){
			var update = (_sidebar_mode != type);
			_sidebar_mode = type;
			if(update){
				updateSidebarMode();
			}
		};

		// --------------------------------------------------------------------------------
		// サイドバーモードの更新
		// --------------------------------------------------------------------------------
		function updateSidebarMode(){
			updateSplitterBottom();
			updateSplitterRight();
			updateMenuThread();
			_button_menu_sidebar_reload.setVisible(_sidebar_mode);
		}

		// --------------------------------------------------------------------------------
		// 左スプリッタの更新
		// --------------------------------------------------------------------------------
		function updateSplitterLeft(){
			visibleSplitterLeft(getVisibleSplitterLeft());
		}
		function getVisibleSplitterLeft(){
			if(_compact_mode) return false;
			return true;
		}
		function visibleSplitterLeft(type){
			_splitter_left.style.display = ((type) ? "block":"none");
		}

		// --------------------------------------------------------------------------------
		// 下スプリッタの更新
		// --------------------------------------------------------------------------------
		function updateSplitterBottom(){
			visibleSplitterBottom(getVisibleSplitterBottom());
		}
		function getVisibleSplitterBottom(){
			if(_compact_mode) return false;
			if(_sidebar_mode) return false;
			return true;
		}
		function visibleSplitterBottom(type){
			_splitter_bottom.style.display = ((type) ? "block":"none");
		}

		// --------------------------------------------------------------------------------
		// 右スプリッタの更新
		// --------------------------------------------------------------------------------
		function updateSplitterRight(){
			visibleSplitterRight(getVisibleSplitterRight());
		}
		function getVisibleSplitterRight(){
			if(_compact_mode) return false;
			if(_sidebar_mode) return false;
			return true;
		}
		function visibleSplitterRight(type){
			_splitter_right.style.display = ((type) ? "block":"none");
		}

		// --------------------------------------------------------------------------------
		// ツールボタン
		// --------------------------------------------------------------------------------
		function UI_ToolButton(parent){
			var _this = this;

			// --------------------------------------------------------------------------------
			// 表示設定
			// --------------------------------------------------------------------------------
			_this.setVisible = function(visible){
				var style = _button.style;
				if(visible){
					style.display = "inline-block";
				}else{
					style.display = "none";
				}
			};

			// --------------------------------------------------------------------------------
			// 無効設定
			// --------------------------------------------------------------------------------
			_this.setDisabled = function(disabled){
				_button.disabled = disabled;
				var style = _button.style;
				if(disabled){
					style.opacity = 0.5;
				}else{
					style.opacity = 1.0;
				}
			};

			// --------------------------------------------------------------------------------
			// ラベルを編集
			// --------------------------------------------------------------------------------
			_this.setLabel = function(value){
				_button.value = value;
			};

			// --------------------------------------------------------------------------------
			// ラベルを編集
			// --------------------------------------------------------------------------------
			_this.setImageURL = function(url){
				_image.src = url;
			};

			// --------------------------------------------------------------------------------
			// ツールチップを編集
			// --------------------------------------------------------------------------------
			_this.setTooltip = function(value){
				_button.title = value;
			};

			// --------------------------------------------------------------------------------
			// クリックイベント
			// --------------------------------------------------------------------------------
			_this.onclick = function(){};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _button;
			var _label;
			var _image;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_button = DocumentCreateElement("button");
				ElementSetStyle(_button,"position:relative; width:24px; height:24px; vertical-align:top;");
				_button.onclick = clickMenuCategory;
				parent.appendChild(_button);

				_image = DocumentCreateElement("img");
				ElementSetStyle(_image,CSSTextGetInitialImageElement());
				ElementAddStyle(_image,"vertical-align:top; margin:0px -6px; pointer-events:inherit;");
				_button.appendChild(_image);

				_label = DocumentCreateElement("div");
				ElementSetStyle(_label,"position:absolute; left:0px; top:0px; right:0px; bottom:0px; text-align:center;");
				_button.appendChild(_label);

				_button.onclick = function(e){
					if(_this.onclick){
						_this.onclick(e)
					}
				};
			})();
		}

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
				project.importObjectForBackground(page_expand_project.getProject());
				func(e);
			});
		}

		// --------------------------------------------------------------------------------
		// イベントを追加（内部用）
		// --------------------------------------------------------------------------------
		function addEvent(){
			removeEvent();

			if(window.addEventListener){
				window.addEventListener("resize",resize,false);
			}else if(window.attachEvent){
				window.attachEvent("onresize",resize);
			}
		}

		// --------------------------------------------------------------------------------
		// イベントを破棄（内部用）
		// --------------------------------------------------------------------------------
		function removeEvent(){
			if(window.removeEventListener){
				window.removeEventListener("resize",resize,false);
			}else if(window.detachEvent){
				window.detachEvent("onresize",resize);
			}
		}

		// --------------------------------------------------------------------------------
		// セットアップ
		// --------------------------------------------------------------------------------
		_this.setURL = function(url){
			if(!url) return;

			var m = url.match(new RegExp("(http|https)://([^/]+)","i"));
			if(!m) return;

			var domain = m[2];
			var site;
			if(domain.match(new RegExp("open2ch[.]net$","i"))){
				site = "open2ch";
			}else if(domain.match(new RegExp("shitaraba[.]net$","i"))){
				site = "shitaraba";
			}else if(domain.match(new RegExp("(bbspink[.]com|2ch[.]net)$","i"))){
				site = "2ch";
			}else if(domain.match(new RegExp("2chan[.]net$","i"))){
				site = "2chan";
			}else if(domain.match(new RegExp("4chan[.]org","i"))){
				site = "4chan";
			}else if(domain.match(new RegExp("8ch[.]net|8chan.co","i"))){
				site = "8chan";
			}else if(domain.match(new RegExp("reddit[.]com$","i"))){
				site = "reddit";
			}
			
			if(site){
				_this.setSite(site);
				_this.setCatalog(url);
			}else{
				_this.setSite("");
				_select_site.focus();
			}
		};

		// --------------------------------------------------------------------------------
		// 初期化（内部用）
		// --------------------------------------------------------------------------------
		function initialize(){

			var data_uri_category = "data:image/gif;base64,R0lGODlhEAAQAIAAAP///wAAACH5BAUUAAAALAAAAAAQABAAAAInRH6gy4bR4oORzWofbnRdy3nc1HWKaYhghoSb62mrmrJyvZWv0wIFADs=";
			var data_uri_catalog = "data:image/gif;base64,R0lGODlhEAAQAIAAAP///wAAACH5BAUUAAAALAAAAAAQABAAAAIhhI9pwe2+mEIh1rns27iDDV6NJ0pdGULelD4W+Z5auyoFADs=";
			var data_uri_thread = "data:image/gif;base64,R0lGODlhEAAQAIAAAP///wAAACH5BAUUAAAALAAAAAAQABAAAAIojI9pwO2+VACITvmsTft6/kRKp2XmYmai17Fp+G2a+zZiy6I1I/VGAQA7";
			var data_uri_layout = "data:image/gif;base64,R0lGODlhEAAQAIAAAAAAAP///yH5BAUUAAEALAAAAAAQABAAAAIrjI9pwBDt4Jru2Vsjna919lXKeEimh6UZp1lrCEvkfILyirOby3q1OEsUAAA7";
			var data_uri_reload = "data:image/gif;base64,R0lGODlhEAAQAIAAAP///wAAACH5BAUUAAAALAAAAAAQABAAAAIlhI+pyxD/UJDRQDdtptcymFUJGC5k2YzpuJlS02JmjG3dfK9MAQA7";

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
			ElementSetStyle(body,'font-family:"Meiryo","sans-serif"; margin:0px; padding:0px; background-color:#ccc; overflow:hidden; user-select:none; -moz-user-select:none; -webkit-user-select:none;');
			html.appendChild(body);

			// タイトル
			document.title = "BBS Board";

			// メニュー
			var bbs_board_menu = DocumentCreateElement("div");
 			ElementSetStyle(bbs_board_menu,"position:absolute; top:0px; left:0px; right:0px; height:28px; color:#fff; background:#000;");
			body.appendChild(bbs_board_menu);

			// メニュー右
			var container_right = DocumentCreateElement("div");
 			ElementSetStyle(container_right,"position:absolute; right:4px; top:2px;");
			bbs_board_menu.appendChild(container_right);

				// リロードボタン
				_button_menu_sidebar_reload = new UI_ToolButton(container_right);
				_button_menu_sidebar_reload.setImageURL(data_uri_reload);
				_button_menu_sidebar_reload.setTooltip("reload");
				_button_menu_sidebar_reload.onclick = clickMenuSidebarReload;

			// メニュー左
			var container_left = DocumentCreateElement("div");
 			ElementSetStyle(container_left,"position:absolute; left:4px; top:2px;");
			bbs_board_menu.appendChild(container_left);

				// ドメイン選択
				_select_site = DocumentCreateElement("select");
				_select_site.size = 1;
				_select_site.onchange = changeSelectSite;
				ElementSetStyle(_select_site,"height:24px; box-sizing:border-box; vertical-align:top;");
				container_left.appendChild(_select_site);

					var option = DocumentCreateElement("option");
					ElementSetStyle(option,"color:#aaa;");
					ElementSetTextContent(option,"Select the site ...");
					option.value = "";
					_select_site.appendChild(option);

				   var option = DocumentCreateElement("option");
					ElementSetTextContent(option,"2ch.net");
					option.value = "2ch";
					_select_site.appendChild(option);

					var option = DocumentCreateElement("option");
					ElementSetTextContent(option,"open2ch.net");
					option.value = "open2ch";
					_select_site.appendChild(option);

					var option = DocumentCreateElement("option");
					ElementSetTextContent(option,"2chan.net");
					option.value = "2chan";
					_select_site.appendChild(option);

					var option = DocumentCreateElement("option");
					ElementSetTextContent(option,"4chan.org");
					option.value = "4chan";
					_select_site.appendChild(option);

					var option = DocumentCreateElement("option");
					ElementSetTextContent(option,"8ch.net (experimental)");
					option.value = "8chan";
					_select_site.appendChild(option);

				// カテゴリボタン
				_button_menu_category = new UI_ToolButton(container_left);
				_button_menu_category.setImageURL(data_uri_category);
				_button_menu_category.setTooltip("category");
				_button_menu_category.onclick = clickMenuCategory;

				// カタログボタン
				_button_menu_catalog = new UI_ToolButton(container_left);
				_button_menu_catalog.setImageURL(data_uri_catalog);
				_button_menu_catalog.setTooltip("catalog");
				_button_menu_catalog.onclick = clickMenuCatalog;

				// スレッドボタン
				_button_menu_thread = new UI_ToolButton(container_left);
				_button_menu_thread.setImageURL(data_uri_thread);
				_button_menu_thread.setTooltip("thread");
				_button_menu_thread.onclick = clickMenuThread;

			// コンテナ
			_bbs_board_container = DocumentCreateElement("div");
 			ElementSetStyle(_bbs_board_container,"position:absolute; top:28px; left:0px; right:0px; bottom:0px;");
			body.appendChild(_bbs_board_container);

 			// スプリッタ左
			_splitter_left = DocumentCreateElement("div");
 			ElementSetStyle(_splitter_left,"position:absolute; width:2px; top:0px; bottom:0px; border-left:2px #fff solid; border-right:2px #666 solid; cursor:col-resize;");
			_bbs_board_container.appendChild(_splitter_left);

 			// スプリッタ右
			_splitter_right = DocumentCreateElement("div");
 			ElementSetStyle(_splitter_right,"position:absolute; width:2px; top:0px; bottom:0px; border-left:2px #fff solid; border-right:2px #666 solid; cursor:col-resize;");
			_bbs_board_container.appendChild(_splitter_right);

 			// スプリッタ下
			_splitter_bottom = DocumentCreateElement("div");
 			ElementSetStyle(_splitter_bottom,"position:absolute; height:2px; bottom:0px; border-top:2px #fff solid; border-bottom:2px #666 solid; cursor:row-resize;");
			_bbs_board_container.appendChild(_splitter_bottom);

				(function(){
					
					function f(info){
						var task;
						var old_pos;
						var dragging = false;
						var element = info.splitter;

						element.onmousedown = function(e){
							if(task) task.release();

							input_mouse.setMouseEvent(e);
							old_pos = input_mouse.getPositionClient();

							task = task_container.createTask();
							task.setDestructorFunc(function(){
								dragging = false;
								task = null;	
							});
							task.setExecuteFunc(function(){
								if(!dragging){
									var mouse_pos = input_mouse.getPositionClient();
									var vec_x = mouse_pos.x - old_pos.x;
									var vec_y = mouse_pos.y - old_pos.y;
									if(Math.sqrt(vec_x * vec_x + vec_y * vec_y) >= 3.0){
										dragging = true;
										_thread_cover.style.display = "block";
										info.ondragstart();
									}
								}

								if(dragging){
									info.ondrag();
									resize();
								}

								if(!(input_mouse.getButtonLeft())){
									if(dragging){
										_thread_cover.style.display = "none";
										info.ondragend();
									}
									task.release();
									return;
								}
							});
						};

						element.onclick = function(e){
							if(dragging) return;
							info.onclick(e);
						};
					}
					
					f({
						splitter:_splitter_left,
						onclick:clickSplitterLeft,
						ondragstart:function(){
							openSplitterLeft(true);
						},
						ondrag:function(){
							var mouse_pos = input_mouse.getPositionClient();
							_splitter_left_width = mouse_pos.x - 3;
						},
						ondragend:function(){
							if(_splitter_left_width < 10){
								_splitter_left_width = 10;
								openSplitterLeft(false);
							}
						}
					});

					f({
						splitter:_splitter_right,
						onclick:clickSplitterRight,
						ondragstart:function(){
							openSplitterBottom(false);
							openSplitterRight(true);
						},
						ondrag:function(){
							var client_size = DocumentGetClientSize(document);
							var mouse_pos = input_mouse.getPositionClient();
							_splitter_right_width = client_size.width - mouse_pos.x - 3;
						},
						ondragend:function(){
							if(_splitter_right_width < 10){
								_splitter_right_width = 10;
								openSplitterRight(false);
							}
						}
					});

					f({
						splitter:_splitter_bottom,
						onclick:clickSplitterBottom,
						ondragstart:function(){
							openSplitterRight(false);
							openSplitterBottom(true);
						},
						ondrag:function(){
							var client_size = DocumentGetClientSize(document);
							var mouse_pos = input_mouse.getPositionClient();
							_splitter_bottom_width = client_size.height - mouse_pos.y - 3;
						},
						ondragend:function(){
							if(_splitter_bottom_width < 10){
								_splitter_bottom_width = 10;
								openSplitterBottom(false);
							}
						}
					});
				})();

			// カテゴリコンテナ
			_category_container = DocumentCreateElement("div");
 			ElementSetStyle(_category_container,"position:absolute; left:0px; top:0px; bottom:0px; overflow:hidden;");
			_bbs_board_container.appendChild(_category_container);

			// カタログコンテナ
			_catalog_container = DocumentCreateElement("div");
 			ElementSetStyle(_catalog_container,"position:absolute; top:0px; overflow:hidden;");
			_bbs_board_container.appendChild(_catalog_container);

			// スレッドコンテナ
			_thread_container = DocumentCreateElement("div");
 			ElementSetStyle(_thread_container,"position:absolute; top:0px; overflow:hidden;");
			_bbs_board_container.appendChild(_thread_container);

 			// カテゴリメニュー
			var category_menu = DocumentCreateElement("div");
 			ElementSetStyle(category_menu,"position:absolute; left:0px; top:0px; right:0px; height:28px; background:#444;");
			_category_container.appendChild(category_menu);

				// メニュー左
				var container_left = DocumentCreateElement("div");
				ElementSetStyle(container_left,"position:absolute; left:8px; top:2px; right:56px;");
				category_menu.appendChild(container_left);

				// メニュー右
				var container_right = DocumentCreateElement("div");
				ElementSetStyle(container_right,"position:absolute; right:4px; top:2px;");
				category_menu.appendChild(container_right);

				// カテゴリタイトル
				var category_title = DocumentCreateElement("div");
				ElementSetStyle(category_title,"color:#fff; font-size:14px; padding-top:1px; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;");
				container_left.appendChild(category_title);
				_category_title = document.createTextNode("");
				_category_title.nodeValue = "Category Panel";
				category_title.appendChild(_category_title);

				// レイアウトボタン
				_button_category_layout = new UI_ToolButton(container_right);
				_button_category_layout.setImageURL(data_uri_layout);
				_button_category_layout.setTooltip("layout");
				_button_category_layout.onclick = clickCategoryLayout;

				// リロードボタン
				_button_category_reload = new UI_ToolButton(container_right);
				_button_category_reload.setImageURL(data_uri_reload);
				_button_category_reload.setTooltip("reload");
				_button_category_reload.onclick = clickCategoryReload;

 			// カテゴリボディ
			var category_body = DocumentCreateElement("div");
 			ElementSetStyle(category_body,"position:absolute; left:0px; top:28px; right:0px; bottom:0px;");
			_category_container.appendChild(category_body);

				// カテゴリ
				_ui_category = new BbsBoardCategory(category_body);
				_ui_category.onselect = function(e){
					if(e.button == 1) return;
					var selected_item = _ui_category.getSelectedItem();

					disableCatalogContainer(false);
					_active_panel = "catalog";
					updateCompactMode();
					_catalog_url = selected_item.getURL();
					_ui_catalog.clearItem();
					updateCatalogReload();

					return false;
				};
				updateCategoryLayout();

  			// カタログメニュー
			var catalog_menu = DocumentCreateElement("div");
 			ElementSetStyle(catalog_menu,"position:absolute; left:0px; top:0px; right:0px; height:28px; background:#444;");
			_catalog_container.appendChild(catalog_menu);

				// メニュー左
				var container_left = DocumentCreateElement("div");
				ElementSetStyle(container_left,"position:absolute; left:8px; top:2px; right:56px;");
				catalog_menu.appendChild(container_left);

				// メニュー右
				var container_right = DocumentCreateElement("div");
				ElementSetStyle(container_right,"position:absolute; right:4px; top:2px;");
				catalog_menu.appendChild(container_right);

				// タイトル
				var catalog_title = DocumentCreateElement("div");
				ElementSetStyle(catalog_title,"color:#fff; font-size:14px; padding-top:1px; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;");
				container_left.appendChild(catalog_title);
				_catalog_title = document.createTextNode("");
				_catalog_title.nodeValue = "Catalog Panel";
				catalog_title.appendChild(_catalog_title);

				// レイアウトボタン
				_button_catalog_layout = new UI_ToolButton(container_right);
				_button_catalog_layout.setImageURL(data_uri_layout);
				_button_catalog_layout.setTooltip("layout");
				_button_catalog_layout.onclick = clickCatalogLayout;

				// 更新ボタン
				_button_catalog_reload = new UI_ToolButton(container_right);
				_button_catalog_reload.setImageURL(data_uri_reload);
				_button_catalog_reload.setTooltip("reload");
				_button_catalog_reload.onclick = clickCatalogReload;

 			// カタログボディ
			var catalog_body = DocumentCreateElement("div");
 			ElementSetStyle(catalog_body,"position:absolute; left:0px; top:28px; right:0px; bottom:0px;");
			_catalog_container.appendChild(catalog_body);

				// カタログ
				_ui_catalog = new BbsBoardCatalog(catalog_body);
				_ui_catalog.onselect = function(e){
					if(e.button == 1) return;
					disableThreadContainer(false);
					if(getVisibleThreadContainer()){
						var selected_item = _ui_catalog.getSelectedItem();
						_this.setThread(selected_item.getURL());
						return false;
					}
				};

  			// スレッドメニュー
			var thread_menu = DocumentCreateElement("div");
 			ElementSetStyle(thread_menu,"position:absolute; left:0px; top:0px; right:0px; height:28px; background:#444;");
			_thread_container.appendChild(thread_menu);

				// メニュー左
				var container_left = DocumentCreateElement("div");
				ElementSetStyle(container_left,"position:absolute; left:8px; top:2px; right:40px;");
				thread_menu.appendChild(container_left);

				// メニュー右
				var container_right = DocumentCreateElement("div");
				ElementSetStyle(container_right,"position:absolute; right:4px; top:2px;");
				thread_menu.appendChild(container_right);

				// スレッドタイトル
				var thread_title = DocumentCreateElement("div");
				ElementSetStyle(thread_title,"color:#fff; font-size:14px; padding-top:1px; width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;");
				container_left.appendChild(thread_title);
				_thread_title = document.createTextNode("");
				_thread_title.nodeValue = "Thread Panel";
				thread_title.appendChild(_thread_title);

				// 更新ボタン
				_button_thread_reload = new UI_ToolButton(container_right);
				_button_thread_reload.setImageURL(data_uri_reload);
				_button_thread_reload.setTooltip("reload");
				_button_thread_reload.onclick = clickThreadReload;

 			// スレッドボディ
			var thread_body = DocumentCreateElement("div");
 			ElementSetStyle(thread_body,"position:absolute; left:0px; top:28px; right:0px; bottom:0px;");
			_thread_container.appendChild(thread_body);

				// スレッドフレーム
				_thread_iframe = DocumentCreateElement("iframe");
				_thread_iframe.name = "thread";
				_thread_iframe.frameBorder = "0";
				_thread_iframe.allowFullscreen = true;
				_thread_iframe.src = "about:blank";
				ElementSetStyle(_thread_iframe,"position:absolute; display:block; background:#fff; left:0px; top:0px; width:100%; height:100%;");
				thread_body.appendChild(_thread_iframe);

				// カバー
				_thread_cover = DocumentCreateElement("div");
				ElementSetStyle(_thread_cover,"position:absolute; display:none; background:#000; opacity:0.2; left:0px; top:0px; right:0px; bottom:0px;");
				thread_body.appendChild(_thread_cover);

			updateCompactMode();
			updateSidebarMode();
			disableCategoryContainer(true);
			disableCatalogContainer(true);
			disableThreadContainer(true);
			addEvent();

			_splitter_left_width = 200;
			_splitter_right_width = 0;
			_splitter_bottom_width = 0;

			resize();
		}

		// --------------------------------------------------------------------------------
		// 初期化関数
		// --------------------------------------------------------------------------------
		_this.initialize = function(func){
			var info = {
				result:false
			};

			// フレームは動作させない
			if (WindowIsChild(window)){
				func(info);
				return;
			}

			// BODY が存在しない
			var body = document.body;
			if(!body){
				func(info);
				return;
			}

			// プロジェクト読み込み
			projectLoad(function(e){
				// ロケール
				_i18n = new InternationalMessage(page_expand_project.getLanguage());

				// 設定
				execute_queue.setOccupancyTime(project.getExecuteQueueOccupancyTime());
				execute_queue.setSleepTime(project.getExecuteQueueSleepTime());

				initialize();

				info.result = true;
				func(info);
			});

		};

		// --------------------------------------------------------------------------------
		// プライベート変数
		// --------------------------------------------------------------------------------
		var _i18n;
		var _bbs_board_container;
		var _category_container;
		var _catalog_container;
		var _thread_container;
		var _splitter_left;
		var _splitter_right;
		var _splitter_bottom;
		var _category_title;
		var _catalog_title;
		var _thread_title;
		var _thread_iframe;
		var _thread_cover;
		var _catalog_url;
		var _thread_url;
		var _select_site;
		var _button_menu_category;
		var _button_menu_catalog;
		var _button_menu_thread;
		var _button_menu_sidebar_reload;
		var _button_category_layout;
		var _button_category_reload;
		var _button_catalog_layout;
		var _button_catalog_reload;
		var _button_thread_reload;
		var _ui_category;
		var _ui_catalog;

		var _splitter_left_width = 0;
		var _splitter_right_width = 0;
		var _splitter_bottom_width = 0;
		var _splitter_left_open = false;
		var _splitter_right_open = false;
		var _splitter_bottom_open = false;
		var _category_container_disable = false;
		var _catalog_container_disable = false;
		var _thread_container_disable = false;
		var _compact_mode = false;
		var _sidebar_mode = false;
		var _active_panel = "";

		var _category_layout_mode = 0;
		var _catalog_layout_mode = 0;
		var _current_site = "";

		// --------------------------------------------------------------------------------
		// 初期化
		// --------------------------------------------------------------------------------
		(function(){


		})();
	}

	// --------------------------------------------------------------------------------
	// カテゴリ
	// --------------------------------------------------------------------------------
	function BbsBoardCategory(parent){
		var _this = this;

 		// --------------------------------------------------------------------------------
		// フォルダを作成
		// --------------------------------------------------------------------------------
		_this.createFolder = function (key){
		   var _folder = new Object();

			// --------------------------------------------------------------------------------
			// フォルダを作成
			// --------------------------------------------------------------------------------
			_folder.createItem = function (key){
				var _item = new Object();

				// --------------------------------------------------------------------------------
				// ラベルを設定
				// --------------------------------------------------------------------------------
				_item.setLabel = function (label){
					_anchor_text.nodeValue = label;
				};

				// --------------------------------------------------------------------------------
				// アドレスを取得
				// --------------------------------------------------------------------------------
				_item.getURL = function (){
					return _anchor.href;
				};

				// --------------------------------------------------------------------------------
				// アドレスを設定
				// --------------------------------------------------------------------------------
				_item.setURL = function (url){
					_anchor.href = url;
				};

				// --------------------------------------------------------------------------------
				// クリック
				// --------------------------------------------------------------------------------
				function click(e){					
					_selected_item = _item
					if(_this.onselect){
						return _this.onselect(e);
					}
				}

				// --------------------------------------------------------------------------------
				// プライベート変数
				// --------------------------------------------------------------------------------
				var _anchor;
				var _anchor_text;
				var _separator;

				// --------------------------------------------------------------------------------
				// 初期化
				// --------------------------------------------------------------------------------
				(function(){
					_item_dictionary[key] = _item;

					_anchor = DocumentCreateElement("a");
					ElementSetStyle(_anchor,"");
					_anchor.className = "category_item";
					_anchor.title = key;
					_anchor.target = "_blank";
					_anchor.onclick = click;
					_folder_child.appendChild(_anchor);
					_anchor_text = document.createTextNode("");
					_anchor.appendChild(_anchor_text);

					_separator = DocumentCreateElement("div");
					_separator.className = "category_item_separator";
					_folder_child.appendChild(_separator);
					ElementSetTextContent(_separator,"/");
				})();

				return _item;
			};

			// --------------------------------------------------------------------------------
			// ラベルを設定
			// --------------------------------------------------------------------------------
			_folder.setLabel = function (label){
				_label_text.nodeValue = label;
			};

			// --------------------------------------------------------------------------------
			// 開閉を設定
			// --------------------------------------------------------------------------------
			_folder.setOpen = function (type){
				_open_child = Boolean(type);
				if(_open_child){
					_icon_text.nodeValue = "-";
					var style = _folder_child.style;
					style.height = "auto";
					style.paddingBottom = "10px";
				}else{
					_icon_text.nodeValue = "+";
					var style = _folder_child.style;
					style.height = "0px";
					style.paddingBottom = "0px";
				}
			};

			// --------------------------------------------------------------------------------
			// ボディ部をクリック
			// --------------------------------------------------------------------------------
			function clickBody(){
				_folder.setOpen(!(_open_child));
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _folder_container;
			var _icon;
			var _icon_text;
			var _label;
			var _label_text;
			var _folder_body;
			var _folder_child;
			var _open_child;
			var _item_dictionary;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_folder_dictionary[key] = _folder;
				_item_dictionary = new Object();

				_folder_container = DocumentCreateElement("div");
				ElementSetStyle(_folder_container,"position:relative; margin:2px; margin-bottom:2px; padding:1px;");
				_category_container.appendChild(_folder_container);

			   _folder_body = DocumentCreateElement("div");
				_folder_body.className = "category_folder";
				_folder_body.onclick = clickBody;
				_folder_container.appendChild(_folder_body);

				_icon = DocumentCreateElement("div");
				ElementSetStyle(_icon,"display:inline-block; width:20px; text-align:center;");
				_folder_body.appendChild(_icon);
				_icon_text = document.createTextNode("");
				_icon.appendChild(_icon_text);

				_label = DocumentCreateElement("span");
				ElementSetStyle(_label,"");
				_folder_body.appendChild(_label);
				_label_text = document.createTextNode("");
				_label.appendChild(_label_text);

				_folder_child = DocumentCreateElement("div");
				ElementSetStyle(_folder_child,"margin-left:10px; overflow:hidden; line-height:16px; font-size:14px;");
				_folder_container.appendChild(_folder_child);

				_folder.setOpen(_open_mode);
			})();

			return _folder;
		};

		// --------------------------------------------------------------------------------
		// レイアウトモードを設定
		// --------------------------------------------------------------------------------
		_this.setLayoutMode = function (type){
			var style;
			switch(type){
			case "inline":
				style = _style_item.style;
				style.display = "inline-block";
				style.width = "auto";
				style.whiteSpace = "normal";
				style.overflow = "visible";
				style.wordBreak = "break-all";
				style.wordWrap = "break-word";
				style = _style_item_separator.style;
				style.display = "inline";
				break;
			case "block":
				style = _style_item.style;
				style.display = "block";
				style.width = "100%";
				style.whiteSpace = "nowrap";
				style.overflow = "hidden";
				style.wordBreak = "normal";
				style.wordWrap = "normal";
				style = _style_item_separator.style;
				style.display = "none";
				break;
			}
		};

		// --------------------------------------------------------------------------------
		// 開閉モードを設定
		// --------------------------------------------------------------------------------
		_this.setOpenMode = function (type){
			_open_mode = type;

			var key;
			var folder;
			for(key in _folder_dictionary){
				folder = _folder_dictionary[key];
				folder.setOpen(type);
			}
		};

		// --------------------------------------------------------------------------------
		// クリア
		// --------------------------------------------------------------------------------
		_this.clear = function (){
			_folder_dictionary = new Object();
			DomNodeRemoveChildren(_category_container);
		};

		// --------------------------------------------------------------------------------
		// 選択したアイテムを取得
		// --------------------------------------------------------------------------------
		_this.getSelectedItem = function (){
			return _selected_item;
		};

		// --------------------------------------------------------------------------------
		// 選択イベント
		// --------------------------------------------------------------------------------
		_this.onselect = function (item){};

		// --------------------------------------------------------------------------------
		// プライベート変数
		// --------------------------------------------------------------------------------
		var _category_container;
		var _style_item;
		var _style_item_separator;
		var _open_mode;
		var _folder_dictionary;

		// --------------------------------------------------------------------------------
		// 初期化
		// --------------------------------------------------------------------------------
		(function(){
			_folder_dictionary = new Object();

			_category_container = DocumentCreateElement("div");
			ElementSetStyle(_category_container,"position:absolute; left:0px; top:0px; right:0px; bottom:0px; overflow-y:scroll; background:#fff;");
			parent.appendChild(_category_container);

			var category_style = DocumentCreateElement("style");
			parent.appendChild(category_style);

			var style_sheet = ElementGetStyleSheet(category_style);
			CSSStyleSheetInsertRule(style_sheet,".category_folder","margin-left:0px; font-size:14px; color:#000; background:#e8e8e8; border-radius:4px; cursor:pointer; padding:2px; user-select:none; -moz-user-select:none; -webkit-user-select:none;",0);
			CSSStyleSheetInsertRule(style_sheet,".category_folder:hover","color:#fff; background:#4281F4;",1);
			CSSStyleSheetInsertRule(style_sheet,".category_item","text-overflow:ellipsis;",2);
			CSSStyleSheetInsertRule(style_sheet,".category_item:hover","background-color:rgba(192,255,160,0.3);",3);
			CSSStyleSheetInsertRule(style_sheet,".category_item_separator","font-size:14px; color:ccc; margin-left:2px; margin-right:2px;",4);

			var rule_list = CSSStyleSheetGetCSSRuleList(style_sheet);
			_style_item = rule_list[2];
			_style_item_separator = rule_list[4];

			_this.setLayoutMode("block");
		})();
	}

	// --------------------------------------------------------------------------------
	// カタログ
	// --------------------------------------------------------------------------------
	function BbsBoardCatalog(parent){
		var _this = this;

		// --------------------------------------------------------------------------------
		// カラムを作成
		// --------------------------------------------------------------------------------
		_this.createColumn = function (key){
			var _column = _column_dictionary[key];
			if(_column) return _column;
			return createColumn(key);
		};

		function createColumn(key){
			var _column = new Object();

			// --------------------------------------------------------------------------------
			// ラベルを設定
			// --------------------------------------------------------------------------------
			_column.setLabel = function (label){
				_text.nodeValue = label;
			};

			// --------------------------------------------------------------------------------
			// ラベルを設定
			// --------------------------------------------------------------------------------
			_column.setTextAlign = function (str){
				_column.text_align = str;
			};

			// --------------------------------------------------------------------------------
			// 最小幅を設定
			// --------------------------------------------------------------------------------
			_column.setWidthMin = function (value){
				_column.width_min = value;
			};

			// --------------------------------------------------------------------------------
			// 最大幅を設定
			// --------------------------------------------------------------------------------
			_column.setWidthMax = function (value){
				_column.width_max = value;
			};

			// --------------------------------------------------------------------------------
			// 最大幅を設定
			// --------------------------------------------------------------------------------
			_column.setWidth = function (value){
				_column.width = value;
				_column.width_auto = false;
			};

			// --------------------------------------------------------------------------------
			// ソートアイコンを変更
			// --------------------------------------------------------------------------------
			_column.setSortIcon = function (type){
				var style = _block.style;
				switch(type){
				case "up":
					style.backgroundImage = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAOAgMAAABvOLUFAAAAA3NCSVQICAjb4U/gAAAACVBMVEX////o6Ojo6OgQrkfNAAAAA3RSTlMARP9DYaFSAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFnRFWHRDcmVhdGlvbiBUaW1lADEyLzMwLzE1azlJyQAAACF0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgNC4w6iYndQAAAB5JREFUeJxj4GBgACItMFrVAEIQEOoAQqIMIMQCQgBf3AQV/YKvewAAAABJRU5ErkJggg==)";
					break;
				case "down":
					style.backgroundImage = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAOAgMAAABvOLUFAAAAA3NCSVQICAjb4U/gAAAACVBMVEX////o6Ojo6OgQrkfNAAAAA3RSTlMARP9DYaFSAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFnRFWHRDcmVhdGlvbiBUaW1lADEyLzMwLzE1azlJyQAAACF0RVh0U29mdHdhcmUATWFjcm9tZWRpYSBGaXJld29ya3MgNC4w6iYndQAAAB5JREFUeJxjYGFgACJRMAp1ACEIWNUAQloMIMQBQgBM1AQV4OptKwAAAABJRU5ErkJggg==)";
					break;
				default:
					style.backgroundImage = "none";
					break;
				}
				switch(type){
				case "up":
				case "down":
					break;
				default:
					break;
				}
			};

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _container;
			var _block;
			var _text;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_column.key = key;
				_column_dictionary[key] = _column;

				var index = _column_list.length;
				_column_list.push(_column);

				_column.text_align = "left";
				_column.width = 0;
				_column.width_min = 0;
				_column.width_max = 65535;
				_column.width_auto = true;
				_column.index = index;

				_container = DocumentCreateElement("div");
				ElementSetStyle(_container,"position:relative; display:inline-block; vertical-align:top; height:24px;");
				_container.className = "catalog_column_" + (index);
				_container.draggable = true;
				_container.ondragstart = function (e){					
					var cancel = (function(){
						if(_column_dragging_border) return true;
						if(_column_hover_place != "center") return true;
						return false;
					})();
					if(cancel) return false;

					var data_transfer = e.dataTransfer;
					data_transfer.setData("text",key);
				};
				_table_column.appendChild(_container);

				_block = DocumentCreateElement("div");
				_block.className = "catalog_column";
				_container.appendChild(_block);

				_text = document.createTextNode("");
				_block.appendChild(_text);

				var rule_list = CSSStyleSheetGetCSSRuleList(_style_column_list);
				if(!(rule_list[index])){
					CSSStyleSheetInsertRule(_style_column_list , ".catalog_column_" + index , "width:200px;" , index);
				}

				_column.element = _container;
				_column.setSortIcon("");
			})();

			return _column;
		}

		// --------------------------------------------------------------------------------
		// アイテムを作成
		// --------------------------------------------------------------------------------
		_this.createItem = function (key){
			var _item = _item_dictionary[key];
			if(_item) return _item;
			return createItem(key);
		};

		function createItem(key){
			var _item = new Object();

			// --------------------------------------------------------------------------------
			// データオブジェクトを取得
			// --------------------------------------------------------------------------------
			_item.getData = function (){
				return _item.data;
			};

			// --------------------------------------------------------------------------------
			// アドレスを取得
			// --------------------------------------------------------------------------------
			_item.getURL = function (){
				return _anchor.href;
			};

			// --------------------------------------------------------------------------------
			// アドレスをセット
			// --------------------------------------------------------------------------------
			_item.setURL = function (url){
				_anchor.href = url;
			};

			// --------------------------------------------------------------------------------
			// コミット
			// --------------------------------------------------------------------------------
			_item.commit = function (){
				sort();
				updateItem(_item);
			};

			// --------------------------------------------------------------------------------
			// ソート
			// --------------------------------------------------------------------------------
			function sort(index){
				var descending;
				var index = _item.index;
				var value = _item_list[index].data[_sort_key];
				var num = _item_list.length;

				if(index+1 >= num){
					descending = true;
				}else if(0 > compareValue(value,_item_list[index+1].data[_sort_key])){
					descending = true;
				}else if(index <= 0){
					descending = false;
				}else if(0 > compareValue(_item_list[index-1].data[_sort_key],value)){
					descending = false;
				}else{
					return;
				}

				if(descending){
					var p = index;
					var n = 1;
					while(p >= n){
						if(0 > compareValue(_item_list[p-1].data[_sort_key],value)){
							break;
						}
						p--;
					}
					if(index != p){
						move(p);
					}
				}else{
					var p = index + 1;
					var n = num;
					while(p < n){
						if(0 > compareValue(value,_item_list[p].data[_sort_key])){
							break;
						}
						p++;
					}
					if(index != p){
						move(p);
					}
				}
			}

			// --------------------------------------------------------------------------------
			// 移動
			// --------------------------------------------------------------------------------
			function move(index){
				var i = index;
				var j = _item.index;
				var num = _item_list.length;

				var ref;
				if(_item_list[i]){
					ref = _item_list[i].element;
				}
				if(i < j){
					_item_list.splice(j,1);
					var a0 = _item_list.slice(0,i);
					var a1 = _item_list.slice(i);
					_item_list = a0.concat([_item],a1);
					for(;i<num;i++){
						_item_list[i].index = i;
					}
				}else{
					var a0 = _item_list.slice(0,i);
					a0.splice(j,1);
					var a1 = _item_list.slice(i);
					_item_list = a0.concat([_item],a1);
					for(;j<num;j++){
						_item_list[j].index = j;
					}
				}
				var element = _item.element;
				_table_body.insertBefore(element , ref);
			}

			// --------------------------------------------------------------------------------
			// クリック
			// --------------------------------------------------------------------------------
			function click(e){
				_selected_item = _item
				if(_this.onselect){
					return _this.onselect(e);
				}
			}

			// --------------------------------------------------------------------------------
			// プライベート変数
			// --------------------------------------------------------------------------------
			var _anchor;

			// --------------------------------------------------------------------------------
			// 初期化
			// --------------------------------------------------------------------------------
			(function(){
				_item.key = key;
				_item_dictionary[key] = _item;
				_item.renderer = new Object();

				var index = _item_list.length;
				_item_list.push(_item);
				_item.index = index;

				_item.data = new Object();

				_anchor = DocumentCreateElement("a");
				_anchor.className = "catalog_item";
				_anchor.target = "_blank";
				_anchor.onclick = click;
				_table_body.appendChild(_anchor);
				_item.element = _anchor;
			})();

			return _item;
		};

		// --------------------------------------------------------------------------------
		// 更新
		// --------------------------------------------------------------------------------
		_this.update = function (){
			_modify_count += 1;
			var modify = _modify_count;
			var p = 0;
			var num = _item_list.length;
			var f = function (){
				if(modify != _modify_count) return;
				try{
					if(p >= num) return;
					updateItem(_item_list[p]);
					p++;
					execute_queue.attachFirst(f,null);
				}catch(e){
				}
			};
			execute_queue.attachLast(f,null);
		}

		// --------------------------------------------------------------------------------
		// コミット
		// --------------------------------------------------------------------------------
		_this.commit = function (){
			_this.sort();
			_this.update();
		}

		// --------------------------------------------------------------------------------
		// アイテムリストを取得
		// --------------------------------------------------------------------------------
		_this.getItemList = function (){
			return _item_list.slice(0);
		}

		// --------------------------------------------------------------------------------
		// アイテム更新
		// --------------------------------------------------------------------------------
		function updateItem(item){
			var data = item.getData();
			var renderer = item.renderer;

			if(renderer.layout_mode != _layout_mode){

				DomNodeRemoveChildren(item.element);

				renderer.update_list = new Array();
				renderer.layout_mode = _layout_mode;

				switch(_layout_mode){
				case "detail":
					var parent = item.element;

					var i;
					var num = _column_list.length;
					for(i=0;i<num;i++){
						var column = _column_list[i];
						var cell0 = DocumentCreateElement("div");
						cell0.className = "catalog_column_" + (i);
						cell0.style.cssText = "display:inline-block; vertical-align:top;";
						parent.appendChild(cell0);

						var cell1 = DocumentCreateElement("div");
						cell1.style.cssText = "left:0px; right:0px; top:0px; bottom:0px; padding:4px; padding-top:1px; padding-bottom:1px; border-bottom:1px #eee solid; border-right:1px #ddd solid; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";
						cell1.style.textAlign = column.text_align;
						cell0.appendChild(cell1);

						var info = new Object();
						info.item = item;
						info.data = data;
						info.layout_mode = _layout_mode;
						info.parent = cell1;
						info.onupdate = null;
						info.column = column;
						info.key = column.key;
						_this.onUpdateCell(info);
						if(info.onupdate) renderer.update_list.push(info.onupdate);
					}
					break;

				default:
					var info = new Object();
					info.item = item;
					info.data = data;
					info.layout_mode = _layout_mode;
					info.parent = item.element;
					info.onupdate = null;
					_this.onUpdateItem(info);
					if(info.onupdate) renderer.update_list.push(info.onupdate);
					break;
				}
			}

			var list = renderer.update_list;
			var i;
			var num = list.length;
			for(i=0;i<num;i++){
				list[i]();
			}
		}

		// --------------------------------------------------------------------------------
		// 比較
		// --------------------------------------------------------------------------------
		function compareValue(v0,v1){
			var compare;
			if(isNaN(v0) || isNaN(v1)){
				compare = String(v0).localeCompare(v1);
			}else{
				compare = (Number(v0) - Number(v1));
			}
			if(_sort_descending) return compare * -1;
			return compare;
		}

		// --------------------------------------------------------------------------------
		// リサイズ
		// --------------------------------------------------------------------------------
		_this.resize = function (){

			switch(_layout_mode){
			case "detail":
				var resize_rect = ElementGetBoundingClientRect(_table_column);
				var rule_list = CSSStyleSheetGetCSSRuleList(_style_column_list);
				var column_width = resize_rect.right - resize_rect.left;

				var list = new Array();
				var i,j;
				var num = _column_list.length;
				if(num){
					var width = column_width;
					var count = 0;
					for(i=0;i<num;i++){
						var column = _column_list[i];
						var item = {
							index:i,
							auto:column.width_auto
						};
						if(item.auto){
							width -= column.width_min;
							item.value = item.min = column.width_min;
							item.max = column.width_max;
							count += 1;
						}else{
							width -= column.width;
							item.value = item.min = item.max = column.width;
						}
						for(j=0;j<i;j++){
							if(list[j].max > item.max) break;
						}
						list.splice(j,0,item);
					}

					if(width > 0){
						if(count) width /= count;

						for(i=0;i<num;i++){
							var item = list[i];
							if(!(item.auto)) continue;
							count -= 1;

							var sub = (item.min + width) - item.max;
							if(sub > 0){
								if(count) width = (width * count + sub) / count;
								item.value = item.max;
							}else{
								item.value += width;
							}
						}
					}

					var container_width = 0;
					for(i=0;i<num;i++){
						var item = list[i];
						var style = rule_list[item.index].style;
						style.width = (item.value) + "px";
						container_width += item.value;
					}

					if(container_width < column_width){
						container_width = column_width;
					}
					var style = _style_item_container.style;
					style.width = (container_width) + "px";
				}

				break;

			case "large_icon":
				var resize_rect = ElementGetBoundingClientRect(_table_body);
				var width = resize_rect.right - resize_rect.left;
				width -= _table_body.offsetWidth - (_table_body.clientWidth + _table_body.clientLeft);
				width -= 4;
				var style_w = 2 + 2;
				var num = Math.floor(width / _block_size.width);
				var add = (width - (_block_size.width * num)) / num;

				var style = _style_item_container.style;
				style.width = Math.floor(_block_size.width + add - style_w) + "px";

			default:
				var style = _style_item_container.style;
				style.width = "audo";
				break;
			}

		};

		// --------------------------------------------------------------------------------
		// レイアウトモードを設定
		// --------------------------------------------------------------------------------
		_this.setLayoutMode = function (type){
			_layout_mode = type;
			var style;
			switch(_layout_mode){
			case "detail":
				style = _style_item_container.style;
				style.display = "block";
				style.margin  = "0px";
				style.width = "auto";
				style.height = "auto";
				style.minHeight = "0";
				style.whiteSpace = "nowrap";
				style.border = "hidden";

				style = _table_body.style;
				style.padding = "0px";
				style.lineHeight = "1.0";
				break;
			case "list":
				style = _style_item_container.style;
				style.display = "block";
				style.margin  = "0px";
				style.marginBottom  = "2px";
				style.width = "auto";
				style.height = "auto";
				style.minHeight = "0";
				style.whiteSpace = "normal";
				style.border = "1px solid #ddd";

				style = _table_body.style;
				style.padding = "4px";
				style.lineHeight = "13px";
				break;
			case "large_icon":
				style = _style_item_container.style;
				style.display = "inline-block";
				style.margin  = "0px";
				style.marginRight = "2px";
				style.marginBottom = "2px";
				style.width = (_block_size.width) + "px";
				style.height = "auto";
				style.minHeight = (_block_size.height) + "px";
				style.whiteSpace = "normal";
				style.border = "1px solid #ddd";

				style = _table_body.style;
				style.padding = "0px";
				style.paddingLeft = "4px";
				style.paddingTop = "4px";
				style.lineHeight = "13px";

				break;
			case "small_icon":
				style = _style_item_container.style;
				style.display = "inline";
				style.margin  = "0px";
				style.marginRight = "8px";
				style.width = "auto";
				style.height = "auto";
				style.minHeight = "0";
				style.whiteSpace = "normal";
				style.border = "hidden";

				style = _table_body.style;
				style.padding = "4px";
				style.lineHeight = "14px";
				break;
			}

			switch(type){
			case "detail":
				style = _table_column.style;
				style.display = "block";
				style = _table_body.style;
				style.top = "24px";
				break;
			default:
				style = _table_column.style;
				style.display = "none";
				style = _table_body.style;
				style.top = "0px";
				break;
			}

			switch(type){
			case "small_icon":
				StyleDeclarationRemoveProperty(_style_item_even.style,"background-color");
				StyleDeclarationRemoveProperty(_style_item_odd.style,"background-color");
				break;
			default:
				StyleDeclarationSetProperty(_style_item_even.style,"background-color","#fafafa");
				StyleDeclarationSetProperty(_style_item_odd.style,"background-color","#ffffff");
				break;
			}

			_this.resize();
			_this.update();
		};

		// --------------------------------------------------------------------------------
		// ターゲットモードを設定
		// --------------------------------------------------------------------------------
		_this.setTargetMode = function (type){
			_target_mode = type;
		};

		// --------------------------------------------------------------------------------
		// 選択イベント
		// --------------------------------------------------------------------------------
		_this.onselect = function (e){};

		// --------------------------------------------------------------------------------
		// セル更新イベント
		// --------------------------------------------------------------------------------
		_this.onUpdateCell = function (info){};

		// --------------------------------------------------------------------------------
		// アイテム更新イベント
		// --------------------------------------------------------------------------------
		_this.onUpdateItem = function (info){};

		// --------------------------------------------------------------------------------
		// ソート
		// --------------------------------------------------------------------------------
		_this.sort = function (key , descending){
			if(key !== undefined){
				_sort_key = key;
			}
			if(descending !== undefined){
				_sort_descending = descending;
			}

			var i,j;
			var num;

			num = _column_list.length;
			for(i=0;i<num;i++){
				_column_list[i].setSortIcon("");
			}
			_column_dictionary[_sort_key].setSortIcon(_sort_descending ? "down":"up");

			num = _item_list.length;
			for(i=num-1;i>0;i--){
				for(j=i-1;j>=0;j--){
					if(0 < compareValue(_item_list[j].data[_sort_key],_item_list[i].data[_sort_key])){
						var t = _item_list[i];
						_item_list[i] = _item_list[j];
						_item_list[j] = t;
					}
				}
			}

			var after;
			if(num){
				var item = _item_list[num-1];
				item.index = num - 1;
				if(_table_body.lastChild != item.element){
					_table_body.appendChild(item.element);
				}
				after = item.element;
			}
			for(i=num-2;i>=0;i--){
				var item = _item_list[i];
				item.index = i;
				if(after.previousSibling != item.element){
					_table_body.insertBefore(item.element , after);
				}
				after = item.element;
			}
		};

		// --------------------------------------------------------------------------------
		// カラム移動
		// --------------------------------------------------------------------------------
		_this.moveColumn = function (key , index){
			var column = _column_dictionary[key];
			if(!column) return;
			var old_index = column.index;
			if(old_index > index) index += 1;
			
			var p = _column_list[old_index];
			_column_list.splice(old_index,1);
			if(index < 0){
				_column_list.unshift(p);
			}else{
				_column_list.splice(index,0,p);
			}
			
			var columns = new Array();
			var nodes = _table_column.childNodes;
			var i;
			var num = nodes.length;
			for(i=0;i<num;i++){
				columns.push(nodes[i]);	
			}

			var p = columns[old_index];
			columns.splice(old_index,1);
			if(index < 0){
				columns.unshift(p);
			}else{
				columns.splice(index,0,p);
			}

			for(i=0;i<num;i++){
				var column = _column_list[i];
				column.index = i;
				_table_column.appendChild(columns[i]);
				columns[i].className = "catalog_column_" + i;
			}

			var i;
			var num = _item_list.length;
			for(i=0;i<num;i++){
				_item_list[i].renderer.layout_mode = "";
			}			
			_this.resize();
			_this.update();
		};

		// --------------------------------------------------------------------------------
		// クリア
		// --------------------------------------------------------------------------------
		_this.clear = function (){
			_this.clearColumn();
			_this.clearItem();
		};

		// --------------------------------------------------------------------------------
		// カラムクリア
		// --------------------------------------------------------------------------------
		_this.clearColumn = function (){
			_column_dictionary = new Object();
			_column_list = new Array();
			DomNodeRemoveChildren(_table_column);
		};

		// --------------------------------------------------------------------------------
		// アイテムクリア
		// --------------------------------------------------------------------------------
		_this.clearItem = function (){
			_item_dictionary = new Object();
			_item_list = new Array();
			DomNodeRemoveChildren(_table_body);
		};

		// --------------------------------------------------------------------------------
		// ブロックサイズ設定
		// --------------------------------------------------------------------------------
		_this.setBlockSize = function (w,h){
			_block_size.width  = w;
			_block_size.height = h;
		};

		// --------------------------------------------------------------------------------
		// 選択したアイテムを取得
		// --------------------------------------------------------------------------------
		_this.getSelectedItem = function (){
			return _selected_item;
		};

		// --------------------------------------------------------------------------------
		// プライベート変数
		// --------------------------------------------------------------------------------
		var _table_column;
		var _table_body;
		var _style_column_list;
		var _style_item_container;
		var _style_item_even;
		var _style_item_odd;
		var _style_item_hover;
		var _style_item_separator;
		var _layout_mode;
		var _target_mode;
		var _column_dictionary;
		var _item_dictionary;
		var _column_list;
		var _item_list;
		var _sort_key;
		var _sort_descending;
		var _block_size;
		var _modify_count;
		var _selected_item;
		var _column_hover_place;
		var _column_hover_index_border;
		var _column_hover_index_center;
		var _column_drop_index_border;
		var _column_dragging_border = false;

		// --------------------------------------------------------------------------------
		// 初期化
		// --------------------------------------------------------------------------------
		(function(){
			_column_dictionary = new Object();
			_item_dictionary = new Object();
			_column_list = new Array();
			_item_list = new Array();
			_block_size = {width:100,height:100};
			_modify_count = 0;

			_table_column = DocumentCreateElement("div");
			ElementSetStyle(_table_column,"position:absolute; left:0px; top:0px; right:0px; white-space:nowrap; height:24px; overflow:hidden; background:#888;");
			parent.appendChild(_table_column);

				(function(){
					function ColumnGetClientRectList(){
						var list = new Array();
						var nodes = _table_column.childNodes;
						var i;
						var num = nodes.length;
						for(i=0;i<num;i++){
							list.push(ElementGetBoundingClientRect(nodes[i]));
						}
						return list;
					}

					_table_column.onmousemove = function(e){
						var column_list = ColumnGetClientRectList();
						var pos_x = e.clientX;
						var pos_y = e.clientY;

						var i;
						var num = column_list.length;

						_column_hover_index_center = num - 1;
						for(i=0;i<num;i++){
							var rect = 	column_list[i];
							if(pos_x < rect.right){
								_column_hover_index_center = i;								
								break;
							}
						}

						_column_hover_index_border = num - 1;
						for(i=0;i<num;i++){
							var rect = 	column_list[i];
							if(pos_x < rect.right - 6){
								_column_hover_index_border = i - 1;
								break;
							}
						}

						_column_drop_index_border = num - 1;
						for(i=0;i<num;i++){
							var rect = 	column_list[i];
							if(pos_x < rect.left + (rect.right - rect.left) * 0.5){
								_column_drop_index_border = i - 1;
								break;
							}
						}		

						_column_hover_place = "center";
						for(i=0;i<num;i++){
							var rect = 	column_list[i];
							if(i <= 0){
							}else if(pos_x < rect.left + 6){
								_column_hover_place = "border";
								break;
							}
							if(pos_x < rect.right - 6){
								break;
							}
						}
						if(i >= num){
							_column_hover_place = "border";								
						}
						
						var hover_border = (function(){
							if(_column_hover_place == "border") return true;
							if(_column_dragging_border) return true;
							return false;
						})();
						_table_column.style.cursor = (hover_border) ? "col-resize" : "pointer";
					};

					// クリックソート
					_table_column.onclick = function(e){
						if(_column_hover_place != "center") return;
						var column = _column_list[_column_hover_index_center];
						if(!column) return;
						_this.sort(column.key,!(_sort_descending));
					};

					// 境界線ダブルクリック
					_table_column.ondblclick = function(e){
						if(_column_hover_place != "border") return;
						
						var column = _column_list[_column_hover_index_border];
						if(!column) return;

						var width = 10;
						var i;
						var num = _item_list.length;
						for(i=0;i<num;i++){
							try{
								var item = _item_list[i];
								if(item.renderer.layout_mode == "detail"){
									var element = item.element;
									var node = element.childNodes[_column_hover_index_border].cloneNode(true);
									node.className = "";
									node.style.cssText = "position:absolute; left:0px; top:0px;"
									_table_column.appendChild(node);
									var rect = ElementGetBoundingClientRect(node);
									_table_column.removeChild(node);
									var w = rect.right - rect.left;
									if(width < w) width = w;
								}
							}catch(e){
							}
						}

						column.setWidth(width);
						_this.resize();
					};
					
					// ドロップ許可
					_table_column.ondragover = function(e){
						_table_column.onmousemove(e);
						return false;
					};

					// ドロップ受け取り
					_table_column.ondrop = function(e){
						try{
							var data_transfer = e.dataTransfer;
							var key = data_transfer.getData("text");
							_this.moveColumn(key,_column_drop_index_border);
						}catch(e){
						}
						return false;
					};

					(function(){
						var task;
						var old_pos;
						var index;
						var column = null;

						_table_column.onmousedown = function(e){
							input_mouse.setMouseEvent(e);

							if(task) task.release();
							_table_column.onmousemove(e);
							if(_column_hover_place != "border") return;

							old_pos = input_mouse.getPositionClient();
							index = _column_hover_index_border;
							column = _column_list[index];
							if(!column) return;

							task = task_container.createTask();
							task.setDestructorFunc(function(){
								_column_dragging_border = false;
								column = null;
								task = null;	
							});
							task.setExecuteFunc(function(){
								if(!_column_dragging_border){
									var mouse_pos = input_mouse.getPositionClient();
									var vec_x = mouse_pos.x - old_pos.x;
									var vec_y = mouse_pos.y - old_pos.y;
									if(Math.sqrt(vec_x * vec_x + vec_y * vec_y) >= 3.0){										
										_column_dragging_border = true;
									}
								}

								if(_column_dragging_border){
									var column_rect = ElementGetBoundingClientRect(column.element);
									var mouse_pos = input_mouse.getPositionClient();
									
									var width = mouse_pos.x - column_rect.left;
									if(width < 10) width = 10;
									column.setWidth(width);
									_this.resize();
								}

								if(!(input_mouse.getButtonLeft())){
									task.release();
									return;
								}
							});
						};

					})();

				})();

			_table_body = DocumentCreateElement("div");
			ElementSetStyle(_table_body,"position:absolute; left:0px; top:32px; right:0px; bottom:0px; font-size:12px; line-height:1.0; overflow-x:auto; overflow-y:scroll; background:#fff;");
			parent.appendChild(_table_body);

			var right = (function(){
				var div = DocumentCreateElement("div");
				ElementSetStyle(div,"position:absolute; left:0px; top:0px; width:100px; overflow-y:scroll;");
				document.body.appendChild(div);
				var right = div.offsetWidth - (div.clientWidth + div.clientLeft);
				DomNodeRemove(div);
				return right;
			})();
			_table_column.style.right = (right) + "px";

			_table_body.onscroll = function(e){
				_table_column.scrollLeft = _table_body.scrollLeft;
			}

			var catalog_style = DocumentCreateElement("style");
			parent.appendChild(catalog_style);

			var catalog_style_width = DocumentCreateElement("style");
			parent.appendChild(catalog_style_width);

			var style_sheet = ElementGetStyleSheet(catalog_style);
			CSSStyleSheetInsertRule(style_sheet,".catalog_item","margin:2px; vertical-align:top; text-decoration:none; border-radius:4px; user-select:none; -moz-user-select:none; -webkit-user-select:none;",0);
			CSSStyleSheetInsertRule(style_sheet,".catalog_item:nth-child(2n)","",1);
			CSSStyleSheetInsertRule(style_sheet,".catalog_item:nth-child(2n+1)","",2);
			CSSStyleSheetInsertRule(style_sheet,".catalog_item:hover","background-color:rgba(192,255,160,0.3);",3);
			CSSStyleSheetInsertRule(style_sheet,".catalog_column","font-size:14px; background-color:#646464; color:#fff; border-right:1px #888 solid; border-bottom:1px #888 solid; position:absolute; top:0px; bottom:0px; left:0px; right:0px; overflow:hidden; padding-left:4px; padding-top:2px; padding-right:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:center; background-repeat:no-repeat; background-position:center right; user-select:none; -moz-user-select:none; -webkit-user-select:none;",4);
			CSSStyleSheetInsertRule(style_sheet,".catalog_column:hover","background-color:#4281F4;",5);

			var rule_list = CSSStyleSheetGetCSSRuleList(style_sheet);
			_style_item_container = rule_list[0];
			_style_item_even = rule_list[1];
			_style_item_odd = rule_list[2];
			_style_item_hover = rule_list[3];

			_style_column_list = ElementGetStyleSheet(catalog_style_width);

			_this.setLayoutMode("detail");
		})();
	}


	// --------------------------------------------------------------------------------
	// 初期化
	// --------------------------------------------------------------------------------
	switch(page_expand_arguments.execute_type){

	// --------------------------------------------------------------------------------
	// Opera の掲示板ボードとして動作
	// --------------------------------------------------------------------------------
	case "OperaExtensionBbsBoard":

		// PageExpand 初期化
		PageExpandInitialize();

		// GoogleChrome拡張機能通信
		extension_message = new OperaExtensionMessageForContent();

		// PageExpand コンストラクタ
		PageExpandConstructor();

		var bbs_board = new PageExpandBbsBoard();
		bbs_board.initialize(function(info){
			if(!(info.result)) return;

			bbs_board.enableCompactMode(false);			
			var query = DocumentGetQuery();
			if(query.referer){
				bbs_board.setURL(decodeURIComponent(query.referer));	
			}
		});

		break;
	};

}
