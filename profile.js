/*
 * /lib/profile.js
 */
var formiable = require('formidable'),
    tool = require('./tool'),
		config = require('../config.js'),
		sys = require('sys');

var profile = function() {
};

profile.prototype = {


  // ====== USER METHODS ===== >


  // ---- LIST USER ---- >

  'listuser' : function(req, res, db, query) {
    var sql = 'SELECT * FROM users';
    return db.query(sql, function (err, results, fields) {
      if (err) {
        res.send({error:err});
      }
      else {
        res.send(results);
      }
    });
  },


  // ---- USER INFO --- > 
	
  'getinfo' : function(req, res, db, query) {

			if (typeof query.uid == 'undefined') {
					res.send({error:'please provide uid'});
			}
			else {
					var sql = 'SELECT * FROM users WHERE uid=?';
					return db.query(sql, [query.uid], function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {
											res.send(results);
									}
							});
			}
  },
	
	
  // ---- ADD /EDIT NEW USER ---- >

  'edituser' : function(req, res, db, query) {

			if (typeof query == 'undefined') {
					res.send({error: 'not provide post data'});
					return;
			}
			
			// CHECK REQUIRED
			if (!query.uid) {
					var required = ['lname', 'fname', 'email', 'password','bday','sex'];
			} else {
					var required = ['lname', 'fname', 'email', 'password'];
			}
			
			// CHECK DATA.
			var errors = [];
			required.forEach(function (property) {
							if (!(property in query) || query[property] == '') {
									errors.push({error: 'property '  + property + " is not provided!"});
							}
					});
			
			if (errors.length) {
					res.send(errors);
					return;
			}
	
			// INSERT USER
			if (!query.uid) {

					var pass = require('crypto').createHash('md5').update(query.password).digest("hex");
					var now  = parseInt((new Date()) /1000); // Unix timestamp;
					var sql  = "INSERT INTO users (lname,fname,nickname,email,password,bday,sex,cdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
					var data = [query.lname, query.fname, query.nickname, query.email, pass, query.bday,query.sex, now];

					return db.query(sql, data, function (err, result) {
									if (err) { res.send({error: 'Insert USER error'});	}
									res.send({uid: result.insertId}); // RET INSERTED UID
							});
					
			} 
			// UPDATE USER
			else {
					
					var sql  = "UPDATE users  SET lname=? , fname=? ,  email=?, password=? WHERE uid=?";
					var data = [query.lname, query.fname, query.email, query.password,query.uid];

					return db.query(sql, data, function (err, result) {

									if (err) { res.send({error: 'Update USER error'}); }
									res.send({data: query.uid}); // RET POSTED UID 

							});
					
			}
			//			
  },

	
  // ---- EDIT USER PROFILE ---- >

  'editprofile' : function(req, res, db, query) {

			if (typeof query == 'undefined') {
					res.send({error: 'not provide post data'});
					return;
			}
				
			// CHECK REQUIRED
			var required = ['nickname','bday','sex','iid','uid'];
		
			
			// CHECK DATA.
			var errors = [];
			required.forEach(function (property) {
							if (!(property in query) || query[property] == '') {
									errors.push({error: 'property '  + property + " is not provided!"});
							}
					});
			
			if (errors.length) {
					res.send(errors);
					return;
			}
			
			// UPDATE USER PROFILE
			if (query.uid) {
					
					var sql  = "UPDATE users  SET bday=? , sex=? ,  nickname=? WHERE uid=?";
					var data = [query.bday, query.sex, query.nickname,query.uid];

					return db.query(sql, data, function (err, result) {

									if (err) { res.send({error: 'Update PROFILE error'}); }

									// DELETE USER INTEREST
									
									

									// UPDATE USER INTEREST
									var sql_interest  = "INSERT INTO user_interest (uid,iid) VALUES (?,?)";
									var data_interest = [query.uid, query.iid];
									
									return db.query(sql, data, function (err, result) {

													if (err) { res.send({error: 'Update INTEREST error'}); }
													res.send({data: query.uid});	// RET POSTED UID 

											});
									
							});
					
			}

			//			
  },


  // ----- CHECK USER LOGIN -  uid , login, pwd ----- >

  'login' :  function(req, res, db, query) {

			if (typeof query == 'undefined') {
					res.send({error: 'not provide post data'});
					return;
			}
				
			var required = ['email', 'password'];
			
			// Check the data.
			var errors = [];
			required.forEach(function (property) {
							if (!(property in query) || query[property] == '') {
									errors.push({error: 'property '  + property + " is not provided!"});
							}
					});
			
			if (errors.length) {
					res.send(errors);
					return;
			}
			
			//	var pass = require('crypto').createHash('md5').update(query.password).digest("hex");
			var now  = parseInt((new Date()) /1000); // Unix timestamp;
			var sql  = "SELECT uid FROM users WHERE email=? AND password=? ";
			var data = [ query.email, query.password];
			
			return db.query(sql, data, function (err, result) {
							
							if (err) {
									res.send({error: 'Login user error'});
							}
					
							// return inserted uid
							if (result.length) {
									res.send(result);
									return;
							}
							else {
									res.send({error: 'Login user error'});
									return;
							}
							
					});
			
			return;
			// 
  },


  // ----- CHECK USER LOGIN -  uid , login, pwd ----- >

  'logout' :  function(req, res, db, query) {
			
			if (typeof query.uid == 'undefined') {
					res.send({error:'please provide uid'});
			}
			else {
					res.send('1');
			}
	},


  // ====== MEDIA METHODS ======  >

  // ----- ADD USER MEDIA : NEED uid,pos, 2 files ----- >

  'addmedia' :   function(req, res, db, query) {

			console.log('INCOMING MEDIA'); // CONSOLE

			query || (query = {});

			var fs = require('fs');


			var form = formiable.IncomingForm();
			form.keepExtensions = true; // Check full API at [here](https://github.com/felixge/node-formidable)
			form.uploadDir = config.tmp_files_path; // NEW DEFAULT PATH
			
			form.parse(req, function (err, fields, files) {
							
							console.log(files);
							console.log(fields);
							
							// ONLY UID
							if (typeof fields.uid != 'undefined' && true) {
									
								
									var userfiles = config.user_files_path+'/'+fields.uid;
									var doit = 0;

									console.log('WITH UID > '+fields.uid); // CONSOLE
									
								
									// RENAME TO CORRECT FILE NAME & PATH
									function moveit() {
											
											var now  = parseInt((new Date()) /1000); 
											
											// FILE OBBJ & NAMING
											var largeimg = files.largeimg; // obj
											var thumbimg = files.thumbimg; // obj
											var largefilename = fields.uid+'_large_'+now+'.'+config.user_img_ext; // string
											var thumbfilename = fields.uid+'_thumb_'+now+'.'+config.user_img_ext; // string
											
											// RENAME LARGE IMG
											fs.rename(largeimg.path, userfiles+'/'+largefilename, function (err) {
															
															if (err) { 	console.log(err); } 
															else {

																	console.log('LARGE OK : '+userfiles+'/'+largefilename); // CONSOLE

																	// RENAME THUMB IMG
																	fs.rename(thumbimg.path, userfiles+'/'+thumbfilename, function (err) {
																					
																					if (err) { 	console.log(err); }
																					else {

																							console.log('THUMB OK : '+userfiles+'/'+thumbfilename); // CONSOLE

																							// INSERT IN DB
																							var sql  = 'INSERT INTO users_media (uid,thumbimg,largeimg,pos,cdate) VALUES (?, ?, ?, ?,now())';
																							var data = [fields.uid, thumbfilename, largefilename, fields.pos];
																							
																							console.log(sql); // CONSOLE
																							console.log(data); // CONSOLE

																							return db.query(sql, data, function (err, result) {
																											
																											if (err) {  res.send({error: 'Insert USER IMG error'}); }
																											else {

																													clientret = {
																															uid:fields.uid,
																															umid:result.insertId,
																															thumbimg:thumbfilename,
																															largeimg:largefilename,
																															pos:fields.pos,
																													};

																													console.log(clientret);

																													// SEND TO CLIENT APPS
																													res.send(clientret);	

																											}
																									});	
																					}
																					
																			});
															}
															
													});
									}


									// CHECK IF USER DIR EXIST 

							}
					});
			
  },
	
  // GET ALL USER IMAGES
  'listmedia' : function(params) {
    
  },

  // GET MAIN USER IMAGE
  'getmedia' : function(params) {
    
  },

  // ====== MOODJO METHODS ===== >

  // GET USER MOODJO
  'getusermoodjo' : function(params) {
    
  },

  // ADD USER MOODJOS
  'addusermoodjo' : function(params) {
    
  },

  // LIST MOODJO
  'listmoodjo' : function(params) {
    
  },

  // ===== PREF METHODS ====== >

  // GET USER PREF
  'getuserpref' : function(params) {
    
  },

  // LIST PREF
  'listpref' : function(params) {
    
  },

  // ADD / EDIT INTEREST
  'editpref' : function(params) {
    
  },

  // ===== INTEREST METHODS ===== >

  // GET USER INTEREST
  'getuserinterest' : function(req, res, db, query) {
			
			if (typeof query.uid == 'undefined') {
					res.send({error:'please provide uid'});
			}
			else {
					var sql = 'SELECT * FROM user_interests,interest WHERE uid=? AND user_interests.iid = interest.iid';
					return db.query(sql, [query.uid], function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {
											res.send(results);
									}
							});
			}
			
  },

  // ADD USER INTEREST
  'adduserinterest' : function(params) {
    
  },

  // DEL USER INTEREST
  'deluserinterest' : function(req, res, db, query) {
			
			if (typeof query.uid == 'undefined') {
					res.send({error:'please provide uid'});
			}
			else {
					var sql = 'DELETE * FROM user_interests WHERE uid=?';
					return db.query(sql, [query.uid], function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {
											return 1;
									}
							});
			}			
			
  },
	
  // LIST INTEREST
  'listinterest' : function(req, res, db, query) {
			
			var sql = 'SELECT * FROM interest';
			return db.query(sql, function (err, results, fields) {
							if (err) {
									res.send({error:err});
							}
							else {
									res.send(results);
							}
					});
			
  },

  // ADD / EDIT INTEREST
  'editinterest' : function(params) {
    
  },

  // ===== STATEMENT METHODS ===== >

  // GET USER INTEREST
  'getstatement' : function(params) {
    
  },

  // ADD USER INTEREST
  'addstatement' : function(params) {
    
  },

};

module.exports = new profile();
