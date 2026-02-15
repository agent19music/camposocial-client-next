export interface MinimalFriend {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date | null;
  isCloseFriend: boolean;
  friendshipId: number | null;
}
import type { ReactNode, Dispatch, SetStateAction } from "react";
import type { EventComment, EventTicketGroup, EventTicketGroupInput, EventCommentPayload } from "@/lib/types";

// ===================== Auth =====================
export type CurrentUser = {
  id: string;
  first_name: string;  // API returns snake_case
  last_name: string;
  address: string;
  phone_no: string;
  email: string;
  avatar: string;
  is_seller: boolean;
  bio: string;
  category: string;
  username: string;
  display_name: string;
  yap_header_img?: string;
  university?: string;
  faculty?: string;
  course?: string;
} | null;

export interface AuthContextType {
  login: (username: string, password: string, apiEndpoint: string) => void;
  socialLogin: (provider: string, data: any) => Promise<{ success: boolean }>;
  completeProfile: (profileData: any) => Promise<void>;
  logout: () => void;
  currentUser: CurrentUser | null;
  authToken: string | null;
  updateUserContext: () => void;
  onAuthChange: boolean;
  isProfileComplete: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  showSocialModal: boolean;
  setShowSocialModal: (show: boolean) => void;
  sellerlogin: (email: string, password: string) => Promise<void>;
  // New auth methods
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean }>;
  sendOTP: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (email: string, code: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  oauthLogin: (provider: string, data: any) => Promise<{ success: boolean }>;  // OAuth for existing users only
  oauthSignup: (provider: string, data: any) => Promise<{ success: boolean }>; // OAuth for new users
}

export interface AuthProviderProps {
  children: ReactNode;
  initialAuthToken?: string | null;
}

// ===================== Chat =====================
export interface ChatMedia {
  url: string;
  type: string;
}

export interface ChatMessage {
  id: number;
  senderId: string;
  content: string;
  ciphertext?: string | null;
  nonce?: string;  // E2EE nonce for NaCl box decryption
  senderPublicKey?: string | null;  // Sender's public key for E2EE decryption
  timestamp: Date;
  media: ChatMedia[] | null;
  reactions: { userId: string; reactionType: string }[];
  replyTo?: { id: string | number; content: string; senderName: string } | number;
  isSent: boolean;
  isRead: boolean;
  encrypted: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChatFriend {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  displayName: string;
  isOnline: boolean;
  lastSeen: Date | null;
  isCloseFriend: boolean;
  friendshipId: number;
  conversationId: string | null;
  unreadCount: number;
  mutualFriends: number;
  category: string;
  bio: string;
  messagePreview: string | null;
  messageTime: Date;
}

export interface ChatConversation {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  lastMessage: string | null;
  lastMessageEncrypted?: boolean;
  lastMessageTime: Date | null;
  unreadCount: number;
  isEmpty: boolean;
  isOnline: boolean;
}

export interface ChatListUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  isCloseFriend: boolean;
}

export type KeyStatus = 'generating' | 'available' | 'unavailable' | 'locked';

export interface ChatContextType {
  sendMessage: (content: string, media: FileList | null, replyTo?: number) => Promise<void>;
  getMessages: (friendId: string, batchSize: number, lastMessageId?: number) => Promise<ChatMessage[]>;
  editMessage: (messageId: number, newContent: string) => Promise<void>;
  deleteMessage: (messageId: number) => Promise<void>;
  addReaction: (messageId: number, reactionType: string) => Promise<void>;
  uploadMedia: (files: FileList) => Promise<ChatMedia[]>;
  authToken: string | null;
  friendId: string | null;
  setFriendId: (friendId: string | null) => void;
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  getChatList: () => Promise<ChatListUser[]>;
  chatList: ChatListUser[] | undefined;
  generateKeys: (password?: string) => Promise<{ publicKey: string; secretKey: string } | null>;
  unlockKeys: (password: string) => Promise<boolean>;
  loadKeys: (password?: string) => Promise<void>;
  exportPublicKey: () => Promise<string | null>;
  keyStatus: KeyStatus;
  fetchConversations: () => Promise<ChatConversation[]>;
  checkIfConversationExists: (friendId: string) => Promise<boolean>;
  conversations: ChatConversation[];
  getFriendDetails: (friendId: string) => Promise<{ name: string; avatar: string; isOnline: boolean } | null>;
  friendDetails: ChatFriend | null;
  currentUser: ChatUser | null;
  sendTypingIndicator: (isTyping: boolean) => void;
  isTyping: boolean;
  isConnected: boolean;
  ensureConversation: (friendId: string) => Promise<string | null>;
  currentConversationId: string | null;
}

