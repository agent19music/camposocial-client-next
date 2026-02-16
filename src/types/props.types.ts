/**
 * Component Props Types
 * Centralized prop types for all React components
 * @module props.types
 */

import type { ReactNode, ComponentType } from 'react'
import type {
  BadgeItem,
  Badge,
  UserBadgeDisplay,
  EventComment,
  Poll,
  Reply,
  BubbleMessage,
  MediaItem,
  Friend,
  FriendSuggestion,
  FriendRequestExtended,
  LinkPreviewData,
  Community,
} from './index'

// ============================================================================
// Layout Component Props
// ============================================================================

/**
 * Header component props
 */
export type HeaderProps = {
  onSearch?: (query: string) => void
  onFilterSelect?: (filterId: string) => void
  searchQuery?: string
  activeFilter?: string
}

/**
 * Mobile header component props
 */
export type MobileHeaderProps = {
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  showSearch?: boolean
  searchQuery?: string
  filters?: Array<{ id: string; label: string; active: boolean }>
  onFilterSelect?: (filterId: string) => void
  showFilters?: boolean
}

/**
 * Navigation link for sidenav
 */
export type NavLink = {
  label: string
  icon: ReactNode
  onClick: () => void
  badgeCount?: number
}

/**
 * Side navigation props
 */
export type SideNavProps = {
  links: NavLink[]
  variant?: 'default' | 'compact'
}

/**
 * Enhanced mobile sidenav props
 */
export type EnhancedMobileSideNavProps = {
  className?: string
}

/**
 * Footer link props
 */
export type FooterLinkProps = {
  title: string
  onClick: () => void
}

/**
 * Footer section props
 */
export type FooterSectionProps = {
  title: string
  links: Array<{
    title: string
    onClick: () => void
  }>
}

// ============================================================================
// Filter & Search Props
// ============================================================================

/**
 * Filter pill item
 */
export type FilterPill = {
  id: string
  label: string
  active?: boolean
  badge?: number
  isSearch?: boolean
}

/**
 * Filter pills component props
 */
