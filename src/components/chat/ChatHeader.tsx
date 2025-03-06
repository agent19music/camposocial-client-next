import type React from "react"
import { Phone, VideoIcon, MoreVertical } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FriendProps {
  avatar?: string
  name: string
  isOnline: boolean
}

interface ChatHeaderProps {
  isTyping?: boolean
  friend?: FriendProps
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ isTyping = false, friend }) => {
  return (
    <div className="bg-slate-50/90 dark:bg-slate-800/90 py-4 px-6 flex items-center justify-between backdrop-blur-lg border-b sticky top-0 z-10 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm transition-all duration-200">
            <AvatarImage 
              src={friend?.avatar || "/placeholder.svg?height=48&width=48"} 
              alt={friend?.name || "User"} 
              className="object-cover"
            />
            <AvatarFallback className="text-lg font-medium">{friend?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <span 
            className={cn(
              "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-700 transition-colors duration-200",
              friend?.isOnline ? "bg-green-500" : "bg-gray-400"
            )}
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {friend?.name || "User"}
          </h2>
          <p className={cn(
            "text-sm transition-colors duration-200",
            isTyping ? "text-green-600 dark:text-green-400 font-medium" : 
            friend?.isOnline ? "text-slate-600 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"
          )}>
            {isTyping ? "typing..." : friend?.isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 rounded-full transition-colors duration-200"
          title="Voice call"
        >
          <Phone className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 rounded-full transition-colors duration-200"
          title="Video call"
        >
          <VideoIcon className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 rounded-full transition-colors duration-200"
          title="More options"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export default ChatHeader

