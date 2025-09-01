'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import Image from 'next/image';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  ChevronDown,
  Phone,
  Video,
  Info,
  Search,
  ArrowLeft
} from 'lucide-react';
import { useChat } from '@/context/chatcontext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { secureDB } from '@/utils/secureStorage';
import { toast } from 'react-hot-toast';
import { ChatMessage, ChatMedia    } from '@/utils/types';
interface ChatWindowProps {
  conversationId?: string;
  friendId: string;
  onBack?: () => void;
}

export default function ChatWindow({ conversationId, friendId, onBack }: ChatWindowProps) {
  const { 
    messages, 
    sendMessage, 
    getMessages,
    addReaction,
    deleteMessage,
    editMessage,
    friendDetails,
    currentUser,
    setMessages
  } = useChat();
  
  const { socket, emit, on, off, isConnected } = useWebSocket();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load cached messages on mount
  const loadCachedMessages = useCallback(async () => {
    if (!conversationId) return;
    
    const cached = await secureDB.getCachedMessages(conversationId, 50);
    if (cached.length > 0) {
      const formattedMessages = cached.map(msg => ({
        id: parseInt(msg.id),
        senderId: msg.senderId,
        content: msg.content,
        timestamp: msg.timestamp,
        encrypted: msg.encrypted,
        isSent: msg.isSent ?? false,
        isDelivered: msg.isDelivered ?? false,
        isRead: msg.isRead ?? false,
        reactions: (msg.reactions || []).map(r => ({ userId: r.userId, reactionType: r.type })),
        media: [] as ChatMedia[]
      }));
      setMessages(formattedMessages as ChatMessage[]);
    }
    
    // Fetch latest messages from server
    if (friendId) {
      await getMessages(friendId, 50);
    }
  }, [conversationId, friendId, getMessages, setMessages]);

  useEffect(() => {
    loadCachedMessages();
  }, [loadCachedMessages]);

  // WebSocket event handlers
  const handleReactionUpdate = useCallback((data: any) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.message_id
        ? {
            ...msg,
            reactions: [
              ...(msg.reactions || []).filter(r => r.userId !== data.user_id),
              { userId: data.user_id, reactionType: data.reaction_type }
            ]
          }
        : msg as ChatMessage
    ));
  }, [setMessages]);

  // Handle message edit
  const handleMessageEdit = useCallback((data: any) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.message_id
        ? { ...msg, content: data.new_content, isEdited: true }
        : msg
    ));
  }, [setMessages]);

  // Handle message delete
  const handleMessageDelete = useCallback((data: any) => {
    setMessages(prev => prev.filter(msg => msg.id !== data.message_id));
  }, [setMessages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (data: any) => {
      // Add to messages and cache
      const newMessage = {
        id: data.id,
        senderId: data.sender_id,
        content: data.content,
        timestamp: new Date(data.timestamp),
        encrypted: data.encrypted,
        isSent: true,
        isDelivered: true,
        media: data.media,
        reactions: data.reactions,
        isRead: data.is_read
      };
      
      setMessages(prev => [...prev, newMessage as ChatMessage]);
      
      // Cache the message
      await secureDB.cacheMessage({
        id: String(data.id),
        conversationId: conversationId || '',
        content: data.content,
        senderId: data.sender_id,
        timestamp: new Date(data.timestamp),
        encrypted: data.encrypted
      });
      
      // Play sound and vibrate
      playMessageSound();
      vibrate();
    };

    const handleTypingIndicator = (data: any) => {
      if (data.user_id === friendId) {
        setFriendTyping(data.is_typing);
      }
    };

    const handleMessageRead = async (data: any) => {
      // Update message read status
      const messageIds = data.message_ids;
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) 
          ? { ...msg, isRead: true }
          : msg
      ));
      
      // Update cache
      for (const msgId of messageIds) {
        await secureDB.updateMessageStatus(String(msgId), { isRead: true });
      }
    };

    on('new_message', handleNewMessage);
    on('typing_indicator', handleTypingIndicator);
    on('messages_read', handleMessageRead);
    on('reaction_added', handleReactionUpdate);
    on('message_edited', handleMessageEdit);
    on('message_deleted', handleMessageDelete);

    return () => {
      off('new_message', handleNewMessage);
      off('typing_indicator', handleTypingIndicator);
      off('messages_read', handleMessageRead);
      off('reaction_added', handleReactionUpdate);
      off('message_edited', handleMessageEdit);
      off('message_deleted', handleMessageDelete);
    };
  }, [socket, friendId, conversationId, on, off, handleReactionUpdate, handleMessageEdit, handleMessageDelete, setMessages]);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      emit('typing', { 
        conversation_id: conversationId, 
        user_id: currentUser?.id,
        is_typing: true 
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emit('typing', { 
        conversation_id: conversationId,
        user_id: currentUser?.id,
        is_typing: false 
      });
    }, 1000);
  }, [isTyping, conversationId, currentUser, emit]);

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
        const formattedMessages = cached.map(msg => ({
          id: parseInt(msg.id),
          senderId: msg.senderId,
          content: msg.content,
          timestamp: msg.timestamp,
          encrypted: msg.encrypted,
          isSent: msg.isSent ?? false,
          isDelivered: msg.isDelivered ?? false,
          isRead: msg.isRead ?? false,
          media: [] as ChatMedia[],
          reactions: (msg.reactions || []).map(r => ({ userId: r.userId, reactionType: r.type }))   
        }));
        setMessages(prev => [...formattedMessages as ChatMessage[], ...prev] as ChatMessage[]);
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

  // Send message handler
  const handleSend = async () => {
    if (!input.trim() && !fileInputRef.current?.files?.length) return;

    const messageContent = input.trim();
    setInput('');
    setReplyingTo(null);
    
    // Optimistic update
    const tempMessage = {
      id: Date.now(), // Use number instead of string
      senderId: currentUser?.id || '',
      content: messageContent,
      timestamp: new Date(),
      isSent: false,
      isDelivered: false,
      isRead: false,
      replyTo: replyingTo?.id,
      media: [] as ChatMedia[],
      reactions: [] as { userId: string; reactionType: string }[],
      encrypted: true
    };
    
    setMessages(prev => [...prev, tempMessage as ChatMessage]);
    
    try {
      if (editingMessage) {
        await editMessage(editingMessage.id, messageContent);
        setEditingMessage(null);
      } else {
        await sendMessage(
          messageContent, 
          fileInputRef.current?.files || null, 
          replyingTo?.id
        );
      }
      
      // Cache the message
      await secureDB.cacheMessage({
        id: String(tempMessage.id),
        conversationId: conversationId || '',
        content: messageContent,
        senderId: currentUser?.id || '',
        timestamp: new Date(),
        encrypted: true,
        isSent: true,
        isDelivered: true,
        isRead: false,
        reactions: []
      });
      
      // Play send sound
      playSendSound();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      
      // Add to pending messages for retry
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
      audio.play().catch(() => {});
    } catch {}
  };

  const playSendSound = () => {
    try {
      const audio = new Audio('/sounds/message-sent.mp3');
      audio.play().catch(() => {});
    } catch {}
  };

  const formatMessageDate = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Group messages by sender and time
  const groupedMessages = messages.reduce((groups: any[], message, index) => {
    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    
    const isFirstInGroup = !prevMessage || 
      prevMessage.senderId !== message.senderId ||
      (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) > 60000;
    
    const isLastInGroup = !nextMessage || 
      nextMessage.senderId !== message.senderId ||
      (new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime()) > 60000;
    
    return [...groups, { ...message, isFirstInGroup, isLastInGroup }];
  }, []);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative">
            <Image 
              src={friendDetails?.avatar || '/default-avatar.png'} 
              alt={friendDetails?.username || 'User avatar'}
              className="w-10 h-10 rounded-full object-cover"
              width={40}
              height={40}
            />
            {friendDetails?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {friendDetails?.username || 'Loading...'}
            </h2>
            {friendTyping ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">typing...</p>
            ) : friendDetails?.isOnline ? (
              <p className="text-xs text-green-500">Active now</p>
            ) : null}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm text-center">
          Connecting to chat server...
        </div>
      )}

      {/* Messages Container */}
      <ScrollArea 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 px-4 py-4"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
          </div>
        )}

        <AnimatePresence>
          {groupedMessages.map((message, index) => {
            const showDate = index === 0 || 
              new Date(messages[index - 1].timestamp).toDateString() !== 
              new Date(message.timestamp).toDateString();

            return (
              <React.Fragment key={message.id}>
                {showDate && (
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                      {formatMessageDate(new Date(message.timestamp))}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={message}
                  isOwn={message.senderId === currentUser?.id}
                  isFirstInGroup={message.isFirstInGroup}
                  isLastInGroup={message.isLastInGroup}
                  showAvatar={true}
                  userName={friendDetails?.username}
                  userAvatar={friendDetails?.avatar}
                  onReply={() => setReplyingTo(message)}
                  onEdit={() => {
                    setEditingMessage(message);
                    setInput(message.content);
                  }}
                  onDelete={() => deleteMessage(message.id)}
                  onReact={(emoji) => addReaction(message.id, emoji)}
                />
              </React.Fragment>
            );
          })}
        </AnimatePresence>

        {friendTyping && (
          <TypingIndicator 
            userName={friendDetails?.username}
            userAvatar={friendDetails?.avatar}
          />
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Reply Preview */}
      {replyingTo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Replying to {replyingTo.senderId === currentUser?.id ? 'yourself' : friendDetails?.username}
              </span>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-400 truncate mt-1">
            {replyingTo.content}
          </p>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
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
              placeholder={editingMessage ? "Edit message..." : "Type a message..."}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
              rows={1}
            />
          </div>

          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Smile className="w-5 h-5" />
          </button>

          {input.trim() || editingMessage ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          ) : (
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
