"use client"
import React, { useContext, useEffect, useRef, useState, useMemo } from 'react'
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
import { PartyPopper } from "lucide-react";
import Header from '@/components/header'
import FilterPills, { FilterPill } from '@/components/filter-pills'
import { Input } from '@/components/ui/input'
import { Repeat2 } from 'lucide-react'
import Image from 'next/image';
import YapCard from '@/components/yapcard'
import { YapContext } from '@/context/yapcontext'
import YapCardSkeleton from '@/components/yapskeleton'
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/authcontext'
import { UserContext } from '@/context/usercontext'
import { useWebSocket } from '@/context/websocket-context'
import { motion } from 'framer-motion'
import { Colors as Palette } from '@/constants/Colors'
import Link from 'next/link'
import AddYap from '@/components/addyap'
import { useTheme } from '@/context/themecontext'
import WhoToFollow from '@/components/whotofollow'
import TrendingHashtags from '@/components/trending-hashtags'
import CommunitiesWidget from '@/components/communities/CommunitiesWidget'
import { AuthFadeWall } from '@/components/AuthFadeWall'

const NewUserWelcome = () => {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();
  const { theme } = useTheme();
  const quickActions = [
    {
      icon: MessageCircle,
      title: "Share Your First Yap",
      description: "Tell your campus what's on your mind",
      action: () => { }, // This would trigger the add yap modal
      color: "text-[#ff9013] dark:text-white"
    },
    {
      icon: Users,
      title: "Find Friends",
      description: "Connect with classmates and build your network",
      action: () => router.push('/friends'),
      color: "text-[#ff9013] dark:text-white"
    },
    {
      icon: Calendar,
      title: "Discover Events",
      description: "See what's happening on campus",
      action: () => router.push('/events'),
      color: "text-[#ff9013] dark:text-white"
    },
    {
      icon: ShoppingBag,
      title: "Browse Marketplace",
      description: "Find great deals from fellow students",
      action: () => router.push('/marketplace'),
      color: "text-[#ff9013] dark:text-white"
    }
  ];



  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto w-full"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <Image
              src={theme === 'dark'
                ? "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-dark.png"
                : "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/camposocial-logo-light.png"
              }
              alt="CampoSocial"
              width={80}
              height={80}
              className="rounded-2xl shadow-xl"
              priority
            />
          </motion.div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-heading)', fontFamily: 'Helvetica' }}>
            Welcome to CampoSocial, {currentUser?.first_name || 'friend'}!
          </h1>
          <p className="text-lg text-muted-foreground">
            You&apos;re now part of your campus community. Here&apos;s how to get started:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card
                className="group p-5 hover:shadow-lg transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 hover:border-[#ff9013] dark:hover:border-[#ff9013]"
                onClick={action.action}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl bg-background/80 group-hover:scale-110 transition-transform duration-300 ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="p-4 rounded-xl bg-muted/30 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">
              Once you start connecting and sharing, your personalized feed will appear here.
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => router.push('/friends')}
              size="lg"
              className="text-white shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ backgroundColor: 'var(--color-fun)' }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Start Exploring
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default function Component() {
  const { yaps, isLoading, feedType, setFeedType, refreshFeed } = useContext(YapContext)
  const { currentUser, isLoading: authLoading, isAuthenticated } = useContext(AuthContext)
  const { friends, users } = useContext(UserContext)
  const { markYapsAsSeen, hasNewYaps } = useWebSocket()
  const router = useRouter();

  const hasAttemptedRefresh = useRef(false);

  // Search state
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Client-side search filter
  const searchResults = useMemo(() => {
    if (!searchActive || !searchQuery.trim()) return yaps;
    const q = searchQuery.toLowerCase().trim();
    return yaps.filter((yap) =>
      yap.content?.toLowerCase().includes(q) ||
      yap.display_name?.toLowerCase().includes(q) ||
      yap.username?.toLowerCase().includes(q)
    );
  }, [yaps, searchActive, searchQuery]);

  // Determine which yaps to display (search results or regular feed)
  const displayYaps = searchActive && searchQuery.trim() ? searchResults : yaps;
  console.log( "displayYaps", displayYaps);

  // Force refresh yaps when authenticated user navigates back to an empty feed
  useEffect(() => {
    if (!authLoading && isAuthenticated && yaps.length === 0 && !isLoading && !hasAttemptedRefresh.current) {
      hasAttemptedRefresh.current = true;
      refreshFeed();
    }
    // Reset ref when yaps load successfully
    if (yaps.length > 0) {
      hasAttemptedRefresh.current = false;
    }
  }, [authLoading, isAuthenticated, yaps.length, isLoading, refreshFeed]);

  // Check if user is new (no yaps, no friends, etc.)
  const isNewUser = !authLoading && currentUser && (
    (yaps.length === 0) &&
    (friends.length === 0)
  );

  // Mark yaps as seen when user visits the page (after a delay to ensure they actually viewed it)
  useEffect(() => {
    if (hasNewYaps && currentUser) {
      const timer = setTimeout(() => {
        markYapsAsSeen();
      }, 3000); // Mark as seen after 3 seconds on the page

      return () => clearTimeout(timer);
    }
  }, [hasNewYaps, currentUser, markYapsAsSeen]);

  // Handle feed type change
  const handleFeedTypeChange = (filterId: string) => {
    const newFeedType = filterId as 'chronological' | 'trending' | 'following';
    setFeedType(newFeedType);
    // The context will automatically refetch with the new feed type
  };

  // Feed type icons and labels
  const feedTypeConfig = {
    chronological: { icon: Clock, label: "Latest", description: "Recent yaps from everyone" },
    trending: { icon: TrendingUp, label: "Trending", description: "Popular yaps right now" },
    following: { icon: UsersIcon, label: "Following", description: "Yaps from people you follow" }
  };

  // Filter pills for both mobile and desktop + special Search pill
  const filterPills: FilterPill[] = [
    ...Object.entries(feedTypeConfig).map(([key, config]) => ({
      id: key,
      label: config.label,
      active: feedType === key,
    })),
    { id: 'search', label: 'Search', isSearch: true },
  ];

    return (
      <div className="w-screen h-screen lg:container mx-auto p-4">
        <Header />
        <main className="mobile-content-padding lg:pb-4">
          {/* Filter Pills - Only show when authenticated (mobile) */}
          {isAuthenticated && (
            <FilterPills
              filters={filterPills}
              onFilterSelect={handleFeedTypeChange}
              className="lg:hidden"
              searchActive={searchActive}
              onSearchToggle={setSearchActive}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {/* Desktop: Autosend-style 3-column grid with dashed dividers */}
          <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-6rem)]">

            {/* Center content */}
            <div className="flex-1 flex flex-col min-w-0 lg:border-x lg:border-dashed lg:border-border/[0.12]">
              {/* Desktop Filter Pills - sticky with dashed bottom divider */}
              {isAuthenticated && (
                <div className="hidden lg:block sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-dashed border-border/[0.12] px-4 py-3">
                  <FilterPills
                    filters={filterPills}
                    onFilterSelect={handleFeedTypeChange}
                    searchActive={searchActive}
                    onSearchToggle={setSearchActive}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </div>
              )}

              {/* Add Yap - with dashed bottom divider */}
              {isAuthenticated && (
                <div className="w-full max-w-2xl mx-auto border-b border-dashed border-border/[0.12] lg:px-4 py-3">
                  <AddYap />
                </div>
              )}

              {/* Feed Container */}
              <div className="w-full max-w-2xl mx-auto flex-1">
                {isAuthenticated && isNewUser ? (
                  <NewUserWelcome />
                ) : (
                  <div className="w-full">
                    {/* Feed Content */}
                    {isAuthenticated ? (
                      <div>
                        {isLoading ? (
                          <>
                            {Array.from({ length: 4 }).map((_, index) => (
                              <div key={index} className="border-b border-dashed border-border/[0.12]">
                                <YapCardSkeleton />
                              </div>
                            ))}
                          </>
                        ) : displayYaps.length > 0 ? (
                          <div>
                            {displayYaps.map((yap, index) => (
                              <div key={yap.id} className={index < displayYaps.length - 1 ? "border-b border-dashed border-border/[0.12]" : ""}>
                                <YapCard
                                  display_name={yap.display_name}
                                  username={yap.username}
                                  content={yap.content}
                                  avatar={yap.avatar}
                                  media={yap.media}
                                  yap={yap}
                                  likes_count={yap.likes_count}
                                  replies_count={yap.replies_count}
                                  retweets_count={yap.retweets_count}
                                  badges={yap.badges}
                                  community={yap.community}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                              {searchActive ? (
                                <Search className="h-8 w-8 text-muted-foreground" />
                              ) : (
                                <MessageCircle className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <h3 className="text-lg font-medium mb-2">
                              {searchActive && searchQuery.trim() ? 'No results found' : 'No yaps yet'}
                            </h3>
                            <p className="text-muted-foreground mb-4 max-w-sm">
                              {searchActive && searchQuery.trim()
                                ? `No yaps matching "${searchQuery.trim()}" were found. Try a different search term.`
                                : feedType === 'following'
                                  ? "Follow some people to see their yaps here, or switch to trending to discover new content."
                                  : "Be the first to share what's happening!"}
                            </p>
                            {feedType === 'following' && !searchActive && (
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
                    ) : (
                      yaps.length > 0 ? (
                        <AuthFadeWall visibleItems={5} contentType="yaps">
                          <div>
                            {yaps.slice(0, 8).map((yap, index) => (
                              <div key={yap.id} className={index < 7 ? "border-b border-dashed border-border/[0.12]" : ""}>
                                <YapCard
                                  display_name={yap.display_name}
                                  username={yap.username}
                                  content={yap.content}
                                  avatar={yap.avatar}
                                  media={yap.media}
                                  yap={yap}
                                  likes_count={yap.weighted_likes_count}
                                  replies_count={yap.weighted_replies_count}
                                  retweets_count={yap.weighted_retweets_count}
                                  badges={yap.badges}
                                  community={yap.community}
                                />
                              </div>
                            ))}
                          </div>
                        </AuthFadeWall>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <MessageCircle className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No yaps yet</h3>
                          <p className="text-muted-foreground mb-4 max-w-sm">
                            Sign up to see more yaps from your campus community!
                          </p>
                        </div>
                      )
                    )}

                    {/* Load more */}
                    {isAuthenticated && displayYaps.length > 0 && !searchActive && (
                      <div className="py-4 border-t border-dashed border-border/[0.12]">
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

            {/* Right sidebar - dashed left border column divider */}
            {isAuthenticated && (
              <div className="hidden lg:block lg:w-80 flex-shrink-0 lg:pl-5">
                <div className="sticky top-4 space-y-0">
                  {/* Trending hashtags */}
                  <div className="pb-4 border-b border-dashed border-border/[0.12]">
                    <TrendingHashtags />
                  </div>

                  {/* Who to follow */}
                  <div className="py-4 border-b border-dashed border-border/[0.12]">
                    <WhoToFollow />
                  </div>

                  {/* Communities */}
                  <div className="pt-4">
                    <CommunitiesWidget />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    )
}