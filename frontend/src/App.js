import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
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
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={5} textAlign="center">
          <h1>Something went wrong.</h1>
          <p>Please check the console for details.</p>
          <pre>{this.state.error?.toString()}</pre>
        </Box>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ChakraProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <WebSocketProvider>
                <Box minH="100vh" bg="gray.800">
                  <Navbar />
                  <NotificationCenter />
                  <Box p={4}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/team-finder"
                        element={
                          <ProtectedRoute>
                            <TeamFinder />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/teams"
                        element={
                          <ProtectedRoute>
                            <TeamList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/create-team"
                        element={
                          <ProtectedRoute>
                            <CreateTeam />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/chat"
                        element={
                          <ProtectedRoute>
                            <ChatPage />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Box>
                </Box>
              </WebSocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </ChakraProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
