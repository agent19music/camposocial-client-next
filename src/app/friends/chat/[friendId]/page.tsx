"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChatCircle, ArrowLeft } from '@phosphor-icons/react';
import Header from '@/components/header';

/**
 * Chat page temporarily disabled during messaging refactor.
 * Shows a placeholder message and redirects back to friends.
 */
export default function ChatPage() {
    const router = useRouter();

    const handleBack = () => {
        router.push('/friends');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-6 text-center"
            >
                <div className="max-w-md space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <ChatCircle size={40} className="text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-foreground">
                            Messaging Coming Soon
                        </h1>
                        <p className="text-muted-foreground">
                            We're working on making messaging even better. Stay tuned for updates!
                        </p>
                    </div>
                    
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                    >
                        <ArrowLeft size={20} />
                        Back to Friends
                    </button>
                </div>
            </motion.main>
        </div>
    );
}
