"use client"
import React, { useContext } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Heart, MessageCircle, MoreHorizontal, Repeat, Share2, Users, Calendar, ShoppingBag, Search, Sparkles, UserPlus, Plus, TrendingUp, Clock, UsersIcon } from "lucide-react"
import { Home, PartyPopper } from "lucide-react";
import Header from '@/components/header'
import SideNav from '@/components/sidenav'
import { Input } from '@/components/ui/input'
import { Repeat2 } from 'lucide-react'
import Image from 'next/image';
import YapCard from '@/components/yapcard'
import { YapContext } from '@/context/yapcontext'
import YapCardSkeleton from '@/components/yapskeleton'
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/authcontext'
import { UserContext } from '@/context/usercontext'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AddYap from '@/components/addyap'

const NewUserWelcome = () => {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  const quickActions = [
    {
      icon: MessageCircle,
      title: "Share Your First Yap",
      description: "Tell your campus what's on your mind",
      action: () => {}, // This would trigger the add yap modal
      color: "from-purple-600 to-violet-600"
    },
    {
      icon: Users,
      title: "Find Friends",
      description: "Connect with classmates and build your network",
      action: () => router.push('/friends'),
      color: "from-purple-500 to-violet-400"
    },
    {
      icon: Calendar,
      title: "Discover Events",
      description: "See what's happening on campus",
      action: () => router.push('/events'),
      color: "from-violet-600 to-purple-500"
    },
    {
      icon: ShoppingBag,
      title: "Browse Marketplace",
      description: "Find great deals from fellow students",
      action: () => router.push('/marketplace'),
      color: "from-purple-400 to-violet-300"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto"
      >
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to CampoSocial, {currentUser?.first_name || 'friend'}! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            You're now part of your campus community. Here's how to get started:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card 
                className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:bg-accent/50 border-purple-200 dark:border-purple-900/30"
                onClick={action.action}
              >
                <CardContent className="p-0">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-left mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground text-left">{action.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Once you start connecting and sharing, your personalized feed will appear here.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => router.push('/friends')}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Find Friends
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function Component() {
  const { yaps, isLoading, feedType, setFeedType, refreshFeed } = useContext(YapContext)
  const { currentUser, isLoading: authLoading } = useContext(AuthContext)
  const { friends, users } = useContext(UserContext)
  const router = useRouter();

  const eventLinks = [
    { label: "Coming Soon", icon: <Home className="h-4 w-4" />, onClick: () => router.push("/comingsoon") },
    { label: "Social Events", icon: <Calendar className="h-4 w-4" />, onClick: () => router.push("/social-events") },
    { label: "Fun Events", icon: <PartyPopper className="h-4 w-4" />, onClick: () => router.push("/fun-events") },
  ];

  // Check if user is new (no yaps, no friends, etc.)
  const isNewUser = !authLoading && currentUser && (
    (yaps.length === 0) &&
    (friends.length === 0)
  );

  // Handle feed type change
  const handleFeedTypeChange = (newFeedType: 'chronological' | 'trending' | 'following') => {
    setFeedType(newFeedType);
    // The context will automatically refetch with the new feed type
  };

  // Feed type icons and labels
  const feedTypeConfig = {
    chronological: { icon: Clock, label: "Latest", description: "Recent yaps from everyone" },
    trending: { icon: TrendingUp, label: "Trending", description: "Popular yaps right now" },
    following: { icon: UsersIcon, label: "Following", description: "Yaps from people you follow" }
  };

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <div className="flex flex-col md:flex-row">
        {/* Left SideNav */}
        <div className="md:w-64 flex-shrink-0">
          <SideNav links={eventLinks} />
        </div>
        
        {/* Center content */}
        <div className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-2 justify-center items-center">
          
          {/* Search area */}
          <div className="w-full flex-1 flex justify-center items-center">
            <form>
              <div className="relative mx-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search yaps..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-full"
                />
              </div>
            </form>
          </div>

          {/* Add Yap Button */}
          <div className="w-full max-w-xl mb-4">
            <AddYap />
          </div>

          <div className="flex flex-col w-full max-w-6/12 rounded-lg border border-dashed shadow-sm overflow-y-auto lg:min-h-[780px] md:max-h-[537.6px]">
            {isNewUser ? (
              <NewUserWelcome />
            ) : (
              <div className="w-full">
                {/* Feed Type Selector */}
                <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-10">
                  <div className="flex items-center justify-between p-4">
                    <h2 className="text-xl font-bold">Home</h2>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 gap-2">
                          {React.createElement(feedTypeConfig[feedType].icon, { className: "h-4 w-4" })}
                          {feedTypeConfig[feedType].label}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {Object.entries(feedTypeConfig).map(([key, config]) => (
                          <DropdownMenuItem 
                            key={key}
                            onClick={() => handleFeedTypeChange(key as any)}
                            className="flex items-start gap-3 p-3"
                          >
                            <config.icon className="h-4 w-4 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="font-medium">{config.label}</span>
                              <span className="text-xs text-muted-foreground">{config.description}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Feed Content */}
                <div className="min-h-[400px]">
                  {isLoading ? (
                    // Display Skeletons while loading
                    <>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <YapCardSkeleton key={index} />
                      ))}
                    </>
                  ) : yaps.length > 0 ? (
                    // Display yaps
                    <div className="divide-y">
                      {yaps.map((yap) => (
                        <YapCard
                          key={yap.id}
                          display_name={yap.display_name}
                          username={yap.username}
                          content={yap.content}
                          avatar={yap.avatar}
                          media={yap.media}
                          yap={yap}
                          likes_count={yap.likes_count}
                          replies_count={yap.replies_count}
                          retweets_count={yap.retweets_count}
                        />
                      ))}
                    </div>
                  ) : (
                    // Empty state
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <MessageCircle className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No yaps yet</h3>
                      <p className="text-muted-foreground mb-4 max-w-sm">
                        {feedType === 'following' 
                          ? "Follow some people to see their yaps here, or switch to trending to discover new content."
                          : "Be the first to share what's happening!"
                        }
                      </p>
                      {feedType === 'following' && (
                        <Button 
                          variant="outline"
                          onClick={() => handleFeedTypeChange('trending')}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View Trending
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Load more button */}
                {yaps.length > 0 && (
                  <div className="p-4 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={refreshFeed}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Load more yaps'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right sidebar - Trending/Suggestions */}
        <div className="hidden lg:block w-80 p-4">
          <div className="space-y-4">
            {/* Trending hashtags */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Trending on Campus</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">#StudyGroup</p>
                    <p className="text-sm text-muted-foreground">142 yaps</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">#CampusLife</p>
                    <p className="text-sm text-muted-foreground">89 yaps</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">#Finals</p>
                    <p className="text-sm text-muted-foreground">67 yaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Who to follow */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Who to follow</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {users.slice(0, 3).map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.first_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}