"use client";

import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import * as openpgp from 'openpgp';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { AuthContext } from './authcontext';
import { Message, MessageState, SendMessageParams, OnlineStatusEvent, CustomMessageEvent } from '@/lib/types';

const initialState: MessageState = {
    messages: [],
    isLoading: false,
    error: null,
    currentConversation: null,
    onlineStatus: {},
    hasMoreMessages: true,
    page: 1
};

type Action =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_MESSAGES'; payload: Message[] }
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'UPDATE_MESSAGE'; payload: Message }
    | { type: 'DELETE_MESSAGE'; payload: string }
    | { type: 'SET_ONLINE_STATUS'; payload: Record<string, { online: boolean; lastActive: string }> }
    | { type: 'SET_CURRENT_CONVERSATION'; payload: string | null }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'SET_HAS_MORE_MESSAGES'; payload: boolean }
    | { type: 'RESET_STATE' };

function messagesReducer(state: MessageState, action: Action): MessageState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_MESSAGES':
            return { ...state, messages: action.payload };
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'UPDATE_MESSAGE':
            return {
                ...state,
                messages: state.messages.map(msg =>
                    msg.id === action.payload.id ? action.payload : msg
                )
            };
        case 'DELETE_MESSAGE':
            return {
                ...state,
                messages: state.messages.filter(msg => msg.id !== action.payload)
            };
        case 'SET_ONLINE_STATUS':
            return { ...state, onlineStatus: action.payload };
        case 'SET_CURRENT_CONVERSATION':
            return { ...state, currentConversation: action.payload };
        case 'SET_PAGE':
            return { ...state, page: action.payload };
        case 'SET_HAS_MORE_MESSAGES':
            return { ...state, hasMoreMessages: action.payload };
        case 'RESET_STATE':
            return { ...initialState };
        default:
            return state;
    }
}

