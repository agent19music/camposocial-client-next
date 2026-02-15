"use client"

import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    MagnifyingGlass,
    Plus,
    Users,
    Lock,
    Spinner,
    Funnel
} from "@phosphor-icons/react"
import { Colors } from "@/constants/Colors"
import { toast } from "react-hot-toast"
import FilterPills, { FilterPill } from "@/components/filter-pills"
import CreateCommunityModal from "@/components/communities/CreateCommunityModal"
import Header from "@/components/header"
import { AuthContext } from "@/context/authcontext"
import { useCommunity } from "@/context/CommunityContext"

// Interface for Group
interface Group {
    id: string
    slug: string
    name: string
    description: string
    category: string
    member_count: number
    icon_image?: string
    privacy_type: 'public' | 'private' | 'secret'
    university_restriction?: string
    is_verified?: boolean
    is_member?: boolean
    user_role?: string
    cover_image?: string
}

export default function GroupsPage() {
    const { authToken, isAuthenticated, isLoading } = useContext(AuthContext)
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("discover")
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Call hook unconditionally (rules of hooks); use values only when authenticated
    const communityContext = useCommunity()

    const {
        recommendedCommunities = [],
        trendingCommunities = [],
        myCommunities = [],
        loading = false,
        fetchCommunities = () => { },
        fetchMyCommunities = () => { }
    } = isAuthenticated && !isLoading ? communityContext : {}

    // Fetch data on mount
    useEffect(() => {
        if (authToken && fetchCommunities) {
            fetchCommunities()
            fetchMyCommunities()
        }
    }, [authToken, fetchCommunities, fetchMyCommunities])

    // Show loading state while auth is initializing
    if (isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Spinner className="h-8 w-8 animate-spin text-muted-foreground" weight="regular" />
            </div>
        )
    }

    // Render function for group cards
    const renderGroupCard = (group: Group, isMyGroup = false) => (
        <Card key={group.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer" onClick={() => router.push(`/yaps/communities/${group.slug}`)}>
            <div className="relative w-full" style={{ aspectRatio: '851/315' }}>
                {group.cover_image ? (
                    <Image
                        src={group.cover_image}
                        alt={group.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                        {group.name.charAt(0)}
                    </div>
                )}
                {group.university_restriction && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500/80 hover:bg-yellow-500 text-white border-0 backdrop-blur-md">
                        {group.university_restriction} Only
                    </Badge>
                )}
            </div>
            <CardHeader className="relative pt-0 pb-2">
                <div className="absolute -top-10 left-4">
                    <div className="w-20 h-20 rounded-2xl border-4 border-background bg-muted overflow-hidden shadow-md">
                        {group.icon_image ? (
                            <Image
                                src={group.icon_image}
                                alt={group.name}
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                                {group.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="ml-24 pt-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-1">
                        {group.name}
                        {group.is_verified && <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-500/10 text-blue-500">✓</Badge>}
                    </CardTitle>
                    <CardDescription className="line-clamp-1 text-xs mt-1">
                        {group.member_count} members • {group.category}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {group.description || "No description provided."}
                </p>
            </CardContent>
            <CardFooter className="pt-0">
                <Button
                    className="w-full rounded-full"
                    variant={isMyGroup ? "outline" : "default"}
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/yaps/communities/${group.slug}`);
                    }}
                >
                    {isMyGroup ? "View Community" : "Join Community"}
                </Button>
            </CardFooter>
        </Card>
    )

    // Filter pills configuration
    const filterPills: FilterPill[] = [
        { id: "discover", label: "Discover", active: activeTab === "discover" },
        { id: "my-groups", label: "My Communities", active: activeTab === "my-groups" },
    ];

    const handleFilterSelect = (filterId: string) => {
        setActiveTab(filterId);
    };

    return (
        <div className={`w-screen h-screen lg:container mx-auto flex flex-col p-4`}>
            <Header />
            <main className={`lg:pb-4 flex-1 flex flex-col overflow-hidden mobile-content-padding`}>
                {/* Filter Pills - Mobile */}
                <div className="lg:hidden mb-4">
                    <FilterPills
                        filters={filterPills}
                        onFilterSelect={handleFilterSelect}
                    />
                </div>

                <div className="flex flex-col gap-6 h-full">
                    <div className="flex-1 flex flex-col gap-6 p-0 lg:gap-6 h-full">

                        {/* Desktop Filter Pills with Create Button */}
                        <div className="hidden lg:flex items-center justify-between gap-4">
                            <FilterPills
                                filters={filterPills}
                                onFilterSelect={handleFilterSelect}
                            />
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="rounded-full shadow-lg hover:shadow-xl transition-all flex-shrink-0"
                                style={{ backgroundColor: "#4A90E2" }}
                            >
                                <Plus className="w-4 h-4 mr-2" weight="regular" />
                                Create Community
                            </Button>
                        </div>

                        {/* Desktop Search - Show only for discover tab */}
                        {activeTab === 'discover' && (
                            <div className="hidden lg:flex w-full justify-center items-center">
                                <div className="relative max-w-md w-full">
                                    <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" weight="regular" />
                                    <Input
                                        type="search"
                                        placeholder="Search communities..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 rounded-full border-muted bg-muted/50 focus:bg-background"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Content based on active tab */}
                        <div className="flex-1 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                {activeTab === "discover" && (
                                    <motion.div
                                        key="discover"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-6 h-full overflow-y-auto p-1"
                                    >
                                        {/* Trending Section */}
                                        {trendingCommunities.length > 0 && !searchQuery && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-xl font-semibold">Trending Now</h2>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {trendingCommunities.map((g: Group) => renderGroupCard(g))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Recommended Section */}
                                        {recommendedCommunities.length > 0 && !searchQuery && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-xl font-semibold">Recommended for You</h2>
                                                </div>
                                                {loading ? (
                                                    <div className="flex items-center justify-center py-12">
                                                        <Spinner className="h-8 w-8 animate-spin text-muted-foreground" weight="regular" />
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {recommendedCommunities.map((g: Group) => renderGroupCard(g))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Empty state when no communities */}
                                        {!loading && trendingCommunities.length === 0 && recommendedCommunities.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <Users className="w-12 h-12 opacity-20 text-muted-foreground mb-4" weight="regular" />
                                                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Helvetica' }}>
                                                    No communities found
                                                </h3>
                                                <p className="text-muted-foreground leading-relaxed max-w-sm">
                                                    Start by creating your own community or check back later for recommendations.
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "my-groups" && (
                                    <motion.div
                                        key="my-groups"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="space-y-6 h-full overflow-y-auto p-1"
                                    >
                                        {myCommunities.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {myCommunities.map((g: Group) => renderGroupCard(g, true))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <Users className="w-12 h-12 opacity-20 text-muted-foreground mb-4" weight="regular" />
                                                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Helvetica' }}>
                                                    No communities yet
                                                </h3>
                                                <p className="text-muted-foreground leading-relaxed max-w-sm mb-6">
                                                    You haven&apos;t joined any communities yet.
                                                </p>
                                                <Button
                                                    onClick={() => setActiveTab('discover')}
                                                    className="text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                                    style={{ backgroundColor: '#4A90E2' }}
                                                >
                                                    <Users className="h-4 w-4 mr-2" weight="regular" />
                                                    Discover Communities
                                                </Button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            <CreateCommunityModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onGroupCreated={() => {
                    fetchCommunities()
                    fetchMyCommunities()
                }}
            />
        </div>
    )
}
