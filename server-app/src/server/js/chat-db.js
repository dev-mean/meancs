
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/meancs', function(err){
	if(err) {
		console.log(err);
	} else {
		console.log('Connected to mongodb!');
	}
});

let userSchema = mongoose.Schema({
	username: String,
	email: String,
	created: {type: Date, default: Date.now}
});

let User = mongoose.model('User', userSchema);

exports.findAllUsers = function(cb){
	let query = User.find({});
	query.exec(function(err, docs){
		cb(err, docs);
	});
}

exports.saveUser = function(data, cb){
	let newUser = new User({username: data.username, email: data.email});
	newUser.save(function(err){
		cb(err);
	});
};


let chatSchema = mongoose.Schema({
	nick: String,
	msg: String,
	created: {type: Date, default: Date.now}
});

let Chat = mongoose.model('Message', chatSchema);

exports.getOldMsgs = function(limit, cb){
	let query = Chat.find({});
	query.sort('-created').limit(limit).exec(function(err, docs){
		cb(err, docs);
	});
}

exports.saveMsg = function(data, cb){
	let newMsg = new Chat({msg: data.msg, nick: data.nick});
	newMsg.save(function(err){
		cb(err);
	});
};