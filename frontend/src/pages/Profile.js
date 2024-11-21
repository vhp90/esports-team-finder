import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
  Tag,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';

const Profile = () => {
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState('');
  const toast = useToast();

  const handleAddGame = () => {
    if (newGame && !games.includes(newGame)) {
      setGames([...games, newGame]);
      setNewGame('');
    }
  };

  const handleRemoveGame = (gameToRemove) => {
    setGames(games.filter(game => game !== gameToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement profile update logic
    toast({
      title: 'Profile Updated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box maxW="container.md" mx="auto" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Your Profile</Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input placeholder="Your gaming username" />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" placeholder="your@email.com" />
            </FormControl>

            <FormControl>
              <FormLabel>Games</FormLabel>
              <HStack mb={2}>
                <Input
                  value={newGame}
                  onChange={(e) => setNewGame(e.target.value)}
                  placeholder="Add a game"
                />
                <IconButton
                  icon={<AddIcon />}
                  onClick={handleAddGame}
                  colorScheme="purple"
                />
              </HStack>
              <HStack wrap="wrap" spacing={2}>
                {games.map((game) => (
                  <Tag
                    key={game}
                    size="lg"
                    borderRadius="full"
                    variant="solid"
                    colorScheme="purple"
                  >
                    {game}
                    <IconButton
                      size="xs"
                      ml={1}
                      icon={<CloseIcon />}
                      onClick={() => handleRemoveGame(game)}
                      variant="ghost"
                    />
                  </Tag>
                ))}
              </HStack>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Skill Level</FormLabel>
              <Select placeholder="Select skill level">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Play Style</FormLabel>
              <Select placeholder="Select play style">
                <option value="casual">Casual</option>
                <option value="competitive">Competitive</option>
                <option value="team-oriented">Team-oriented</option>
                <option value="solo">Solo Player</option>
              </Select>
            </FormControl>

            <Button type="submit" colorScheme="purple" size="lg">
              Save Profile
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default Profile;
