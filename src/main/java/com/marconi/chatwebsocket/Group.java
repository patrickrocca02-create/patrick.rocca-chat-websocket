package com.marconi.chatwebsocket;

import java.io.Serializable;
import java.util.*;
import javax.websocket.*;
import javax.json.*;

public class Group implements Serializable{
    String name;
    Set<String> members;
    
    public Group(String name, HashSet<String> members){
        this.name = name;
        this.members = new HashSet<>();
        for(String member : members){
            this.members.add(member);
        }
    }
}
