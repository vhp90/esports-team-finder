import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Heading,
  Text,
  useToast,
  Select,
  Stack,
  Badge,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const fetchTeams = async () => {
    try {
      const params = {};
      if (selectedGame) params.game = selectedGame;
      if (selectedSkillLevel) params.skill_level = selectedSkillLevel;
      
      const response = await axios.get('/teams', { params });
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch teams',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams, selectedGame, selectedSkillLevel]);

  const handleJoinTeam = async (teamId) => {
    try {
      await axios.post(`/teams/${teamId}/join`);
      toast({
        title: 'Success',
        description: 'Successfully joined team',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchTeams();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to join team',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Stack spacing={4} mb={6}>
        <Heading size="lg">Find Teams</Heading>
        <Stack direction={['column', 'row']} spacing={4}>
          <Select
            placeholder="Select Game"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="League of Legends">League of Legends</option>
            <option value="CSGO">CSGO</option>
            <option value="Valorant">Valorant</option>
            <option value="Dota 2">Dota 2</option>
          </Select>
          <Select
            placeholder="Select Skill Level"
            value={selectedSkillLevel}
            onChange={(e) => setSelectedSkillLevel(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="professional">Professional</option>
          </Select>
          <Button colorScheme="blue" onClick={() => navigate('/teams/create')}>
            Create Team
          </Button>
        </Stack>
      </Stack>

      <Grid templateColumns={['1fr', '1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap={6}>
        {teams.map((team) => (
          <Box
            key={team.id}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
          >
            <Stack spacing={3}>
              <Heading size="md">{team.name}</Heading>
              <Text color="gray.600">{team.description}</Text>
              <Stack direction="row" spacing={2}>
                <Badge colorScheme="blue">{team.game}</Badge>
                <Badge colorScheme="green">{team.skill_level}</Badge>
                <Badge colorScheme="purple">
                  {team.members.length}/{team.max_members} members
                </Badge>
              </Stack>
              <Text fontSize="sm" color="gray.500">
                Requirements: {team.requirements}
              </Text>
              {user && !team.members.includes(user.id) && (
                <Button
                  colorScheme="blue"
                  onClick={() => handleJoinTeam(team.id)}
                  isDisabled={team.members.length >= team.max_members}
                >
                  {team.members.length >= team.max_members ? 'Team Full' : 'Join Team'}
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default TeamList;