export interface ChatProviderProps { children: ReactNode }

// ===================== Events =====================
export interface AppEvent {
  id: string;
  eventId?: string;
  poster: string;
  entry_fee: number | string;
  created_at: string;
  updated_at: string;
  start_time: string | null;
  end_time: string | null;
  date_of_event: string;
  date: string;
  location: string;
  user_id: string;
  comments: EventComment[];
  ticketGroups: EventTicketGroup[];
  title: string;
  description: string;
  category: string;
  userimage: string;
  username: string;
  display_name: string;
}

export interface AddEventPayload {
  poster: string;
  posterFile?: File | null;
  entry_fee: number | string;
  created_at: string;
  updated_at: string;
  start_time: string;
  end_time: string;
  date_of_event: string | Date | undefined;
  location: string;
  user_id: string;
  comments: EventComment[];
  title: string;
  description: string;
  category: string;
  ticketGroups: EventTicketGroupInput[];
}


export interface EventContextProps {
  events: any[];
  setCategory: (category: string) => void;
  isLoading: boolean;
  onchange: boolean;
  setOnchange: (value: boolean) => void;
  navigateToSingleEventView: (event: AppEvent) => void;
  selectedEvent: AppEvent | null;
  addEvent: (event: AddEventPayload) => Promise<boolean>;
  updateEvent: (eventId: string, event: AddEventPayload) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  toggleCommentLike: (commentId: number, eventId: string) => Promise<void>;
  addCommentReply: (eventId: string, payload: EventCommentPayload) => Promise<EventComment | null>;
  refreshEvents: () => Promise<void>;
}

export interface EventProviderProps { children: ReactNode }

// ===================== Friendship =====================
export interface FriendshipFriend {
  id: string;
  username: string;
  photoUrl: string;
  course?: string;
  isOnline: boolean;
}

export interface FriendshipFriendRequest {
  id: string;
  username: string;
  photoUrl: string;
  timestamp: Date;
}

