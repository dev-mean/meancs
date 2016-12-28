'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _util = require('../shared/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IP = '45.55.79.74';
var PORT = '3000';
//import chatServer from './js/chat-server';

// import {DatabaseProvider} from './js/DatabaseProvider';
// import {UserProvider} from './js/UserProvider';

//import db from './js/chat-db';
/**
 * Configure the user provider (mongodB connection for user data storage)
 */
// let databaseProvider = new DatabaseProvider();
// let userProvider = new UserProvider(databaseProvider);


var app = (0, _express2.default)();
// let users = [];
// let sockets = {};


//app.use(app.router);
app.use((0, _compression2.default)({}));
app.use(_express2.default['static'](__dirname + '/admin'));
var server = _http2.default.createServer(app).listen(PORT, IP);

var io = new _socket2.default(server);
//chatServer.listen(server);
// allow CORS
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});

var users = [];
var sockets = [];
var alreadyConnectedUserList = [];
var currentSocket = {};
io.on('connection', function (socket) {
    // Register your client with the server, providing your username
    socket.on('init', function (username) {
        console.log('init : ' + username);

        var IsNewUser = true;
        var user = {};
        if (alreadyConnectedUserList.length) {
            for (var i = 0; i < alreadyConnectedUserList.length; i++) {
                console.log(username + ' : ' + alreadyConnectedUserList[i]);
                if (username === 'pek') if (alreadyConnectedUserList[i] === username) {
                    IsNewUser = false;
                    break;
                }
            }
        }
        if (IsNewUser) {

            socket.emit('connectedUsersList', alreadyConnectedUserList);
            alreadyConnectedUserList.push(username);
            console.log('alreadyConnectedUserList:' + alreadyConnectedUserList.length);
            users[username] = socket.id; // Store a reference to your socket ID
            sockets[socket.id] = {
                username: username,
                socket: socket
            };
            console.log('sockets:' + sockets);
            // Store a reference to your socket
            //we will send current user that who all are already connected in chat
            //send to all users that a new user is connected
            for (currentSocket in sockets) {
                if (currentSocket == socket.id) return false;
                sockets[currentSocket].socket.emit('userJoined', {
                    username: username
                });
            };
        }

        //send all users list to newly connected user
    });
    socket.on('notification', function (obj) {
        console.log(obj);
        if (!users[obj.to]) {
            console.log("user " + obj.to + " dosent exist");
            return false;
        }
        // Lookup the socket of the user you want to private message, and send them your message
        try {
            sockets[users[obj.to]].socket.emit('notification', {
                message: obj.message,
                from: sockets[socket.id].username
            });
        } catch (e) {
            console.error("Error when sending data: " + e);
        }
    });
    socket.on('disconnect', function () {
        var disconnectedUsername = null;
        for (currentSocket in sockets) {
            if (currentSocket == socket.id) {
                disconnectedUsername = sockets[currentSocket].username;
                delete users[sockets[currentSocket].username];
                alreadyConnectedUserList.splice(alreadyConnectedUserList.indexOf(sockets[currentSocket].username), 1);
                delete sockets[currentSocket];
            }
        }
        if (disconnectedUsername) {
            for (currentSocket in sockets) {
                sockets[currentSocket].socket.emit('userDisconnected', {
                    username: disconnectedUsername
                });
            }
        }
    });
});

server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

// io.on('connection', function(socket) {
//     // Register your client with the server, providing your username
//     socket.on('init', function(username) {
//         if (alreadyConnectedUserList.length) {
//             socket.emit('connectedUsersList', alreadyConnectedUserList);
//         }
//         alreadyConnectedUserList.push(username)
//         users[username] = socket.id; // Store a reference to your socket ID
//         sockets[socket.id] = {
//             username: username,
//             socket: socket
//         }; // Store a reference to your socket
//         //we will send current user that who all are already connected in chat
//         //send to all users that a new user is connected
//         for (currentSocket in sockets) {
//             if (currentSocket == socket.id) return false;
//             sockets[currentSocket].socket.emit('userJoined', {
//                 username: username
//             });
//         };
//         //send all users list to newly connected user
//     });
//     socket.on('notification', function(obj) {
//         console.log(obj);
//         if (!users[obj.to]) {
//             console.log("user " + obj.to + " dosent exist");
//             return false;
//         }
//         // Lookup the socket of the user you want to private message, and send them your message
//         try {
//             sockets[users[obj.to]].socket.emit('notification', {
//                 message: obj.message,
//                 from: sockets[socket.id].username
//             });
//         } catch (e) {
//             console.error("Error when sending data: " + e);
//         }
//     });
//     socket.on('disconnect', function() {
//         var disconnectedUsername = null;
//         for (currentSocket in sockets) {
//             if (currentSocket == socket.id) {
//                 disconnectedUsername = sockets[currentSocket].username;
//                 delete users[sockets[currentSocket].username];
//                 alreadyConnectedUserList.splice(alreadyConnectedUserList.indexOf(sockets[currentSocket].username), 1);
//                 delete sockets[currentSocket];
//             }
//         }
//         if (disconnectedUsername) {
//             for (currentSocket in sockets) {
//                 sockets[currentSocket].socket.emit('userDisconnected', {
//                     username: disconnectedUsername
//                 });
//             }
//         }
//     });
// });