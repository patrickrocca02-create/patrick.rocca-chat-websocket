function onGroupCreation(group){
    group = new Group(group.name, group.members, group.admins, group.creationDate, group.creationTime, group.creator);
    Client.addGroup(group);
}
function onGroupModification(admin, newGroup){
    let oldGroup = Client.getGroup(newGroup.name);
    
    let newMembers = getElementsOfList1NotInList2(newGroup.members, oldGroup.members);
    let oldMembers = getElementsOfList1NotInList2(oldGroup.members, newGroup.members);
    let newAdmins = getElementsOfList1NotInList2(newGroup.admins, oldGroup.admins);
    let oldAdmins  = getElementsOfList1NotInList2(oldGroup.admins, newGroup.admins);

    let systemMessageMembers = new SystemMessage(admin, getSystemMessageOnGroupUsersModification(admin, newMembers, oldMembers, "members"));
    let systemMessageAdmins = new SystemMessage(admin, getSystemMessageOnGroupUsersModification(admin, newAdmins, oldAdmins, "admins"));

    Client.addGroupMessage(newGroup.name, systemMessageMembers);
    Client.addGroupMessage(newGroup.name, systemMessageAdmins);

    Client.updateGroup(newGroup.name, newGroup.members, newGroup.admins);
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
    return systemMessageText;
}
function getElementsOfList1NotInList2(list1, list2){
    return list1.filter(e => list2.indexOf(e) == -1);
}

Client.addGroup(new Group("A", ["Patrick","Rupert","Marco","Anna"], ["Patrick","Rupert","Anna","Marco"], "","",""));
g2 = {
    name : "A",
    members : ["Patrick","Giulia","Linda"],
    admins : ["Patrick"]
}
onGroupModification("Patrick", g2);
console.log(Client.groups);