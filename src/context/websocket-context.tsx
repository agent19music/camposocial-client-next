"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './authcontext';

interface NotificationCounts {
  friend_requests: number;
  general_notifications: number;
}

interface YapCounts {
  new_yaps_count: number;
  recent_authors: Array<{
    id: number;
    username: string;
    avatar: string;
    display_name: string;
  }>;
}

interface FriendRequestNotification {
  sender: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
    display_name: string;
  };
  friendship_id: number;
  friend_requests_count: number;
  all_pending_requests: Array<{
    id: number;
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      avatar: string;
      display_name: string;
    };
    created_at: string;
  }>;
  timestamp: string;
}

interface YapNotification {
  yap: {
    id: string;
    content: string;
  };
  author: {
    id: number;
    username: string;
    avatar: string;
    display_name: string;
  };
  new_yaps_count: number;
  timestamp: string;
}

interface WebSocketContextProps {
  socket: any;
  isConnected: boolean;
  notificationCounts: NotificationCounts;
  yapCounts: YapCounts;
  markYapsAsSeen: () => void;
  markFriendRequestsAsSeen: () => void;
  hasNewNotifications: boolean;
  hasNewYaps: boolean;
  latestFriendRequest: FriendRequestNotification | null;
  latestYapNotification: YapNotification | null;
  pendingRequests: Array<{
    id: number;
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      avatar: string;
      display_name: string;
    };
    created_at: string;
  }>;
}

const defaultValue: WebSocketContextProps = {
  socket: null,
  isConnected: false,
  notificationCounts: { friend_requests: 0, general_notifications: 0 },
  yapCounts: { new_yaps_count: 0, recent_authors: [] },
  markYapsAsSeen: () => {},
  markFriendRequestsAsSeen: () => {},
  hasNewNotifications: false,
  hasNewYaps: false,
  latestFriendRequest: null,
  latestYapNotification: null,
  pendingRequests: [],
};

export const WebSocketContext = createContext<WebSocketContextProps>(defaultValue);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { authToken, isAuthenticated, currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    friend_requests: 0,
    general_notifications: 0,
  });
  const [yapCounts, setYapCounts] = useState<YapCounts>({
    new_yaps_count: 0,
    recent_authors: [],
  });
  const [latestFriendRequest, setLatestFriendRequest] = useState<FriendRequestNotification | null>(null);
  const [latestYapNotification, setLatestYapNotification] = useState<YapNotification | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Array<{
    id: number;
    user: {
      id: number;
      username: string;
      first_name: string;
      last_name: string;
      avatar: string;
      display_name: string;
    };
    created_at: string;
  }>>([]);

  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!authToken || !isAuthenticated || !currentUser) return;

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    if (!apiEndpoint) {
      console.error('API endpoint not configured');
      return;
    }

    // Extract base URL from API endpoint (remove /camposocial/api)
    const baseUrl = apiEndpoint.replace('/camposocial/api', '');
    
    console.log('Connecting to WebSocket at:', baseUrl);

    const newSocket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 2000,
      forceNew: true,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Authenticate the socket connection
      newSocket.emit('authenticate', { token: authToken });
    });

    newSocket.on('authenticated', (data: any) => {
      console.log('WebSocket authenticated for user:', data.user_id);
      
      // Request current notification counts
      newSocket.emit('get_notification_counts', { token: authToken });
    });

    newSocket.on('disconnect', (reason: any) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      
      // Attempt to reconnect if it wasn't a manual disconnect
      if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        console.log(`Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
        
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
        }
        
        reconnectTimeout.current = setTimeout(() => {
          newSocket.connect();
        }, 2000 * reconnectAttempts.current);
      }
    });

    newSocket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Notification count updates
    newSocket.on('notification_counts_update', (data: NotificationCounts & { timestamp: string }) => {
      console.log('Notification counts updated:', data);
      setNotificationCounts({
        friend_requests: data.friend_requests,
        general_notifications: data.general_notifications,
      });
    });

    // Pending requests update
    newSocket.on('pending_requests_update', (data: any) => {
      console.log('Pending requests updated:', data);
      setPendingRequests(data.pending_requests || []);
    });

    // Yap count updates
    newSocket.on('yap_counts_update', (data: YapCounts & { timestamp: string }) => {
      console.log('Yap counts updated:', data);
      setYapCounts({
        new_yaps_count: data.new_yaps_count,
        recent_authors: data.recent_authors,
      });
    });

    // New friend request notifications
    newSocket.on('new_friend_request', (data: FriendRequestNotification) => {
      console.log('New friend request notification:', data);
      setLatestFriendRequest(data);
      setNotificationCounts(prev => ({
        ...prev,
        friend_requests: data.friend_requests_count,
      }));
      
      // Update pending requests list with real-time data
      setPendingRequests(data.all_pending_requests);
      
      // Show notification toast or handle UI update
      // You can add toast notification here
    });

    // New yap notifications
    newSocket.on('new_yap_notification', (data: YapNotification) => {
      console.log('New yap notification:', data);
      setLatestYapNotification(data);
      setYapCounts(prev => ({
        ...prev,
        new_yaps_count: data.new_yaps_count,
        recent_authors: prev.recent_authors.some(author => author.id === data.author.id)
          ? prev.recent_authors
          : [data.author, ...prev.recent_authors.slice(0, 2)], // Keep only 3 recent authors
      }));
    });

    // Friend request response notifications (for when your request is accepted/declined)
    newSocket.on('friend_request_response', (data: any) => {
      console.log('Friend request response received:', data);
      
      // You can show a toast notification here
      // For example: if accepted, show "John accepted your friend request!"
      // This helps the user know when their sent requests are responded to
      
      // You could also update some local state if needed
    });

    // Handle errors
    newSocket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    setSocket(newSocket);

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      newSocket.disconnect();
    };
  }, [authToken, isAuthenticated, currentUser]);

  // Initialize socket when auth is ready
  useEffect(() => {
    if (authToken && isAuthenticated && currentUser) {
      const cleanup = initializeSocket();
      return cleanup;
    }
  }, [authToken, isAuthenticated, currentUser, initializeSocket]);

  // Handle cleanup when user logs out
  useEffect(() => {
    if (!authToken || !isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [authToken, isAuthenticated, socket]);

  // Mark yaps as seen
  const markYapsAsSeen = useCallback(() => {
    if (socket && isConnected && authToken) {
      socket.emit('mark_yaps_seen', { token: authToken });
      setYapCounts({ new_yaps_count: 0, recent_authors: [] });
      setLatestYapNotification(null);
    }
  }, [socket, isConnected, authToken]);

  // Mark friend requests as seen
  const markFriendRequestsAsSeen = useCallback(() => {
    if (socket && isConnected && authToken) {
      socket.emit('mark_friend_requests_seen', { token: authToken });
      setNotificationCounts(prev => ({ ...prev, friend_requests: 0 }));
      setLatestFriendRequest(null);
    }
  }, [socket, isConnected, authToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [socket]);

  const value: WebSocketContextProps = {
    socket,
    isConnected,
    notificationCounts,
    yapCounts,
    markYapsAsSeen,
    markFriendRequestsAsSeen,
    hasNewNotifications: notificationCounts.friend_requests > 0 || notificationCounts.general_notifications > 0,
    hasNewYaps: yapCounts.new_yaps_count > 0,
    latestFriendRequest,
    latestYapNotification,
    pendingRequests,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
