/**
 * Community types aligned with backend Community, CommunityPost, CommunityMember models
 * @module community.types
 */

import type { UserBadgeDisplay } from './user.types'
import type { MediaItem } from './yap.types'

// ============================================================================
// Community Types
// ============================================================================

/**
 * Community privacy type
 */
export type CommunityPrivacyType = 'public' | 'private' | 'secret'

/**
 * Community member role
 */
export type CommunityMemberRole = 'admin' | 'moderator' | 'member'

/**
 * Community category
 */
export type CommunityCategory = 'study' | 'hobby' | 'professional' | 'event_planning' | 'other'

/**
 * Community creator info
 */
export type CommunityCreator = {
  id: number
  username: string
  display_name: string
  avatar: string
}

/**
 * Recent community member preview
 */
export type CommunityMemberPreview = {
  id: number
  username: string
  display_name: string
  avatar: string
}

/**
 * Full community entity
 * Aligned with: models.py Community
 */
export type Community = {
  id: string
  slug: string
  name: string
  description: string
  category: string
  privacy_type: CommunityPrivacyType
  cover_image: string
  icon_image: string
  member_count: number
  university_restriction?: string
  is_verified: boolean
  is_member: boolean
  user_role?: CommunityMemberRole
  created_at: string
  rules?: string
  creator?: CommunityCreator
  recent_members?: CommunityMemberPreview[]
}

/**
 * Minimal community reference (for yaps)
 */
export type CommunitySummary = {
  id: string
  name: string
  slug: string
  privacy_type: string
}

// ============================================================================
// Community Member Types
// ============================================================================

/**
 * Community member
 * Aligned with: models.py CommunityMember
 */
export type CommunityMember = {
  id: number
  user_id: number
  community_id: string
  role: CommunityMemberRole
  joined_at: string
  user: {
    id: number
    username: string
    display_name: string
    avatar: string
  }
}

// ============================================================================
// Community Post Types
// ============================================================================

/**
 * Media attached to community post
 */
export type CommunityPostMedia = {
  id: number
  media_url: string
  media_type: 'image' | 'video'
}

/**
 * Community post author
 */
export type CommunityPostAuthor = {
  id: number
  username: string
  display_name: string
  avatar: string
  badges?: UserBadgeDisplay[]
}

/**
 * Community post
 * Aligned with: models.py CommunityPost (linked to Yap)
 */
export type CommunityPost = {
  id: string
  yap_id: string
  content: string
  location?: string
  is_pinned: boolean
  user: CommunityPostAuthor
  likes_count: number
  replies_count: number
  created_at: string
  media?: CommunityPostMedia[]
  liked_by_user?: boolean
}

/**
 * Community post creation payload
 */
export type CreateCommunityPostPayload = {
  content: string
  location?: string
  media?: File[]
}

// ============================================================================
// Community Invite Types
// ============================================================================

/**
 * Community invite
 * Aligned with: models.py CommunityInvite
 */
export type CommunityInvite = {
  id: string
  token: string
  created_at: string
  expires_at: string | null
  creator_id: number
  url: string
}

/**
 * Create invite options
 */
export type CreateInviteOptions = {
  expiryOption: 'never' | '1day' | '7days' | '30days'
}

// ============================================================================
// Community Creation/Update Types
// ============================================================================

/**
 * Community creation payload
 */
export type CreateCommunityPayload = {
  name: string
  description: string
  category: CommunityCategory
  privacy_type: CommunityPrivacyType
  rules?: string
  university_restriction?: string
  cover_image?: File
  icon_image?: File
}

/**
 * Community update payload
 */
export type UpdateCommunityPayload = Partial<CreateCommunityPayload>
