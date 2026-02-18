"use client";

import React from 'react';
import { ChatCircleIcon, DotsThreeVerticalIcon, UsersIcon } from '@phosphor-icons/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Friend, FriendCardProps } from '@/types';

export function FriendCard({ friend, onMessage, onRemoveFriend, onViewProfile }: FriendCardProps) {
    const router = useRouter();
    const displayName = friend.displayName || `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || friend.username || 'User';
    const handle = friend.username ? `@${friend.username}` : '';

    const handleViewProfile = () => {
        if (friend.username) {
            router.push(`/yaps/profile/${friend.username}`);
        } else if (onViewProfile) {
            onViewProfile(friend);
        }
    };
    return (
        <div className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.01] bg-card border border-border">
            {/* Header: Avatar + Actions */}
            <div className="flex items-start justify-between mb-3">
                <div className="relative cursor-pointer" onClick={handleViewProfile}>
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={friend.avatar} alt={displayName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {displayName[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {friend.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card bg-green-500" />
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                            <DotsThreeVerticalIcon size={18} weight="bold" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleViewProfile}>
                            View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onRemoveFriend(friend.id)}
                            className="text-destructive"
                        >
                            Remove Friend
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Name & Handle */}
            <div className="mb-2">
                <h3
                    className="font-semibold text-foreground text-sm truncate cursor-pointer hover:underline"
                    onClick={handleViewProfile}
                >
                    {displayName}
                </h3>
                {handle && (
                    <p className="text-xs text-muted-foreground truncate">
                        {handle}
                    </p>
                )}
            </div>

            {/* Bio */}
            {friend.bio && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {friend.bio}
                </p>
            )}

            {/* Mutual Friends */}
            {friend.mutualFriends !== undefined && friend.mutualFriends > 0 && (
                <div className="flex items-center gap-1.5 mb-3">
                    <UsersIcon size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                        {friend.mutualFriends} mutual
                    </span>
                </div>
            )}

            {/* Message Button - Temporarily disabled during refactor */}
            <button
                disabled
                className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg font-medium text-xs sm:text-sm bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                title="Messaging coming soon"
            >
                <ChatCircleIcon size={16} weight="fill" />
                Coming Soon
            </button>
        </div>
    );
}
