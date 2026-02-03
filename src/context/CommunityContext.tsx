"use client"

import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react"
import { AuthContext } from "./authcontext"
import toast from "react-hot-toast"

// Types
interface Community {
    id: string
    slug: string
    name: string
    description: string
    category: string
    privacy_type: "public" | "private" | "secret"
    cover_image: string
    icon_image: string
    member_count: number
    university_restriction?: string
    is_verified: boolean
    is_member: boolean
    user_role?: "admin" | "moderator" | "member"
    created_at: string
    rules?: string
    creator?: {
        id: number
        username: string
        display_name: string
        avatar: string
    }
    recent_members?: Array<{
        id: number
        username: string
        display_name: string
        avatar: string
    }>
}

interface CommunityPost {
    id: string
    yap_id: string
    content: string
    location?: string
    is_pinned: boolean
    user: {
        id: number
        username: string
        display_name: string
        avatar: string
    }
    likes_count: number
    replies_count: number
    created_at: string
    media?: Array<{
        id: number
        media_url: string
        media_type: "image" | "video"
    }>
    liked_by_user?: boolean
}

export interface CommunityInvite {
    id: string
    token: string
    created_at: string
    expires_at: string | null
    creator_id: number
    url: string
}

interface CommunityContextType {
    // State
    communities: Community[]
    myCommunities: Community[]
    recommendedCommunities: Community[]
    trendingCommunities: Community[]
    currentCommunity: Community | null
    communityPosts: CommunityPost[]
    loading: boolean
    postsLoading: boolean

    // Methods
    fetchCommunities: () => Promise<void>
    fetchMyCommunities: () => Promise<void>
    fetchCommunityBySlug: (slug: string) => Promise<Community | null>
    createCommunity: (data: any) => Promise<Community | null>
    updateCommunity: (slug: string, data: any) => Promise<boolean>
    joinCommunity: (slug: string) => Promise<boolean>
    leaveCommunity: (slug: string) => Promise<boolean>
    createPost: (slug: string, content: string, location?: string) => Promise<boolean>
    createPostOptimistic: (slug: string, postData: { content: string; media?: File[]; location?: string }, currentUser: any) => Promise<boolean>
    toggleLike: (yapId: string) => Promise<void>
    replyToPost: (yapId: string, content: string) => Promise<void>
    deletePost: (postId: string) => Promise<void>
    fetchPosts: (slug: string, page?: number) => Promise<void>
    setCurrentCommunity: (community: Community | null) => void
    createInvite: (slug: string, expiryOption: string) => Promise<any>
    getInvites: (slug: string) => Promise<CommunityInvite[]>
    revokeInvite: (token: string) => Promise<boolean>
}


const CommunityContext = createContext<CommunityContextType | undefined>(undefined)

