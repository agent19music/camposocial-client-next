"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import { createContext, ReactNode, useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import { toast } from 'react-hot-toast';
import { AuthContext } from "./authcontext";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebSocket as useWebSocketContext } from "./websocket-context";
import { ChatContextType, ChatMedia, ChatMessage, ChatUser, ChatFriend, ChatConversation, ChatListUser, KeyStatus, ChatProviderProps } from "../utils/types";
import {
    encryptMessage as naclEncrypt,
    decryptMessage as naclDecrypt,
    KeyPair,
    isValidPublicKey
} from "../lib/crypto";
import {
    hasStoredKeys,
    getPublicKey as getStoredPublicKey,
    retrieveKeyPair,
    generateAndStoreKeyPair,
    storeKeyPair
} from "../lib/keyStorage";



export const ChatContext = createContext<ChatContextType>({
    sendMessage: async () => { },
    getMessages: async () => [],
    editMessage: async () => { },
    deleteMessage: async () => { },
    addReaction: async () => { },
    uploadMedia: async () => { return []; },
    authToken: null,
    friendId: null,
    setFriendId: () => { },
    messages: [],
    setMessages: () => { },
    getChatList: async () => [],
    chatList: [],
    generateKeys: async () => null,
    unlockKeys: async () => false,
    loadKeys: async () => { },
    exportPublicKey: async () => null,
    keyStatus: 'unavailable',
    fetchConversations: async () => [],
    checkIfConversationExists: async () => false,
    conversations: [],
    getFriendDetails: async () => null,
    friendDetails: null,
    currentUser: null,
    sendTypingIndicator: () => { },
    isTyping: false,
    isConnected: false,
    ensureConversation: async () => null,
    currentConversationId: null,
});

