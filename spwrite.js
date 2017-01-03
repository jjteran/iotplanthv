var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var express = require('express'),
    path = require('path'),
    httpPort = 3333,
    wsPort = 3334,
    app = express();
var connections = [];

// start web socket server
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: wsPort
    });

wss.on('connection', handleConnection);

function handleConnection(client) {
 console.log("New Connection"); // you have a new client
 connections.push(client); // add this client to the connections array
 
 //client.on('message', sendToSerial); // when a client sends a message,
 
 client.on('close', function() { // when a client closes its connection
  console.log("connection closed"); // print it out
  var position = connections.indexOf(client); // get the client's position in the array
  connections.splice(position, 1); // and delete it from the array
 });
}

wss.broadcast = function (data) {
    for (var i in connections)
        connections[i].send(JSON.stringify({
        value: data }));
    console.log('broadcasted: %s', data);
};

//ttyAMA0 ttyUSB0
var myPort  = new SerialPort("/dev/ttyUSB0", {
  baudrate: 4800,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: false,
  parser: serialport.parsers.readline('\r')
});

function showPortOpen() {
   myPort.set({dtr : true },function(){});
   console.log('port open. Data rate: ' + myPort.options.baudRate);
   
   const bufEnt = new Buffer("\r");
   myPort.on('data', function(data) {
    /*myPort.write("A16470339A1" + bufEnt.toString('ascii'), function(err,results){
      console.log("Results" + results + err); 
    })*/
    console.log('data received: ' + data);
    wss.broadcast(data);
  });
   const buf1 = new Buffer("\r");
   const buf2 = new Buffer("04");
   const buf3 = new Buffer("CB");
   const buf4 = new Buffer("<");
   const buf5 = new Buffer(">");
   const g = new Buffer("g");
   const nulo = new Buffer("\0");
   
   console.log("Data writen to port:" + " >01hC9/n<");
   /*>08hD0*/
   myPort.on('error',showError);
   myPort.write(">05gCC" + buf1.toString('ascii') + "<" + 
                nulo.toString('ascii')         
                , function(err, results) {
      if (err)
       console.log('err ' + err);
      console.log('results: ' + results  );
    });    
}
 
function sendSerialData(data) {
   console.log(data);
}
 
function showPortClose() {
   console.log('port closed.');
}
 
function showError(error) {
   console.log('Serial port error: ' + error);
}

myPort.on('open', showPortOpen);
myPort.on('error', showError);

// start http server
app.listen(httpPort, function () {
    console.log('HTTP Server: http://192.168.0.29:' + httpPort);
    console.log('WS Server: ws://192.168.0.29:' + wsPort);
});

