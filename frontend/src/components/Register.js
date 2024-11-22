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
  Container,
  Heading,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
  const [error, setError] = useState('');
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
    setError('');
    
    try {
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
      
      setError(
        error.response?.data?.detail ||
        error.message ||
        'An error occurred during registration'
      );
      
      toast({
        title: 'Registration failed',
        description: error.response?.data?.detail || 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">Create an Account</Heading>
        
        <Box
          as="form"
          onSubmit={handleSubmit}
          p={8}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="lg"
          bg="whiteAlpha.100"
        >
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Favorite Games</FormLabel>
              <Input
                name="games"
                value={formData.games}
                onChange={handleChange}
                placeholder="Enter your favorite games"
              />
              <FormHelperText>Separate multiple games with commas</FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Skill Level</FormLabel>
              <Select
                name="skill_level"
                value={formData.skill_level}
                onChange={handleChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Play Style</FormLabel>
              <Input
                name="play_style"
                value={formData.play_style}
                onChange={handleChange}
                placeholder="Describe your play style"
              />
            </FormControl>

            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              colorScheme="purple"
              width="full"
              isLoading={isLoading}
              loadingText="Registering..."
            >
              Register
            </Button>

            <Text textAlign="center">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#805AD5' }}>
                Login here
              </Link>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Register;
