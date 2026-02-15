"use client"

import { useState, useEffect, useContext, use, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Users,
    GraduationCap,
    Shield,
    UserMinus,
    Gear,
    ShareNetwork,
    Spinner,
    Camera,
    PencilSimple,
    SpinnerIcon,
    PencilSimpleIcon,
    UsersThreeIcon
} from "@phosphor-icons/react"
import { Card } from "@/components/ui/card"
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
import { Colors } from "@/constants/Colors"
import { toast } from "react-hot-toast"
import { AuthContext } from "@/context/authcontext"
import { useCommunity } from "@/context/CommunityContext"
import CreateCommunityPostModal from "@/components/communities/CreateCommunityPostModal"
import InviteModal from "@/components/communities/InviteModal"
import Header from "@/components/header"

import CommunityCropModal from "@/components/communities/CommunityCropModal"
import CommunityPostCard from "@/components/communities/CommunityPostCard"
import CommunitySettingsModal from "@/components/communities/CommunitySettingsModal"
import { UsersIcon } from "lucide-react"

interface GroupDetails {
    id: string
    slug: string
    name: string
    description: string
    category: string
    privacy_type: string
    cover_image?: string
    icon_image?: string
    member_count: number
    is_verified: boolean
    is_member: boolean
    user_role: string | null
    created_at: string
    creator: any
    recent_members: any[]
    rules?: string
}

