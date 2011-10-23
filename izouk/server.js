// INCLUDE NODE MODULES
var util   = require('util');
var http  = require('http');
var url   = require('url');

// INCLUDE IZOUK MODULES
var route = require('./lib/route.js');

// HTTP SPECS & DEFINES
var http_port = 81; // node / apps port

console.log('Starting server @ http://127.0.0.1:'+http_port);

http.createServer(function (req, res) {
				
				try {
						
						console.log('Incoming Request from: ' +  req.connection.remoteAddress + ' for href: ' + url.parse(req.url).href );
						
						//route HTTP request from URL
						route.dispatch(req, res);
						
				} catch (err) {
						util.puts(err);
						res.writeHead(500);
						res.end('Internal Server Error');
				}  
				
		}).listen(http_port);

console.log('Server running at port '+http_port);
