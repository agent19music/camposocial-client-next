'use client'

import React, { useState, useEffect, useContext } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  MoreHorizontal,
  Edit3,
  UserPlus,
  UserCheck,
  MessageCircle,
  Heart,
  Repeat2,
  Bookmark,
  Share2,
  Wifi,
  WifiOff,
  AlertCircle,
  BadgeCheck    
} from "lucide-react"
import { AuthContext } from "@/context/authcontext"
import { YapContext } from "@/context/yapcontext"
import  YapCard from "@/components/yapcard"
import  AddYap from "@/components/addyap"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import toast from "react-hot-toast"
import Header from '@/components/header'
import Image from 'next/image'  
import BadgeDisplay from '@/components/badgedisplay'
import BadgePurchaseModal from '@/components/badgepurchasemodal'
import BadgeManagement from '@/components/badgemanagement'

interface User {
  id: number
  username: string
  display_name: string
  first_name: string
  last_name: string
  email: string
  bio: string
  avatar: string
  category: string
  phone_no: string
  followers_count?: number
  following_count?: number
  yaps_count?: number
  join_date?: string
  yap_header_img?: string
  badges?: BadgeItem[]
}

interface BadgeItem {
  id: number
  name: string
  image_url: string
  is_animated: boolean
}

interface Yap {
    id: string;
    content: string;
    timestamp: string;
    updated_at?: string;
    location?: string;
    user_id: string;
    username: string;
    display_name: string;
    avatar: string;
    original_yap_id?: string;
    original_yap?: Yap; // The original yap data for retweets
    is_retweet?: boolean;
    is_quote?: boolean;
    replies_count: number;
    likes_count: number;
    retweets_count: number;
    bookmarks_count: number;
    media: MediaItem[];
    hashtags: string[];
    replies: Reply[];
    badges?: Array<{id: number, name: string, image_url: string, is_animated: boolean}>;
    // Client-side optimistic state
    isOptimistic?: boolean;
    optimisticLiked?: boolean;
    optimisticLikesCount?: number;
    optimisticRepliesCount?: number;
    optimisticRetweetsCount?: number;
  }
  interface MediaItem {
    id: number;
    url: string;
    type: 'image' | 'video';
  }
  interface Reply {
    id: number;
    content: string;
    created_at: string;
    user?: {
      id: string;
      username: string;
      display_name: string;
      avatar: string;
    };
    parent_reply_id?: number;
    isOptimistic?: boolean;
  }

interface ProfilePageProps {
  user?: User
}

