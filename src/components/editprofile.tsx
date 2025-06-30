"use client"

import { useState, useRef, useCallback, useEffect, useContext} from "react"
import { AuthContext } from "@/context/authcontext"
import { FixedCropper, ImageRestriction } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import 'react-advanced-cropper/dist/themes/corners.css'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"
export default function ProfileEditor() {
  const { currentUser } = useContext(AuthContext) // Get current user from auth context
  
  // State management
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    bio: "",
    phone_no: "",
    category: "",
  })
  
  // Image cropping state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [avatarSrc, setAvatarSrc] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const cropperRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Initialize profile data from auth context when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        phone_no: currentUser.phone_no || "",
        category: currentUser.category || "",
      })
      
      // Set avatar if available
      if (currentUser.avatar) {
        setAvatarSrc(currentUser.avatar)
      }
    }
  }, [currentUser])

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  // Handle image selection
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImageFile(file)
      
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string)
        setIsCropModalOpen(true)
      })
      reader.readAsDataURL(file)
    }
  }

  // Get cropped image and close modal
  const applyCrop = useCallback(() => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas()
      if (canvas) {
        // Get cropped image as data URL
        const croppedImageUrl = canvas.toDataURL()
        setAvatarSrc(croppedImageUrl)
        setIsCropModalOpen(false)
      }
    }
  }, [])

  // Convert data URL to File object
  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle profile update submission
  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Create FormData for the multipart/form-data request
      const formData = new FormData()
      
      // Add all profile fields to FormData
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value)
        }
      })
      
      // Add profile image if it was changed
      if (avatarSrc && avatarSrc !== currentUser?.avatar && !avatarSrc.startsWith('http')) {
        // If we have an original file name, use it; otherwise create a default name
        const originalFileName = imageFile?.name || "profile-image.jpg"
        const imageBlob = dataURLtoFile(avatarSrc, originalFileName)
        formData.append('profile_image', imageBlob)
      }
      
      // Send request to your API
      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for FormData
        credentials: 'include' // Include cookies for authentication
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile')
      }
      
      const result = await response.json()
      toast.success("Your profile has been updated successfully")
      
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form to original values
  const handleCancel = () => {
    if (currentUser) {
      setProfileData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        username: currentUser.username || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        phone_no: currentUser.phone_no || "",
        category: currentUser.category || "",
      })
      
      // Reset avatar to original
      if (currentUser.avatar) {
        setAvatarSrc(currentUser.avatar)
      }
    }
    
    setIsEditing(false)
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    return `${profileData.first_name.charAt(0) || ''}${profileData.last_name.charAt(0) || ''}` || 'U'
  }

  // Map category code to display text
  const getCategoryDisplay = (code: string) => {
    const categories = {
      "sw": "Software Development",
      "ui/ux": "UI/UX Design",
      "ds": "Data Science",
      "cybersec": "Cyber Security"
    }
    return categories[code as keyof typeof categories] || "Select Course"
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="bg-muted/20 p-6 flex flex-col items-center">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarSrc} alt="User's profile picture" />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full"
              onClick={triggerFileUpload}
              disabled={!isEditing}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onSelectFile}
            />
          </div>
          <h2 className="text-2xl font-bold mt-4">{profileData.first_name} {profileData.last_name}</h2>
          <p className="text-muted-foreground">@{profileData.username}</p>
        </CardHeader>
        <CardContent className="p-6 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input 
                id="first_name" 
                name="first_name"
                value={profileData.first_name} 
                disabled={!isEditing}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input 
                id="last_name" 
                name="last_name"
                value={profileData.last_name} 
                disabled={!isEditing}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              name="username"
              value={profileData.username} 
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              value={profileData.email} 
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
         
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={3}
              value={profileData.bio}
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone_no">Phone</Label>
            <Input 
              id="phone_no" 
              name="phone_no"
              value={profileData.phone_no} 
              type="tel" 
              disabled={!isEditing}
              onChange={handleChange}
            />
          </div>
        
          <div className="grid gap-2">
            <Label htmlFor="category">Course</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={!isEditing}>
                  {getCategoryDisplay(profileData.category)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Enrolled Course</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={profileData.category} onValueChange={(value) => setProfileData({...profileData, category: value})}>
                  <DropdownMenuRadioItem value="sw">Software Development</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ui/ux">UI/UX Design</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ds">Data Science</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cybersec">Cyber Security</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex justify-end gap-2">
            {isEditing && (
              <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
            <Button 
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : isEditing ? "Save" : "Edit"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Cropping Modal */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Profile Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-2">
            {imageSrc && (
              <div className="w-full aspect-square">
             <FixedCropper
                ref={cropperRef}
                src={imageSrc}
                className="h-full"
                stencilSize={{ width: 280, height: 280 }} // Add this line
                stencilProps={{
                    aspectRatio: 1,
                    handlers: true,
                    lines: true,
                    movable: true,
                    resizable: true,
                    overlayClassName: 'bg-black/50',
                    cropAreaClassName: 'rounded-full',
                    cornersStyle: {
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    border: '3px solid #000000',
                    width: '12px',
                    height: '12px',
                    },
                }}
                imageRestriction={ImageRestriction.stencil}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCropModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={applyCrop}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}