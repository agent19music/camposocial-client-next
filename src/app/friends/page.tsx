"use client";

import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/header';
import SideNav from '@/components/sidenav';
import { 
  MessageSquare, 
  UserPlus, 
  Users, 
  Search, 
  Heart, 
  MoreHorizontal,
  Phone,
  Video,
  Send,
  Star,
  Clock,
  MapPin,
  Shield,
  UserX
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthContext } from '@/context/authcontext';
import { toast } from 'react-hot-toast';

interface Friend {
  id: number;
  name: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  mutualFriends: number;
  course: string;
  year: string;
  bio: string;
  isClose: boolean;
  messagePreview: string;
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

  const friendsLinks = [
    { label: "Messages", icon: <MessageSquare className="h-4 w-4" />, onClick: () => setActiveTab("messages") },
    { label: "Find Friends", icon: <UserPlus className="h-4 w-4" />, onClick: () => setActiveTab("discover") },
    { label: "Friend Requests", icon: <Users className="h-4 w-4" />, onClick: () => setActiveTab("requests") },
    { label: "Activity", icon: <Heart className="h-4 w-4" />, onClick: () => setActiveTab("activity") },
  ];

  const friends = [
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

  const handleFilterSelect = (filterId: string) => {
    console.log('Filter selected:', filterId);
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
                <div className="bg-muted/30 rounded-lg p-2 mb-3">
                  <p className="text-sm line-clamp-1">{friend.messagePreview}</p>
                  <p className="text-xs text-muted-foreground mt-1">{friend.messageTime}</p>
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

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header onSearch={handleSearch} onFilterSelect={handleFilterSelect} searchQuery={searchQuery} />
      <main className="mobile-content-padding lg:pb-4">
        <div className="flex flex-col md:flex-row">
          {/* Left SideNav - Desktop Only */}
          <div className="hidden md:block md:w-64 flex-shrink-0">
            <SideNav links={friendsLinks} />
          </div>
          
          {/* Center content */}
          <div className="flex-1 flex flex-col gap-6 p-4 lg:gap-6 lg:p-6">
            
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
            
            {/* Main Content */}
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center md:text-left">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent mb-2"
                >
                  Your Campus Network
                </motion.h1>
                <p className="text-muted-foreground">Connect, chat, and build meaningful relationships</p>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
                  <TabsTrigger value="friends" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Friends</span>
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">Messages</span>
                  </TabsTrigger>
                  <TabsTrigger value="discover" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Discover</span>
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span className="hidden sm:inline">Requests</span>
                    {requests.length > 0 && (
                      <Badge className="bg-purple-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-4 rounded-full">
                        {requests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="friends" className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Your Friends ({friends.length})</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                    {friends.map((friend) => (
                      <FriendCard key={friend.id} friend={friend} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="messages" className="mt-6 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Recent Messages</h2>
                  <div className="grid gap-4 md:grid-cols-1">
                    {friends
                      .filter(friend => friend.messagePreview)
                      .sort((a, b) => b.unreadCount - a.unreadCount)
                      .map((friend) => (
                        <FriendCard key={friend.id} friend={friend} showMessage={true} />
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="discover" className="mt-6 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">People You Might Know</h2>
                  <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                    {suggestions.map((person) => (
                      <motion.div
                        key={person.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="glass-card hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-12 h-12 border-2 border-background shadow-md">
                                <AvatarImage src={person.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white font-semibold">
                                  {person.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground mb-1">{person.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">@{person.username}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <span>{person.course}</span>
                                  <span>•</span>
                                  <span>{person.year}</span>
                                  <span>•</span>
                                  <span>{person.mutualFriends} mutual friends</span>
                                </div>
                                {person.bio && (
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{person.bio}</p>
                                )}
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className="text-xs">
                                    {person.reason}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0">
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Add Friend
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-muted hover:bg-muted/50">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    Message
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="requests" className="mt-6 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">Friend Requests ({requests.length})</h2>
                  {requests.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                      {requests.map((request) => (
                        <motion.div
                          key={request.id}
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
                                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-semibold">
                                    {request.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-foreground mb-1">{request.name}</h3>
                                  <p className="text-sm text-muted-foreground mb-2">@{request.username}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                    <span>{request.course}</span>
                                    <span>•</span>
                                    <span>{request.year}</span>
                                    <span>•</span>
                                    <span>{request.mutualFriends} mutual friends</span>
                                    <span>•</span>
                                    <span>{request.requestTime}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0">
                                      Accept
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-muted hover:bg-muted/50">
                                      Decline
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <Card className="glass-card">
                      <CardContent className="p-8 text-center">
                        <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No friend requests</h3>
                        <p className="text-muted-foreground">When someone sends you a friend request, it will appear here.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
