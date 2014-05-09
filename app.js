
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user.js'),
    http = require('http'),
    path = require('path'),
    util = require('util'),
    rss_client = require('./rss_client'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    engine = require('ejs-locals'),
    user_info,
    app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

app.engine('ejs', engine);
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/index', routes.index);
app.get('/users', user.list);
app.get('/', function(req, res){
    res.render('login.ejs', {});
});
app.post('/main', function(req, res){
    user_info = rss_client.login(req.body.user.userid, req.body.user.passwd);
    rss_client.rss_update(user_info);
    res.render('main.ejs', { argv: JSON.stringify(user_info)});
});
app.get('/list_view', function(req, res){
    if(!user_info) {
        res.redirect('/');
    }
    rss_client.rss_update(user_info);
    res.render('list_view.ejs', { argv: JSON.stringify(user_info)});
});
app.post('/rss_setting', function(req, res){
    var del_list = [];

    if(!user_info) {
        res.redirect('/');
    }
    if('Add' == req.body.action.value) {
        rss_client.rss_add(user_info, req.body.new_name, req.body.new_url);
    }
    else if('Del' == req.body.action.value) {
        for(var i in req.body.del) {
            if(req.body.del[i].value) {
                del_list.push(req.body.del[i].title);
            }
        }
        rss_client.rss_del(user_info, del_list);
    }

    res.render('rss_setting.ejs', { argv: JSON.stringify(user_info)});
});
app.post('/env_setting', function(req, res){
    if(!user_info) {
        res.redirect('/');
    }
    user_info.refresh_period = req.body.ref_period;
    user_info.use_max_rss = req.body.use_limit;
    user_info.max_rss = req.body.article_limit;
    res.render('env_setting.ejs', { argv: JSON.stringify(user_info)});
});
app.post('/check_read', function(req, res){
    if(!user_info) {
       res.redirect('/');
    }
    rss_client.check_read(req.body.section, req.body.item);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
