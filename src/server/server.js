'use strict';

import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import compression from 'compression';
import mongoose from 'mongoose';
import {DatabaseProvider} from './js/DatabaseProvider';
import {UserProvider} from './js/UserProvider';
import {validEmail, findIndex, sanitizeString} from '../shared/util';


/**
 * Configure the user provider (mongodB connection for user data storage)
 */
let databaseProvider = new DatabaseProvider();
let userProvider = new UserProvider(databaseProvider);


let app = express();
let server = http.Server(app);
let io = new SocketIO(server);
let port = 3000;//process.env.PORT || 
let users = [];
let sockets = {};


app.use(compression({}));
app.use(express['static'](__dirname + '/../client'));
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

/*||||||||||||||||||END ROUTES|||||||||||||||||||||*/

io.on('connection', (socket) => {
    let email = socket.handshake.query.email;
    let currentUser = {
        id: socket.id,
        email: email
    };
    
    userProvider.getByEmail(currentUser.email,function(error, getByEmailDocs) 
        {
            if (error) {
                console.log(error);
                socket.disconnect();
            }
            else
            {
                console.log(getByEmailDocs);
                if(getByEmailDocs===null)
                    if (!validEmail(currentUser.email)) 
                        {
                            socket.disconnect();
                        } 
                    else 
                        {
                            console.log('[INFO] User ' + currentUser.email + ' connected!');
                            sockets[currentUser.id] = socket;
                            userProvider.save(currentUser, function(error, currentUserDocs) 
                                {
                                    if (error)
                                        {
                                            console.log(error);
                                            socket.disconnect();
                                        }
                                    else
                                        {
                                            console.log(currentUserDocs);
                                            io.emit('userJoin', {email: currentUser.email});
                                            userProvider.totalCount(function(error, totalCountDocs) 
                                                {
                                                    if (error)
                                                        console.log(error);
                                                    else
                                                        console.log('[INFO] Total users: ' + totalCountDocs);
                                                });
                                        }
                                });
                        }
                else
                    {
                        console.log(getByEmailDocs);
                        console.log('[INFO] User ID is already connected, kicking.');
                        socket.disconnect();
                    }
            }
        });

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