//除了ajax 其他都是原生js完成
window.onload=function(){

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


/*需要发送的数据,这个全部数据的展示，我们实际并不用每次传输这么多
var data={
 device:0,   //开关设备 1-开 0-关 
 operation:0,   //操作书 0-3
 led:'0000',    //led 0000
 digitalTubeNum:'0000', //数码管显示数字 0000-fffF
};*/


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


var  digitalTubeNum=document.getElementById("digitalTubeNum");
var  num="0000";
addEvent(digitalTubeNum,'input',function(){
      if(/^([0-9]|[a-f]|[A-F]){4}$/g.test(this.value)){
        num=this.value;
        this.style.border="2px solid rgba(80,80,80,0.3)";
        document.getElementById("errorTip2").style.visibility = 'collapse';
       }else{
        num="0000";
        this.style.border="2px solid #f30000";
        document.getElementById("errorTip2").style.visibility = 'visible';
       }
     // console.log(num);
},false);


//设备开启
var deviceOpen=document.getElementById('deviceOpen');
addEvent(deviceOpen,'click',function(){

   var data={
      device:1
   };
   console.log(data);
   data=JSON.stringify(data);

   $.ajax({
    url:'../cgi-bin/ctl.sh',
    type:"post",
    data:data,
    contentType:"application/json;charset=utf-8",
    dataType:"text",
    success:function(res){
     res=="0"?console.log("设备开启成功。res:"+res):console.log("设备开启失败。res:"+res);
    },
    error:function(){
      console.log("设备开启失败。");
    }

   })

 },false);



//设备关闭
var deviceClose= document.getElementById('deviceClose');
addEvent(deviceClose,'click',function(){
   var data={
      device:0
   };
   console.log(data);
   data=JSON.stringify(data);

    $.ajax({
    url:'../cgi-bin/ctl.sh',
    type:"post",
    data:data,
    contentType:"application/json;charset=utf-8",
    dataType:"text",
    success:function(res){
      res=="0"?console.log("设备关闭成功。res:"+res):console.log("设备关闭失败。res:"+res);
    },
    error:function(){
        console.log("设备关闭失败。");
    }

   })


 },false);



//左边led控制监听（事件代理）
 var formLeft=document.getElementById("formLeft");
 addEvent(formLeft,"click",formLeftClickHandle,false); 
 //数码管设置监听
 var digitalTubeWrite=document.getElementById("digitalTubeWrite");
 addEvent(digitalTubeWrite,"click",digitalTubeWriteClickHandle,false); 



var interval;
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
             clearInterval(interval); flag=false;
             break;                                    
        default :  //其他点击我们不发送数据
            flag=false;
             break;
    }

    if(flag){
     clearInterval(interval); 
     console.log(data);
     console.log(t);
     if(ledTimeFlag){
        data=JSON.stringify(data);
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
     console.log(data);
     data=JSON.stringify(data);

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


}