class Client{
    static userName = "Patrick";
    static users = [];
    static groups = [];
    constructor(userName){
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

    static addGroupMessage(mex){
        let groupIndex = Client.getGruopIndex(mex.group);
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

class User{
    constructor(name){
        this.name = name;
        this.messages = [];
        this.online = false;
    }

    addMessage(mex){
        this.messages.push(mex);
    }

    lastMessage(){
        return this.messages[this.messages.length-1];
    }
}

class Message{
    constructor(text, destType, groupName){
        this.destType = destType;
        this.groupName = groupName;
        this.text = text;
        let date = new Date();
        this.date = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
        this.time = date.getHours() + ":" + date.getMinutes();
        this.sender = Client.userName;
    }
}

class Group{
    constructor(name, members){
        this.name = name;
        members.push(Client.userName);
        this.members = members;
        this.messages = []
        let date = new Date();
        this.creationDate = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
        this.creationTime = date.getHours() + ":" + date.getMinutes();
        this.creator = Client.userName;
    }

    addMessage(mex){
        this.messages.push(mex);
    }

    lastMessage(){
        return this.messages[this.messages.length-1];
    }
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