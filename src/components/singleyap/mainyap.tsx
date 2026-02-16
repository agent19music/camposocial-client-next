"use client"

import React, { useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { YapActions } from './yapactions'
import { YapStats } from './yapstats'
import { MediaGrid } from '../yapmediagrid'
import { Separator } from '../ui/separator'
import { YapContext } from '@/context/yapcontext'
import Image from 'next/image'
import BadgeDisplay from '../badgedisplay'

import { LinkifiedContent } from '@/components/LinkifiedContent'
import { Users } from 'lucide-react'

export const MainYap = () => {
  const { selectedYap } = useContext(YapContext)
  console.log( "selectedYap", selectedYap);
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
      {selectedYap?.community && (
        <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm">
          <Users className="w-4 h-4" />
          <span>
            in <span
              className="font-medium hover:underline cursor-pointer text-primary"
              onClick={() => router.push(`/yaps/communities/${selectedYap.community?.slug}`)}
            >
              {selectedYap.community.name}
            </span>
          </span>
        </div>
      )}
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
              className="font-bold text-[15px] leading-5 cursor-pointer hover:underline inline-flex items-center gap-2"
              onClick={handleUserClick}
            >
              {selectedYap?.display_name}
              {selectedYap?.badges && selectedYap.badges.length > 0 && (
                <BadgeDisplay badges={selectedYap.badges} size="sm" />
              )}
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

      <div className="mt-3 text-[17px]">
        <LinkifiedContent content={selectedYap?.content ?? ''} linkClassName="text-primary hover:underline" />
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

      {/* Render quoted/original yap if this is a quote tweet */}
      {selectedYap?.is_quote && selectedYap?.original_yap && (
        <div
          className="mt-3 border border-border rounded-xl p-3 hover:bg-accent/50 transition-colors cursor-pointer"
          onClick={() => router.push(`/yaps/profile/${selectedYap.original_yap?.username}`)}
        >
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={selectedYap.original_yap.avatar} />
              <AvatarFallback className="text-xs font-semibold">
                {selectedYap.original_yap.display_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="font-bold text-sm">{selectedYap.original_yap.display_name}</span>
            {selectedYap.original_yap.badges && selectedYap.original_yap.badges.length > 0 && (
              <BadgeDisplay badges={selectedYap.original_yap.badges} size="sm" />
            )}
            <span className="text-muted-foreground text-sm">@{selectedYap.original_yap.username}</span>
          </div>
          <p className="mt-2 text-sm whitespace-pre-wrap break-words">
            {selectedYap.original_yap.content}
          </p>
          {selectedYap.original_yap.media && selectedYap.original_yap.media.length > 0 && (
            <div className="mt-2">
              <MediaGrid
                media={selectedYap.original_yap.media}
                showInOriginalAspect={false}
                enableFocusView={true}
              />
            </div>
          )}
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