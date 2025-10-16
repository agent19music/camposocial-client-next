// Export the required types to resolve the module issue

export interface User {
  id: string;
  first_name: string;
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
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    recipientId: string;
    timestamp: string;
}

export interface MessageState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    currentConversation: string | null;
    onlineStatus: Record<string, { online: boolean; lastActive: string }>;
    hasMoreMessages: boolean;
    page: number;
}

export interface SendMessageParams {
    content: string;
    recipientId: string;
    conversationId: string;
}

export interface OnlineStatusEvent {
    userId: string;
    lastActive: string;
}

export interface CustomMessageEvent {
    message: Message;
}

export interface EventTicketGroup {
  id: string;
  name: string;
  price: number;
  quantity: number;
  ticketsPerGroup: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventTicketGroupInput {
  name: string;
  price: number;
  quantity: number;
  ticketsPerGroup?: number;
  description?: string;
}

export interface EventCommentUser {
  id: string | number | null;
  username: string | null;
  avatar: string | null;
}

export interface EventComment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: EventCommentUser;
  likesCount: number;
  likedByCurrentUser: boolean;
  parentCommentId: number | null;
  replies: EventComment[];
}

export interface EventLikeResponse {
  message: string;
  likesCount: number;
  likedByCurrentUser: boolean;
}

export interface EventCommentPayload {
  text: string;
  parent_comment_id?: number;
}