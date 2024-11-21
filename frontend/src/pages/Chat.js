import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Avatar,
  Flex,
  Divider,
  useToast,
} from '@chakra-ui/react';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'TeamPlayer123',
      content: "Hey! I saw your profile and think we would make a great team!",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      sender: 'You',
      content: 'Thanks! What games do you usually play?',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const toast = useToast();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toISOString(),
      },
    ]);
    setNewMessage('');

    // TODO: Implement WebSocket message sending
    toast({
      title: 'Message sent',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box maxW="container.lg" mx="auto" py={8}>
      <VStack h="70vh" spacing={4}>
        {/* Chat messages */}
        <VStack
          flex={1}
          w="100%"
          overflowY="auto"
          spacing={4}
          p={4}
          bg="background.secondary"
          borderRadius="md"
        >
          {messages.map((message) => (
            <Flex
              key={message.id}
              w="100%"
              justify={message.sender === 'You' ? 'flex-end' : 'flex-start'}
            >
              <HStack
                maxW="70%"
                bg={message.sender === 'You' ? 'brand.primary' : 'gray.700'}
                p={4}
                borderRadius="lg"
                spacing={4}
              >
                {message.sender !== 'You' && (
                  <Avatar size="sm" name={message.sender} />
                )}
                <VStack align={message.sender === 'You' ? 'flex-end' : 'flex-start'} spacing={1}>
                  <Text fontSize="sm" color="gray.400">
                    {message.sender}
                  </Text>
                  <Text>{message.content}</Text>
                  <Text fontSize="xs" color="gray.400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Text>
                </VStack>
              </HStack>
            </Flex>
          ))}
        </VStack>

        {/* Message input */}
        <HStack w="100%" spacing={4}>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button colorScheme="purple" onClick={handleSendMessage}>
            Send
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Chat;
