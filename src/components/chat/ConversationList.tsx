"use client";

import { useContext, useEffect } from "react";
import { MessageContext } from "@/context/messagecontext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export function ConversationList() {
  const { conversations, loadConversations, setCurrentConversation, currentConversation } = useContext(MessageContext);

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] border-r">
      <div className="p-4 space-y-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
              currentConversation?.id === conversation.id ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
            onClick={() => setCurrentConversation(conversation)}
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={conversation.participantPhoto} alt={conversation.participantName} />
                <AvatarFallback>{conversation.participantName[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              {conversation.isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-sm font-semibold truncate">{conversation.participantName}</h4>
                {conversation.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
                  </span>
                )}
              </div>
              {conversation.lastMessage && (
                <p className="text-sm text-gray-500 truncate">{conversation.lastMessage.content}</p>
              )}
            </div>
            {conversation.unreadCount > 0 && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">{conversation.unreadCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}