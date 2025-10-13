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

interface Friend {
  id: number | string;
  first_name: string;
  last_name: string;
  username: string;
  display_name?: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: string;
  mutualFriends?: number;
  category?: string;
  isClose?: boolean;
  messagePreview?: string;
  messageTime?: string;
  unreadCount?: number;
}

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
  onCall,
  onVideoCall,
  onRemoveFriend,
  onBlock,
  onReport,
  onViewProfile
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getInitials = () => {
    return `${friend.first_name?.[0] || ''}${friend.last_name?.[0] || ''}`.toUpperCase();
  };

  const getDisplayName = () => {
    return friend.display_name || `${friend.first_name} ${friend.last_name}`;
  };

  const getOnlineStatus = () => {
    if (friend.isOnline) return 'online';
    if (friend.lastSeen) {
      const lastSeenTime = new Date(friend.lastSeen);
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
    hover: { scale: 1.02, y: -4 }
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
      <Card
        className="glass-card hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 overflow-hidden"
        style={{ backgroundColor: C.card }}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar with Status and Badges */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
                onClick={() => onViewProfile?.(friend)}
                className="cursor-pointer"
              >
                <Avatar className="w-14 h-14 border-3 border-white dark:border-gray-800 shadow-lg">
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
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
                style={{ backgroundColor: statusColor }}
                animate={{ scale: friend.isOnline ? [1, 1.2, 1] : 1 }}
                transition={{ repeat: friend.isOnline ? Infinity : 0, duration: 2 }}
              />
              
              {/* Special Badges */}
              <AnimatePresence>
                {friend.isClose && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <div
                      className="rounded-full p-1"
                      style={{ backgroundColor: C.warning }}
                    >
                      <Star className="h-3 w-3 text-white fill-current" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Friend Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 
                      className="font-semibold text-foreground truncate text-lg cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      onClick={() => onViewProfile?.(friend)}
                    >
                      {getDisplayName()}
                    </h3>
                    {friend.unreadCount && friend.unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-white rounded-full min-w-[1.25rem] h-5 flex items-center justify-center text-xs font-medium shadow-lg"
                        style={{ backgroundColor: C.error }}
                      >
                        {friend.unreadCount > 99 ? '99+' : friend.unreadCount}
                      </motion.div>
                    )}
                  </div>
                  
                  <p 
                    className="text-sm text-muted-foreground mb-1 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    onClick={() => onViewProfile?.(friend)}
                  >
                    @{friend.username}
                  </p>
                  
                  {/* Status and Details */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="capitalize font-medium">{onlineStatus}</span>
                    {friend.category && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
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
                </div>
                
                {/* Actions Menu */}
                <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {friend.isClose ? (
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
              
              {/* Bio */}
              {friend.bio && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
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
                    className="rounded-lg p-3 mb-3 border"
                    style={{
                      backgroundColor: hexToRgba(C.accent, 0.06),
                      borderColor: C.border || '#E3E3E1'
                    }}
                  >
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {friend.messagePreview}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {friend.messageTime}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => onMessage?.(friend)}
                  style={{ backgroundColor: C.accent }}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Message
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-muted hover:bg-muted/50 hover:scale-105 transition-all duration-200"
                  onClick={() => onCall?.(friend)}
                >
                  <Phone className="h-3 w-3" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-muted hover:bg-muted/50 hover:scale-105 transition-all duration-200"
                  onClick={() => onVideoCall?.(friend)}
                >
                  <Video className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
