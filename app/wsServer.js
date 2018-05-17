/*原生websocket只能发送字符串*/


/*1.这里是单进程*/
/*var ws = require("nodejs-websocket")

var PORT=3000;


var message={}; 

var server = ws.createServer(function (conn) {

  console.log("New connection ");  

  conn.on("text", function (dataStr) {
    console.log(dataStr);
  })

  conn.on("close", function (code, reason) {
    clearInterval(interval);
    console.log('close');
  })


//模拟返回数据  
 var interval=setInterval(function(){
  message={}; 
  server.connections.forEach(function(connection){
   message.status=0; 
   message.res=''+Math.round(Math.random())+Math.round(Math.random())+Math.round(Math.random())+Math.round(Math.random());
   message=JSON.stringify(message);
   connection.sendText(message);
   })
 }, 2000);


 conn.on('error',function(err){
    console.log('handle err:'+err);
  })

}).listen(PORT);


console.log('websocket server listen in 3000 port');
*/



/*2.CPU核数个进程*/ 
var ws = require("nodejs-websocket")
var cluster = require('cluster');
var cpuCount = require('os').cpus().length;
var PORT=3000;

if (cluster.isMaster) {
    for (var i = 0; i < cpuCount; ++i) {
        cluster.fork();
    }

} else {

var message={}; 
var server = ws.createServer(function (conn) {

  console.log(`websocket server(${process.pid}) New connection`);  

  conn.on("text", function (dataStr) {
    console.log(`websocket server(${process.pid}) receive `+dataStr);
  })

  conn.on("close", function (code, reason) {
    clearInterval(interval);
    console.log(`websocket server(${process.pid}) close`);
  })


//模拟返回数据  
 var interval=setInterval(function(){
  message={}; 
  server.connections.forEach(function(connection){
   message.status=0; 
   message.res=''+Math.round(Math.random())+Math.round(Math.random())+Math.round(Math.random())+Math.round(Math.random());
   message=JSON.stringify(message);
   connection.sendText(message);
   })
 }, 2000);


 conn.on('error',function(err){
    console.log(`websocket server(${process.pid}) handle err:`+err);
  })

}).listen(PORT);
 console.log(`websocket server(${process.pid}) listen in 3000 port`);

}