"use client"

import React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { LinkPreviewData } from "@/hooks/useLinkPreviews"
import { LinkPreviewCardProps } from '@/types'

export function LinkPreviewCard({ preview, className, onClick }: LinkPreviewCardProps) {
  const { type, url, title, description, image_url, site_name, html, thumbnail_url } = preview
  const image = image_url || thumbnail_url

  if (type === "spotify" && html) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border overflow-hidden bg-muted/30 mt-2",
          className
        )}
        onClick={onClick}
        role={onClick ? "button" : undefined}
      >
        <div
          className="[&>iframe]:w-full [&>iframe]:max-h-[152px] [&>iframe]:border-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {title && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2 text-sm font-medium text-foreground hover:underline truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {title}
          </a>
        )}
      </div>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex rounded-xl border border-border overflow-hidden bg-card hover:bg-card/90 transition-colors mt-2",
        className
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
    >
      {image && (
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-muted">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            sizes="112px"
            unoptimized
          />
        </div>
      )}
      <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
        {site_name && (
          <span className="text-xs text-muted-foreground uppercase tracking-wide truncate">
            {site_name}
          </span>
        )}
        {title && (
          <span className="text-sm font-medium text-foreground line-clamp-2 mt-0.5">
            {title}
          </span>
        )}
        {description && (
          <span className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {description}
          </span>
        )}
      </div>
    </a>
  )
}
