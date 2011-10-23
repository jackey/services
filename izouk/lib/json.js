/*
* JSON CLASS TO serialize / parse JSON obj
*/

var JSON = function() {}

JSON.prototype = {

		'stringify' : function (obj,err) {
				
				var t = typeof (obj);
				if (t != "object" || obj === null) {
						
						// simple data type
						if (t == "string") obj = '"'+obj+'"';
						return String(obj);
						
				}
				else {
						
						// recurse array or object
						var n, v, json = [], arr = (obj && obj.constructor == Array);
						
						for (n in obj) {
								v = obj[n]; t = typeof(v);
								
								if (t == "string") v = '"'+v+'"';
								else if (t == "object" && v !== null) v = JSON.stringify(v);
								
								json.push((arr ? "" : '"' + n + '":') + String(v));
						}
						
						return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
				}
		},
	
		
		'parse' : function (str,err) {

				if (str === "") str = '""';
				eval("var p=" + str + ";");
				return p;
				
		},

}

module.exports = new JSON();