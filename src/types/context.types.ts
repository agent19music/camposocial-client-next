/**
 * React Context type definitions
 * These are React-specific and may not be included in npm package
 * @module context.types
 */

import type { ReactNode, Dispatch, SetStateAction } from 'react'

// Socket type - using unknown to avoid socket.io-client import issues
type Socket = unknown

// Import entity types
import type {
  CurrentUser,
  MinimalFriend,
  FriendshipFriend,
  FriendshipFriendRequest,
  FriendRequestExtended,
} from './user.types'
import type {
  Yap,
  Reply,
  YapPayload,
  YapFeedType,
  HashtagSuggestion,
  LocationSuggestion,
} from './yap.types'
import type {
  ChatMessage,
  ChatConversation,
  ChatFriend,
  ChatUser,
  ChatListUser,
  ChatMedia,
  KeyStatus,
} from './chat.types'
import type {
  Community,
  CommunityPost,
  CommunityInvite,
} from './community.types'
import type {
  AppEvent,
  AddEventPayload,
  EventComment,
  EventCommentPayload,
} from './event.types'
import type {
  Product,
  Seller,
} from './marketplace.types'
import type {
  Poll,
  PollOption,
  CreatePollPayload,
} from './poll.types'
import type {
  NotificationCounts,
  YapCounts,
  FriendRequestNotification,
  YapNotification,
  PendingFriendRequest,
} from './notification.types'
import type { WhoToFollowSuggestion } from './user.types'

// ============================================================================
// Auth Context
// ============================================================================

export type AuthContextType = {
  login: (username: string, password: string, apiEndpoint: string) => void
  socialLogin: (provider: string, data: unknown) => Promise<{ success: boolean }>
  completeProfile: (profileData: unknown) => Promise<void>
  logout: () => void
  currentUser: CurrentUser
  authToken: string | null
  updateUserContext: () => void
  onAuthChange: boolean
  isProfileComplete: boolean
  isAuthenticated: boolean
  isLoading: boolean
  showSocialModal: boolean
  setShowSocialModal: (show: boolean) => void
  sellerlogin: (email: string, password: string) => Promise<void>
  // New auth methods
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean }>
  sendOTP: (email: string) => Promise<{ success: boolean; message?: string }>
  verifyOTP: (email: string, code: string, password?: string) => Promise<{ success: boolean; message?: string }>
  oauthLogin: (provider: string, data: unknown) => Promise<{ success: boolean }>
  oauthSignup: (provider: string, data: unknown) => Promise<{ success: boolean }>
}

export type AuthProviderProps = {
  children: ReactNode
  initialAuthToken?: string | null
}

// ============================================================================
// Auth Modal Context
// ============================================================================

export type AuthModalContextType = {
  isOpen: boolean
  message?: string
  openAuthModal: (message?: string) => void
  closeAuthModal: () => void
}

// ============================================================================
// Chat Context
// ============================================================================

export type ChatContextType = {
  sendMessage: (content: string, media: FileList | null, replyTo?: number) => Promise<void>
  getMessages: (friendId: string, batchSize: number, lastMessageId?: number) => Promise<ChatMessage[]>
  editMessage: (messageId: number, newContent: string) => Promise<void>
  deleteMessage: (messageId: number) => Promise<void>
  addReaction: (messageId: number, reactionType: string) => Promise<void>
  uploadMedia: (files: FileList) => Promise<ChatMedia[]>
  authToken: string | null
  friendId: string | null
  setFriendId: (friendId: string | null) => void
  messages: ChatMessage[]
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>
  getChatList: () => Promise<ChatListUser[]>
  chatList: ChatListUser[] | undefined
  generateKeys: (password?: string) => Promise<{ publicKey: string; secretKey: string } | null>
  unlockKeys: (password: string) => Promise<boolean>
  loadKeys: (password?: string) => Promise<void>
  exportPublicKey: () => Promise<string | null>
  keyStatus: KeyStatus
  fetchConversations: () => Promise<ChatConversation[]>
  checkIfConversationExists: (friendId: string) => Promise<boolean>
  conversations: ChatConversation[]
  getFriendDetails: (friendId: string) => Promise<{ name: string; avatar: string; isOnline: boolean } | null>
  friendDetails: ChatFriend | null
  currentUser: ChatUser | null
  sendTypingIndicator: (isTyping: boolean) => void
  isTyping: boolean
  isConnected: boolean
  ensureConversation: (friendId: string) => Promise<string | null>
  currentConversationId: string | null
}

