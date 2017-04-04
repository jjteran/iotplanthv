var serialport = require("serialport");
var Q = require("q");
var SerialPort = serialport.SerialPort;
var connection = require("./connection");
var dataConv = require("./dataConv");
var scaleCommHndler = require("./scaleCommandHandler");
var scalesCommands = [];
var scaleResponseData;
var command;
var commandCounter;
var timer;

const carrReturn = new Buffer("\r");
const nullChar = new Buffer("\0");

var myPort; 

var readScaleInfo = function(err,con){
  con.query("select a.scale_id, a.scale_type, b.command_id \
                     from zpmtscales as a, zpmtcommand as b \
                     where a.scale_type = b.scale_type", function(error, rows) {
            con.release();
      
            if (!!error){
              console.log("Query error reading scales and commands to send");
            }else {
              //console.log("Scales commands got it from db, trying to stablish a connection to scales");
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
}

var readResponsesConf = function(err,con){
  con.query("select t1.scale_type, t1.command_id, t1.sequence, t1.seq_lenght, t1.value_id, t3.description as descSeq \
                    , t1.bits_breakdw, t2.bit_pos, t2.value_id, t4.description as descSeqBits \
              from zpmtreply_breakd as t1 \
              left outer join zpmtbits_breakdw as t2 \
              on t1.scale_type = t2.scale_type       \
              and   t1.command_id = t2.command_id    \
              and   t1.sequence = t2.sequence        \
              left outer join zpmtvalue_def as t3    \
              on t3.value_id = t1.value_id           \
              left outer join zpmtvalue_def as t4    \
              on t4.value_id = t2.value_id           \
              order by command_id, sequence, bit_pos", function(error, rows) {
            //con.release(); //No se hace release hasta que se ejecute el metodo readScaleInfo
            if (!!error){
              console.log("Query error reading scales responses conf");
            }else {
              //console.log("Scales commands got it from db, trying to stablish a connection to scales");
              scaleCommHndler.setResponsesConf(rows);
            }
  });
}

function startReading() {  
  //Aqui se requiere una ejecucion sincrona de 2 metodos debido a que se deben leer los 2 
  //queries antes de iniciar a leer datos de bascula, se implementa una promise
  connection.acquire(function(err, con) {
      Q.fcall(readResponsesConf(err, con))
       .then(readScaleInfo(err, con));  
  });
}

function showPortOpen() {   

   myPort.set({dtr : true },function(){});
   console.log('port open. Data rate: ' + myPort.options.baudRate);
     
   //Listening for incoming data
   myPort.on('data', function(data) {
    //Quitar comentarios si se va a simular llegada de datos usando loopback test
    /*if (1 === 1){
      data = 'A0100' + Math.floor(Math.random()*(6000-5000+1)+5000).toString() + '1761818735';
      //data = 'A010051161761818735';
    }*/

    clearTimeout(timer);
    //****Response****//    

    console.log('Response from scale: ' + data + ' to command:' + command );

    //Almacena los datos entrantes
    //saveStreamToDB(data);

    //Decodifica y almacena en db los datos decodificados y genera streams via web sockets
    //el command_id se convierte en un metodo manejable desde el controlador scaleCommandHandler.js
    funcName = scalesCommands[commandCounter].scale_type + '_' + scalesCommands[commandCounter].command_id;
    scaleCommHndler[funcName]( scalesCommands[commandCounter].scale_id, command, data ); 

    //Hace una pausa de 120 milisegundos antes del siguiente comando
    setTimeout(function(){
      command = getNextCommand();
      sendCommand(command); 

      //****Request****//
      timer = startTimer();        
    }, 120);     
   });
   
   command = getFirstCommand();
   sendCommand(command); 
   
   //****Request****//
   timer = startTimer();
}

function startTimer(){
  commandStatus = 'In process';
  return setTimeout(function(){
     //****Request cancelled***//     
     //saveStreamToDB('Timeout error');

     command = getNextCommand();
     sendCommand(command); 

     //****Request***//
     timer = startTimer();    
  },500);
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

