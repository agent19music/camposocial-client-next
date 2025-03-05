"use client"

import React from 'react'
import { useContext } from 'react'
import { YapContext } from '@/context/yapcontext'
import { Separator } from "@/components/ui/separator"
import { MainYap } from './mainyap'
import { ReplyInput } from './replyinput'
import { ReplyList } from './replylist'

export default function SingleYapView() {
  const selectedYap = useContext(YapContext)
  const [replies, setReplies] = React.useState(selectedYap.replies)

  const handleNewReply = (content) => {
    const newReply = {
      author: "Current User",
      content,
      timestamp: "Just now"
    }
    setReplies([newReply, ...replies])
  }

  return (
    <main className="max-w-[600px] mx-auto min-h-screen border-x border-border">
      <MainYap yap={selectedYap} />
      <div className="px-4">
        <ReplyInput onReply={handleNewReply} />
      </div>
      <Separator className="my-1" />
      <ReplyList replies={replies} />
    </main>
  )
}