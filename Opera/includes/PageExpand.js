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
	// DOM オブジェクトの解析（ルート）
	// --------------------------------------------------------------------------------
	function DomNodeAnalyzeRoot(node){

		var w;
		var o;
		var p;
		var n;
		var i = 0;
		var c = 0;
		var m = 100;
		var q = new Object();
		var nodes = node.childNodes;
		q.p = q;
		q.n = q;

		// 解析無効化
		w = analyze_work_dictionary.getAnalyzeWork(node);
		if(w){
			if(w.a_inv)	return;
		}

		// 中断
		function interrupt(){
			c = 0;
			execute_queue.attachFirstForInsertDomNode(analyze,null);
		}

		// 子孫抽出
		function analyze(){
			while(node){
				if(nodes){
					while(nodes[i]){
						o = {node:nodes[i]};
						n = q;
						p = n.p;
						o.p = p;
						o.n = n;
						p.n = o;
						n.p = o;
						i++;
						c++;
						if(c > m){
							interrupt();
							return;
						}
					}
				}

				switch(node.nodeType){
				case 1:
					execute_queue.attachForAnalyzeElement(DomNodeAnalyzePhaseAnalyzeElement,node);
					break;
				case 3:
					DomNodeAnalyzePhaseAnalyzeTextNode(node);
					break;
				}


				o = q.n;
				p = o.p;
				n = o.n;
				p.n = n;
				n.p = p;
				node = o.node;
				if(node){
					i = 0;
					nodes = node.childNodes;

					// 解析無効化
					w = analyze_work_dictionary.getAnalyzeWork(node);
					if(w){
						if(w.a_inv){
							nodes = null;
						}
					}
				}

				c++;
				if(c > m){
					interrupt();
					return;
				}
			}
		}

		analyze();
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析フェーズ
	// --------------------------------------------------------------------------------
	function DomNodeAnalyzePhaseAnalyzeElement(node){

		// ゲスト検出
		if(analyze_work_dictionary.verifyGuest(node)){
			return;
		}

		// Content Editable
		if(node.isContentEditable){
			return;
		}

		// クローン検出
		if(analyze_work_dictionary.verifyClone(node)){
			// スクロール補正
			var revise_scroll = new DocumentReviseScroll();
			revise_scroll.executeRemoveElementBefore(node);
			DomNodeRemove(node);
			revise_scroll.executeRemoveElementAfter(node);
			return;
		}

		// 解析ワーク取得
		var work = analyze_work_dictionary.getAnalyzeWork(node);
		if(!work){
			// 解析ワーク作成
			work = AnalyzeWorkCreate(node);

		}

		if(!AnalyzeWorkGetInitializedObserverElement(work)){

			// --------------------------------------------------------------------------------
			// アンカー
			// --------------------------------------------------------------------------------
			if(node.tagName == "A"){

				// 要素を監視
				AnalyzeWorkObserveElement(work);

				// アドレス変更監視
				var observer_modify_element = document_observer_modify_node.createElement();
				AnalyzeWorkSetObserverModifyAnchor(work,observer_modify_element);
				observer_modify_element.setElement(node,"href");
				observer_modify_element.setFunction(function (){

					// 修正カウンタ加算
					AnalyzeWorkAddModifyCount(work);

					var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
					if(event_dispatcher){
						// イベント発火
						event_dispatcher.dispatchEvent("anchor_href_change",null);
						event_dispatcher.dispatchEvent("release",null);
					}

					// 解析状況をクリア
					AnalyzeWorkClearAnalyzedReplacementToAnchor(work);
					AnalyzeWorkClearAnalyzedReplacementToLink(work);
					AnalyzeWorkClearAnalyzedExpandShortUrl(work);
					AnalyzeWorkClearAnalyzedExpandInlineText(work);
					AnalyzeWorkClearAnalyzedExpandThumbnailImage(work);
					AnalyzeWorkClearAnalyzedExpandPopupImage(work);
					AnalyzeWorkClearAnalyzedExpandInlineSound(work);
					AnalyzeWorkClearAnalyzedExpandInlineVideo(work);
					AnalyzeWorkClearAnalyzedExpandInlineIframe(work);
					AnalyzeWorkClearExpandUrl(work);
					AnalyzeWorkClearExpandContentType(work);

					// 再解析
					DomNodeAnalyzePhaseAnalyzeElement(node);
				});

				// 破棄イベント
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				var event_handler = event_dispatcher.createEventHandler("destructor");
				event_handler.setFunction(function(){
					// アドレス変更監視を破棄
					if(observer_modify_element){
						observer_modify_element.release();
						observer_modify_element = null;
						AnalyzeWorkClearObserverModifyAnchor(work);
					}
				});

				// アンカー要素を登録
				AnalyzeWorkSetAnchorElement(work,node);

			// --------------------------------------------------------------------------------
			// インラインフレーム
			// --------------------------------------------------------------------------------
			}else if(node.tagName == "IFRAME"){

				// 要素を監視
				AnalyzeWorkObserveElement(work);
			}
		}

		var param = {
			modify:AnalyzeWorkGetModifyCount(work),
			work:work
		};

		// --------------------------------------------------------------------------------
		// アドレスコレクション
		// --------------------------------------------------------------------------------
		ElementAnalyzeAddressCollection(param);

		// --------------------------------------------------------------------------------
		// インラインフレーム内コンテンツ
		// --------------------------------------------------------------------------------

		// --------------------------------------------------------------------------------
		// 掲示板解析
		// --------------------------------------------------------------------------------
		if(project.getEnableExpandBbs()){
			if(expand_bbs.initialized){
				if(expand_bbs.enable){
					execute_queue.attachForExpandBbs(ElementAnalyzeBbs,param);
				}
			}else{
				expand_bbs.node_queue.push(param);
			}
		}

		// --------------------------------------------------------------------------------
		// アンカーを置換
		// --------------------------------------------------------------------------------
		if(project.getEnableReplacementToAnchor()){
			execute_queue.attachForExpandElement(ElementAnalyzeReplacementToAnchor,param);
		}else{
			// 短縮URL展開関連のフェーズへ
			ElementAnalyzePhaseExpandShortUrl(param);
		}

		// --------------------------------------------------------------------------------
		// エレメントの置換
		// --------------------------------------------------------------------------------
		if(project.getEnableReplacementToElement()){
			execute_queue.attachForExpandElement(ElementAnalyzeReplacementToElement,param);
		}else{
			// 縮小画像のポップアップのフェーズへ
			ElementAnalyzePhasePopupReducedImage(param);
		}

	}

	// --------------------------------------------------------------------------------
	// テキストノードの解析フェーズ
	// --------------------------------------------------------------------------------
	function DomNodeAnalyzePhaseAnalyzeTextNode(node){

		// 解析ワーク取得
		var work = analyze_work_dictionary.getAnalyzeWork(node);
		if(!work){
			// 解析ワーク作成
			work = AnalyzeWorkCreate(node);

		}

		var param = {
			modify:AnalyzeWorkGetModifyCount(work),
			work:work
		};

		// --------------------------------------------------------------------------------
		// テキストの置換
		// --------------------------------------------------------------------------------
		if(project.getEnableReplacementToText()){
			execute_queue.attachForAnalyzeTextNode(ElementAnalyzeReplacementToText,param);
		}else{
			// ハイパーリンク化のフェーズへ
			ElementAnalyzePhaseMakeLinkToText(param);
		}

	}

	// --------------------------------------------------------------------------------
	// エレメントの解析フェーズ（短縮URLの展開）
	// --------------------------------------------------------------------------------
	function ElementAnalyzePhaseExpandShortUrl(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		// --------------------------------------------------------------------------------
		// 短縮 URL の展開
		// --------------------------------------------------------------------------------
		if(project.getEnableExpandShortUrl()){
			execute_queue.attachForExpandElement(ElementAnalyzeExpandShortUrl,param);
		}else{
			// ハイパーリンク展開関連のフェーズへ
			ElementAnalyzePhaseReplacementToLink(param);
		}
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析フェーズ（アンカーの置換）
	// --------------------------------------------------------------------------------
	function ElementAnalyzePhaseReplacementToAnchor(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		// --------------------------------------------------------------------------------
		// アンカーを置換
		// --------------------------------------------------------------------------------
		if(project.getEnableReplacementToAnchor()){
			execute_queue.attachForExpandElement(ElementAnalyzeReplacementToAnchor,param);
		}else{
			// ハイパーリンク展開関連のフェーズへ
			ElementAnalyzePhaseReplacementToLink(param);
		}
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析フェーズ（ハイパーリンクの置換）
	// --------------------------------------------------------------------------------
	function ElementAnalyzePhaseReplacementToLink(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		// --------------------------------------------------------------------------------
		// アンカーを置換
		// --------------------------------------------------------------------------------
		if(project.getEnableReplacementToLink()){
			execute_queue.attachForExpandElement(ElementAnalyzeReplacementToLink,param);
		}else{
			// 展開関連のフェーズへ
			execute_queue.attachForExpandElement(ElementAnalyzePhaseExpand,param);
		}
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析フェーズ（ハイパーリンク化）
	// --------------------------------------------------------------------------------
	function ElementAnalyzePhaseMakeLinkToText(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		// --------------------------------------------------------------------------------
		// テキストのハイパーリンク化
		// --------------------------------------------------------------------------------
		if(project.getEnableMakeLinkToText()){
			execute_queue.attachForAnalyzeTextNode(ElementAnalyzeMakeLinkToText,param);
		}

	}

	// --------------------------------------------------------------------------------
	// エレメントの解析フェーズ（展開関連）
	// --------------------------------------------------------------------------------
	function ElementAnalyzePhaseExpand(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);
		var anchor = AnalyzeWorkGetAnchorElement(work);

		if(!anchor) return;

		// アンカー
		if(anchor.tagName != "A")	return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		// 実行対象外のタグ
		var selector_result = ElementMatchesSelector(element,"head *,script *,style *");
		if(selector_result === undefined){
			var node = element;
			var illegal = {HEAD:1,SCRIPT:1,STYLE:1};
			while(node){
				if(illegal[node.tagName]) return;
				node = node.parentNode;
			}
		}else if(selector_result){
			return;
		}

		// --------------------------------------------------------------------------------
		// アドレス
		// --------------------------------------------------------------------------------
		if(!AnalyzeWorkGetExpandUrl(work)){
			AnalyzeWorkSetExpandUrl(work,anchor.href);
		}

		// --------------------------------------------------------------------------------
		// テキストの展開
		// --------------------------------------------------------------------------------
		if(project.getEnableExpandText()){
			// 解析済みチェック
			if(!AnalyzeWorkGetAnalyzedExpandInlineText(work)){
				AnalyzeWorkSetAnalyzedExpandInlineText(work);

				// 実行キューに登録
				execute_queue.attachForExpandElement(ElementExpandInlineText,param);
			}
		}

		// --------------------------------------------------------------------------------
		// 画像の展開
		// --------------------------------------------------------------------------------
		if(project.getEnableExpandImage()){
			// 解析済みチェック
			if(!AnalyzeWorkGetAnalyzedExpandThumbnailImage(work)){
				AnalyzeWorkSetAnalyzedExpandThumbnailImage(work);
				if(project.getEnableThumbnailImage()){
					// 実行キューに登録
					execute_queue.attachForExpandElement(ElementExpandThumbnailImage,param);
				}
			}

			// 解析済みチェック
			if(!AnalyzeWorkGetAnalyzedExpandPopupImage(work)){
				AnalyzeWorkSetAnalyzedExpandPopupImage(work);
				if(project.getEnablePopupImage()){
					// 実行キューに登録
					execute_queue.attachForExpandElement(ElementExpandPopupImage,param);
				}
			}
		}

		// --------------------------------------------------------------------------------
		// サウンドの展開
		// --------------------------------------------------------------------------------
		if(project.getEnableExpandSound()){
			// 解析済みチェック
			if(!AnalyzeWorkGetAnalyzedExpandInlineSound(work)){
				AnalyzeWorkSetAnalyzedExpandInlineSound(work);

				// 実行キューに登録
				execute_queue.attachForExpandElement(ElementExpandInlineSound,param);
			}
		}

		// --------------------------------------------------------------------------------
		// ビデオの展開
		// --------------------------------------------------------------------------------
		if(project.getEnableExpandVideo()){
			// 解析済みチェック
			if(!AnalyzeWorkGetAnalyzedExpandInlineVideo(work)){
				AnalyzeWorkSetAnalyzedExpandInlineVideo(work);

				// 実行キューに登録
				execute_queue.attachForExpandElement(ElementExpandInlineVideo,param);
			}
		}

		// --------------------------------------------------------------------------------
		// インラインの展開
		// --------------------------------------------------------------------------------
		if(project.getEnableExpandIframe()){
			// 解析済みチェック
			if(!AnalyzeWorkGetAnalyzedExpandInlineIframe(work)){
				AnalyzeWorkSetAnalyzedExpandInlineIframe(work);

				// 実行キューに登録
				execute_queue.attachForExpandElement(ElementExpandInlineIframe,param);
			}
		}
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析フェーズ（縮小画像のポップアップ）
	// --------------------------------------------------------------------------------
	function ElementAnalyzePhasePopupReducedImage(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		// --------------------------------------------------------------------------------
		// 縮小画像を解析
		// --------------------------------------------------------------------------------
		if(project.getEnablePopupReducedImage()){
			execute_queue.attachForExpandElement(ElementAnalyzePopupReducedImage,param);
		}

		// --------------------------------------------------------------------------------
		// アンカーを置換
		// --------------------------------------------------------------------------------
		var element = AnalyzeWorkGetDomNode(work);

		if(AnalyzeWorkGetOverrodeAnchorElement(work) && AnalyzeWorkGetAnchorElement(work)){

			if(project.getEnableReplacementToAnchor()){
				execute_queue.attachForExpandElement(ElementAnalyzeReplacementToAnchor,param);
			}else{
				// 短縮URL展開関連のフェーズへ
				ElementAnalyzePhaseExpandShortUrl(param);
			}

		}
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析フェーズ（インラインフレーム内コンテンツの展開）
	// --------------------------------------------------------------------------------
	function ElementAnalyzePhaseExpandIframeContent(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);

		// インラインフレーム
		if(element.tagName != "IFRAME")	return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		ElementExpandIframeContent(param);
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析（アドレスコレクション）
	// --------------------------------------------------------------------------------
	function ElementAnalyzeAddressCollection(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);
		var tag_name = element.tagName;

		if(tag_name == "IMG"){
			if(element.src.search(new RegExp("^(http|https)://")) == 0){

				// --------------------------------------------------------------------------------
				// イメージのアドレスを調べる
				// --------------------------------------------------------------------------------
				if(project.getDisableSameThumbnailImage()){
					if(element.src){
						address_collection.addAddress("image",element.src);
					}
				}

				// --------------------------------------------------------------------------------
				// ダウンロードリストに登録
				// --------------------------------------------------------------------------------
				var item = download_list_image.createItem();
				item.setURL(element.src);
			}
		}

		// --------------------------------------------------------------------------------
		// サウンドのアドレスを調べる
		// --------------------------------------------------------------------------------
		if(project.getDisableSameInlineSound()){
			if(tag_name == "AUDIO"){
				if(element.src){
					address_collection.addAddress("sound",element.src);
				}
			}
		}

		// --------------------------------------------------------------------------------
		// ビデオのアドレスを調べる
		// --------------------------------------------------------------------------------
		if(project.getDisableSameInlineVideo()){
			if(tag_name == "EMBED"){
				if(element.src){
					address_collection.addAddress("video",element.src);
				}
			}
			if(tag_name == "OBJECT"){
				if(element.src){
					address_collection.addAddress("video",element.src);
				}
			}
			if(tag_name == "IFRAME"){
				if(element.src){
					address_collection.addAddress("video",element.src);
				}
			}
		}

		// --------------------------------------------------------------------------------
		// インラインフレームのアドレスを調べる
		// --------------------------------------------------------------------------------
		if(project.getDisableSameInlineIframe()){
			if(tag_name == "IFRAME"){
				if(element.src){
					address_collection.addAddress("iframe",element.src);
				}
			}
		}

	}

	// --------------------------------------------------------------------------------
	// エレメントの解析（エレメント置換用）
	// --------------------------------------------------------------------------------
	function ElementAnalyzeReplacementToElement(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		ElementReplacementToElement(param);
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析（テキスト置換用）
	// --------------------------------------------------------------------------------
	function ElementAnalyzeReplacementToText(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var text_node = AnalyzeWorkGetDomNode(work);
		var element = text_node.parentNode;
		if(!element) return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		// 実行対象外のタグ
		var selector_result = ElementMatchesSelector(element,"script *,style *,script,style");
		if(selector_result === undefined){
			var node = text_node;
			var illegal = {SCRIPT:1,STYLE:1};
			while(node){
				if(illegal[node.tagName]) return;
				node = node.parentNode;
			}
		}else if(selector_result){
			return;
		}

		ElementReplacementToText(param);
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析（アンカー置換用）
	// --------------------------------------------------------------------------------
	function ElementAnalyzeReplacementToAnchor(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);
		var anchor = AnalyzeWorkGetAnchorElement(work);

		if(!anchor) return;

		// アンカー
		if(anchor.tagName != "A")	return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		// 実行対象外のタグ
		var selector_result = ElementMatchesSelector(element,"head *,script *,style *");
		if(selector_result === undefined){
			var node = element;
			var illegal = {HEAD:1,SCRIPT:1,STYLE:1};
			while(node){
				if(illegal[node.tagName]) return;
				node = node.parentNode;
			}
		}else if(selector_result){
			return;
		}

		if((anchor.name) && !(anchor.href))	return;

		ElementReplacementToAnchor(param);
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析（リンク置換用）
	// --------------------------------------------------------------------------------
	function ElementAnalyzeReplacementToLink(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);
		var anchor = AnalyzeWorkGetAnchorElement(work);

		if(!anchor) return;

		// アンカー
		if(anchor.tagName != "A")	return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		// 実行対象外のタグ
		var selector_result = ElementMatchesSelector(element,"head *,script *,style *");
		if(selector_result === undefined){
			var node = element;
			var illegal = {HEAD:1,SCRIPT:1,STYLE:1};
			while(node){
				if(illegal[node.tagName]) return;
				node = node.parentNode;
			}
		}else if(selector_result){
			return;
		}

		if(!(anchor.href))	return;

		ElementReplacementToLink(param);
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析（テキストからハイパーリンクを生成用）
	// --------------------------------------------------------------------------------
	function ElementAnalyzeMakeLinkToText(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var text_node = AnalyzeWorkGetDomNode(work);
		var element = text_node.parentNode;
		if(!element) return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		// 実行対象外のタグ
		var selector_result = ElementMatchesSelector(element,"script *,style *,a *,textarea *,script,style,a,textarea");
		if(selector_result === undefined){
			var node = text_node;
			var illegal = {SCRIPT:1,STYLE:1,A:1,TEXTAREA:1};
			while(node){
				if(illegal[node.tagName]) return;
				node = node.parentNode;
			}
		}else if(selector_result){
			return;
		}

		ElementMakeLinkToText(param);
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析（短縮 URL の展開用）
	// --------------------------------------------------------------------------------
	function ElementAnalyzeExpandShortUrl(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);
		var anchor = AnalyzeWorkGetAnchorElement(work);

		if(!anchor) return;

		// アンカー
		if(anchor.tagName != "A")	return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		// 実行対象外のタグ
		var selector_result = ElementMatchesSelector(element,"head *,script *,style *");
		if(selector_result === undefined){
			var node = element;
			var illegal = {HEAD:1,SCRIPT:1,STYLE:1};
			while(node){
				if(illegal[node.tagName]) return;
				node = node.parentNode;
			}
		}else if(selector_result){
			return;
		}

		if(!(anchor.href))	return;

		ElementExpandShortUrl(param);
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析（縮小画像のポップアップ用）
	// --------------------------------------------------------------------------------
	function ElementAnalyzePopupReducedImage(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);

		// イメージ
		if(element.tagName != "IMG")	return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		ElementPopupReducedImage(param);
	}

	// --------------------------------------------------------------------------------
	// エレメントの解析（掲示板用）
	// --------------------------------------------------------------------------------
	function ElementAnalyzeBbs(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var dom_node = AnalyzeWorkGetDomNode(work);

		// document に未登録
		if(!DomNodeGetAttachedDocument(dom_node))	return;

		// 実行対象外のタグ
		var selector_result = ElementMatchesSelector(dom_node,"head *,script *,style *");
		if(selector_result === undefined){
			var node = dom_node;
			var illegal = {HEAD:1,SCRIPT:1,STYLE:1};
			while(node){
				if(illegal[node.tagName]) return;
				node = node.parentNode;
			}
		}else if(selector_result){
			return;
		}

		ElementExpandBbs(param);
	}

	// --------------------------------------------------------------------------------
	// エレメントを置換
	// --------------------------------------------------------------------------------
	function ElementReplacementToElement(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);

		var completed = false;
		function response(result){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(completed)	return;
			completed = true;

			if(result.url){

				// --------------------------------------------------------------------------------
				// アンカーのオーバーライド
				// --------------------------------------------------------------------------------
				if(!AnalyzeWorkGetOverrodeAnchorElement(work)){
					// アンカーを作成
					var anchor = DocumentCreateElement("a");
					anchor.href = result.url;

					// アンカー要素を登録
					AnalyzeWorkSetAnchorElement(work,anchor);

					// オーバーライド済み
					AnalyzeWorkSetOverrodeAnchorElement(work);
					AnalyzeWorkSetOverrodeUrl(work);
				}

				// --------------------------------------------------------------------------------
				// 要素を監視
				// --------------------------------------------------------------------------------
				AnalyzeWorkObserveElement(work);

			}

			// 縮小画像のポップアップのフェーズへ
			ElementAnalyzePhasePopupReducedImage(param);
		}

		// 解析済みチェック
		if(AnalyzeWorkGetAnalyzedReplacementToElement(work)){
			return;
		}
		AnalyzeWorkSetAnalyzedReplacementToElement(work);

		// コールバック関数を実行
		var request = {
			element:element
		};
		project.executeScriptReplacementToElement(request,response);
	}

	// --------------------------------------------------------------------------------
	// テキストを置換
	// --------------------------------------------------------------------------------
	function ElementReplacementToText(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var text_node = AnalyzeWorkGetDomNode(work);

		var completed = false;
		function response(){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(completed)	return;
			completed = true;

			// ハイパーリンク化のフェーズへ
			ElementAnalyzePhaseMakeLinkToText(param);
		}

		// 解析済みチェック
		if(AnalyzeWorkGetAnalyzedReplacementToText(work)){
			return;
		}
		AnalyzeWorkSetAnalyzedReplacementToText(work);

		// コールバック関数を実行
		project.executeScriptReplacementToText(text_node,response);
	}

	// --------------------------------------------------------------------------------
	// アンカーを置換
	// --------------------------------------------------------------------------------
	function ElementReplacementToAnchor(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);
		var anchor = AnalyzeWorkGetAnchorElement(work);

		var completed = false;
		function response(){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(completed)	return;
			completed = true;

			// 短縮URL展開済み
			if(AnalyzeWorkGetAnalyzedExpandShortUrl(work)){
				// ハイパーリンク展開関連のフェーズへ
				ElementAnalyzePhaseReplacementToLink(param);
			}else{
				// 短縮URL展開関連のフェーズへ
				ElementAnalyzePhaseExpandShortUrl(param);
			}
		}

		// 解析済みチェック
		if(AnalyzeWorkGetAnalyzedReplacementToAnchor(work)){
			return;
		}
		AnalyzeWorkSetAnalyzedReplacementToAnchor(work);

		// コールバック関数を実行
		project.executeScriptReplacementToAnchor(anchor,work.event_dispatcher,response);
	}

	// --------------------------------------------------------------------------------
	// リンクを置換
	// --------------------------------------------------------------------------------
	function ElementReplacementToLink(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);
		var anchor = AnalyzeWorkGetAnchorElement(work);
		var replacement_to_link = project.getReplacementToLink(anchor);

		var completed = false;
		function response(r){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(completed)	return;
			completed = true;

			var obj = r.getResult();

			//リンクの変更をアンカーに反映する
			if(r.getEnableReflectToAnchor()){
				if(obj.result){
					var monitor_element = AnalyzeWorkGetObserverModifyAnchor(work);
					if(monitor_element){
						monitor_element.setBaseValue(obj.url);
					}
					anchor.href = obj.url;
				}
			}

			if(obj.result){
				if(obj.url){
					AnalyzeWorkSetExpandUrl(work,obj.url);
				}
				if(obj.content_type){
					try{
						var a = obj.content_type;
						var i;
						var num = a.length;
						for(i=0;i<num;i++){
							if(typeof(a[i]) == "string"){
								AnalyzeWorkAddContentType(work,a[i]);
							}
						}
					}catch(e){
					}
				}
			}

			// 展開関連のフェーズへ
			execute_queue.attachForExpandElement(ElementAnalyzePhaseExpand,param);
		}

		// 解析済みチェック
		if(AnalyzeWorkGetAnalyzedReplacementToLink(work)){
			return;
		}
		AnalyzeWorkSetAnalyzedReplacementToLink(work);

		// 結果を取得
		replacement_to_link.getResult(response);
	}

	// --------------------------------------------------------------------------------
	// テキストからハイパーリンクを生成
	// --------------------------------------------------------------------------------
	function ElementMakeLinkToText(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var text_node = AnalyzeWorkGetDomNode(work);

		var completed = false;
		function response(){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(completed)	return;
			completed = true;
		}

		// 解析済みチェック
		if(AnalyzeWorkGetAnalyzedMakeLinkToText(work)){
			return;
		}
		AnalyzeWorkSetAnalyzedMakeLinkToText(work);

		// コールバック関数を実行
		project.executeScriptMakeLinkToText(text_node,response);
	}

	// --------------------------------------------------------------------------------
	// 短縮 URL の展開
	// --------------------------------------------------------------------------------
	function ElementExpandShortUrl(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);
		var anchor = AnalyzeWorkGetAnchorElement(work);

		var completed = false;
		function response(result){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(completed)	return;
			completed = true;

			if(result){
				// 解析フラグをクリア
				AnalyzeWorkClearAnalyzedReplacementToAnchor(work);

				// アンカーの置換フェーズへ
				execute_queue.attachForExpandElement(ElementAnalyzePhaseReplacementToAnchor,param);
			}else{
				// ハイパーリンク展開関連のフェーズへ
				ElementAnalyzePhaseReplacementToLink(param);
			}
		}

		// 解析済みチェック
		if(AnalyzeWorkGetAnalyzedExpandShortUrl(work)){
			return;
		}
		AnalyzeWorkSetAnalyzedExpandShortUrl(work);

		// アドレスチェック
		var url = anchor.href;
		if(!url){
			response(false);
			return;
		}

		// フィルタ
		if(project.checkExpandShortUrl(url)){

			var loader = new Loader();

			// ロード完了時に実行されるイベント
			loader.onload = function(v){
				if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

				var monitor_element = AnalyzeWorkGetObserverModifyAnchor(work);
				if(monitor_element){
					monitor_element.setBaseValue(v);
				}

				// 取得結果をセット
				anchor.href = v;
				// 終了通知
				if(url != v){
					response(true);
				}else{
					response(false);
				}
			};

			// ロード失敗時に実行されるイベント
			loader.onerror = function(){
				if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

				// 終了通知
				response(false);
			};
			loader.setURL(url);
			loader.setSendData(null);
			loader.loadFinalURL();

		}else{
			response(false);
		}
	}

	// --------------------------------------------------------------------------------
	// テキストの展開
	// --------------------------------------------------------------------------------
	function ElementExpandInlineText(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);
		var content_type = AnalyzeWorkGetContentType(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		function response_allow(param){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(!(param.result)){
				complete();
				return;
			}

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var loader = null;
			var text_area = null;
			var text_area_analyze_work = null;
			var text_url = url;
			var event_handler = null;
			var observer_remove = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// テキストエリアを破棄
			function releaseTextarea(e){
				// ローダーを中断
				if(loader){
					loader.onload = null;
					loader.onerror = null;
					loader = null;
				}

				// アドレスの登録を外す
				if(text_url){
					address_collection.removeAddress("text",text_url);
					text_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// 解析辞書除外
				if(text_area_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(text_area_analyze_work);
					text_area_analyze_work = null;
				}

				// テキストエリアを外す
				if(text_area){
					DomNodeRemove(text_area);
					text_area = null;
				}
			}

			// 重複チェック
			if(project.getDisableSameInlineText()){
				if(address_collection.hasAddress("text",text_url)){
					text_url = null;
					releaseTextarea();
					complete();
					return;
				}
				// アドレスを登録
				address_collection.addAddress("text",text_url);
			}

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseTextarea);

			// テキストの読み込み
			loader = new Loader();
			loader.onload = function(str){
				complete();

				// テキストエリアを生成
				text_area = DocumentCreateElement("textarea");
				text_area.value = str;

				// スタイルをセット
				ElementSetStyle(text_area,project.getStyleSheetExpandTextInline());

				// 解析ワーク作成
				text_area_analyze_work = AnalyzeWorkCreate(text_area);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(text_area_analyze_work,attach_options);

				// テキストエリアのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(text_area);
				observer_remove.setFunction(dispatchEventRelease);

				function responseInsert(){
				}

				// コールバック関数を実行
				project.executeScriptInsertInlineText(element,text_area,work.event_dispatcher,responseInsert);
			};

			loader.onerror = function(){
				complete();
			};
			loader.setMethod("GET");
			loader.setURL(text_url);
			loader.loadText();
		}

		// コールバック関数を実行
		project.executeScriptAllowInlineText(element,url,content_type,response_allow);
	}

	// --------------------------------------------------------------------------------
	// サムネイルイメージ
	// --------------------------------------------------------------------------------
	function ElementExpandThumbnailImage(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);
		var content_type = AnalyzeWorkGetContentType(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		function response_allow(param){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(!(param.result)){
				complete();
				return;
			}

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var loader = null;
			var popup_image = null;
			var thumbnail_image = null;
			var thumbnail_analyze_work = null;
			var thumbnail_url = url;
			var event_handler = null;
			var observer_remove = null;
			var limitter_element = null;
			var notify_element = null;

			// ダウンロードリストに登録
			var item = download_list_image.createItem();
			item.setURL(thumbnail_url);

			// サムネイルイメージを破棄（ElementLimiter 用）
			function releaseThumbnailImageForElementLimiter(e){
				// ローダーを中断
				if(loader){
					loader.onload = null;
					loader.onerror = null;
					loader = null;
				}

				// ポップアップイメージを破棄
				releasePopupImage();

				// アドレスの登録を外す
				if(thumbnail_url){
					address_collection.removeAddress("image",thumbnail_url);
					thumbnail_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// 通知破棄
				if(notify_element){
					notify_element.release();
					notify_element = null;
				}

				// 解析辞書除外
				if(thumbnail_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(thumbnail_analyze_work);
					thumbnail_analyze_work = null;
				}

				// サムネイルイメージを破棄
				if(thumbnail_image){
					var revise_scroll = new DocumentReviseScroll();
					revise_scroll.executeRemoveElementBefore(thumbnail_image);
					DomNodeRemove(thumbnail_image);
					revise_scroll.executeRemoveElementAfter(thumbnail_image);
					thumbnail_image = null;
				}

				initializeLimitterElement();
			}

			// ポップアップイメージを破棄
			function releasePopupImage(e){
				// ポップアップイメージを破棄
				if(popup_image){
					popup_image.suicide();
					popup_image = null;
				}
			}

			// サムネイルイメージを破棄
			function releaseThumbnailImage(e){
				releaseThumbnailImageForElementLimiter();

				AnalyzeWorkClearPopupImage(work);

				if(limitter_element){
					limitter_element.release();
					limitter_element = null;
				}
			}

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// 制限初期化
			function initializeLimitterElement(){
				if(limitter_element){
					limitter_element.onattach = function(){
						createThumbnailImage();
					};
					limitter_element.onremove = function(){
						releaseThumbnailImageForElementLimiter();
					};
					limitter_element.setElementHitArea(element);
					limitter_element.setEnablePreload(project.getEnablePreLoadThumbnailImage());
				}
			}

			// サムネイルイメージを登録
			function createThumbnailImage(e){
				if(project.getEnableLoadNotifyExpandImage()){
					notify_element = notify_progress.createElement();
				}
				if(notify_element){
					notify_element.setElementHitArea(element);
					notify_element.setNotify(NotifyProgress.NOTIFY_TYPE_LOADING);
				}

				// 画像の読み込み
				loader = new Loader();
				loader.onload = function(image){
					thumbnail_image = image;

					// 解析ワーク作成
					thumbnail_analyze_work = AnalyzeWorkCreate(thumbnail_image);

					// 解析済み
					AnalyzeWorkSetAnalyzedPopupReducedImage(thumbnail_analyze_work);

					// 解析辞書登録オプション
					var attach_options = new AnalyzeWorkDictionaryAttachOptions();
					attach_options.SetOutsider();

					// 解析辞書登録
					analyze_work_dictionary.attachAnalyzeWork(thumbnail_analyze_work,attach_options);

					complete();

					// 成功通知
					if(notify_element){
						notify_element.setNotify(NotifyProgress.NOTIFY_TYPE_COMPLETE);
						notify_element.release();
						notify_element = null;
					}

					// 画像サイズをセット
					var image_size = ImageGetNaturalSize(thumbnail_image);
					limitter_element.setByteSize(image_size.width * image_size.height * 4);

					// 古い要素を破棄
					element_limitter_image.removeOldElements();
					if(!thumbnail_image)	return;

					// スタイルをセット
					ElementSetStyle(thumbnail_image,project.getStyleSheetExpandImageThumbnail());

					function responseInsert(){
						if(!thumbnail_image)	return;

						// ポップアップイメージを生成
						function createPopupImage(){

							// 縮小画像のポップアップ
							if(project.getEnablePopupMouseoverToThumbnailImage()){

								// 既存の PopupImage を全て破棄
								PopupReducedImageReleaseAll(element);

								// イメージを複製
								var image_clone = ImageClone(thumbnail_image);

								// ロード完了
								ImageGetLoaded(image_clone,function(){
									if(!thumbnail_image)	return;

									// ポップアップイメージ
									popup_image = new PopupImage(image_clone);
									popup_image.setElementParent(document.body);
									popup_image.setElementAnchor(thumbnail_image);
									popup_image.setElementHitArea(thumbnail_image);
									popup_image.setElementBeginArea(thumbnail_image);
									popup_image.setOriginalURL(thumbnail_url);
									AnalyzeWorkSetPopupImage(work,popup_image);
								});
							}
						}

						// イメージのリムーブ監視
						observer_remove = new DomNodeObserverRemoveFromDocument(thumbnail_image);
						observer_remove.setFunction(dispatchEventRelease);

						// サムネイルソース
						var image_src = thumbnail_image.src;

						// コールバックを変更
						limitter_element.onattach = function(){
							thumbnail_image.src = image_src;
							createPopupImage();
						};
						limitter_element.onremove = function(){
							thumbnail_image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEHAAAALAAAAAABAAEAAAICRAEAOw==";
							releasePopupImage();
						};
						limitter_element.setElementHitArea(thumbnail_image);


						createPopupImage();
					}

					// コールバック関数を実行
					project.executeScriptInsertThumbnailImage(element,thumbnail_image,work.event_dispatcher,responseInsert);
				};

				loader.onerror = function(){
					complete();

					// 失敗通知
					if(notify_element){
						notify_element.setNotify(NotifyProgress.NOTIFY_TYPE_ERROR);
					}
				};
				loader.setMethod("GET");
				loader.setURL(thumbnail_url);
				loader.loadImage();
			}

			// 重複チェック
			if(project.getDisableSameThumbnailImage()){
				if(address_collection.hasAddress("image",thumbnail_url)){
					thumbnail_url = null;
					releaseThumbnailImage();
					complete();
					return;
				}

				// アドレスを登録
				address_collection.addAddress("image",thumbnail_url);
			}

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseThumbnailImage);

			// イメージ管理
			limitter_element = element_limitter_image.createElement();
			initializeLimitterElement();

			// 更新
			limitter_element.update();
		}

		// コールバック関数を実行
		var request = {
			element:element,
			url:url,
			content_type:content_type,
			is_overridden_url:AnalyzeWorkGetOverrodeUrl(work)
		};
		project.executeScriptAllowThumbnailImage(request,response_allow);
	}

	// --------------------------------------------------------------------------------
	// ポップアップイメージ
	// --------------------------------------------------------------------------------
	function ElementExpandPopupImage(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);
		var content_type = AnalyzeWorkGetContentType(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		function response_allow(param){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(!(param.result)){
				complete();
				return;
			}

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var loader = null;
			var popup_image = null;
			var begin_area = null;
			var event_handler = null;
			var observer_remove = null;
			var limitter_element = null;
			var notify_element = null;

			// ダウンロードリストに登録
			var item = download_list_image.createItem();
			item.setURL(url);

			// ポップアップイメージを破棄（ElementLimiter 用）
			function releasePopupImageForElementLimiter(e){
				// ローダーを中断
				if(loader){
					loader.onload = null;
					loader.onerror = null;
					loader = null;
				}

				// ワークを破棄
				if(popup_image){
					popup_image.suicide();
					popup_image = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// 通知破棄
				if(notify_element){
					notify_element.release();
					notify_element = null;
				}
			}

			// ポップアップイメージを破棄
			function releasePopupImage(e){
				releasePopupImageForElementLimiter(e);

				AnalyzeWorkClearPopupImage(work);

				if(limitter_element){
					limitter_element.release();
					limitter_element = null;
				}
			}

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// ポップアップイメージを登録
			function createPopupImage(e){
				if(project.getEnableLoadNotifyExpandImage()){
					notify_element = notify_progress.createElement();
				}
				if(notify_element){
					notify_element.setElementHitArea(element);
					notify_element.setNotify(NotifyProgress.NOTIFY_TYPE_LOADING);
				}

				// 画像の読み込み
				loader = new Loader();
				loader.onload = function(image){
					complete();

					// 画像サイズをセット
					var image_size = ImageGetNaturalSize(image);
					limitter_element.setByteSize(image_size.width * image_size.height * 4);

					// 古い要素を破棄
					element_limitter_image.removeOldElements();
					if(!loader)	return;

					// １ドット画像を排除
					if(image_size.width > 1){
					}else if(image_size.height > 1){
					}else{
						releasePopupImage();
						return;
					}

					// 画像を１つだけ保有するなら画像を開始矩形とする
					(function(){
						var begin_element = null;

						if(element.tagName == "IMG"){
							if(ElementGetVisibility(element)){
								begin_element = element;
							}
						}

						var nodes = ElementGetElementsByTagName(element,"img");
						var i;
						var num = nodes.length;
						for(i=0;i<num;i++){
							var node = nodes[i];
							if(ElementGetVisibility(node)){
								if(begin_element) return;
								begin_element = node;
							}
						}

						if(begin_element){
							begin_area = begin_element;
						}
					})();

					// 矩形が画像サイズより小さいか
					if(!begin_area){
						var r = DomTreeGetBoundingClientRect(element);
						if((r.bottom - r.top) > image_size.height){
						}else if((r.right - r.left) > image_size.width){
						}else{
							begin_area = element;
						}
					}

					// 既存の PopupImage を全て破棄
					PopupReducedImageReleaseAll(element);

					// 開始矩形エレメントを監視
					if(begin_area){
						observer_remove = new DomNodeObserverRemoveFromDocument(begin_area);
					}

					// 開始範囲のリムーブ監視
					if(observer_remove){
						observer_remove.setFunction(dispatchEventRelease);
					}

					// ポップアップイメージを作成
					popup_image = new PopupImage(image);
					popup_image.setElementParent(document.body);
					popup_image.setElementAnchor(element);
					popup_image.setElementHitArea(element);
					popup_image.setElementBeginArea(begin_area);
					popup_image.setOriginalURL(url);
					AnalyzeWorkSetPopupImage(work,popup_image);

					// 成功通知
					if(notify_element){
						notify_element.setNotify(NotifyProgress.NOTIFY_TYPE_COMPLETE);
						notify_element.release();
						notify_element = null;
					}

					// ポップアップ
					if(ElementHitTestMousePosition(element,input_mouse.getPositionClient(),true)){
						popup_image.popup();
					}
				};

				loader.onerror = function(){
					complete();

					// 失敗通知
					if(notify_element){
						notify_element.setNotify(NotifyProgress.NOTIFY_TYPE_ERROR);
					}
				};
				loader.setMethod("GET");
				loader.setURL(url);
				loader.loadImage();
			}

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releasePopupImage);

			// イメージ管理
			limitter_element = element_limitter_image.createElement();
			limitter_element.onattach = function(){
				createPopupImage();
			};
			limitter_element.onremove = function(){
				releasePopupImageForElementLimiter();
			};
			limitter_element.setElementHitArea(element);
			limitter_element.setEnablePreload(project.getEnablePreLoadPopupImage());

			// 更新
			limitter_element.update();
		}

		// コールバック関数を実行
		var request = {
			element:element,
			url:url,
			content_type:content_type,
			is_overridden_url:AnalyzeWorkGetOverrodeUrl(work)
		};
		project.executeScriptAllowPopupImage(request,response_allow);

	}

	// --------------------------------------------------------------------------------
	// インラインサウンド
	// --------------------------------------------------------------------------------
	function ElementExpandInlineSound(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);
		var content_type = AnalyzeWorkGetContentType(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		function response_allow(response){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(!(response.result)){
				complete();
				return;
			}

			// AudioElement
			ElementExpandInlineAudioElement(param);
			// SoundCloud
			ElementExpandInlinePlayerSoundcloud(param);
			// MixCloud
			ElementExpandInlinePlayerMixcloud(param);
		}

		// コールバック関数を実行
		var request = {
			element:element,
			url:url,
			content_type:content_type,
			is_overridden_url:AnalyzeWorkGetOverrodeUrl(work)
		};
		project.executeScriptAllowInlineSound(request,response_allow);
	}

	// --------------------------------------------------------------------------------
	// インライン AudioElement
	// --------------------------------------------------------------------------------
	function ElementExpandInlineAudioElement(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);
		var content_type = AnalyzeWorkGetContentType(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		function response_allow(param){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;
			if(!(param.result)){
				complete();
				return;
			}

			// アンセキュアチェック
			if(!project.checkAllowUnsecure(url)){
				complete();
				return;
			}

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var loader = null;
			var audio = null;
			var audio_analyze_work = null;
			var audio_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;
			var media_player_ui = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// オーディオエレメントを破棄
			function releaseAudioElement(e){
				// ローダーを中断
				if(loader){
					loader.onload = null;
					loader.onerror = null;
					loader = null;
				}

				// アドレスの登録を外す
				if(audio_url){
					address_collection.removeAddress("sound",audio_url);
					audio_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				if(limitter_element){
					limitter_element.onremove = null;
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// メディアプレイヤー UI を破棄
				if(media_player_ui){
					media_player_ui.release();
					media_player_ui = null;
				}

				// 解析辞書除外
				if(audio_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(audio_analyze_work);
					audio_analyze_work = null;
				}

				// オーディオエレメントを外す
				if(audio){
					DomNodeRemove(audio);
					audio = null;
				}
			}

			// 重複チェック
			if(project.getDisableSameInlineSound()){
				if(address_collection.hasAddress("sound",audio_url)){
					audio_url = null;
					releaseAudioElement();
					complete();
					return;
				}
				// アドレスを登録
				address_collection.addAddress("sound",audio_url);
			}

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseAudioElement);

			// オーディオの読み込み
			loader = new Loader();
			loader.onload = function(audio_element){
				audio = audio_element;

				// 解析ワーク作成
				audio_analyze_work = AnalyzeWorkCreate(audio);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(audio_analyze_work,attach_options);

				complete();

				// スタイルをセット
				ElementSetStyle(audio,project.getStyleSheetExpandSoundInlineAudioElement());

				// オーディオエレメントのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(audio);
				observer_remove.setFunction(dispatchEventRelease);

				// メディアプレイヤー UI
				media_player_ui = new MediaPlayerExtendUI(audio);
				var event_handler_close = media_player_ui.createEventHandler("close");
				event_handler_close.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!audio)	return;

					limitter_element = element_limitter_sound.createElement();
					limitter_element.onattach = function(){
						audio.preload = "metadata";
						audio.src = audio_url;
						audio.load();
					};
					limitter_element.onremove = function(){
						audio.preload = "none";
						audio.src = "";
						audio.load();
					};
					limitter_element.setElementHitArea(audio);

					// 更新
					limitter_element.update();
				}

				// コールバック関数を実行
				project.executeScriptInsertInlineSound(element,audio,work.event_dispatcher,responseInsert);
			};

			loader.onerror = function(){
				complete();
			};
			loader.setMethod("GET");
			loader.setURL(audio_url);
			loader.loadAudio();
		}

		// コールバック関数を実行
		project.executeScriptAllowAudioElement(element,url,content_type,response_allow);
	}

	// --------------------------------------------------------------------------------
	// インラインプレイヤー Soundcloud
	// --------------------------------------------------------------------------------
	function ElementExpandInlinePlayerSoundcloud(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		// soundcloud.com 内では動作禁止
		var deny_list = [
			"*://soundcloud.com/*",
			"*://*.soundcloud.com/*"
		];
		var i;
		var num = deny_list.length;
		for(i=0;i<num;i++){
			if(StringUrlMatchAsteriskWord(document.URL,deny_list[i])){
				return;
			}
		}

		// 動画を展開
		function expand_player(){

			// 展開処理の完了
			function expand_player_complete(){
			}

			if(project.getVisiblePlayerHtml5Soundcloud()){
				(function(){
					var iframe_url = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(url);
					var height = 166;

					var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
					var iframe = null;
					var iframe_analyze_work = null;
					var event_handler = null;
					var limitter_element = null;
					var observer_remove = null;
					var media_player_ui = null;

					// 開放イベントを発行
					function dispatchEventRelease(e){
						event_dispatcher.dispatchEvent("release",null);
					}

					// インラインフレームを破棄
					function releaseIframeHtml5(e){
						// アドレスの登録を外す
						if(iframe_url){
							address_collection.removeAddress("sound",iframe_url);
							iframe_url = null;
						}

						// イベントハンドラを破棄
						if(event_handler){
							event_handler.release();
							event_handler = null;
						}

						if(limitter_element){
							limitter_element.onremove = null;
							limitter_element.release();
							limitter_element = null;
						}

						// 監視を破棄
						if(observer_remove){
							observer_remove.release();
							observer_remove = null;
						}

						// メディアプレイヤー UI を破棄
						if(media_player_ui){
							media_player_ui.release();
							media_player_ui = null;
						}

						// 解析辞書除外
						if(iframe_analyze_work){
							analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
							iframe_analyze_work = null;
						}

						// インラインフレームを外す
						if(iframe){
							DomNodeRemove(iframe);
							iframe = null;
						}
					}

					// 混在コンテンツの展開が可能か
					if(!(project.checkAllowExpandIframeElement(iframe_url))){
						releaseIframeHtml5();
						complete();
						return;
					}

					// 重複チェック
					if(project.getDisableSameInlineSound()){
						if(address_collection.hasAddress("sound",iframe_url)){
							iframe_url = null;
							releaseIframeHtml5();
							complete();
							return;
						}
						// アドレスを登録
						address_collection.addAddress("sound",iframe_url);
					}

					// イベントハンドラを作成
					event_handler = event_dispatcher.createEventHandler("release");
					event_handler.setFunction(releaseIframeHtml5);

					// インラインフレームを作成
					iframe = DocumentCreateElement('iframe');
					iframe.frameBorder = "0";
					iframe.scrolling = "no";
					iframe.allowFullscreen = true;

					// スタイルをセット
					ElementSetStyle(iframe,project.getStyleSheetExpandSoundSoundcloudInlinePlayerHtml5());

					if(height){
						// 高さを設定
						iframe.style.height = parseInt(height) + "px";
					}

					// 解析ワーク作成
					iframe_analyze_work = AnalyzeWorkCreate(iframe);

					// 解析辞書登録オプション
					var attach_options = new AnalyzeWorkDictionaryAttachOptions();
					attach_options.SetOutsider();

					// 解析辞書登録
					analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

					// インラインフレームのリムーブ監視
					observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
					observer_remove.setFunction(dispatchEventRelease);

					// メディアプレイヤー UI
					media_player_ui = new MediaPlayerExtendUI(iframe);
					var event_handler_close = media_player_ui.createEventHandler("close");
					event_handler_close.setFunction(dispatchEventRelease);

					function responseInsertHtml5(){
						if(!iframe)	return;

						limitter_element = element_limitter_sound.createElement();
						limitter_element.onattach = function(){
							iframe.src = iframe_url;
						};
						limitter_element.onremove = function(){
							iframe.src = "";
						};
						limitter_element.setElementHitArea(iframe);

						// 更新
						limitter_element.update();
					}

					// コールバック関数を実行
					project.executeScriptInsertInlineSound(element,iframe,work.event_dispatcher,responseInsertHtml5);
				})();
			}

		}

		if(project.getVisiblePlayerHtml5Soundcloud()){

			// soundcloud.com へのリンク
			var allow_list = [
				"(http|https)://soundcloud\\.com/.+?/.+([?]|$)"
			];
			num = allow_list.length;
			for(i=0;i<num;i++){
				if(url.match(new RegExp(allow_list[i],"i"))){
					expand_player();
					return;
				}
			}
		}

		// 完了
		complete();
	}

	// --------------------------------------------------------------------------------
	// インラインプレイヤー Mixcloud
	// --------------------------------------------------------------------------------
	function ElementExpandInlinePlayerMixcloud(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		// www.mixcloud.com 内では動作禁止
		var deny_list = [
			"*://mixcloud.com/*",
			"*://*.mixcloud.com/*"
		];
		var i;
		var num = deny_list.length;
		for(i=0;i<num;i++){
			if(StringUrlMatchAsteriskWord(document.URL,deny_list[i])){
				return;
			}
		}

		// 動画を展開
		function expand_player(){

			// 展開処理の完了
			function expand_player_complete(){
			}

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var loader = null;
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = null;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;
			var media_player_ui = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// インラインフレームを破棄
			function releaseIframe(e){
				// ローダーを中断
				if(loader){
					loader.onload = null;
					loader.onerror = null;
					loader = null;
				}

				// アドレスの登録を外す
				if(iframe_url){
					address_collection.removeAddress("sound",iframe_url);
					iframe_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				if(limitter_element){
					limitter_element.onremove = null;
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// メディアプレイヤー UI を破棄
				if(media_player_ui){
					media_player_ui.release();
					media_player_ui = null;
				}

				// 解析辞書除外
				if(iframe_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
					iframe_analyze_work = null;
				}

				// インラインフレームを外す
				if(iframe){
					DomNodeRemove(iframe);
					iframe = null;
				}
			}

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseIframe);

			// テキストの読み込み
			loader = new Loader();
			loader.onload = function(str){
				var m = str.match(new RegExp("<meta[^>]+name[ \n\r\t]*=[ \n\r\t]*\"twitter:player\"[^>]*>","i"));
				if(m){
					m = m[0].match(new RegExp("content[ \n\r\t]*=[ \n\r\t]*\"([^\"]+?)\"","i"));
					if(m){
						iframe_url = m[1];
						iframe_url = iframe_url.replace(new RegExp("^//"),"https://");
					}
				}

				// アドレス取得失敗
				if(!iframe_url){
					releaseIframe();
					return;
				}

				// 混在コンテンツの展開が可能か
				if(!(project.checkAllowExpandIframeElement(iframe_url))){
					releaseIframe();
					complete();
					return;
				}

				// 重複チェック
				if(project.getDisableSameInlineSound()){
					if(address_collection.hasAddress("sound",iframe_url)){
						iframe_url = null;
						releaseIframe();
						complete();
						return;
					}
					// アドレスを登録
					address_collection.addAddress("sound",iframe_url);
				}

				// インラインフレームを作成
				iframe = DocumentCreateElement('iframe');
				iframe.frameBorder = "0";
				iframe.scrolling = "no";
				iframe.allowFullscreen = true;

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandSoundMixcloudInlinePlayer());

				// 高さを設定
				var m = str.match(new RegExp("<meta[^>]+name[ \n\r\t]*=[ \n\r\t]*\"twitter:player:height\"[^>]*>","i"));
				if(m){
					m = m[0].match(new RegExp("content[ \n\r\t]*=[ \n\r\t]*\"([^\"]+?)\"","i"));
					if(m){
						iframe.style.height = parseInt(m[1]) + "px";

					}
				}

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(dispatchEventRelease);

				// メディアプレイヤー UI
				media_player_ui = new MediaPlayerExtendUI(iframe);
				var event_handler_close = media_player_ui.createEventHandler("close");
				event_handler_close.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!iframe)	return;

					limitter_element = element_limitter_sound.createElement();
					limitter_element.onattach = function(){
						iframe.src = iframe_url;
					};
					limitter_element.onremove = function(){
						iframe.src = "";
					};
					limitter_element.setElementHitArea(iframe);

					// 更新
					limitter_element.update();
				}

				// コールバック関数を実行
				project.executeScriptInsertInlineSound(element,iframe,work.event_dispatcher,responseInsert);
			};

			// ロードエラー
			loader.onerror = function(){
				expand_player_complete();
				complete();
			};

			loader.setMethod("GET");
			loader.setURL(url);
			loader.loadText();
		}

		if(project.getVisiblePlayerMixcloud()){

			// mixcloud.com へのリンク
			var allow_list = [
				"^(http|https)://[^.]+\\.mixcloud\\.com/[^/]+/[^/]+(/$|[?]|$)",
				"^(http|https)://i\\.mixcloud\\.com/[a-zA-Z0-9]+$"
			];
			num = allow_list.length;
			for(i=0;i<num;i++){
				if(url.match(new RegExp(allow_list[i],"i"))){
					expand_player();
					return;
				}
			}
		}

		// 完了
		complete();
	}

	// --------------------------------------------------------------------------------
	// インラインビデオ
	// --------------------------------------------------------------------------------
	function ElementExpandInlineVideo(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);
		var content_type = AnalyzeWorkGetContentType(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		function response_allow(response){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(!(response.result)){
				complete();
				return;
			}

			// VideoElement
			ElementExpandInlineVideoElement(param);
			// youtube
			ElementExpandInlineVideoYoutube(param);
			// nicovideo
			ElementExpandInlineVideoNicovideo(param);
			// ustream
			ElementExpandInlineVideoUstream(param);
			// dailymotion
			ElementExpandInlineVideoDailymotion(param);
			// vimeo
			ElementExpandInlineVideoVimeo(param);
			// fc2_video
			ElementExpandInlineVideoFc2video(param);
			// liveleak
			ElementExpandInlineVideoLiveleak(param);
		}

		// コールバック関数を実行
		var request = {
			element:element,
			url:url,
			content_type:content_type,
			is_overridden_url:AnalyzeWorkGetOverrodeUrl(work)
		};
		project.executeScriptAllowInlineVideo(request,response_allow);
	}

	// --------------------------------------------------------------------------------
	// インライン VideoElement
	// --------------------------------------------------------------------------------
	function ElementExpandInlineVideoElement(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);
		var content_type = AnalyzeWorkGetContentType(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		function response_allow(param){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(!(param.result)){
				complete();
				return;
			}

			// アンセキュアチェック
			if(!project.checkAllowUnsecure(url)){
				complete();
				return;
			}

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var loader = null;
			var video = null;
			var video_analyze_work = null;
			var video_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;
			var media_player_ui = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// ビデオエレメントを破棄
			function releaseVideoElement(e){
				// ローダーを中断
				if(loader){
					loader.onload = null;
					loader.onerror = null;
					loader = null;
				}

				// アドレスの登録を外す
				if(video_url){
					address_collection.removeAddress("video",video_url);
					video_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				if(limitter_element){
					limitter_element.onremove = null;
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// メディアプレイヤー UI を破棄
				if(media_player_ui){
					media_player_ui.release();
					media_player_ui = null;
				}

				// 解析辞書除外
				if(video_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(video_analyze_work);
					video_analyze_work = null;
				}

				// ビデオエレメントを外す
				if(video){
					DomNodeRemove(video);
					video = null;
				}
			}

			// 重複チェック
			if(project.getDisableSameInlineVideo()){
				if(address_collection.hasAddress("video",video_url)){
					video_url = null;
					releaseVideoElement();
					complete();
					return;
				}
				// アドレスを登録
				address_collection.addAddress("video",video_url);
			}

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseVideoElement);

			// ビデオの読み込み
			loader = new Loader();
			loader.onload = function(video_element){
				video = video_element;

				// 解析ワーク作成
				video_analyze_work = AnalyzeWorkCreate(video);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(video_analyze_work,attach_options);

				complete();

				// スタイルをセット
				ElementSetStyle(video,project.getStyleSheetExpandVideoInlineVideoElement());

				// ビデオエレメントのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(video);
				observer_remove.setFunction(dispatchEventRelease);

				// メディアプレイヤー UI
				media_player_ui = new MediaPlayerExtendUI(video);
				var event_handler_close = media_player_ui.createEventHandler("close");
				event_handler_close.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!video)	return;

					limitter_element = element_limitter_video.createElement();
					limitter_element.onattach = function(){
						video.preload = "metadata";
						video.src = video_url;
						video.load();
					};
					limitter_element.onremove = function(){
						video.preload = "none";
						video.src = "";
						video.load();
					};
					limitter_element.setElementHitArea(video);

					// 更新
					limitter_element.update();
				}

				// コールバック関数を実行
				project.executeScriptInsertInlineVideo(element,video,work.event_dispatcher,responseInsert);
			};

			loader.onerror = function(){
				complete();
			};
			loader.setMethod("GET");
			loader.setURL(video_url);
			loader.loadVideo();
		}

		// コールバック関数を実行
		project.executeScriptAllowVideoElement(element,url,content_type,response_allow);
	}

	// --------------------------------------------------------------------------------
	// インラインビデオ youtube
	// --------------------------------------------------------------------------------
	function ElementExpandInlineVideoYoutube(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		// youtube.com 内では動作禁止
		var deny_list = [
			"*://*.youtube.com/*",
			"*://youtube.com/*"
		];
		var i;
		var num = deny_list.length;
		for(i=0;i<num;i++){
			if(StringUrlMatchAsteriskWord(document.URL,deny_list[i])){
				return;
			}
		}

		// 動画を展開
		function expand_video(url){

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;
			var media_player_ui = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// インラインフレームを破棄
			function releaseIframe(e){
				// アドレスの登録を外す
				if(iframe_url){
					address_collection.removeAddress("video",iframe_url);
					iframe_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				if(limitter_element){
					limitter_element.onremove = null;
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// メディアプレイヤー UI を破棄
				if(media_player_ui){
					media_player_ui.release();
					media_player_ui = null;
				}

				// 解析辞書除外
				if(iframe_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
					iframe_analyze_work = null;
				}

				// インラインフレームを外す
				if(iframe){
					DomNodeRemove(iframe);
					iframe = null;
				}
			}

			// 混在コンテンツの展開が可能か
			if(!(project.checkAllowExpandIframeElement(iframe_url))){
				releaseIframe();
				complete();
				return;
			}

			// 重複チェック
			if(project.getDisableSameInlineVideo()){
				if(address_collection.hasAddress("video",iframe_url)){
					iframe_url = null;
					releaseIframe();
					complete();
					return;
				}
				// アドレスを登録
				address_collection.addAddress("video",iframe_url);
			}

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseIframe);

			// インラインフレームを作成
			iframe = DocumentCreateElement('iframe');
			iframe.frameBorder = "0";
			iframe.scrolling = "no";
			iframe.allowFullscreen = true;

			// スタイルをセット
			ElementSetStyle(iframe,project.getStyleSheetExpandVideoYoutubeInlineVideo());

			// 解析ワーク作成
			iframe_analyze_work = AnalyzeWorkCreate(iframe);

			// 解析辞書登録オプション
			var attach_options = new AnalyzeWorkDictionaryAttachOptions();
			attach_options.SetOutsider();

			// 解析辞書登録
			analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

			// インラインフレームのリムーブ監視
			observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
			observer_remove.setFunction(dispatchEventRelease);

			// メディアプレイヤー UI
			media_player_ui = new MediaPlayerExtendUI(iframe);
			var event_handler_close = media_player_ui.createEventHandler("close");
			event_handler_close.setFunction(dispatchEventRelease);

			function responseInsert(){
				if(!iframe)	return;

				limitter_element = element_limitter_video.createElement();
				limitter_element.onattach = function(){
					iframe.src = iframe_url;
				};
				limitter_element.onremove = function(){
					iframe.src = "";
				};
				limitter_element.setElementHitArea(iframe);

				// 更新
				limitter_element.update();
			}

			// コールバック関数を実行
			project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
		}

		function getHashQuery(url){
			var q = new Object();
			var m = url.match(new RegExp("[#](.*?)([?]|$)"));
			if(!m)	return q;
			var a = m[1].split('&');
			var i;
			var num = a.length;
			for(i=0;i<num;i++){
				var b = a[i].split('=');
				if(b.length == 2){
					q[b[0]] = b[1];
				}
			}
			return q;
		}

		function getIframeURL(url,v){
			var q = StringGetQuery(url);
			var h = getHashQuery(url);
			var start = q["t"] || h["t"];
			if(start){
				var t = 0;
				var m;
				m = start.match(/([0-9]+)h/i);
				if(m){
					t += parseInt(m[1]) * 60 * 60;
				}
				m = start.match(/([0-9]+)m/i);
				if(m){
					t += parseInt(m[1]) * 60;
				}
				m = start.match(/([0-9]+)s/i);
				if(m){
					t += parseInt(m[1]);
				}
				if(t){
					start = t + "";
				}
				m = start.match(/([0-9]+)/i);
				if(m){
					start = m[1];
				}else{
					start = "";
				}
			}
			var protocol = project.getSecureCurrent() ? "https" : "http";
			var iframe_url = protocol + "://www.youtube-nocookie.com/embed/" + v;
			if(start) iframe_url += "?start=" + start;
			return iframe_url;
		}

		if(project.getVisibleVideoYoutube()){
			// youtube へのリンク
			var allow_list_query = [
				"*://www.youtube.com/watch?*",
				"*://www.youtube.com/watch_popup?*",
				"*://m.youtube.com/watch?*",
				"*://m.youtube.com/#/watch?*"
			];
			num = allow_list_query.length;
			for(i=0;i<num;i++){
				if(StringUrlMatchAsteriskWord(url,allow_list_query[i])){
					var query = StringGetQuery(url);
					if(query.v){
						expand_video(getIframeURL(url,query.v));
						return;
					}
				}
			}

			// 短縮 URL など
			var allow_list_regexp = [
				"(http|https)://www\\.youtube\\.com/v/",
				"(http|https)://youtu\\.be/"
			];
			num = allow_list_regexp.length;
			for(i=0;i<num;i++){
				if(url.match(new RegExp(allow_list_regexp[i],"i"))){
					if(RegExp.rightContext.match(new RegExp("^([-_a-zA-Z0-9]+)","i"))){
						expand_video(getIframeURL(url,RegExp.$1));
						return;
					}
				}
			}
		}

		// 完了
		complete();
	}

	// --------------------------------------------------------------------------------
	// インラインビデオ nicovideo
	// --------------------------------------------------------------------------------
	function ElementExpandInlineVideoNicovideo(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		// アンセキュアチェック
		if(!project.checkAllowUnsecure(url)){
			complete();
			return;
		}

		// .nicovideo.jp 内では動作禁止
		var deny_list = [
			"*://nicovideo.jp/*",
			"*://*.nicovideo.jp/*",
			"*://niconico.com/*",
			"*://*.niconico.com/*"
		];
		var i;
		var num = deny_list.length;
		for(i=0;i<num;i++){
			if(StringUrlMatchAsteriskWord(document.URL,deny_list[i])){
				return;
			}
		}

		// 動画を展開
		function expand_video(video_id,language){

			(function(){

				// 展開処理の完了
				function expand_video_complete(){
					// ビデオサムネイル展開
					if(project.getVisibleThumbnailVideoNicovideo()){
						expand_thumbnail_video(video_id,language);
					}
				}

				var script_url = "http://ext.nicovideo.jp/thumb_watch/" + video_id;
				if(language){
					script_url += "?cc=" + language;
				}

				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				var loader = null;
				var video = null;
				var video_analyze_work = null;
				var event_handler = null;
				var limitter_element = null;
				var observer_remove = null;
				var media_player_ui = null;

				// 開放イベントを発行
				function dispatchEventRelease(e){
					event_dispatcher.dispatchEvent("release",null);
				}

				// エレメントを破棄
				function releaseElement(e){
					// ローダーを中断
					if(loader){
						loader.onload = null;
						loader.onerror = null;
						loader = null;
					}

					// アドレスの登録を外す
					if(script_url){
						address_collection.removeAddress("video",script_url);
						script_url = null;
					}

					// イベントハンドラを破棄
					if(event_handler){
						event_handler.release();
						event_handler = null;
					}

					if(limitter_element){
						limitter_element.onremove = null;
						limitter_element.release();
						limitter_element = null;
					}

					// 監視を破棄
					if(observer_remove){
						observer_remove.release();
						observer_remove = null;
					}

					// メディアプレイヤー UI を破棄
					if(media_player_ui){
						media_player_ui.release();
						media_player_ui = null;
					}

					// 解析辞書除外
					if(video_analyze_work){
						analyze_work_dictionary.removeAnalyzeWork(video_analyze_work);
						video_analyze_work = null;
					}

					// エレメントを外す
					if(video){
						DomNodeRemove(video);
						video = null;
					}
				}

				// 重複チェック
				if(project.getDisableSameInlineVideo()){
					if(address_collection.hasAddress("video",script_url)){
						script_url = null;
						releaseElement();
						complete();
						return;
					}
					// アドレスを登録
					address_collection.addAddress("video",script_url);
				}

				// イベントハンドラを作成
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseElement);

				// テキストの読み込み
				loader = new Loader();
				loader.onload = function(str){
					var num = str.length;

					// url を抽出
					var player_url;
					(function(){
						var w = "Nicovideo.playerUrl = ";
						var s = str.indexOf(w);
						if(s < 0){
							// 未対応
							return;
						}
						s += w.length;
						// コーテーション開始
						while(s < num){
							w = str.charAt(s);
							if(w == '\'')	break;
							if(w == '\"')	break;
							s++;
						}
						if(s >= num)	return;
						s += 1;
						// コーテーション終了
						var c;
						var e = s;
						while(e < num){
							c = str.charAt(e);
							if(c == w)	break;
							if(c == '\\'){
								e++;
							}
							e++;
						}
						if(e >= num)	return;

						player_url = str.substring(s,e);
					})();

					// flashvars を抽出
					var flashvars = "";
					var variables = new Object();
					(function(){
						var w = "new Nicovideo.MiniPlayer";
						var s = str.lastIndexOf(w);
						if(s < 0){
							// 未対応
							return;
						}
						s += w.length;
						// 中括弧開始
						while(s < num){
							if(str.charAt(s) == '{')	break;
							s++;
						}
						if(s >= num)	return;
						s += 1;
						// 中括弧終了
						var c;
						var check = false;
						var e = s;
						while(e < num){
							c = str.charAt(e);
							if(check){
								if(c == w){
									check = false;
								}else if(c == '\\'){
									e++;
								}
							}else{
								if(c == '}')	break;
								if(c == '\'' || c == '\"'){
									w = c;
									check = true;
								}
							}
							e++;
						}
						if(e >= num)	return;

						var buf = str.substring(s,e);
						buf = buf.replace(new RegExp("\\\\/","gi"),"/");
						buf = buf.replace(new RegExp("\\\\u","gi"),"%u");
						var buf_num = buf.length;

						var p = 0;
						var step = 0;
						var name;
						while(p < buf_num){
							switch(step){
							case 0:
								w = buf.charAt(p);
								if((w == '\'') || (w == '\"')){
									step = 1;
									s = p + 1;
								}
								break;
							case 1:
								c = buf.charAt(p);
								if(c == '\\'){
									p += 1;
								}else if(c == w){
									step = 2;
									name = buf.substring(s,p);
								}
								break;
							case 2:
								c = buf.charAt(p);
								if(c == ':'){
									step = 3;
								}
								break;
							case 3:
								w = buf.charAt(p);
								if((w == '\'') || (w == '\"')){
									step = 4;
									s = p + 1;
								}
								break;
							case 4:
								c = buf.charAt(p);
								if(c == '\\'){
									p += 1;
								}else if(c == w){
									step = 5;
									flashvars += name + "=" + buf.substring(s,p);
									variables[name] = buf.substring(s,p);
								}
								break;
							case 5:
								c = buf.charAt(p);
								if(c == ','){
									flashvars += "&";
									step = 0;
								}
								break;
							}
							p ++;
						}

						// アンエスケープ
						var unescape_list = [
							"title",
							"description",
							"thumbTitle",
							"thumbDescription",
							"category",
							"categoryGroup"
						];
						var i;
						var list_num = unescape_list.length;
						for(i=0;i<list_num;i++){
							var name = unescape_list[i];
							if(variables[name]){
								variables[name] = unescape(variables[name]);
							}
						}

						var count = 0;
						for(var p in variables){
							if(count)	flashvars += "&" + p + "=" + variables[p];
							else		flashvars  =       p + "=" + variables[p];
							count ++;
						}
					})();

					// 混在コンテンツの展開が可能か
					if(!(project.checkAllowExpandEmbedElement(player_url))){
						// 解析失敗
						expand_video_complete();
						return;
					}

					if(player_url && flashvars){
					}else{
						// 解析失敗
						expand_video_complete();
						return;
					}

					var embed;
					video = DocumentCreateElement('div');

					// スタイルをセット
					ElementSetStyle(video,project.getStyleSheetExpandVideoNicovideoInlineVideo());

					// 解析ワーク作成
					video_analyze_work = AnalyzeWorkCreate(video);

					// 解析辞書登録オプション
					var attach_options = new AnalyzeWorkDictionaryAttachOptions();
					attach_options.SetOutsider();

					// 解析辞書登録
					analyze_work_dictionary.attachAnalyzeWork(video_analyze_work,attach_options);

					// エレメントのリムーブ監視
					observer_remove = new DomNodeObserverRemoveFromDocument(video);
					observer_remove.setFunction(dispatchEventRelease);

					// メディアプレイヤー UI
					media_player_ui = new MediaPlayerExtendUI(video);
					var event_handler_close = media_player_ui.createEventHandler("close");
					event_handler_close.setFunction(dispatchEventRelease);

					function responseInsert(){
						if(!video)	return;

						limitter_element = element_limitter_video.createElement();
						limitter_element.onattach = function(){
							if(!embed){
								embed = DocumentCreateElement('embed');
								embed.type = "application/x-shockwave-flash";
								embed.width = "100%";
								embed.height = "100%";
								embed.setAttribute("allowScriptAccess","always");
								embed.setAttribute("bgcolor","#000000");
								embed.setAttribute("quality","high");
								embed.setAttribute("flashVars",flashvars);
								embed.src = player_url;
								video.appendChild(embed);
							}
						};
						limitter_element.onremove = function(){
							if(embed){
								DomNodeRemove(embed);
								embed = null;
							}
						};
						limitter_element.setElementHitArea(video);

						// 更新
						limitter_element.update();

						expand_video_complete();
					}

					// コールバック関数を実行
					project.executeScriptInsertInlineVideo(element,video,work.event_dispatcher,responseInsert);
				};

				// ロードエラー
				loader.onerror = function(){
					expand_video_complete();
					complete();
				};

				loader.setMethod("GET");
				loader.setURL(script_url);
				loader.loadText();
			})();
		}

		// ビデオサムネイルを展開
		function expand_thumbnail_video(video_id,language){
			(function(){
				if(!language)	language = "ext";
				var thumbnail_video_url = "http://" + language + ".nicovideo.jp/thumb/" + video_id;

				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

				// 開放イベントを発行
				function dispatchEventRelease(e){
					event_dispatcher.dispatchEvent("release",null);
				}

				// インラインフレームを破棄
				function releaseIframe(e){
					// アドレスの登録を外す
					if(thumbnail_video_url){
						address_collection.removeAddress("video",thumbnail_video_url);
						thumbnail_video_url = null;
					}

					// イベントハンドラを破棄
					if(event_handler){
						event_handler.release();
						event_handler = null;
					}

					// 監視を破棄
					if(observer_remove){
						observer_remove.release();
						observer_remove = null;
					}

					// 解析辞書除外
					if(iframe_analyze_work){
						analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
						iframe_analyze_work = null;
					}

					// インラインフレームを外す
					if(iframe){
						DomNodeRemove(iframe);
						iframe = null;
					}
				}

				// 混在コンテンツの展開が可能か
				if(!(project.checkAllowExpandIframeElement(thumbnail_video_url))){
					releaseIframe();
					complete();
					return;
				}

				// 重複チェック
				if(project.getDisableSameInlineVideo()){
					if(address_collection.hasAddress("video",thumbnail_video_url)){
						thumbnail_video_url = null;
						releaseIframe();
						complete();
						return;
					}
					// アドレスを登録
					address_collection.addAddress("video",thumbnail_video_url);
				}

				// イベントハンドラを作成
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseIframe);

				iframe = DocumentCreateElement('iframe');
				iframe.frameBorder = "0";
				iframe.scrolling = "no";

				// 読み込み開始
				iframe.src = thumbnail_video_url;

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandVideoNicovideoInlineThumbnailVideo());

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!iframe)	return;
				}
				// コールバック関数を実行
				project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
			})();
		}

		// マイリストサムネイルを展開
		function expand_thumbnail_mylist(mylist_id){
			(function(){
				var thumbnail_mylist_url = "http://ext.nicovideo.jp/thumb_mylist/" + mylist_id;

				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

				// 開放イベントを発行
				function dispatchEventRelease(e){
					event_dispatcher.dispatchEvent("release",null);
				}

				// インラインフレームを破棄
				function releaseIframe(e){
					// アドレスの登録を外す
					if(thumbnail_mylist_url){
						address_collection.removeAddress("video",thumbnail_mylist_url);
						thumbnail_mylist_url = null;
					}

					// イベントハンドラを破棄
					if(event_handler){
						event_handler.release();
						event_handler = null;
					}

					// 監視を破棄
					if(observer_remove){
						observer_remove.release();
						observer_remove = null;
					}

					// 解析辞書除外
					if(iframe_analyze_work){
						analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
						iframe_analyze_work = null;
					}

					// インラインフレームを外す
					if(iframe){
						DomNodeRemove(iframe);
						iframe = null;
					}
				}

				// 混在コンテンツの展開が可能か
				if(!(project.checkAllowExpandIframeElement(thumbnail_mylist_url))){
					releaseIframe();
					complete();
					return;
				}

				// 重複チェック
				if(project.getDisableSameInlineVideo()){
					if(address_collection.hasAddress("video",thumbnail_mylist_url)){
						thumbnail_mylist_url = null;
						releaseIframe();
						complete();
						return;
					}
					// アドレスを登録
					address_collection.addAddress("video",thumbnail_mylist_url);
				}

				// イベントハンドラを作成
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseIframe);

				iframe = DocumentCreateElement('iframe');
				iframe.frameBorder = "0";
				iframe.scrolling = "no";
				// 読み込み開始
				iframe.src = thumbnail_mylist_url;

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandVideoNicovideoInlineThumbnailMylist());

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!iframe)	return;
				}
				// コールバック関数を実行
				project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
			})();
		}

		// ユーザーサムネイルを展開
		function expand_thumbnail_user(user_id){
			(function(){
				var thumbnail_user_url = "http://ext.nicovideo.jp/thumb_user/" + user_id;

				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

				// 開放イベントを発行
				function dispatchEventRelease(e){
					event_dispatcher.dispatchEvent("release",null);
				}

				// インラインフレームを破棄
				function releaseIframe(e){
					// アドレスの登録を外す
					if(thumbnail_user_url){
						address_collection.removeAddress("video",thumbnail_user_url);
						thumbnail_user_url = null;
					}

					// イベントハンドラを破棄
					if(event_handler){
						event_handler.release();
						event_handler = null;
					}

					// 監視を破棄
					if(observer_remove){
						observer_remove.release();
						observer_remove = null;
					}

					// 解析辞書除外
					if(iframe_analyze_work){
						analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
						iframe_analyze_work = null;
					}

					// インラインフレームを外す
					if(iframe){
						DomNodeRemove(iframe);
						iframe = null;
					}
				}

				// 混在コンテンツの展開が可能か
				if(!(project.checkAllowExpandIframeElement(thumbnail_user_url))){
					releaseIframe();
					complete();
					return;
				}

				// 重複チェック
				if(project.getDisableSameInlineVideo()){
					if(address_collection.hasAddress("video",thumbnail_user_url)){
						thumbnail_user_url = null;
						releaseIframe();
						complete();
						return;
					}
					// アドレスを登録
					address_collection.addAddress("video",thumbnail_user_url);
				}

				// イベントハンドラを作成
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseIframe);

				iframe = DocumentCreateElement('iframe');
				iframe.frameBorder = "0";
				iframe.scrolling = "no";
				// 読み込み開始
				iframe.src = thumbnail_user_url;

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandVideoNicovideoInlineThumbnailUser());

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!iframe)	return;
				}
				// コールバック関数を実行
				project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
			})();
		}

		// コミュニティサムネイルを展開
		function expand_thumbnail_community(community_id){
			(function(){
				var thumbnail_community_url = "http://ext.nicovideo.jp/thumb_community/" + community_id;

				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

				// 開放イベントを発行
				function dispatchEventRelease(e){
					event_dispatcher.dispatchEvent("release",null);
				}

				// インラインフレームを破棄
				function releaseIframe(e){
					// アドレスの登録を外す
					if(thumbnail_community_url){
						address_collection.removeAddress("video",thumbnail_community_url);
						thumbnail_community_url = null;
					}

					// イベントハンドラを破棄
					if(event_handler){
						event_handler.release();
						event_handler = null;
					}

					// 監視を破棄
					if(observer_remove){
						observer_remove.release();
						observer_remove = null;
					}

					// 解析辞書除外
					if(iframe_analyze_work){
						analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
						iframe_analyze_work = null;
					}

					// インラインフレームを外す
					if(iframe){
						DomNodeRemove(iframe);
						iframe = null;
					}
				}

				// 混在コンテンツの展開が可能か
				if(!(project.checkAllowExpandIframeElement(thumbnail_community_url))){
					releaseIframe();
					complete();
					return;
				}

				// 重複チェック
				if(project.getDisableSameInlineVideo()){
					if(address_collection.hasAddress("video",thumbnail_community_url)){
						thumbnail_community_url = null;
						releaseIframe();
						complete();
						return;
					}
					// アドレスを登録
					address_collection.addAddress("video",thumbnail_community_url);
				}

				// イベントハンドラを作成
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseIframe);

				iframe = DocumentCreateElement('iframe');
				iframe.frameBorder = "0";
				iframe.scrolling = "no";
				// 読み込み開始
				iframe.src = thumbnail_community_url;

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandVideoNicovideoInlineThumbnailCommunity());

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!iframe)	return;
				}
				// コールバック関数を実行
				project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
			})();
		}

		// 生放送サムネイルを展開
		function expand_thumbnail_live(live_id){
			(function(){
				var thumbnail_live_url = "http://live.nicovideo.jp/embed/" + live_id;

				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

				// 開放イベントを発行
				function dispatchEventRelease(e){
					event_dispatcher.dispatchEvent("release",null);
				}

				// インラインフレームを破棄
				function releaseIframe(e){
					// アドレスの登録を外す
					if(thumbnail_live_url){
						address_collection.removeAddress("video",thumbnail_live_url);
						thumbnail_live_url = null;
					}

					// イベントハンドラを破棄
					if(event_handler){
						event_handler.release();
						event_handler = null;
					}

					// 監視を破棄
					if(observer_remove){
						observer_remove.release();
						observer_remove = null;
					}

					// 解析辞書除外
					if(iframe_analyze_work){
						analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
						iframe_analyze_work = null;
					}

					// インラインフレームを外す
					if(iframe){
						DomNodeRemove(iframe);
						iframe = null;
					}
				}

				// 混在コンテンツの展開が可能か
				if(!(project.checkAllowExpandIframeElement(thumbnail_live_url))){
					releaseIframe();
					complete();
					return;
				}

				// 重複チェック
				if(project.getDisableSameInlineVideo()){
					if(address_collection.hasAddress("video",thumbnail_live_url)){
						thumbnail_live_url = null;
						releaseIframe();
						complete();
						return;
					}
					// アドレスを登録
					address_collection.addAddress("video",thumbnail_live_url);
				}

				// イベントハンドラを作成
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseIframe);

				iframe = DocumentCreateElement('iframe');
				iframe.frameBorder = "0";
				iframe.scrolling = "no";
				// 読み込み開始
				iframe.src = thumbnail_live_url;

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandVideoNicovideoInlineThumbnailLive());

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!iframe)	return;
				}
				// コールバック関数を実行
				project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
			})();
		}

		// 静画サムネイルを展開
		function expand_thumbnail_seiga(seiga_id){
			(function(){
				var thumbnail_seiga_url = "http://ext.seiga.nicovideo.jp/thumb/" + seiga_id;

				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

				// 開放イベントを発行
				function dispatchEventRelease(e){
					event_dispatcher.dispatchEvent("release",null);
				}

				// インラインフレームを破棄
				function releaseIframe(e){
					// アドレスの登録を外す
					if(thumbnail_seiga_url){
						address_collection.removeAddress("video",thumbnail_seiga_url);
						thumbnail_seiga_url = null;
					}

					// イベントハンドラを破棄
					if(event_handler){
						event_handler.release();
						event_handler = null;
					}

					// 監視を破棄
					if(observer_remove){
						observer_remove.release();
						observer_remove = null;
					}

					// 解析辞書除外
					if(iframe_analyze_work){
						analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
						iframe_analyze_work = null;
					}

					// インラインフレームを外す
					if(iframe){
						DomNodeRemove(iframe);
						iframe = null;
					}
				}

				// 混在コンテンツの展開が可能か
				if(!(project.checkAllowExpandIframeElement(thumbnail_seiga_url))){
					releaseIframe();
					complete();
					return;
				}

				// 重複チェック
				if(project.getDisableSameInlineVideo()){
					if(address_collection.hasAddress("video",thumbnail_seiga_url)){
						thumbnail_seiga_url = null;
						releaseIframe();
						complete();
						return;
					}
					// アドレスを登録
					address_collection.addAddress("video",thumbnail_seiga_url);
				}

				// イベントハンドラを作成
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseIframe);

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

				iframe = DocumentCreateElement('iframe');
				iframe.frameBorder = "0";
				iframe.scrolling = "no";
				// 読み込み開始
				iframe.src = thumbnail_seiga_url;

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandVideoNicovideoInlineThumbnailSeiga());

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!iframe)	return;
				}
				// コールバック関数を実行
				project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
			})();
		}

		// マイリスト
		if(project.getVisibleThumbnailMylistNicovideo()){
			var allow_list_mylist = [
				"*://*.nicovideo.jp/mylist/*",
				"*://nicovideo.jp/mylist/*",
				"*://nico.ms/mylist/*"
			];
			num = allow_list_mylist.length;
			for(i=0;i<num;i++){
				if(StringUrlMatchAsteriskWord(url,allow_list_mylist[i])){
					var w = "/mylist/";
					var s = url.indexOf(w);
					if(s >= 0){
						s += w.length;
						var e = url.indexOf("?",s);
						var mylist_id;
						if(e >= 0)	mylist_id = url.substring(s,e);
						else		mylist_id = url.substring(s);
						// 数値
						if(mylist_id.match(/([0-9]+$)/i)){
							expand_thumbnail_mylist(RegExp.$1);
							return;
						}
					}
				}
			}
		}

		// ユーザー
		if(project.getVisibleThumbnailUserNicovideo()){
			var allow_list_user = [
				"*://*.nicovideo.jp/user/*",
				"*://nicovideo.jp/user/*",
				"*://*.niconico.com/user/*",
				"*://niconico.com/user/*",
				"*://nico.ms/user/*"
			];
			num = allow_list_user.length;
			for(i=0;i<num;i++){
				if(StringUrlMatchAsteriskWord(url,allow_list_user[i])){
					var w = "/user/";
					var s = url.indexOf(w);
					if(s >= 0){
						s += w.length;
						var e = url.indexOf("?",s);
						var user_id;
						if(e >= 0)	user_id = url.substring(s,e);
						else		user_id = url.substring(s);
						// 数値
						if(user_id.match(/([0-9]+$)/i)){
							expand_thumbnail_user(RegExp.$1);
							return;
						}
					}
				}
			}
		}

		// コミュニティ
		if(project.getVisibleThumbnailCommunityNicovideo()){
			var allow_list_community = [
				"*://*.nicovideo.jp/community/*",
				"*://nicovideo.jp/community/*",
				"*://*.niconico.com/community/*",
				"*://niconico.com/community/*",
				"*://nico.ms/community/*"
			];
			num = allow_list_community.length;
			for(i=0;i<num;i++){
				if(StringUrlMatchAsteriskWord(url,allow_list_community[i])){
					if(url.match(/community\/(co[0-9]+)/i)){
						expand_thumbnail_community(RegExp.$1);
						return;
					}
				}
			}
		}

		// ライブ
		if(project.getVisibleThumbnailLiveNicovideo()){
			var allow_list_live = [
				"*://live.nicovideo.jp/watch/lv*",
				"*://live.niconico.com/watch/lv*",
				"*://nico.ms/lv*"
			];
			num = allow_list_live.length;
			for(i=0;i<num;i++){
				if(StringUrlMatchAsteriskWord(url,allow_list_live[i])){
					if(url.match(/\/(lv[0-9]+)/i)){
						expand_thumbnail_live(RegExp.$1);
						return;
					}
				}
			}

			var allow_list_nsen = [
				"*://live.nicovideo.jp/watch/nsen/*"
			];
			num = allow_list_nsen.length;
			for(i=0;i<num;i++){
				if(StringUrlMatchAsteriskWord(url,allow_list_nsen[i])){
					if(url.match(/(nsen\/.+)/i)){
						expand_thumbnail_live(RegExp.$1);
						return;
					}
				}
			}
		}

		// 静画
		if(project.getVisibleThumbnailSeigaNicovideo()){
			var allow_list_seiga = [
				"*://seiga.nicovideo.jp/watch/mg*",
				"*://nico.ms/mg*"
			];
			num = allow_list_seiga.length;
			for(i=0;i<num;i++){
				if(StringUrlMatchAsteriskWord(url,allow_list_seiga[i])){
					if(url.match(/\/(mg[0-9]+)/i)){
						expand_thumbnail_seiga(RegExp.$1);
						return;
					}
				}
			}
		}

		// nicovideo.jp へのリンク
		var allow_list_video = [
			"(http|https)://.*\\.nicovideo\\.jp/watch/",
			"(http|https)://nicovideo\\.jp/watch/",
			"(http|https)://.*\\.niconico\\.com/watch/",
			"(http|https)://niconico\\.com/watch/",
			"(http|https)://nico\\.ms/.*/",
			"(http|https)://nico\\.ms/"
		];
		num = allow_list_video.length;
		for(i=0;i<num;i++){
			if(url.match(new RegExp(allow_list_video[i],"i"))){
				var language = null;
				var video_id = RegExp.rightContext;

				if(video_id.match(new RegExp("^(.*?)[?#]","i"))){
					video_id = RegExp.$1;
				}

				// アルファベット2文字 + 数値
				if(video_id.match(/([a-z]{2})([0-9]+$)/i)){
					video_id = RegExp.$1 + RegExp.$2;

					// 接尾辞
					switch(RegExp.$1){
					case "im":
					case "mg":
					case "lv":
					case "bk":
					case "nw":
					case "co":
						video_id = null;
						break;
					}
				}

				// nicovideo.jp サブドメイン
				if(url.match(new RegExp("^(http|https)://([a-z]+?)\\.nicovideo\\.jp/","i"))){
					// 対応言語
					switch(RegExp.$2){
					case "de":
					case "es":
					case "tw":
						language = RegExp.$2;
						break;
					}

					switch(RegExp.$2){
					case "live":
					case "news":
					case "seiga":
						video_id = null;
						break;
					}
				}

				if(video_id){
					if(project.getVisibleVideoNicovideo()){
						expand_video(video_id,language);
						return;
					}else if(project.getVisibleThumbnailVideoNicovideo()){
						expand_thumbnail_video(video_id,language);
						return;
					}
				}
			}
		}

		// 完了
		complete();
	}

	// --------------------------------------------------------------------------------
	// インラインビデオ ustream
	// --------------------------------------------------------------------------------
	function ElementExpandInlineVideoUstream(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		// ustream.tv 内では動作禁止
		var deny_list = [
			"*://*.ustream.tv/*"
		];
		var i;
		var num = deny_list.length;
		for(i=0;i<num;i++){
			if(StringUrlMatchAsteriskWord(document.URL,deny_list[i])){
				return;
			}
		}

		(function(){
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var loader = null;
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = null;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;
			var media_player_ui = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// インラインフレームを破棄
			function releaseIframe(e){
				// ローダーを中断
				if(loader){
					loader.onload = null;
					loader.onerror = null;
					loader = null;
				}

				// アドレスの登録を外す
				if(iframe_url){
					address_collection.removeAddress("video",iframe_url);
					iframe_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				if(limitter_element){
					limitter_element.onremove = null;
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// メディアプレイヤー UI を破棄
				if(media_player_ui){
					media_player_ui.release();
					media_player_ui = null;
				}

				// 解析辞書除外
				if(iframe_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
					iframe_analyze_work = null;
				}

				// インラインフレームを外す
				if(iframe){
					DomNodeRemove(iframe);
					iframe = null;
				}
			}

			function initialize(){
				// イベントハンドラを作成
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseIframe);
			}

			// 動画情報を読み込み
			function load_video_info(url){
				initialize();

				// テキストの読み込み
				var loader = new Loader();
				loader.onload = function(str){
					// og:video:secure_url を取得
					if(str.match(/<meta[ ]+?property=\"og:video:secure_url\"[ ]+?content=\"(.*?)\"/i)){
						iframe_url = RegExp.$1;
					}

					if(!iframe_url){
						// og:video:secure_url を取得
						if(str.match(/<meta[ ]+?property=\"og:video\"[ ]+?content=\"(.*?)\"/i)){
							iframe_url = RegExp.$1;
						}
					}

					if(iframe_url){
						var query = StringGetQuery(iframe_url);
						if(query.autoplay === undefined){
							iframe_url = iframe_url + "&autoplay=false";
						}

						var check = false;
						if(iframe_url.indexOf("/recorded/") >= 0){
							if(project.getVisibleVideoRecordUstream()){
								expand_video(false);
								check = true;
							}
						}else{
							if(project.getVisibleVideoLiveUstream()){
								expand_video(true);
								check = true;
							}
						}

						if(!check){
							releaseIframe();
						}
					}
				};

				loader.onerror = function(){
					complete();
				};
				loader.setMethod("GET");
				loader.setURL(url);
				loader.loadText();
			}

			// 録画動画を展開
			function expand_video_record(video_id){
				if(project.getVisibleVideoRecordUstream()){
					initialize();
					iframe_url = "https://www.ustream.tv/embed/recorded/" + video_id;
					expand_video(false);
				}
			}

			// 動画を展開
			function expand_video(live){

				// 混在コンテンツの展開が可能か
				if(!(project.checkAllowExpandIframeElement(iframe_url))){
					releaseIframe();
					complete();
					return;
				}

				// 重複チェック
				if(project.getDisableSameInlineVideo()){
					if(address_collection.hasAddress("video",iframe_url)){
						iframe_url = null;
						releaseIframe();
						complete();
						return;
					}
					// アドレスを登録
					address_collection.addAddress("video",iframe_url);
				}

				iframe = DocumentCreateElement('iframe');
				iframe.frameBorder = "0";
				iframe.scrolling = "no";
				iframe.allowFullscreen = true;

				// スタイルをセット
				if(live){
					ElementSetStyle(iframe,project.getStyleSheetExpandVideoUstreamInlineVideoLive());
				}else{
					ElementSetStyle(iframe,project.getStyleSheetExpandVideoUstreamInlineVideoRecord());
				}

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(dispatchEventRelease);

				// メディアプレイヤー UI
				media_player_ui = new MediaPlayerExtendUI(iframe);
				var event_handler_close = media_player_ui.createEventHandler("close");
				event_handler_close.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!iframe)	return;

					limitter_element = element_limitter_video.createElement();
					limitter_element.onattach = function(){
						iframe.src = iframe_url;
					};
					limitter_element.onremove = function(){
						iframe.src = "";
					};
					limitter_element.setElementHitArea(iframe);

					// 更新
					limitter_element.update();
				}

				// コールバック関数を実行
				project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
			}

			// 録画ビデオ用
			if(project.getVisibleVideoRecordUstream()){
				var allow_list_video = [
					"*://*.ustream.tv/recorded/*"
				];
				num = allow_list_video.length;
				for(i=0;i<num;i++){
					if(StringUrlMatchAsteriskWord(url,allow_list_video[i])){
						if(url.match("/recorded/([0-9]+?)([?]|[/]|[#]|$)","i")){
							expand_video_record(RegExp.$1);
							return;
						}
					}
				}
			}

			// ustream.tv へのリンク
			if(
				project.getVisibleVideoLiveUstream() ||
				project.getVisibleVideoRecordUstream()
			){
				var allow_list_live = [
					"*://ustre.am/*",
					"*://*.ustream.tv/*"
				];
				num = allow_list_live.length;
				for(i=0;i<num;i++){
					if(StringUrlMatchAsteriskWord(url,allow_list_live[i])){
						load_video_info(url);
						return;
					}
				}
			}

			// 完了
			complete();
		})();
	}

	// --------------------------------------------------------------------------------
	// インラインビデオ dailymotion
	// --------------------------------------------------------------------------------
	function ElementExpandInlineVideoDailymotion(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		// www.dailymotion.com 内では動作禁止
		var deny_list = [
			"*//www.dailymotion.com/*"
		];
		var i;
		var num = deny_list.length;
		for(i=0;i<num;i++){
			if(StringUrlMatchAsteriskWord(document.URL,deny_list[i])){
				return;
			}
		}

		// 動画を展開
		function expand_video(url){
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;
			var media_player_ui = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// インラインフレームを破棄
			function releaseIframe(e){
				// アドレスの登録を外す
				if(iframe_url){
					address_collection.removeAddress("video",iframe_url);
					iframe_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				if(limitter_element){
					limitter_element.onremove = null;
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// メディアプレイヤー UI を破棄
				if(media_player_ui){
					media_player_ui.release();
					media_player_ui = null;
				}

				// 解析辞書除外
				if(iframe_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
					iframe_analyze_work = null;
				}

				// インラインフレームを外す
				if(iframe){
					DomNodeRemove(iframe);
					iframe = null;
				}
			}

			// 混在コンテンツの展開が可能か
			if(!(project.checkAllowExpandIframeElement(iframe_url))){
				releaseIframe();
				complete();
				return;
			}

			// 重複チェック
			if(project.getDisableSameInlineVideo()){
				if(address_collection.hasAddress("video",iframe_url)){
					iframe_url = null;
					releaseIframe();
					complete();
					return;
				}
				// アドレスを登録
				address_collection.addAddress("video",iframe_url);
			}

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseIframe);

			iframe = DocumentCreateElement('iframe');
			iframe.frameBorder = "0";
			iframe.scrolling = "no";
			iframe.allowFullscreen = true;

			// スタイルをセット
			ElementSetStyle(iframe,project.getStyleSheetExpandVideoDailymotionInlineVideo());

			// 解析ワーク作成
			iframe_analyze_work = AnalyzeWorkCreate(iframe);

			// 解析辞書登録オプション
			var attach_options = new AnalyzeWorkDictionaryAttachOptions();
			attach_options.SetOutsider();

			// 解析辞書登録
			analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

			// インラインフレームのリムーブ監視
			observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
			observer_remove.setFunction(dispatchEventRelease);

			// メディアプレイヤー UI
			media_player_ui = new MediaPlayerExtendUI(iframe);
			var event_handler_close = media_player_ui.createEventHandler("close");
			event_handler_close.setFunction(dispatchEventRelease);

			function responseInsert(){
				if(!iframe)	return;

				limitter_element = element_limitter_video.createElement();
				limitter_element.onattach = function(){
					iframe.src = iframe_url;
				};
				limitter_element.onremove = function(){
					iframe.src = "";
				};
				limitter_element.setElementHitArea(iframe);

				// 更新
				limitter_element.update();
			}

			// コールバック関数を実行
			project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
		}

		if(project.getVisibleVideoDailymotion()){
			var allow_list = [
				"*//www.dailymotion.com/video/*",
				"*//touch.dailymotion.com/video/*"
			];
			num = allow_list.length;
			for(i=0;i<num;i++){
				if(StringUrlMatchAsteriskWord(url,allow_list[i])){
					var w = "/video/";
					var s = url.indexOf(w);
					if(s >= 0){
						s += w.length;
						var e = url.indexOf("_",s);
						var video_id;
						if(e >= 0)	video_id = url.substring(s,e);
						else		video_id = url.substring(s);
						if(video_id){
							var protocol = project.getSecureCurrent() ? "https" : "http";
							expand_video(protocol + "://www.dailymotion.com/embed/video/" + video_id);
							return;
						}
					}
				}
			}
		}

		// 完了
		complete();
	}

	// --------------------------------------------------------------------------------
	// インラインビデオ vimeo
	// --------------------------------------------------------------------------------
	function ElementExpandInlineVideoVimeo(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		// vimeo.com 内では動作禁止
		var deny_list = [
			"*//vimeo.com/*"
		];
		var i;
		var num = deny_list.length;
		for(i=0;i<num;i++){
			if(StringUrlMatchAsteriskWord(document.URL,deny_list[i])){
				return;
			}
		}

		// 動画を展開
		function expand_video(url){

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;
			var media_player_ui = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// インラインフレームを破棄
			function releaseIframe(e){
				// アドレスの登録を外す
				if(iframe_url){
					address_collection.removeAddress("video",iframe_url);
					iframe_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				if(limitter_element){
					limitter_element.onremove = null;
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// メディアプレイヤー UI を破棄
				if(media_player_ui){
					media_player_ui.release();
					media_player_ui = null;
				}

				// 解析辞書除外
				if(iframe_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
					iframe_analyze_work = null;
				}

				// インラインフレームを外す
				if(iframe){
					DomNodeRemove(iframe);
					iframe = null;
				}
			}

			// 混在コンテンツの展開が可能か
			if(!(project.checkAllowExpandIframeElement(iframe_url))){
				releaseIframe();
				complete();
				return;
			}

			// 重複チェック
			if(project.getDisableSameInlineVideo()){
				if(address_collection.hasAddress("video",iframe_url)){
					iframe_url = null;
					releaseIframe();
					complete();
					return;
				}
				// アドレスを登録
				address_collection.addAddress("video",iframe_url);
			}

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseIframe);

			iframe = DocumentCreateElement('iframe');
			iframe.frameBorder = "0";
			iframe.scrolling = "no";
			iframe.allowFullscreen = true;

			// スタイルをセット
			ElementSetStyle(iframe,project.getStyleSheetExpandVideoVimeoInlineVideo());

			// 解析ワーク作成
			iframe_analyze_work = AnalyzeWorkCreate(iframe);

			// 解析辞書登録オプション
			var attach_options = new AnalyzeWorkDictionaryAttachOptions();
			attach_options.SetOutsider();

			// 解析辞書登録
			analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

			// インラインフレームのリムーブ監視
			observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
			observer_remove.setFunction(dispatchEventRelease);

			// メディアプレイヤー UI
			media_player_ui = new MediaPlayerExtendUI(iframe);
			var event_handler_close = media_player_ui.createEventHandler("close");
			event_handler_close.setFunction(dispatchEventRelease);

			function responseInsert(){
				if(!iframe)	return;

				limitter_element = element_limitter_video.createElement();
				limitter_element.onattach = function(){
					iframe.src = iframe_url;
				};
				limitter_element.onremove = function(){
					iframe.src = "";
				};
				limitter_element.setElementHitArea(iframe);

				// 更新
				limitter_element.update();
			}

			// コールバック関数を実行
			project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
		}

		if(project.getVisibleVideoVimeo()){
			var allow_list = [
				"*//vimeo.com/*"
			];
			num = allow_list.length;
			for(i=0;i<num;i++){
				if(StringUrlMatchAsteriskWord(url,allow_list[i])){
					var w = "://vimeo.com/";
					var s = url.indexOf(w);
					if(s >= 0){
						s += w.length;
						var e = url.indexOf("?",s);
						var video_id;
						if(e >= 0)	video_id = url.substring(s,e);
						else		video_id = url.substring(s);
						if(video_id){
							// すべて数値
							if(video_id.match(/^[0-9]+$/)){
								expand_video("https://player.vimeo.com/video/" + video_id);
								return;
							}
						}
					}
				}
			}
		}

		// 完了
		complete();
	}

	// --------------------------------------------------------------------------------
	// インラインビデオ fc2video
	// --------------------------------------------------------------------------------
	function ElementExpandInlineVideoFc2video(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		// アンセキュアチェック
		if(!project.checkAllowUnsecure(url)){
			complete();
			return;
		}

		// video.fc2.com 内では動作禁止
		var deny_list = [
			"*://video.fc2.com/*"
		];
		var i;
		var num = deny_list.length;
		for(i=0;i<num;i++){
			if(StringUrlMatchAsteriskWord(document.URL,deny_list[i])){
				return;
			}
		}

		// 動画を展開
		function expand_video(url){
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var video = null;
			var video_analyze_work = null;
			var video_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;
			var media_player_ui = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// インラインフレームを破棄
			function releaseElement(e){
				// アドレスの登録を外す
				if(video_url){
					address_collection.removeAddress("video",video_url);
					video_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				if(limitter_element){
					limitter_element.onremove = null;
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// メディアプレイヤー UI を破棄
				if(media_player_ui){
					media_player_ui.release();
					media_player_ui = null;
				}

				// 解析辞書除外
				if(video_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(video_analyze_work);
					video_analyze_work = null;
				}

				// インラインフレームを外す
				if(video){
					DomNodeRemove(video);
					video = null;
				}
			}

			// 混在コンテンツの展開が可能か
			if(!(project.checkAllowExpandEmbedElement(video_url))){
				releaseElement();
				complete();
				return;
			}

			// 重複チェック
			if(project.getDisableSameInlineVideo()){
				if(address_collection.hasAddress("video",video_url)){
					video_url = null;
					releaseElement();
					complete();
					return;
				}
				// アドレスを登録
				address_collection.addAddress("video",video_url);
			}

			var embed;
			video = DocumentCreateElement('div');

			// スタイルをセット
			ElementSetStyle(video,project.getStyleSheetExpandVideoFc2videoInlineVideo());

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseElement);

			// 解析ワーク作成
			video_analyze_work = AnalyzeWorkCreate(video);

			// 解析辞書登録オプション
			var attach_options = new AnalyzeWorkDictionaryAttachOptions();
			attach_options.SetOutsider();

			// 解析辞書登録
			analyze_work_dictionary.attachAnalyzeWork(video_analyze_work,attach_options);

			// インラインフレームのリムーブ監視
			observer_remove = new DomNodeObserverRemoveFromDocument(video);
			observer_remove.setFunction(dispatchEventRelease);

			// メディアプレイヤー UI
			media_player_ui = new MediaPlayerExtendUI(video);
			var event_handler_close = media_player_ui.createEventHandler("close");
			event_handler_close.setFunction(dispatchEventRelease);

			function responseInsert(){
				if(!video)	return;

				limitter_element = element_limitter_video.createElement();
				limitter_element.onattach = function(){
					if(!embed){
						embed = DocumentCreateElement('embed');
						embed.type = "application/x-shockwave-flash";
						embed.width = "100%";
						embed.height = "100%";
						embed.setAttribute("bgcolor","#ffffff");
						embed.setAttribute("quality","high");
						embed.setAttribute("wmode","transparent");
						embed.setAttribute("align","middle");
						embed.setAttribute("allowScriptAccess","sameDomain");
						embed.setAttribute("pluginspage","http://www.macromedia.com/go/getflashplayer");
						embed.setAttribute("allowFullScreen","true");
						embed.src = video_url;
						video.appendChild(embed);
					}
				};
				limitter_element.onremove = function(){
					if(embed){
						DomNodeRemove(embed);
						embed = null;
					}
				};
				limitter_element.setElementHitArea(video);

				// 更新
				limitter_element.update();
			}

			// コールバック関数を実行
			project.executeScriptInsertInlineVideo(element,video,work.event_dispatcher,responseInsert);
		}

		if(project.getVisibleVideoFc2video()){
			var allow_list = [
				"*://video.fc2.com/content/*",
				"*://video.fc2.com/*/content/*"
			];
			num = allow_list.length;
			for(i=0;i<num;i++){
				if(StringUrlMatchAsteriskWord(url,allow_list[i])){
					var w = "/content/";
					var s = url.indexOf(w);
					if(s >= 0){
						s += w.length;
						var m = url.substring(s).match(/^[0-9a-z]+/i);
						if(m){
							var video_id = m[0];
							expand_video("http://video.fc2.com/flv2.swf?i=" + video_id);
							return;
						}
					}
				}
			}
		}

		// 完了
		complete();
	}

	// --------------------------------------------------------------------------------
	// インラインビデオ liveleak
	// --------------------------------------------------------------------------------
	function ElementExpandInlineVideoLiveleak(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		// アンセキュアチェック
		if(!project.checkAllowUnsecure(url)){
			complete();
			return;
		}

		// liveleak.com 内では動作禁止
		var deny_list = [
			"*://liveleak.com/*",
			"*://*.liveleak.com/*"
		];
		var i;
		var num = deny_list.length;
		for(i=0;i<num;i++){
			if(StringUrlMatchAsteriskWord(document.URL,deny_list[i])){
				return;
			}
		}

		// 動画を展開
		function expand_video(video_id,language){

			// 展開処理の完了
			function expand_video_complete(){
			}

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var loader = null;
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = null;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;
			var media_player_ui = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// インラインフレームを破棄
			function releaseIframe(e){
				// ローダーを中断
				if(loader){
					loader.onload = null;
					loader.onerror = null;
					loader = null;
				}

				// アドレスの登録を外す
				if(iframe_url){
					address_collection.removeAddress("video",iframe_url);
					iframe_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				if(limitter_element){
					limitter_element.onremove = null;
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// メディアプレイヤー UI を破棄
				if(media_player_ui){
					media_player_ui.release();
					media_player_ui = null;
				}

				// 解析辞書除外
				if(iframe_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
					iframe_analyze_work = null;
				}

				// インラインフレームを外す
				if(iframe){
					DomNodeRemove(iframe);
					iframe = null;
				}
			}

			// テキストの読み込み
			loader = new Loader();
			loader.onload = function(str){

				// video_id 抽出
				if(str.match(new RegExp(".*generate_embed_code_generator_html[(][\'\"]([0-9a-z_]+)[\'\"][)].*","i"))){
					iframe_url = "http://www.liveleak.com/ll_embed?f=" + RegExp.$1;
				}

				// アドレス取得失敗
				if(!iframe_url){
					expand_video_complete();
					releaseIframe();
					return;
				}

				// 混在コンテンツの展開が可能か
				if(!(project.checkAllowExpandIframeElement(iframe_url))){
					releaseIframe();
					complete();
					return;
				}

				// 重複チェック
				if(project.getDisableSameInlineVideo()){
					if(address_collection.hasAddress("video",iframe_url)){
						iframe_url = null;
						releaseIframe();
						complete();
						return;
					}
					// アドレスを登録
					address_collection.addAddress("video",iframe_url);
				}

				// インラインフレームを作成
				iframe = DocumentCreateElement('iframe');
				iframe.frameBorder = "0";
				iframe.scrolling = "no";
				iframe.allowFullscreen = true;

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandVideoLiveleakInlineVideo());

				// イベントハンドラを作成
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseIframe);

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(dispatchEventRelease);

				// メディアプレイヤー UI
				media_player_ui = new MediaPlayerExtendUI(iframe);
				var event_handler_close = media_player_ui.createEventHandler("close");
				event_handler_close.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!iframe)	return;

					limitter_element = element_limitter_video.createElement();
					limitter_element.onattach = function(){
						iframe.src = iframe_url;
					};
					limitter_element.onremove = function(){
						iframe.src = "";
					};
					limitter_element.setElementHitArea(iframe);

					// 更新
					limitter_element.update();
				}

				// コールバック関数を実行
				project.executeScriptInsertInlineVideo(element,iframe,work.event_dispatcher,responseInsert);
			};

			// ロードエラー
			loader.onerror = function(){
				expand_video_complete();
				complete();
			};

			loader.setMethod("GET");
			loader.setURL(url);
			loader.loadText();
		}

		if(project.getVisibleVideoLiveleak()){

			// www.liveleak.com へのリンク
			var allow_list_video = [
				"(http|https)://www\\.liveleak\\.com/view[?].*(i=[a-z0-9_]).*",
				"(http|https)://.*?\\.liveleak\\.com/.*/view[?].*(i=[a-z0-9_]).*"
			];
			num = allow_list_video.length;
			for(i=0;i<num;i++){
				if(url.match(new RegExp(allow_list_video[i],"i"))){
					expand_video(url);
				}
			}
		}

		// 完了
		complete();
	}

	// --------------------------------------------------------------------------------
	// インラインフレームの展開
	// --------------------------------------------------------------------------------
	function ElementExpandInlineIframe(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);
		var url = AnalyzeWorkGetExpandUrl(work);
		var content_type = AnalyzeWorkGetContentType(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		function complete(){
		}

		function response_allow(param){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(!(param.result)){
				complete();
				return;
			}

			// アンセキュアチェック
			if(!project.checkAllowUnsecure(url)){
				complete();
				return;
			}

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			var loader = null;
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = url;
			var event_handler = null;
			var observer_remove = null;

			// 開放イベントを発行
			function dispatchEventRelease(e){
				event_dispatcher.dispatchEvent("release",null);
			}

			// インラインフレームを破棄
			function releaseIframe(e){
				// ローダーを中断
				if(loader){
					loader.onload = null;
					loader.onerror = null;
					loader = null;
				}

				// アドレスの登録を外す
				if(iframe_url){
					address_collection.removeAddress("iframe",iframe_url);
					iframe_url = null;
				}

				// イベントハンドラを破棄
				if(event_handler){
					event_handler.release();
					event_handler = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// 解析辞書除外
				if(iframe_analyze_work){
					analyze_work_dictionary.removeAnalyzeWork(iframe_analyze_work);
					iframe_analyze_work = null;
				}

				// インラインフレームを外す
				if(iframe){
					DomNodeRemove(iframe);
					iframe = null;
				}
			}

			// 混在コンテンツの展開が可能か
			if(!(project.checkAllowExpandIframeElement(iframe_url))){
				releaseIframe();
				complete();
				return;
			}

			// 重複チェック
			if(project.getDisableSameInlineIframe()){
				if(address_collection.hasAddress("iframe",iframe_url)){
					iframe_url = null;
					releaseIframe();
					complete();
					return;
				}
				// アドレスを登録
				address_collection.addAddress("iframe",iframe_url);
			}

			// イベントハンドラを作成
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseIframe);

			// テキストの読み込み
			loader = new Loader();
			loader.onload = function(str){
				complete();

				// インラインフレームを生成
				iframe = DocumentCreateElement("iframe");
				iframe.frameBorder = "0";
				iframe.src = iframe_url;

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandIframeInline());

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);

				// 解析辞書登録オプション
				var attach_options = new AnalyzeWorkDictionaryAttachOptions();
				attach_options.SetOutsider();

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,attach_options);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(dispatchEventRelease);

				function responseInsert(){
					if(!iframe)	return;
				}

				// コールバック関数を実行
				project.executeScriptInsertInlineIframe(element,iframe,work.event_dispatcher,responseInsert);
			};

			loader.onerror = function(){
				complete();
			};
			loader.setMethod("GET");
			loader.setURL(iframe_url);
			loader.loadText();
		}

		// コールバック関数を実行
		project.executeScriptAllowInlineIframe(element,url,content_type,response_allow);
	}

	// --------------------------------------------------------------------------------
	// インラインフレーム内コンテンツの展開
	// --------------------------------------------------------------------------------
	function ElementExpandIframeContent(param){
		var work = param.work;
		var modify = param.modify;
		var element = AnalyzeWorkGetDomNode(work);

		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var event_dispatcher;
		var event_handler;
		var observer_modify_element;
		var timer;
		var expanded = false;

		// 破棄
		function releaseIframeContent(){

			removeEvent();

			// アドレス変更監視を破棄
			if(observer_modify_element){
				observer_modify_element.release();
				observer_modify_element = null;
			}

		}

		// イベントを除外
		function removeEvent(){
			if(timer){
				timer.release();
				timer = null;
			}
			try{
				var window_obj = element.contentWindow;
				if(window_obj.removeEventListener){
					window_obj.removeEventListener("unload",unload);
				}else if(window_obj.detachEvent){
					window_obj.detachEvent("onunload",unload);
				}
			}catch(e){
			}
		}

		// アンロード
		function unload(){
			expanded = false;
			start();
		}

		// スタート
		function start(){
			if(expanded) return;

			removeEvent();

			timer = new Timer(1,1);
			timer.oncomplete = function(){
				if(expanded) return;

				try{
					var window_obj = element.contentWindow;
					if(WindowIsExecutedByPageExpand(window_obj)){

						// アンロード監視
						if(window_obj.addEventListener){
							window_obj.addEventListener("unload",unload);
						}else if(window_obj.attachEvent){
							window_obj.attachEvent("onunload",unload);
						}

						expanded = true;
						PageExpand({execute_type:page_expand_arguments.execute_type,admin:admin,window:window_obj,page_expand_parent:page_expand_node});
					}
				}catch(e){
				}
			};
			timer.start();
		}

		// 要素を監視
		AnalyzeWorkObserveElement(work);
		event_dispatcher = AnalyzeWorkGetEventDispatcher(work);

		// 開放イベント
		event_handler = event_dispatcher.createEventHandler("release");
		event_handler.setFunction(releaseIframeContent);

		// アドレス変更監視
		observer_modify_element = document_observer_modify_node.createElement();
		observer_modify_element.setElement(element,"src");
		observer_modify_element.setFunction(function (){
			start();
		});

		start();
	}

	// --------------------------------------------------------------------------------
	// 縮小画像のポップアップ
	// --------------------------------------------------------------------------------
	function ElementPopupReducedImage(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);

		// 解析済みチェック
		if(AnalyzeWorkGetAnalyzedPopupReducedImage(work)){
			return;
		}
		AnalyzeWorkSetAnalyzedPopupReducedImage(work);

		var popup_image;
		var event_dispatcher;
		var event_handler;
		var observer_modify_element;
		var released = false;

		// 縮小画像のポップアップを破棄
		function releasePopupReducedImage(){

			// アドレス変更監視を破棄
			if(observer_modify_element){
				observer_modify_element.release();
				observer_modify_element = null;
			}

			// ポップアップイメージを破棄
			if(popup_image){
				popup_image.suicide();
				popup_image = null;
			}

			released = true;
		}

		// 要素を監視
		AnalyzeWorkObserveElement(work);
		event_dispatcher = AnalyzeWorkGetEventDispatcher(work);

		// ポップアップイメージの破棄イベント
		event_handler = event_dispatcher.createEventHandler("release_popup_image");
		event_handler.setFunction(function(){

			// ポップアップイメージを破棄
			if(popup_image){
				popup_image.release();
				popup_image = null;
			}

			releasePopupReducedImage();

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			if(event_dispatcher){
				if(!AnalyzeWorkGetOverrodeAnchorElement(work)){
					event_dispatcher.dispatchEvent("destructor",null);
				}
			}
		});

		// 開放イベント
		event_handler = event_dispatcher.createEventHandler("release");
		event_handler.setFunction(releasePopupReducedImage);

		// アドレス変更監視
		observer_modify_element = document_observer_modify_node.createElement();
		observer_modify_element.setElement(element,"src");
		observer_modify_element.setFunction(function (){

			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			if(event_dispatcher){
				event_dispatcher.dispatchEvent("destructor",null);
			}

			// 再解析
			DomNodeAnalyzePhaseAnalyzeElement(element);
		});

		// 読み込み完了
		ImageGetLoaded(element,function(){

			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;
			if(released) return;

			var allow = true;
			if(allow){
				try{
					// ソースが無い
					if(!(element.src)){
						allow = false;
					}
				}catch(e){
					allow = false;
				}
			}

			if(allow){
				// 画像の縮小率を調べる
				var natural_size = ImageGetNaturalSize(element);

				var scale = project.getScaleLessThenAllowPopupReducedImage();

				if(element.width  > natural_size.width   / 100 * scale)	allow = false;
				if(element.height > natural_size.height  / 100 * scale)	allow = false;
			}

			if(allow){
				// ブラウザで直接画像を閲覧している場合は除外
				if(element.src == document.URL){
					allow = false;
				}
			}

			if(allow){
				(function(){
					var node = element;
					while(node){
						// 解析ワーク取得
						var work = analyze_work_dictionary.getAnalyzeWork(node);
						if(work){
							// 祖先に PopupImage が存在する
							if(AnalyzeWorkGetPopupImage(work)){
								allow = false;
								break;
							}
						}

						node = node.parentNode;
					}
				})();
			}

			if(allow){
				// ポップアップイメージ
				var image = ImageClone(element);

				// ロード完了
				ImageGetLoaded(image,function(){
					if(!AnalyzeWorkEqualModifyCount(work,modify))	return;
					if(released) return;

					popup_image = new PopupImage(image);
					popup_image.setElementParent(document.body);
					popup_image.setElementAnchor(element);
					popup_image.setElementHitArea(element);
					popup_image.setElementBeginArea(element);
					popup_image.setOriginalURL(image.src);
					popup_image.ontrim = function (){
						if(!popup_image) return;

						var trim_check = false;
						var trim_rect = new Object();
						var bounding_rect = ElementGetBoundingClientRect(element);
						var view_rect = ObjectCopy(bounding_rect);

						var overflow_hidden_x = {"hidden":1};
						var overflow_hidden_y = {"hidden":1};
						var display_inline = {"inline":1,"none":1,"table-column":1,"table-column-group":1};
						var node = element;
						while(node){
							var r = ElementGetBoundingClientRect(node);
							if(!r) break;

							if(node.tagName == "BODY") break;

							var style = ElementGetComputedStyle(node,null);
							if(style){
								if(!display_inline[style.display]){
									if(overflow_hidden_x[style.overflowX]){
										if(r.right  < view_rect.right ) view_rect.right  = r.right;
										if(r.left   > view_rect.left  ) view_rect.left   = r.left;
										trim_check = true;
									}
									if(overflow_hidden_y[style.overflowY]){
										if(r.bottom < view_rect.bottom) view_rect.bottom = r.bottom;
										if(r.top    > view_rect.top   ) view_rect.top    = r.top;
										trim_check = true;
									}
								}
							}

							node = node.parentNode;
						}

						if(trim_rect){
							var natural_size = ImageGetNaturalSize(element);
							var computed_style = ElementGetComputedStyle(element,null);
							var boader_rect = ComputedStyleGetBoaderWidth(computed_style);
							var padding_rect = ComputedStyleGetPaddingWidth(computed_style);

							var px = bounding_rect.left + boader_rect.left + padding_rect.left;
							var py = bounding_rect.top  + boader_rect.top  + padding_rect.top;
							var w = (bounding_rect.right  - px) - boader_rect.right  + padding_rect.right;
							var h = (bounding_rect.bottom - py) - boader_rect.bottom + padding_rect.bottom;
							var sx = natural_size.width  / w;
							var sy = natural_size.height / h;

							trim_rect.left   = (view_rect.left   - px) * sx;
							trim_rect.top    = (view_rect.top    - py) * sy;
							trim_rect.right  = (view_rect.right  - px) * sx;
							trim_rect.bottom = (view_rect.bottom - py) * sy;
						}

						if(trim_check){
							popup_image.setTrimRect(trim_rect);
						}
					};
					popup_image.ontrim();
					AnalyzeWorkSetPopupImage(work,popup_image);
				});
			}else{
				// 解放イベント発行
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				if(event_dispatcher){
					event_dispatcher.dispatchEvent("release_popup_image",null);
				}
			}
		});

	}

	// --------------------------------------------------------------------------------
	// 縮小画像のポップアップを全て破棄
	// --------------------------------------------------------------------------------
	function PopupReducedImageReleaseAll(element){

		// 子孫抽出
		function analyze(node){
			// 解析ワーク取得
			var work = analyze_work_dictionary.getAnalyzeWork(node);
			if(work){
				// 解放イベント発行
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				if(event_dispatcher){
					event_dispatcher.dispatchEvent("release_popup_image",null);
				}
			}
		}

		if(element.nodeType == 1){
			// イメージ
			if(element.tagName == "IMG"){
				analyze(element);
			}

			// 画像をすべて取得
			var nodes = ElementGetElementsByTagName(element,"img");
			var i;
			var num = nodes.length;
			for(i=0;i<num;i++){
				analyze(nodes[i]);
			}
		}
	}

	// --------------------------------------------------------------------------------
	// 掲示板拡張
	// --------------------------------------------------------------------------------
	function ElementExpandBbs(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);

		var completed = false;
		function response(obj){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(completed) return;
			completed = true;

			if(!obj) return;
			if(!(obj.useful)) return;

			var observer_remove;
			var event_handler_release;

			// 解放
			function releaseExpandBbs(){
				// 解析クリア
				AnalyzeWorkClearAnalyzedExpandBbs(work);

				if(event_handler_release){
					event_handler_release.release();
					event_handler_release = null;
				}

				// リムーブ監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
				}

				// 解析辞書除外
				analyze_work_dictionary.removeAnalyzeWork(work);
			}

			// リムーブ監視
			observer_remove = new DomNodeObserverRemoveFromDocument(element);
			observer_remove.setFunction(releaseExpandBbs);

			// 開放イベント
			event_handler_release = page_expand_event_dispatcher.createEventHandler("release");
			event_handler_release.setFunction(releaseExpandBbs);

			// 解析辞書登録
			analyze_work_dictionary.attachAnalyzeWork(work);
		}

		// 解析済みチェック
		if(AnalyzeWorkGetAnalyzedExpandBbs(work)){
			return;
		}
		AnalyzeWorkSetAnalyzedExpandBbs(work);

		// コールバック関数を実行
		project.executeScriptCallbackExpandBbs(element,response);
	}


	// --------------------------------------------------------------------------------
	// 初期化
	// --------------------------------------------------------------------------------
	switch(page_expand_arguments.execute_type){

	// --------------------------------------------------------------------------------
	// Opera のコンテンツスクリプトとして動作
	// --------------------------------------------------------------------------------
	case "OperaExtensionContentScript":

		// 実行除外
		if(page_expand_arguments.page_expand_parent){
		}else{
			if(WindowIsExecutedByPageExpand(window)) return;
		}

		// PageExpand 初期化
		PageExpandInitialize();

		// Opera拡張機能通信
		extension_message = new OperaExtensionMessageForContent();

		// コマンドキュー
		var command_queue = new Array();

		// 受信コールバック
		var response_listener = null;
		response_listener = function(request, sender, sendResponse){
			command_queue.push({
				request:request,
				sender:sender,
				sendResponse:sendResponse
			});
		};

		// --------------------------------------------------------------------------------
		// バックグラウンドとの通信
		// --------------------------------------------------------------------------------
		extension_message.addListener(function(request, sender, sendResponse) {
			if(response_listener){
				response_listener(request, sender, sendResponse);
			}
		});

		// --------------------------------------------------------------------------------
		// バックグラウンドへプロジェクト取得の要求
		// --------------------------------------------------------------------------------
		extension_message.sendRequest({command:"getProject",url:WindowGetOwnerURL(window)}, function(response) {

			// JSON 文字列からプロジェクトを作成
			project = new Project();
			project.importJSON(response);

			// 実行可能
			if(project.getEnable()){

				// PageExpand コンストラクタ
				PageExpandConstructor();

				// 受信コールバック
				response_listener = function(request, sender, sendResponse){
					var param = request;

					switch(param.command){
					case "startPageExpand":
						PageExpandStart();
						break;

					case "abortPageExpand":
						PageExpandRelease();
						break;

					case "executeFastest":
						PageExpandExecuteFastest();
						break;

					case "executeDebug":
						// デバッグモード
						page_expand_debug.setVisible(true);
						break;

					case "batchDownloadImage":
						if (WindowIsChild(window)){
						}else{
							download_list_image.createArchive();
						}
						break;

					case "batchDownloadUser":
						if (WindowIsChild(window)){
						}else{
							download_list_user.createArchive();
						}
						break;

					// 未知の要求
					default:
						break;
					};
				};

				if((page_expand_arguments.page_expand_parent) || project.getEnableStartup()){
					// 実行開始
					PageExpandStart();
				}

				// コマンドキューを実行
				(function(){
					var i;
					var num = command_queue.length;
					for(i=0;i<num;i++){
						var queue = command_queue[i];
						response_listener(queue.request,queue.sender,queue.sendResponse);
					}
					command_queue = null;
				})();

			}else{
				response_listener = null;
				PageExpandRelease();
			}
		});
		break;

	};

}
