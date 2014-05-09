var my_util = require('./my_util'),
	ejdb = require('ejdb'),
	lockfile = require('lockfile');
function db_find(db_name, key, val_form, option, callback){
	lockfile.lock(db_name + '.lock', {}, function (er) {
		var db = ejdb.open(db_name),
		//var db = ejdb.open(db_name, ejdb.DEFAULT_OPEN_MODE | ejdb.JBOTRUNC),
			result = null;
		db.find(key, val_form, option, function (err, cursor, count){
			if(err) {
				console.error(err);
				db.close();
				lockfile.unlock(db_name + '.lock', function (er) {
					return result;
				});
			}
			result = my_util.clone(cursor);
			cursor.close();
			db.close();
			if(callback) callback(result);
			lockfile.unlock(db_name + '.lock', function (er) {
				return result;
			});
		});
	});
}

function db_save(db_name, key, data, callback){ 
	lockfile.lock(db_name + '.lock', {}, function (er) {
		var db = ejdb.open(db_name);
		//var db = ejdb.open(db_name, ejdb.DEFAULT_OPEN_MODE | ejdb.JBOTRUNC);
		db.save(key, data, function(err, oids) {
			if (err) {
				console.error(err);
    		    db.close();
				lockfile.unlock(db_name + '.lock', function (er) {
    		    	return oids;
    		    });
    		}
    		db.close();
    		if(callback) callback(oids);
			lockfile.unlock(db_name + '.lock', function (er) {
    	    	return oids;
			});	
		});
	});
}

exports.db_find = db_find;
exports.db_save = db_save;
