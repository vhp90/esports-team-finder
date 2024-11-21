import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import TeamFinder from './pages/TeamFinder';
import Chat from './pages/Chat';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import TeamList from './components/TeamList';
import CreateTeam from './components/CreateTeam';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <AuthProvider>
          <WebSocketProvider>
            <Box minH="100vh">
              <Navbar />
              <Box p={4}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/teams" element={
                    <ProtectedRoute>
                      <TeamList />
                    </ProtectedRoute>
                  } />
                  <Route path="/teams/create" element={
                    <ProtectedRoute>
                      <CreateTeam />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  <Route path="/" element={<Home />} />
                  <Route path="/team-finder" element={
                    <ProtectedRoute>
                      <TeamFinder />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Box>
            </Box>
          </WebSocketProvider>
        </AuthProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;
