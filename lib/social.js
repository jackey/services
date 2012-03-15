/*
 * /lib/social.js
 */
var social = function() {};
 
social.prototype = {


		// ----- GET USER SOCIALS ----- >

		'get' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' || typeof query.sid == 'undefined' ) {
						res.send({error: 'not provide Place data'});
						return;
				} 	

				var sent   = '';
				var mutual = '';

				// CHECK TAGS (NORMAL SENT)
				// var sql  = 'SELECT * FROM tags WHERE (uid1=? AND uid2=? AND rtype = "sent" AND status = "on" ) OR (uid1=? AND uid2=? AND rtype = "sent" AND status = "on" ) ';
				var data = [query.uid,query.sid,query.sid,query.uid];
				var sql  = 'SELECT * FROM tags WHERE (uid1=? AND uid2=? AND rtype = "sent" AND status = "on" )';
				var data = [query.uid,query.sid];

				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'Get Social Tag error'});	}
								
								if (result.length>0) {
										sent = result[0].uid2;
								}
								
								// CHECK TAGS (MUTUAL)
								var sql  = 'SELECT * FROM tags WHERE (uid1=? AND uid2=? AND rtype = "mutual" AND status = "on" ) OR (uid1=? AND uid2=? AND rtype = "mutual" AND status = "on" ) ';
								var data = [query.uid,query.sid,query.sid,query.uid];
								
								return db.query(sql, data, function (err, result) {
												
												if (err) { res.send({error: 'Get Social Tag error'});	}
												
												if (result.length>0) {
														mutual = result[0].uid2;
												}
												
												// CHECK IF IN MY PICKS
												var sql  = 'SELECT * FROM picks WHERE uid= ? and sid=? AND status = "on"';
												return db.query(sql, [query.uid,query.sid], function (err, result) {
																
																if (err) { res.send({error: 'Get Social Pick error'});	}
																
																var picks = [];
																if (result.length>0) {
																		picks = result[0].sid;
																}
															
																// INTEREST
																
																// CHECK FRIENDS
																var sql  = 'SELECT status FROM friends WHERE (friends.uid1=? AND friends.uid2=? AND friends.status != "delete" ) OR (friends.uid1=? AND friends.uid2=? AND friends.status != "delete" ) limit 0,1';
																var data = [query.uid,query.sid,query.sid,query.uid];

																return db.query(sql, data, function (err, result) {
																				
																				if (err) { res.send({error: 'Get Social Tag error'});	}

																				// CHAT
																				console.log('SOCIAL PICKS '+query.sid+' FOR '+query.uid);
																				
																				var fri = '';
																				if (result.length>0) {
																						fri = result[0].status;
																				}
															
																
																				var retdata = {
																						tags:{sent:sent,mutual:mutual},
																						picks:picks,
																						friend_status:fri,
																				}
																				
																				console.log(retdata);
																				
																				res.send(retdata);		
																
																		});
														});
												
										});
								
						});
				
		},
		


		// ----- LIVE USERS COUNT ----- >

		'liveuserscount' : function(req, res, db, query) {

				if (typeof query.tableid == 'undefined' || typeof query.tablename == 'undefined' ) {
						res.send({error: 'not provide Place data'});
						return;
				} 	

				// GET LIVE USER LIST AND FITLERED
				var sql  = 'SELECT count(*) as total FROM checkin WHERE checkin.tableid=? AND checkin.tablename=? AND  checkin.status= "on"';
				var data = [ query.tableid ,query.tablename];
				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'Select COUNT error'});	}
								
								console.log('LIVE COUNT '+query.tableid+' '+result[0]);
								
								res.send(result[0]);
								
						});
				
		},

		// ----- CHECKIN USERS FULL LIST ----- >

		'liveusersfull' : function(req, res, db, query) {
				
				if (typeof query.tableid == 'undefined' || typeof query.tablename == 'undefined' ) {
						res.send({error: 'not provide Place data'});
						return;
				} 	

				// GET USER PREFS
				var sql  = 'SELECT * FROM user_interests WHERE uid=?  ';
				return db.query(sql, [query.uid], function (err, result) {
								
								if (err) { res.send({error: 'Select USER PREF error'});	}

								console.log(result);

								var prefs = [];
								for(i in result) {
										if (result[i].val!="" && typeof result[i].name!="undefined") {
												prefs[result[i].name] = result[i].val;
										}
								}

								console.log(prefs);

								var now = new Date(); // JS timestamp;
								var q   = ''; // IID
								var mia = ''; // MIN AGE
								var maa = ''; // MAX AGE

								for(k in prefs) {
																				
										// CHECK INTEREST
										if (k == 'IID') { 
												var iid = prefs[k];
												if (iid == 1) { // LOOKING FOR GIRLS
														q+= ' AND users.sex = "f" ';
												} else if (iid == 2) { // LOOKIN FOR BOYS
														q+= ' AND users.sex = "m" ';
												}
										}
										
										// CHECK AGE MIN
										if (k == 'MIN_AGE') { 

												var age      = Number(prefs[k]);
												var agetime  = 1000*60*60*24*365*age;
												var min_age  = parseInt(now.getTime() - agetime);
												var min_date = new Date(min_age);

												var year  = min_date.getFullYear();
												var month = min_date.getMonth();
												if (month == 0) { month = '1'; }
												if (month < 10) { month = '0' + month; }
												var day   = min_date.getDate();
												if (day < 10)  {day = '0' + day; }
												
												var sqldate = year+'-'+month+'-'+day;
												
												mia = ' AND users.bday < "'+sqldate+'"';
												
										}

										// CHECK AGE MAX
										if (k == 'MAX_AGE') { 

												var age      = Number(prefs[k]);
												var agetime  = 1000*60*60*24*365*age;
												var min_age  = parseInt(now.getTime() - agetime);
												var min_date = new Date(min_age);

												var year  = min_date.getFullYear();
												var month = min_date.getMonth();
												if (month == 0) { month = '1'; }
												if (month < 10) { month = '0' + month; }
												var day   = min_date.getDate();
												if (day < 10)  {day = '0' + day; }
												
												var sqldate = year+'-'+month+'-'+day;
												
												maa = ' AND users.bday > "'+sqldate+'"';
												
										}

								}
								
								// GET LIVE USER LIST AND FITLERED
								//								var sql  = 'SELECT checkin.uid,users.lname,users.fname,users.nickname,users.sex,users.bday,users.job, (SELECT tig FROM tags WHERE (tags.uid1=? AND tags.uid2=checkin.uid AND tags.rtype = "sent" AND tags.status = "on" ) OR (tags.uid1=checkin.uid AND tags.uid2=? AND tags.rtype = "sent" AND tags.status = "on" )) as sent, (SELECT tig FROM tags WHERE (tags.uid1=? AND tags.uid2=checkin.uid AND tags.rtype = "mutual" AND tags.status = "on" ) OR (tags.uid1=checkin.uid AND tags.uid2=? AND tags.rtype = "mutual" AND tags.status = "on" )) as mutual, (SELECT piid FROM picks WHERE picks.uid=? and picks.sid=checkin.uid AND status = "on") as pick FROM checkin,users WHERE checkin.tableid=? AND checkin.tablename=? AND checkin.uid !=?  AND checkin.uid = users.uid AND checkin.status= "on" AND users.status= "on" '+ q +' '+ mia +'  '+ maa +' GROUP BY checkin.uid ORDER BY users.lname ASC';

								//								var data = [query.uid,query.uid,query.uid,query.uid, query.uid, query.tableid ,query.tablename,query.uid];

								// GET LIVE USER LIST AND FITLERED
								var sql  = 'SELECT checkin.uid,users.lname,users.fname,users.nickname,users.sex,users.bday,users.job, (SELECT tig FROM tags WHERE (tags.uid1=? AND tags.uid2=checkin.uid AND tags.rtype = "sent" AND tags.status = "on" )) as sent, (SELECT tig FROM tags WHERE (tags.uid1=? AND tags.uid2=checkin.uid AND tags.rtype = "mutual" AND tags.status = "on" ) OR (tags.uid1=checkin.uid AND tags.uid2=? AND tags.rtype = "mutual" AND tags.status = "on" )) as mutual, (SELECT piid FROM picks WHERE picks.uid=? and picks.sid=checkin.uid AND status = "on") as pick, (SELECT content FROM user_status WHERE uid=checkin.uid AND user_status.content!="" ORDER BY cdate DESC LIMIT 0,1) as moodjo_status, (SELECT friends.status FROM friends WHERE (friends.uid1=? AND friends.uid2 = checkin.uid AND friends.status!="delete") OR (friends.uid2=? AND friends.uid1 = checkin.uid  AND friends.status!="delete") LIMIT 0,1 ) as friend_status FROM checkin,users WHERE checkin.tableid=? AND checkin.tablename=? AND checkin.uid !=?  AND checkin.uid = users.uid AND checkin.status= "on" AND users.status= "on" '+ q +' '+ mia +'  '+ maa +' GROUP BY checkin.uid ORDER BY users.lname ASC';

								var data = [query.uid,query.uid,query.uid, query.uid,   query.uid  , query.uid  , query.tableid ,query.tablename,query.uid];

								console.log(sql);

								return db.query(sql, data, function (err, result) {
												
												if (err) { res.send({error: 'Select LIVE USERS error'});	}
												console.log(result);

												res.send(result);
												
										});
								
						});
				
		},
		

		// ----- CEHCKIN USERS ----- >

		'liveusers' : function(req, res, db, query) {
				
				if (typeof query.tableid == 'undefined' || typeof query.tablename == 'undefined' ) {
						res.send({error: 'not provide Place data'});
						return;
				} 	

				// GET USER PREFS
				var sql  = 'SELECT * FROM user_interests WHERE uid=?  ';
				return db.query(sql, [query.uid], function (err, result) {
								
								if (err) { res.send({error: 'Select USER PREF error'});	}

								console.log(result);

								var prefs = [];
								for(i in result) {
										if (result[i].val!="" && typeof result[i].name!="undefined") {
												prefs[result[i].name] = result[i].val;
										}
								}

								console.log(prefs);

								var now = new Date(); // JS timestamp;
								var q   = ''; // IID
								var mia = ''; // MIN AGE
								var maa = ''; // MAX AGE

								for(k in prefs) {
																				
										// CHECK INTEREST
										if (k == 'IID') { 
												var iid = prefs[k];
												if (iid == 1) { // LOOKING FOR GIRLS
														q+= ' AND users.sex = "f" ';
												} else if (iid == 2) { // LOOKIN FOR BOYS
														q+= ' AND users.sex = "m" ';
												}
										}
										
										// CHECK AGE MIN
										if (k == 'MIN_AGE') { 

												var age      = Number(prefs[k]);
												var agetime  = 1000*60*60*24*365*age;
												var min_age  = parseInt(now.getTime() - agetime);
												var min_date = new Date(min_age);

												var year  = min_date.getFullYear();
												var month = min_date.getMonth();
												if (month < 10) { month = '0' + month; }
												var day   = min_date.getDate();
												if (day < 10)  {day = '0' + day; }
												
												var sqldate = year+'-'+month+'-'+day;
												
												mia = ' AND users.bday < "'+sqldate+'"';
												
										}

										// CHECK AGE MAX
										if (k == 'MAX_AGE') { 

												var age      = Number(prefs[k]);
												var agetime  = 1000*60*60*24*365*age;
												var min_age  = parseInt(now.getTime() - agetime);
												var min_date = new Date(min_age);

												var year  = min_date.getFullYear();
												var month = min_date.getMonth();
												if (month < 10) { month = '0' + month; }
												var day   = min_date.getDate();
												if (day < 10)  {day = '0' + day; }
												
												var sqldate = year+'-'+month+'-'+day;
												
												maa = ' AND users.bday > "'+sqldate+'"';
												
										}

								}
								
								// GET LIVE USER LIST AND FITLERED
								var sql  = 'SELECT * FROM checkin,users WHERE checkin.tableid=? AND checkin.tablename=? AND checkin.uid !=?  AND checkin.uid = users.uid AND checkin.status= "on" AND users.status= "on" '+ q +' '+ mia +'  '+ maa +' GROUP BY checkin.uid ORDER BY users.lname ASC';
								var data = [ query.tableid ,query.tablename,query.uid];

								//	console.log(sql);
								//	console.log(data);
								return db.query(sql, data, function (err, result) {
												
												if (err) { res.send({error: 'Select CHECKIN error'});	}
												
												console.log(result);
												
												res.send(result);
												
										});
								
						});
				
		},
		

		// ----- MY PICKS ---- >


		// ADD PICK
		'addpick' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' || typeof query.sid == 'undefined' ) {
						res.send({error: 'not provide Pick data'});
						return;
				} 	

				// CHECK IF PICK ALREADY
				var sql = 'SELECT * FROM picks WHERE uid = ? AND sid = ? AND status="on"';
				var data = [query.uid ,query.sid];
				
				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'Check Pick error'});	}
								
								// NO PICKS EXISTS
								if (result.length == 0) {
										
										var sql  = 'INSERT INTO picks (uid,sid) VALUES (?,?)';
										var data = [ query.uid ,query.sid];
										
										return db.query(sql, data, function (err, result) {
														
														if (err) { res.send({error: 'Add TAG error'});	}
														
														console.log(result);
														
														res.send({piid:result.insertId});
														
												});
								} else {
										res.send({error: 'Pick Already in DB'});
								}
						});
		},		

		
		// LIST MY PICKS
		'listpick' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined'  ) {
						res.send({error: 'not provide Pick data'});
						return;
				} 	

				var sql  = 'SELECT * FROM picks WHERE uid=? AND status = "on"';

				return db.query(sql, [query.uid], function (err, result) {
								
								if (err) { res.send({error: 'LIST pick error'});	}

								var retarray = [];
								if (result.length>0) {
										for(i in result) {
												if (typeof result[i].sid != 'undefined') {
														retarray.push(result[i].sid);
												}
										}
								}

								res.send(retarray);
								
						});
		},
		

		// GET ALL MY PICKS
		'getpicks' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined'  ) {
						res.send({error: 'not provide Pick data'});
						return;
				} 	

				var sql  = 'SELECT sid, nickname,bday,sex,job, (SELECT tig FROM tags WHERE (tags.uid1=? AND tags.uid2= picks.sid AND tags.rtype = "sent" AND tags.status = "on" )) as sent, (SELECT tig FROM tags WHERE (tags.uid1=? AND tags.uid2=picks.sid AND tags.rtype = "mutual" AND tags.status = "on" ) OR (tags.uid1=picks.sid AND tags.uid2=? AND tags.rtype = "mutual" AND tags.status = "on" )) as mutual,(SELECT content FROM user_status WHERE uid=picks.sid AND user_status.content!="" ORDER BY cdate DESC LIMIT 0,1) as moodjo_status, (SELECT tableid FROM checkin WHERE uid=picks.sid AND checkin.status="on" ORDER BY cdate DESC LIMIT 0,1) as tableid, (SELECT tablename FROM checkin WHERE uid=picks.sid AND checkin.status="on" ORDER BY cdate DESC LIMIT 0,1) as tablename, (SELECT friends.status FROM friends WHERE (friends.uid1=? AND friends.uid2 =  picks.sid AND friends.status!="delete") OR (friends.uid2=? AND friends.uid1 =  picks.sid  AND friends.status!="delete") LIMIT 0,1 ) as friend_status FROM picks,users WHERE picks.uid=? AND picks.status = "on" AND users.status = "on" AND users.uid = picks.sid';
				return db.query(sql, [query.uid,query.uid,query.uid,query.uid,query.uid,query.uid], function (err, result) {
								
								if (err) { res.send({error: 'Get picks error'});	}

								res.send(result);
								
						});
		},



		// DELETE PICKS
		'delpick' : function(req, res, db, query) {
				
					if (typeof query.uid == 'undefined' || typeof query.sid == 'undefined' ) {
						res.send({error: 'not provide Pick data'});
						return;
				} 	
				
				var sql = 'UPDATE picks SET status = "delete" WHERE uid =? AND sid=?  ';
				
					return db.query(sql, [query.uid,query.sid], function (err, result) {
									
									if (err) { res.send({error: 'DELETE PICK error'});	}
									
									res.send({uid: query.uid});
									
						});
				
		},
		

		// ----- TAGS ---- >

		// ADD TAG
		'addtag' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' || typeof query.sid == 'undefined' ) {
						res.send({error: 'not provide Tag data'});
						return;
				} 	

				console.log('ADD TAGS');

				// CHECK IF TAGGED ALREADY
				var sql = 'SELECT * FROM tags WHERE (uid1=? AND uid2=? AND status="on") OR (uid1=? AND uid2=? AND status="on") ';
				var data = [query.sid ,query.uid,query.uid ,query.sid];
				
				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'Get TAG error'});	}
								
								// NO TAGS EXISTS
								if (result.length == 0) {

										// TAG
										var sql  = 'INSERT INTO tags (uid1,uid2,rtype,cdate) VALUES (?,?,"sent",now())';
										var data = [ query.uid ,query.sid];
										
										console.log(sql);
										console.log(data);

										return db.query(sql, data, function (err, result) {
														
														if (err) { res.send({error: 'Add TAG error'});	}
														
														console.log(result);
														
														res.send({tig:result.insertId});
														
												});

								} else {

										res.send({error: 'Users already tagged'});

										/*
										// ADD MUTUAL TAG
										var sql  = 'UPDATE tags SET rtype="mutual" WHERE uid1 = ?';
										return db.query(sql, [query.sid], function (err, result) {
														
														if (err) { res.send({error: 'Add Mutual error'});	}
														
														console.log(result);
														
														res.send({sid: query.sid});
														
												});
										*/

								}
		
						});
		},
		
		// ADD MUTUAL TAG
		'addmutualtag' : function(req, res, db, query) {

				if (typeof query.sid == 'undefined' || typeof query.uid == 'undefined'  ) {
						res.send({error: 'not provide m TAG data'});
						return;
				} else {
						
						var sql  = 'UPDATE tags SET rtype="mutual" WHERE uid2 = ? AND uid1 = ?';
						return db.query(sql, [query.uid,query.sid], function (err, result) {
										
										if (err) { res.send({error: 'Add Mutual error'});	}
										console.log('ADD MUTUAL TAG');	
										console.log(result);
										
										res.send({sid: query.sid});
										
								});				
				}
		},
		
		// LIST TAG
		'listtag' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' || typeof query.process == 'undefined' ) {
						res.send({error: 'not provide TAG data'});
						return;
				} 	


				console.log(query.process+' / '+query.uid);

				if (query.process == 'received') {
						var sql = 'SELECT uid1 as sid FROM tags WHERE uid2=? AND status = "on" GROUP BY uid1';
				} else if (query.process == 'sent'){
						var sql = 'SELECT uid2 as sid  FROM tags WHERE uid1=? AND status = "on" GROUP BY uid2';
				}

				return db.query(sql, [query.uid], function (err, result) {
								
								if (err) { res.send({error: 'Add TAG error'});	}
								
								var tags = [];
								for(i in result) {
										tags.push(result[i].sid);
								}
					
								if (query.process == 'received') {
										var sql = 'SELECT uid1 as sid FROM tags WHERE uid2=? AND status = "on" AND rtype = "mutual" GROUP BY uid1';
								} else if (query.process == 'sent'){
										var sql = 'SELECT uid2 as sid FROM tags WHERE uid1=? AND status = "on" AND rtype = "mutual" GROUP BY uid2';
								}
								return db.query(sql, [query.uid], function (err, result) {
												
												if (err) { res.send({error: 'Add TAG error'});	}
												var mutuals = [];
												for(i in result) {
														mutuals.push(result[i].sid);
												}
												
												var sql  = 'SELECT * FROM picks WHERE uid=? AND status = "on"';
												return db.query(sql, [query.uid], function (err, result) {
																
																if (err) { res.send({error: 'LIST pick error'});	}
																
																var picks = [];
																if (result.length>0) {
																		for(i in result) {
																				if (typeof result[i].sid != 'undefined') {
																						picks.push(result[i].sid);
																				}
																		}
																}
																	// CHECK FRIENDS
																var sql  = 'SELECT * FROM friends WHERE (friends.uid1=? AND friends.status != "delete" ) OR ( friends.uid2=? AND friends.status != "delete" )';
																var data = [query.uid,query.uid];
																
																return db.query(sql, data, function (err, result) {

																				var fri = [];
																				var uid = [];
																				if (result.length>0) {
																						for(i in result) {
																								var fridata = {};
																								if (typeof result[i].uid1 == query.uid) {
																										if (uid.indexOf(result[i].uid2) < 0) {
																												fridata = {uid:result[i].uid2,status:result[i].status};
																												fri.push(fridata);
																												uid.push(result[i].uid2);
																										}
																								} else {
																										if (uid.indexOf(result[i].uid1) < 0) {
																												fridata = {uid:result[i].uid1,status:result[i].status};
																												uid.push(result[i].uid1);
																												fri.push(fridata);
																										}
																								}	
																						}
																				}
																				
																				var retarray = {tags:tags,mutuals:mutuals,picks:picks,friends:fri};
																				
																				console.log(retarray);
																				
																				res.send(retarray);
																		});
														});
												
												
											
												
										});
								
						});
				
		},
		
		// LIST TAG
		'gettags' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' || typeof query.process == 'undefined' ) {
						res.send({error: 'not provide TAG data'});
						return;
				}

				console.log(query.process+' / '+query.uid);

				if (query.process == 'received') {
						var sql = 'SELECT uid1 as sid, nickname,bday,sex,job ,(SELECT content FROM user_status WHERE uid=tags.uid1 AND user_status.content!="" ORDER BY cdate DESC LIMIT 0,1) as moodjo_status FROM tags,users,user_status WHERE uid2=? AND tags.status = "on" AND users.status = "on" AND users.uid = tags.uid1 GROUP BY uid1';
				} else if (query.process == 'sent'){
						var sql = 'SELECT uid2 as sid,nickname,bday,sex,job,(SELECT content FROM user_status WHERE uid=tags.uid2 AND user_status.content!="" ORDER BY cdate DESC LIMIT 0,1) as moodjo_status  FROM tags,users WHERE uid1=? AND tags.status = "on" AND users.status = "on" AND users.uid = tags.uid2 GROUP BY uid2';
				}

				return db.query(sql, [query.uid], function (err, result) {
								
								if (err) { res.send({error: 'Add TAG error'});	}
								
								var tags = [];
								if (result.length>0) {
										tags = result;
								}
								if (query.process == 'received') {
										var sql = 'SELECT uid1 as sid FROM tags WHERE uid2=? AND status = "on" AND rtype = "mutual" GROUP BY uid1';
								} else if (query.process == 'sent'){
										var sql = 'SELECT uid2 as sid FROM tags WHERE uid1=? AND status = "on" AND rtype = "mutual" GROUP BY uid2';
								}

								return db.query(sql, [query.uid], function (err, result) {
												
												if (err) { res.send({error: 'Add TAG error'});	}
												var mutuals = [];
												for(i in result) {
														mutuals.push(result[i].sid);
												}
												
												var sql  = 'SELECT * FROM picks WHERE uid=? AND status = "on"';
												return db.query(sql, [query.uid], function (err, result) {
																
																if (err) { res.send({error: 'LIST pick error'});	}
																
																var picks = [];
																if (result.length>0) {
																		for(i in result) {
																				if (typeof result[i].sid != 'undefined') {
																						picks.push(result[i].sid);
																				}
																		}
																}

																var sql  = 'SELECT * FROM checkin WHERE uid=? AND status = "on"';
																return db.query(sql, [query.uid], function (err, result) {
																				
																				if (err) { res.send({error: 'LIST pick error'});	}
																				
																				var checkin = [];
																				if (result.length>0) {
																						for(i in result) {
																								if (typeof result[i].tableid != 'undefined') {
																										var data = {tablename:result[i].tablename,tableid:result[i].tableid}
																										checkin.push(data);
																								}
																						}
																				}

																				
																				// CHECK FRIENDS
																				var sql  = 'SELECT * FROM friends WHERE (friends.uid1=? AND friends.status != "delete" ) OR ( friends.uid2=? AND friends.status != "delete" )';
																				var data = [query.uid,query.uid];
																				
																				return db.query(sql, data, function (err, result) {
																								
																								var fri = [];
																								var uid = [];
																								if (result.length>0) {
																										for(i in result) {
																												var fridata = {};
																												if (typeof result[i].uid1 == query.uid) {
																														if (uid.indexOf(result[i].uid2) < 0) {
																																fridata = {uid:result[i].uid2,status:result[i].status};
																																fri.push(fridata);
																																uid.push(result[i].uid2);
																														}
																												} else {
																														if (uid.indexOf(result[i].uid1) < 0) {
																																fridata = {uid:result[i].uid1,status:result[i].status};
																																uid.push(result[i].uid1);
																																fri.push(fridata);
																														}
																												}	
																										}
																								}
																								
																								
																								var retarray = {tags:tags,mutuals:mutuals,picks:picks,checkin:checkin,friends:fri};
																								
																								// console.log(retarray);
																								
																								res.send(retarray);
																						});
																		});
																
														});
												
												
											
												
										});
								
						});
				
		},

		// DELETE TAG
		'deltag' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' || typeof query.sid == 'undefined' ) {
						res.send({error: 'not provide Tag data'});
						return;
				} 	
				
				var sql  = 'UPDATE tags SET status = "delete" WHERE (uid1 =? AND uid2=?) OR (uid1 =? AND uid2=?)  ';
				var data = [query.uid, query.sid, query.sid, query.uid ];
				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'DELETE TAG error'});	}
								console.log('DEL TAG DONE');
								res.send({uid: query.uid});
								
						});
				
		},

		

		// ----- FRIENDS ---- >

		
		// CHECK FRIENDS
		'checkfriends' : function(req, res, db, query) {

				if (query.friends.length > 0 && typeof query.friends[0] != 'undefined') {
						
						var moodjousers = [];
						//						var list = query.friends;
						var cnt = 0;

						console.log('################# START HERE MAIN FCT #####################');

						console.log(query.friends);

						//						console.log('UID HERE : '+query.uid);

						checkFriend(query.friends[0],query.friends,moodjousers,query.uid);

						function checkFriend(thisfriend,thislist,musers,thisUid) {
								
								console.log('################# START HERE INNER FCT  #####################');
								
								//								console.log('this friend > '+thisfriend+' / '+thisUid);
		
								var sql  = 'SELECT *,(SELECT status FROM friends WHERE (uid1=? and uid2=users.uid) or (uid2=? and uid1=users.uid) limit 0,1) as friend_status  FROM users WHERE email = ? AND status !="delete"';
								// console.log(sql);
								var data = [thisUid,thisUid,thisfriend];
								return db.query(sql, data, function (err, result) {
												
												//												console.log('CNT : '+cnt);

												cnt++;

												if (err) { res.send({error: 'error CHECK'}); return;	}

												// add to Moodjo Users array
												if (result.length > 0) {
														
														console.log('is Moodjo User in DB');
														// console.log(result);

														if (typeof result[0].uid != 'undefined') {
																var udata = {uid:result[0].uid,lname:result[0].lname,fname:result[0].fname,nickname:result[0].nickname,email:result[0].email,friend_status:result[0].friend_status}
																musers.push(udata);
														}

												}

												//												console.log('Splice in list ln '+thislist.length);

												var buddy = thislist[thislist.indexOf(thisfriend)];

												// remove from list
												thislist.splice(thislist.indexOf(thisfriend),1);

												if (thislist.length > 0) {

														console.log('Splice ou  list ln '+thislist.length);
														
														console.log(thislist);
														
														for(var j in thislist) {
																
																console.log('###########   '+thislist[j]+' / '+j+' / '+thislist.length+ ' / ' +buddy);

																if (typeof thislist[j] !='undefined' && thislist[j] != '') {
																		checkFriend(thislist[j],thislist,musers,thisUid);
																}

														}

												} else {

														console.log('OK  list '+musers.length+' /  '+thislist.length+' / '+buddy);

														if (typeof buddy != 'undefined') {

																if (musers.length > 0) {
																		
																		res.setHeader("Content-Type", "text/html");
																		res.send(musers);
																		// res.end();
																		return;
																} else {
																		res.send({error: 'empty'});
																}

														}

												}

										});
								
						}
						
				} else {
						res.send({error: 'no Friends to check'});
				}

		},

		

		
		//  ADD FRIEND
		'addfriend' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' || typeof query.fid == 'undefined' ) {
						res.send({error: 'not provide Friends data'});
						return;
				} 	

				var now  = parseInt((new Date()) /1000); // Unix timestamp;

				var sql  = 'SELECT * FROM friends WHERE uid1=? AND uid2=? AND status!="delete"';
				var data = [query.uid,query.fid];
				
				return db.query(sql, data, function (err, result) {
								
								if (result.length>0) {
										res.send({error: 'Already friends'});
								} else {
										
										var sql  = 'INSERT INTO friends (uid1,uid2,cdate) VALUES (?,?,?) ';
										var data = [query.uid, query.fid, now ];
										
										return db.query(sql, data, function (err, result) {
														
														if (err) { res.send({error: 'Add FRIEND error'});	}
														
														res.send({uid: query.uid});
														
												});	
								}
								
						});
		},
	
		//  VALIDATE FRIEND
		'validatefriend' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' || typeof query.fid == 'undefined' ) {
						res.send({error: 'not provide Friends data'});
						return;
				} 	

				var sql  = 'UPDATE friends SET status="on" WHERE (uid1=? AND uid2=? AND status!="delete") OR (uid1=? AND uid2=? AND status!="delete") ';
				var data = [query.fid , query.uid , query.uid , query.fid];
				
				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'Validate FRIEND error'});	}
								
								res.send({uid: query.uid});
								
						});	

		},

		//  INVITE NEW FRIEND - NOT IN MOODJO 
		'invite' : function(req, res, db, query) {

				
				if (typeof query.uid == 'undefined' || typeof query.email == 'undefined' ) {
						res.send({error: 'not provide invite Friends data'});
						return;
				} 	

				var now  = parseInt((new Date()) /1000); // Unix timestamp;
				
				
				var sql  = 'INSERT INTO user_invitation (uid,lname,fname,email,cdate) VALUES (?,?,?,?,?) ';
				var data = [query.uid, query.lname, query.fname, query.email, now ];
				
				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'INVITE FRIEND error'});	}
								
								res.send({uid: query.uid});
								
						});	
				
		},
		

		// LIST FRIENDS
		'listfriends' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' ) {
						res.send({error: 'not provide User for friends data'});
						return;
				} 	

				if (typeof query.type == 'undefined' ) {
						res.send({error: 'not provide Type for friends data'});
						return;
				} 	
				
				if (query.type == 'request' ) {
						
						var sql  = 'SELECT uid,lname,fname,nickname,bday,sex,job,friends.cdate as fcdate, (SELECT tig FROM tags WHERE (tags.uid1=? AND tags.uid2= friends.uid2 AND tags.rtype = "sent" AND tags.status = "on" )) as sent, (SELECT tig FROM tags WHERE (tags.uid1=? AND tags.uid2=friends.uid2 AND tags.rtype = "mutual" AND tags.status = "on" ) OR (tags.uid1=friends.uid2 AND tags.uid2=? AND tags.rtype = "mutual" AND tags.status = "on" )) as mutual,(SELECT content FROM user_status WHERE uid=friends.uid2 AND user_status.content!="" ORDER BY cdate DESC LIMIT 0,1) as moodjo_status,((SELECT piid FROM picks WHERE picks.uid=? and picks.sid=friends.uid2 AND status = "on") OR (SELECT piid FROM picks WHERE picks.uid=? and picks.sid=friends.uid1 AND status = "on")) as pick, (SELECT tableid FROM checkin WHERE uid=friends.uid2 AND checkin.status="on" ORDER BY cdate DESC LIMIT 0,1) as tableid, (SELECT tablename FROM checkin WHERE uid=friends.uid2 AND checkin.status="on" ORDER BY cdate DESC LIMIT 0,1) as tablename FROM friends,users WHERE friends.uid2=? AND friends.status = "request"  AND users.uid = friends.uid1 AND users.status = "on"';
						
						var data = [query.uid,query.uid,query.uid,query.uid,query.uid,query.uid];

				} else if (query.type == 'on' ) {

						var sql = 'SELECT uid,lname,fname,nickname,bday,sex,job,friends.cdate as fcdate,';
						sql += '(SELECT tig FROM tags WHERE ((tags.uid1=? AND tags.uid2= friends.uid2 AND tags.rtype = "sent" AND tags.status = "on" ) OR (tags.uid2=? AND tags.uid1= friends.uid2 AND tags.rtype = "sent" AND tags.status = "on" )) OR ((tags.uid1=? AND tags.uid2= friends.uid1 AND tags.rtype = "sent" AND tags.status = "on" ) OR (tags.uid2=? AND tags.uid1= friends.uid1 AND tags.rtype = "sent" AND tags.status = "on" )   )  ) as sent,';
						sql += '(SELECT tig FROM tags WHERE ((tags.uid1=? AND tags.uid2=friends.uid2 AND tags.rtype = "mutual" AND tags.status = "on" ) OR (tags.uid1=friends.uid2 AND tags.uid2=? AND tags.rtype = "mutual" AND tags.status = "on" )) OR ((tags.uid1=? AND tags.uid2=friends.uid1 AND tags.rtype = "mutual" AND tags.status = "on" ) OR (tags.uid1=friends.uid1 AND tags.uid2=? AND tags.rtype = "mutual" AND tags.status = "on" )  ) ) as mutual,';
						sql += '(SELECT content FROM user_status WHERE (uid=friends.uid2 AND user_status.content!="") OR (uid=friends.uid1 AND user_status.content!="") ORDER BY cdate DESC LIMIT 0,1) as moodjo_status,';
						sql += '((SELECT piid FROM picks WHERE picks.uid=? and picks.sid=friends.uid2 AND status = "on") OR (SELECT piid FROM picks WHERE picks.uid=? and picks.sid=friends.uid1 AND status = "on")) as pick,';
						sql += '(SELECT tableid FROM checkin WHERE uid=friends.uid2 AND checkin.status="on" ORDER BY cdate DESC LIMIT 0,1) as tableid,';
						sql += '(SELECT tablename FROM checkin WHERE uid=friends.uid2 AND checkin.status="on" ORDER BY cdate DESC LIMIT 0,1) as tablename ';
						sql += 'FROM friends,users WHERE (friends.uid1=? AND friends.status = ?  AND users.uid = friends.uid2 ) OR  (friends.uid2=? AND friends.status = ?  AND users.uid = friends.uid1 )  AND users.status = "on"';
						
						var data = [query.uid,query.uid,query.uid,query.uid,query.uid,query.uid,query.uid,query.uid,query.uid,query.uid,query.uid,query.type,query.uid,query.type];
						
				}
				
				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'List FRIENDS'});	}
								
								res.send(result);
						
						});
								
		},

		
		'commonfriends' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' ) {
						res.send({error: 'not provide User U for Common friends data'});
						return;
				} 	
				
				if (typeof query.sid == 'undefined' ) {
						res.send({error: 'not provide User S for Common friends data'});
						return;
				} 	
				
				var commonFriends = [];
				
				// CHECK UID FRIENDS
				var sql  = 'SELECT * FROM friends  WHERE (friends.uid1=? AND friends.status = "on") OR  (friends.uid2=? AND friends.status = "on" ) ';
				var data = [query.uid,query.uid];
				
				console.log(query);

				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'COOMON FRIENDS U'});	}
								
								// CHECK  UID BUDDIES 
								var uidBuddies = [];	
								if (result.length>0) {
										for(i in result) {
												if (typeof result[i].uid1 == query.uid) {
														if (uidBuddies.indexOf(result[i].uid2) < 0) { uidBuddies.push(result[i].uid2); }
												} else {
														if (uidBuddies.indexOf(result[i].uid1) < 0) { uidBuddies.push(result[i].uid1); }
												}	
										}
								}

								console.log(uidBuddies);

								// CHECK UID FRIENDS
								var sql  = 'SELECT * FROM friends  WHERE (friends.uid1=? AND friends.status = "on") OR  (friends.uid2=? AND friends.status = "on" ) ';
								var data = [query.sid,query.sid];
								
								return db.query(sql, data, function (err, result2) {
												
												if (err) { res.send({error: 'Common FRIENDS S'});	}
												
												if (result2.length>0) {
														for(j in result) {
																
																if (typeof result2[j].uid1 == query.sid) {
																		if (uidBuddies.indexOf(result2[j].uid2) < 0) {
																				commonFriends.push(result2[j].uid2); 
																		}
																} else {
																		if (uidBuddies.indexOf(result2[j].uid1) < 0) { 
																				commonFriends.push(result2[j].uid1);
																		}
																}	
																
														}
												}
												
												console.log('COMMON FRIENDS');
												console.log(commonFriends);
												
												res.send(commonFriends);	
				
										});
								
						});

			
				
		},
				
	
		// GET FRIEND
		'getfriend' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' || typeof query.fid == 'undefined') {
						res.send({error: 'not provide get friends data'});
						return;
				} 	

				var now  = parseInt((new Date()) /1000); // Unix timestamp;

				var sql  = 'SELECT users.uid,users.lname,users.fname,users.nickname,users.email,users.bday,users.sex FROM users,friends WHERE (uid1=? AND uid2=? AND users.uid = friends.uid2) OR ( uid1=? AND uid2=? AND users.uid = friends.uid1  ) AND friends.status!="delete" AND users.status != "delete"';
				var data = [query.uid,query.fid,query.fid,query.uid];

				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'get FRIENDS error'});	}
								
								res.send(result);
								
						});

		},

	
		// DELETE FRIEND / UNFRIEND
		'delfriend' : function(req, res, db, query) {

				if (typeof query.uid == 'undefined' || typeof query.fid == 'undefined') {
						res.send({error: 'not provide get friends data'});
						return;
				} 	

				var now  = parseInt((new Date()) /1000); // Unix timestamp;

				var sql  = 'UPDATE friends SET status = "delete" WHERE (uid1=? AND uid2=?) OR (uid1=? AND uid2=?)';
				var data = [query.uid,query.fid,query.fid,query.uid];

				return db.query(sql, data, function (err, result) {
								
								if (err) { res.send({error: 'del FRIENDS error'});	}
								
								res.send({uid: query.uid});
								
						});

		},


		// ----- VIRTUAL TAGS ---- >


		// ADD VIRTUAL TAG
		'addvirtualtag' : function(params) {
				return data;
		},

		// LIST VIRTUAL TAG
		'listvirtualtag' : function(params) {
				return data;
		},

		// GET VIRTUAL TAG
		'getvirtualtag' : function(params) {
				return data;
		},

		// DELETE VIRTUAL TAG
		'delvirtualtag' : function(params) {
				return data;
		},
	
};

module.exports = new social();