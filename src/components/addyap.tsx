"use client"

import { useState } from "react"
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
  MinusIcon
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useContext } from "react"
import { YapContext } from "@/context/yapcontext"
import { AuthContext } from "@/context/authcontext"

export default function AddYap() {
  const [open, setOpen] = useState(false)
  const [yapContent, setYapContent] = useState("")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isPollMode, setIsPollMode] = useState(false)
  const [pollOptions, setPollOptions] = useState(["", ""])
  const [pollDuration, setPollDuration] = useState("1 day")
  const [location, setLocation] = useState("")


  const {postYap} = useContext(YapContext)

  interface YapPayload {
    content: string;
    location?: string;
    originalYapId?: number; // Optional: for retweets
    mediaFiles?: File[];    // Optional: images or videos
  }

  let payload = {
    content: yapContent,
    mediaFiles : mediaFiles,
    location: location,
  }

  console.log(payload);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMediaFiles(Array.from(event.target.files))
    }
  }

  const {currentUser} = useContext(AuthContext)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      content: yapContent,
      mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
      location: location || undefined,
    };

    console.log(payload);
    

    try {
      await postYap(payload); // Call your postYap function
      resetForm(); // Reset form after successful submission
      setOpen(false); // Close the dialog
    } catch (error) {
      console.error('Failed to post Yap:', error);
    }
  };

  const handlePolls = (event: React.FormEvent) => {
    event.preventDefault()
    if (isPollMode) {
      console.log("Poll content:", yapContent)
      console.log("Poll options:", pollOptions)
      console.log("Poll duration:", pollDuration)
    } else {
      console.log("Yap content:", yapContent)
      console.log("Media files:", mediaFiles)
    }
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setYapContent("")
    setMediaFiles([])
    setIsPollMode(false)
    setPollOptions(["", ""])
    setPollDuration("1 day")
  }

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""])
    }
  }

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index)
      setPollOptions(newOptions)
    }
  }

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button  className="rounded-md">Add Yap</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Compose Yap</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={currentUser?.avatarUrl || "/placeholder-avatar.jpg"} alt={`@${currentUser?.username || "username"}`} />
              <AvatarFallback>{currentUser?.username ? currentUser.username[0].toUpperCase() : "UN"}</AvatarFallback>
            </Avatar>
            <Textarea
              id="yap"
              value={yapContent}
              onChange={(e) => setYapContent(e.target.value)}
              placeholder={isPollMode ? "Ask a question..." : "What's happening?"}
              className="flex-1 resize-none dark:bg-foreground/10"
            />
          </div>
          {isPollMode ? (
            <div className="space-y-2">
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {index > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePollOption(index)}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {pollOptions.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPollOption}
                  className="mt-2"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
              <Select value={pollDuration} onValueChange={setPollDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Poll duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 day">1 day</SelectItem>
                  <SelectItem value="3 days">3 days</SelectItem>
                  <SelectItem value="1 week">1 week</SelectItem>
                  <SelectItem value="1 month">1 month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            mediaFiles.length > 0 && (
              <div className="grid gap-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="text-sm text-gray-500">
                    {file.name}
                  </div>
                ))}
              </div>
            )
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsPollMode(!isPollMode)}
              className={isPollMode ? "text-blue-500" : "text-gray-500"}
            >
              <BarChartIcon className="h-5 w-5" />
            </Button>
            {!isPollMode && (
              <>
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <label htmlFor="video-upload" className="cursor-pointer">
                  <VideoIcon className="h-5 w-5 text-blue-500" />
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </>
            )}
            <SmileIcon className="h-5 w-5 text-blue-500" />
            <MapPinIcon className="h-5 w-5 text-blue-500" />
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            <Button type="submit" className="ml-auto rounded-full">
              Yap
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}