var my_util = require('./my_util');
var user_info = {
	userid: '',
	passwd: '',
	rss: [],
    update_list: [],
	max_rss: 15,
	use_max_rss: true,
	refresh_period: 180	
};
var rss_item = {
	title: '',
	link: '',
	description: '',
	category: '',
	pub_date: 0,
	guid: '',
	author: '',
	comments: '',
	update: ''
};
exports.user_info = my_util.clone(user_info);
exports.rss_item = my_util.clone(rss_item);
