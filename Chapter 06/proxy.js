var http = require('http');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

http.createServer(function(req, res) {
    console.log(req.rawHeaders);
    proxy.web(req, res, { target: 'http://localhost:3000' });
}).listen(4000);
