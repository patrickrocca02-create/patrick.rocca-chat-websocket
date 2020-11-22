var socket; 

function onMessage(event) {
    var msg=JSON.parse(event.data);
    console.log(msg);
    switch(msg.type){
        case "system":
            switch(msg.task){
                case "groupCreation":
                    onGroupCreation(msg.group);
                    break;
                case "groupModification":
                    onGroupModification(msg.admin,msg.group);
                    break;
                case "groupElimination":
                    onGroupElimination(msg.admin, msg.groupName);
                    break;
                case "userStateChange":
                    onUserStateChange(msg.userName, msg.userState);
                    break;
                case "serverUsersList":
                    onServerUsers(msg.serverUsers);
                    break;
                case "userQuitGroup":
                    onUserQuitGroup(msg.userName, msg.groupName);
                    break;
                case "groupRemoval":
                    onGroupRemoval(msg.groupName, msg.admin);
                    break;
            }
            break;
        case "message":
            switch(msg.destType){
                case "user":
                    onUserMessage(msg.message);
                    break;
                case "group":
                    onGroupMessage(msg.destName, msg.message);
                    break;
            }
            break;
        case "error":
            onError(msg);
            break;
    }
    console.log("Resoconto:")
    console.log(Client.users);
    console.log(Client.groups);
    console.log(Client.serverUsers);
    console.log(" ");
    saveData();
}

//send messages of type user with destType user
function sendUserMessage(destName, message){
    onSendUserMessage(destName, message);
    serverMessage = {
        type : "message",
        destType : "user",
        destName : destName,
        message : message
    }
    socket.send(JSON.stringify(serverMessage));  
    
    console.log("Resoconto:")
    console.log(Client.users);
    console.log(Client.groups);
    console.log(Client.serverUsers);
    console.log(" ");
    saveData();
}
//send messages of type user with destType user
function sendGroupMessage(destName, message){
    onSendGroupMessage(destName, message);
    serverMessage = {
        type : "message",
        destType : "group",
        destName : destName,
        message : message
    }
    socket.send(JSON.stringify(serverMessage));  
    
    console.log("Resoconto:")
    console.log(Client.users);
    console.log(Client.groups);
    console.log(Client.serverUsers);
    console.log(" ");
    saveData();
}
//send messages of type system with task grupCreation
function sendNewGroup(group){
    onSendGroupCreation(group);
    let groupToSend = new Group(group.name, group.members, group.admins, group.creationDate, group.creationTime, group.creator);
    if(group.members.length > 0){
        delete groupToSend["messages"];
        delete groupToSend["active"];
        groupMessage = {
            type : "system",
            task : "groupCreation",
            group : groupToSend
        }
        socket.send(JSON.stringify(groupMessage));
    }else{
        //members error KUMARONE
    }
    
    console.log("Resoconto:")
    console.log(Client.users);
    console.log(Client.groups);
    console.log(Client.serverUsers);
    console.log(" ");
    saveData();
}
function sendGroupElimination(groupName){
    onSendGroupElimination(groupName);
    let msg = {
        type : "system",
        task : "groupElimination",
        groupName : groupName
    }
    socket.send(JSON.stringify(msg));

    
    console.log("Resoconto:")
    console.log(Client.users);
    console.log(Client.groups);
    console.log(Client.serverUsers);
    console.log(" ");
    saveData();
}
function sendGroupQuit(groupName){
    onSendGroupQuit(groupName);
    let msg = {
        type:"system",
        task:"groupQuit",
        groupName:groupName
    }
    socket.send(JSON.stringify(msg));
    saveData();
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
    saveData();
}
//send messages of type system with task userDisconnection
function onDisconnection(event){
    let msg = {
        type : "system",
        task : "userDisconnection",
        userName : Client.userName
    }
    socket.send(JSON.stringify(msg));
    saveData();
}

function saveData(){
    let userData = {
        users : Client.users,
        groups : Client.groups,
        serverUsers : Client.serverUsers
    }
    window.localStorage.setItem(Client.userName, JSON.stringify(userData));
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
    onSendGroupModification(groupName, newGroupSettings);
    msg.newGroupSettings = newGroupSettings;
    socket.send(JSON.stringify(msg));

    
    console.log("Resoconto:")
    console.log(Client.users);
    console.log(Client.groups);
    console.log(Client.serverUsers);
    console.log(" ");
    saveData();
}

function sendImage(){
    let msg = {
        type : "message"
    };
    //scelta file
    let img = null;
    let input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";
    input.multiple = true;
    input.click();
    let reader = FileReader();
    reader.onload = function(res){
        let imgStr = res.target.result;
    };
    input.onchange = function(event){
        let file = event.target.files[0];
        reader.readAsDataURL(file);
    }
    //poi metto imgStr come src dell'immagine dei client
}

function start(){
    Client.userName = window.prompt("Inserire il proprio nome utente", "nome utente...");
    socket = new WebSocket("ws://localhost:8081/ChatWebSocket/demows/" + Client.userName + "");
    socket.onmessage = onMessage;
    if(window.localStorage.getItem(Client.userName) != null){
        let data = JSON.parse(window.localStorage.getItem(Client.userName));
        Client.users = data.users;
        Client.groups = data.groups;
        Client.serverUsers = data.serverUsers;
    }
}

start();