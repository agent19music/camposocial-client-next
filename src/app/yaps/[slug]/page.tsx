"use client"

import React from 'react'
import { useContext } from 'react'
import { YapContext } from '@/context/yapcontext'
import { Separator } from "@/components/ui/separator"
import { MainYap } from '@/components/singleyap/mainyap'
import { ReplyInput } from '@/components/singleyap/replyinput'
import { ReplyList } from '@/components/singleyap/replylist'
import Header from '@/components/header'
import SideNav from '@/components/sidenav'
import { Home,Calendar, PartyPopper, Repeat2, Share2 } from "lucide-react";

export default function SingleYapView() {
  const {selectedYap, addReply} = useContext(YapContext)
  const [replies, setReplies] = React.useState(selectedYap?.replies || [])
  const eventLinks = [
    { href: "/comingsoon", label: "Coming Soon", icon: <Home className="h-4 w-4" /> },
    { href: "/social-events", label: "Social Events", icon: <Calendar className="h-4 w-4" /> },
    { href: "/fun-events", label: "Fun Events", icon: <PartyPopper className="h-4 w-4" /> },
  ];

  const handleNewReply = async (content) => {
    if (!selectedYap) return;
    
    try {
      await addReply(selectedYap.id, content);
      // The yapReplies will be updated by context, so we can refresh from there
      // For now, just add optimistically
      const newReply = {
        id: Date.now(), // temporary ID
        content,
        user: {
          username: "Current User",
          display_name: "Current User",
          avatar: null
        },
        created_at: new Date().toISOString(),
        isOptimistic: true
      }
      setReplies(prev => [newReply, ...prev])
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  }

  return (
    <div className="container mx-auto p-4">
    <Header/>
    <div className="flex  flex-col md:flex-row">
{/* Left SideNav */}
 <div className="md:w-64 flex-shrink-0">
          <SideNav links = {eventLinks} />
        </div>
    <main className="sm:max-w-[600px] mx-auto lg:min-w-full  border-x border-border">
      <MainYap yap={selectedYap} />
      <div className="px-4">
        <ReplyInput onReply={handleNewReply} />
      </div>
      <Separator className="my-1" />
      <ReplyList replies={replies} />
    </main>
    </div>
    </div>
  )
}