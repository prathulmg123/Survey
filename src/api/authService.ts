import { AxiosError, AxiosResponse } from 'axios';
import { API_ENDPOINTS } from './config';
import apiClient from './apiClient';

// Check if token is expired
const isTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  if (!expiresAt) return true;
  
  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = new Date().getTime();
  
  return currentTime >= expirationTime;
};

// Setup response interceptor to handle 401 responses
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If error is not 401 or we've already retried, reject
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }
    
    try {
      // Try to refresh the token
      const newToken = await authService.refreshToken();
      if (newToken) {
        // Update the authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        // Retry the original request with the new token
        return apiClient(originalRequest);
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      // If refresh fails, log the user out
      authService.logout();
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      if (response.data.access_token) {
        localStorage.setItem('authToken', response.data.access_token);
        // Store token expiration time (current time + expires_in seconds)
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (response.data.expires_in || 1800));
        localStorage.setItem('tokenExpiresAt', expiresAt.toISOString());
        
        return response.data;
      }
      throw new Error('No access token received');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout(navigate?: (path: string) => void) {
    try {
      // Call the logout API endpoint if needed
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear all auth-related items from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiresAt');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isAuthenticated');
      
      // Clear axios authorization header
      delete apiClient.defaults.headers.common['Authorization'];
      
      // If navigate function is provided, use it for client-side navigation
      if (navigate) {
        navigate('/login');
      } else {
        // Fallback to window.location if navigate is not provided
        window.location.href = '/login';
      }
    }
  },

  getAuthToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;
    
    // Check if token is expired
    if (isTokenExpired()) {
      this.logout();
      return false;
    }
    
    return true;
  },

  // Refresh the access token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return null;
    }

    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken,
      });
      
      if (response.data.access_token) {
        const { access_token, expires_in } = response.data;
        localStorage.setItem('authToken', access_token);
        
        // Update token expiration time
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (expires_in || 1800));
        localStorage.setItem('tokenExpiresAt', expiresAt.toISOString());
        
        return access_token;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.logout();
    }
    return null;
  },
  
  // Check if token is expired (exposed for external use if needed)
  isTokenExpired() {
    return isTokenExpired();
  },
};

export default authService;
