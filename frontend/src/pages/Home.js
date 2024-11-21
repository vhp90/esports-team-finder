import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaUsers, FaGamepad, FaComments } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const Feature = ({ title, text, icon }) => {
  return (
    <VStack
      bg={useColorModeValue('background.secondary', 'gray.700')}
      p={8}
      borderRadius="lg"
      boxShadow="xl"
      spacing={4}
      align="center"
      _hover={{ transform: 'translateY(-5px)', transition: 'all 0.2s' }}
    >
      <Icon as={icon} w={10} h={10} color="brand.accent" />
      <Heading size="md">{title}</Heading>
      <Text textAlign="center" color="gray.400">
        {text}
      </Text>
    </VStack>
  );
};

const Home = () => {
  return (
    <Box>
      <Container maxW="container.xl" py={20}>
        <VStack spacing={8} align="center" mb={16}>
          <Heading
            size="2xl"
            bgGradient="linear(to-r, brand.accent, brand.primary)"
            bgClip="text"
          >
            Find Your Perfect Esports Team
          </Heading>
          <Text fontSize="xl" color="gray.400" textAlign="center" maxW="2xl">
            Connect with players who match your skill level, gaming preferences,
            and play style. Build your dream team and dominate the competition!
          </Text>
          <Button
            as={RouterLink}
            to="/team-finder"
            size="lg"
            colorScheme="purple"
            px={8}
          >
            Get Started
          </Button>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <Feature
            icon={FaGamepad}
            title="Game Matching"
            text="Find players who share your favorite games and competitive spirit."
          />
          <Feature
            icon={FaUsers}
            title="Team Building"
            text="Create or join teams that match your skill level and goals."
          />
          <Feature
            icon={FaComments}
            title="Real-time Chat"
            text="Communicate with potential teammates instantly through our chat system."
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Home;
