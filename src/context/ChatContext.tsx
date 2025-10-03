"use client";
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Message {
  message_id: string;
  message: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

interface Session {
  session_id: string;
  title: string;
  messages: Message[];
}

interface ChatContextType {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  addContextMessage: (sessionId: string, message: Message) => void;
  handleLogin: (session: Session) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  const addSession = (session: Session) => {
    setSessions(prevSessions => [...prevSessions, session]);
  };

  const addContextMessage = (sessionId: string, message: Message) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.session_id === sessionId
          ? { ...session, messages: [...session.messages, message] }
          : session
      )
    );
  };

  const handleLogin = (session: Session) => {
    addSession(session);
  };

  return (
    <ChatContext.Provider value={{ sessions, setSessions, addSession, addContextMessage, handleLogin }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