export default function ChatProvider({ children }: ChatProviderProps) {
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const { currentUser: rawCurrentUser, authToken, isAuthenticated } = useContext(AuthContext);

    const currentUser = useMemo(() => {
        if (!rawCurrentUser) return null;
        const { id, first_name, last_name, email } = rawCurrentUser;
        return { id, firstName: first_name, lastName: last_name, email };
    }, [rawCurrentUser]);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [friendId, setFriendId] = useState<string | null>(null);
    const [friendDetails, setFriendDetails] = useState<ChatFriend | null>(null);

    const [chatList, setChatList] = useState<ChatListUser[]>([]);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // WebSocket integration
    const { socket, isConnected, joinConversationRoom } = useWebSocket();
    const { consumeOfflineConversationMessages } = useWebSocketContext();

    // NaCl E2EE key management (base64 encoded strings)
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [keyStatus, setKeyStatus] = useState<KeyStatus>('unavailable');
    const [friendPublicKeys, setFriendPublicKeys] = useState<Record<string, string>>({});  // userId -> base64 public key
    const [keyGenerationAttempted, setKeyGenerationAttempted] = useState(false);
    const [keyPassword, setKeyPassword] = useState<string | null>(null);  // Cached for session

    // Rate limiting and debouncing refs
    const lastRequestTimeRef = useRef(0);
    const requestCountRef = useRef(0);
    const rateLimitWindowRef = useRef(0);
    const fetchingConversationsRef = useRef(false);
    const fetchingMessagesRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const activeRequestsRef = useRef(new Set<string>());
    const endpointAvailabilityRef = useRef(new Map<string, boolean>());

    // Rate limiting configuration
    const RATE_LIMIT_WINDOW = 60000; // 1 minute
    const MAX_REQUESTS_PER_WINDOW = 50;
    const MIN_REQUEST_INTERVAL = 500; // 0.5 seconds between requests
    const DEBOUNCE_DELAY = 400; // Faster debounce for UI changes

    // Rate limiting function
    const canMakeRequest = useCallback((requestType: string): boolean => {
        const now = Date.now();

        // Check if endpoint is known to be unavailable
        const endpointKey = requestType.split('_')[0]; // Extract base endpoint name
        if (endpointAvailabilityRef.current.get(endpointKey) === false) {
            console.warn(`Endpoint ${endpointKey} is known to be unavailable. Skipping request.`);
            return false;
        }

        // Check if we're within the rate limit window
        if (now - rateLimitWindowRef.current > RATE_LIMIT_WINDOW) {
            // Reset rate limit window
            rateLimitWindowRef.current = now;
            requestCountRef.current = 0;
        }

        // Check request count
        if (requestCountRef.current >= MAX_REQUESTS_PER_WINDOW) {
            console.warn(`Rate limit exceeded for ${requestType}. Please try again later.`);
            return false;
        }

        // Check minimum interval between requests
        if (now - lastRequestTimeRef.current < MIN_REQUEST_INTERVAL) {
            console.warn(`Request too frequent for ${requestType}. Debouncing...`);
            return false;
        }

        // Check if this request type is already active
        if (activeRequestsRef.current.has(requestType)) {
            console.warn(`Request ${requestType} already in progress. Skipping duplicate.`);
            return false;
        }

        return true;
    }, []);

    // Mark request as started
    const markRequestStart = useCallback((requestType: string) => {
        const now = Date.now();
        lastRequestTimeRef.current = now;
        requestCountRef.current += 1;
        activeRequestsRef.current.add(requestType);
    }, []);

    // Mark request as completed
    const markRequestEnd = useCallback((requestType: string) => {
        activeRequestsRef.current.delete(requestType);
    }, []);

    // Mark endpoint availability
    const markEndpointAvailability = useCallback((endpoint: string, available: boolean) => {
        endpointAvailabilityRef.current.set(endpoint, available);
    }, []);

    const fetchConversations = useCallback(async (): Promise<ChatConversation[]> => {
        // Don't proceed if required data is missing or already fetching
        if (!currentUser || !authToken || !isAuthenticated || !apiEndpoint || fetchingConversationsRef.current) {
            return [];
        }

        // Rate limiting check - inline to avoid dependency
        const now = Date.now();
        if (now - rateLimitWindowRef.current > RATE_LIMIT_WINDOW) {
            rateLimitWindowRef.current = now;
            requestCountRef.current = 0;
        }

        if (requestCountRef.current >= MAX_REQUESTS_PER_WINDOW) {
            console.warn('Rate limit exceeded for fetch_conversations');
            return [];
        }

        if (now - lastRequestTimeRef.current < MIN_REQUEST_INTERVAL) {
            console.warn('Request too frequent for fetch_conversations');
            return [];
        }

        if (activeRequestsRef.current.has('fetch_conversations')) {
            console.warn('fetch_conversations already in progress');
            return [];
        }

        // Check if endpoint is known to be unavailable
        if (endpointAvailabilityRef.current.get('conversations') === false) {
            console.warn('Conversations endpoint is known to be unavailable');
            return [];
        }

        fetchingConversationsRef.current = true;
        lastRequestTimeRef.current = now;
        requestCountRef.current += 1;
        activeRequestsRef.current.add('fetch_conversations');

        // Abort previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch(`${apiEndpoint}/conversations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                signal: controller.signal,
            });

            if (response.status === 404) {
                // Conversations endpoint doesn't exist - mark as unavailable
                endpointAvailabilityRef.current.set('conversations', false);
                console.warn('Conversations endpoint not found (404). Disabling further requests.');
                return [];
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const conversationsData = data.conversations?.map((conv: any) => ({
                id: String(conv.conversation_id || conv.id),
                friendId: String(conv.friend?.id || conv.friend_id),
                friendName: conv.friend?.display_name || conv.friend_name || `${conv.friend?.first_name || ''} ${conv.friend?.last_name || ''}`.trim(),
                friendAvatar: conv.friend?.avatar || conv.friend_avatar || '/default-avatar.png',
                lastMessage: conv.last_message?.content || conv.last_message,
                lastMessageTime: conv.last_message?.timestamp ? new Date(conv.last_message.timestamp) : (conv.last_message_time ? new Date(conv.last_message_time) : null),
                unreadCount: conv.unread_count || 0,
                isEmpty: !conv.last_message,
                isOnline: Boolean(conv.friend?.is_online || conv.is_online),
            })) || [];

            setConversations(conversationsData);
            endpointAvailabilityRef.current.set('conversations', true);
            return conversationsData;
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Error fetching conversations:", error);
                // Don't show user-facing error for conversations as it might be optional
            }
            return [];
        } finally {
            fetchingConversationsRef.current = false;
            activeRequestsRef.current.delete('fetch_conversations');
        }
    }, [currentUser, authToken, isAuthenticated, apiEndpoint]); // Only stable dependencies

    // Load cached conversations on mount
    useEffect(() => {
        if (currentUser?.id) {
            const cached = localStorage.getItem(`conversations-${currentUser.id}`);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    // Convert string dates back to Date objects
                    const hydrated = parsed.map((c: any) => ({
                        ...c,
                        lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime) : null
                    }));
                    setConversations(hydrated);
                } catch (e) {
                    console.error("Failed to parse cached conversations", e);
                }
            }
        }
    }, [currentUser?.id]);

    // Save conversations to cache whenever they change
    useEffect(() => {
        if (currentUser?.id && conversations.length > 0) {
            localStorage.setItem(`conversations-${currentUser.id}`, JSON.stringify(conversations));
        }
    }, [conversations, currentUser?.id]);

    // Memoize setMessages to prevent unnecessary re-renders
    const setMessagesCallback = useCallback((messages: React.SetStateAction<ChatMessage[]>) => {
        setMessages(messages);
    }, []);

    // Stable API endpoint reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const stableApiEndpoint = useMemo(() => apiEndpoint, []);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Removed: Problematic useEffect that causes circular dependency
    // This logic is now handled by the ChatWindow component directly

    // Load user's keys from IndexedDB when component mounts
    // Automatically uses the key password derived from login credentials
    // If no keys exist, proactively generate them so we can receive encrypted messages
    useEffect(() => {
        if (currentUser?.id) {
            // Get the key password from session storage (set during login)
            const storedKeyPassword = typeof window !== 'undefined'
                ? sessionStorage.getItem('e2ee_key_password')
                : null;

            const initializeKeys = async () => {
                await loadKeys(storedKeyPassword || undefined);

                // If no keys exist and we have a password, proactively generate keys
                // This ensures BOTH sender and recipient have keys for E2EE
                const hasKeys = await hasStoredKeys();
                if (!hasKeys && storedKeyPassword) {
                    console.log('[E2EE] No keys found, proactively generating for user', currentUser.id);
                    await generateKeys(storedKeyPassword);
                } else if (hasKeys && storedKeyPassword) {
                    // Keys exist - try to retrieve them with the password
                    const keyPair = await retrieveKeyPair(storedKeyPassword);
                    if (!keyPair) {
                        // Keys exist but can't be decrypted - password mismatch
                        // This happens when key derivation changed. Clear and regenerate.
                        console.log('[E2EE] Keys exist but locked, clearing and regenerating for user', currentUser.id);
                        const { deleteStoredKeys } = await import('../lib/keyStorage');
                        await deleteStoredKeys();
                        await generateKeys(storedKeyPassword);
                    }
                }
            };

            initializeKeys();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id]); // Use stable currentUser.id instead of whole object

    // Load conversations when component mounts with debouncing
    useEffect(() => {
        if (!(currentUser && authToken && isAuthenticated)) {
            return;
        }

        const timeoutId = setTimeout(async () => {
            if (!fetchingConversationsRef.current) {
                try {
                    await fetchConversations();
                } catch (error) {
                    console.error('Error fetching conversations:', error);
                    markEndpointAvailability('conversations', false);
                }
            }
        }, DEBOUNCE_DELAY);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [currentUser, authToken, isAuthenticated, fetchConversations, markEndpointAvailability]);

    // Cleanup effect
    useEffect(() => {
        const activeRequests = activeRequestsRef.current;
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            activeRequests.clear();
        };
    }, []);

    const decryptMessage = useCallback(async (
        ciphertext: string,
        nonce: string | null,
        senderPublicKey: string | null
    ): Promise<string> => {
        // If no encryption data or keys, return ciphertext as-is
        if (!secretKey || !nonce || !senderPublicKey) {
            return ciphertext;
        }

        try {
            const decrypted = naclDecrypt(ciphertext, nonce, senderPublicKey, secretKey);
            if (!decrypted) {
                console.error("Decryption failed: invalid keys or ciphertext");
                return '[Unable to decrypt message]';
            }
            return decrypted;
        } catch (error) {
            console.error("Error decrypting message:", error);
            return ciphertext;
        }
    }, [secretKey]);

    // CRITICAL FIX: WebSocket effect for real-time messaging with proper cleanup
    useEffect(() => {
        if (!socket || !isConnected) return;

        const buildIncomingMessage = async (messageData: any): Promise<ChatMessage | null> => {
            const ciphertext = messageData.ciphertext || messageData.content;
            const nonce = messageData.nonce;
            const senderPublicKey = messageData.sender_public_key;

            // Decrypt if encrypted and we have the necessary data
            const decrypted = messageData.encrypted && ciphertext && nonce && senderPublicKey
                ? await decryptMessage(ciphertext, nonce, senderPublicKey)
                : messageData.content || ciphertext;

            return {
                id: messageData.id,
                senderId: messageData.sender_id,
                content: decrypted,
                ciphertext,
                nonce,
                timestamp: new Date(messageData.timestamp),
                media: (messageData.media || []).map((item: any) => ({
                    id: item.id,
                    url: item.url,
                    type: item.type,
                    metadata: item.metadata || {},
                })),
                reactions: (messageData.reactions || []).map((reaction: any) => ({
                    userId: reaction.user_id,
                    reactionType: reaction.reaction_type,
                })),
                replyTo: messageData.reply_to,
                isSent: messageData.sender_id === currentUser?.id,
                isRead: Boolean(messageData.is_read),
                encrypted: messageData.encrypted,
            };
        };

        const handleNewMessage = async (messageData: any) => {
            const incomingConversation = String(messageData.conversation_id);
            const isActiveConversation = currentConversationId && incomingConversation === currentConversationId;

            if (!isActiveConversation) {
                // Refresh conversations to show unread count and new message preview
                await fetchConversations();
                if (messageData.sender_username) {
                    toast.success(`New message from ${messageData.sender_username}`);
                } else {
                    toast.success('New message received');
                }
                return;
            } else {
                // Even if active, we want to update the conversation list to show the new last message
                // We can do this optimistically or by fetching
                fetchConversations();
            }

            const newMessage = await buildIncomingMessage(messageData);
            if (!newMessage) {
                return;
            }

            setMessages(prev => prev.some(msg => msg.id === newMessage.id) ? prev : [...prev, newMessage]);
        };

        const handleUserTyping = (data: any) => {
            if (data.user_id === friendId && data.conversation_id === currentConversationId) {
                setIsTyping(data.is_typing);

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                if (data.is_typing) {
                    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 5000);
                }
            }
        };

        const handleFriendStatus = (data: any) => {
            // Update friend details or chat list
            if (data.user_id === friendId) {
                setFriendDetails(prev => {
                    if (!prev || data.user_id !== prev.id) return prev;
                    return {
                        ...prev,
                        isOnline: data.is_online,
                        lastSeen: data.timestamp ? new Date(data.timestamp) : prev.lastSeen
                    };
                });
            }
        };

        // Use the new WebSocket hook API which handles cleanup automatically
        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('friend_status_change', handleFriendStatus);

        const handleMessageRead = (data: any) => {
            const messageIds = data.message_ids || [];
            setMessages(prev => prev.map(msg =>
                messageIds.includes(msg.id)
                    ? { ...msg, isRead: true }
                    : msg
            ));
        };
        socket.on('messages_read', handleMessageRead);

        const handleReactionUpdate = (data: any) => {
            setMessages(prev => prev.map(msg =>
                msg.id === data.message_id
                    ? {
                        ...msg,
                        reactions: [
                            ...(msg.reactions || []).filter((r: any) => r.userId !== data.user_id),
                            { userId: data.user_id, reactionType: data.reaction_type }
                        ]
                    }
                    : msg
            ));
        };
        socket.on('reaction_added', handleReactionUpdate);

        const handleMessageEdit = (data: any) => {
            setMessages(prev => prev.map(msg =>
                msg.id === data.message_id
                    ? { ...msg, content: data.new_content, isEdited: true }
                    : msg
            ));
        };
        socket.on('message_edited', handleMessageEdit);

        const handleMessageDelete = (data: any) => {
            setMessages(prev => prev.filter(msg => msg.id !== data.message_id));
        };
        socket.on('message_deleted', handleMessageDelete);

        const handleFriendRequestAccepted = (data: any) => {
            // Refresh conversations immediately when a friend request is accepted
            fetchConversations();
            toast.success("Friend request accepted! You can now chat.");
        };
        socket.on('friend_request_accepted', handleFriendRequestAccepted);
        socket.on('friend_request_response', (data: any) => {
            if (data.action === 'accepted') {
                handleFriendRequestAccepted(data);
            }
        });

        return () => {
            socket.off('new_message', handleNewMessage);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            socket.off('user_typing', handleUserTyping);
            socket.off('friend_status_change', handleFriendStatus);
            socket.off('friend_request_accepted', handleFriendRequestAccepted);
            socket.off('friend_request_response');
            socket.off('messages_read', handleMessageRead);
            socket.off('reaction_added', handleReactionUpdate);
            socket.off('message_edited', handleMessageEdit);
            socket.off('message_deleted', handleMessageDelete);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, isConnected, friendId, currentUser?.id, currentConversationId, decryptMessage, fetchConversations]);

    // Generate a unique conversation ID from two user IDs

    // Fetch friend details including online status
    const getFriendDetails = useCallback(async (conversationId: string): Promise<{ name: string; avatar: string; isOnline: boolean } | null> => {
        if (!currentUser || !authToken || !canMakeRequest('friend_details')) {
            return null;
        }

        markRequestStart('friend_details');

        try {
            // First try to get conversation data which includes friend details
            const convResponse = await fetch(`${apiEndpoint}/conversations/${conversationId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (convResponse.status === 404) {
                markEndpointAvailability('conversations', false);
                console.warn('Conversation details endpoint not available');
                return null;
            }

            if (convResponse.ok) {
                const convData = await convResponse.json();
                const normalized: ChatFriend = {
                    id: String(convData.friend?.id ?? convData.friend_id),
                    username: convData.friend?.username || convData.username || '',
                    firstName: convData.friend?.first_name || convData.first_name,
                    lastName: convData.friend?.last_name || convData.last_name,
                    avatar: convData.friend?.avatar || convData.avatar || '',
                    displayName: convData.friend?.display_name || convData.display_name || `${convData.first_name} ${convData.last_name}`,
                    isOnline: Boolean(convData.is_online),
                    lastSeen: convData.last_seen ? new Date(convData.last_seen) : null,
                    isCloseFriend: Boolean(convData.is_close_friend),
                    friendshipId: convData.friendship_id || 0,
                    conversationId,
                    unreadCount: convData.unread_count || 0,
                    mutualFriends: convData.mutual_friends || 0,
                    category: convData.category || 'friends',
                    bio: convData.bio || '',
                    messagePreview: convData.last_message?.content || null,
                    messageTime: convData.last_message?.timestamp ? new Date(convData.last_message.timestamp) : new Date(),
                };
                setFriendDetails(normalized);
                return {
                    name: normalized.displayName,
                    avatar: normalized.avatar,
                    isOnline: normalized.isOnline
                };
            }
        } catch (error) {
            console.error("Error fetching friend details:", error);
        } finally {
            markRequestEnd('friend_details');
        }
        return null;
    }, [currentUser, authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, markEndpointAvailability]);

    // Legacy conversation existence check - inline implementation to avoid circular dependency
    const checkIfConversationExists = useCallback(async (friendId: string): Promise<boolean> => {
        if (!currentUser || !authToken) return false;

        try {
            const response = await fetch(`${apiEndpoint}/conversations/with/${friendId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            return Boolean(data.conversation_id);
        } catch (error) {
            console.error('Error checking conversation existence', error);
            return false;
        }
    }, [currentUser, authToken, apiEndpoint]);

    const fetchFriendPublicKey = useCallback(async (userId: string): Promise<string | null> => {
        // Check if we already have this friend's public key cached
        if (friendPublicKeys[userId]) {
            return friendPublicKeys[userId];
        }

        if (!currentUser || !authToken) {
            return null;
        }

        // Note: No rate limiting for encryption key fetch - critical for E2EE

        try {
            const response = await fetch(`${apiEndpoint}/keys/${userId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.status === 404) {
                markEndpointAvailability('keys', false);
                console.warn(`No public key found for user ${userId}`);
                return null;
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch public key for user ${userId}`);
            }

            markEndpointAvailability('keys', true);
            const data = await response.json();
            const fetchedPublicKey = data.public_key;

            // Validate the key format
            if (!isValidPublicKey(fetchedPublicKey)) {
                console.error(`Invalid public key format for user ${userId}`);
                return null;
            }

            // Cache the key for future use
            setFriendPublicKeys(prev => ({
                ...prev,
                [userId]: fetchedPublicKey
            }));

            return fetchedPublicKey;
        } catch (error) {
            console.error(`Error fetching public key for user ${userId}:`, error);
            return null;
        }
    }, [friendPublicKeys, currentUser, authToken, apiEndpoint, markEndpointAvailability]);

    const encryptMessage = useCallback(async (
        content: string,
        recipientId: string,
        overrideSecretKey?: string  // Allow passing freshly generated key directly
    ): Promise<{
        ciphertext: string,
        nonce: string | null,
        isEncrypted: boolean
    }> => {
        // Use override key if provided (for freshly generated keys before state updates)
        const effectiveSecretKey = overrideSecretKey || secretKey;

        // Check if we have our own secret key
        if (!effectiveSecretKey) {
            // If no keys, send unencrypted as fallback (user hasn't set up encryption)
            console.warn("[E2EE] No local secret key available. Sending message unencrypted.");
            return { ciphertext: content, nonce: null, isEncrypted: false };
        }

        // Get friend's public key - use cached or fetch
        let friendKey: string | null = friendPublicKeys[recipientId] || null;

        if (!friendKey) {
            // Try to fetch the friend's key
            friendKey = await fetchFriendPublicKey(recipientId);
            if (!friendKey) {
                // Friend hasn't set up encryption - send unencrypted as fallback
                console.warn(`[E2EE] No public key found for user ${recipientId}. Sending message unencrypted.`);
                return { ciphertext: content, nonce: null, isEncrypted: false };
            }
        }

        try {
            // Encrypt using NaCl box (ECDH + XSalsa20-Poly1305)
            const { ciphertext, nonce } = naclEncrypt(content, friendKey, effectiveSecretKey);
            return { ciphertext, nonce, isEncrypted: true };
        } catch (error) {
            console.error("Error encrypting message:", error);
            // Fallback to unencrypted if encryption fails
            console.warn("Encryption failed. Sending message unencrypted.");
            return { ciphertext: content, nonce: null, isEncrypted: false };
        }
    }, [secretKey, friendPublicKeys, fetchFriendPublicKey]);

    const ensureConversation = useCallback(async (targetId: string): Promise<string | null> => {
        if (!currentUser || !authToken) return null;

        const response = await fetch(`${apiEndpoint}/conversations/with/${targetId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to ensure conversation');
        }

        const data = await response.json();
        const conversationId = data.conversation_id ? String(data.conversation_id) : null;

        if (conversationId) {
            setCurrentConversationId(conversationId);
            joinConversationRoom(conversationId);

            const queued = consumeOfflineConversationMessages(conversationId);
            if (queued.length) {
                for (const payload of queued) {
                    const normalized = payload.message || payload;
                    const ciphertext = normalized.ciphertext || normalized.content;
                    const nonce = normalized.nonce;
                    const senderPublicKey = normalized.sender_public_key;

                    // Decrypt if encrypted and we have necessary data
                    const decrypted = normalized.encrypted && ciphertext && nonce && senderPublicKey
                        ? await decryptMessage(ciphertext, nonce, senderPublicKey)
                        : normalized.content || ciphertext;

                    const newMessage: ChatMessage = {
                        id: normalized.id,
                        senderId: normalized.sender_id,
                        content: decrypted,
                        ciphertext,
                        nonce,
                        timestamp: new Date(normalized.timestamp),
                        media: (normalized.media || []).map((item: any) => ({
                            id: item.id,
                            url: item.url,
                            type: item.type,
                            metadata: item.metadata || {},
                        })),
                        reactions: (normalized.reactions || []).map((reaction: any) => ({
                            userId: reaction.user_id,
                            reactionType: reaction.reaction_type,
                        })),
                        replyTo: normalized.reply_to,
                        isSent: normalized.sender_id === currentUser?.id,
                        isRead: Boolean(normalized.is_read),
                        encrypted: normalized.encrypted,
                    };

                    setMessages(prev => prev.some(msg => msg.id === newMessage.id) ? prev : [...prev, newMessage]);
                }
            }

            if (data.friend) {
                const normalized: ChatFriend = {
                    id: String(data.friend.id),
                    username: data.friend.username,
                    firstName: data.friend.first_name,
                    lastName: data.friend.last_name,
                    avatar: data.friend.avatar || '',
                    displayName: data.friend.display_name || `${data.friend.first_name} ${data.friend.last_name}`,
                    isOnline: Boolean(data.is_online),
                    lastSeen: data.last_seen ? new Date(data.last_seen) : null,
                    isCloseFriend: Boolean(data.is_close_friend),
                    friendshipId: data.friendship_id || 0,
                    conversationId,
                    unreadCount: data.unread_count || 0,
                    mutualFriends: data.mutual_friends || 0,
                    category: data.category || 'friends',
                    bio: data.friend.bio || '',
                    messagePreview: data.last_message?.content || null,
                    messageTime: data.last_message?.timestamp ? new Date(data.last_message.timestamp) : new Date(),
                };
                setFriendDetails(normalized);
            }
        }

        return conversationId;
    }, [apiEndpoint, authToken, currentUser, joinConversationRoom, consumeOfflineConversationMessages, decryptMessage]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const sendMessage = useCallback(async (content: string, media: FileList | null, replyTo?: number) => {
        if (!friendId || !currentUser || !authToken) {
            toast.error("Cannot send message: missing required information");
            return;
        }

        if (!canMakeRequest('send_message')) {
            return;
        }

        // Auto-generate encryption keys if we have a key password but no keys yet
        // Track freshly generated keypair for immediate use (avoids React state timing issues)
        let freshKeyPair: { publicKey: string; secretKey: string } | null = null;

        // Generate keys if: unavailable (no keys) OR locked (keys exist but wrong password - regenerate)
        if ((keyStatus === 'unavailable' || keyStatus === 'locked') && !secretKey) {
            const storedKeyPassword = typeof window !== 'undefined'
                ? sessionStorage.getItem('e2ee_key_password')
                : null;
            if (storedKeyPassword) {
                try {
                    freshKeyPair = await generateKeys(storedKeyPassword);
                } catch (e) {
                    console.warn('[E2EE] Could not auto-generate keys:', e);
                }
            }
        }

        markRequestStart('send_message');

        try {
            const conversationId = await ensureConversation(friendId);
            if (!conversationId) {
                throw new Error('Conversation could not be created');
            }

            let uploadedMedia: ChatMedia[] = [];

            // Inline uploadMedia to avoid circular dependency
            if (media && media.length > 0) {
                if (canMakeRequest('upload_media')) {
                    markRequestStart('upload_media');
                    try {
                        const formData = new FormData();
                        Array.from(media).forEach((file, index) => {
                            formData.append(`media_${index}`, file);
                        });

                        const uploadResponse = await fetch(`${apiEndpoint}/upload`, {
                            method: 'POST',
                            headers: {
                                Authorization: `Bearer ${authToken}`,
                            },
                            body: formData,
                        });

                        if (uploadResponse.ok) {
                            uploadedMedia = await uploadResponse.json();
                            markEndpointAvailability('upload', true);
                        }
                    } catch (uploadError) {
                        console.error("Error uploading media:", uploadError);
                    } finally {
                        markRequestEnd('upload_media');
                    }
                }
            }

            // Pass freshly generated secret key if available (avoids React state timing issues)
            const { ciphertext, nonce, isEncrypted } = await encryptMessage(content, friendId, freshKeyPair?.secretKey);

            const optimisticMessage: ChatMessage = {
                id: Date.now(),
                senderId: currentUser.id,
                content: content,  // Store plaintext locally for optimistic UI
                ciphertext,
                nonce: nonce || undefined,
                timestamp: new Date(),
                media: uploadedMedia,
                reactions: [],
                replyTo: replyTo,
                isSent: false,
                isRead: false,
                encrypted: isEncrypted
            };

            setMessages(prev => [optimisticMessage, ...prev]);

            const response = await fetch(`${apiEndpoint}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    content: ciphertext,
                    nonce: nonce,  // Send nonce for E2EE decryption
                    recipient_id: friendId,
                    conversation_id: conversationId,
                    media: uploadedMedia,
                    reply_to: replyTo,
                    encrypted: isEncrypted
                }),
            });

            if (!response.ok) {
                setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
                if (response.status === 404) {
                    markEndpointAvailability('messages', false);
                    throw new Error('Messaging endpoint not available');
                }
                throw new Error('Failed to send message');
            }

            const result = await response.json();

            setMessages(prev => prev.map(msg =>
                msg.id === optimisticMessage.id
                    ? {
                        ...msg,
                        id: result.message_id,
                        isSent: true,
                        timestamp: new Date(result.message_data.timestamp),
                        content,
                        ciphertext,
                        nonce: nonce || undefined,
                    }
                    : msg
            ));

            markEndpointAvailability('messages', true);

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            markRequestEnd('send_message');
        }
    }, [friendId, currentUser, authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, markEndpointAvailability, ensureConversation, encryptMessage, keyStatus, secretKey]);

    // Send typing indicator
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const sendTypingIndicator = useCallback((isTyping: boolean) => {
        if (socket && isConnected && friendId && currentConversationId) {
            socket.emit('typing', {
                recipient_id: friendId,
                conversation_id: currentConversationId,
                is_typing: isTyping
            });
        }
    }, [socket, isConnected, friendId, currentConversationId]);

    const getMessages = useCallback(async (friendId: string, batchSize: number, lastMessageId?: number): Promise<ChatMessage[]> => {
        if (!currentUser || !authToken || fetchingMessagesRef.current) {
            return [];
        }

        if (!canMakeRequest('get_messages')) {
            return [];
        }

        fetchingMessagesRef.current = true;
        markRequestStart('get_messages');

        try {
            const conversationId = await ensureConversation(friendId);
            if (!conversationId) {
                markEndpointAvailability('messages', false);
                return [];
            }

            const url = new URL(`${apiEndpoint}/conversations/${conversationId}/messages`);
            url.searchParams.append('limit', batchSize.toString());
            if (lastMessageId) {
                url.searchParams.append('before', lastMessageId.toString());
            }

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.status === 404) {
                markEndpointAvailability('messages', false);
                return [];
            }

            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Unauthorized access to messages');
                    return [];
                }
                throw new Error(`Failed to fetch messages: ${response.status}`);
            }

            markEndpointAvailability('messages', true);
            const data = await response.json();
            const messagesData = await Promise.all((data.messages || []).map(async (msg: any) => {
                const ciphertext = msg.ciphertext || msg.content;
                const nonce = msg.nonce;
                const senderPublicKey = msg.sender_public_key;

                // Decrypt if encrypted and we have necessary data
                let decryptedContent = ciphertext;
                if (msg.encrypted && ciphertext && nonce && senderPublicKey) {
                    decryptedContent = await decryptMessage(ciphertext, nonce, senderPublicKey);
                }

                return {
                    id: msg.id,
                    senderId: msg.sender_id,
                    content: decryptedContent,
                    ciphertext,
                    nonce,
                    timestamp: new Date(msg.timestamp),
                    media: (msg.media || []).map((mediaItem: any) => ({
                        url: mediaItem.url,
                        type: mediaItem.type,
                    })),
                    reactions: (msg.reactions || []).map((reaction: any) => ({
                        userId: reaction.user_id,
                        reactionType: reaction.reaction_type
                    })),
                    replyTo: msg.reply_to,
                    isSent: msg.sender_id === currentUser.id,
                    isRead: msg.is_read,
                    encrypted: msg.encrypted
                };
            }));

            if (!lastMessageId) {
                setMessagesCallback(messagesData.reverse());
            }

            return messagesData;
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        } finally {
            fetchingMessagesRef.current = false;
            markRequestEnd('get_messages');
        }
    }, [currentUser, authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, markEndpointAvailability, ensureConversation, setMessagesCallback, decryptMessage]);

    const getChatList = async () => {
        if (!currentUser || !authToken || !canMakeRequest('get_chat_list')) {
            return [];
        }

        markRequestStart('get_chat_list');

        try {
            const response = await fetch(`${apiEndpoint}/friends`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.status === 404) {
                markEndpointAvailability('friends', false);
                console.warn('Friends endpoint not available');
                return [];
            }

            if (!response.ok) {
                throw new Error('Failed to fetch chat list');
            }

            markEndpointAvailability('friends', true);
            const data = await response.json();
            const chatListData = data.friends.map((friend: any) => ({
                id: String(friend.id),
                firstName: friend.first_name,
                lastName: friend.last_name,
                avatar: friend.avatar || '',
                isCloseFriend: Boolean(friend.is_close_friend),
            }));

            setChatList(chatListData);
            return chatListData;
        } catch (error) {
            console.error("Error fetching chat list:", error);
            return [];
        } finally {
            markRequestEnd('get_chat_list');
        }
    };

    const editMessage = async (messageId: number, newContent: string) => {
        if (!currentUser || !authToken || !canMakeRequest('edit_message')) {
            toast.error("Cannot edit message");
            return;
        }

        markRequestStart('edit_message');

        try {
            const response = await fetch(`${apiEndpoint}/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ content: newContent }),
            });

            if (response.status === 404) {
                markEndpointAvailability('messages', false);
                throw new Error('Message editing not available');
            }

            if (!response.ok) {
                throw new Error('Failed to edit message');
            }

            markEndpointAvailability('messages', true);
            if (friendId) {
                await getMessages(friendId, 20);
            }
        } catch (error) {
            console.error("Error editing message:", error);
            toast.error("Failed to edit message");
        } finally {
            markRequestEnd('edit_message');
        }
    };

    const deleteMessage = async (messageId: number) => {
        if (!currentUser || !authToken || !canMakeRequest('delete_message')) {
            toast.error("Cannot delete message");
            return;
        }

        markRequestStart('delete_message');

        try {
            const response = await fetch(`${apiEndpoint}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.status === 404) {
                markEndpointAvailability('messages', false);
                throw new Error('Message deletion not available');
            }

            if (!response.ok) {
                throw new Error('Failed to delete message');
            }

            markEndpointAvailability('messages', true);
            if (friendId) {
                await getMessages(friendId, 20);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message");
        } finally {
            markRequestEnd('delete_message');
        }
    };

    const addReaction = async (messageId: number, reactionType: string) => {
        if (!currentUser || !authToken || !canMakeRequest('add_reaction')) {
            return;
        }

        markRequestStart('add_reaction');

        try {
            const response = await fetch(`${apiEndpoint}/messages/${messageId}/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ reaction_type: reactionType }),
            });

            if (response.status === 404) {
                markEndpointAvailability('messages', false);
                console.warn('Message reactions not available');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to add reaction');
            }

            markEndpointAvailability('messages', true);
            if (friendId) {
                await getMessages(friendId, 20);
            }
        } catch (error) {
            console.error("Error adding reaction:", error);
        } finally {
            markRequestEnd('add_reaction');
        }
    };

    const uploadMedia = useCallback(async (files: FileList) => {
        if (!currentUser || !authToken || !canMakeRequest('upload_media')) {
            throw new Error('Cannot upload media');
        }

        markRequestStart('upload_media');

        try {
            const formData = new FormData();
            Array.from(files).forEach((file, index) => {
                formData.append(`media_${index}`, file);
            });

            const response = await fetch(`${apiEndpoint}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (response.status === 404) {
                markEndpointAvailability('upload', false);
                throw new Error('Media upload not available');
            }

            if (!response.ok) {
                throw new Error('Failed to upload media');
            }

            markEndpointAvailability('upload', true);
            return await response.json();
        } catch (error) {
            console.error("Error uploading media:", error);
            throw error;
        } finally {
            markRequestEnd('upload_media');
        }
    }, [currentUser, authToken, canMakeRequest, markRequestStart, apiEndpoint, markEndpointAvailability, markRequestEnd]);



    const uploadPublicKey = useCallback(async (base64PublicKey: string): Promise<any> => {
        if (!currentUser || !authToken) {
            throw new Error('Authentication required');
        }

        // Note: No rate limiting for public key upload - critical for E2EE
        const url = `${apiEndpoint}/keys`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ public_key: base64PublicKey }),
            });

            if (response.status === 404) {
                markEndpointAvailability('keys', false);
                throw new Error('Keys endpoint not available');
            }

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Failed to upload public key: ${error}`);
            }

            markEndpointAvailability('keys', true);
            return response.json();
        } catch (err) {
            console.error('[E2EE] Failed to upload public key:', err);
            throw err;
        }
    }, [currentUser, authToken, apiEndpoint, markEndpointAvailability]);

    /**
     * Generate new E2EE keys with password protection
     * @param password - Password to encrypt the private key (auto-derived from login if not provided)
     */
    const generateKeys = useCallback(async (password?: string): Promise<{ publicKey: string; secretKey: string } | null> => {
        if (!currentUser) {
            console.warn("Cannot generate keys: not logged in");
            return null;
        }

        // Note: No rate limiting for key generation - critical for E2EE

        if (keyGenerationAttempted) {
            return null;
        }

        // Use stored key password from session (derived from login) or provided password
        const storedKeyPassword = typeof window !== 'undefined'
            ? sessionStorage.getItem('e2ee_key_password')
            : null;
        const keyPwd = password || keyPassword || storedKeyPassword;

        if (!keyPwd) {
            // Don't show error - just log and let user re-login if needed
            console.warn("No key password available. User may need to re-login for E2EE.");
            setKeyStatus('unavailable');
            return null;
        }

        setKeyGenerationAttempted(true);

        try {
            setKeyStatus('generating');
            toast.loading("Generating encryption keys...");

            // Generate NaCl keypair and store in IndexedDB with password protection
            const keyPair = await generateAndStoreKeyPair(keyPwd);

            setSecretKey(keyPair.secretKey);
            setPublicKey(keyPair.publicKey);
            setKeyPassword(keyPwd);  // Cache for session
            setKeyStatus('available');

            // Upload public key to server - MUST complete for E2EE to work
            try {
                await uploadPublicKey(keyPair.publicKey);
            } catch (uploadErr) {
                console.error('[E2EE] Failed to upload public key:', uploadErr);
                // Still continue - keys are generated locally, upload can be retried
            }

            toast.dismiss();
            toast.success("Encryption keys generated successfully");

            // Return the keypair for immediate use (avoids React state timing issues)
            return keyPair;
        } catch (error) {
            console.error("Error generating keys:", error);
            setKeyStatus('unavailable');
            toast.dismiss();
            toast.error("Failed to generate encryption keys");
            return null;
        } finally {
            // Reset attempt flag after a delay if it failed, to allow retrying manually later
            if (keyStatus === 'unavailable') {
                setTimeout(() => setKeyGenerationAttempted(false), 10000);
            }
        }
    }, [currentUser, keyGenerationAttempted, keyPassword, uploadPublicKey, keyStatus, setKeyStatus, setSecretKey, setPublicKey, setKeyPassword, setKeyGenerationAttempted]);

    /**
     * Load keys from IndexedDB with password
     * @param password - Password to decrypt the private key
     */
    const loadKeys = async (password?: string) => {
        if (!currentUser) return;

        try {
            // Clean up old PGP keys from localStorage (migration from old system)
            if (typeof window !== 'undefined') {
                const oldPrivateKey = localStorage.getItem(`pgp-private-key-${currentUser.id}`);
                const oldPublicKey = localStorage.getItem(`pgp-public-key-${currentUser.id}`);
                if (oldPrivateKey || oldPublicKey) {
                    localStorage.removeItem(`pgp-private-key-${currentUser.id}`);
                    localStorage.removeItem(`pgp-public-key-${currentUser.id}`);
                }
            }

            // Check if keys exist in IndexedDB (validates NaCl format)
            const hasKeys = await hasStoredKeys();
            if (!hasKeys) {
                setKeyStatus('unavailable');
                return;
            }

            // Get public key (doesn't need password)
            const storedPublicKey = await getStoredPublicKey();
            if (storedPublicKey) {
                setPublicKey(storedPublicKey);
            }

            // If password provided or cached, decrypt secret key
            const pwd = password || keyPassword;
            if (pwd) {
                const keyPair = await retrieveKeyPair(pwd);
                if (keyPair) {
                    setSecretKey(keyPair.secretKey);
                    setPublicKey(keyPair.publicKey);
                    setKeyPassword(pwd);  // Cache for session
                    setKeyStatus('available');
                } else {
                    // Wrong password or corrupted keys
                    setKeyStatus('locked');
                }
            } else {
                // Keys exist but need password to unlock
                setKeyStatus('locked');
            }
        } catch (error) {
            console.error("Error loading keys:", error);
            setKeyStatus('unavailable');
        }
    };

    /**
     * Unlock keys with password (for existing keys)
     */
    const unlockKeys = async (password: string): Promise<boolean> => {
        try {
            const keyPair = await retrieveKeyPair(password);
            if (keyPair) {
                setSecretKey(keyPair.secretKey);
                setPublicKey(keyPair.publicKey);
                setKeyPassword(password);
                setKeyStatus('available');
                return true;
            }
            toast.error("Invalid password");
            return false;
        } catch (error) {
            console.error("Error unlocking keys:", error);
            toast.error("Failed to unlock keys");
            return false;
        }
    };

    const exportPublicKey = async (): Promise<string | null> => {
        if (!publicKey) {
            toast.error("No public key available");
            return null;
        }
        return publicKey;  // Already base64 encoded
    };

    return (
        <ChatContext.Provider
            value={{
                sendMessage,
                getMessages,
                editMessage,
                deleteMessage,
                addReaction,
                uploadMedia,
                authToken,
                friendId,
                setFriendId,
                messages,
                setMessages,
                getChatList,
                chatList,
                generateKeys,
                unlockKeys,
                loadKeys,
                exportPublicKey,
                keyStatus,
                fetchConversations,
                checkIfConversationExists,
                conversations,
                getFriendDetails,
                friendDetails,
                sendTypingIndicator,
                isTyping,
                isConnected: isConnected && socket !== null,
                ensureConversation,
                currentConversationId: currentConversationId,
                currentUser
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => useContext(ChatContext);

// Debug component to test for infinite re-renders