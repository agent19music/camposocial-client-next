"use client";

import { createContext, ReactNode, useState, useEffect, useContext, useRef, useCallback } from "react";
import { AuthContextType, AuthProviderProps } from "../utils/types";
import { useRouter } from "next/navigation";
import { MarketplaceContext } from "./marketplacecontext";
import {toast} from 'react-hot-toast'

 

// Create the AuthContext with a default value (null user initially)
export const AuthContext = createContext<AuthContextType>({
  login: () => {},
  socialLogin: async () => {},
  completeProfile: async () => {},
  logout: () => {},
  currentUser: null,
  authToken: null,
  updateUserContext: () => {},
  onAuthChange: false,
  isProfileComplete: false,
  isAuthenticated: false,
  isLoading: true,
  showSocialModal: false,
    setShowSocialModal: () => {},
    sellerlogin: async () => {}
});

export default function AuthProvider({ children }: AuthProviderProps) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT; 
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onAuthChange, setOnAuthChange] = useState(false);
  const {sellerStatusChange} = useContext(MarketplaceContext)
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  
  // Add refs to prevent duplicate requests
  const fetchingUserRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize auth token from cookies on mount
  useEffect(() => {
    const getAuthToken = async () => {
      try {
        // Check for token in cookies via API
        const response = await fetch('/api/auth/get-token');
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            setAuthToken(data.token);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getAuthToken();
  }, []);

  async function sellerlogin(email: string, password: string) {
    try {
      const response = await fetch(`${apiEndpoint}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.token) {
        setAuthToken(data.token);
        setIsAuthenticated(true);
        toast.success('Welcome back');
        setOnAuthChange(!onAuthChange)
      }
      else {
        toast.error('Invalid username or password');
      }
    }
    catch (error) {
      console.error('Error logging in:', error);
      toast.error('An error occurred. Please try again.');
    }
  }

  async function login(username: string, password: string, apiEndpoint: string) {
    try {
      const response = await fetch(`${apiEndpoint}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (data.access_token) {
        // Set token via API route to set HTTP-only cookie
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: data.access_token }),
        });

        setAuthToken(data.access_token);
        setIsAuthenticated(true);
        toast.success('Welcome back');
        setOnAuthChange(!onAuthChange)
        
        // Check if user is new (no friends, yaps, etc.) and redirect accordingly
        setTimeout(() => router.push('/yaps'), 100);
      } else {
        toast.error('Invalid username or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('An error occurred. Please try again.');
    }
  }

  async function socialLogin(provider: string, data: any) {
    try {
      console.log(`Attempting ${provider} OAuth with data:`, data);
      
      if (!apiEndpoint) {
        throw new Error('API endpoint not configured');
      }
      
      const oauthEndpoint = apiEndpoint.replace('127.0.0.1', 'localhost');

      const response = await fetch(`${oauthEndpoint}/oauth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();
      console.log(`${provider} OAuth response:`, result);

      if (result.access_token) {
        // Set token via API route to set HTTP-only cookie
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: result.access_token }),
          credentials: 'include',
        });

        setAuthToken(result.access_token);
        setIsAuthenticated(true);
        setIsProfileComplete(result.is_profile_complete);
        setOnAuthChange(!onAuthChange);
        setShowSocialModal(false); // Close the modal on successful login
        
        if (!result.is_profile_complete) {
          toast.success('Welcome! Let\'s complete your profile');
          router.push('/complete-profile');
        } else {
          toast.success('Welcome back!');
          router.push('/yaps');
        }
      } else {
        const errorMessage = result.error || `${provider} authentication failed`;
        console.error(`${provider} OAuth error:`, result);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Social login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(`${provider} login failed: ${errorMessage}`);
    }
  }

  async function completeProfile(profileData: any) {
    try {
      const response = await fetch(`${apiEndpoint}/user/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (response.ok) {
        setIsProfileComplete(true);
        updateUserContext();
        router.push('/yaps');
        toast.success('Profile completed successfully');
      } else {
        toast.error(result.message || 'Failed to complete profile');
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      toast.error('Failed to complete profile');
    }
  }

  
  // Logout user
  async function logout() {
    try {
      // Clear token via API route
      await fetch('/api/auth/clear-token', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error clearing token:', error);
    }
    
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setCurrentUser(null)
    setAuthToken(null)
    setIsAuthenticated(false)
    fetchingUserRef.current = false;
    lastFetchTimeRef.current = 0;
    router.push('/login')
  }

  // Debounced user fetch function
  const fetchAuthenticatedUser = useCallback(async () => {
    if (!authToken || !isAuthenticated || !apiEndpoint || fetchingUserRef.current) {
      return;
    }

    // Debounce requests - only allow one request per 5 seconds
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 5000) {
      return;
    }

    fetchingUserRef.current = true;
    lastFetchTimeRef.current = now;
    setIsLoading(true);

    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${apiEndpoint}/authenticated_user`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear auth state
          setCurrentUser(null);
          setAuthToken(null);
          setIsAuthenticated(false);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const userData = await response.json();
      
      if (userData && (userData.email || userData.username)) {
        setCurrentUser(userData);
      } else {
        console.warn('Invalid user data received');
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching authenticated user:', error.message);
        
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setCurrentUser(null);
          setAuthToken(null);
          setIsAuthenticated(false);
        }
      }
    } finally {
      fetchingUserRef.current = false;
      setIsLoading(false);
    }
  }, [authToken, isAuthenticated, apiEndpoint]);

  // Get Authenticated user with proper debouncing
  useEffect(() => {
    if (authToken && isAuthenticated && apiEndpoint) {
      fetchAuthenticatedUser();
    } else {
      setIsLoading(false);
    }
  }, [authToken, isAuthenticated, apiEndpoint, fetchAuthenticatedUser]);

  // Separate effect for seller status changes that only triggers when needed
  useEffect(() => {
    if (currentUser && sellerStatusChange) {
      fetchAuthenticatedUser();
    }
  }, [sellerStatusChange, currentUser, fetchAuthenticatedUser]);
    
  const updateUserContext = useCallback(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  // The context data that will be passed down to components
  const contextData = {
    login,
    socialLogin,
    completeProfile,
    logout,
    currentUser,
    authToken,
    updateUserContext,
    onAuthChange,
    isProfileComplete,
    isAuthenticated,
    isLoading,
    showSocialModal,
    setShowSocialModal,
    sellerlogin
  };

  // Render the provider and pass the context data
  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext
export const useAuthContext = () => useContext(AuthContext);
