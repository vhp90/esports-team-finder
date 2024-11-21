import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState({});
  const wsRef = useRef(null);

  useEffect(() => {
    if (user) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${user.id}`);
    
    ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => ({
        ...prev,
        [message.from_user]: [...(prev[message.from_user] || []), message]
      }));
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      // Attempt to reconnect after a delay
      setTimeout(connectWebSocket, 5000);
    };

    wsRef.current = ws;
  };

  const sendMessage = (toUser, content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        to_user: toUser,
        content: content,
      };
      wsRef.current.send(JSON.stringify(message));
      // Optimistically add message to state
      setMessages(prev => ({
        ...prev,
        [toUser]: [...(prev[toUser] || []), { ...message, from_user: user.id }]
      }));
    }
  };

  const value = {
    messages,
    sendMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
