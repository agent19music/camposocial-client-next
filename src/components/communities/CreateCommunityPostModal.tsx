"use client"

import { useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, VideoCamera, X } from "@phosphor-icons/react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import { useAuthContext } from "@/context/authcontext"
import { useCommunity } from "@/context/CommunityContext"
import { extractUrls } from "@/lib/linkify"
import { useLinkPreviews } from "@/hooks/useLinkPreviews"
import { LinkPreviewCard } from "@/components/LinkPreviewCard"
import { MediaUploadPreview, CreateCommunityPostModalProps } from "@/types"

export default function CreateCommunityPostModal({
    isOpen,
    onClose,
    groupSlug,
    onPostCreated
}: CreateCommunityPostModalProps) {
    const { authToken, currentUser } = useAuthContext()
    const { createPostOptimistic } = useCommunity()
    const [content, setContent] = useState("")
    const [mediaItems, setMediaItems] = useState<MediaUploadPreview[]>([])

    const imageInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)

    // Real-time link preview
    const contentUrls = useMemo(() => extractUrls(content, 2), [content])
    const linkPreviews = useLinkPreviews(contentUrls, process.env.NEXT_PUBLIC_API_ENDPOINT)

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const newMedia: MediaUploadPreview[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (mediaItems.length + newMedia.length >= 4) {
                toast.error("Maximum 4 media items allowed")
                break
            }

            newMedia.push({
                id: Math.random().toString(36).substr(2, 9),
                file,
                preview: URL.createObjectURL(file),
                type: "image"
            })
        }

        setMediaItems([...mediaItems, ...newMedia])
    }

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const newMedia: MediaUploadPreview[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (mediaItems.length + newMedia.length >= 4) {
                toast.error("Maximum 4 media items allowed")
                break
            }

            newMedia.push({
                id: Math.random().toString(36).substr(2, 9),
                file,
                preview: URL.createObjectURL(file),
                type: "video"
            })
        }

        setMediaItems([...mediaItems, ...newMedia])
    }

    const removeMedia = (id: string) => {
        setMediaItems(mediaItems.filter(item => item.id !== id))
    }

    const handleSubmit = () => {
        if (!content.trim() && mediaItems.length === 0) {
            toast.error("Please add some content or media")
            return
        }

        // Fire and forget: close modal immediately; optimistic card shows until request completes
        createPostOptimistic(
            groupSlug,
            {
                content,
                media: mediaItems.map(item => item.file),
            },
            currentUser
        ).then((success) => {
            if (success) toast.success("Post created!")
        })

        setContent("")
        setMediaItems([])
        onClose()
        if (onPostCreated) onPostCreated()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Start a Discussion</DialogTitle>
                    <DialogDescription>
                        Share your thoughts with the community
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Content Input */}
                    <Textarea
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={5}
                        className="resize-none"
                    />

                    {/* Media Preview */}
                    {mediaItems.length > 0 && (
                        <div className={`grid gap-2 ${mediaItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            {mediaItems.map((item) => (
                                <div key={item.id} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                    {item.type === "image" ? (
                                        <Image
                                            src={item.preview}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <video
                                            src={item.preview}
                                            className="w-full h-full object-cover"
                                            controls
                                        />
                                    )}
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute top-2 right-2 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                                        onClick={() => removeMedia(item.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Real-time link preview */}
                    {contentUrls.length > 0 && (
                        <div className="space-y-2">
                            {contentUrls.map((url) => (
                                linkPreviews[url] ? (
                                    <LinkPreviewCard
                                        key={url}
                                        preview={linkPreviews[url]!}
                                        className="rounded-xl overflow-hidden"
                                    />
                                ) : (
                                    <div
                                        key={url}
                                        className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl text-sm text-muted-foreground animate-pulse"
                                    >
                                        <div className="w-4 h-4 bg-muted rounded" />
                                        <span className="truncate">{url}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    {/* Media Buttons */}
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={mediaItems.length >= 4}
                            className="text-muted-foreground"
                        >
                            <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" weight="regular" />
                            Image
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={mediaItems.length >= 4}
                            className="text-muted-foreground"
                        >
                            <VideoCamera className="h-4 w-4 mr-2 text-muted-foreground" weight="regular" />
                            Video
                        </Button>
                    </div>

                    {/* Hidden File Inputs */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                    <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        multiple
                        className="hidden"
                        onChange={handleVideoSelect}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!content.trim() && mediaItems.length === 0}
                    >
                        Post
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
