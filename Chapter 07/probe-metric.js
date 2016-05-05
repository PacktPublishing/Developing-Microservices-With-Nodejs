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

var meter = probe.meter({
 name      : 'Calls per minute',
 samples   : 60,
 timeframe : 3600
});

seneca.add({cmd: 'calls-minute'}, function(args, done){
   meter.mark();
   done(null, {result: "done!"});
}); 
 
seneca.listen({port: 8085}); 
