var express = require('express');
var app = express();
var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  port     : '3306',
  user     : 'root',
  password : 'root',
  database : 'communera'
});

app.get('/login', function(req, res) {
    var username = req.query.username;
    var password = req.query.password;
    
    connection.connect();
    var query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
    connection.query(query, function(err, rows, fields) {
        console.log(err);
        if (err) throw err;
        res.send(rows);
    });
    connection.end();
});

app.listen(4000, function() {
    console.log("Application running in port 3000.");
});
