var cors = require('cors');

function route(handle,  app) { //pathname, response,  
  app.use(cors());	//Permitir CORS (cross domain)
  for (var pathname in handle){
  	//Aqui se debe considerar los comandos post, put, delete, etc 
    app.get(pathname,handle[pathname]);
  }
}

exports.route = route;
