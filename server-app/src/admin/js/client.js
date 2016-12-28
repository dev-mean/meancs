import io from 'socket.io-client';
var IP='45.55.79.74';
var  PORT='3000';
var socket = io('http://'+IP+':'+PORT);
class Client {
    constructor () {
        let btnSend = document.getElementById('sendButton'),
        userNameInput = document.getElementById('userNameInput');
    btnSend.onclick = () => {
            this.sendMessage();
    };
    console.log('init');
    socket.emit('init', 'pek');
    }
sendMessage(){
    var toUsername = $("select.toUserSelectBox").val();
    var message = $("#chatInput").val();
    if (!toUsername || !toUsername.trim().length || !message.trim().length) {
        alert("Enter valid username & message");
        return false;
    }
    $("div.message").append("<p class='sent'>Me: <b>" + message + "</b> - " + toUsername + "</p>").scrollTop($("div.message")[0].scrollHeight);
    socket.emit('notification', {
        to: toUsername,
        message: message
    });
    $("#chatInput").val("").focus();
}
}

window.onload = () => {
    new Client();
    
    socket.on('notification', function(data) {
        $("div.message").append("<p class='received'>" + data.from + ": <b>" + data.message + "</b></p>").scrollTop($("div.message")[0].scrollHeight);
        console.error(data);
    });
    socket.on('userDisconnected', function(userObj) {
        console.error(userObj);
        $("div.message").append("<p> User Disconnected: <b>" + userObj.username + "</b></p>").scrollTop($("div.message")[0].scrollHeight);;
        $(".toUserSelectBox option[value='" + userObj.username + "']").remove();
    });
    socket.on('userJoined', function(data) {
        console.error(data);
        $("div.message").append("<p> New User Joined: <b>" + data.username + "</b></p>").scrollTop($("div.message")[0].scrollHeight);;
        $('.toUserSelectBox').append($('<option/>', {
            value: data.username,
            text: data.username
        }));
    });
    socket.on('connectedUsersList', function(alreadyConnectedUserList) {
        console.log(alreadyConnectedUserList);
        alreadyConnectedUserList.forEach(function(username) {
            $('.toUserSelectBox').append($('<option/>', {
                value: username,
                text: username
            }));
        });
    });
};
