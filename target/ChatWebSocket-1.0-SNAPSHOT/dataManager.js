//IN MESSAGES
function onGroupCreation(group){
    group = new Group(group.name, group.members, group.admins, group.creationDate, group.creationTime, group.creator);
    Client.addGroup(group);
}
function onGroupModification(admin, newGroup){
    if(Client.getGroupIndex(newGroup.name) == -1){
        onGroupCreation(newGroup);
    }else{
        let oldGroup = Client.getGroup(newGroup.name);
        
        let newMembers = getElementsOfList1NotInList2(newGroup.members, oldGroup.members);
        let oldMembers = getElementsOfList1NotInList2(oldGroup.members, newGroup.members);
        let newAdmins = getElementsOfList1NotInList2(newGroup.admins, oldGroup.admins);
        let oldAdmins  = getElementsOfList1NotInList2(oldGroup.admins, newGroup.admins);

        if(newMembers.length != 0 || oldMembers.length != 0){
            let systemMessageMembers = getSystemMessageOnGroupUsersModification(admin, newMembers, oldMembers, "members");
            Client.addGroupMessage(newGroup.name, systemMessageMembers);
        }
        if(newAdmins.length != 0 || oldAdmins.length != 0){
            let systemMessageAdmins = getSystemMessageOnGroupUsersModification(admin, newAdmins, oldAdmins, "admins");
            Client.addGroupMessage(newGroup.name, systemMessageAdmins);
        }

        Client.updateGroup(newGroup.name, newGroup.members, newGroup.admins);
    }
}
function onGroupRemoval(groupName, admin){
    Client.addGroupMessage(groupName, new SystemMessage(admin, "Sei stato rimosso dal gruppo dall'amministratore " + admin));
    Client.removeMembersFromGroup(groupName, [Client.userName]);
    Client.getGroup(groupName).active = false;
}
function onUserQuitGroup(userName, groupName){
    Client.addGroupMessage(groupName,new SystemMessage(userName, userName + " ha lasciato il gruppo"));
    Client.removeMembersFromGroup(groupName, [userName]);
}
function onGroupElimination(admin, groupToRemove){
    Client.getGroup(groupToRemove).active = false;
    Client.addGroupMessage(groupToRemove, getSystemMessageOnGroupElimination(admin));
}
function onUserStateChange(userName, newState){
    if(Client.getUserIndex(userName) != -1){
        Client.setOnline(userName, newState);
    }
    if(Client.getServerUserIndex(userName) == -1){
        Client.addServerUser({name : userName, online : newState});
    }else{
        Client.getServerUser(userName).online = newState;
    }
}
function onUserMessage(message){
    if(Client.getUserIndex(message.sender) == -1){
        Client.addUser(new User(message.sender));
    }
    Client.addUserMessage(message.sender, new UserMessage(message.text, message.date, message.time, message.sender));
    Client.setOnline(message.sender, true);
}
function onGroupMessage(groupName, message){
    Client.addGroupMessage(groupName, message);
}
function onServerUsers(serverUsers){
    for(let i = 0; i < serverUsers.length; i++){
        serverUsers[i] = JSON.parse(serverUsers[i]);
    }
    Client.serverUsers = serverUsers;
}

function getSystemMessageOnGroupUsersModification(admin, newUsers, oldUsers, memberOrAdmin){
    let systemMessageText = "L'admin " + admin + " ha ";
    
    if(memberOrAdmin == "members"){
        memberOrAdmin = "utent";
    }else if(memberOrAdmin == "admins"){
        memberOrAdmin = "amministrator";
    }

    if(newUsers.length == 1){
        systemMessageText += "aggiunto l'" + memberOrAdmin + "e ";
    }else if(newUsers.length > 1){
        systemMessageText += "aggiunto gli " + memberOrAdmin + "i ";
    }
    for(let i = 0; i < newUsers.length; i++){   
        systemMessageText += newUsers[i];
        if(i == newUsers.length - 2){
            systemMessageText += " e ";
        }else if(i != newUsers.length - 1){
            systemMessageText += ", ";
        }
    }

    if(newUsers.length > 0 && oldUsers.length > 0){
        systemMessageText += ", e ha "
    }

    if(oldUsers.length == 1){
        systemMessageText += "rimosso l'" + memberOrAdmin + "e ";
    }else if(oldUsers.length > 1){
        systemMessageText += "rimosso gli " + memberOrAdmin + "i ";
    }
    for(let i = 0; i < oldUsers.length; i++){   
        systemMessageText += oldUsers[i];
        if(i == oldUsers.length - 2){
            systemMessageText += " e ";
        }else if(i != oldUsers.length - 1){
            systemMessageText += ", ";
        }
    }
    return new SystemMessage(admin, systemMessageText);
}
function getSystemMessageOnGroupElimination(admin){
    let text = "L'amministratore " + admin + " ha eliminato il gruppo";
    return new SystemMessage(admin, text);
}
function getElementsOfList1NotInList2(list1, list2){
    return list1.filter(e => list2.indexOf(e) == -1);
}

