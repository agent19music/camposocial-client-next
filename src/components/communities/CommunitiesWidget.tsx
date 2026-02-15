"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsersThree, Compass, ArrowRight, UsersThreeIcon } from "@phosphor-icons/react"
import { useCommunity } from "@/context/CommunityContext"
import { Skeleton } from "@/components/ui/skeleton"

export default function CommunitiesWidget() {
    const router = useRouter()
    const { myCommunities, loading, fetchMyCommunities } = useCommunity()

    useEffect(() => {
        fetchMyCommunities()
    }, [fetchMyCommunities])

    return (
        <Card className="border-none shadow-sm bg-card/50">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <UsersThreeIcon className="h-5 w-5"  />
                    Communities
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    <>
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-lg" />
                    </>
                ) : (
                    <>
                        {/* User's communities */}
                        {myCommunities.slice(0, 3).map((community) => (
                            <div
                                key={community.id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => router.push(`/yaps/communities/${community.slug}`)}
                            >
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                    {community.icon_image ? (
                                        <Image
                                            src={community.icon_image}
                                            alt={community.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                            {community.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{community.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {community.member_count} members
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Show more if user has more than 3 communities */}
                        {myCommunities.length > 3 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-muted-foreground hover:text-foreground"
                                onClick={() => router.push('/yaps/communities')}
                            >
                                View all ({myCommunities.length})
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}

                        {/* Discover button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push('/yaps/communities')}
                        >
                            <Compass className="h-4 w-4 mr-2" weight="regular" />
                            Discover Communities
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
