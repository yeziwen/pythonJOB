/* 
 * ui js for vdi 4.7; 
 * author: ch; 
 * updated at 2015-9-14
 */
;(function ($, window) {
 //获取eclog模块，统一打日志接口
    var eclog = require('eclog');
    
    var g = window.app = {
        //初始化界面，绑定界面相关动作；
        "CscmObj": null,
        "FirstGroupId": "0",
        "defaultResId": "0",
        "FirstrefreshRC": false,
        "islogin": false,
        "logoutTime": 0,
        "vdiAddr": null,
        "confXML": "",
        "rclistXML": "",
        "chgPwdEnable": '1',
        "curModPwdAction": '1',
        "curVMElement": null,   
        "nwglobvalObj": null,
        "nwhttpsObj": null,
        "nwsystemObj": null,
        "init": function () {
            $("#rclist").on("mousedown", function (e) {
                e = e || window.event;
                var el = e.target || e.srcElement;
                var $el = ($(el).attr("class") === "show") ? $(el) : $(el).parents("dl");
                $el.addClass("click_down");
            }).on("mouseup", function () {
                $(".click_down").removeClass("click_down");
            });
            
            var fn = function (e) {
                e = e || window.event;
                var el = e.target || e.srcElement;
                var $el = g.getEventEl(el);
                if (g.isBlank(el)) {
                    $(".m-menu, .m-tips-box").hide("fast");
                }

                if (!!$el.attr("data-toggle")) {
                    g.toggleMenu($el);
                } else if (!!$el.attr("data-bind")) {
                    g.handleAction($el);
                }
            };
            
            $(document).on("click", fn);
            $(document).on("touchup", fn);

            //初始化环境参数
            g.initEnvConfig();
            
            g.refreshRC(0);
            //g.refreshClock();
            //g.refreshLoged();
            g.refreshUser();
            /*window.setInterval(function () {
                g.refreshClock();
                g.refreshLoged();
                g.refreshStatus();
            }, 1500);*/
        },
        //判断鼠标点击是否在空白的位置，用于隐藏浮动对象
        "isBlank": function (el) {
            return !($(el).parents("*[data-toggle]").length > 0 || $(el).attr("data-toggle") !== undefined);
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
        //切换资源组
        "switchGroup": function ($el) {
            var id = $el.attr("data-grpid");
            $(".groups li").removeClass("seled");
            g.refreshRC(id);
        },
        //时钟插件
        "refreshClock": function () {
            var now = new Date();
            var t = now.format("hh:mm");
            var DD = VDI_CLIENT_CONFIG.WEEKDAY.split("|");
            var d = now.format(VDI_CLIENT_CONFIG.DATEFMT) + DD[now.format("D")];
            $("#clock").html(t).attr("title", d);
        },
        //更新用户状态与服务器通知
        "refreshStatus": function () {
            return;
            var ConnectStaus = g.CscmObj.IsConnectVDC();

            if (ConnectStaus && g.islogin) {
                $("#connectstatus").attr({"title": "VDI在线", "class": "icon-connection-normal"});
            }
            else if (ConnectStaus && !g.islogin) {
                $("#connectstatus").attr({"title": "VDI离线", "class": "icon-connection-alert"});
            }
            else if (!ConnectStaus && g.islogin) {
                $("#connectstatus").attr({"title": "VDI离线", "class": "icon-connection-error"});
            }
        },
        "getRcsLength": function(xml){
            return  $(xml).find("Resource>Rcs>Rc").length;
        },
        "getRcGroupLength": function(xml){
            return  $(xml).find("Resource>RcGroups>Group").length;
        },
        //刷新资源组内容
        "refreshRC": function (grpid) {
            //grpid = grpid || "0";
            var twfId = "";
            if (g.nwglobvalObj.valin("TWFID")) {
                twfId = g.nwglobvalObj.getval("TWFID");
            }
            var cookie = "TWFID=" + twfId;
            var options = {
                    host: g.vdiAddr,
                    port: VDI_CLIENT_CONFIG.PORT,
                    path: VDI_CLIENT_CONFIG.PROXY,
                    method: 'POST',
                    rejectUnauthorized: false,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': cookie
                    }
                };
            $req({
                url: VDI_CLIENT_CONFIG.PROXY,
                before: g.mask,
                success: function (xml) {
                    //对接收到的rclist进行渲染；
                    g.rclistXML = xml;
                    xml = "<xml>" + xml + "</xml>";
                    g.rcs_length = g.getRcsLength(xml) - GetIpRcCout(xml);
                    g.group_length = g.getRcGroupLength(xml);
                    var grps = {"groups": parseRCGROUPS(xml)};
                    grpid = grpid || g.FirstGroupId;
                    var list = {"list": parseRC(xml, grpid)};
                    //var grps = {"groups": parseRCGROUPS(xml)};
                    $("#rcgrps").html(template("rcgrps_tmp", grps));
                    $("#rclist").html(template("rclist_tmp", list));
                },
                after: function () {
                    var len = g.rcs_length;
                    var GroupLen = g.group_length;
                    if (len == 1 || (len <= 3 && GroupLen <= 2 && VDI_CLIENT_CONFIG.LESS_TO_CENTER)) {
                        g.center(); //设置居中为单列
                    } else {
                        g.grid(); //设置为九宫格
                        $("#rcgrps li[data-grpid=" + grpid + "]").addClass("seled");
                    }
                    g.unmask();
                    
                    //只有一个资源或者配置了默认资源,且只支持独享桌面
                    /*if (g.FirstrefreshRC && g.CscmObj && g.defaultResId != "0") {
                        g.FirstrefreshRC = false;
                        //用户认证成功了，但是服务可能还没起来
                        var ret = g.CscmObj.doConfigure("CONF SETTING RAPPEXEC " + g.defaultResId + "&amp;");
                    }*/
                    //如果不存在不符合密码策略的情况，只配置了一个资源或者默认资源
                    if (g.curModPwdAction == '1') {
                        if (g.nwsystemObj && g.defaultResId != "0" && g.rclistXML != "") {
                            var rclistXML = '<xml>' + g.rclistXML + '</xml>';
                            $(rclistXML).find('Resource>Rcs>Rc').each(function(index, el) {
                                if ($(el).attr('id') == g.defaultResId) {
                                    g.openrc(el);
                                }
                            });
                        }
                    }
                }
            }, options, {});
        },
        //更新下用户名称
        "refreshUser": function () {
            var twfId = "";
            if (g.nwglobvalObj.valin("TWFID")) {
                twfId = g.nwglobvalObj.getval("TWFID");
            }
            var cookie = "TWFID=" + twfId;
            var options = {
                    host: g.vdiAddr,
                    port: VDI_CLIENT_CONFIG.PORT,
                    path: VDI_CLIENT_CONFIG.AUTH_SVR,
                    method: 'POST',
                    rejectUnauthorized: false,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': cookie
                    }
                };
            $req({
                url: VDI_CLIENT_CONFIG.AUTH_SVR,
                before: g.mask,
                success: function (xml) {
                    g.confXML = xml;   //打开资源时将conf.xml写入文件供spicec读取
                    xml = "<xml>" + xml + "</xml>";
                    var username = parseConf(xml);
                    $("#username").html(username);
                },
                after: function () {
                    g.unmask();
                }
            }, options, {});
        },
        //操作遮罩
        "mask": function () {
            $("#mask").show();
        },
        //隐藏遮罩
        "unmask": function () {
            $("#mask").hide();
        },
        //如果资源内容小于3个，将其折叠居中
        "center": function () {
            $("#mainContainer").removeClass("grid").addClass("center");
            var el = $("#mainContainer .inner"), h = el.height();
            el.css({"top": (-h / 2) + "px"});
            g.animate();
        },
        //如果资源内容大于3个则变换为九宫格模式
        "grid": function (grpid) {
            $("#mainContainer").removeClass("center").addClass("grid");
            if (!VDI_CLIENT_CONFIG.ANIMATE) {
                return;
            }
            var rcs = $("#rclist dl"), l = rcs.length, index = 0, i = 0;
            do {
                $('<dl class="empty"><dt><img src="../imgs/s.png"></dt><dd>&nbsp;</dd></dl>').appendTo("#rclist");
                i++;
            } while (i + l < VDI_CLIENT_CONFIG.PAGE_SIZE);
            g.animate();
        },
        //刷新资源时的动画；基于CSS3
        "animate": function () {
            var rcs = $("#rclist dl"), l = rcs.length, index = 0, i = 0;
            g.timer = window.setInterval(function () {
                $("#rclist dl").eq(index).addClass("flipIn");
                if (index >= VDI_CLIENT_CONFIG.PAGE_SIZE) {
                    window.clearInterval(g.timer);
                    setTimeout(function () {
                        $("#rclist dl").removeClass("flipIn").addClass("show");
                    }, 500);
                }
                index++;
            }, 50);
        },
        //切换菜单及浮动信息框
        "toggleMenu": function (el) {
            var target = el.attr("data-toggle") || "";
            $(".m-menu,.m-tips-box").each(function (index, itm) {
                var id = "#" + $(itm).attr("id");
                if (id !== target) {
                    $(itm).hide("fast");
                }
            });
            $(target).toggle("fast");
        },
        //其他事件处理；
        "confirm": function () {
            $(".confirm .inner").html();
            $(".confirm").show();
            //注销，关闭，都需要先确认一下
        },
        "person": function () {
            //个人设置对话框接口
            if (g.CscmObj) {
                g.CscmObj.ShowWindowCommand("PWDSETTING");
            }
            $("#modpassModal").show();
        },
        "system": function () {
            //todo: 系统设置接口
            if (g.CscmObj) {
                g.CscmObj.ShowWindowCommand("SYSSETTING");
            }
        },
        "about": function () {
            if (g.CscmObj) {
                g.CscmObj.ShowWindowCommand("ABOUT_INFO");
            }
        },
        "refreshLoged": function () {
            //因jQuery会遍历HTML element导致意外触发SFChrome插件，因此这里改用原生js接口获取指定的对象；
            try {

                var $$ = function (a) {
                    return document.getElementById(a);
                };
                var els = [$$("userinfo"), $$("mainContainer"), $$("power-menu-logout")];

                if (g.logoutTime > 0) {
                    g.logoutTime = g.logoutTime - 1;
                    $.each(els, function (index, el) {
                        el.style.display = (g.islogin) ? "" : "none";
                    });
                }
                else {
                    var loginStaus = false;
                    if (g.CscmObj) {
                        loginStaus = g.CscmObj.IsUserLogin();
                    }
                    if (!g.islogin && loginStaus) {
                        //刷新下RClist
                        g.FirstrefreshRC = true;
                        g.refreshRC(0);
                        g.refreshUser();
                    }
                    loginStaus = true;
                    g.islogin = loginStaus;
                    $.each(els, function (index, el) {
                        el.style.display = (g.islogin) ? "" : "none";
                    });
                }

            } catch (e) {
                //alert(e.message);
            }
        },
        "logout": function () {
            //todo: 注销操作
            //5秒时间
			g.initEnvConfig();
            g.logoutTime = 7;
            g.islogin = false;
            g.FirstrefreshRC = false;
            g.confXML = '';
            g.rclistXML = '';
            g.curModPwdAction = '1';
            g.refreshLoged();
            g.defaultResId = "0";
            g.exelogout();
            //setTimeout(g.unmask, 2000); //动画演示，2秒后隐藏注销
        },
        "exelogout": function(){
            $(document).unbind('click');
            $(document).unbind('touchup');
            //注销命令
            var headers = authlogin.unpackAllCookie();

            var host = g.vdiAddr;
            var port = g.nwglobvalObj.getval('port');
            var path = "/por/logout.csp?r=0.123456";

            var options = {
                host: host,
                port: port,
                path: path,
                method: 'GET',
                headers: headers,
                rejectUnauthorized: false
            };
            g.nwhttpsObj.httpsRequset(options,null,null,null);
			authlogin.setLoginStatus(false);
            //通知tcagent注销
            authlogin.logoutsucc(g.nwglobvalObj.getval("TWFID"));
            authlogin.globalval.setval("ENABLE_RANDCODE","O");
            $("#content").load("login.html",function(){
                authlogin.init(true);        
            });
        },
        "openrc": function (el) {
            var svc = $(el).attr("svc");
            var id = $(el).attr("id");
            g.curVMElement = el;   //保存当前虚拟机对应的元素，在后面重置虚拟机有用到
            
            if (svc == "VIRTUALDESK" || svc == "REMOTEAPP" || svc == "SHAREDESK"){
                if (g.nwsystemObj) {
                    showProgressBar();
                    handleProgressBar('GETVMCONF');    //正在获取配置...
					
					var queryVDCount = 0;
					var qvdsuccessfn = function(result) {
						var vmconfObj = $.parseJSON(result);
						
						if (vmconfObj.res_state != ADESK_QUERY_STATUS.VDI_QUERY_STATE_OK) {
							eclog.log('queryVDCount: ' + queryVDCount);
							if (++queryVDCount >= 5) {
								hideProgressBar();
								$(document.body).tips({side:"top", msg: '获取独享桌面资源配置失败，请联系管理员!', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
								return ;
							}
							setTimeout(function() {
								g.nwsystemObj.queryVDesktop({resid: id}, qvdsuccessfn, qvdfailedfn);
							}, 5000); 
							return ;
						} 
						
						handleProgressBar('WRITEVMCONF');
						if (!g.nwsystemObj.writeConfXMLSync(g.confXML)) {
							eclog.log('write usb black and white list failed');
							hideProgressBar();
							$(document.body).tips({side:"top", msg: '写入USB配置失败!', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
							return ;
						}
						
						$('#openrcprogBar .progress-tip .m-prog-text').text(APPTRACER.CONNECTINGVM);
						var t = setInterval(function() {
							var w = $('#openrcprogBar .progress .green').css('width');
							w = parseInt(w.replace(/px/g, ''));
							w += 50;
							if (w > 500) {
								w = 500;
								clearInterval(t);
							}
							$('#openrcprogBar .progress .green').css('width', w+'px');
							$('#openrcprogBar .progress-tip .m-prog-percent').text(parseInt(w*100/560).toString() + '%');
						}, 50);
						
						var spicecpid = g.nwsystemObj.openVDesktop(vmconfObj, function(result) {
							//todo: 打开spiece进程成功，此时会通知nodejs，收到通知后去掉进度条提示
							eclog.log('openVDesktop success');
							handleProgressBar('CONNECTSUCCESS');
							g.nwglobvalObj.setval('spicecpid', "-1");
						}, function(error) {
							eclog.log('openVDesktop failed');
							hideProgressBar();
							$(document.body).tips({side:"top", msg: '打开spicec失败!', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
							g.nwglobvalObj.setval('spicecpid', "-1");
						});
						g.nwglobvalObj.setval('spicecpid', spicecpid);
					};
					
					var qvdfailedfn = function(error) {
						eclog.log('queryVDesktop failed');
						hideProgressBar();
						$(document.body).tips({side:"top", msg: '获取虚拟机配置失败!', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
					};
					
					//todo: 查询虚拟机配置,参数：资源id、成功回调、失败回调
					g.nwsystemObj.queryVDesktop({resid: id}, qvdsuccessfn, qvdfailedfn);
				
                } else {
                    //todo: 打开资源失败，提示模块未加载
                    eclog.log('systemcall module not loaded');
                }
            }
            else if (svc == "Terminal Service"){
                var apppath = $(el).attr("app_path");
                var name = $(el).attr("name");
                var config = String.format("CONF STARTPROGRAM {0}", base64encode(String.format("{0}|{1}|{2}", id, name, apppath)));
                if (g.CscmObj) {
                    g.CscmObj.doConfigure(config);
                }
            }
        },
        "restartVM": function(data) {
            //todo: 重启虚拟机
            if (g.nwsystemObj) {
				$('#openrcprogBar .container-border .m-prog-percent').hide();
				$('#openrcprogBar .container-border .progress').hide();
				$('#openrcprogBar .container-border h3').text('信息提示');
				$('#openrcprogBar .container-border .m-prog-text').text('正在发送虚拟机重启命令...');
				showProgressBar();
                g.nwsystemObj.resetVDesktop({resid: $(g.curVMElement).attr('id')}, function(ret) {
                    //todo: 重置虚拟机返回，需要再次请求该虚拟机
                    ret = $.parseJSON(ret);
                    if (ret.result == '1') {
						setTimeout(function() {
							$('#openrcprogBar .container-border .m-prog-text').text('虚拟机重启命令发送成功');
							//todo: 获取重启的虚拟机的资源元素
							setTimeout(function() {
								$('#openrcprogBar .container-border h3').text('请稍候...');
								$('#openrcprogBar .container-border .m-prog-percent').show();
								$('#openrcprogBar .container-border .progress').show();
								g.openrc(g.curVMElement);
							}, 3000);
						}, 4000);
                    } else {
						hideProgressBar();
						$('#openrcprogBar .container-border h3').text('请稍候...');
						$('#openrcprogBar .container-border .m-prog-percent').show();
						$('#openrcprogBar .container-border .progress').show();
						$(document.body).tips({side:"top", msg: '重启虚拟机失败!', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
					}
                }, function(error) {
                    eclog.log('reset VM failed');
					hideProgressBar();
					$(document.body).tips({side:"top", msg: '重启虚拟机失败!', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
                });
            }
        }, 
        "error": function (msg) {
            console.info(msg);
        },
        "restart": function () {
            //todo: 重启
            if (g.CscmObj) {
                g.CscmObj.PowerCommand("RE_START");
            }
        },
        "switchToLocal": function () {
            //todo: 切换到本地桌面
            if (g.CscmObj) {
                g.CscmObj.PowerCommand("DDESKTOP");
            }
        },
        "shutdown": function () {
            //todo: 关机
            if (g.CscmObj) {
                g.CscmObj.PowerCommand("SHUTDOWN");
            }
        },
        "initEnvConfig": function() {
            //todo: 初始化环境参数，加载模块、VDI中心管理器地址等
            if (g.nwglobvalObj == null) {
                g.nwglobvalObj = require("globalval");
            } 
            if (g.nwhttpsObj == null) {
                g.nwhttpsObj = require("nodehttps");
            }
            if (g.nwsystemObj == null) {
                g.nwsystemObj = require("systemcall");
            }
            if (g.nwglobvalObj.valin("VDIADDR")) {
                g.vdiAddr = g.nwglobvalObj.getval("VDIADDR");
            }
        },
        'confirmModPass': function() {
            var pripsw = $('#orgPassword').val();
            var newpsw = $('#newPassword').val();
            var conpsw = $('#confirmPassword').val();
            if (newpsw != conpsw) {
                $('#confirmPassword').tips({side: "bottom", msg: '两次密码输入不一致，请重新输入', cls: 'error-tips', time: 5, x: 3, y: 0});
                return ;
            }

            var twfId = "";
            if (g.nwglobvalObj.valin("TWFID")) {
                twfId = g.nwglobvalObj.getval("TWFID");
            }
            var cookie = "TWFID=" + twfId;
            var options = {
                    host: g.vdiAddr,
                    port: VDI_CLIENT_CONFIG.PORT,
                    path: VDI_CLIENT_CONFIG.CHANGEPWD,
                    method: 'POST',
                    rejectUnauthorized: false,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Cookie': cookie,
                        'Referer': 'https://' + g.vdiAddr + VDI_CLIENT_CONFIG.CHANGEPWD_REFERER
                    }
                };
            var contents = {
                pripsw: pripsw,
                newpsw: newpsw,
                cknote: 0
            };
            $req({
                url: VDI_CLIENT_CONFIG.CHANGEPWD,
                success: function (eCode) {
                    changepswResult($.trim(eCode));
                }
            }, options, contents);
        },
        'unconfirmModPass': function() {
            $("#modpassModal").hide();
        },
        'passModalClose': function() {
            $("#modpassModal").hide();
        },
		'hideprogBar': function() {
			hideProgressBar();
		}
    };
	
	//setInterQuery 循环计时器 
	/*
	 * fn: 表示需要回调的函数
	 * ftime: 表示第一次需要延迟多长时间执行
	 * ltime：表示以后每隔多长时间执行
	 */
	function setInterQuery(fn, ftime, ltime) {
		var timeCfg = {cancel:false};
		var fn1 = function() {
			fn(timeCfg);
			if (!timeCfg.cancel) {
				setTimeout(fn1, ltime);
			}
		}
		window.setTimeout(fn1, ftime);
	}
    
    //处理进度条状态
    function handleProgressBar(progString, curw) {
        var index = 1;
        var w = $('#openrcprogBar .progress').css('width').replace(/px/g, '');
        switch(progString) {
            case "GETVMCONF":
                index = 1;
                break;
            case "WRITEVMCONF":
                index = 2;
                break;
            case "CONNECTINGVM":
                index = 3;
                break;
            case "CONNECTSUCCESS": 
                index = 4; 
                break;
            default: break;
        }
        
        if (index == 4) {
            $('#openrcprogBar .progress .green').css('width', w.toString() + 'px');
            $('#openrcprogBar .progress-tip .m-prog-percent').text('100%');
        } else {
            $('#openrcprogBar .progress-tip .m-prog-text').text(APPTRACER[progString]);
            $('#openrcprogBar .progress .green').css('width', parseInt(index*w/3).toString() + 'px');
            $('#openrcprogBar .progress-tip .m-prog-percent').text(parseInt(index*100/3).toString() + '%');
        }
    }
    
    //显示进度条
    function showProgressBar() {
        $('#openrcprogBar').css({"display": "block"});
    }
    
    //隐藏进度条
    function hideProgressBar() {
        setTimeout(function() {
            $('#openrcprogBar').css({"display": "none"});
        }, 200);
    }
    
    //解析修改密码结果
    function changepswResult(eCode) {
        if (eCode == null || eCode == "" || eCode.match(/^[0-9]|[1-9][0-9]$/) == null) {
            $(document.body).tips({side:"top", msg: '修改密码失败,可能是网络连接错误', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
            return;
        }
        
        if (eCode == "0") {    
            $('#orgPassword').val('');
            $('#newPassword').val('');
            $('#confirmPassword').val('');
            $(document.body).tips({side:"top", msg: '密码修改成功!', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
            if (g.curModPwdAction == '0') {
                g.curModPwdAction = '1';
                g.nwglobvalObj.setval("pwp_errorcode", -1);   //修改成功后设置pwp_errorcode为-1
                var $pwd_arr = $('#modpassModal .bs-example div');
                $pwd_arr.eq(0).show();
                $pwd_arr.eq(1).css({"paddingTop": "5px"});
                $('#modpassModal button[data-bind="passModalClose"]').removeAttr('disabled');
                $('#modpassModal button[data-bind="unconfirmModPass"]').removeAttr('disabled');
            }
            $("#modpassModal").hide();
        } else {
            if (eCode < 20) {
                var $tipsEl = $('#orgPassword');
                if (g.curModPwdAction == '0') {
                    $tipsEl = $('#newPassword');
                }
                $tipsEl.tips({side: "bottom", msg: errCode.chgpsw[eCode], cls: 'error-tips', time: 5, x: 3, y: 0});
                
                if(eCode == "4" && g.curModPwdAction == '1'){
                    $('#orgPassword').val('');
                    $('#orgPassword').focus();
                } else {
                    $('#newPassword').val('');
                    $('#newPassword').focus();
                }
            } else {
                var alertMsg = getPwdStrategyResult(eCode);
                $('#newPassword').tips({side: "bottom", msg: alertMsg, cls: 'error-tips', time: 5, x: 3, y: 0});
            }
        }
    }
    
    //初始化时用来处理密码策略，如不符合策略则弹出修改密码框
    function handlePwdStrategy() {
        if (g.nwglobvalObj.valin("pwp_errorcode")) {
            //todo: eCode默认值为-1，若大于0，则表示不符合密码策略
            eCode = g.nwglobvalObj.getval("pwp_errorcode");
            if (eCode >= 0) {
                //todo: 区分是否是初始化处理密码策略问题(为0)，还是个人设置处理密码策略问题(为1)
                g.curModPwdAction = '0';
                var alertMsg = getPwdStrategyResult(eCode);   //获取密码策略结果
                var $pwd_arr = $('#modpassModal .bs-example div');
                $pwd_arr.eq(0).hide();
                $pwd_arr.eq(1).css({"paddingTop": "20px"});
                $('#modpassModal').show();
                $('#newPassword').tips({side: "bottom", msg: alertMsg, cls: 'error-tips', time: 5, x: 3, y: 0});
                //如果登录时不符合密码策略，则强制要求修改密码，屏蔽掉关闭按钮和取消按钮
                $('#modpassModal button[data-bind="passModalClose"]').attr({"disabled": "disabled"});
                $('#modpassModal button[data-bind="unconfirmModPass"]').attr({"disabled": "disabled"});
            }
        }
    }
    
    function getPwdStrategyResult(eCode) {
        eCode -= 20;
        var index = 0;
        var alertMsg = "对不起,按照当前的密码策略,您的密码不符合以下密码策略:";
        if (eCode & 1) {
            var minLength = 0;
            var g_pwd_minlen = $('<xml>'+g.confXML+'</xml>').find('Conf>Other').eq(0).attr('psw_minlen');
            if (g_pwd_minlen != "") {
                minLength = g_pwd_minlen;
            }    
            alertMsg += (++index + ": 密码长度不小于" + minLength.toString() + "位.");
        }
        if (eCode & 8)alertMsg += (++index + ": 密码不能包含用户名.");
        if (eCode & 64)alertMsg += (++index + ": 密码必须包含数字.");
        if (eCode & 128)alertMsg += (++index + ": 密码必须包含字母.");
        if (eCode & 256)alertMsg += (++index + ": 密码必须包含特殊字符.");
        if (eCode & 512)alertMsg += (++index + ": 新密码不能与旧密码完全相同.");
        return alertMsg;
    }
    
    //获取rclist资源中，l3vpn资源的个数(dns资源)
    function GetIpRcCout(xml) {
        var l3vpncout = 0;
        var otherRes = 0;
        var id = "0";
        $(xml).find("Resource>Rcs>Rc").each(function (index, element) {
            var $el = $(element);
            //排除下DNS下发的
            if($el.attr("type") == "2"){
                l3vpncout++;
            }
            else{
                otherRes++;
                id = $el.attr("id");
            }
        });
        
        //如果只有一个资源就赋值
        if (otherRes == 1){
            g.defaultResId = id;
        }
        
        return l3vpncout;
    }

    //解析资源格式为json以便于输出；(调用parseRC之前必须先调用GetIpRcCout，否则默认资源处理会有点问题)
    function parseRC(xml, grpid) {
        var rc = [];
        $(xml).find("Resource>Rcs>Rc").each(function (index, element) {
            var $el = $(element);
            //排除下DNS下发的
            if(($el.attr("rc_grp_id") == grpid) && $el.attr("type") != "2"){
                rc.push({
                    id: $el.attr("id") || "",
                    name: $el.attr("name") || "",
                    //img: $el.attr("rc_logo") || "shareDesk.png",
                    svc: $el.attr("svc") || "",
                    app_path: $el.attr("app_path") || "",
                    img: $el.attr("rc_logo") || "shareDesk.png",
                    description: $el.attr("description") || "",
                    group: $el.attr("rc_grp_id") || 0
                });
            }
        });
        
        //如果不是单个资源的情况，就去查找默认资源
        if (g.defaultResId == "0"){
            $(xml).find("Resource>Other").each(function (index, element) {
                var $el = $(element);
                g.defaultResId = $el.attr("defaultRcId") || "0";
            });
        }
        
        return rc;
    }
    //解析conf.xml读取用户名并设置session配置数据
    function parseConf(xml) {
        var username;
        var sslctx;
        var twfid = '';
        $(xml).find("Conf>Other").each(function (index, element) {
            var $el = $(element);
            username = $el.attr("login_name") || "Admin";
            sslctx = $el.attr("sslctx") || "";
            //判断是否允许用户修改密码，若不允许，则隐藏掉修改密码选项
            g.chgPwdEnable = $el.attr('chg_pwd_enable') || '1';
            if (g.chgPwdEnable == '1') {
                $('#top-setting-menu div').first().show();
            } else {
                $('#top-setting-menu div').first().hide();
            }
        });
        if (g.nwglobvalObj.valin("TWFID")) {
            twfid = g.nwglobvalObj.getval("TWFID");
        }
        var session = {'twfid': twfid, 'sslctx': sslctx, 'username': username};
        if (g.nwsystemObj) {
            g.nwsystemObj.setSessionconf(session, function() {}, function() {});
        }
        //处理密码策略
        handlePwdStrategy();
        
        return username;
    }

    //解析资源组为json以便于输出；
    function parseRCGROUPS(xml) {
        var grps = [];
        $(xml).find("Resource>RcGroups>Group").each(function (index, element) {
            var $el = $(element);
            if (parseInt($el.attr("id"), 10) >= 0) {
                if (g.rcs_length == 1){
                    //处理只有一个资源，但是配置了内网dns解析的情况
                    if (g.FirstGroupId == "0")    g.FirstGroupId = $el.attr("id");
                }else{
                    if (index == 0) g.FirstGroupId = $el.attr("id");
                }
                grps.push({
                    "id": $el.attr("id") || "",
                    "name": $el.attr("name") || ""
                });
            }
        });
        return grps;
    }
    
    //封装https请求；
    function $req(o, options, contents) {
        o = $.extend({
            url: "",
            before: function () {
            },
            success: function () {
            },
            after: function () {
            }
        }, o);
        if (typeof o.before == "function") {
            o.before();
        }
        g.nwhttpsObj.httpsRequset(options, contents, function(res, data) {
            //todo: 这里不需要将data封装成xml对象，有的数据不是xml格式
            o.success(data);
            window.setTimeout(function() {
                if (typeof o.after == "function") {
                    o.after();
                }
            }, 200);
        }, function(res, err) {
            g.error('https response failed!');
        });
    }
    
    
})(jQuery, window);



 var Base64 = {
 
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
 
        input = Base64._utf8_encode(input);
 
        while (i < input.length) {
 
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
 
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
 
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
 
            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
 
    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
 
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
        while (i < input.length) {
 
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
 
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
 
            output = output + String.fromCharCode(chr1);
 
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
 
        }
 
        output = Base64._utf8_decode(output);
 
        return output;
 
    },
 
    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
 
        for (var n = 0; n < string.length; n++) {
 
            var c = string.charCodeAt(n);
 
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
 
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
 
        while ( i < utftext.length ) {
 
            c = utftext.charCodeAt(i);
 
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
 
        }
 
        return string;
    }
 
}
function base64encode(input){
    return Base64.encode(input);
} 
function base64decode(input){
    return Base64.decode(input);
}


//日期格式化函数；
Date.prototype.format = function (format) //author: meizz
{
    $this = this;
    var o = {
        "M+": $this.getMonth() + 1, //month
        "D+": $this.getDay(),
        "d+": $this.getDate(), //day
        "h+": $this.getHours(), //hour
        "m+": $this.getMinutes(), //minute
        "s+": $this.getSeconds(), //second
        "q+": Math.floor(($this.getMonth() + 3) / 3), //quarter
        "S": $this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1,
                ($this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

String.format = function() {
    if( arguments.length == 0 )
        return null; 
    var str = arguments[0]; 
    for(var i=1;i<arguments.length;i++) {
        var re = new RegExp('\\{' + (i-1) + '\\}','gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
};

