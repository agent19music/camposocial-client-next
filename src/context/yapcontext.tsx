"use client";

import { createContext, ReactNode, useState, useEffect, useContext, useRef, useCallback } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { AuthContext } from "./authcontext";
import {toast} from 'react-hot-toast'
import { Yap, MediaItem, Reply, HashtagSuggestion, LocationSuggestion, YapContextProps, YapPayload, WhoToFollowSuggestion } from "../utils/types";


// Types moved to src/utils/types.ts

// Default values for the context
const defaultValue: YapContextProps = {
  yaps: [],
  isLoading: false,
  onchange: false,
  selectedYap: null, // No yap selected by default
  setSelectedYap: () => {}, // No-op function for default
  setOnchange: () => {},
  navigateToSingleYapView: () => {}, // No-op function for default
  postYap: async () => {},
  
  // Social interactions
  toggleLike: async () => {},
  addReply: async () => {},
  retweet: async () => {},
  quoteRetweet: async () => {},
  
  // Feed management
  feedType: 'chronological',
  setFeedType: () => {},
  refreshFeed: async () => {},
  
  // Single yap fetching
  fetchYapById: async () => null,
  
  // Suggestions
  getHashtagSuggestions: async () => [],
  getLocationSuggestions: async () => [],
  
  // Reply management
  yapReplies: [],
  setYapReplies: () => {},
  
  // Who to follow
  whotofollow: async () => [],
  whotofollowSuggestions: []
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
  const { authToken, isAuthenticated, isLoading: authLoading, currentUser } = useContext(AuthContext);

  // State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [yaps, setYaps] = useState<Yap[]>([]);
  const [filteredYaps, setFilteredYaps] = useState<Yap[]>([]);
  const [onchange, setOnchange] = useState(false);
  const [selectedYap, setSelectedYap] = useState<Yap | null>(null);
  const [feedType, setFeedType] = useState<'chronological' | 'trending' | 'following'>('chronological');
  const [yapReplies, setYapReplies] = useState<Reply[]>([]);
  const [whotofollowSuggestions, setWhotofollowSuggestions] = useState<WhoToFollowSuggestion[]>([]);
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
  const MAX_REQUESTS_PER_WINDOW = 30; // Increased for more interactions
  const MIN_REQUEST_INTERVAL = 1000; // Reduced to 1 second for better responsiveness
  const DEBOUNCE_DELAY = 500; // Reduced debounce for faster updates

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

  // Enhanced fetch yaps function with feed algorithm support
  const fetchYaps = useCallback(async (feedTypeOverride?: string) => {
    if (authLoading || !isAuthenticated || !authToken || !apiEndpoint || fetchingRef.current) {
      setYaps([]);
      setFilteredYaps([]);
      setIsLoading(false);
      return;
    }

    if (!canMakeRequest('fetch_yaps')) return;

    markRequestStart('fetch_yaps');
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const currentFeedType = feedTypeOverride || feedType;
      let endpoint = `${apiEndpoint}/yaps`;
      
      // Use different endpoints based on feed type
      if (currentFeedType === 'trending') {
        endpoint = `${apiEndpoint}/yaps/trending`;
      } else if (currentFeedType === 'following') {
        endpoint = `${apiEndpoint}/yaps/feed?type=following`;
      } else {
        endpoint = `${apiEndpoint}/yaps/feed?type=mixed`; // Chronological with some algorithmic boost
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
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
      setFilteredYaps(data.yaps || []);
      
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
  }, [authLoading, isAuthenticated, authToken, apiEndpoint, feedType, canMakeRequest, markRequestStart, markRequestEnd]);

  const whotofollow = useCallback(async (): Promise<WhoToFollowSuggestion[]> => {
    if (!isAuthenticated || !authToken || !apiEndpoint) {
      return [];
    }

    try {
      const response = await fetch(`${apiEndpoint}/yaps/who-to-follow/suggestions`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        console.warn('Failed to fetch who to follow suggestions');
        return [];
      }

      const data = await response.json();
      return data.suggestions || data || [];
    } catch (error) {
      console.error('Error fetching who to follow suggestions:', error);
      return [];
    }
  }, [isAuthenticated, authToken, apiEndpoint]);
  

  useEffect(() => {
    if (isAuthenticated && authToken) {
      const timeoutId = setTimeout(() => {
        const data = whotofollow().then((data) => {
          setWhotofollowSuggestions(data);
        }).catch((error) => {
          console.error('Error fetching whotofollow suggestions:', error);
        });
      }, DEBOUNCE_DELAY);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isAuthenticated, authToken, whotofollow, setWhotofollowSuggestions]);

  console.log('Who to follow suggestions:', whotofollowSuggestions);
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
    const currentActiveRequests = activeRequestsRef.current;
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      currentActiveRequests.clear();
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

  
  // Optimistic toggle like function
  const toggleLike = useCallback(async (yapId: string) => {
    if (!isAuthenticated || !authToken) {
      toast.error('Please log in to like yaps');
      return;
    }

    // Optimistic update
    setYaps(prevYaps => 
      prevYaps.map(yap => {
        if (yap.id === yapId) {
          const isCurrentlyLiked = yap.optimisticLiked ?? false;
          return {
            ...yap,
            optimisticLiked: !isCurrentlyLiked,
            optimisticLikesCount: isCurrentlyLiked 
              ? (yap.optimisticLikesCount ?? yap.likes_count) - 1
              : (yap.optimisticLikesCount ?? yap.likes_count) + 1
          };
        }
        return yap;
      })
    );
    
    setFilteredYaps(prevYaps => 
      prevYaps.map(yap => {
        if (yap.id === yapId) {
          const isCurrentlyLiked = yap.optimisticLiked ?? false;
          return {
            ...yap,
            optimisticLiked: !isCurrentlyLiked,
            optimisticLikesCount: isCurrentlyLiked 
              ? (yap.optimisticLikesCount ?? yap.likes_count) - 1
              : (yap.optimisticLikesCount ?? yap.likes_count) + 1
          };
        }
        return yap;
      })
    );

    try {
      const response = await fetch(`${apiEndpoint}/yaps/${yapId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      
      // Update with actual server response
      setYaps(prevYaps => 
        prevYaps.map(yap => {
          if (yap.id === yapId) {
            return {
              ...yap,
              likes_count: data.likes_count,
              optimisticLiked: data.liked,
              optimisticLikesCount: data.likes_count
            };
          }
          return yap;
        })
      );
      
      setFilteredYaps(prevYaps => 
        prevYaps.map(yap => {
          if (yap.id === yapId) {
            return {
              ...yap,
              likes_count: data.likes_count,
              optimisticLiked: data.liked,
              optimisticLikesCount: data.likes_count
            };
          }
          return yap;
        })
      );

    } catch (error) {
      // Revert optimistic update on error
      setYaps(prevYaps => 
        prevYaps.map(yap => {
          if (yap.id === yapId) {
            return {
              ...yap,
              optimisticLiked: undefined,
              optimisticLikesCount: undefined
            };
          }
          return yap;
        })
      );
      
      setFilteredYaps(prevYaps => 
        prevYaps.map(yap => {
          if (yap.id === yapId) {
            return {
              ...yap,
              optimisticLiked: undefined,
              optimisticLikesCount: undefined
            };
          }
          return yap;
        })
      );
      
      console.error('Error toggling like:', error);
      toast.error('Failed to update like. Please try again.');
    }
  }, [authToken, isAuthenticated, apiEndpoint]);

  // Optimistic add reply function
  const addReply = useCallback(async (yapId: string, content: string, parentReplyId?: number) => {
    if (!isAuthenticated || !authToken || !currentUser) {
      toast.error('Please log in to reply');
      return;
    }

    // Create optimistic reply
    const optimisticReply: Reply = {
      id: Date.now(), // Temporary ID
      content,
      created_at: new Date().toISOString(),
      user: {
        id: currentUser.id,
        username: currentUser.username,
        display_name: currentUser.display_name,
        avatar: currentUser.avatar
      },
      parent_reply_id: parentReplyId, 
      isOptimistic: true
    };

    // Optimistic update for replies list
    setYapReplies(prevReplies => [optimisticReply, ...prevReplies]);

    // Optimistic update for yap replies count
    setYaps(prevYaps => 
      prevYaps.map(yap => {
        if (yap.id === yapId) {
          return {
            ...yap,
            optimisticRepliesCount: (yap.optimisticRepliesCount ?? yap.replies_count) + 1
          };
        }
        return yap;
      })
    );

    try {
      const response = await fetch(`${apiEndpoint}/yaps/${yapId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content,
          parent_reply_id: parentReplyId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reply');
      }

      const data = await response.json();
      
      // Replace optimistic reply with real reply
      setYapReplies(prevReplies => 
        prevReplies.map(reply => 
          reply.id === optimisticReply.id 
            ? { ...data.reply, isOptimistic: false }
            : reply
        )
      );

      // Update yap replies count with server response
      setYaps(prevYaps => 
        prevYaps.map(yap => {
          if (yap.id === yapId) {
            return {
              ...yap,
              replies_count: (yap.optimisticRepliesCount ?? yap.replies_count),
              optimisticRepliesCount: undefined
            };
          }
          return yap;
        })
      );

      toast.success('Reply added successfully!');

    } catch (error) {
      // Remove optimistic reply on error
      setYapReplies(prevReplies => 
        prevReplies.filter(reply => reply.id !== optimisticReply.id)
      );
      
      // Revert optimistic update
      setYaps(prevYaps => 
        prevYaps.map(yap => {
          if (yap.id === yapId) {
            return {
              ...yap,
              optimisticRepliesCount: undefined
            };
          }
          return yap;
        })
      );
      
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply. Please try again.');
    }
  }, [authToken, isAuthenticated, apiEndpoint, currentUser]);

  // Optimistic pure retweet function (no content)
  const retweet = useCallback(async (yapId: string) => {
    if (!isAuthenticated || !authToken || !currentUser) {
      toast.error('Please log in to retweet');
      return;
    }

    // Optimistic update
    setYaps(prevYaps => 
      prevYaps.map(yap => {
        if (yap.id === yapId) {
          return {
            ...yap,
            optimisticRetweetsCount: (yap.optimisticRetweetsCount ?? yap.retweets_count) + 1
          };
        }
        return yap;
      })
    );

    try {
      const response = await fetch(`${apiEndpoint}/yaps/${yapId}/retweet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to retweet');
      }

      const data = await response.json();
      
      // Update with server response
      setYaps(prevYaps => 
        prevYaps.map(yap => {
          if (yap.id === yapId) {
            return {
              ...yap,
              retweets_count: data.retweets_count,
              optimisticRetweetsCount: data.retweets_count
            };
          }
          return yap;
        })
      );

      toast.success('Yap retweeted successfully!');
      
      // Refresh feed to show new retweet
      setTimeout(() => {
        setOnchange(!onchange);
      }, 1000);

    } catch (error: any) {
      // Revert optimistic update
      setYaps(prevYaps => 
        prevYaps.map(yap => {
          if (yap.id === yapId) {
            return {
              ...yap,
              optimisticRetweetsCount: undefined
            };
          }
          return yap;
        })
      );
      
      console.error('Error retweeting:', error);
      toast.error(error.message || 'Failed to retweet. Please try again.');
    }
  }, [authToken, isAuthenticated, apiEndpoint, currentUser, onchange]);

  // Optimistic quote retweet function (with content)
  const quoteRetweet = useCallback(async (yapId: string, content: string) => {
    if (!isAuthenticated || !authToken || !currentUser) {
      toast.error('Please log in to quote tweet');
      return;
    }

    if (!content.trim()) {
      toast.error('Quote content is required');
      return;
    }

    // Optimistic update
    setYaps(prevYaps => 
      prevYaps.map(yap => {
        if (yap.id === yapId) {
          return {
            ...yap,
            optimisticRetweetsCount: (yap.optimisticRetweetsCount ?? yap.retweets_count) + 1
          };
        }
        return yap;
      })
    );

    try {
      const response = await fetch(`${apiEndpoint}/yaps/${yapId}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          content: content.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to quote tweet');
      }

      const data = await response.json();
      
      // Update with server response
      setYaps(prevYaps => 
        prevYaps.map(yap => {
          if (yap.id === yapId) {
            return {
              ...yap,
              retweets_count: data.retweets_count,
              optimisticRetweetsCount: data.retweets_count
            };
          }
          return yap;
        })
      );

      toast.success('Quote tweet posted successfully!');
      
      // Refresh feed to show new quote tweet
      setTimeout(() => {
        setOnchange(!onchange);
      }, 1000);

    } catch (error: any) {
      // Revert optimistic update
      setYaps(prevYaps => 
        prevYaps.map(yap => {
          if (yap.id === yapId) {
            return {
              ...yap,
              optimisticRetweetsCount: undefined
            };
          }
          return yap;
        })
      );

      console.error('Quote retweet error:', error);
      toast.error(error.message || 'Failed to quote tweet');
    }
  }, [isAuthenticated, authToken, currentUser, apiEndpoint, onchange, setOnchange]);

  // Get hashtag suggestions
  const getHashtagSuggestions = useCallback(async (query?: string): Promise<HashtagSuggestion[]> => {
    if (!authToken) return [];

    try {
      const url = new URL(`${apiEndpoint}/hashtags/suggestions`);
      if (query) url.searchParams.append('q', query);
      url.searchParams.append('limit', '10');

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch hashtag suggestions');

      const data = await response.json();
      return data.hashtags || [];
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
      return [];
    }
  }, [authToken, apiEndpoint]);

  // Get location suggestions
  const getLocationSuggestions = useCallback(async (query?: string): Promise<LocationSuggestion[]> => {
    if (!authToken) return [];

    try {
      const url = new URL(`${apiEndpoint}/locations/suggestions`);
      if (query) url.searchParams.append('q', query);
      url.searchParams.append('limit', '10');

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch location suggestions');

      const data = await response.json();
      return data.locations || [];
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      return [];
    }
  }, [authToken, apiEndpoint]);

  // Fetch single yap by ID
  const fetchYapById = useCallback(async (yapId: string): Promise<Yap | null> => {
    if (!authToken || !apiEndpoint) {
      console.warn('No auth token or API endpoint available');
      return null;
    }

    if (!canMakeRequest('fetch_yap_by_id')) return null;

    markRequestStart('fetch_yap_by_id');

    try {
      const response = await fetch(`${apiEndpoint}/yaps/${yapId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Yap with id ${yapId} not found`);
          return null;
        } else if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const yap = data.yap || data;
      
      // Set the yap as selected and update replies
      if (yap) {
        setSelectedYap(yap);
        if (yap.replies) {
          setYapReplies(yap.replies);
        }
      }
      
      return yap;
      
    } catch (error: any) {
      console.error('Error fetching yap by ID:', error);
      toast.error('Failed to load yap. Please try again.');
      return null;
    } finally {
      markRequestEnd('fetch_yap_by_id');
    }
  }, [authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, setSelectedYap, setYapReplies]);

  // Refresh feed
  const refreshFeed = useCallback(async () => {
    await fetchYaps();
  }, [fetchYaps]);

  // Enhanced post yap with optimistic update
  const postYap = async (yapPayload: YapPayload): Promise<void> => {
    if (!isAuthenticated || !authToken || !currentUser) {
      toast.error('Please log in to post a yap');
      return;
    }

    if (!apiEndpoint) {
      toast.error('Service not available. Please try again later.');
      return;
    }

    // Create optimistic yap
    const optimisticYap: Yap = {
      id: `temp-${Date.now()}`, // Temporary ID
      content: yapPayload.content,
      timestamp: new Date().toISOString(),
      location: yapPayload.location,
      user_id: currentUser.id,
      username: currentUser.username,
      display_name: `${currentUser.first_name} ${currentUser.last_name}`,
      avatar: currentUser.avatar,
      original_yap_id: yapPayload.originalYapId,
      replies_count: 0,
      likes_count: 0,
      retweets_count: 0,
      bookmarks_count: 0,
      media: [],
      replies: [],
      hashtags: [],
      isOptimistic: true
    };

    // Add optimistic yap to the top of the feed
    setYaps(prevYaps => [optimisticYap, ...prevYaps]);
    setFilteredYaps(prevYaps => [optimisticYap, ...prevYaps]);

    const { content, location, originalYapId, mediaFiles } = yapPayload;
    
    // Create FormData for submission
    const formData = new FormData();
    formData.append('content', content);
  
    if (location) {
      formData.append('location', location);
    }
  
    if (originalYapId) {
      formData.append('original_yap_id', originalYapId);
    }
  
    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file) => {
        formData.append('media', file);
      });
    }
  
    try {
      const response = await fetch(`${apiEndpoint}/add_yap`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });
  
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
  
      const data = await response.json();
      
      // Remove optimistic yap and refresh feed to get the real one
      setYaps(prevYaps => prevYaps.filter(yap => yap.id !== optimisticYap.id));
      setFilteredYaps(prevYaps => prevYaps.filter(yap => yap.id !== optimisticYap.id));
      
      toast.success('Yap posted successfully!');
      
      // Refresh feed after a short delay to get the new yap
      setTimeout(() => {
        setOnchange(!onchange);
      }, 500);
  
    } catch (error: any) {
      // Remove optimistic yap on error
      setYaps(prevYaps => prevYaps.filter(yap => yap.id !== optimisticYap.id));
      setFilteredYaps(prevYaps => prevYaps.filter(yap => yap.id !== optimisticYap.id));
      
      if (error.name !== 'AbortError') {
        console.error('Error posting Yap:', error);
        toast.error('Failed to post yap. Please try again.');
      }
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
    navigateToSingleYapView,
    postYap,
    
    // Social interactions
    toggleLike,
    addReply,
    retweet,
    quoteRetweet,
    
    // Feed management
    feedType,
    setFeedType,
    refreshFeed,
    
    // Single yap fetching
    fetchYapById,
    
    // Suggestions
    getHashtagSuggestions,
    getLocationSuggestions,
    
    // Reply management
    yapReplies,
    setYapReplies,
    
    // Who to follow
    whotofollow,
    whotofollowSuggestions
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
