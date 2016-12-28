'use strict';

var _chatDb = require('./chat-db');

var _chatDb2 = _interopRequireDefault(_chatDb);

var _util = require('../../shared/util');

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var io = void 0;
// maps socket.id to user's email
var emails = {};
// list of socket ids
var clients = [];
var emailsUsed = [];

var users = [];
var sockets = {};

exports.listen = function (server) {
  io = _socket2.default.listen(server);
  io.set('log level', 2);
  io.sockets.on('connection', function (socket) {
    initializeConnection(socket);
    //handleChoosingEmails(socket);
    //handleClientDisconnections(socket);
    //handleMessageBroadcasting(socket);
    //handlePrivateMessaging(socket);
  });
};

function initializeConnection(socket) {
  var email = socket.handshake.query.email;
  var currentUser = {
    id: socket.id,
    email: email
  };
  console.log('[INFO] User ' + currentUser.email + ' connected!');
  sockets[currentUser.id] = socket;
  io.emit('userJoin', { email: currentUser.email });
  socket.on('ding', function () {
    socket.emit('dong');
  });

  socket.on('disconnect', function () {
    if ((0, _util.findIndex)(users, currentUser.id) > -1) users.splice((0, _util.findIndex)(users, currentUser.id), 1);
    console.log('[INFO] User ' + currentUser.email + ' disconnected!');
    socket.broadcast.emit('userDisconnect', { email: currentUser.email });
  });

  socket.on('userChat', function (data) {
    var _email = (0, _util.sanitizeString)(data.email);
    var _message = (0, _util.sanitizeString)(data.message);
    var date = new Date();
    var time = ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2);

    console.log('[CHAT] [' + time + '] ' + _email + ': ' + _message);
    socket.emit('serverSendUserChat', { email: _email, message: _message });
  });

  socket.on('private message', function (data) {
    var from = emails[socket.id];
    clients[data.userToPM].emit('private message', { from: from, message: data.message });
  });
}

function showActiveUsers(socket) {
  var activeNames = [];
  var usersInRoom = io.sockets.clients();
  for (var index in usersInRoom) {
    var userSocketId = usersInRoom[index].id;
    if (userSocketId !== socket.id && emails[userSocketId]) {
      var name = emails[userSocketId];
      activeNames.push({ id: emailsUsed.indexOf(name), mail: name });
    }
  }
  socket.emit('names', activeNames);
}

function showOldMsgs(socket) {
  _chatDb2.default.getOldMsgs(5, function (err, docs) {
    socket.emit('load old messages', docs);
  });
}

function handleChoosingEmails(socket) {
  socket.on('choose email', function (mail, cb) {
    if (emailsUsed.indexOf(mail) !== -1) {
      cb('That name is already taken!  Please choose another one.');
      return;
    }
    var ind = emailsUsed.push(mail) - 1;
    clients[ind] = socket;
    emails[socket.id] = mail;
    cb(null);
    io.sockets.emit('new user', { id: ind, mail: mail });
  });
}

function handleMessageBroadcasting(socket) {
  socket.on('message', function (message) {
    var mail = emails[socket.id];
    _chatDb2.default.saveMsg({ mail: mail, message: message }, function (err) {
      if (err) throw err;
      io.sockets.emit('message', { mail: mail, message: message });
    });
  });
}

function handlePrivateMessaging(socket) {
  socket.on('private message', function (data) {
    var from = emails[socket.id];
    clients[data.userToPM].emit('private message', { from: from, message: data.message });
  });
}

function handleClientDisconnections(socket) {
  socket.on('disconnect', function () {
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