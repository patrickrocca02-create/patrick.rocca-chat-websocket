package com.marconi.chatwebsocket;

import java.util.HashSet;
import java.util.Set;
import javax.enterprise.context.ApplicationScoped;
import javax.websocket.Session;

@ApplicationScoped
public class SessionHandler {
    Set<Session> sessions;

    public SessionHandler() {
        sessions = new HashSet<>();
    }
    public void add(Session s)  {
        sessions.add(s);
    }

    public void remove(Session s){
        sessions.remove(s);
    }

    public int size(){
        return sessions.size();
    }
    public Set<Session> getSessions() {
        return sessions;
    }    
}