interface MessagesContextType extends MessageState {
    sendMessage: (params: SendMessageParams) => Promise<void>;
    editMessage: (messageId: string, content: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    loadMoreMessages: () => Promise<void>;
    joinConversation: (conversationId: string) => void;
    leaveConversation: () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(messagesReducer, initialState);
    const { currentUser: user, authToken, isAuthenticated } = useContext(AuthContext);
    
    // Socket management
    const socketRef = useRef<Socket>();
    const isConnectedRef = useRef(false);
    const lastTokenRef = useRef<string | null>(null);
    const connectionTimeoutRef = useRef<NodeJS.Timeout>();
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 3;
    
    // Rate limiting and debouncing
    const lastRequestTimeRef = useRef(0);
    const requestCountRef = useRef(0);
    const rateLimitWindowRef = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const activeRequestsRef = useRef(new Set<string>());
    
    // Rate limiting configuration
    const RATE_LIMIT_WINDOW = 60000; // 1 minute
    const MAX_REQUESTS_PER_WINDOW = 10;
    const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
    const BACKOFF_MULTIPLIER = 2;
    const MAX_BACKOFF = 30000; // 30 seconds

    // Rate limiting function
    const canMakeRequest = useCallback((requestType: string): boolean => {
        const now = Date.now();
        
        // Check if we're within the rate limit window
        if (now - rateLimitWindowRef.current > RATE_LIMIT_WINDOW) {
            // Reset rate limit window
            rateLimitWindowRef.current = now;
            requestCountRef.current = 0;
        }
        
        // Check request count
        if (requestCountRef.current >= MAX_REQUESTS_PER_WINDOW) {
            console.warn(`Rate limit exceeded for ${requestType}. Please try again later.`);
            dispatch({ type: 'SET_ERROR', payload: 'Too many requests. Please wait before trying again.' });
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

    // Initialize socket connection with better error handling
    const initializeSocket = useCallback(() => {
        if (!authToken || !isAuthenticated || isConnectedRef.current || authToken === lastTokenRef.current) {
            return;
        }

        if (!process.env.NEXT_PUBLIC_API_URL) {
            console.error('NEXT_PUBLIC_API_URL is not configured');
            dispatch({ type: 'SET_ERROR', payload: 'Messaging service not configured' });
            return;
        }

        // Clear any existing connection timeout
        if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
        }

        // Disconnect existing socket if any
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = undefined;
        }

        try {
            console.log('Initializing socket connection...');
            socketRef.current = io(process.env.NEXT_PUBLIC_API_URL, {
                auth: { token: authToken },
                transports: ['websocket'],
                timeout: 15000, // Increased timeout
                reconnection: true,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
                maxReconnectionAttempts: maxReconnectAttempts,
                forceNew: true // Force new connection
            });

            lastTokenRef.current = authToken;
            setupSocketEvents();

        } catch (error) {
            console.error('Error initializing socket:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to messaging service' });
            markRequestEnd('socket_init');
        }
    }, [authToken, isAuthenticated]);

    const setupSocketEvents = useCallback(() => {
        if (!socketRef.current) return;

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket connected successfully');
            isConnectedRef.current = true;
            reconnectAttemptsRef.current = 0;
            dispatch({ type: 'SET_ERROR', payload: null });
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            isConnectedRef.current = false;
            
            if (reason === 'io server disconnect' || reason === 'io client disconnect') {
                return;
            }
            
            // Implement exponential backoff for reconnection
            const backoffTime = Math.min(1000 * Math.pow(BACKOFF_MULTIPLIER, reconnectAttemptsRef.current), MAX_BACKOFF);
            setTimeout(() => {
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    dispatch({ type: 'SET_ERROR', payload: `Connection lost. Reconnecting in ${backoffTime/1000}s...` });
                }
            }, backoffTime);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            isConnectedRef.current = false;
            reconnectAttemptsRef.current++;
            
            if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                dispatch({ type: 'SET_ERROR', payload: 'Unable to connect to messaging service. Please check your connection and refresh the page.' });
            }
        });

        socket.on('new_message', (event: CustomMessageEvent) => {
            dispatch({ type: 'ADD_MESSAGE', payload: event.message });
        });

        socket.on('edit_message', (event: CustomMessageEvent) => {
            dispatch({ type: 'UPDATE_MESSAGE', payload: event.message });
        });

        socket.on('delete_message', ({ messageId }: { messageId: string }) => {
            dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
        });

        socket.on('user_online', (event: OnlineStatusEvent) => {
            dispatch({
                type: 'SET_ONLINE_STATUS',
                payload: {
                    ...state.onlineStatus,
                    [event.userId]: { online: true, lastActive: event.lastActive }
                }
            });
        });

        socket.on('user_offline', (event: OnlineStatusEvent) => {
            dispatch({
                type: 'SET_ONLINE_STATUS',
                payload: {
                    ...state.onlineStatus,
                    [event.userId]: { online: false, lastActive: event.lastActive }
                }
            });
        });
    }, [state.onlineStatus]);

    // Initialize socket when auth state changes
    useEffect(() => {
        if (authToken && isAuthenticated) {
            // Add delay to prevent rapid reconnections
            connectionTimeoutRef.current = setTimeout(() => {
                initializeSocket();
            }, 500);
        } else {
            // Clean up when logging out
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = undefined;
            }
            isConnectedRef.current = false;
            lastTokenRef.current = null;
            dispatch({ type: 'RESET_STATE' });
            
            // Clear active requests
            activeRequestsRef.current.clear();
            requestCountRef.current = 0;
        }

        return () => {
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
            }
        };
    }, [authToken, isAuthenticated, initializeSocket]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (connectionTimeoutRef.current) {
                clearTimeout(connectionTimeoutRef.current);
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            activeRequestsRef.current.clear();
        };
    }, []);

    const joinConversation = useCallback((conversationId: string) => {
        if (!socketRef.current || !isConnectedRef.current) {
            console.warn('Socket not connected, cannot join conversation');
            return;
        }
        
        if (!canMakeRequest('join_conversation')) {
            return;
        }
        
        markRequestStart('join_conversation');
        
        try {
            socketRef.current.emit('join_conversation', { conversationId });
            dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversationId });
            
            // Reset pagination when joining new conversation
            dispatch({ type: 'SET_PAGE', payload: 1 });
            dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: true });
            dispatch({ type: 'SET_MESSAGES', payload: [] });
        } finally {
            markRequestEnd('join_conversation');
        }
    }, [canMakeRequest, markRequestStart, markRequestEnd]);

    const leaveConversation = useCallback(() => {
        if (!socketRef.current || !state.currentConversation || !isConnectedRef.current) return;
        
        if (!canMakeRequest('leave_conversation')) {
            return;
        }
        
        markRequestStart('leave_conversation');
        
        try {
            socketRef.current.emit('leave_conversation', { 
                conversationId: state.currentConversation 
            });
            dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: null });
        } finally {
            markRequestEnd('leave_conversation');
        }
    }, [state.currentConversation, canMakeRequest, markRequestStart, markRequestEnd]);

    const loadMoreMessages = useCallback(async () => {
        if (!state.currentConversation || !state.hasMoreMessages || state.isLoading || !authToken) {
            return;
        }

        if (!canMakeRequest('load_messages')) {
            return;
        }

        markRequestStart('load_messages');
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        // Abort previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/messages/${state.currentConversation}?page=${state.page}`,
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                    signal: controller.signal,
                    timeout: 15000
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    dispatch({ type: 'SET_ERROR', payload: 'Session expired. Please log in again.' });
                    return;
                } else if (response.status === 404) {
                    dispatch({ type: 'SET_ERROR', payload: 'Conversation not found.' });
                    dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: false });
                    return;
                } else if (response.status === 429) {
                    dispatch({ type: 'SET_ERROR', payload: 'Too many requests. Please wait before trying again.' });
                    return;
                }
                throw new Error(`HTTP ${response.status}: Failed to fetch messages`);
            }

            const data = await response.json();
            
            dispatch({ type: 'SET_MESSAGES', payload: [...state.messages, ...data.messages] });
            dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: data.hasMore });
            dispatch({ type: 'SET_PAGE', payload: state.page + 1 });
            
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error loading messages:', error);
                if (error.name === 'TimeoutError') {
                    dispatch({ type: 'SET_ERROR', payload: 'Request timed out. Please check your connection.' });
                } else {
                    dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages. Please try again later.' });
                }
            }
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
            markRequestEnd('load_messages');
        }
    }, [state.currentConversation, state.hasMoreMessages, state.isLoading, state.page, state.messages, authToken, canMakeRequest, markRequestStart, markRequestEnd]);

    const sendMessage = useCallback(async ({ content, recipientId, conversationId }: SendMessageParams) => {
        if (!socketRef.current || !user || !isConnectedRef.current) {
            dispatch({ type: 'SET_ERROR', payload: 'Unable to send message. Please check your connection.' });
            return;
        }

        if (!canMakeRequest('send_message')) {
            return;
        }

        markRequestStart('send_message');

        try {
            // Generate encryption keys for the message
            const { publicKey } = await openpgp.generateKey({
                type: 'ecc',
                curve: 'curve25519',
                userIDs: [{ name: user.id }]
            });

            // Encrypt the message content
            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: content }),
                encryptionKeys: publicKey
            });

            const message = {
                content: encrypted,
                senderId: user.id,
                recipientId,
                conversationId,
                timestamp: new Date().toISOString()
            };

            socketRef.current.emit('send_message', message);
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (error) {
            console.error('Error sending message:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to send message. Please try again.' });
        } finally {
            markRequestEnd('send_message');
        }
    }, [user, canMakeRequest, markRequestStart, markRequestEnd]);

    const editMessage = useCallback(async (messageId: string, content: string) => {
        if (!socketRef.current || !user || !isConnectedRef.current) {
            dispatch({ type: 'SET_ERROR', payload: 'Unable to edit message. Please check your connection.' });
            return;
        }

        if (!canMakeRequest('edit_message')) {
            return;
        }

        markRequestStart('edit_message');

        try {
            const { publicKey } = await openpgp.generateKey({
                type: 'ecc',
                curve: 'curve25519',
                userIDs: [{ name: user.id }]
            });

            const encrypted = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: content }),
                encryptionKeys: publicKey
            });

            socketRef.current.emit('edit_message', {
                messageId,
                content: encrypted,
                timestamp: new Date().toISOString()
            });
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (error) {
            console.error('Error editing message:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to edit message. Please try again.' });
        } finally {
            markRequestEnd('edit_message');
        }
    }, [user, canMakeRequest, markRequestStart, markRequestEnd]);

    const deleteMessage = useCallback(async (messageId: string) => {
        if (!socketRef.current || !isConnectedRef.current) {
            dispatch({ type: 'SET_ERROR', payload: 'Unable to delete message. Please check your connection.' });
            return;
        }

        if (!canMakeRequest('delete_message')) {
            return;
        }

        markRequestStart('delete_message');

        try {
            socketRef.current.emit('delete_message', { messageId });
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (error) {
            console.error('Error deleting message:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to delete message. Please try again.' });
        } finally {
            markRequestEnd('delete_message');
        }
    }, [canMakeRequest, markRequestStart, markRequestEnd]);

    const contextValue: MessagesContextType = {
        ...state,
        sendMessage,
        editMessage,
        deleteMessage,
        loadMoreMessages,
        joinConversation,
        leaveConversation
    };

    return (
        <MessagesContext.Provider value={contextValue}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessagesContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessagesProvider');
    }
    return context;
};
