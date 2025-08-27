"use client"

import React from 'react'
import Image from "next/image"
import { cn } from '@/lib/utils'

interface MediaItem {
  id: number;
    type: 'image' | 'video';
  url: string;
}

export const MediaGrid = ({ media }: { media: MediaItem[] }) => {
  const [images, videos] = React.useMemo(() => {
    if (!media) return [[], []]
    return [
      media.filter(item => item.type === 'image'),
      media.filter(item => item.type === 'video')
    ]
  }, [media])

  const mediaCount = (images?.length || 0) + (videos?.length || 0)
  if (mediaCount === 0) return null

  return (
    <div className={cn(
      "grid gap-[2px] rounded-xl overflow-hidden max-w-[520px]",
      {
        'grid-cols-1': mediaCount === 1,
        'grid-cols-2': mediaCount === 2,
        'grid-cols-3': mediaCount === 3,
        'grid-cols-4': mediaCount === 4,
        'h-[260px] sm:h-[286px]': mediaCount <= 2,
        'h-[300px] sm:h-[346px]': mediaCount > 2,
      }
    )}>
      {images?.map((image, index) => {
        const isFirstImage = index === 0
        const isLargeImage = mediaCount === 3 && isFirstImage
        const aspectRatio = isLargeImage ? 'aspect-[1.91/2]' : 'aspect-square'
        
        return (
          <div 
            key={`image-${index}`} 
            className={cn(
              "relative bg-neutral-100",
              {
                'row-span-2': isLargeImage,
                'col-span-2': mediaCount === 1,
              }
            )}
          >
            <div className={cn(
              "relative w-full h-full",
              aspectRatio
            )}>
              <Image 
                src={image.url} 
                alt={`Media ${index + 1}`} 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        )
      })}
      {videos?.map((video, index) => (
        <div 
          key={`video-${index}`} 
          className={cn(
            "relative bg-neutral-100",
            { 'col-span-2': mediaCount === 1 }
          )}
        >
          <div className="relative aspect-square w-full h-full">
            <video 
              controls 
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={video.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      ))}
    </div>
  )
}