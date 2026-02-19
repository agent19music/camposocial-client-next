/**
 * CampoSocial Types - Barrel Export
 * Central type definitions aligned with backend models
 * 
 * @packageDocumentation
 * @module @camposocial/types
 */

// ============================================================================
// User Types
// ============================================================================
export type {
  User,
  CurrentUser,
  MinimalUser,
  UserProfile,
  UserBadgeDisplay,
  Follow,
  WhoToFollowSuggestion,
  MinimalFriend,
  FriendshipFriend,
  FriendshipFriendRequest,
  OAuthProvider,
  RegisterResponse,
  VerifyOTPResponse,
  ProfilePageUser,
  Friend,
  FriendRequestExtended,
  FriendSuggestion,
  UserSettings,
  BlockedUser,
} from './user.types'

// ============================================================================
// Yap Types
// ============================================================================
export type {
  MediaItem,
  MediaUploadPayload,
  MediaUploadPreview,
  Reply,
  ReplyPayload,
  YapCommunity,
  Yap,
  YapPayload,
  YapFeedType,
  HashtagSuggestion,
  LocationSuggestion,
  TrendingHashtag,
  LikeResponse,
  BookmarkResponse,
  UserReply,
} from './yap.types'

// ============================================================================
// Chat Types
// ============================================================================
export type {
  ChatMedia,
  MessageReaction,
  MessageReplyRef,
  ChatMessage,
  BubbleMedia,
  BubbleMessage,
  Message,
  MessageState,
  SendMessagePayload,
  ChatConversation,
  ChatUser,
  ChatFriend,
  ChatListUser,
  KeyStatus,
  KeyPair,
  EncryptedPayload,
  StoredKeyData,
  ServerBackupData,
  DeviceInfo,
  DeviceKeysResponse,
  CachedMessage,
  CachedConversation,
  PendingMessage,
  CachedConversationPreview,
  OnlineStatusEvent,
  CustomMessageEvent,
  // Signal Protocol types
  SignalIdentityKeyPair,
  SignalSignedPreKey,
  SignalOneTimePreKey,
  SignalPreKeyBundle,
  SignalLocalKeys,
  SignalSessionRecord,
  SignalIdentityRecord,
  SignalMessageType,
  SignalEncryptedMessage,
  SignalDevicePayloads,
  PreKeyBundleResponse,
  PreKeyUploadRequest,
  SignalSessionStatus,
  SignalKeyStatus,
} from './chat.types'

// ============================================================================
// Community Types
// ============================================================================
export type {
  CommunityPrivacyType,
  CommunityMemberRole,
  CommunityCategory,
  CommunityCreator,
  CommunityMemberPreview,
  Community,
  CommunitySummary,
  CommunityMember,
  CommunityPostMedia,
  CommunityPostAuthor,
  CommunityPost,
  CreateCommunityPostPayload,
  CommunityInvite,
  CreateInviteOptions,
  CreateCommunityPayload,
  UpdateCommunityPayload,
} from './community.types'

// ============================================================================
// Event Types
// ============================================================================
export type {
  EventCommentUser,
  EventComment,
  EventCommentPayload,
  EventLikeResponse,
  EventTicketGroup,
  EventTicketGroupInput,
  AppEvent,
  AddEventPayload,
  UserEvent,
  EventCategory,
} from './event.types'

// ============================================================================
// Marketplace Types
// ============================================================================
export type {
  ProductVariation,
  Variation,
  Seller,
  ProductReview,
  Product,
  CartItem,
  CartResponse,
  AddToCartPayload,
  OrderStatus,
  OrderItem,
  Order,
  WishlistItem,
  DiscountCode,
  DiscountValidation,
  CartItemDisplay,
  CartResponseDisplay,
  RefundStatus,
  RefundRequest,
} from './marketplace.types'

// ============================================================================
// Poll Types
// ============================================================================
export type {
  PollOption,
  PollType,
  PollCategory,
  PollCreator,
  Poll,
  CreatePollPayload,
  CreatePollData,
  PollVoteResponse,
  CreatePollResponse,
} from './poll.types'

// ============================================================================
// Badge Types
// ============================================================================
export type {
  BadgeType,
  Badge,
  BadgeItem,
  BadgeSource,
  UserBadge,
  UserBadgeManagement,
  BadgeTransactionStatus,
  BadgePaymentMethod,
  BadgePaymentProvider,
  BadgeTransaction,
  BadgePurchaseStep,
  BadgePurchasePayload,
  BadgePurchaseResponse,
  UpdateBadgeDisplayPayload,
  BadgeDisplayProps,
  BadgeManagementProps,
  BadgePurchaseModalProps,
} from './badge.types'

