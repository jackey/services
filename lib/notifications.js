/*
 * /lib/nofications.js
 */
var nofication = function() {};
 
nofication.prototype = {

		// LIST ALL NOTIFICATIONS
		'list' : function(params) {

				var query = 'SELECT * FROM notifications WHERE uid='+params.uid;

				return data;
		},
		

};
 
module.exports = new nofication();