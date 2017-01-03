var connection = require("./connection");

function iniciar(request,response) {
  console.log("Request handler iniciar was called.");
  response.send("Request handler iniciar was called.");
}

function subir(request,response) {
  console.log("Request handler subir was called.");
  response.send("Request handler subir was called.");
}

function reply_breakdGetEntitySet(req,resp){
  connection.acquire(function(err, con) {
      con.query('select * from zpmtreply_breakd', function(error, rows) {
        con.release();
        var jsonData = {};
        if (!!error){
          console.log("Query error");
        }else {
          console.log("Query executed succesfully");
          jsonData.result = rows; 
          resp.json(jsonData);
        }
      });
  });
  console.log("Request handler reply_breakdGetEntitySet was called.");
}

exports.iniciar = iniciar;
exports.subir = subir;
exports.reply_breakdGetEntitySet = reply_breakdGetEntitySet;