package com.marconi.chatwebsocket;

import java.io.IOException;
import java.io.StringReader;
import java.lang.String;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.*;
import javax.json.spi.*;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;


@ApplicationScoped
@ServerEndpoint("/demows/{userName}")
public class WebSocketServer {
    @Inject
    ConversationsHandler conversationsHandler;
    
    JsonProvider jsonProvider = JsonProvider.provider();
            
    @OnOpen
    public void onOpen(Session session, @PathParam("userName") String userName) {
        this.onUserConnection(userName, session);
    }
    @OnClose
    public void onClose(Session session, @PathParam("userName") String userName){
        if(!conversationsHandler.userActiveOnAnotherSession(session, userName)){
            this.onUserDisconnection(userName);
        }
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        JsonReader reader = Json.createReader(new StringReader(message));
        JsonObject jsonMessage = reader.readObject();
        System.out.println(System.lineSeparator() + jsonMessage);
        switch(jsonMessage.getString("type")){
            case "system":
                switch(jsonMessage.getString("task")){
                    case "groupCreation":
                        onGroupCreation(jsonMessage.getJsonObject("group"));
                        break;
                    case "groupModification":
                        onGroupModification(jsonMessage.getString("groupName"), jsonMessage.getJsonObject("newGroupSettings"), conversationsHandler.getUserFromSession(session));
                        break;
                    case "groupElimination":
                        onGroupElimination(jsonMessage.getString("groupName"), conversationsHandler.getUserFromSession(session));
                        break;
                    case "groupQuit":
                        onGroupQuit(jsonMessage.getString("groupName"), conversationsHandler.getUserFromSession(session));
                        break;
                }
                break;
            case "message":
                switch(jsonMessage.getString("destType")){
                    case "user":
                        onUserMessage(jsonMessage.getJsonObject("message"), jsonMessage.getString("destName"));
                        break;
                    case "group":
                        onGroupMessage(jsonMessage.getJsonObject("message"), jsonMessage.getString("destName"));
                        break;
                }
        }
    }
    
    private void onUserConnection(String userName, Session session){
        if(!userName.equals("undefined") && userName != null){
            if(!conversationsHandler.userExists(userName)){
                conversationsHandler.addUser(userName);
                this.onNewUser(userName, session);
            }
            if(conversationsHandler.getUserOnline(userName)){
                JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                    .add("type","error")
                    .add("problem","nameNotAvailable")
                    .add("context","userConnection")
                    .add("userName",userName)
                    .build();
                conversationsHandler.sendMessageToSession(session, jsonMessage);
                try {
                    session.close();
                } catch (IOException ex) {
                    Logger.getLogger(WebSocketServer.class.getName()).log(Level.SEVERE, null, ex);
                }
            }else{
                System.out.println("Connesso " + userName);
                conversationsHandler.setUserSession(userName, session);
                conversationsHandler.setUserOnline(userName, true);
                conversationsHandler.sendBuffedMessagesTo(userName);
                JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                        .add("type","system")
                        .add("task","userStateChange")
                        .add("userName", userName)
                        .add("userState",true)
                        .build();
                conversationsHandler.sendMessageFrom(userName, jsonMessage);
                System.out.println(conversationsHandler);
            }
        }
    }
    private void onUserDisconnection(String userName){
        if(!userName.equals("null") && userName != null){
            System.out.println("Disconnesso " + userName);
            conversationsHandler.setUserSession(userName, null);
            conversationsHandler.setUserOnline(userName, false);
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                    .add("type","system")
                    .add("task","userStateChange")
                    .add("userName", userName)
                    .add("userState",false)
                    .build();
            conversationsHandler.sendMessageFrom(userName, jsonMessage);
            System.out.println(conversationsHandler);
        }
    }
    private void onGroupCreation(JsonObject group){
        System.out.println("Tentativo di creazione del gruppo " + group.getString("name"));
        if(conversationsHandler.groupExists(group.getString("name"))){
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","error")
                .add("problem","nameNotAvailable")
                .add("context", "groupCreation")
                .build();
            conversationsHandler.sendOrBufMessageToUser(group.getString("creator"), jsonMessage);
        }else{
            ArrayList<String> members = this.jsonArrayToArrayList(group.getJsonArray("members"));
            ArrayList<String> admins = this.jsonArrayToArrayList(group.getJsonArray("admins"));
            
            ArrayList<String> totalUsers = new ArrayList<>();
            totalUsers.addAll(members);
            totalUsers.addAll(admins);
            ArrayList<String> notExistingUsers = this.getUnexistingUsers(totalUsers);

            if(notExistingUsers.size() != 0){
                System.out.println("-->errore");
                JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                        .add("type","error")
                        .add("problem","notExistingNames")
                        .add("context", "groupCreation")
                        .add("notExistingUsers", jsonProvider.createArrayBuilder(notExistingUsers))
                        .build();
                conversationsHandler.sendOrBufMessageToUser(group.getString("creator"), jsonMessage);
            }else{
                ArrayList<String> existingMembers = this.getExistingUsers(members);
                ArrayList<String> unexistingAdmins = this.getExistingUsers(admins);
            
                conversationsHandler.addGroup(
                        group.getString("name"),
                        existingMembers,
                        unexistingAdmins,
                        group.getString("creationDate"),
                        group.getString("creationTime"),
                        group.getString("creator")
                );
                JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                        .add("type","system")
                        .add("task","groupCreation")
                        .add("group", group)
                        .build();
                conversationsHandler.sendMessageToGroupFrom(group.getString("name"), group.getString("creator"), jsonMessage);
                System.out.println(conversationsHandler);
            }
        }
    }
    
