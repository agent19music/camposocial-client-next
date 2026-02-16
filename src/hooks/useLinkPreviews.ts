"use client"

import { useState, useEffect, useRef } from "react"
import type { LinkPreviewData } from "@/types"

export type { LinkPreviewData }

const cache = new Map<string, LinkPreviewData | null>()

export function useLinkPreviews(
  urls: string[],
  apiEndpoint: string | undefined
): Record<string, LinkPreviewData | null> {
  const [previews, setPreviews] = useState<Record<string, LinkPreviewData | null>>({})
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    if (!urls.length || !apiEndpoint) {
      setPreviews({})
      return
    }
    const fetchAll = async () => {
      const result: Record<string, LinkPreviewData | null> = {}
      await Promise.all(
        urls.slice(0, 2).map(async (url) => {
          const cached = cache.get(url)
          if (cached !== undefined) {
            result[url] = cached
            return
          }
          try {
            const res = await fetch(
              `${apiEndpoint}/link-preview?url=${encodeURIComponent(url)}`,
              { credentials: "include" }
            )
            if (res.ok) {
              const data = (await res.json()) as LinkPreviewData
              cache.set(url, data)
              result[url] = data
            } else {
              cache.set(url, null)
              result[url] = null
            }
          } catch {
            cache.set(url, null)
            result[url] = null
          }
        })
      )
      if (mounted.current) setPreviews(result)
    }
    fetchAll()
    return () => {
      mounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join(","), apiEndpoint])

  return previews
}
