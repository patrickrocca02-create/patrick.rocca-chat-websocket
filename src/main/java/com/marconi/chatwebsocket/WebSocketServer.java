package com.marconi.chatwebsocket;

import java.io.IOException;
import java.io.StringReader;
import java.lang.String;
import java.util.ArrayList;
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
        this.onUserDisconnection(userName);
    }
    private void sendMessage(JsonObject obj, Session s) {
        try {
            s.getBasicRemote().sendText(obj.toString());
        } catch (IOException ex) {
            Logger.getLogger(WebSocketServer.class.getName()).log(Level.SEVERE, null, ex);
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
        if(!userName.equals("null") && userName != null){
            System.out.println("Connesso " + userName);
            if(!conversationsHandler.userExists(userName)){
                conversationsHandler.addUser(userName);
            }
            if(conversationsHandler.getUserOnline(userName)){
                JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                    .add("type","error")
                    .add("task","userAlreadyOnline")
                    .build();
                conversationsHandler.sendMessageFrom(userName, jsonMessage);
            }else{
                conversationsHandler.setUserSession(userName, session);
                conversationsHandler.setUserOnline(userName, true);
                JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                        .add("type","system")
                        .add("task","userStateChange")
                        .add("userName", userName)
                        .add("userState",true)
                        .build();
                System.out.println(conversationsHandler);
                conversationsHandler.sendMessageFrom(userName, jsonMessage);
            }
        }
    }
    private void onUserDisconnection(String userName){
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
    }
    private void onGroupCreation(JsonObject group){
        System.out.println("Tentativo di creazione del gruppo " + group.getString("name"));
        String[] members = new String[group.getJsonArray("members").size()];
        
        ArrayList<String> notExistingMembers = new ArrayList<>();
        boolean groupNameNotAvailable = conversationsHandler.groupExists(group.getString("name")); 
        
        for (int i = 0; i < members.length; i++) {
            String userName = group.getJsonArray("members").getString(i);
            if(conversationsHandler.userExists(userName)){
                members[i] = userName;
            }else{
                notExistingMembers.add(userName);
            }
        }
        
        if(groupNameNotAvailable || notExistingMembers.size() != 0){
            System.out.println("-->errore");
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                    .add("type","error")
                    .add("problem","groupCreation")
                    .add("nameNotAvailable", groupNameNotAvailable)
                    .add("notExistingUsers", jsonProvider.createArrayBuilder(notExistingMembers))
                    .build();
            conversationsHandler.sendMessageToUser(group.getString("creator"), jsonMessage);
        }else{
            conversationsHandler.addGroup(
                    group.getString("name"),
                    members,
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
    private void onUserMessage(JsonObject message, String destName){
        if(!conversationsHandler.userExists(destName)){
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","error")
                .add("problem","notExistingUser")
                .build();
            conversationsHandler.sendMessageToUser(message.getString("sender"), jsonMessage);
        }else{
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","message")
                .add("destType","user")
                .add("destName",destName)
                .add("message",message)
                .build();
            conversationsHandler.sendMessageToUser(destName, jsonMessage);
        }
    }
    private void onGroupMessage(JsonObject message, String destName){
        if(!conversationsHandler.groupExists(destName)){
            JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","error")
                .add("problem","notExistingGroup")
                .build();
            conversationsHandler.sendMessageToUser(message.getString("sender"), jsonMessage);
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
}