    private void onGroupModification(String groupName, JsonObject newGroupSettings, String sender){
        if(!conversationsHandler.groupExists(groupName)){
            ArrayList<String> name = new ArrayList<>();
            name.add(groupName);
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","error")
                .add("problem","notExistingNames")
                .add("context","groupModification")
                .add("notExistringUsers",jsonProvider.createArrayBuilder(name))
                .build();
            conversationsHandler.sendOrBufMessageToUser(sender, jsonMessage);
        }else if(conversationsHandler.userIsAdminOfGroup(groupName, sender)){
            if(!conversationsHandler.userIsAdminOfGroup(groupName, sender)){
                //error
                return;
            }else{
                ArrayList<String> totalUsers = new ArrayList<>();
                ArrayList<String> addMembers = null;
                ArrayList<String> removeMembers = null;
                ArrayList<String> addAdmins = null;
                ArrayList<String> removeAdmins = null;
                if(newGroupSettings.getJsonArray("addMembers").size() != 0){
                    addMembers = this.jsonArrayToArrayList(newGroupSettings.getJsonArray("addMembers"));
                    totalUsers.addAll(addMembers);
                }
                if(newGroupSettings.getJsonArray("removeMembers").size() != 0){
                    removeMembers = this.jsonArrayToArrayList(newGroupSettings.getJsonArray("removeMembers"));
                    totalUsers.addAll(removeMembers);
                }
                if(newGroupSettings.getJsonArray("addAdmins").size() != 0){
                    addAdmins = this.jsonArrayToArrayList(newGroupSettings.getJsonArray("addAdmins"));
                    totalUsers.addAll(addAdmins);
                }
                if(newGroupSettings.getJsonArray("removeAdmins").size() != 0){
                    removeAdmins = this.jsonArrayToArrayList(newGroupSettings.getJsonArray("removeAdmins"));
                    totalUsers.addAll(removeAdmins);
                }

                ArrayList<String> unexistingUsers = this.getUnexistingUsers(totalUsers);
                if(unexistingUsers.size() != 0){
                    JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                        .add("type","error")
                        .add("problem","notExistingNames")
                        .add("context","groupModification")
                        .add("notExistringUsers",jsonProvider.createArrayBuilder(unexistingUsers))
                        .build();
                    conversationsHandler.sendOrBufMessageToUser(sender, jsonMessage);
                }
                else if(addMembers != null || removeMembers != null || addAdmins != null || removeAdmins != null){
                    if(addMembers != null){
                       conversationsHandler.addMembersToGroup(groupName, addMembers); 
                    }
                    if(removeMembers != null){
                        if(!conversationsHandler.membersInGroup(groupName, removeMembers)){
                            //error
                            return;
                        }else{
                            conversationsHandler.removeMembersFromGroup(groupName, removeMembers);
                            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                                    .add("type","system")
                                    .add("task","groupRemoval")
                                    .add("groupName", groupName)
                                    .add("admin", sender)
                                    .build();
                            for(String oldMember : removeMembers){
                                conversationsHandler.sendOrBufMessageToUser(oldMember, jsonMessage);
                            }
                        }
                    }
                    if(addAdmins != null){
                        if(!conversationsHandler.membersInGroup(groupName, addAdmins)){
                            //errore
                            return;
                        }else{
                            conversationsHandler.addAdminsToGroup(groupName, addAdmins);
                            //user notificatio
                        }
                    }
                    if(removeAdmins != null){
                        if(!conversationsHandler.adminsOfGroup(groupName, removeAdmins)){
                            //errore
                            return;
                        }else{
                            conversationsHandler.removeAdminsFromGroup(groupName, removeAdmins);
                            //user notificatio
                        }
                    }
                    JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                        .add("type","system")
                        .add("task","groupModification")
                        .add("admin", sender)
                        .add("group",conversationsHandler.getJsonGroup(groupName))
                        .build();
                    conversationsHandler.sendMessageToGroupFrom(groupName, sender, jsonMessage);
                    System.out.println(conversationsHandler);
                }
            }
        }
    }
    
