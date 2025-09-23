// Fallback API URL in case environment variable is not set
const FALLBACK_API_URL = 'http://vpn.seqato.com:8001';

// Get API base URL from environment variables or use fallback
const getApiBaseUrl = () => {
  // In production, use window.ENV if available (set by server) or fallback
  if (import.meta.env.PROD) {
    return (window as any).ENV?.VITE_API_BASE_URL || FALLBACK_API_URL;
  }
  // In development, use Vite's environment variables
  return import.meta.env.VITE_API_BASE_URL || FALLBACK_API_URL;
};

const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    GOOGLE: '/api/auth/google',
  },
  USERS: '/api/users',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
