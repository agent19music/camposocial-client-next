"use client";

import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

// UI Components
import { Input } from "@/components/ui/input";
import FilterPills, { FilterPill } from "@/components/filter-pills";
import Header from "@/components/header";
import SideNav from "@/components/sidenav";

// Friend Components
import { FriendCard } from "@/components/friends/FriendCard";
import { RequestCard } from "@/components/friends/RequestCard";
import { EnhancedRequestCard } from "@/components/friends/EnhancedRequestCard";
import { SearchableDiscover } from "@/components/friends/SearchableDiscover";
import { EmptyState } from "@/components/friends/EmptyState";
import { FriendCardSkeleton } from "@/components/friends/LoadingSkeletons";
// Contexts
import { AuthContext } from "@/context/authcontext";
import { UserContext } from "@/context/usercontext";
import { useWebSocket } from "@/context/websocket-context";
import { Colors as Palette } from '@/constants/Colors';

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for managing request status updates
  const [requestStates, setRequestStates] = useState<Record<string, 'accepting' | 'declining' | 'accepted' | 'declined'>>({});
  
  const { currentUser } = useContext(AuthContext);
  const { 
    friends, 
    users, 
    receivedRequests, 
    sendFriendRequest, 
    addFriend, 
    rejectFriendRequest, 
    removeFriend,
    blockUser,
    isLoadingUsers,
    isLoadingSearch
  } = useContext(UserContext);

  
  // Get WebSocket context for notification counts
  const { notificationCounts, markFriendRequestsAsSeen } = useWebSocket();

  console.log('received requests:', receivedRequests);
  
  const router = useRouter();

  // Fetch friends and users on mount
  useEffect(() => {
    if (users.length) {
      return;
    }
    setRequestStates({});
  }, [users.length]);

  // Quick access for desktop sidebar
  const quickAccessLinks = [
    { label: "Home", icon: <MessageSquare className="h-4 w-4" />, onClick: () => router.push("/") },
  ];

  // Filter pills with notification counts
  const filterPills: FilterPill[] = [
    { id: "friends", label: "Friends", active: activeTab === "friends" },
    { id: "messages", label: "Messages", active: activeTab === "messages" },
    { id: "discover", label: "Discover", active: activeTab === "discover" },
    { 
      id: "requests", 
      label: "Requests", 
      active: activeTab === "requests",
      badge: notificationCounts.friend_requests > 0 ? notificationCounts.friend_requests : undefined
    },
    { id: "activity", label: "Activity", active: activeTab === "activity" },
  ];

  const handleFilterSelect = (filterId: string) => {
    setActiveTab(filterId);
    // Mark friend requests as seen when user clicks on requests tab
    if (filterId === "requests" && notificationCounts.friend_requests > 0) {
      markFriendRequestsAsSeen();
    }
  };

  // Friend actions
  const handleMessageFriend = (friend: any) => {
    router.push(`/chat?user=${friend.id || friend.username}`);
  };

  const handleAddFriend = async (userId: string | number) => {
    await sendFriendRequest(userId.toString());
  };

  const handleAcceptRequest = async (requestId: string | number) => {
    const reqId = requestId.toString();
    setRequestStates(prev => ({ ...prev, [reqId]: 'accepting' }));
    
    try {
      await addFriend(reqId);
      
      setRequestStates(prev => ({ ...prev, [reqId]: 'accepted' }));
      
      setTimeout(() => {
        setRequestStates(prev => {
          const newState = { ...prev };
          delete newState[reqId];
          return newState;
        });
      }, 2000);
    } catch (error) {
      setRequestStates(prev => {
        const newState = { ...prev };
        delete newState[reqId];
        return newState;
      });
    }
  };

  const handleDeclineRequest = async (requestId: string | number) => {
    const reqId = requestId.toString();
    setRequestStates(prev => ({ ...prev, [reqId]: 'declining' }));
    
    try {
      await rejectFriendRequest(reqId);
      
      // Show declined state briefly
      setRequestStates(prev => ({ ...prev, [reqId]: 'declined' }));
      
      // Remove the request after showing decline message
      setTimeout(() => {
        setRequestStates(prev => {
          const newState = { ...prev };
          delete newState[reqId];
          return newState;
        });
      }, 1500);
    } catch (error) {
      // Remove loading state on error
      setRequestStates(prev => {
        const newState = { ...prev };
        delete newState[reqId];
        return newState;
      });
    }
  };

  const handleViewProfile = (user: any) => {
    router.push(`/viewprofile/${user.username}`);
  };

  const handleRemoveFriend = async (friendId: string | number) => {
    await removeFriend(friendId.toString());
  };

  // Filter friends based on search query
  const filteredFriends = friends.filter(friend => 
    !searchQuery || 
    friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${friend.firstName || ''} ${friend.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <main className="mobile-content-padding lg:pb-4">
        {/* Filter Pills - Mobile */}
        <FilterPills 
          filters={filterPills}
          onFilterSelect={handleFilterSelect}
          className="lg:hidden"
        />

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left SideNav - Desktop Only */}
          <div className="hidden md:block md:w-64 flex-shrink-0">
            <SideNav links={quickAccessLinks} />
          </div>
          
          {/* Center content */}
          <div className="flex-1 flex flex-col gap-6 p-4 lg:gap-6 lg:p-6">
            
            {/* Desktop Filter Pills */}
            <div className="hidden lg:block">
              <FilterPills 
                filters={filterPills}
                onFilterSelect={handleFilterSelect}
              />
            </div>
            
            {/* Desktop Search */}
            {(activeTab === 'friends' || activeTab === 'messages') && (
              <div className="hidden lg:flex w-full justify-center items-center">
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 rounded-full border-muted bg-muted/50 focus:bg-background"
                  />
                </div>
              </div>
            )}
            
            {/* Content based on active tab */}
            <AnimatePresence mode="wait">
              {activeTab === "friends" && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                  
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {friends.length} friends
                    </span>
                  </div>

                  {isLoadingUsers ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {[...Array(4)].map((_, index) => (
                        <FriendCardSkeleton key={index} />
                      ))}
                    </div>
                  ) : friends.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {filteredFriends.map((friend) => (
                        <FriendCard
                          key={friend.id || friend.username}
                          friend={friend}
                          onMessage={handleMessageFriend}
                          onRemoveFriend={handleRemoveFriend}
                          onViewProfile={handleViewProfile}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      type="friends" 
                      onAction={() => setActiveTab('discover')}
                    />
                  )}
                </motion.div>
              )}

              {activeTab === "discover" && (
                <motion.div
                  key="discover"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
              
                  </div>

                  <SearchableDiscover
                    onAddFriend={handleAddFriend}
                    onViewProfile={handleViewProfile}
                  />
                </motion.div>
              )}

              {activeTab === "requests" && (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
     

                  {receivedRequests.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      <AnimatePresence mode="popLayout">
                        {receivedRequests.map((request) => (
                          <EnhancedRequestCard
                            key={request.id}
                            request={request}
                            onAccept={handleAcceptRequest}
                            onDecline={handleDeclineRequest}
                            onViewProfile={handleViewProfile}
                            requestState={requestStates[request.id?.toString()]}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <EmptyState 
                      type="requests" 
                      onAction={() => setActiveTab('discover')}
                    />
                  )}
                </motion.div>
              )}

              {activeTab === "messages" && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
               
                  </div>

                  {friends.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {filteredFriends
                        .slice(0, 8)
                        .map((friend) => (
                          <FriendCard
                            key={friend.id || friend.username}
                            friend={friend}
                            showMessage={true}
                            onMessage={handleMessageFriend}
                            onRemoveFriend={handleRemoveFriend}
                            onViewProfile={handleViewProfile}
                            
                          />
                        ))}
                    </div>
                  ) : (
                    <EmptyState 
                      type="messages" 
                      onAction={() => setActiveTab('friends')}
                    />
                  )}
                </motion.div>
              )}

              {activeTab === "activity" && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                
                  </div>

                  <EmptyState 
                    type="activity" 
                    onAction={() => router.push('/')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
