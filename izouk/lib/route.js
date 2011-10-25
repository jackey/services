/*
 * /lib/route.js
 */
var url   = require('url');
var JSON  = require('./json.js');

// CONSTRUCTOR
var route = function() {};

// APP KEY FOR SECURITY CHECK
var app_key   = '923ba62e645ac16973d2c9ded9c6f061'; // md5(1z0uk!#@)


route.prototype = {

		// GET AND DISPLATCH REQUEST
		'dispatch' : function(req,res) {
				
				var content = '';
				
				if (req.url == '/') { // INDEX PAGE - NO REQUEST

						content+= 'iZouk Home';

				} else { // REQUEST 
						
						// GET URL PARTS
						var parts = req.url.split('/');
						var url_parts = url.parse(req.url, true);
						var params     = url_parts.query;
						
						var controller = require('./'+parts[1]+'.js');
						var method    = parts[2];

						console.log('> '+fct);
						
						// EXECUTE FUNCTION FROM CONTROLLER
						var result = controller[method](params);

						content+= parts[1]+'\n'+parts[2]+'\n'+JSON.stringify(params)+'\n'+result;


						/*
						for(var i=0; i<parts.length;i++) {
								if (parts[i].split('?').length == 1 && parts[i].length > 0) { // FILTER PARAMS FROM PARTS
										content+= parts[i]+'\n';
								}
						}

						// GET PARAMS	
						if (params != undefined) {
								console.log(query);
								content+= JSON.stringify(params);
						}
						*/

				}

				res.writeHead(200,{'Content-Type': 'text/plain'});
				res.end(content);
				
		}

}

module.exports = new route();