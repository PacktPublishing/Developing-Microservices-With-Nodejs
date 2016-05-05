var seneca = require('seneca')(); 
var pmx = require("pmx").init({
    http: true,
    errors: true,
    custom_probes: true,
    network: true,
    ports: true
}); 
var names = []; 
 
seneca.add({cmd: 'exception'}, function(args, done){
   pmx.notify(new Error("Unexpected Exception!"));
   
   done(null ,{result: 100/args.number}); 
}); 
 
seneca.listen({port: 8085}); 
