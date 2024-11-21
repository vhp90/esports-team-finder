import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Configure axios defaults
const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await axios.get('/api/auth/profile', {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const login = async (usernameOrEmail, password) => {
    try {
      console.log('Attempting login with:', usernameOrEmail);
      const formData = new FormData();
      formData.append('username', usernameOrEmail);
      formData.append('password', password);
      formData.append('grant_type', 'password');

      const response = await axios.post('/api/auth/login', formData);
      console.log('Login response:', response.data);

      const { access_token } = response.data;
      if (!access_token) {
        throw new Error('No access token received');
      }

      localStorage.setItem('token', access_token);
      await fetchUserProfile(access_token);
      navigate('/');
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response || error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('Registration data:', userData);
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });

      const response = await axios.post('/api/auth/register', formData);
      console.log('Registration response:', response.data);

      const { access_token } = response.data;
      if (!access_token) {
        throw new Error('No access token received');
      }

      localStorage.setItem('token', access_token);
      await fetchUserProfile(access_token);
      navigate('/');
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response || error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading
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
