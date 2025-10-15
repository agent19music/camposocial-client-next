'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/context/chatcontext';
import { useContext } from 'react';
import { AuthContext } from '@/context/authcontext';
import ChatWindow from '@/components/chat/ChatWindow';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageSquare, Users } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const { 
    getChatList, 
    chatList, 
    fetchConversations,
    conversations,
    generateConversationId,
    setFriendId,
    friendId,
    generateKeys,
    keyStatus
  } = useChat();

  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      await getChatList();
      await fetchConversations();
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [getChatList, fetchConversations]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Initialize encryption keys if not available
    if (keyStatus === 'unavailable') {
      generateKeys();
    }

    loadConversations();
  }, [isAuthenticated, keyStatus, generateKeys, loadConversations, router]);

  const handleSelectFriend = (friend: any) => {
    setSelectedFriend(friend.id);
    setFriendId(friend.id);
  };

  const filteredChatList = chatList?.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Mobile responsive: Show chat window or list based on selection
  const showChatWindow = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(selectedFriend) && window.innerWidth < 768;
  }, [selectedFriend]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Hidden on mobile when chat is open */}
      <div className={`${showChatWindow ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 dark:bg-gray-700 border-none"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : filteredChatList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <MessageSquare className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No conversations yet. Start chatting with your friends!
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredChatList.map((user) => {
                const conversation = conversations.find(c => c.friendId === user.id);
                const isSelected = selectedFriend === user.id;
                
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectFriend(user)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {conversation?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {user.firstName} {user.lastName}
                        </h3>
                        {conversation?.lastMessageTime && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(conversation.lastMessageTime), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {conversation?.lastMessage || 'Start a conversation'}
                      </p>
                    </div>
                    
                    {conversation?.unreadCount && conversation.unreadCount > 0 && (
                      <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Encryption Status */}
        {keyStatus === 'generating' && (
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm text-center">
            Generating encryption keys...
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className={`${showChatWindow || !selectedFriend ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedFriend ? (
          <ChatWindow
            conversationId  ={currentUser && generateConversationId(currentUser.id, selectedFriend) || undefined}    
            friendId={selectedFriend}
            onBack={() => setSelectedFriend(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a friend from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
