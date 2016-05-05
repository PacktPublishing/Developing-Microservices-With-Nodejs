



var seneca = require('seneca')(); 
 
var names = []; 
 
seneca.add({cmd: 'memory-leak'}, function(args, done){ 
    names.push(args.name); 
   greetings = "Hello " + args.name; 
   done(null ,{result: greetings}); 
}); 
 
seneca.listen({port: 8080}); 
