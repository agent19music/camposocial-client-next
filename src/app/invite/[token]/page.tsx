"use client"

import { useEffect, useState, useContext, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/context/authcontext"
import { CommunityContext } from "@/context/CommunityContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Users, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { Colors } from "@/constants/Colors"
import toast from "react-hot-toast"
import Image from "next/image"

export default function InvitePage(props: { params: Promise<{ token: string }> }) {
    const params = use(props.params)
    const token = params.token
    const router = useRouter()
    const { currentUser, authToken } = useContext(AuthContext)
    const { myCommunities } = useContext(CommunityContext)!

    const [isLoading, setIsLoading] = useState(true)
    const [isJoining, setIsJoining] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [inviteData, setInviteData] = useState<{
        valid: boolean
        community?: any
        inviter?: any
    } | null>(null)

    const validateInvite = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/invites/${token}`)
            const data = await res.json()

            if (res.ok) {
                setInviteData(data)
            } else {
                setError(data.error || "Invalid invite link")
            }
        } catch (err) {
            setError("Failed to load invite")
        } finally {
            setIsLoading(false)
        }
    }, [token])

    useEffect(() => {
        if (token) {
            validateInvite()
        }
    }, [token, validateInvite])

    const handleAccept = async () => {
        if (!currentUser) {
            // Redirect to login with return url
            // encodeURIComponent to allow clean redirect back
            window.location.href = `/?returnUrl=/invite/${token}`
            return
        }

        setIsJoining(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/invites/${token}/accept`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            })

            const data = await res.json()

            if (res.ok) {
                toast.success("Successfully joined!")
                router.push(`/yaps/communities/${data.community_slug}`)
            } else {
                if (res.status === 403 && data.error === 'ineligible') {
                    setError(data.message)
                } else {
                    toast.error(data.error || "Failed to join")
                    setError(data.error || "Failed to join")
                }
            }
        } catch (err) {
            toast.error("Something went wrong")
        } finally {
            setIsJoining(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold">Unable to Join</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <Button onClick={() => router.push('/yaps/communities')} variant="outline">
                        Browse Communities
                    </Button>
                </Card>
            </div>
        )
    }

    if (!inviteData?.community) return null

    const { community, inviter } = inviteData
    const isAlreadyMember = myCommunities.some(c => c.id === community.id)

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
            <Card className="max-w-md w-full overflow-hidden border-none shadow-xl">
                {/* Cover Image */}
                <div className="relative h-32 bg-muted">
                    {community.cover_image && (
                        <Image
                            src={community.cover_image}
                            alt="Cover"
                            fill
                            className="object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>

                <div className="px-6 pb-6 -mt-12 relative">
                    <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-2xl border-4 border-background bg-card shadow-lg flex items-center justify-center overflow-hidden">
                            {community.icon_image ? (
                                <Image src={community.icon_image} alt="Icon" width={96} height={96} className="object-cover h-full w-full" />
                            ) : (
                                <span className="text-3xl font-bold text-primary">{community.name[0]}</span>
                            )}
                        </div>
                    </div>

                    <div className="text-center space-y-2 mb-6">
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-2xl font-bold">{community.name}</h1>
                            {community.privacy_type === 'secret' && <Shield className="w-4 h-4 text-muted-foreground" />}
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {community.description}
                        </p>

                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {community.member_count} members
                            </span>
                            {community.university_restriction && (
                                <span className="flex items-center gap-1 text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                    <Shield className="w-3 h-3" />
                                    {community.university_restriction} Only
                                </span>
                            )}
                        </div>
                    </div>

                    {inviter && !isAlreadyMember && (
                        <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg text-sm">
                            <Avatar className="w-6 h-6">
                                <AvatarImage src={inviter.avatar} />
                                <AvatarFallback>{inviter.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-muted-foreground">
                                <span className="font-medium text-foreground">{inviter.display_name}</span> invited you
                            </span>
                        </div>
                    )}

                    {isAlreadyMember ? (
                        <div className="space-y-3">
                            <div className="p-3 bg-green-500/10 text-green-600 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                You&apos;re already a member of this community
                            </div>
                            <Button
                                className="w-full text-lg h-12 rounded-xl"
                                style={{ backgroundColor: Colors.primary }}
                                onClick={() => router.push(`/yaps/communities/${community.slug}`)}
                            >
                                Take me there
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="w-full text-lg h-12 rounded-xl"
                            style={{ backgroundColor: Colors.primary }}
                            onClick={handleAccept}
                            disabled={isJoining}
                        >
                            {isJoining ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Joining...
                                </>
                            ) : (
                                "Accept Invite & Join"
                            )}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    )
}
