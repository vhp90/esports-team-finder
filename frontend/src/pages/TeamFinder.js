import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Select,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Badge,
  Avatar,
  Flex,
  useToast,
} from '@chakra-ui/react';

const TeamFinder = () => {
  const [selectedGame, setSelectedGame] = useState('');
  const [matches, setMatches] = useState([]);
  const toast = useToast();

  const mockMatches = [
    {
      id: 1,
      username: 'ProGamer123',
      skillLevel: 'Advanced',
      playStyle: 'Competitive',
      games: ['Valorant', 'CS:GO'],
    },
    {
      id: 2,
      username: 'TeamPlayer456',
      skillLevel: 'Intermediate',
      playStyle: 'Team-oriented',
      games: ['League of Legends', 'Dota 2'],
    },
  ];

  const handleFindMatches = () => {
    // TODO: Implement actual API call to find matches
    setMatches(mockMatches);
    toast({
      title: 'Matches Found!',
      description: 'We found some players that match your criteria.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleConnect = (matchId) => {
    toast({
      title: 'Connection Request Sent',
      description: 'The player will be notified of your interest to connect.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box maxW="container.xl" mx="auto" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Find Your Team</Heading>

        <Flex gap={4}>
          <Select
            placeholder="Select a game"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="valorant">Valorant</option>
            <option value="csgo">CS:GO</option>
            <option value="lol">League of Legends</option>
            <option value="dota2">Dota 2</option>
          </Select>
          <Button
            colorScheme="purple"
            onClick={handleFindMatches}
            isDisabled={!selectedGame}
          >
            Find Matches
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {matches.map((match) => (
            <Card key={match.id} variant="filled" bg="background.secondary">
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Flex align="center" gap={4}>
                    <Avatar name={match.username} />
                    <Box>
                      <Heading size="md">{match.username}</Heading>
                      <Text color="gray.400">{match.skillLevel}</Text>
                    </Box>
                  </Flex>

                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Games:
                    </Text>
                    <Flex gap={2} wrap="wrap">
                      {match.games.map((game) => (
                        <Badge
                          key={game}
                          colorScheme="purple"
                          variant="solid"
                        >
                          {game}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>
                      Play Style:
                    </Text>
                    <Badge colorScheme="green">{match.playStyle}</Badge>
                  </Box>

                  <Button
                    colorScheme="purple"
                    onClick={() => handleConnect(match.id)}
                  >
                    Connect
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default TeamFinder;
