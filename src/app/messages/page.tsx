"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useChat } from "@/context/chatcontext";
import { useAuth } from "@/context/authcontext";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

interface Conversation {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
  } | null;
  isEmpty: boolean;
  isOnline: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, fetchConversations } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [displayConversations, setDisplayConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      try {
        if (fetchConversations) {
          const conversationsData = await fetchConversations();
          // Filter out empty conversations if needed
          // Alternatively, you can keep them and handle display differently
          const nonEmptyConversations = conversationsData.filter(conv => !conv.isEmpty);
          setDisplayConversations(nonEmptyConversations);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load conversations:", error);
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [fetchConversations]);
  
  // Update display conversations when conversations change in context
  useEffect(() => {
    if (conversations) {
      // Filter out empty conversations if needed
      const nonEmptyConversations = conversations.filter(conv => !conv.isEmpty);
      setDisplayConversations(nonEmptyConversations);
    }
  }, [conversations]);

  const handleConversationClick = (id: string) => {
    router.push(`/messages/${id}`);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-slate-950">
      <div className="border-b p-4 flex items-center justify-between dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Messages</h1>
        </div>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : displayConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <MessageCircle className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No conversations yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Start chatting with your friends to see conversations here
            </p>
          </div>
        ) : (
          <div className="divide-y dark:divide-slate-800">
            {displayConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
                onClick={() => handleConversationClick(conversation.id)}
              >
                <div className="relative h-12 w-12">
                  <Image
                    src={conversation.friendAvatar || "/default-avatar.png"}
                    alt={conversation.friendName}
                    className="rounded-full object-cover"
                    width={48}
                    height={48}
                  />
                  {conversation.isOnline && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-950"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conversation.friendName}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {conversation.lastMessage && new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${conversation.lastMessage && conversation.lastMessage.isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                    {conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet'}
                  </p>
                </div>
                </div>
                {conversation.lastMessage && !conversation.lastMessage.isRead && (
                  <div className="h-2.5 w-2.5 bg-blue-500 rounded-full"></div>
                )}
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

