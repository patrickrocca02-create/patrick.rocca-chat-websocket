class User{
    constructor(name){
        this.name = name;
        this.online = false;
    
        this.messages = [];
    }

    addMessage(mex){
        this.messages.push(mex);
    }

    lastMessage(){
        return this.messages[this.messages.length-1];
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
    }

    static newGroup(name, members, admins){
        members.push(Client.userName);
        admins.push(Client.userName);
        let creationDate = getActualDateString();
        let creationTime = getActualTimeString();
        let creator = Client.userName;

        return new Group(name, members, admins, creationDate, creationTime, creator);
    }

    updateGroup(newMembers, newAdmins){
        this.members = newMembers;
        this.admins = newAdmins.filter(e => this.members.indexOf(e) != -1);
    }

    addMessage(mex){
        this.messages.push(mex);
    }

    lastMessage(){
        return this.messages[this.messages.length-1];
    }
}

class Client{
    static userName = "Patrick";
    static users = [];
    static groups = [];
    
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
    static getGruopIndex(groupName){
        let index = -1;
        for(let i=0; i < Client.groups.length; i++){
            if(Client.groups[i].name == groupName){
                index = i;
            }
        }
        return index;
    }
    static getGroup(groupName){
        return Client.groups[Client.getGruopIndex(groupName)];
    }
    static updateGroup(groupName, newMembers, newAdmins){
        Client.groups[Client.getGruopIndex(groupName)].updateGroup(newMembers, newAdmins);
    }

    static addGroupMessage(groupName, mex){
        let groupIndex = Client.getGruopIndex(groupName);
        if(groupIndex != -1){
            Client.groups[groupIndex].addMessage(mex);
        }
    }
    static addUserMessage(mex){
        let userIndex = Client.getUserIndex(mex.sender);
        if(userIndex == -1){
            Client.addUser(new User(mex.sender));
        }
    }

    static setOnline(userName, online){
        let userIndex = Client.getUserIndex(userName);
        if(userIndex != -1){
            Client.users[userIndex].online = online;
        }
    }

    static addUser(user){
        Client.users.push(user);
    }
    static addGroup(group){
        Client.groups.push(group)
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