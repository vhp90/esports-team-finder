import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  Heading,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateTeam = () => {
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    description: '',
    skill_level: '',
    requirements: '',
    max_members: 5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('/teams', formData);
      toast({
        title: 'Success',
        description: 'Team created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/teams');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create team',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="xl" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      <Heading size="lg" mb={6}>
        Create New Team
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Team Name</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter team name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Game</FormLabel>
            <Select
              name="game"
              value={formData.game}
              onChange={handleChange}
              placeholder="Select game"
            >
              <option value="League of Legends">League of Legends</option>
              <option value="CSGO">CSGO</option>
              <option value="Valorant">Valorant</option>
              <option value="Dota 2">Dota 2</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your team"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Skill Level</FormLabel>
            <Select
              name="skill_level"
              value={formData.skill_level}
              onChange={handleChange}
              placeholder="Select skill level"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="professional">Professional</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Requirements</FormLabel>
            <Textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="List team requirements"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Maximum Members</FormLabel>
            <NumberInput
              min={2}
              max={10}
              value={formData.max_members}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, max_members: parseInt(value) }))
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
            mt={4}
          >
            Create Team
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CreateTeam;
