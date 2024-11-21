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
        navigate('/login');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

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

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      await fetchUserProfile(access_token);
      navigate('/');
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });

      const response = await axios.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // After successful registration, automatically log in
      await login(userData.email, userData.password);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
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
