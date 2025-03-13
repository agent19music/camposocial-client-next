"use client";

import { createContext, ReactNode, useState, useEffect, useContext } from "react";
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
  removeFriend: (friendId: number) => void;
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
  const apiEndpoint = "http://127.0.0.1:5000"; 

  const [isLoading, setIsLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const[users, setUsers] = useState<any[]>([]);
  const[friends, setFriends] = useState<any[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<any[]>([]);
  const[receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [onchange, setOnchange] = useState(false);
  const [category, setCategory] = useState("Fun"); // Default category
  const user = ['fuck ts']
  const{authToken, onAuthChange}= useContext(AuthContext)


  const router = useRouter()

  useEffect(() => {
    setIsLoading(true);
    fetch(`${apiEndpoint}/users`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
        
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        setFilteredUsers(data.users); // Initially set filteredUsers to all users
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setUsers([]);
        setFilteredUsers([]);
        setIsLoading(false);
      });
  }, [onAuthChange]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${apiEndpoint}/friends`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
        
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setFriends(data.friends);
        setFilteredFriends(data.friends); // Initially set filteredFriends to all friends
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setFriends([]);
        setFilteredFriends([]);
        setIsLoading(false);
      });
  }, [onAuthChange]);

  async function sendFriendRequest(receipientId: number) {
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

  
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${apiEndpoint}/friends/pending`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });
  
        if (!response.ok) {
          console.error('Failed to get pending friend requests');
          return;
        }
  
        const data = await response.json();
        setReceivedRequests(data.pending_requests);
      } catch (error) {
        console.error('Error fetching pending friend requests:', error);
      }
    })();
  }, [onAuthChange]);
  

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
      return responseData.message;
    } catch (error) {
      console.error('Error removing friend:', error);
      return 'Error occurred while processing the request.';
    }
  }

  async function addFriend(requesterId: string) {
    try {
      const response = await fetch(`${apiEndpoint}/friends/add`, {
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
      return responseData.message;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return 'Error occurred while processing the request.';
    }
  }

  async function blockUser(targetId: string, action: 'block' | 'unblock') {
    try {
      const response = await fetch(`${apiEndpoint}/friends/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ target_id: targetId, action }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to block/unblock user:', errorData);
        return errorData.message || 'Error occurred';
      }
  
      const responseData = await response.json();
      return responseData.message;
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      return 'Error occurred while processing the request.';
    }
  }

  async function rejectFriendRequest(requesterId: string) {
    try {
      const response = await fetch(`${apiEndpoint}/friends/reject`, {
        method: 'DELETE',
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
      return responseData.message;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      return 'Error occurred while processing the request.';
    }
  }

  console.log('====================================');
  console.log('users', users);
  console.log('====================================');
  
  


  
    const contextData = {
      user,
      users,
      sendFriendRequest,
      receivedRequests,
      addFriend,
      removeFriend,
      blockUser,
      rejectFriendRequest,
      friends,
      filteredFriends

    };
  
    return (
      <UserContext.Provider value={contextData}>
        {children}
      </UserContext.Provider>
    );
  }

// To use the context
export const useUserContext = () => useContext(UserContext);