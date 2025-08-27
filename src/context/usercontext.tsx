"use client";

import { createContext, ReactNode, useState, useEffect, useContext, useRef, useCallback } from "react";
import {nanoid} from 'nanoid';
import { useRouter } from "next/navigation";
import { AuthContext } from "./authcontext";
import { send } from "process";
import {toast} from "react-hot-toast";

interface UserContextProps {
  user: any[];
  users: any[];
  sendFriendRequest: (receipientId:string) => void;
  receivedRequests: any[];
  setReceivedRequests: (receivedRequests: any[]) => void;
  removeFriend: (friendId: string) => void;
  addFriend: (requesterId: string) => void;
  blockUser: (targetId: string, action: 'block' | 'unblock') => void;
  setUsers: (users: any[]) => void;
  setFilteredUsers: (users: any[]) => void;
  onchange: (onchange: boolean) => void;
  rejectFriendRequest: (requesterId: string) => void;
  friends: any[];
  filteredFriends: any[];
  
}

// Yap interface to define the structure of each yap
interface Event {
  id: string;
  avatar: string;
  course: string;
  email: string;
  
}

const defaultValue: UserContextProps = {
  user: [],
  users: [],
  sendFriendRequest: () => {},
  receivedRequests: [],
  setReceivedRequests: () => {},
  removeFriend: () => {},
  addFriend: () => {},
  blockUser: () => {},
  setUsers: () => {},
  setFilteredUsers: () => {},
  onchange: () => {},
  rejectFriendRequest: () => {},
  friends: [],
  filteredFriends: []
  
};

export const UserContext = createContext<UserContextProps>(defaultValue);

interface UserProviderProps {
  children: ReactNode;
}

