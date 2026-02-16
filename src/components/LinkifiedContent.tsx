"use client"

import React from "react"
import { linkifySegments } from "@/lib/linkify"
import { cn } from "@/lib/utils"
import type { LinkifiedContentProps } from "@/types"

export function LinkifiedContent({
  content,
  className,
  linkClassName,
}: LinkifiedContentProps) {
  const segments = linkifySegments(content)

  return (
    <span className={cn("break-words whitespace-pre-wrap", className)}>
      {segments.map((seg, i) =>
        seg.type === "link" && seg.href ? (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-primary hover:underline focus:underline outline-none",
              linkClassName
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {seg.value}
          </a>
        ) : (
          <React.Fragment key={i}>{seg.value}</React.Fragment>
        )
      )}
    </span>
  )
}
