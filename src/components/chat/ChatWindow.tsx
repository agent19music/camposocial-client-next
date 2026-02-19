'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { useWebSocket } from '@/hooks/useWebSocket';

import Image from 'next/image';
import {
  PaperPlaneTilt,
  Paperclip,
  Smiley,
  Microphone,
  CaretDown,
  Phone,
  VideoCamera,
  Info,
  MagnifyingGlass,
  ArrowLeft,
  X,
  DotsThreeVertical,
  File,
  Image as ImageIcon,
  PlayCircle
} from '@phosphor-icons/react';
import { useChat } from '@/context/chatcontext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { secureDB } from '@/utils/secureStorage';
import { toast } from 'react-hot-toast';
import { extractUrls } from '@/lib/linkify';
import { useLinkPreviews } from '@/hooks/useLinkPreviews';
import { LinkPreviewCard } from '@/components/LinkPreviewCard';
import type { ChatMessage, ChatMedia, ChatWindowProps } from '@/types';

export default function ChatWindow({ friendId, onBack, onToggleProfile, showSidebar }: ChatWindowProps) {
  const {
    messages,
    sendMessage,
    getMessages,
    addReaction,
    deleteMessage,
    editMessage,
    friendDetails,
    currentUser,
    setMessages,
    chatList,
    ensureConversation,
    setFriendId
  } = useChat();

  const { socket, emit, on, isConnected } = useWebSocket();
  const [input, setInput] = useState('');
  // isTyping from context handles the friend typing status
  const { isTyping: friendTyping } = useChat();
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time link preview for message input
  const inputUrls = useMemo(() => extractUrls(input, 1), [input]);
  const inputLinkPreviews = useLinkPreviews(inputUrls, process.env.NEXT_PUBLIC_API_ENDPOINT);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load cached messages on mount
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const loadCachedMessages = useCallback(async (convId: string) => {
    try {
      const cached = await secureDB.getCachedMessages(convId, 50);
      if (cached.length > 0) {
        const formattedMessages: ChatMessage[] = cached.map(msg => ({
          id: parseInt(msg.id),
          senderId: msg.senderId,
          content: msg.content,
          timestamp: msg.timestamp,
          encrypted: msg.encrypted,
          isSent: msg.isSent ?? false,
          isRead: msg.isRead ?? false,
          reactions: (msg.reactions || []).map(r => ({ userId: r.userId, reactionType: r.type })),
          media: [] as ChatMedia[]
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load cached messages:', error);
    }
  }, [setMessages]);

  // Helper to merge messages by union (prefer server data for conflicts, sort by timestamp)
  const mergeMessages = useCallback((cached: ChatMessage[], server: ChatMessage[]): ChatMessage[] => {
    const messageMap = new Map<string, ChatMessage>();

    // Add cached messages first
    cached.forEach(msg => {
      messageMap.set(String(msg.id), msg);
    });

    // Server messages override cached (source of truth)
    server.forEach(msg => {
      messageMap.set(String(msg.id), msg);
    });

    // Sort by timestamp ascending
    return Array.from(messageMap.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, []);

  // Set friendId in context when prop changes - required for sendMessage to work
  useEffect(() => {
    if (friendId) {
      setFriendId(friendId);
    }
  }, [friendId, setFriendId]);

  // Track if we've initialized for this friendId to prevent duplicate fetches
  const initializedFriendIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const initialiseConversation = async () => {
      if (!friendId) return;

      // Prevent re-initialization for the same friend
      if (initializedFriendIdRef.current === friendId) {
        return;
      }

      setIsInitializing(true);

      try {
        // Get or create the real conversation ID from server
        const realConvId = await ensureConversation(friendId);
        if (!active) return;

        if (realConvId) {
          setConversationId(realConvId);
          initializedFriendIdRef.current = friendId;

          // Step 1: Load cached messages immediately for instant UI
          const cached = await secureDB.getCachedMessages(realConvId, 50);
          if (!active) return;

          if (cached.length > 0) {
            const cachedMessages: ChatMessage[] = cached.map(msg => ({
              id: parseInt(msg.id),
              senderId: String(msg.senderId),
              content: msg.content,
              timestamp: msg.timestamp,
              encrypted: msg.encrypted,
              isSent: msg.isSent ?? false,
              isRead: msg.isRead ?? false,
              reactions: (msg.reactions || []).map(r => ({ userId: r.userId, reactionType: r.type })),
              media: [] as ChatMedia[]
            }));
            setMessages(cachedMessages);
          }

          // Step 2: Fetch fresh messages from server in background
          // This will replace cached messages with server data
          await getMessages(friendId, 50);
          // Note: getMessages handles setting messages internally
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error);
        // On network error, cached messages are already displayed (if available)
      } finally {
        if (active) {
          setIsInitializing(false);
        }
      }
    };

    initialiseConversation();

    return () => {
      active = false;
    };
    // Only re-run when friendId changes - other deps are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendId]);

  // FIX: WebSocket handler for side effects ONLY (sound, vibration, caching)
  // IMPORTANT: Do NOT modify React state here - all state updates are handled by ChatContext
  // This separation prevents duplicate state updates and race conditions
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessageSideEffects = async (data: any) => {
      // Only process if it's for the current conversation
      if (conversationId && String(data.conversation_id) !== String(conversationId)) {
        return;
      }

      // Cache the message for offline access (stores encrypted content for later decryption)
      // NOTE: This is IndexedDB storage, NOT React state modification
      if (conversationId) {
        try {
          await secureDB.cacheMessage({
            id: String(data.id),
            conversationId: conversationId,
            // Store ciphertext for encrypted messages, content otherwise
            content: data.encrypted ? (data.ciphertext || data.content) : data.content,
            senderId: String(data.sender_id),
            timestamp: new Date(data.timestamp),
            encrypted: data.encrypted || false
          });
        } catch (error) {
          console.error('Failed to cache message:', error);
        }
      }

      // Play sound and vibrate only for received messages (not own)
      if (String(data.sender_id) !== String(currentUser?.id)) {
        playMessageSound();
        vibrate();
      }
    };

    // Register for side effects only - ChatContext handles all state updates
    const cleanupNewMessage = on('new_message', handleNewMessageSideEffects);

    return () => {
      cleanupNewMessage();
    };
  }, [socket, isConnected, friendId, conversationId, currentUser, on]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle typing indicator - must include conversation_id for proper routing
  const handleTyping = useCallback(() => {
    if (!friendId || !isConnected || !conversationId) return;

    emit('typing', {
      recipient_id: friendId,
      conversation_id: conversationId,
      is_typing: true
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emit('typing', {
        recipient_id: friendId,
        conversation_id: conversationId,
        is_typing: false
      });
    }, 2000);
  }, [friendId, isConnected, conversationId, emit]);

  // Handle infinite scroll
  const handleScroll = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;

    if (scrollTop === 0 && !isLoadingMore && hasMoreMessages && messages.length > 0) {
      setIsLoadingMore(true);
      const oldestMessage = messages[0];

      // Load from cache first
      const cached = await secureDB.getCachedMessages(
        conversationId || '',
        20,
        new Date(oldestMessage.timestamp)
      );

      if (cached.length > 0) {
        const formattedMessages: ChatMessage[] = cached.map(msg => ({
          id: parseInt(msg.id),
          senderId: msg.senderId,
          content: msg.content,
          timestamp: msg.timestamp,
          encrypted: msg.encrypted,
          isSent: msg.isSent ?? false,
          isRead: msg.isRead ?? false,
          media: [] as ChatMedia[],
          reactions: (msg.reactions || []).map(r => ({ userId: r.userId, reactionType: r.type }))
        }));
        setMessages(prev => [...formattedMessages, ...prev]);
      } else {
        // Fetch from server
        const olderMessages = await getMessages(friendId, 20, oldestMessage.id);
        if (olderMessages.length < 20) {
          setHasMoreMessages(false);
        }
      }

      setIsLoadingMore(false);

      // Maintain scroll position
      if (scrollContainerRef.current) {
        const oldHeight = scrollContainerRef.current.scrollHeight;
        setTimeout(() => {
          if (scrollContainerRef.current) {
            const newHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop = newHeight - oldHeight;
          }
        }, 0);
      }
    }
  }, [messages, isLoadingMore, hasMoreMessages, friendId, conversationId, getMessages, setMessages]);



  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];

      if (selectedFiles.length + files.length > 10) {
        toast.error('You can only select up to 10 files');
        return;
      }

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          if (file.size > 10 * 1024 * 1024) {
            toast.error(`Image ${file.name} exceeds 10MB limit`);
            continue;
          }
        } else if (file.type.startsWith('video/')) {
          if (file.size > 20 * 1024 * 1024) {
            toast.error(`Video ${file.name} exceeds 20MB limit`);
            continue;
          }
        }
        validFiles.push(file);
      }

      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
    // Reset input so same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Send message handler
  const handleSend = async () => {
    if (!input.trim() && selectedFiles.length === 0) return;

    const messageContent = input.trim();
    setInput('');
    setReplyingTo(null);
    const filesToSend = selectedFiles;
    setSelectedFiles([]); // Clear immediately

    // Note: Optimistic update is handled by ChatContext.sendMessage()
    // Don't add duplicate message here

    try {
      if (editingMessage) {
        await editMessage(editingMessage.id, messageContent);
        setEditingMessage(null);
      } else {
        // We need to convert File[] to FileList-like object or modify sendMessage to accept File[]
        // Since sendMessage accepts FileList | null, and FileList is iterable, we can try to mock it or update context
        // But standard FileList is read-only.
        // Let's assume sendMessage can handle File[] or we create a DataTransfer
        const dataTransfer = new DataTransfer();
        filesToSend.forEach(file => dataTransfer.items.add(file));

        await sendMessage(
          messageContent,
          dataTransfer.files,
          replyingTo?.id
        );
      }

      // Play send sound
      playSendSound();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');

      // Add to pending messages for retry (files might be lost in pending logic if not handled)
      await secureDB.addPendingMessage({
        conversationId: conversationId || '',
        content: messageContent,
        encrypted: true,
        timestamp: new Date()
      });
    }
  };

  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate([20, 10, 20]);
    }
  };

  const playMessageSound = () => {
    try {
      const audio = new Audio('/sounds/message-received.mp3');
      audio.play().catch(() => { });
    } catch { }
  };

  const playSendSound = () => {
    try {
      const audio = new Audio('/sounds/message-sent.mp3');
      audio.play().catch(() => { });
    } catch { }
  };

  const formatMessageDate = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group messages by sender and time
  const filteredMessages = useMemo(() => {
    if (!searchQuery) return messages;
    return messages.filter(msg =>
      msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const groupedMessages = filteredMessages.reduce((groups: any[], message, index) => {
    const prevMessage = filteredMessages[index - 1];
    const nextMessage = filteredMessages[index + 1];

    const isFirstInGroup = !prevMessage ||
      prevMessage.senderId !== message.senderId ||
      (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) > 60000;

    const isLastInGroup = !nextMessage ||
      nextMessage.senderId !== message.senderId ||
      (new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime()) > 60000;

    return [...groups, { ...message, isFirstInGroup, isLastInGroup }];
  }, []);

  // Fallback friend info from chat list when context friendDetails has not loaded yet
  const displayFriend = useMemo(() => {
    if (friendDetails) return friendDetails;
    const fromList = chatList?.find((f: any) => f.id === friendId);
    if (fromList) {
      return {
        username: `${fromList.firstName || ''} ${fromList.lastName || ''}`.trim(),
        avatar: fromList.avatar || '/default-avatar.png',
        isOnline: false,
        id: fromList.id
      } as any;
    }
    return null;
  }, [friendDetails, chatList, friendId]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-border bg-surface"
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              className="lg:hidden p-2 -ml-2 text-muted-foreground"
              onClick={onBack}
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl cursor-pointer relative"
            onClick={onToggleProfile}
          >
            <Image
              src={displayFriend?.avatar || '/default-avatar.png'}
              alt={displayFriend?.username || 'User avatar'}
              className="w-10 h-10 rounded-full object-cover"
              width={40}
              height={40}
            />
            {displayFriend?.isOnline && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface bg-success"
              />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {displayFriend?.username || 'Loading...'}
            </h2>
            <p className="text-xs text-success">
              {friendTyping ? 'typing...' : (displayFriend?.isOnline ? 'Online' : 'Last seen recently')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSearching ? (
            <div className="flex items-center bg-muted/50 rounded-lg px-2 py-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="bg-transparent border-none outline-none text-sm w-32 md:w-48"
                autoFocus
              />
              <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearching(true)}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
            >
              <MagnifyingGlass size={20} />
            </button>
          )}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
            onClick={onToggleProfile}
          >
            <DotsThreeVertical size={20} />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {isInitializing && (
        <div className="px-4 py-2 bg-info/20 text-info text-sm text-center flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-info border-t-transparent" />
          Loading conversation...
        </div>
      )}
      {!isConnected && !isInitializing && (
        <div className="px-4 py-2 bg-warning/20 text-warning text-sm text-center">
          Reconnecting...
        </div>
      )}

      {/* Messages Container */}
      <ScrollArea
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 px-6 lg:px-4 py-4"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        )}

        <AnimatePresence>
          {groupedMessages.map((message, index) => {
            const showDate = index === 0 ||
              new Date(groupedMessages[index - 1].timestamp).toDateString() !==
              new Date(message.timestamp).toDateString();

            return (
              <React.Fragment key={message.id}>
                {showDate && (
                  <div className="flex items-center justify-center mb-6">
                    <span
                      className="px-3 py-1 rounded-full text-xs bg-card text-muted-foreground"
                    >
                      {formatMessageDate(new Date(message.timestamp))}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isOwn={String(message.senderId) === String(currentUser?.id)}
                  isFirstInGroup={message.isFirstInGroup}
                  isLastInGroup={message.isLastInGroup}
                  showAvatar={true}
                  userName={displayFriend?.username}
                  userAvatar={displayFriend?.avatar}
                  onReply={() => setReplyingTo(message)}
                  onEdit={(newContent) => editMessage(message.id, newContent)}
                  onDelete={() => deleteMessage(message.id)}
                  onReact={(emoji) => addReaction(message.id, emoji)}
                />
              </React.Fragment>
            );
          })}
        </AnimatePresence>

        {friendTyping && (
          <TypingIndicator
            userName={displayFriend?.username}
            userAvatar={displayFriend?.avatar}
          />
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Media Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-3 border-t flex gap-2 overflow-x-auto bg-card border-border">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-border group">
              {file.type.startsWith('image/') ? (
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : file.type.startsWith('video/') ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <PlayCircle size={24} className="text-white" />
                </div>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <File size={24} className="text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Link Preview */}
      {inputUrls.length > 0 && (
        <div className="px-4 py-3 border-t border-border bg-card">
          {inputUrls.map((url) => (
            inputLinkPreviews[url] ? (
              <LinkPreviewCard
                key={url}
                preview={inputLinkPreviews[url]!}
                className="rounded-lg overflow-hidden"
              />
            ) : (
              <div
                key={url}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm text-muted-foreground animate-pulse"
              >
                <div className="w-4 h-4 bg-muted rounded" />
                <span className="truncate">{url}</span>
              </div>
            )
          ))}
        </div>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div
          className="px-4 py-3 border-t border-b flex items-center justify-between bg-card border-border"
        >
          <div className="flex-1 border-l-2 pl-3 border-accent">
            <div className="text-xs font-semibold mb-1 text-accent">
              Replying to {replyingTo.senderId === currentUser?.id ? 'yourself' : displayFriend?.username}
            </div>
            <div className="text-sm truncate text-muted-foreground">
              {replyingTo.content}
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-2 text-muted-foreground"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div
        className="p-4 border-t border-border bg-surface"
      >
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground"
          >
            <Paperclip size={22} />
          </button>

          <div
            className="flex-1 flex items-center gap-2 rounded-xl px-4 py-2 bg-card border border-border"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={editingMessage ? "Edit message..." : "Enter your message here"}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 bg-transparent outline-none text-foreground"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-muted-foreground"
            >
              <Smiley size={20} />
            </button>
          </div>

          {input.trim() || selectedFiles.length > 0 || editingMessage ? (
            <button
              onClick={handleSend}
              className="p-3 rounded-lg bg-accent text-background-hex transition-colors"
            >
              <PaperPlaneTilt size={20} weight="fill" />
            </button>
          ) : (
            <button
              className="p-3 rounded-lg text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Microphone size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
