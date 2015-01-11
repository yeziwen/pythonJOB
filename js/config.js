/* 
 * config for vdi client 4.7;
 * all about userinfterface configuretor; like request port; version
 */

var VDI_CLIENT_CONFIG = {    
    "VERSION": "4.7",
    "ANIMATE":true,
	"PORT": 443,
    "PROXY": "/por/rclist.csp",
    "AUTH_SVR": "/por/conf.csp",
	"CHANGEPWD": "/por/changepwd.csp",
	"CHANGEPWD_REFERER": "/por/perinfo.csp",
    "PAGE_SIZE": 15,
    "DATEFMT": "yy年MM月dd日 ",
    "WEEKDAY": "星期日|星期一|星期二|星期三|星期四|星期五|星期六",
    "LESS_TO_CENTER": true //配置如果页面内容过少就强制缩小并居中，设置为false则一直显示为九宫格状态；
};

/*
 * errCode for changepwd
 *
 */
var errCode = {
	"chgpsw": {
		"0": "更新成功!",
		"1": "用户在线超时!",
		"2": "您的帐号不属于本地密码认证用户,或者该帐号是公共帐号,不能修改密码",
		"3": "获取用户信息失败",
		"4": "密码输入错误,请重新输入!",
		"5": "更新用户信息失败,可能服务器忙!",		
		"6": "您的帐号没有通过密码认证,不能修改密码",
		"7": "密码长度过短",
		"8": "密码不能包含用户名",
		"9": "密码必须包含数字",
		"10": "密码必须包含字母",
		"11": "密码必须包含特殊字符",
		"12": "新密码不能与旧密码完全相同",
		"13": "对不起,您不具有更改密码的权限,请与管理员联系",
		"14": "对不起,您不具有更改用户描述的权限,请与管理员联系" 
		//后续请不要超过21,21后的将留给密码策略使用
	}
};

/*
 * openrc ststus
 *
 */
var APPTRACER = {
	"GETVMCONF": "正在获取配置...",
	"WRITEVMCONF": "正在读写配置...",
	"CONNECTINGVM": "正在连接...",
	"CONNECTSUCCESS": "连接成功"
};

/*
 * vm status
 *
 */
var ADESK_QUERY_STATUS = {
	"VDI_QUERY_STATE_UNKNOWN": 0xff,	  //<未知状态
	"VDI_QUERY_STATE_ERROR": 0x00,	      //<获取配置失败
	"VDI_QUERY_STATE_POWERONING": 0x01,	  //<正在开机
	"VDI_QUERY_STATE_READING": 0x02,	  //<正在部署准备 
	"VDI_QUERY_STATE_OK": 0x03,	          //<获取配置成功
	"VDI_QUERY_STATE_TSPORT": 0x04,	      //<反向查询ts port端口（7172 或者 7171）连通性
	"VDI_QUERY_STATE_OFFLINE": 0x05,      //虚拟机离线状态
	"VDI_QUERY_STATE_SN_ERROR": 0x06,     //虚拟机序列号无效状态
	"VDI_QUERY_STATE_STOP": 0x07,         //虚拟机关机
	"VDI_QUERY_STATE_RESET": 0x08,        //虚拟机重启
	"VDI_QUERY_STATE_LOST": 0x0A          //虚机无效
};

/*
 * get vm failed errCode
 *
 */
var ADESK_QUERY_ERRCODE = {
	"VDI_QRY_POWEROFFING": 0x0301,       //<正在关机，稍后重试
	"VDI_QRY_UPGRADE": 0x0302,           //<正在升级，稍后重试
	"VDI_QRY_NEEDUPGRADE": 0x0303,       //<需要联系管理员升级
	"VDI_QRY_ALLOC_FAILURE": 0x0304,     //<分配虚拟机失败，没有空闲的虚拟机
	"VDI_QRY_INVALID_VM": 0x0305,		 //<无效的虚拟机
	"VDI_QRY_NO_ONLINE_USER": 0x0306,    //用户没有登录vdi
	"VDI_QRY_VM_FIND_FAIL": 0x0307,      //查找虚拟机失败
	"VDI_QRY_PROTOCOL":	0x0308,          //数据格式不对或协议不对
	"VDI_QRY_VM_LOGIN_ERR":	0x0309,		 //<虚拟机接入异常
	"VDI_QRY_JOINING_DOMAIN": 0x030a,	 //<虚拟机正在加入域
	"VDI_QRY_SN_UNENOUGH": 0x030b,		 //<vdi授权数不足
	"VDI_QRY_TSPORT_FAILED": 0x030c,     //vdi反向连接agent失败
	"VDI_QRY_TIMEOUT": 0xff01,		     //<请求超时
	"VDI_QRY_OTHER_ERROR": 0x03ff        //<未知错误
};
 
 
 
 
 
 
 
 
 
 
 