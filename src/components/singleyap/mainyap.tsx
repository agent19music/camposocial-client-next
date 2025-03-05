"use client"

import React from 'react'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { YapActions } from './yapactions'
import { YapStats } from './yapstats'
import { MediaGrid } from '../yapmediagrid'
import { Separator } from '../ui/separator'
import { formatDate } from '@/lib/utils'

export const MainYap = ({ yap }) => {
  return (
    <article className="px-4 pt-3 pb-3">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={yap.avatar} />
          <AvatarFallback>{yap.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
            <span className="font-bold text-[15px] leading-5">{yap.display_name}</span>
            <span className="text-muted-foreground text-[15px] leading-5">@{yap.username}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-[17px] whitespace-pre-wrap break-words">
        {yap.content}
      </div>

      {yap.media && (
        <div className="mt-3">
          <MediaGrid media={yap.media} />
        </div>
      )}

      <div className="text-muted-foreground text-[15px] mt-3 border-b border-border pb-3">
        {(yap.timestamp)} · Twitter Web App
      </div>

      {!(yap.replies_count === 0 && yap.retweets_count === 0 && yap.likes_count === 0 && yap.bookmarks_count === 0) && (
  <YapStats 
    replies={yap.replies_count}
    retweets={yap.retweets_count}
    likes={yap.likes_count}
    bookmarks={yap.bookmarks_count}
  />
)}

      <Separator className="my-1" />

      <YapActions />
    </article>
  )
}