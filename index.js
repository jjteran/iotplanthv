var server = require("./server");
var router = require("./router");
var connection = require('./connection');
var requestHandlers = require("./requestHandlers");

var handle = {};

handle["/"] = requestHandlers.iniciar;
handle["/iniciar"] = requestHandlers.iniciar;
handle["/subir"] = requestHandlers.subir;
handle["/reply_breakdGetEntitySet"] = requestHandlers.reply_breakdGetEntitySet;

connection.init(); //Init database connection

server.iniciar(router.route, handle);