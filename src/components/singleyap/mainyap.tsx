"use client"

import React, { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { YapActions } from './yapactions'
import { YapStats } from './yapstats'
import { MediaGrid } from '../yapmediagrid'
import { Separator } from '../ui/separator'
import { formatDate } from '@/lib/utils'
import { YapContext } from '@/context/yapcontext'
import Image from 'next/image'

export const MainYap = () => {
  const {selectedYap} = useContext(YapContext)
  const router = useRouter()
  
  if (!selectedYap) {
    return <div className="px-4 py-3 text-center text-muted-foreground">No yap selected</div>
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const handleUserClick = () => {
    router.push(`/yaps/profile/${selectedYap?.username}`);
  };

  return (
    <article className="px-4 pt-3 pb-3">
      <div className="flex gap-3">
        <Avatar 
          className="w-10 h-10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleUserClick}
        >
          <AvatarImage src={selectedYap?.avatar} />
          <AvatarFallback className="text-sm font-semibold">
            {selectedYap?.display_name?.[0]?.toUpperCase() || selectedYap?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <span 
              className="font-bold text-[15px] leading-5 cursor-pointer hover:underline"
              onClick={handleUserClick}
            >
              {selectedYap?.display_name}
            </span>
            <span 
              className="text-muted-foreground text-[15px] leading-5 cursor-pointer hover:underline"
              onClick={handleUserClick}
            >
              @{selectedYap?.username}
              {selectedYap?.username === "ufwsean" && (
                <Image
                  src="https://pub-c6a134c8e1fd4881a475bf80bc0717ba.r2.dev/twitter-verified-badge-gold-seeklogo.png"
                  alt="Verified"
                  className="inline-block ml-1 w-4 h-4 align-text-bottom"
                  width={16}
                  height={16}
                />
              )}
            </span>
          </div>  
        </div>
      </div>
      
      <div className="mt-3 text-[17px] whitespace-pre-wrap break-words">
        {selectedYap?.content}
      </div>

      {selectedYap?.media && selectedYap?.media.length > 0 && (
        <div className="mt-3">
          <MediaGrid 
            media={selectedYap?.media} 
            showInOriginalAspect={false}
            enableFocusView={true}
          />
        </div>
      )}

      <div className="text-muted-foreground text-[15px] mt-3 border-b border-border pb-3">
        {formatTimestamp(selectedYap?.timestamp)} · CampoSocial Web App
      </div>

      {!(selectedYap?.replies_count === 0 && selectedYap?.retweets_count === 0 && selectedYap?.likes_count === 0 && selectedYap?.bookmarks_count === 0) && (
        <YapStats 
          replies={(selectedYap?.optimisticRepliesCount ?? selectedYap?.replies_count) || 0}
          retweets={(selectedYap?.optimisticRetweetsCount ?? selectedYap?.retweets_count) || 0}
          likes={(selectedYap?.optimisticLikesCount ?? selectedYap?.likes_count) || 0}
          bookmarks={selectedYap?.bookmarks_count || 0}
        />
      )}

      <Separator className="my-1" />

      <YapActions />
    </article>
  )
}