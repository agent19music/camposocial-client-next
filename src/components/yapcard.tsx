"use client"

import React, { useContext, useState } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Repeat2, Heart, Share2, Send } from "lucide-react"
import Image from "next/image"
import { useRouter } from 'next/navigation';
import { YapContext } from '@/context/yapcontext'
import { cn } from '@/lib/utils'
import { MediaGrid } from './yapmediagrid'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const YapCard = ({ display_name, username, content, avatar, media, yap, likes_count, replies_count, retweets_count }) => {
  const router = useRouter();
  const { navigateToSingleYapView, toggleLike, addReply, retweet } = useContext(YapContext);
  
  // Local states for UI interactions
  const [isLiked, setIsLiked] = useState(yap.optimisticLiked ?? false);
  const [currentLikesCount, setCurrentLikesCount] = useState(yap.optimisticLikesCount ?? likes_count);
  const [currentRepliesCount, setCurrentRepliesCount] = useState(yap.optimisticRepliesCount ?? replies_count);
  const [currentRetweetsCount, setCurrentRetweetsCount] = useState(yap.optimisticRetweetsCount ?? retweets_count);
  
  // Dialog states
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isRetweetDialogOpen, setIsRetweetDialogOpen] = useState(false);
  const [isQuoteRetweetDialogOpen, setIsQuoteRetweetDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [retweetContent, setRetweetContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isSubmittingRetweet, setIsSubmittingRetweet] = useState(false);

  // Update local state when yap prop changes (from optimistic updates)
  React.useEffect(() => {
    setIsLiked(yap.optimisticLiked ?? false);
    setCurrentLikesCount(yap.optimisticLikesCount ?? likes_count);
    setCurrentRepliesCount(yap.optimisticRepliesCount ?? replies_count);
    setCurrentRetweetsCount(yap.optimisticRetweetsCount ?? retweets_count);
  }, [yap.optimisticLiked, yap.optimisticLikesCount, yap.optimisticRepliesCount, yap.optimisticRetweetsCount, likes_count, replies_count, retweets_count]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Immediate UI feedback
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setCurrentLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    
    try {
      await toggleLike(yap.id);
    } catch (error) {
      // Revert on error (though the context should handle this)
      setIsLiked(!newIsLiked);
      setCurrentLikesCount(prev => newIsLiked ? prev - 1 : prev + 1);
    }
  };

  const handleReply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReplyDialogOpen(true);
  };

  const submitReply = async () => {
    if (!replyContent.trim() || isSubmittingReply) return;
    
    setIsSubmittingReply(true);
    
    try {
      await addReply(yap.id, replyContent.trim());
      setReplyContent('');
      setIsReplyDialogOpen(false);
      // Optimistically update replies count
      setCurrentRepliesCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleRetweet = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetweetDialogOpen(true);
  };

  const submitRetweet = async (isQuote: boolean) => {
    if (isSubmittingRetweet) return;
    
    // For plain retweet, we pass empty string; for quote retweet, we need content
    if (isQuote && !retweetContent.trim()) return;
    
    setIsSubmittingRetweet(true);
    
    try {
      await retweet(yap.id, isQuote ? retweetContent.trim() : '');
      setRetweetContent('');
      setIsRetweetDialogOpen(false);
      setIsQuoteRetweetDialogOpen(false);
      // Optimistically update retweets count
      setCurrentRetweetsCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to submit retweet:', error);
    } finally {
      setIsSubmittingRetweet(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Yap by ${display_name}`,
          text: content,
          url: window.location.origin + `/yaps/${yap.id}`,
        });
      } catch (error) {
        // User cancelled sharing or sharing failed
        console.log('Sharing cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + `/yaps/${yap.id}`);
        // You could show a toast here
        console.log('Link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy link');
      }
    }
  };

  return (
    <>
      <Card 
        className={cn(
          "border-b border-x-0 rounded-none first:border-t-0 transition-colors duration-200 hover:cursor-pointer",
          "hover:bg-gray-50 dark:hover:bg-foreground/5",
          yap.isOptimistic && "opacity-70 bg-blue-50 dark:bg-blue-950/20"
        )} 
        onClick={() => navigateToSingleYapView(yap, 'spc')}
      >
        <CardHeader className="flex flex-row items-start space-y-0 pb-2 px-4 pt-3">
          <Avatar className="w-10 h-10 mr-3 flex-shrink-0">
            <AvatarImage src={avatar} alt={display_name} />
            <AvatarFallback>{display_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <h3 className="font-bold text-[15px] truncate">{display_name}</h3>
              <p className="text-[15px] text-muted-foreground truncate">@{username}</p>
              {yap.isOptimistic && (
                <span className="text-xs text-blue-500 ml-2">Posting...</span>
              )}
            </div>
            <p className="text-[15px] break-words whitespace-pre-wrap">{content}</p>
            {yap.location && (
              <p className="text-sm text-muted-foreground mt-1">📍 {yap.location}</p>
            )}
            {yap.hashtags && yap.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {yap.hashtags.map((hashtag, index) => (
                  <span key={index} className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">
                    #{hashtag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-2 px-4">
          {media && media.length > 0 && <MediaGrid media={media} />}
        </CardContent>

        <CardFooter className="flex justify-between py-2 px-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-blue-500 group p-2 h-8 transition-colors"
            onClick={handleReply}
            disabled={yap.isOptimistic}
          >
            <MessageCircle className="w-[18px] h-[18px] mr-2 group-hover:text-blue-500" />
            <span className="text-sm group-hover:text-blue-500">{currentRepliesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-green-500 group p-2 h-8 transition-colors"
            onClick={handleRetweet}
            disabled={yap.isOptimistic}
          >
            <Repeat2 className="w-[18px] h-[18px] mr-2 group-hover:text-green-500" />
            <span className="text-sm group-hover:text-green-500">{currentRetweetsCount}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "group p-2 h-8 transition-colors",
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
            onClick={handleLike}
            disabled={yap.isOptimistic}
          >
            <Heart 
              className={cn(
                "w-[18px] h-[18px] mr-2 transition-all",
                isLiked ? "fill-current text-red-500 scale-110" : "group-hover:text-red-500"
              )} 
            />
            <span className={cn(
              "text-sm transition-colors",
              isLiked ? "text-red-500" : "group-hover:text-red-500"
            )}>
              {currentLikesCount}
            </span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-blue-500 group p-2 h-8 transition-colors"
            onClick={handleShare}
          >
            <Share2 className="w-[18px] h-[18px] mr-2 group-hover:text-blue-500" />
            <span className="text-sm group-hover:text-blue-500">Share</span>
          </Button>
        </CardFooter>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Reply to {display_name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={avatar} alt={display_name} />
                <AvatarFallback>{display_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{display_name}</span> {content.substring(0, 100)}{content.length > 100 && '...'}
              </div>
            </div>
            <Textarea
              placeholder="Yap your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={280}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {replyContent.length}/280
              </span>
              <Button 
                onClick={submitReply}
                disabled={!replyContent.trim() || isSubmittingReply}
                className="bg-[#92736C] hover:bg-[#92736C]/90"
              >
                {isSubmittingReply ? 'Replying...' : 'Reply'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Retweet Dialog */}
      <Dialog open={isRetweetDialogOpen} onOpenChange={setIsRetweetDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Retweet this yap?</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Show original yap */}
            <div className="border rounded-lg p-3 bg-muted/50">
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatar} alt={display_name} />
                  <AvatarFallback>{display_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-sm">{display_name}</span>
                    <span className="text-sm text-muted-foreground">@{username}</span>
                  </div>
                  <p className="text-sm">{content}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="outline"
                onClick={() => submitRetweet(false)}
                disabled={isSubmittingRetweet}
                className="w-full justify-start"
              >
                <Repeat2 className="w-4 h-4 mr-2" />
                {isSubmittingRetweet ? 'Retweeting...' : 'Retweet'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setIsRetweetDialogOpen(false);
                  setIsQuoteRetweetDialogOpen(true);
                }}
                className="w-full justify-start"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Quote Retweet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Quote Retweet Dialog */}
      <Dialog open={isQuoteRetweetDialogOpen} onOpenChange={setIsQuoteRetweetDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Quote Retweet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Add your comment..."
              value={retweetContent}
              onChange={(e) => setRetweetContent(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={280}
              autoFocus
            />
            <div className="border rounded-lg p-3 bg-muted/50">
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatar} alt={display_name} />
                  <AvatarFallback>{display_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-sm">{display_name}</span>
                    <span className="text-sm text-muted-foreground">@{username}</span>
                  </div>
                  <p className="text-sm">{content}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {retweetContent.length}/280
              </span>
              <Button 
                onClick={() => submitRetweet(true)}
                disabled={!retweetContent.trim() || isSubmittingRetweet}
                className="bg-[#92736C] hover:bg-[#92736C]/90"
              >
                {isSubmittingRetweet ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default YapCard