# README #

### What is this repository for? ###

* This repo for live chat extension of chrome & dependent server & admin apps
* The version of this repo is currently 1.0.0

### How do I get set up? ###
* Dependencies
* 1.NodeJs
* 2.MongoDb


* There are 3 apps: 1.admin-app,2.server-app,3.extension-app(client-app)
* Configuration
* Need to setup all these apps is follwing:

* 1.get clone https://github.com/impekable/chat-poc-jc
* 2.cd chat-poc-jc
* 3.There are 3 projects itself with this root directory

* A) server-app
* B) extension
* C) admin-app

### Configuration for A) server-app ###
* cd server-app
* npm i -g gulp
* npm i
* gulp build (For making complete build)
* The ./server has server-app which can be run by npm start/node ./server/server
* The server started on port 3000
* The Extension code goes automatically updated for the chat


### Configuration for B) Extension ###
* open chrome & browse chrome://extensions/
* Check on "Developer mode"
* Click on Load unpacked extension… & browse chat-poc-jc/extension & select
* The Extension loaded with it's info under extensions of chrome 
* open any http based web site & then you can found the live chat movable icon
* double click on the chat icon & put your credential there & start chat.
* You can see the list of your contacts there & you just need to click any of those contact & start chat by typing your comments & hit the enter button to send message.

### Configuration for C) admin-app ###
* There is a admin-app directory where the admin app for this chat system
* cd admin-app
* npm i -g ionic cordova
* npm i -g gulp (If you already do that before for server-app then no need to repeat here)
* ionic state rest
* ionic serve -lcs

# Note : For both B & C, You must need to start A