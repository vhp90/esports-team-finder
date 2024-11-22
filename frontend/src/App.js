import React from 'react';
import { ChakraProvider, Box, Text } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import TeamFinder from './pages/TeamFinder';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import TeamList from './components/TeamList';
import CreateTeam from './components/CreateTeam';
import NotificationCenter from './components/Notifications/NotificationCenter';
import ChatPage from './pages/ChatPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={4}>
          <Text color="red.500">Something went wrong. Please check the console for details.</Text>
          <Text color="gray.500">{this.state.error?.message}</Text>
        </Box>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <Router>
          <AuthProvider>
            <WebSocketProvider>
              <Box minH="100vh">
                <Navbar />
                <NotificationCenter />
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
                        <ChatPage />
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
    </ErrorBoundary>
  );
}

export default App;
