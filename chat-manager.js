module.exports = function Chats () {
    // a chat history per user
    let userChats = {

    };

    // mapping users to socketIds
    let userChatSockets = {

    };

    // mapping users to socketIds
    let usernameToSocketId = {

    };

    function login (socketId, userData) {
        const username = userData.username;
        if (userChats[username] === undefined) {
            userChats[username] = {
                chatLog: []
            };
        }
        let userChatData = userChats[username];
        userChatData.lastActive = new Date();
        // userChatSockets[socketId] = username;
        setUserSocket(socketId, username);
    }

    function logMessage (socketId, msg) {
        let username = userChatSockets[socketId];
        let userChatData = userChats[username];
        if (userChatData !== undefined) {
            userChatData.chatLog.push(msg);
        }
    }

    function chatLog (socketId) {
        let username = userChatSockets[socketId];
        return chatLogForUserName(username);
    }

    function chatLogForUserName (username) {
        let userChatData = userChats[username];
        if (userChatData !== undefined) {
            return userChatData.chatLog;
        }
        return [];
    }

    function setUserSocket (socketId, username) {
        userChatSockets[socketId] = username;
        usernameToSocketId[username] = socketId;
    }

    function getUserName (socketId) {
        return userChatSockets[socketId];
    }

    function getSocketId (username) {
        return usernameToSocketId[username];
    }

    function chatList () {
        return userChats;
    }

    return {
        chatList,
        login,
        logMessage,
        chatLog,
        getUserName,
        getSocketId,
        chatLogForUserName
    };
};
