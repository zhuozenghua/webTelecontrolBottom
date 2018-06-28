//除了ajax请求，其他都是原生js完成

/*需要发送的数据,这个全部数据的展示，我们实际并不用每次传输这么多
var data={
 device:0,   //开关设备 1-开 0-关 
 operation:0,   //操作书 0-3
 led:'0000',    //led 0000
 digitalTubeNum:'00000000', //数码管显示数字 00000000-fffFfffF
};*/

window.onload=function(){

//页面加载,立即执行
(function(){
   var data={
      login:1
   }
   data=JSON.stringify(data);

   $.ajax({
    url:'../cgi-bin/ctl.sh',
    type:"post",
    data:data,
    contentType:"application/json;charset=utf-8",
    dataType:"text",
    success:function(res){
     res=res[0];
     if(res=="0"){
          console.log("访问成功！");
     }else{
          window.onbeforeunload=null;
          window.location.href='error.html';
     }
    },
    error:function(){
          window.onbeforeunload=null;
          // window.location.href='error.html';
    }

    }); 

})();

// 事件绑定函数
function addEvent(element, eType, handler, bol) {
    if(element.addEventListener){           //如果支持addEventListener
        element.addEventListener(eType, handler,bol);
    }else if(element.attachEvent){          //如果支持attachEvent
        element.attachEvent("on"+eType, handler);
    }else{                                  //否则使用兼容的onclick绑定
        element["on"+eType] = handler;
    }
}

// 事件解绑函数
function removeEvent(element, eType, handler, bol) {
    if(element.addEventListener){
        element.removeEventListener(eType, handler, bol);
    }else if(element.attachEvent){
        element.detachEvent("on"+eType, handler);
    }else{
        element["on"+eType] = null;
    }
}


//获取左边表单（左边led控制监听-事件代理）
 var formLeft=document.getElementById("formLeft");
 //获取数码管操作
 var digitalTubeWrite=document.getElementById("digitalTubeWrite");


//设备操作标志位,如果为1-设备开启，0-设备未开启
var deviceFlag=0;
var deviceOpenClose=document.getElementById('deviceOpenClose');

var interval;

addEvent(deviceOpenClose,'click',function(){
   var data;
   var opFlag=1;
   opFlag=1;

   if(deviceOpenClose.innerText=="打开设备"){
     opFlag=1;
     data={
      device:1
     }
     console.log('1')

   }else{
     opFlag=0;
     var data={
      device:0
     };
   }

   data=JSON.stringify(data);
   console.log(data);
   $.ajax({
    url:'../cgi-bin/ctl.sh',
    type:"post",
    data:data,
    contentType:"application/json;charset=utf-8",
    dataType:"text",
    success:function(res){
     res=res[0];
     if(res=="0"&&opFlag===1){
         //添加事件监听
         addEvent(formLeft,"click",formLeftClickHandle,false); 
         addEvent(digitalTubeWrite,"click",digitalTubeWriteClickHandle,false); 
         deviceOpenClose.innerText="关闭设备";
         deviceOpenClose.style.color="rgba(255,255,255,0.85)";
         deviceOpenClose.style.backgroundColor ="rgb(210,20,60)";
     }else if(res=="0"&&opFlag===0){
         //移除事件点击监听
         if(interval){
          clearInterval(interval);
         }
         removeEvent(formLeft,"click",formLeftClickHandle,false); 
         removeEvent(digitalTubeWrite,"click",digitalTubeWriteClickHandle,false); 
         deviceOpenClose.innerText="打开设备";
         deviceOpenClose.style.color="";
         deviceOpenClose.style.backgroundColor ="";
         for(var i=1;i<=4;i++){
          document.getElementById('led'+i).className='led-unlight';
          }
     }else if(res=="1"&&opFlag===1){
          console.log("设备开启失败。");
     }else{

          console.log("设备关闭失败。");
     }
     // res=="0"?console.log("设备开启成功。res:"+res):console.log("设备开启失败。res:"+res);
    },
    error:function(){
          console.log("设备操作异常。");
    }

   })

 },false);



//监听时间间隔输入
var time=document.getElementById('time');
var t=500;
addEvent(time,'input',function(){
    if(/^[0-9]{3,}$/.test(this.value)){
       t=parseInt(this.value); 
       if(t>=500){
        this.style.border="2px solid rgba(80,80,80,0.3)";
        document.getElementById("errorTip1").style.visibility = 'collapse';
       }else{
        this.style.border="2px solid #f30000";
        document.getElementById("errorTip1").style.visibility = 'visible';
        t=500;
       }
        t=t>=500?t:500;
     }else{
        this.style.border="2px solid #f30000";
        document.getElementById("errorTip1").style.visibility = 'visible';
        t=500;
    }
     // console.log(t);
},false);


//监听数码管输入
var  digitalTubeNum=document.getElementById("digitalTubeNum");
var  num="00000000";
addEvent(digitalTubeNum,'input',function(){
      if(/^([0-9]|[a-f]|[A-F]){1,8}$/g.test(this.value)){
        num=this.value;
        this.style.border="2px solid rgba(80,80,80,0.3)";
        document.getElementById("errorTip2").style.visibility = 'collapse';
       }else{
        num="00000000";
        this.style.border="2px solid #f30000";
        document.getElementById("errorTip2").style.visibility = 'visible';
       }
     // console.log(num);
},false);



/*左边菜单事件回调函数
利用事件委托来实现响应Click事件处理*/
function formLeftClickHandle(event){

     var event=event||window.event;
     var target = event.target||event.srcElement;
     // console.log(target.id+' '+target.value+" "+target.checked);

     //数据
     var data={
     operation:1  
     };
    //循环点亮标志位
    var ledTimeFlag=false;   
    //flag 有效点击位置标志位
    var flag=true;
    switch(target.id){
        case'led1':   
            data.led="1000";break;
        case'led2':   
            data.led="0100";break;          
        case'led3':   
            data.led="0010";break;
        case'led4':
            data.led="0001";break;
        case 'leftShift':
            data.operation=2;break;
        case 'rightShift':
            data.operation=3;break;
        case  'cycLeftShift':
            data.operation=2,ledTimeFlag=true; 
            break; 
        case  'cycRightShift':
            data.operation=3,ledTimeFlag=true;
            break;  
        case 'stop':
             clearInterval(interval),time.disabled="",flag=false;
             break;                                    
        default :  //其他点击我们不发送数据
            flag=false;
             break;
    }

   //有效点击区域
    if(flag){
     clearInterval(interval); 
     time.disabled=""
     time.style.readonly="";
     // console.log(data);
     console.log(t);
     if(ledTimeFlag){
        data=JSON.stringify(data);
        console.log(data);
        time.disabled="disabled";
        //立即发送一次请求
        $.ajax({
          url:'../cgi-bin/ctl.sh',
          type:"post",
          data:data,
          contentType:"application/json;charset=utf-8",
          dataType:"text",
          success:function(res){
            if(res.charAt(0)=="0"){
                for(var i=1;i<res.length&&i<=4;i++){
                  document.getElementById('led'+i).className=res.charAt(i)==='1'?'led-light':'led-unlight';
                }
            }else{
                clearInterval(interval);
                console.log("led操作失败");
            }

          },
          error:function(){
              console.log("led操作失败");
          }

         });

        time.style.readonly="readonly";

        interval=setInterval(function(){  
         $.ajax({
          url:'../cgi-bin/ctl.sh',
          type:"post",
          data:data,
          contentType:"application/json;charset=utf-8",
          dataType:"text",
          success:function(res){
            if(res.charAt(0)=="0"){
                for(var i=1;i<res.length&&i<=4;i++){
                  document.getElementById('led'+i).className=res.charAt(i)==='1'?'led-light':'led-unlight';
                }
            }else{
                clearInterval(interval);
                console.log("led操作失败");
            }

          },
          error:function(){
              console.log("led操作失败");
          }

         })
  
      },t);
  
     }else{
      data=JSON.stringify(data);
      console.log(data);
      $.ajax({
      url:'../cgi-bin/ctl.sh',
      type:"post",
      data:data,
      contentType:"application/json;charset=utf-8",
      dataType:"text",
      success:function(res){
            if(res.charAt(0)=="0"){
                for(var i=1;i<res.length&&i<=4;i++){
                  document.getElementById('led'+i).className=res.charAt(i)==='1'?'led-light':'led-unlight';
                }
            }else{
                console.log("led操作失败");
            }
      },
      error:function(){
          console.log("led操作失败");
      }

     })

    }

     event.stopPropagation?event.stopPropagation():event.cancelable=true;
     // event.preventDefault?event.preventDefault():event.returnValue=false;
  }
} 

/*右边边菜单事件回调函数
利用事件委托来实现响应Click事件处理*/
function digitalTubeWriteClickHandle(event){
    // var target =document.getElementById('digitalTubeWriteClickHandle');
     var data={
     operation:0,   
     digitalTubeNum:num
     };
     // console.log(data);
     data=JSON.stringify(data);
     console.log(data);
      $.ajax({
      url:'../cgi-bin/ctl.sh',
      type:"post",
      data:data,
      contentType:"application/json;charset=utf-8",
      dataType:"text",
      success:function(res){
        res=="0"?console.log("数码管操作成功。res:"+res):console.log("数码管操作失败。res:"+res);
      },
      error:function(){
          console.log("数码管操作失败");
      }

     })
    
} 


// 页面关闭
window.onbeforeunload=function(event){
  event= event||window.event;
   var data={
      login:0
    };
    data=JSON.stringify(data);

   $.ajax({
    url:'../cgi-bin/ctl.sh',
    type:"post",
    data:data,
    contentType:"application/json;charset=utf-8",
    dataType:"text",
    success:function(res){
     res=res[0];
     if(res=="0"){
         //移除事件点击监听
         removeEvent(formLeft,"click",formLeftClickHandle,false); 
         removeEvent(digitalTubeWrite,"click",digitalTubeWriteClickHandle,false); 
     }else{
          console.log("设备关闭失败。");
     }
    }
    });
    
    if(event.preventDefault){
            event.preventDefault();
        }else{
            event.returnValue=false;
        }


    return "";
}


}




