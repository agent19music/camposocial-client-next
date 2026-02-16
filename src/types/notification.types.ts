/**
 * Notification and WebSocket event types
 * @module notification.types
 */

// ============================================================================
// Notification Count Types
// ============================================================================

/**
 * Notification counts for UI badges
 */
export type NotificationCounts = {
  friend_requests: number
  general_notifications: number
}

/**
 * Yap notification counts
 */
export type YapCounts = {
  new_yaps_count: number
  recent_authors: Array<{
    id: number
    username: string
    avatar: string
    display_name: string
  }>
}

// ============================================================================
// Friend Request Notification Types
// ============================================================================

/**
 * Friend request sender info
 */
export type FriendRequestSender = {
  id: number
  username: string
  first_name: string
  last_name: string
  avatar: string
  display_name: string
}

/**
 * Pending friend request item
 */
export type PendingFriendRequest = {
  id: number
  user: FriendRequestSender
  created_at: string
}

/**
 * Friend request notification from WebSocket
 */
export type FriendRequestNotification = {
  sender: FriendRequestSender
  friendship_id: number
  friend_requests_count: number
  all_pending_requests: PendingFriendRequest[]
  timestamp: string
}

// ============================================================================
// Yap Notification Types
// ============================================================================

/**
 * Yap notification author
 */
export type YapNotificationAuthor = {
  id: number
  username: string
  avatar: string
  display_name: string
}

/**
 * Yap notification from WebSocket
 */
export type YapNotification = {
  yap: {
    id: string
    content: string
  }
  author: YapNotificationAuthor
  new_yaps_count: number
  timestamp: string
}

// ============================================================================
// Conversation/Chat Notifications
// ============================================================================

/**
 * Joinable conversation state
 */
export type JoinableConversation = {
  id: string
  joined: boolean
}

/**
 * Typing indicator event
 */
export type TypingIndicatorEvent = {
  conversationId: string
  userId: string
  isTyping: boolean
}

/**
 * Message received event
 */
export type MessageReceivedEvent = {
  conversationId: string
  message: {
    id: number
    senderId: string
    content: string
    timestamp: string
    encrypted: boolean
  }
}

// ============================================================================
// Enhanced Notification Types
// ============================================================================

/**
 * Notification type enum
 */
export type NotificationType =
  | 'like'
  | 'reply'
  | 'retweet'
  | 'follow'
  | 'mention'
  | 'friend_request'
  | 'friend_accepted'
  | 'message'
  | 'community_invite'
  | 'community_post'
  | 'badge_earned'
  | 'system'

/**
 * Enhanced notification entity
 * Aligned with: models.py EnhancedNotification
 */
export type EnhancedNotification = {
  id: number
  user_id: number
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  is_read: boolean
  created_at: string
  read_at?: string
  // Related entities
  actor_id?: number
  actor?: {
    id: number
    username: string
    display_name: string
    avatar: string
  }
  target_type?: 'yap' | 'reply' | 'community' | 'user'
  target_id?: string
}

// ============================================================================
// Notification Preference Types
// ============================================================================

/**
 * Notification preference settings
 * Aligned with: models.py NotificationPreference
 */
export type NotificationPreference = {
  id: number
  user_id: number
  // Push notification preferences
  push_likes: boolean
  push_replies: boolean
  push_retweets: boolean
  push_follows: boolean
  push_mentions: boolean
  push_messages: boolean
  push_friend_requests: boolean
  // Email notification preferences
  email_digest: boolean
  email_frequency: 'instant' | 'daily' | 'weekly' | 'never'
}

/**
 * Update notification preference payload
 */
export type UpdateNotificationPreferencePayload = Partial<Omit<NotificationPreference, 'id' | 'user_id'>>

// ============================================================================
// Offline Notification Types
// ============================================================================

/**
 * Offline notification (stored for delivery when user comes online)
 * Aligned with: models.py OfflineNotification
 */
export type OfflineNotification = {
  id: number
  user_id: number
  notification_type: NotificationType
  payload: Record<string, unknown>
  created_at: string
}
