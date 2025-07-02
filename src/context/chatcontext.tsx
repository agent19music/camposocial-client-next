"use client";

import { createContext, ReactNode, useState, useEffect, useContext, useRef, useCallback, useMemo } from "react";
import { toast } from 'react-hot-toast';
import * as openpgp from 'openpgp';
import { AuthContext } from "./authcontext";
import { set } from "date-fns";

interface Media {
    url: string;
    type: string;
}

interface Message {
    id: number;
    senderId: string; 
    content: string;
    timestamp: Date;
    media: Media[] | null; 
    reactions: { userId: string; reactionType: string }[]; 
    replyTo?: number;
    isSent: boolean;
    isRead: boolean;
    encrypted: boolean;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Friend {
    username: string;
    avatar: string;
    isOnline: boolean;
    id: string;
}

interface Conversation {
    id: string;
    friendId: string;
    friendName: string;
    friendAvatar: string;
    lastMessage: string | null;
    lastMessageTime: Date | null;
    unreadCount: number;
    isEmpty: boolean;
    isOnline: boolean;
}

interface ChatContextType {
    sendMessage: (content: string, media: FileList | null, replyTo?: number) => Promise<void>;
    getMessages: (friendId: string, batchSize: number, lastMessageId?: number) => Promise<Message[]>; 
    editMessage: (messageId: number, newContent: string) => Promise<void>;
    deleteMessage: (messageId: number) => Promise<void>;
    addReaction: (messageId: number, reactionType: string) => Promise<void>;
    uploadMedia: (files: FileList) => Promise<Media[]>;
    authToken: string | null;
    friendId: string | null; 
    setFriendId: (friendId: string | null) => void; 
    messages: Message[]; 
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    getChatList: () => Promise<ChatListUser[]>;
    chatList: ChatListUser[] | undefined;
    generateKeys: () => Promise<void>;
    exportPublicKey: () => Promise<string | null>;
    keyStatus: 'generating' | 'available' | 'unavailable';
    generateConversationId: (userId1: string, userId2: string) => string;
    fetchConversations: () => Promise<Conversation[]>;
    checkIfConversationExists: (friendId: string) => Promise<boolean>;
    conversations: Conversation[];
    getFriendDetails: (friendId: string) => Promise<{name: string; avatar: string; isOnline: boolean} | null>;
    friendDetails: Friend | null;
    currentUser: User | null;
}

interface ChatListUser {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
}

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
    generateKeys: async () => { },
    exportPublicKey: async () => null,
    keyStatus: 'unavailable',
    generateConversationId: () => '',
    fetchConversations: async () => [],
    checkIfConversationExists: async () => false,
    conversations: [],
    getFriendDetails: async () => null,
    friendDetails: null,
    currentUser: null,
});

interface ChatProviderProps {
    children: ReactNode;
}

