// INCLUDE NODE MODULES
var express = require('express'),
    config = require('./config.js'),
    mysql = require('mysql'),
    route = require('./lib/route.js');

function init(app, callback) {
  // Use middleware;
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  
  var dbClient = mysql.createClient({
    user: config.dbUser,
    password: config.dbPass
  });
  
  dbClient.query('USE ' + config.db);
  
  app.get('/', function (req, res, next) {
    res.send('hello');
  });
  
  app.get(/^\/server(?:\/([^\/]+))?(?:\/([^\/]+))?/, function (req, res, next) {
    var query = require('url').parse(req.url, true).query;
    var controllerName = 'profile', actionName = 'index'; // Default module and action;
    if (typeof req.params[0] != 'undefined') controllerName = req.params[0];
    if (typeof req.params[1] != 'undefined') actionName = req.params[1];
    var controller = null;
    try {
      controller = require('./lib/' + controllerName);
    }
    catch (err) {
      res.send('Not found controller :' + controllerName);
    }
    if (controller && (actionName in controller)) {
      controller[actionName](req, res, query, dbClient);
    }
    else {
      res.send('Controller ' + controllerName + " not defined action :" + actionName);
    }
    
  });
  
  app.get('*', NOTFOUND);
  
  callback(app);
}

function NOTFOUND(req, res, next) {
  res.send('404:NOT FOUND');
}

var app = express.createServer();
init(app, function (app) {
  app.listen(config.port);
  console.log('Starting server @ http://127.0.0.1:'+config.port);
});


//// HTTP SPECS & DEFINES
//var http_port = 81; // node / apps port
//
//console.log('Starting server @ http://127.0.0.1:'+http_port);
//
//http.createServer(function (req, res) {
//				
//				try {
//						
//						console.log('Incoming Request from: ' +  req.connection.remoteAddress + ' for href: ' + url.parse(req.url).href );
//						
//						//route HTTP request from URL
//						route.dispatch(req, res);
//						
//				} catch (err) {
//						util.puts(err);
//						res.writeHead(500);
//						res.end('Internal Server Error');
//				}  
//				
//		});.listen(http_port);

//console.log('Server running at port '+http_port);
