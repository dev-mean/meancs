import db from './chat-db';
import {validEmail, findIndex, sanitizeString} from '../../shared/util';
import SocketIO from 'socket.io';
let io;
// maps socket.id to user's email
var emails = {};
// list of socket ids
var clients = [];
var emailsUsed = [];

let users = [];
let sockets = {};

exports.listen = function(server){
  io = SocketIO.listen(server);
  io.set('log level', 2);
  io.sockets.on('connection', function(socket){
    initializeConnection(socket);
    //handleChoosingEmails(socket);
    //handleClientDisconnections(socket);
    //handleMessageBroadcasting(socket);
    //handlePrivateMessaging(socket);
  });
}

function initializeConnection(socket){
    let email = socket.handshake.query.email;
    let currentUser = {
        id: socket.id,
        email: email
    };
    console.log('[INFO] User ' + currentUser.email + ' connected!');
    sockets[currentUser.id] = socket;
    io.emit('userJoin', {email: currentUser.email});
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
        socket.emit('serverSendUserChat', {email: _email, message: _message});
    });

    socket.on('private message', function(data){
      var from = emails[socket.id];
      clients[data.userToPM].emit('private message', {from: from, message: data.message});
    });
}

function showActiveUsers(socket){
  var activeNames = [];
  var usersInRoom = io.sockets.clients();
  for (var index in usersInRoom){
    var userSocketId = usersInRoom[index].id;
    if (userSocketId !== socket.id && emails[userSocketId]){
      var name = emails[userSocketId];
      activeNames.push({id: emailsUsed.indexOf(name), mail: name});
    }
  }
  socket.emit('names', activeNames);
}

function showOldMsgs(socket){
  db.getOldMsgs(5, function(err, docs){
    socket.emit('load old messages', docs);
  });
}

function handleChoosingEmails(socket){
  socket.on('choose email', function(mail, cb) {
    if (emailsUsed.indexOf(mail) !== -1) {
      cb('That name is already taken!  Please choose another one.');
      return;
    }
    var ind = emailsUsed.push(mail) - 1;
    clients[ind] = socket;
    emails[socket.id] = mail;
    cb(null);
    io.sockets.emit('new user', {id: ind, mail: mail});
  });
}

function handleMessageBroadcasting(socket){
  socket.on('message', function(message){
    var mail = emails[socket.id];
    db.saveMsg({mail: mail, message: message}, function(err){
      if(err) throw err;
      io.sockets.emit('message', {mail: mail, message: message});
    });
  });
}

function handlePrivateMessaging(socket){
  socket.on('private message', function(data){
    var from = emails[socket.id];
    clients[data.userToPM].emit('private message', {from: from, message: data.message});
  });
}

function handleClientDisconnections(socket){
  socket.on('disconnect', function(){
    var ind = emailsUsed.indexOf(emails[socket.id]);
    delete emailsUsed[ind];
    delete clients[ind];
    delete emails[socket.id];
    io.sockets.emit('user disconnect', ind);
  });
}

    // userProvider.getByEmail(currentUser.email,function(error, getByEmailDocs) 
    //     {
    //         if (error) {
    //             console.log(error);
    //             socket.disconnect();
    //         }
    //         else
    //         {
    //             console.log(getByEmailDocs);
    //             if(getByEmailDocs===null)
    //                 if (!validEmail(currentUser.email)) 
    //                     {
    //                         socket.disconnect();
    //                     } 
    //                 else 
    //                     {
    //                         console.log('[INFO] User ' + currentUser.email + ' connected!');
    //                         sockets[currentUser.id] = socket;
    //                         userProvider.save(currentUser, function(error, currentUserDocs) 
    //                             {
    //                                 if (error)
    //                                     {
    //                                         console.log(error);
    //                                         socket.disconnect();
    //                                     }
    //                                 else
    //                                     {
    //                                         console.log(currentUserDocs);
    //                                         io.emit('userJoin', {email: currentUser.email});
    //                                         userProvider.totalCount(function(error, totalCountDocs) 
    //                                             {
    //                                                 if (error)
    //                                                     console.log(error);
    //                                                 else
    //                                                     console.log('[INFO] Total users: ' + totalCountDocs);
    //                                             });
    //                                     }
    //                             });
    //                     }
    //             else
    //                 {
    //                     console.log(getByEmailDocs);
    //                     console.log('[INFO] User ID is already connected, kicking.');
    //                     socket.disconnect();
    //                 }
    //         }
    //     });
