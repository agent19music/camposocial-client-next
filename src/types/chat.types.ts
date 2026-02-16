/**
 * Chat/Messaging types aligned with backend Message, Conversation models
 * @module chat.types
 */

// ============================================================================
// Message Types
// ============================================================================

/**
 * Chat media attachment
 * Aligned with: models.py MessageMedia
 */
export type ChatMedia = {
  url: string
  type: string
}

/**
 * Message reaction
 * Aligned with: models.py Reaction
 */
export type MessageReaction = {
  userId: string
  reactionType: string
}

/**
 * Reply reference in a message
 */
export type MessageReplyRef = {
  id: string | number
  content: string
  senderName: string
}

/**
 * Chat message
 * Aligned with: models.py Message
 */
export type ChatMessage = {
  id: number
  senderId: string
  content: string
  // E2EE fields
  ciphertext?: string | null
  nonce?: string
  senderPublicKey?: string | null
  // Timestamps
  timestamp: Date
  // Attachments
  media: ChatMedia[] | null
  reactions: MessageReaction[]
  replyTo?: MessageReplyRef | number
  // Status flags
  isSent: boolean
  isRead: boolean
  encrypted: boolean
  isEdited?: boolean
  isDeleted?: boolean
}

/**
 * Chat media for message bubble display
 */
export type BubbleMedia = {
  url: string
  type: 'image' | 'video' | 'file'
  name?: string
}

/**
 * Message for MessageBubble component
 * Extended from ChatMessage with optional fields for UI rendering
 */
export type BubbleMessage = {
  id: number | string
  senderId: string
  content: string
  timestamp: Date
  isSent?: boolean
  isDelivered?: boolean
  isRead?: boolean
  isEdited?: boolean
  isDeleted?: boolean
  encrypted?: boolean
  reactions?: Array<{ userId: string; reactionType: string }>
  replyTo?: {
    id: string | number
    content: string
    senderName: string
  }
  media?: BubbleMedia[]
}

/**
 * Simple message type for state management
 */
export type Message = {
  id: string
  content: string
  senderId: string
  recipientId: string
  timestamp: string
}

/**
 * Message state for reducers
 */
export type MessageState = {
  messages: Message[]
  isLoading: boolean
  error: string | null
  currentConversation: string | null
  onlineStatus: Record<string, { online: boolean; lastActive: string }>
  hasMoreMessages: boolean
  page: number
}

/**
 * Send message payload
 */
export type SendMessagePayload = {
  content: string
  recipientId: string
  conversationId: string
}

// ============================================================================
// Conversation Types
// ============================================================================

/**
 * Conversation entity
 * Aligned with: models.py Conversation
 */
export type ChatConversation = {
  id: string
  friendId: string
  friendName: string
  friendAvatar: string
  lastMessage: string | null
  lastMessageEncrypted?: boolean
  lastMessageTime: Date | null
  unreadCount: number
  isEmpty: boolean
  isOnline: boolean
}

// ============================================================================
// Chat User Types
// ============================================================================

/**
 * User in chat context
 */
export type ChatUser = {
  id: string
  firstName: string
  lastName: string
  email: string
}

/**
 * Friend in chat list
 */
export type ChatFriend = {
  id: string
  username: string
  firstName: string
  lastName: string
  avatar: string
  displayName: string
  isOnline: boolean
  lastSeen: Date | null
  isCloseFriend: boolean
  friendshipId: number
  conversationId: string | null
  unreadCount: number
  mutualFriends: number
  category: string
  bio: string
  messagePreview: string | null
  messageTime: Date
}

/**
 * User in chat list display
 */
export type ChatListUser = {
  id: string
  firstName: string
  lastName: string
  avatar: string
  isCloseFriend: boolean
}

// ============================================================================
// E2EE / Encryption Types
// ============================================================================

/**
 * Key generation/storage status
 */
export type KeyStatus = 'generating' | 'available' | 'unavailable' | 'locked'

/**
 * Cryptographic key pair
 */
export type KeyPair = {
  publicKey: string
  secretKey: string
}

/**
 * Encrypted payload for messages
 */
export type EncryptedPayload = {
  ciphertext: string
  nonce: string
}

/**
 * Stored key data in IndexedDB
 */
export type StoredKeyData = {
  id: string  // Always 'user_keys'
  publicKey: string
  encryptedSecretKey: string  // Base64 encoded
  salt: string  // Base64 encoded
  iv: string    // Base64 encoded
}

/**
 * Server backup data response for key recovery
 */
export type ServerBackupData = {
  encrypted_private_key: string
  key_salt: string
  key_iv: string
  has_backup: boolean
  created_at?: string
  updated_at?: string
}

// ============================================================================
// Device Types (Multi-device E2EE)
// ============================================================================

/**
 * Device info for multi-device support
 * Aligned with: models.py UserDevice
 */
export type DeviceInfo = {
  id: string
  deviceId: string
  deviceName: string
  deviceType: string
  publicKey: string
  isActive: boolean
  lastActive: string
  createdAt: string
}

/**
 * Device keys API response
 */
export type DeviceKeysResponse = {
  devices: DeviceInfo[]
  currentDeviceId: string
}

// ============================================================================
// Offline/Cache Types
// ============================================================================

/**
 * Cached message in IndexedDB
 */
export type CachedMessage = {
  id: number
  conversationId: string
  senderId: string
  content: string
  ciphertext?: string
  nonce?: string
  timestamp: Date
  media: ChatMedia[] | null
  isRead: boolean
  cachedAt: Date
}

/**
 * Cached conversation in IndexedDB
 */
export type CachedConversation = {
  id: string
  friendId: string
  friendName: string
  friendAvatar: string
  lastMessage: string | null
  lastMessageTime: Date | null
  unreadCount: number
  cachedAt: Date
}

/**
 * Pending message for offline queue
 */
export type PendingMessage = {
  id: string
  conversationId: string
  content: string
  media: ChatMedia[] | null
  replyTo?: number
  createdAt: Date
  retryCount: number
}

/**
 * Decrypted preview cache
 */
export type CachedConversationPreview = {
  conversationId: string
  decryptedPreview: string
  cachedAt: Date
}

// ============================================================================
// Online Status Types
// ============================================================================

/**
 * Online status event from WebSocket
 */
export type OnlineStatusEvent = {
  userId: string
  lastActive: string
}

/**
 * Custom message event from WebSocket
 */
export type CustomMessageEvent = {
  message: Message
}
