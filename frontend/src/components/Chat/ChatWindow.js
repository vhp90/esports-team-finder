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
    // Fetch existing messages
    fetchMessages();
    
    // Setup WebSocket connection
    const wsConnection = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/api/ws/chat/${user.id}`);
    
    wsConnection.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.chat_id === chatId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    };

    setWs(wsConnection);

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
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

      if (response.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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
          {messages.map((message) => (
            <ListItem
              key={message.id}
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
