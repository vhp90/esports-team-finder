import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  useToast,
  Avatar,
} from '@chakra-ui/react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Chat = ({ otherUser }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const { messages, sendMessage } = useWebSocket();
  const { user } = useAuth();
  const toast = useToast();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, [otherUser]);

  useEffect(() => {
    if (messages[otherUser?.id]) {
      setChatHistory(prev => [...prev, ...messages[otherUser?.id]]);
    }
  }, [messages, otherUser]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const fetchChatHistory = async () => {
    if (!otherUser) return;
    try {
      const response = await axios.get(`http://localhost:8000/messages/${otherUser.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChatHistory(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching chat history',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessage(otherUser.id, message);
    setMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Box h="full" borderWidth={1} borderRadius="lg" p={4}>
      <VStack h="full" spacing={4}>
        <Box
          flex={1}
          w="full"
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.300',
              borderRadius: '24px',
            },
          }}
        >
          <VStack spacing={4} align="stretch">
            {chatHistory.map((msg, index) => (
              <HStack
                key={index}
                justify={msg.from_user === user.id ? 'flex-end' : 'flex-start'}
                spacing={2}
              >
                {msg.from_user !== user.id && (
                  <Avatar size="sm" name={otherUser.username} />
                )}
                <Box
                  maxW="70%"
                  bg={msg.from_user === user.id ? 'blue.500' : 'gray.100'}
                  color={msg.from_user === user.id ? 'white' : 'black'}
                  p={2}
                  borderRadius="lg"
                >
                  <Text>{msg.content}</Text>
                  <Text fontSize="xs" opacity={0.8}>
                    {formatTime(msg.timestamp)}
                  </Text>
                </Box>
                {msg.from_user === user.id && (
                  <Avatar size="sm" name={user.username} />
                )}
              </HStack>
            ))}
            <div ref={messagesEndRef} />
          </VStack>
        </Box>
        <HStack w="full">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button colorScheme="blue" onClick={handleSendMessage}>
            Send
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Chat;