/* TEST GROUP MODIFICATION MESSAGE GENERATOR
Client.addGroup(new Group("A", ["Patrick","Rupert","Marco","Anna"], ["Patrick","Rupert","Anna","Marco"], "","",""));
g2 = {
    name : "A",
    members : ["Patrick","Giulia","Linda"],
    admins : ["Patrick","Rupert"]
}
onGroupModification("Patrick", g2);
console.log(Client.groups);*/

//OUT MESSAGES
function onSendUserMessage(userName, message){
    if(Client.getUserIndex(userName) == -1){
        Client.addUser(new User(userName));
    }
    Client.addUserMessage(userName, message);
    if(Client.getServerUserIndex(userName) != -1){
        Client.getUser(userName).online = Client.getServerUser(userName).online;
    }
}
function onSendGroupMessage(groupName, message){
    Client.addGroupMessage(groupName, message);
}
function onSendGroupCreation(group){
    Client.addGroup(group);
}
function onSendGroupElimination(groupName){
    Client.getGroup(groupName).active = false;
    Client.addGroupMessage(groupName, new SystemMessage(Client.userName, "Hai eliminato il gruppo"));
}
function onSendGroupModification(groupName, newGroupSettings){
    Client.addMembersToGroup(groupName, newGroupSettings.addMembers);
    Client.removeMembersFromGroup(groupName, newGroupSettings.removeMembers);
    Client.addAdminsToGroup(groupName, newGroupSettings.addAdmins);
    Client.removeAdminsFromGroup(groupName, newGroupSettings.removeAdmins);

    if(newGroupSettings.addMembers.length != 0 || newGroupSettings.removeMembers.length != 0){
        let systemMessageMembers = getSystemMessageOnSendGroupUsersModification(newGroupSettings.addMembers, newGroupSettings.removeMembers, "members");
        Client.addGroupMessage(groupName, systemMessageMembers);
    }
    if(newGroupSettings.addAdmins.length != 0 || newGroupSettings.removeAdmins.length != 0){
        let systemMessageAdmins = getSystemMessageOnSendGroupUsersModification(newGroupSettings.addAdmins, newGroupSettings.removeAdmins, "admins");
        Client.addGroupMessage(groupName, systemMessageAdmins);
    }
}
function onSendGroupQuit(groupName){
    Client.addGroupMessage(groupName,new SystemMessage(Client.name, "Hai lasciato il gruppo"));
    Client.setGroupActive(groupName, false);
}   

function getSystemMessageOnSendGroupUsersModification(newUsers, oldUsers, memberOrAdmin){
    let systemMessageText = "Hai ";

    if(memberOrAdmin == "members"){
        memberOrAdmin = "utent";
    }else if(memberOrAdmin == "admins"){
        memberOrAdmin = "amministrator";
    }

    if(newUsers.length == 1){
        systemMessageText += "aggiunto l'" + memberOrAdmin + "e ";
    }else if(newUsers.length > 1){
        systemMessageText += "aggiunto gli " + memberOrAdmin + "i ";
    }
    for(let i = 0; i < newUsers.length; i++){   
        systemMessageText += newUsers[i];
        if(i == newUsers.length - 2){
            systemMessageText += " e ";
        }else if(i != newUsers.length - 1){
            systemMessageText += ", ";
        }
    }

    if(newUsers.length > 0 && oldUsers.length > 0){
        systemMessageText += ", e hai "
    }

    if(oldUsers.length == 1){
        systemMessageText += "rimosso l'" + memberOrAdmin + "e ";
    }else if(oldUsers.length > 1){
        systemMessageText += "rimosso gli " + memberOrAdmin + "i ";
    }
    for(let i = 0; i < oldUsers.length; i++){   
        systemMessageText += oldUsers[i];
        if(i == oldUsers.length - 2){
            systemMessageText += " e ";
        }else if(i != oldUsers.length - 1){
            systemMessageText += ", ";
        }
    }
    return new SystemMessage(Client.userName, systemMessageText);
}