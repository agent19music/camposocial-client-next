"use client"

import React, { useContext } from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { YapActions } from './yapactions'
import { YapStats } from './yapstats'
import { MediaGrid } from '../yapmediagrid'
import { Separator } from '../ui/separator'
import { formatDate } from '@/lib/utils'
import { YapContext } from '@/context/yapcontext'

export const MainYap = () => {
  const {selectedYap} = useContext(YapContext)
  return (
    <article className="px-4 pt-3 pb-3">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={selectedYap?.avatar} />
          <AvatarFallback>{selectedYap?.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <span className="font-bold text-[15px] leading-5">{selectedYap?.display_name}</span>
            <span className="text-muted-foreground text-[15px] leading-5">@{selectedYap?.username}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-[17px] whitespace-pre-wrap break-words">
        {selectedYap?.content}
      </div>

      {selectedYap?.media && (
        <div className="mt-3">
          <MediaGrid media={selectedYap?.media} />
        </div>
      )}

      <div className="text-muted-foreground text-[15px] mt-3 border-b border-border pb-3">
        {(selectedYap?.timestamp)} · Twitter Web App
      </div>

      {!(selectedYap?.replies_count === 0 && selectedYap?.retweets_count === 0 && selectedYap?.likes_count === 0 && selectedYap?.bookmarks_count === 0) && (
  <YapStats 
    replies={selectedYap?.replies_count || 0}
    retweets={selectedYap?.retweets_count || 0}
    likes={selectedYap?.likes_count || 0}
    bookmarks={selectedYap?.bookmarks_count || 0}
  />
)}

      <Separator className="my-1" />

      <YapActions />
    </article>
  )
}