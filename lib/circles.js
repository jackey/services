/*
 * /lib/circles.js
 */
var circles = function() {};
 
circles.prototype = {

		// GROUP INFO
		'get' : function(params) {
				var query = 'SELECT * FROM groups WHERE gid='+params.gid;
				// checkin.getaddress(aid);
				return data;
		},

		// LIST USER GROUPS - MAYBE PUT THIS FUNCTION IN PROFILE ?
		'list' : function(params) {		
				return data;
		},
		
		// ADD / EDIT GROUP TO USER
		'edit' : function(params) {
				return data;
		},
			
		// DELETE GROUP
		'del' : function(params) {
				return data;
		},
		
		// DELETE USER FROM GROUP
		'delfromuser' : function(params) {
				var query = 'DELETE FROM user_groups WHERE gid='+val(gid)+' AND uid='+val(uid);
				return data;
		},
	
		// DELETE USER FROM GROUP
		'getmedia' : function(params) {
				var query = 'SELECT * FROM media WHERE tableid='+val(gid)+' AND tablename="groups"';
				return data;
		},

};
 
module.exports = new circles();