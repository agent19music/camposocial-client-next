"use client";

import { createContext, ReactNode, useState, useEffect, useContext, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { AuthContext } from "./authcontext";
import {toast} from 'react-hot-toast'


// Yap interface to define the structure of each yap
interface Yap {
  id: string;
  media: [];
  content: string;
  timestamp: string;
  username: string;
  handle: string;
  avatar: string;
  replies: [];
}

// YapContextProps to define the types used in the context
interface YapContextProps {
  yaps: Yap[];
  isLoading: boolean;
  onchange: boolean;
  setOnchange: (value: boolean) => void;
  selectedYap: Yap | null; // Null when no Yap is selected
  setSelectedYap: (yap: Yap | null) => void; // Setter function for selectedYap
  navigateToSingleYapView: (yap: Yap, flag: string) => void; // Add this to the interface
  postYap : (payload:YapPayload ) => void;
}

interface YapPayload {
  content: string;
  location?: string;
  originalYapId?: number; // Optional: for retweets
  mediaFiles?: File[];    // Optional: images or videos
}

// Default values for the context
const defaultValue: YapContextProps = {
  yaps: [],
  isLoading: false,
  onchange: false,
  selectedYap: null, // No yap selected by default
  setSelectedYap: () => {}, // No-op function for default
  setOnchange: () => {},
  navigateToSingleYapView: () => {}, // No-op function for default
  postYap: () => {}
};

// Create the YapContext with default values
export const YapContext = createContext<YapContextProps>(defaultValue);

// YapProviderProps to define the children prop type
interface YapProviderProps {
  children: ReactNode;
}

// YapProvider component to wrap the application
export default function YapProvider({ children }: YapProviderProps) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT; // API endpoint from environment variables
  const { authToken, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);

  // State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [yaps, setYaps] = useState<Yap[]>([]);
  const [filteredYaps, setFilteredYaps] = useState<Yap[]>([]);
  const [onchange, setOnchange] = useState(false);
  const [category, setCategory] = useState("Fun"); // Default category
  const [selectedYap, setSelectedYap] = useState<Yap | null>(null); // Initially no yap is selected

  const router = useRouter(); // Initialize the router

  // Rate limiting and debouncing refs
  const lastFetchTimeRef = useRef(0);
  const requestCountRef = useRef(0);
  const rateLimitWindowRef = useRef(0);
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRequestsRef = useRef(new Set<string>());

  // Rate limiting configuration
  const RATE_LIMIT_WINDOW = 60000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 15;
  const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests
  const DEBOUNCE_DELAY = 1000; // 1 second debounce for UI changes

  // Rate limiting function
  const canMakeRequest = useCallback((requestType: string): boolean => {
    const now = Date.now();
    
    // Check if we're within the rate limit window
    if (now - rateLimitWindowRef.current > RATE_LIMIT_WINDOW) {
      // Reset rate limit window
      rateLimitWindowRef.current = now;
      requestCountRef.current = 0;
    }
    
    // Check request count
    if (requestCountRef.current >= MAX_REQUESTS_PER_WINDOW) {
      console.warn(`Rate limit exceeded for ${requestType}. Please try again later.`);
      toast.error('Too many requests. Please wait before trying again.');
      return false;
    }
    
    // Check minimum interval between requests
    if (now - lastFetchTimeRef.current < MIN_REQUEST_INTERVAL) {
      console.warn(`Request too frequent for ${requestType}. Debouncing...`);
      return false;
    }
    
    // Check if this request type is already active
    if (activeRequestsRef.current.has(requestType)) {
      console.warn(`Request ${requestType} already in progress. Skipping duplicate.`);
      return false;
    }
    
    return true;
  }, []);

  // Mark request as started
  const markRequestStart = useCallback((requestType: string) => {
    const now = Date.now();
    lastFetchTimeRef.current = now;
    requestCountRef.current += 1;
    activeRequestsRef.current.add(requestType);
  }, []);

  // Mark request as completed
  const markRequestEnd = useCallback((requestType: string) => {
    activeRequestsRef.current.delete(requestType);
  }, []);

  // Debounced fetch yaps function
  const fetchYaps = useCallback(async () => {
    if (authLoading || !isAuthenticated || !authToken || !apiEndpoint || fetchingRef.current) {
      setYaps([]);
      setFilteredYaps([]);
      setIsLoading(false);
      return;
    }

    if (!canMakeRequest('fetch_yaps')) {
      return;
    }

    fetchingRef.current = true;
    markRequestStart('fetch_yaps');
    setIsLoading(true);

    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${apiEndpoint}/yaps`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear data and don't retry
          setYaps([]);
          setFilteredYaps([]);
          toast.error('Session expired. Please log in again.');
          return;
        } else if (response.status === 404) {
          console.warn('Yaps endpoint not found');
          setYaps([]);
          setFilteredYaps([]);
          return;
        } else if (response.status === 429) {
          toast.error('Too many requests. Please wait before trying again.');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setYaps(data.yaps || []);
      setFilteredYaps(data.yaps || []); // Initially set filteredYaps to all yaps
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching yaps:", error);
        setYaps([]);
        setFilteredYaps([]);
        toast.error('Failed to load yaps. Please try again later.');
      }
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
      markRequestEnd('fetch_yaps');
    }
  }, [authLoading, isAuthenticated, authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd]);

  // Fetch yaps only when authenticated and not loading
  useEffect(() => {
    if (authLoading || !isAuthenticated || !authToken) {
      setYaps([]);
      setFilteredYaps([]);
      setIsLoading(false);
      return;
    }

    // Debounce the fetch request
    const timeoutId = setTimeout(() => {
      fetchYaps();
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onchange, isAuthenticated, authToken, authLoading, fetchYaps]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      activeRequestsRef.current.clear();
    };
  }, []);

  // Function to create a slug from yap id
  function slugify(int: string) {
    const baseSlug = int;
    return `${baseSlug}-${nanoid(12)}`;
  }



  // Function to navigate to a single Yap view
  function navigateToSingleYapView(yap: Yap, flag: string) {    
    const slug = slugify(yap.id);
    
    setSelectedYap(yap);    
  
    router.push(`/yaps/${slug}`); // Navigate to the single product page
    
    if (flag === 'spc') {
      router.refresh(); // Use router.refresh to reload the current page
    }
  }
  
   const postYap = async (yapPayload: YapPayload): Promise<Response | void> => {
    if (!isAuthenticated || !authToken) {
      toast.error('Please log in to post a yap');
      return;
    }

    if (!apiEndpoint) {
      toast.error('Service not available. Please try again later.');
      return;
    }

    if (!canMakeRequest('post_yap')) {
      return;
    }

    markRequestStart('post_yap');

    const { content, location, originalYapId, mediaFiles } = yapPayload;

    
    
  
    // Create a FormData object to handle both text and files
    const formData = new FormData();
    formData.append('content', content);
  
    // Append optional fields if present
    if (location) {
      formData.append('location', location);
    }
  
    if (originalYapId) {
      formData.append('original_yap_id', originalYapId.toString());
    }
  
    // Append media files, if any exist
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file, index) => {
        formData.append('media', file); // Automatically handles multiple files
      });
    }
  
    try {
      // Make the fetch request
      
      
      const response = await fetch(`${apiEndpoint}/add_yap`, {
        method: 'POST',
        headers: {
          // Do not set 'Content-Type' header; fetch will automatically set it with multipart boundary for FormData
          'Authorization': `Bearer ${authToken}` // Using the authToken from context
        },
        body: formData // The FormData object that contains the Yap payload
      });
  
      // Check if the response is successful
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          return;
        } else if (response.status === 429) {
          toast.error('Too many requests. Please wait before trying again.');
          return;
        } else if (response.status === 413) {
          toast.error('File too large. Please choose smaller files.');
          return;
        }
        toast.error('Failed to post yap. Please try again.');
        throw new Error(`Failed to post Yap: ${response.statusText}`);
        
        
      }
  
      // Handle successful response
      const data = await response.json();
      setOnchange(!onchange)
      toast.success('Yap posted successfully!');
  
      return response; // Optional, you can use this to handle response in the calling function
  
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error posting Yap:', error);
        toast.error('Failed to post yap. Please try again.');
      }
    } finally {
      markRequestEnd('post_yap');
    }
  };
  

  // The context data that will be passed down to components
  const contextData = {
    yaps: filteredYaps,
    selectedYap,
    isLoading,
    onchange,
    setOnchange,
    setSelectedYap,
    navigateToSingleYapView ,
    postYap// Include this in the context data
  };

  // Render the provider and pass the context data
  return (
    <YapContext.Provider value={contextData}>
      {children}
    </YapContext.Provider>
  );
}

// Custom hook to use the YapContext
export const useYapContext = () => useContext(YapContext);
