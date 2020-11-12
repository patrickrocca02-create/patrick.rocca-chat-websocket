package com.marconi.chatwebsocket;

import java.io.Serializable;
import java.util.*;
import javax.websocket.*;
import javax.json.*;

public class Group implements Serializable{
    private String name;
    private ArrayList<String> members;
    private String creationDate;
    private String creationTime;
    private String creatorName;

    public Group(String name){
        this.name = name;
    }
    public Group(String name, String[] members, String creationDate, String creationTime, String creatorName) {
        this.name = name;
        this.members = new ArrayList<>();
        for(String member : members){
            this.members.add(member);
        }
        this.creationDate = creationDate;
        this.creationTime = creationTime;
        this.creatorName = creatorName;
    }
    public ArrayList<String> getMembers(){
        return this.members;
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
        s += "], data creazione: " +this.creationDate + ", ora creazione: " + this.creationTime + ", creator: " + this.creatorName;
        return s;
    }
}
