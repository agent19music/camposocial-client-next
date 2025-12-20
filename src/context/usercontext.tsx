"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import { AuthContext } from "./authcontext";
import { useWebSocket } from "./websocket-context";
import { toast } from "react-hot-toast";
import { UserContextProps, ChatFriend, MinimalFriend } from "../utils/types";



const defaultValue: UserContextProps = {
  user: [],
  users: [],
  sendFriendRequest: async () => { },
  receivedRequests: [],
  setReceivedRequests: () => { },
  removeFriend: async () => { },
  addFriend: async () => { },
  blockUser: async () => { },
  setUsers: () => { },
  setFilteredUsers: () => { },
  onchange: () => { },
  rejectFriendRequest: async () => { },
  friends: [],
  filteredFriends: [],
  searchUsers: async () => [],
  isLoadingUsers: false,
  isLoadingSearch: false,
  fetchFriends: async (_opts?: { force?: boolean }) => { },
  fetchUsers: async () => { },
  fetchPendingRequests: async (_opts?: { force?: boolean }) => { },
  sentRequestIds: new Set<string>(),
};

export const UserContext = createContext<UserContextProps>(defaultValue);

export default function UserProvider({ children }: { children: ReactNode }) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const { authToken, isAuthenticated } = useContext(AuthContext);
  const { pendingRequests, removePendingRequest, updateFriendList } = useWebSocket();

  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [usersState, setUsersState] = useState<any[]>([]);
  const [friendsState, setFriendsState] = useState<ChatFriend[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<ChatFriend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

  const swrKey = useMemo(() => ({
    friends: authToken && isAuthenticated ? `${apiEndpoint}/friends` : null,
    users: authToken && isAuthenticated ? `${apiEndpoint}/users` : null,
    pending: authToken && isAuthenticated ? `${apiEndpoint}/friends/pending` : null,
  }), [apiEndpoint, authToken, isAuthenticated]);

  const fetcher = useCallback(async (url: string) => {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }, [authToken]);

  const {
    data: usersData,
    isLoading: isLoadingUsers,
  } = useSWR(swrKey.users, (url) => fetcher(url!), {
    revalidateOnFocus: false,
  });

  const {
    data: friendsData,
    isLoading: isLoadingFriends,
  } = useSWR(swrKey.friends, (url) => fetcher(url!), {
    revalidateOnFocus: false,
  });

  const {
    data: pendingData,
    isLoading: isLoadingPending,
  } = useSWR(swrKey.pending, (url) => fetcher(url!), {
    revalidateOnFocus: false,
  });

  const users = useMemo(() => usersData?.users ?? [], [usersData]);
  const friends = useMemo(() => {
    const rawFriends = friendsData?.friends ?? [];
    return rawFriends.map((friend: any) => ({
      id: String(friend.id),
      username: friend.username,
      firstName: friend.first_name,
      lastName: friend.last_name,
      avatar: friend.avatar || "",
      displayName: friend.display_name || `${friend.first_name} ${friend.last_name}`,
      isOnline: Boolean(friend.is_online),
      lastSeen: friend.last_seen ? new Date(friend.last_seen) : null,
      isCloseFriend: Boolean(friend.is_close_friend),
      friendshipId: friend.friendship_id,
      conversationId: friend.conversation_id ? String(friend.conversation_id) : null,
      unreadCount: friend.unread_count ?? 0,
      mutualFriends: friend.mutual_friends ?? 0,
      category: friend.category ?? "",
      bio: friend.bio ?? "",
      messagePreview: friend.message_preview ?? null,
      messageTime: friend.message_time ? new Date(friend.message_time) : new Date(),
    })) as ChatFriend[];
  }, [friendsData]);

  useEffect(() => {
    if (users) {
      setUsersState(users);
      setFilteredUsers(users);
    }
  }, [users]);

  useEffect(() => {
    if (friends) {
      setFriendsState(friends);
      setFilteredFriends(friends);
    }
  }, [friends]);

  const isLoading = isLoadingUsers || isLoadingFriends || isLoadingPending;
  // user should be a single user object, not an array
  const user = usersState.length > 0 ? usersState[0] : [];

  const normalizePendingRequests = useCallback((requests: any[] = []): any[] => {
    return requests
      .map((request: any) => {
        const user = request.user || request.requester || {};
        const rawRequestId = request.id ?? request.request_id ?? request.requestId;
        const rawUserId = user.id ?? request.user_id ?? request.userId ?? request.requester_id;

        if (!rawRequestId || !rawUserId) {
          return null;
        }

        const firstName = (user.first_name ?? request.firstName ?? request.first_name ?? "").toString();
        const lastName = (user.last_name ?? request.lastName ?? request.last_name ?? "").toString();
        const displayNameCandidate = (user.display_name ?? request.displayName ?? request.display_name ?? `${firstName} ${lastName}`).toString().trim();
        const lastSeenRaw = user.last_seen ?? request.last_seen ?? request.lastSeen;

        // Return extended fields including bio for RequestCard display
        return {
          id: String(rawRequestId),
          username: (user.username ?? request.username ?? "").toString(),
          firstName,
          lastName,
          displayName: displayNameCandidate || `${firstName} ${lastName}`.trim(),
          avatar: (user.avatar ?? request.avatar ?? "").toString(),
          isOnline: Boolean(user.is_online ?? request.is_online ?? request.isOnline ?? false),
          lastSeen: lastSeenRaw ? new Date(lastSeenRaw) : null,
          isCloseFriend: Boolean(user.is_close_friend ?? request.is_close_friend ?? false),
          friendshipId: null,
          // Extended fields for RequestCard
          bio: (user.bio ?? request.bio ?? "").toString(),
          mutualFriends: user.mutual_friends ?? request.mutual_friends ?? request.mutualFriends ?? 0,
          created_at: request.created_at ?? request.createdAt ?? null,
          requesterId: String(rawUserId),
        };
      })
      .filter((item): item is any => item !== null);
  }, []);

  // Search users function
  const searchUsers = useCallback(async (query: string): Promise<any[]> => {
    if (!authToken || !isAuthenticated || !apiEndpoint || !query.trim()) {
      return [];
    }

    setIsLoadingSearch(true);

    try {
      const response = await fetch(`${apiEndpoint}/users/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.users || [];
    } catch (error: any) {
      console.error("Error searching users:", error);
      return [];
    } finally {
      setIsLoadingSearch(false);
    }
  }, [authToken, isAuthenticated, apiEndpoint]);

  useEffect(() => {
    if (!Array.isArray(pendingRequests)) {
      return;
    }

    if (pendingRequests.length === 0) {
      setReceivedRequests([]);
      return;
    }

    setReceivedRequests(normalizePendingRequests(pendingRequests));
  }, [pendingRequests, normalizePendingRequests]);

  useEffect(() => {
    if (!pendingData?.pending_requests) {
      return;
    }
    setReceivedRequests(normalizePendingRequests(pendingData.pending_requests));
  }, [pendingData, normalizePendingRequests]);

  async function sendFriendRequest(receipientId: string) {
    if (!apiEndpoint || !authToken) {
      toast.error('Cannot send request right now. Please try again later.');
      return;
    }

    // Optimistic update - add to sent requests immediately
    setSentRequestIds(prev => new Set(prev).add(receipientId));

    const normalizedEndpoint = apiEndpoint.replace(/\/+$/, '');
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ user_id: receipientId }),
    } as RequestInit;

    const attemptRequest = async (url: string) => {
      const response = await fetch(url, payload);
      const data = await response.json().catch(() => ({}));
      return { response, data };
    };

    try {
      // Try enhanced endpoint first for better messaging
      let { response, data } = await attemptRequest(`${normalizedEndpoint}/friends/request`);

      if (!response.ok) {
        const errorMessage = (data.error || '').toLowerCase();

        // If backend indicates an existing pending request, surface as info
        if (errorMessage.includes('already sent') || errorMessage.includes('already received')) {
          toast.error(data.error || 'Friend request already pending.');
          return;
        }

        // Attempt fallback endpoint if specific not-friends message occurs
        if (errorMessage.includes('not friends yet')) {
          ({ response, data } = await attemptRequest(`${normalizedEndpoint}/friends/request`));
        }

        if (!response.ok) {
          console.error("Failed to send friend request:", data);
          toast.error(data.error || "Failed to send friend request.");
          // Revert optimistic update on error
          setSentRequestIds(prev => {
            const next = new Set(prev);
            next.delete(receipientId);
            return next;
          });
          return;
        }
      }

      toast.success("Friend request sent!");
      await mutate(swrKey.pending);
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("An error occurred while sending the friend request.");
      // Revert optimistic update on error
      setSentRequestIds(prev => {
        const next = new Set(prev);
        next.delete(receipientId);
        return next;
      });
    }
  }

  async function removeFriend(friendId: string) {
    try {
      const response = await fetch(`${apiEndpoint}/friends/${friendId}/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to remove friend:', errorData);
        return errorData.message || 'Error occurred';
      }

      const responseData = await response.json();
      toast.success('Friend removed successfully!');
      updateFriendList({ friend: friendId, action: 'remove' });

      return responseData.message;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('An error occurred while removing the friend.');
    }
  }

  async function addFriend(requestId: string) {
    try {
      const response = await fetch(`${apiEndpoint}/friends/request/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to accept friend request:', errorData);
        return errorData.message || 'Error occurred';
      }

      const responseData = await response.json();
      toast.success('Friend request accepted!');

      // Refresh lists
      await Promise.all([
        mutate(swrKey.friends),
        mutate(swrKey.pending),
        // Also refresh conversations as a new one might have been created
        mutate(`${apiEndpoint}/conversations`)
      ]);

      return responseData.message;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('An error occurred while accepting the friend request.');
    }
  }

  async function blockUser(targetId: string, action: 'block' | 'unblock') {
    try {
      const endpoint = action === 'block' ? `${apiEndpoint}/friends/${targetId}/block` : `${apiEndpoint}/friends/${targetId}/unblock`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to ${action} user:`, errorData);
        return errorData.message || 'Error occurred';
      }

      const responseData = await response.json();
      toast.success(`User ${action}ed successfully!`);

      // Refresh relevant lists
      mutate(swrKey.users);
      mutate(swrKey.friends);

      return responseData.message;
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`An error occurred while ${action}ing the user.`);
    }
  }

  async function rejectFriendRequest(requestId: string) {
    try {
      const response = await fetch(`${apiEndpoint}/friends/request/${requestId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to reject friend request:', errorData);
        return errorData.message || 'Error occurred';
      }

      const responseData = await response.json();

      await mutate(swrKey.pending);

      return responseData.message;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('An error occurred while rejecting the friend request.');
    }
  }

  const contextData: UserContextProps = {
    user,
    users: usersState,
    sendFriendRequest,
    receivedRequests,
    setReceivedRequests,
    removeFriend,
    addFriend,
    blockUser,
    setUsers: setUsersState,
    setFilteredUsers,
    onchange: () => { },
    rejectFriendRequest,
    friends: friendsState,
    filteredFriends,
    searchUsers,
    isLoadingUsers,
    isLoadingSearch,
    sentRequestIds,
    fetchFriends: async (options?: { force?: boolean }) => {
      await mutate(swrKey.friends);
      if (options?.force) {
        await mutate(swrKey.friends, undefined, { revalidate: true });
      }
    },
    fetchUsers: async () => {
      await mutate(swrKey.users);
    },
    fetchPendingRequests: async (options?: { force?: boolean }) => {
      await mutate(swrKey.pending);
      if (options?.force) {
        await mutate(swrKey.pending, undefined, { revalidate: true });
      }
    },
  };

  return (
    <UserContext.Provider value={contextData}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);