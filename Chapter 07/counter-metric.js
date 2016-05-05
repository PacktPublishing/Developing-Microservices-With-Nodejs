var seneca = require('seneca')(); 
var pmx = require("pmx").init({
    http: true,
    errors: true,
    custom_probes: true,
    network: true,
    ports: true
}); 
var names = []; 
var probe = pmx.probe();

var counter = probe.counter({
  name : 'Number of calls'
});

seneca.add({cmd: 'counter'}, function(args, done){
   counter.inc();
   done(null, {result: "done!"});
}); 
 
seneca.listen({port: 8085}); 
