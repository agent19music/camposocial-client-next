"use client"

import { useState, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Settings,
    Save,
    Trash2,
    Loader2,
    Shield,
    UserX,
    Ban,
    School,
    Copy,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { AuthContext } from "@/context/authcontext"
import { Colors } from "@/constants/Colors"
import type { GroupSettingsProps } from "@/types"

export default function GroupSettings({ group, onUpdate }: GroupSettingsProps) {
    const { currentUser, authToken } = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: group.name,
        description: group.description,
        category: group.category,
        privacy_type: group.privacy_type,
        university_restriction: group.university_restriction || false // Handle legacy or string
    })

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/groups/${group.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Settings saved")
                onUpdate()
            } else {
                toast.error("Failed to update settings")
            }
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this community? This action cannot be undone.")) return;

        setIsLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/groups/${group.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            })

            if (res.ok) {
                toast.success("Community deleted")
                window.location.href = '/yaps/communities'
            } else {
                toast.error("Failed to delete community")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="secondary" className="rounded-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Community Settings</SheetTitle>
                    <SheetDescription>
                        Manage your community details and preferences.
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="general" className="mt-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="members">Members & Roles</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="desc">Description</Label>
                            <Textarea
                                id="desc"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Privacy</Label>
                            <Select
                                value={formData.privacy_type}
                                onValueChange={(val) => setFormData({ ...formData, privacy_type: val as 'public' | 'private' | 'secret' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="secret">Secret (Invite Only)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {group.university_restriction && (
                            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg text-sm">
                                <School className="w-4 h-4" />
                                Restricted to: <span className="font-semibold">{group.university_restriction}</span>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Invite Link</Label>
                            {formData.privacy_type === 'public' ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        readOnly
                                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/yaps/communities/${group.id}`}
                                        className="bg-muted text-muted-foreground"
                                    />
                                    <Button variant="outline" size="icon" onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/yaps/communities/${group.id}`);
                                        toast.success("Link copied!");
                                    }}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                                    Secret communities require unique invite links. Use the &quot;Invite&quot; button on the main page to generate them.
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-between">
                            <Button variant="destructive" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Community
                            </Button>
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="members" className="space-y-4 py-4">
                        <div className="text-sm text-muted-foreground mb-4">
                            Manage members, promote moderators, or ban users.
                        </div>
                        {/* Placeholder for Member Management List */}
                        {/* A real implementation would fetch members dynamically here */}
                        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                            Member management UI coming soon.
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}
