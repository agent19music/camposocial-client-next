"use client";

import { createContext, ReactNode, useState, useEffect, useContext, useRef } from "react";
import { toast } from 'react-hot-toast';
import * as openpgp from 'openpgp';
import { AuthContext } from "./authcontext";

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
});

interface ChatProviderProps {
    children: ReactNode;
}

export default function ChatProvider({ children }: ChatProviderProps) {
    const apiEndpoint = "http://127.0.0.1:5000";
    const { currentUser, authToken } = useContext(AuthContext);
    const [messages, setMessages] = useState<Message[]>([]);
    const [friendId, setFriendId] = useState<string | null>(null); 
    const [chatList, setChatList] = useState<ChatListUser[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    // OpenPGP key management
    const [privateKey, setPrivateKey] = useState<openpgp.PrivateKey | null>(null);
    const [publicKey, setPublicKey] = useState<openpgp.PublicKey | null>(null);
    const [keyStatus, setKeyStatus] = useState<'generating' | 'available' | 'unavailable'>('unavailable');
    const [friendPublicKeys, setFriendPublicKeys] = useState<Record<string, openpgp.PublicKey>>({});

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (friendId && currentUser && authToken) {
            // Check if conversation exists before fetching messages
            checkIfConversationExists(friendId).then(exists => {
                if (exists) {
                    getMessages(friendId, 10);
                } else {
                    setMessages([]);
                }
            });
            fetchFriendPublicKey(friendId);
        } else {
            setMessages([]); 
        }
    }, [friendId, currentUser, authToken]);

    // Load user's keys from localStorage when component mounts
    useEffect(() => {
        if (currentUser) {
            loadKeys();
        }
    }, [currentUser]);

    // Load conversations when component mounts
    useEffect(() => {
        if (currentUser && authToken) {
            fetchConversations();
        }
    }, [currentUser, authToken]);

    // Generate a unique conversation ID from two user IDs
    const generateConversationId = (userId1: string, userId2: string): string => {
        // Sort IDs to ensure the same conversation ID regardless of order
        const sortedIds = [userId1, userId2].sort();
        return `${sortedIds[0]}_${sortedIds[1]}`;
    };

    // Fetch friend details including online status
    const getFriendDetails = async (conversationId: string): Promise<{ name: string; avatar: string; isOnline: boolean } | null> => {
        if (!currentUser || !authToken) {
            return null;
        }

        try {
            // First try to get conversation data which includes friend details
            const convResponse = await fetch(`${apiEndpoint}/conversations/${conversationId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (convResponse.ok) {
                const convData = await convResponse.json();
                return {
                    name: `${convData.first_name} ${convData.last_name}`,
                    avatar: convData.avatar || '',
                    isOnline: convData.is_online || false
                };
            }
        } catch (error) {
            console.error("Error fetching friend details:", error);
        }
        return null;
    };

    // Check if a conversation with a friend exists (has any messages)
    const checkIfConversationExists = async (friendId: string): Promise<boolean> => {
        if (!currentUser || !authToken) {
            return false;
        }

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
            return false;
        }
    };

    // Helper function for checkIfConversationExists to avoid duplicated code
    const checkMessagesExistFallback = async (friendId: string): Promise<boolean> => {
        try {
            // Try to fetch just one message to see if any exist
            const messages = await getMessages(friendId, 1);
            return messages.length > 0;
        } catch (fallbackError) {
            console.error("Error in fallback conversation check:", fallbackError);
            // Check if we have a cached conversation
            const existingConv = conversations.find(conv => conv.friendId === friendId);
            return existingConv ? !existingConv.isEmpty : false;
        }
    };

    // Fetch all conversations with conversation IDs
    const fetchConversations = async (): Promise<Conversation[]> => {
        if (!currentUser || !authToken) {
            return [];
        }

        try {
            const response = await fetch(`${apiEndpoint}/conversations`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                // If the endpoint doesn't exist, fall back to the chat-list endpoint
                const chatUsers = await getChatList();
                
                // Convert chat list to conversations
                const conversationsPromises = chatUsers.map(async (user: ChatListUser) => {
                    const conversationId = currentUser ? generateConversationId(currentUser.id, user.id) : '';
                    const exists = await checkIfConversationExists(user.id);
                    
                    // Get the last message if the conversation exists
                    let lastMessage = null;
                    let lastMessageTime = null;
                    if (exists) {
                        const messages = await getMessages(user.id, 1);
                        if (messages.length > 0) {
                            lastMessage = messages[0].content;
                            lastMessageTime = messages[0].timestamp;
                        }
                    }
                    
                    return {
                        id: conversationId,
                        friendId: user.id,
                        friendName: `${user.firstName} ${user.lastName}`,
                        friendAvatar: user.avatar,
                        lastMessage,
                        lastMessageTime,
                        unreadCount: 0, // Would need an API endpoint to get unread count
                        isEmpty: !exists,
                        isOnline: false // Would need an API endpoint to get online status
                    };
                });
                
                const conversationsData = await Promise.all(conversationsPromises);
                setConversations(conversationsData);
                return conversationsData;
            }

            const data = await response.json();
            const conversationsData = data.conversations.map((conv: any) => ({
                id: generateConversationId(currentUser.id, conv.friend_id),
                friendId: conv.friend_id,
                friendName: conv.friend_name,
                friendAvatar: conv.friend_avatar || '',
                lastMessage: conv.last_message,
                lastMessageTime: conv.last_message_time ? new Date(conv.last_message_time) : null,
                unreadCount: conv.unread_count || 0,
                isEmpty: !conv.has_messages,
                isOnline: conv.is_online || false
            }));
            
            setConversations(conversationsData);
            return conversationsData;
        } catch (error) {
            console.error("Error fetching conversations:", error);
            return [];
        }
    };

    const generateKeys = async () => {
        if (!currentUser) {
            toast.error("You must be logged in to generate keys");
            return;
        }

        try {
            setKeyStatus('generating');
            toast.loading("Generating encryption keys...");

            const { privateKey, publicKey } = await openpgp.generateKey({
                type: 'ecc',
                curve: 'curve25519Legacy',
                userIDs: [{ name: currentUser.first_name, email: currentUser.email }],
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

        const response = await fetch(`${apiEndpoint}/keys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ public_key: armoredPublicKey }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to upload public key: ${error}`);
        }

        return response.json();
    };

    const fetchFriendPublicKey = async (userId: string): Promise<openpgp.PublicKey | null> => {
        if (!currentUser || !authToken) {
            return null;
        }

        // Return cached key if available
        if (friendPublicKeys[userId]) {
            return friendPublicKeys[userId];
        }

        try {
            const response = await fetch(`${apiEndpoint}/keys/${userId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            // Handle 404 errors (endpoint doesn't exist or user has no key)
            if (response.status === 404) {
                console.warn(`No public key found for user ${userId} or endpoint not available`);
                return null;
            }

            if (!response.ok) {
                console.error(`Failed to fetch friend public key: ${response.status} ${response.statusText}`);
                return null;
            }

            const data = await response.json();
            
            if (data.public_key) {
                try {
                    const friendKey = await openpgp.readKey({ armoredKey: data.public_key });
                    setFriendPublicKeys(prevKeys => ({
                        ...prevKeys,
                        [userId]: friendKey
                    }));
                    return friendKey;
                } catch (pgpError) {
                    console.error("Error parsing PGP key:", pgpError);
                    return null;
                }
            }
            return null;
        } catch (error) {
            console.error("Error fetching friend public key:", error);
            return null;
        }
    };

    const encryptMessage = async (content: string, recipientId: string): Promise<{ encrypted: string, isEncrypted: boolean }> => {
        if (!publicKey || !friendPublicKeys[recipientId]) {
            return { encrypted: content, isEncrypted: false };
        }

        try {
            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: content }),
                encryptionKeys: [friendPublicKeys[recipientId]],
                signingKeys: privateKey ? [privateKey] : undefined
            });

            return { encrypted: encrypted as string, isEncrypted: true };
        } catch (error) {
            console.error("Error encrypting message:", error);
            toast.error("Failed to encrypt message, sending unencrypted");
            return { encrypted: content, isEncrypted: false };
        }
    };

    const decryptMessage = async (content: string, senderId: string): Promise<string> => {
        if (!privateKey || !content.includes('-----BEGIN PGP MESSAGE-----')) {
            return content;
        }

        try {
            const message = await openpgp.readMessage({ armoredMessage: content });

            const { data: decrypted } = await openpgp.decrypt({
                message,
                decryptionKeys: privateKey,
                verificationKeys: friendPublicKeys[senderId] || undefined
            });

            return decrypted as string;
        } catch (error) {
            console.error("Error decrypting message:", error);
            return "[Encrypted message - cannot decrypt]";
        }
    };

    const sendMessage = async (content: string, media: FileList | null, replyTo?: number) => {
        if (!currentUser || !authToken || !friendId) {
            return;
        }

        try {
            const formData = new FormData();
            
            // Encrypt the message if possible
            const { encrypted, isEncrypted } = await encryptMessage(content, friendId);
            formData.append('content', encrypted);
            formData.append('encrypted', isEncrypted.toString());
            
            if (replyTo) {
                formData.append('reply_to_id', replyTo.toString());
            }
            if (media) {
                for (let i = 0; i < media.length; i++) {
                    formData.append('media', media[i]);
                }
            }

            const response = await fetch(`${apiEndpoint}/messages/${friendId}`, { 
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send message');
            }

            const newMessageData = await response.json();

            const newMessage: Message = {
                id: newMessageData.message_id,
                senderId: currentUser.id,
                content: content, // Store original content for display
                timestamp: new Date(newMessageData.timestamp), 
                media: newMessageData.media ? newMessageData.media.map((m: any) => ({ url: m.media_url, type: m.media_type })) : null,
                reactions: [],
                replyTo,
                isSent: true,
                isRead: false,
                encrypted: isEncrypted,
            };

            setMessages(prevMessages => [...prevMessages, newMessage]);

        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        }
    };

    const getMessages = async (friendId: string, batchSize: number, lastMessageId?: number): Promise<Message[]> => {
        if (!currentUser || !authToken) {
            return [];
        }

        try {
            // Try using conversation_id first (more modern approach)
            const conversationId = generateConversationId(currentUser.id, friendId);
            
            // Create URL with proper query parameters
            const urlWithConvId = new URL(`${apiEndpoint}/messages/conversation/${conversationId}`);
            urlWithConvId.searchParams.append('batch_size', batchSize.toString());
            if (lastMessageId) {
                urlWithConvId.searchParams.append('last_message_id', lastMessageId.toString());
            }

            // First try the conversation ID approach
            try {
                const convResponse = await fetch(urlWithConvId.toString(), {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                // If successful, parse and return the messages
                if (convResponse.ok) {
                    const data = await convResponse.json();
                    const messages = data.messages.map((msg: any) => ({
                        id: msg.id,
                        senderId: msg.sender_id,
                        content: msg.content,
                        timestamp: new Date(msg.timestamp),
                        media: msg.media ? msg.media.map((m: any) => ({ url: m.url, type: m.type })) : null,
                        reactions: msg.reactions || [],
                        replyTo: msg.reply_to_id,
                        isSent: true,
                        isRead: msg.is_read,
                        encrypted: msg.is_encrypted || false,
                    }));
                    return messages;
                }
                
                // If endpoint not found (404) or other error, fall back to the friendId approach
                if (convResponse.status !== 200) {
                    console.warn(`Conversation endpoint failed with status ${convResponse.status}, falling back to friendId approach`);
                }
            } catch (convError) {
                console.warn("Error using conversation ID approach, falling back to friendId approach:", convError);
            }

            // Fallback to using friendId directly (legacy approach)
            const urlWithFriendId = new URL(`${apiEndpoint}/messages/${friendId}`);
            urlWithFriendId.searchParams.append('batch_size', batchSize.toString());
            if (lastMessageId) {
                urlWithFriendId.searchParams.append('last_message_id', lastMessageId.toString());
            }

            const response = await fetch(urlWithFriendId.toString(), {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            // Handle 404 errors specifically - the endpoint doesn't exist
            if (response.status === 404) {
                console.warn(`Messages endpoint not found for friendId: ${friendId}`);
                // Don't show error toast for 404 to avoid user confusion
                return [];
            }

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            const messages = await Promise.all(data.messages.map(async (msg: any) => {
                // Decrypt message if it's encrypted
                const content = msg.encrypted ? 
                    await decryptMessage(msg.content, msg.sender_id) : 
                    msg.content;

                return {
                    id: msg.id,
                    senderId: msg.sender_id,
                    content: content,
                    timestamp: new Date(msg.timestamp),
                    media: msg.media ? msg.media.map((m: any) => ({ url: m.url, type: m.type })) : null,
                    reactions: msg.reactions || [],
                    replyTo: msg.reply_to_id,
                    isSent: true,
                    isRead: msg.is_read,
                    encrypted: msg.encrypted || false,
                };
            }));
            
            return messages;
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to fetch messages.");
            return [];
        }
    };

    const getChatList = async () => {
        if (!currentUser || !authToken) {
            return [];
        }
    
        try {
            const response = await fetch(`${apiEndpoint}/chat-list`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch chat list');
            }
    
            const data = await response.json();
            setChatList(data.chat_list || []);
            return data.chat_list;
    
        } catch (error) {
            console.error("Error fetching chat list:", error);
            toast.error("Failed to fetch chat list.");
            return [];
        }
    };
    
    const editMessage = async (messageId: number, newContent: string) => {
        if (!currentUser || !authToken) {
            return;
        }
        try {
            const response = await fetch(`${apiEndpoint}/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ content: newContent }),
            });

            if (!response.ok) {
                throw new Error('Failed to edit message');
            }

            setMessages(prevMessages => prevMessages.map(msg =>
                msg.id === messageId ? { ...msg, content: newContent } : msg
            ));
        } catch (error) {
            console.error("Error editing message:", error);
            toast.error("Failed to edit message.");
        }
    };

    const deleteMessage = async (messageId: number) => {
        if (!currentUser || !authToken) {
            return;
        }
        try {
            const response = await fetch(`${apiEndpoint}/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete message');
            }

            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message.");
        }
    };

    const addReaction = async (messageId: number, reactionType: string) => {
        if (!currentUser || !authToken) {
            return;
        }
        try {
            const response = await fetch(`${apiEndpoint}/messages/${messageId}/reactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ reaction_type: reactionType }),
            });

            if (!response.ok) {
                throw new Error('Failed to add reaction');
            }

            setMessages(prevMessages => prevMessages.map(msg =>
                msg.id === messageId
                  ? { ...msg, reactions: [...msg.reactions, { userId: currentUser.id, reactionType }] }
                  : msg
            ));
        } catch (error) {
            console.error("Error adding reaction:", error);
            toast.error("Failed to add reaction.");
        }
    };

    const uploadMedia = async (files: FileList) => {
        if (!currentUser || !authToken) {
            return [];
        }

        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('media', files[i]);
            }

            const response = await fetch(`${apiEndpoint}/upload`, { 
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to upload media");
            }

            const data = await response.json();
            return data.media; 

        } catch (error) {
            console.error("Error uploading media:", error);
            toast.error("Failed to upload media.");
            return [];
        }
    };

    const contextData: ChatContextType = {
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
    };

    return (
        <ChatContext.Provider value={contextData}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChat = () => useContext(ChatContext);