"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Image from "next/image"
import { cn } from '@/lib/utils'
import { X, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

interface MediaItem {
  id: number;
  type: 'image' | 'video';
  url: string;
}

interface MediaGridProps {
  media: MediaItem[];
  className?: string;
  showInOriginalAspect?: boolean; // New prop to control aspect ratio behavior
  enableFocusView?: boolean; // Enable focus view without navigation
}

export const MediaGrid = ({ 
  media, 
  className, 
  showInOriginalAspect = false, 
  enableFocusView = true 
}: MediaGridProps) => {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null)
  const [imageDimensions, setImageDimensions] = useState<{[key: string]: {width: number, height: number}}>({})

  const mediaCount = media?.length || 0
  const isSingleMedia = mediaCount === 1
  const shouldShowOriginalAspect = showInOriginalAspect && isSingleMedia

  // Load image dimensions for aspect ratio calculation
  useEffect(() => {
    if (!shouldShowOriginalAspect || !media) return;

    const loadImageDimensions = async () => {
      const promises = media
        .filter(item => item.type === 'image')
        .map(item => {
          return new Promise<{url: string, width: number, height: number}>((resolve) => {
            const img = new window.Image()
            img.onload = () => resolve({
              url: item.url,
              width: img.naturalWidth,
              height: img.naturalHeight
            })
            img.onerror = () => resolve({
              url: item.url,
              width: 16,
              height: 9
            })
            img.src = item.url
          })
        })

      const dimensions = await Promise.all(promises)
      const dimensionsMap = dimensions.reduce((acc, {url, width, height}) => {
        acc[url] = {width, height}
        return acc
      }, {} as {[key: string]: {width: number, height: number}})
      
      setImageDimensions(dimensionsMap)
    }

    loadImageDimensions()
  }, [media, shouldShowOriginalAspect])

  const navigateMedia = useCallback((direction: 'prev' | 'next') => {
    if (selectedMediaIndex === null || !media) return
    
    if (direction === 'prev') {
      setSelectedMediaIndex(selectedMediaIndex > 0 ? selectedMediaIndex - 1 : media.length - 1)
    } else {
      setSelectedMediaIndex(selectedMediaIndex < media.length - 1 ? selectedMediaIndex + 1 : 0)
    }
  }, [selectedMediaIndex, media])

  const closeFocusView = useCallback(() => {
    setSelectedMediaIndex(null)
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedMediaIndex === null) return
    
    switch (e.key) {
      case 'Escape':
        closeFocusView()
        break
      case 'ArrowLeft':
        navigateMedia('prev')
        break
      case 'ArrowRight':
        navigateMedia('next')
        break
    }
  }, [selectedMediaIndex, closeFocusView, navigateMedia])

  useEffect(() => {
    if (selectedMediaIndex !== null) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedMediaIndex, handleKeyDown])

  // Early return after all hooks
  if (!media || media.length === 0) return null

  const getGridLayout = () => {
    if (shouldShowOriginalAspect) return 'grid-cols-1'
    
    switch (mediaCount) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-2'
      case 3:
        return 'grid-cols-2'
      case 4:
        return 'grid-cols-2'
      default:
        return 'grid-cols-2'
    }
  }

  const getItemClasses = (index: number, item: MediaItem) => {
    if (shouldShowOriginalAspect && item.type === 'image') {
      const dimensions = imageDimensions[item.url]
      if (dimensions) {
        const aspectRatio = dimensions.width / dimensions.height
        
        // Define some common aspect ratios
        if (Math.abs(aspectRatio - 1) < 0.1) {
          // Square (1:1)
          return 'aspect-square max-h-[400px]'
        } else if (Math.abs(aspectRatio - (16/9)) < 0.1) {
          // Widescreen (16:9)
          return 'aspect-[16/9] max-h-[400px]'
        } else if (Math.abs(aspectRatio - (9/16)) < 0.1) {
          // Portrait (9:16)
          return 'aspect-[9/16] max-h-[600px]'
        } else if (aspectRatio > 1.5) {
          // Wide images
          return 'aspect-[16/9] max-h-[400px]'
        } else if (aspectRatio < 0.7) {
          // Tall images
          return 'aspect-[9/16] max-h-[600px]'
        }
      }
      // Default for single media
      return 'aspect-[4/3] max-h-[400px]'
    }
    
    // Grid layout (multiple media items)
    if (mediaCount === 1) {
      return 'col-span-2 aspect-[16/9] max-h-[400px]'
    }
    if (mediaCount === 2) {
      return 'aspect-square'
    }
    if (mediaCount === 3) {
      if (index === 0) {
        return 'row-span-2 aspect-[4/5]'
      }
      return 'aspect-square'
    }
    if (mediaCount === 4) {
      return 'aspect-square'
    }
    return 'aspect-square'
  }

  const openFocusView = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (enableFocusView) {
      setSelectedMediaIndex(index)
    }
  }

  const MediaOverlay = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {children}
    </div>
  )

  const FocusView = () => {
    if (selectedMediaIndex === null || !media) return null
    
    const selectedMedia = media[selectedMediaIndex]

    return (
      <div 
        className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
        onClick={closeFocusView}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white z-10">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedMediaIndex + 1} / {media.length}
            </span>
          </div>
          <button
            className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={closeFocusView}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-3 rounded-full hover:bg-white/10 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                navigateMedia('prev')
              }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-3 rounded-full hover:bg-white/10 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                navigateMedia('next')
              }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}
        
        {/* Media content */}
        <div 
          className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {selectedMedia.type === 'image' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image 
                src={selectedMedia.url}
                alt="Focus view media"
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                sizes="90vw"
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : selectedMedia.url ? (
            <video 
              controls 
              autoPlay
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.warn('Focus view video failed to load:', selectedMedia.url);
                (e.target as HTMLVideoElement).style.display = 'none';
              }}
            >
              <source src={selectedMedia.url} type="video/mp4" />
              <source src={selectedMedia.url} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 right-4 text-white text-center">
          <p className="text-sm opacity-75">
            Press ESC to close {media.length > 1 && '• Use arrow keys to navigate'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={cn(
        "grid gap-[2px] rounded-2xl overflow-hidden border border-border",
        getGridLayout(),
        shouldShowOriginalAspect ? "max-w-full" : "max-w-[520px]",
        className
      )}>
        {media.map((item, index) => (
          <div 
            key={`${item.type}-${item.id}-${index}`} 
            className={cn(
              "relative bg-muted cursor-pointer group overflow-hidden",
              getItemClasses(index, item)
            )}
            onClick={(e) => openFocusView(index, e)}
          >
            {item.type === 'image' ? (
              <>
                <Image 
                  src={item.url} 
                  alt={`Media ${index + 1}`} 
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes={shouldShowOriginalAspect ? "100vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                />
                {enableFocusView && (
                  <MediaOverlay>
                    <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white rounded-full" />
                    </div>
                  </MediaOverlay>
                )}
              </>
            ) : item.url ? (
              <>
                <video 
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  poster={item.url.replace(/\.[^/.]+$/, '.jpg')}
                  onError={(e) => {
                    console.warn('Video failed to load:', item.url);
                    (e.target as HTMLVideoElement).style.display = 'none';
                  }}
                >
                  <source src={item.url} type="video/mp4" />
                  <source src={item.url} type="video/webm" />
                </video>
                {enableFocusView && (
                  <MediaOverlay>
                    <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                    </div>
                  </MediaOverlay>
                )}
              </>
            ) : null}
            
            {/* Media count indicator for multiple items */}
            {!shouldShowOriginalAspect && mediaCount > 4 && index === 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  +{mediaCount - 4}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <FocusView />
    </>
  )
}