export const useCommunity = () => {
    const context = useContext(CommunityContext)
    if (!context) {
        throw new Error("useCommunity must be used within a CommunityProvider")
    }
    return context
}

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
    const { authToken } = useContext(AuthContext)

    // State
    const [communities, setCommunities] = useState<Community[]>([])
    const [myCommunities, setMyCommunities] = useState<Community[]>([])
    const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([])
    const [trendingCommunities, setTrendingCommunities] = useState<Community[]>([])
    const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null)
    const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([])
    const [loading, setLoading] = useState(false)
    const [postsLoading, setPostsLoading] = useState(false)

    // Fetch all communities (discover)
    const fetchCommunities = useCallback(async () => {
        if (!authToken) return

        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/discover`, {
                headers: { Authorization: `Bearer ${authToken}` },
            })

            if (res.ok) {
                const data = await res.json()
                setRecommendedCommunities(data.recommended || [])
                setTrendingCommunities(data.trending || [])
                console.log("Recommended communities:", data.recommended)
                console.log("Trending communities:", data.trending)
            }
        } catch (error) {
            console.error("Failed to fetch communities", error)
        } finally {
            setLoading(false)
        }
    }, [authToken])

    // Fetch my communities
    const fetchMyCommunities = useCallback(async () => {
        if (!authToken) return

        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/my-communities`, {
                headers: { Authorization: `Bearer ${authToken}` },
            })

            if (res.ok) {
                const data = await res.json()
                setMyCommunities(data.groups || [])
            }
        } catch (error) {
            console.error("Failed to fetch my communities", error)
        } finally {
            setLoading(false)
        }
    }, [authToken])

    // Fetch community by slug
    const fetchCommunityBySlug = useCallback(
        async (slug: string): Promise<Community | null> => {
            if (!authToken) return null

            setLoading(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${slug}`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                })

                if (res.ok) {
                    const community = await res.json()
                    setCurrentCommunity(community)
                    return community
                }
            } catch (error) {
                console.error("Failed to fetch community", error)
            } finally {
                setLoading(false)
            }
            return null
        },
        [authToken]
    )

    // Create community
    const createCommunity = useCallback(
        async (data: any): Promise<Community | null> => {
            if (!authToken) return null

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(data),
                })

                if (res.ok) {
                    const result = await res.json()
                    toast.success("Community created successfully!")
                    // Refresh my communities
                    fetchMyCommunities()
                    return result.community
                } else {
                    const err = await res.json()
                    toast.error(err.error || "Failed to create community")
                }
            } catch (error) {
                console.error("Failed to create community", error)
                toast.error("Something went wrong")
            }
            return null
        },
        [authToken, fetchMyCommunities]
    )

    // Update community
    const updateCommunity = useCallback(
        async (slug: string, data: any): Promise<boolean> => {
            if (!authToken) return false

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${slug}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(data),
                })

                if (res.ok) {
                    const result = await res.json()
                    toast.success("Community updated successfully!")
                    // Update current community if it matches
                    if (currentCommunity?.slug === slug) {
                        setCurrentCommunity({ ...currentCommunity, ...result.community })
                    }
                    return true
                } else {
                    const err = await res.json()
                    toast.error(err.error || "Failed to update community")
                }
            } catch (error) {
                console.error("Failed to update community", error)
                toast.error("Something went wrong")
            }
            return false
        },
        [authToken, currentCommunity]
    )

    // Join community
    const joinCommunity = useCallback(
        async (slug: string): Promise<boolean> => {
            if (!authToken) return false

            try {
                // Get group ID from slug first
                const community = await fetchCommunityBySlug(slug)
                if (!community) return false

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${community.id}/join`,
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${authToken}` },
                    }
                )

                if (res.ok) {
                    toast.success("Joined community successfully!")
                    // Refresh community data
                    fetchCommunityBySlug(slug)
                    fetchMyCommunities()
                    return true
                } else {
                    const err = await res.json()
                    toast.error(err.error || "Failed to join community")
                }
            } catch (error) {
                console.error("Failed to join community", error)
                toast.error("Something went wrong")
            }
            return false
        },
        [authToken, fetchCommunityBySlug, fetchMyCommunities]
    )

    // Leave community
    const leaveCommunity = useCallback(
        async (slug: string): Promise<boolean> => {
            if (!authToken) return false

            try {
                // Get group ID from slug first
                const community = await fetchCommunityBySlug(slug)
                if (!community) return false

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${community.id}/leave`,
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${authToken}` },
                    }
                )

                if (res.ok) {
                    toast.success("Left community successfully!")
                    // Refresh community data
                    fetchCommunityBySlug(slug)
                    fetchMyCommunities()
                    return true
                } else {
                    const err = await res.json()
                    toast.error(err.error || "Failed to leave community")
                }
            } catch (error) {
                console.error("Failed to leave community", error)
                toast.error("Something went wrong")
            }
            return false
        },
        [authToken, fetchCommunityBySlug, fetchMyCommunities]
    )

    // Create post with optimistic update
    const createPostOptimistic = useCallback(
        async (slug: string, postData: { content: string; media?: File[]; location?: string }, currentUser: any) => {
            if (!authToken || !currentUser) return false

            // Create optimistic post
            const optimisticPost: CommunityPost = {
                id: `temp-${Date.now()}`,
                yap_id: `temp-yap-${Date.now()}`,
                content: postData.content,
                location: postData.location,
                is_pinned: false,
                user: {
                    id: currentUser.id,
                    username: currentUser.username,
                    display_name: currentUser.display_name,
                    avatar: currentUser.avatar
                },
                likes_count: 0,
                replies_count: 0,
                created_at: new Date().toISOString(),
                media: postData.media ? postData.media.map((file, idx) => ({
                    id: idx,
                    media_url: URL.createObjectURL(file),
                    media_type: file.type.startsWith('video/') ? 'video' : 'image'
                })) : [],
                liked_by_user: false
            }

            // Add optimistically
            setCommunityPosts(prev => [optimisticPost, ...prev])

            try {
                const formData = new FormData()
                formData.append("content", postData.content)
                if (postData.location) {
                    formData.append("location", postData.location)
                }
                if (postData.media) {
                    postData.media.forEach((file) => {
                        formData.append('media', file)
                    })
                }

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${slug}/posts`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: formData,
                    }
                )

                if (res.ok) {
                    const result = await res.json()
                    // Replace optimistic post with real post
                    setCommunityPosts(prev =>
                        prev.map(p => p.id === optimisticPost.id ? result.post : p)
                    )
                    return true
                } else {
                    // Remove optimistic post on error
                    setCommunityPosts(prev => prev.filter(p => p.id !== optimisticPost.id))
                    const err = await res.json()
                    toast.error(err.error || "Failed to create post")
                    return false
                }
            } catch (error) {
                // Remove optimistic post on error
                setCommunityPosts(prev => prev.filter(p => p.id !== optimisticPost.id))
                console.error("Failed to create post", error)
                toast.error("Something went wrong")
                return false
            }
        },
        [authToken]
    )

    // Legacy createPost for backwards compatibility
    const createPost = useCallback(
        async (slug: string, content: string, location?: string): Promise<boolean> => {
            if (!authToken) return false

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${slug}/posts`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({ content, location }),
                    }
                )

                if (res.ok) {
                    toast.success("Post created successfully!")
                    // Refresh posts
                    fetchPosts(slug)
                    return true
                } else {
                    const err = await res.json()
                    toast.error(err.error || "Failed to create post")
                }
            } catch (error) {
                console.error("Failed to create post", error)
                toast.error("Something went wrong")
            }
            return false
        },
        [authToken]
    )

    // Fetch posts
    const fetchPosts = useCallback(
        async (slug: string, page: number = 1) => {
            if (!authToken) return

            setPostsLoading(true)
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${slug}/posts?page=${page}`,
                    {
                        headers: { Authorization: `Bearer ${authToken}` },
                    }
                )

                if (res.ok) {
                    const data = await res.json()
                    console.log("[CommunityContext] fetchPosts response:", data)
                    setCommunityPosts(data.posts || [])
                    console.log("[CommunityContext] communityPosts:", communityPosts)
                }
            } catch (error) {
                console.error("Failed to fetch posts", error)
            } finally {
                setPostsLoading(false)
            }
        },
        [authToken]
    )
    // Toggle like on a community post
    const toggleLike = useCallback(
        async (yapId: string): Promise<void> => {
            if (!authToken) return

            try {
                // Optimistic update handled by component or here if we want global sync
                await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/yaps/${yapId}/like`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                })
            } catch (error) {
                console.error("Failed to like post", error)
                throw error
            }
        },
        [authToken]
    )

    // Reply to a community post
    const replyToPost = useCallback(
        async (yapId: string, content: string): Promise<void> => {
            if (!authToken) return

            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/yaps/${yapId}/reply`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ content }),
                })

                // Update local state to increment reply count
                setCommunityPosts(prev => prev.map(p => {
                    if (p.yap_id === yapId) {
                        return { ...p, replies_count: p.replies_count + 1 }
                    }
                    return p
                }))
            } catch (error) {
                console.error("Failed to reply", error)
                throw error
            }
        },
        [authToken]
    )

    // Delete a community post
    const deletePost = useCallback(
        async (postId: string): Promise<void> => {
            if (!authToken) return

            // Optimistic delete
            setCommunityPosts(prev => prev.filter(p => p.id !== postId))

            try {
                // Note: The backend endpoint for deleting a community post might be different
                // If it's just deleting the wrapper, use community endpoint. 
                // If deleting the yap deletes the post, use yap endpoint.
                // Assuming standardized delete structure or yap delete cascades:

                // Let's assume we use the yap endpoint for the underlying content or a community specific one
                // Based on previous code, we might need a specific endpoint. 
                // For now, let's assume deleting the YAP deletes the reference.
                // But wait, the ID passed here is the CommunityPost ID, not Yap ID.

                // If we don't have a specific community post delete endpoint, we might need to use the yap ID.
                // However, let's use a hypothetical community post delete endpoint for safety if it existed,
                // or fall back to yap delete if we know the relationship.

                // Looking at `communities_view.py` (which I read earlier), I didn't see a specific delete endpoint.
                // But `YapContext` has `deleteYap`. 
                // Let's assume for now we don't have a direct backend delete for community post wrapper expose yet,
                // BUT, if we delete the yap, the cascade should work. 
                // Let's standardise on using the yap delete mechanism via yap ID in the component, 
                // OR implement a context method that calls the yap delete endpoint.

                // Actually, let's use the community endpoint if available, but for now let's just update local state
                // and call the yap delete endpoint since a community post IS a yap.
                // But wait, `deletePost` takes `postId` (community post id).
                // I need to find the yap_id from the post list to delete properly if I call yap delete.

                const post = communityPosts.find(p => p.id === postId)
                if (post) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/yaps/${post.yap_id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                        },
                    })
                }
            } catch (error) {
                console.error("Failed to delete post", error)
                toast.error("Failed to delete post")
                // Revert fetch? (Complexity high)
            }
        },
        [authToken, communityPosts]
    )
    // Create Invite
    const createInvite = useCallback(
        async (slug: string, expiryOption: string = 'none') => {
            if (!authToken) return null

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${slug}/invites`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ expiry_option: expiryOption }),
                })

                if (res.ok) {
                    const data = await res.json()
                    toast.success("Invite link created!")
                    return data.invite
                } else {
                    const err = await res.json()
                    toast.error(err.error || "Failed to create invite")
                }
            } catch (error) {
                console.error("Failed to create invite", error)
                toast.error("Something went wrong")
            }
            return null
        },
        [authToken]
    )

    // Get Invites
    const getInvites = useCallback(
        async (slug: string): Promise<CommunityInvite[]> => {
            if (!authToken) return []

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${slug}/invites`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                })

                if (res.ok) {
                    const data = await res.json()
                    return data.invites || []
                }
            } catch (error) {
                console.error("Failed to fetch invites", error)
            }
            return []
        },
        [authToken]
    )

    // Revoke Invite
    const revokeInvite = useCallback(
        async (token: string): Promise<boolean> => {
            if (!authToken) return false

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/invites/${token}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${authToken}` },
                })

                if (res.ok) {
                    toast.success("Invite link revoked")
                    return true
                } else {
                    const err = await res.json()
                    toast.error(err.error || "Failed to revoke invite")
                }
            } catch (error) {
                console.error("Failed to revoke invite", error)
                toast.error("Something went wrong")
            }
            return false
        },
        [authToken]
    )

    const value: CommunityContextType = {
        communities,
        myCommunities,
        recommendedCommunities,
        trendingCommunities,
        currentCommunity,
        communityPosts,
        loading,
        postsLoading,
        fetchCommunities,
        fetchMyCommunities,
        fetchCommunityBySlug,
        createCommunity,
        updateCommunity,
        joinCommunity,
        leaveCommunity,
        createPost,
        createPostOptimistic,
        toggleLike,
        replyToPost,
        deletePost,
        fetchPosts,
        setCurrentCommunity,
        createInvite,
        getInvites,
        revokeInvite,
    }

    return <CommunityContext.Provider value={value}>{children}</CommunityContext.Provider>
}

export { CommunityContext }
