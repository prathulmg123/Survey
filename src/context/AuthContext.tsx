import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, googleLogout, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import authService from '../api/authService';

type GoogleCredentialResponse = {
  credential?: string;
  select_by?: string;
  [key: string]: any;
};

type User = {
  email: string;
  name: string;
  picture?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  logoutWithSessionExpired: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status and set up token expiration check
  const checkAuthStatus = useCallback(() => {
    const isAuthenticated = authService.isAuthenticated();
    if (!isAuthenticated) {
      handleLogout(true); // Pass true to indicate session expired
    } else if (authService.isTokenExpired()) {
      handleLogout(true); // Also check for token expiration
    }
    return isAuthenticated && !authService.isTokenExpired();
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      // Check auth status on initial load
      const isAuthValid = checkAuthStatus();
      if (!isAuthValid) {
        return; // Early return if not authenticated
      }
    } else {
      setLoading(false);
      // If no user data but we're on a protected route, redirect to login
      if (!window.location.pathname.includes('login')) {
        navigate('/login');
      }
      return;
    }

    // Set up interval to check token expiration every 30 seconds
    const checkInterval = setInterval(() => {
      const isAuthValid = checkAuthStatus();
      if (!isAuthValid) {
        clearInterval(checkInterval); // Stop checking if not authenticated
      }
    }, 30000); // Check every 30 seconds

    // Clean up interval on unmount
    return () => clearInterval(checkInterval);
  }, [checkAuthStatus, navigate]);

  const handleLogout = (sessionExpired = false) => {
    googleLogout();
    setUser(null);
    // Use authService logout which handles all cleanup
    authService.logout(navigate, sessionExpired);
    // Force a full page reload to ensure all state is cleared
    if (sessionExpired) {
      window.location.href = '/login?sessionExpired=true';
    }
  };

  const handleGoogleLoginSuccess = (credentialResponse: GoogleCredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        const decoded = jwtDecode<{ email: string; name: string; picture?: string }>(
          credentialResponse.credential
        );
        
        const userData = {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Google login failed');
  };

  const value = {
    user,
    loading,
    login: () => {},
    logout: () => handleLogout(false),
    logoutWithSessionExpired: () => handleLogout(true),
  };

  return (
    <AuthContext.Provider value={value}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        {children}
        <div className="hidden">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap
            auto_select
            text="continue_with"
            shape="rectangular"
            theme="outline"
            size="large"
            width="100%"
          />
        </div>
      </GoogleOAuthProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// GoogleLoginButton component has been moved to LoginPage component
