"use client";

import React, { useState, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, UserPlus, Clock, Activity, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FilterPills, { FilterPill } from "@/components/FilterPills";
import Header from "@/components/Header";
import SideNav from "@/components/SideNav";

// Friend Components
import { FriendCard } from "@/components/friends/FriendCard";
import { SuggestionCard } from "@/components/friends/SuggestionCard";
import { RequestCard } from "@/components/friends/RequestCard";
import { SearchableDiscover } from "@/components/friends/SearchableDiscover";
import { EmptyState } from "@/components/friends/EmptyState";
import { FriendCardSkeleton, ActivityItemSkeleton } from "@/components/friends/LoadingSkeletons";

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
    isLoadingUsers
  } = useContext(UserContext);
  
  const router = useRouter();

  // Only keep quick access for desktop sidebar
  const quickAccessLinks = [
    { label: "Home", icon: <MessageSquare className="h-4 w-4" />, onClick: () => router.push("/") },
  ];

  // Filter pills for both mobile and desktop
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
    // Navigate to messages with this friend
    router.push(`/messages?user=${friend.username}`);
  };

  const handleCallFriend = (friend: any) => {
    // TODO: Implement voice call
    console.log('Calling', friend.display_name || friend.username);
  };

  const handleVideoCallFriend = (friend: any) => {
    // TODO: Implement video call
    console.log('Video calling', friend.display_name || friend.username);
  };

  const handleViewProfile = (user: any) => {
    router.push(`/profile/${user.username}`);
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

  const handleRemoveFriend = async (friendId: string | number) => {
    await removeFriend(friendId.toString());
  };

  const handleBlockUser = async (userId: string | number) => {
    await blockUser(userId.toString(), 'block');
  };

  // Mock activity data - replace with real data from your API
  const activities = [
    {
      id: 1,
      type: "like",
      user: friends[0]?.display_name || friends[0]?.first_name,
      action: "liked your yap",
      content: "Great presentation today!",
      time: "5m ago",
      avatar: friends[0]?.avatar
    },
    {
      id: 2,
      type: "comment",
      user: friends[1]?.display_name || friends[1]?.first_name,
      action: "commented on your event",
      content: "Count me in for the study group!",
      time: "1h ago",
      avatar: friends[1]?.avatar
    }
  ].filter(activity => activity.user); // Filter out activities without valid users

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <main className="mobile-content-padding lg:pb-4">
        {/* Filter Pills - Always visible on mobile and desktop */}
        <FilterPills 
          filters={filterPills}
          onFilterSelect={handleFilterSelect}
          className="lg:hidden"
        />

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left SideNav - Desktop Only - Only Quick Access */}
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
            
            {/* Desktop Search - Only for certain tabs */}
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
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="min-h-[600px]"
            >
              <AnimatePresence mode="wait">
                {activeTab === "friends" && (
                  <motion.div
                    key="friends"
                    variants={itemVariants}
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
                        {friends
                          .filter(friend => 
                            !searchQuery || 
                            friend.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            friend.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            `${friend.first_name} ${friend.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((friend) => (
                            <FriendCard
                              key={friend.id || friend.username}
                              friend={friend}
                              onMessage={handleMessageFriend}
                              onCall={handleCallFriend}
                              onVideoCall={handleVideoCallFriend}
                              onRemoveFriend={handleRemoveFriend}
                              onBlock={handleBlockUser}
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

                {activeTab === "messages" && (
                  <motion.div
                    key="messages"
                    variants={itemVariants}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        Recent Conversations
                      </h2>
                    </div>

                    {friends.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {friends
                          .filter(friend => 
                            !searchQuery || 
                            friend.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .slice(0, 8) // Show only recent conversations
                          .map((friend) => (
                            <FriendCard
                              key={friend.id || friend.username}
                              friend={{
                                ...friend,
                                messagePreview: "Hey! How's it going?", // Mock message preview
                                messageTime: "2h ago", // Mock time
                                unreadCount: Math.floor(Math.random() * 3) // Mock unread count
                              }}
                              showMessage={true}
                              onMessage={handleMessageFriend}
                              onCall={handleCallFriend}
                              onVideoCall={handleVideoCallFriend}
                              onRemoveFriend={handleRemoveFriend}
                              onBlock={handleBlockUser}
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

                {activeTab === "discover" && (
                  <motion.div
                    key="discover"
                    variants={itemVariants}
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
                    variants={itemVariants}
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

                {activeTab === "activity" && (
                  <motion.div
                    key="activity"
                    variants={itemVariants}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
                        Recent Activity
                      </h2>
                    </div>

                    {activities.length > 0 ? (
                      <div className="space-y-3">
                        {activities.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            variants={itemVariants}
                            custom={index}
                            className="p-4 bg-card rounded-lg border border-muted hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
                                <Activity className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-semibold">{activity.user}</span>{' '}
                                  <span className="text-muted-foreground">{activity.action}</span>
                                </p>
                                {activity.content && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    &ldquo;{activity.content}&rdquo;
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">{activity.time}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState 
                        type="activity" 
                        onAction={() => router.push('/')}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
  messageTime: string;
  unreadCount: number;
}

interface Suggestion {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  mutualFriends: number;
  course: string;
  year: string;
  bio: string;
  reason: string;
}

interface Request {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  mutualFriends: number;
  course: string;
  year: string;
  requestTime: string;
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useContext(AuthContext);

  // Only keep quick access for desktop sidebar
  const quickAccessLinks = [
    { label: "Home", icon: <MessageSquare className="h-4 w-4" />, onClick: () => window.location.href = "/" },
  ];

  // Filter pills for both mobile and desktop
  const filterPills: FilterPill[] = [
    { id: "messages", label: "Messages", active: activeTab === "messages" },
    { id: "friends", label: "Friends", active: activeTab === "friends" },
    { id: "discover", label: "Discover", active: activeTab === "discover" },
    { id: "requests", label: "Requests", active: activeTab === "requests" },
    { id: "activity", label: "Activity", active: activeTab === "activity" },
  ];

  const handleFilterSelect = (filterId: string) => {
    setActiveTab(filterId);
  };

  const friends: Friend[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "/yoruichipfp.jpg",
      isOnline: true,
      lastSeen: "2m ago",
      mutualFriends: 5,
      course: "Computer Science",
      year: "3rd Year",
      bio: "Love coding and coffee ☕",
      isClose: true,
      messagePreview: "Hey! How was your exam?",
      messageTime: "2m ago",
      unreadCount: 2
    },
    {
      id: 2,
      name: "Mike Chen",
      username: "mikechen",
      avatar: "/wkndpfp.jpg",
      isOnline: false,
      lastSeen: "1h ago",
      mutualFriends: 3,
      course: "Engineering",
      year: "4th Year",
      bio: "Building the future 🚀",
      isClose: false,
      messagePreview: "See you at the event!",
      messageTime: "1h ago",
      unreadCount: 0
    },
    {
      id: 3,
      name: "Alex Rivera",
      username: "alexr",
      avatar: undefined,
      isOnline: true,
      lastSeen: "5m ago",
      mutualFriends: 8,
      course: "Design",
      year: "2nd Year",
      bio: "UI/UX enthusiast ✨",
      isClose: true,
      messagePreview: "Thanks for the help with the project!",
      messageTime: "3h ago",
      unreadCount: 1
    },
  ];

  const suggestions: Suggestion[] = [
    {
      id: 1,
      name: "Emma Wilson",
      username: "emmaw",
      avatar: undefined,
      mutualFriends: 2,
      course: "Computer Science",
      year: "3rd Year",
      bio: "Full-stack developer in the making",
      reason: "Same course"
    },
    {
      id: 2,
      name: "David Park",
      username: "davidp",
      avatar: undefined,
      mutualFriends: 4,
      course: "Engineering",
      year: "3rd Year",
      bio: "Robotics and AI researcher",
      reason: "Mutual friends"
    },
  ];

  const requests: Request[] = [
    {
      id: 1,
      name: "Lisa Chang",
      username: "lisac",
      avatar: undefined,
      mutualFriends: 1,
      course: "Business",
      year: "2nd Year",
      requestTime: "2d ago"
    }
  ];

  const activities = [
    {
      id: 1,
      type: "like",
      user: "Sarah Johnson",
      action: "liked your yap",
      content: "Great presentation today!",
      time: "5m ago"
    },
    {
      id: 2,
      type: "comment",
      user: "Mike Chen",
      action: "commented on your event",
      content: "Count me in for the study group!",
      time: "1h ago"
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const FriendCard = ({ friend, showMessage = false }: { friend: Friend; showMessage?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-background shadow-md">
                <AvatarImage src={friend.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-500 text-white font-semibold">
                  {friend.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {friend.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-sm"></div>
              )}
              {friend.isClose && (
                <div className="absolute -top-1 -right-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{friend.name}</h3>
                {friend.isOnline && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Online
                  </Badge>
                )}
                {friend.unreadCount > 0 && (
                  <Badge className="bg-purple-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 rounded-full flex items-center justify-center">
                    {friend.unreadCount}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">@{friend.username}</p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span>{friend.course}</span>
                <span>•</span>
                <span>{friend.year}</span>
                <span>•</span>
                <span>{friend.mutualFriends} mutual friends</span>
              </div>
              
              {friend.bio && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{friend.bio}</p>
              )}
              
              {showMessage && friend.messagePreview && (
                <div className="bg-purple-500 rounded-lg p-2 mb-3">
                  <p className="text-sm line-clamp-1 text-white">{friend.messagePreview}</p>
                  <p className="text-xs text-purple-100 mt-1">{friend.messageTime}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Message
                </Button>
                <Button size="sm" variant="outline" className="border-muted hover:bg-muted/50">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Star className="h-4 w-4 mr-2" />
                      {friend.isClose ? 'Remove from close friends' : 'Add to close friends'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <UserX className="h-4 w-4 mr-2" />
                      Unfriend
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const SuggestionCard = ({ suggestion }: { suggestion: Suggestion }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 border-2 border-background shadow-md">
              <AvatarImage src={suggestion.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white font-semibold">
                {suggestion.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground truncate">{suggestion.name}</h3>
                <Badge variant="outline" className="text-xs px-2 py-0.5 ml-2">
                  {suggestion.reason}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">@{suggestion.username}</p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span>{suggestion.course}</span>
                <span>•</span>
                <span>{suggestion.year}</span>
                <span>•</span>
                <span>{suggestion.mutualFriends} mutual friends</span>
              </div>
              
              {suggestion.bio && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{suggestion.bio}</p>
              )}
              
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Add Friend
                </Button>
                <Button size="sm" variant="outline" className="border-muted hover:bg-muted/50">
                  <Shield className="h-3 w-3 mr-1" />
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const RequestCard = ({ request }: { request: Request }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-card hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 border-2 border-background shadow-md">
              <AvatarImage src={request.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-500 text-white font-semibold">
                {request.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground truncate">{request.name}</h3>
                <span className="text-xs text-muted-foreground">{request.requestTime}</span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-1">@{request.username}</p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <span>{request.course}</span>
                <span>•</span>
                <span>{request.year}</span>
                <span>•</span>
                <span>{request.mutualFriends} mutual friends</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0">
                  Accept
                </Button>
                <Button size="sm" variant="outline" className="border-muted hover:bg-muted/50">
                  Decline
                </Button>
                <Button size="sm" variant="ghost">
                  <Shield className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <main className="mobile-content-padding lg:pb-4">
        {/* Filter Pills - Always visible on mobile and desktop */}
        <FilterPills 
          filters={filterPills}
          onFilterSelect={handleFilterSelect}
          className="lg:hidden"
        />

        <div className="flex flex-col md:flex-row">
          {/* Left SideNav - Desktop Only - Only Quick Access */}
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
            
            {/* Desktop Search - Hidden on Mobile */}
            <div className="hidden lg:flex w-full justify-center items-center">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 rounded-full border-muted bg-muted/50 focus:bg-background"
                />
              </div>
            </div>
            
            {/* Content based on active tab */}
            {activeTab === "friends" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Your Friends ({friends.length})</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {friends.map((friend) => (
                    <FriendCard key={friend.id} friend={friend} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Messages</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {friends.filter(f => f.unreadCount > 0 || f.messagePreview).map((friend) => (
                    <FriendCard key={friend.id} friend={friend} showMessage={true} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "discover" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">People You May Know</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "requests" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Friend Requests ({requests.length})</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {requests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
                </div>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <Card key={activity.id} className="glass-card">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{activity.user}</span>
                              <span className="text-muted-foreground"> {activity.action}</span>
                            </p>
                            {activity.content && (
                              <p className="text-sm text-muted-foreground mt-1">&quot;{activity.content}&quot;</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">{activity.time}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
