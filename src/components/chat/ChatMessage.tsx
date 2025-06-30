"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/authcontext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ChatMessageProps {
  message: {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio' | 'file';
  };
  senderName: string;
  senderPhoto: string;
}

export function ChatMessage({ message, senderName, senderPhoto }: ChatMessageProps) {
  const { user } = useContext(AuthContext);
  const isOwnMessage = message.senderId === user?.id;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        <Avatar className="w-8 h-8">
          <AvatarImage src={senderPhoto} alt={senderName} />
          <AvatarFallback>{senderName[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className={`max-w-md ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
          {message.mediaUrl && (
            <div className="mb-2">
              {message.mediaType === 'image' && (
                <img src={message.mediaUrl} alt="Shared image" className="rounded-lg max-w-sm" />
              )}
              {message.mediaType === 'video' && (
                <video controls className="rounded-lg max-w-sm">
                  <source src={message.mediaUrl} type="video/mp4" />
                </video>
              )}
              {message.mediaType === 'audio' && (
                <audio controls className="w-full">
                  <source src={message.mediaUrl} type="audio/mpeg" />
                </audio>
              )}
              {message.mediaType === 'file' && (
                <a
                  href={message.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-500 hover:underline"
                >
                  <span>📎</span>
                  <span>Download attachment</span>
                </a>
              )}
            </div>
          )}
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
            {format(new Date(message.timestamp), 'HH:mm')}
          </p>
        </div>
      </div>
    </div>
  );
}