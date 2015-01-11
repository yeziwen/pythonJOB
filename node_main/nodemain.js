//node-main.js 在nw.,js后台运行的node.js
//这里完成socket监听,与心跳发送

(function () {


    

    //交由登陆页面进行初始化,目的是为了规避nw.js node-maain.js会启动两次
    exports.initNodemain = initNodemain;

    //用于判断是否已经进行了初始化
    var isInit = false;    
    var net = require("net");
    var systemcall = require('systemcall');
    var CONFIG_CONST = require('configconst');
    var eclog =require('eclog');
    var spawn = require('child_process').spawn;
    /**
    * @method initNodemain 初始化node-main 进行socket监听,心跳包发送等
    */
    function initNodemain(){
        
        eclog.log('init node main');
        
        if(isInit){
            return;
        }            
        isInit = true;

        //初始化socket server
        initSocketServer();
        //初始化心跳socket
        //intiSocketHeart();
        //网口状态监听mii-tool -w eth0
        initEthStatus();
        
    }

    /*
    * @method initEthStatus 
    * @function mii-tool工具监听以太网连接状态
     */
    function initEthStatus(){

        var mii   = spawn('mii-tool', ['-w','eth0']);

        mii.stdout.on('data',function(data){

            var data = data.toString();
            var pattern = "link ok";
            var resData = "";
            if(data.indexOf(pattern) != -1){
                resData = '{"signal":"mii-tool","params":{"link":"ok"}}';               
            }else{
                resData = '{"signal":"mii-tool","params":{"link":"no"}}';
            }
            window.getCMD(resData);
        });

        mii.stderr.on('data', function(data){
            console.log('stderr: ' + data);
        });

        mii.on('close', function(code){
            console.log('child process exited with code: ' + code);
        });        
    }
    /*
    * @method initSocketServer 建立socket server
    */
    function initSocketServer(){

        var EC_SOCKET = CONFIG_CONST.getval('EC_SOCKET');
        var EC_SOCKET_DIR = EC_SOCKET.substring(0, EC_SOCKET.lastIndexOf('/'));
      
        systemcall.mkdirSync(EC_SOCKET_DIR, "/");

        var socketServer = net.createServer();
        //处理新连入的socket,如果是长连接的socket,需要进行维护
        socketServer.on('connection', function (client) {
            client.on('data', function (buff) {
                var str = buff.toString();

                //将消息传递给页面window处理
                window.getCMD(str);    
            });        
        });

        //建立socket错误
        socketServer.on('error', function (error){
            log('socketServer has error');
            log(error.toString());

            //之前已经存在连接,可能情况为上次EC退出时,未删除unix socket地址, 尝试删除后重连
            if(error.code == 'EADDRINUSE'){
                log('EADDRINUSE error try re listening');
                handleEADDRINUSE(EC_SOCKET, socketServer);
            }
        });

        socketServer.on('close', function () {
            log('close');
            socketServer.close();
        });

        socketServer.on('listening', function () {
            log('listening');
        });

        log('try start listening');
        socketServer.listen(EC_SOCKET);

        /*
        * @处理建立 socket server 时 EADDRINUSE 错误
        */
        function handleEADDRINUSE (path, socketServer) {
            var rmCmd = 'rm ' + path;
            
            systemcall.exec(rmCmd, 

                function (stdout) {
                    //删除成功后进行重连
                    socketServer.listen(path);
                },

                function (error) {
                    //删除不成功,记录日志,查询原因
                    log(error);                
                }
            );
        }
    }


    /*
    * @method initSocketServer 建立与adesk-monitor之间的心跳
    */
    function intiSocketHeart () {

        var MONITOR_SOCKET  = CONFIG_CONST.getval('MONITOR_SOCKET');
        var HEART_BETA_TIME = CONFIG_CONST.getval('HERAT_BEAT_TIME');
        var HEART_SOCKET_TIME_OUT = CONFIG_CONST.getval('HEART_SOCKET_TIME_OUT');
        var RE_START_HEART_TIME = CONFIG_CONST.getval('RE_START_HEART_TIME');

        var client = new net.Socket();
        var intervalId;

        //第一次心跳的特殊格式
        var fisrtHeartBeat = "fisrtheartbeat";
         //心跳包
        var heartBeat = "heartbeat";
        

        client.on('connect', function () {
            log('client on connect');
            //建立连接后,开始发送第一个心跳包
            client.write(fisrtHeartBeat, function () {               
                //第一个包发送完毕后,开启定时器,发送心跳
                log('send first heart');
                intervalId = setInterval(function() {
                   log('send heart');
                    client.write(heartBeat);                
                }, HEART_BETA_TIME);    
            });
        });

        client.on('data', function (buffer) {
            console.log(buffer.toString());           
        });

        client.on('end', function () {
            //close 事件会接着触发
            console.log('client on end');
        });

        client.on('error', function (error) { 
            //close 事件会接着触发           
            console.log(error);            
        });

        //除非EC关闭,否则这里不应该有关闭事件,应该重新启动心跳
        client.on('close', function (isError) {          
            console.log('client close event'); 
            //重启心跳 
            reStartHeartBeat();
        });
    
        client.connect(MONITOR_SOCKET);

        //尝试重连minotor
        function reStartHeartBeat () {
            console.log('try resart heartbeat');
            setTimeout(function() {                
                if(intervalId){
                    clearInterval(intervalId);
                }
                client.connect(MONITOR_SOCKET);
            }, RE_START_HEART_TIME);

        }        
    }    

    function log(loginfo){
         process.stdout.write(loginfo + ' in pid: '+ process.pid + ' ' + '\n');
    }

})()