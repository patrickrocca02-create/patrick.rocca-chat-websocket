//group creation
var usersSelection = [];
var selectedUsers = [];
var inputMember;
var memebersList; 
var admins = [];

function initAutoComplete(){
    usersSelection = Client.getServerUsersNames();
    selectedUsers = [];
    admins = [];
    inputMember = document.getElementById("addMember");
    memebersList = document.getElementById("listOfNewMembers");
    autocomplete(document.getElementById("newUserName"), Client.getServerUsersNames());
    autocomplete(inputMember, usersSelection);
}
function addMemberGroupCreation(){
    let name = inputMember.value;
    let imgPath;
    if(Client.getOnline(name)){
        imgPath = onlineImagePath;
    }else{
        imgPath = offlineImagePath;
    }
    if(usersSelection.includes(name)){
        let str = `
            <div class="memberContainer" id="member-` + name + `">
                <div class="imgMember"> <img src="` + imgPath + `" alt="sunil"> </div>
                <div class="memberName">` + name + `</div>
                <div class="memberButtons">
                    <button onclick="addAdminGroupCreation('` + name + `')">Amministratore</button>
                    <button onclick="removeMemberGroupCreation('` + name + `')">Rimuovi</button>
                </div>
            </div>
        `;
        memebersList.innerHTML += str;
        selectedUsers.push(name);
        usersSelection = usersSelection.filter(e => e != name);
        autocomplete(inputMember, usersSelection);
    }
}
function addAdminGroupCreation(name){
    let btn = event.srcElement;
    if(btn.className != "active"){
        btn.className += "active";
        admins.push(name);
    }else{
        btn.className = "";
        admins = admins.filter(e => e != name);
    }
}
function removeMemberGroupCreation(name){
    admins = admins.filter(e => e != name);
    selectedUsers = selectedUsers.filter(e => e != name);
    usersSelection.push(name);
    document.getElementById("member-" + name).remove();
}
function createGroup(){
    let groupName = document.getElementById("newGroupName").value;
    if(groupName == ""){
        alert("Inserire un nome");
    }else if(selectedUsers.length == 0){
        alert("Inserire almeno un utente");
    }
    else{
        let g = Group.newGroup(groupName, selectedUsers, admins);
        selectedConv = groupName;
        sendNewGroup(g);
    }
}

function messageToNewUser(){
    let text = document.getElementById("newUserMessage").value;
    if(text == ""){
        alert("Non è possibile inviare messaggi vuoti");
    }else{
        let userName = document.getElementById("newUserName").value;
        if(Client.getServerUsersNames().includes(userName)){
            let message = UserMessage.newMessage(text);
            selectedConv = userName;
            sendUserMessage(userName, message);
        }else{
            alert("L'utente indicato non è registrato al server")
        }
    }
}

function sendMessage(destName, destType){
    let text = document.getElementById("messageBox").value;
    if(text == ""){
        alert("Non è possibile inviare messaggi vuoti");
    }else{
        let message = UserMessage.newMessage(text);
        if(destType == "user"){
            sendUserMessage(destName, message);
        }else if(destType == "group"){
            sendGroupMessage(destName, message);
        }
    }
    goToBottomOfChat();
}

function goToBottomOfChat(){
    let chatbox = document.getElementById("messagesContainer");
    chatbox.scrollTop = chatbox.scrollHeight;
}

//group desc
var usersToRemove = [];
var usersToAdd = [];
var newAdmins = [];
var availableUsers = [];
var addMemberInput;

function initGroupModification(groupName){
    usersToRemove = [];
    usersToAdd = [];
    newAdmins = [];
    availableUsers = Client.getServerUsersNames().filter(e => !Client.getGroup(groupName).members.includes(e));
    addMemberInput = document.getElementById("addMemberGroupMod");
    autocomplete(addMemberInput, availableUsers);
}

function onClickChangeAdminGroupModification(userName){
    let btn = document.getElementById("adminButton-" + userName);
    if(btn.className == "active"){
        btn.className = "";
        newAdmins = newAdmins.filter(e => e != userName);
    }else{
        btn.className = "active";
        newAdmins.push(userName);
    }
}
function onClickRemoveMemberGroupModification(userName){
    let btn = document.getElementById("removeButton-" + userName);
    if(!usersToAdd.includes(userName)){
        if(btn.className == "active"){
            btn.className = "";
            usersToRemove = usersToRemove.filter(e => e != userName);
        }else{
            btn.className = "active";
            usersToRemove.push(userName);
            newAdmins = newAdmins.filter(e => e != userName);
        }
    }else{
        document.getElementById("memberContainer-"+userName).remove();
        usersToAdd = usersToAdd.filter(e => e != userName);
        newAdmins = newAdmins.filter(e => e != userName);
    }
}
function onClickAddMemberGroupModification(){
    let u = document.getElementById("addMemberGroupMod").value;
    if(!availableUsers.includes(u) || usersToAdd.includes(u)){
        alert("L'utente non è disponibile");
    }else{
        usersToAdd.push(u);
        document.getElementById("listOfMembers").innerHTML += `
        <div class="memberContainer" id="memberContainer-` + u + `">
            <div class="imgMember"> <img src="./images/user-profile.png" alt="sunil"> </div>
            <div class="memberName">` + u + `</div>
            <div class="memberButtons">
                <button id="adminButton-` + u + `" onclick="onClickChangeAdminGroupModification('` + u + `')">Amministratore</button>
                <button id="removeButton-` + u + `" onclick="onClickRemoveMemberGroupModification('` + u + `')">Rimuovi</button>
            </div>
        </div> 
        `
    }
}
function onClickApplyGroupModification(groupName){
    if(usersToAdd.length != 0 || usersToRemove.length != 0  || newAdmins.length != 0 ){
        sendGroupModification(groupName, usersToAdd, usersToRemove, newAdmins, []);
    }else{
        alert("Nessuna modifica è stata specificata");
    }
}

function setUserNameLabel(){
    document.getElementById("userNameLabel").innerHTML = Client.userName;
}

function clearConvBox(){
    document.getElementById("convBox").innerHTML = "";
}