export default function GroupDetailsPage(props: { params: Promise<{ slug: string }> }) {
    const params = use(props.params)
    const groupSlug = params.slug
    const router = useRouter()

    const [group, setGroup] = useState<GroupDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("feed")
    const [isPostModalOpen, setIsPostModalOpen] = useState(false)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
    const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
    const [isLeaving, setIsLeaving] = useState(false)

    // Cropping state
    const [cropModal, setCropModal] = useState<{
        isOpen: boolean
        type: 'cover' | 'icon' | null
        imageSrc: string | null
    }>({
        isOpen: false,
        type: null,
        imageSrc: null
    })

    const { currentUser, authToken } = useContext(AuthContext)
    const { fetchCommunityBySlug, joinCommunity, leaveCommunity, fetchPosts, communityPosts, postsLoading, toggleLike, replyToPost, deletePost } = useCommunity()

    const coverInputRef = useRef<HTMLInputElement>(null)
    const iconInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (groupSlug && authToken) {
            loadGroupDetails()
            fetchPosts(groupSlug)
        }
    }, [groupSlug, authToken]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        console.log("[CommunityPage] communityPosts state updated:", communityPosts)
    }, [communityPosts])

    const loadGroupDetails = async () => {
        setIsLoading(true)
        const data = await fetchCommunityBySlug(groupSlug)
        if (data) {
            setGroup(data as any)
        }
        setIsLoading(false)
    }

    const handleJoin = async () => {
        const success = await joinCommunity(groupSlug)
        if (success) loadGroupDetails()
    }

    const handleLeave = async () => {
        setIsLeaving(true)
        const success = await leaveCommunity(groupSlug)
        if (success) {
            loadGroupDetails()
        }
        setIsLeaving(false)
        setIsLeaveDialogOpen(false)
    }

    // Handle cover image selection
    const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const imageSrc = event.target?.result as string
            setCropModal({
                isOpen: true,
                type: 'cover',
                imageSrc
            })
        }
        reader.readAsDataURL(file)
    }

    // Handle icon image selection
    const handleIconImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const imageSrc = event.target?.result as string
            setCropModal({
                isOpen: true,
                type: 'icon',
                imageSrc
            })
        }
        reader.readAsDataURL(file)
    }

    // Handle crop complete
    const handleCropComplete = async (croppedBlob: Blob) => {
        const formData = new FormData()
        formData.append(cropModal.type === 'cover' ? 'cover_image' : 'icon_image', croppedBlob, `${cropModal.type}.jpg`)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${groupSlug}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${authToken}` },
                body: formData
            })

            if (res.ok) {
                toast.success(`${cropModal.type === 'cover' ? 'Cover' : 'Icon'} image updated!`)
                loadGroupDetails()
            } else {
                toast.error(`Failed to update ${cropModal.type} image`)
            }
        } catch (error) {
            toast.error("Something went wrong")
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <SpinnerIcon className="w-8 h-8 animate-spin text-muted-foreground" weight="regular" />
            </div>
        )
    }

    if (!group) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-2xl font-bold">Community not found</h1>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const isAdmin = group.user_role === 'admin'

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0 md:pl-64">
            <Header />
            {/* Cover Image */}
            <div className="relative w-full bg-muted aspect-[3/1] md:aspect-[5/1]">
                {group.cover_image ? (
                    <Image
                        src={group.cover_image}
                        alt="Cover"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-500/20 to-blue-500/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

                {/* Admin: Edit cover button */}
                {isAdmin && (
                    <>
                        <Button
                            size="icon"
                            variant="secondary"
                            className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                            onClick={() => coverInputRef.current?.click()}
                        >
                            <Camera className="h-5 w-5" weight="regular" />
                        </Button>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverImageSelect}
                        />
                    </>
                )}
            </div>

            <div className="px-4 md:px-8 relative -mt-20">
                {/* Header Content */}
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-6">
                    {/* Icon */}
                    <div className="w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl border-4 border-background bg-card shadow-xl overflow-hidden flex-shrink-0 relative z-10">
                        {group.icon_image ? (
                            <Image src={group.icon_image} alt="Icon" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-4xl font-bold">
                                {group.name.charAt(0)}
                            </div>
                        )}

                        {/* Admin: Edit icon button */}
                        {isAdmin && (
                            <>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute bottom-2 right-2 rounded-full h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                                    onClick={() => iconInputRef.current?.click()}
                                >
                                    <PencilSimpleIcon className="h-4 w-4" weight="regular" />
                                </Button>
                                <input
                                    ref={iconInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleIconImageSelect}
                                />
                            </>
                        )}
                    </div>

                    {/* Title & Actions */}
                    <div className="flex-1 w-full md:mb-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-2">
                                    {group.name}
                                    {group.is_verified && <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">✓</Badge>}
                                </h1>
                                <p className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                        <UsersThreeIcon className="w-4 h-4 text-muted-foreground" weight="regular" />
                                        {group.member_count} members
                                    </span>
                                    <span className="flex items-center gap-1 capitalize">
                                        <Shield className="w-4 h-4 text-muted-foreground" weight="regular" />
                                        {group.privacy_type} Group
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {group.is_member ? (
                                    <>
                                        <Button variant="outline" className="rounded-full" onClick={() => setIsInviteModalOpen(true)}>
                                            <ShareNetwork className="w-4 h-4 mr-2 text-muted-foreground" weight="regular" />
                                            Invite
                                        </Button>
                                        {isAdmin && (
                                            <Button variant="secondary" className="rounded-full" onClick={() => setIsSettingsModalOpen(true)}>
                                                <Gear className="w-4 h-4 mr-2 text-muted-foreground" weight="regular" />
                                                Settings
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            className="rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600"
                                            onClick={() => setIsLeaveDialogOpen(true)}
                                        >
                                            Leave
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        className="rounded-full px-8 shadow-lg"
                                        style={{ backgroundColor: Colors.primary }}
                                        onClick={handleJoin}
                                    >
                                        Join Community
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-muted/50 backdrop-blur-sm border p-1 rounded-full">
                        <TabsTrigger value="feed" className="rounded-full px-6">Feed</TabsTrigger>
                        <TabsTrigger value="about" className="rounded-full px-6">About</TabsTrigger>
                        <TabsTrigger value="members" className="rounded-full px-6">Members</TabsTrigger>
                    </TabsList>

                    <TabsContent value="feed">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-4">
                                {/* Post Composer */}
                                {group.is_member && (
                                    <Card className="p-4 border-none shadow-sm bg-card/50">
                                        <div className="flex gap-4 items-center">
                                            <Avatar>
                                                <AvatarImage src={currentUser?.avatar} />
                                                <AvatarFallback>You</AvatarFallback>
                                            </Avatar>
                                            <Button
                                                variant="outline"
                                                className="flex-1 rounded-full justify-start text-muted-foreground h-12"
                                                onClick={() => setIsPostModalOpen(true)}
                                            >
                                                Start a discussion in {group.name}...
                                            </Button>
                                        </div>
                                    </Card>
                                )}

                                {/* Posts List */}
                                {postsLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Spinner className="w-6 h-6 animate-spin text-muted-foreground" weight="regular" />
                                    </div>
                                ) : communityPosts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 bg-card/30 rounded-2xl border border-dashed">
                                        <p className="text-muted-foreground">No posts yet. Be the first to say hello!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {communityPosts.map((post) => (
                                            <CommunityPostCard
                                                key={post.id}
                                                id={post.id}
                                                yap_id={post.yap_id}
                                                content={post.content}
                                                created_at={post.created_at}
                                                user={{
                                                    id: String(post.user.id),
                                                    username: post.user.username,
                                                    display_name: post.user.display_name,
                                                    avatar: post.user.avatar
                                                }}
                                                media={post.media?.map(m => ({
                                                    id: m.id,
                                                    url: m.media_url,
                                                    type: m.media_type
                                                })) || []}
                                                likes_count={post.likes_count}
                                                replies_count={post.replies_count}
                                                isOptimistic={post.id.startsWith('temp-')}
                                                optimisticLiked={post.liked_by_user}
                                                currentUserId={currentUser?.id}
                                                onLike={toggleLike}
                                                onReply={replyToPost}
                                                onDelete={deletePost}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Sidebar: About */}
                                <Card className="p-4 border-none bg-card/50">
                                    <h3 className="font-semibold mb-2">About</h3>
                                    <p className="text-sm text-muted-foreground">{group.description}</p>
                                </Card>

                                {/* Sidebar: Admins */}
                                <Card className="p-4 border-none bg-card/50">
                                    <h3 className="font-semibold mb-4">Admins & Moderators</h3>
                                    <div className="space-y-3">
                                        {group.creator && (
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={group.creator.avatar} />
                                                    <AvatarFallback>{group.creator.display_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{group.creator.display_name}</p>
                                                    <Badge variant="outline" className="text-[10px] h-4">Creator</Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="about">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-4">Community Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-muted-foreground mb-1">Description</h3>
                                    <p>{group.description}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-muted-foreground mb-1">Category</h3>
                                        <p className="capitalize">{group.category}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-muted-foreground mb-1">Privacy</h3>
                                        <p className="capitalize">{group.privacy_type}</p>
                                    </div>
                                </div>
                                {group.rules && (
                                    <div>
                                        <h3 className="font-medium text-muted-foreground mb-1">Community Rules</h3>
                                        <p className="text-sm">{group.rules}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="members">
                        <Card className="p-6">
                            <h2 className="text-xl font-bold mb-6">Members ({group.member_count})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.recent_members?.map((member: any) => (
                                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>{member.display_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.display_name}</p>
                                                <p className="text-xs text-muted-foreground">@{member.username}</p>
                                            </div>
                                        </div>
                                        {isAdmin && member.id !== currentUser?.id && (
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                                                <UserMinus className="w-4 h-4" weight="regular" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create Post Modal */}
            <CreateCommunityPostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                groupSlug={groupSlug}
                onPostCreated={() => {
                    // Optimistic updates already handled the post addition
                    setIsPostModalOpen(false)
                }}
            />

            {/* Image Crop Modal */}
            {cropModal.isOpen && cropModal.imageSrc && (
                <CommunityCropModal
                    isOpen={cropModal.isOpen}
                    onClose={() => setCropModal({ isOpen: false, type: null, imageSrc: null })}
                    imageSrc={cropModal.imageSrc}
                    onCropComplete={handleCropComplete}
                    aspectRatio={cropModal.type === 'cover' ? 3 / 1 : 1}
                    title={cropModal.type === 'cover' ? 'Crop Cover Image' : 'Crop Icon Image'}
                />
            )}
            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                communitySlug={groupSlug}
            />

            {/* Settings Modal */}
            <CommunitySettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                community={group}
            />

            {/* Leave Community Confirmation Dialog */}
            <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leave this community?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to leave {group.name}? You can always rejoin later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeave}
                            disabled={isLeaving}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isLeaving ? 'Leaving...' : 'Leave'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
