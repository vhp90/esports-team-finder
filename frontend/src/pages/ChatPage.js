import React, { useState } from 'react';
import { Grid, Container } from '@mui/material';
import ChatList from '../components/Chat/ChatList';
import ChatWindow from '../components/Chat/ChatWindow';
import { useAuth } from '../contexts/AuthContext';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { user } = useAuth();

  const handleChatSelect = (chat) => {
    // Transform chat data to include otherUser object
    const otherUser = {
      id: chat.participants.find(id => id !== user.id),
      name: chat.name || chat.participants.find(id => id !== user.id)
    };
    setSelectedChat({ ...chat, otherUser });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <ChatList onChatSelect={handleChatSelect} />
        </Grid>
        <Grid item xs={12} md={8}>
          {selectedChat ? (
            <ChatWindow chatId={selectedChat.id} otherUser={selectedChat.otherUser} />
          ) : (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              Select a chat to start messaging
            </div>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChatPage;
