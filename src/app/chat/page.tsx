'use client';

import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChat } from '@/context/chatcontext';
import { useContext } from 'react';
import { AuthContext } from '@/context/authcontext';
import ChatWindow from '@/components/chat/ChatWindow';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MagnifyingGlass,
  DotsThreeVertical,
  ChatCircle,
  Users,
  X,
  Phone,
  VideoCamera,
  Bell,
  Prohibit,
  CaretLeft
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Header from '@/components/header';

function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useContext(AuthContext);
  const {
    getChatList,
    chatList,
    fetchConversations,
    conversations,
    setFriendId,
    keyStatus
  } = useChat();

  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [showChats, setShowChats] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false); // Right sidebar (User Info)

  // Read user param from URL and auto-select friend
  const userParam = searchParams.get('user');

  useEffect(() => {
    if (userParam && !selectedFriend) {
      setSelectedFriend(userParam);
      setFriendId(userParam);
      setShowChats(false); // On mobile, go to chat
    }
  }, [userParam, selectedFriend, setFriendId]);

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
    loadConversations();
  }, [isAuthenticated, loadConversations, router]);

  const handleSelectFriend = (friend: any) => {
    setSelectedFriend(friend.id);
    setFriendId(friend.id);
    setShowChats(false);
  };

  const filteredChatList = chatList?.filter((user: any) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const selectedFriendData = useMemo(() => {
    return chatList?.find((f: any) => f.id === selectedFriend);
  }, [chatList, selectedFriend]);

  const selectedConversation = useMemo(() => {
    return conversations.find(c => c.friendId === selectedFriend);
  }, [conversations, selectedFriend]);

  return (
    <div className="flex flex-col h-screen bg-background-hex font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden pb-20 lg:pb-0">
        {/* Left Sidebar - Chat List */}
        <div
          className={`${showChats ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-80 border-r border-border bg-surface`}
        >
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-foreground">
                Chats
              </h1>
              <button className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground">
                <DotsThreeVertical size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg outline-none bg-card text-foreground border border-border focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              filteredChatList.map((user: any) => {
                const conversation = conversations.find(c => c.friendId === user.id);
                const isSelected = selectedFriend === user.id;

                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectFriend(user)}
                    className="flex items-center gap-3 p-4 cursor-pointer transition-all border-l-4"
                    style={{
                      backgroundColor: isSelected ? 'var(--color-card)' : 'transparent',
                      borderLeftColor: isSelected ? 'var(--color-accent)' : 'transparent'
                    }}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                      </Avatar>
                      {conversation?.isOnline && (
                        <div
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface bg-success"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium truncate text-foreground">
                          {user.firstName} {user.lastName}
                        </h3>
                        {conversation?.lastMessageTime && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(conversation.lastMessageTime), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm truncate text-muted-foreground">
                          {!conversation?.lastMessage
                            ? 'Start a conversation'
                            : (conversation.lastMessage.length > 50 && /^[A-Za-z0-9+/=]+$/.test(conversation.lastMessage.slice(0, 50)))
                              ? '🔒 Encrypted message'
                              : conversation.lastMessage
                          }
                        </p>
                        {conversation?.unreadCount && conversation.unreadCount > 0 ? (
                          <span
                            className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 bg-accent text-accent-foreground"
                          >
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Nav (Optional - keeping simplified version if needed, or remove if Header handles nav) */}
          <div className="flex items-center justify-around p-4 border-t border-border lg:hidden">
            {/* Mobile bottom nav items could go here if not using main app nav */}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`${!showChats ? 'flex' : 'hidden'} lg:flex flex-col flex-1 bg-background-hex`}
        >
          {selectedFriend ? (
            <ChatWindow
              friendId={selectedFriend}
              onBack={() => setShowChats(true)}
              onToggleProfile={() => setShowSidebar(!showSidebar)}
              showSidebar={showSidebar}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
              <ChatCircle size={64} weight="thin" />
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - User Info */}
        {selectedFriend && selectedFriendData && (
          <div
            className={`${showSidebar ? 'flex' : 'hidden'} lg:flex flex-col w-80 border-l border-border bg-surface transition-all duration-300`}
            style={{ display: showSidebar ? 'flex' : 'none' }} // Force hide on desktop if toggled off? Or always show on desktop? Snippet implies toggleable.
          >
            <div className="p-6 text-center border-b border-border relative">
              <button
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSidebar(false)}
              >
                <X size={20} />
              </button>
              <div className="w-24 h-24 mx-auto mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={selectedFriendData.avatar} />
                  <AvatarFallback className="text-4xl">{selectedFriendData.firstName?.[0]}</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-xl font-semibold mb-1 text-foreground">
                {selectedFriendData.firstName} {selectedFriendData.lastName}
              </h2>
              <p className="text-sm text-success">
                {selectedConversation?.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                    About
                  </h3>
                  <p className="text-sm text-foreground">
                    {(selectedFriendData as any).bio || "No bio available"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                    Actions
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-3 rounded-lg bg-card text-foreground hover:bg-accent/10 transition-colors flex items-center gap-3">
                      <MagnifyingGlass size={18} />
                      Search in conversation
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg bg-card text-foreground hover:bg-accent/10 transition-colors flex items-center gap-3">
                      <Bell size={18} />
                      Mute notifications
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg bg-card text-error hover:bg-error/10 transition-colors flex items-center gap-3">
                      <Prohibit size={18} />
                      Block user
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ChatPageInner />
    </Suspense>
  );
}
