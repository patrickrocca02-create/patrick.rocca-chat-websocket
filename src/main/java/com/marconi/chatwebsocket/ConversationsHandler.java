package com.marconi.chatwebsocket;

import java.io.IOException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.enterprise.context.ApplicationScoped;
import javax.json.*;
import javax.websocket.*;

@ApplicationScoped
public class ConversationsHandler {
    private ArrayList<User> users;
    private ArrayList<Group> groups;
    
    public ConversationsHandler(){
        this.users = new ArrayList<>();
        this.groups = new ArrayList<>();
    }
    
    public void addGroup(String name, ArrayList<String> members, ArrayList<String> admins, String creationDate, String creationTime, String creator){
        this.groups.add(new Group(name, members, admins, creationDate, creationTime, creator));
    }
    public void addUser(String userName){
        this.users.add(new User(userName));
    }
    
    public void sendOrBufMessageToUser(String userName, JsonObject message){
        User u = this.getUser(userName);
        this.sendOrBufMessageToUser(u, message);
    }
    public void sendOrBufMessageToUser(User user, JsonObject message){
        if(user.getOnline() == true){
            System.out.println("--> inviato a " + user.getName());
            user.sendMessage(message);
        }
        else{
            System.out.println("--> aggiunta a buffer di" + user.getName());
            user.addMessageToBuffer(message);
        }
    }
    
    public void sendBuffedMessagesTo(String userName){
        this.getUser(userName).sendBuffedMessages();
    }
    
    public void sendMessageFrom(String userName, JsonObject jsonMessage){
        System.out.println("invio " + jsonMessage.toString() + " da " + userName);
        for(User u : this.users){
            if(!u.getName().equals(userName)){
                this.sendOrBufMessageToUser(u,jsonMessage);
            }
        }
    }
    public void sendMessageToGroupFrom(String groupName, String userName, JsonObject jsonMessage){
        for(User u : this.getUsersOfGroup(groupName)){
            if(!u.getName().equals(userName)){
                this.sendOrBufMessageToUser(u, jsonMessage);
            }
        }
    }
    public void sendMessageToSession(Session session, JsonObject jsonMessage){
        try{
            session.getBasicRemote().sendText(jsonMessage.toString());
        } catch (IOException ex) {
            Logger.getLogger(WebSocketServer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    public void addMessageToUserBuffer(String userName, JsonObject jsonMessage){
        this.getUser(userName).addMessageToBuffer(jsonMessage);
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
    private ArrayList<User> getUsersOfGroup(String groupName){
        ArrayList<User> users = new ArrayList<>();
        for(String userName : this.getGroup(groupName).getMembers()){
            users.add(this.getUser(userName));
        }
        return users;
    }
    
    public String getUserFromSession(Session session){
        String user = null;
        for(User u : this.users){
            if(session == u.getSession()){
                user = u.getName();
            }
        }
        return user;
    }
    public void setUserSession(String userName, Session session){
        this.getUser(userName).setSession(session);
    }
    private Session getUserSession(String userName){
        return this.users.get(this.users.indexOf(new User(userName))).getSession();
    }
    public void setUserOnline(String userName, boolean online){
        this.getUser(userName).setOnline(online);
    }
    public boolean getUserOnline(String userName){
        return this.getUser(userName).getOnline();
    }
    
    private User getUser(String userName){
        return this.users.get(this.users.indexOf(new User(userName)));
    }
    private Group getGroup(String groupName){
        int i = this.groups.indexOf(new Group(groupName));
        return this.groups.get(i);
    }
    
    public boolean groupExists(String groupName){
        return this.groups.indexOf(new Group(groupName)) != -1;
    }
    public boolean userExists(String userName){
        return this.users.indexOf(new User(userName)) != -1;
    }
    
    public boolean membersInGroup(String groupName, ArrayList<String> members){
        return this.getGroup(groupName).areMembers(members);
    }
    public boolean adminsOfGroup(String groupName, ArrayList<String> admins){
        return this.getGroup(groupName).areAdmins(admins);
    }
    
    public boolean userIsAdminOfGroup(String groupName, String userName){
        return this.getGroup(groupName).isAdmin(userName);
    }
    public void addMembersToGroup(String groupName, ArrayList<String> members){
        this.getGroup(groupName).addMembers(members);
    }
    public void removeMembersFromGroup(String groupName, ArrayList<String> members){
        this.getGroup(groupName).removeMembers(members);
    }
    public void addAdminsToGroup(String groupName, ArrayList<String> admins){
        this.getGroup(groupName).addAdmins(admins);
    }
    public void removeAdminsFromGroup(String groupName, ArrayList<String> admins){
        this.getGroup(groupName).removeAdmins(admins);
    }
    public JsonObject getJsonGroup(String groupName){
        return this.getGroup(groupName).getJsonObjectOnModification();
    }
    
    public boolean userActiveOnAnotherSession(Session session, String userName){
        for(User u : this.getOnlineUsers()){
            if(u.getSession() != session && userName.equals(u.getName())){
                return true;
            }
        }
        return false;
    }
    
    @Override
    public String toString(){
        String s = "Users:" + System.lineSeparator();
        for(User u : users){
            s += u.toString() + System.lineSeparator();
        }
        if(groups.size() != 0){
            s += "Groups:" + System.lineSeparator();
            for(Group u : groups){
                s += u.toString() + System.lineSeparator();
            }
        }
        return s;
    }
}
