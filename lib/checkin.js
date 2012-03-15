/*
 * /lib/checkin.js
 */
var formiable = require('formidable'),
    tool = require('./tool'),
		config = require('../config.js'),
		sys = require('sys');

var checkin = function() {};

checkin.prototype = {

		// ----- CHECKIN ---- >
		
		// ADD CHECKIN FOR USER
		'add' :  function(req, res, db, query) {

				if (typeof query == 'undefined') {
						res.send({error: 'not provide post data'});
						return;
				}

				var required = ['uid','tablename','tableid'];

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

				var now  = parseInt((new Date()) /1000); // Unix timestamp;
				
				var sql  = "INSERT INTO checkin (uid,tableid,tablename,cdate) VALUES (?, ?, ?, ?)";
				var data = [query.uid, query.tableid, query.tablename, now];
				
				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'Insert CHECKIN error'});	}

								console.log('DO CHECKIN');

								res.send({chkid:result.insertId});
								
						});
				
		},
		
	
		// CHECKOUT USER FROM CHECKIN
		'out' :  function(req, res, db, query) {

				if (typeof query.uid == 'undefined') {
						res.send({error: 'not provide post data'});
						return;
				} else {
						
						var sql = 'UPDATE tags SET status = "delete" WHERE (uid1 =? AND rtype!="mutual") OR (uid2=? AND rtype!="mutual") ';
						return db.query(sql, [query.uid,query.uid], function (err, result) {
										
										if (err) { res.send({error: 'CHECKOUT TAG user error'});	}
										
										var sql = 'UPDATE checkin SET status = "delete" WHERE uid =? ';
										return db.query(sql, [query.uid], function (err, result) {
														
														if (err) { res.send({error: 'CHECKOUT user error'});	}
														
														console.log('DO CHECKOUT');
														
														res.send({uid:query.uid});
														
												});
								});
				}
				
		},
		
		// GET CHECKIN FOR USER
		'get' :   function(req, res, db, query) {

				if (typeof query.uid == 'undefined') {
						res.send({error: 'not provide post data'});
						return;
				} else {

						var sql  = 'SELECT * FROM checkin WHERE uid = ? AND  status = "on"';
						return db.query(sql, [query.uid], function (err, result) {
										
										if (err) { res.send({error: 'Get Checkin user error'});	}
		
										res.send(result);
										
								});
				}

		},
		
	
		// ----- PLACES ---- >		
			
		// ADD / EDIT PLACE
		'editplace' :  function(req, res, db, query) {

				if (typeof query == 'undefined') {
						res.send({error: 'not provide post data'});
						return;
				}

				// CHECK REQUIRED
				if (!query.pid) {
						var required = ['name','ptid'];
				} else {
						var required = ['name','ptid'];
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

				var now  = parseInt((new Date()) /1000); // Unix timestamp;

				if (typeof query.address == 'undefined' ) {
						res.send({error: 'No gps / address data provided'});
						return;
				} else {
						var info = query.address;
				}
				
				// INSERT PLACE
				if (!query.pid) {
				
						console.log(info);

						var sql  = "INSERT INTO places (name,sname,content,ptid,cdate) VALUES (?, ?, ?, ?, ?)";
						var data = [query.name, query.sname, query.content,query.ptid, now];

						console.log('ADD PLACE');

						return db.query(sql, data, function (err, result) {
										
										if (err) { res.send({error: 'Insert PLACE error'});	}
										
										var pid = result.insertId;
										
										console.log(pid);
										
										if (typeof info.address1 == 'undefined' ) {
												var sql  = "INSERT INTO address (gpsx,gpsy,cdate) VALUES (?, ?, ?,?,?, ?, ?,?,?, ?,?)";
												var data = [info.gpsx,info.gpsy, now];
										} else {
												var sql  = "INSERT INTO address (address1,address2,address3,address4,zipcode,city,country,phone,gpsx,gpsy,cdate) VALUES (?, ?, ?,?,?, ?, ?,?,?, ?,?)";
												var data = [info.address1,info.address2,info.address3,info.address4,info.zipcode,info.city,info.country,info.phone,info.gpsx,info.gpsy, now];
										}
										
										console.log('ADD ADDRESS');
										
										return db.query(sql, data, function (err, result) {
														
														if (err) { res.send({error: 'Insert ADDRESS error'});	}
														
														var aid =  result.insertId;
														
														var sql  = "UPDATE places SET aid=? WHERE pid=?";
														var data = [aid, pid];
														return db.query(sql, data, function (err, result) {
																		
																		if (err) { res.send({error: 'Insert PLACE error'});	}
																		
																		res.send({pid: pid}); // RET INSERTED PID
																});
														
												});
								});
						
				} 
				// EDIT PLACE
				else {
						
						console.log('');

						var sql  = "UPDATE places SET name=?, sname=?, content=?, ptid=?, mdate=?  WHERE pid=?";
						var data = [query.name, query.sname, query.content, query.ptid,now,query.pid];
						return db.query(sql, data, function (err, result) {
										
										if (err) { res.send({error: 'Insert PLACE error'});	}
																				
										// UPDATE ADDRESS
										if (info.aid) {
												
												var sql = "UPDATE address SET address1=?, address2=?, address3=?, address4=?, zipcode=?, city=?, country=?, phone=?, gpsx=?, gpsy=?,  cdate=? WHERE aid=?";
												var data = [info.address1,info.address2,info.address3,info.address4,info.zipcode,info.city,info.country,info.phone,info.gpsx,info.gpsy,now,info.aid];
												console.log('EDIT ADDRESS');

												return db.query(sql, data, function (err, result) {
																
																if (err) { res.send({error: 'Edit ADDRESS error'});	}
																
																res.send({pid: query.pid}); // RET UPDATE PID
																
														});
										}
										
								});
						
				}
				
		},
		
		// ----- SPOTS ---- >		
			
		// ADD / EDIT SPOT - PLACE , EVENT , TRANSPORT
		'editspot' :  function(req, res, db, query) {

				if (typeof query == 'undefined') {
						res.send({error: 'not provide post data'});
						return;
				}

				// CHECK REQUIRED
				if (!query.tableid) {
						var required = ['name','tablename'];
				} else {
						var required = ['name','tableid','tablename'];
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

				var now  = parseInt((new Date()) /1000); // Unix timestamp;

				if (typeof query.address == 'undefined' && query.tablename != 'transports') {
						res.send({error: 'No gps / address data provided'});
						return;
				} else {
						var info = query.address;
				}
				
				// INSERT PLACE
				if (!query.tableid) {
				
						console.log('EDIT SPOT');
						console.log(query);

						if (query.tablename == 'places') {
								
								var sql  = "INSERT INTO places (name,sname,content,ptid,cdate) VALUES (?, ?, ?, ?, ?)";
								var data = [query.name, query.sname, query.content,query.ptid, now];

						} else if (query.tablename == 'events') {
								
								var sql  = "INSERT INTO events (name,etype,content,starttime,endtime,cdate) VALUES (?, ?, ?, ?,?, ?)";
								var data = [query.name, query.etype, query.content,query.starttime, query.endtime, now];

						} else if (query.tablename == 'transports') {

								var sql  = "INSERT INTO transports (name,startloc,endloc,starttime,cdate) VALUES (?, ?, ?, ?, ?)";
								var data = [query.name, query.startloc, query.endloc,query.starttime, now];

						} 
					
						console.log('ADD SPOT '+query.tablename);

						return db.query(sql, data, function (err, result) {
										
										if (err) { res.send({error: 'Insert SPOT error'});	}
										
										var tableid = result.insertId;
										
										console.log('ADD SPOT TABLEID : '+tableid);

										if (query.tablename != 'transports') {


												if (typeof info.address1 == 'undefined' ) {
														var sql  = "INSERT INTO address (gpsx,gpsy,cdate) VALUES (?, ?, ?)";
														var data = [info.gpsx,info.gpsy, now];
												} else {
														var sql  = "INSERT INTO address (address1,address2,address3,address4,zipcode,city,country,phone,gpsx,gpsy,cdate) VALUES (?, ?, ?,?,?, ?, ?,?,?, ?,?)";
														var data = [info.address1,info.address2,info.address3,info.address4,info.zipcode,info.city,info.country,info.phone,info.gpsx,info.gpsy, now];
												}
												
												console.log('ADD ADDRESS');

												console.log(sql);
												console.log(data);

												return db.query(sql, data, function (err, result) {
																
																if (err) { res.send({error: 'Insert ADDRESS error'});	}
																
																var aid =  result.insertId;
																
																if (query.tablename == 'places') {
																		var sql  = "UPDATE places SET aid=? WHERE pid=?";
																		var data = [aid, tableid];
																} else if (query.tablename == 'events') {
																		var sql  = "UPDATE events SET aid=? WHERE eid=?";
																		var data = [aid, tableid];
																} 
																
																return db.query(sql, data, function (err, result) {
																				
																				if (err) { res.send({error: 'Upd SPOT error'});	}
																				

																				// ADD CIRCLE IF PLACES SPOT
																				if (query.tablename == 'places') {

																						var sql  = 'INSERT INTO circles (name,ctype,catid,spotid,adminid,public_type,content,open,aid,cdate) VALUES (?, "places", ?, ?, ?,"all", ?,"public", ?,?)';
																						var data = [query.name, query.ptid,tableid,query.uid,query.content,aid,now];

																						return db.query(sql, data, function (err, result) {
																										
																										if (err) { res.send({error: 'Add Circle SPOT error'});	}
																										
																										var cid = result.insertId;

																										// AFFILIATE ADMIN USERS
																										var sql  = 'INSERT INTO circles_users (uid,cid,status,cdate) VALUES (?, ?,"on",?)';
																										var data = [query.uid,cid,now];

																										return db.query(sql, data, function (err, result) {
																														
																														if (err) { res.send({error: 'Upd Circle User error'});	}
																														res.send({tableid: tableid,tablename:query.tablename}); // RET INSERTED SPOT ID AND SPOT TABLE NAME
																														
																												});
																								});
																						
																				} else {
																						res.send({tableid: tableid,tablename:query.tablename}); // RET INSERTED SPOT ID AND SPOT TABLE NAME
																				}
																				
																		});
														});
												
										}
										else {
												res.send({tableid: tableid,tablename:query.tablename}); // RET INSERTED SPOT ID AND SPOT TABLE NAME
										}
										
								});
						
				} 	
				else {   // EDIT SPOT TABLENAME / TABLEID 
						
						if (query.tablename == 'places') {
								var sql  = "UPDATE places SET name=?, sname=?, content=?, ptid=?, mdate=?  WHERE pid=?";
								var data = [query.name, query.sname, query.content, query.ptid,now,query.tableid];
						} else if (query.tablename == 'events') {
								var sql  = "UPDATE events SET name=?, etype=?, content=?, starttime=?, endtime=?, mdate=?  WHERE eid=?";
								var data = [query.name, query.etype, query.content,query.starttime, query.endtime, now,query.tableid];
						} else if (query.tablename == 'transports') {
								var sql  = "UPDATE transports SET name=?, startloc=?, endloc=?, starttime=?, mdate=?  WHERE tid=?";
								var data = [query.name, query.startloc, query.endloc, query.starttime, now,query.tableid];								
						}
						
						return db.query(sql, data, function (err, result) {
										
										if (err) { res.send({error: 'Insert PLACE error'});	}
																				
										// UPDATE ADDRESS
										if (info.aid) {
												
												var sql = "UPDATE address SET address1=?, address2=?, address3=?, address4=?, zipcode=?, city=?, country=?, phone=?, gpsx=?, gpsy=?,  cdate=? WHERE aid=?";
												var data = [info.address1,info.address2,info.address3,info.address4,info.zipcode,info.city,info.country,info.phone,info.gpsx,info.gpsy,now,info.aid];
												console.log('EDIT ADDRESS');
												
												return db.query(sql, data, function (err, result) {
																
																if (err) { res.send({error: 'Edit ADDRESS error'});	}
																
																res.send({tableid:query.tableid,tablename:query.tablename}); // RET UPDATE TABLEID / TABLENAME
																
														});
										}
										else {

												if (query.tablename == 'places') {
														
														var sql  = "UPDATE circles SET name=?,  content=?, catid=?, mdate=?  WHERE spotid=?";
														var data = [query.name, query.content, query.ptid,now,query.tableid];

														return db.query(sql, data, function (err, result) {
																		if (err) { res.send({error: 'Insert PLACE error'});	}
																		res.send({tableid:query.tableid,tablename:query.tablename}); // RET UPDATE TABLEID / TABLENAME		
																});
														
												} else {
														res.send({tableid:query.tableid,tablename:query.tablename}); // RET UPDATE TABLEID / TABLENAME				
												}
										}
										 
								});
						
				}
				
		},
		


		// SPOT INFO - Can be Places, transport or event 
		'getspot' : function(req, res, db, query) {

					if (typeof query.tableid == 'undefined' || typeof query.tablename == 'undefined' ) {
						res.send({error: 'not provide Place data'});
						return;
					} 	else { 
							

							console.log('GET PLACE INFO');

							if (query.tablename == 'places') {
									var sql  = 'SELECT *, (SELECT count(*) FROM checkin WHERE checkin.tablename="places" AND checkin.tableid = places.pid AND checkin.status="on") as nb_users FROM places,address,places_type WHERE pid=? AND places.aid = address.aid AND places_type.ptid = places.ptid ';
							} else if (query.tablename == 'events') {
									var sql  = 'SELECT *, (SELECT count(*) FROM checkin WHERE checkin.tablename="events" AND checkin.tableid = events.eid AND checkin.status="on") as nb_users FROM events,address WHERE eid=? AND events.aid = address.aid  ';
							} else if (query.tablename == 'transports') {
									var sql  = 'SELECT *, (SELECT count(*) FROM checkin WHERE checkin.tablename="transports" AND checkin.tableid = transports.tid AND checkin.status="on") as nb_users FROM transports WHERE tid=?';
							}

							console.log(query);
							console.log(sql);

							return db.query(sql, [query.tableid], function (err, result) {
											
											if (err) { res.send({error: 'Select PLACE error'});	}
											
											console.log(result);
											res.send(result);
											
									});
					}
					
		},
		
		// PLACE INFO (arg can be GPS, first letter of name ...)
		'listplace' :  function(req, res, db, query) {

				console.log('LIST PLACE');
				console.log(query);

				if (typeof query.gpsx == 'undefined' || typeof query.gpsy == 'undefined') {
						res.send({error:'please provide GPS INFO'});
				}
				else {
						
						
						var minX = Number(query.gpsx) - config.place_4_checkin_range_x;
						var maxX = Number(query.gpsx) + config.place_4_checkin_range_x;
						
						var minY = Number(query.gpsy) - config.place_4_checkin_range_y; 
						var maxY = Number(query.gpsy) + config.place_4_checkin_range_y;
						
						var sql = 'SELECT * FROM places,address,places_type WHERE places_type.ptid = places.ptid AND address.gpsx > ? AND address.gpsx < ? AND address.gpsy > ? AND address.gpsy < ? AND address.aid = places.aid ORDER BY places.name ASC';
						var data = [minX, maxX, minY, maxY];

						console.log(data);

						return db.query(sql, data, function (err, result) {
										
										if (err) { res.send({error: 'List PLACE error'});	}
										//										console.log(result);
										res.send(result); // RET UPDATE PID

								});

				}

		},
		
		
		// PLACE INFO (arg can be GPS, first letter of name ...)
		'listspot' :  function(req, res, db, query) {

				console.log('LIST SPOT');
				console.log(query);

				if (typeof query.tablename == 'undefined') {
						res.send({error:'please provide SPOT Info'});
				}
				
				if (query.tablename == 'transports') {
						var sql = 'SELECT * FROM transports  ORDER BY transports.startloc ASC';
						return db.query(sql,  function (err, result) {
										
										if (err) { res.send({error: 'List PLACE error'});	}
										//										console.log(result);
										res.send(result); // RET UPDATE PID

								});

				} else {
						
						
						if (typeof query.gpsx == 'undefined' || typeof query.gpsy == 'undefined') {
								res.send({error:'please provide GPS INFO'});
						}
						else {
								
								var minX = Number(query.gpsx) - config.place_4_checkin_range_x;
								var maxX = Number(query.gpsx) + config.place_4_checkin_range_x;
								
								var minY = Number(query.gpsy) - config.place_4_checkin_range_y; 
								var maxY = Number(query.gpsy) + config.place_4_checkin_range_y;
								
								if (query.tablename == 'places') {
										var sql = 'SELECT * FROM places,address,places_type WHERE places_type.ptid = places.ptid AND address.gpsx > ? AND address.gpsx < ? AND address.gpsy > ? AND address.gpsy < ? AND address.aid = places.aid ORDER BY places.name ASC';
								} else 	if (query.tablename == 'events') {
										var sql = 'SELECT * FROM events,address WHERE  address.gpsx > ? AND address.gpsx < ? AND address.gpsy > ? AND address.gpsy < ? AND address.aid = events.aid ORDER BY events.name ASC';
								}
								var data = [minX, maxX, minY, maxY];
								
								console.log(data);
								
								return db.query(sql, data, function (err, result) {
												
												if (err) { res.send({error: 'List PLACE error'});	}
												//										console.log(result);
												res.send(result); // RET UPDATE PID
												
										});
								
						}
				}
		},
		
	
		// PLACE INFO (arg can be GPS, first letter of name ...)
		'searchspot' :  function(req, res, db, query) {

				console.log('SEARCH SPOT');
				console.log(query);

				if (typeof query.tablename == 'undefined' || typeof query.search == 'undefined' ) {
						res.send({error:'please provide SEARCH  Info'});
				} else {
						
						var search = query.search;

						if (query.tablename == 'places') {
								
								var sql  = 'SELECT * FROM places,address,places_type WHERE places_type.ptid = places.ptid AND address.aid = places.aid AND  places.name like "%'+search+'%"  ORDER BY places.name ASC';
								//								var sql  = 'SELECT * FROM places,address,places_type WHERE places_type.ptid = places.ptid AND address.aid = places.aid AND  places.name like %%?%%  ORDER BY places.name ASC';
								// var data = [search];
						} else if (query.tablename == 'events') {
								
								var sql  = 'SELECT * FROM events,address WHERE address.aid = events.aid AND events.name LIKE "%'+search+'%" ORDER BY events.name ASC ';
								
						} else if (query.tablename == 'transports') {
								
								if (query.station == 'end') {

										var sql  = 'SELECT * FROM transports WHERE name LIKE "%'+search+'%" OR endloc LIKE "%'+search+'%"';

								} else {

										var sql  = 'SELECT * FROM transports WHERE name LIKE "%'+search+'%" OR startloc LIKE "%'+search+'%"';

								}
								
						} 

						console.log(sql);

						return db.query(sql, function (err, result) {
										
										if (err) { res.send({error: 'SEARCH SPOT error'});	}
										console.log(result);
										res.send(result); // RET UPDATE PID
										
								});

					
				}
				
		},
		

		// LIST PLACE TYPES INFO (arg can be GPS, first letter of name ...)
		'listplacetype' :  function(req, res, db, query) {
				
				var sql = 'SELECT * FROM places_type ORDER by pname ASC';
				return db.query(sql, function (err, results, fields) {
								if (err) {
										res.send({error:err});
								}
								else {
										res.send(results);
								}
						});
				
		},
		
		
		// ----- EVENTS ---- >		
			
		// ADD / EDIT EVENT
		'editevent' : function(params) {
				return data;
		},
			
		// PLACE EVENT
		'getevent' : function(params) {
				// getaddress(aid);
				return data;
		},
		
		// LIST EVENT (arg can be GPS, first letter of name ...)
		'listevent' : function(params) {
				return data;
		},
		

  // ====== MEDIA METHODS ======  >

  // ----- ADD PLACE MEDIA : NEED pid,pos, 2 files ----- >

  'addmedia' :   function(req, res, db, query) {

			console.log('INCOMING PLACE MEDIA'); // CONSOLE

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
							if (typeof fields.tableid == 'undefined' || fields.tableid == '0' || typeof fields.tablename == 'undefined') {
									res.send(errors);
									return;
							}
							
							var placefiles    = config.place_files_path+'/'+fields.tablename+'_'+fields.tableid;
							var now           = parseInt((new Date()) /1000); 
							var thumbnail     = files.thumbimg;
							var largeimg      = files.largeimg;
							var largefilename = fields.tablename+'_'+fields.tableid+'_large_'+now+'.'+config.place_img_ext; // string
							var thumbfilename = fields.tablename+'_'+fields.tableid+'_thumb_'+now+'.'+config.place_img_ext; // string
							
							console.log(placefiles);
							
							// rename tmp file helper function.
							function renameTmp(cb) {
									cb || (cb = function () {}); // param.
									fs.rename(thumbnail.path, placefiles+'/'+thumbfilename, function (err) {
													if (err) {
															console.log('rename err');
													}
													else {
															fs.rename(largeimg.path, placefiles+'/'+largefilename, function (err) {
																			if (err) {
																					console.log(err);
																					// callback.
																					cb(err);
																			}
																			else {
																					
																					//	console.log('FILE COPIED : '+placefiles+'/'+thumbfilename+'\n'+placefiles+'/'+largefilename); // CONSOLE
																					
																					// callback.
																					cb();
																			}
																	});
													}
											});
							}
							
							// insert data into DB user media
							function doAdd() {
									
									console.log('INSERT PLACE MEDIA');

									// INSERT IN DB
									var sql  = 'INSERT INTO places_media (tableid,tablename,thumbimg,largeimg,pos,cdate) VALUES (?,?, ?, ?, ?,now())';
									var data = [fields.tableid, fields.tablename, thumbfilename, largefilename, fields.pos];
						
									console.log(sql); // CONSOLE
									console.log(data); // CONSOLE
						
									return db.query(sql, data, function (err, result) {
													
													if (err) {  res.send({error: 'Insert PLACE IMG error'}); }
													else {
															
															var	placeret = {
																	tablename:fields.tablename,
																	tableid:fields.tableid,
																	pmid:result.insertId,
																	thumbimg:thumbfilename,
																	largeimg:largefilename,
																	pos:fields.pos,
															};
															
															console.log(placeret);
															
															// SEND TO CLIENT APPS
															res.send(placeret);	
															
													}
											});	
									
							}
							
							// step 1. mkdir folder for store new img; we don't use asyn function because it will cause nest callback.
							// Maybe we don't need fields.uid for folder location.that means remove fields.uid from placefiles.
							if (!path.existsSync(placefiles)) {
									fs.mkdir(placefiles, 0777, function (err) {
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

  // ---- GET MAIN PLACE IMAGE --- >

  'getplacemediathumb' :  function(req, res, db, query) {
			
			console.log('GET PLACE MEDIA THUMB');

			if (typeof query.pid == 'undefined' &&  typeof query.eid == 'undefined' &&  typeof query.tid == 'undefined' &&  typeof query.pmid == 'undefined') {
					res.send({error:'provide PLACE ID'});
			}
			else {
					if (typeof query.pid != 'undefined') {
							var sql = 'SELECT * FROM places_media WHERE tableid=? AND tablename="places" AND pos="1" AND status="on" LIMIT 0,1';
							var data =  [query.pid];
					} else if (typeof query.eid != 'undefined') {
							var sql = 'SELECT * FROM places_media WHERE tableid=? AND tablename="events" AND pos="1" AND status="on" LIMIT 0,1';
							var data =  [query.eid];
					} else if (typeof query.tid != 'undefined') {
							var sql = 'SELECT * FROM places_media WHERE tableid=? AND tablename="transports" AND pos="1" AND status="on" LIMIT 0,1';
							var data =  [query.tid];
					} else if (typeof query.pmid != 'undefined') {
							var sql = 'SELECT * FROM places_media WHERE pmid=? AND status="on" LIMIT 0,1';	
							var data =  [query.pmid];
					}
					
					
					return db.query(sql, data, function (err, results, fields) {
									if (err) {
											res.send({error: err});
									}
									else {

											var mediafile;
											if (results.length == 0 || typeof results[0].thumbimg == 'undefined') {
													mediafile = config.misc_files_path+'/noplace_thumb.png'; // DEFAUT IMG
											} else {
													mediafile = config.place_files_path+'/'+results[0].tablename+'_'+results[0].tableid+'/'+results[0].thumbimg;
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

		// ---- GET MAIN PLACE IMAGE --- >
		
		'getplacemedialarge' :  function(req, res, db, query) {
				
				console.log('GET PLACE MEDIA LARGE');
				
				if (typeof query.pid == 'undefined' &&  typeof query.eid == 'undefined' &&  typeof query.tid == 'undefined' &&  typeof query.pmid == 'undefined') {
						res.send({error:'provide PLACE ID'});
				}
				else {

						if (typeof query.pid != 'undefined') {
								var sql = 'SELECT * FROM places_media WHERE tableid=? AND tablename="places" AND pos="1" AND status="on"';
								var data =  [query.pid];
						} else if (typeof query.eid != 'undefined') {
								var sql = 'SELECT * FROM places_media WHERE tableid=? AND tablename="events" AND pos="1" AND status="on"';
								var data =  [query.eid];
						} else if (typeof query.tid != 'undefined') {
								var sql = 'SELECT * FROM places_media WHERE tableid=? AND tablename="transports" AND pos="1" AND status="on"';
								var data =  [query.tid];
						} else if (typeof query.pmid != 'undefined') {
								var sql = 'SELECT * FROM places_media WHERE pmid=? AND status="on"';	
								var data =  [query.pmid];
						}
						
						return db.query(sql, data , function (err, results, fields) {
										if (err) {
												res.send({error: err});
										}
										else {
												
												var mediafile;
												if (results.length == 0 || typeof results[0].largeimg == 'undefined') {
														mediafile = config.misc_files_path+'/noplace_large.png'; // DEFAUT IMG
												} else {
														mediafile = config.place_files_path+'/'+results[0].tablename+'_'+results[0].tableid+'/'+results[0].largeimg;
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
		
		
		
		// GET ALL USER IMAGES
		'listspotmedia' :  function(req, res, db, query) {
				
				if (typeof query.pid != 'undefined') {
						var data = [query.pid,'places'];
				} else if (typeof query.eid != 'undefined') {
						var data = [query.eid,'events'];
				} else if (typeof query.tid != 'undefined') {
						var data = [query.tid,'transports'];
				} else {
						res.send({error:'provide ID'});
				}

				if (data.length > 0) {
						
						var sql = 'SELECT *,concat(pos,cdate) as ord FROM places_media WHERE tableid=? AND tablename = ? AND status = "on" ORDER BY ord DESC';
						
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
												
												var userurl = config.http_url+':'+config.port+'/'+config.api_key+'/checkin/';
												
												for (i in results) {
														thumbs.push(userurl+'getplacemediathumb?pmid='+results[i].pmid);
														larges.push(userurl+'getplacemedialarge?pmid='+results[i].pmid);
												}
												
												res.send({thumbimg:thumbs,largeimg:larges});
										}
								}); 
						
				}
				
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
		
};
 
module.exports = new checkin();