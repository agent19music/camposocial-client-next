"use client"

import { useState, useContext, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ImageIcon, 
  VideoIcon, 
  SmileIcon, 
  MapPinIcon, 
  CalendarIcon, 
  BarChartIcon,
  PlusIcon,
  MinusIcon,
  X,
  Hash
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { YapContext } from "@/context/yapcontext"
import { Colors as Palette } from "@/constants/Colors"
import { AuthContext } from "@/context/authcontext"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface YapPayload {
  content: string;
  location?: string;
  originalYapId?: string;
  mediaFiles?: File[];
}

export default function AddYap() {
  const [open, setOpen] = useState(false)
  const [yapContent, setYapContent] = useState("")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Hashtag suggestions
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false)
  const [hashtagQuery, setHashtagQuery] = useState("")
  const [hashtagSuggestions, setHashtagSuggestions] = useState<any[]>([])
  const [cursorPosition, setCursorPosition] = useState(0)
  
  // Location suggestions
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [locationQuery, setLocationQuery] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  
  // Poll functionality
  const [isPollMode, setIsPollMode] = useState(false)
  const [pollOptions, setPollOptions] = useState(["", ""])
  const [pollDuration, setPollDuration] = useState("1 day")

  const { postYap, getHashtagSuggestions, getLocationSuggestions } = useContext(YapContext)
  const { currentUser } = useContext(AuthContext)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_CHARACTERS = 280
  const characterCount = yapContent.length
  const remainingChars = MAX_CHARACTERS - characterCount
  const warningThreshold = 20

  // Extract hashtags from content for real-time processing
  const extractedHashtags = yapContent.match(/#[\w]+/g) || []

  // Handle content change and detect hashtag typing
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    
    if (value.length <= MAX_CHARACTERS) {
      setYapContent(value)
      setCursorPosition(cursorPos)
      
      // Check for hashtag typing
      const textBeforeCursor = value.substring(0, cursorPos)
      const hashtagMatch = textBeforeCursor.match(/#(\w*)$/)
      
      if (hashtagMatch) {
        setHashtagQuery(hashtagMatch[1])
        setShowHashtagSuggestions(true)
        fetchHashtagSuggestions(hashtagMatch[1])
      } else {
        setShowHashtagSuggestions(false)
      }
    }
  }

  // Fetch hashtag suggestions
  const fetchHashtagSuggestions = async (query: string) => {
    try {
      const suggestions = await getHashtagSuggestions(query)
      setHashtagSuggestions(suggestions)
    } catch (error) {
      console.error('Failed to fetch hashtag suggestions:', error)
    }
  }

  // Fetch location suggestions
  const fetchLocationSuggestions = async (query: string) => {
    try {
      const suggestions = await getLocationSuggestions(query)
      setLocationSuggestions(suggestions)
    } catch (error) {
      console.error('Failed to fetch location suggestions:', error)
    }
  }

  // Handle hashtag selection
  const handleHashtagSelect = (hashtag: string) => {
    const textBeforeCursor = yapContent.substring(0, cursorPosition)
    const textAfterCursor = yapContent.substring(cursorPosition)
    
    // Replace the partial hashtag with the selected one
    const updatedTextBefore = textBeforeCursor.replace(/#\w*$/, `#${hashtag} `)
    const newContent = updatedTextBefore + textAfterCursor
    
    setYapContent(newContent)
    setShowHashtagSuggestions(false)
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(updatedTextBefore.length, updatedTextBefore.length)
      }
    }, 0)
  }

  // Handle location input change
  const handleLocationChange = (value: string) => {
    setLocationQuery(value)
    setLocation(value)
    
    if (value.length > 1) {
      setShowLocationSuggestions(true)
      fetchLocationSuggestions(value)
    } else {
      setShowLocationSuggestions(false)
    }
  }

  // Handle location selection
  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation)
    setLocationQuery(selectedLocation)
    setShowLocationSuggestions(false)
  }

  // Handle media file selection
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidType && isValidSize
    })
    
    setMediaFiles(prev => [...prev, ...validFiles].slice(0, 4)) // Max 4 files
  }

  // Remove media file
  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Add poll option
  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions(prev => [...prev, ""])
    }
  }

  // Remove poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter((_, i) => i !== index))
    }
  }

  // Update poll option
  const updatePollOption = (index: number, value: string) => {
    setPollOptions(prev => prev.map((option, i) => i === index ? value : option))
  }

  // Submit yap
  const handleSubmit = async () => {
    if (!yapContent.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const payload: YapPayload = {
        content: yapContent.trim(),
        location: location.trim() || undefined,
        mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined
      }
      
      await postYap(payload)
      
      // Reset form
      setYapContent("")
      setMediaFiles([])
      setLocation("")
      setLocationQuery("")
      setPollOptions(["", ""])
      setIsPollMode(false)
      setOpen(false)
      
    } catch (error) {
      console.error('Failed to post yap:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSubmitDisabled = !yapContent.trim() || characterCount > MAX_CHARACTERS || isSubmitting

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
  <Button className="w-full text-white font-medium rounded-full h-12 shadow-lg hover:shadow-xl transition-all duration-200" style={{ backgroundColor: Palette.accent }}>
          What&apos;s happening?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Compose Yap</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 px-1">
          {/* User info */}
          <div className="flex items-start space-x-4">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.username} />
              <AvatarFallback className="text-primary font-medium" style={{ backgroundColor: Palette.accentLight }}>
                {currentUser?.first_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4 min-w-0">
              {/* Content textarea */}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="What's happening?"
                  value={yapContent}
                  onChange={handleContentChange}
                  className="min-h-[120px] text-lg"
                  maxLength={MAX_CHARACTERS}
                />
                
                {/* Hashtag suggestions */}
                {showHashtagSuggestions && hashtagSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2">
                    <div className="bg-background border rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {hashtagSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-4 py-3 hover:bg-accent text-sm flex items-center justify-between first:rounded-t-xl last:rounded-b-xl transition-colors"
                          onClick={() => handleHashtagSelect(suggestion.name)}
                        >
                          <span className="text-primary font-medium">#{suggestion.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {suggestion.usage_count} uses
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted hashtags display */}
              {extractedHashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {extractedHashtags.map((hashtag, index) => (
                    <Badge key={index} variant="secondary" className="text-primary">
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Media preview */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <Image
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMediaFile(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Location input */}
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Add location..."
                    value={locationQuery}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="border-none p-0 h-8 focus-visible:ring-0"
                  />
                </div>
                
                {/* Location suggestions */}
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-6 right-0 z-50 mt-1">
                    <div className="bg-popover border rounded-md shadow-md max-h-40 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex items-center justify-between"
                          onClick={() => handleLocationSelect(suggestion.name)}
                        >
                          <span>{suggestion.name}</span>
                          {suggestion.usage_count > 0 && (
                            <span className="text-muted-foreground text-xs">
                              {suggestion.usage_count} uses
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Poll options */}
              {isPollMode && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Poll Options</div>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        className="flex-1"
                      />
                      {pollOptions.length > 2 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removePollOption(index)}
                          className="w-8 h-8"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <Button
                      variant="ghost"
                      onClick={addPollOption}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add option
                    </Button>
                  )}
                  <Select value={pollDuration} onValueChange={setPollDuration}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5 minutes">5 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="1 day">1 day</SelectItem>
                      <SelectItem value="3 days">3 days</SelectItem>
                      <SelectItem value="7 days">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-1">
              {/* Media upload */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={mediaFiles.length >= 4}
                className="text-primary hover:bg-accent rounded-xl h-10 w-10"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              
              {/* Poll toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPollMode(!isPollMode)}
                className={cn(
                  "text-primary hover:bg-accent rounded-xl h-10 w-10",
                  isPollMode && "bg-accent"
                )}
              >
                <BarChartIcon className="w-5 h-5" />
              </Button>

              {/* Emoji (placeholder) */}
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-accent rounded-xl h-10 w-10"
              >
                <SmileIcon className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Character count */}
              <div className="flex items-center space-x-2">
                {characterCount > 0 && (
                  <>
                    <div className="relative w-8 h-8">
                      <Progress
                        value={(characterCount / MAX_CHARACTERS) * 100}
                        className="w-8 h-8 rounded-full"
                      />
                      {remainingChars <= warningThreshold && (
                        <span className={cn(
                          "absolute inset-0 flex items-center justify-center text-xs font-medium",
                          remainingChars < 0 ? "text-red-500" : "text-orange-500"
                        )}>
                          {remainingChars}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="text-white font-medium rounded-full px-8 py-2 h-10 shadow-lg hover:shadow-xl transition-all duration-200"
                style={{ backgroundColor: Palette.accent }}
              >
                {isSubmitting ? 'Posting...' : 'Yap'}
              </Button>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  )
} 