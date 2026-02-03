"use client"

import { useState, useContext } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog"
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
import { Loader2, School, Lock, Globe, EyeOff, Image as ImageIcon } from "lucide-react"
import { AuthContext } from "@/context/authcontext"
import { toast } from "react-hot-toast"
import { Colors } from "@/constants/Colors"

interface CreateGroupModalProps {
    isOpen: boolean
    onClose: () => void
    onGroupCreated?: () => void
}

export default function CreateCommunityModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
    const { currentUser, authToken } = useContext(AuthContext)
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "other",
        privacy_type: "public",
        university_restriction: false
    })

    const handleSubmit = async () => {
        if (!formData.name) return toast.error("Community name is required");

        setIsLoading(true);
        try {
            const payload = {
                ...formData,
                university_restriction: formData.university_restriction ? currentUser?.university : null
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success("Community created successfully!");
                if (onGroupCreated) onGroupCreated();
                onClose();
                // Reset form
                setFormData({
                    name: "",
                    description: "",
                    category: "other",
                    privacy_type: "public",
                    university_restriction: false
                });
                setStep(1);
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to create community");
            }

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create a Community</DialogTitle>
                    <DialogDescription>
                        Bring people together around a common interest.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">Community Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Computer Science Club"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="What is this community about?"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(val) => setFormData({ ...formData, category: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
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

                        {/* Privacy */}
                        <div className="grid gap-2">
                            <Label>Privacy</Label>
                            <Select
                                value={formData.privacy_type}
                                onValueChange={(val) => setFormData({ ...formData, privacy_type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select privacy" />
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

                    {/* University Restriction Toggle */}
                    <div className="flex flex-col gap-2 p-4 rounded-xl border bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2">
                                    <School className="w-4 h-4 text-primary" />
                                    Restrict to {currentUser?.university || "My University"}?
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Only students with a verified @{currentUser?.university || '...'} email can join.
                                </p>
                            </div>
                            <Switch
                                checked={formData.university_restriction}
                                onCheckedChange={(checked) => setFormData({ ...formData, university_restriction: checked })}
                                disabled={!currentUser?.university}
                            />
                        </div>
                        {!currentUser?.university && (
                            <p className="text-xs text-red-500 mt-1">
                                You need to update your profile with a university to use this feature.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !formData.name} style={{ backgroundColor: Colors.primary }}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create Community
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