export default function UserProvider({ children }: UserProviderProps) {
  const apiEndpoint = process.env.API_ENDPOINT;

  const [isLoading, setIsLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const[users, setUsers] = useState<any[]>([]);
  const[friends, setFriends] = useState<any[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<any[]>([]);
  const[receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [onchange, setOnchange] = useState(false);
  const [category, setCategory] = useState("Fun"); // Default category
  const user = ['fuck ts']
  const{authToken, onAuthChange, isAuthenticated, currentUser}= useContext(AuthContext)

  // Add refs to prevent duplicate requests
  const fetchingUsersRef = useRef(false);
  const fetchingFriendsRef = useRef(false);
  const fetchingRequestsRef = useRef(false);
  const lastUsersFetchRef = useRef(0);
  const lastFriendsFetchRef = useRef(0);
  const lastRequestsFetchRef = useRef(0);
  const usersAbortControllerRef = useRef<AbortController | null>(null);
  const friendsAbortControllerRef = useRef<AbortController | null>(null);
  const requestsAbortControllerRef = useRef<AbortController | null>(null);

  const router = useRouter()

  // Debounced fetch users function
  const fetchUsers = useCallback(async () => {
    if (!authToken || !isAuthenticated || !apiEndpoint || fetchingUsersRef.current) {
      return;
    }

    // Debounce requests - only allow one request per 10 seconds
    const now = Date.now();
    if (now - lastUsersFetchRef.current < 10000) {
      return;
    }

    fetchingUsersRef.current = true;
    lastUsersFetchRef.current = now;
    setIsLoading(true);

    // Abort previous request if it exists
    if (usersAbortControllerRef.current) {
      usersAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    usersAbortControllerRef.current = controller;

    try {
      const response = await fetch(`${apiEndpoint}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, don't make further requests
          return; 
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching users:", error);
        setUsers([]);
        setFilteredUsers([]);
      }
    } finally {
      fetchingUsersRef.current = false;
      setIsLoading(false);
    }
  }, [authToken, isAuthenticated, apiEndpoint]);

  // Debounced fetch friends function
  const fetchFriends = useCallback(async () => {
    if (!authToken || !isAuthenticated || !apiEndpoint || fetchingFriendsRef.current) {
      return;
    }

    // Debounce requests - only allow one request per 10 seconds
    const now = Date.now();
    if (now - lastFriendsFetchRef.current < 10000) {
      return;
    }

    fetchingFriendsRef.current = true;
    lastFriendsFetchRef.current = now;
    setIsLoading(true);

    // Abort previous request if it exists
    if (friendsAbortControllerRef.current) {
      friendsAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    friendsAbortControllerRef.current = controller;

    try {
      const response = await fetch(`${apiEndpoint}/friends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, don't make further requests
          return;
        }
        // Don't throw error for 404 - friends endpoint might not exist
        if (response.status === 404) {
          console.warn('Friends endpoint not found');
          setFriends([]);
          setFilteredFriends([]);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setFriends(data.friends || []);
      setFilteredFriends(data.friends || []);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error fetching friends:", error);
        setFriends([]);
        setFilteredFriends([]);
      }
    } finally {
      fetchingFriendsRef.current = false;
      setIsLoading(false);
    }
  }, [authToken, isAuthenticated, apiEndpoint]);

  // Debounced fetch pending requests function
  const fetchPendingRequests = useCallback(async () => {
    if (!authToken || !isAuthenticated || !apiEndpoint || fetchingRequestsRef.current) {
      return;
    }

    // Debounce requests - only allow one request per 10 seconds
    const now = Date.now();
    if (now - lastRequestsFetchRef.current < 10000) {
      return;
    }

    fetchingRequestsRef.current = true;
    lastRequestsFetchRef.current = now;

    // Abort previous request if it exists
    if (requestsAbortControllerRef.current) {
      requestsAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    requestsAbortControllerRef.current = controller;

    try {
      const response = await fetch(`${apiEndpoint}/friends/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, don't make further requests
          return;
        }
        // Don't throw error for 404 - endpoint might not exist
        if (response.status === 404) {
          console.warn('Friends pending endpoint not found');
          setReceivedRequests([]);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setReceivedRequests(data.pending_requests || []);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching pending friend requests:', error);
        setReceivedRequests([]);
      }
    } finally {
      fetchingRequestsRef.current = false;
    }
  }, [authToken, isAuthenticated, apiEndpoint]);

  // Effect to fetch data when auth state changes - but only once per session
  useEffect(() => {
    if (authToken && isAuthenticated && currentUser) {
      // Only fetch if we don't have data yet or auth state actually changed
      if (users.length === 0) {
        fetchUsers();
      }
      if (friends.length === 0) {
        fetchFriends();
      }
      if (receivedRequests.length === 0) {
        fetchPendingRequests();
      }
    }
  }, [authToken, isAuthenticated, currentUser, fetchUsers, fetchFriends, fetchPendingRequests]);

  async function sendFriendRequest(receipientId: string) {
    try {
      const response = await fetch(`${apiEndpoint}/friends/send-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ recipient_id: receipientId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to send friend request:", errorData);
        toast.error(errorData.error || "Failed to send friend request.");
        return;
      }
  
      const responseData = await response.json();
  
      toast.success("Friend request sent successfully!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error("An error occurred while sending the friend request.");
    }
  }

  async function removeFriend(friendId: string) {
    try {
      const response = await fetch(`${apiEndpoint}/friends/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ friend_id: friendId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to remove friend:', errorData);
        return errorData.message || 'Error occurred';
      }
  
      const responseData = await response.json();
      toast.success('Friend removed successfully!');
      
      // Refresh friends list
      fetchFriends();
      
      return responseData.message;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('An error occurred while removing the friend.');
    }
  }

  async function addFriend(requesterId: string) {
    try {
      const response = await fetch(`${apiEndpoint}/friends/accept-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ requester_id: requesterId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to accept friend request:', errorData);
        return errorData.message || 'Error occurred';
      }
  
      const responseData = await response.json();
      toast.success('Friend request accepted!');
      
      // Refresh both friends list and pending requests
      fetchFriends();
      fetchPendingRequests();
      
      return responseData.message;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('An error occurred while accepting the friend request.');
    }
  }

  async function blockUser(targetId: string, action: 'block' | 'unblock') {
    try {
      const response = await fetch(`${apiEndpoint}/friends/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ target_id: targetId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to ${action} user:`, errorData);
        return errorData.message || 'Error occurred';
      }
  
      const responseData = await response.json();
      toast.success(`User ${action}ed successfully!`);
      
      // Refresh relevant lists
      fetchUsers();
      fetchFriends();
      
      return responseData.message;
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`An error occurred while ${action}ing the user.`);
    }
  }

  async function rejectFriendRequest(requesterId: string) {
    try {
      const response = await fetch(`${apiEndpoint}/friends/reject-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ requester_id: requesterId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to reject friend request:', errorData);
        return errorData.message || 'Error occurred';
      }
  
      const responseData = await response.json();
      toast.success('Friend request rejected!');
      
      // Refresh pending requests
      fetchPendingRequests();
      
      return responseData.message;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('An error occurred while rejecting the friend request.');
    }
  }

  // Cleanup function
  useEffect(() => {
    return () => {
      if (usersAbortControllerRef.current) {
        usersAbortControllerRef.current.abort();
      }
      if (friendsAbortControllerRef.current) {
        friendsAbortControllerRef.current.abort();
      }
      if (requestsAbortControllerRef.current) {
        requestsAbortControllerRef.current.abort();
      }
    };
  }, []);

  const contextData: UserContextProps = {
    user,
    users,
    sendFriendRequest,
    receivedRequests,
    setReceivedRequests,
    removeFriend,
    addFriend,
    blockUser,
    setUsers,
    setFilteredUsers,
    onchange: setOnchange,
    rejectFriendRequest,
    friends,
    filteredFriends,
  };

  return (
    <UserContext.Provider value={contextData}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);