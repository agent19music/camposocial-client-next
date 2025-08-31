"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  const handleAddFriend = async () => {
    setIsAdding(true);
    try {
      await onAddFriend?.(suggestion.id);
    } finally {
      setIsAdding(false);
    }
  };

  const cardVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -4 }
  };

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
      <Card className="glass-card hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 overflow-hidden bg-gradient-to-br from-white/80 to-violet-50/50 dark:from-gray-900/80 dark:to-violet-950/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="w-14 h-14 border-3 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage src={suggestion.avatar} alt={getDisplayName()} />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-500 text-white font-semibold text-lg">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              {/* New Member Indicator */}
              {suggestion.reason === 'New member' && (
                <motion.div 
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full p-1"
                >
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </motion.div>
              )}
            </div>
            
            {/* Suggestion Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate text-lg mb-1">
                    {getDisplayName()}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-2">@{suggestion.username}</p>
                  
                  {/* Suggestion Reason */}
                  <div className="flex items-center gap-2 mb-2">
                    {suggestion.reason && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 border-0 ${getReasonColor(suggestion.reason)}`}
                      >
                        {suggestion.reason}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Details */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
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
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                  {suggestion.bio}
                </p>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleAddFriend}
                  disabled={isAdding || isLoading}
                >
                  <motion.div
                    animate={{ rotate: isAdding ? 360 : 0 }}
                    transition={{ duration: 0.5, repeat: isAdding ? Infinity : 0, ease: "linear" }}
                  >
                    <UserPlus className="h-3 w-3 mr-2" />
                  </motion.div>
                  {isAdding ? 'Adding...' : 'Add Friend'}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-muted hover:bg-muted/50 hover:scale-105 transition-all duration-200"
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
