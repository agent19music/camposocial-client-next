"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import { createContext, ReactNode, useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import { toast } from 'react-hot-toast';
import { AuthContext } from "./authcontext";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebSocket as useWebSocketContext } from "./websocket-context";
import type { ChatContextType, ChatMedia, ChatMessage, ChatUser, ChatFriend, ChatConversation, ChatListUser, KeyStatus, KeyPair, SignalEncryptedMessage } from "@/types";
import { secureDB } from "../utils/secureStorage";

// Signal Protocol E2EE
import { useSignalE2EE } from "../hooks/useSignalE2EE";
import {
    registerDevice,
    getOrCreateDeviceId,
    getDeviceId,
    getBulkDeviceKeys,
    sendDeviceHeartbeat,
    DeviceKeysResponse
} from "../lib/deviceManager";



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

export default function ChatProvider({ children }: { children: ReactNode }) {
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const { currentUser: rawCurrentUser, authToken, isAuthenticated } = useContext(AuthContext);

    const currentUser = useMemo(() => {
        if (!rawCurrentUser) return null;
        const { id, first_name, last_name, email } = rawCurrentUser;
        return { id, firstName: first_name, lastName: last_name, email };
    }, [rawCurrentUser]);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [friendId, setFriendIdInternal] = useState<string | null>(null);
    const [friendDetails, setFriendDetails] = useState<ChatFriend | null>(null);

    const [chatList, setChatList] = useState<ChatListUser[]>([]);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

    // FIX: Ref to access current messages without stale closures in callbacks
    const messagesRef = useRef<ChatMessage[]>([]);

    // CRITICAL FIX: Wrap setFriendId to clear messages when switching conversations
    // This prevents old conversation messages from persisting in the UI
    const setFriendId = useCallback((newFriendId: string | null) => {
        setFriendIdInternal(prev => {
            // Only clear if actually switching to a different conversation
            if (prev !== newFriendId) {
                setMessages([]);  // Clear old messages immediately
                setIsTyping(false);  // Reset typing indicator
                setCurrentConversationId(null);  // Reset conversation ID
            }
            return newFriendId;
        });
    }, []);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // WebSocket integration
    const { socket, isConnected, joinConversationRoom } = useWebSocket();
    const { consumeOfflineConversationMessages } = useWebSocketContext();

    // Signal Protocol E2EE
    const signal = useSignalE2EE({
        apiEndpoint: apiEndpoint || '',
        authToken,
        userId: currentUser?.id || null,
        onKeysReady: () => {
            setKeysReady(true);
            keysReadyRef.current = true;
        },
    });

    // Map Signal keyStatus to legacy KeyStatus type  
    const keyStatus: KeyStatus = signal.state.isReady ? 'available' 
        : signal.state.keyStatus === 'generating' ? 'unavailable'
        : signal.state.keyStatus === 'error' ? 'unavailable'
        : 'unavailable';

    // FIX: keysReady state gates message processing until encryption keys are loaded
    // This prevents decryption failures when messages arrive before keys are ready
    const [keysReady, setKeysReady] = useState(false);

    // Keep ref in sync
    const keysReadyRef = useRef(false);

    // Multi-device E2EE: Track device registration status
    const [deviceRegistered, setDeviceRegistered] = useState(false);
    const currentDeviceIdRef = useRef<string | null>(null);

    // Cache of user device keys for multi-device encryption
    const deviceKeysCache = useRef<Record<string, DeviceKeysResponse[]>>({});

    // Pending decryption queue for messages arriving before keys are ready
    const pendingDecryptionQueueRef = useRef<Array<{
        messageData: any;
        conversationId: string;
        resolve: (msg: ChatMessage | null) => void;
    }>>([]);

    // Keep keysReady ref in sync
    useEffect(() => {
        keysReadyRef.current = keysReady;
    }, [keysReady]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

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

            // First, try to load cached decrypted previews for instant display
            const cachedPreviews = await secureDB.getAllConversationPreviews();
            const previewMap = new Map(cachedPreviews.map(p => [p.id, p]));

            const conversationsData = data.conversations?.map((conv: any) => {
                const convId = String(conv.conversation_id || conv.id);
                const lastMsg = conv.last_message;
                const cachedPreview = previewMap.get(convId);

                // Use cached decrypted preview if available and matches the message ID
                let displayContent = lastMsg?.content || null;
                if (lastMsg?.is_encrypted && cachedPreview &&
                    String(cachedPreview.lastMessageId) === String(lastMsg.id)) {
                    displayContent = cachedPreview.visibleContent;
                } else if (lastMsg?.is_encrypted) {
                    // Mark for decryption - will be processed by decryptConversationPreviews
                    displayContent = '🔒 Encrypted message';
                }

                return {
                    id: convId,
                    friendId: String(conv.friend?.id || conv.friend_id),
                    friendName: conv.friend?.display_name || conv.friend_name || `${conv.friend?.first_name || ''} ${conv.friend?.last_name || ''}`.trim(),
                    friendAvatar: conv.friend?.avatar || conv.friend_avatar || '/default-avatar.png',
                    lastMessage: displayContent,
                    lastMessageEncrypted: lastMsg?.is_encrypted || false,
                    lastMessageTime: lastMsg?.timestamp ? new Date(lastMsg.timestamp) : (conv.last_message_time ? new Date(conv.last_message_time) : null),
                    unreadCount: conv.unread_count || 0,
                    isEmpty: !lastMsg,
                    isOnline: Boolean(conv.friend?.is_online || conv.is_online),
                    // Store raw data for decryption
                    _rawLastMessage: lastMsg ? {
                        id: lastMsg.id,
                        content: lastMsg.content,
                        nonce: lastMsg.nonce,
                        senderPublicKey: lastMsg.sender_public_key,
                        isEncrypted: lastMsg.is_encrypted
                    } : null
                };
            }) || [];

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

            const initializeSignal = async () => {
                // Initialize Signal with stored password
                if (storedKeyPassword && !signal.state.isReady) {
                    await signal.initialize(storedKeyPassword);
                }
            };

            initializeSignal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.id, signal.state.isReady]); // Use stable currentUser.id

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

    // Auto-initialize Signal keys when user is authenticated and has password
    useEffect(() => {
        if (!currentUser?.id || !isAuthenticated || signal.state.isReady) return;
        
        // Check for stored key password in session
        const storedPassword = typeof window !== 'undefined'
            ? sessionStorage.getItem('e2ee_key_password')
            : null;
            
        if (storedPassword && !signal.state.isReady && signal.state.keyStatus === 'unavailable') {
            signal.initialize(storedPassword).catch(err => {
                console.error('[Signal] Auto-initialize failed:', err);
            });
        }
    }, [currentUser?.id, isAuthenticated, signal.state.isReady, signal.state.keyStatus]);

    // Signal-based message decryption
    const decryptMessage = useCallback(async (
        ciphertext: string,
        nonce: string | null, // Legacy NaCl nonce - ignored for Signal
        senderPublicKey: string | null, // Legacy - ignored for Signal
        signalPayload?: SignalEncryptedMessage, // Signal Protocol payload
        senderId?: string,
        senderDeviceId?: string
    ): Promise<string> => {
        // If we have a Signal payload, use Signal decryption
        if (signalPayload && senderId && senderDeviceId && signal.state.isReady) {
            try {
                const plaintext = await signal.decrypt(senderId, senderDeviceId, signalPayload);
                if (plaintext) {
                    return plaintext;
                }
                console.error("[Signal] Decryption returned null");
                return '[Unable to decrypt message]';
            } catch (error) {
                console.error("[Signal] Decryption failed:", error);
                return '[Unable to decrypt message]';
            }
        }

        // Legacy fallback: if message doesn't have Signal payload but has content
        // This handles old NaCl messages or unencrypted messages
        if (!signalPayload) {
            // Return ciphertext as-is (for display) since we can't decrypt legacy NaCl
            // messages without the old keys
            return ciphertext;
        }

        return ciphertext;
    }, [signal.state.isReady, signal.decrypt]);

    // Skip conversation preview decryption for now - Signal uses session-based decryption
    // which requires sender info that's not available in conversation previews
    // TODO: Add Signal message info to conversation preview data

    // CRITICAL FIX: Re-decrypt messages when Signal becomes ready
    // This handles the case where messages arrived before keys were loaded
    const reDecryptingRef = useRef(false);
    const processedMessageIdsRef = useRef(new Set<string | number>());

    useEffect(() => {
        // Use Signal ready state instead of legacy keysReady
        if (!signal.state.isReady || messages.length === 0) return;

        // Prevent concurrent re-decryption attempts
        if (reDecryptingRef.current) return;

        const reDecryptMessages = async () => {
            // Find messages that need re-decryption and haven't been processed yet
            const messagesToProcess = messages.filter(msg => {
                if (!msg.encrypted) return false;
                if (processedMessageIdsRef.current.has(msg.id)) return false;

                // Skip own messages - we cache plaintext locally
                if (String(msg.senderId) === String(currentUser?.id)) return false;

                const needsReDecrypt = msg.content === '🔒 Encrypted message' ||
                    msg.content === '[Unable to decrypt message]' ||
                    (msg.ciphertext && msg.content === msg.ciphertext);
                return needsReDecrypt;
            });

            if (messagesToProcess.length === 0) return;

            reDecryptingRef.current = true;

            // Build a map of decrypted content by message ID
            const decryptedMap = new Map<string | number, string>();

            try {
                await Promise.all(
                    messagesToProcess.map(async (msg) => {
                        // For Signal messages, we need the Signal payload
                        const signalPayload = msg.signalPayload;
                        const senderId = msg.senderId;
                        const senderDeviceId = msg.senderDeviceId;

                        // If we have Signal payload, decrypt with Signal
                        if (signalPayload && senderId && senderDeviceId) {
                            try {
                                const plaintext = await signal.decrypt(String(senderId), senderDeviceId, signalPayload);
                                if (plaintext) {
                                    decryptedMap.set(msg.id, plaintext);
                                    processedMessageIdsRef.current.add(msg.id);
                                }
                            } catch (e) {
                                console.error('[Signal] Re-decrypt failed for message:', msg.id, e);
                                processedMessageIdsRef.current.add(msg.id);
                            }
                        } else {
                            // No Signal payload - mark as processed (legacy message)
                            processedMessageIdsRef.current.add(msg.id);
                        }
                    })
                );

                // CRITICAL: Use functional update to avoid overwriting new messages
                if (decryptedMap.size > 0) {
                    setMessages(prevMessages =>
                        prevMessages.map(msg => {
                            const decrypted = decryptedMap.get(msg.id);
                            return decrypted ? { ...msg, content: decrypted } : msg;
                        })
                    );
                }
            } finally {
                reDecryptingRef.current = false;
            }
        };

        reDecryptMessages();
    }, [signal.state.isReady, messages.length, signal.decrypt]);

    // Clear processed message IDs when conversation changes
    useEffect(() => {
        processedMessageIdsRef.current.clear();
    }, [friendId]);

    // Clear processed message IDs when Signal becomes ready to allow retry
    useEffect(() => {
        if (signal.state.isReady) {
            processedMessageIdsRef.current.clear();
        }
    }, [signal.state.isReady]);

    // CRITICAL FIX: WebSocket effect for real-time messaging with proper cleanup
    useEffect(() => {
        if (!socket || !isConnected) return;

        const buildIncomingMessage = async (messageData: any): Promise<ChatMessage | null> => {
            const ciphertext = messageData.ciphertext || messageData.content;
            let decrypted: string;

            // Try Signal decryption if we have a Signal payload
            const signalPayload = messageData.signal_payload as SignalEncryptedMessage | undefined;
            const senderId = String(messageData.sender_id);
            const senderDeviceId = messageData.sender_device_id || '1';

            if (messageData.encrypted && signalPayload && signal.state.isReady) {
                try {
                    const plaintext = await signal.decrypt(senderId, senderDeviceId, signalPayload);
                    decrypted = plaintext || '🔒 Encrypted message';
                } catch (e) {
                    console.error('[Signal] Decryption failed:', e);
                    decrypted = '🔒 Encrypted message';
                }
            } else if (messageData.encrypted) {
                // Encrypted but no Signal payload or Signal not ready
                decrypted = '🔒 Encrypted message';
            } else {
                decrypted = messageData.content || ciphertext || '';
            }

            return {
                id: messageData.id,
                senderId: String(messageData.sender_id),
                content: decrypted,
                ciphertext,
                // Signal-specific fields for re-decryption
                signalPayload: signalPayload,
                senderDeviceId: senderDeviceId,
                timestamp: new Date(messageData.timestamp),
                media: (messageData.media || []).map((item: any) => ({
                    id: item.id,
                    url: item.url,
                    type: item.type,
                    metadata: item.metadata || {},
                })),
                reactions: (messageData.reactions || []).map((reaction: any) => ({
                    userId: String(reaction.user_id),
                    reactionType: reaction.reaction_type,
                })),
                // Process reply_details from server if available, otherwise just use ID
                replyTo: messageData.reply_details ? {
                    id: String(messageData.reply_details.id),
                    content: messageData.reply_details.is_encrypted
                        ? '🔒 Encrypted message'  // Reply content is encrypted, show placeholder
                        : (messageData.reply_details.content || ''),
                    senderName: messageData.reply_details.sender_name || 'Unknown'
                } : (messageData.reply_to ? { id: String(messageData.reply_to), content: '', senderName: '' } : undefined),
                isSent: String(messageData.sender_id) === String(currentUser?.id),
                isRead: Boolean(messageData.is_read),
                encrypted: messageData.encrypted,
                isEdited: messageData.is_edited || false,
                isDeleted: messageData.is_deleted || false,
            };
        };

        const handleNewMessage = async (messageData: any) => {
            const incomingConversation = String(messageData.conversation_id);
            const isActiveConversation = currentConversationId && incomingConversation === String(currentConversationId);

            // FIX: Helper to update conversation preview optimistically instead of refetching
            const updateConversationPreview = (decryptedContent: string | null, incrementUnread: boolean) => {
                setConversations(prev => prev.map(conv => {
                    if (String(conv.id) !== incomingConversation) return conv;

                    // Determine the preview text
                    let previewText = decryptedContent;
                    if (!previewText && messageData.encrypted) {
                        previewText = '🔒 Encrypted message';
                    } else if (!previewText) {
                        previewText = messageData.content || '';
                    }

                    return {
                        ...conv,
                        lastMessage: previewText,
                        lastMessageTime: new Date(messageData.timestamp),
                        lastMessageEncrypted: messageData.encrypted || false,
                        unreadCount: incrementUnread ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
                        // Store raw data for potential re-decryption
                        _rawLastMessage: {
                            id: messageData.id,
                            content: messageData.ciphertext || messageData.content,
                            nonce: messageData.nonce,
                            senderPublicKey: messageData.sender_public_key,
                            isEncrypted: messageData.encrypted
                        }
                    };
                }));
            };

            // CRITICAL FIX: Skip processing our own messages from WebSocket broadcast
            // We already handle them via optimistic update + API response confirmation
            // Processing them here would cause:
            // 1. Duplicate messages for the sender
            // 2. Race conditions with optimistic updates
            // 3. State replacement issues that cause recipient's messages to disappear
            if (String(messageData.sender_id) === String(currentUser?.id)) {
                // FIX: Update conversation preview optimistically instead of refetching
                // For own messages, we already have the plaintext content
                updateConversationPreview(messageData.content, false);
                return;
            }

            // Build the decrypted message first (for both preview and message list)
            const newMessage = await buildIncomingMessage(messageData);
            const decryptedContent = newMessage?.content || null;

            if (!isActiveConversation) {
                // FIX: Update conversation preview optimistically instead of refetching
                updateConversationPreview(decryptedContent, true);
                if (messageData.sender_username) {
                    toast.success(`New message from ${messageData.sender_username}`);
                } else {
                    toast.success('New message received');
                }
                return;
            }

            // Active conversation - update preview and add message to list
            // FIX: Update conversation preview optimistically instead of refetching
            updateConversationPreview(decryptedContent, false);

            if (!newMessage) {
                return;
            }

            setMessages(prev => prev.some(msg => String(msg.id) === String(newMessage.id)) ? prev : [...prev, newMessage]);
        };

        const handleUserTyping = (data: any) => {
            // Normalize IDs to strings for comparison
            if (String(data.user_id) === String(friendId) && String(data.conversation_id) === String(currentConversationId)) {
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

        const handleMessageEdit = async (data: any) => {
            // For Signal E2EE: Try to decrypt edited content
            let decryptedContent = data.new_content;

            // Find the original message to get Signal payload info
            const originalMsg = messagesRef.current.find(m => m.id === data.message_id);

            if (originalMsg?.encrypted && signal.state.isReady && data.signal_payload) {
                try {
                    const plaintext = await signal.decrypt(
                        String(originalMsg.senderId), 
                        originalMsg.senderDeviceId || '1', 
                        data.signal_payload
                    );
                    if (plaintext) {
                        decryptedContent = plaintext;
                    }
                } catch (error) {
                    console.error('[Signal] Failed to decrypt edited message:', error);
                }
            }

            setMessages(prev => prev.map(msg =>
                msg.id === data.message_id
                    ? { ...msg, content: decryptedContent, isEdited: true }
                    : msg
            ));
        };
        socket.on('message_edited', handleMessageEdit);

        const handleMessageDelete = (data: any) => {
            // Soft delete - mark as deleted instead of removing
            setMessages(prev => prev.map(msg =>
                msg.id === data.message_id
                    ? { ...msg, isDeleted: true, content: '' }
                    : msg
            ));
        };
        socket.on('message_deleted', handleMessageDelete);

        const handleFriendRequestAccepted = (data: any) => {
            // Refresh conversations immediately when a friend request is accepted
            fetchConversations();
            // Toast removed to prevent duplicate - usercontext.tsx already shows toast on accept action
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
    }, [socket, isConnected, friendId, currentUser?.id, currentConversationId, decryptMessage, fetchConversations]); // fetchFriendPublicKey accessed via ref

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

    // Signal Protocol handles key exchange via prekey bundles
    // No need for legacy fetchFriendPublicKey

    /**
     * Signal Protocol encryption for a single recipient device
     */
    const encryptMessage = useCallback(async (
        content: string,
        recipientId: string,
        recipientDeviceId: string = '1'
    ): Promise<{
        signalPayload: SignalEncryptedMessage | null;
        isEncrypted: boolean;
    }> => {
        // Check if Signal is ready
        if (!signal.state.isReady) {
            console.warn("[Signal] Not ready for encryption. Sending unencrypted.");
            return { signalPayload: null, isEncrypted: false };
        }

        try {
            const signalPayload = await signal.encrypt(recipientId, recipientDeviceId, content);
            if (signalPayload) {
                return { signalPayload, isEncrypted: true };
            }
            console.warn("[Signal] Encryption returned null");
            return { signalPayload: null, isEncrypted: false };
        } catch (error) {
            console.error("[Signal] Encryption error:", error);
            return { signalPayload: null, isEncrypted: false };
        }
    }, [signal.state.isReady, signal.encrypt]);

    /**
     * Encrypt a message for all devices of both sender and recipient using Signal Protocol.
     * Each device gets its own Signal-encrypted payload.
     */
    const encryptForDevices = useCallback(async (
        content: string,
        recipientId: string
    ): Promise<{
        signal_payloads: Record<string, SignalEncryptedMessage>;
        fallback_content: string;
        isEncrypted: boolean;
    }> => {
        // If Signal not ready, send unencrypted
        if (!signal.state.isReady) {
            console.warn("[Signal] Not ready for encryption. Sending unencrypted.");
            return {
                signal_payloads: {},
                fallback_content: content,
                isEncrypted: false
            };
        }

        try {
            // Use Signal's encryptForAllDevices which handles device discovery
            const signalPayloads = await signal.encryptForAllDevices(recipientId, content);
            
            const anyEncrypted = Object.keys(signalPayloads).length > 0;
            
            return {
                signal_payloads: signalPayloads,
                fallback_content: content, // Keep plaintext for caching own messages
                isEncrypted: anyEncrypted
            };
        } catch (error) {
            console.error("[Signal] Multi-device encryption error:", error);
            return {
                signal_payloads: {},
                fallback_content: content,
                isEncrypted: false
            };
        }
    }, [signal.state.isReady, signal.encryptForAllDevices]);

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
                type QueuedPayload = {message?: Record<string, unknown>; ciphertext?: string; content?: string; nonce?: string; sender_public_key?: string; id?: number; sender_id?: string; timestamp?: string; media?: unknown[]; is_read?: boolean; encrypted?: boolean; reactions?: unknown[]; reply_details?: {id: number; is_encrypted?: boolean; content?: string; sender_name?: string}; reply_to?: number};
                for (const payload of queued as QueuedPayload[]) {
                    const normalized = (payload.message || payload) as QueuedPayload;
                    
                    // Skip messages without required fields
                    if (!normalized.id || !normalized.sender_id) continue;
                    
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
                        content: decrypted || '',
                        ciphertext,
                        nonce,
                        timestamp: new Date(normalized.timestamp || Date.now()),
                        media: (normalized.media || []).map((item) => {
                            const mediaItem = item as {url?: string; type?: string};
                            return {
                                url: mediaItem.url || '',
                                type: mediaItem.type || 'file',
                            };
                        }),
                        reactions: (normalized.reactions || []).map((reaction) => {
                            const r = reaction as {user_id?: string; reaction_type?: string};
                            return {
                                userId: r.user_id || '',
                                reactionType: r.reaction_type || '',
                            };
                        }),
                        // Process reply_details from server if available
                        replyTo: normalized.reply_details ? {
                            id: String(normalized.reply_details.id),
                            content: normalized.reply_details.is_encrypted
                                ? '🔒 Encrypted message'
                                : (normalized.reply_details.content || ''),
                            senderName: normalized.reply_details.sender_name || 'Unknown'
                        } : (normalized.reply_to ? { id: String(normalized.reply_to), content: '', senderName: '' } : undefined),
                        isSent: normalized.sender_id === currentUser?.id,
                        isRead: Boolean(normalized.is_read),
                        encrypted: Boolean(normalized.encrypted),
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

        // Auto-initialize Signal if we have a stored password but Signal isn't ready
        if (!signal.state.isReady && keyStatus === 'unavailable') {
            const storedKeyPassword = typeof window !== 'undefined'
                ? sessionStorage.getItem('e2ee_key_password')
                : null;
            if (storedKeyPassword) {
                try {
                    await signal.initialize(storedKeyPassword);
                } catch (e) {
                    console.warn('[Signal] Could not auto-initialize:', e);
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
                        // Upload each file individually as the server expects 'file' key
                        for (const file of Array.from(media)) {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('conversation_id', conversationId);

                            const uploadResponse = await fetch(`${apiEndpoint}/media/upload`, {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${authToken}`,
                                },
                                body: formData,
                            });

                            if (uploadResponse.ok) {
                                const uploadResult = await uploadResponse.json();
                                if (uploadResult.file_id && uploadResult.url) {
                                    uploadedMedia.push({
                                        url: uploadResult.url,
                                        type: uploadResult.type || 'file'
                                    });
                                }
                                markEndpointAvailability('upload', true);
                            }
                        }
                    } catch (uploadError) {
                        console.error("Error uploading media:", uploadError);
                    } finally {
                        markRequestEnd('upload_media');
                    }
                }
            }

            // Signal Protocol E2EE: Encrypt for all recipient and sender devices
            const {
                signal_payloads,
                fallback_content,
                isEncrypted
            } = await encryptForDevices(content, friendId);

            // Get the first Signal payload for the primary ciphertext (fallback for server storage)
            const primaryPayload = Object.values(signal_payloads)[0];
            const ciphertext = primaryPayload?.ciphertext || content;

            const optimisticMessage: ChatMessage = {
                id: Date.now(),
                senderId: currentUser.id,
                content: content,  // Store plaintext locally for optimistic UI
                ciphertext,
                timestamp: new Date(),
                media: uploadedMedia,
                reactions: [],
                replyTo: replyTo,
                isSent: false,
                isRead: false,
                encrypted: isEncrypted,
                senderDeviceId: signal.state.deviceId || undefined,
            };

            setMessages(prev => [...prev, optimisticMessage]);

            const response = await fetch(`${apiEndpoint}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    content: ciphertext,
                    recipient_id: friendId,
                    conversation_id: conversationId,
                    media: uploadedMedia,
                    reply_to: replyTo,
                    encrypted: isEncrypted,
                    // Signal Protocol: message type and device info
                    message_type: isEncrypted ? 'signal' : 'plaintext',
                    sender_device_id: signal.state.deviceId,
                    // Signal Protocol: Per-device encrypted payloads
                    signal_payloads: Object.keys(signal_payloads).length > 0 ? signal_payloads : undefined
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
                    }
                    : msg
            ));

            // Cache plaintext for own sent messages to IndexedDB
            // This allows us to retrieve the plaintext later
            try {
                await secureDB.cacheMessage({
                    id: String(result.message_id),
                    conversationId: conversationId,
                    content: content,  // Store PLAINTEXT, not ciphertext
                    senderId: String(currentUser.id),
                    timestamp: new Date(result.message_data.timestamp),
                    encrypted: false,  // Mark as NOT encrypted (it's plaintext cache)
                    isSent: true,
                    isRead: false
                });
            } catch (e) {
                console.warn('Failed to cache sent message plaintext:', e);
            }

            markEndpointAvailability('messages', true);

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            markRequestEnd('send_message');
        }
    }, [friendId, currentUser, authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, markEndpointAvailability, ensureConversation, encryptForDevices, keyStatus, signal.state.isReady, signal.state.deviceId, signal.initialize]);

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

            // Multi-device E2EE: Include device ID to get device-specific ciphertexts
            const deviceId = currentDeviceIdRef.current || getDeviceId();
            if (deviceId) {
                url.searchParams.append('device_id', deviceId);
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

            // FIX: Use ref to get current messages without stale closure issues
            const currentMessages = messagesRef.current;

            const messagesData = await Promise.all((data.messages || []).map(async (msg: any) => {
                const ciphertext = msg.ciphertext || msg.content;
                const isOwnMessage = String(msg.sender_id) === String(currentUser.id);

                // Decrypt if encrypted
                let decryptedContent = ciphertext;

                // Signal Protocol: Check for Signal payload
                const signalPayload = msg.signal_payload as SignalEncryptedMessage | undefined;
                const senderDeviceId = msg.sender_device_id || '1';

                if (isOwnMessage && msg.encrypted) {
                    // For own messages, try to get cached plaintext first
                    const existingMsg = currentMessages.find(m => String(m.id) === String(msg.id));
                    if (existingMsg && existingMsg.content &&
                        existingMsg.content !== '[Unable to decrypt message]' &&
                        existingMsg.content !== '🔒 Encrypted message' &&
                        existingMsg.content !== ciphertext) {
                        decryptedContent = existingMsg.content;
                    } else {
                        // Check IndexedDB cache for plaintext
                        try {
                            const cachedMsg = await secureDB.messages.get(String(msg.id));
                            if (cachedMsg && cachedMsg.content &&
                                cachedMsg.content !== ciphertext &&
                                !cachedMsg.encrypted) {
                                decryptedContent = cachedMsg.content;
                            } else {
                                decryptedContent = '[Sent message]';
                            }
                        } catch {
                            decryptedContent = '[Sent message]';
                        }
                    }
                } else if (msg.encrypted && signalPayload && signal.state.isReady) {
                    // Signal Protocol decryption
                    try {
                        const plaintext = await signal.decrypt(
                            String(msg.sender_id),
                            senderDeviceId,
                            signalPayload
                        );
                        decryptedContent = plaintext || '🔒 Encrypted message';
                    } catch (e) {
                        console.error('[Signal] Decryption failed:', e);
                        decryptedContent = '🔒 Encrypted message';
                    }
                } else if (msg.encrypted) {
                    // Encrypted but no Signal payload or Signal not ready
                    decryptedContent = '🔒 Encrypted message';
                }

                return {
                    id: msg.id,
                    senderId: String(msg.sender_id),
                    content: decryptedContent,
                    ciphertext,
                    signalPayload,
                    senderDeviceId,
                    timestamp: new Date(msg.timestamp),
                    media: (msg.media || []).map((mediaItem: any) => ({
                        url: mediaItem.url,
                        type: mediaItem.type,
                    })),
                    reactions: (msg.reactions || []).map((reaction: any) => ({
                        userId: String(reaction.user_id),
                        reactionType: reaction.reaction_type
                    })),
                    // Process reply_details from server if available
                    replyTo: msg.reply_details ? {
                        id: String(msg.reply_details.id),
                        content: msg.reply_details.is_encrypted
                            ? '🔒 Encrypted message'
                            : (msg.reply_details.content || ''),
                        senderName: msg.reply_details.sender_name || 'Unknown'
                    } : (msg.reply_to ? { id: String(msg.reply_to), content: '', senderName: '' } : undefined),
                    isSent: isOwnMessage,
                    isRead: msg.is_read,
                    encrypted: msg.encrypted,
                    isEdited: msg.is_edited || false,
                    isDeleted: msg.is_deleted || false
                };
            }));

            if (!lastMessageId) {
                // CRITICAL FIX: Merge server messages with any WebSocket messages that arrived
                // during the fetch, instead of replacing everything
                const reversedData = messagesData.reverse();
                setMessages(prevMessages => {
                    // Create a map of server message IDs for quick lookup
                    const serverMessageIds = new Set(reversedData.map(m => String(m.id)));

                    // Keep any messages that arrived via WebSocket but aren't in server response
                    // (these are newer messages that arrived during the fetch)
                    const wsOnlyMessages = prevMessages.filter(
                        m => !serverMessageIds.has(String(m.id))
                    );

                    // Merge: server messages + any WebSocket-only messages, sorted by timestamp
                    const merged = [...reversedData, ...wsOnlyMessages].sort(
                        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );

                    return merged;
                });
            }

            return messagesData;
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        } finally {
            fetchingMessagesRef.current = false;
            markRequestEnd('get_messages');
        }
    }, [currentUser, authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, markEndpointAvailability, ensureConversation, setMessagesCallback, signal.state.isReady, signal.decrypt]);

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

        // Store original content for rollback
        const originalMessage = messages.find(m => m.id === messageId);
        const originalContent = originalMessage?.content;

        // Optimistic update
        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, content: newContent, isEdited: true }
                : msg
        ));

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
                // Revert optimistic update
                if (originalContent !== undefined) {
                    setMessages(prev => prev.map(msg =>
                        msg.id === messageId
                            ? { ...msg, content: originalContent, isEdited: originalMessage?.isEdited }
                            : msg
                    ));
                }
                throw new Error('Message editing not available');
            }

            if (!response.ok) {
                // Revert optimistic update
                if (originalContent !== undefined) {
                    setMessages(prev => prev.map(msg =>
                        msg.id === messageId
                            ? { ...msg, content: originalContent, isEdited: originalMessage?.isEdited }
                            : msg
                    ));
                }
                throw new Error('Failed to edit message');
            }

            markEndpointAvailability('messages', true);
            toast.success('Message edited');
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

        // Optimistic update - mark message as deleted in UI immediately
        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, isDeleted: true, content: '' }
                : msg
        ));

        try {
            const response = await fetch(`${apiEndpoint}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (response.status === 404) {
                markEndpointAvailability('messages', false);
                // Revert optimistic update
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, isDeleted: false }
                        : msg
                ));
                throw new Error('Message deletion not available');
            }

            if (!response.ok) {
                // Revert optimistic update
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId
                        ? { ...msg, isDeleted: false }
                        : msg
                ));
                throw new Error('Failed to delete message');
            }

            markEndpointAvailability('messages', true);
            toast.success('Message deleted');
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

    const uploadMedia = useCallback(async (files: FileList, conversationId?: string) => {
        if (!currentUser || !authToken || !canMakeRequest('upload_media')) {
            throw new Error('Cannot upload media');
        }

        markRequestStart('upload_media');

        try {
            const uploadedMedia: { url: string; type: string }[] = [];

            // Upload each file individually as the server expects 'file' key
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);
                if (conversationId) {
                    formData.append('conversation_id', conversationId);
                }

                const response = await fetch(`${apiEndpoint}/media/upload`, {
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

                const result = await response.json();
                if (result.file_id && result.url) {
                    uploadedMedia.push({
                        url: result.url,
                        type: result.type || 'file'
                    });
                }
            }

            markEndpointAvailability('upload', true);
            return uploadedMedia;
        } catch (error) {
            console.error("Error uploading media:", error);
            throw error;
        } finally {
            markRequestEnd('upload_media');
        }
    }, [currentUser, authToken, canMakeRequest, markRequestStart, apiEndpoint, markEndpointAvailability, markRequestEnd]);



    /**
     * Upload public key with exponential backoff retry
     * This is critical for E2EE - if upload fails, recipients can't decrypt our messages
     */
    const uploadPublicKey = useCallback(async (
        base64PublicKey: string,
        maxRetries: number = 3
    ): Promise<{ success: boolean; data?: any }> => {
        if (!currentUser || !authToken) {
            throw new Error('Authentication required');
        }

        const url = `${apiEndpoint}/keys`;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Exponential backoff: 0ms, 1000ms, 2000ms
                if (attempt > 0) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

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
                    const errorText = await response.text();
                    throw new Error(`Failed to upload public key: ${errorText}`);
                }

                markEndpointAvailability('keys', true);
                const data = await response.json();

                // Legacy keys endpoint - Signal uses its own /signal/keys endpoint
                return { success: true, data };
            } catch (err) {
                lastError = err as Error;
                console.error(`[E2EE] Upload attempt ${attempt + 1}/${maxRetries} failed:`, err);

                // Don't retry on 404 (endpoint doesn't exist)
                if (lastError.message.includes('not available')) {
                    break;
                }
            }
        }

        console.error('[E2EE] All upload attempts failed:', lastError);
        return { success: false };
    }, [currentUser, authToken, apiEndpoint, markEndpointAvailability]);

    /**
     * Generate/initialize Signal Protocol E2EE keys with password protection
     * @param password - Password to encrypt the keys (auto-derived from login if not provided)
     */
    const generateKeys = useCallback(async (password?: string): Promise<{ publicKey: string; secretKey: string } | null> => {
        if (!currentUser) {
            console.warn("Cannot generate keys: not logged in");
            return null;
        }

        // Use stored key password from session (derived from login) or provided password
        const storedKeyPassword = typeof window !== 'undefined'
            ? sessionStorage.getItem('e2ee_key_password')
            : null;
        const keyPwd = password || storedKeyPassword;

        if (!keyPwd) {
            console.warn("No key password available. User may need to re-login for E2EE.");
            return null;
        }

        try {
            toast.loading("Initializing Signal encryption...");

            const success = await signal.initialize(keyPwd);
            
            toast.dismiss();

            if (success) {
                toast.success("Signal encryption initialized");
                // Return a dummy keypair for backwards compatibility
                // Signal uses identity keys internally
                return { publicKey: 'signal', secretKey: 'signal' };
            } else {
                toast.error("Failed to initialize Signal encryption");
                return null;
            }
        } catch (error) {
            console.error("[Signal] Error initializing:", error);
            toast.dismiss();
            toast.error("Failed to initialize encryption");
            return null;
        }
    }, [currentUser, signal.initialize]);

    /**
     * Load Signal keys from IndexedDB with password
     * @param password - Password to decrypt the keys
     */
    const loadKeys = useCallback(async (password?: string) => {
        if (!currentUser) return;

        const storedKeyPassword = typeof window !== 'undefined'
            ? sessionStorage.getItem('e2ee_key_password')
            : null;
        const keyPwd = password || storedKeyPassword;

        if (!keyPwd) {
            console.warn("[Signal] No password for key loading");
            return;
        }

        try {
            await signal.initialize(keyPwd);
        } catch (error) {
            console.error("[Signal] Error loading keys:", error);
        }
    }, [currentUser, signal.initialize]);

    /**
     * Unlock Signal keys with password (for existing keys)
     */
    const unlockKeys = useCallback(async (password: string): Promise<boolean> => {
        try {
            const success = await signal.initialize(password);
            if (!success) {
                toast.error("Invalid password or initialization failed");
            }
            return success;
        } catch (error) {
            console.error("[Signal] Error unlocking keys:", error);
            toast.error("Failed to unlock keys");
            return false;
        }
    }, [signal.initialize]);

    const exportPublicKey = useCallback(async (): Promise<string | null> => {
        if (!signal.state.isReady) {
            toast.error("Signal not initialized");
            return null;
        }
        // Signal uses different key format - return device ID as identifier
        return signal.state.deviceId || null;
    }, [signal.state.isReady, signal.state.deviceId]);

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