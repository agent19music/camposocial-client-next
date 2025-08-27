"use client";

import { createContext, ReactNode, useState, useEffect, useContext, useRef, useCallback } from "react";
import {nanoid} from 'nanoid';
import { useRouter } from "next/navigation";
import { AuthContext } from "./authcontext";
import { toast } from "react-hot-toast";

interface EventContextProps {
  events: any[];
  setCategory: (category: string) => void;
  isLoading: boolean;
  onchange: boolean;
  setOnchange: (value: boolean) => void;
  navigateToSingleEventView : (event: Event) => void;
  selectedEvent: Event | null;
}

// Event interface to define the structure of each event
interface Event {
  id: string;
  eventId?: string;
  poster: string;
  entry_fee: number;
  date: string;
  comments: [];
  user: [];
  title: string;
  description : string;
  category: string;
  username: string;
  userimage: string;
}

const defaultValue: EventContextProps = {
  events: [],
  setCategory: () => {},
  isLoading: false,
  onchange: false,
  setOnchange: () => {},
  navigateToSingleEventView: () => {},
  selectedEvent: null
};

export const EventContext = createContext<EventContextProps>(defaultValue);

interface EventProviderProps {
  children: ReactNode;
}

export default function EventProvider({ children }: EventProviderProps) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const { authToken, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [onchange, setOnchange] = useState(false);
  const [category, setCategory] = useState("Fun"); // Default category
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null); // Initially no event is selected

  const router = useRouter();

  // Rate limiting and debouncing refs
  const lastFetchTimeRef = useRef(0);
  const requestCountRef = useRef(0);
  const rateLimitWindowRef = useRef(0);
  const fetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRequestsRef = useRef(new Set<string>());

  // Rate limiting configuration
  const RATE_LIMIT_WINDOW = 60000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 12;
  const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests
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

  // Debounced fetch events function
  const fetchEvents = useCallback(async () => {
    if (!apiEndpoint || fetchingRef.current) {
      setEvents([]);
      setFilteredEvents([]);
      setIsLoading(false);
      return;
    }

    if (!canMakeRequest('fetch_events')) {
      return;
    }

    fetchingRef.current = true;
    markRequestStart('fetch_events');
    setIsLoading(true);

    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if user is authenticated
      if (authToken && isAuthenticated) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${apiEndpoint}/events`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('Unauthorized access to events. May need login for full features.');
          // Don't show error toast for events as they might be public
        } else if (response.status === 404) {
          console.warn('Events endpoint not found');
          setEvents([]);
          setFilteredEvents([]);
          return;
        } else if (response.status === 429) {
          toast.error('Too many requests. Please wait before trying again.');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setEvents(data || []);
      setFilteredEvents(data || []); // Initially set filteredEvents to all events
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching events:", error);
        setEvents([]);
        setFilteredEvents([]);
        toast.error('Failed to load events. Please try again later.');
      }
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
      markRequestEnd('fetch_events');
    }
  }, [apiEndpoint, authToken, isAuthenticated, canMakeRequest, markRequestStart, markRequestEnd]);

  // Fetch events when the component mounts or when `onchange` changes
  useEffect(() => {
    if (!apiEndpoint) {
      setEvents([]);
      setFilteredEvents([]);
      setIsLoading(false);
      return;
    }

    // Debounce the fetch request
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [apiEndpoint, onchange, fetchEvents]);

  // Filter events based on category
  useEffect(() => {
    if (category) {
      const filtered = events.filter((event) => event.category === category);
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [category, events]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      activeRequestsRef.current.clear();
    };
  }, []);

  // Function to create a slug from event id
  function slugify(int: string) {
    const baseSlug = int;
    return `${baseSlug}-${nanoid(12)}`;
  }

  // Function to navigate to a single Event view
  function navigateToSingleEventView(event: Event) { 
    const eventId = event.eventId || event.id;
    const slug = slugify(eventId);
    
    setSelectedEvent(event);    
  
    router.push(`/events/${slug}`); // Navigate to the single event page
  }

  const contextData = {
    events: filteredEvents,
    setCategory,
    isLoading,
    onchange,
    setOnchange,
    navigateToSingleEventView,
    selectedEvent
  };

  return (
    <EventContext.Provider value={contextData}>
      {children}
    </EventContext.Provider>
  );
}

// To use the context
export const useEventContext = () => useContext(EventContext);
