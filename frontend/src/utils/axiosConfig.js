import axios from 'axios';
import { getAccessToken, refreshAccessToken } from './auth';

// Add a request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is not 401 or we already tried to refresh, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Try to refresh the token
      const newAccessToken = await refreshAccessToken();
      
      // Update the failed request with the new token
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      
      // Retry the original request
      return axios(originalRequest);
    } catch (refreshError) {
      // If refresh fails, reject with the original error
      return Promise.reject(error);
    }
  }
);
