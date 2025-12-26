"use client"

import React, { useContext } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AuthContext } from '@/context/authcontext'

export const ReplyInput = ({ onReply }: { onReply: (content: string) => void }) => {
  const [replyText, setReplyText] = React.useState('')
  const maxLength = 280
  const { currentUser, isAuthenticated } = useContext(AuthContext)

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex justify-center py-4">
        <p className="text-muted-foreground">Please log in to reply</p>
      </div>
    )
  }

  const handleSubmit = () => {
    if (replyText.trim()) {
      onReply(replyText.trim())
      setReplyText('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex gap-3 py-3 dark:text-gray-100 border-b border-border">
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={currentUser.avatar} />
        <AvatarFallback className="dark:bg-gray-700 dark:text-gray-200 text-sm font-semibold">
          {currentUser.display_name?.[0]?.toUpperCase() ||
            currentUser.first_name?.[0]?.toUpperCase() ||
            currentUser.username?.[0]?.toUpperCase() ||
            'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          role="textbox"
          placeholder="Post your reply"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          className="min-h-[120px] resize-none border-none focus-visible:ring-0 p-2 text-[17px] dark:text-white dark:bg-transparent dark:placeholder:text-gray-400 placeholder:text-muted-foreground bg-transparent"
        />
        <div className="flex justify-between items-center mt-2">
          <div className={`text-sm ${replyText.length > maxLength * 0.8
              ? 'text-orange-500'
              : replyText.length > maxLength * 0.9
                ? 'text-red-500'
                : 'text-muted-foreground'
            } dark:text-gray-400`}>
            {replyText.length}/{maxLength}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!replyText.trim() || replyText.length > maxLength}
            className="rounded-full dark:hover:bg-primary/80 px-6"
            size="sm"
          >
            Reply
          </Button>
        </div>
        {replyText.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to reply quickly
          </p>
        )}
      </div>
    </div>
  )
}