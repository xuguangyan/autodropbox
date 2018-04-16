/*
 * jQuery autodropbox plug-in
 * http://www.dasheng.com/
 *
 * Copyright (c) 2013-2018
 * Author: Dasheng
 *
 * Date: 2016-02-28
 * Revision: 0.02
 * camelChars depend on pinyin.plug.js
 */

(function($) {
	/**自动下拉选项框**/
	$.fn.autodropbox = function(options) {
		var defaults = {
			title: '',//下拉选项标题
			items: [],//下拉选项列表，格式：[txt1,txt2] 或 [[val1,txt1],[val2,txt2]] ，二维数组（后者）表示取val值，前者取txt值
			remote: '',//访问远程数据url
			method: 'post',//提交方法[post|get]【remote为空值有效】
			count: 0,//联想词选项数量上限，count=0表示加载全部【remote为空值有效】
			countKey: 'count',//数量上限变量名【remote为空值有效】
			searchKey: 'search',//关键字变量名【remote为空值有效】
			auto: true,//是否自动完成
			caseSensitive: false,//区分大小写
			mathBegin: false,//从开头匹配
			camelChars: true,//开启汉字首字母检索
			readonly: false,//文本框是否只读
			marginLeft: 0,//左边偏移
			marginTop: 0,//上边偏移
			height: 0, //固定下拉高度（默认不固定）
			bindData: false,//绑定选项数据（即控件值必须为选项值）
			change:function(oldVal, newVal){} //值改变事件回调
		};

		//参数覆盖
		var p = $.extend(defaults, options);
		var docHeight = $(document).height();

		$(this).each(function() {
			var $this = $(this);
			var tagName = $this.get(0).tagName;
			//console.log("tagName="+tagName);
			if(tagName=='INPUT'){
				$this.addClass("arrow_down");
			}
			var $hdObj=$("<input type=\"hidden\">").insertAfter($this);
			var curVal = $.trim($this.val());
			$hdObj.val(curVal);
			
			if(curVal!="" && p.bindData){
				$hdObj.val("");
				$this.val("");
				
				//远程请求数据
				if (p.remote != '') {
					//$this.attr("placeholder","努力加载中...");
					$.ajax({
						async: true,
						url: p.remote,
						type: p.method,
						data: p.searchKey+"="+curVal+"&"+p.countKey+"=0",
						success: function(data) {
							var items = eval(data);
							setDefValue(items);
						},
						error: function() {
							//$this.attr("placeholder","加载失败！");
						},
						timeout: 5000
					});
				}else{
					setDefValue(p.items);
				}
			}
			
			function setDefValue(items){
				//判断匹配项
				for (var i = 0; i < items.length; i++) {
					if(typeof(items[i])=="string"){
						if(items[i]==curVal){
							$hdObj.val(curVal);
							$this.val(items[i]);
							break;
						}
					}else{
						if(items[i][0]==curVal){
							$hdObj.val(curVal);
							$this.val(items[i][1]);
							break;
						}
					}
				}
			}
			
			var readonly = $this.attr("readonly");
			if(readonly){
				return;
			}
			if(p.readonly){
				$this.attr("readonly","readonly");
				return;
			}
			
			var $divTip = $("<ul class=\"autodropbox\">"); //.insertAfter($this);
			var indexStart = 0; //索引开始计数值
			var indexLi = 0; //当前选中Li项
			var $scrollPanel = $("<div class=\"tangram-scrollpanel-panel\"></div>").insertAfter($this);
			
			var $title = $("<div class=\"li_title\" title=\"点击清除已选项\">" + p.title + "</div>");
			var $content = $("<div class=\"tangram-scrollpanel-content\">" + "<div class=\"tangram-scrollContent\">" + "</div>" + "</div>");
			var $scrollbar = $("<div class=\"tangram-scrollbar\">" + "<div class=\"tangram-scrollbar-thumb-btn\">" + "<div class=\"tangram-scrollbar-thumb-prev\"></div>" + "<div class=\"tangram-scrollbar-thumb-track\"></div>" + "<div class=\"tangram-scrollbar-thumb-next\"></div>" + "</div>" + "</div>");

			$content.find(".tangram-scrollContent").html($divTip);

			//将文档框name、id与隐藏域交换
			var strName=$.trim($this.attr("name"));
			var strId=$.trim($this.attr("id"));
			if(strName!=""){
				$this.attr("name","adb_"+strName);
				$this.attr("id","adb_"+strId);
				
				$hdObj.attr("name",strName).attr("id",strId);
			}
			
			//是否含标题
			if (p.title != "") {
				$scrollPanel.append($title);
				//点击标题清除已选项
				$title.click(function(){
					$hdObj.val("");
					$this.val("");
				});
			}

			$scrollPanel.append($content);
			$scrollPanel.append($scrollbar);

			//绑定滚动条监听
			bindScroll();

			var initDataOk = false; //是否已初始化数据
			//点击输入框切换下拉层
			$this.click(function() {
				if ($scrollPanel.is(":visible")) {
					blur();
				} else {
					focus();
				}
				
				if(!initDataOk){
					//呈现下拉效果
					render();
				}
				return false;
			});

			//点击document隐藏下拉层
			$(document).click(function(event) {
				blur();
			});

			//点击下拉层
			$scrollPanel.click(function(event) {
				if ($(event.target).is("li.li_item")) { //由Li触发事件
					var liTxt = $(event.target).text();
					var liVal = $(event.target).attr("data");
					var oldVal = $hdObj.val();
					$this.val(liTxt); //赋值给输入框
					$hdObj.val(liVal);
					blur();
					valChange(oldVal, liVal);
				}else if ($(event.target).is("span.hightlight")) { //由span触发事件
					var liTxt = $(event.target).parent().text();
					var liVal = $(event.target).parent().attr("data");
					var oldVal = $hdObj.val();
					$this.val(liTxt); //赋值给输入框
					$hdObj.val(liVal);
					blur();
					valChange(oldVal, liVal);
				}
				return false;
			});

			//按键盘的上下移动LI的背景色
			$this.keydown(function(event) {
				if (!$scrollPanel.is(":visible")) return;
				if (event.which == 38) { //向上
					keySelect("up")
				} else if (event.which == 40) { //向下
					keySelect("down")
				} else if (event.which == 13) { //回车
					blur();
				} else if (event.which == 27) { //ESC
					blur();
				}
				
				//return ! p.readonly; //只读属性返回false，屏蔽键盘事件冒泡
			});
			
			//呈现下拉效果
			function render() {
				$divTip.empty();
				indexLi = indexStart - 1;

				//远程请求数据
				if (p.remote != '' && (!initDataOk || p.count>0)) {
					var key = $this.val();
					if(!initDataOk){
						key = "";
					}
					
					$divTip.append("<li class=\"li_lodding\">努力加载中...</li>");
					$.ajax({
						async: false,
						url: p.remote,
						type: p.method,
						data: p.searchKey+"="+key+"&"+p.countKey+"="+p.count,
						success: function(data) {
							p.items = eval(data);
							$divTip.children(".li_lodding").remove();
							initDataOk = true;
						},
						error: function() {
							p.items = [];
							$divTip.children(".li_lodding").html("<span class=hightlight>加载失败！</span>");
						},
						timeout: 5000
					});
				}

				//填充选项数组
				for (var i = 0; i < p.items.length; i++) {
					if(typeof(p.items[i])=="string"){
						$divTip.append("<li class=\"li_item\" data=\"" + p.items[i] + "\">" + p.items[i] + "</li>");
					}else{
						$divTip.append("<li class=\"li_item\" data=\"" + p.items[i][0] + "\">" + p.items[i][1] + "</li>");
					}
				}

				//自动完成功能
				if (p.auto) {
					var txt = $.trim($this.val()); //输入框的值
					var $li = $divTip.children("li.li_item");
					$li.each(function() {
						var _this = $(this);
						var pos = []; //记录匹配项起止位置
						var pos2 = []; //记录匹配项起止位置
						if (txt.length <= 0) {
							_this.show();
						} else if (isContain(_this.text(), txt, pos)) { //是否包含关键字
							_this.show().html(hightLight(_this.text(), pos)); //高显亮关键字
						} else if (chkCamelChars(_this.text(), txt, pos2)) { //是否包含关键字（根据汉字首字母检索）
							_this.show().html(hightLight(_this.text(), pos2)); //高显亮关键字
						} else {
							_this.hide();
						}
					});
				}

				//鼠标悬停LI
				$divTip.children("li.li_item").hover(function() {
					indexLi = $(this).index(); //获取当前鼠标悬停时的LI索引值;
					$(this).addClass("active").siblings().removeClass("active");
				});

				//重置滚动条位置
				$content.find(".tangram-scrollContent").css({"top": 0});
				$scrollbar.find(".tangram-scrollbar-thumb-btn").css({"top": 0});

				//调整滚动条
				adjustScroll();
			}

			//判断字符串是否包含关键字
			function isContain(str, key, pos) {
				//是否区分大小写
				if (!p.caseSensitive) {
					str = str.toLowerCase();
					key = key.toLowerCase();
				}

				//标记起止位置
				var start = str.indexOf(key);
				var end = start + key.length;
				pos.push(start);
				pos.push(end);

				//是否从开头匹配
				if (p.mathBegin) {
					return (start == 0);
				} else {
					return (start >= 0);
				}
			}

			//判断字符串是否包含关键字（根据汉字首字母检索）
			function chkCamelChars(str, key, pos) {
				//开启汉字首字母检索(大写形式,如：'大圣LoveU'=>'DSLoveU')
				if (p.camelChars) {
					str = pinyin.getCamelChars(str);

					return isContain(str, key, pos);
				}

				return false;
			}

			//高显亮关键字
			function hightLight(str, pos) {
				var tmp = "";
				tmp += str.substring(0, pos[0]);
				tmp += "<span class=hightlight>";
				tmp += str.substring(pos[0], pos[1]);
				tmp += "</span>";
				tmp += str.substring(pos[1]);

				return tmp;
			}

			//绑定滚动条监听
			function bindScroll() {
				if (p.height <= 0)
					return ;
					
				//移入滑块高亮
				$(".tangram-scrollbar").mouseover(function() {
					$(this).css({
						"background-position": "-3px center"
					});
					$(".tangram-scrollbar-thumb-btn").css({
						"background-position": "-24px center"
					});
					$(".tangram-scrollbar-thumb-prev").css({
						"background-position": "-36px -11px"
					});
					$(".tangram-scrollbar-thumb-next").css({
						"background-position": "-36px -15px"
					});
				});
	
				//移出滑块正常
				$(".tangram-scrollbar").mouseout(function() {
					$(this).css({
						"background-position": "3px 0pt"
					});
					$(".tangram-scrollbar-thumb-btn").css({
						"background-position": "-12px center"
					});
					$(".tangram-scrollbar-thumb-prev").css({
						"background-position": "-36px 0pt"
					});
					$(".tangram-scrollbar-thumb-next").css({
						"background-position": "-36px -4px"
					});
				});
	
				//滑块拖曳绑定
				$scrollbar.find(".tangram-scrollbar-thumb-btn").draggable({
					axis: 'y',
					containment: 'parent',
					opacity: 0.8,
					start: function(e) { //开始拖曳
					},
					stop: function(e) { //停止拖曳
						$this.focus();
					},
					drag: function(e) { //拖曳过程程
						//获取滚动div
						var top = parseInt("0"+$(this).css("top").replace("px", ""));
						var scrlH = $(this).parent().height() - $(this).height();
						var $panel = $(this).parent().parent().find(".tangram-scrollContent");
						var contH = $panel.outerHeight() - $panel.parent().height();
						var dist = top * contH / scrlH;
	
						$panel.css({
							"top": ( - dist) + "px"
						});
					}
				});
			}
			
			//调整滚动条
			function adjustScroll() {
				var fixedWidth = $this.width() - p.marginLeft; //预设固定宽度
				var fixedHeight = p.height; //预设固定高度
				var contentHeight = $divTip.outerHeight(true); //内容实际高度
				var titleHeight = $title.outerHeight(true); //标题高度
				var scrollWidth = $scrollbar.outerWidth(true); //滚动条宽度

				//是否含标题
				if (p.title != "") {
					fixedHeight -= titleHeight;
				}

				if (p.height > 0 && fixedHeight < contentHeight) { //带滚动条
					$scrollPanel.outerHeight(p.height + 4);
					$content.height(fixedHeight).width(fixedWidth - scrollWidth);
					$scrollbar.height(fixedHeight).show();
				} else { //不带滚动条
					$scrollPanel.height(contentHeight + titleHeight + 4);
					$content.width(fixedWidth);
					$scrollbar.hide();
				}
				
				var top = $this.position().top + $this.outerHeight(true);
				var splHeight = $scrollPanel.outerHeight(true);
				if(top+splHeight>docHeight){
					top = $this.position().top - splHeight;
					if(top<0){
						top = docHeight-splHeight;
					}
					$scrollPanel.css({
						'top': (top) + 'px'
					});
				}
			}

			//显示下拉层
			function focus() {
				var mb = parseInt("0"+$this.css("margin-bottom").replace("px", ""));
				var ml = parseInt("0"+$this.css("margin-left").replace("px", ""));

				var width = $this.width() - p.marginLeft;
				var height = $this.outerHeight(true);
				var left = $this.position().left + ml + p.marginLeft;
				var top = $this.position().top + height - mb + p.marginTop;
				

				$(".tangram-scrollpanel-panel").hide(); //隐藏其他下拉层
				$scrollPanel.css({
					'left': (left) + 'px',
					'top': (top) + 'px',
					'width': (width) + 'px'
				}).show();

				//调整滚动条
				//adjustScroll();
			}

			//隐藏下拉层
			function blur() {
				$scrollPanel.hide();
			}

			//键盘上下执行的函数
			function keySelect(up) {
				$scrollPanel.show();
				if (up == "up") {
					if (indexLi <= indexStart) {
						indexLi = $divTip.children(":visible").length - 1;
					} else {
						indexLi--;
					}
				} else {
					if (indexLi == $divTip.children(":visible").length - 1) {
						indexLi = indexStart;
					} else {
						indexLi++;
					}
				}
				var liTxt = $divTip.children(":visible").eq(indexLi).text();
				var liVal = $divTip.children(":visible").eq(indexLi).attr("data");
				var oldVal = $hdObj.val();
				$this.val(liTxt); //赋值给输入框
				$hdObj.val(liVal);
				valChange(oldVal, liVal);

				$divTip.children(":visible").eq(indexLi).addClass("active").siblings().removeClass("active");
				
				var fixedHeight = p.height; //预设固定高度
				var contentHeight = $divTip.outerHeight(true); //内容实际高度
				var titleHeight = $title.outerHeight(true); //标题高度

				//是否含标题
				if (p.title != "") {
					fixedHeight -= titleHeight;
				}
				/*if (p.height > 0 && fixedHeight < contentHeight) { //带滚动条
					var height=$divTip.children(":visible").outerHeight(true);
					console.log(height);
					$content.find(".tangram-scrollContent").css({"top": "-="+height+"px"});
					$scrollbar.find(".tangram-scrollbar-thumb-btn").css({"top": 0});
				}*/
			}

			//输入框值发生改变的时候执行函数，这里的事件用判断处理浏览器兼容性;
			if ($.browser.msie) {
				$this.bind("propertychange",inputChange);
			} else {
				$this.bind("input",inputChange);
			}
			
			$this.blur(function(){
				if(p.bindData){
					var txtVal = $.trim($this.val());
					if(txtVal=="") return;
					
					//判断匹配项
					for (var i = 0; i < p.items.length; i++) {
						if(typeof(p.items[i])=="string"){
							if(p.items[i]==txtVal){
								$hdObj.val(p.items[i]);
								return;
							}
						}else{
							if(p.items[i][1]==txtVal){
								$hdObj.val(p.items[i][0]);
								return;
							}
						}
					}
					
					var oldVal = $hdObj.val();
					var newVal = "";
					$hdObj.val(newVal);
					$this.val(newVal);
					valChange(oldVal, newVal);
				}
			});

			//输入发生改变时
			function inputChange(data) {
				focus();
				render();
				
				var oldVal = $hdObj.val();
				var newVal = "";
				if(!p.bindData){
					newVal = $this.val(); //赋值给输入框
				}
				$hdObj.val(newVal);
				valChange(oldVal, newVal);
			}

			//值发生改变时
			function valChange(oldVal, newVal) {
				//console.log("oldVal="+oldVal+", newVal="+newVal);
				if(oldVal!=newVal){
					p.change(oldVal, newVal);
				}
			}
		});

	}
})(jQuery);