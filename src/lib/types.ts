// Export the required types to resolve the module issue

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