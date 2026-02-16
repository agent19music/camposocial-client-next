"use client"

import { useState, useContext, useRef } from "react"
import Image from "next/image"
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
import { Loader2, School, Lock, Globe, Camera, ImageIcon, X } from "lucide-react"
import { AuthContext } from "@/context/authcontext"
import { toast } from "react-hot-toast"
import { Colors } from "@/constants/Colors"
import CommunityCropModal from "./CommunityCropModal"
import type { CreateGroupModalProps } from "@/types"

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

    // Image state
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
    const [iconImageFile, setIconImageFile] = useState<File | null>(null)
    const [iconImagePreview, setIconImagePreview] = useState<string | null>(null)

    // Crop modal state
    const [cropModal, setCropModal] = useState<{
        isOpen: boolean
        type: 'cover' | 'icon' | null
        imageSrc: string | null
    }>({
        isOpen: false,
        type: null,
        imageSrc: null
    })

    const coverInputRef = useRef<HTMLInputElement>(null)
    const iconInputRef = useRef<HTMLInputElement>(null)

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'icon') => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const imageSrc = event.target?.result as string
            setCropModal({
                isOpen: true,
                type,
                imageSrc
            })
        }
        reader.readAsDataURL(file)

        // Reset input so same file can be selected again
        if (e.target) e.target.value = ''
    }

    const handleCropComplete = (croppedBlob: Blob) => {
        const file = new File(
            [croppedBlob],
            `community-${cropModal.type}.jpg`,
            { type: 'image/jpeg' }
        )
        const previewUrl = URL.createObjectURL(croppedBlob)

        if (cropModal.type === 'cover') {
            if (coverImagePreview) URL.revokeObjectURL(coverImagePreview)
            setCoverImageFile(file)
            setCoverImagePreview(previewUrl)
        } else {
            if (iconImagePreview) URL.revokeObjectURL(iconImagePreview)
            setIconImageFile(file)
            setIconImagePreview(previewUrl)
        }

        setCropModal({ isOpen: false, type: null, imageSrc: null })
    }

    const removeCoverImage = () => {
        if (coverImagePreview) URL.revokeObjectURL(coverImagePreview)
        setCoverImageFile(null)
        setCoverImagePreview(null)
    }

    const removeIconImage = () => {
        if (iconImagePreview) URL.revokeObjectURL(iconImagePreview)
        setIconImageFile(null)
        setIconImagePreview(null)
    }

    const handleSubmit = async () => {
        if (!formData.name) return toast.error("Community name is required");

        setIsLoading(true);
        try {
            const submitData = new FormData()
            submitData.append('name', formData.name)
            submitData.append('description', formData.description)
            submitData.append('category', formData.category)
            submitData.append('privacy_type', formData.privacy_type)
            if (formData.university_restriction && currentUser?.university) {
                submitData.append('university_restriction', currentUser.university)
            }
            if (coverImageFile) {
                submitData.append('cover_image', coverImageFile)
            }
            if (iconImageFile) {
                submitData.append('icon_image', iconImageFile)
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/communities`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                body: submitData
            });

            if (res.ok) {
                toast.success("Community created successfully!");
                if (onGroupCreated) onGroupCreated();
                onClose();
                // Reset form
                resetForm()
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

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            category: "other",
            privacy_type: "public",
            university_restriction: false
        })
        removeCoverImage()
        removeIconImage()
        setStep(1)
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create a Community</DialogTitle>
                        <DialogDescription>
                            Bring people together around a common interest.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Cover Image Upload */}
                        <div className="grid gap-2">
                            <Label>Cover Image</Label>
                            <div
                                className="relative w-full aspect-[3/1] rounded-xl overflow-hidden bg-muted/50 border-2 border-dashed border-muted-foreground/20 cursor-pointer hover:border-primary/40 transition-colors group"
                                onClick={() => coverInputRef.current?.click()}
                            >
                                {coverImagePreview ? (
                                    <>
                                        <Image
                                            src={coverImagePreview}
                                            alt="Cover preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute top-2 right-2 rounded-full h-6 w-6 bg-black/50 hover:bg-black/70 text-white border-0"
                                            onClick={(e) => { e.stopPropagation(); removeCoverImage() }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Camera className="w-8 h-8" />
                                        <span className="text-xs">Add cover image (1500×500)</span>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageSelect(e, 'cover')}
                            />
                        </div>

                        {/* Icon Image Upload */}
                        <div className="grid gap-2">
                            <Label>Community Icon</Label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="relative w-20 h-20 rounded-2xl overflow-hidden bg-muted/50 border-2 border-dashed border-muted-foreground/20 cursor-pointer hover:border-primary/40 transition-colors group flex-shrink-0"
                                    onClick={() => iconInputRef.current?.click()}
                                >
                                    {iconImagePreview ? (
                                        <>
                                            <Image
                                                src={iconImagePreview}
                                                alt="Icon preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>Square icon for your community</p>
                                    {iconImagePreview && (
                                        <button
                                            className="text-red-500 hover:underline text-xs mt-1"
                                            onClick={removeIconImage}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                            <input
                                ref={iconInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageSelect(e, 'icon')}
                            />
                        </div>

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

            {/* Crop Modal */}
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
        </>
    )
}
