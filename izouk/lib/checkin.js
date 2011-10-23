/*
 * /lib/checkin.js
 */
var checkin = function() {};
 
checkin.prototype = {

		
		// ----- CHECKIN ---- >
		
		
		// ADD CHECKIN FOR USER
		'add' : function(params) {
				return data;
		},
		
		
		// GET CHECKIN FOR USER
		'get' : function(params) {
				return data;
		},
		

		// ----- PLACES ---- >		
			
		// ADD / EDIT PLACE
		'editplace' : function(params) {
				return data;
		},
			
		// PLACE INFO
		'getplace' : function(params) {
				// getaddress(aid);
				return data;
		},,
		
		// PLACE INFO (arg can be GPS, first letter of name ...)
		'listplace' : function(params) {
				return data;
		},,
		
		
		// ----- EVENTS ---- >		
			
		// ADD / EDIT EVENT
		'editevent' : function(params) {
				return data;
		},,
			
		// PLACE EVENT
		'getevent' : function(params) {
				// getaddress(aid);
				return data;
		},
		
		// LIST EVENT (arg can be GPS, first letter of name ...)
		'listevent' : function(params) {
				return data;
		},
		
				
		// ----- TRANSPORTS ---- >		
			
		// ADD / EDIT TRANSPORT
		'edittransport' : function(params) {
				return data;
		},
			
		// PLACE TRANSPORT
		'gettransport' : function(params) {
				// getaddress(aid);
				return data;
		},
		
		// LIST TRANSPORT (arg can be GPS, first letter of name ...)
		'listtransport' : function(params) {
				return data;
		},
		
		
		// ----- ADDRESSES ----- >

		// ADD / EDIT ADDRESS
		'editaddress' : function(params) {
				return data;
		},		

		// LIST ADDRESS (arg can be city, zipcode, ...)
		'listaddress' : function(params) {
				return data;
		},		

		// GET ADDRESS (arg can be city, zipcode, ...)
		'getaddress' : function(params) {
				return data;
		},		


};
 
module.exports = new checkin();