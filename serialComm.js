var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var connection = require("./connection");
var dataConv = require("./dataConv");
var scalesCommands = [];
var scaleResponseData;
var command;
var commandCounter;

const carrReturn = new Buffer("\r");
const nullChar = new Buffer("\0");

var express = require('express'),
    path = require('path'),
    httpPort = 3333,
    wsPort = 3334,
    app = express();
var connections = [];

//ttyAMA0 ttyUSB0
//Rpi serial port: /dev/ttyUSB0
//Mac serial port: /dev/cu.usbserial
var myPort; 

// start web socket server
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: wsPort
    });

wss.on('connection', handleConnection);

function startReading() {    
  connection.acquire(function(err, con) {
        con.query("select a.scale_id, a.scale_type, b.command_id \
                   from zpmtscales as a, zpmtcommand as b \
                   where a.scale_type = b.scale_type", function(error, rows) {
          con.release();
    
          if (!!error){
            console.log("Query error, serial port communication not initiated");
          }else {
            console.log("Scales commands got it from db, trying to stablish a connection to scales");
            scalesCommands = rows;

            myPort = new SerialPort("/dev/ttyUSB0", {
              baudrate: 4800,
              dataBits: 8,
              stopBits: 1,
              parity: 'none',
              flowControl: false,
              parser: serialport.parsers.readline('\r')
            });  
            myPort.on('open', showPortOpen);
            myPort.on('error', showError);
          }
        });
  });
}

function handleConnection(client) {
 console.log("New Connection"); // you have a new client
 connections.push(client); // add this client to the connections array
 
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

function showPortOpen() {   

   myPort.set({dtr : true },function(){});
   console.log('port open. Data rate: ' + myPort.options.baudRate);
     
   //Listening for incoming data
   myPort.on('data', function(data) {
    console.log('Response from scale: ' + data + ' to command:' + command );
    wss.broadcast(data);
    
    //Almacena los datos entrantes
    saveStreamToDB(data);

    //Hace una pausa de 120 milisegundos antes del siguiente comando
    setTimeout(function(){
      command = getNextCommand();
      sendCommand(command);         
    }, 120);     
   });

   command = getFirstCommand();
   sendCommand(command); 
}

function saveStreamToDB(data) {
  dataDB = {
              scale_id: scalesCommands[commandCounter].scale_id,
              command_id: scalesCommands[commandCounter].command_id,
              resp_raw_data: data
           };
  connection.acquire(function(err, con) {
        con.query("insert into zpmscale_data SET request_date = now(), request_time = now(), ?", dataDB, function(error, rows) {
          con.release();
          if (!!error){
            console.log("Query " + error);
          }
        });
  });
}

function sendCommand(commandStr){
  console.log('Writing to port command: ' + commandStr);
  myPort.write(commandStr, function(err, results) {
      if (err){
       console.log('err ' + err);
      } 
      console.log('results: ' + results);
  });   
}

function getFirstCommand(){
  commandCounter = 0; 
  return getCommand(commandCounter);
}

function getCommand(rowId){
  var l_scale_and_command = scalesCommands[rowId].scale_id + scalesCommands[rowId].command_id;
  var l_complete_command = ">" + l_scale_and_command + dataConv.generateCheckSum(l_scale_and_command);
  l_complete_command = l_complete_command + carrReturn.toString('ascii') + "<" + nullChar.toString('ascii');
  return l_complete_command;
}

function getNextCommand(){
  commandCounter = commandCounter + 1;  
  if (commandCounter > scalesCommands.length - 1){ //
    commandCounter = 0;
    return getCommand(commandCounter);
  }
  else{
    return getCommand(commandCounter);
  }
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

exports.startReading = startReading;

