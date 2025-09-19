// Use Vite's import.meta.env for environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.0.195:8000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  USERS: '/api/users',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
