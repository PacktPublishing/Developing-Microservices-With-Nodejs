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

var meter = probe.metric({
 name      : 'Last call'
});

seneca.add({cmd: 'last-call'}, function(args, done){
    console.log(meter);
   meter.set(new Date().toISOString());
   done(null, {result: "done!"});
}); 
 
seneca.listen({port: 8085}); 