export interface FriendshipContextType {
  sendFriendRequest: (recipientId: string) => Promise<void>;
  acceptFriendRequest: (requesterId: string) => Promise<void>;
  rejectFriendRequest: (requesterId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unfriend: (friendId: string) => Promise<void>;
  getFriendRequests: () => Promise<void>;
  pendingRequests: FriendshipFriendRequest[];
  friends: FriendshipFriend[];
}

// ===================== Marketplace =====================
export interface Variation {
  id: string;
  name: string;
  price: number;
  stock: number;
  value: string;
}

export interface Seller {
  name: string;
  avatar: string;
  id: string;
  sales: number;
  rating: number;
  is_verified: boolean;
  location?: string;
  products?: Product[];
  reviews?: any;
  joinedDate?: string;
  about?: string;
}

export interface Product {
  id: string;
  slug?: string;  // SEO-friendly URL slug (optional for backwards compat)
  average_rating: number;
  category: string;
  created_at: string;
  images: string[];
  title: string;
  brand: string;
  price: number;
  sellerAvatar: string | null;
  sellerIsVerified: boolean;
  sellerName: string;
  seller_id: string;
  description: string;
  rating: number;
  reviewsCount: number;
  seller: Seller;
  reviews: {
    username: string;
    rating: number;
    text: string;
    id: number;
    avatar: string;
  }[];
  variations: Variation[];
  isBestseller?: boolean;
  isNew?: boolean;
}

export interface MarketplaceContextProps {
  products: Product[];
  isLoading: boolean;
  onchange: boolean;
  isPayed: boolean;
  setOnchange: (value: boolean) => void;
  setIsPayed: (value: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  navigateToSingleProductView: (product: Product) => void;
  navigateToSingleSellerView: (seller: Seller) => void;
  setSelectedSeller: (seller: Seller | null) => void;
  selectedSeller: Seller | null;
  updateCart: boolean;
  setUpdateCart: (value: boolean) => void;
  getLatestOrderId: () => Promise<number | null>;
  setOrderId: (value: string | null) => void;
  orderId: string | null;
  sellerStatusChange: boolean;
  setSellerStausChange: (value: boolean) => void;
  addToCart: (productId: string, quantity?: number, variationId?: string) => Promise<any | void>;
  deslugify: (slug: string) => string;
  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export interface MarketplaceProviderProps { children: ReactNode }

// ===================== Theme =====================
export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// ===================== User =====================
export interface UserContextProps {
  user: any[];
  users: any[];
  sendFriendRequest: (receipientId: string) => void;
  receivedRequests: any[];
  setReceivedRequests: (receivedRequests: any[]) => void;
  removeFriend: (friendId: string) => void;
  addFriend: (requestId: string) => void;
  blockUser: (targetId: string, action: 'block' | 'unblock') => void;
  setUsers: (users: any[]) => void;
  setFilteredUsers: (users: any[]) => void;
  onchange: (onchange: boolean) => void;
  rejectFriendRequest: (requestId: string) => void;
  friends: ChatFriend[];
  filteredFriends: ChatFriend[];
  searchUsers: (query: string) => Promise<any[]>;
  isLoadingUsers: boolean;
  isLoadingSearch: boolean;
  fetchFriends: (options?: { force?: boolean }) => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchPendingRequests: (options?: { force?: boolean }) => Promise<void>;
  sentRequestIds: Set<string>;
}

export interface UserEvent {
  id: string;
  avatar: string;
  course: string;
  email: string;
}

export interface UserProviderProps { children: ReactNode }

// ===================== Yaps =====================
export interface MediaItem {
  id: number;
  url: string;
  type: 'image' | 'video';
}

export interface Reply {
  id: number;
  content: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    display_name: string;
    avatar: string;
  };
  parent_reply_id?: number;
  isOptimistic?: boolean;
  likes_count?: number;
  child_replies_count?: number;
  child_replies?: Reply[];
}

export interface Yap {
  id: string;
  content: string;
  timestamp: string;
  updated_at?: string;
  location?: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
  original_yap_id?: string;
  original_yap?: Yap;
  is_retweet?: boolean;
  is_quote?: boolean;
  replies_count: number;
  likes_count: number;
  retweets_count: number;
  bookmarks_count: number;
  weighted_likes_count?: number; // Optional field for engagement weighting
  weighted_replies_count?: number; // Optional field for engagement weighting
  weighted_retweets_count?: number; // Optional field for engagement weighting
  media: MediaItem[];
  hashtags: string[];
  replies: Reply[];
  badges?: Array<{ id: number; name: string; image_url: string; is_animated: boolean }>;
  isOptimistic?: boolean;
  optimisticLiked?: boolean;
  optimisticLikesCount?: number;
  optimisticWeightedLikesCount?: number; // Optimistic update for weighted likes
  optimisticRepliesCount?: number;
  optimisticRetweetsCount?: number;
}

export interface HashtagSuggestion { name: string; usage_count: number }

export interface LocationSuggestion { name: string; usage_count: number }

export interface WhoToFollowSuggestion {
  id: string;
  username: string;
  display_name: string;
  avatar: string;
  bio?: string;
  followers_count?: number;
  is_following?: boolean;
}

export interface YapContextProps {
  yaps: Yap[];
  isLoading: boolean;
  onchange: boolean;
  setOnchange: (value: boolean) => void;
  selectedYap: Yap | null;
  setSelectedYap: (yap: Yap | null) => void;
  navigateToSingleYapView: (yap: Yap, flag: string) => void;
  postYap: (payload: YapPayload) => Promise<void>;
  toggleLike: (yapId: string) => Promise<void>;
  addReply: (yapId: string, content: string, parentReplyId?: number) => Promise<void>;
  retweet: (yapId: string) => Promise<void>;
  quoteRetweet: (yapId: string, content: string) => Promise<void>;
  feedType: 'chronological' | 'trending' | 'following';
  setFeedType: (type: 'chronological' | 'trending' | 'following') => void;
  refreshFeed: () => Promise<void>;
  fetchYapById: (yapId: string, slug?: string) => Promise<Yap | null>;
  getHashtagSuggestions: (query?: string) => Promise<HashtagSuggestion[]>;
  getLocationSuggestions: (query?: string) => Promise<LocationSuggestion[]>;
  yapReplies: Reply[];
  setYapReplies: (replies: Reply[]) => void;
  whotofollow: () => Promise<WhoToFollowSuggestion[]>;
  whotofollowSuggestions: WhoToFollowSuggestion[];

  // Yap moderation
  deleteYap: (yapId: string) => Promise<boolean>;
  muteUser: (username: string) => Promise<boolean>;
  blockUser: (username: string) => Promise<boolean>;
}

export interface YapPayload {
  content: string;
  location?: string;
  originalYapId?: string;
  mediaFiles?: File[];
}

export interface YapProviderProps { children: ReactNode }


