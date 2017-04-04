var dBConnection = require('./connection');
var _ = require("underscore");
var scaleCommHndler = require("./scaleCommandHandler");
var dataConv = require('./dataConv'),
    value;

value = dataConv.generateCheckSum('0000096300570230');
console.log('Checksum ' + value);

console.log("Solo string:" + "A010051161761818735".slice(1,-2));
value = dataConv.generateCheckSum("A010051161761818735".slice(1,-2));
console.log("Checksum response " + value);

value = 'A010051161761818735';
value = value.substr(value.length - 2);
console.log("Checksum original " + value);

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
          	nombre: 'DEDD'
          } ];

console.log("Tamaño array: " + array.length);

//Sleep
setTimeout(function(){
  console.log("mensaje despues de 500 ms");
},1000);

console.log("mensaje despues de timeout");

//Convertir decimal a binario
console.log(Number(15).toString(2));

//Convertir hex a binario
value = '2';
console.log(value + ' ' + parseInt(value, 16).toString(2));

//Llamado dinamico a un metodo o funcion
//scaleCommHndler["g"]("05", "g", "A23434545"); 

//Busqueda en array
debugger;
var someData = _.where(array, { nombre : 'DEDD' });
console.log("Array length: " + someData.length.toString());


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