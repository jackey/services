// INCLUDE NODE MODULES
var express = require('express'),
    config = require('./config.js'),
    mysql = require('mysql'),
    route = require('./lib/route.js'),
    formidable = require('formidable'),
    sys = require('sys'),
    MySQLPool = require("mysql-pool").MySQLPool;

function init(app, callback) {
  // Use middleware;
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  
// Use mysql-pool instead of native mysql client.
//  var dbClient = mysql.createClient({
//    user: config.dbUser,
//    password: config.dbPass
//  });
//  dbClient.query('USE ' + config.db);
  
  var dbClient = new MySQLPool({
    poolSize: 4,
    user:     config.dbUser,
    password: config.dbPass,
    database: config.db
  });
  
  app.get('/', function (req, res, next) {
    res.send({});
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
							res.send('Not controller found :' + controllerName);
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
					var module = 'profile', action = 'index'; // Default profile
					if (typeof req.params[0] != 'undefined') module = req.params[0];
					if (typeof req.params[1] != 'undefined') action = req.params[1];
					var controller = null;
					try {
							controller = require('./lib/' + module);
					}
					catch (err) {
							res.send({error: 'Not controller found: ' + module});
					}
					if (controller != null && (action in controller)) {
							controller[action](req, res, dbClient, data);
					}
			});
  
  /**
   * GET MEDIA USER IMAGE method.
   * To fetch/query data from database.
   */
  app.get(new RegExp('^\/'+config.api_key+'/media/(?:\/([^\/]+))?'), function (req, res, next) {

					if (typeof req.params[0] != 'undefined') {
							var controller = null;
							var action     = 'getprofilemedia' ;
							try {
									controller = require('./lib/profile.js');
							}
							catch (err) {
									res.send({error: 'Not found controller: profile'});
							}
							if (controller != null && (action in controller)) {
									controller[getprofilemedia](req, res, dbClient, req.params[0]);
							}
					}
			});
  
	
	// TEST FORM FOR UPLOADING USERS IMAGE
  app.get('/upload-image', function (req, res) {
					if (req.form) {
							req.form.complete(function (err, fields, files) {
											res.send(fields);
									});
					}
					else {
							// show a file upload form
							res.writeHead(200, {'content-type': 'text/html'});
							res.end(
											'<form action="/71a18e061132b7a6ab9495aa9ba40264/profile/addmedia" enctype="multipart/form-data" method="post">'+
											'UID <input type="text" name="uid"><br>'+
											'POS <input type="text" name="pos"><br>'+
											'LARGE IMG <input type="file" name="largeimg" multiple="multiple"><br>'+
											'THUMB IMG <input type="file" name="thumbimg" multiple="multiple"><br>'+
											'<input type="submit" value="Upload">'+
											'</form>');
					}
			});
  
	
  app.get('*', NOTFOUND);
  
  callback(app);
}

function NOTFOUND(req, res, next) {
		res.send('404:NOT FOUND');
}

var app = express.createServer();


process.on('uncaughtException', function (err) {
  console.error(err.stack);
});

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