export type ChatProviderProps = {
  children: ReactNode
}

// ============================================================================
// Community Context
// ============================================================================

export type CommunityContextType = {
  // State
  communities: Community[]
  myCommunities: Community[]
  recommendedCommunities: Community[]
  trendingCommunities: Community[]
  currentCommunity: Community | null
  communityPosts: CommunityPost[]
  loading: boolean
  postsLoading: boolean
  // Methods
  fetchCommunities: () => Promise<void>
  fetchMyCommunities: () => Promise<void>
  fetchCommunityBySlug: (slug: string) => Promise<Community | null>
  createCommunity: (data: unknown) => Promise<Community | null>
  updateCommunity: (slug: string, data: unknown) => Promise<boolean>
  joinCommunity: (slug: string) => Promise<boolean>
  leaveCommunity: (slug: string) => Promise<boolean>
  createPost: (slug: string, content: string, location?: string) => Promise<boolean>
  createPostOptimistic: (slug: string, postData: { content: string; media?: File[]; location?: string }, currentUser: unknown) => Promise<boolean>
  toggleLike: (yapId: string) => Promise<void>
  replyToPost: (yapId: string, content: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
  fetchPosts: (slug: string, page?: number) => Promise<void>
  setCurrentCommunity: (community: Community | null) => void
  createInvite: (slug: string, expiryOption: string) => Promise<unknown>
  getInvites: (slug: string) => Promise<CommunityInvite[]>
  revokeInvite: (token: string) => Promise<boolean>
  transferOwnership: (communityId: string, newOwnerId: number) => Promise<boolean>
}

// ============================================================================
// Event Context
// ============================================================================

export type EventContextType = {
  events: AppEvent[]
  setCategory: (category: string) => void
  isLoading: boolean
  onchange: boolean
  setOnchange: (value: boolean) => void
  navigateToSingleEventView: (event: AppEvent) => void
  selectedEvent: AppEvent | null
  addEvent: (event: AddEventPayload) => Promise<boolean>
  updateEvent: (eventId: string, event: AddEventPayload) => Promise<boolean>
  deleteEvent: (eventId: string) => Promise<boolean>
  toggleCommentLike: (commentId: number, eventId: string) => Promise<void>
  addCommentReply: (eventId: string, payload: EventCommentPayload) => Promise<EventComment | null>
  refreshEvents: () => Promise<void>
}

// Legacy alias
export type EventContextProps = EventContextType

export type EventProviderProps = {
  children: ReactNode
}

// ============================================================================
// Friendship Context
// ============================================================================

export type FriendshipContextType = {
  sendFriendRequest: (recipientId: string) => Promise<void>
  acceptFriendRequest: (requesterId: string) => Promise<void>
  rejectFriendRequest: (requesterId: string) => Promise<void>
  blockUser: (userId: string) => Promise<void>
  unfriend: (friendId: string) => Promise<void>
  getFriendRequests: () => Promise<void>
  pendingRequests: FriendshipFriendRequest[]
  friends: FriendshipFriend[]
}

// ============================================================================
// Marketplace Context
// ============================================================================

export type MarketplaceContextType = {
  products: Product[]
  isLoading: boolean
  onchange: boolean
  isPayed: boolean
  setOnchange: (value: boolean) => void
  setIsPayed: (value: boolean) => void
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  navigateToSingleProductView: (product: Product) => void
  navigateToSingleSellerView: (seller: Seller) => void
  setSelectedSeller: (seller: Seller | null) => void
  selectedSeller: Seller | null
  updateCart: boolean
  setUpdateCart: (value: boolean) => void
  getLatestOrderId: () => Promise<number | null>
  setOrderId: (value: string | null) => void
  orderId: string | null
  sellerStatusChange: boolean
  setSellerStausChange: (value: boolean) => void
  addToCart: (productId: string, quantity?: number, variationId?: string) => Promise<unknown>
  deslugify: (slug: string) => string
  // Wishlist
  wishlistIds: string[]
  toggleWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
}

// Legacy alias
export type MarketplaceContextProps = MarketplaceContextType

export type MarketplaceProviderProps = {
  children: ReactNode
}

// ============================================================================
// Poll Context
// ============================================================================

export type PollContextType = {
  createPoll: (data: CreatePollPayload) => Promise<{ success: boolean; poll?: Poll; error?: string }>
  vote: (pollId: string, optionId: number) => Promise<{ success: boolean; results?: PollOption[]; error?: string }>
  getPollDetails: (pollId: string) => Promise<Poll | null>
  getPolls: (groupId?: string, activeOnly?: boolean) => Promise<Poll[]>
  getTrendingPolls: () => Promise<Poll[]>
}

// Legacy alias
export type PollContextProps = PollContextType

// ============================================================================
// Theme Context
// ============================================================================

export type Theme = 'light' | 'dark'

export type ThemeContextType = {
  theme: Theme
  toggleTheme: () => void
}

// ============================================================================
// User Context
// ============================================================================

export type UserContextType = {
  user: unknown[]
  users: unknown[]
  sendFriendRequest: (receipientId: string) => void
  receivedRequests: FriendRequestExtended[]
  setReceivedRequests: (receivedRequests: FriendRequestExtended[]) => void
  removeFriend: (friendId: string) => void
  addFriend: (requestId: string) => void
  blockUser: (targetId: string, action: 'block' | 'unblock') => void
  setUsers: (users: unknown[]) => void
  setFilteredUsers: (users: unknown[]) => void
  onchange: (onchange: boolean) => void
  rejectFriendRequest: (requestId: string) => void
  friends: ChatFriend[]
  filteredFriends: ChatFriend[]
  searchUsers: (query: string) => Promise<unknown[]>
  isLoadingUsers: boolean
  isLoadingSearch: boolean
  fetchFriends: (options?: { force?: boolean }) => Promise<void>
  fetchUsers: () => Promise<void>
  fetchPendingRequests: (options?: { force?: boolean }) => Promise<void>
  sentRequestIds: Set<string>
}

// Legacy alias
export type UserContextProps = UserContextType

export type UserProviderProps = {
  children: ReactNode
}

// ============================================================================
// WebSocket Context
// ============================================================================

export type WebSocketContextType = {
  socket: Socket | null
  isConnected: boolean
  notificationCounts: NotificationCounts
  yapCounts: YapCounts
  markYapsAsSeen: () => void
  markFriendRequestsAsSeen: () => void
  hasNewNotifications: boolean
  hasNewYaps: boolean
  latestFriendRequest: FriendRequestNotification | null
  latestYapNotification: YapNotification | null
  pendingRequests: PendingFriendRequest[]
  offlineMessages: Record<string, unknown[]>
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  joinedConversations: string[]
  removePendingRequest: (requestId: string | number) => void
  appendFriend: (friend: unknown) => void
  updateFriendList: (payload: { friend?: unknown; action: 'add' | 'remove'; requesterId?: string | number }) => void
  consumeOfflineConversationMessages: (conversationId: string) => unknown[]
}

// Legacy alias
export type WebSocketContextProps = WebSocketContextType

// ============================================================================
// Yap Context
// ============================================================================

export type YapContextType = {
  yaps: Yap[]
  isLoading: boolean
  onchange: boolean
  setOnchange: (value: boolean) => void
  selectedYap: Yap | null
  setSelectedYap: (yap: Yap | null) => void
  navigateToSingleYapView: (yap: Yap, flag: string) => void
  postYap: (payload: YapPayload) => Promise<void>
  toggleLike: (yapId: string) => Promise<void>
  addReply: (yapId: string, content: string, parentReplyId?: number) => Promise<void>
  retweet: (yapId: string) => Promise<void>
  quoteRetweet: (yapId: string, content: string) => Promise<void>
  feedType: YapFeedType
  setFeedType: (type: YapFeedType) => void
  refreshFeed: () => Promise<void>
  fetchYapById: (yapId: string, slug?: string) => Promise<Yap | null>
  getHashtagSuggestions: (query?: string) => Promise<HashtagSuggestion[]>
  getLocationSuggestions: (query?: string) => Promise<LocationSuggestion[]>
  yapReplies: Reply[]
  setYapReplies: (replies: Reply[]) => void
  whotofollow: () => Promise<WhoToFollowSuggestion[]>
  whotofollowSuggestions: WhoToFollowSuggestion[]
  // Yap moderation
  deleteYap: (yapId: string) => Promise<boolean>
  muteUser: (username: string) => Promise<boolean>
  blockUser: (username: string) => Promise<boolean>
}

// Legacy alias
export type YapContextProps = YapContextType

export type YapProviderProps = {
  children: ReactNode
}
