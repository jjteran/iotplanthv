var express = require("express");
var serialComm = require("./serialComm");
var app = express();

function iniciar(route, handle) {
  //Traslada el manejo del routing al router.js	
  route(handle, app);  
  
  //Activa el servidor web
  app.listen(8889);
  console.log("Server started.");

  console.log("Starting scales communications.");
  serialComm.startReading();  
}

exports.iniciar = iniciar;