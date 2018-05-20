 window.onload=function(){

//websocket
  var websocket=new WebSocket("ws://localhost:8000/");

  websocket.onopen=function(e){
    console.log('websocket open!!!');
  }

  websocket.onmessage=function(e){
    console.log(e.data);
    var data=JSON.parse(e.data);
    var led=data.res&&typeof (data.res)==='string'?data.res:'0000';
    var light=document.getElementById('light').getElementsByTagName('a');

    for(var i=0;i<4;i++){
      light[i].className=led.charAt(i)==='1'?'led-light':'led-unlight';
    }

  }

  websocket.onclose=function(e){
     console.log('websocket close!!!');
  }

  websocket.onerror=function(err){
     console.log('websocket error!!!'+err);
  }


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


/*需要发送的数据,这个全部数据的展示，我们实际并不用这么多
var data={
 device:0,   //开关设备 0-开 1-关 
 operation:0,   //操作书 0-6
 led:'0000',    //led 0000
 ledTime:'30',  //led时间间隔 >30ms 需要根据实际情况调整
 digitalTubeNum:'0000', //数码管显示数字 0000-fffF
};*/



//设备开启
var deviceOpen=document.getElementById('deviceOpen');
addEvent(deviceOpen,'click',function(){
   var data={
      device:0
   };
   console.log(data);
   data=JSON.stringify(data);
   websocket.send(data);

 },false);



//设备关闭
var deviceClose= document.getElementById('deviceClose');
addEvent(deviceClose,'click',function(){
   var data={
      device:1
   };
   console.log(data);
   data=JSON.stringify(data);
   websocket.send(data);

 },false);


 //退出系统
var exit=document.getElementById('exit');
addEvent(exit,'click', function(){
   if(websocket){
     websocket.close();//关闭websocket
   }

 },false);


//左边led控制监听（事件代理）
 var formLeft=document.getElementById("formLeft");
 addEvent(formLeft,"click",formLeftClickHandle,false); 
 //数码管设置监听
 var digitalTubeWrite=document.getElementById("digitalTubeWrite");
 addEvent(digitalTubeWrite,"click",digitalTubeWriteClickHandle,false); 


/*左边菜单事件回调函数
利用事件委托来实现响应Click事件处理*/
  function formLeftClickHandle(event){

     var event=event||window.event;
     var target = event.target||event.srcElement;
     // console.log(target.id+' '+target.value+" "+target.checked);
     var data={
     operation:0,   //操作书 0-6
     //led:'0000',    //led 0000
     // ledTime:'30',  //led时间间隔 >30ms 需要根据实际情况调整
     };

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
            data.operation=1;break;
        case 'rightShift':
            data.operation=2;break;
        case  'cycShift':
            data.operation=3;break;
        case  'ledStop':
            data.operation=4;break;
        case  'timeSet':
            data.operation=5;
            data.ledTime=document.getElementById('time').value;
            break;                                
        default :  //其他我们不发送数据
            flag=false;
             break;
    }
    if(flag){
     console.log(data);
     data=JSON.stringify(data);
     websocket.send(data);
    }
     event.stopPropagation?event.stopPropagation():event.cancelable=true;
     // event.preventDefault?event.preventDefault():event.returnValue=false;
  } 

/*右边边菜单事件回调函数
利用事件委托来实现响应Click事件处理*/
function digitalTubeWriteClickHandle(event){
    // var target =document.getElementById('digitalTubeWriteClickHandle');
    var digitalTubeNum=document.getElementById('digitalTubeNum');
     var data={
     operation:6,   
     digitalTubeNum:digitalTubeNum.value 
     };
    console.log(data);
    data=JSON.stringify(data);
    websocket.send(data);
} 



}