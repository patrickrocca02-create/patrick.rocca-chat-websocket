package com.marconi.chatwebsocket;

import java.io.IOException;
import java.io.StringReader;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.*;
import javax.json.spi.*;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;


@ApplicationScoped
@ServerEndpoint("/demowss")
public class WebSocketServer {
    
    ConversationsHandler conversationHandler = new ConversationsHandler();
    
    JsonProvider jsonProvider = JsonProvider.provider();
            
    @OnOpen
    public void onOpen(Session session) {
        
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
        System.out.println(jsonMessage);
        switch(jsonMessage.getString("type")){
            case "system":
                switch(jsonMessage.getString("task")){
                    case "userConnection":     
                        onUserConnection(jsonMessage.getString("userName"), session);
                        break;
                    case "userDisconnection":
                        onUserDisconnection(jsonMessage.getString("userName"));
                        break;
                    case "groupCreation":
                        onGroupCreation(jsonMessage.getJsonObject("group"));
                        break;
                }
                break;
            case "message":
                switch(jsonMessage.getString("destType")){
                    case "user":
                        onUserMessage(jsonMessage.getJsonObject("message"));
                        break;
                    case "group":
                        onGroupMessage(jsonMessage.getJsonObject("message"));
                        break;
                }
        }
    }
    
    private void onUserConnection(String userName, Session session){
        if(userName != null){
            if(!conversationHandler.userExists(userName)){
                conversationHandler.addUser(userName);
            }
            if(conversationHandler.getUserOnline(userName)){
                JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                    .add("type","error")
                    .add("task","userAlreadyOnline")
                    .build();
                conversationHandler.sendMessageFrom(userName, jsonMessage);
            }else{
                conversationHandler.setUserSession(userName, session);
                conversationHandler.setUserOnline(userName, true);
                JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                        .add("type","system")
                        .add("task","userStateChange")
                        .add("userName", userName)
                        .add("userState",true)
                        .build();
                System.out.println(conversationHandler);
                conversationHandler.sendMessageFrom(userName, jsonMessage);
            }
        }
    }
    private void onUserDisconnection(String userName){
        conversationHandler.setUserSession(userName, null);
        conversationHandler.setUserOnline(userName, false);
        JsonObject jsonMessage = jsonProvider.createObjectBuilder()
                .add("type","system")
                .add("task","userStateChange")
                .add("userName", userName)
                .add("userState",false)
                .build();
        conversationHandler.sendMessageFrom(userName, jsonMessage);
    }
    private void onGroupCreation(JsonObject group){
        
    }
    private void onUserMessage(JsonObject message){
        
    }
    private void onGroupMessage(JsonObject message){
        
    }
}
