'use client';

import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChat } from '@/context/chatcontext';
import { AuthContext } from '@/context/authcontext';
import ChatWindow from '@/components/chat/ChatWindow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    MagnifyingGlass,
    DotsThreeVertical,
    ChatCircle,
    X,
    Bell,
    Prohibit
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInterfaceProps {
    onChatOpen?: (isOpen: boolean) => void;
}

export default function ChatInterface({ onChatOpen }: ChatInterfaceProps) {
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
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
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
            onChatOpen?.(true);
        }
    }, [userParam, selectedFriend, setFriendId, onChatOpen]);

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
            // router.push('/login'); // Handled by wrapper usually, but good to keep
            return;
        }
        loadConversations();
    }, [isAuthenticated, loadConversations]);

    const handleSelectFriend = (friend: any) => {
        // Navigate to dedicated chat page
        router.push(`/friends/chat/${friend.id}`);
    };

    // Sort and filter conversation list - latest messages on top
    const sortedAndFilteredList = useMemo(() => {
        // First, filter the chat list
        const filtered = chatList?.filter((user: any) => {
            const matchesSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
            if (filter === 'unread') {
                const conversation = conversations.find(c => c.friendId === user.id);
                return matchesSearch && (conversation?.unreadCount || 0) > 0;
            }
            return matchesSearch;
        }) || [];

        // Then sort by latest message time (newest first)
        return filtered.sort((a: any, b: any) => {
            const convA = conversations.find(c => c.friendId === a.id);
            const convB = conversations.find(c => c.friendId === b.id);
            
            const timeA = convA?.lastMessageTime ? new Date(convA.lastMessageTime).getTime() : 0;
            const timeB = convB?.lastMessageTime ? new Date(convB.lastMessageTime).getTime() : 0;
            
            // Sort descending (newest first)
            return timeB - timeA;
        });
    }, [chatList, conversations, searchQuery, filter]);

    // For backward compatibility
    const filteredChatList = sortedAndFilteredList;

    const selectedFriendData = useMemo(() => {
        return chatList?.find((f: any) => f.id === selectedFriend);
    }, [chatList, selectedFriend]);

    const selectedConversation = useMemo(() => {
        return conversations.find(c => c.friendId === selectedFriend);
    }, [conversations, selectedFriend]);

    return (
        <div className="flex flex-1 h-full overflow-hidden bg-background lg:rounded-xl lg:border lg:border-border">
            {/* Left Sidebar - Chat List */}
            <div
                className={`${showChats ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-80 border-r border-border bg-card`}
            >
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-semibold text-foreground">
                            Chats
                        </h1>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="Filter options">
                                    <DotsThreeVertical size={24} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setFilter('all')}>
                                    All
                                    {filter === 'all' && <span className="ml-2">✓</span>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('unread')}>
                                    Unread
                                    {filter === 'unread' && <span className="ml-2">✓</span>}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Search - Hidden on mobile */}
                    <div className="relative hidden lg:block">
                        <MagnifyingGlass
                            size={18}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg outline-none bg-muted/50 text-foreground border border-transparent focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                {/* Unread Messages Banner */}
                {conversations.some(c => (c.unreadCount || 0) > 0) && filter === 'all' && (
                    <div 
                        onClick={() => setFilter('unread')}
                        className="mx-3 my-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-sm font-medium text-primary">
                                    {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)} unread messages
                                </span>
                            </div>
                            <span className="text-xs text-primary/70">Tap to filter</span>
                        </div>
                    </div>
                )}

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoadingConversations ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : filteredChatList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <ChatCircle size={48} weight="thin" className="text-muted-foreground mb-3" />
                            <p className="text-muted-foreground text-sm">
                                {filter === 'unread' ? 'No unread messages' : 'No conversations yet'}
                            </p>
                            {filter === 'unread' && (
                                <button 
                                    onClick={() => setFilter('all')}
                                    className="mt-2 text-xs text-primary hover:underline"
                                >
                                    Show all chats
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredChatList.map((user: any) => {
                            const conversation = conversations.find(c => c.friendId === user.id);
                            const isSelected = selectedFriend === user.id;
                            const hasUnread = (conversation?.unreadCount || 0) > 0;

                            return (
                                <div
                                    key={user.id}
                                    onClick={() => handleSelectFriend(user)}
                                    className={`
                                        flex items-center gap-3 p-4 cursor-pointer transition-all border-l-4
                                        hover:bg-muted/50
                                        ${hasUnread ? 'bg-primary/5' : ''}
                                    `}
                                    style={{
                                        backgroundColor: isSelected 
                                            ? 'hsl(var(--muted))' 
                                            : hasUnread 
                                                ? 'hsl(var(--primary) / 0.05)' 
                                                : 'transparent',
                                        borderLeftColor: isSelected 
                                            ? 'hsl(var(--primary))' 
                                            : hasUnread 
                                                ? 'hsl(var(--primary) / 0.5)' 
                                                : 'transparent'
                                    }}
                                >
                                    <div className="relative">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                                        </Avatar>
                                        {conversation?.isOnline && (
                                            <div
                                                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background bg-green-500"
                                            />
                                        )}
                                        {/* Unread dot indicator on avatar */}
                                        {hasUnread && (
                                            <div
                                                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background"
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-medium truncate ${hasUnread ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                                                {user.firstName} {user.lastName}
                                            </h3>
                                            {conversation?.lastMessageTime && (
                                                <span className={`text-xs ${hasUnread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                                    {format(new Date(conversation.lastMessageTime), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            {/* FIX: Trust the context's lastMessage - decryption is handled by ChatContext
                                                The naive base64 detection was causing issues by showing encrypted placeholder
                                                even when decryption should have happened */}
                                            <p className={`text-sm truncate ${hasUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {!conversation?.lastMessage
                                                    ? 'Start a conversation'
                                                    : conversation.lastMessage
                                                }
                                            </p>
                                            {hasUnread && (
                                                <span
                                                    className="min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold flex-shrink-0 bg-primary text-primary-foreground flex items-center justify-center"
                                                >
                                                    {conversation!.unreadCount! > 99 ? '99+' : conversation!.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div
                className={`${!showChats ? 'flex' : 'hidden'} lg:flex flex-col flex-1 bg-background`}
            >
                {selectedFriend ? (
                    <ChatWindow
                        friendId={selectedFriend}
                        onBack={() => {
                            setShowChats(true);
                            onChatOpen?.(false);
                        }}
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
                    className={`${showSidebar ? 'flex' : 'hidden'} lg:flex flex-col w-80 border-l border-border bg-card transition-all duration-300`}
                    style={{ display: showSidebar ? 'flex' : 'none' }}
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
                        <p className="text-sm text-green-500">
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
                                    <button className="w-full text-left px-4 py-3 rounded-lg bg-muted/50 text-foreground hover:bg-muted transition-colors flex items-center gap-3">
                                        <MagnifyingGlass size={18} />
                                        Search in conversation
                                    </button>
                                    <button className="w-full text-left px-4 py-3 rounded-lg bg-muted/50 text-foreground hover:bg-muted transition-colors flex items-center gap-3">
                                        <Bell size={18} />
                                        Mute notifications
                                    </button>
                                    <button className="w-full text-left px-4 py-3 rounded-lg bg-muted/50 text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3">
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
    );
}
