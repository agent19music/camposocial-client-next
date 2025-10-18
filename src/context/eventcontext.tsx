"use client";

import { createContext, ReactNode, useState, useEffect, useContext, useRef, useCallback } from "react";
import {nanoid} from 'nanoid';
import { useRouter } from "next/navigation";
import { AuthContext } from "./authcontext";
import { toast } from "react-hot-toast";
import { EventContextProps, AppEvent, EventProviderProps, AddEventPayload } from "../utils/types";
import type { EventComment, EventTicketGroupInput, EventLikeResponse, EventCommentPayload } from "@/lib/types";

 

const defaultValue: EventContextProps = {
  events: [],
  setCategory: () => {},
  isLoading: false,
  onchange: false,
  setOnchange: () => {},
  navigateToSingleEventView: () => {},
  selectedEvent: null,
  addEvent: () => Promise.resolve(false),
  updateEvent: () => Promise.resolve(false),
  deleteEvent: () => Promise.resolve(false),
  toggleCommentLike: () => Promise.resolve(),
  addCommentReply: () => Promise.resolve(null),
  refreshEvents: () => Promise.resolve(),
};

export const EventContext = createContext<EventContextProps>(defaultValue);

export default function EventProvider({ children }: EventProviderProps) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const { authToken, isAuthenticated, isLoading: authLoading } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [onchange, setOnchange] = useState(false);
  const [category, setCategory] = useState(""); // Default to all categories
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null); // Initially no event is selected

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
    if (!apiEndpoint) {
      setEvents([]);
      setFilteredEvents([]);
      setIsLoading(false);
      return;
    }

    // Events can be public, so we don't require authentication
    // but we'll include the token if available for personalized content
    if (fetchingRef.current) {
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
      const transformed = (data || []).map((event: any) => ({
        ...event,
        comments: event.comments || [],
        ticketGroups: event.ticketGroups || [],
      }));

      setEvents(transformed);
      setFilteredEvents(transformed); // Initially set filteredEvents to all events

      console.log("[fetchEvents] Events:", data);
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

  const buildTicketGroupsFormValue = (ticketGroups: (EventTicketGroupInput | any)[]) => {
    try {
      return JSON.stringify(ticketGroups);
    } catch (error) {
      console.error('[buildTicketGroupsFormValue] Failed to serialize ticket groups', error);
      return '[]';
    }
  };

  async function addEvent(event: AddEventPayload) {
    if (!isAuthenticated || !authToken) {
      toast.error('Please log in to add events');
      return false;
    }

    if (!apiEndpoint) {
      toast.error('Service not available. Please try again later.');
      return false;
    }

    console.log("[addEvent] Called with payload:", event);
    try {
      const endpoint = `${apiEndpoint}/add-event`;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', event.title);
      formData.append('description', event.description);
      formData.append('date_of_event', event.date_of_event as string);
      formData.append('start_time', event.start_time);
      formData.append('end_time', event.end_time);
      formData.append('entry_fee', event.entry_fee.toString());
      formData.append('category', event.category);
      formData.append('ticket_groups', buildTicketGroupsFormValue(event.ticketGroups || []));
      
      // Add image file if provided
      if (event.posterFile) {
        formData.append('image_url', event.posterFile);
      }

      console.log("[addEvent] Sending request to:", endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData,
      });

      console.log("[addEvent] Response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          return false;
        } else if (response.status === 429) {
          toast.error('Too many requests. Please wait before trying again.');
          return false;
        }
        const errorText = await response.text();
        console.error('[addEvent] Failed. Status:', response.status, 'Response:', errorText);
        toast.error('Failed to add event. Please try again later.');
        return false;
      }
      
      const result = await response.json();
      console.log("[addEvent] Success Response:", result);

      if (result.event) {
        setEvents(prev => [{
          ...result.event,
          comments: result.event.comments || [],
          ticketGroups: result.event.ticketGroups || [],
        }, ...prev]);
        setFilteredEvents(prev => [{
          ...result.event,
          comments: result.event.comments || [],
          ticketGroups: result.event.ticketGroups || [],
        }, ...prev]);
      }

      setOnchange(prev => !prev);
      return true;
    } catch (error: any) {
      console.error("[addEvent] Error adding event:", error);
      toast.error('Failed to add event. Please try again later.');
      return false;
    }
  }

  async function updateEvent(eventId: string, event: AddEventPayload) {
    if (!isAuthenticated || !authToken) {
      toast.error('Please log in to update events');
      return false;
    }

    if (!apiEndpoint) {
      toast.error('Service not available. Please try again later.');
      return false;
    }

    console.log("[updateEvent] Called with eventId:", eventId, "payload:", event);
    try {
      const endpoint = `${apiEndpoint}/update-event/${eventId}`;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', event.title);
      formData.append('description', event.description);
      formData.append('date_of_event', event.date_of_event as string);
      formData.append('start_time', event.start_time);
      formData.append('end_time', event.end_time);
      formData.append('entry_fee', event.entry_fee.toString());
      formData.append('category', event.category);
      formData.append('ticket_groups', buildTicketGroupsFormValue(event.ticketGroups || []));
      
      // Add image file if provided
      if (event.posterFile) {
        formData.append('image_url', event.posterFile);
      }

      console.log("[updateEvent] Sending request to:", endpoint);

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData,
      });

      console.log("[updateEvent] Response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          return false;
        } else if (response.status === 429) {
          toast.error('Too many requests. Please wait before trying again.');
          return false;
        }
        const errorText = await response.text();
        console.error('[updateEvent] Failed. Status:', response.status, 'Response:', errorText);
        toast.error('Failed to update event. Please try again later.');
        return false;
      }
      
      const result = await response.json();
      console.log("[updateEvent] Success Response:", result);

      if (result.event) {
        const updateFn = (collection: any[]) => collection.map(existing => {
          if ((existing.eventId || existing.id) !== (result.event.eventId || result.event.id)) {
            return existing;
          }

          return {
            ...existing,
            ...result.event,
            comments: result.event.comments || existing.comments || [],
            ticketGroups: result.event.ticketGroups || existing.ticketGroups || [],
          };
        });

        setEvents(prev => updateFn(prev));
        setFilteredEvents(prev => updateFn(prev));
      }

      setOnchange(prev => !prev);
      toast.success('Event updated successfully');
      return true;
    } catch (error: any) {
      console.error("[updateEvent] Error updating event:", error);
      toast.error('Failed to update event. Please try again later.');
      return false;
    }
  }

  async function deleteEvent(eventId: string) {
    if (!isAuthenticated || !authToken) {
      toast.error('Please log in to delete events');
      return false;
    }

    if (!apiEndpoint) {
      toast.error('Service not available. Please try again later.');
      return false;
    }

    console.log("[deleteEvent] Called with eventId:", eventId);
    try {
      const endpoint = `${apiEndpoint}/delete-event/${eventId}`;

      console.log("[deleteEvent] Sending request to:", endpoint);

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
      });

      console.log("[deleteEvent] Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[deleteEvent] Failed. Status:', response.status, 'Response:', errorText);
        toast.error('Failed to delete event. Please try again later.');
        return false;
      }
      
      const result = await response.json();
      console.log("[deleteEvent] Success Response:", result);

      setEvents(prev => prev.filter(event => (event.eventId || event.id) !== eventId));
      setFilteredEvents(prev => prev.filter(event => (event.eventId || event.id) !== eventId));
      setOnchange(prev => !prev);
      toast.success('Event deleted successfully');
      return true;
    } catch (error: any) {
      console.error("[deleteEvent] Error deleting event:", error);
      toast.error('Failed to delete event. Please try again later.');
      return false;
    }
  }

  async function toggleCommentLike(commentId: number, eventId: string) {
    if (!isAuthenticated || !authToken || !apiEndpoint) {
      toast.error('Please log in to like comments');
      return;
    }

    try {
      const response = await fetch(`${apiEndpoint}/comment-event/${eventId}/likes/${commentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: EventLikeResponse = await response.json();

      const updateFn = (collection: any[]) => collection.map(event => {
        if ((event.eventId || event.id) !== eventId) return event;
        const updateComment = (comments: EventComment[]): EventComment[] =>
          comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likesCount: result.likesCount,
                likedByCurrentUser: result.likedByCurrentUser,
              };
            }
            return {
              ...comment,
              replies: updateComment(comment.replies),
            };
          });

        return {
          ...event,
          comments: updateComment(event.comments ?? []),
        };
      });

      setEvents(prev => updateFn(prev));
      setFilteredEvents(prev => updateFn(prev));
    } catch (error) {
      console.error('[toggleCommentLike] Failed to toggle like', error);
      toast.error('Could not update like');
    }
  }

  async function addCommentReply(eventId: string, payload: EventCommentPayload) {
    if (!isAuthenticated || !authToken || !apiEndpoint) {
      toast.error('Please log in to comment');
      return null;
    }

    try {
      const response = await fetch(`${apiEndpoint}/comment-event/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const newComment: EventComment = result.comment;

      const addToCollection = (collection: any[]) => collection.map(event => {
        if ((event.eventId || event.id) !== eventId) return event;

        if (newComment.parentCommentId) {
          const attachReply = (comments: EventComment[]): EventComment[] =>
            comments.map(comment => {
              if (comment.id === newComment.parentCommentId) {
                return {
                  ...comment,
                  replies: [...comment.replies, newComment],
                };
              }
              return {
                ...comment,
                replies: attachReply(comment.replies),
              };
            });

          return {
            ...event,
            comments: attachReply(event.comments ?? []),
          };
        }

        return {
          ...event,
          comments: [...(event.comments ?? []), newComment],
        };
      });

      setEvents(prev => addToCollection(prev));
      setFilteredEvents(prev => addToCollection(prev));

      setOnchange(prev => !prev);

      toast.success('Comment added successfully');
      return newComment;
    } catch (error) {
      console.error('[addCommentReply] Failed to add comment', error);
      toast.error('Failed to add comment');
      return null;
    }
  }

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
    const activeAtMount = activeRequestsRef.current; // capture ref value now
    const controllerAtMount = abortControllerRef.current;
    return () => {
      if (controllerAtMount) {
        controllerAtMount.abort();
      }
      activeAtMount.clear();
    };
  }, []);

  // Function to create a slug from event id
  function slugify(int: string) {
    const baseSlug = int;
    return `${baseSlug}-${nanoid(12)}`;
  }

  // Function to navigate to a single Event view
  function navigateToSingleEventView(event: AppEvent) { 
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
    selectedEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleCommentLike,
    addCommentReply,
    refreshEvents: fetchEvents,
  };

  return (
    <EventContext.Provider value={contextData}>
      {children}
    </EventContext.Provider>
  );
}

// To use the context
export const useEventContext = () => useContext(EventContext);
