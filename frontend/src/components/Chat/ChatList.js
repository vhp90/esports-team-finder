import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ChatList = ({ onChatSelect }) => {
  const [chats, setChats] = useState([]);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const fetchChats = async () => {
    try {
      const baseUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/chats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('Received invalid chats data:', data);
        setChats([]);
        return;
      }
      
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    }
  };

  const getOtherParticipant = (chat) => {
    const otherParticipantId = chat.participants.find(id => id !== user.id);
    return otherParticipantId || 'Unknown';
  };

  return (
    <Paper elevation={3}>
      <Typography variant="h6" sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        Chats
      </Typography>
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
        {chats.map((chat) => (
          <React.Fragment key={chat.id}>
            <ListItem
              alignItems="flex-start"
              button
              onClick={() => onChatSelect(chat)}
            >
              <ListItemAvatar>
                <Avatar>{getOtherParticipant(chat)[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={chat.name || getOtherParticipant(chat)}
                secondary={
                  chat.last_message ? (
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {chat.last_message.content}
                      </Typography>
                      {' — '}
                      {new Date(chat.last_message.created_at).toLocaleTimeString()}
                    </>
                  ) : 'No messages yet'
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default ChatList;
