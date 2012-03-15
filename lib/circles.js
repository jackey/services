/*
 * /lib/circles.js
 */
var formiable = require('formidable'),
    tool = require('./tool'),
		config = require('../config.js'),
		sys = require('sys');

var circles = function() {};
 
circles.prototype = {

		// MAP
		'map' :  function(req, res, db, query) {

				// Proxy to access google geocoding services.
				var http = require('http');
										
				http.get('/google-geocoding', function (req, res, next) {
								
								//																				var params = req.query;
								
								// CHECK GOOGLE MAP API GPS
								var address = escape('23 rue victor hugo+92100+boulogne+france');
								
								var cid = '42';

								console.log(address);
								
								//var address = params.address ? params.address : '';
								
								// TODO: we should have more conplex data later on.
								var data = {
																						address: address,
																						sensor: false
								};
								
								
								if (address) {
										var url = 'maps.googleapis.com';
										var greq = http.request({
														host: url,
														method: 'GET',
														path: '/maps/api/geocode/json?' + querystring.stringify(data)
														
												}, function (gres) {
														
														var pageData = '';
														
														gres.setEncoding('utf8');
														
														gres.on('data', function (chunk) {
																		
																		pageData += chunk;
																});
														
														gres.on('end', function () {
																		
																		var myJson = eval('(' + pageData + ')');
																		
																		var gpsx   = myJson.Placemark[0].Point.coordinates[0];
																		var gpsy   = myJson.Placemark[0].Point.coordinates[1];
																		
																		console.log('COORD FROM ADDRESS : '+gpsx+' / '+gpsy);
																		
																		// ADD DATA
																		var sql  = 'INSERT INTO address (address1,address2,address3,address4,zipcode,city,country,phone,gpsx,gpsy,cdate) VALUES (?, ?, ?,?,?, ?, ?,?,?, ?,?)';
																		var data = [info.address1,info.address2,info.address3,info.address4,info.zipcode,info.city,info.country,info.phone,gpsx,gpsy, now];
																		
																		console.log('ADD ADDRESS');
																		
																		console.log(sql);
																		console.log(data);
																		
																		return db.query(sql, data, function (err, result) {
																						
																						if (err) { res.send({error: 'Insert CIRCLE ADDRESS error'});	}
																						
																						var aid =  result.insertId;
																						
																						var sql  = 'UPDATE circles SET aid=? WHERE cid=?';
																						var data = [aid, cid];
																						
																						return db.query(sql, data, function (err, result) {
																										
																										if (err) { res.send({error: 'Upd CIRCLE error'});	}
																										
																										res.send({cid: cid,ctype:query.ctype}); // RET INSERTED SPOT ID AND SPOT TABLE NAME
																										
																								});
																						
																				});
																																				
																		// res.send(data);
																		
																		
																});
														
														gres.on('error', function (e) {
																		
																		// TODO: send error to client side.
																		
																		console.log(e);
																		
																});
														
												});
										
										greq.end();
										
								}
								else {
										res.send({});
								}
						});		
				
		},

	
		// ADD / EDIT  - PLACE , EVENT , COMMUNITY
		'edit' :  function(req, res, db, query) {
				
				if (typeof query == 'undefined') {
						res.send({error: 'not provide post data'});
						return;
				}
				

				// CHECK REQUIRED
				var required = ['name','ctype'];
				
				// CHECK DATA.
				var errors = [];
				required.forEach(function (property) {
								if (!(property in query) || query[property] == '') {
										errors.push({error: 'property '  + property + " is not provided!"});
								}
						});

				if (typeof query.address == 'undefined' && query.ctype == 'places' ) {
						errors.push({error: 'property  ADDRESS is not provided!'});
				}

				if (errors.length) {
						res.send(errors);
						return;
				}

				var now  = parseInt((new Date()) /1000); // Unix timestamp;
				
				// ADDRESS INFORMATION
				if (typeof query.address != 'undefined' ) {
						var info = query.address;
				}

				// INSERT CIRCLE
				if (!query.cid) {

						var sql  = 'INSERT INTO circles (name,ctype,catid,spotid,adminid,public_type,content,starttime,endtime,open,cdate) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ?,?)';
						var data = [query.name, query.ctype, query.catid,query.spotid,query.uid,query.public_type,query.content,query.starttime,query.endtime,query.open, now];

						return db.query(sql, data, function (err, result) {
										
										if (err) { res.send({error: 'Insert CIRCLE error'});	}

										var cid = result.insertId;

										// AFFILIATE ADMIN USERS
										var sql  = 'INSERT INTO circles_users (uid,cid,status,cdate) VALUES (?, ?,"on",?)';
										var data = [query.uid,cid,now];
										
										return db.query(sql, data, function (err, result) {
														
														if (err) { res.send({error: 'Upd Circle User error'});	}

														//	res.send({tableid: tableid,tablename:query.tablename}); // RET INSERTED SPOT ID AND SPOT TABLE NAME
										
														// RETURN IF NO ADDRESS (COMMUNITY)
														if (typeof info == 'undefined') {
																
																res.send({cid: cid,ctype:query.ctype}); // RET INSERTED SPOT ID AND SPOT TABLE NAME
																return;
																
																
														} else {

																// Proxy to access google geocoding services.
																
																this.get('/google-geocoding', function (req, res, next) {

																				//																				var params = req.query;
																				
																			// CHECK GOOGLE MAP API GPS
																				var address = escape(info.address1+'+'+info.zipcode+'+'+info.city+'+'+info.country);
																				
																				console.log(address);
																				
																				//var address = params.address ? params.address : '';
																				
																				// TODO: we should have more conplex data later on.
																				var data = {
																						address: address,
																						sensor: false
																				};
																				
																				
																				if (address) {
																						var url = 'maps.googleapis.com';
																						var greq = http.request({
																										host: url,
																										method: 'GET',
																										path: '/maps/api/geocode/json?' + querystring.stringify(data)
																										
																								}, function (gres) {
																										
																										var pageData = '';
																										
																										gres.setEncoding('utf8');
																										
																										gres.on('data', function (chunk) {
																														
																														pageData += chunk;
																												});
																										
																										gres.on('end', function () {
																														
																														var myJson = eval('(' + pageData + ')');
																														
																														var gpsx   = myJson.Placemark[0].Point.coordinates[0];
																														var gpsy   = myJson.Placemark[0].Point.coordinates[1];
																														
																														console.log('COORD FROM ADDRESS : '+gpsx+' / '+gpsy);
																														
																														// ADD DATA
																														var sql  = 'INSERT INTO address (address1,address2,address3,address4,zipcode,city,country,phone,gpsx,gpsy,cdate) VALUES (?, ?, ?,?,?, ?, ?,?,?, ?,?)';
																														var data = [info.address1,info.address2,info.address3,info.address4,info.zipcode,info.city,info.country,info.phone,gpsx,gpsy, now];
																														
																														console.log('ADD ADDRESS');
																														
																														console.log(sql);
																														console.log(data);
																														
																														return db.query(sql, data, function (err, result) {
																																		
																																		if (err) { res.send({error: 'Insert CIRCLE ADDRESS error'});	}
																																		
																																		var aid =  result.insertId;
																																		
																																		var sql  = 'UPDATE circles SET aid=? WHERE cid=?';
																																		var data = [aid, cid];
																																		
																																		return db.query(sql, data, function (err, result) {
																																						
																																						if (err) { res.send({error: 'Upd CIRCLE error'});	}
																																						
																																						res.send({cid: cid,ctype:query.ctype}); // RET INSERTED SPOT ID AND SPOT TABLE NAME
																																						return;
																																						
																																				});
																																		
																																});
																														
																														res.send(data);
																														
																														
																												});
																										
																										gres.on('error', function (e) {
																														
																														// TODO: send error to client side.
																														
																														console.log(e);
																														
																												});
																										
																								});
																						
																						greq.end();
																						
																				}
																				else {
																						res.send({});
																				}
																		});		


																
														}
														
														
												});
										
										
								});	
						
				} 
				else { // EDIT CIRCLE
						
						var sql  = 'UPDATE circles SET name=?, ctype=? ,catid=?,spotid=?, adminid=?, public_type=?, content=?, starttime=?, endtime=?, open=?, mdate=? WHERE cid = ?';
						var data = [query.name, query.ctype, query.catid,query.spotid,query.uid,query.public_type,query.content,query.starttime,query.endtime,query.open, now,query.cid];

						return db.query(sql, data, function (err, result) {
										
										if (err) { res.send({error: 'Edit CIRCLE error'});	}
																				
										// UPDATE ADDRESS
										if (typeof info == 'undefined' ) {
												
												res.send({cid: cid,ctype:query.ctype}); // RET INSERTED SPOT ID AND SPOT TABLE NAME
												return;
												
										} else {
												
												// if (info.aid) {
												
												if (typeof info.address1 == 'undefined' ) {
														
														res.send({cid: query.cid}); // RET INSERTED SPOT ID AND SPOT TABLE NAME
														return;
														
														
												} else {
														
														// CHECK GOOGLE MAP API GPS
														var address = escape(info.address1+'+'+info.zipcode+'+'+info.city+'+'+info.country);
														
														var http = require('http');
														
														var options = {
																host: 'maps.google.com',
																port: 80,
																path: '/maps/geo?q='+address+'&oe=utf8&hl=en',
																method: 'GET'
														};
														
														var req = http.get(options, function(res) {
																		
																		var pageData = '';
																		
																		res.setEncoding('utf8');
																		
																		res.on('data', function (chunk) {
																						pageData += chunk;
																				});
																		
																		res.on('end', function() {
																						
																						var myJson = eval('(' + pageData + ')');
																						
																						var gpsx   = myJson.Placemark[0].Point.coordinates[0];
																						var gpsy   = myJson.Placemark[0].Point.coordinates[1];
																						
																						console.log('COORD FROM ADDRESS : '+gpsx+' / '+gpsy);
																						
																						
																						var sql = 'UPDATE address SET address1=?, address2=?, address3=?, address4=?, zipcode=?, city=?, country=?, phone=?, gpsx=?, gpsy=?,  cdate=? WHERE aid=?';
																						var data = [info.address1,info.address2,info.address3,info.address4,info.zipcode,info.city,info.country,info.phone,gpsx,gpsy,now,info.aid];
																						console.log('EDIT CIRCLE ADDRESS');
																						
																						return db.query(sql, data, function (err, result) {
																										
																										if (err) { res.send({error: 'Edit ADDRESS CIRCLE error'});	}
																										
																										res.send({cid: query.cid,ctype:query.ctype}); // RET UPDATE PID
																										
																								});
																				});
																});
												}
										}
										
								});
				}
				
		},

		// CHECK CIRCLE INFO (arg can be GPS, first letter of name ...)
		'check' :  function(req, res, db, query) {

				console.log('CHECK CIRCLE SPOT');
				console.log(query);

				if (typeof query.search == 'undefined' || typeof query.ctype == 'undefined' ) {

						res.send({error:'please provide CHECK Info'});

				} else {
						
						var search = query.search;
						if (query.ctype == 'places') {
								var sql    = 'SELECT * FROM circles,places_type WHERE ctype="places" AND  name like "%'+search+'%"  AND places_type.ptid = circles.catid ORDER BY name ASC';
						} else if (query.ctype == 'events') {
								var sql    = 'SELECT * FROM circles,events_type WHERE ctype="events" AND  name like "%'+search+'%"  AND events_type.etid = circles.catid ORDER BY name ASC';
						} else if (query.ctype == 'communities') {
								var sql    = 'SELECT * FROM circles,communities_type WHERE ctype="communities" AND  name like "%'+search+'%"  AND communities_type.ctid = circles.catid ORDER BY name ASC';
						}

						console.log(sql);

						return db.query(sql,  function (err, result) {
										
										if (err) { res.send({error: 'CHECK CIRCLE error'});	}

										console.log(result);

										res.send(result); // RET UPDATE PID

										
								});

					
				}
				
		},
		
	
		// ADD USER TO CIRCLE 
		'adduser' :  function(req, res, db, query) {
				
				if (typeof query.cid  == 'undefined' || 
						typeof query.uid  == 'undefined' || 
						typeof query.open == 'undefined') {
						
						res.send({error:'please provide Circle for USERS CIRCLE  Info'});
						
				} else {

						var now           = parseInt((new Date()) /1000); 

						if (query.open == 'public') {
								var sql = 'INSERT INTO circles_users (cid,uid,status,cdate) VALUES (?,?,"on",?)';
								var data = [query.cid,query.uid,now];
						} else if (query.open == 'private') {
								var sql = 'INSERT INTO circles_users (cid,uid,content,status,cdate) VALUES (?,?,"request",?)';
								var data = [query.cid,query.uid,query.content,now];
						}
					
						return db.query(sql, data, function (err, result) {
											if (err) {
												res.send({error:err});
										}
										else {
												var cuid = result.insertId;
												res.send({cuid:cuid});
										}	
								});
				}
				
		},

		
		// VALIDATE USER TO CIRCLE
		'validateuser' :  function(req, res, db, query) {
				
				if (typeof query.cid  == 'undefined' ||  typeof query.uid  == 'undefined'  ) {
						
						res.send({error:'please provide Circle for Validate USERS CIRCLE  Info'});
						
				} else {

						var now           = parseInt((new Date()) /1000); 

						var sql = 'UPDATE circles_users SET status="on",mdate=? WHERE uid=? AND cid=?';
						var data = [now,query.cid,query.uid];
						
						return db.query(sql, data, function (err, result) {
											if (err) {
												res.send({error:err});
										}
										else {
												res.send({cid:cid});
										}	
								});
				}
				
		},

		
	
		// DELETE USER TO CIRCLE 
		'deluser' :  function(req, res, db, query) {
				
				if (typeof query.cid  == 'undefined' ||  typeof query.uid  == 'undefined'  ) {
						
						res.send({error:'please provide Circle for Validate USERS CIRCLE  Info'});
						
				} else {

						var now           = parseInt((new Date()) /1000); 

						var sql = 'UPDATE circles_users SET status="delete",mdate=? WHERE uid=? AND cid=?';
						var data = [now,query.cid,query.uid];
						
						return db.query(sql, data, function (err, result) {
											if (err) {
												res.send({error:err});
										}
										else {
												res.send({cid:cid});
										}	
								});
				}
				
		},

		
		// LIST CIRCLES FROM CTYPE AND CATID
		'listbyctype' :  function(req, res, db, query) {
				
				if (typeof query.ctype == 'undefined') {
						
						res.send({error:'please provide Type AND cat for LIST  Info'});
						
				} else {

						
						var sql = 'SELECT *, (SELECT count(*) FROM circles_users WHERE circles_users.cid = circles.cid  ) as nb_users FROM circles WHERE circles.ctype = ? AND circles.catid = ? AND circles.status = "on" ORDER by name ASC';
						var data = [query.ctype,query.catid];
						
						return db.query(sql, data, function (err, result) {
											if (err) {
												res.send({error:err});
										}
										else {
												res.send(result);
										}	
								});
				}
				
		},

		
		// LIST CIRCLES BY OPEN TYPE PUBLIC OR PRIVATE
		'listcirclesbyopen' :  function(req, res, db, query) {

				if (typeof query.ctype == 'undefined' || typeof query.open == 'undefined') {
						
						res.send({error:'please provide LIST CAT Info'});
						
				} else {
						
						var sql = 'SELECT *,(SELECT count(*) FROM circles_users WHERE circles_users.cid = circles.cid  ) as nb_users FROM circles WHERE ctype=? AND open = ? AND circles.status = "on" ORDER BY name ASC';
						var data = [query.ctype,query.open];

						return db.query(sql, data, function (err, result) {

										if (err) {
												res.send({error:err});
										}
										else {

												res.send(result);

										}

								});
				}
		
		},
		
	
		// LIST CIRCLES BY ADULT OR ALL
		'listcirclesbypublic' :  function(req, res, db, query) {

				if (typeof query.ctype == 'undefined' || typeof query.public_type == 'undefined') {
						
						res.send({error:'please provide LIST CAT Info'});
						
				} else {
						
						var sql = 'SELECT *,(SELECT count(*) FROM circles_users WHERE circles_users.cid = circles.cid  ) as nb_users FROM circles WHERE ctype=? AND public_type = ? AND circles.status = "on" ORDER BY name ASC';
						var data = [query.ctype,query.public_type];

						return db.query(sql, data, function (err, result) {

										if (err) {
												res.send({error:err});
										}
										else {

												res.send(result);

										}

								});
				}
		
		},
		

		// LIST CIRCLES FROM ADMIN ID
		'listadmin' :  function(req, res, db, query) {
				
				if (typeof query.uid == 'undefined' ) {
						
						res.send({error:'please provide Type for LIST  Info'});
						
				} else {

						var sql = 'SELECT *,concat(ctype,"-",name) as oname FROM circles WHERE adminid = ? ORDER by oname DESC';
						var data = [query.uid];
						return db.query(sql, data, function (err, result) {
											if (err) {
												res.send({error:err});
										}
										else {
												res.send(result);
										}	
								});
				}
				
		},
		
		
		// LIST USERS IN CIRCLE
		'listusers' :  function(req, res, db, query) {
				
				if (typeof query.cid == 'undefined' || typeof query.status == 'undefined' ) {
						
						res.send({error:'please provide Circle for LIST  Info'});
						
				} else {

						var sql = 'SELECT * FROM circles_users,users WHERE circles_users.cid = ? AND circles_users.status = ? AND circles_users.uid = users.uid ORDER by users.lname ASC';
						var data = [query.cid,query.status];

						return db.query(sql, data, function (err, result) {
											if (err) {
												res.send({error:err});
										}
										else {
												res.send(result);
										}	
								});
				}
				
		},


		// LIST CIRCLES FROM A USER ID
		'listusercircles' :  function(req, res, db, query) {
				
				if (typeof query.uid == 'undefined' ) {
						
						res.send({error:'please provide User for Circle LIST  Info'});
						
				} else {

						var sql = 'SELECT * FROM circles_users,circles WHERE circles_users.uid = ? AND circles_users.status = "on" AND circles_users.cid = circles.cid ORDER by circles.name ASC';
						var data = [query.uid];
						return db.query(sql, data, function (err, result) {
											if (err) {
												res.send({error:err});
										}
										else {
												res.send(result);
										}	
								});
				}
				
		},



		// LIST PLACE TYPES INFO (arg can be GPS, first letter of name ...)
		'listcat' :  function(req, res, db, query) {

				if (typeof query.ctype == 'undefined' ) {
						
						res.send({error:'please provide LIST CAT Info'});
						
				} else {
						
						if (query.ctype == 'places') {
								var sql = 'SELECT * FROM places_type ORDER by pname ASC';
						} else if (query.ctype == 'events') {
								var sql = 'SELECT * FROM events_type ORDER by ename ASC';
						} else if (query.ctype == 'communities') {
								var sql = 'SELECT * FROM communities_type ORDER by ctid ASC';
						}
						var data = [];
						return db.query(sql, data, function (err, result) {

										if (err) {
												res.send({error:err});
										}
										else {

												if (query.ctype == 'communities') {

														if (result.length>0) {
													
																var cats = [];
																for (var i in result) {

																		var papaid = result[i].parentid;

																		if (cats[papaid] instanceof Array) {
																			
																		} else {
																				cats[papaid] = [];
																		}
																		
																		cats[papaid].push(result[i]); 

																}

														}

														res.send(cats);

												} else {
														res.send(result);
												}
										}

								});
				}
		
		},
		



	
		// GET CIRCLE INFO FROM CID
		'getcircle' :  function(req, res, db, query) {
				
				if (typeof query.cid == 'undefined') {
						
						res.send({error:'please provide Type AND cat for LIST  Info'});
						
				} else {

						// GET GENERAL INFO
						var sql = 'SELECT *,(SELECT count(*) FROM circles_users WHERE circles_users.cid = circles.cid  ) as nb_users FROM circles WHERE circles.cid = ?';
						var data = [query.cid];
						
						return db.query(sql, data, function (err, result) {
											if (err) {
												res.send({error:err});
										}
										else {
												
												// PARSE RESULT

												var info = result;

												// GET COMMENTS
												var sql = 'SELECT * FROM comments,users WHERE comments.tableid = ? AND comments.tablename="circles" AND users.uid = comments.uid ORDER BY cdate DESC';
												var data = [query.cid];
												
												return db.query(sql, data, function (err, result) {
																if (err) {
																		res.send({error:err});
																}
																else {
																		
																		var comment = result;
																		
																		var ret = {info:info,comments:comment}

																		res.send(ret);
																		
																}	
														});	
										}	
								});
				}
				
		},
	

		// LIST NEAR BY PLACES
		'listplacesnearby' :  function(req, res, db, query) {
				
				console.log('LIST PLACE');
				console.log(query);
				
				if (typeof query.cid == 'undefined') {
						res.send({error:'please provide CIRCLE INFO'});
				}
				else {
						
						var sql = 'SELECT aid,gpsx,gpsy FROM circles,address WHERE circles.aid = address.aid AND circles.cid=? ';
						var data = [query.cid];

						return db.query(sql, data, function (err, result) {
										
										if (err) { res.send({error: 'Get circle error'});	}
										
										var minX = Number(result[0].gpsx) - config.place_4_circles_range_x;
										var maxX = Number(result[0].gpsx) + config.place_4_circles_range_x;
										
										var minY = Number(result[0].gpsy) - config.place_4_circles_range_y; 
										var maxY = Number(result[0].gpsy) + config.place_4_circles_range_y;
										
										var sql = 'SELECT * FROM places,address,places_type WHERE places_type.ptid = places.ptid AND address.gpsx > ? AND address.gpsx < ? AND address.gpsy > ? AND address.gpsy < ? AND address.aid = places.aid ORDER BY places.name ASC';
										var data = [minX, maxX, minY, maxY];
										
										console.log(data);
										
										return db.query(sql, data, function (err, result) {
														
														if (err) { res.send({error: 'List PLACE For circle error'});	}
														
														res.send(result); // RET UPDATE PID
														
												});
										
								});
						
				}
				
		},
		

	  // ====== COMMENTS METHODS ======  >
		


		// ADD COMMENT
		'addcomment' :  function(req, res, db, query) {
				
				if (typeof query.content == 'undefined' || typeof query.uid == 'undefined' || typeof query.cid == 'undefined') {
						
						res.send({error:'please provide Comments  Info'});
						
				} else {

						var now           = parseInt((new Date()) /1000); 

						// GET GENERAL INFO
						var sql = 'INSERT INTO comments (uid,content,tableid,tablename,status,cdate) VALUES (?,?,?,"circles","on",?)';
						var data = [query.uid,query.content,query.cid,now];
						
						return db.query(sql, data, function (err, result) {
											if (err) {
												res.send({error:err});
										}
										else {
												
												var coid = result.insertId;

												res.send({coid:coid});
											
										}	
								});
				}
				
		},
	
		// DELETE COMMENT
		'delcomment' :  function(req, res, db, query) {
				
				if (typeof query.coid == 'undefined') {
						
						res.send({error:'please provide Comments  Info'});
						
				} else {

						var now           = parseInt((new Date()) /1000); 

						// UPDATE
						var sql = 'UPDATE comments SET status="delete", mdate=? WHERE coid=? ';
						var data = [now,query.coid];
						
						return db.query(sql, data, function (err, result) {
											if (err) {
												res.send({error:err});
										}
										else {
												
												res.send({coid:query.coid});
											
										}	
								});
				}
				
		},
	
				
	  // ====== MEDIA METHODS ======  >
		

		// ----- ADD CIRCLE MEDIA : NEED cid,pos, ctype 2 files ----- >
		
		'addmedia' :   function(req, res, db, query) {
				
				console.log('INCOMING CIRCLE MEDIA'); // CONSOLE
				
				query || (query = {});
				var fs = require('fs');
				var path = require('path');
				
				var form = formiable.IncomingForm();
				form.keepExtensions = true; // Check full API at [here](https://github.com/felixge/node-formidable)
				form.uploadDir = config.tmp_files_path; // NEW DEFAULT PATH
				
				//			console.log(form);
				
				form.parse(req, function (err, fields, files) {
								
								console.log(fields);
								
								// CHECK UID
								if (typeof fields.cid == 'undefined' || fields.cid == '0' || typeof fields.ctype == 'undefined') {
										res.send(errors);
										return;
								}
								
								var circlefiles    = config.circle_files_path+'/'+fields.ctype+'_'+fields.cid;
								var now           = parseInt((new Date()) /1000); 
								var thumbnail     = files.thumbimg;
								var largeimg      = files.largeimg;
								var largefilename = fields.ctype+'_'+fields.cid+'_large_'+now+'.'+config.circle_img_ext; // string
								var thumbfilename = fields.ctype+'_'+fields.cid+'_thumb_'+now+'.'+config.circle_img_ext; // string
								
								console.log(circlefiles);
								
								// rename tmp file helper function.
								function renameTmp(cb) {
										cb || (cb = function () {}); // param.
										fs.rename(thumbnail.path, circlefiles+'/'+thumbfilename, function (err) {
														if (err) {
																console.log('rename err');
														}
														else {
																fs.rename(largeimg.path, circlefiles+'/'+largefilename, function (err) {
																				if (err) {
																						console.log(err);
																						// callback.
																						cb(err);
																				}
																				else {
																						
																						//	console.log('FILE COPIED : '+circlefiles+'/'+thumbfilename+'\n'+circlefiles+'/'+largefilename); // CONSOLE
																						
																						// callback.
																						cb();
																				}
																		});
														}
												});
								}
								
								// insert data into DB user media
								function doAdd() {
										
										console.log('INSERT CIRCLE MEDIA');
										
										// INSERT IN DB
										var sql  = 'INSERT INTO circles_media (cid,ctype,thumbimg,largeimg,pos,cdate) VALUES (?,?, ?, ?, ?,now())';
										var data = [fields.cid, fields.ctype, thumbfilename, largefilename, fields.pos];
										
										console.log(sql); // CONSOLE
										console.log(data); // CONSOLE
										
										return db.query(sql, data, function (err, result) {
														
														if (err) {  res.send({error: 'Insert CIRCLE IMG error'}); }
														else {
																
																var	circleret = {
																		ctype:fields.ctype,
																		cid:fields.cid,
																		cmid:result.insertId,
																		thumbimg:thumbfilename,
																		largeimg:largefilename,
																		pos:fields.pos,
																};
																
																console.log(circleret);
																
																// SEND TO CLIENT APPS
																res.send(circleret);	
																
														}
												});	
										
								}
								
								// step 1. mkdir folder for store new img; we don't use asyn function because it will cause nest callback.
								// Maybe we don't need fields.uid for folder location.that means remove fields.uid from circlefiles.
								if (!path.existsSync(circlefiles)) {
										fs.mkdir(circlefiles, 0777, function (err) {
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
																						doAdd();
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
																doAdd();
														}
												});
								}
						});
		},
		
		// ---- GET THUMB CIRCLE IMAGE --- >
		
		'getcirclemediathumb' :  function(req, res, db, query) {
				
				console.log('GET CIRCLE MEDIA THUMB');
				
				if (typeof query.cid == 'undefined'  &&  typeof query.cmid == 'undefined') {
						res.send({error:'provide CIRCLE ID'});
				}
				else {
						
						if (typeof query.cid != 'undefined') {
								var sql = 'SELECT * FROM circles_media WHERE cid=?  AND pos="1" AND status="on" LIMIT 0,1';
								var data =  [query.cid];
						} else if (typeof query.cmid != 'undefined') {
								var sql = 'SELECT * FROM circles_media WHERE cmid=? AND status="on" LIMIT 0,1';	
								var data =  [query.cmid];
						}
						
						
						return db.query(sql, data, function (err, results, fields) {
										if (err) {
												res.send({error: err});
										}
										else {
												
												var mediafile;
												if (results.length == 0 || typeof results[0].thumbimg == 'undefined') {
														mediafile = config.misc_files_path+'/nocircle_thumb.png'; // DEFAUT IMG
												} else {
														mediafile = config.circle_files_path+'/'+results[0].ctype+'_'+results[0].cid+'/'+results[0].thumbimg;
												}
												
												console.log(results);
												console.log(mediafile);
												
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
						
				}
				
		},
		
		// ---- GET LARGE CIRCLE IMAGE --- >
		
		'getcirclemedialarge' :  function(req, res, db, query) {
				
				console.log('GET CIRCLE MEDIA LARGE');
				
				if (typeof query.cid == 'undefined' &&   typeof query.cmid == 'undefined') {
						res.send({error:'provide CIRCLE ID'});
				}
				else {
						
						if (typeof query.cid != 'undefined') {
								var sql = 'SELECT * FROM circles_media WHERE cid=?  AND pos="1" AND status="on"';
								var data =  [query.cid];
						} else if (typeof query.cmid != 'undefined') {
								var sql = 'SELECT * FROM circles_media WHERE cmid=? AND status="on"';	
								var data =  [query.cmid];
						}
						
						return db.query(sql, data , function (err, results, fields) {
										if (err) {
												res.send({error: err});
										}
										else {
												
												var mediafile;
												if (results.length == 0 || typeof results[0].largeimg == 'undefined') {
														mediafile = config.misc_files_path+'/nocircle_large.png'; // DEFAUT IMG
												} else {
														mediafile = config.circle_files_path+'/'+results[0].ctype+'_'+results[0].cid+'/'+results[0].largeimg;
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
						
				}
				
				
		},
		
		
		
		// GET ALL CIRCLES IMAGES
		'listcirclemedia' :  function(req, res, db, query) {
				
				if (typeof query.cid != 'undefined') {
						var data = [query.cid,query.ctype];
				} else {
						res.send({error:'provide Circle INFO for Media List'});
				}

				if (data.length > 0) {
						
						var sql = 'SELECT *,concat(pos,cdate) as ord FROM circles_media WHERE cid=? AND ctype = ? AND status = "on" ORDER BY ord DESC';
						
						return db.query(sql, data, function (err, results, fields) {
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
												
												var userurl = config.http_url+':'+config.port+'/'+config.api_key+'/circles/';
												
												for (i in results) {
														thumbs.push(userurl+'getcirclemediathumb?pmid='+results[i].cmid);
														larges.push(userurl+'getcirclemedialarge?pmid='+results[i].cmid);
												}
												
												res.send({thumbimg:thumbs,largeimg:larges});
										}
								}); 
						
				}
				
		},
			
		// DELETE MEDIA IMAGE
		'delmedia' :  function(req, res, db, query) {
				
				if (typeof query.cmid == 'undefined' || typeof query.cid == 'undefined' ) {
						res.send({error:'provide MEDIA ID info'});
				}
				else {
						var data = [query.cid,query.cmid];
						var sql = 'UPDATE  circles_media SET status = "delete" WHERE cid=? AND cmid=?';
						return db.query(sql, data, function (err, results, fields) {
										if (err) {
												res.send({error: err});
										}
										else {
												res.send({cmid:query.cmid});
										}
								});	
						
				}
		},
		
		
};
 
module.exports = new circles();