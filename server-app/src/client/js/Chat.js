import io from 'socket.io-client';
import { sanitizeString } from '../../shared/util';
let IP = '127.0.0.1';
// let IP = '192.168.0.100';
//let IP='45.55.79.74';
let PORT = '3000';
export default class Chat {
    constructor(email) {
        this.chatInput = document.getElementById('chatInput');
        this.chatList = document.getElementById('chatList');
        this.email = email;
        this.socket = io('http://' + IP + ':' + PORT);
        this.socket.emit('init', email);
        this.commands = {};

        this.setupSocket();
        this.setupChat();
        this.setupEvents();
    }
    setupSocket() {

        this.socket.on('dong', () => {
            this.latency = Date.now() - this.startPingTime;
            this.addSystemLine('Ping: ' + this.latency + 'ms');
        });

        this.socket.on('connect_failed', () => {
            this.socket.close();
        });

        this.socket.on('disconnect', () => {
            this.socket.close();
        });
        this.socket.on('notification', function(data) {
            let newline = document.createElement('li');
            newline.className = (false) ? 'me' : 'friend';
            newline.innerHTML = '<b>' + ((data.from.length < 1) ? 'Anon' : data.from) + '</b>: ' + data.message;
            console.log(newline);
            this.chatList = document.getElementById('chatList');
            if (this.chatList.childNodes.length > 10) {
                this.chatList.removeChild(this.chatList.childNodes[0]);
            }
            this.chatList.appendChild(newline);

        });
    }

    setupChat() {
        this.registerCommand('ping', 'Check your latency.', () => {
            this.checkLatency();
        });

        this.registerCommand('help', 'Information about the chat commands.', () => {
            this.printHelp();
        });

        this.addSystemLine('Connected to the chat!');
        this.addSystemLine('Type <b>/help</b> for a list of commands.');
    }

    setupEvents() {
        this.chatInput.addEventListener('keypress', (key) => {
            key = key.which || key.keyCode;
            if (key === 13) {
                this.sendChat(sanitizeString(this.chatInput.value));
                this.chatInput.value = '';
            }
        });

        this.chatInput.addEventListener('keyup', (key) => {
            key = key.which || key.keyCode;
            if (key === 27) {
                this.chatInput.value = '';
            }
        });
    }

    sendChat(text) {
        if (text) {
            if (text.indexOf('/') === 0) {
                let args = text.substring(1).split(' ');

                if (this.commands[args[0]]) {
                    this.commands[args[0]].callback(args.slice(1));
                } else {
                    this.addSystemLine('Unrecognized Command: ' + text + ', type /help for more info.');
                }

            } else {
                this.socket.emit('notification', { to: 'pek', message: text });
                this.addChatLine(this.email, text, true);
            }
        }
    }

    addChatLine(name, message, me) {
        let newline = document.createElement('li');

        newline.className = (me) ? 'me' : 'friend';
        newline.innerHTML = '<b>' + ((name.length < 1) ? 'Anon' : name) + '</b>: ' + message;

        this.appendMessage(newline);
    }

    addSystemLine(message) {
        let newline = document.createElement('li');

        newline.className = 'system';
        newline.innerHTML = message;

        this.appendMessage(newline);
    }

    appendMessage(node) {
        if (this.chatList.childNodes.length > 10) {
            this.chatList.removeChild(this.chatList.childNodes[0]);
        }
        this.chatList.appendChild(node);
    };

    registerCommand(name, description, callback) {
        this.commands[name] = {
            description: description,
            callback: callback
        };
    };

    printHelp() {
        for (let cmd in this.commands) {
            if (this.commands.hasOwnProperty(cmd)) {
                this.addSystemLine('/' + cmd + ': ' + this.commands[cmd].description);
            }
        }
    };

    checkLatency() {
        this.startPingTime = Date.now();
        this.socket.emit('ding');
    }
}