'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _socket = require('socket.io');

var _socket2 = _interopRequireDefault(_socket);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _DatabaseProvider = require('./js/DatabaseProvider');

var _UserProvider = require('./js/UserProvider');

var _util = require('../shared/util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Configure the user provider (mongodB connection for user data storage)
 */
var databaseProvider = new _DatabaseProvider.DatabaseProvider();
var userProvider = new _UserProvider.UserProvider(databaseProvider);

var app = (0, _express2.default)();
var server = _http2.default.Server(app);
var io = new _socket2.default(server);
var port = 3000; //process.env.PORT || 
var users = [];
var sockets = {};

app.use((0, _compression2.default)({}));
app.use(_express2.default['static'](__dirname + '/../extension/lib'));
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
/*||||||||||||||||||||||ROUTES|||||||||||||||||||||||||*/

/*||||||||||||||||||END ROUTES|||||||||||||||||||||*/

io.on('connection', function (socket) {
    var email = socket.handshake.query.email;
    var currentUser = {
        id: socket.id,
        email: email
    };

    userProvider.getByEmail(currentUser.email, function (error, getByEmailDocs) {
        if (error) {
            console.log(error);
            socket.disconnect();
        } else {
            console.log(getByEmailDocs);
            if (getByEmailDocs === null) {
                if (!(0, _util.validEmail)(currentUser.email)) {
                    socket.disconnect();
                } else {
                    console.log('[INFO] User ' + currentUser.email + ' connected!');
                    sockets[currentUser.id] = socket;
                    userProvider.save(currentUser, function (error, currentUserDocs) {
                        if (error) {
                            console.log(error);
                            socket.disconnect();
                        } else {
                            console.log(currentUserDocs);
                            io.emit('userJoin', { email: currentUser.email });
                            userProvider.totalCount(function (error, totalCountDocs) {
                                if (error) console.log(error);else console.log('[INFO] Total users: ' + totalCountDocs);
                            });
                        }
                    });
                }
            } else {
                console.log(getByEmailDocs);
                console.log('[INFO] User ID is already connected, kicking.');
                socket.disconnect();
            }
        }
    });

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
        socket.broadcast.emit('serverSendUserChat', { email: _email, message: _message });
    });
});

server.listen(port, function () {
    console.log('[INFO] Listening on *:' + port);
});