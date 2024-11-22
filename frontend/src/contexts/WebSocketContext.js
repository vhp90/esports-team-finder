import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [messages, setMessages] = useState({});
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const INITIAL_RECONNECT_DELAY = 1000;

  useEffect(() => {
    if (user) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  const connectWebSocket = () => {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = process.env.NODE_ENV === 'production' 
        ? 'esports-team-finder-backend.onrender.com' 
        : 'localhost:8000';
      const ws = new WebSocket(`${wsProtocol}//${wsHost}/api/ws/chat/${user.id}`);
    
      ws.onopen = () => {
        console.log('WebSocket Connected');
        setReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setMessages(prev => ({
            ...prev,
            [message.from_user]: [...(prev[message.from_user] || []), message]
          }));
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket Disconnected:', event.code, event.reason);
        
        // Only attempt to reconnect if we haven't reached the maximum attempts
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Attempting to reconnect in ${delay}ms... (Attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connectWebSocket();
          }, delay);
        } else {
          console.log('Maximum reconnection attempts reached. Please refresh the page to try again.');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
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
