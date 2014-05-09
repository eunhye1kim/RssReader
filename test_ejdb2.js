var EJDB = require('ejdb');
var fs = require('fs');

var user = {
    'name' : 'admin',
    'max_rss' : 20,
    'refresh_period' : 300,
    'rss' : [{
        'title': 'Allocated to me',
        'url': 'https://bugtrack.ahnlab.com/issues_rss.php?username=eunhye.kim&key=0d5cbc6c9c6057f24cf71027d354d29b&filter_id=20904',
        'docs': [{
            'title': '196053: suarez 실패 오류 코드 세분화 요청',
            'link':'https://bugtrack.ahnlab.com/view.php?id=196053',
            'pubDate':'2014-05-07T10:28:09+0900',
            'update':'2014-05-07T10:28:09+0900'
        }]}]
};
function init_collection(rss_db, fn) {
	var admin = {
	    'name' : 'admin',
        'passwd' : 'admin',
        'max_rss' : 15,
        'use_max_rss' : true,
        'refresh_period' : 600,
        'use_alert' : true,
        'rss' : []
    };

    if (!fs.existsSync('rss-db_user-info')) {
        // do something
        rss_db.save('user-info', [admin], function(err, oids) {
            if (err) {
                console.error(err);
                return;
            }
            console.log('admin OID: ' + admin['_id']);
            return fn && fn(err, oids);
        });
    }
    else {
        return fn && fn(null, null);
    }
}

function mod_collection_item(rss_db, item, fn) {
    find_item(rss_db, item.name, function(err, res) {
        for(var attr in res) {
            if (!item.hasOwnProperty(attr)) {
                item[attr] = res[attr];
                console.log(attr, ' ', item[attr]);
            }
        }
        console.log(JSON.stringify(item));
        rss_db.save('user-info', item, function(err, oids) {
            if (err) {
                console.error(err);
                return;
            }
            console.log('success.' + item['_id']);
            return fn && fn(err, item);
        });
    });
}

function find_item(rss_db, name, fn) {
    rss_db.findOne('user-info',
        {'name' : name},
        {},
        function(err, res) {
            if (err) {
                console.error(err);
                return;
            }
            return fn && fn(err, res);
        });
}

function rss_add(rss_db, userid, passwd, new_title, new_url, fn) {
    find_item(rss_db, userid, function (err, res) {
        if (passwd == res.passwd) {
            res.rss.push({'title': new_title, 'url': new_url, 'docs': []});
            mod_collection_item(rss_db, res, function (err, res) {
                console.log('in mod callback');
                if (err) {
                    console.error(err);
                    return;
                }
                return fn && fn(err, res);
            });
        }
    });
}

function rss_del(rss_db, userid, passwd, del_list, fn) {
    var tmp;
    find_item(rss_db, userid, function (err, res) {
        if (passwd == res.passwd) {
            for (var del in del_list) {
                if (del_list[del].checked) {
                    tmp = del_list[del].value.split('\t| '); // del.value = item.rss.title + '\t| ' + item.rss.url;
                    for (var i = 0; i < res.rss.length; i++) {
                        if (res.rss[i].title == tmp[0]) {
                            res.rss.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            mod_collection_item(rss_db, res, function (err, res) {
                if (err) {
                    console.error(err);
                    return;
                }
                return fn && fn(err, res);
            });
        }
    });
}


//tests();
(function () {
    var rss_db = EJDB.open('rss-db', EJDB.DEFAULT_OPEN_MODE | EJDB.JBOREADER | EJDB.JBOWRITER | EJDB.JBOCREAT);
    init_collection(rss_db, function (err, res) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('init');
        mod_collection_item(rss_db, user, function (err, res) {
            if (err) {
                console.error(err);
                return;
            }
            console.log('mod');
            rss_add(rss_db, 'admin', 'admin', 'new_title', 'new_url', function (err, res) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('add');
                rss_del(rss_db, 'admin', 'admin', [{'checked': true, 'value': 'new_title\t| new_url'}], function (err, res) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    find_item(rss_db, 'admin', function (err, res) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        console.log(JSON.stringify(res) + '\n');
                        rss_db.close();
                    });
                });
            });
        });
    });
})();