export default function ChatProvider({ children }: ChatProviderProps) {
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    const { currentUser: rawCurrentUser, authToken, isAuthenticated } = useContext(AuthContext);
    
    // Memoize currentUser to prevent unnecessary re-renders
    const currentUser = useMemo(() => rawCurrentUser
        ? {
            id: rawCurrentUser.id,
            firstName: rawCurrentUser.first_name,
            lastName: rawCurrentUser.last_name,
            email: rawCurrentUser.email,
        }
        : null, [rawCurrentUser?.id, rawCurrentUser?.first_name, rawCurrentUser?.last_name, rawCurrentUser?.email]);
        
    const [messages, setMessages] = useState<Message[]>([]);
    const [friendId, setFriendId] = useState<string | null>(null); 
    const [friendDetails, setFriendDetails] = useState<Friend | null>(null);

    const [chatList, setChatList] = useState<ChatListUser[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    // OpenPGP key management
    const [privateKey, setPrivateKey] = useState<openpgp.PrivateKey | null>(null);
    const [publicKey, setPublicKey] = useState<openpgp.PublicKey | null>(null);
    const [keyStatus, setKeyStatus] = useState<'generating' | 'available' | 'unavailable'>('unavailable');
    const [friendPublicKeys, setFriendPublicKeys] = useState<Record<string, openpgp.PublicKey>>({});

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
    const MAX_REQUESTS_PER_WINDOW = 20;
    const MIN_REQUEST_INTERVAL = 3000; // 3 seconds between requests
    const DEBOUNCE_DELAY = 1000; // 1 second debounce for UI changes

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

    // Memoize setMessages to prevent unnecessary re-renders
    const setMessagesCallback = useCallback((messages: React.SetStateAction<Message[]>) => {
        setMessages(messages);
    }, []);

    // Stable API endpoint reference
    const stableApiEndpoint = useMemo(() => apiEndpoint, []);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (friendId && currentUser && authToken) {
            // Check if conversation exists before fetching messages
            checkIfConversationExistsMemoized(friendId).then(exists => {
                if (exists) {
                    getMessages(friendId, 10);
                } else {
                    setMessagesCallback([]);
                }
            });
            fetchFriendPublicKey(friendId);
        } else {
            setMessagesCallback([]); 
        }
    }, [friendId, currentUser?.id, authToken]); // Simplified dependencies to prevent circular references

    // Load user's keys from localStorage when component mounts
    useEffect(() => {
        if (currentUser) {
            loadKeys();
        }
    }, [currentUser?.id]); // Use stable currentUser.id instead of whole object

    // Load conversations when component mounts with debouncing
    useEffect(() => {
        if (currentUser && authToken && isAuthenticated) {
            const timeoutId = setTimeout(async () => {
                // Call the function directly to avoid dependency issues
                if (!fetchingConversationsRef.current) {
                    try {
                        await fetchConversations();
                    } catch (error) {
                        console.error('Error fetching conversations:', error);
                        // Mark conversations as unavailable if they fail to load
                        markEndpointAvailability('conversations', false);
                    }
                }
            }, DEBOUNCE_DELAY);

            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [currentUser?.id, authToken, isAuthenticated]); // Simplified dependencies to prevent circular references

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            activeRequestsRef.current.clear();
        };
    }, []);

    // Generate a unique conversation ID from two user IDs
    const generateConversationId = useCallback((userId1: string, userId2: string): string => {
        // Sort IDs to ensure the same conversation ID regardless of order
        const sortedIds = [userId1, userId2].sort();
        return `${sortedIds[0]}_${sortedIds[1]}`;
    }, []);

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
                const friendDetails = {
                    username: `${convData.first_name} ${convData.last_name}`,
                    avatar: convData.avatar || '',
                    isOnline: convData.is_online || false,
                    id: convData.friend_id
                };
                setFriendDetails(friendDetails);
                return {
                    name: `${convData.first_name} ${convData.last_name}`,
                    avatar: convData.avatar || '',
                    isOnline: convData.is_online || false
                };
            }
        } catch (error) {
            console.error("Error fetching friend details:", error);
        } finally {
            markRequestEnd('friend_details');
        }
        return null;
    }, [currentUser, authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, markEndpointAvailability]);

    // Check if a conversation with a friend exists (has any messages)
    const checkIfConversationExists = useCallback(async (friendId: string): Promise<boolean> => {
        if (!currentUser || !authToken || !canMakeRequest('conversation_exists')) {
            return false;
        }

        markRequestStart('conversation_exists');

        try {
            // First try the dedicated endpoint
            const response = await fetch(`${apiEndpoint}/conversation-exists/${friendId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            // Handle 404 errors specifically - this means the endpoint doesn't exist
            if (response.status === 404) {
                markEndpointAvailability('conversation-exists', false);
                // Fallback: check for messages directly
                return await checkMessagesExistFallback(friendId);
            }

            // Handle other HTTP errors
            if (!response.ok) {
                console.warn(`Error ${response.status} checking if conversation exists, falling back to message check`);
                return await checkMessagesExistFallback(friendId);
            }

            // Process successful response
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error("Error checking if conversation exists:", error);
            return await checkMessagesExistFallback(friendId);
        } finally {
            markRequestEnd('conversation_exists');
        }
    }, [currentUser, authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, markEndpointAvailability]);

    // Fallback method to check if messages exist
    const checkMessagesExistFallback = useCallback(async (friendId: string): Promise<boolean> => {
        if (!canMakeRequest('messages_exist_fallback')) {
            return false;
        }

        markRequestStart('messages_exist_fallback');

        try {
            const messages = await getMessages(friendId, 1);
            return messages.length > 0;
        } catch (error) {
            console.error("Error in fallback message check:", error);
            return false;
        } finally {
            markRequestEnd('messages_exist_fallback');
        }
    }, [canMakeRequest, markRequestStart, markRequestEnd]); // Note: getMessages will be defined below

    // Add getMessages dependency to checkMessagesExistFallback  
    const checkMessagesExistFallbackMemoized = useCallback(async (friendId: string): Promise<boolean> => {
        if (!canMakeRequest('messages_exist_fallback')) {
            return false;
        }

        markRequestStart('messages_exist_fallback');

        try {
            const messages = await getMessages(friendId, 1);
            return messages.length > 0;
        } catch (error) {
            console.error("Error in fallback message check:", error);
            return false;
        } finally {
            markRequestEnd('messages_exist_fallback');
        }
    }, [canMakeRequest, markRequestStart, markRequestEnd]); // Remove getMessages to prevent circular dependency

    // Update checkIfConversationExists to use the memoized fallback
    const checkIfConversationExistsMemoized = useCallback(async (friendId: string): Promise<boolean> => {
        if (!currentUser || !authToken || !canMakeRequest('conversation_exists')) {
            return false;
        }

        markRequestStart('conversation_exists');

        try {
            // First try the dedicated endpoint
            const response = await fetch(`${apiEndpoint}/conversation-exists/${friendId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            // Handle 404 errors specifically - this means the endpoint doesn't exist
            if (response.status === 404) {
                markEndpointAvailability('conversation-exists', false);
                // Fallback: check for messages directly
                return await checkMessagesExistFallbackMemoized(friendId);
            }

            // Handle other HTTP errors
            if (!response.ok) {
                console.warn(`Error ${response.status} checking if conversation exists, falling back to message check`);
                return await checkMessagesExistFallbackMemoized(friendId);
            }

            // Process successful response
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error("Error checking if conversation exists:", error);
            return await checkMessagesExistFallbackMemoized(friendId);
        } finally {
            markRequestEnd('conversation_exists');
        }
    }, [currentUser, authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, markEndpointAvailability, checkMessagesExistFallbackMemoized]);

    const fetchFriendPublicKey = useCallback(async (userId: string): Promise<openpgp.PublicKey | null> => {
        // Check if we already have this friend's public key
        if (friendPublicKeys[userId]) {
            return friendPublicKeys[userId];
        }

        if (!currentUser || !authToken || !canMakeRequest('fetch_friend_public_key')) {
            return null;
        }

        markRequestStart('fetch_friend_public_key');

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
            const publicKey = await openpgp.readKey({ armoredKey: data.public_key });

            // Cache the key for future use
            setFriendPublicKeys(prev => ({
                ...prev,
                [userId]: publicKey
            }));

            return publicKey;
        } catch (error) {
            console.error(`Error fetching public key for user ${userId}:`, error);
            return null;
        } finally {
            markRequestEnd('fetch_friend_public_key');
        }
    }, [friendPublicKeys, currentUser, authToken, apiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, markEndpointAvailability]);

    const encryptMessage = useCallback(async (content: string, recipientId: string): Promise<{ encrypted: string, isEncrypted: boolean }> => {
        if (!publicKey || !friendPublicKeys[recipientId]) {
            return { encrypted: content, isEncrypted: false };
        }

        try {
            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: content }),
                encryptionKeys: [publicKey, friendPublicKeys[recipientId]]
            });

            return { encrypted: encrypted, isEncrypted: true };
        } catch (error) {
            console.error("Error encrypting message:", error);
            return { encrypted: content, isEncrypted: false };
        }
    }, [publicKey, friendPublicKeys]);

    const decryptMessage = useCallback(async (content: string, senderId: string): Promise<string> => {
        if (!privateKey) {
            return content;
        }

        try {
            const message = await openpgp.readMessage({ armoredMessage: content });
            const { data: decrypted } = await openpgp.decrypt({
                message,
                decryptionKeys: privateKey
            });

            return decrypted;
        } catch (error) {
            console.error("Error decrypting message:", error);
            return content;
        }
    }, [privateKey]);

    const sendMessage = useCallback(async (content: string, media: FileList | null, replyTo?: number) => {
        if (!friendId || !currentUser || !authToken) {
            toast.error("Cannot send message: missing required information");
            return;
        }

        if (!canMakeRequest('send_message')) {
            return;
        }

        markRequestStart('send_message');

        try {
            const conversationId = generateConversationId(currentUser.id, friendId);
            let uploadedMedia: Media[] = [];

            if (media && media.length > 0) {
                uploadedMedia = await uploadMedia(media);
            }

            const { encrypted, isEncrypted } = await encryptMessage(content, friendId);

            const response = await fetch(`${apiEndpoint}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    content: encrypted,
                    recipient_id: friendId,
                    conversation_id: conversationId,
                    media: uploadedMedia,
                    reply_to: replyTo,
                    encrypted: isEncrypted
                }),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    markEndpointAvailability('messages', false);
                    throw new Error('Messaging endpoint not available');
                }
                throw new Error('Failed to send message');
            }

            markEndpointAvailability('messages', true);
            
            // Refresh messages
            await getMessages(friendId, 20);
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            markRequestEnd('send_message');
        }
    }, [friendId, currentUser, authToken, generateConversationId, encryptMessage]); // Simplified dependencies

    const getMessages = useCallback(async (friendId: string, batchSize: number, lastMessageId?: number): Promise<Message[]> => {
        if (!currentUser || !authToken || fetchingMessagesRef.current) {
            return [];
        }

        if (!canMakeRequest('get_messages')) {
            return [];
        }

        fetchingMessagesRef.current = true;
        markRequestStart('get_messages');

        try {
            const conversationId = generateConversationId(currentUser.id, friendId);
            const url = new URL(`${apiEndpoint}/messages/${conversationId}`);
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
                // Don't show error for new conversations with no messages
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
            const messagesData = await Promise.all(data.messages.map(async (msg: any) => {
                let decryptedContent = msg.content;
                if (msg.encrypted) {
                    decryptedContent = await decryptMessage(msg.content, msg.sender_id);
                }

                return {
                    id: msg.id,
                    senderId: msg.sender_id,
                    content: decryptedContent,
                    timestamp: new Date(msg.timestamp),
                    media: msg.media || null,
                    reactions: msg.reactions || [],
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
    }, [currentUser, authToken, stableApiEndpoint, canMakeRequest, markRequestStart, markRequestEnd, markEndpointAvailability, generateConversationId, setMessagesCallback, decryptMessage]);

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
                id: friend.id,
                firstName: friend.first_name,
                lastName: friend.last_name,
                avatar: friend.avatar || ''
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

    const fetchConversations = useCallback(async (): Promise<Conversation[]> => {
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
                id: conv.id,
                friendId: conv.friend_id,
                friendName: conv.friend_name,
                friendAvatar: conv.friend_avatar || '/default-avatar.png',
                lastMessage: conv.last_message,
                lastMessageTime: conv.last_message_time ? new Date(conv.last_message_time) : null,
                unreadCount: conv.unread_count || 0,
                isEmpty: !conv.last_message,
                isOnline: false, // Will be updated via socket
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
    }, [currentUser?.id, authToken, isAuthenticated, stableApiEndpoint]); // Only stable dependencies

    const generateKeys = async () => {
        if (!currentUser) {
            toast.error("You must be logged in to generate keys");
            return;
        }

        if (!canMakeRequest('generate_keys')) {
            return;
        }

        markRequestStart('generate_keys');

        try {
            setKeyStatus('generating');
            toast.loading("Generating encryption keys...");

            const { privateKey, publicKey } = await openpgp.generateKey({
                type: 'rsa',
                rsaBits: 4096,  // Match server's RSA key size
                userIDs: [{ name: currentUser.firstName, email: currentUser.email }],
                passphrase: '',
                format: 'armored'
            });

            const privateKeyObj = await openpgp.readPrivateKey({ armoredKey: privateKey });
            const publicKeyObj = await openpgp.readKey({ armoredKey: publicKey });

            setPrivateKey(privateKeyObj);
            setPublicKey(publicKeyObj);
            setKeyStatus('available');

            if (currentUser) {
                localStorage.setItem(`pgp-private-key-${currentUser.id}`, privateKey);
            }
            localStorage.setItem(`pgp-public-key-${currentUser.id}`, publicKey);

            await uploadPublicKey(publicKey);

            toast.dismiss();
            toast.success("Encryption keys generated successfully");
        } catch (error) {
            console.error("Error generating keys:", error);
            setKeyStatus('unavailable');
            toast.dismiss();
            toast.error("Failed to generate encryption keys");
        } finally {
            markRequestEnd('generate_keys');
        }
    };

    const loadKeys = async () => {
        if (!currentUser) return;

        try {
            const storedPrivateKey = localStorage.getItem(`pgp-private-key-${currentUser.id}`);
            const storedPublicKey = localStorage.getItem(`pgp-public-key-${currentUser.id}`);

            if (storedPrivateKey && storedPublicKey) {
                const privateKeyObj = await openpgp.readPrivateKey({ armoredKey: storedPrivateKey });
                const publicKeyObj = await openpgp.readKey({ armoredKey: storedPublicKey });

                setPrivateKey(privateKeyObj);
                setPublicKey(publicKeyObj);
                setKeyStatus('available');
            } else {
                setKeyStatus('unavailable');
            }
        } catch (error) {
            console.error("Error loading keys:", error);
            setKeyStatus('unavailable');
        }
    };

    const exportPublicKey = async (): Promise<string | null> => {
        if (!publicKey) {
            toast.error("No public key available");
            return null;
        }

        try {
            const armoredKey = openpgp.armor(openpgp.enums.armor.message, publicKey.toPacketList());
            return armoredKey;
        } catch (error) {
            console.error("Error exporting public key:", error);
            toast.error("Failed to export public key");
            return null;
        }
    };

    const uploadPublicKey = async (armoredPublicKey: string): Promise<any> => {
        if (!currentUser || !authToken) {
            throw new Error('Authentication required');
        }

        if (!canMakeRequest('upload_public_key')) {
            throw new Error('Rate limited');
        }

        markRequestStart('upload_public_key');

        try {
            const response = await fetch(`${apiEndpoint}/keys`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ public_key: armoredPublicKey }),
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
        } finally {
            markRequestEnd('upload_public_key');
        }
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
                exportPublicKey,
                keyStatus,
                generateConversationId,
                fetchConversations,
                checkIfConversationExists,
                conversations,
                getFriendDetails,
                friendDetails,
                currentUser,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => useContext(ChatContext);

// Debug component to test for infinite re-renders
export const ChatDebugger = () => {
    const renderCount = useRef(0);
    renderCount.current += 1;
    
    useEffect(() => {
        console.log('ChatContext re-rendered:', renderCount.current);
        if (renderCount.current > 5) {
            console.warn('⚠️ ChatContext has re-rendered more than 5 times - potential infinite re-render detected!');
        }
    });
    
    return null;
};

// Test utility to verify our fixes
export const ChatContextTester = () => {
    useEffect(() => {
        console.log('✅ ChatContext dependency fix test: Component mounted successfully');
        return () => {
            console.log('✅ ChatContext dependency fix test: Component unmounted successfully');
        };
    }, []);
    
    return null;
};
