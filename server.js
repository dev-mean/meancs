var express	=	require('express');
var app		=	express();
var port	=	process.env.PORT || 8080;
var mongoose	=	require('mongoose');
var mongo = require('mongodb').MongoClient;

var http	=	require('http').Server(app);
var io = require('socket.io')(http);

mongoose.connect("mongodb://127.0.0.1:27017/meancs");

// // create a schema for chat
    // var ChatSchema = mongoose.Schema({
    //   created: Date,
    //   content: String,
    //   username: String,
    //   room: String
    // });

    // // create a model from the chat schema
    // var Chat = mongoose.model('Chat', ChatSchema);

    // // allow CORS
    // app.all('*', function(req, res, next) {
    //   res.header("Access-Control-Allow-Origin", "*");
    //   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    //   res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    //   if (req.method == 'OPTIONS') {
    //     res.status(200).end();
    //   } else {
    //     next();
    //   }
    // });

    // // server.js

    /*||||||||||||||||||||||ROUTES|||||||||||||||||||||||||*/

    //This route produces a list of chat as filterd by 'room' query
    // app.get('/msg', function(req, res) {
    //   //Find
    //   Chat.find({
    //     'room': req.query.room.toLowerCase()
    //   }).exec(function(err, msgs) {
    //     //Send
    //     res.json(msgs);
    //   });
    // });

    /*||||||||||||||||||END ROUTES|||||||||||||||||||||*/

        // // server.js

        // /*||||||||||||||||SOCKET|||||||||||||||||||||||*/
        // //Listen for connection
        // io.on('connection', function(socket) {
        //   //Globals
        //   var defaultRoom = 'general';
        //   var rooms = ["r1", "r2", "r3", "r4", "r5"];

        //   //Emit the rooms array
        //   socket.emit('setup', {
        //     rooms: rooms
        //   });

        //   //Listens for new user
        //   socket.on('new user', function(data) {
        //     data.room = defaultRoom;
        //     //New user joins the default room
        //     socket.join(defaultRoom);
        //     //Tell all those in the room that a new user joined
        //     io.in(defaultRoom).emit('user joined', data);
        //   });

        //   //Listens for switch room
        //   socket.on('switch room', function(data) {
        //     //Handles joining and leaving rooms
        //     //console.log(data);
        //     socket.leave(data.oldRoom);
        //     socket.join(data.newRoom);
        //     io.in(data.oldRoom).emit('user left', data);
        //     io.in(data.newRoom).emit('user joined', data);

        //   });

        //   //Listens for a new chat message
        //   socket.on('new message', function(data) {
        //     //Create message
        //     var newMsg = new Chat({
        //       username: data.username,
        //       content: data.message,
        //       room: data.room.toLowerCase(),
        //       created: new Date()
        //     });
        //     //Save it to database
        //     newMsg.save(function(err, msg){
        //       //Send message to those connected in the room
        //       io.in(msg.room).emit('message created', msg);
        //     });
        //   });
        // });
// /*||||||||||||||||||||END SOCKETS||||||||||||||||||*/

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
var usernames = {};
var rooms = [];
 
io.sockets.on('connection', function (socket) {
     
    socket.on('adduser', function (data) {
        var username = data.username;
        var room = data.room;
 
        if (rooms.indexOf(room) != -1) {
            socket.username = username;
            socket.room = room;
            usernames[username] = username;
            socket.join(room);
            socket.emit('updatechat', 'SERVER', 'You are connected. Start chatting');
            socket.broadcast.to(room).emit('updatechat', 'SERVER', username + ' has connected to this room');
        } else {
            socket.emit('updatechat', 'SERVER', 'Please enter valid code.');
        }
    });
     
    socket.on('createroom', function (data) {
        var new_room = ("" + Math.random()).substring(2, 7);
        rooms.push(new_room);
        data.room = new_room;
        socket.emit('updatechat', 'SERVER', 'Your room is ready, invite someone using this ID:' + new_room);
        socket.emit('roomcreated', data);
    });
 
    socket.on('sendchat', function (data) {
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
    });
 
    socket.on('disconnect', function () {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        if (socket.username !== undefined) {
            socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
            socket.leave(socket.room);
        }
    });
});
http.listen(port, function(){
console.log('localhost'+ port);
});
