"use client"

import React, { useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Repeat2, Heart, Share2, MoreHorizontal, Trash2, VolumeX, Ban, Users } from "lucide-react"
import { YapContext } from '@/context/yapcontext'
import { AuthContext } from '@/context/authcontext'
import { cn } from '@/lib/utils'
import { MediaGrid } from './yapmediagrid'
import BadgeDisplay from './badgedisplay'
import PollCard from './polls/PollCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import Image from 'next/image'
import { formatRelativeTime } from '@/lib/formatRelativeTime'
import { LinkifiedContent } from '@/components/LinkifiedContent'
import { extractUrls } from '@/lib/linkify'
import { useLinkPreviews } from '@/hooks/useLinkPreviews'
import { LinkPreviewCard } from '@/components/LinkPreviewCard'
import type { Yap, Reply, MediaItem, YapCommunity } from '@/types'

const YapCard = ({ display_name, username, content, avatar, media, yap, likes_count, replies_count, retweets_count, badges, community }: {
  display_name: string,
  username: string,
  content: string,
  avatar: string,
  media: MediaItem[],
  yap: Yap,
  likes_count: number | undefined,
  replies_count: number | undefined,
  community?: YapCommunity | null,
  retweets_count: number | undefined,
  badges?: Array<{ id: number, name: string, image_url: string, is_animated: boolean }>
}) => {
  const { navigateToSingleYapView, toggleLike, addReply, retweet, quoteRetweet, deleteYap, muteUser, blockUser } = useContext(YapContext)
  const { currentUser } = useContext(AuthContext)
  const router = useRouter();

  // Determine if this is a retweet or quote tweet
  const isRetweet = yap.is_retweet || yap.original_yap_id;
  const isQuoteTweet = yap.is_quote || (yap.original_yap_id && yap.content.trim());
  const isPureRetweet = isRetweet && !isQuoteTweet;

  // Check if the current user owns this yap
  const isOwnYap = currentUser?.id === yap.user_id || currentUser?.id === String(yap.user_id);

  // For retweets, we need to use the original yap data for interactions
  const targetYap = (isPureRetweet && yap.original_yap) ? yap.original_yap : yap;

  // Prioritize weighted counts, fallback to raw counts
  const targetLikesCount = targetYap.weighted_likes_count ?? targetYap.likes_count ?? likes_count ?? 0;
  const targetRepliesCount = targetYap.weighted_replies_count ?? targetYap.replies_count ?? replies_count ?? 0;
  const targetRetweetsCount = targetYap.weighted_retweets_count ?? targetYap.retweets_count ?? retweets_count ?? 0;

  // Local states for UI interactions
  const [isLiked, setIsLiked] = useState(targetYap.optimisticLiked ?? false);
  const [currentLikesCount, setCurrentLikesCount] = useState(targetYap.optimisticWeightedLikesCount ?? targetLikesCount);
  const [currentRepliesCount, setCurrentRepliesCount] = useState(targetYap.optimisticRepliesCount ?? targetRepliesCount);
  const [currentRetweetsCount, setCurrentRetweetsCount] = useState(targetYap.optimisticRetweetsCount ?? targetRetweetsCount);

  // Dialog states
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isRetweetDialogOpen, setIsRetweetDialogOpen] = useState(false);
  const [isQuoteRetweetDialogOpen, setIsQuoteRetweetDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMuting, setIsMuting] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
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

    setIsSubmittingRetweet(true);

    try {
      if (isQuote) {
        // For quote retweet, we need content
        if (!retweetContent.trim()) return;
        await quoteRetweet(targetYap.id, retweetContent.trim());
      } else {
        // For pure retweet, no content needed
        await retweet(targetYap.id);
      }

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
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + `/yaps/${targetYap.id}`);
        // You could show a toast here
      } catch (error) {
        console.error('Failed to copy link');
      }
    }
  };

  // Handle delete yap
  const handleDeleteYap = async () => {
    if (!deleteYap) return;

    setIsDeleting(true);
    try {
      await deleteYap(yap.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete yap:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle mute user
  const handleMuteUser = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!muteUser) return;

    setIsMuting(true);
    try {
      await muteUser(yap.username);
    } catch (error) {
      console.error('Failed to mute user:', error);
    } finally {
      setIsMuting(false);
    }
  };

  // Handle block user
  const handleBlockUser = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!blockUser) return;

    setIsBlocking(true);
    try {
      await blockUser(yap.username);
    } catch (error) {
      console.error('Failed to block user:', error);
    } finally {
      setIsBlocking(false);
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

  const renderCommunityHeader = () => {
    if (!targetYap.community) return null;

    return (
      <div className="flex items-center gap-2 px-4 pt-3 pb-0 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>
          in{' '}
          <span
            className="font-medium hover:underline cursor-pointer text-primary"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/yaps/communities/${targetYap.community?.slug}`);
            }}
          >
            {targetYap.community.name}
          </span>
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

  const contentUrls = extractUrls(displayContent, 2);
  const linkPreviews = useLinkPreviews(contentUrls, process.env.NEXT_PUBLIC_API_ENDPOINT);

  return (
    <>
      <Card
        className={cn(
          "border-0 shadow-none rounded-none transition-colors duration-200 hover:cursor-pointer",
          "hover:bg-gray-50 dark:hover:bg-foreground/5",
          yap.isOptimistic && "opacity-70 bg-blue-50 dark:bg-blue-950/20"
        )}
        onClick={handleYapClick}
      >
        {renderRetweetHeader()}
        {renderCommunityHeader()}

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
                className="text-[15px] text-muted-foreground truncate cursor-pointer hover:underline flex items-center gap-1 flex-wrap"
                onClick={(e) => handleUserClick(e, displayUsername)}
              >
                <span>@{displayUsername}</span>
                <span className="text-muted-foreground/70">·</span>
                <span className="text-muted-foreground/80">{formatRelativeTime(targetYap.timestamp)}</span>
                {displayUsername === "ufwsean" && (
                  <Image
                    src="https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/twitter-verified-badge-gold-seeklogo.png"
                    alt="Verified"
                    className="inline-block ml-1 w-4 h-4 align-text-bottom"
                    width={16}
                    height={16}
                  />
                )}
              </p>
              {yap.isOptimistic && (
                <span className="text-xs text-blue-500 ml-2">Posting...</span>
              )}

              {/* Three-dot menu for yap options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-auto p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-foreground/10 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  {isOwnYap ? (
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={handleMuteUser}
                        disabled={isMuting}
                      >
                        <VolumeX className="w-4 h-4 mr-2" />
                        {isMuting ? 'Muting...' : `Mute @${displayUsername}`}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                        onClick={handleBlockUser}
                        disabled={isBlocking}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        {isBlocking ? 'Blocking...' : `Block @${displayUsername}`}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Quote tweet content (if this is a quote tweet) */}
            {isQuoteTweet && yap.content.trim() && (
              <p className="text-[15px] mb-3">
                <LinkifiedContent content={yap.content} linkClassName="text-primary hover:underline" />
              </p>
            )}

            {/* Main content */}
            {isQuoteTweet ? (
              /* For quote tweets, show the original yap content */
              yap.original_yap && (
                <div
                  className={cn(
                    "mt-2 rounded-lg border border-gray-200 dark:border-foreground/10 bg-gray-50 dark:bg-foreground/5 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-foreground/10 cursor-pointer",
                    "flex flex-row gap-3 p-3"
                  )}
                  onClick={e => {
                    e.stopPropagation();
                    if (yap.original_yap?.id) {
                      router.push(`/yaps/${yap.original_yap.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="View original yap"
                >
                  <Avatar
                    className="w-8 h-8 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={e => {
                      e.stopPropagation();
                      if (yap.original_yap?.username) {
                        router.push(`/profile/${yap.original_yap.username}`);
                      }
                    }}
                  >
                    <AvatarImage src={yap.original_yap?.avatar} alt={yap.original_yap?.display_name} />
                    <AvatarFallback>
                      {yap.original_yap?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className="font-bold text-[15px] truncate cursor-pointer hover:underline"
                        onClick={e => {
                          e.stopPropagation();
                          if (yap.original_yap?.username) {
                            router.push(`/yaps/profile/${yap.original_yap.username}`);
                          }
                        }}
                      >
                        {yap.original_yap?.display_name}
                      </span>
                      <span className="text-[15px] text-muted-foreground truncate ml-1">
                        @{yap.original_yap?.username}
                        {yap.original_yap?.username === "ufwsean" && (
                          <Image
                            src="https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/twitter-verified-badge-gold-seeklogo.png"
                            alt="Verified"
                            className="inline-block ml-1 w-4 h-4 align-text-bottom"
                            width={16}
                            height={16}
                          />
                        )}
                      </span>
                      {yap.original_yap?.badges && yap.original_yap.badges.length > 0 && (
                        <BadgeDisplay badges={yap.original_yap.badges} size="sm" />
                      )}
                    </div>
                    <p className="text-[15px]">
                      <LinkifiedContent content={yap.original_yap?.content || ''} linkClassName="text-primary hover:underline" />
                    </p>
                    {yap.original_yap.media && yap.original_yap.media.length > 0 && (
                      <div className="mt-2">
                        <MediaGrid
                          media={yap.original_yap?.media}
                          showInOriginalAspect={yap.original_yap.media.length === 1}
                          enableFocusView={false}
                        />
                      </div>
                    )}
                    {yap.original_yap.location && (
                      <p className="text-sm text-muted-foreground mt-1">📍 {yap.original_yap.location}</p>
                    )}
                    {yap.original_yap.hashtags && yap.original_yap.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {yap.original_yap.hashtags.map((hashtag: string, idx: number) => (
                          <span key={idx} className="text-sm text-blue-500 hover:text-blue-600 cursor-pointer">
                            #{hashtag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              /* For regular yaps and pure retweets, show displayContent */
              <>
                <p className="text-[15px]">
                  <LinkifiedContent content={displayContent} linkClassName="text-primary hover:underline" />
                </p>
                {contentUrls.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {contentUrls.map(
                      (url) =>
                        linkPreviews[url] && (
                          <LinkPreviewCard
                            key={url}
                            preview={linkPreviews[url]!}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )
                    )}
                  </div>
                )}
              </>
            )}

            {/* Poll display */}
            {targetYap.poll_id && (
              <PollCard pollId={targetYap.poll_id} compact />
            )}

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
                    {displayUsername === "ufwsean" && (
                      <Image
                        src="https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/twitter-verified-badge-gold-seeklogo.png"
                        alt="Verified"
                        className="inline-block ml-1 w-4 h-4 align-text-bottom"
                        width={16}
                        height={16}
                      />
                    )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this yap?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This yap will be permanently deleted after 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteYap}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default YapCard
