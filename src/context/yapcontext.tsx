"use client";

import { createContext, ReactNode, useState, useEffect, useContext } from "react";
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

  // Fetch yaps only when authenticated and not loading
  useEffect(() => {
    if (authLoading || !isAuthenticated || !authToken) {
      setYaps([]);
      setFilteredYaps([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`${apiEndpoint}/yaps`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch yaps');
        }
        return res.json();
      })
      .then((data) => {
        setYaps(data.yaps || []);
        setFilteredYaps(data.yaps || []); // Initially set filteredYaps to all yaps
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching yaps:", error);
        setYaps([]);
        setFilteredYaps([]);
        setIsLoading(false);
      });
  }, [onchange, isAuthenticated, authToken, authLoading]);

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
        toast.error('An unexpected error occured')
        throw new Error(`Failed to post Yap: ${response.statusText}`);
        
        
      }
  
      // Handle successful response
      const data = await response.json();
      setOnchange(!onchange)
      toast.success('Yap added')
  
      return response; // Optional, you can use this to handle response in the calling function
  
    } catch (error) {
      console.error('Error posting Yap:', error);
      toast.error('An unexpected error occured')
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
