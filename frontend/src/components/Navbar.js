import React from 'react';
import { Box, Flex, Button, Heading, useColorModeValue, Menu, MenuButton, MenuList, MenuItem, Avatar } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const bgColor = useColorModeValue('background.secondary', 'background.primary');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box bg={bgColor} px={4} boxShadow="md">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <RouterLink to="/">
          <Heading size="md" color="brand.accent">Esports Team Finder</Heading>
        </RouterLink>

        <Flex alignItems="center" gap={4}>
          {user ? (
            <>
              <Button as={RouterLink} to="/team-finder" variant="ghost">
                Find Team
              </Button>
              <Button as={RouterLink} to="/chat" variant="ghost">
                Chat
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  rightIcon={<Avatar size="sm" name={user.username} />}
                >
                  {user.username}
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button as={RouterLink} to="/login" variant="ghost">
                Login
              </Button>
              <Button as={RouterLink} to="/register" variant="solid" colorScheme="purple">
                Register
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
