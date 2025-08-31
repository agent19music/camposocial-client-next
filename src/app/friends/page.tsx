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
import { SearchableDiscover } from "@/components/friends/SearchableDiscover";
import { EmptyState } from "@/components/friends/EmptyState";
import { FriendCardSkeleton } from "@/components/friends/LoadingSkeletons";

// Contexts
import { AuthContext } from "@/context/authcontext";
import { UserContext } from "@/context/usercontext";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
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
  
  const router = useRouter();

  // Quick access for desktop sidebar
  const quickAccessLinks = [
    { label: "Home", icon: <MessageSquare className="h-4 w-4" />, onClick: () => router.push("/") },
  ];

  // Filter pills
  const filterPills: FilterPill[] = [
    { id: "friends", label: "Friends", active: activeTab === "friends" },
    { id: "messages", label: "Messages", active: activeTab === "messages" },
    { id: "discover", label: "Discover", active: activeTab === "discover" },
    { id: "requests", label: "Requests", active: activeTab === "requests" },
    { id: "activity", label: "Activity", active: activeTab === "activity" },
  ];

  const handleFilterSelect = (filterId: string) => {
    setActiveTab(filterId);
  };

  // Friend actions
  const handleMessageFriend = (friend: any) => {
    router.push(`/chat?user=${friend.username}`);
  };

  const handleAddFriend = async (userId: string | number) => {
    await sendFriendRequest(userId.toString());
  };

  const handleAcceptRequest = async (requestId: string | number) => {
    await addFriend(requestId.toString());
  };

  const handleDeclineRequest = async (requestId: string | number) => {
    await rejectFriendRequest(requestId.toString());
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
    friend.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${friend.first_name || ''} ${friend.last_name || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                      Your Friends
                    </h2>
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
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Discover People
                    </h2>
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
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      Friend Requests
                    </h2>
                    {receivedRequests.length > 0 && (
                      <span className="text-sm text-muted-foreground bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
                        {receivedRequests.length} pending
                      </span>
                    )}
                  </div>

                  {receivedRequests.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {receivedRequests.map((request) => (
                        <RequestCard
                          key={request.id || request.username}
                          request={request}
                          onAccept={handleAcceptRequest}
                          onDecline={handleDeclineRequest}
                          onViewProfile={handleViewProfile}
                        />
                      ))}
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
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                      Recent Conversations
                    </h2>
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
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
                      Recent Activity
                    </h2>
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
