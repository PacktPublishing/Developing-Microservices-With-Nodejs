var express = require('express');

var myServer = express();

var chai = require('chai');

myServer.get('/endpoint', function(req, res){
    res.send('endpoint reached');
});

var serverHandler;

before(function(){
    serverHandler = myServer.listen(3000);
});

describe("When executing 'GET' into /endpoint", function(){
    it("should return 'endpoint reached'", function(){
        // Your test logic here. http://localhost:3000 is your server.
    });
});

after(function(){
    serverHandler.close();
});
