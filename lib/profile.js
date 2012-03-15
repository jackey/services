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
	
  'getuser' : function(req, res, db, query) {

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
											console.log('GET USER INFO');
											//											console.log(results);
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

			console.log('EDIT USER');		

			// CHECK REQUIRED
			if (!query.uid) {
					var required = ['lname', 'fname', 'email', 'password'];
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

			console.log(query);
	
			// INSERT USER
			if (!query.uid) {

					// CHECK SI EMAIL DEJA PRIS
					var sql  = 'SELECT * FROM users WHERE email = ? AND status="on"';
					return db.query(sql, [query.email], function (err, result) {
									if (err) { res.send({error: 'Insert USER error'});	}

									if (result.length>0) {
											res.send({error: 'Email already taken'});
											return;
									} else {
											
											// INSERT
											var pass = require('crypto').createHash('md5').update(query.password).digest("hex");
											var now  = parseInt((new Date()) /1000); // Unix timestamp;
											var sql  = 'INSERT INTO users (lname,fname,nickname,email,password,sex,bday,cdate) VALUES (?, ?, ?,?, ?, ?,?,  ?)';
											var data = [query.lname, query.fname, query.nickname, query.email, pass, query.sex,query.bday, now];
											
											console.log('ADD USER INFO');
											//					console.log(data);
											return db.query(sql, data, function (err, result) {
															if (err) { res.send({error: 'Insert USER error'});	}
															console.log('ADD USER RETURN');
															console.log(result);
															res.send({uid: result.insertId}); // RET INSERTED UID
													});
									}
							});
			} 
			// UPDATE USER
			else {
					
					var sql  = 'UPDATE users  SET lname=? , fname=? ,  email=?, password=? WHERE uid=?';
					var data = [query.lname, query.fname, query.email, query.password, query.uid];

					console.log('EDIT USER INFO');
					//					console.log(data);
					return db.query(sql, data, function (err, result) {

									if (err) { res.send({error: 'Update USER error'}); }
									console.log('EDIT USER RETURN OK');
									res.send({uid: query.uid}); // RET POSTED UID 

							});
					
			}
			//			
  },

	
  // ------ GET USER INTEREST ------ >

  'getprofile' : function(req, res, db, query) {
			
			if (typeof query.uid == 'undefined') {
					res.send({error:'please provide uid'});
			}
			else {

					var sql_user = 'SELECT bday,sex,nickname,job,city FROM users WHERE uid=? ';
					return db.query(sql_user, [query.uid], function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {

											// FORMAT DATE
											//											var d    = new Date(results[0].bday);
											//		var bday = d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
											//											var bday = results[0].bday;

											retprofile = {
													uid:query.uid,
													bday: results[0].bday,
													sex: results[0].sex,
													nickname:results[0].nickname,
													job:results[0].job,
													city:results[0].city,
											};
											
											var sql = 'SELECT * FROM user_interests WHERE uid=? ';
											return db.query(sql, [query.uid], function (err, results, fields) {
															if (err) {
																	res.send({error: err});
															}
															else {
																	
																	if (results.length > 0) {

																			retprofile.age = {};
																			
																			for(i in results) {
																					
																					if ( results[i].val !=''  &&  results[i].name !='') {
																							
																							// IID 
																							if (results[i].name == 'IID') { retprofile.iid = results[i].val; } 

																							// MIN AGE
																							if (results[i].name == 'MIN_AGE') { retprofile.age.min = results[i].val; } 

																							// MAX AGE 
																							if (results[i].name == 'MAX_AGE') { retprofile.age.max = results[i].val; } 

																							// OTHER 
																							if (results[i].name == 'OTHER') { retprofile.other = results[i].val; } 

																					}
																			}
																	
																	} 
																	
																	//	{uid:'UID',bday:'BDAY',sex:'SEX',nickname:'NICKNAME',job:'JOB',city:'CITY',iid:'IID',age:{min:'MINAGE',max:'MAXAGE'},other:'OTHER'}		
																	console.log('GET PROFILE INFO');
																	//																	console.log(retprofile);


																	var sql = 'SELECT * FROM user_moodjo,moodjo WHERE uid=? AND moodjo.moid = user_moodjo.moid';
																	return db.query(sql, [query.uid], function (err, results, fields) {
																					if (err) {
																							res.send({error: err});
																					}
																					else {
																							
																							var mood = [];
																							if (results.length>0) {
																									for(var i in results) {
																											var info = {
																													content:results[i].content,
																													moid:results[i].moid,
																											};
																											mood.push(info);
																									}
																							}
																							
																							var sql = 'SELECT * FROM user_status WHERE uid=? AND content!="" ORDER BY cdate DESC LIMIT 0,1';
																							return db.query(sql, [query.uid], function (err, results, fields) {
																											if (err) {
																													res.send({error: err});
																											}
																											else {
																													
																													retprofile.status = results[0];
																													retprofile.moodjo = mood;

																													var sql  = 'SELECT * FROM checkin WHERE uid=? AND status = "on"';
																													return db.query(sql, [query.uid], function (err, result) {
																																	
																																	if (err) { res.send({error: 'LIST CHECKIN PROFILE error'});	}
																																	
																																	if (result.length>0) {
																																			retprofile.checkin = { tablename:result[0].tablename, tableid:result[0].tableid }
																																	}
																																	
																																	
																																	// console.log(retarray);
																																	
																																	res.send(retprofile);
																																	
																															});
																													
																													
																											}
																									});
																					}
																			});	
																	
																	
																		
															}
													});

										
									}
							});

				
			}
			
  },

  // ---- EDIT USER PROFILE ---- >

  'editprofile' : function(req, res, db, query) {

			if (typeof query == 'undefined') {
					res.send({error: 'not provide post data'});
					return;
			}
				
			// CHECK REQUIRED
			var required = ['nickname','bday','sex','uid'];
		
			
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
					
					var sql  = "UPDATE users  SET bday=? , sex=? ,  nickname=?, job=?, city=? WHERE uid=?";
					var data = [query.bday, query.sex, query.nickname ,query.job,query.city,query.uid];

					
					console.log('EDIT PROFILE INFO');
					//					console.log(query);
					//					{uid:'UID',bday:'BDAY',sex:'SEX',nickname:'NICKNAME',iid:'IID',age:{min:'MINAGE',max:'MAXAGE'},other:'OTHER'}
					
					console.log('LOG HERE');
					console.log(query);

					return db.query(sql, data, function (err, result) {
									
									if (err) { res.send({error: 'Update PROFILE error'}); }

									console.log('ADD PROFILE INFO');
									// console.log(result);

									// DELETE USER INTEREST
									var sql_del  = "DELETE FROM user_interests WHERE uid=?";

									return db.query(sql_del, [query.uid], function (err, result) {

													if ( typeof result.length != "undefined") {
															if (err) { res.send({error: 'DELETE INTEREST error'}); }
															console.log('DELETE INTERESTS OK');
													}
													
													// UPDATE USER INTEREST
													var sql_interest  = "INSERT INTO user_interests (name,uid,val) VALUES ('IID',?,?)";
													var data_interest = [query.uid, query.iid];
													
													return db.query(sql_interest, data_interest, function (err, result) {

																	if (err) { res.send({error: 'Update INTEREST error'}); }
																	console.log('ADD INTERESTS IID');
																	// console.log(data_interest);
																	console.log(result);
																	
																	// MIN AGE
																	var sql_agemin  = "INSERT INTO user_interests (name,uid,val) VALUES ('MIN_AGE',?,?)";
																	var data_agemin = [query.uid, query.age.min];
																	
																	return db.query(sql_agemin, data_agemin, function (err, result) {

																					if (err) { res.send({error: 'Update INTEREST AGE MIN error'}); }
																					console.log('ADD INTERESTS MIN');
																					// console.log(data_agemin);
																					
																					// MAX AGE
																					var sql_agemax  = "INSERT INTO user_interests (name,uid,val) VALUES ('MAX_AGE',?,?)";
																					var data_agemax = [query.uid, query.age.max];
																					
																					return db.query(sql_agemax, data_agemax, function (err, result) {

																									if (err) { res.send({error: 'Update INTEREST AGE MAX error'}); }
																									console.log('ADD INTERESTS MAX');
																									//																									console.log(data_agemax);
																									
																									// UPDATE USER INTEREST OTHER
																									var sql_other  = "INSERT INTO user_interests (name,uid,val) VALUES ('OTHER',?,?)";
																									var data_other = [query.uid, query.other];
																									
																									return db.query(sql_other, data_other, function (err, result) {

																													if (err) { res.send({error: 'Update INTEREST OTHER error'}); }
																													console.log('ADD INTERESTS OTHER');
																													//																													console.log(data_other);
																													
																													console.log('EDIT PROFILE RETURN OK');
																													res.send({uid: query.uid});	// RET POSTED UID 
																													
																											});
																							});
																					
																			});
																	
															});
													
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
			var sql  = 'SELECT uid FROM users WHERE email=? AND password=? AND status = "on"';
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

			console.log('INCOMING PROFILE MEDIA'); // CONSOLE

			query || (query = {});
			var fs = require('fs');
			var path = require('path');

			var form = formiable.IncomingForm();
			form.keepExtensions = true; // Check full API at [here](https://github.com/felixge/node-formidable)
			form.uploadDir = config.tmp_files_path; // NEW DEFAULT PATH
			
			form.parse(req, function (err, fields, files) {

							// CHECK UID
							if (typeof fields.uid == 'undefined' || fields.uid == '0') {
									res.send(errors);
									return;
							}
							
							var userfiles = config.user_files_path+'/'+fields.uid;
							var now  = parseInt((new Date()) /1000); 
							var thumbnail = files.thumbimg;
							var largeimg = files.largeimg;
							var largefilename = fields.uid+'_large_'+now+'.'+config.user_img_ext; // string
							var thumbfilename = fields.uid+'_thumb_'+now+'.'+config.user_img_ext; // string
							
							//				console.log(query);
							//	console.log(fields);
							
							// rename tmp file helper function.
							function renameTmp(cb) {
									cb || (cb = function () {}); // param.
									fs.rename(thumbnail.path, userfiles+'/'+thumbfilename, function (err) {
													if (err) {
															console.log('rename err');
													}
													else {
															fs.rename(largeimg.path, userfiles+'/'+largefilename, function (err) {
																			if (err) {
																					console.log(err);
																					// callback.
																					cb(err);
																			}
																			else {
																					
																					//	console.log('FILE COPIED : '+userfiles+'/'+thumbfilename+'\n'+userfiles+'/'+largefilename); // CONSOLE
																					
																					// callback.
																					cb();
																			}
																	});
													}
											});
							}
							
							// insert data into DB user media
							function doInsert() {
									
									// INSERT IN DB
									var sql  = 'INSERT INTO users_media (uid,thumbimg,largeimg,pos,cdate) VALUES (?, ?, ?, ?,now())';
									var data = [fields.uid, thumbfilename, largefilename, fields.pos];
						
									//		console.log(sql); // CONSOLE
									//		console.log(data); // CONSOLE
						
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
							
							// step 1. mkdir folder for store new img; we don't use asyn function because it will cause nest callback.
							// Maybe we don't need fields.uid for folder location.that means remove fields.uid from userfiles.
							if (!path.existsSync(userfiles)) {
									fs.mkdir(userfiles, 0777, function (err) {
													if (err) {
															console.log(err);
													}
													else {
															console.log('CREATE DIR ');
															
															fields.pos = 1; // FORCE for 1st case
															
															// Step 2. rename the files.
															// We don't need pass params to this function, because it can get params from current context;
															renameTmp(function (err) {
																			if (err) {
																					
																			}
																			else {
																					// step 3.
																					//no error, we can insert data to mysql database now;
																					doInsert();
																			}
																	});
													}
							});
							}
							else {
									console.log('READ DIR ');
									
									// Step 2.
									renameTmp(function (err) {
													if (err) {
															
													}
													else {
															// Step3.
															// no error, we can insert data to mysql
															doInsert();
													}
											});
							}
					});
  },

  // GET ALL USER IMAGES
  'listusermedia' :  function(req, res, db, query) {
			
			if (typeof query.uid == 'undefined') {
					res.send({error:'provide User ID'});
			}
			else {
					
					var sql = 'SELECT *,concat(pos,cdate) as ord FROM users_media WHERE uid=? AND status = "on" ORDER BY ord DESC';
					return db.query(sql, [query.uid], function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {

											if (results.length == 0 || typeof results[0].thumbimg == 'undefined') {
													res.send({error:'no pic'});
													return;
											}

											var thumbs = [];
											var larges = [];

											var userurl = config.http_url+':'+config.port+'/'+config.api_key+'/profile/getmedia';

											for (i in results) {
													thumbs.push(userurl+'thumb?umid='+results[i].umid);
													larges.push(userurl+'large?umid='+results[i].umid);
													//													thumbs[i] = userurl+'thumb?umid='+results[i].umid;
													//													larges[i] = userurl+'large?umid='+results[i].umid;
											}

											res.send({thumbimg:thumbs,largeimg:larges});
									}
							});	

			}

  },

	// ---- GET MEDIA THUMB IMAGES FROM UMID --- >

	'getmediathumb' :  function(req, res, db, query) {
			
			if (typeof query.umid == 'undefined' ||  query.umid == 0) {
					res.send({error:'provide MEDIA ID'});
			}
			else {
					
					var sql = 'SELECT * FROM users_media WHERE umid=? AND status="on"';
					return db.query(sql, [query.umid], function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {

											if (results.length == 0 || typeof results[0].thumbimg == 'undefined') {
													res.send({error:'no pic'});
													return;
											}
											
											var mediafile = config.user_files_path+'/'+results[0].uid+'/'+results[0].thumbimg;

											var fs = require('fs');

											fs.stat(mediafile, function(err, stats) {
															if (stats.size > 0) {
																	res.writeHead(200, {'Content-Type': 'image/jpg', 'Content-Length': stats.size});
																	var enc = 'binary', rz = 8*1024;
																	fs.open(mediafile, 'r', 06660, function(err, fd) {
																					if (err) sys.puts(sys.inspect(err));
																					var pos = 0;
																					function readChunk () {
																							fs.read(fd, rz, pos, enc, function(err, chunk, bytes_read) {
																											if (err) sys.puts(sys.inspect(err));
																											if (chunk) {
																													try {
																															res.write(chunk, enc);
																															pos += bytes_read;
																															readChunk();
																													} catch (e) {
																															fs.close(fd);
																															sys.puts(sys.inspect(e));
																													}
																											}
																											else {
																													res.end();
																													fs.close(fd, function (err) {
																																	if (err) sys.puts(sys.inspect(err));
																																	sys.puts(sys.inspect(fd));
																															});
																											}
																									});
																					}
																					readChunk();
																			});
															} else{
																	res.send({error:'no pic'});
															}
													}); 
											
									}
							});	

			}
			
	},
	
	// ---- GET MEDIA THUMB IMAGES FROM UMID --- >

	'getmedialarge' :  function(req, res, db, query) {
			
			if (typeof query.umid == 'undefined' ||  query.umid == 0) {
					res.send({error:'provide MEDIA ID'});
			}
			else {
					
					var sql = 'SELECT * FROM users_media WHERE umid=? AND status="on"';
					return db.query(sql, [query.umid], function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {

											if (results.length == 0 || typeof results[0].largeimg == 'undefined') {
													res.send({error:'no pic'});
													return;
											}
											
											var mediafile = config.user_files_path+'/'+results[0].uid+'/'+results[0].largeimg;

											var fs = require('fs');

											fs.stat(mediafile, function(err, stats) {
															if (stats.size > 0) {
																	res.writeHead(200, {'Content-Type': 'image/jpg', 'Content-Length': stats.size});
																	var enc = 'binary', rz = 8*1024;
																	fs.open(mediafile, 'r', 06660, function(err, fd) {
																					if (err) sys.puts(sys.inspect(err));
																					var pos = 0;
																					function readChunk () {
																							fs.read(fd, rz, pos, enc, function(err, chunk, bytes_read) {
																											if (err) sys.puts(sys.inspect(err));
																											if (chunk) {
																													try {
																															res.write(chunk, enc);
																															pos += bytes_read;
																															readChunk();
																													} catch (e) {
																															fs.close(fd);
																															sys.puts(sys.inspect(e));
																													}
																											}
																											else {
																													res.end();
																													fs.close(fd, function (err) {
																																	if (err) sys.puts(sys.inspect(err));
																																	sys.puts(sys.inspect(fd));
																															});
																											}
																									});
																					}
																					readChunk();
																			});
															} else{
																	res.send({error:'no pic'});
															}
													}); 
											
									}
							});	

			}
			
	},
	

  // ---- GET MAIN USER PROFILE IMAGE --- >

  'getprofilemedia' :  function(req, res, db, query) {
			
			console.log('GET PROFILE USER MEDIA');
			//			console.log(query);

			if (typeof query.uid == 'undefined' ||  query.uid == 0) {
					res.send({error:'provide USER ID'});
			}
			else {

					var sql = 'SELECT sex FROM users WHERE  uid=? AND users.status="on" ';
					return db.query(sql, [query.uid], function (err, results, fields) {

									var sex = results[0].sex;
									
									var sql = 'SELECT * FROM users_media WHERE  users_media.uid=? AND pos="1" AND users_media.status="on" ';
									return db.query(sql, [query.uid], function (err, results, fields) {
													if (err) {
															res.send({error: err});
													}
													else {
															
															// console.log(results);
															
															var mediafile;
															if (results.length == 0 || typeof results[0].thumbimg == 'undefined') {
																	mediafile = config.misc_files_path+'/noprofile_'+sex+'_thumb.png'; // DEFAUT IMG
															} else {
																	mediafile = config.user_files_path+'/'+query.uid+'/'+results[0].thumbimg;
															}
															
															var fs = require('fs');
															
															fs.stat(mediafile, function(err, stats) {
																			if (stats.size > 0) {
																					res.writeHead(200, {'Content-Type': 'image/jpg', 'Content-Length': stats.size});
																					var enc = 'binary', rz = 8*1024;
																					fs.open(mediafile, 'r', 06660, function(err, fd) {
																									if (err) sys.puts(sys.inspect(err));
																									var pos = 0;
																									function readChunk () {
																											fs.read(fd, rz, pos, enc, function(err, chunk, bytes_read) {
																															if (err) sys.puts(sys.inspect(err));
																															if (chunk) {
																																	try {
																																			res.write(chunk, enc);
																																			pos += bytes_read;
																																			readChunk();
																																	} catch (e) {
																																			fs.close(fd);
																																			sys.puts(sys.inspect(e));
																																	}
																															}
																															else {
																																	res.end();
																																	fs.close(fd, function (err) {
																																					if (err) sys.puts(sys.inspect(err));
																																					sys.puts(sys.inspect(fd));
																																			});
																															}
																													});
																									}
																									readChunk();
																							});
																			} else{
																					res.send({error:'no pic'});
																			}
																	}); 
															
															// res.send(mediafile);
													}
											});
							});	
					
			}
			
			
  },

		
  // GET MAIN USER PROFILE IMAGE
  'editusermediapos' :  function(req, res, db, query) {
			
			//			console.log('UID / '+query.uid);

			if (typeof query == 'undefined') {
					res.send({error: 'not provide post data'});
					return;
			}
			
			var required = ['uid', 'umid'];
			
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

			var sql  = "UPDATE users_media SET  pos='0' WHERE uid=?  ";
			var data = [ query.uid];
			
			return db.query(sql, data, function (err, result) {
							
							if (err) {
									res.send({error: 'MEDIA UPD user error'});
							}
							var sql  = "UPDATE users_media SET  pos='1' WHERE umid=?  ";
							var data = [query.umid];
							
							return db.query(sql, data, function (err, result) {
											
											if (err) {
													res.send({error: 'MEDIA CHG user error'});
											}
											
											res.send({umid:query.umid});
											
									});	

					});
			
  },

  // GET MAIN USER PROFILE IMAGE
  'delusermedia' :  function(req, res, db, query) {
			
			if (typeof query.umid == 'undefined') {
					res.send({error:'provide MEDIA ID'});
			}
			else {
					var data = [query.uid,query.umid];
					var sql = 'UPDATE  users_media SET status = "delete" WHERE uid=? AND umid=?';
					return db.query(sql, data, function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {
											res.send({umid:query.umid});
									}
							});	

			}
  },

	
  // GET ALL USER IMAGES
  'listmedia' :  function(req, res, db, query) {
			
			/*
			if (typeof query.mid == 'undefined') {
					res.send({error:'provide User ID'});
			}
			else {
					
					var sql = 'SELECT * FROM media WHERE pid=? ';
					return db.query(sql, [query.uid], function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {
											res.send(results);
									}
							});	

			}

			*/
			
  },
	
  // GET MAIN USER PROFILE IMAGE
  'getmedia' :  function(mediafile) {
			
  },


	
  // ====== MOODJO METHODS ===== >

  // GET USER MOODJO
  'getusermoodjo' :   function(req, res, db, query) {
			
			if (typeof query.uid == 'undefined') {
					res.send({error:'provide User ID'});
			}
			else {
					
					var sql = 'SELECT * FROM user_moodjo,moodjo WHERE uid=? AND moodjo.moid = user_moodjo.moid';
					return db.query(sql, [query.uid], function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {

											var mood = [];
											if (results.length>0) {
													for(var i in results) {
															var info = {
																	content:results[i].content,
																	moid:results[i].moid,
															};
															mood.push(info);
													}
											}
											
											var sql = 'SELECT * FROM user_status WHERE uid=? ORDER BY cdate DESC LIMIT 0,1';
											return db.query(sql, [query.uid], function (err, results, fields) {
															if (err) {
																	res.send({error: err});
															}
															else {
																	
																	var retobj = {
																			status:results[0],
																			moodjo:mood,
																	};
																	
																	res.send(retobj);
																	
															}
													});	
									}
							});	
					
			}

  },
	

  // EDIT USER MOODJOS
  'editusermoodjo' :  function(req, res, db, query) {
			if (typeof query == 'undefined') {
					res.send({error: 'not provide post data'});
					return;
			}
				
			// CHECK REQUIRED
			var required = ['uid'];
		
			
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

			console.log('EDIT USER MOODJO INFO');
			console.log(query);

			var now  = parseInt((new Date()) /1000); // Unix timestamp;
			var sql  = "INSERT INTO user_status (uid,content,cdate) VALUES (?,?,?)";
			var data = [query.uid, query.status,now];
						
			return db.query(sql, data, function (err, result) {
							
							if (err) { res.send({error: 'Update USER MOODJO error'}); }
							
							// DELETE USER INTEREST
							var sql_del  = "DELETE FROM user_moodjo WHERE uid=?";
							
							return db.query(sql_del, [query.uid], function (err, result) {
											
											if ( typeof result.length != "undefined") {
													if (err) { res.send({error: 'DELETE USER MOODJO error'}); }
													console.log('DELETE USER MOODOJO');
											}
											
											if (query.moodjo.length > 0) {

													var sql  = '';
													var info = [];

													for(var i in query.moodjo) {

															// do something with string in data
															sql+= 'INSERT INTO user_moodjo (uid,moid) VALUES (?,?) ;';
															
															info.push(query.uid);
															info.push(Number(query.moodjo[i]));
													}

													console.log(info);
													console.log(sql);
													
													return db.query(sql, info, function (err, result) {
																	if (err) { res.send({error: 'Update USER MOODJO IDS error'}); }	
																	getusermoojo();
															});
													
											} else {
													getusermoojo();
											}

									});
							
					});
			
			
			function getusermoojo() {
					
					var sql = 'SELECT * FROM user_moodjo,moodjo WHERE uid=? AND moodjo.moid = user_moodjo.moid';
					return db.query(sql, [query.uid], function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {
											
											var mood = [];
											if (results.length>0) {
													for(var i in results) {
															var info = {
																	content:results[i].content,
																	moid:results[i].moid,
															};
															mood.push(info);
													}
											}
											
											var retobj = {
													status:query.status,
													moodjo:mood,
											};
											
											res.send(retobj);

									}
							});	
			}

			
  },
	
	
  // LIST MOODJO
  'listmoodjo' :  function(req, res, db, query) {
			
			var sql = 'SELECT * FROM moodjo ORDER BY content ASC ';
			return db.query(sql, function (err, results, fields) {
							if (err) {
									res.send({error:err});
							}
							else {
									res.send(results);
							}
					});
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
