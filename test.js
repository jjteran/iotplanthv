var dBConnection = require('./connection');
var dataConv = require('./dataConv'),
    value;

value = dataConv.generateCheckSum('83951239');

var datetime = new Date();

//console.log("En decimal los caracteres 05g equivale a " + value.toString());

dBConnection.init(); //Init database connection

console.log(datetime);

array = [ {
             codigo: '01',
             nombre: 'DEDD'
          },
          {
          	 codigo: '02',
          	 nombre: 'EEER'
          },
          {
          	codigo: '03',
          	nombre: 'FRR0F'
          } ];

console.log("Tamaño array: " + array.length);

//Sleep
setTimeout(function(){
  console.log("mensaje despues de 500 ms");
},1000);

console.log("mensaje despues de timeout");

//Insertar datos
/*dBConnection.acquire(function(err, con) {
	  data = {
                scale_id : '02', 
                command_id: 'g'
	  		 };
      con.query('insert into zpmscale_data SET request_date = now(), request_time = now(), ?', data, function(error, rows) {
        con.release();
        var jsonData = {};
        if (!!error){
          console.log("Query error: " + error);
        }else {
          console.log("Query executed succesfully");
          //jsonData.result = rows; 
          //resp.json(jsonData);
        }
      });
  });*/