"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { MessageCircle, Repeat2, Heart, Bookmark, Share2 } from "lucide-react"
import { cn } from '@/lib/utils'

export const YapActions = () => {
  const [isLiked, setIsLiked] = React.useState(false)
  const [isBookmarked, setIsBookmarked] = React.useState(false)

  return (
    <div className="flex  gap-4  py-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-primary group"
      >
        <MessageCircle className="w-[18px] h-[18px] group-hover:text-primary" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-green-500 group"
      >
        <Repeat2 className="w-[18px] h-[18px] group-hover:text-green-500" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "group",
          isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
        )}
        onClick={() => setIsLiked(!isLiked)}
      >
        <Heart 
          className={cn(
            "w-[18px] h-[18px]",
            isLiked ? "fill-current" : "group-hover:text-red-500"
          )} 
        />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "group",
          isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
        )}
        onClick={() => setIsBookmarked(!isBookmarked)}
      >
        <Bookmark 
          className={cn(
            "w-[18px] h-[18px]",
            isBookmarked ? "fill-current" : "group-hover:text-primary"
          )} 
        />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-primary group"
      >
        <Share2 className="w-[18px] h-[18px] group-hover:text-primary" />
      </Button>
    </div>
  )
}