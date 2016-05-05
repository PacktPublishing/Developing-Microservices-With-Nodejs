var seneca = require('seneca')();


seneca.add({cmd: 'divide'}, function(msg, respond) {
        respond({'result': msg.a / msg.b });
});

seneca.listen();

seneca.act({cmd: 'divide', a: 10, b:1}, function(err, response) {
    console.log(err);
});
