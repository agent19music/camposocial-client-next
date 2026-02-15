"use client"

import { useState, useContext, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { Loader2, Globe, Lock, ShieldAlert, Crown } from "lucide-react"
import { AuthContext } from "@/context/authcontext"
import { useCommunity } from "@/context/CommunityContext"
import { toast } from "react-hot-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CommunitySettingsModalProps {
    isOpen: boolean
    onClose: () => void
    community: any
}

export default function CommunitySettingsModal({ isOpen, onClose, community }: CommunitySettingsModalProps) {
    const { authToken, currentUser } = useContext(AuthContext)
    const { updateCommunity, transferOwnership } = useCommunity()
    const [activeTab, setActiveTab] = useState("general")
    const [isLoading, setIsLoading] = useState(false)

    // General Settings State
    const [formData, setFormData] = useState({
        name: community?.name || "",
        description: community?.description || "",
        privacy_type: community?.privacy_type || "public",
        category: community?.category || "other"
    })

    // Transfer Ownership State
    const [members, setMembers] = useState<any[]>([])
    const [selectedNewOwner, setSelectedNewOwner] = useState<string>("")
    const [isMembersLoading, setIsMembersLoading] = useState(false)
    const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)

    const isOwner = currentUser?.id === community?.creator?.id || String(currentUser?.id) === String(community?.creator?.id)

    useEffect(() => {
        if (isOpen && community) {
            setFormData({
                name: community.name,
                description: community.description,
                privacy_type: community.privacy_type,
                category: community.category
            })
            if (activeTab === "danger") {
                if (isOwner) {
                    fetchMembers()
                } else {
                    setActiveTab("general")
                }
            }
        }
    }, [isOpen, community, activeTab, isOwner])

    const fetchMembers = async () => {
        setIsMembersLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities/${community.id}/members?per_page=100`, {
                headers: { Authorization: `Bearer ${authToken}` }
            })

            if (res.ok) {
                const data = await res.json()
                // Filter out current user (owner)
                const eligibleMembers = data.members.filter((m: any) => String(m.user_id) !== String(currentUser?.id))
                setMembers(eligibleMembers)
            } else {
                console.error("Failed to fetch members:", await res.text())
            }
        } catch (error) {
            console.error("Error fetching members:", error)
        } finally {
            setIsMembersLoading(false)
        }
    }

    const handleUpdate = async () => {
        setIsLoading(true)
        try {
            const success = await updateCommunity(community.slug, formData)
            if (success) {
                onClose()
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleTransferOwnership = async () => {
        if (!selectedNewOwner) return

        setIsLoading(true)
        try {
            const success = await transferOwnership(community.id, parseInt(selectedNewOwner))
            if (success) {
                setIsTransferDialogOpen(false)
                onClose()
                // Ideally refresh page or redirect
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (!community) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle>Community Settings</DialogTitle>
                    <DialogDescription>
                        Manage your community preferences and permissions.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex">
                    {/* Sidebar Tabs */}
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        orientation="vertical"
                        className="flex-1 flex flex-row h-full w-full"
                    >
                        <div className="w-48 border-r bg-muted/20 p-4 space-y-2 h-full">
                            <TabsList className="flex flex-col h-auto bg-transparent space-y-1 w-full p-0">
                                <TabsTrigger
                                    value="general"
                                    className="w-full justify-start px-3 py-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                                >
                                    General
                                </TabsTrigger>
                                {isOwner && (
                                    <TabsTrigger
                                        value="danger"
                                        className="w-full justify-start px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 data-[state=active]:bg-red-50 data-[state=active]:text-red-600"
                                    >
                                        Danger Zone
                                    </TabsTrigger>
                                )}
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {/* General Settings */}
                            <TabsContent value="general" className="mt-0 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">General Information</h3>

                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Community Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="academic">Academic</SelectItem>
                                                    <SelectItem value="hobby">Hobby & Interest</SelectItem>
                                                    <SelectItem value="sports">Sports</SelectItem>
                                                    <SelectItem value="events">Events</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Privacy</Label>
                                            <Select
                                                value={formData.privacy_type}
                                                onValueChange={(val) => setFormData({ ...formData, privacy_type: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="public">
                                                        <div className="flex items-center"><Globe className="w-3 h-3 mr-2" /> Public</div>
                                                    </SelectItem>
                                                    <SelectItem value="private">
                                                        <div className="flex items-center"><Lock className="w-3 h-3 mr-2" /> Invite Only</div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t flex justify-end">
                                    <Button onClick={handleUpdate} disabled={isLoading}>
                                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* Danger Zone */}
                            {isOwner && (
                                <TabsContent value="danger" className="mt-0 space-y-6">
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-muted/50 rounded-full">
                                                    <Crown className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-base font-semibold">Transfer Ownership</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Transfer this community to another member. You will remain as an admin but lose ownership rights. This action cannot be undone.
                                                    </p>

                                                    <div className="mt-4">
                                                        <Label className="mb-2 block">Select New Owner</Label>
                                                        <Select
                                                            value={selectedNewOwner}
                                                            onValueChange={setSelectedNewOwner}
                                                            disabled={isMembersLoading}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={isMembersLoading ? "Loading members..." : "Select a member"} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {members.length === 0 ? (
                                                                    <div className="p-2 text-sm text-muted-foreground text-center">No other members found</div>
                                                                ) : (
                                                                    members.map((member) => (
                                                                        <SelectItem key={member.user_id} value={String(member.user_id)}>
                                                                            <div className="flex items-center gap-2">
                                                                                <Avatar className="w-6 h-6">
                                                                                    <AvatarImage src={member.avatar} />
                                                                                    <AvatarFallback>{member.display_name[0]}</AvatarFallback>
                                                                                </Avatar>
                                                                                <span>{member.display_name}</span>
                                                                                <span className="text-xs text-muted-foreground">(@{member.username})</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <Button
                                                        variant="destructive"
                                                        className="mt-4 w-full sm:w-auto"
                                                        disabled={!selectedNewOwner || isLoading}
                                                        onClick={() => setIsTransferDialogOpen(true)}
                                                    >
                                                        Transfer Ownership
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delete option could go here too */}
                                    </div>
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </div>
            </DialogContent>

            {/* Confirmation Dialog for Transfer */}
            <AlertDialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Transfer Community Ownership?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you absolutely sure? This will transfer all ownership rights to the selected member. You will become an admin.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleTransferOwnership} className="bg-red-600 hover:bg-red-700">
                            {isLoading ? "Transferring..." : "Confirm Transfer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}
