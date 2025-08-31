'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Check,
  CheckCheck,
  Clock,
  MoreVertical,
  Reply,
  Edit2,
  Trash2,
  Forward,
  Copy,
  Heart,
  ThumbsUp,
  Laugh,
  Frown,
  Angry
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Message {
  id: number | string;
  senderId: string;
  content: string;
  timestamp: Date;
  isSent?: boolean;
  isDelivered?: boolean;
  isRead?: boolean;
  isEdited?: boolean;
  reactions?: Array<{ userId: string; type: string }>;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  media?: Array<{
    url: string;
    type: 'image' | 'video' | 'file';
    name?: string;
  }>;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onForward?: () => void;
  onReact?: (emoji: string) => void;
  onCopy?: () => void;
  userName?: string;
  userAvatar?: string;
}

const reactionEmojis = {
  heart: '❤️',
  thumbsup: '👍',
  laugh: '😂',
  sad: '😢',
  angry: '😠',
  wow: '😮'
};

export default function MessageBubble({
  message,
  isOwn,
  showAvatar = false,
  isFirstInGroup = false,
  isLastInGroup = false,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onReact,
  onCopy,
  userName,
  userAvatar
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    if (message.isRead) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    } else if (message.isDelivered) {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    } else if (message.isSent) {
      return <Check className="w-3 h-3 text-gray-400" />;
    } else {
      return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const bubbleVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.8,
      y: 20 
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  const handleReaction = (emoji: string) => {
    onReact?.(emoji);
    setShowReactions(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    onCopy?.();
  };

  return (
    <motion.div
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "flex items-end gap-2 mb-1",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="w-8 h-8 flex-shrink-0">
          {isLastInGroup && (
            <img
              src={userAvatar || '/default-avatar.png'}
              alt={userName}
              className="w-8 h-8 rounded-full"
            />
          )}
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[70%]",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Reply Preview */}
        {message.replyTo && (
          <div className={cn(
            "mb-1 px-3 py-1 rounded-lg text-xs opacity-70",
            isOwn ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"
          )}>
            <p className="font-semibold">{message.replyTo.senderName}</p>
            <p className="truncate">{message.replyTo.content}</p>
          </div>
        )}

        {/* Message Bubble */}
        <div className="relative group">
          <div
            className={cn(
              "px-4 py-2 rounded-2xl relative",
              isOwn 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100",
              isFirstInGroup && isOwn && "rounded-tr-sm",
              isFirstInGroup && !isOwn && "rounded-tl-sm",
              !isFirstInGroup && !isLastInGroup && isOwn && "rounded-r-sm",
              !isFirstInGroup && !isLastInGroup && !isOwn && "rounded-l-sm"
            )}
          >
            {/* Message Content */}
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Media Attachments */}
            {message.media && message.media.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.media.map((item, index) => (
                  <div key={index}>
                    {item.type === 'image' && (
                      <img
                        src={item.url}
                        alt="Attachment"
                        className="rounded-lg max-w-full"
                      />
                    )}
                    {item.type === 'video' && (
                      <video
                        src={item.url}
                        controls
                        className="rounded-lg max-w-full"
                      />
                    )}
                    {item.type === 'file' && (
                      <a
                        href={item.url}
                        download={item.name}
                        className="flex items-center gap-2 p-2 bg-white/10 rounded-lg"
                      >
                        <span className="text-xs">{item.name}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="absolute -bottom-3 left-2 flex gap-1">
                {Object.entries(
                  message.reactions.reduce((acc, r) => {
                    acc[r.type] = (acc[r.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <motion.div
                    key={type}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-full px-1.5 py-0.5 shadow-sm border border-gray-200 dark:border-gray-600 flex items-center gap-1"
                  >
                    <span className="text-xs">{reactionEmojis[type as keyof typeof reactionEmojis]}</span>
                    {count > 1 && <span className="text-xs text-gray-500">{count}</span>}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Action Menu */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  "absolute top-0 flex items-center gap-1",
                  isOwn ? "right-full mr-2" : "left-full ml-2"
                )}
              >
                {/* Quick Reactions */}
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Heart className="w-4 h-4 text-gray-500" />
                </button>

                {/* More Options */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwn ? "end" : "start"}>
                    <DropdownMenuItem onClick={onReply}>
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </DropdownMenuItem>
                    {isOwn && (
                      <DropdownMenuItem onClick={onEdit}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onForward}>
                      <Forward className="w-4 h-4 mr-2" />
                      Forward
                    </DropdownMenuItem>
                    {isOwn && (
                      <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reaction Picker */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                className={cn(
                  "absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-full shadow-lg p-2 flex gap-1",
                  isOwn ? "right-0" : "left-0"
                )}
              >
                {Object.entries(reactionEmojis).map(([key, emoji]) => (
                  <button
                    key={key}
                    onClick={() => handleReaction(key)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <span className="text-lg">{emoji}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timestamp and Status */}
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs text-gray-500",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
          {message.isEdited && <span>• edited</span>}
          {getStatusIcon()}
        </div>
      </div>
    </motion.div>
  );
}
