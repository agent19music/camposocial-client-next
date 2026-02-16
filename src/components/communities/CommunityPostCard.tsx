"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Heart, Share2, MoreHorizontal, Trash2, VolumeX, Ban } from "lucide-react"
import { cn } from '@/lib/utils'
import { MediaGrid } from '@/components/yapmediagrid'
import BadgeDisplay from '@/components/badgedisplay'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { formatRelativeTime } from '@/lib/formatRelativeTime'
import { LinkifiedContent } from '@/components/LinkifiedContent'
import { extractUrls } from '@/lib/linkify'
import { useLinkPreviews } from '@/hooks/useLinkPreviews'
import { LinkPreviewCard } from '@/components/LinkPreviewCard'
import type { MediaItem, CommunityPostProps } from '@/types'

export default function CommunityPostCard({
    id,
    yap_id,
    content,
    created_at,
    user,
    media,
    likes_count,
    replies_count,
    isOptimistic,
    optimisticLiked,
    optimisticLikesCount,
    badges,
    onLike,
    onReply,
    onDelete,
    currentUserId
}: CommunityPostProps) {
    const router = useRouter()

    // Local state for UI responsiveness
    const [isLiked, setIsLiked] = useState(optimisticLiked ?? false)
    const [currentLikesCount, setCurrentLikesCount] = useState(optimisticLikesCount ?? likes_count)
    const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [isSubmittingReply, setIsSubmittingReply] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const contentUrls = extractUrls(content, 2)
    const linkPreviews = useLinkPreviews(contentUrls, process.env.NEXT_PUBLIC_API_ENDPOINT)

    // Determine if viewing user owns the post
    const isOwnPost = currentUserId === user.id || currentUserId === String(user.id)

    // Handle interactions
    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isOptimistic || !onLike) return

        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setCurrentLikesCount(prev => newIsLiked ? prev + 1 : prev - 1)

        try {
            await onLike(yap_id)
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked)
            setCurrentLikesCount(prev => newIsLiked ? prev - 1 : prev + 1)
            toast.error("Failed to like post")
        }
    }

    const handleReplyClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsReplyDialogOpen(true)
    }

    const submitReply = async () => {
        if (!replyContent.trim() || isSubmittingReply || !onReply) return

        setIsSubmittingReply(true)
        try {
            await onReply(yap_id, replyContent)
            setIsReplyDialogOpen(false)
            setReplyContent("")
            toast.success("Reply posted!")
        } catch (error) {
            toast.error("Failed to reply")
        } finally {
            setIsSubmittingReply(false)
        }
    }

    const handleDelete = async () => {
        if (!onDelete) return
        setIsDeleting(true)
        try {
            await onDelete(id) // Note: usually we delete the community post ID, but check backend
            toast.success("Post deleted")
            setIsDeleteDialogOpen(false)
        } catch (error) {
            toast.error("Failed to delete post")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/yaps/profile/${user.username}`)
    }

    const handlePostClick = () => {
        // Navigate to detailed view (if implemented) or reuse yap view
        router.push(`/yaps/${yap_id}`)
    }

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = window.location.origin + `/yaps/${yap_id}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Post by ${user.display_name}`,
                    text: content,
                    url: url,
                });
            } catch (error) {
                // User cancelled sharing
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard");
            } catch (error) {
                toast.error("Failed to copy link");
            }
        }
    };

    return (
        <>
            <Card
                className={cn(
                    "border-none shadow-sm bg-card/50 hover:bg-card/80 transition-colors cursor-pointer",
                    isOptimistic && "opacity-70"
                )}
                onClick={handlePostClick}
            >
                <CardHeader className="flex flex-row items-start space-y-0 pb-2 px-4 pt-4">
                    <Avatar
                        className="w-10 h-10 mr-3 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleUserClick}
                    >
                        <AvatarImage src={user.avatar} alt={user.display_name} />
                        <AvatarFallback>{user.display_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1 justify-between">
                            <div className="flex items-center gap-1 min-w-0">
                                <h3
                                    className="font-bold text-[15px] truncate cursor-pointer hover:underline"
                                    onClick={handleUserClick}
                                >
                                    {user.display_name}
                                </h3>
                                {badges && badges.length > 0 && <BadgeDisplay badges={badges} size="sm" />}
                                <span className="text-[15px] text-muted-foreground truncate">
                                    @{user.username}
                                </span>
                                <span className="text-xs text-muted-foreground mx-1">·</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatRelativeTime(created_at)}
                                </span>
                                {isOptimistic && (
                                    <span className="text-xs text-primary ml-1">Posting...</span>
                                )}
                            </div>

                            {/* Options Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="p-1.5 rounded-full hover:bg-muted transition-colors -mr-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    {isOwnPost ? (
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                                            onClick={() => setIsDeleteDialogOpen(true)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onClick={() => toast("Report feature coming soon")}>
                                            <Ban className="w-4 h-4 mr-2" />
                                            Report
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <p className="text-[15px]">
                            <LinkifiedContent content={content} linkClassName="text-primary hover:underline" />
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
                    </div>
                </CardHeader>

                <CardContent className="pt-0 pb-2 px-4 pl-[52px]">
                    {media && media.length > 0 && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <MediaGrid
                                media={media}
                                showInOriginalAspect={media.length === 1}
                                enableFocusView={true}
                            />
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between py-2 px-4 pl-[52px] pr-12">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-blue-500 group p-2 h-8 transition-colors"
                        onClick={handleReplyClick}
                        disabled={isOptimistic}
                    >
                        <MessageCircle className="w-[18px] h-[18px] mr-2 group-hover:text-blue-500" />
                        <span className="text-sm group-hover:text-blue-500">{replies_count}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "group p-2 h-8 transition-colors",
                            isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                        )}
                        onClick={handleLike}
                        disabled={isOptimistic}
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
                <DialogContent className="sm:max-w-[525px]" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle>Reply to {user.display_name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={user.avatar} alt={user.display_name} />
                                <AvatarFallback>{user.display_name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{user.display_name}</span> {content.substring(0, 100)}{content.length > 100 && '...'}
                            </div>
                        </div>
                        <Textarea
                            placeholder="Post your reply..."
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
                            >
                                {isSubmittingReply ? 'Replying...' : 'Reply'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
