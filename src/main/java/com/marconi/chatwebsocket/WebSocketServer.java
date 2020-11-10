package com.marconi.chatwebsocket;

import java.io.IOException;
import java.io.StringReader;
import java.math.BigDecimal;
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
@ServerEndpoint("/demows")
public class WebSocketServer {
    @Inject
    SessionHandler sessions;
    @OnOpen
    public void onOpen(Session session) {
       sessions.add(session);
       JsonProvider json = JsonProvider.provider();
       JsonObject obj = json.createObjectBuilder()
               .add("type","user")
               .add("text","Ciao Patrick")
               .add("sender","Rupert")
               .add("date","10/11/2020")
               .add("hour","17:50")
               .add("group","null")
               .build();
       //sendMessage(obj,session);
       System.out.println("Invio mess1");
       sendToAll(obj);
       
       JsonArray arrayMembers1 = json.createArrayBuilder()
               .add("Rupert")
               .add("Patrick")
               .add("Lucia")
               .build();
       JsonArray arrayMembers2 = json.createArrayBuilder()
               .add("Linda")
               .add("Patrick")
               .add("Anna")
               .build();
       JsonObject g1 = json.createObjectBuilder().add("name", "Amici").add("members",arrayMembers1).build();
       JsonObject g2 = json.createObjectBuilder().add("name", "LPA").add("members",arrayMembers2).build();
       JsonArray groups = json.createArrayBuilder().add(g1).add(g2).build();
       obj = json.createObjectBuilder()
               .add("type","system")
               .add("task","groupCreation")
               .add("groups",groups)
               .build();
       System.out.println("Invio gruppo");
        sendToAll(obj);
        
        obj = json.createObjectBuilder()
               .add("type","group")
               .add("text","Ciao Amici")
               .add("sender","Lucia")
               .add("date","10/11/2020")
               .add("hour","17:50")
               .add("group","Amici")
               .build();
       System.out.println("Invio mes gruppo");
       sendToAll(obj);
    }
    private void sendMessage(JsonObject obj, Session s) {
        try {
            s.getBasicRemote().sendText(obj.toString());
        } catch (IOException ex) {
            Logger.getLogger(WebSocketServer.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    private void sendToAll(JsonObject obj){
        for (Session s: sessions.getSessions()){
            if (s.isOpen()){
                sendMessage(obj,s);
            }
        }
    }

    @OnMessage
    public void onMessage(String msg, Session s) {
        JsonReader reader = Json.createReader(new StringReader(msg));
        JsonObject jsonMsg = reader.readObject();
        if ("user".equals(jsonMsg.getString("type"))){
            sendToAll(jsonMsg);
        }
    }
}
