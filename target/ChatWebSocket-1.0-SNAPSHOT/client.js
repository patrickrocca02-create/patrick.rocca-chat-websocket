var socket = new WebSocket("ws://localhost:8080/ChatWebSocket/demows");
socket.onmessage=onMessage;

function onMessage(event) {
    var msg=JSON.parse(event.data);
    if(msg.type == "system"){
        switch(msg.task){
            case "groupCreation" :
                msg.groups.forEach(g => {
                    Client.addGroup(new Group(g.name, g.members));
                });
                break;
            case "userConnection":
        }
    }else{
        Client.addMessage(msg);
    }
    console.log(Client.users);
    console.log(Client.groups);
}
function inviaMsg()
{
    var msg = document.getElementById("msg").value;
    alert(msg);
    var msgObj = {
        type:'user',
        msg:msg
    }
    socket.send(JSON.stringify(msgObj));  
}
function sendNewGroup(group){
    var msg;
    msg.type = "system";
    msg.task = "groupCreation";
    msg.groupName = group.name;
    msg.groupMemebers = group.members;
    socket.send(JSON.stringify(msg));
}
function onConnection(){
    var msg;
    msg.type = "system";
    msg.task = "userConnection";
    msg.userName = Client.userName;
    socket.send(JSON.stringify(msg));
}
