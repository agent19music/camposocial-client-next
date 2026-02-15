"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './authcontext';
import { toast } from 'react-hot-toast';

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

interface JoinableConversation {
  id: string;
  joined: boolean;
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
  offlineMessages: Record<string, any[]>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  joinedConversations: string[];
  removePendingRequest: (requestId: string | number) => void;
  appendFriend: (friend: any) => void;
  updateFriendList: (payload: { friend?: any; action: 'add' | 'remove'; requesterId?: string | number }) => void;
  consumeOfflineConversationMessages: (conversationId: string) => any[];
}

const defaultValue: WebSocketContextProps = {
  socket: null,
  isConnected: false,
  notificationCounts: { friend_requests: 0, general_notifications: 0 },
  yapCounts: { new_yaps_count: 0, recent_authors: [] },
  markYapsAsSeen: () => { },
  markFriendRequestsAsSeen: () => { },
  hasNewNotifications: false,
  hasNewYaps: false,
  latestFriendRequest: null,
  latestYapNotification: null,
  pendingRequests: [],
  offlineMessages: {},
  joinConversation: () => { },
  leaveConversation: () => { },
  joinedConversations: [],
  removePendingRequest: () => { },
  appendFriend: () => { },
  updateFriendList: () => { },
  consumeOfflineConversationMessages: () => [],
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
  const [friends, setFriends] = useState<any[]>([]);
  const [joinedConversations, setJoinedConversations] = useState<JoinableConversation[]>([]);
  const [offlineMessages, setOfflineMessages] = useState<Record<string, any[]>>({});

  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const conversationRoomsRef = useRef<Set<string>>(new Set());
  const authRejectedRef = useRef(false);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!authToken || !isAuthenticated || !currentUser) return;

    // Reset auth rejection flag on new connection attempt
    authRejectedRef.current = false;

    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    if (!apiEndpoint) {
      console.error('API endpoint not configured');
      return;
    }

    // Extract base URL from API endpoint (remove /camposocial/api)
    const baseUrl = apiEndpoint.replace('/camposocial/api', '');


    const newSocket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 2000,
      forceNew: true,
      auth: {
        token: authToken,
      },
    });

    newSocket.on('new_message', (data: any) => {
      const conversationId = String(data.conversation_id || data.message?.conversation_id || '');
      if (!conversationId) {
        return;
      }

      setOfflineMessages(prev => {
        const existing = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: [...existing, data],
        };
      });
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;

      newSocket.emit('heartbeat', {});
    });

    newSocket.on('conversation_list', (payload: { conversations: string[] }) => {
      const normalized = (payload?.conversations || []).map(id => ({ id, joined: false }));
      setJoinedConversations(normalized);
    });

    newSocket.on('conversation_joined', (data: { conversation_id: string }) => {
      if (data?.conversation_id) {
        conversationRoomsRef.current.add(data.conversation_id);
        setJoinedConversations(prev => {
          const existing = prev.find(item => item.id === data.conversation_id);
          if (existing) {
            return prev.map(item => item.id === data.conversation_id ? { ...item, joined: true } : item);
          }
          return [...prev, { id: data.conversation_id, joined: true }];
        });
      }
    });

    newSocket.on('conversation_left', (data: { conversation_id: string }) => {
      if (data?.conversation_id) {
        conversationRoomsRef.current.delete(data.conversation_id);
        setJoinedConversations(prev => prev.map(item => item.id === data.conversation_id ? { ...item, joined: false } : item));
      }
    });

    newSocket.on('disconnect', (reason: any) => {
      setIsConnected(false);

      // Don't reconnect if the server rejected our auth token
      if (authRejectedRef.current) {
        console.warn('Socket disconnected due to auth rejection — not reconnecting');
        return;
      }

      // Let socket.io's built-in reconnection handle network drops
      // (reconnection: true is set in the config)
    });

    newSocket.on('connect_error', (error: any) => {
      const errorMsg = error?.message || error?.toString() || '';
      const isAuthError = errorMsg.includes('rejected')
        || errorMsg.includes('Signature')
        || errorMsg.includes('Token')
        || errorMsg.includes('Unauthorized');

      if (isAuthError) {
        console.warn('Socket auth rejected — stopping reconnection and clearing token');
        authRejectedRef.current = true;
        newSocket.io.opts.reconnection = false;
        newSocket.disconnect();
        // Clear the stale cookie so the middleware sees unauthenticated
        fetch('/api/auth/clear-token', { method: 'POST' }).catch(() => { });
        return;
      }

      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Notification count updates
    newSocket.on('notification_counts_update', (data: NotificationCounts & { timestamp: string }) => {
      setNotificationCounts({
        friend_requests: data.friend_requests,
        general_notifications: data.general_notifications,
      });
    });

    // Pending requests update
    newSocket.on('pending_requests_update', (data: any) => {
      setPendingRequests(data.pending_requests || []);
    });

    // Yap count updates
    newSocket.on('yap_counts_update', (data: YapCounts & { timestamp: string }) => {
      setYapCounts({
        new_yaps_count: data.new_yaps_count,
        recent_authors: data.recent_authors,
      });
    });

    // New friend request notifications
    newSocket.on('new_friend_request', (data: FriendRequestNotification) => {
      setLatestFriendRequest(data);
      setNotificationCounts(prev => ({
        ...prev,
        friend_requests: data.friend_requests_count,
      }));

      setPendingRequests(data.all_pending_requests);

      // Show notification toast or handle UI update
      // You can add toast notification here
    });

    // New yap notifications
    newSocket.on('new_yap_notification', (data: YapNotification) => {
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

      // You can show a toast notification here
      // For example: if accepted, show "John accepted your friend request!"
      // This helps the user know when their sent requests are responded to

      // You could also update some local state if needed
    });

    // Handle errors
    newSocket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    // Live friend request notifications
    newSocket.on('friend_request', (data: any) => {

      // Update pending requests immediately
      setPendingRequests(prev => [data, ...prev]);

      // Show toast notification
      toast.success(`${data.sender.display_name} sent you a friend request!`);
    });

    // Live friend request responses (accept/decline)  
    newSocket.on('friend_request_response', (data: any) => {
      if (data.action === 'accepted') {
        const displayName = data.recipient?.display_name || data.recipient?.username || data.friend?.display_name || 'Someone';
        toast.success(`${displayName} accepted your friend request!`);
      }
      if (data.friend && data.action === 'accepted') {
        setFriends(prev => {
          const next = prev.filter(friend => friend.friendshipId !== data.friendship_id);
          return [data.friend, ...next];
        });
      }
      setPendingRequests(prev => prev.filter(req => req.id !== data.friendship_id));
    });

    // Live follower notifications
    newSocket.on('new_follower', (data: any) => {
      toast(`${data.follower_name} started following you`);
    });

    // Live reply notifications
    newSocket.on('new_reply', (data: any) => {
      toast(`${data.reply_author_name} replied to your yap`);
    });

    // Friend status change notifications
    newSocket.on('friend_status_change', (data: any) => {
      toast(
        `${data.username} is now ${data.is_online ? 'online' : 'offline'}`,
        { duration: 2000 }
      );
    });

    // Live yap like notifications
    newSocket.on('yap_liked', (data: any) => {
      toast(`${data.liker_name} liked your yap`);
    });

    // New yap from followed users
    newSocket.on('new_yap_from_following', (data: any) => {
      toast(`${data.author_name} posted a new yap`);
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

  const joinConversation = useCallback((conversationId: string) => {
    if (socket && isConnected && conversationId) {
      socket.emit('join_conversation', { conversation_id: conversationId });
    }
  }, [socket, isConnected]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket && isConnected && conversationId) {
      socket.emit('leave_conversation', { conversation_id: conversationId });
    }
  }, [socket, isConnected]);

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

  const removePendingRequest = useCallback((requestId: string | number) => {
    setPendingRequests(prev => prev.filter(req => String(req.id) !== String(requestId)));
  }, []);

  const appendFriend = useCallback((friend: any) => {
    setFriends(prev => [friend, ...prev.filter(item => item.id !== friend.id)]);
  }, []);

  const updateFriendList = useCallback(({ friend, action, requesterId }: { friend?: any; action: 'add' | 'remove'; requesterId?: string | number }) => {
    if (action === 'add' && friend) {
      appendFriend(friend);
      if (requesterId) {
        removePendingRequest(requesterId);
      }
      return;
    }

    if (action === 'remove' && friend) {
      setFriends(prev => prev.filter(item => String(item.id) !== String(friend)));
    }
  }, [appendFriend, removePendingRequest]);

  const consumeOfflineConversationMessages = useCallback((conversationId: string) => {
    const key = String(conversationId);
    const queued = offlineMessages[key] || [];

    if (!queued.length) {
      return [];
    }

    setOfflineMessages(prev => {
      const clone = { ...prev };
      delete clone[key];
      return clone;
    });

    return queued;
  }, [offlineMessages]);

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
    joinConversation,
    leaveConversation,
    joinedConversations: joinedConversations.filter(item => item.joined).map(item => item.id),
    removePendingRequest,
    appendFriend,
    updateFriendList,
    offlineMessages,
    consumeOfflineConversationMessages,
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
