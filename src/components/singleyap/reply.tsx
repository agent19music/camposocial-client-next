"use client"

import React, { useState, useContext } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Repeat2, Heart, Share2, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from '@/lib/utils'
import { Reply } from '@/utils/types'
import { AuthContext } from '@/context/authcontext'
import { YapContext } from '@/context/yapcontext'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ReplyComponentProps {
  reply: Reply
  onReplyToReply?: (parentReplyId: number, content: string) => void
  depth?: number
}

export const ReplyComponent = ({ reply, onReplyToReply, depth = 0 }: ReplyComponentProps) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(reply.likes_count || 0)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertContent, setAlertContent] = useState({ title: '', description: '' })
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showChildReplies, setShowChildReplies] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  const { authToken, isAuthenticated } = useContext(AuthContext)
  const { selectedYap, addReply } = useContext(YapContext)
  const router = useRouter()
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

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

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like')
      return
    }

    setIsLikeLoading(true)

    // Optimistic update
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1)

    try {
      const response = await fetch(`${apiEndpoint}/replies/${reply.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLikeCount(data.likes_count)
        setIsLiked(data.liked)
      } else {
        // Revert on error
        setIsLiked(!newIsLiked)
        setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1)
        toast.error('Failed to like reply')
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked)
      setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1)
      console.error('Error liking reply:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !isAuthenticated || !selectedYap) return

    try {
      await addReply(selectedYap.id, replyText.trim(), reply.id)
      setReplyText('')
      setShowReplyInput(false)
      toast.success('Reply posted!')
    } catch (error) {
      toast.error('Failed to post reply')
    }
  }

  const handleUserClick = () => {
    if (reply.user?.username) {
      router.push(`/yaps/profile/${reply.user.username}`)
    }
  }

  const maxDepth = 2 // Limit nesting depth for UX

  return (
    <article className={cn(
      "px-4 py-3 hover:bg-accent/50 dark:hover:bg-gray-800/50 transition-colors",
      depth > 0 && "ml-10 border-l-2 border-border"
    )}>
      <div className="flex gap-3">
        <Avatar
          className="w-10 h-10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleUserClick}
        >
          <AvatarImage src={reply.user?.avatar || undefined} />
          <AvatarFallback className="text-sm font-semibold">
            {reply.user?.display_name?.[0]?.toUpperCase() ||
              reply.user?.username?.[0]?.toUpperCase() ||
              'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[15px] flex-wrap">
              <span
                className="font-bold hover:underline cursor-pointer"
                onClick={handleUserClick}
              >
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

          {/* Action buttons */}
          <div className="flex justify-between mt-3 max-w-md">
            {/* Reply button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 group p-2 h-8 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => depth < maxDepth && setShowReplyInput(!showReplyInput)}
              disabled={depth >= maxDepth}
            >
              <MessageCircle className="w-[18px] h-[18px] mr-1 group-hover:text-primary dark:group-hover:text-primary" />
              {(reply.child_replies_count || 0) > 0 && (
                <span className="text-sm">{reply.child_replies_count}</span>
              )}
            </Button>

            {/* Retweet button - visual only for now */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 group p-2 h-8 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Repeat2 className="w-[18px] h-[18px] group-hover:text-green-500 dark:group-hover:text-green-500" />
            </Button>

            {/* Like button */}
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
              disabled={isLikeLoading}
            >
              <Heart
                className={cn(
                  "w-[18px] h-[18px]",
                  isLiked ? "fill-current" : "group-hover:text-red-500 dark:group-hover:text-red-500"
                )}
              />
              {likeCount > 0 && (
                <span className={cn(
                  "text-sm",
                  isLiked ? "text-red-500" : "group-hover:text-red-500 dark:group-hover:text-red-500"
                )}>
                  {likeCount}
                </span>
              )}
            </Button>

            {/* Share button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 group p-2 h-8 rounded-full dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied!')
              }}
            >
              <Share2 className="w-[18px] h-[18px] group-hover:text-primary dark:group-hover:text-primary" />
            </Button>
          </div>

          {/* Reply input */}
          {showReplyInput && (
            <div className="mt-3 flex gap-2">
              <Textarea
                placeholder={`Reply to @${reply.user?.username || 'anonymous'}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value.slice(0, 280))}
                className="min-h-[80px] resize-none text-sm"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim()}
                  className="rounded-full"
                >
                  Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowReplyInput(false)
                    setReplyText('')
                  }}
                  className="rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Show/hide child replies toggle */}
          {reply.child_replies && reply.child_replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-primary hover:bg-primary/10"
              onClick={() => setShowChildReplies(!showChildReplies)}
            >
              {showChildReplies ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Hide replies
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show {reply.child_replies.length} {reply.child_replies.length === 1 ? 'reply' : 'replies'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Child replies */}
      {showChildReplies && reply.child_replies && reply.child_replies.length > 0 && (
        <div className="mt-2">
          {reply.child_replies.map((childReply) => (
            <ReplyComponent
              key={childReply.id}
              reply={childReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

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
