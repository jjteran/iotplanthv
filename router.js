function route(handle,  app) { //pathname, response,  
  for (var pathname in handle){
  	//Aqui se debe considerar los comandos post, put, delete, etc 
    app.get(pathname,handle[pathname]);
  }
}

exports.route = route;
