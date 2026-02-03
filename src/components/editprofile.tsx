"use client"

import { useState, useRef, useCallback, useEffect, useContext } from "react"
import Image from "next/image"
import { AuthContext } from "@/context/authcontext"
import { FixedCropper, ImageRestriction } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import 'react-advanced-cropper/dist/themes/corners.css'
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Colors as Palette } from "@/constants/Colors"
import { UNIVERSITIES, FACULTIES } from '@/constants/universities';

const C = Palette;

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Pencil, Camera, X, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  const { currentUser, updateUserContext } = useContext(AuthContext) // Get current user from auth context

  // State management - start in edit mode by default
  const [isEditing, setIsEditing] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    display_name: "",
    email: "",
    bio: "",
    phone_no: "",
    university: "",
    faculty: "",
    course: "", // specific course, optional
    yap_header_img: "",
  })


  // Image cropping state
  const [cropModal, setCropModal] = useState({
    isOpen: false,
    type: null as 'avatar' | 'header' | null,
    imageSrc: null as string | null
  })
  const [avatarSrc, setAvatarSrc] = useState("")
  const [headerSrc, setHeaderSrc] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const cropperRef = useRef<any>(null)
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null)
  const headerFileInputRef = useRef<HTMLInputElement | null>(null)

  // Searchable Select State
  const [openUni, setOpenUni] = useState(false)
  const [searchUni, setSearchUni] = useState("")
  const [openFaculty, setOpenFaculty] = useState(false)
  const [searchFaculty, setSearchFaculty] = useState("")

  // Initialize profile data from auth context
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        username: currentUser.username || "",
        display_name: currentUser.display_name || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        phone_no: currentUser.phone_no || "",
        university: currentUser.university || "",
        faculty: currentUser.faculty || "",
        course: currentUser.course || "",
        yap_header_img: (currentUser as any).yap_header_img || "",
      })


      if (currentUser.avatar) {
        setAvatarSrc(currentUser.avatar)
      }
      if ((currentUser as any).yap_header_img) {
        setHeaderSrc((currentUser as any).yap_header_img)
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
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'header') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImageFile(file)

      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setCropModal({
          isOpen: true,
          type: type,
          imageSrc: reader.result as string
        })
      })
      reader.readAsDataURL(file)
    }
  }

  // Get cropped image and close modal
  const applyCrop = useCallback(() => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas()
      if (canvas) {
        const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9)

        if (cropModal.type === 'avatar') {
          setAvatarSrc(croppedImageUrl)
        } else if (cropModal.type === 'header') {
          setHeaderSrc(croppedImageUrl)
        }

        setCropModal({ isOpen: false, type: null, imageSrc: null })
      }
    }
  }, [cropModal.type])

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

  // Trigger file input clicks
  const triggerAvatarUpload = () => {
    if (avatarFileInputRef.current) {
      avatarFileInputRef.current.click()
    }
  }

  const triggerHeaderUpload = () => {
    if (headerFileInputRef.current) {
      headerFileInputRef.current.click()
    }
  }

  // Remove header image
  const removeHeaderImage = () => {
    setHeaderSrc("")
    if (headerFileInputRef.current) {
      headerFileInputRef.current.value = ""
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

      // Add profile avatar if changed
      if (avatarSrc && avatarSrc !== currentUser?.avatar && !avatarSrc.startsWith('http')) {
        const originalFileName = imageFile?.name || "profile-avatar.jpg"
        const imageBlob = dataURLtoFile(avatarSrc, originalFileName)
        formData.append('profile_image', imageBlob)
      }

      // Add header image if changed
      if (headerSrc && headerSrc !== (currentUser as any)?.yap_header_img && !headerSrc.startsWith('http')) {
        const headerBlob = dataURLtoFile(headerSrc, "header-image.jpg")
        formData.append('header_image', headerBlob)
      }

      // Handle header image removal
      if (!headerSrc && (currentUser as any)?.yap_header_img) {
        formData.append('remove_header', 'true')
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

      // Update the AuthContext with new user data
      updateUserContext()

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
        display_name: currentUser.display_name || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        phone_no: currentUser.phone_no || "",
        university: currentUser.university || "",
        faculty: currentUser.faculty || "",
        course: currentUser.course || "",
        yap_header_img: (currentUser as any).yap_header_img || "",

      })

      // Reset avatar to original
      if (currentUser.avatar) {
        setAvatarSrc(currentUser.avatar)
      }
      if ((currentUser as any).yap_header_img) {
        setHeaderSrc((currentUser as any).yap_header_img)
      }
    }

    setIsEditing(false)
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    return `${profileData.first_name.charAt(0) || ''}${profileData.last_name.charAt(0) || ''}` || 'U'
  }



  // Handle select changes
  const handleSelectChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }


  // Get cropper configuration based on type
  const getCropperConfig = () => {
    if (cropModal.type === 'avatar') {
      return {
        stencilSize: { width: 280, height: 280 },
        aspectRatio: 1,
        cropAreaClassName: 'rounded-full'
      }
    } else {
      return {
        stencilSize: { width: 400, height: 133 }, // 3:1 aspect ratio (Twitter header)
        aspectRatio: 3,
        cropAreaClassName: 'rounded-lg'
      }
    }
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="p-0 relative">
          {/* Header Image Section */}
          <div className="relative h-32 rounded-t-lg overflow-hidden" style={{ backgroundColor: 'rgba(181,168,209,0.04)' }}>
            {headerSrc && (
              <Image
                src={headerSrc}
                alt="Header"
                width={400}
                height={128}
                className="w-full h-full object-cover"
              />
            )}

            {/* Header Image Controls */}
            {isEditing && (
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                  onClick={triggerHeaderUpload}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                {headerSrc && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={removeHeaderImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="px-6 pb-6 flex flex-col items-center">
            <div className="relative -mt-12">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src={avatarSrc} alt="User's profile picture" />
                <AvatarFallback className="text-lg font-semibold text-white" style={{ backgroundColor: C.accentDark || C.accent }}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  variant="default"
                  size="icon"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 shadow-md hover:scale-110 transition-transform"
                  style={{ backgroundColor: C.primary }}
                  onClick={triggerAvatarUpload}
                >
                  <Pencil className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>

            <h2 className="text-2xl font-bold mt-4">{profileData.first_name} {profileData.last_name}</h2>
            <p className="text-muted-foreground">@{profileData.username}</p>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={avatarFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onSelectFile(e, 'avatar')}
          />
          <input
            ref={headerFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onSelectFile(e, 'header')}
          />
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
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              name="display_name"
              value={profileData.display_name}
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
            <Label>University</Label>
            <Popover open={openUni} onOpenChange={setOpenUni}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openUni}
                  className="w-full justify-between"
                  disabled={!isEditing}
                >
                  {profileData.university
                    ? profileData.university
                    : "Select University..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <div className="p-2">
                  <Input
                    placeholder="Search university..."
                    value={searchUni}
                    onChange={(e) => setSearchUni(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-[200px] overflow-y-auto">
                    {UNIVERSITIES.filter(u => u.toLowerCase().includes(searchUni.toLowerCase())).map((uni) => (
                      <div
                        key={uni}
                        className="flex items-center p-2 hover:bg-muted cursor-pointer rounded-sm"
                        onClick={() => {
                          setProfileData(prev => ({ ...prev, university: uni }));
                          setOpenUni(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            profileData.university === uni ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {uni}
                      </div>
                    ))}
                    {UNIVERSITIES.filter(u => u.toLowerCase().includes(searchUni.toLowerCase())).length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground">No university found.</div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>Faculty</Label>
            <Popover open={openFaculty} onOpenChange={setOpenFaculty}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openFaculty}
                  className="w-full justify-between"
                  disabled={!isEditing}
                >
                  {profileData.faculty
                    ? profileData.faculty
                    : "Select Faculty..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <div className="p-2">
                  <Input
                    placeholder="Search faculty..."
                    value={searchFaculty}
                    onChange={(e) => setSearchFaculty(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-[200px] overflow-y-auto">
                    {FACULTIES.filter(f => f.toLowerCase().includes(searchFaculty.toLowerCase())).map((fac) => (
                      <div
                        key={fac}
                        className="flex items-center p-2 hover:bg-muted cursor-pointer rounded-sm"
                        onClick={() => {
                          setProfileData(prev => ({ ...prev, faculty: fac }));
                          setOpenFaculty(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            profileData.faculty === fac ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {fac}
                      </div>
                    ))}
                    {FACULTIES.filter(f => f.toLowerCase().includes(searchFaculty.toLowerCase())).length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground">No faculty found.</div>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course">Course (Optional)</Label>
            <Input
              id="course"
              name="course"
              value={profileData.course}
              disabled={!isEditing}
              onChange={handleChange}
              placeholder="e.g. BSc Computer Science"
            />
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

      {/* Enhanced Image Cropping Modal */}
      <Dialog open={cropModal.isOpen} onOpenChange={(open) => setCropModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Crop {cropModal.type === 'avatar' ? 'Profile Picture' : 'Header Image'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            {cropModal.imageSrc && (
              <div className="w-full h-full max-w-full max-h-[60vh] flex items-center justify-center">
                <div className={`${cropModal.type === 'header' ? 'w-full aspect-[3/1] max-h-[300px]' : 'w-full aspect-square max-h-[400px] max-w-[400px]'}`}>
                  <FixedCropper
                    ref={cropperRef}
                    src={cropModal.imageSrc}
                    className="h-full w-full"
                    stencilSize={getCropperConfig().stencilSize}
                    stencilProps={{
                      aspectRatio: getCropperConfig().aspectRatio,
                      handlers: true,
                      lines: true,
                      movable: true,
                      resizable: true,
                      overlayClassName: 'bg-black/50',
                      cropAreaClassName: getCropperConfig().cropAreaClassName,
                      cornersStyle: {
                        borderRadius: cropModal.type === 'avatar' ? '50%' : '4px',
                        backgroundColor: '#FFFFFF',
                        border: '3px solid #000000',
                        width: '12px',
                        height: '12px',
                      },
                    }}
                    imageRestriction={ImageRestriction.stencil}
                    backgroundWrapperProps={{
                      scaleImage: true,
                      moveImage: true,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCropModal({ isOpen: false, type: null, imageSrc: null })}
            >
              Cancel
            </Button>
            <Button type="button" onClick={applyCrop}>
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}