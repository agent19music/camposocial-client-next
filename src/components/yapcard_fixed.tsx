"use client"

import React, { useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Repeat2, Heart, Share2 } from "lucide-react"
import { YapContext } from '@/context/yapcontext'
import { cn } from '@/lib/utils'
import { MediaGrid } from './yapmediagrid'
import BadgeDisplay from './badgedisplay'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Image from 'next/image'

interface Yap {
  id: string;
  content: string;
  timestamp: string;
  updated_at?: string;
  location?: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
  original_yap_id?: string;
  original_yap?: Yap; // The original yap data for retweets
  is_retweet?: boolean;
  is_quote?: boolean;
  replies_count: number;
  likes_count: number;
  retweets_count: number;
  bookmarks_count: number;
  media: MediaItem[];
  replies: Reply[];
  hashtags: string[];
  badges?: Array<{id: number, name: string, image_url: string, is_animated: boolean}>;
  isOptimistic?: boolean;
  optimisticLiked?: boolean;
  optimisticLikesCount?: number;
  optimisticRepliesCount?: number;
  optimisticRetweetsCount?: number;
}

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

interface MediaItem {
  id: number;
  url: string;
  type: 'image' | 'video';
}

const YapCard = ({ display_name, username, content, avatar, media, yap, likes_count, replies_count, retweets_count, badges }: { 
  display_name: string, 
  username: string, 
  content: string, 
  avatar: string, 
  media: MediaItem[], 
  yap: Yap, 
  likes_count: number, 
  replies_count: number, 
  retweets_count: number,
  badges?: Array<{id: number, name: string, image_url: string, is_animated: boolean}>
}) => {
  const { navigateToSingleYapView, toggleLike, addReply, retweet } = useContext(YapContext)
  const router = useRouter();
  
  // Determine if this is a retweet or quote tweet
  const isRetweet = yap.is_retweet || yap.original_yap_id;
  const isQuoteTweet = yap.is_quote || (yap.original_yap_id && yap.content.trim());
  const isPureRetweet = isRetweet && !isQuoteTweet;
  
  // For retweets, we need to use the original yap data for interactions
  const targetYap = (isPureRetweet && yap.original_yap) ? yap.original_yap : yap;
  const targetLikesCount = targetYap.likes_count || likes_count;
  const targetRepliesCount = targetYap.replies_count || replies_count;
  const targetRetweetsCount = targetYap.retweets_count || retweets_count;
  
  // Local states for UI interactions
  const [isLiked, setIsLiked] = useState(targetYap.optimisticLiked ?? false);
  const [currentLikesCount, setCurrentLikesCount] = useState(targetYap.optimisticLikesCount ?? targetLikesCount);
  const [currentRepliesCount, setCurrentRepliesCount] = useState(targetYap.optimisticRepliesCount ?? targetRepliesCount);
  const [currentRetweetsCount, setCurrentRetweetsCount] = useState(targetYap.optimisticRetweetsCount ?? targetRetweetsCount);
  
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
    setIsLiked(targetYap.optimisticLiked ?? false);
    setCurrentLikesCount(targetYap.optimisticLikesCount ?? targetLikesCount);
    setCurrentRepliesCount(targetYap.optimisticRepliesCount ?? targetRepliesCount);
    setCurrentRetweetsCount(targetYap.optimisticRetweetsCount ?? targetRetweetsCount);
  }, [targetYap.optimisticLiked, targetYap.optimisticLikesCount, targetYap.optimisticRepliesCount, targetYap.optimisticRetweetsCount, targetLikesCount, targetRepliesCount, targetRetweetsCount]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Immediate UI feedback
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setCurrentLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    
    try {
      // Always use the target yap (original for pure retweets, current for quote tweets)
      await toggleLike(targetYap.id);
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
      // Always reply to the target yap
      await addReply(targetYap.id, replyContent.trim());
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
      // Always retweet the target yap
      await retweet(targetYap.id, isQuote ? retweetContent.trim() : '');
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
          title: `Yap by ${targetYap.display_name}`,
          text: targetYap.content,
          url: window.location.origin + `/yaps/${targetYap.id}`,
        });
      } catch (error) {
        // User cancelled sharing or sharing failed
        console.log('Sharing cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + `/yaps/${targetYap.id}`);
        // You could show a toast here
        console.log('Link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy link');
      }
    }
  };

  const handleUserClick = (e: React.MouseEvent, userToNavigate: string) => {
    e.stopPropagation();
    router.push(`/yaps/profile/${userToNavigate}`);
  };

  const handleYapClick = () => {
    // Navigate to the main yap (not the retweet wrapper)
    navigateToSingleYapView(targetYap, 'spc');
  };

  // Render retweet header if this is a retweet
  const renderRetweetHeader = () => {
    if (!isRetweet) return null;
    
    return (
      <div className="flex items-center gap-2 px-4 pt-3 pb-0 text-sm text-muted-foreground">
        <Repeat2 className="w-4 h-4" />
        <span>
          <span 
            className="font-medium hover:underline cursor-pointer"
            onClick={(e) => handleUserClick(e, yap.username)}
          >
            {yap.display_name}
          </span>
          {isQuoteTweet ? ' quoted' : ' retweeted'}
        </span>
      </div>
    );
  };

  // For pure retweets, use original yap data
  const displayContent = isPureRetweet ? (yap.original_yap?.content || '') : content;
  const displayUsername = isPureRetweet ? (yap.original_yap?.username || '') : username;
  const displayName = isPureRetweet ? (yap.original_yap?.display_name || '') : display_name;
  const displayAvatar = isPureRetweet ? (yap.original_yap?.avatar || '') : avatar;
  const displayMedia = isPureRetweet ? (yap.original_yap?.media || []) : media;
  const displayLocation = isPureRetweet ? (yap.original_yap?.location) : yap.location;
  const displayHashtags = isPureRetweet ? (yap.original_yap?.hashtags || []) : yap.hashtags;
  const displayBadges = isPureRetweet ? (yap.original_yap?.badges || []) : badges;

  return (
    <>
      <Card 
        className={cn(
          "border-b border-x-0 rounded-none first:border-t-0 transition-colors duration-200 hover:cursor-pointer",
          "hover:bg-gray-50 dark:hover:bg-foreground/5",
          yap.isOptimistic && "opacity-70 bg-blue-50 dark:bg-blue-950/20"
        )} 
        onClick={handleYapClick}
      >
        {renderRetweetHeader()}
        
        <CardHeader className="flex flex-row items-start space-y-0 pb-2 px-4 pt-3">
          <Avatar 
            className="w-10 h-10 mr-3 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={(e) => handleUserClick(e, displayUsername)}
          >
            <AvatarImage src={displayAvatar} alt={displayName} />
            <AvatarFallback>{displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <h3 
                className="font-bold text-[15px] truncate cursor-pointer hover:underline flex items-center gap-2"
                onClick={(e) => handleUserClick(e, displayUsername)}
              >
                {displayName}
                {displayBadges && displayBadges.length > 0 && (
                  <BadgeDisplay badges={displayBadges} size="sm" />
                )}
              </h3>
              <p 
                className="text-[15px] text-muted-foreground truncate cursor-pointer hover:underline"
                onClick={(e) => handleUserClick(e, displayUsername)}
              >
                @{displayUsername}
              </p>
              {yap.isOptimistic && (
                <span className="text-xs text-blue-500 ml-2">Posting...</span>
              )}
            </div>
            
            {/* Quote tweet content (if this is a quote tweet) */}
            {isQuoteTweet && yap.content.trim() && (
              <p className="text-[15px] break-words whitespace-pre-wrap mb-3">{yap.content}</p>
            )}
            
            {/* Main content */}
            <p className="text-[15px] break-words whitespace-pre-wrap">{displayContent}</p>
            
            {displayLocation && (
              <p className="text-sm text-muted-foreground mt-1">📍 {displayLocation}</p>
            )}
            {displayHashtags && displayHashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {displayHashtags.map((hashtag, index) => (
                  <span key={index} className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">
                    #{hashtag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-2 px-4">
          {displayMedia && displayMedia.length > 0 && (
            <MediaGrid 
              media={displayMedia} 
              showInOriginalAspect={displayMedia.length === 1} 
              enableFocusView={true}
            />
          )}
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
            <DialogTitle>Reply to {displayName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback>{displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{displayName}</span> {displayContent.substring(0, 100)}{displayContent.length > 100 && '...'}
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
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback>{displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-sm">{displayName}</span>
                    <span className="text-sm text-muted-foreground">@{displayUsername}</span>
                  </div>
                  <p className="text-sm">{displayContent}</p>
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
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback>{displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium text-sm">{displayName}</span>
                      <span className="text-sm text-muted-foreground">
                        @{displayUsername}
                        {displayUsername === "ufwsean" && (
                          <Image
                            src="https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/twitter-verified-badge-gold-seeklogo.png"
                            alt="Verified"
                            className="inline-block ml-1 w-4 h-4 align-text-bottom"
                            width={16}
                            height={16}
                          />
                        )}
                      </span>
                  </div>
                  <p className="text-sm">{displayContent}</p>
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
