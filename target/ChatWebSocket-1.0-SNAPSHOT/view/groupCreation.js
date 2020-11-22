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
        console.log(g);
        sendNewGroup(g);
    }
}

function messageToNewUser(){
    let userName = document.getElementById("newUserName").value;
    if(Client.getServerUsersNames().includes(userName)){
        let text = document.getElementById("newUserMessage").value;
        let message = UserMessage.newMessage(text);
        sendUserMessage(userName, message);
        console.log(message);
        console.log(userName);
    }else{
        alert("L'utente indicato non è registrato al server")
    }
}