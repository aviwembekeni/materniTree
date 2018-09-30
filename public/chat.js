const socket = io.connect();

let loginBtn = document.querySelector(".loginBtn");
let chatBtn = document.querySelector(".chatBtn");
let chatMessage = document.querySelector(".chatMessage");
let loginSection = document.querySelector(".loginSection");
let usernameElem = document.querySelector(".username");
let messages = document.querySelector(".messages");

let username;

socket.on("msg", function(msg) {
  messages.innerHTML += "<li>" + msg + "</li>";
});

socket.on("login-response", function(chatLog) {
  messages.innerHTML = "";
  let logList = chatLog.map(function(chat) {
    return "<li>" + chat + "</li>";
  });
  messages.innerHTML = logList;
});

function login(data) {
  socket.emit("login", data);
}

function chat(msg) {
  socket.emit("chat", username + ":" + msg);
}

(function() {
  if (usernameElem.innerHTML.trim().length === 0) {
    return;
  }
  username = usernameElem.innerHTML;
  console.log("username", username);

  login({
    username
  });
})();

chatBtn.addEventListener("click", function() {
  if (chatMessage && chatMessage.value.trim().length > 0) {
    chat(chatMessage.value);
    chatMessage.value = "";
  }
});
