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
  const {selectedYap} = useContext(YapContext)
  const [replies, setReplies] = React.useState(selectedYap.replies)
  const eventLinks = [
    { href: "/comingsoon", label: "Coming Soon", icon: <Home className="h-4 w-4" /> },
    { href: "/social-events", label: "Social Events", icon: <Calendar className="h-4 w-4" /> },
    { href: "/fun-events", label: "Fun Events", icon: <PartyPopper className="h-4 w-4" /> },
  ];

  const handleNewReply = (content) => {
    const newReply = {
      author: "Current User",
      content,
      timestamp: "Just now"
    }
    setReplies([newReply, ...replies])
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