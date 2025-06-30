"use client";

import { createContext, ReactNode, useState, useEffect, useContext, use } from "react";
import { useRouter } from "next/navigation";
import { MarketplaceContext } from "./marketplacecontext";
import {toast} from 'react-hot-toast'

interface User {
  username: string;
  password: string;
  onAuthChange: boolean;
}
type currentUser = {
  id: string
  first_name: string
  last_name: string
  address: string
  phone_no: string
  email: string
  avatar: string
  is_seller: boolean
  bio: string
  category: string
  username: string
} | null


// Define the AuthContext interface
interface AuthContextType {
  login: (username: string, password: string, apiEndpoint: string) => void;
  socialLogin: (provider: string, data: any) => Promise<void>;
  completeProfile: (profileData: any) => Promise<void>;
  logout: () => void;
  currentUser: currentUser | null;
  authToken: string | null;
  updateUserContext: () => void;
  onAuthChange: boolean;
  isProfileComplete: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

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
  isLoading: true
});

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT; 
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState <currentUser| null>(null)
  const [isLoading, setIsLoading] = useState(true);
  const [onAuthChange, setOnAuthChange] = useState(false)
  const {sellerStatusChange} = useContext(MarketplaceContext)
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        router.push('/yaps')
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
      
      const response = await fetch(`${apiEndpoint}/oauth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
        });

        setAuthToken(result.access_token);
        setIsAuthenticated(true);
        setIsProfileComplete(result.is_profile_complete);
        setOnAuthChange(!onAuthChange);
        
        toast.success(`Successfully signed in with ${provider}`);
        
        if (!result.is_profile_complete) {
          router.push('/complete-profile');
        } else {
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
    
    setCurrentUser(null)
    setAuthToken(null)
    setIsAuthenticated(false)
    router.push('/login')
  }

    // Get Authenticated user
    useEffect(() => {
        if (authToken && isAuthenticated) {
          setIsLoading(true);
          fetch(`${apiEndpoint}/authenticated_user`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
          })
            .then((res) => res.json())
            .then((response) => {
              if (response.email || response.username) {
                setCurrentUser(response)
              } else {
                setCurrentUser(null)
                setIsAuthenticated(false)
              }
            })
            .catch((error) => {
              console.error('Error fetching user:', error);
              setCurrentUser(null)
              setIsAuthenticated(false)
            })
            .finally(() => {
              setIsLoading(false);
            })
        } else {
          setIsLoading(false);
        }
      }, [authToken, onAuthChange, sellerStatusChange, isAuthenticated])
    
      const updateUserContext = () => {
        if (!authToken || !isAuthenticated) return;
        
        fetch(`${apiEndpoint}/authenticated_user`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        })
          .then((res) => res.json())
          .then((response) => {
            if (response.email || response.username) {
              setCurrentUser(response)
            } else {
              setCurrentUser(null)
              setIsAuthenticated(false)
            }
          })
          .catch((error) => {
            console.error('Error updating user context:', error);
            setCurrentUser(null)
            setIsAuthenticated(false)
          })
      }

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
    isLoading
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
