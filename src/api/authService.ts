import { AxiosError, AxiosResponse } from 'axios';
import { API_ENDPOINTS } from './config';
import apiClient from './apiClient';
import { decodeJwt, isTokenExpired as isJwtExpired } from '../utils/jwt';

// Store user details in localStorage
const storeUserDetails = (token: string) => {
  const user = decodeJwt(token);
  console.log('Logged in user:', user);
  if (user) {
    localStorage.setItem('user', JSON.stringify({
      email: user.sub,
      userId: user.user_id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      isActive: user.is_active
    }));
  }
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
        const token = response.data.access_token;
        localStorage.setItem('authToken', token);
        
        // Store user details from token
        storeUserDetails(token);
        
        // Set default authorization header
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return {
          ...response.data,
          user: JSON.parse(localStorage.getItem('user') || '{}')
        };
      }
      throw new Error('No access token received');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Get current user details
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  },
  
  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return roles.includes(user?.role);
  },

  async logout(navigate?: (path: string) => void, sessionExpired = false) {
    try {
      // Store the session expired state before clearing
      if (sessionExpired) {
        localStorage.setItem('sessionExpired', 'true');
      }
      
      // Get the current token before clearing
      const token = this.getAuthToken();
      
      // Clear all auth-related items from localStorage
      const sessionExpiredFlag = localStorage.getItem('sessionExpired');
      localStorage.clear();
      
      // Restore sessionExpired flag if it was set
      if (sessionExpired) {
        localStorage.setItem('sessionExpired', 'true');
      }
      
      // Clear axios authorization header
      delete apiClient.defaults.headers.common['Authorization'];
      
      try {
        // Only attempt to call the logout endpoint if we have a valid token
        if (token && !this.isTokenExpired()) {
          await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
      } catch (error) {
        console.error('Logout API error:', error);
        // Continue with navigation even if logout API call fails
      }
      
      // Force a redirect to login page
      const loginUrl = sessionExpired ? '/login?sessionExpired=true' : '/login';
      
      if (navigate) {
        navigate(loginUrl);
      } else {
        window.location.href = loginUrl;
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure we still redirect even if there's an error
      window.location.href = '/login';
    }
  },

  getAuthToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;
    
    // Check if token is expired
    if (this.isTokenExpired()) {
      // Clear the expired token
      localStorage.removeItem('authToken');
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
    const token = this.getAuthToken();
    return token ? isJwtExpired(token) : true;
  },
  
  // Get user ID from token
  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.userId || null;
  },
  
  // Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  },
};

export default authService;
