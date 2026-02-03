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
    School
} from "lucide-react"
import { toast } from "react-hot-toast"
import { AuthContext } from "@/context/authcontext"
import { Colors } from "@/constants/Colors"

interface GroupSettingsProps {
    group: any
    onUpdate: () => void
}

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
                                onValueChange={(val) => setFormData({ ...formData, privacy_type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="private">Invite Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {group.university_restriction && (
                            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 text-yellow-600 rounded-lg text-sm">
                                <School className="w-4 h-4" />
                                Restricted to: <span className="font-semibold">{group.university_restriction}</span>
                                {/* Note: Changing this might be complex, so keeping it read-only for now */}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Invite Link</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    readOnly
                                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/yaps/communities/${group.id}`}
                                    className="bg-muted text-muted-foreground"
                                />
                                <Button variant="outline" size="icon" onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/yaps/communities/${group.id}`);
                                    toast.success("Invite link copied!");
                                }}>
                                    <span className="sr-only">Copy</span>
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 15 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00006H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006L2.5 1.00006C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50006C5 4.67163 5.67157 4.00006 6.5 4.00006H13.5C14.3284 4.00006 15 4.67163 15 5.50006V12.5001C15 13.3285 14.3284 14.0001 13.5 14.0001H6.5C5.67157 14.0001 5 13.3285 5 12.5001V5.50006ZM6.5 5.00006H13.5C13.7761 5.00006 14 5.22392 14 5.50006V12.5001C14 12.7762 13.7761 13.0001 13.5 13.0001H6.5C6.22386 13.0001 6 12.7762 6 12.5001V5.50006C6 5.22392 6.22386 5.00006 6.5 5.00006Z"
                                            fill="currentColor"
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                        ></path>
                                    </svg>
                                </Button>
                            </div>
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
