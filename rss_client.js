var FeedParser = require('feedparser'),
    http = require('http'),
    my_util = require('./my_util'),
	my_object = require('./my_object'),
	db_access = require('./db_access');

function check_update(_old, _new){
	for(var i=0; i<_old.length; i++) {
		for(var j=0; j<_new.length; j++) {
			if(_old[i].link != _new[j].link)
				continue;
			_new[i].update = (_old[i].update) ? _old[i].update : true;
			if(_old[i].pubDate < _new[j].pubDate) 
				_new[i].update = true;	
			break;
		}
	}
	return _new;
};

function check_read(user_info, section, item) {
    for(var i in user_info.rss) {
        if(i.title == section) {
            for(var j in i.item) {
                if(j.title == item) {
                    j.update = false;
                }
            }
        }
    }
}

function rss_update(user_info){
	var episodes = [],
	    rss = user_info.rss;
	for(var i=0; i<rss.length; i++) {
		http.get(rss[i].url, function(res) {
			res.pipe(new FeedParser({}))
				.on('error', function(err){
					//TODO: Tell the user we just had a melt-down.
				})
				.on('readable', function(){
					var stream = this, item;
					for(var j=0; item = stream.read(); j++){
						//Each 'readdable' event will contain 1 article
						//Add the article to the list of episodes
						if(user_info.use_max_rss && j >= user_info.max_rss) break;
						episodes.push(my_util.clone(item));
                        name			}
				})
				.on('end', function(){
					user_info.rss = check_update(rss, episodes);
					db_access.db_save('./user_info', user_info.userid, user_info, null);
				});
		});
	}
};

exports.check_read = check_read;
exports.rss_update = rss_update;
exports.rss_add = function (user_info, new_title, new_url) {
	user_info.rss.push({title: new_title, url: new_url, item:[]});
	rss_update(user_info);
}
exports.rss_del = function (user_info, del_list) {
	for(var i=0; i<del_list.length; i++) {
		for(var j=0; j<user_info.rss.length; j++) {
			if(del_list[i] == user_info.rss[j].title){
				user_info.rss.removeAt(j);
				break;
			}
		}
	}
	rss_update(user_info);
}

exports.refresh = function (user_info) {
	setInterval(function() {
		rss_update(user_info);
	}, user_info.refresh_period*1000);
}

exports.login = function (userid, passwd) {
	var user_info = db_access.db_find('./user_info', userid, {}, {}, null);
	if(!user_info) {
		user_info = my_object.user_info;
		user_info.passwd = passwd;
		db_access.db_save('./user_info', userid, user_info, null);
	}
	else {
		if(user_info.passwd != passwd)
			user_info = null;
	}

	return user_info;
}