    private void onGroupElimination(String groupName, String sender){
        if(!conversationsHandler.groupExists(groupName)){
            //errore
        }else{
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","system")
                .add("task","groupElimination")
                .add("admin", sender)
                .add("groupName",groupName)
                .build();
            conversationsHandler.sendMessageToGroupFrom(groupName, sender, jsonMessage);
            conversationsHandler.removeGroup(groupName);
            System.out.println(conversationsHandler);
        }
    }
    
    private void onUserMessage(JsonObject message, String destName){
        if(!conversationsHandler.userExists(destName)){
            ArrayList<String> name = new ArrayList<>();
            name.add(destName);
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","error")
                .add("problem","notExistingNames")
                .add("context","userMessage")
                .add("notExistringUsers",jsonProvider.createArrayBuilder(name))
                .build();
            conversationsHandler.sendOrBufMessageToUser(message.getString("sender"), jsonMessage);
        }else{
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","message")
                .add("destType","user")
                .add("destName",destName)
                .add("message",message)
                .build();
            conversationsHandler.sendOrBufMessageToUser(destName, jsonMessage);
        }
    }
    private void onGroupMessage(JsonObject message, String destName){
        if(!conversationsHandler.groupExists(destName)){
            ArrayList<String> name = new ArrayList<>();
            name.add(destName);
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","error")
                .add("problem","notExistingNames")
                .add("context","groupMessage")
                .add("notExistringUsers",jsonProvider.createArrayBuilder(name))
                .build();
            conversationsHandler.sendOrBufMessageToUser(message.getString("sender"), jsonMessage);
        }else{
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","message")
                .add("destType","group")
                .add("destName",destName)
                .add("message",message)
                .build();
            conversationsHandler.sendMessageToGroupFrom(destName, message.getString("sender"), jsonMessage);
        }
    }
    private void onNewUser(String userName, Session session){
        JsonObject jsonMessage = jsonProvider.createObjectBuilder()
            .add("type","system")
            .add("task","serverUsersList")
            .add("serverUsers",jsonProvider.createArrayBuilder(this.conversationsHandler.getServerUsersFor(userName)))
            .build();
        conversationsHandler.sendMessageToSession(session, jsonMessage);
    }
    private void onGroupQuit(String groupName, String userName){
        ArrayList<String> user = new ArrayList<>();
        user.add(userName);
        conversationsHandler.removeMembersFromGroup(groupName, user);
        if(conversationsHandler.getAdminsOfGroup(groupName).size() == 0){
            this.onGroupElimination(groupName, userName);
        }else{
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","system")
                .add("task","userQuitGroup")
                .add("userName",userName)
                .add("groupName", groupName)
                .build();
            conversationsHandler.sendMessageToGroupFrom(groupName, userName, jsonMessage);
        }
    }
  
    
    private ArrayList<String> getExistingUsers(ArrayList<String> userList){
        ArrayList<String> existingUsers = new ArrayList<>();
        for (int i = 0; i < userList.size(); i++) {
            String userName = userList.get(i);
            if(conversationsHandler.userExists(userName)){
                existingUsers.add(userName);
            }
        }
        return existingUsers;
    }
    private ArrayList<String> getUnexistingUsers(ArrayList<String> userList){
        Set<String> unexistingUsers = new HashSet<>();
        for (int i = 0; i < userList.size(); i++) {
            String userName = userList.get(i);
            if(!conversationsHandler.userExists(userName)){
                unexistingUsers.add(userName);
            }
        }
        return new ArrayList<>(unexistingUsers);
    }
    private ArrayList<String> jsonArrayToArrayList(JsonArray jsonArray){
        ArrayList<String> arrayList = new ArrayList<>();
        for (int i = 0; i < jsonArray.size(); i++) {
            arrayList.add(jsonArray.getString(i));
        }
        return arrayList;
    }
}