export default function ProfilePage({ user: propUser }: ProfilePageProps) {
  const params = useParams()
  const router = useRouter()
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
  const { currentUser, authToken } = useContext(AuthContext)
  // const { fetchYaps } = useContext(YapContext)  // Commented out as not used
  
  const [user, setUser] = useState<User | null>(propUser || null)
  const [yaps, setYaps] = useState<Yap[]>([])
  const [isLoading, setIsLoading] = useState(!propUser)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [activeTab, setActiveTab] = useState("yaps")
  const [yapsLoading, setYapsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [networkError, setNetworkError] = useState(false)
  const [showBadgeModal, setShowBadgeModal] = useState(false)

  const username = params.username as string

  // Check online status
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)
    checkOnlineStatus()

    return () => {
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [])

  useEffect(() => {
    if (propUser) {
      setUser(propUser)
      setIsOwnProfile(currentUser?.username === propUser.username)
      fetchUserYaps(propUser.username)
      if (currentUser?.username !== propUser.username) {
        fetchFollowStatus(propUser.id)
      }
    } else if (username && isOnline) {
      fetchUserData(username)
    }
  }, [propUser, username, currentUser, isOnline])

  const fetchUserData = async (username: string) => {
    if (!isOnline) {
      setNetworkError(true)
      return
    }

    setIsLoading(true)
    setNetworkError(false)
    
    try {
      const response = await fetch(`${apiEndpoint}/yap/profile/${username}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user
        setUser(userData)
        setIsOwnProfile(currentUser?.username === userData.username)
        setYaps(data.yaps?.items || [])
        
        // Fetch follow status if not own profile
        if (!isOwnProfile) {
          fetchFollowStatus(userData.id)
        }
      } else if (response.status === 404) {
        toast.error('User not found')
        
      } else {
        throw new Error('Failed to fetch user data')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setNetworkError(true)
      if (isOnline) {
        toast.error('Failed to load profile')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFollowStatus = async (userId: number) => {
    if (!isOnline) return

    try {
      const response = await fetch(`${apiEndpoint}/users/${userId}/follow-status`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(data.is_following)
      }
    } catch (error) {
      console.error('Error fetching follow status:', error)
    }
  }

  const fetchUserYaps = async (username: string) => {
    if (!isOnline) return

    setYapsLoading(true)
    try {
      const response = await fetch(`${apiEndpoint}/yap/profile/${username}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setYaps(data.yaps?.items || [])
      }
    } catch (error) {
      console.error('Error fetching user yaps:', error)
    } finally {
      setYapsLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user || !isOnline) {
      if (!isOnline) {
        toast.error('Please reconnect to follow users')
      }
      return
    }
    
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow'
      const response = await fetch(`${apiEndpoint}/users/${user.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsFollowing(!isFollowing)
        setUser(prev => prev ? { ...prev, followers_count: data.followers_count } : null)
        toast.success(isFollowing ? 'Unfollowed' : 'Following')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to follow user')
      }
    } catch (error) {
      console.error('Error following user:', error)
      toast.error('Failed to follow user')
    }
  }

  const handleEditProfile = () => {
    router.push('/userprofile')
  }

  const handleBack = () => {
    router.back()
  }

  const handleRetry = () => {
    if (username) {
      fetchUserData(username)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Show offline alert
  if (!isOnline) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
            <div className="flex items-center gap-4 p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-muted/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="font-bold text-lg">Profile</h1>
                <p className="text-sm text-muted-foreground">@{username}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <Alert className="mb-4">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                 You&apos;re currently offline. Please reconnect to view the full profile and interact with content.      
              </AlertDescription>
            </Alert>
            
            <div className="text-center py-8">
              <WifiOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Offline Mode</h2>
              <p className="text-muted-foreground mb-4">
                You can see the profile structure, but live data requires an internet connection.
              </p>
              <Button onClick={() => window.location.reload()}>
                <Wifi className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
            <div className="flex items-center gap-4 p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <Skeleton className="h-32 w-full rounded-lg mb-4" />
            <div className="flex items-end gap-4 mb-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (networkError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
            <div className="flex items-center gap-4 p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-muted/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="font-bold text-lg">Profile</h1>
                <p className="text-sm text-muted-foreground">@{username}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load profile data. Please check your connection and try again.
              </AlertDescription>
            </Alert>
            
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
              <p className="text-muted-foreground mb-4">
                Unable to load profile data. This might be due to a network issue.
              </p>
              <Button onClick={handleRetry}>
                <Wifi className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
            <div className="flex items-center gap-4 p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-muted/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="font-bold text-lg">Profile</h1>
                <p className="text-sm text-muted-foreground">@{username}</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">User not found</h2>
              <p className="text-muted-foreground mb-4">
                The user @{username} doesn&apos;t exist or has been removed.
              </p>
              <Button onClick={() => router.push('/yaps')}>Go back to Yaps</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="hover:bg-muted/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-lg">{user.display_name}</h1>
              <p className="text-sm text-muted-foreground">{user.yaps_count || 0} yaps</p>
            </div>
            {!isOwnProfile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Block @{user.username}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Block @{user.username}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          They won&apos;t be able to see your yaps or follow you. You can unblock them at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Block</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-purple-500/20 to-violet-500/20">
            {user.yap_header_img && (
              <Image 
                src={user.yap_header_img} 
                alt="Cover" 
                className="w-full h-full object-cover"
                width={1500}
                height={500}
              />
            )}
          </div>
          
          {/* Profile Info */}
          <div className="px-4 pb-4">
            <div className="flex items-end gap-4 -mt-16 mb-4">
              <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar} alt={user.display_name} />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-purple-500 to-violet-500 text-white">
                  {getInitials(user.display_name || user.first_name + ' ' + user.last_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1" />
              
              {isOwnProfile ? (
                <Button 
                  variant="outline" 
                  onClick={handleEditProfile}
                  className="rounded-full"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="rounded-full"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={isFollowing ? "outline" : "default"}
                    onClick={handleFollow}
                    className="rounded-full"
                    disabled={!isOnline}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="space-y-3">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {user.display_name}
                  {user.badges && user.badges.length > 0 && (
                    <BadgeDisplay badges={user.badges} size="md" />
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground">@{user.username}</p>
                  {user.username === "ufwsean" && (
                    <Image
                      src="https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/twitter-verified-badge-gold-seeklogo.png"
                      alt="Verified"
                      className="w-4 h-4"
                      width={16}
                      height={16}
                    />
                  )}
                  {isOwnProfile && (

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBadgeModal(true)}
                      className="text-xs h-6 px-2 bg-gradient-to-r from-[#D29DF6] to-[#C17FF2] hover:from-[#C17FF2] hover:to-[#B16FE8] text-white hover:text-white"
                    >
                      <BadgeCheck className="h-4 w-4 mr-1" />
                      Get Badge
                    </Button>
                  )}
                </div>
              </div>

              {user.bio && (
                <p className="text-sm leading-relaxed">{user.bio}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {user.category && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.category}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.join_date || new Date().toISOString())}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <button className="hover:underline">
                  <span className="font-semibold text-foreground">{user.following_count || 0}</span>
                  <span className="text-muted-foreground"> Following</span>
                </button>
                <button className="hover:underline">
                  <span className="font-semibold text-foreground">{user.followers_count || 0}</span>
                  <span className="text-muted-foreground"> Followers</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Management for Own Profile */}
        {isOwnProfile && (
          <div className="px-4 pb-4">
            <BadgeManagement 
              userId={user.id}
              onUpdate={() => {
                // Refresh user data to show updated badges
                if (username) {
                  fetchUserData(username)
                }
              }}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-transparent border-b rounded-none h-12">
            <TabsTrigger 
              value="yaps" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              Yaps
            </TabsTrigger>
            <TabsTrigger 
              value="replies" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              Replies
            </TabsTrigger>
            <TabsTrigger 
              value="media" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
            >
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yaps" className="mt-0">
            {isOwnProfile && (
              <div className="p-4 border-b">
                <AddYap />
              </div>
            )}
            
            {yapsLoading ? (
              <div className="space-y-4 p-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : yaps.length > 0 ? (
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
                  badges={yap.badges}
                />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-muted-foreground mb-2">
                  {isOwnProfile ? "You haven't yapped yet" : `@${user.username} hasn't yapped yet`}
                </div>
                {isOwnProfile && (
                  <Button onClick={() => setActiveTab("yaps")}>
                    Yap something!
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="replies" className="mt-0">
            <div className="p-8 text-center text-muted-foreground">
              No replies yet
            </div>
          </TabsContent>

          <TabsContent value="media" className="mt-0">
            <div className="p-8 text-center text-muted-foreground">
              No media yet
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Badge Purchase Modal */}
      <BadgePurchaseModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        onSuccess={() => {
          // Refresh user data to show new badge
          if (username) {
            fetchUserData(username)
          }
        }}
      />
    </div>
  )
}
