var socket = new WebSocket("ws://localhost:8080/ChatWebSocket/demowss");

socket.onopen = onConnection;
socket.onmessage = onMessage;
socket.onclose = onClose;

function onMessage(event) {
    var msg=JSON.parse(event.data);
    console.log(msg);
    if(msg.type == "system"){
        switch(msg.task){
            case "groupCreation" :
                onGroupCreation(msg);
            case "userStateChange":
                break;
        }
    }else{
        Client.addMessage(msg);
    }
    console.log(Client.users);
    console.log(Client.groups);
}

//send messages of type user with destType user
function sendUserMessage(message){
    serverMessage = {
        type : "message",
        destType : "user",
        message : message
    }
    socket.send(JSON.stringify(serverMessage));  
}
//send messages of type user with destType user
function sendGroupMessage(message){
    serverMessage = {
        type : "message",
        destType : "group",
        message : message
    }
    socket.send(JSON.stringify(serverMessage));  
}
//send messages of type system with task grupCreation
function sendNewGroup(group){
    groupMessage = {
        type : "system",
        task : "groupCreation",
        group : group
    }
    socket.send(JSON.stringify(groupMessage));
}
//send messages of type system with task userConnection
function onConnection(event){
    Client.userName = window.prompt("Inserire il proprio nome utente", "nome utente...")
    var msg = {
        type : "system",
        task : "userConnection",
        userName : Client.userName
    }
    socket.send(JSON.stringify(msg));
}
//send messages of type system with task userDisconnection
function onDisconnection(event){
    var msg = {
        type : "system",
        task : "userDisconnection",
        userName : Client.userName
    }
    socket.send(JSON.stringify(msg));
}

function onClose(){

}
