"use client"

import React, { useContext, useEffect } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Repeat2, Heart, Share2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from 'next/navigation';
import { YapContext } from '@/context/yapcontext'
import { cn } from '@/lib/utils'
import { MediaGrid } from './yapmediagrid'

const YapCard = ({ display_name, username, content, avatar, media, yap, likes_count, replies_count, retweets }) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = React.useState(false)
  const { navigateToSingleYapView } = useContext(YapContext)

  return (
    <Card 
      className="border-b border-x-0 rounded-none first:border-t-0 hover:bg-gray-50 dark:hover:bg-foreground/10 transition-colors duration-200 hover:cursor-pointer" 
      onClick={() => navigateToSingleYapView(yap, 'spc')}
    >
      <CardHeader className="flex flex-row items-start space-y-0 pb-2 px-4 pt-3">
        <Avatar className="w-10 h-10 mr-3 flex-shrink-0">
          <AvatarImage src={avatar} alt={display_name} />
          <AvatarFallback>{display_name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-[15px] truncate">{display_name}</h3>
            <p className="text-[15px] text-muted-foreground truncate">@{username}</p>
          </div>
          <p className="text-[15px] break-words">{content}</p>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-2 px-4">
        <MediaGrid media={media} />
      </CardContent>

      <CardFooter className="flex justify-between py-2 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-primary group p-2 h-8"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="w-[18px] h-[18px] mr-2 group-hover:text-primary" />
          <span className="text-sm group-hover:text-primary">{replies_count}</span>
        </Button>
        <Button
  variant="ghost"
  size="sm"
  className="text-muted-foreground hover:text-green-500 group p-2 h-8"
  onClick={(e) => e.stopPropagation()}
>
  <Repeat2 className="w-[18px] h-[18px] mr-2 group-hover:text-green-500" />
  <span className="text-sm group-hover:text-green-500">{retweets ? retweets : 0}</span>
</Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "group p-2 h-8",
            isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
        >
          <Heart 
            className={cn(
              "w-[18px] h-[18px] mr-2",
              isLiked ? "fill-current" : "group-hover:text-red-500"
            )} 
          />
          <span className="text-sm group-hover:text-red-500">{likes_count}</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-primary group p-2 h-8"
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className="w-[18px] h-[18px] mr-2 group-hover:text-primary" />
          <span className="text-sm group-hover:text-primary">Share</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default YapCard