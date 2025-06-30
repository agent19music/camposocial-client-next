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
  isProfileComplete: false
});

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT; 
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState <currentUser| null>(null)
  const [isLoading, setIsLoading] = useState(false);
  const [onAuthChange, setOnAuthChange] = useState(false)
  const {sellerStatusChange} = useContext(MarketplaceContext)
  const [authToken, setAuthToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('authToken');
    }
    return null;
  });
  const router = useRouter();
  const [isProfileComplete, setIsProfileComplete] = useState(true);

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
        sessionStorage.setItem('authToken', data.access_token);
        setAuthToken(data.access_token);
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
      const response = await fetch(`${apiEndpoint}/oauth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.access_token) {
        sessionStorage.setItem('authToken', result.access_token);
        setAuthToken(result.access_token);
        setIsProfileComplete(result.is_profile_complete);
        setOnAuthChange(!onAuthChange);
        
        if (!result.is_profile_complete) {
          router.push('/complete-profile');
        } else {
          router.push('/yaps');
        }
      }
    } catch (error) {
      console.error('Social login error:', error);
      toast.error('Authentication failed');
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
  function logout() {
    sessionStorage.removeItem('authToken')
    setCurrentUser(null)
    setAuthToken(null)
    router.push('/login')
  }

    // Get Authenticated user
    useEffect(() => {
        if (authToken) {
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
              }
            })
        }
      }, [authToken, onAuthChange,sellerStatusChange])
    
      const updateUserContext = () => {
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
            }
          })
          .catch((error) => {
            console.error('Error fetching user data:', error);
          });
      };
    

  const contextData: AuthContextType = {
    currentUser,
    authToken,
    updateUserContext,
    login,
    logout,
    socialLogin,
    completeProfile,
    onAuthChange,
    isProfileComplete
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
