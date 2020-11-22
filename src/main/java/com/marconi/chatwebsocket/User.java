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
    public void sendBuffedMessages(){
        for(JsonObject message : this.buffer){
            this.sendMessage(message);
        }
        this.buffer.clear();
    }
    
    public void addMessageToBuffer(JsonObject jsonMessage){
        if("system".equals(jsonMessage.getString("type")) && "userStateChange".equals(jsonMessage.getString("task"))){
            removeStateChangeMessageOfUser(jsonMessage.getString("userName"));
        }
        buffer.add(jsonMessage);
    }
    
    private void removeStateChangeMessageOfUser(String userName){
        for(JsonObject jo : this.buffer){
            if("system".equals(jo.getString("type")) && jo.getString("task").equals("userStateChange") && jo.getString("userName").equals(userName)){
                this.buffer.remove(jo);
                break;
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
    
    @Override
    public String toString(){
        String s = "Name: " + this.name + ", Online: " + this.online + ", Buffer: ";
        int i = 0;
        for(JsonObject b : this.buffer){
            s += i++ + ":" + b.toString() + ", ";
        }
        return s;
    }
}