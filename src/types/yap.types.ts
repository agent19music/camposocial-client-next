/**
 * Yap (tweet) related types aligned with backend Yap, Reply, Like models
 * @module yap.types
 */

import type { MinimalUser, UserBadgeDisplay } from './user.types'

// ============================================================================
// Media Types
// ============================================================================

/**
 * Media item attached to yaps or replies
 * Aligned with: models.py YapMedia, YapReplyMedia
 */
export type MediaItem = {
  id: number
  url: string
  type: 'image' | 'video'
}

/**
 * Media upload payload
 */
export type MediaUploadPayload = {
  file: File
  type: 'image' | 'video'
}

/**
 * Media item for upload preview (used in post creation modals)
 */
export type MediaUploadPreview = {
  id: string
  file: File
  preview: string
  type: 'image' | 'video'
}

// ============================================================================
// Reply Types
// ============================================================================

/**
 * Reply to a yap
 * Aligned with: models.py Reply
 */
export type Reply = {
  id: number
  content: string
  created_at: string
  user?: {
    id: string
    username: string
    display_name: string
    avatar: string
  }
  parent_reply_id?: number
  isOptimistic?: boolean
  likes_count?: number
  child_replies_count?: number
  child_replies?: Reply[]
}

/**
 * Reply payload for creating replies
 */
export type ReplyPayload = {
  content: string
  parent_reply_id?: number
}

// ============================================================================
// Yap Types
// ============================================================================

/**
 * Community reference on a yap
 * Note: API may return partial data (only slug, name, icon_image)
 */
export type YapCommunity = {
  id?: string
  name: string
  slug: string
  icon_image?: string
  privacy_type?: string
}

/**
 * Full yap entity
 * Aligned with: models.py Yap
 */
export type Yap = {
  id: string
  content: string
  timestamp: string
  updated_at?: string
  location?: string
  user_id: string
  username: string
  display_name: string
  avatar: string
  // Retweet fields
  original_yap_id?: string
  original_yap?: Yap
  is_retweet?: boolean
  is_quote?: boolean
  // Engagement counts
  replies_count: number
  likes_count: number
  retweets_count: number
  bookmarks_count: number
  // Weighted engagement counts (for ranking)
  weighted_likes_count?: number
  weighted_replies_count?: number
  weighted_retweets_count?: number
  // Related entities
  media: MediaItem[]
  hashtags: string[]
  community?: YapCommunity | null
  replies: Reply[]
  badges?: UserBadgeDisplay[]
  // Poll reference
  poll_id?: string
  // Optimistic update flags
  isOptimistic?: boolean
  optimisticLiked?: boolean
  optimisticLikesCount?: number
  optimisticWeightedLikesCount?: number
  optimisticRepliesCount?: number
  optimisticRetweetsCount?: number
}

/**
 * Yap creation payload
 */
export type YapPayload = {
  content: string
  location?: string
  originalYapId?: string
  mediaFiles?: File[]
  pollId?: string
  communitySlug?: string
}

/**
 * Yap feed type
 */
export type YapFeedType = 'chronological' | 'trending' | 'following'

// ============================================================================
// Hashtag & Location Types
// ============================================================================

/**
 * Hashtag suggestion for autocomplete
 * Aligned with: models.py Hashtag
 */
export type HashtagSuggestion = {
  name: string
  usage_count: number
}

/**
 * Location suggestion for autocomplete
 */
export type LocationSuggestion = {
  name: string
  usage_count: number
}

/**
 * Trending hashtag for display
 */
export type TrendingHashtag = {
  name: string
  count?: number // API sometimes returns this
  usage_count?: number // Server model uses this
  trend_direction?: 'up' | 'down' | 'stable'
}

// ============================================================================
// Like Types
// ============================================================================

/**
 * Like action response
 */
export type LikeResponse = {
  success: boolean
  liked: boolean
  likes_count: number
  weighted_likes_count?: number
}

// ============================================================================
// Bookmark Types
// ============================================================================

/**
 * Bookmark action response
 */
export type BookmarkResponse = {
  success: boolean
  bookmarked: boolean
  bookmarks_count: number
}

// ============================================================================
// User Reply Types (for profile pages)
// ============================================================================

/**
 * User reply with parent yap context for profile display
 */
export type UserReply = {
  id: number
  content: string
  created_at: string
  parent_reply_id?: number
  user: {
    id: string
    username: string
    display_name: string
    avatar: string
  }
  parent_yap: {
    id: string
    content: string
    timestamp: string
    user_id: string
    display_name: string
    username: string
    avatar: string
    replies_count: number
    likes_count: number
    retweets_count: number
    badges?: Array<{ id: number; name: string; image_url: string; is_animated: boolean }>
    media?: Array<{ id: number; url: string; type: string }>
  }
}
