"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Colors as Palette } from "@/constants/Colors";

const C = Palette;

const hexToRgba = (hex: string, alpha = 1) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
import { 
  MessageSquare, 
  Phone, 
  Video, 
  MoreHorizontal, 
  Star,
  UserMinus,
  Shield,
  Flag,
  Crown,
  Heart
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { ChatFriend } from '@/utils/types';

type Friend = ChatFriend;

interface FriendCardProps {
  friend: Friend;
  showMessage?: boolean;
  onMessage?: (friend: Friend) => void;
  onCall?: (friend: Friend) => void;
  onVideoCall?: (friend: Friend) => void;
  onRemoveFriend?: (friendId: string | number) => void;
  onBlock?: (friendId: string | number) => void;
  onReport?: (friendId: string | number) => void;
  onViewProfile?: (friend: Friend) => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ 
  friend, 
  showMessage = false,
  onMessage,
  onRemoveFriend,
  onBlock,
  onReport,
  onViewProfile
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getInitials = () => {
    return `${friend.firstName?.[0] || ''}${friend.lastName?.[0] || ''}`.toUpperCase();
  };

  const getDisplayName = () => {
    return friend.displayName || `${friend.firstName} ${friend.lastName}`;
  };

  const getOnlineStatus = () => {
    if (friend.isOnline) return 'online';
    if (friend.lastSeen) {
      const lastSeenTime = friend.lastSeen instanceof Date ? friend.lastSeen : new Date(friend.lastSeen);
      const now = new Date();
      const diffHours = (now.getTime() - lastSeenTime.getTime()) / (1000 * 60 * 60);
      if (diffHours < 1) return 'recently';
      if (diffHours < 24) return 'today';
      return 'offline';
    }
    return 'offline';
  };

  const cardVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.01, y: -2 }
  };

  const onlineStatus = getOnlineStatus();

  const statusColor = ((): string => {
    if (onlineStatus === 'online') return C.success;
    if (onlineStatus === 'recently') return C.warning;
    if (onlineStatus === 'today') return C.info;
    return C.grayLight || C.gray;
  })();

  return (
    <motion.div
      variants={cardVariants}
      initial="idle"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <Card className="transition-all duration-200 overflow-hidden bg-background border rounded-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Avatar with Status */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ scale: 1 }}
                transition={{ duration: 0 }}
                onClick={() => onViewProfile?.(friend)}
                className="cursor-pointer"
              >
                <Avatar className="w-14 h-14 border-2 border-white dark:border-gray-800 shadow">
                  <AvatarImage src={friend.avatar} alt={getDisplayName()} />
                  <AvatarFallback
                    className="text-white font-semibold text-lg"
                    style={{ backgroundColor: C.accentDark || C.accent }}
                  >
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              {/* Online Status */}
              <motion.div
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white dark:border-gray-800 shadow"
                style={{ backgroundColor: statusColor }}
                animate={{ scale: friend.isOnline ? [1, 1.1, 1] : 1 }}
                transition={{ repeat: friend.isOnline ? Infinity : 0, duration: 2 }}
              />
            </div>
            {/* Friend Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1 min-w-0">
                  <h3 
                    className="font-semibold text-foreground truncate text-sm cursor-pointer"
                    onClick={() => onViewProfile?.(friend)}
                  >
                    {getDisplayName()}
                  </h3>
                  {friend.unreadCount && friend.unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white rounded-full min-w-[1.1rem] h-4 flex items-center justify-center text-[10px] font-medium shadow"
                      style={{ backgroundColor: C.error }}
                    >
                      {friend.unreadCount > 99 ? '99+' : friend.unreadCount}
                    </motion.div>
                  )}
                </div>
                {/* Actions Menu */}
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 h-7 w-7 p-0"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {friend.isCloseFriend ? (
                      <DropdownMenuItem className="text-yellow-600">
                        <Crown className="h-4 w-4 mr-2" />
                        Close Friend
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Add to Close Friends
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onViewProfile?.(friend)}>
                      <Shield className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onRemoveFriend?.(friend.id)}>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove Friend
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBlock?.(friend.id)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Block User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onReport?.(friend.id)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p
                className="text-xs text-muted-foreground mb-0.5 cursor-pointer"
                onClick={() => onViewProfile?.(friend)}
              >
                @{friend.username}
              </p>
              {/* Status and Details */}
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
                <span className="capitalize font-medium">{onlineStatus}</span>
                {friend.category && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-[10px] px-1 py-0.5">
                      {friend.category}
                    </Badge>
                  </>
                )}
                {friend.mutualFriends !== undefined && friend.mutualFriends > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {friend.mutualFriends} mutual
                    </span>
                  </>
                )}
              </div>
              {/* Bio */}
              {friend.bio && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2 leading-snug">
                  {friend.bio}
                </p>
              )}
              {/* Message Preview */}
              <AnimatePresence>
                {showMessage && friend.messagePreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded p-2 mb-2 border"
                    style={{
                      backgroundColor: hexToRgba(C.accent, 0.04),
                      borderColor: C.border || '#E3E3E1'
                    }}
                  >
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {friend.messagePreview}
                    </p>
                    {/* <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {friend.messageTime}  
                    </p> */}
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Action Button */}
              <div className="flex items-center gap-2 mt-1">
                <Button
                  size="sm"
                  className="flex-1 text-white border-0 shadow hover:shadow-md transition-all duration-200 h-7 text-xs px-2"
                  onClick={() => onMessage?.(friend)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
