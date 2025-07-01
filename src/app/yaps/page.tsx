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
import { Heart, MessageCircle, MoreHorizontal, Repeat, Share2, Users, Calendar, ShoppingBag, Search, Sparkles, UserPlus, Plus } from "lucide-react"
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

const NewUserWelcome = () => {
  const { currentUser } = useContext(AuthContext);
  const router = useRouter();

  const quickActions = [
    {
      icon: MessageCircle,
      title: "Share Your First Yap",
      description: "Tell your campus what's on your mind",
      action: () => {}, // This would trigger the add yap modal
      color: "from-[#92736C] to-[#92736C]/80"
    },
    {
      icon: Users,
      title: "Find Friends",
      description: "Connect with classmates and build your network",
      action: () => router.push('/friends'),
      color: "from-[#92736C]/90 to-[#FDF1F5]"
    },
    {
      icon: Calendar,
      title: "Discover Events",
      description: "See what's happening on campus",
      action: () => router.push('/events'),
      color: "from-[#92736C]/80 to-[#92736C]/60"
    },
    {
      icon: ShoppingBag,
      title: "Browse Marketplace",
      description: "Find great deals from fellow students",
      action: () => router.push('/marketplace'),
      color: "from-[#92736C]/70 to-[#FDF1F5]/80"
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
          <div className="w-16 h-16 bg-gradient-to-r from-[#92736C] to-[#92736C]/80 rounded-full flex items-center justify-center mx-auto mb-4">
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
                className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:bg-accent/50 border-[#92736C]/10"
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
              className="bg-gradient-to-r from-[#92736C] to-[#92736C]/90 hover:from-[#92736C]/90 hover:to-[#92736C]/80 text-white"
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
  const {yaps} = useContext(YapContext)
  const { currentUser, isLoading } = useContext(AuthContext)
  const { friends, users } = useContext(UserContext)
  const router = useRouter();

  const eventLinks = [
    { label: "Coming Soon", icon: <Home className="h-4 w-4" />, onClick: () => router.push("/comingsoon") },
    { label: "Social Events", icon: <Calendar className="h-4 w-4" />, onClick: () => router.push("/social-events") },
    { label: "Fun Events", icon: <PartyPopper className="h-4 w-4" />, onClick: () => router.push("/fun-events") },
  ];

  // Check if user is new (no yaps, no friends, etc.)
  const isNewUser = !isLoading && currentUser && (
    (yaps.length === 0) &&
    (friends.length === 0)
  );

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

          <div className="flex flex-col w-full max-w-6/12 rounded-lg border border-dashed shadow-sm overflow-y-auto lg:min-h-[780px] md:max-h-[537.6px]">
            {isNewUser ? (
              <NewUserWelcome />
            ) : (
              <Tabs defaultValue="for-you" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="for-you">For You</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
                <TabsContent value="for-you">
                  {yaps.length < 1 ? (
                    // Display Skeletons while loading
                    <>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <YapCardSkeleton key={index} />
                      ))}
                    </>
                  ) : (
                    // Display YapCards when data is loaded
                    yaps.length > 0 &&
                    yaps.map((yap, index) => (
                      <YapCard key={index} {...yap} yap={yap} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="following">
                  <p className="text-center text-muted-foreground mt-4">
                    Yaps from accounts you follow will appear here.
                  </p>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}