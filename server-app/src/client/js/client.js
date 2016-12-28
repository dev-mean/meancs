
"use strict";

import Chat from './Chat';
import {validEmail} from '../../shared/util'

class Client {
    constructor () {
        let btn = document.getElementById('startButton'),
            userNameInput = document.getElementById('userNameInput');
        
        btn.onclick = () => {
            this.startChat(userNameInput.value);
        };

        userNameInput.addEventListener('keypress', (e) => {
            let key = e.which || e.keyCode;

            if (key === 13) {
                this.startChat(userNameInput.value);
            }
        });
    }

    startChat(email) {
        let emailErrorText = document.querySelector('#startMenu .input-error');

        if (validEmail(email)) {
            emailErrorText.style.opacity = 0;
            this.email = email;
        } else {
            emailErrorText.style.opacity = 1;
            return false;
        }

        this.chat = new Chat(this.email);

        document.getElementById('startMenu').style.display = 'none';
        document.getElementById('chatbox').style.display = 'block';
    }
}

window.onload = () => {
    new Client();
};
