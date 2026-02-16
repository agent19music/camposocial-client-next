/**
 * User-related types aligned with backend Users model
 * @module user.types
 */

// ============================================================================
// Core User Types
// ============================================================================

/**
 * Base user information returned from API
 * Aligned with: models.py Users
 */
export type User = {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  phone_no: string | null
  category: string | null
  avatar: string | null
  display_name: string | null
  bio: string | null
  created_at: string
  updated_at: string
  yap_header_img?: string
  university?: string
  faculty?: string
  course?: string
  engagement_multiplier?: number
  // OAuth fields
  is_oauth_user?: boolean
  profile_completed?: boolean
  // Privacy settings
  who_can_tag?: 'everyone' | 'followers' | 'nobody'
  is_private?: boolean
  // Notification settings
  notify_push?: boolean
  notify_email?: boolean
  notify_messages?: boolean
}

/**
 * Current authenticated user (nullable for logged out state)
 * Extends User with additional computed/client fields
 */
export type CurrentUser = {
  id: string
  first_name: string
  last_name: string
  address: string
  phone_no: string
  email: string
  avatar: string
  is_seller: boolean
  bio: string
  category: string
  username: string
  display_name: string
  yap_header_img?: string
  university?: string
  faculty?: string
  course?: string
} | null

/**
 * Minimal user info for lists and previews
 */
export type MinimalUser = {
  id: string
  username: string
  display_name: string
  avatar: string
}

/**
 * User profile for display on profile pages
 */
export type UserProfile = {
  id: string
  username: string
  display_name: string
  avatar: string
  bio: string | null
  yap_header_img: string | null
  university: string | null
  faculty: string | null
  course: string | null
  followers_count: number
  following_count: number
  yaps_count: number
  is_following?: boolean
  is_follower?: boolean
  badges?: UserBadgeDisplay[]
}

/**
 * Badge displayed on user profile
 */
export type UserBadgeDisplay = {
  id: number
  name: string
  image_url: string
  is_animated: boolean
}

// ============================================================================
// Follow / Following Types
// ============================================================================

/**
 * Follow relationship
 * Aligned with: models.py Follow
 */
export type Follow = {
  id: number
  follower_id: number
  following_id: number
  created_at: string
}

/**
 * Who to follow suggestion
 */
export type WhoToFollowSuggestion = {
  id: string
  username: string
  display_name: string
  avatar: string
  bio?: string
  followers_count?: number
  is_following?: boolean
}

// ============================================================================
// Friendship Types
// ============================================================================

/**
 * Minimal friend info for friend lists
 */
export type MinimalFriend = {
  id: string
  username: string
  firstName: string
  lastName: string
  displayName: string
  avatar: string
  isOnline: boolean
  lastSeen: Date | null
  isCloseFriend: boolean
  friendshipId: number | null
}

/**
 * Friend in friendship context
 */
export type FriendshipFriend = {
  id: string
  username: string
  photoUrl: string
  course?: string
  isOnline: boolean
}

/**
 * Friend request
 */
export type FriendshipFriendRequest = {
  id: string
  username: string
  photoUrl: string
  timestamp: Date
}

// ============================================================================
// Auth Types
// ============================================================================

/**
 * OAuth provider type
 */
export type OAuthProvider = 'google' | 'github' | 'twitter'

/**
 * Registration response
 */
export type RegisterResponse = {
  success: boolean
  message?: string
  requiresVerification?: boolean
}

/**
 * OTP verification response
 */
export type VerifyOTPResponse = {
  success: boolean
  message?: string
}

// ============================================================================
// Profile Page Types
// ============================================================================

/**
 * User data for profile page display
 */
export type ProfilePageUser = {
  id: number
  username: string
  display_name: string
  first_name: string
  last_name: string
  email: string
  bio: string
  avatar: string
  category: string
  phone_no: string
  followers_count?: number
  following_count?: number
  yaps_count?: number
  join_date?: string
  yap_header_img?: string
  badges?: UserBadgeDisplay[]
}

// ============================================================================
// Friend Types
// ============================================================================

/**
 * Friend display type for friend cards
 */
export type Friend = {
  id: string | number
  username?: string
  displayName?: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
  isOnline?: boolean
  mutualFriends?: number
}

/**
 * Friend request with extended fields
 */
export type FriendRequestExtended = MinimalFriend & {
  created_at?: string
  requestTime?: string
  bio?: string
  category?: string
  year?: string
  mutualFriends?: number
  requesterId?: string
  mutualFriendIds?: string[]
}

/**
 * Friend suggestion for discovery
 */
export type FriendSuggestion = {
  id: number | string
  first_name: string
  last_name: string
  username: string
  display_name?: string
  avatar?: string
  bio?: string
  mutualFriends?: number
  category?: string
  reason?: string
  year?: string
  location?: string
}

// ============================================================================
// Settings Types
// ============================================================================

/**
 * User settings
 */
export type UserSettings = {
  notifications: {
    push: boolean
    email: boolean
    messages: boolean
  }
  privacy: {
    who_can_tag: string
    is_private: boolean
  }
}

/**
 * Blocked user
 */
export type BlockedUser = {
  id: number
  username: string
  display_name: string
  avatar: string | null
  blocked_at: string
}
