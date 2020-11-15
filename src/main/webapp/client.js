var socket; 

function onMessage(event) {
    var msg=JSON.parse(event.data);
    console.log(msg);
    /*
    if(msg.type == "system"){
        switch(msg.task){
            case "groupCreation" :
                onGroupCreation(msg);
            case "userStateChange":
                break;
        }
    }else{
        Client.addMessage(msg);
    }*/
    console.log("Resoconto:")
    console.log(Client.users);
    console.log(Client.groups);
    console.log(" ");
}

//send messages of type user with destType user
function sendUserMessage(message, destName){
    serverMessage = {
        type : "message",
        destType : "user",
        destName : destName,
        message : message
    }
    console.log(serverMessage);
    socket.send(JSON.stringify(serverMessage));  
}
//send messages of type user with destType user
function sendGroupMessage(message, destName){
    serverMessage = {
        type : "message",
        destType : "group",
        destName : destName,
        message : message
    }
    console.log(serverMessage);
    socket.send(JSON.stringify(serverMessage));  
}
//send messages of type system with task grupCreation
function sendNewGroup(group){
    if(group.members.length > 0){
        delete group["messages"];
        groupMessage = {
            type : "system",
            task : "groupCreation",
            group : group
        }
        console.log(groupMessage);
        socket.send(JSON.stringify(groupMessage));
    }else{
        //members error
    }
}
//send messages of type system with task userConnection
function onConnection(event){
    Client.userName = window.prompt("Inserire il proprio nome utente", "nome utente...")
    let msg = {
        type : "system",
        task : "userConnection",
        userName : Client.userName
    }
    socket.send(JSON.stringify(msg));
}
//send messages of type system with task userDisconnection
function onDisconnection(event){
    let msg = {
        type : "system",
        task : "userDisconnection",
        userName : Client.userName
    }
    socket.send(JSON.stringify(msg));
}

function sendGroupModification(groupName, addMembers, removeMembers,addAdmins,removeAdmins){
    let msg = {
        type : "system",
        task : "groupModification",
        groupName : groupName
    }
    let newGroupSettings = {
        addMembers : addMembers, 
        removeMembers : removeMembers,
        addAdmins : addAdmins,
        removeAdmins : removeAdmins
    }
    msg.newGroupSettings = newGroupSettings;
    socket.send(JSON.stringify(msg));
}

function onClose(){

}


function start(){
    Client.userName = window.prompt("Inserire il proprio nome utente", "nome utente...");
    socket = new WebSocket("ws://localhost:8080/ChatWebSocket/demows/" + Client.userName + "");
    socket.onmessage = onMessage;
    console.log(socket);
}

start();