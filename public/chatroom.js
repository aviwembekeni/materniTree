const socket = io.connect();

let usernameElem = document.querySelector('.username');
let usersElem = document.querySelector('.users');
let messages = document.querySelector('.messages');
let chatBtn = document.querySelector('.chatBtn');
let chatMessage = document.querySelector('.chatMessage');
let currentUsername;

// login as a dashboard
socket.emit('dashboard');

socket.on('chat-log', function (chatLog) {
    messages.innerHTML = '';
    let logList = chatLog.map(function (chat) {
        return '<li>' + chat + '</li>';
    });
    messages.innerHTML = logList;
});

socket.on('msg', function (msg) {
    if (msg.username === currentUsername) {
        messages.innerHTML += '<li>' + msg.message + '</li>';
    }
});

socket.on('new-user', function (username) {
    usersElem.innerHTML += `<li onclick="chatWith('${username}')">${username}</li>`;
});

function chatWith (username) {
    currentUsername = username;
    usernameElem.innerHTML = username;
    socket.emit('get-chat-log', {
        username
    });
}

chatBtn.addEventListener('click', function () {
    let message = 'Admin: ' + chatMessage.value;

    socket.emit('chat-to', {
        username: currentUsername,
        message
    });
});
