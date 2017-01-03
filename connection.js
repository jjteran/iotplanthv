var mysql = require('mysql');
 
function Connection() {
  this.pool = null;
 
  this.init = function() {
    this.pool = mysql.createPool({
      connectionLimit: 10,
      host: '192.168.43.228', //132.147.160.190
      user: 'root',
      password: 'ce23mj21',
      database: 'Bascula'
    });
  };
 
  this.acquire = function(callback) {
    this.pool.getConnection(function(err, connection) {
      callback(err, connection);
      if (!!err){
        console.log("Error getting connection from the pool");  
      }else {
        console.log("Conection got it from the pool");
      }
    });
  };
}
 
module.exports = new Connection();