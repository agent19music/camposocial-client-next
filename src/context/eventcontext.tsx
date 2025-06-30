"use client";

import { createContext, ReactNode, useState, useEffect, useContext } from "react";
import {nanoid} from 'nanoid';
import { useRouter } from "next/navigation";

interface EventContextProps {
  events: any[];
  setCategory: (category: string) => void;
  isLoading: boolean;
  onchange: boolean;
  setOnchange: (value: boolean) => void;
  navigateToSingleEventView : (event: Event) => void;
  selectedEvent: Event | null;
}

// Yap interface to define the structure of each yap
interface Event {
  id: string;
  images: [];
  entryfee: number;
  date: string;
  comments: [];
  user: [];
  title: string;
  description : string;
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

  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [onchange, setOnchange] = useState(false);
  const [category, setCategory] = useState("Fun"); // Default category
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null); // Initially no yap is selected


  const router = useRouter()

  // Fetch events when the component mounts or when `onchange` changes
  useEffect(() => {
    setIsLoading(true);
    fetch(`${apiEndpoint}/events`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setFilteredEvents(data); // Initially set filteredEvents to all events
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setEvents([]);
        setFilteredEvents([]);
        setIsLoading(false);
      });
  }, [apiEndpoint, onchange]);

  // Filter events based on category
  useEffect(() => {
    if (category) {
      const filtered = events.filter((event) => event.category === category);
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [category, events]);

  // Function to create a slug from yap id
  function slugify(int: string) {
    const baseSlug = int;
    return `${baseSlug}-${nanoid(12)}`;
  }

  // Function to navigate to a single Yap view
  function navigateToSingleEventView(event:Event) { 
    const slug = slugify(event.eventId);
    
    setSelectedEvent(event);    
  
    router.push(`/events/${slug}`); // Navigate to the single product page
    
   
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
