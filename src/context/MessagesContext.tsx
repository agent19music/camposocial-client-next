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
    | { type: 'SET_HAS_MORE_MESSAGES'; payload: boolean };

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
    const { currentUser: user, authToken } = useContext(AuthContext);
    const socketRef = useRef<Socket>();

    useEffect(() => {
        if (authToken) {
            socketRef.current = io(process.env.NEXT_PUBLIC_API_URL!, {
                auth: { token: authToken }
            });

            setupSocketEvents();

            return () => {
                socketRef.current?.disconnect();
            };
        }
    }, [authToken]);

    const setupSocketEvents = () => {
        if (!socketRef.current) return;

        socketRef.current.on('new_message', (event: CustomMessageEvent) => {
            dispatch({ type: 'ADD_MESSAGE', payload: event.message });
        });

        socketRef.current.on('edit_message', (event: CustomMessageEvent) => {
            dispatch({ type: 'UPDATE_MESSAGE', payload: event.message });
        });

        socketRef.current.on('delete_message', ({ messageId }: { messageId: string }) => {
            dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
        });

        socketRef.current.on('user_online', (event: OnlineStatusEvent) => {
            dispatch({
                type: 'SET_ONLINE_STATUS',
                payload: {
                    ...state.onlineStatus,
                    [event.userId]: { online: true, lastActive: event.lastActive }
                }
            });
        });
    };

    const joinConversation = useCallback((conversationId: string) => {
        if (!socketRef.current) return;
        
        socketRef.current.emit('join_conversation', { conversationId });
        dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversationId });
        
        // Reset pagination when joining new conversation
        dispatch({ type: 'SET_PAGE', payload: 1 });
        dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: true });
        dispatch({ type: 'SET_MESSAGES', payload: [] });
    }, []);

    const leaveConversation = useCallback(() => {
        if (!socketRef.current || !state.currentConversation) return;
        
        socketRef.current.emit('leave_conversation', { 
            conversationId: state.currentConversation 
        });
        dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: null });
    }, [state.currentConversation]);

    const loadMoreMessages = async () => {
        if (!state.currentConversation || !state.hasMoreMessages || state.isLoading) return;

        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/messages/${state.currentConversation}?page=${state.page}`,
                {
                    headers: { Authorization: `Bearer ${authToken}` }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch messages');

            const data = await response.json();
            
            dispatch({ type: 'SET_MESSAGES', payload: [...state.messages, ...data.messages] });
            dispatch({ type: 'SET_HAS_MORE_MESSAGES', payload: data.hasMore });
            dispatch({ type: 'SET_PAGE', payload: state.page + 1 });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const sendMessage = async ({ content, recipientId, conversationId }: SendMessageParams) => {
        if (!socketRef.current || !user) return;

        try {
            // Generate encryption keys for the message
            const { publicKey, privateKey } = await openpgp.generateKey({
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
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
        }
    };

    const editMessage = async (messageId: string, content: string) => {
        if (!socketRef.current || !state.currentConversation) return;

        try {
            socketRef.current.emit('edit_message', {
                messageId,
                content,
                conversationId: state.currentConversation
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to edit message' });
        }
    };

    const deleteMessage = async (messageId: string) => {
        if (!socketRef.current || !state.currentConversation) return;

        try {
            socketRef.current.emit('delete_message', {
                messageId,
                conversationId: state.currentConversation
            });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to delete message' });
        }
    };

    const value = {
        ...state,
        sendMessage,
        editMessage,
        deleteMessage,
        loadMoreMessages,
        joinConversation,
        leaveConversation
    };

    return (
        <MessagesContext.Provider value={value}>
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
