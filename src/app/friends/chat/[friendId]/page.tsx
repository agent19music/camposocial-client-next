"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatProvider from '@/context/chatcontext';
import ChatWindow from '@/components/chat/ChatWindow';
import Header from '@/components/header';

/**
 * Direct chat page with a specific friend
 */
export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const friendId = params.friendId as string;

    const handleBack = () => {
        router.push('/friends');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            
            <ChatProvider>
                <main className="flex-1 flex flex-col">
                    <ChatWindow 
                        friendId={friendId}
                        onBack={handleBack}
                        showSidebar={false}
                    />
                </main>
            </ChatProvider>
        </div>
    );
}
