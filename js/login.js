/*
 ** Author: cyc
 ** Date: 2015-09-15
 ** Function: Auth Login Module
 */
var authlogin = (function($,window){

	/*
	** 全局变量
	 */
	var LOGIN_AUTH = "/por/login_auth.csp";//预登录请求页面
	var LOGIN_PSW  = "/por/login_psw.csp"; //登录请求页面
	var RAND_CODE  = "/por/rand_code.csp"; //图形校验码
	var RAND_ERROR = "校验码错误或校验码已过期"; //不能改
	var PWD_ERROR  = "pwp_errorcode="; //密码策略错误码
	/*
	** 引用全局nodejs模块
	 */

	var globalval    = require('globalval');
    var globalconf   = require('configconst');
    var nodehttps    = require('nodehttps');
    var systemcall   = require('systemcall');
    var socketaction = require('socketaction');
	var eclog        = require('eclog');

	return {

		globalval: globalval,
		socketaction: socketaction,
		eclog: eclog,
		systemcall:systemcall,
		//isecstart: false：ec刚起来，如果有自动登录需要自动登录
		init: function(isecstart){
			
			var isecstart = isecstart;
			var selecturl = authlogin.globalval.getval('VDIADDR');
			var userdata  = authlogin.globalval.getval('userdata');
			var ethstatus = authlogin.globalval.getval('ethstatus');

			if(ethstatus == "no"){
				var preloginfail = authlogin.globalval.getval('preloginfail');
				if(preloginfail  == false){
					authlogin.globalval.setval('preloginfail', true);
				}

				var str = '<span style="color:red">网线未插好，请检查网线</span>';
				authlogin.netexception(str);
				authlogin.initPage();
				authlogin.initEvent();
				authlogin.unmask();
				return;				
			} 

			if(selecturl == null){//选路异常
				authlogin.netexception(null);
				authlogin.initPage();
				authlogin.initEvent();
				authlogin.unmask();
				return;
			}else{//正常选路
				authlogin.preLogin(function(res,data){//预登录流程
					
					authlogin.dealPreLoginXML(res,data);

					var enablerandcode = authlogin.globalval.getval('ENABLE_RANDCODE');
					var isautologin  =  authlogin.globalval.getval('isautologin');

					if(isecstart == false && isautologin == "1"){//自动登录流程
						//自动登录:启用图形校验码自动登录自动失效
						var userdata = authlogin.globalval.getval('userdata');
						var username = userdata.name;
						var userpsw  = userdata.password;
						var randcode = "";//自动登录校验码为空，需要测试是否可以

						authlogin.Login(username, userpsw, randcode, function(res,data){
							var result = authlogin.dealLoginXML(false,res,data);
							if(result == true){
								//登录成功
								authlogin.unmask();
								
								$("#content").load("service.html",function(){
									window.app.init();
								});
							}else{
								
								if(result.indexOf(PWD_ERROR) !=-1){
									//启用密码策略，登录成功，记录错误码
									var index = result.indexOf(PWD_ERROR);
									var len = 14;
									var errorcode = result.substr(index + len);
									authlogin.globalval.setval('pwp_errorcode',errorcode);

									// 登录成功,发送twfid给tcagent,直接返回
									var twfid = authlogin.globalval.getval("TWFID");
									authlogin.loginsucc(twfid);
									// 设置登录状态信息
									authlogin.setLoginStatus(true);

									authlogin.unmask();

									$("#content").load("service.html",function(){
										window.app.init();
									});
								}else{
									//登录失败都重走预登录流程
									authlogin.preLogin(function(res,data){//预登录流程
										authlogin.dealPreLoginXML(res,data);

										var enablerandcode = authlogin.globalval.getval('ENABLE_RANDCODE');

										if(enablerandcode == "1"){
											authlogin.getrandcode(function(res,data){
												$('.randcode>img').attr('src','../imgs/rand_code.gif?t='+Math.random());
												authlogin.initPage();
												authlogin.initEvent();
												authlogin.unmask();
												return;				
											},function(res,err){//获取校验码异常流程

												var str = '<span style="color:red">' + result + '</span>';
												authlogin.eclog.log('自动登录失败，获取校验码失败');
												authlogin.netexception(str);
												authlogin.initPage();
												authlogin.initEvent();
												authlogin.unmask();
												return;
											});
										}else{
											var str = '<span style="color:red">' + result + '</span>';
											authlogin.netexception(str);
											authlogin.initPage();
											authlogin.initEvent();
											authlogin.unmask();
											return;	
										}
																		
									},function(res,err){//预登录异常流程
										var preloginfail = authlogin.globalval.getval('preloginfail');
										if(preloginfail  == false){
											authlogin.globalval.setval('preloginfail', true);
										}										
										authlogin.eclog.log('自动登录返回失败，预登录异常');
										authlogin.netexception(null);
										authlogin.initPage();
										authlogin.initEvent();
										authlogin.unmask();
										return;										
									});							
								}
								
							}
						},function(res,err){//自动登录异常							
							var str = '<span style="color:red">' + '自动登录失败，请检查网络' + '</span>';
							authlogin.netexception(str);
							authlogin.initPage();
							authlogin.initEvent();
							authlogin.unmask();
							return;								
						});
					}else{//正常登录流程
						if(enablerandcode == "1"){
							authlogin.getrandcode(function(res,data){
								$('.randcode>img').attr('src','../imgs/rand_code.gif?t='+Math.random());
								authlogin.initPage();
								authlogin.initEvent();
								authlogin.unmask();
								return;				
							},function(res,err){//获取校验码异常流程

								authlogin.eclog.log("正常登录流程，获取校验码异常");
								authlogin.netexception(null);
								authlogin.initPage();
								authlogin.initEvent();
								authlogin.unmask();
								return;
							});
						}else{
							authlogin.initPage();
							authlogin.initEvent();
							authlogin.unmask();
							return;					
						}	
					}

				},function(res,err){//预登录异常流程
					var preloginfail = authlogin.globalval.getval('preloginfail');
					if(preloginfail  == false){
						authlogin.globalval.setval('preloginfail', true);
					}

					var str = '<span style="color:red">网线可能未插好，请检查网线</span>';
					
					authlogin.netexception(str);
					authlogin.initPage();
					authlogin.initEvent();					
					authlogin.unmask();
					return;
				});
			}
		},
		
		//初始化页面
		initPage: function(){
			var userdata        = authlogin.globalval.getval('userdata');//user.conf配置文件

			var enableautologin = authlogin.globalval.getval('enableautologin');
			var enablesavepwd   = authlogin.globalval.getval('enablesavepwd');
			var enablerandcode  = authlogin.globalval.getval('ENABLE_RANDCODE');
			var iseditlogininfo = authlogin.globalval.getval('iseditlogininfo');

			if(enablerandcode == "1"){
				$('.randcode').css('display','block');
			}else{
				$('.randcode').css('display','none');
			}

			if(enablesavepwd != null && enablesavepwd == "0"){
				$('#label_1').css('color','rgb(56,46,46)');
				$('#rempsw').attr('disabled','disabled');
			}else{
				$('#label_1').css('color','#fff');
				$('#rempsw').removeAttr('disabled');
			}
			if(enableautologin != null && enableautologin == "0"){
				$('#label_2').css('color','rgb(56,46,46)');
				$('#autologin').attr('disabled','disabled');
			}else{
				$('#label_2').css('color','#fff');
				$('#autologin').removeAttr('disabled');
			}

			//userdata == null : 获取user.conf异常了
			if(userdata == null){
				authlogin.eclog.log('userdata异常了');
				return;
			}

			if(userdata.name != ""){
				$('#username').val(userdata.name);
			}

			if(userdata.password != ""){
				$('#userpsw').val(userdata.password);
			}

			if(userdata.password != ""){
				$('#rempsw').prop('checked',true);
			}else{
				$('#rempsw').prop('checked',false);
			}

			if(userdata.autologin != 0){
				$('#autologin').prop('checked',true);
			}else{
				$('#autologin').prop('checked',false);
			}

			if(userdata.autologin == "1" && iseditlogininfo == "1"){
				//显示修改登录信息按钮和立即登录按钮
				$('#modifylogininfo').css('display',"inline-block");
				$('#loginbtn').removeClass('loginbtn_normal');
				$('#loginbtn').addClass('loginbtn_modify');
				$('#username').attr({"readonly":"readonly"});
				$('#userpsw').attr({"readonly":"readonly"});
				$('#label_1').css('color','rgb(56,46,46)');
				$('#rempsw').attr('disabled','disabled');
				$('#label_2').css('color','rgb(56,46,46)');
				$('#autologin').attr('disabled','disabled');								
			}else{
				//显示立即登录按钮
				$('#modifylogininfo').css('display',"none");
				$('#loginbtn').removeClass('loginbtn_modify');
				$('#loginbtn').addClass('loginbtn_normal');
				$('#username').removeAttr("readonly");
				$('#userpsw').removeAttr("readonly");
				$('#label_1').css('color','#fff');
				$('#rempsw').removeAttr('disabled');	
				$('#label_2').css('color','#fff');
				$('#autologin').removeAttr('disabled');			
			}

		},
		
		//注册事件
		initEvent: function(){
			$('#rempsw').click(function(){
				checked_psw = $('#rempsw').is(':checked');
				if(!checked_psw){
					$('#autologin').prop('checked',false);
				}
			});

			$('#autologin').click(function(){
				checked_auto = $('#autologin').is(':checked');
				if(checked_auto){
					$('#rempsw').prop('checked',true);
				}
			});
			
			$("#userpsw").keyup(function(event){

  				 if(event.keyCode==13){
    					$('#loginbtn').trigger("click");
    				}
			});

			$("#modifylogininfo").click(function(e){
				$("#ecloginmodal").show();
			});

			$("#ecloginclose").click(function(e){
				$("#ecloginmodal").hide();
				$("#ecloginauthpwd").val("");
			});

			$("#eclogincancel").click(function(e){
				$("#ecloginmodal").hide();
				$("#ecloginauthpwd").val("");
			});

			$("#ecloginauthpwd").keyup(function(event){
				if(event.keyCode == 13){
					$('#ecloginconfirm').trigger("click");
				}
			});

			$("#ecloginconfirm").click(function(e){
				var password = authlogin.globalval.getval("pwdforsetlogininfo");
				var ecpwd    = $("#ecloginauthpwd").val();
				var ecpwdmd5 = hex_md5(ecpwd);

				if(password != null && ecpwdmd5 == password){
					$('#modifylogininfo').css('display',"none");
					$('#loginbtn').removeClass('loginbtn_modify');
					$('#loginbtn').addClass('loginbtn_normal');
					$('#username').removeAttr("readonly");
					$('#userpsw').removeAttr("readonly");
					$('#label_1').css('color','#fff');
					$('#rempsw').removeAttr('disabled');	
					$('#label_2').css('color','#fff');
					$('#autologin').removeAttr('disabled');
					$("#ecloginmodal").hide();						
				}else{
					$(".ecloginerror").text("输入密码错误");
					setTimeout(function(){$(".ecloginerror").text("");},3000);
				}
			});

			$("#rand_code").keyup(function(event){

  				 if(event.keyCode==13){
    					$('#loginbtn').trigger("click");
    				}
			});

			$('#changecode').click(function(){
				var ethstatus = authlogin.globalval.getval('ethstatus');
				if(ethstatus == "no"){
					var str = '<span style="color:red">网线未插好，请检查网线</span>';
					authlogin.netexception(str);
					return;
				}

				authlogin.getrandcode(function(res,data){
					$('.randcode>img').attr('src','../imgs/rand_code.gif?t='+Math.random());
				},function(res,err){
					var str = '<span style="color:red">获取验证码失败，请稍后再试</span>';
					authlogin.netexception(str);
				});
			});
			//注册登录事件
			authlogin.loginEvent();

			var fn = function(e){

				e = e || window.event;
                
                var el = e.target || e.srcElement;
                
                var $el = $(el);

                if(authlogin.isBlankforNet(el)){
                	if($('.netstatus').length > 0){
                		$('.netstatus').hide();
                	}
                	if($('.netstatus_wrap').length > 0){
                		$('.netstatus_wrap').hide();
                	}
                }

                if(authlogin.isBlankforSys(el)){
                	if($(".taskbar-menu").css('display') == "block"){
                		$(".taskbar-menu").slideUp();
                	}
                	$('.taskbar-left').css('background-image','url(../imgs/syslogo.png)');
                }

                if(authlogin.isBlankforTime(el)){
                	if($("#settime").css('display') == "block"){
                		$("#settime").hide();
                	}
                }

			};

			//注册任务栏，登录页面的click事件，目前会与资源页面重复，但还不会互相影响，后期可以考虑重构
			$(document).on('click', fn);
		},
		
		//判断鼠标点击是否在空白的位置，用于隐藏浮动对象,针对网口
		isBlankforNet:function(el){
			return !($(el).attr('id') == "sysnet" || $(el).parents("[id=sysnet]").length > 0 || 
				      $(el).parents("[class=netstatus]").length > 0 || 
				      $(el).parents("[class=netstatus_wrap]").length > 0);
		},
		//判断鼠标点击是否在空白的位置，用于隐藏浮动对象,针对taskbar-left系统设置
		isBlankforSys:function(el){
			return !($(el).attr('class') == "taskbar-left" || 
				      $(el).parents("[class=taskbar-left]").length > 0);
		},
		
		isBlankforTime:function(el){
			return !($(el).attr('class') == "sysclock" ||
						$(el).parents("[class=sysclock]").length > 0);
		},
		//注册登录事件
		loginEvent: function(){
			//注册登录事件
			$('#loginbtn').click(function(){
				//删除错误提示框，防止用户输入用户名密码错误之后重复点击导致提示框有多个
				if($('.tips-plugin').length != 0){$('.tips-plugin').remove();}
				
				//检查网线是否插入
				var ethstatus  = authlogin.globalval.getval('ethstatus');
				var wifidata   = window.taskbar.wifiresult;//任务栏实时维护的wifidata

				if(ethstatus == "no" && wifidata.connect == ""){
					var str = '<span style="color:red">网线未插好或没有可用的无线网络</span>';
					authlogin.netexception(str);
					return;					
				}

				//检查selecturl是否存在
				var selecturl = authlogin.globalval.getval('VDIADDR');
				if(selecturl == null){
					authlogin.netexception(null);
					return;
				}
				//校验用户名和密码
				var username = $("#username").val();
				var userpsw  = $("#userpsw").val();

				var enablerandcode = authlogin.globalval.getval('ENABLE_RANDCODE');
				var ishide     = $('.randcode').css('display');

				if(ishide == 'block' && enablerandcode == "1"){
					var randcode = $("#rand_code").val();
					if(randcode == ""){
						var str = '<span style="color:red">请输入校验码</span>';
						authlogin.netexception(str);
						return;						
					}
				}else{
					var randcode = "";
				}
				

				if(username == ""){
					var str = '<span style="color:red">用户名或者密码不能为空</span>';
					authlogin.netexception(str);
					return;
				}

				var checkName = authlogin.checkName(username);

				if(!checkName){
					var str = '<span style="color:red">用户名不合法</span>';
					authlogin.netexception(str);
					return;
				}

				var preloginfail = authlogin.globalval.getval('preloginfail');
				if(preloginfail == true){
					authlogin.preLogin(function(res,data){
						authlogin.dealPreLoginXML(res,data);
						authlogin.globalval.setval('preloginfail', false);
						authlogin.fireLogin(username,userpsw,randcode);
						return;
					},function(res,err){
						authlogin.globalval.setval('preloginfail', false);
						authlogin.eclog.log("预登录失败，再次预登录失败，请检查网络");
						var str = '<span style="color:red">网络可能不通，请检查网络</span>';
						authlogin.netexception(str);
						return;
					});
				}else{
					authlogin.fireLogin(username,userpsw,randcode);
					return;
				}
			});

		},

		//一切条件成熟之后，点击立即登录按钮，触发的登录操作
		fireLogin: function(username,userpsw,randcode){
			authlogin.Login(username,userpsw,randcode,function(res,data){
				//处理登录返回数据
				var result = authlogin.dealLoginXML(true,res,data);

				if(result === true){
					//登录成功,设置登录状态
					$("#content").load("service.html",function(){
						window.app.init();
					});					
				}else{
					
					if(result.indexOf(PWD_ERROR) !=-1){
						
						var index = result.indexOf(PWD_ERROR);
						var len = 14;
						
						//密码策略
						var errorcode = result.substr(index + len);
						authlogin.globalval.setval('pwp_errorcode',errorcode);

						//用户信息
						var userdata = authlogin.updateUserdata();
						authlogin.setuserconf(userdata);
						
						//设置登录状态
						authlogin.setLoginStatus(true);
						
						// 登录成功,发送twfid给tcagent,直接返回
						var twfid = authlogin.globalval.getval("TWFID");
						authlogin.loginsucc(twfid);

						//加载资源页面
						$("#content").load("service.html",function(){
							window.app.init();
						});	

					}else{
						//登录失败了，都重走一次预登录，获取最新的配置
						authlogin.preLogin(function(res,data){//预登录流程
							authlogin.dealPreLoginXML(res,data);
							var enablerandcode = authlogin.globalval.getval('ENABLE_RANDCODE');
							if(enablerandcode == "1"){
								//重新获取校验码
								authlogin.getrandcode(function(res,data){
									$('.randcode').css('display','block');
									$('.randcode>img').attr('src','../imgs/rand_code.gif?t='+Math.random());	
								},function(res,err){
									authlogin.eclog.log('获取图形校验码异常');
								});									
							}else{
								$('.randcode').css('display','none');
							}								
						},function(res,err){//预登录异常流程
							var preloginfail = authlogin.globalval.getval('preloginfail');
							if(preloginfail  == false){
								authlogin.globalval.setval('preloginfail', true);
							}								
							authlogin.eclog.log('失败之后的预登录异常');
						});

						var str = '<span style="color:red">' + result + '</span>';
						authlogin.netexception(str);
					}					
				}
			},function(res,err){
				authlogin.netexception(null);
				return;
			});	
		},

		//预登录
		preLogin: function(success,fail){
			var host   = authlogin.globalval.getval("VDIADDR");
			var port   = authlogin.globalval.getval("port");
			var path   = LOGIN_AUTH + "?dev=x86&type=cs&language=zh_CN&cli=vdi";
			var method = "GET";
			var options = {
				host: host,
				port: port,
				path: path,
				method: method,
				rejectUnauthorized: false
			};
			nodehttps.httpsRequset(options, null, function(res,data){
				success(res,data);
			},function(res,err){
				fail(res,err);
			});
		},

		//登录
		Login:	function(name,psw,randcode,success,fail){
			var username = name;
			var userpsw  = psw;
			var randcode = randcode;
			var host     = authlogin.globalval.getval("VDIADDR");
			var port     = authlogin.globalval.getval('port');
			
			var isEncrypt = 1; //默认加密

			userpsw = authlogin.doEncrypt(userpsw);

			if(randcode == ""){
				var contents = {
					svpn_name: username,
					svpn_password: userpsw,
					svpn_rand_code:""				
				};
			}else{
				var contents = {
					svpn_name: username,
					svpn_password: userpsw,
					svpn_rand_code: randcode
				};			
			}

			var headers = authlogin.unpackAllCookie();
			var options = {
				host: host,
				port: port,
				path: LOGIN_PSW + "?dev=x86&type=cs&language=zh_CN&encrypt="+isEncrypt,
				method: 'POST',
				headers:headers,
				rejectUnauthorized: false
			};

			nodehttps.httpsRequset(options, contents, function(res,data){
				success(res,data);
			},function(res,err){
				fail(res,err);
			}); 
		},

		//处理预登录返回数据
		dealPreLoginXML: function(res,data){
			//console.log("dealPreLoginXML:");
			//console.log(data);
			//console.log(res);
			//
			//打包cookie，用于后续流程
			var cookies = res.headers['set-cookie'];

			authlogin.packAllCookie(cookies);

			var resData = $("<xml>" + data + "</xml>");

			var enablerandcode  = authlogin.globalval.getval('ENABLE_RANDCODE');
			var enableautologin = resData.find("Auth").find('enableautologin').text();
			var enablesavepwd   = resData.find("Auth").find('enablesavepwd').text();
			//加密密钥
			var EncryptKey      = resData.find('Auth').find('RSA_ENCRYPT_KEY').text();

			var autologin       = authlogin.globalval.getval('userdata').autologin;			
			var username        = authlogin.globalval.getval('userdata').name;
			var userpsw         = authlogin.globalval.getval('userdata').password;

			if(enableautologin == "1" && autologin == "1" 
				&& enablerandcode == "0" && username != ""){//必须这4个条件满足才能自动登录
				//是否自动登录，只用一次，EC不挂，后面都不会自动登录
				authlogin.globalval.setval('isautologin',"1");
			}

			authlogin.globalval.setval("enableautologin",enableautologin);
			authlogin.globalval.setval("enablesavepwd",enablesavepwd);
			authlogin.globalval.setval("rsaencryptkey",EncryptKey);
			
			return; 	
		},

		//处理登录返回数据
		dealLoginXML: function(first,res,data){
			//console.log("dealLoginXML:");
			//console.log(data);
			//console.log(res);

			//打包cookie，用于后续流程
			var cookies = res.headers['set-cookie'];
			authlogin.packAllCookie(cookies);
			
			var str = $($.parseXML(data));
						
			var result   = str.find("Result").text();
			var curAuth  = str.find('CurAuth').text();
			var nextAuth = str.find('NextAuth').text();

			if(result == "0"){//用户名密码错误 or other
				var err = str.find("Note").text();
				return err;
			}else if(result == "1"){
				//有可能以后有下一步认证流程
				//设置用户名密码到user.conf,不需要等待回调
				if(first == true){
					//EC刚起来，如果是自动登录则不需要更新user.conf
					var userdata = authlogin.updateUserdata();
					authlogin.setuserconf(userdata);					
				}

				// 登录成功,发送twfid给tcagent,直接返回
				var twfid = authlogin.globalval.getval("TWFID");
				authlogin.loginsucc(twfid);
				// 设置登录的状态
				authlogin.setLoginStatus(true);

				return true;			
			}else if(result == "2"){
				//组合认证方式
				return "该用户启用了组合认证，暂不支持，请联系管理员";
			}else{
				authlogin.eclog.log('未知的返回result');
				return err;
			}	
		},

		//获取校验码
		getrandcode: function(success,fail){
			var host = authlogin.globalval.getval('VDIADDR');
			var port = authlogin.globalval.getval('port');
			var path   = RAND_CODE + "?dev=x86type=cs&language=zh_CN";
			var method = "GET";

            var headers = authlogin.unpackAllCookie();

			var options = {
				host: host,
				port: port,
				path: path,
				method: method,
				headers:headers,
				rejectUnauthorized: false
			};
			nodehttps.httpsRequestBinary(options, null, function(res,data){
				setTimeout(function(){success(res,data);},100);
			},function(res,err){
				fail(res,err);
			});
		},

		//登录成功之后，更新全局变量userdata
		updateUserdata: function(){

			var userdata = authlogin.globalval.getval('userdata');
			
			var username = $("#username").val();
			var userpsw  = $("#userpsw").val();

			var rempsw    = $('#rempsw').is(':checked') ? 1 : 0;
			var autologin = $('#autologin').is(':checked') ? 1: 0;

			if(autologin == 1){

				userdata.name      = username;
				userdata.password  = userpsw;
				userdata.autologin = 1;
			}else{
				if(rempsw == 1){

					userdata.name      = username;
					userdata.password  = userpsw;
					userdata.autologin = 0;
				}else{
								
					userdata.name      = username;
					userdata.password  = "";
					userdata.autologin = 0;
				}
			}

			authlogin.globalval.setval('userdata',userdata);

			return userdata;
		},
		//打包登录cookie
		packAllCookie: function(cookies){

			if(cookies == undefined){return;}
			authlogin.globalval.setval('TWFID',null);
			authlogin.globalval.setval('ENABLE_RANDCODE',"0");

			for (var i = 0; i < cookies.length; i++) {

				var arr = cookies[i].split(';');
				var key_value = arr[0].split('=');

				authlogin.globalval.setval(key_value[0],key_value[1]);
			}	
		},

		//解包登录cookie
		unpackAllCookie: function(){
            var headers = {};

            headers['Cookie'] = 'TWFID=' + authlogin.globalval.getval('TWFID') +';'+
                                'path=/; secure';
            return headers;			
		},

		//设置登录状态参数
		setLoginStatus: function(islogin){
			//true:login,false:logout
			if(islogin){
				authlogin.globalval.setval('islogin','ok');
				setLoginTime(islogin);
			}else{
				authlogin.globalval.setval('islogin','no');
				setLoginTime(islogin);
			}
		},

		//获取选路URL,必须实时获取,在回调里执行接下来流程
		getSelectURL: function(success,fail){
			//var jsondata = '{"host": "200.200.74.240", "port":443,"password": "adfifje", "ip": "200.200.74.240"}';
			var vdcconf = {};
			systemcall.getSelectURL(function(jsondata){
				var data      = $.parseJSON(jsondata);
				var port      = (data.port == "" || data.port == undefined) ? 443 : data.port;
				var ip       = (data.ip == "" || data.ip == undefined) ? null : data.ip;
				var host      = (data.host == "" || data.host == undefined) ? null : data.host;
				var password  = (data.password == "" || data.password == undefined) ? "" : data.password;
				var orgurl    = (data.orgurl == "" || data.orgurl == undefined) ? "" : data.orgurl;
				vdcconf.host     = host;
				vdcconf.port     = port;
				vdcconf.password = password;
				vdcconf.ip       = ip;
				vdcconf.orgurl   = orgurl;

				authlogin.globalval.setval('vdcconf',vdcconf); //vdc.conf全局维护

				//登录端口，单独维护，给服务页面用
				authlogin.globalval.setval('port',port);
				//维护一个登录后用的选路URL，单独维护，给服务页面用
				authlogin.globalval.setval("VDIADDR", ip);

				success();

			},function(err){fail(err);});
		},

		// 登录成功,发送消息给tcagent
		loginsucc: function(twfid){
			authlogin.socketaction.loginsucc(twfid);
		},

		// 注销成功,发送消息给tcagent
		logoutsucc:function(twfid){
			authlogin.socketaction.logoutsucc(twfid);
		},

		// 更新配置,发送消息给tcagent,配置更新成功返回之后操作，network，vdc配置需要通知tcagent
		updateconfsucc: function(module){
			authlogin.socketaction.updateconfsucc(module);
		},

		//获取user.conf配置文件
		//{"name": "*", "password": "*", "autologin ": *}
		getuserconf: function(success,fail){
			//var jsondata = '{"name": "cyc", "password": "1", "autologin": 0}';

			systemcall.getuserconf(function(jsondata){
				var data           = $.parseJSON(jsondata);
				var userdata       = {};

				//console.log(data);
				userdata.name      = (data.name == undefined || data.name == "") ? "" : data.name;
				userdata.password  = (data.password == undefined || data.password == "") ? "" : data.password;
				userdata.autologin = (data.autologin == undefined || data.autologin == "") ? 0 : data.autologin;

				authlogin.globalval.setval('userdata',userdata);//保存本地用户配置,后面需要用到				
				success();

			},function(err){
				fail(err);
			});
		},

		/*获取policy.conf策略配置*/
		getpolicyconf:function(success, fail){
			systemcall.getpolicyconf(function(jsondata){
				var data = $.parseJSON(jsondata);
				var policydata = {};

				policydata.configpwd = (data.configpwd == undefined || data.configpwd == "") ? null : data.configpwd;
				policydata.configreqpwd = (data.configreqpwd == undefined || data.configreqpwd == "") ? "0" : data.configreqpwd;
				policydata.logininforeqpwd = (data.logininforeqpwd == undefined || data.logininforeqpwd == "") ? "0" : data.logininforeqpwd;

				authlogin.globalval.setval('iseditlogininfo', policydata.logininforeqpwd);//修改登录信息需要密码开关
				authlogin.globalval.setval('iseditsysteminfo', policydata.configreqpwd);//修改系统IP，VDC地址需要密码开关
				authlogin.globalval.setval('pwdforsetlogininfo', policydata.configpwd);//MD5 密码

				success();
			},function(err){fail(err);});
		},

		//设置user.conf配置文件,此处不需要通知tcagent
		setuserconf: function(data){
			systemcall.setuserconf(data,function(result){
			},function(err){authlogin.eclog.log('保存user.conf异常');});
		},

		checkName: function(username){
			var regm = /^[^&"%><;,\*]*$/,rv=true;
			rv=regm.test(username);
			var l = username.replace(/[^\u0000-\u007f]/g,"\u0061\u0061").length; 
			return rv&&l<=48;
		},

		mask: function(){
			$("#loginmask").show();
		},

		unmask: function(){
			$("#loginmask").hide();
		},

		netexception: function(str){
			var msg = '网络无法连接，<a style="color:blue;" onclick="authlogin.systemset();">请修改网络配置</a>';
			if(str != null){
				msg = str;
			}
			$('.loginform').tips({
				msg:msg,
				side:"right",
				cls:'tips-plugin',
				time:5,
				x:125,
				y:10
			});
		},

		systemset:function(){
			$("#sysSettingModal").show();
			//系统设置窗口出来了，登录框提示还没有消失
			$('.tips-plugin').remove();
		},

		doEncrypt: function(str){
			var rsa;
			var encryptkey = authlogin.globalval.getval('rsaencryptkey');
			rsa = new RSAKey();
			rsa.setPublic(encryptkey, "10001");
			var res = rsa.encrypt(str);
			if (res) {
				return res;
			}
			return "";
		}

	}
})(jQuery,window);

/*用户登录时间*/
function setLoginTime(islogin){
	//true:login,false:logout
	var date    = new Date();
	var hours   = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	if(hours >= 0 && hours <= 9){
		hours = "0" + hours;
	}
	if(minutes >= 0 && minutes <= 9){
		minutes = "0" + minutes;
	}
	if(seconds >= 0 && seconds <= 9){
		seconds = "0" + seconds;
	}
	var str =  hours + ":" + minutes + ":" + seconds;
	if(islogin){
		authlogin.globalval.setval('logintime', str);
	}else{
		authlogin.globalval.setval('logintime', "-");
	}
	

}

window.authlogin = authlogin;


//EC_SOCKET       : '/run/adesk/ec/socket'
/*此处定义监听agent回来的消息处理函数*/

//{"signal": "session_changed", "params": {"old_session_id": "*", "new_session_id": "*"}} session 切换
//{"signal": "session_invalid", "params": {"session_id": "*"}} session 不可用
//{"signal": "connection2vdc_off"} 与VDC连接断开
//{"signal": "connection2vdc_on"} 与VDC连接恢复
//{"signal": "spice_start"} SPICE拉起成功给页面消息，页面取消进度条
//{"signal": "ip_changed", "params": {"old_ip": "*", "new_ip": "*"}} 选路URL变更，通知上层维护
//{"signal": "info_config", "params": {"module": "vdc"}} vdc.conf配置发生变化，更新选路ip,port
//{"signal": "mii-tool","params":{"link":"ok"}} 监听eth0网口状态变更，由本地nodemain维护，总设没有
//{"method": "get_vaddress", "params": {"vmid": *}, "id": 1} spicec通过ec获取虚拟机ip
//{"signal": "spicec_window_opened", "params": {"vmid": *}} spicec窗口启动
//{"signal": "spicec_exit", "params": {"vmid": *}} spicec退出通知ec
var SIGNAL = {
	SESSION_CHANGED:    "session_changed",
	SESSION_INVALID:    "session_invalid",
	VDCBREAK:           "connection2vdc_off",
	VDCRESTORE:         "connection2vdc_on",
	SPICESTART:         "spicec_window_opened",
	SPICEADDR:          "get_vaddress",
	SPICEEXIT:          "spicec_exit",
	VDCCHANGED:         "info_config",
	MIITOOL:            "mii-tool"
};

var METHOD = {
	RESETVDESKTOP:"reset_vdesktop"
};

function dealSignal(data){

	switch(data.signal){
		case SIGNAL.SESSION_CHANGED:
			// session changed
			SessionChanged(data);
			break;
		case SIGNAL.SESSION_INVALID:
			// session invalid
			SessionInvalid(data);
			break;
		case SIGNAL.VDCBREAK:
			// vdc break
			VdcBreak(data);
			break;
		case SIGNAL.VDCRESTORE:
			// vdc restore
			VdcRrestore(data);
			break;
		case SIGNAL.SPICESTART:
			// spice start
			window.app.hideprogBar();
			break;
		case SIGNAL.SPICEADDR:
			// get virtualdesktop address
			SpicecAddr(data);
			break;
		case SIGNAL.SPICEEXIT:
			// spicec exit
			SpicecExit(data);
			break;
		case SIGNAL.VDCCHANGED:
			// ip changed
			VdcConfChanged(data);
			break;
		case SIGNAL.MIITOOL:
			//eth0 status changed
			EthChanged(data);
			break;
		default:
			authlogin.eclog.log("wrong signal type");
	}
}

function dealMethod(data){

	switch(data.method){
		case METHOD.RESETVDESKTOP:
			window.app.restartVM(data);
			break;
		default:
			break;
	}
}

function getCMD(str){

	var jsonData = str;
	data = $.parseJSON(jsonData);

	var signal = data.signal;

	if(typeof signal == "undefined"){
		dealMethod(data);
	}else{
		dealSignal(data);
	}

}

function EthChanged(data){
	//vdi未登录前的网口状态显示
	var link          = data.params.link;
	var preloginfail  = authlogin.globalval.getval('preloginfail');
	var selecturl     = authlogin.globalval.getval('VDIADDR');

	if(link == "ok"){
		authlogin.globalval.setval('ethstatus','ok');
		$('.sysnet').css('background-image','url(../imgs/sysnet_normal.png)');
	}else{
		authlogin.globalval.setval('ethstatus','no');
		$('.sysnet').css('background-image','url(../imgs/sysnet_down.png)');
	}

	if(selecturl != null && link == "ok" && preloginfail == true){
		authlogin.preLogin(function(res,data){
			authlogin.dealPreLoginXML(res,data);
			var enablerandcode = authlogin.globalval.getval('ENABLE_RANDCODE');
			if(enablerandcode == "1"){
				//重新获取校验码
				authlogin.getrandcode(function(res,data){
					$('.randcode').css('display','block');
					$('.randcode>img').attr('src','../imgs/rand_code.gif?t='+Math.random());	
				},function(res,err){
					authlogin.eclog.log('获取图形校验码异常');
				});
			}
			authlogin.globalval.setval('preloginfail', false);								
		},function(res,err){
			authlogin.eclog.log('网口切换到连通状态，预登录却失败了');
		});		
	}
}

function SessionChanged(data){
	//eclog.log('session changed in');
	var old_session_id = data.params.old_session_id;
	var new_session_id = data.params.new_session_id;
	var local_session_id = authlogin.globalval.getval('TWFID');//实时维护
	if(old_session_id != local_session_id){authlogin.eclog.log('session isnot match:session_changed');return;}
	authlogin.eclog.log("old_session_id:"+old_session_id);
	authlogin.eclog.log("new_session_id:"+new_session_id);
	authlogin.eclog.log("local_session_id:"+local_session_id);
	authlogin.globalval.setval('TWFID',new_session_id);

}
function SessionInvalid(data){

	var old_session_id     = data.params.session_id;
	var local_session_id   = authlogin.globalval.getval('TWFID');
	if(old_session_id != local_session_id){authlogin.eclog.log('session isnot match:session_invalid');return;}

	var spicecpid      = authlogin.globalval.getval('spicecpid');
	if(spicecpid != "-1"){
		//杀掉拉起spicec的进程树
		authlogin.systemcall.killPsTree(spicecpid);
		authlogin.globalval.setval('spicecpid',"-1");
	}
	window.app.logout();
}

function VdcBreak(data){
	//vdi登录后的网口状态显示
	var ethstatus = authlogin.globalval.getval("ethstatus");

	authlogin.globalval.setval("vdcconnect","no");

	if(ethstatus == "ok"){		
		$('.sysnet').css('background-image','url(../imgs/sysnet_except.png)');		
	}else{//异常场景
		$('.sysnet').css('background-image','url(../imgs/sysnet_down.png)');
	}
}
function VdcRrestore(data){
	//vdi登录后的网口状态显示
	var ethstatus = authlogin.globalval.getval("ethstatus");
	
	authlogin.globalval.setval("vdcconnect", "ok");

	if(ethstatus == "ok"){
		$('.sysnet').css('background-image','url(../imgs/sysnet_normal.png)');		
	}else{//异常场景
		$('.sysnet').css('background-image','url(../imgs/sysnet_down.png)');
	}
}
function SpicecStart(data){
	//eclog.log(data);
	window.app.hideprogBar();
}

function SpicecAddr(data){
	authlogin.eclog.log(data.signal);
}

function SpicecExit(data){
	authlogin.eclog.log(data.signal);
}

function VdcConfChanged(data){
	var params = data.params;
	var module = params.module;
	//console.log(data);
	switch(module){
		case 'vdc':
			authlogin.systemcall.getSelectURL(function(jsondata){

				var vdcconf   = {};
				var data      = $.parseJSON(jsondata);
				var oldvdcconf = authlogin.globalval.getval('vdcconf');

				//console.log(data);
				var port      = (data.port == "" || data.port == undefined) ? 443 : data.port;
				var ip        = (data.ip == "" || data.ip == undefined) ? null : data.ip;
				var host      = (data.host == "" || data.host == undefined) ? null : data.host;
				var password  = (data.password == "" || data.password == undefined) ? "" : data.password;
				var orgurl    = (data.orgurl == "" || data.orgurl == undefined) ? "" : data.orgurl;

				vdcconf.host     = host;
				vdcconf.port     = port;
				vdcconf.password = password;
				vdcconf.ip       = ip;
				vdcconf.orgurl   = orgurl;

				authlogin.globalval.setval('vdcconf',vdcconf); //vdc.conf全局维护

				//维护一个登录后用的选路URL，单独维护，给服务页面用
				authlogin.globalval.setval("VDIADDR", ip);

				//登录端口，单独维护，给服务页面用
				authlogin.globalval.setval('port',port);

				if(ip != null && ip != oldvdcconf.ip){
					//走一次预登录
					authlogin.preLogin(function(res,data){//预登录流程
						authlogin.dealPreLoginXML(res,data);
						var enablerandcode = authlogin.globalval.getval('ENABLE_RANDCODE');
			 			if(enablerandcode == "1"){
							//重新获取校验码
							authlogin.getrandcode(function(res,data){
								$('.randcode').css('display','block');
								$('.randcode>img').attr('src','../imgs/rand_code.gif?t='+Math.random());	
							},function(res,err){
								authlogin.eclog.log('获取图形校验码异常');
							});
						}					
					},function(res,err){//预登录异常流程
						authlogin.eclog.log('vdc配置信息变更，预登录异常');
						return;
					});					
				}

			},function(err){authlogin.eclog.log('vdc配置信息变更，获取vdc.conf异常')});
			break;
		case 'network':
			authlogin.systemcall.getNetwork(function(jsondata){

				var data      = $.parseJSON(jsondata);
				authlogin.globalval.setval('network', data);

			},function(err){
				$(document.body).tips({side:"top", msg: '获取网络配置异常，请联系管理员', cls: 'error-tips', time: 5, x: 60, y: document.body.scrollWidth/2});
			});		
			break;
		case 'policy':
			authlogin.systemcall.getpolicyconf(function(jsondata){
				jsondata = '{"configpwd": "e10adc3949ba59abbe56e057f20f883e", "configreqpwd": "1", "logininforeqpwd": "1"}';
				var data = $.parseJSON(jsondata);
				var policydata = {};

				policydata.configpwd = (data.configpwd == undefined || data.configpwd == "") ? null : data.configpwd;
				policydata.configreqpwd = (data.configreqpwd == undefined || data.configreqpwd == "") ? "0" : data.configreqpwd;
				policydata.logininforeqpwd = (data.logininforeqpwd == undefined || data.logininforeqpwd == "") ? "0" : data.logininforeqpwd;

				authlogin.globalval.setval('iseditlogininfo', policydata.logininforeqpwd);//修改登录信息需要密码开关
				authlogin.globalval.setval('iseditsysteminfo', policydata.configreqpwd);//修改系统IP，VDC地址需要密码开关
				authlogin.globalval.setval('pwdforsetlogininfo', policydata.configpwd);//MD5 密码

			},function(err){eclog.log("获取policy策略文件异常")});
		default:
			break;
	}
}