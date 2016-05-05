var seneca = require("seneca")();
seneca.add({cmd: "test"}, function(args, done) {
    done(null, {response: "Hello World!"});
});

seneca.listen({port: 3000});
