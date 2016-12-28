'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect('mongodb://localhost/meancs', function (err) {
	if (err) {
		console.log(err);
	} else {
		console.log('Connected to mongodb!');
	}
});

var userSchema = _mongoose2.default.Schema({
	username: String,
	email: String,
	created: { type: Date, default: Date.now }
});

var User = _mongoose2.default.model('User', userSchema);

exports.findAllUsers = function (cb) {
	var query = User.find({});
	query.exec(function (err, docs) {
		cb(err, docs);
	});
};

exports.saveUser = function (data, cb) {
	var newUser = new User({ username: data.username, email: data.email });
	newUser.save(function (err) {
		cb(err);
	});
};

var chatSchema = _mongoose2.default.Schema({
	nick: String,
	msg: String,
	created: { type: Date, default: Date.now }
});

var Chat = _mongoose2.default.model('Message', chatSchema);

exports.getOldMsgs = function (limit, cb) {
	var query = Chat.find({});
	query.sort('-created').limit(limit).exec(function (err, docs) {
		cb(err, docs);
	});
};

exports.saveMsg = function (data, cb) {
	var newMsg = new Chat({ msg: data.msg, nick: data.nick });
	newMsg.save(function (err) {
		cb(err);
	});
};