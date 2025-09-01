"use client"

import React from 'react'
import { useContext, useEffect, useState } from 'react'
import { YapContext } from '@/context/yapcontext'
import { AuthContext } from '@/context/authcontext'
import { Separator } from "@/components/ui/separator"
import { MainYap } from '@/components/singleyap/mainyap'
import { ReplyInput } from '@/components/singleyap/replyinput'
import { ReplyList } from '@/components/singleyap/replylist'
import Header from '@/components/header'
import SideNav from '@/components/sidenav'
import { Home,Calendar, PartyPopper, Repeat2, Share2 } from "lucide-react";
import { useRouter, useParams } from 'next/navigation'

export default function SingleYapView() {
  const {selectedYap, addReply, yapReplies, setYapReplies, fetchYapById} = useContext(YapContext)
  const {currentUser, isAuthenticated} = useContext(AuthContext)
  const router = useRouter()
  const params = useParams()
  const [isLoadingYap, setIsLoadingYap] = useState(false)
  
  // Extract yap ID from slug (remove the nanoid part)
  const extractYapIdFromSlug = (slug: string): string => {
    if (typeof slug !== 'string') return '';
    // The slug format is: yapId-nanoid
    // Find the last hyphen and take everything before it
    const lastHyphenIndex = slug.lastIndexOf('-');
    if (lastHyphenIndex === -1) return slug;
    return slug.substring(0, lastHyphenIndex);
  }

  // Effect to fetch yap if not already selected (handles page refresh)
  useEffect(() => {
    if (!params?.slug || !isAuthenticated) return;

    const yapId = extractYapIdFromSlug(params.slug as string);
    
    // If we don't have a selected yap or it doesn't match the URL, fetch it
    if (!selectedYap || selectedYap.id !== yapId) {
      setIsLoadingYap(true);
      fetchYapById(yapId).finally(() => {
        setIsLoadingYap(false);
      });
    } else if (selectedYap?.replies) {
      // If we have the yap but no replies loaded, set them
      setYapReplies(selectedYap.replies);
    }
  }, [params?.slug, selectedYap, isAuthenticated, fetchYapById, setYapReplies])

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
  
  const eventLinks = [
    { 
      label: "Coming Soon", 
      icon: <Home className="h-4 w-4" />,
      onClick: () => router.push("/comingsoon")
    },
    { 
      label: "Social Events", 
      icon: <Calendar className="h-4 w-4" />,
      onClick: () => router.push("/social-events")
    },
    { 
      label: "Fun Events", 
      icon: <PartyPopper className="h-4 w-4" />,
      onClick: () => router.push("/fun-events")
    },
  ];

  const handleNewReply = async (content: string) => {
    if (!selectedYap || !currentUser) return;
    
    try {
      await addReply(selectedYap.id, content);
      // The context will handle optimistic updates
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <Header/>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to view this yap.</p>
        </div>
      </div>
    )
  }

  if (isLoadingYap) {
    return (
      <div className="container mx-auto p-4">
        <Header/>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 flex-shrink-0">
            <SideNav links={eventLinks} />
          </div>
          <main className="flex-1 max-w-[600px] mx-auto border-x border-border">
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
              <h1 className="text-xl font-bold">Yap</h1>
            </div>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!selectedYap) {
    return (
      <div className="container mx-auto p-4">
        <Header/>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 flex-shrink-0">
            <SideNav links={eventLinks} />
          </div>
          <main className="flex-1 max-w-[600px] mx-auto border-x border-border">
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
              <h1 className="text-xl font-bold">Yap</h1>
            </div>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Yap not found</p>
                <button 
                  onClick={() => router.back()}
                  className="text-primary hover:underline"
                >
                  Go back
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Header/>
      <div className="flex flex-col md:flex-row">
        {/* Left SideNav */}
        <div className="md:w-64 flex-shrink-0">
          <SideNav links={eventLinks} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 max-w-[600px] mx-auto border-x border-border">
          <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border p-4 z-10">
            <h1 className="text-xl font-bold">Yap</h1>
          </div>
          
          <MainYap />
          
          <div className="px-4">
            <ReplyInput onReply={handleNewReply} />
          </div>
          
          <Separator className="my-1" />
          
          <ReplyList replies={yapReplies.filter((r): r is Reply & { user: NonNullable<Reply['user']> } => r.user !== undefined)} />
        </main>
      </div>
    </div>
  )
}