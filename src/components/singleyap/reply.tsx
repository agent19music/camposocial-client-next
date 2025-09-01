"use client"

import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { MessageCircle, Repeat2, Heart, Share2, MoreHorizontal } from "lucide-react"
import { cn } from '@/lib/utils'
import { Reply } from '@/utils/types'

export const ReplyComponent = ({ reply }: { reply: Reply }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50)) // Mock data
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertContent, setAlertContent] = useState({ title: '', description: '' })

  const handleAlert = (title: string, description: string) => {
    setAlertContent({ title, description })
    setIsAlertOpen(true)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  return (
    <article className="px-4 py-3 hover:bg-accent/50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={reply.user?.avatar || undefined} />
          <AvatarFallback className="text-sm font-semibold">
            {reply.user?.display_name?.[0]?.toUpperCase() || 
             reply.user?.username?.[0]?.toUpperCase() || 
             'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[15px]">
              <span className="font-bold hover:underline cursor-pointer">
                {reply.user?.display_name || 'Anonymous'}
              </span>
              <span className="text-muted-foreground">
                @{reply.user?.username || 'anonymous'}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground hover:underline cursor-pointer">
                {formatTimestamp(reply.created_at)}
              </span>
              {reply.isOptimistic && (
                <span className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">
                  Sending...
                </span>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 dark:hover:bg-gray-700">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px] dark:bg-gray-800 dark:border-gray-700">
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 dark:hover:bg-gray-700"
                  onSelect={() =>
                    handleAlert(
                      "Block this account?",
                      "They will not be able to follow you or view your posts, and you will not see posts from this account."
                    )
                  }
                >
                  Block @{reply.user?.username || 'anonymous'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="dark:hover:bg-gray-700"
                  onSelect={() =>
                    handleAlert(
                      "Report post?",
                      "Help us understand what's happening with this post."
                    )
                  }
                >
                  Report post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-[15px] mt-1 break-words whitespace-pre-wrap">{reply.content}</p>

          <div className="flex justify-between mt-3 max-w-md">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 group p-2 h-8 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <MessageCircle className="w-[18px] h-[18px] mr-2 group-hover:text-primary dark:group-hover:text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 group p-2 h-8 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Repeat2 className="w-[18px] h-[18px] mr-2 group-hover:text-green-500 dark:group-hover:text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "group p-2 h-8 rounded-full flex items-center gap-1",
                isLiked 
                  ? "text-red-500 hover:bg-red-500/10" 
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
              onClick={handleLike}
            >
              <Heart
                className={cn(
                  "w-[18px] h-[18px]",
                  isLiked ? "fill-current" : "group-hover:text-red-500 dark:group-hover:text-red-500"
                )}
              />
              {likeCount > 0 && (
                <span className={cn(
                  "text-sm ml-1",
                  isLiked ? "text-red-500" : "group-hover:text-red-500 dark:group-hover:text-red-500"
                )}>
                  {likeCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 group p-2 h-8 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Share2 className="w-[18px] h-[18px] group-hover:text-primary dark:group-hover:text-primary" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>{alertContent.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertContent.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  )
}
