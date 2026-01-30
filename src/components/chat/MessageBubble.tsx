'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Check,
  Checks,
  Clock,
  DotsThreeVertical,
  ArrowBendUpLeft,
  PencilSimple,
  Trash,
  Copy,
  Heart,
  X
} from '@phosphor-icons/react';
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
  isDeleted?: boolean;
  encrypted?: boolean;
  reactions?: Array<{ userId: string; reactionType: string }>;
  replyTo?: {
    id: string | number;
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
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  onReact?: (emoji: string) => void;
  onCopy?: () => void;
  userName?: string;
  userAvatar?: string;
}

// 15 minutes in milliseconds
const EDIT_WINDOW_MS = 15 * 60 * 1000;

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
  onReact,
  onCopy,
  userName,
  userAvatar
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [reactionsExpanded, setReactionsExpanded] = useState(false);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if message can be edited (within 15 min window)
  const canEdit = isOwn && (Date.now() - new Date(message.timestamp).getTime()) < EDIT_WINDOW_MS;

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  // Focus textarea when edit dialog opens
  useEffect(() => {
    if (showEditDialog && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [showEditDialog]);

  // Handle menu visibility with auto-close timeout
  const handleMenuShow = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setShowMenu(true);
    menuTimeoutRef.current = setTimeout(() => {
      setShowMenu(false);
    }, 3000);
  };

  const handleMenuInteraction = () => {
    // Reset timeout when interacting with menu
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    menuTimeoutRef.current = setTimeout(() => {
      setShowMenu(false);
    }, 3000);
  };

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(editContent.trim());
    }
    setShowEditDialog(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setShowEditDialog(false);
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;

    if (message.isRead) {
      return <Checks className="w-3 h-3 text-primary" />;
    } else if (message.isDelivered) {
      return <Checks className="w-3 h-3 text-muted-foreground" />;
    } else if (message.isSent) {
      return <Check className="w-3 h-3 text-muted-foreground" />;
    } else {
      return <Clock className="w-3 h-3 text-muted-foreground" />;
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
    <>
      <motion.div
        variants={bubbleVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          "flex items-end gap-2 mb-1",
          isOwn ? "justify-end" : "justify-start"
        )}
        onMouseEnter={handleMenuShow}
        onMouseLeave={() => {
          // Don't hide immediately - let timeout handle it
        }}
        onClick={handleMenuInteraction}
      >
        <div className={cn(
          "flex flex-col max-w-[70%]",
          isOwn ? "items-end" : "items-start"
        )}>
          {/* Reply Preview - Enhanced styling */}
          {message.replyTo && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mb-2 py-2 px-3 border-l-3 rounded-r-lg text-sm cursor-pointer hover:opacity-90 transition-opacity",
                isOwn
                  ? "border-white/40 bg-black/15 dark:bg-white/15"
                  : "border-accent bg-accent/15"
              )}
            >
              <div className={cn(
                "font-semibold text-xs mb-0.5",
                isOwn ? "text-white/80 dark:text-black/80" : "text-accent"
              )}>
                {message.replyTo.senderName}
              </div>
              <div className="truncate text-xs opacity-80">{message.replyTo.content}</div>
            </motion.div>
          )}

          {/* Message Bubble */}
          <div className="relative group">
            <div
              className={cn(
                "px-4 py-2 rounded-2xl relative inline-block",
                isOwn
                  ? "bg-[var(--color-primary-dark)] text-white dark:bg-accent dark:text-black"
                  : "bg-surface text-foreground",
                isFirstInGroup && isOwn && "rounded-tr-sm",
                isFirstInGroup && !isOwn && "rounded-tl-sm",
                !isFirstInGroup && !isLastInGroup && isOwn && "rounded-r-sm",
                !isFirstInGroup && !isLastInGroup && !isOwn && "rounded-l-sm"
              )}
            >
              {/* Message Content - handle deleted and encrypted messages */}
              {message.isDeleted ? (
                <p className="text-sm italic text-muted-foreground/70">
                  This message was deleted
                </p>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content ? message.content : (message.encrypted ? '🔒 Encrypted message' : '')}
                </p>
              )}

              {/* Media Attachments */}
              {message.media && message.media.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.media.map((item, index) => (
                    <div key={index}>
                      {item.type === 'image' && item.url && (
                        <div className="relative w-full h-auto min-h-[120px]">
                          <Image
                            src={item.url}
                            alt="Attachment"
                            fill
                            className="rounded-lg object-contain"
                            sizes="(max-width: 768px) 90vw, 600px"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      {item.type === 'video' && item.url && (
                        <div className="video-container">
                          <video
                            controls
                            preload="metadata"
                            className="rounded-lg max-w-full"
                            onError={(e) => {
                              console.warn('Video failed to load:', item.url);
                              const container = (e.target as HTMLVideoElement).parentElement;
                              if (container) container.style.display = 'none';
                            }}
                          >
                            {item.url.endsWith('.webm') ? (
                              <source src={item.url} type="video/webm" />
                            ) : item.url.endsWith('.mp4') ? (
                              <source src={item.url} type="video/mp4" />
                            ) : (
                              <>
                                <source src={item.url} type="video/mp4" />
                                <source src={item.url} type="video/webm" />
                              </>
                            )}
                          </video>
                        </div>
                      )}
                      {item.type === 'file' && item.url && (
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

              {/* Reactions - with nesting after 3 */}
              {message.reactions && message.reactions.length > 0 && !message.isDeleted && (() => {
                const groupedReactions = Object.entries(
                  message.reactions.reduce((acc, r) => {
                    acc[r.reactionType] = (acc[r.reactionType] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                );
                const visibleReactions = reactionsExpanded ? groupedReactions : groupedReactions.slice(0, 3);
                const hiddenCount = groupedReactions.length - 3;

                return (
                  <div className="absolute -bottom-3 left-2 flex gap-1 items-center">
                    {visibleReactions.map(([type, count]) => (
                      <motion.div
                        key={type}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-card rounded-full px-1.5 py-0.5 shadow-sm border border-border flex items-center gap-0.5"
                      >
                        <span className="text-xs">{reactionEmojis[type as keyof typeof reactionEmojis]}</span>
                        {count > 1 && <span className="text-[10px] text-muted-foreground">{count}</span>}
                      </motion.div>
                    ))}
                    {hiddenCount > 0 && !reactionsExpanded && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => setReactionsExpanded(true)}
                        className="bg-card rounded-full px-1.5 py-0.5 shadow-sm border border-border text-[10px] text-muted-foreground hover:bg-muted transition-colors"
                      >
                        +{hiddenCount}
                      </motion.button>
                    )}
                    {reactionsExpanded && hiddenCount > 0 && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => setReactionsExpanded(false)}
                        className="bg-card rounded-full p-0.5 shadow-sm border border-border text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Action Menu - persists for 3s after interaction */}
            <AnimatePresence>
              {showMenu && !message.isDeleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    "absolute top-0 flex items-center gap-1",
                    isOwn ? "right-full mr-2" : "left-full ml-2"
                  )}
                  onMouseEnter={handleMenuInteraction}
                >
                  {/* Quick Reactions */}
                  <button
                    onClick={() => {
                      setShowReactions(!showReactions);
                      handleMenuInteraction();
                    }}
                    className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm shadow-sm border border-border hover:bg-muted transition-colors"
                  >
                    <Heart className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {/* More Options */}
                  <DropdownMenu onOpenChange={(open) => {
                    if (open) handleMenuInteraction();
                  }}>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm shadow-sm border border-border hover:bg-muted transition-colors">
                        <DotsThreeVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isOwn ? "end" : "start"} className="min-w-[120px]">
                      <DropdownMenuItem onClick={onReply}>
                        <ArrowBendUpLeft className="w-4 h-4 mr-2" />
                        Reply
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </DropdownMenuItem>
                      {isOwn && canEdit && (
                        <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                          <PencilSimple className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {isOwn && (
                        <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
                          <Trash className="w-4 h-4 mr-2" />
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
                    "absolute bottom-full mb-2 bg-card rounded-full shadow-lg p-2 flex gap-1 z-10",
                    isOwn ? "right-0" : "left-0"
                  )}
                >
                  {Object.entries(reactionEmojis).map(([key, emoji]) => (
                    <button
                      key={key}
                      onClick={() => handleReaction(key)}
                      className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
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
            "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}>
            <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
            {message.isEdited && <span>• edited</span>}
            {getStatusIcon()}
          </div>
        </div>
      </motion.div>

      {/* Edit Message Dialog */}
      <AnimatePresence>
        {showEditDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleEditCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-card rounded-xl shadow-xl border border-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">Edit Message</h3>
                <button
                  onClick={handleEditCancel}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <textarea
                  ref={editTextareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[100px] p-3 bg-muted/50 border border-border rounded-lg 
                         text-foreground placeholder:text-muted-foreground resize-none
                         focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Edit your message..."
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/30">
                <button
                  onClick={handleEditCancel}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground 
                         hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={!editContent.trim() || editContent === message.content}
                  className="px-4 py-2 text-sm font-medium bg-accent text-accent-foreground 
                         rounded-lg hover:bg-accent/90 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