export type FilterPillsProps = {
  filters: FilterPill[]
  onFilterSelect: (filterId: string) => void
  className?: string
  searchActive?: boolean
  onSearchToggle?: (active: boolean) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

// ============================================================================
// Content Component Props
// ============================================================================

/**
 * Linkified content props
 */
export type LinkifiedContentProps = {
  content: string
  className?: string
  linkClassName?: string
}

/**
 * Link preview card props
 */
export type LinkPreviewCardProps = {
  preview: LinkPreviewData
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

/**
 * Comment list props
 */
export type CommentListProps = {
  eventId: string
  comments: EventComment[]
}

// ============================================================================
// SEO Props
// ============================================================================

/**
 * SEO head component props
 */
export type SEOHeadProps = {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'event' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  structuredData?: unknown
  noindex?: boolean
  canonical?: string
}

/**
 * Structured data props
 */
export type StructuredDataProps = {
  type: 'website' | 'organization' | 'event' | 'product' | 'article'
  data: unknown
}

// ============================================================================
// Notification Props
// ============================================================================

/**
 * Notification dot props
 */
export type NotificationDotProps = {
  show: boolean
  count?: number
  size?: 'sm' | 'md' | 'lg'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
}

/**
 * Notification counter props
 */
export type NotificationCounterProps = {
  count: number
  maxCount?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'purple' | 'red' | 'blue' | 'green'
  className?: string
}

/**
 * Yap notification banner props
 */
export type YapNotificationBannerProps = {
  count: number
  authors: Array<{
    id: number
    username: string
    avatar: string
    display_name: string
  }>
  onViewNew: () => void
  className?: string
}

// ============================================================================
// Poll Props
// ============================================================================

/**
 * Poll card props
 */
export type PollCardProps = {
  pollId: string
  initialPoll?: Poll
  compact?: boolean
}

// ============================================================================
// Chat Props
// ============================================================================

/**
 * Chat window props
 */
export type ChatWindowProps = {
  friendId: string
  onBack?: () => void
  onToggleProfile?: () => void
  showSidebar?: boolean
}

/**
 * Chat interface props
 */
export type ChatInterfaceProps = {
  onChatOpen?: (isOpen: boolean) => void
}

/**
 * Message bubble props
 */
export type MessageBubbleProps = {
  message: BubbleMessage
  isOwn: boolean
  showAvatar?: boolean
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
  onReply?: () => void
  onEdit?: (newContent: string) => void
  onDelete?: () => void
  onReact?: (emoji: string) => void
  onCopy?: () => void
  userName?: string
  userAvatar?: string
}

/**
 * Key management props
 */
export type KeyManagementProps = {
  compact?: boolean
}

/**
 * Typing indicator props
 */
export type TypingIndicatorProps = {
  userName?: string
  userAvatar?: string
}

// ============================================================================
// Community Props
// ============================================================================

/**
 * Community post props
 */
export type CommunityPostProps = {
  id: string
  yap_id: string
  content: string
  created_at: string
  user: {
    id: string
    username: string
    display_name: string
    avatar: string
  }
  media: MediaItem[]
  likes_count: number
  replies_count: number
  isOptimistic?: boolean
  optimisticLiked?: boolean
  optimisticLikesCount?: number
  badges?: UserBadgeDisplay[]
  onLike?: (id: string) => Promise<void>
  onReply?: (id: string, content: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  currentUserId?: string
}

/**
 * Community settings modal props
 */
export type CommunitySettingsModalProps = {
  isOpen: boolean
  onClose: () => void
  community: Community
}

/**
 * Create community post modal props
 */
export type CreateCommunityPostModalProps = {
  isOpen: boolean
  onClose: () => void
  groupSlug: string
  onPostCreated?: () => void
}

/**
 * Invite modal props
 */
export type InviteModalProps = {
  isOpen: boolean
  onClose: () => void
  communitySlug: string
}

/**
 * Create group modal props
 */
export type CreateGroupModalProps = {
  isOpen: boolean
  onClose: () => void
  onGroupCreated?: () => void
}

/**
 * Group settings props
 */
export type GroupSettingsProps = {
  group: Community
  onUpdate: () => void
}

/**
 * Community crop modal props
 */
export type CommunityCropModalProps = {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
  aspectRatio: number
  title: string
}

// ============================================================================
// Friends Props
// ============================================================================

/**
 * Friend card props
 */
export type FriendCardProps = {
  friend: Friend
  onMessage: (friend: Friend) => void
  onRemoveFriend: (friendId: string | number) => void
  onViewProfile?: (friend: Friend) => void
}

/**
 * Suggestion card props
 */
export type SuggestionCardProps = {
  suggestion: FriendSuggestion
  onAddFriend?: (suggestionId: string | number) => void
  onViewProfile?: (suggestion: FriendSuggestion) => void
  isLoading?: boolean
}

/**
 * Request card props
 */
export type RequestCardProps = {
  request: FriendRequestExtended
  onAccept?: (requestId: string | number) => void
  onDecline?: (requestId: string | number) => void
  onViewProfile?: (request: FriendRequestExtended) => void
  isLoading?: boolean
}

/**
 * Enhanced request card props
 */
export type EnhancedRequestCardProps = {
  request: FriendRequestExtended
  onAccept?: (requestId: string | number) => void
  onDecline?: (requestId: string | number) => void
  onViewProfile?: (request: FriendRequestExtended) => void
  requestState?: 'accepting' | 'declining' | 'accepted' | 'declined'
}

/**
 * Searchable discover props
 */
export type SearchableDiscoverProps = {
  onAddFriend?: (userId: string | number) => void
  onViewProfile?: (user: unknown) => void
}

/**
 * Empty state type
 */
export type EmptyStateType = 'friends' | 'discover' | 'requests' | 'messages' | 'activity' | 'discover_no_suggestions'

/**
 * Empty state props
 */
export type EmptyStateProps = {
  type: EmptyStateType
  onAction?: () => void
}

// ============================================================================
// Media/Crop Props
// ============================================================================

/**
 * Image crop modal props
 */
export type ImageCropModalProps = {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedBlob: Blob) => void
  aspectRatio?: number
}

/**
 * Video trimmer modal props
 */
export type VideoTrimmerModalProps = {
  isOpen: boolean
  onClose: () => void
  videoFile: File
  onTrimComplete: (trimmedBlob: Blob) => void
  maxDuration?: number
}

// ============================================================================
// Reply Props
// ============================================================================

/**
 * Reply component props
 */
export type ReplyComponentProps = {
  reply: Reply
  onReplyToReply?: (parentReplyId: number, content: string) => void
  depth?: number
}

// ============================================================================
// Auth Props
// ============================================================================

/**
 * Authenticated wrapper props
 */
export type AuthenticatedWrapperProps = {
  children: ReactNode
}

/**
 * Auth fade wall props
 */
export type AuthFadeWallProps = {
  children: ReactNode
  visibleItems?: number
  contentType?: 'yaps' | 'events' | 'products'
}

// ============================================================================
// Payment Modal Props
// ============================================================================

/**
 * Checkmark animation props
 */
export type CheckmarkProps = {
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}

/**
 * PayPal modal props
 */
export type PayPalModalProps = {
  isOpen: boolean
  onClose: () => void
}

/**
 * Apple Pay modal props
 */
export type ApplePayModalProps = {
  isOpen: boolean
  onClose: () => void
}

/**
 * M-Pesa modal props
 */
export type MpesaModalProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (phoneNumber: string) => void
  amount: number
  currency: string
}

// ============================================================================
// Page Props
// ============================================================================

/**
 * Single yap client props
 */
export type SingleYapClientProps = {
  initialYap?: unknown
  slug: string
}

/**
 * Tweet card props (viewprofile)
 */
export type TweetCardProps = {
  name: string
  username: string
  content: string
  timestamp: string
}

/**
 * Feature card for welcome page
 */
export type FeatureCard = {
  icon: ComponentType<Record<string, unknown>>
  title: string
  description: string
  colorClass: string
}

/**
 * Friend request for modal display
 */
export type ModalFriendRequest = {
  id: string
  username: string
  photoUrl: string
  timestamp: Date
}

// ============================================================================
// Settings Component Props
// ============================================================================

/**
 * Key backup modal props
 */
export type KeyBackupModalProps = {
  isOpen: boolean
  onClose: () => void
  mode?: 'backup' | 'restore'
}

/**
 * Device management props
 */
export type DeviceManagementProps = {
  onBackupClick?: () => void
}
