import axios, { AxiosInstance, AxiosError } from 'axios';
import { storage } from '../utils/storage';
import { appConfig } from '../config/env';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
//  baseURL: appConfig.apiBaseUrl,
  baseURL: 'http://10.119.27.153:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API configuration on startup
if (__DEV__) {
  console.log('API Client initialized with baseURL:', appConfig.apiBaseUrl);
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    if (__DEV__) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });

    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      try {
        await storage.removeItem('authToken');
        await storage.removeItem('authUser');
      } catch (err) {
        console.error('Error clearing auth data:', err);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
