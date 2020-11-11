package com.marconi.chatwebsocket;

import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.logging.*;
import javax.json.*;
import javax.json.spi.*;
import javax.websocket.Session;

class User implements Serializable{
    private String name;
    private Session session;
    private boolean online;
    private ArrayList<JsonObject> buffer;
    
    public User(String name){
        this.name = name;
        this.buffer = new ArrayList<>();
    }
    
    public String getName(){
        return this.name;
    }
    public Session getSession(){
        return this.session;
    }
    public void setSession(Session session){
        this.session = session;
    }
    public boolean getOnline(){
        return this.online;
    }
    public void setOnline(boolean online){
        this.online = online;
    }
    
    public void sendMessage(JsonObject jsonMessage){
        try{
            session.getBasicRemote().sendText(jsonMessage.toString());
        } catch (IOException ex) {
            Logger.getLogger(WebSocketServer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    public void addMessageToBuffer(JsonObject jsonMessage){
        if("system".equals(jsonMessage.getString("type")) 
            && ("userConnection".equals(jsonMessage.getString("task"))
            || "userDisconnection".equals(jsonMessage.getString("task"))))
        {
            removeMessageFromBuffer("task", jsonMessage.getString("task"));
        }
        buffer.add(jsonMessage);
    }
    
    private void removeMessageFromBuffer(String field, String value){
        for(JsonObject jo : this.buffer){
            if(value.equals(jo.getString(field))){
                this.buffer.remove(jo);
            }
        }
    }
    
    @Override
    public boolean equals(Object o){
        if(o == this){
            return true;
        }
        if(!(o instanceof User)){
            return false;
        }
        return this.name.equals(((User)o).name);
    }
}