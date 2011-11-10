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
  
  /**
   * GET method.
   * To fetch/query data from database.
   */
  app.get(new RegExp('^\/'+config.api_key+'(?:\/([^\/]+))?(?:\/([^\/]+))?'), function (req, res, next) {
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
      controller[actionName](req, res, dbClient, query);
    }
    else {
      res.send({error: 'Controller ' + controllerName + " not defined action :" + actionName});
    }
  });
  
  /**
   * POST method.
   * To Edit/Add data to database.
   */
  app.post(new RegExp('^\/'+config.api_key+'(?:\/([^\/]+))?(?:\/([^\/]+))?'), function (req, res, next) {
    var data = req.body;
    var module = 'profile', action = 'index';
    if (typeof req.params[0] != 'undefined') module = req.params[0];
    if (typeof req.params[1] != 'undefined') action = req.params[1];
    var controller = null;
    try {
      controller = require('./lib/' + module);
    }
    catch (err) {
      res.send({error: 'Not found controller: ' + module});
    }
    if (controller != null && (action in controller)) {
      controller[action](req, res, dbClient, data);
    }
  });
  
  app.get('*', NOTFOUND);
  
  process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
    dbClient.destroy();
  });
  
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

function isEmpty(value) {
  var emptyArray = isArray(value) && !value.length;
  var emptyObject = false;
  if (isObject(value)) {
    for (var p in value) emptyObject = true;
  }
  return emptyArray || emptyObject || value == null; 
}

function isObject(value) {
  return !!value && !value.tagName && Object.prototype.toString.call(value) === '[object Object]';
}

function isArray(array) {
  return Object.prototype.toString.apply(array) === '[object Array]';
}

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
