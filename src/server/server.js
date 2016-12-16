'use strict';

import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import compression from 'compression';
import mongoose from 'mongoose';
import {validEmail, findIndex, sanitizeString} from '../shared/util';

let app = express();
let server = http.Server(app);
let io = new SocketIO(server);
let port = 3000;//process.env.PORT || 
let users = [];
let sockets = {};

mongoose.connect("mongodb://127.0.0.1:27017/meancs");

app.use(compression({}));
app.use(express['static'](__dirname + '/../client'));
// create a schema for chat
    var UserSchema = mongoose.Schema({
      created: Date,
      id: String,
      username: String,
      email: String
    });

    // create a model from the chat schema
    var Chat = mongoose.model('Chat', ChatSchema);

    // allow CORS
    app.all('*', function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
      if (req.method == 'OPTIONS') {
        res.status(200).end();
      } else {
        next();
      }
    });
    /*||||||||||||||||||||||ROUTES|||||||||||||||||||||||||*/

    //This route produces a list of chat as filterd by 'room' query
    app.get('/msg', function(req, res) {
      //Find
      Chat.find({
        'room': req.query.room.toLowerCase()
      }).exec(function(err, msgs) {
        //Send
        res.json(msgs);
      });
    });

    /*||||||||||||||||||END ROUTES|||||||||||||||||||||*/

io.on('connection', (socket) => {
    let email = socket.handshake.query.email;
    let currentUser = {
        id: socket.id,
        email: email
    };

    if (findIndex(users, currentUser.id) > -1) {
        console.log('[INFO] User ID is already connected, kicking.');
        socket.disconnect();
    } else if (!validEmail(currentUser.email)) {
        socket.disconnect();
    } else {
        console.log('[INFO] User ' + currentUser.email + ' connected!');
        sockets[currentUser.id] = socket;
        users.push(currentUser);
        .save(currentUser, function(error, docs) {
            res.send({error:error, user:docs});
        });
        io.emit('userJoin', {email: currentUser.email});
        console.log('[INFO] Total users: ' + users.length);
    }

    socket.on('ding', () => {
        socket.emit('dong');
    });

    socket.on('disconnect', () => {
        if (findIndex(users, currentUser.id) > -1) users.splice(findIndex(users, currentUser.id), 1);
        console.log('[INFO] User ' + currentUser.email + ' disconnected!');
        socket.broadcast.emit('userDisconnect', {email: currentUser.email});
    });

    socket.on('userChat', (data) => {
        let _email = sanitizeString(data.email);
        let _message = sanitizeString(data.message);
        let date = new Date();
        let time = ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2);

        console.log('[CHAT] [' + time + '] ' + _email + ': ' + _message);
        socket.broadcast.emit('serverSendUserChat', {email: _email, message: _message});
    });
});

server.listen(port, () => {
    console.log('[INFO] Listening on *:' + port);
});