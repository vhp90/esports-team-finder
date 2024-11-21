import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Select,
  FormHelperText,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    games: '',
    skill_level: 'beginner',
    play_style: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Sending registration data:', formData);
      await register(formData);
      
      toast({
        title: 'Registration successful',
        description: 'You have been automatically logged in',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'An error occurred during registration';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Registration failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      <Text fontSize="2xl" mb={6} textAlign="center">
        Register
      </Text>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              isDisabled={isLoading}
            />
            <FormHelperText>
              Choose a unique username for your account
            </FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isDisabled={isLoading}
            />
            <FormHelperText>
              We'll never share your email with anyone else
            </FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isDisabled={isLoading}
            />
            <FormHelperText>
              Choose a strong password with at least 8 characters
            </FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Games</FormLabel>
            <Input
              name="games"
              value={formData.games}
              onChange={handleChange}
              isDisabled={isLoading}
              placeholder="e.g., League of Legends, CSGO"
            />
            <FormHelperText>
              Enter the games you play, separated by commas
            </FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Skill Level</FormLabel>
            <Select
              name="skill_level"
              value={formData.skill_level}
              onChange={handleChange}
              isDisabled={isLoading}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="professional">Professional</option>
            </Select>
            <FormHelperText>
              Select your overall skill level in gaming
            </FormHelperText>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Play Style</FormLabel>
            <Input
              name="play_style"
              value={formData.play_style}
              onChange={handleChange}
              isDisabled={isLoading}
              placeholder="e.g., Aggressive, Defensive, Support"
            />
            <FormHelperText>
              Describe your preferred play style
            </FormHelperText>
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
            loadingText="Registering..."
          >
            Register
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Register;
