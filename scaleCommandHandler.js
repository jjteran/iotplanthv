/* Este programa permite gestionar las respuestas entregadas por las basculas, ya sea para guardarla en base de datos
   o enviarlas al UI via websockets*/
var _ = require("underscore");
var dBConnection = require("./connection");
var dataConv = require("./dataConv");
var responsesConf = [];
var checkSumGenerated
var checkSumIncoming;
var wsConnections = [];

// start web socket server
var wsPort = 3334;
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({
        port: wsPort
    });

wss.on('connection', handleWSConnection);

function setResponsesConf(pResponsesConf){
  responsesConf = pResponsesConf;
}

function DUMP_g(scale_id, command, data) {
  if (data[1] === 'N'){
   processErrors(data); 
   return;
  }  

  if (generalChecks(data) === false){
    return;
  }
  
  var respCommandConf = _.where(responsesConf, { command_id : 'g', scale_type : 'DUMP' });
  
  for (var i in respCommandConf){
    //Evalua la secuencia que se va a trabajar
    switch(respCommandConf[i].sequence){
    //Lee la informacion de peso no borrable
    case '1': //Lenght: 8         
        weight_no_erasable = data.substr(0,respCommandConf[i].seq_lenght);
        console.log("Peso no borrable: " + weight_no_erasable);
        break;
   } 
  }  
}

function DIFF_h(scale_id, command, data) {
  if (data[1] === 'N'){
   processErrors(data); 
   return;
  }  

  if (generalChecks(data) === false){
    return;
  }

  var respCommandConf = _.where(responsesConf, { command_id : 'h', scale_type : 'DIFF' });
  
  for (var i in respCommandConf){
    //Evalua la secuencia que se va a trabajar
    switch(respCommandConf[i].sequence){    
    //Lee la alarma 1 que tiene varios significados en los 4 bits
    case '1': //Lenght: 1
        alarmBits = data.substr(1,respCommandConf[i].seq_lenght);
        processAlarmsInBits( alarmBits );
        break;  
    //Lee la alarma 2 que tiene varios significados en los 4 bits     
    case '2': //Lenght: 1
        alarmBits = data.substr(2,respCommandConf[i].seq_lenght);
        processAlarmsInBits( alarmBits );
        break;    
    //Step number
    case '3': //Lenght: 2   
        break;
    //Alarm number   
    case '4': //Lenght: 2
        alarmNumber = data.substr(5,respCommandConf[i].seq_lenght);
        break;
    //Actual capacity in kg/h            
    case '5': //Lenght: 6
        weight_kg_hr = data.substr(7,respCommandConf[i].seq_lenght);
        break;
    //Scale weight in g    
    case '6': //Lenght: 6     
        break;
    //Total weight erasable in kg   
    case '7': //Lenght: 8
        break;
    //Total weight non-erasable in kg
    case '8': //Lenght 8
         break;
    //Not used
    case '9': //Lenght 1
         break;
    //Number of decimal places of the weight     
    case '10': //Lenght 1
         break;                 
   } 
  }
}

function DUMP_f(scale_id, command, data) {
  if (data[1] === 'N'){
   processErrors(data); 
   return;
  }  
  
  if (generalChecks(data) === false){
    return;
  }

  if (scale_id !== '01'){
    return;
  }
  
  //Selecciona los datos de configuracion de la respuesta al comando respectivo, 
  //en la variable respCommandConf se obtienen todos los registros de configuracion pertenecientes al
  //comando y tipo de bascula respectivo
  var respCommandConf = _.where(responsesConf, { command_id : 'f', scale_type : 'DUMP' });
  
  for (var i in respCommandConf){
    //Evalua la secuencia que se va a trabajar
	  switch(respCommandConf[i].sequence){ 		
    //Lee la alarma 1 que tiene varios significados en los 4 bits
    case '1': //Lenght: 1
        alarm = data.substr(1,respCommandConf[i].seq_lenght);
        processAlarmsInBits(alarm);
        break;  
    //Lee la alarma 2 que tiene varios significados en los 4 bits     
    case '2': //Lenght: 1
        alarm = data.substr(2,respCommandConf[i].seq_lenght);
        processAlarmsInBits(alarm);
        break;    
    //Lee la informacion de capacidad (kg/hr)
    case '3': //Lenght: 6         
        weight_kg_hr = data.substr(3,respCommandConf[i].seq_lenght);
        console.log("Capacidad kg/h: " + weight_kg_hr);
        wss.broadcast(weight_kg_hr);
        break;   
    //Total weight erasable in kg    
    case '4': //Lenght 8
        //No se tiene en cuenta el peso total borrable en kg
        break;        
	 } 
  }
}

/*Procesa los errores que llegan como respuesta que no son alarmas, es decir los N01, N02, etc*/
function processErrors(data){
  
}

/*Procesa alarmas basculas DIFF, que no se manejan a nivel de bits sino que los caracteres ya tienen un significado*/
function processAlarms(){
  
}

//Checks general de integridad de datos y errores en comandos
function generalChecks(){
  checkSumGenerated = dataConv.generateCheckSum(data.slice(1,-2)); //No tiene en cuenta el caracter inicial ni los 2 finales (estos son el checksum)
  checkSumIncoming = data.substr(data.length - 2); //Toma solo los 2 ultimos caracteres de la respuesta
  if (checkSumGenerated !== checkSumIncoming){
    console.log("Checksum validation error, the response is not valid");
    return false;  
  }else{
    return true;
  }
}

function processAlarmsInBits(alarmNumber){

}

function handleWSConnection(client) {
 console.log("New Connection"); // you have a new client
 wsConnections.push(client); // add this client to the connections array
 
 client.on('close', function() { // when a client closes its connection
  console.log("connection closed"); // print it out
  var position = wsConnections.indexOf(client); // get the client's position in the array
  wsConnections.splice(position, 1); // and delete it from the array
 });
}

wss.broadcast = function (data) {
    for (var i in wsConnections)
        wsConnections[i].send(JSON.stringify({
        value: data }));
    //console.log('broadcasted: %s', data);
};

exports.DUMP_g = DUMP_g;
exports.DUMP_f = DUMP_f;
exports.DIFF_h = DIFF_h;
exports.setResponsesConf = setResponsesConf;