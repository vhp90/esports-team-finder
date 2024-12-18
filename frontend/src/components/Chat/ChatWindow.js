import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../contexts/AuthContext';

const ChatWindow = ({ chatId, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);
  const { token, user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!chatId) return;

    // Fetch existing messages
    fetchMessages();
    
    // Setup WebSocket connection
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NODE_ENV === 'production' 
      ? 'esports-team-finder-backend.onrender.com' 
      : 'localhost:8000';
    const wsConnection = new WebSocket(`${wsProtocol}//${wsHost}/api/ws/chat/${chatId}`);
    
    wsConnection.onopen = () => {
      console.log('WebSocket Connected');
    };

    wsConnection.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    wsConnection.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    wsConnection.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    setWs(wsConnection);

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws) return;

    try {
      // Send through HTTP for persistence
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          chat_id: chatId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const message = await response.json();
      
      // Send through WebSocket for real-time
      ws.send(JSON.stringify(message));
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!chatId) {
    return (
      <Paper elevation={3} sx={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Select a chat to start messaging
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">
          {otherUser?.name || 'Chat'}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((message, index) => (
            <ListItem
              key={message.id || index}
              sx={{
                justifyContent: message.sender_id === user.id ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 1,
                  bgcolor: message.sender_id === user.id ? 'primary.light' : 'grey.100',
                  maxWidth: '70%',
                }}
              >
                <ListItemText
                  primary={message.content}
                  secondary={new Date(message.created_at).toLocaleTimeString()}
                />
              </Paper>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <form onSubmit={sendMessage} style={{ display: 'flex' }}>
          <TextField
            fullWidth
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            variant="outlined"
          />
          <IconButton type="submit" color="primary" sx={{ ml: 1 }}>
            <SendIcon />
          </IconButton>
        </form>
      </Box>
    </Paper>
  );
};

export default ChatWindow;
