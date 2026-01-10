"use client";

import React, { useEffect, useContext, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';

import { AuthContext } from '@/context/authcontext';
import { useChat } from '@/context/chatcontext';
import ChatWindow from '@/components/chat/ChatWindow';
import Header from '@/components/header';

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const friendId = params.friendId as string;
    
    const { isAuthenticated, currentUser } = useContext(AuthContext);
    const { setFriendId, friendDetails, ensureConversation } = useChat();
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize the conversation
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!friendId) {
            setError('No friend ID provided');
            setIsLoading(false);
            return;
        }

        const initializeChat = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Set the friend ID in context
                setFriendId(friendId);
                
                // Ensure conversation exists
                const conversationId = await ensureConversation(friendId);
                
                if (!conversationId) {
                    setError('Could not load conversation');
                }
            } catch (err) {
                console.error('Failed to initialize chat:', err);
                setError('Failed to load conversation');
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();
    }, [friendId, isAuthenticated, router, setFriendId, ensureConversation]);

    const handleBack = useCallback(() => {
        // Navigate back to messages tab
        router.push('/friends#messages');
    }, [router]);

    if (!isAuthenticated) {
        return null;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-4">
                    <p className="text-muted-foreground">{error}</p>
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Back to Messages
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Mobile-optimized: Hide header on mobile when in chat */}
            <div className="hidden lg:block">
                <Header />
            </div>
            
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col lg:container lg:mx-auto lg:py-4 lg:px-4"
            >
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col lg:rounded-xl lg:border lg:border-border lg:overflow-hidden">
                        <ChatWindow
                            friendId={friendId}
                            onBack={handleBack}
                        />
                    </div>
                )}
            </motion.main>
        </div>
    );
}
