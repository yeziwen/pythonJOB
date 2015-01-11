/**
* jquery tips 提示插件 jquery.tips.js v0.1beta
*
* 使用方法
* $(selector).tips({   //selector 为jquery选择器
*  msg:'your messages!',    //你的提示消息  必填
*  side:right,  //提示窗显示位置  top,left,right,bottom分别代表上,左,右,下,默认右边
*  cls:tips,   //默认是tips(在css样式中预先定义)
*  time:2,//自动关闭时间 默认2秒 设置0则不自动关闭 可选
*  y:0,//横向偏移  正数向右偏移 负数向左偏移 默认为0 可选
*  x:0,//纵向偏移  正数向下偏移 负数向上偏移 默认为0 可选
* })
* 
* 默认样式
* .tips{
*       border: 1px double #999;
        background-color: #ffffe8;
        font-size: 13px;
        line-height: 25px;
        color: #000;
        border-radius:4px;
        width: 100px;
        height: 30px;
        overflow: hidden;
        position:absolute;
        z-index:1000;
* }
*
*/
(function ($) {
    $.fn.tips = function(options){
        var defaults = {
            side:"right",
            msg:'',
            cls:'tips',
            time:2,
            x:0,
            y:0,
        }
        var options = $.extend(defaults, options);
        if (!options.msg) {
            throw new Error('params error');
        }

        this.each(function(){
            var element=$(this);
            var element_top=element.offset().top,element_left=element.offset().left,element_height=element.outerHeight(),element_width=element.outerWidth();
            options.side = (options.side=='right'?'right':options.side=='top'?'top':options.side=='bottom'?'bottom':options.side=='left'?'left':'right');

            var tips=$('<div class=' + options.cls + '><span style="vertical-align:middle; padding: 5px 8px;display: inline-block;">' + options.msg + '</span></div>' ).appendTo(document.body);
            switch(options.side){
                case 'right'://右
                    tips.css({
                        top:element_top+options.x,
                        left:element_left+element_width+options.y
                    });
                    break;
                case 'top'://上
                    tips.css({
                        top:element_top-tips.outerHeight()+options.x,
                        left:element_left+options.y
                    });
                    break;
                case 'right'://右
                    tips.css({
                        top:element_top+options.x,
                        left:element_left+element_width+options.y
                    });
                    break;
                case 'bottom'://下
                    tips.css({
                        top:element_top+element_height+options.x,
                        left:element_left+options.y
                    });
                    break;
                case 'left'://左
                    tips.css({
                        top:element_top+options.x,
                        left:element_left-tips.outerWidth()+options.y
                    });
                    break;
                default:
            }

            clearTimeout(tips.timeout);
            tips.timeout = setTimeout(function(){tips.remove()},options.time*1000);
        });
        return this;
    };
})(jQuery);