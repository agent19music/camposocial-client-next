"use client";

import { createContext, ReactNode, useState, useEffect, useContext, useRef, useCallback } from "react";
import type { AuthContextType, AuthProviderProps } from "@/types";
import { useRouter } from "next/navigation";
import { MarketplaceContext } from "./marketplacecontext";
import { toast } from 'react-hot-toast'
import { deriveKeyPassword } from "../lib/keyStorage";



// Create the AuthContext with a default value (null user initially)
export const AuthContext = createContext<AuthContextType>({
  login: () => { },
  socialLogin: async () => ({ success: false }),
  completeProfile: async () => { },
  logout: () => { },
  currentUser: null,
  authToken: null,
  updateUserContext: () => { },
  onAuthChange: false,
  isProfileComplete: false,
  isAuthenticated: false,
  isLoading: true,
  showSocialModal: false,
  setShowSocialModal: () => { },
  sellerlogin: async () => { },
  register: async () => ({ success: false }),
  sendOTP: async () => ({ success: false }),
  verifyOTP: async () => ({ success: false }),
  oauthLogin: async () => ({ success: false }),
  oauthSignup: async () => ({ success: false }),
});

export default function AuthProvider({ children, initialAuthToken }: AuthProviderProps) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onAuthChange, setOnAuthChange] = useState(false);
  const { sellerStatusChange } = useContext(MarketplaceContext)
  const [authToken, setAuthToken] = useState<string | null>(initialAuthToken || null);
  const router = useRouter();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialAuthToken);
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

        // Derive and store key password for E2EE auto-unlock
        // This allows the chat encryption keys to be automatically unlocked
        try {
          // Get user_id from response or decode from JWT
          let userId = data.user_id;
          if (!userId && data.access_token) {
            // Decode user_id from JWT payload (sub claim)
            const payload = JSON.parse(atob(data.access_token.split('.')[1]));
            userId = payload.sub;
          }

          if (userId) {
            const keyPassword = await deriveKeyPassword(password, userId);
            sessionStorage.setItem('e2ee_key_password', keyPassword);
          }
        } catch (e) {
          console.error('Failed to derive key password:', e);
        }

        toast.success('Welcome back');
        setOnAuthChange(!onAuthChange)

        // Fetch user data before redirecting to avoid auth race condition
        // This ensures the profile page sees the user as authenticated
        try {
          const userResponse = await fetch(`${apiEndpoint}/authenticated_user`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${data.access_token}`,
            },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setCurrentUser(userData);
            router.push(`/yaps/profile/${userData.username}`);
          } else {
            router.push('/yaps');
          }
        } catch {
          router.push('/yaps');
        }
      } else {
        toast.error('Invalid username or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error('An error occurred. Please try again.');
    }
  }

  async function socialLogin(provider: string, data: any): Promise<{ success: boolean }> {
    try {

      if (!apiEndpoint) {
        throw new Error('API endpoint not configured');
      }

      const response = await fetch(`${apiEndpoint}/oauth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();

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

        // Derive and store key password for E2EE (OAuth flow)
        // For OAuth users, we use a deterministic derivation based ONLY on userId
        // This ensures the same password is derived across all login sessions
        try {
          let userId = result.user_id;
          if (!userId && result.access_token) {
            const payload = JSON.parse(atob(result.access_token.split('.')[1]));
            userId = payload.sub;
          }

          if (userId) {
            // For OAuth, use ONLY userId as the base - must be stable across sessions!
            // The access_token changes each login, so we can't use it
            const oauthKeyBase = `oauth-e2ee-stable-key-${userId}`;
            const keyPassword = await deriveKeyPassword(oauthKeyBase, userId);
            sessionStorage.setItem('e2ee_key_password', keyPassword);
          }
        } catch (e) {
          console.error('Failed to derive key password for OAuth:', e);
        }

        if (!result.is_profile_complete) {
          toast.success('Welcome! Let\'s complete your profile');
          router.push('/complete-profile');
        } else {
          toast.success('Welcome back!');
          router.push('/yaps');
        }
        return { success: true };
      } else {
        const errorMessage = result.error || `${provider} authentication failed`;
        console.error(`${provider} OAuth error:`, result);
        toast.error(errorMessage);
        return { success: false };
      }
    } catch (error) {
      console.error('Social login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(`${provider} login failed: ${errorMessage}`);
      return { success: false };
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
        // Update user context to get fresh data
        updateUserContext();

        // Use the username from the server response as the authoritative source
        // This ensures we navigate to the correct profile with the username confirmed by the server
        // Fallback to form data or current user for backward compatibility
        const updatedUsername = result.user?.username || profileData.username || currentUser?.username;
        router.push(`/yaps/profile/${updatedUsername}`);

        // Show success message
        toast.success('Profile completed successfully!');

        // Show badge award notification if a badge was awarded
        if (result.badge_awarded && result.badge_info?.badge_name) {
          // Slight delay to avoid toast overlap
          setTimeout(() => {
            toast.success(`🎓 ${result.badge_info.badge_name} badge awarded!`, {
              duration: 5000,
              icon: '🏆'
            });
          }, 1000);
        }
      } else {
        toast.error(result.error || result.message || 'Failed to complete profile');
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

    // Clear E2EE key password from session
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('e2ee_key_password');
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
          if (response.status === 401 || response.status === 422 || response.status === 403) {
            // Token is invalid/unprocessable/forbidden — clear auth state AND the HTTP-only cookie
            console.warn(`Auth token rejected by server (${response.status}), clearing session`);
            setCurrentUser(null);
            setAuthToken(null);
            setIsAuthenticated(false);
            try { await fetch('/api/auth/clear-token', { method: 'POST' }); } catch { }
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
          // Any failure to validate the user should clear auth state
          // to prevent redirect loops with stale/invalid tokens
          setCurrentUser(null);
          setAuthToken(null);
          setIsAuthenticated(false);
          try { await fetch('/api/auth/clear-token', { method: 'POST' }); } catch { }
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

  // ============ New Registration Methods ============

  async function register(email: string, password: string) {
    try {
      const response = await fetch(`${apiEndpoint}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Verification code sent to your email');
        return { success: true, requiresVerification: true, message: result.message };
      } else {
        toast.error(result.error || 'Registration failed');
        return { success: false, message: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return { success: false, message: 'Registration failed' };
    }
  }

  async function sendOTP(email: string) {
    try {
      const response = await fetch(`${apiEndpoint}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (response.ok) {
        toast.success('Verification code sent');
        return { success: true, message: result.message };
      } else {
        toast.error(result.error || 'Failed to send code');
        return { success: false, message: result.error };
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      return { success: false, message: 'Failed to send code' };
    }
  }

  async function verifyOTP(email: string, code: string, password?: string) {
    try {
      const response = await fetch(`${apiEndpoint}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const result = await response.json();

      if (response.ok && result.access_token) {
        // Set token via API route to set HTTP-only cookie
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: result.access_token }),
        });

        setAuthToken(result.access_token);
        setIsAuthenticated(true);
        setIsProfileComplete(result.is_profile_complete);

        // Derive E2EE key for email/password users
        try {
          const userId = result.user_id;
          if (userId) {
            // Use password if provided (new registration), otherwise use stable base like OAuth
            let keyBase: string;
            if (password) {
              keyBase = password;
            } else {
              // Fallback for resend OTP flow - use email-based stable derivation
              keyBase = `email-e2ee-stable-key-${email}`;
            }
            const keyPassword = await deriveKeyPassword(keyBase, userId);
            sessionStorage.setItem('e2ee_key_password', keyPassword);
          }
        } catch (e) {
          console.error('Failed to derive key password for email user:', e);
        }

        toast.success('Email verified successfully!');

        if (!result.is_profile_complete) {
          router.push('/complete-profile');
        } else {
          router.push('/yaps');
        }
        return { success: true };
      } else {
        toast.error(result.error || 'Invalid verification code');
        return { success: false, message: result.error };
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  async function oauthLogin(provider: string, data: any): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${apiEndpoint}/oauth/${provider}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      const result = await response.json();

      if (result.no_account) {
        // User doesn't have an account - redirect to signup
        toast.error('No account found. Please sign up first.');
        router.push('/signup');
        return { success: false };
      }

      if (result.access_token) {
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: result.access_token }),
        });

        setAuthToken(result.access_token);
        setIsAuthenticated(true);
        setIsProfileComplete(result.is_profile_complete);
        setOnAuthChange(!onAuthChange);
        setShowSocialModal(false);

        // Derive E2EE key for OAuth users
        try {
          const userId = result.user_id;
          if (userId) {
            const oauthKeyBase = `oauth-e2ee-stable-key-${userId}`;
            const keyPassword = await deriveKeyPassword(oauthKeyBase, userId);
            sessionStorage.setItem('e2ee_key_password', keyPassword);
          }
        } catch (e) {
          console.error('Failed to derive key password for OAuth:', e);
        }

        if (!result.is_profile_complete) {
          toast.success("Welcome! Let's complete your profile");
          router.push('/complete-profile');
        } else {
          toast.success('Welcome back!');
          router.push('/yaps');
        }
        return { success: true };
      } else {
        const errorMessage = result.error || `${provider} login failed`;
        toast.error(errorMessage);
        return { success: false };
      }
    } catch (error) {
      console.error('OAuth login error:', error);
      toast.error(`${provider} login failed`);
      return { success: false };
    }
  }

  async function oauthSignup(provider: string, data: any) {
    // oauthSignup uses the existing socialLogin logic which creates accounts
    return socialLogin(provider, data);
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
    isLoading,
    showSocialModal,
    setShowSocialModal,
    sellerlogin,
    register,
    sendOTP,
    verifyOTP,
    oauthLogin,
    oauthSignup,
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
