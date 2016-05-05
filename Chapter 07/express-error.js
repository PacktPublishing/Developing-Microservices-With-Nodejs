var express = require('express');
var pmx = require('pmx');
var app = express();

app.get('/', function(req, res, next) {
    if (req.query.number == 0) {
        pmx.notify(Error("Number cannot be 0"));
    }
    res.send("The result is " + 100/req.query.number);
});

app.listen(5000, function() {
    console.log("Listening in port 5000");
});
