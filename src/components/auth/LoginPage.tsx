import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import authService from "@/api/authService";

type GoogleCredentialResponse = {
  credential?: string;
  clientId?: string;
  select_by?: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleClientId] = useState(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('Google Client ID is not set in environment variables');
    }
    return clientId || '';
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // In your LoginPage component
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('sessionExpired') === 'true') {
    // Show a message to the user that their session has expired
    toast.error('Your session has expired. Please log in again.');
    // Optionally clear the query parameter from the URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

  // Check for session expired flag on component mount
  useEffect(() => {
    const sessionExpired = localStorage.getItem('sessionExpired');
    if (sessionExpired === 'true') {
      toast.error('Session expired. Please log in again.');
      // Clear the flag after showing the toast
      localStorage.removeItem('sessionExpired');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        email: email,
        password: password
      });
      console.log("Login response:", response);
      // Store user email in localStorage for display purposes
      localStorage.setItem("userEmail", email);
      localStorage.setItem("isAuthenticated", "true");
      
      toast.success("Login successful! Taking you to your dashboard...");
      navigate("/dashboard");
    } catch (error: any) {  
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.detail || 'An error occurred during login';
        toast.error(errorMessage);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        toast.error('Error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsGoogleLoading(true);
      if (credentialResponse.credential) {
        console.log("Google credential:", credentialResponse.credential)
        // Send the Google credential to your backend for verification
        const response = await authService.verifyGoogleToken(credentialResponse.credential);
        
        // If verification is successful, the backend should return user data
        if (response && response.user) {
          // Store user data in localStorage
          localStorage.setItem("user", JSON.stringify(response.user));
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("token", response.token || '');
          
          toast.success("Login successful!");
          navigate("/dashboard");
        } else {
          throw new Error('Invalid response from server');
        }
      }
    } catch (error: any) {
      console.error('Error during Google login:', error);
      const errorMessage = error.response?.data?.message || 'Failed to sign in with Google';
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign in failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center" data-theme="light">
      {/* Left curved blue shape */}
      <div className="absolute left-0 top-0 w-1/2 h-full pointer-events-none">
        <div className="absolute -left-32 top-0 w-96 h-full">
          <div className="w-full h-full bg-accent-blue rounded-r-full transform scale-150 origin-left"></div>
        </div>
        <div className="absolute -left-20 top-20 w-80 h-96">
          <div className="w-full h-full bg-accent-blue/70 rounded-r-full transform scale-125 origin-left"></div>
        </div>
      </div>

      {/* Right curved gray shapes */}
      <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-none">
        <div className="absolute -right-32 top-0 w-96 h-full">
          <div className="w-full h-full bg-accent-light-gray rounded-l-full transform scale-150 origin-right"></div>
        </div>
        <div className="absolute -right-20 bottom-20 w-80 h-96">
          <div className="w-full h-full bg-accent-gray/30 rounded-l-full transform scale-125 origin-right"></div>
        </div>
      </div>

      {/* Bottom left dots pattern */}
      <div className="absolute bottom-8 left-8 grid grid-cols-4 gap-2 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-accent-blue rounded-full opacity-60"
          ></div>
        ))}
      </div>

      {/* Top right navigation */}
      {/* <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
        <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
          Register
        </Button>
        <Button variant="default" size="sm" className="bg-accent-blue hover:bg-accent-blue/90">
          Sign In
        </Button>
      </div> */}

      {/* Main Content */}
      <div className="w-full max-w-md mx-auto px-6 z-10">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Katalyze.<span className="text-accent-blue">ai</span>
            </h1>
            {/* <p className="text-accent-blue text-sm font-medium tracking-wider uppercase">
              COMPLIANCE
            </p> */}
          </div>

          {/* <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h2> */}
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-gray-100 shadow-xl rounded-2xl overflow-hidden  hover:shadow-2xl transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back</h2>
              <p className="text-gray-500">Sign in to continue to your account</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-accent-blue transition-colors" />
                  </div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all bg-gray-50/50 hover:bg-white"
                    noDarkMode
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-accent-blue transition-colors" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 h-14 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all bg-gray-50/50 hover:bg-white"
                    noDarkMode
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 text-gray-400 hover:text-accent-blue hover:bg-accent-blue/10 rounded-xl transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-accent-blue to-blue-600 hover:from-accent-blue/90 hover:to-blue-600/90 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="w-full">
                  <GoogleOAuthProvider 
                    clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                    onScriptLoadError={() => {
                      console.error('Failed to load Google OAuth script');
                      toast.error('Failed to load Google Sign In. Please try again later.');
                    }}
                    onScriptLoadSuccess={() => {
                      console.log('Google OAuth script loaded successfully');
                    }}
                  >
                    <GoogleLogin
                      onSuccess={async (credentialResponse: GoogleCredentialResponse) => {
                        try {
                          setIsGoogleLoading(true);
                          setIsLoading(true);
                          // Send the credential to your backend for verification
                          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/google`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              google_token: credentialResponse.credential,
                            }),
                          });

                          if (!response.ok) {
                            throw new Error('Authentication failed');
                          }

                          const data = await response.json();
                          
                          // Store the authentication token and user data
                          localStorage.setItem('authToken', data.access_token);
                          localStorage.setItem('user', JSON.stringify(data.user));
                          localStorage.setItem("userEmail", data.user.email);
                          localStorage.setItem('isAuthenticated', 'true');
                          
                          toast.success('Login successful!');
                          navigate('/dashboard');
                        } catch (error) {
                          console.error('Google login error:', error);
                          toast.error('Failed to sign in with Google. Please try again.');
                        } finally {
                          setIsGoogleLoading(false);
                          setIsLoading(false);
                        }
                      }}
                      onError={() => {
                        toast.error('Google Sign In failed');
                        setIsGoogleLoading(false);
                        setIsLoading(false);
                      }}
                      useOneTap
                      auto_select
                      text="continue_with"
                      shape="rectangular"
                      theme="outline"
                      size="large"
                      width="100%"
                    />
                  </GoogleOAuthProvider>
                </div> */}
              </div>

              <div className="text-center">
                <Button 
                  variant="link" 
                  disabled
                  className="text-gray-300 dark:text-gray-600 p-0 [&_*]:!text-inherit cursor-not-allowed"
                  title="Forgot Password is currently disabled"
                >
                  Forgot Password?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;