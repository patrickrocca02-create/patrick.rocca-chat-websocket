package com.marconi.chatwebsocket;

import java.io.Serializable;
import java.util.*;
import javax.websocket.*;
import javax.json.*;
import javax.json.spi.JsonProvider;

public class Group implements Serializable{
    private String name;
    private ArrayList<String> members;
    private ArrayList<String> admins;
    private String creationDate;
    private String creationTime;
    private String creatorName;

    public Group(String name){
        this.name = name;
    }
    public Group(String name, ArrayList<String> members, ArrayList<String> admins, String creationDate, String creationTime, String creatorName) {
        this.name = name;
        this.members = new ArrayList<>();
        for(String member : members){
            this.members.add(member);
        }
        this.admins = new ArrayList<>();
        for(String admin : admins){
            this.admins.add(admin);
        }
        this.creationDate = creationDate;
        this.creationTime = creationTime;
        this.creatorName = creatorName;
    }
    
    public void addMembers(ArrayList<String> newMembers){
        for(String newMember : newMembers){
            if(!this.members.contains(newMember)){
                this.members.add(newMember);
            }
        }
    }
    public void removeMembers(ArrayList<String> membersToRemove){
        for(String memberToRemove : membersToRemove){
            this.members.remove(memberToRemove);
        }
    }
    public void addAdmins(ArrayList<String> newAdmins){
        for(String newAdmin : newAdmins){
            if(!this.admins.contains(newAdmin)){
                this.admins.add(newAdmin);
            }
        }
    }
    public void removeAdmins(ArrayList<String> adminsToRemove){
        for(String adminToRemove : adminsToRemove){
            this.admins.remove(adminToRemove);
        }
    }
    
    public boolean areMembers(ArrayList<String> members){
        for(String u : members){
            System.out.println(u);
        }
        for(String u : this.members){
            System.out.println(u);
        }
        return this.members.containsAll(members);
    }
    public boolean areAdmins(ArrayList<String> admins){
        return this.admins.containsAll(admins);
    }
    public boolean isAdmin(String userName){
        return this.admins.contains(userName);
    }
    
    public ArrayList<String> getMembers(){
        return this.members;
    }
    public ArrayList<String> getAdmins(){
        return this.admins;
    }
    
    public JsonObject getJsonObject(){
        JsonProvider jsonProvider = JsonProvider.provider();
        JsonObject jsonGroup = jsonProvider.createObjectBuilder()
                .add("name",this.name)
                .add("members", jsonProvider.createArrayBuilder(this.members))
                .add("admins", jsonProvider.createArrayBuilder(this.admins))
                .add("creationDate", this.creationDate)
                .add("creationTime", this.creationTime)
                .add("creator", this.creatorName)
                .build();
        return jsonGroup;
    }
    
    @Override
    public boolean equals(Object o){
        if(this == o){
            return true;
        }
        if(!(o instanceof Group)){
            return false;
        }
        return this.name.equals(((Group) o).name);
    }
    @Override
    public String toString(){
        String s = "nome: " + this.name + ", membri: [";
        for(String m : this.members)
            s += m + ",";
        s += "], admins: [";
        for(String m : this.admins)
            s += m + ",";
        s += "], data creazione: " +this.creationDate + ", ora creazione: " + this.creationTime + ", creator: " + this.creatorName;
        return s;
    }
}
