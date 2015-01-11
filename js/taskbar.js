(function($, window){
	
	//todo: 动态添加WIFI列表项,系统设置那边的样式
	var wifi_RowFormat = [
		'<div class="cls-wifi-item [curwificonnect]" id="[wifi_id]">',
			'<div class="m-wifi-status">',
				'<span class="s-wifi-name">[wifi_name]</span>',
				'<div class="d-wifi-float">',
					'<span class="s-wifi-connect" [connect_mark]>已连接</span>',
					'<span class="[s-wifi-icon] cls-wifi-icon"></span>',
				'</div>',
			'</div>',
			'<div class="m-wifi-setting">',
				'<label [rem_password]><input type="checkbox" class="i-checkbox-pwd" />记住密码</label>',
				'<button class="b-btn-wifi" onclick="return false;" [data-bind-fn]>[data-bind-value]</button>',
			'</div>',
		'</div>'
	].join('');

	//任务栏这边的格式
	
	//未开启wifi功能的网口状态显示
	var eth_RowFormat = [
		'<div class="netstatus">',
		    '<span class="bot"></span>',
		    '<div>',
		    	'<div class="netdescript" id="netstate">网口状态：</div>',
		    	'<div class="netvalue [netstateval]" id="netstateval">[data-netstate]</div>',
		    '</div>',
		    '<div>',
		    	'<div class="netdescript" id="vdistate">VDI状态：</div>',
		    	'<div class="netvalue [vdistateval]" id="vdistateval">[data-vdistate]</div>',
		    '</div>',
		    '<div>',
		    	'<div class="netdescript" id="vdilinktime">VDI连接时间：</div>',
		    	'<div class="netvalue" id="vdilinktimeval">[data-vdilinktime]</div>',
		    '</div>',
		    '<div>',
		    	'<div class="netdescript" id="adeskaddr">aDesk地址：</div>',
		    	'<div class="netvalue" id="adeskaddrval">[data-adeskaddr]</div>',
		    '</div>',
		    '<div>',
		    	'<div class="netdescript" id="vdchost">中心管理器地址：</div>',
		    	'<div class="netvalue" id="vdchostval">[data-vdchost]</div>',
		    '</div>',
		'</div>'
	].join('');

	/*开启wifi功能网口状态显示---begin---*/
	var ethwifi_header_RowFormat      = [
		'<div class="netstatus_wrap">'
	].join('');
	//'<div class="netvalue" id="netstatefresh"></div>',
	var ethwifi_eth_RowFormat         = [
		'<div class="netstatus_wifi">',
		    '<div class="eth_note">',
				'<div class="netdescript_wifi" id="desscription">连接状态：</div>',
			'</div>',
		    '<div>',
		    	'<div class="netdescript_wifi" id="netstate">网口状态：</div>',
		    	'<div class="netvalue [netstateval]" id="netstateval">[data-netstate]</div>',
		    '</div>',
		    '<div>',
		    	'<div class="netdescript_wifi" id="vdistate">VDI状态：</div>',
		    	'<div class="netvalue [vdistateval]" id="vdistateval">[data-vdistate]</div>',
		    '</div>',
		    '<div>',
		    	'<div class="netdescript_wifi" id="vdilinktime">VDI连接时间：</div>',
		    	'<div class="netvalue" id="vdilinktimeval">[data-vdilinktime]</div>',
		    '</div>',
		    '<div>',
		    	'<div class="netdescript_wifi" id="adeskaddr">aDesk地址：</div>',
		    	'<div class="netvalue" id="adeskaddrval">[data-adeskaddr]</div>',
		    '</div>',
		    '<div>',
		    	'<div class="netdescript_wifi" id="vdchost">中心管理器地址：</div>',
		    	'<div class="netvalue" id="vdchostval">[data-vdchost]</div>',
		    '</div>',
		'</div>'
	].join('');
	var ethwifi_wifititile_RowFormat  = [
		'<div class="wifititile">',
			'<div class="netdescript_wifi" id="netwifi">无线网络</div>',
		'</div>',
		'<div class="wifi_wrap">' //wifi_wrap,接下面
	].join('');
/*	var ethwifi_wificontent_RowFormat = [
		'<div class="wifisignal" [wifisignal_fix] id=[wifi_id]>',
			'<div class="netwifi_name">[wifi_name]</div>',
			'<div class="netwifi_state" [connect_mark]>已连接</div>',
			'<div class="[netwifi-icon]"></div>',
		'</div>'
	].join('');*/
	var ethwifi_wificontent_RowFormat = [
		'<div class="wifisignal" id=[wifi_id]>',
			'<div class="netwifi_name">[wifi_name]</div>',
			'<div class="netwifi_state">已连接</div>',
			'<div class="[netwifi-icon]"></div>',
		'</div>'
	].join('');
	var ethwifi_wififoot_RowFormat    = [
		'</div>',   //wifi_wrap,接上面
		'<div class="netsetnote">',
			'<div class="netsetwifi" id="opennetwifi">打开网络设置</div>',
		'</div>'		
	].join('');
	var ethwifi_foot_RowFormat        = [
		'</div>'
	].join('');
	/*开启wifi功能网口状态显示---end---*/
	
	//引入eclog模块
	var eclog = require('eclog');
	
	//引入nodejs模块
	var g = window.taskbar = {
		'nwsystemObj': null,        //引入nodejs系统设置模块
		'nwglobvalObj': null,       //引入全局对象模块
		'nwsocketObj': null,        //引入socket模块
		'wifiresult': null,         //保存获取的wifi列表结果
		
		'init': function() {
			//todo: 底部任务栏初始函数
			if (g.nwsystemObj == null) {
				g.nwsystemObj = require("systemcall");
			}
			if (g.nwglobvalObj == null) {
				g.nwglobvalObj = require("globalval");
			}
			if (g.nwsocketObj == null) {
				g.nwsocketObj = require("socketaction");
			}
			g.initEvent();
			g.initData();
			setTimeout(g.initPage(),1000);
		},
		
		'initEvent': function(){
			$('.taskbar-menu').hide();
			$(".taskbar-left").click(function(){
				$('.taskbar-left').css('background-image','url(../imgs/syslogo_hover.png)');
				$(".taskbar-menu").slideDown();
			});
			
			$("#sysnet").click(function(){
				g.EthWifiStatus();
			});

			$("#systype").click(function(){
				g.switchTypeWrite();
			});

			$("#sysclock").click(function(){
				$('#settime').slideDown();
			});

			$("#settime").click(function(){
				setTimeout(function(){$('#settime').hide();},100);
				$('#sysSettingModal').show();
				$(".left-list-control li").removeClass("li-item-background");
				$(".left-list-control li").eq(4).addClass("li-item-background");
				$("div.m-item-detail").hide();
				$("div.m-item-detail").eq(4).show();
				g.sysModshowRefresh();
			});
			$('#menu_1').click(function(){$("#sysSettingModal").show();g.sysModshowRefresh();});
			
			$('#menu_2').click(function(){
				g.nwsystemObj.shutdownEC();
			});
			
			$('#menu_3').click(function(){
				g.nwsystemObj.rebootEC();
			});

			$('#modpassModal').hide();
			$("#sysSettingModal").hide();
			
			$(".left-list-control li").click(function(e) {
				var idx = $(".t-list-item li").index(this);
				$(".t-list-item li").removeClass("li-item-background");
				$(this).addClass("li-item-background");
				$("div.m-item-detail").each(function(index, el) {
					if (idx == index) {
						$(this).show();
					} else {
						$(this).hide();
					}
				});
			});
			
			var clickfn = function(e) {
				e = e || window.event;
                var el = e.target || e.srcElement;
                var $el = g.getEventEl(el);

                if (!!$el.attr("data-bind")) {
                    g.handleAction($el);
                }
			};
			
			$('#sys_content_modal').click(function(e) {
				clickfn(e);
			});
			
			$('#passwordAuth').click(function(e) {
				clickfn(e);
			});
			
			$('#connectModWifi').click(function(e) {
				clickfn(e);
			});

			//获取系统时间定时器,1分钟获取一次
			setInterval(function(){
				g.getSysTime();
			},60*1000);
		},
		
		'initData':function(){
			//此处可能嵌套回调

			//获取中英文输入法
			g.getTypeWrite();
			//获取是否升级
			g.getUpdateStatus();
			//获取网口状态，vdc.conf里host，客户机ip
			g.getEthStatus();
			//获取音量
			g.getVolume();
			//获取系统时间
			g.getSysTime();

			//获取系统设置中中心管理器地址和以太网数据
			g.getSysSettingData();
		},

		'initPage': function(){
			//根据initData数据渲染任务栏页面
			//initPage需要读取很多配置，考虑延迟一秒执行
			
			//输入法
			var typewrite = g.nwglobvalObj.getval('typewrite');
			if(typewrite == 'cn'){
				$('.systype').css('background-image','url(../imgs/type_cn.png)');
			}else{//'us'
				$('.systype').css('background-image','url(../imgs/type_us.png)');
			}

			//网线是否插入，VDI是否连接不考虑，初始化VDC还没连进来
			var ethstatus = g.nwglobvalObj.getval('ethstatus');
			var usewifi   = g.nwglobvalObj.getval('usewifi');

			if(usewifi == "1" || ethstatus == 'ok'){
				$('.sysnet').css('background-image','url(../imgs/sysnet_normal.png)');
			}else{//'no'
				$('.sysnet').css('background-image','url(../imgs/sysnet_down.png)');
			}

			//音量
			var sysvol    = parseInt(g.nwglobvalObj.getval('sysvol'));
			var sysvol_forbidden  = g.nwglobvalObj.getval('sysvol_forbidden')
			if(sysvol >= 65 && sysvol <= 100){
				$('.sysvol').css('background-image','url(../imgs/sysvol_high.png)');
			}else if(sysvol >= 31 && sysvol < 65){
				$('.sysvol').css('background-image','url(../imgs/sysvol_normal.png)');
			}else if(sysvol >=1 && sysvol < 31){
				$('.sysvol').css('background-image','url(../imgs/sysvol_low.png)');
			}else{//0
				$('.sysvol').css('background-image','url(../imgs/sysvol_quiet.png)');
			}
			if(sysvol_forbidden == "ok"){//禁用
				$('.sysvol').css('background-image','url(../imgs/sysvol_forbidden.png)');
			}
			//系统时间已经在getSysTime设置
		},

		'getTypeWrite': function(){},
		'switchTypeWrite':function(){
			g.nwsystemObj.switchTypeWrite(function(jsondata){
				console.log('switch typewrite');
				console.log(jsondata);
				var css = $('.systype').css('background-image');
				if(css.indexOf('type_cn') != -1){
					$('.systype').css('background-image','url(../imgs/type_us.png)');
				}else{//'us'
					$('.systype').css('background-image','url(../imgs/type_cn.png)');
				}
			},function(err){
				console.log('switch typewrite');
				console.log(err);
			});
		},
		'getUpdateStatus': function(){},
		'getEthStatus': function(){
			//网口状态ethstatus,node-main中通过mii-tool监听
			//中心管理器地址vdcconf，登录页面getSelectURL已经维护
			//瘦客户机ip,全局维护在network
			g.nwsystemObj.getNetwork(function(jsondata){

				var data      = $.parseJSON(jsondata);
				g.nwglobvalObj.setval('network', data);

			},function(err){
				eclog.log("get network data failed");
			});

			g.nwsystemObj.supportWifi(function(jsondata){
				var data          = $.parseJSON(jsondata);
				var isSupportWifi = data.supportwifi;
				authlogin.globalval.setval('issupportwifi', isSupportWifi);
				if(isSupportWifi == "1"){
					//wifi数据获取
					g.nwsystemObj.getWifi(function(jsondata) {
						var data     = $.parseJSON(jsondata);
						var enable   = data.enable;
						authlogin.globalval.setval('usewifi',enable);
						authlogin.globalval.setval('wifidata', data);

						g.getWifiData();
					}, function(error) {
						eclog.log('get wifi list failed');
					});				
				}
				
			},function(err){
				eclog.log('get is support wifi failed');
			});

		},
		'getVolume': function(){},
		'getSysTime': function(){
			var date    = new Date();
			var year    = date.getFullYear();
			var month   = parseInt(date.getMonth()) + 1;
			var day     = date.getDate();
			var hours   = date.getHours();
			var minutes = date.getMinutes();

			if(minutes >= 0 && minutes <= 9){
				minutes = "0" + minutes;
			}

			$('#systime').text(hours + ":" + minutes);
			$('#sysdate').text(year + "/" + month + "/" + day);
		},
		'setSysTime': function(timer){
			if(timer == null) return;
			$('#systime').text(timer.hours + ":" + timer.minutes);
			$('#sysdate').text(timer.year + "/" + timer.month + "/" + timer.day);
		},

		'EthWifiStatus':function(){
			
			$('.sysnet').html("");

			var usewifi       = authlogin.globalval.getval('usewifi');
			var issupportwifi = authlogin.globalval.getval('issupportwifi');
			var eth_rowFormat   = "";
			var wifi_rowFormat  = "";

			if(issupportwifi == "1" && usewifi == "1"){//开启wifi
				eth_rowFormat   = g.showEthStatus(ethwifi_eth_RowFormat);
				wifi_rowFormat  = g.showWifiStatus(ethwifi_wificontent_RowFormat);

				//拼接
				var ethwifi_rowFormat = ethwifi_header_RowFormat + eth_rowFormat + 
										ethwifi_wifititile_RowFormat + wifi_rowFormat +
									    ethwifi_wififoot_RowFormat + ethwifi_foot_RowFormat;

				$('.sysnet').append(ethwifi_rowFormat);
				$('.netstatus_wrap').show();
				g.regSysnetEvent();
			}else{//不支持wifi 或 未开启wifi
				eth_rowFormat   = g.showEthStatus(eth_RowFormat);
				$('.sysnet').append(eth_rowFormat);
				$('.netstatus').show();				
			}
		},

		//组装eth网状态显示
		'showEthStatus':function(rowFormat){
			var ethstatus   = authlogin.globalval.getval('ethstatus');
			var vdcconnect  = authlogin.globalval.getval('vdcconnect');
			var islogin     = authlogin.globalval.getval('islogin');
			var logintime   = authlogin.globalval.getval('logintime');
			var network     = authlogin.globalval.getval('network');
			var vdcconf     = authlogin.globalval.getval('vdcconf');

			var adeskaddr   = network == null ? "-" :network.address; //adesk地址
			var vdchost     = vdcconf == null ? "-" :vdcconf.host;    //中心管理器地址

			if(ethstatus == "ok"){//网口状态
				rowFormat  = rowFormat.replace(/\[netstateval\]/g, "netstateval_ok");
				rowFormat  = rowFormat.replace(/\[data-netstate\]/g, "正常");
				

				if(vdcconnect == "ok"){//vdi连接状态
					
					if(islogin == "ok"){//是否已经登录
						rowFormat  = rowFormat.replace(/\[data-vdistate\]/g, "已登录");
						rowFormat  = rowFormat.replace(/\[data-vdilinktime\]/g, logintime);

						rowFormat  = rowFormat.replace(/\[vdistateval\]/g, "vdistateval_nologin");
					}else{
						rowFormat  = rowFormat.replace(/\[data-vdistate\]/g, "未登录");
						rowFormat  = rowFormat.replace(/\[data-vdilinktime\]/g, "-");

						rowFormat  = rowFormat.replace(/\[vdistateval\]/g, "vdistateval_login");
					}

				}else{
					rowFormat  = rowFormat.replace(/\[data-vdilinktime\]/g, "-");

					rowFormat  = rowFormat.replace(/\[data-vdistate\]/g, "连接中断");
					rowFormat  = rowFormat.replace(/\[vdistateval\]/g, "vdistateval_vdcbreak");
				}

			}else{
				rowFormat  = rowFormat.replace(/\[netstateval\]/g, "netstateval_no");
				rowFormat  = rowFormat.replace(/\[data-netstate\]/g, "未插入网线");

				rowFormat  = rowFormat.replace(/\[vdistateval\]/g, "vdistateval_ethbreak");
				rowFormat  = rowFormat.replace(/\[data-vdistate\]/g, "-" );

				rowFormat  = rowFormat.replace(/\[data-vdilinktime\]/g, "-");
			}

			if(adeskaddr == ""){
				rowFormat  = rowFormat.replace(/\[data-adeskaddr\]/g, "-");
			}else{
				rowFormat  = rowFormat.replace(/\[data-adeskaddr\]/g, adeskaddr);
			}

			if(vdchost == null){
				rowFormat  = rowFormat.replace(/\[data-vdchost\]/g, "-");
			}else{
				rowFormat  = rowFormat.replace(/\[data-vdchost\]/g, vdchost);
			}

			return rowFormat;		
		},
		//组装wifi状态显示
		'showWifiStatus':function(wifirowFormat){
			var wifi_rowFormat  = "";
			//var wifidata   = authlogin.globalval.getval('wifidata');
			var wifidata   = g.wifiresult;
			var connect    = wifidata.connect;//连通的wifi信号

			if(connect == ""){
				return wifi_rowFormat;
			}

			for (var i = 0; i < wifidata.list.length; i++) {
				var rowFormat = wifirowFormat;
				var wifiSSID = wifidata.list[i].ssid;

				rowFormat = rowFormat.replace(/\[wifi_id\]/g, wifiSSID);
				rowFormat = rowFormat.replace(/\[wifi_name\]/g, wifidata.list[i].ssid);

				if(wifiSSID == connect){
					var levelObj = {
						'0': 'netwifi-icon-none',
						'1': 'netwifi-icon-low',
						'2': 'netwifi-icon-lownormal',
						'3': 'netwifi-icon-normal',
						'4': 'netwifi-icon-highnormal',
						'5': 'netwifi-icon-high'
					};
					for (item in levelObj) {
						if (item == wifidata.list[i].level) {
							rowFormat = rowFormat.replace(/\[netwifi-icon\]/g, levelObj[item]);
						}
					}
					wifi_rowFormat += rowFormat;
					break;
				}


				//不要删啦，估计以后会用
/*				if(wifiId != result.currentid){
					rowFormat = rowFormat.replace(/\[connect_mark\]/g, 'style="visibility: hidden;"');
				}else{
					rowFormat = rowFormat.replace(/\[connect_mark\]/g, '');

				}


				if(result.totalCount > 5){
					rowFormat = rowFormat.replace(/\[wifisignal_fix\]/g, 'style="padding:5px 0px;"');
				}else{
					rowFormat = rowFormat.replace(/\[wifisignal_fix\]/g, '');
				}
				wifi_rowFormat += rowFormat;*/
			}
			return wifi_rowFormat;
		},
		/*
		** 关闭盒子
		 */
		'shutdownEC':function(){
			g.nwsystemObj.shutdownEC(function(result){

			},function(err){
				eclog.log('shutdown failed');
			});
		},

		/*
		** 重启盒子
		 */
		'rebootEC':function(){
			g.nwsystemObj.rebootEC(function(result){
				
			},function(err){
				eclog.log('reboot failed');
			});
		},

		//开启wifi则注册一些点击事件
		'regSysnetEvent': function(){
			$('#opennetwifi').click(function(e){

				setTimeout(function(){$('.netstatus_wrap').hide();},100);
				$('#sysSettingModal').show();
				$(".left-list-control li").removeClass("li-item-background");
				$(".left-list-control li").eq(2).addClass("li-item-background");
				$("div.m-item-detail").hide();
				$("div.m-item-detail").eq(2).show();
				g.sysModshowRefresh();
			});
		},
		//获取鼠标事件触发对象标签；
        "getEventEl": function (el) {
            return (!!$(el).attr("data-toggle") || !!$(el).attr("data-bind")) ? $(el) : $(el).parents("*[data-toggle],*[data-bind]").eq(0);
        },
        //截获鼠标所点击的对象动作
        "handleAction": function (el) {
            var evt = el.attr("data-bind");
            if (typeof g[evt] === "function") {
                g[evt](el);
            }
        },
		'getWifiList': function() {
			//todo: 获取WIFI列表
		},
		'save': function($el) {
			//todo: 保存数据，单个选项卡保存
			var index = $(".mid-content-leftside .m-li-item").index($(".li-item-background"));   //获取当前选项卡的索引
			switch(index) {
				case 0: g.saveCenterIpData(); break;
				case 1: g.saveEthData(); break;
				case 2: g.saveWifiData(); break;
				case 3: g.saveResolutData(); break;
				case 4: g.saveDate(); break;
				case 5: g.saveOtherData();break;
				default: break;
			}
		},
		'unsave': function($el) {
			//todo: 取消保存，此时应退出系统设置框
			$('#sysSettingModal').hide();
		},
		'testConnectVDC': function($el) {
			var url = $.trim($("#center_address").val());
			var md5pwd = '';
			if ($.trim($("#center_pwd").val()).length > 0) {
				md5pwd = hex_md5($.trim($("#center_pwd").val()));
			}
			var ret_data = checkCenterAddrValid(url);
			if (!ret_data) {
				$('#center_address').tips({side:"right", msg: '中心管理地址输入不正确，请重新输入',cls: 'error-tips', time: 5, x: -5, y: 10});
				return ;
			}
			
			if (g.nwsystemObj) {
				$('.tip-circle-icon').removeClass('connectVDC-normal connectVDC-error').addClass('connectVDC-loading');
				$('#connectVDC_tip').text('正在测试...');
				$('.input-btn-item').attr({"disabled": "disabled"});
				
				ret_data.password = md5pwd;
				g.nwsystemObj.TestConnectVDC(ret_data, function(result) {
					//todo: 测试成功回调
					$('.input-btn-item').removeAttr('disabled');
					$('.tip-circle-icon').removeClass('connectVDC-loading connectVDC-error').addClass('connectVDC-normal');
					$('#connectVDC_tip').text('连接成功！');
				}, function() {
					//测试失败回调
					$('.input-btn-item').removeAttr('disabled');
					$('.tip-circle-icon').removeClass('connectVDC-normal connectVDC-loading').addClass('connectVDC-error');
					$('#connectVDC_tip').text('连接失败，请检查地址和密码是否正确');
				});
			}
		},
		'ethstatic': function($el) {
			$("#idEthNetwork .input-text-group input[type='text']").removeAttr('disabled');   //恢复输入框
		},
		'ethDHCP': function($el) {
			//todo: 输入框变灰
			$("#idEthNetwork .input-text-group input[type='text']").attr({"disabled": "disabled"});
			$("#idEthNetwork .input-text-group input[type='text']").val('');
		},
		'openwifi': function($el) {
			//todo: 打开wifi
			if (g.nwsystemObj) {
				g.mask('正在获取无线...');
				g.nwsystemObj.openWifi(function() {
					g.nwsystemObj.getWifi(function(result) {
						//todo: 此时表示获取wifi列表成功
						result = $.parseJSON(result);
						if (result.enable == '0') {
							eclog.log('wifi have been closed');
							g.unmask();
							return ;
						}
						g.wifiresult = result;
						showWifiList(result);
						//todo: 注册wifi列表点击事件
						$(".cls-wifi-item").click(function(e) {
							$(".cls-wifi-item").removeClass("wifi-item-click").children(".m-wifi-setting").hide();
							$(this).addClass("wifi-item-click").children(".m-wifi-setting").show();
						});
						$('#wifi_open').attr({"checked": "checked"}).attr({"disabled": "disabled"});
						$('#wifi_close').removeAttr('disabled');
						$('#wifi_refresh').removeAttr('disabled');
						g.unmask();
					}, function(error) {
						//todo: 提示获取wifi列表失败
						eclog.log('get wifi list failed');
						g.unmask();
					});
				}, function(error) {
					//todo: 打开wifi失败
					eclog.log('open wifi failed');
					g.unmask();
				});
			}
		},
		'closewifi': function($el) {
			if (g.nwsystemObj) {
				g.mask('正在关闭无线...');
				g.nwsystemObj.closeWifi(function() {
					$("#wifi_list_content").html("");
					$("#wifi_list_content").css({"disabled": "disabled"});
					$('#wifi_close').attr({"checked": "checked"}).attr({"disabled": "disabled"});
					$('#wifi_open').removeAttr('disabled');
					$('#wifi_refresh').attr({"disabled": "disabled"});
					g.wifiresult = null;
					g.unmask();
				}, function(error) {
					//todo: 关闭wifi失败
					eclog.log('close wifi failed');
					g.unmask();
				});
			}
		},
		'refreshWifi': function() {
			//todo: 刷新wifi列表
			g.openwifi();
		},
		'connectWifi': function($el) {
			//todo: 先处理已连接的wifi项，再处理当前连接的wifi项
			$('.curwificonnect .s-wifi-connect').css({"visibility": "hidden"});
			$('.curwificonnect .m-wifi-setting .b-btn-wifi').text('连接').attr('data-bind', 'connectWifi');
			$('.curwificonnect').removeClass('curwificonnect');
			
			//获取当前wifi的数据
			var data = {};
			var ssid = $('.wifi-item-click').attr('id');
			for (var i = 0; i < g.wifiresult.list.length; i++) {
				if (ssid == 'wifi_ssid' + g.wifiresult.list[i].ssid) {
					data = g.wifiresult.list[i];
					break;
				}
			}
			switch(data.stype) {
				case 'NONE': g.wifiAuthNONE(data); break;
				case 'WEP':
				case 'WPA': g.wifiAuthWPA(data); break;
				case '802.1X': g.wifiAuth8021X(data); break;
				default: break;
			}
		},
		'wifiAuthNONE': function(data) {
			//todo: wifi无密码验证
			if (g.nwsystemObj) {
				g.wifiModalShow();
				var param = {};
				param.ssid = data.ssid;
				param.authtype = data.stype;
				g.connectCertainWifi(param);
			} else {
				eclog.log('wifiAuthNONE:' + 'nwsystemObj is null');
			}
		},
		'wifiAuthWPA': function(data) {
			//todo: wifi WPA验证方式，需要显示密码输入框
			$('#passwordAuth').show();
			$('#passwordAuth .bs-example div').eq(0).hide();
			$('#passwordAuth .bs-example div').eq(1).css({"paddingTop": "25px"});
			$('#wifipassword').get(0).focus();   //密码框获取焦点
			g.wifiAuthData = data;
			//显示密码输入框
		},
		'wifiAuth8021X': function(data) {
			return ;
			//todo: wifi 802.1X验证方式
			$('#passwordAuth').show();
			$('#passwordAuth .bs-example div').eq(0).show();
			$('#passwordAuth .bs-example div').eq(1).css({"paddingTop": "5px"});
			$('#wifiusername').get(0).focus();   //密码框获取焦点
			g.wifiAuthData = data;
		},
		'confirmWifi': function() {
			//todo: 密码输入框
			$('#passwordAuth').hide();
			if (g.nwsystemObj) {
				g.wifiModalShow();
				var param = {};
				param.ssid = g.wifiAuthData.ssid;
				param.authtype = g.wifiAuthData.stype;
				param.password = $('#wifipassword').val();
				if (param.authtype == '802.1X') {
					param.wifiuser = $('#wifiusername').val();
				}
				g.connectCertainWifi(param);
				$('#wifiusername').val('');
				$('#wifipassword').val('');
			} else {
				eclog.log('confirmWifi:' + 'nwsystemObj is null');
			}
		},
		'connectCertainWifi': function(param) {
			g.wifiprocessPid = g.nwsystemObj.connectWifi(param, function() {
				g.wifiModalhide();
				$('.wifi-item-click .s-wifi-connect').css({"visibility": "visible"});
				$('.wifi-item-click .m-wifi-setting .b-btn-wifi').text('断开').attr('data-bind', 'disconnectWifi');
				$('.wifi-item-click').addClass('curwificonnect');
				$('.curwificonnect').children(".m-wifi-setting").hide();
				g.wifiprocessPid = -1;
				eclog.log('confirmWifi success');
			}, function(error) {
				//todo: 提示连接wifi失败
				g.wifiprocessPid = -1;
				g.wifiModalhide();
				eclog.log('confirmWifi failed');
			});
		},
		'unconfirmWifi': function() {
			$('#passwordAuth').hide();
		},
		'disconnectWifi': function($el) {
			//todo: 处理当前的wifi项
			if (g.nwsystemObj) {
				g.mask('正在断开无线...');
				g.nwsystemObj.disconnectWifi(function() {
					//todo: 断开wifi成功
					$('.curwificonnect .s-wifi-connect').css({"visibility": "hidden"});
					$('.curwificonnect .m-wifi-setting .b-btn-wifi').text('连接').attr('data-bind', 'connectWifi');
					$('.curwificonnect').children(".m-wifi-setting").hide();
					$('.curwificonnect').removeClass('curwificonnect wifi-item-click');
					g.unmask();
				}, function(error) {
					//todo: 
					eclog.log('disconnect wifi failed');
					g.unmask();
				});
			}
		},
		'closesysModal': function($el) {
			$('#sysSettingModal').hide();
		},
		'saveCenterIpData': function() {
			var url = $.trim($("#center_address").val());
			var md5pwd = '';
			if ($.trim($("#center_pwd").val()).length > 0) {
				md5pwd = hex_md5($.trim($("#center_pwd").val()));
			}
			var ret_data = checkCenterAddrValid(url);
			if (!ret_data) {
				$('#center_address').tips({side:"right", msg: '中心管理地址输入不正确，请重新输入',cls: 'error-tips', time: 5, x: -5, y: 10});
				return ;
			}
			if (g.nwsystemObj) {
				g.mask('正在保存配置...');
				ret_data.password = md5pwd;
				ret_data.orgurl = encodeURIComponent(url);
				g.nwsystemObj.setVDCConf(ret_data, function() {
					if (g.nwsocketObj) {
						g.nwsocketObj.updateconfsucc('vdc');
					}
					g.noticeToLogin();
					g.unmask();
					$(document.body).tips({side:"top", msg: '保存成功', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
				}, function(error) {
					g.unmask();
					$(document.body).tips({side:"top", msg: '保存失败', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
				});
			}

		},
		'noticeToLogin':function(){
			var islogin = authlogin.globalval.getval('islogin');
			if(islogin == "ok"){
				window.app.logout();
			}else{
				return;
			}
		},
		'saveEthData': function() {
			var ethData = {mode: 'static', address: '', netmask: '', gateway: '', dns1: ''};  

			if ($('input:radio[name="radio_network"]:checked').attr('data-bind') == 'ethstatic') {
				ethData.mode = 'static';
			} else {
				ethData.mode = 'dhcp';
			}
			if (ethData.mode == 'static') {
				ethData.address = $.trim($("#idEthNetwork #ethip").val());
				ethData.netmask = $.trim($("#idEthNetwork #ethSubMask").val());
				ethData.gateway = $.trim($("#idEthNetwork #ethGateway").val());
				ethData.dns1 = $.trim($("#idEthNetwork #ethMainDNS").val());
				if ($.trim($("#idEthNetwork #ethReserveDNS").val()).length > 0) {
					ethData.dns2 = $.trim($("#idEthNetwork #ethReserveDNS").val());
				}
				if (!checkIpValid(ethData.address)) {
					$('#idEthNetwork #ethip').tips({side:"right", msg: 'IP地址输入不正确，请重新输入', cls: 'error-tips', time: 5, x: -5, y: 10});
					return ;
				}
				if (!checkIpValid(ethData.netmask)) {
					$('#idEthNetwork #ethSubMask').tips({side:"right", msg: '子网掩码不是有效IP，请重新输入', cls: 'error-tips', time: 5, x: -5, y: 10});
					return ;
				}
				if (!checkSubmaskValid(ethData.netmask)) {
					$('#idEthNetwork #ethSubMask').tips({side:"right", msg: '子网掩码必须是相邻的，请输入有效掩码', cls: 'error-tips', time: 5, x: -5, y: 10});
					return ;
				}
				if (!checkIpValid(ethData.gateway)) {
					$('#idEthNetwork #ethGateway').tips({side:"right", msg: '网关地址不是有效IP，请重新输入', cls: 'error-tips', time: 5, x: -5, y: 10});
					return ;
				}
				if (!checkIpValid(ethData.dns1)) {
					$('#idEthNetwork #ethMainDNS').tips({side:"right", msg: '首选DNS地址不是有效IP，请重新输入', cls: 'error-tips', time: 5, x: -5, y: 10});
					return ;
				}
				if ('dns2' in ethData && ethData.dns2.length > 0 && !checkIpValid(ethData.dns2)) {
					$('#idEthNetwork #ethReserveDNS').tips({side:"right", msg: '备选DNS地址不是有效IP，请重新输入', cls: 'error-tips', time: 5, x: -5, y: 10});
					return ;
				}
				if ('dns2' in ethData && ethData.dns1 == ethData.dns2) {
					$('#idEthNetwork #ethReserveDNS').tips({side:"right", msg: '备选DNS不能和首选DNS相同，请重新输入', cls: 'error-tips', time: 5, x: -5, y: 10});
					return ;
				}
				if (!checkIpUsable(ethData.address, ethData.netmask, ethData.gateway)) {
					$('#idEthNetwork #ethip').tips({side:"right", msg: 'IP地址和网关地址不在同一网段，请重新输入', cls: 'error-tips', time: 5, x: -5, y: 10});
					return ;
				}
			}
			
			if (g.nwsystemObj) {
				g.mask('正在保存配置...');
				g.nwsystemObj.setNetwork(ethData, function(result) {
					//todo: 保存后返回值
					if (g.nwsocketObj) {
						g.nwsocketObj.updateconfsucc('network');
					}
					if (g.nwglobvalObj) {
						g.nwglobvalObj.setval('network', ethData);
					}
					g.unmask();
					$(document.body).tips({side:"top", msg: '保存成功', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
				}, function(error) {
					g.unmask();
					$(document.body).tips({side:"top", msg: '保存数据失败，请检查网络', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2-30});
				});
			}
		},
		'saveWifiData': function() {
			g.mask('正在保存配置...');
			setTimeout(function() {
				g.unmask();
				$(document.body).tips({side:"top", msg: '保存成功', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
			}, 2000);
		},
		'saveResolutData': function() {
			
		},
		'saveDate': function() {
			//todo: 保存时间日期
			var year = $("#jcDateTt").find("span").text();
			var month = $("#jcDateTt").find("samp").text();
			var day = $("input#dateHideText").val();
			var hour = $('#showHour').val();
			var minute = $('#showMinute').val();
			var second = $('#showSecond').val();
			if (!checkdateFormat(hour, minute, second)) {
				$('#dateTips').tips({side: "bottom", msg: '时间格式输入不正确', cls: 'error-tips', time: 5, x: 2, y: 0});
				return ;
			}
			var date = year + '-' + month + '-' + day;
			var time = '\"' + date + ' ' + hour + ':' + minute + ':' + second + '\"';
			if (g.nwsystemObj) {
				g.mask('正在保存配置...');
				g.nwsystemObj.setSystemTime(time, function(result) {
					//todo: 提示设置系统时间成功
					setTimeout(function() {
						eclog.log('set systemtime success');
						g.unmask();
					}, 2000);
				}, function(error) {
					//todo: 设置时间失败
					setTimeout(function() {
						eclog.log('set systemtime failed');
						$(document.body).tips({side:"top", msg: '保存失败', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
						g.unmask();
					}, 1000);
				});
			}
		},
		'saveOtherData': function() {
			
		},
		'mask': function(tips) {
			$('#sysmask .tips_loading').text(tips);
			$('#sysmask').show();
		},
		'unmask': function() {
			$('#sysmask').hide();
			$('#sysmask .tips_loading').text('正在保存配置...');
		},
		'wifiModalShow': function() {
			$('#connectModWifi').show();
			var nCount = 0;
			g.showtimer = setInterval(function() {
				var text = '正在连接无线网络';
				if (++nCount > 6) {
					nCount = 0;
				}
				switch(nCount) {
					case 0: text += ''; break;
					case 1: text += '.'; break;
					case 2: text += '..'; break;
					case 3: text += '...'; break;
					case 4: text += '....'; break;
					case 5: text += '.....'; break;
					case 6: text += '......'; break;
					default: break;
				}
				$('#connectModWifi .container-border .m-prog-text').text(text);
			}, 500);
		},
		'wifiModalClose': function() {
			if (g.wifiprocessPid != -1) {
				g.nwsystemObj.killPsTree(g.wifiprocessPid);
			}
			g.wifiModalhide();
		},
		'wifiModalhide': function() {
			window.clearInterval(g.showtimer);
			$('#connectModWifi').hide();
		},
		'getSysSettingData': function() {
			//初始化中心管理器数据
			g.getVDCData();
			//初始化以太网数据
			g.getEthData();
			//初始化分辨率数据
			g.getResolutData();
			//初始化时间日期
			g.getTimeData();
			//初始化其他数据
			g.getOtherData();
		},
		'getVDCData': function() {
			if (g.nwglobvalObj) {
				var vdcdata = g.nwglobvalObj.getval('vdcconf');
				if (vdcdata != null) {
					$('#center_address').val(decodeURIComponent(vdcdata.orgurl));
					$('#center_pwd').val('');
				}
			}
		},
		'getEthData': function() {
			if (g.nwsystemObj) {
				g.nwsystemObj.getNetwork(function(result) {
					var ethdata = $.parseJSON(result);
					if (ethdata != null) {
						if (ethdata.mode == 'dhcp') {
							$('#network_dhcp').attr("checked", "checked");
							$("#idEthNetwork .input-text-group input[type='text']").attr({"disabled": "disabled"});
							$("#idEthNetwork .input-text-group input[type='text']").val('');
						} else {
							$('#network_static').attr("checked", "checked");
							$('#ethip').val(ethdata.address);
							$('#ethSubMask').val(ethdata.netmask);
							$('#ethGateway').val(ethdata.gateway);
							$('#ethMainDNS').val(ethdata.dns1);
							$('#ethReserveDNS').val(ethdata.dns2);
							$('#ethMACAddress').val(ethdata.macAddress);
						}
					}
				}, function(error){
					eclog.log("get network data failed");
				});
				//todo: 获取MAC地址
				g.nwsystemObj.getMACAddress(function(result) {
					result = $.parseJSON(result);
					$('#ethMACAddress').text(result.macaddr);
				}, function(error) {
					eclog.log('getMACAddress failed');
				});
			}
		},
		'getWifiData': function() {
			if (g.nwglobvalObj) {
				var issupport = g.nwglobvalObj.getval('issupportwifi');
				if (issupport == '0') {
					$('#sysSettingModal .left-list-control .m-li-item').eq(2).hide();
					$('#sysSettingModal .left-list-control .t-list-item').eq(0).css({"height": "70px"});
				} else {
					var data = g.nwglobvalObj.getval('wifidata');
					if (data.enable == '1') {
						$('#wifi_open').attr({"checked": "checked"}).attr({"disabled": "disabled"});
						$('#wifi_close').removeAttr('disabled');
						$('#wifi_refresh').removeAttr('disabled');
						g.wifiresult = data;
						showWifiList(data);
						//todo: 注册wifi列表点击事件
						$(".cls-wifi-item").click(function(e) {
							$(".cls-wifi-item").removeClass("wifi-item-click").children(".m-wifi-setting").hide();
							$(this).addClass("wifi-item-click").children(".m-wifi-setting").show();
						});
					} else {
						$('#wifi_close').attr({"checked": "checked"}).attr({"disabled": "disabled"});
						$('#wifi_open').removeAttr('disabled');
						$('#wifi_refresh').attr({"disabled": "disabled"});
						$("#wifi_list_content").html("");
						$("#wifi_list_content").css({"disabled": "disabled"});
					}
				}
			}
		},
		'getResolutData': function() {
			if (g.nwsystemObj) {
				g.nwsystemObj.getResolut(function(result) {
					var resData = parseResolutSring(result);
				}, function(error) {
					console.log(error);
				});
			}
		},
		'getTimeData': function() {
			//todo: 创建系统日期控件
			$("#dateSetting").jcDate({					       
				IcoClass : "jcDateIco",
				Event : "click",
				Speed : 100,
				Left : 0,
				Top : 28,
				format : "-",
				Timeout : 100
			});
			g.setTimeRefresh();
		},
		'getOtherData': function() {
			//todo: 初始化其他数据
		},
		'setTimeRefresh': function() {
			var dateObj = new Date();
			var hour = dateObj.getHours();
			var minute = dateObj.getMinutes();
			var second = dateObj.getSeconds();
			hour = hour.toString();
			minute = minute <= 9 ? ('0'+minute.toString()) : minute.toString();
			second = second <= 9 ? ('0'+second.toString()) : second.toString();
			$('#showHour').val(hour);
			$('#showMinute').val(minute);
			$('#showSecond').val(second);
		},
		'upHour': function(el) {
			//todo: 点击小时向上箭头触发事件
			var hour = (parseInt($('#showHour').val()) + 1) % 24;
			$('#showHour').val(hour.toString());
		},
		'downHour': function(el) {
			//todo: 点击小时向下箭头触发事件
			var hour = parseInt($('#showHour').val()) - 1;
			if (hour < 0) {
				hour = 23;
			}
			$('#showHour').val(hour.toString());
		},
		'upMinute': function(el) {
			//todo: 点击分钟向上箭头触发事件
			var minute = (parseInt($('#showMinute').val()) + 1) % 60;
			$('#showMinute').val(minute <= 9 ? ('0'+minute.toString()) : minute.toString());
		},
		'downMinute': function(el) {
			//todo: 点击分钟向下箭头触发事件
			var minute = parseInt($('#showMinute').val()) - 1;
			if (minute < 0) {
				minute = 59;
			}
			$('#showMinute').val(minute <= 9 ? ('0'+minute.toString()) : minute.toString());
		},
		'upSecond': function(el) {
			//todo: 点击秒数向上箭头触发事件
			var second = (parseInt($('#showSecond').val()) + 1) % 60;
			$('#showSecond').val(second <= 9 ? ('0'+second.toString()) : second.toString());
		},
		'downSecond': function(el) {
			//todo: 点击秒数向下箭头触发事件
			var second = parseInt($('#showSecond').val()) - 1;
			if (second < 0) {
				second = 59;
			}
			$('#showSecond').val(second <= 9 ? ('0'+second.toString()) : second.toString());
		},
		'sysModshowRefresh': function() {
			g.setTimeRefresh();
		}
	};
	
	function showWifiList(result) {
		$("#wifi_list_content").html("");
		var totalCount = result.list.length;
		for (var i = 0; i < totalCount; i++) {
			if (result.list[i].stype == '802.1X') {
				//todo: 若wifi安全类型为802.1X时，现在不支持连接，过滤掉
				continue;
			}
			var rowFormat = wifi_RowFormat;
			var wifiId = result.list[i].ssid;
			rowFormat = rowFormat.replace(/\[wifi_id\]/g, 'wifi_ssid' + wifiId);
			rowFormat = rowFormat.replace(/\[wifi_name\]/g, result.list[i].ssid);
			if (wifiId == result.connect) {
				rowFormat = rowFormat.replace(/\[curwificonnect\]/g, 'curwificonnect');
				rowFormat = rowFormat.replace(/\[rem_password\]/g, 'style="visibility: hidden;"');
				rowFormat = rowFormat.replace(/\[connect_mark\]/g, '');
				rowFormat = rowFormat.replace(/\[data-bind-fn\]/g, 'data-bind="disconnectWifi"');
				rowFormat = rowFormat.replace(/\[data-bind-value\]/g, '断开');
			} else {
				rowFormat = rowFormat.replace(/\[curwificonnect\]/g, '');
				rowFormat = rowFormat.replace(/\[rem_password\]/g, 'style="visibility: hidden;"');
				rowFormat = rowFormat.replace(/\[connect_mark\]/g, 'style="visibility: hidden;"');
				rowFormat = rowFormat.replace(/\[data-bind-fn\]/g, 'data-bind="connectWifi"');
				rowFormat = rowFormat.replace(/\[data-bind-value\]/g, '连接');
			}
			var levelObj = {
				'0': 'wifi-icon-none',
				'1': 'wifi-icon-low',
				'2': 'wifi-icon-lownormal',
				'3': 'wifi-icon-normal',
				'4': 'wifi-icon-highnormal',
				'5': 'wifi-icon-high'
			};
			for (item in levelObj) {
				if (item == result.list[i].level) {
					rowFormat = rowFormat.replace(/\[s-wifi-icon\]/g, levelObj[item]);
				}
			}
			$("#wifi_list_content").append(rowFormat);
		}
	}
	
	//todo: 解析xrandr -q获取的分辨率字符串
	function parseResolutSring(result) {
		
	}
	
})(jQuery, window);


//判断IP地址是否合法
function checkIpValid(ip) {
	return /^(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/.test(ip); 
}

/*todo: 检查静态IP地址、子网掩码以及网关之间是否有效
	ip: 静态IP地址
	submask： 子网掩码
	gateway: 网关
*/
function checkIpUsable(ip, submask, gateway) {
	var ip_arr = ip.split('.');
	var mask_arr = submask.split('.');
	var gw_arr = gateway.split('.');
	
	var res0 = parseInt(ip_arr[0]) & parseInt(mask_arr[0]);
	var res1 = parseInt(ip_arr[1]) & parseInt(mask_arr[1]);
	var res2 = parseInt(ip_arr[2]) & parseInt(mask_arr[2]);
	var res3 = parseInt(ip_arr[3]) & parseInt(mask_arr[3]);
	
	var gw_res0 = parseInt(gw_arr[0]) & parseInt(mask_arr[0]);
	var gw_res1 = parseInt(gw_arr[1]) & parseInt(mask_arr[1]);
	var gw_res2 = parseInt(gw_arr[2]) & parseInt(mask_arr[2]);
	var gw_res3 = parseInt(gw_arr[3]) & parseInt(mask_arr[3]);
	
	if (res0 == gw_res0 && res1 == gw_res1 && res2 == gw_res2 && res3 == gw_res3) {
		return true;
	} else {
		return false;
	}
}

//判断子网掩码是否合法
//mask: 子网掩码
function checkSubmaskValid(mask) {
	var mask_arr = mask.split('.');
	if (mask_arr.length != 4){
		return false;
	}
	var binIpString = '';
	for (var i = 0; i < 4; i++) {
		var num = parseInt(mask_arr[i]);
		var num_bin = num.toString(2);
		var iCount = 8 - num_bin.length;
		for (var j = 0; j < iCount; j++) {
			num_bin = '0' + num_bin;
		}
		binIpString += num_bin;
	}
	var subIndex = binIpString.lastIndexOf('1') + 1;
	var frontString = binIpString.substring(0, subIndex);
	var backString = binIpString.substring(subIndex);
	if (frontString.indexOf('0') != -1 || backString.indexOf('1') != -1) {
		return false;
	} else {
		return true;
	}
}

//判断url是否合法，若合法则分离出host、port
function checkCenterAddrValid(url) {
	var regExp = /^(((https?)|(http)):\/\/)?([^:\/\?]+)(:(\d+))?([^:\?]*)?(\?.*)?$/ig;
	if (!regExp.test(url)) {
		return false;
	}
	var protocol = 'https', host, port;
	url.replace(regExp, function() {
		var args = arguments;
		protocol = args[2] || 'https';
		host = args[5] || '';
		port = args[7] || '';
	});
	var result = {};
	result.protocol = protocol;
	result.host = host;
	result.port = port;
	if (port == '') {
		if (protocol.toLowerCase() == 'http') {
			result.port = '80';
		} else if (protocol.toLowerCase() == 'https') {
			result.port = '443';
		}  else {
			result.port = '443';
		}
	}
	return result;
}

//判断时间日期是否合法
function checkdateFormat(hour, minute, second) {	
	var regExp = /^\d{2}$/;
	var hregExp = /^\d{1,2}$/;
	if (!hregExp.test(hour) || !regExp.test(minute) || !regExp.test(second)) {
		return false;
	}
	
	var hour = parseInt(hour);
	var minute = parseInt(minute);
	var second = parseInt(second);
	if (hour<0 || hour>23 || minute<0 || minute>59 || second<0 || second>59) {
		return false;
	}
	return true;
}















