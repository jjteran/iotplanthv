var express = require("express");
var serialComm = require("./serialComm");
var fs = require('fs');
var https = require('https');
var app = express();

var sslOptions = {
  key: fs.readFileSync('cert/key.pem'),
  cert: fs.readFileSync('cert/cert.pem')
};

function iniciar(route, handle) {
  //Traslada el manejo del routing al router.js	
  route(handle, app);  
   
  //Activa el servidor web
  //app.listen(8889);
  https.createServer(sslOptions, app).listen(8889);

  console.log("Server started.");

  console.log("Starting scales communications.");
  serialComm.startReading();  
}

exports.iniciar = iniciar;