"use client";

import { createContext, ReactNode, useState, useContext } from "react";
import { AuthContext } from "./authcontext";
import { toast } from "react-hot-toast";
import { FriendshipContextType, FriendshipFriend, FriendshipFriendRequest } from "../utils/types";

 

export const FriendshipContext = createContext<FriendshipContextType>({} as FriendshipContextType);

export function FriendshipProvider({ children }: { children: ReactNode }) {
  const { authToken, isAuthenticated } = useContext(AuthContext);
  const [pendingRequests, setPendingRequests] = useState<FriendshipFriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendshipFriend[]>([]);
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

  // Helper function to check authentication
  const checkAuth = (): boolean => {
    if (!isAuthenticated || !authToken) {
      toast.error("Please log in to perform this action");
      return false;
    }
    return true;
  };

  const sendFriendRequest = async (recipientId: string) => {
    if (!checkAuth()) return;

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
    if (!checkAuth()) return;

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
    if (!checkAuth()) return;

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
    if (!checkAuth()) return;

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
    if (!checkAuth()) return;

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
    if (!checkAuth()) return;

    try {
      const response = await fetch(`${apiEndpoint}/friends/requests`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch friend requests");

      const data = await response.json();
      setPendingRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      // Don't show toast error for this as it might be called frequently
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