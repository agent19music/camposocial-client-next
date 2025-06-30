"use client";

import { createContext, ReactNode, useState, useContext } from "react";
import { AuthContext } from "./authcontext";
import { toast } from "react-hot-toast";

interface FriendshipContextType {
  sendFriendRequest: (recipientId: string) => Promise<void>;
  acceptFriendRequest: (requesterId: string) => Promise<void>;
  rejectFriendRequest: (requesterId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unfriend: (friendId: string) => Promise<void>;
  getFriendRequests: () => Promise<void>;
  pendingRequests: FriendRequest[];
  friends: Friend[];
}

interface Friend {
  id: string;
  username: string;
  photoUrl: string;
  course?: string;
  isOnline: boolean;
}

interface FriendRequest {
  id: string;
  username: string;
  photoUrl: string;
  timestamp: Date;
}

export const FriendshipContext = createContext<FriendshipContextType>({} as FriendshipContextType);

export function FriendshipProvider({ children }: { children: ReactNode }) {
  const { authToken } = useContext(AuthContext);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

  const sendFriendRequest = async (recipientId: string) => {
    try {
      const response = await fetch(`${apiEndpoint}/friends/send-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ recipient_id: recipientId }),
      });

      if (!response.ok) throw new Error("Failed to send friend request");
      
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error("Failed to send friend request");
      throw error;
    }
  };

  const acceptFriendRequest = async (requesterId: string) => {
    try {
      const response = await fetch(`${apiEndpoint}/friends/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ requester_id: requesterId }),
      });

      if (!response.ok) throw new Error("Failed to accept friend request");

      // Update local state
      setPendingRequests(prev => 
        prev.filter(request => request.id !== requesterId)
      );
      
      toast.success("Friend request accepted!");
      await getFriendRequests(); // Refresh the requests list
    } catch (error) {
      toast.error("Failed to accept friend request");
      throw error;
    }
  };

  const rejectFriendRequest = async (requesterId: string) => {
    try {
      const response = await fetch(`${apiEndpoint}/friends/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ requester_id: requesterId }),
      });

      if (!response.ok) throw new Error("Failed to reject friend request");

      setPendingRequests(prev => 
        prev.filter(request => request.id !== requesterId)
      );
      
      toast.success("Friend request rejected");
    } catch (error) {
      toast.error("Failed to reject friend request");
      throw error;
    }
  };

  const blockUser = async (userId: string) => {
    try {
      const response = await fetch(`${apiEndpoint}/friends/block`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ target_id: userId }),
      });

      if (!response.ok) throw new Error("Failed to block user");

      setFriends(prev => 
        prev.filter(friend => friend.id !== userId)
      );
      
      toast.success("User blocked");
    } catch (error) {
      toast.error("Failed to block user");
      throw error;
    }
  };

  const unfriend = async (friendId: string) => {
    try {
      const response = await fetch(`${apiEndpoint}/friends/unfriend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ friend_id: friendId }),
      });

      if (!response.ok) throw new Error("Failed to unfriend");

      setFriends(prev => 
        prev.filter(friend => friend.id !== friendId)
      );
      
      toast.success("Friend removed");
    } catch (error) {
      toast.error("Failed to remove friend");
      throw error;
    }
  };

  const getFriendRequests = async () => {
    try {
      const response = await fetch(`${apiEndpoint}/friends/requests`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch friend requests");

      const data = await response.json();
      setPendingRequests(data.requests);
    } catch (error) {
      toast.error("Failed to fetch friend requests");
      throw error;
    }
  };

  return (
    <FriendshipContext.Provider
      value={{
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        blockUser,
        unfriend,
        getFriendRequests,
        pendingRequests,
        friends,
      }}
    >
      {children}
    </FriendshipContext.Provider>
  );
}