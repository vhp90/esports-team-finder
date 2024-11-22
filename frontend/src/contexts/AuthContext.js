import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { setTokens, getAccessToken, clearTokens } from '../utils/auth';

const AuthContext = createContext(null);

// Configure axios defaults
const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://esports-team-finder.onrender.com' : 'http://localhost:8000');
axios.defaults.baseURL = API_URL;

// Add request interceptor to handle API URL
axios.interceptors.request.use((config) => {
  if (!config.url.startsWith('http')) {
    config.url = `${API_URL}${config.url}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (authToken) => {
    if (!authToken) {
      setLoading(false);
      setIsAuthenticated(false);
      return null;
    }

    try {
      const response = await axios.get('/api/auth/profile', {
        headers: { 
          'Authorization': `Bearer ${authToken}`
        }
      });
      setUser(response.data);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      if (error.response?.status === 401) {
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      fetchUserProfile(accessToken).catch(() => {
        setLoading(false);
        setIsAuthenticated(false);
      });
    } else {
      setLoading(false);
      setIsAuthenticated(false);
    }
  }, [fetchUserProfile]);

  const login = async (usernameOrEmail, password) => {
    try {
      console.log('Attempting login with:', usernameOrEmail);
      
      // Validate input
      if (!usernameOrEmail || !password) {
        throw new Error('Username and password are required');
      }

      // Create form data
      const formData = new FormData();
      formData.append('username', usernameOrEmail);
      formData.append('password', password);

      // Make login request
      const response = await axios.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Login response:', response.data);

      // Check for tokens
      if (!response.data.access_token || !response.data.refresh_token) {
        throw new Error('Invalid token response');
      }

      // Store tokens
      setTokens(response.data.access_token, response.data.refresh_token);
      
      // Fetch user profile
      await fetchUserProfile(response.data.access_token);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid username or password');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration with:', userData);
      
      // Create a new FormData instance
      const formData = new FormData();
      
      // Append all user data to FormData
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });

      // Make the registration request
      const response = await axios.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Registration response:', response.data);

      if (response.data.access_token && response.data.refresh_token) {
        // Store tokens
        setTokens(response.data.access_token, response.data.refresh_token);
        
        // Fetch user profile
        await fetchUserProfile(response.data.access_token);
        setIsAuthenticated(true);
        
        // Navigate to home page
        navigate('/');
      } else {
        throw new Error('Invalid token response after registration');
      }

      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    }
  };

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
