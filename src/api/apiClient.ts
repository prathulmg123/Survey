import axios from 'axios';
import config from './config';

const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 60000, // Increased to 60 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API] Auth Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear auth data and redirect to login with session expired flag
      localStorage.setItem('sessionExpired', 'true');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      
      // Redirect to login page
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle timeouts
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request Timeout:', error.config?.url);
      return Promise.reject(new Error('Request timed out. Please check your connection and try again.'));
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API] No Response:', error.request);
      error.message = 'No response from server. Please check your connection.';
    } else {
      console.error('[API] Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
