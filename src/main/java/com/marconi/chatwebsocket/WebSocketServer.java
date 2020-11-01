package com.marconi.chatwebsocket;

import java.util.Objects;
import java.io.IOException;
import java.io.StringReader;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.spi.JsonProvider;
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
               .add("type","system")
               .add("msg","Nuovo Utente connesso")
               .build();
       //sendMessage(obj,session);
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
