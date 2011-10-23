/*
 * /lib/profile.js
 */
var profile = function() {};
 
profile.prototype = {
		
		// ---- USERS ---- >

		// LIST USER
		'listuser' : function(params) {
				
				var data = {};

				var query = 'SELECT * FROM users';

				return query;
		},

			// USER INFO
		'getinfo' : function(params) {

				var query = 'SELECT * FROM users WHERE uid='+params.uid;

				return query;
		},
	
		// ADD /EDIT NEW USER (params)
		'edituser' : function(params) {
				
				if (params.uid == '') {
						var query = 'INSERT INTO users (lname,fname,nickname,email,password,cdate) VALUES ("'+params.info.lname+'","'+params.info.fname+'","'+params.info.nickname+'","'+params.info.email+'","'+params.info.password+'",now())';
				} else {
						var query = 'UPDATE users SET lname="'+params.info.lname+'", fname="'+params.info.fname+'", nickname="'+params.info.nickname+'", email="'+params.info.email+'"  WHERE uid='+params.uid;
				}
				
				return data;
		},

		// EDIT USER PROFILE (paramsstatus, ...)
		'editprofile' : function(params) {
				return data;
		},

		// CHECK USER LOGIN
		'login' : function(params) {
				return data;
		},


		// ---- MEDIA ---- >

		// ADD USER IMAGE
		'addmedia' : function(params) {
				return data;
		},

		// GET ALL USER IMAGES
		'listmedia' : function(params) {
				return data;
		},

		// GET MAIN USER IMAGE
		'getmedia' : function(params) {
				return data;
		},

		// ---- MOODJO ---- >
		

		// GET USER MOODJO
		'getusermoodjo' : function(params) {
				return data;
		},

		// ADD USER MOODJOS
		'addusermoodjo' : function(params) {
				return data;
		},
		
		// LIST MOODJO
		'listmoodjo' : function(params) {
				return data;
		},
		


		// ---- PREF ---- >
		
		// GET USER PREF
		'getuserpref' : function(params) {
				return data;
		},
		
		// LIST PREF
		'listpref' : function(params) {
				return data;
		},
		
		// ADD / EDIT INTEREST
		'editpref' : function(params) {
				return data;
		},


		// ---- INTEREST ---- >
		
		// GET USER INTEREST
		'getuserinterest' : function(params) {
				return data;
		},
		
		
		// ADD USER INTEREST
		'adduserinterest' : function(params) {
				return data;
		},
		
		
		// DEL USER INTEREST
		'deluserinterest' : function(params) {
				return data;
		},
		
		// LIST INTEREST
		'listinterest' : function(params) {
				return data;
		},

		// ADD / EDIT INTEREST
		'editinterest' : function(params) {
				return data;
		},


		// ---- STATEMENT ---- >
		
		// GET USER INTEREST
		'getstatement' : function(params) {
				return data;
		},

		// ADD USER INTEREST
		'addstatement' : function(params) {
				return data;
		},


};

module.exports = new profile();