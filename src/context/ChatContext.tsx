"use client";
import { fetchSessionsByUserId, fetchUserId } from '@/utils/api';
import { getAuthToken } from '@/utils/auth';
import { useRouter } from 'next/navigation';
import React, { createContext, useState, useContext, ReactNode, useEffect, useReducer } from 'react';

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
  addSession: (session: Session) => void;
  handleLogin: (token: string) => void;
  isAuthenticated: boolean;
  addContextMessage: (sessionId: string, message: any) => void;
  getContextMessage: () => Message[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [MessageList, setMessageList] = useState<Message[]>([]);
  const [numSessions, setNumSessions] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [useAdd, setUseAdd] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const loadSessions = async (token: string) => {

    // if (!isAuthenticated) {
    //   console.error("No token available - cannot load sessions");
    //   router.push("/login")
      
    //   return;
    // }

    if (useAdd) {
      return ;
    }

    // if (!isAuthenticated) {
    //   console.error("Not authenticated - skipping session load");
    //   return;
    // }

    try {
      const fetchedUserId = await fetchUserId(token);
      if (!fetchedUserId) {
        console.error("No user ID returned from API");
        return;
      }
      setUserId(fetchedUserId);
      
      const fetchedSessions = await fetchSessionsByUserId(fetchedUserId);
      console.log(fetchedSessions);

      if (!Array.isArray(fetchedSessions)) {
        console.error("Invalid sessions data format:", fetchedSessions);
        return;
      }

      setSessions(fetchedSessions);
    } catch (error) {
      console.error("Failed to load user or sessions:", error);
    }
  };

  const handleLogin = (token: string) => {
    setIsAuthenticated(true);
    
  };

  const addSession = (session: Session) => {
    setSessions((prevSessions) => {
      const existingSessionIndex = prevSessions.findIndex(s => s.session_id === session.session_id);
      if (existingSessionIndex >= 0) {
        // Update existing session title
        const updatedSessions = [...prevSessions];
        updatedSessions[existingSessionIndex].title = session.title;
        return updatedSessions;
      }
      // Add new session
      setUseAdd(true);
      return [{...session, messages: []}, ...prevSessions];
    });
  };

  const addContextMessage = (sessionId: string, message: any) => {
    setMessageList((prevMessages) => {
      // Check if message already exists
      const existingIndex = prevMessages.findIndex(m => m.message_id === message.message_id);
      if (existingIndex >= 0) {
        // Update existing message
        const updatedMessages = [...prevMessages];
        updatedMessages[existingIndex].message = message.message;
        return updatedMessages;
      }
      // Add new message
      return [...prevMessages, message];
    });
  };

  const getContextMessage = () => {
    return MessageList;
  }
  

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      handleLogin(token);
      loadSessions(token);
    }

  }, []);

  useEffect(() => {
    if (useAdd && userId) {
      setUseAdd(false);
    }
  }, [useAdd, userId]);

  return (
    <ChatContext.Provider value={{ sessions, addSession, handleLogin, isAuthenticated, addContextMessage, getContextMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
