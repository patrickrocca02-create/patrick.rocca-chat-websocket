class User{
    constructor(name){
        this.name = name;
        this.online = false;
    
        this.messages = [];
    }
}

class UserMessage{
    constructor(text, date, time, sender){
        this.text = text;
        this.date = date;
        this.time = time;
        this.sender = sender;
    }
    static newMessage(text){
        let date = getActualDateString();
        let time = getActualTimeString();
        let sender = Client.userName;

        return new UserMessage(text, date, time, sender);
    }
}
class SystemMessage{
    constructor(admin, text){
        this.text = text;
        this.admin = admin;
    }
}

class Group{
    constructor(name, members, admins, creationDate, creationTime, creator){
        this.name = name;
        this.members = members;
        this.admins = admins;
        this.creationDate = creationDate;
        this.creationTime = creationTime;
        this.creator = creator;

        this.messages = [];
        this.active = true;
    }

    static newGroup(name, members, admins){
        members.push(Client.userName);
        admins.push(Client.userName);
        let creationDate = getActualDateString();
        let creationTime = getActualTimeString();
        let creator = Client.userName;

        return new Group(name, members, admins, creationDate, creationTime, creator);
    }
}

class Client{
    static userName = "Patrick";
    static users = [];
    static groups = [];
    static serverUsers = [];
    
    static createDataReference(userName){
        Client.userName = userName;
    }

    static getUserIndex(userName){
        let index = -1;
        for(let i=0; i < Client.users.length; i++){
            if(Client.users[i].name == userName){
                index = i;
            }
        }
        return index;
    }
    static getUser(userName){
        return Client.users[Client.getUserIndex(userName)];
    }

    static getGroupIndex(groupName){
        let index = -1;
        for(let i=0; i < Client.groups.length; i++){
            if(Client.groups[i].name == groupName){
                index = i;
            }
        }
        return index;
    }
    static getGroup(groupName){
        return Client.groups[Client.getGroupIndex(groupName)];
    }
    static updateGroup(groupName, newMembers, newAdmins){
        let g = Client.getGroup(groupName);
        g.members = newMembers;
        g.admins = newAdmins.filter(e => g.members.indexOf(e) != -1);
    }
    static addMembersToGroup(groupName, newMembers){
        let g = Client.getGroup(groupName);
        for(let i = 0; i < newMembers.length; i++){
            g.members.push(newMembers[i]);
        }
    }
    static removeMembersFromGroup(groupName, membersToRemove){
        let g = Client.getGroup(groupName);
        g.members = g.members.filter(e => membersToRemove.indexOf(e) == -1);
        g.admins = g.admins.filter(e => g.members.indexOf(e) != -1);
    }
    static addAdminsToGroup(groupName, newAdmins){
        let g = Client.getGroup(groupName);
        for(let i = 0; i < newAdmins.length; i++){
            g.admins.push(newAdmins[i]);
        }
    }
    static removeAdminsFromGroup(groupName, adminsToRemove){
        let g = Client.getGroup(groupName);
        g.admins = g.admins.filter(e => adminsToRemove.indexOf(e) == -1);
    }
    static addGroupMessage(groupName, mex){
        let g = Client.getGroup(groupName);
        g.messages.push(mex);
    }
    static lastMessageOfGroup(){
        let g = Client.getGroup(groupName);
        return g.messages[g.messages.length-1];
    }
    static setGroupActive(groupName, active){
        Client.getGroup(groupName).active = active;
    }

    static addUserMessage(userName, mex){
        let c = Client.getUser(userName);
        c.messages.push(mex);
    }
    static getLastMessageWithUser(userName){
        let c = Client.getUserIndex(userName);
        return c.messages[messages.length-1];
    }

    static setOnline(userName, online){
        let userIndex = Client.getUserIndex(userName);
        if(userIndex != -1){
            Client.users[userIndex].online = online;
        }
    }

    static removeUser(userName){
        Client.users = Client.users.filter(u => u.name != userName);
    }
    static removeGroup(groupName){
        Client.groups = Client.groups.filter(g => g.name != groupName);
    }

    static addUser(user){
        Client.users.push(user);
    }
    static addGroup(group){
        Client.groups.push(group)
    }

    static addServerUser(user){
        Client.serverUsers.push(user);
    }
    static getServerUserIndex(userName){
        let index = -1;
        for(let i=0; i < Client.serverUsers.length; i++){
            if(Client.serverUsers[i].name == userName){
                index = i;
            }
        }
        return index;
    }
    static getServerUser(userName){
        return Client.serverUsers[Client.getServerUserIndex(userName)];
    }
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getActualDateString(){
    let date = new Date();
    return ("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth()+1)).slice(-2) + "/" + date.getFullYear();
}
function getActualTimeString(){
    let date = new Date();
    return ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
}

/* TEST 
m1 = new Message("Ciao da Rupert","user",null);
m1.sender = "Rupert"
m2 = new Message("Ciao da Lucia","user", null);
m2.sender = "Lucia"
g = new Group("Amici",["Rupert","Lucia","Paola"]);
Client.addGroup(g);
m3 = new Message("Ciao Gruppo","group","Amici");

Client.addMessage(m1);
Client.addMessage(m2);
Client.addMessage(m3);

console.log(Client.userName);
console.log(Client.users);
console.log(Client.groups);
*/