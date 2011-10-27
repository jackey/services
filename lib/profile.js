/*
 * /lib/profile.js
 */
var profile = function() {
};

profile.prototype = {

  // ---- USERS ---- >

  // LIST USER
  'listuser' : function(req, res, db, params) {
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

  // USER INFO
  'getinfo' : function(req, res, db, params) {
    if (typeof params.uid == 'undefined') {
      res.send({error:'please provide uid'});
    }
    else {
      var sql = 'SELECT * FROM users WHERE uid=?';
      return db.query(sql, [params.uid], function (err, results, fields) {
        if (err) {
          res.send({error: err});
        }
        else {
//          var string = '';
//          results.forEach(function (result) {
//            for (var field in result) {
//              string += field + ":" + result[field] + '<\/br>';
//            }
//          });
          res.send(results);
        }
      });
    }
  },

  // ADD /EDIT NEW USER (params)
  'edituser' : function(req, res, db, query) {
    if (typeof query == 'undefined') {
      res.send({error: 'not provide post data'});
      return;
    }
    /**
     * lname, fname, nickname, email, password is required.
     */
    var required = ['lname', 'fname', 'nickname', 'email', 'password'];
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
    if (!query.uid) {
      var pass = require('crypto').createHash('md5').update(query.password).digest("hex");
      var now = parseInt((new Date()) /1000); // Unix timestamp;
      var sql = "INSERT INTO users (lname,fname,nickname,email,password,cdate) VALUES (?, ?, ?, ?, ?, ?)";
      var data = [query.lname, query.fname, query.nickname, query.email, pass, now];
      return db.query(sql, data, function (err, result) {
        if (err) {
          res.send({error: 'Insert user error'});
        }
        res.send({data: [query.lname, query.fname, query.nickname, query.email, pass, now], message: 'Inserted user'});
      });
    } else {
      var query = 'UPDATE users SET lname="' + params.info.lname + '", fname="'
          + params.info.fname + '", nickname="' + params.info.nickname
          + '", email="' + params.info.email + '"  WHERE uid=' + params.uid;
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