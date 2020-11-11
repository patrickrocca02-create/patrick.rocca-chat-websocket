package com.marconi.chatwebsocket;

import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.*;
import javax.websocket.*;

public class ConversationsHandler {
    private static ConversationsHandler current;
    
    private ArrayList<User> users;
    private ArrayList<Group> groups;
    
    public ConversationsHandler(){
        ConversationsHandler.current = this;
        this.users = new ArrayList<>();
        this.groups = new ArrayList<>();
    }
    
    public static ConversationsHandler getCurrent(){
        return ConversationsHandler.current;
    }
    
    public void addUser(String userName){
        this.users.add(new User(userName));
    }
    public void setUserSession(String userName, Session session){
        this.getUser(userName).setSession(session);
    }
    public void setUserOnline(String userName, boolean online){
        this.getUser(userName).setOnline(online);
    }
    public boolean getUserOnline(String userName){
        return this.getUser(userName).getOnline();
    }
    public void addMessageToUserBuffer(String userName, JsonObject jsonMessage){
        this.getUser(userName).addMessageToBuffer(jsonMessage);
    }
    private User getUser(String userName){
        return this.users.get(this.users.indexOf(new User(userName)));
    }
    
    public void sendMessageFrom(String userName, JsonObject jsonMessage){
         System.out.println("invio " + jsonMessage.toString() + " dal " + userName);
        for(User u : this.getOnlineUsers()){
            if(!u.getName().equals(userName)){
                System.out.println("invio " + jsonMessage.toString() + " a " + u.getName());
                u.sendMessage(jsonMessage);
            }
        }
        for(User u : this.getOfflineUsers()){
            if(!u.getName().equals(userName))
                u.addMessageToBuffer(jsonMessage);
        }
    }
    
    public void sendMessageToUser(String userName, JsonObject jsonMessage){
        try {
            this.getSessionOf(userName).getBasicRemote().sendText(jsonMessage.toString());
        } catch (IOException ex) {
            Logger.getLogger(ConversationsHandler.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    public boolean userExists(String userName){
        return this.users.indexOf(new User(userName)) != -1;
    }
    
    private ArrayList<User> getOnlineUsers(){
        return getUsersOnState(true);
    }
    private ArrayList<User> getOfflineUsers(){
        return getUsersOnState(false);
    }
    private ArrayList<User> getUsersOnState(boolean state){
        ArrayList<User> users = new ArrayList<>();
        for(User u : this.users){
            if(u.getOnline() == state){
                users.add(u);
            }
        }
        return users;
    }
    
    private Session getSessionOf(String userName){
        return this.users.get(this.users.indexOf(new User(userName))).getSession();
    }
    
    @Override
    public String toString(){
        String s = "Users:" + System.lineSeparator();
        for(User u : users){
            s += "nome: " + u.getName() + ", online: " + u.getOnline() + System.lineSeparator();
        }
        return s;
    }
}
