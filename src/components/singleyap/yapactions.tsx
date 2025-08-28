"use client"

import React, { useContext } from 'react'
import { Button } from "@/components/ui/button"
import { MessageCircle, Repeat2, Heart, Bookmark, Share2 } from "lucide-react"
import { cn } from '@/lib/utils'
import { YapContext } from '@/context/yapcontext'
import { AuthContext } from '@/context/authcontext'
import { toast } from 'react-hot-toast'

export const YapActions = () => {
  const { selectedYap, toggleLike, retweet } = useContext(YapContext)
  const { currentUser, isAuthenticated } = useContext(AuthContext)
  const [isBookmarked, setIsBookmarked] = React.useState(false)
  
  if (!selectedYap) return null

  const isLiked = selectedYap.optimisticLiked ?? false
  const likesCount = (selectedYap.optimisticLikesCount ?? selectedYap.likes_count) || 0
  const retweetsCount = (selectedYap.optimisticRetweetsCount ?? selectedYap.retweets_count) || 0
  const repliesCount = (selectedYap.optimisticRepliesCount ?? selectedYap.replies_count) || 0

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like yaps')
      return
    }
    await toggleLike(selectedYap.id)
  }

  const handleRetweet = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to retweet')
      return
    }
    await retweet(selectedYap.id)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${selectedYap.display_name} on CampoSocial`,
        text: selectedYap.content,
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const scrollToReplyInput = () => {
    const replyInput = document.querySelector('[role="textbox"]')
    if (replyInput) {
      replyInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      ;(replyInput as HTMLElement).focus()
    }
  }

  return (
    <div className="flex justify-between py-2 max-w-md">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-primary hover:bg-primary/10 group flex items-center gap-2 p-2 h-9 rounded-full"
        onClick={scrollToReplyInput}
      >
        <MessageCircle className="w-[18px] h-[18px] group-hover:text-primary" />
        {repliesCount > 0 && (
          <span className="text-sm group-hover:text-primary">{repliesCount}</span>
        )}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 group flex items-center gap-2 p-2 h-9 rounded-full"
        onClick={handleRetweet}
      >
        <Repeat2 className="w-[18px] h-[18px] group-hover:text-green-500" />
        {retweetsCount > 0 && (
          <span className="text-sm group-hover:text-green-500">{retweetsCount}</span>
        )}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "group flex items-center gap-2 p-2 h-9 rounded-full",
          isLiked 
            ? "text-red-500 hover:bg-red-500/10" 
            : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
        )}
        onClick={handleLike}
      >
        <Heart 
          className={cn(
            "w-[18px] h-[18px]",
            isLiked ? "fill-current" : "group-hover:text-red-500"
          )} 
        />
        {likesCount > 0 && (
          <span className={cn(
            "text-sm",
            isLiked ? "text-red-500" : "group-hover:text-red-500"
          )}>
            {likesCount}
          </span>
        )}
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "group flex items-center gap-2 p-2 h-9 rounded-full",
          isBookmarked 
            ? "text-primary hover:bg-primary/10" 
            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
        )}
        onClick={() => setIsBookmarked(!isBookmarked)}
      >
        <Bookmark 
          className={cn(
            "w-[18px] h-[18px]",
            isBookmarked ? "fill-current" : "group-hover:text-primary"
          )} 
        />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-primary hover:bg-primary/10 group p-2 h-9 rounded-full"
        onClick={handleShare}
      >
        <Share2 className="w-[18px] h-[18px] group-hover:text-primary" />
      </Button>
    </div>
  )
}