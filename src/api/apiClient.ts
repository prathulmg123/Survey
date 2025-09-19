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
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('[API] Request Timeout:', error.config.url);
      error.message = 'The request took too long. Please try again.';
    } else if (error.response) {
      // Server responded with a status code outside 2xx
      console.error('[API] Response Error:', {
        url: error.config.url,
        status: error.response.status,
        data: error.response.data,
      });
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
