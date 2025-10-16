"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserContext } from '@/context/usercontext';
import { Colors as Palette } from '@/constants/Colors';
import { 
  UserPlus, 
  Shield, 
  Heart,
  GraduationCap,
  MapPin
} from 'lucide-react';

interface Suggestion {
  id: number | string;
  first_name: string;
  last_name: string;
  username: string;
  display_name?: string;
  avatar?: string;
  bio?: string;
  mutualFriends?: number;
  category?: string;
  reason?: string;
  year?: string;
  location?: string;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  onAddFriend?: (suggestionId: string | number) => void;
  onViewProfile?: (suggestion: Suggestion) => void;
  isLoading?: boolean;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  suggestion, 
  onAddFriend,
  onViewProfile,
  isLoading = false
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getInitials = () => {
    return `${suggestion.first_name?.[0] || ''}${suggestion.last_name?.[0] || ''}`.toUpperCase();
  };

  const getDisplayName = () => {
    return suggestion.display_name || `${suggestion.first_name} ${suggestion.last_name}`;
  };

  const handleAddFriend = async (suggestionId: string | number) => {
    setIsAdding(true);
    try {
      await sendFriendRequest(suggestionId.toString());
    } finally {
      setIsAdding(false);
    }
  };

  const cardVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.01, y: -2 }
  };

  const { sendFriendRequest } = useUserContext();

  const reasonColors = {
    'Same course': 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    'Mutual friends': 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    'Same location': 'bg-green-500/10 text-green-700 dark:text-green-300',
    'Similar interests': 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    'New member': 'bg-pink-500/10 text-pink-700 dark:text-pink-300'
  };

  const getReasonColor = (reason: string) => {
    return reasonColors[reason as keyof typeof reasonColors] || 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
  };

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
        <div style={{ backgroundColor: 'rgba(255,255,255,0.8)' }} />
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ scale: isHovered ? 1.03 : 1 }}
                transition={{ duration: 0.15 }}
              >
                <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-800 shadow">
                  <AvatarImage src={suggestion.avatar} alt={getDisplayName()} />
                  <AvatarFallback className="text-white font-semibold text-base" style={{ backgroundColor: Palette.accent }}>
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              {/* New Member Indicator */}
              {suggestion.reason === 'New member' && (
                <motion.div 
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-1 -right-1 rounded-full p-1"
                  style={{ backgroundColor: '#fb7185' }}
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </motion.div>
              )}
            </div>
            
            {/* Suggestion Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate text-sm mb-0.5">
                    {getDisplayName()}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mb-1">@{suggestion.username}</p>
                  
                  {/* Suggestion Reason */}
                  <div className="flex items-center gap-1 mb-1">
                    {suggestion.reason && (
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] px-1.5 py-0.5 border-0 ${getReasonColor(suggestion.reason)}`}
                      >
                        {suggestion.reason}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Details */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                {suggestion.category && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>{suggestion.category}</span>
                  </div>
                )}
                {suggestion.year && (
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>{suggestion.year}</span>
                  </div>
                )}
                {suggestion.mutualFriends !== undefined && suggestion.mutualFriends > 0 && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{suggestion.mutualFriends} mutual</span>
                  </div>
                )}
              </div>
              
              {/* Bio */}
              {suggestion.bio && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2 leading-snug">
                  {suggestion.bio}
                </p>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-1">
                <Button 
                  size="sm" 
                  className="flex-1 text-white border-0 shadow hover:shadow-md transition-all duration-200 h-7 text-xs px-2"
                  onClick={() => handleAddFriend(suggestion.id)}
                  disabled={isAdding || isLoading}
                >
                  <motion.div
                    animate={{ rotate: isAdding ? 360 : 0 }}
                    transition={{ duration: 0.5, repeat: isAdding ? Infinity : 0, ease: "linear" }}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                  </motion.div>
                  {isAdding ? 'Adding...' : 'Add Friend'}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-muted hover:bg-muted/50 hover:scale-105 transition-all duration-200 h-7 text-xs px-2"
                  onClick={() => onViewProfile?.(suggestion)}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