// ============================================================================
// Notification Types
// ============================================================================
export type {
  NotificationCounts,
  YapCounts,
  FriendRequestSender,
  PendingFriendRequest,
  FriendRequestNotification,
  YapNotificationAuthor,
  YapNotification,
  JoinableConversation,
  TypingIndicatorEvent,
  MessageReceivedEvent,
  NotificationType,
  EnhancedNotification,
  NotificationPreference,
  UpdateNotificationPreferencePayload,
  OfflineNotification,
} from './notification.types'

// ============================================================================
// Gamification Types
// ============================================================================
export type {
  UserPoints,
  PointsActionType,
  PointTransaction,
  AchievementCategory,
  Achievement,
  UserAchievement,
  UserLevel,
  LevelProgress,
  LeaderboardEntry,
  LeaderboardTimeframe,
  LeaderboardResponse,
  TrendingTopic,
} from './gamification.types'

// ============================================================================
// Context Types (React-specific)
// ============================================================================
export type {
  AuthContextType,
  AuthProviderProps,
  AuthModalContextType,
  ChatContextType,
  ChatProviderProps,
  CommunityContextType,
  EventContextType,
  EventContextProps,
  EventProviderProps,
  FriendshipContextType,
  MarketplaceContextType,
  MarketplaceContextProps,
  MarketplaceProviderProps,
  PollContextType,
  PollContextProps,
  Theme,
  ThemeContextType,
  UserContextType,
  UserContextProps,
  UserProviderProps,
  WebSocketContextType,
  WebSocketContextProps,
  YapContextType,
  YapContextProps,
  YapProviderProps,
} from './context.types'

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Generic API response wrapper
 */
export type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * Paginated API response
 */
export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  per_page: number
  has_next: boolean
  has_prev: boolean
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Extract the ID type from an entity
 */
export type EntityId<T> = T extends { id: infer I } ? I : never

/**
 * Link preview data from link-preview API
 */
export type LinkPreviewData = {
  type?: "og" | "spotify" | string
  url: string
  title?: string
  description?: string
  image?: string
  image_url?: string
  siteName?: string
  site_name?: string
  favicon?: string
  html?: string
  thumbnail_url?: string
}

/**
 * Link segment for linkified content
 */
export type LinkSegment = {
  type: 'text' | 'url' | 'hashtag' | 'mention'
  value: string
  href?: string
}
// ============================================================================
// Component Props Types
// ============================================================================
export type {
  HeaderProps,
  MobileHeaderProps,
  NavLink,
  SideNavProps,
  EnhancedMobileSideNavProps,
  FooterLinkProps,
  FooterSectionProps,
  FilterPill,
  FilterPillsProps,
  LinkifiedContentProps,
  LinkPreviewCardProps,
  CommentListProps,
  SEOHeadProps,
  StructuredDataProps,
  NotificationDotProps,
  NotificationCounterProps,
  YapNotificationBannerProps,
  PollCardProps,
  ChatWindowProps,
  ChatInterfaceProps,
  MessageBubbleProps,
  KeyManagementProps,
  TypingIndicatorProps,
  CommunityPostProps,
  CommunitySettingsModalProps,
  CreateCommunityPostModalProps,
  InviteModalProps,
  CreateGroupModalProps,
  GroupSettingsProps,
  CommunityCropModalProps,
  FriendCardProps,
  SuggestionCardProps,
  RequestCardProps,
  EnhancedRequestCardProps,
  SearchableDiscoverProps,
  EmptyStateType,
  EmptyStateProps,
  ImageCropModalProps,
  VideoTrimmerModalProps,
  ReplyComponentProps,
  AuthenticatedWrapperProps,
  AuthFadeWallProps,
  CheckmarkProps,
  PayPalModalProps,
  ApplePayModalProps,
  MpesaModalProps,
  SingleYapClientProps,
  TweetCardProps,
  FeatureCard,
  ModalFriendRequest,
  KeyBackupModalProps,
  DeviceManagementProps,
} from './props.types'

// ============================================================================
// UI Component Types
// ============================================================================
export type {
  OrbColorScheme,
  FloatingIcon,
  FloatingIconProps,
  FloatingBackgroundProps,
  FallingIcon,
  CardOrbConfig,
  CardOrbBackgroundProps,
  HeroAuraGlowProps,
  OTPInputProps,
  BentoCardProps,
  PlaceholderImageProps,
  ProductCardProps,
  EventCardProps,
  ChatPreviewProps,
  StatCardProps,
  UserAvatarGroupProps,
  BentoGridProps,
  BentoSectionProps,
  IconType,
  ScrollTrailIconProps,
  CurvedTrailProps,
  SectionScrollConnectorProps,
} from './ui.types'

export { ORB_COLOR_SCHEMES } from './ui.types'