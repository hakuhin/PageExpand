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
	// PageExpand 実行開始
	// --------------------------------------------------------------------------------
	function PageExpandStart(){

		if(started)	return;
		started = true;

		// --------------------------------------------------------------------------------
		// 設定
		// --------------------------------------------------------------------------------
		loader_queue.setMaxThread(project.getLoadThreadMax());
		element_limitter_image.setEnableUnload(project.getEnableUnloadExpandImage());
		element_limitter_image.setByteSizeMax(project.getSizeMoreThenAllowUnloadExpandImage());
		element_limitter_sound.setMaxUse(project.getSoundMaxInlineSound());
		element_limitter_video.setMaxUse(project.getVideoMaxInlineVideo());
		execute_queue.setOccupancyTime(project.getExecuteQueueOccupancyTime());
		execute_queue.setSleepTime(project.getExecuteQueueSleepTime());

		if(!MutationObserverSupported()){
			(function(){
				// アンカー監視
				var task = task_container.createTask();
				task.setExecuteFunc(function(task){
					anchor_monitor.execute();
				});
			})();
		}

		// --------------------------------------------------------------------------------
		// 更新イベント
		// --------------------------------------------------------------------------------
		{
			// ロード完了時に実行
			function DocumentLoaded(){
				if(project.getEnableDebugMode()){
					// デバッグモード
					page_expand_debug.setVisible(true);
				}

				// 掲示板拡張初期化
				if(project.getEnableExpandBbs()){
					project.initializeScriptCallbackExpandBbs(function(response){
						expand_bbs.enable = response.result;
					});
				}

				if(document.addEventListener){
					if(MutationObserverSupported()){
						var mutation_observer = MutationObserverCreate(function(mutations) {
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
					}else{
						// 動的追加時に発生するイベント
						document.addEventListener('DOMNodeInserted', function(e){
							if(enable_analyze){
								execute_queue.attachLastForInsertDomNode(DomNodeAnalyzeRoot,e.target);
							}
						}, false);
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
			}

			if(document.addEventListener){
				switch(document.readyState){
				case "interactive":
				case "complete":
					// すでに DOM 構築が完了しているので初回実行
					DocumentLoaded();
					break;
				default:
					// DOM 構築完了時に発生するイベント
					document.addEventListener("DOMContentLoaded", function(e){
						DocumentLoaded();
					}, false);
					break;
				}
			}else{

				(function(){
					// DOM 構築完了チェック
					var task = task_container.createTask();
					task.setExecuteFunc(function(task){
						switch(document.readyState){
						case "interactive":
						case "complete":
							DocumentLoaded();
							task.release();
							return;
						}
					});
				})();

			}
		}

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

		if(!AnalyzeWorkGetInitializedAnchorElement(work)){

			// --------------------------------------------------------------------------------
			// アンカー
			// --------------------------------------------------------------------------------
			var tag_name = node.tagName.toUpperCase();
			if(tag_name == "A"){
				// 初期化済み
				AnalyzeWorkSetInitializedAnchorElement(work);

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(work,false);

				// イベントディスパッチャー生成
				AnalyzeWorkSetEventDispatcher(work,new EventDispatcher());

				// リムーブ監視
				var observer_remove = new DomNodeObserverRemoveFromDocument(node);
				observer_remove.setFunction(function(){

					// 修正カウンタ加算
					AnalyzeWorkAddModifyCount(work);

					var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
					if(event_dispatcher){
						// イベント発火
						event_dispatcher.dispatchEvent("release",null);
						event_dispatcher.removeAll();
						AnalyzeWorkClearEventDispatcher(work);
					}

					// アンカー監視を破棄
					if(monitor_element){
						monitor_element.release();
						monitor_element = null;
						AnalyzeWorkClearAnchorMonitorElement(work);
					}

					// リムーブ監視を破棄
					if(observer_remove){
						observer_remove.release();
						observer_remove = null;
					}

					// 解析辞書除外
					analyze_work_dictionary.removeAnalyzeWork(work);

				});

				// アンカー監視
				var monitor_element = anchor_monitor.createElement();
				AnalyzeWorkSetAnchorMonitorElement(work,monitor_element);
				monitor_element.setAnchorElement(node);
				monitor_element.setFunction(function (){

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

				// アンカー要素を登録
				AnalyzeWorkSetAnchorElement(work,node);
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
		// 掲示板解析
		// --------------------------------------------------------------------------------
		if(project.getEnableExpandBbs()){
			if(expand_bbs.enable){
				execute_queue.attachForExpandBbs(ElementAnalyzeBbs,param);
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
		var tag_name = anchor.tagName.toUpperCase();
		if(tag_name != "A")	return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		var node = element;
		while(node){
			if(node.tagName){
				var name = node.tagName.toLowerCase();
				// 実行対象外のタグ
				if(name == "head")	return;
				if(name == "script")	return;
				if(name == "style")	return;
			}
			node = node.parentNode;
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

				// 実行キューに登録
				execute_queue.attachForExpandElement(ElementExpandThumbnailImage,param);
			}

			// 解析済みチェック
			if(!AnalyzeWorkGetAnalyzedExpandPopupImage(work)){
				AnalyzeWorkSetAnalyzedExpandPopupImage(work);

				// 実行キューに登録
				execute_queue.attachForExpandElement(ElementExpandPopupImage,param);
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
	// エレメントの解析（アドレスコレクション）
	// --------------------------------------------------------------------------------
	function ElementAnalyzeAddressCollection(param){
		var work = param.work;
		var modify = param.modify;
		if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

		var element = AnalyzeWorkGetDomNode(work);
		var tag_name = element.tagName;

		// --------------------------------------------------------------------------------
		// イメージのアドレスを調べる
		// --------------------------------------------------------------------------------
		if(project.getDisableSameThumbnailImage()){
			if(tag_name == "IMG"){
				if(element.src){
					address_collection.addAddress("image",element.src);
				}
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

		// document に未登録
		if(!DomNodeGetAttachedDocument(text_node))	return;

		var node = text_node;
		while(node){
			if(node.tagName){
				var name = node.tagName.toLowerCase();
				// 実行対象外のタグ
				if(name == "script")	return;
				if(name == "style")	return;
			}
			node = node.parentNode;
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
		var tag_name = anchor.tagName.toUpperCase();
		if(tag_name != "A")	return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		var node = element;
		while(node){
			if(node.tagName){
				var name = node.tagName.toLowerCase();
				// 実行対象外のタグ
				if(name == "head")	return;
				if(name == "script")	return;
				if(name == "style")	return;
			}
			node = node.parentNode;
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
		var tag_name = anchor.tagName.toUpperCase();
		if(tag_name != "A")	return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		var node = element;
		while(node){
			if(node.tagName){
				var name = node.tagName.toLowerCase();
				// 実行対象外のタグ
				if(name == "head")	return;
				if(name == "script")	return;
				if(name == "style")	return;
			}
			node = node.parentNode;
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

		// document に未登録
		if(!DomNodeGetAttachedDocument(text_node))	return;

		var node = text_node;
		while(node){
			if(node.tagName){
				var name = node.tagName.toLowerCase();
				// 実行対象外のタグ
				if(name == "head")	return;
				if(name == "script")	return;
				if(name == "style")	return;
				if(name == "a")		return;
				if(name == "textarea")	return;
			}
			node = node.parentNode;
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
		var tag_name = anchor.tagName.toUpperCase();
		if(tag_name != "A")	return;

		// document に未登録
		if(!DomNodeGetAttachedDocument(element))	return;

		var node = element;
		while(node){
			if(node.tagName){
				var name = node.tagName.toLowerCase();
				// 実行対象外のタグ
				if(name == "head")	return;
				if(name == "script")	return;
				if(name == "style")	return;
			}
			node = node.parentNode;
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
		var tag_name = element.tagName.toUpperCase();
		if(tag_name != "IMG")	return;

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

		var node = dom_node;
		while(node){
			if(node.tagName){
				var name = node.tagName.toLowerCase();
				// 実行対象外のタグ
				if(name == "head")	return;
				if(name == "script")	return;
				if(name == "style")	return;
			}
			node = node.parentNode;
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
				}

				// --------------------------------------------------------------------------------
				// アンカー用の初期化
				// --------------------------------------------------------------------------------
				if(!AnalyzeWorkGetInitializedAnchorElement(work)){

					// 初期化済み
					AnalyzeWorkSetInitializedAnchorElement(work);

					// 解析辞書登録
					analyze_work_dictionary.attachAnalyzeWork(work,false);

					// イベントディスパッチャー生成
					AnalyzeWorkSetEventDispatcher(work,new EventDispatcher());

					// リムーブ監視
					var observer_remove = new DomNodeObserverRemoveFromDocument(element);
					observer_remove.setFunction(function(){

						// 修正カウンタ加算
						AnalyzeWorkAddModifyCount(work);

						var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
						if(event_dispatcher){
							// イベント発火
							event_dispatcher.dispatchEvent("release",null);
							event_dispatcher.removeAll();
							AnalyzeWorkClearEventDispatcher(work);
						}

						// リムーブ監視を破棄
						if(observer_remove){
							observer_remove.release();
							observer_remove = null;
						}

						// 解析辞書除外
						analyze_work_dictionary.removeAnalyzeWork(work);

					});

				}
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
		project.executeScriptReplacementToElement(element,response);
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
		function response(obj){
			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

			if(completed)	return;
			completed = true;

			//リンクの変更をアンカーに反映する
			if(replacement_to_link.getEnableReflectToAnchor()){
				if(obj.result){
					var monitor_element = AnalyzeWorkGetAnchorMonitorElement(work);
					if(monitor_element){
						monitor_element.setBaseUrl(obj.url);
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

				var monitor_element = AnalyzeWorkGetAnchorMonitorElement(work);
				if(monitor_element){
					monitor_element.setBaseUrl(v);
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

			var loader = null;
			var text_area = null;
			var text_area_analyze_work = null;
			var text_url = url;
			var event_handler = null;
			var observer_remove = null;

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
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
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
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(text_area_analyze_work,true);

				// テキストエリアのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(text_area);
				observer_remove.setFunction(releaseTextarea);

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

			// アンセキュアチェック
			if(!project.checkAllowUnsecure(url)){
				complete();
				return;
			}

			var loader = null;
			var popup_image = null;
			var thumbnail_image = null;
			var thumbnail_analyze_work = null;
			var thumbnail_url = url;
			var event_handler = null;
			var observer_remove = null;
			var limitter_element = null;
			var notify_element = null;

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
					popup_image.release();
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
					// 解析辞書登録
					analyze_work_dictionary.attachAnalyzeWork(thumbnail_analyze_work,true);

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

								// ポップアップイメージ
								popup_image = new PopupImage(image_clone);
								popup_image.setElementParent(document.body);
								popup_image.setElementHitArea(thumbnail_image);
								popup_image.setElementBeginArea(thumbnail_image);
								AnalyzeWorkSetPopupImage(work,popup_image);

							}
						}

						// イメージのリムーブ監視
						observer_remove = new DomNodeObserverRemoveFromDocument(thumbnail_image);
						observer_remove.setFunction(releaseThumbnailImage);

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
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseThumbnailImage);

			// イメージ管理
			limitter_element = element_limitter_image.createElement();
			initializeLimitterElement();

			// 更新
			limitter_element.update();
		}

		// コールバック関数を実行
		project.executeScriptAllowThumbnailImage(element,url,content_type,response_allow);
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

			// アンセキュアチェック
			if(!project.checkAllowUnsecure(url)){
				complete();
				return;
			}

			var loader = null;
			var popup_image = null;
			var begin_area = null;
			var event_handler = null;
			var observer_remove = null;
			var limitter_element = null;
			var notify_element = null;

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
					popup_image.release();
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

					// 画像を１つだけ保有するなら画像を開始矩形とする
					var nodes = ElementGetElementsByTagName(element,"img");
					if(nodes.length == 1){
						begin_area = nodes[0];
					}

					// 矩形が画像サイズより小さいか
					if(!begin_area){
						var r = element.getBoundingClientRect();
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
						observer_remove.setFunction(releasePopupImage);
					}

					// ポップアップイメージを作成
					popup_image = new PopupImage(image);
					popup_image.setElementParent(document.body);
					popup_image.setElementAnchor(element);
					popup_image.setElementHitArea(element);
					popup_image.setElementBeginArea(begin_area);
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
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
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
		project.executeScriptAllowPopupImage(element,url,content_type,response_allow);

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
		project.executeScriptAllowInlineSound(element,url,content_type,response_allow);
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

			var loader = null;
			var audio = null;
			var audio_analyze_work = null;
			var audio_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;

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
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
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
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseAudioElement);

			// オーディオの読み込み
			loader = new Loader();
			loader.onload = function(audio_element){
				audio = audio_element;

				// 解析ワーク作成
				audio_analyze_work = AnalyzeWorkCreate(audio);
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(audio_analyze_work,true);

				complete();

				// スタイルをセット
				ElementSetStyle(audio,project.getStyleSheetExpandSoundInlineAudioElement());

				// オーディオエレメントのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(audio);
				observer_remove.setFunction(releaseAudioElement);

				function responseInsert(){
					if(!audio)	return;

					limitter_element = element_limitter_sound.createElement();
					limitter_element.onattach = function(){
						audio.src = audio_url;
					};
					limitter_element.onremove = function(){
						audio.src = "";
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

		// アンセキュアチェック
		if(!project.checkAllowUnsecure(url)){
			complete();
			return;
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

			if(project.getVisiblePlayerFlashSoundcloud()){
				(function(){
					var iframe_url = "https://player.soundcloud.com/player.swf?url=" + encodeURIComponent(url);
					var height = 166;

					var iframe = null;
					var iframe_analyze_work = null;
					var event_handler = null;
					var limitter_element = null;
					var observer_remove = null;

					// インラインフレームを破棄
					function releaseIframeFlash(e){
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
							limitter_element.release();
							limitter_element = null;
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
						releaseIframeFlash();
						complete();
						return;
					}

					// 重複チェック
					if(project.getDisableSameInlineSound()){
						if(address_collection.hasAddress("sound",iframe_url)){
							iframe_url = null;
							releaseIframeFlash();
							complete();
							return;
						}
						// アドレスを登録
						address_collection.addAddress("sound",iframe_url);
					}

					// イベントハンドラを作成
					var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
					event_handler = event_dispatcher.createEventHandler("release");
					event_handler.setFunction(releaseIframeFlash);

					// インラインフレームを作成
					iframe = DocumentCreateElement('iframe');
					iframe.frameBorder = "0";
					iframe.scrolling = "no";

					// スタイルをセット
					ElementSetStyle(iframe,project.getStyleSheetExpandSoundSoundcloudInlinePlayerFlash());

					if(height){
						// 高さを設定
						iframe.style.height = parseInt(height) + "px";
					}

					// 解析ワーク作成
					iframe_analyze_work = AnalyzeWorkCreate(iframe);
					// 解析辞書登録
					analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

					// インラインフレームのリムーブ監視
					observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
					observer_remove.setFunction(releaseIframeFlash);

					function responseInsertFlash(){
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
					project.executeScriptInsertInlineSound(element,iframe,work.event_dispatcher,responseInsertFlash);
				})();
			}

			if(project.getVisiblePlayerHtml5Soundcloud()){
				(function(){
					var iframe_url = "https://w.soundcloud.com/player/?url=" + encodeURIComponent(url);
					var height = 166;

					var iframe = null;
					var iframe_analyze_work = null;
					var event_handler = null;
					var limitter_element = null;
					var observer_remove = null;


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
							limitter_element.release();
							limitter_element = null;
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
					var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
					event_handler = event_dispatcher.createEventHandler("release");
					event_handler.setFunction(releaseIframeHtml5);

					// インラインフレームを作成
					iframe = DocumentCreateElement('iframe');
					iframe.frameBorder = "0";
					iframe.scrolling = "no";

					// スタイルをセット
					ElementSetStyle(iframe,project.getStyleSheetExpandSoundSoundcloudInlinePlayerHtml5());

					if(height){
						// 高さを設定
						iframe.style.height = parseInt(height) + "px";
					}

					// 解析ワーク作成
					iframe_analyze_work = AnalyzeWorkCreate(iframe);
					// 解析辞書登録
					analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

					// インラインフレームのリムーブ監視
					observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
					observer_remove.setFunction(releaseIframeHtml5);

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

		if(project.getVisiblePlayerFlashSoundcloud() || project.getVisiblePlayerHtml5Soundcloud()){

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

		// アンセキュアチェック
		if(!project.checkAllowUnsecure(url)){
			complete();
			return;
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

			var loader = null;
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = null;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;


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
					limitter_element.release();
					limitter_element = null;
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

			// イベントハンドラを作成
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseIframe);

			// テキストの読み込み
			loader = new Loader();
			loader.onload = function(str){

				if(str.match(new RegExp("<link[ ]*?rel[ ]*?=[ ]*?\"video_src\"[ ]*?href[ ]*?=[ ]*?\"((http|https)://www\\.mixcloud\\.com/media/swf/player/mixcloudLoader.swf?[?].*?)\"","i"))){
					// 自動再生を無効化
					iframe_url = RegExp.$1.replace(/autoplay=1/ig,"autoplay=0");
				}

				// セキュアページに変更
				iframe_url = iframe_url.replace(/^http:/,"https:");

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

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandSoundMixcloudInlinePlayer());

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(releaseIframe);

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

		if(project.getVisiblePlayerMixcloud() ){

			// mixcloud.com へのリンク
			var allow_list = [
				"(http|https)://.*?.mixcloud\\.com/.+?/.+([?]|$)",
				"(http|https)://i\\.mixcloud\\.com/[a-zA-Z0-9]+$"
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
		project.executeScriptAllowInlineVideo(element,url,content_type,response_allow);
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

			var loader = null;
			var video = null;
			var video_analyze_work = null;
			var video_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;

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
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
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
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseVideoElement);

			// ビデオの読み込み
			loader = new Loader();
			loader.onload = function(video_element){
				video = video_element;

				// 解析ワーク作成
				video_analyze_work = AnalyzeWorkCreate(video);
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(video_analyze_work,true);

				complete();

				// スタイルをセット
				ElementSetStyle(video,project.getStyleSheetExpandVideoInlineVideoElement());

				// ビデオエレメントのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(video);
				observer_remove.setFunction(releaseVideoElement);

				function responseInsert(){
					if(!video)	return;

					limitter_element = element_limitter_video.createElement();
					limitter_element.onattach = function(){
						video.src = video_url;
					};
					limitter_element.onremove = function(){
						video.src = "";
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

			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;

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
					limitter_element.release();
					limitter_element = null;
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
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseIframe);

			// インラインフレームを作成
			iframe = DocumentCreateElement('iframe');
			iframe.frameBorder = "0";
			iframe.scrolling = "no";

			// スタイルをセット
			ElementSetStyle(iframe,project.getStyleSheetExpandVideoYoutubeInlineVideo());

			// 解析ワーク作成
			iframe_analyze_work = AnalyzeWorkCreate(iframe);
			// 解析辞書登録
			analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

			// インラインフレームのリムーブ監視
			observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
			observer_remove.setFunction(releaseIframe);

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
						var protocol = project.getSecureCurrent() ? "https" : "http";
						expand_video(protocol + "://www.youtube-nocookie.com/embed/" + query.v);
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
					if(RegExp.rightContext.match(new RegExp("^([a-zA-Z0-9]+)","i"))){
						var protocol = project.getSecureCurrent() ? "https" : "http";
						expand_video(protocol + "://www.youtube-nocookie.com/embed/" + RegExp.$1);
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

				var loader = null;
				var video = null;
				var video_analyze_work = null;
				var event_handler = null;
				var limitter_element = null;
				var observer_remove = null;

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
						limitter_element.release();
						limitter_element = null;
					}

					// 監視を破棄
					if(observer_remove){
						observer_remove.release();
						observer_remove = null;
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
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
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
						var embed;
						video = DocumentCreateElement('div');

						// スタイルをセット
						ElementSetStyle(video,project.getStyleSheetExpandVideoNicovideoInlineVideo());

						// 解析ワーク作成
						video_analyze_work = AnalyzeWorkCreate(video);
						// 解析辞書登録
						analyze_work_dictionary.attachAnalyzeWork(video_analyze_work,true);

						// エレメントのリムーブ監視
						observer_remove = new DomNodeObserverRemoveFromDocument(video);
						observer_remove.setFunction(releaseElement);

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

					}else{
						// 解析失敗
						expand_video_complete();
					}

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

				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

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
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
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
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(releaseIframe);

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

				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

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
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
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
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(releaseIframe);

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

				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

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
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
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
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(releaseIframe);

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

				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

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
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
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
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(releaseIframe);

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

				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

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
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
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
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(releaseIframe);

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

				var iframe = null;
				var iframe_analyze_work = null;
				var event_handler = null;
				var observer_remove = null;

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
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseIframe);

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

				iframe = DocumentCreateElement('iframe');
				iframe.frameBorder = "0";
				iframe.scrolling = "no";
				// 読み込み開始
				iframe.src = thumbnail_seiga_url;

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandVideoNicovideoInlineThumbnailSeiga());

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(releaseIframe);

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

		// アンセキュアチェック
		if(!project.checkAllowUnsecure(url)){
			complete();
			return;
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
			var loader = null;
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = null;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;

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
					limitter_element.release();
					limitter_element = null;
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

			function initialize(){
				// イベントハンドラを作成
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
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

				// スタイルをセット
				if(live){
					ElementSetStyle(iframe,project.getStyleSheetExpandVideoUstreamInlineVideoLive());
				}else{
					ElementSetStyle(iframe,project.getStyleSheetExpandVideoUstreamInlineVideoRecord());
				}

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(releaseIframe);

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
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;

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
					limitter_element.release();
					limitter_element = null;
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
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseIframe);

			iframe = DocumentCreateElement('iframe');
			iframe.frameBorder = "0";
			iframe.scrolling = "no";

			// スタイルをセット
			ElementSetStyle(iframe,project.getStyleSheetExpandVideoDailymotionInlineVideo());

			// 解析ワーク作成
			iframe_analyze_work = AnalyzeWorkCreate(iframe);
			// 解析辞書登録
			analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

			// インラインフレームのリムーブ監視
			observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
			observer_remove.setFunction(releaseIframe);

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

		// アンセキュアチェック
		if(!project.checkAllowUnsecure(url)){
			complete();
			return;
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

			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;

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
					limitter_element.release();
					limitter_element = null;
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
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseIframe);

			iframe = DocumentCreateElement('iframe');
			iframe.frameBorder = "0";
			iframe.scrolling = "no";

			// スタイルをセット
			ElementSetStyle(iframe,project.getStyleSheetExpandVideoVimeoInlineVideo());

			// 解析ワーク作成
			iframe_analyze_work = AnalyzeWorkCreate(iframe);
			// 解析辞書登録
			analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

			// インラインフレームのリムーブ監視
			observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
			observer_remove.setFunction(releaseIframe);

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
		
			var video = null;
			var video_analyze_work = null;
			var video_url = url;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;

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
					limitter_element.release();
					limitter_element = null;
				}

				// 監視を破棄
				if(observer_remove){
					observer_remove.release();
					observer_remove = null;
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
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			event_handler = event_dispatcher.createEventHandler("release");
			event_handler.setFunction(releaseElement);

			// 解析ワーク作成
			video_analyze_work = AnalyzeWorkCreate(video);
			// 解析辞書登録
			analyze_work_dictionary.attachAnalyzeWork(video_analyze_work,true);

			// インラインフレームのリムーブ監視
			observer_remove = new DomNodeObserverRemoveFromDocument(video);
			observer_remove.setFunction(releaseElement);

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
			
			var loader = null;
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = null;
			var event_handler = null;
			var limitter_element = null;
			var observer_remove = null;

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
					limitter_element.release();
					limitter_element = null;
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

				// スタイルをセット
				ElementSetStyle(iframe,project.getStyleSheetExpandVideoLiveleakInlineVideo());

				// イベントハンドラを作成
				var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
				event_handler = event_dispatcher.createEventHandler("release");
				event_handler.setFunction(releaseIframe);

				// 解析ワーク作成
				iframe_analyze_work = AnalyzeWorkCreate(iframe);
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(releaseIframe);

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

			var loader = null;
			var iframe = null;
			var iframe_analyze_work = null;
			var iframe_url = url;
			var event_handler = null;
			var observer_remove = null;

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
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
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
				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(iframe_analyze_work,true);

				// インラインフレームのリムーブ監視
				observer_remove = new DomNodeObserverRemoveFromDocument(iframe);
				observer_remove.setFunction(releaseIframe);

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


		var observer_remove;
		var popup_image;
		var event_dispatcher;

		// イベント解放
		function releaseEvent(){
			if(element.removeEventListener){
				element.removeEventListener("load",loaded);
				element.removeEventListener("error",releasePopupReducedImage);
			}else if(element.detachEvent){
				element.detachEvent("onload",loaded);
				element.detachEvent("onerror",releasePopupReducedImage);
			}
		}

		// 縮小画像のポップアップを破棄
		function releasePopupReducedImage(){
			// イベント解放
			releaseEvent();

			// リムーブ監視を破棄
			if(observer_remove){
				observer_remove.release();
				observer_remove = null;
			}

			// イベントディスパッチャーを破棄
			var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
			if(event_dispatcher){
				event_dispatcher.removeAll();
				AnalyzeWorkClearEventDispatcher(work);
			}

			// ポップアップイメージを破棄
			if(popup_image){
				popup_image.release();
				popup_image = null;
			}

			// 解析辞書除外
			analyze_work_dictionary.removeAnalyzeWork(work);
		}

		// 読み込み完了
		function loaded(){

			releaseEvent();

			if(!AnalyzeWorkEqualModifyCount(work,modify))	return;

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
				popup_image = new PopupImage(image);
				popup_image.setElementParent(document.body);
				popup_image.setElementAnchor(element);
				popup_image.setElementHitArea(element);
				popup_image.setElementBeginArea(element);
				AnalyzeWorkSetPopupImage(work,popup_image);
			}else{
				// 解放
				releasePopupReducedImage();
			}
		}

		// 解析辞書登録
		analyze_work_dictionary.attachAnalyzeWork(work,false);

		// イベントディスパッチャー
		event_dispatcher = new EventDispatcher();
		event_handler = event_dispatcher.createEventHandler("release");
		event_handler.setFunction(releasePopupReducedImage);
		AnalyzeWorkSetEventDispatcher(work,event_dispatcher);

		// リムーブ監視
		observer_remove = new DomNodeObserverRemoveFromDocument(element);
		observer_remove.setFunction(releasePopupReducedImage);

		// ロード完了済み
		if(element.complete){
			loaded();

		// ロード中
		}else{
			if(element.addEventListener){
				element.addEventListener("load",loaded);
				element.removeEventListener("error",releasePopupReducedImage);
			}else if(element.attachEvent){
				element.attachEvent("onload",loaded);
				element.detachEvent("onerror",releasePopupReducedImage);
			}
		}

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
				// PopupImage が存在する
				if(AnalyzeWorkGetPopupImage(work)){
					// 解放イベント発行
					var event_dispatcher = AnalyzeWorkGetEventDispatcher(work);
					if(event_dispatcher){
						event_dispatcher.dispatchEvent("release",null);
					}
				}
			}
		}

		if(element.nodeType == 1){
			// イメージ
			var tag_name = element.tagName.toUpperCase();
			if(tag_name == "IMG"){
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

			if(completed)	return;
			completed = true;

			if(!obj)	return;
			if(obj.useful){
				var observer_remove;

				// 解放
				function releaseExpandBbs(){
					// 解析クリア
					AnalyzeWorkClearAnalyzedExpandBbs(work);

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

				// 解析辞書登録
				analyze_work_dictionary.attachAnalyzeWork(work,false);
			}
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
	switch(execute_type){

	// --------------------------------------------------------------------------------
	// Opera のコンテンツスクリプトとして動作
	// --------------------------------------------------------------------------------
	case "OperaExtensionContentScript":

		// Opera拡張機能通信
		extension_message = new OperaExtensionMessageForContent();

		// コマンドキュー
		var command_queue = new Array();

		// 受信コールバック
		var response_listener = null;
		response_listener = function(request, sender, sendResponse){
			var param = JsonParse(request);
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
		extension_message.sendRequest(JsonStringify({command:"getProject",url:document.URL}), function(response) {

			// JSON 文字列からプロジェクトを作成
			project = new Project();
			project.importJSON(response);

			// 実行可能
			if(project.getEnable()){

				// PageExpand 初期化
				PageExpandInitialize();

				// 受信コールバック
				response_listener = function(request, sender, sendResponse){
					var param = JsonParse(request);

					switch(param.command){
					case "executePageExpand":
						PageExpandStart();
						break;

					case "executeDebug":
						// デバッグモード
						page_expand_debug.setVisible(true);
						break;

					// 未知の要求
					default:
						break;
					};
				};

				if(project.getEnableStartup()){
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
			}
		});
		break;

	};

}
