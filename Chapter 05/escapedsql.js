var mysql = require('mysql');

var connection = mysql.createConnection({
	host: 'localhost',
	username: 'root',
	password: 'root'
});

console.log(connection.escape("' OR 1=1 --"))
