"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Colors as Palette } from '@/constants/Colors';

const C = Palette;
import { 
  Check, 
  X, 
  Shield,
  Clock,
  Heart,
  GraduationCap
} from 'lucide-react';

import { MinimalFriend } from '@/utils/types';

interface Request extends MinimalFriend {
  created_at?: string;
  requestTime?: string;
  bio?: string;
  category?: string;
  year?: string;
  mutualFriends?: number;
}

interface RequestCardProps {
  request: Request;
  onAccept?: (requestId: string | number) => void;
  onDecline?: (requestId: string | number) => void;
  onViewProfile?: (request: Request) => void;
  isLoading?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  onAccept,
  onDecline,
  onViewProfile,
  isLoading = false
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getInitials = () => {
    return `${request.firstName?.[0] || ''}${request.lastName?.[0] || ''}`.toUpperCase();
  };

  const getDisplayName = () => {
    return request.displayName || `${request.firstName} ${request.lastName}`;
  };

  const getTimeAgo = () => {
    const timeString = request.requestTime || request.created_at;
    if (!timeString) return 'Recently';
    
    const requestDate = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - requestDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept?.(request.id);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await onDecline?.(request.id);
    } finally {
      setIsDeclining(false);
    }
  };

  const cardVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -4 }
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
  <Card className="glass-card hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 overflow-hidden border-l-4 border-l-green-500" style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="w-14 h-14 border-3 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage src={request.avatar} alt={getDisplayName()} />
                  <AvatarFallback className="text-white font-semibold text-lg" style={{ backgroundColor: C.success }}>
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              {/* Request Indicator */}
                <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 rounded-full p-1 shadow-lg"
                style={{ backgroundColor: C.success }}
              >
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </motion.div>
            </div>
            
            {/* Request Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate text-lg mb-1">
                    {getDisplayName()}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-1">@{request.username}</p>
                  
                  {/* Request Time */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span>{getTimeAgo()}</span>
                  </div>
                </div>
                
                {/* New Request Badge */}
                <Badge className="text-white border-0 shadow-md" style={{ backgroundColor: C.success }}>
                  New Request
                </Badge>
              </div>
              
              {/* Details */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                {request.category && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>{request.category}</span>
                  </div>
                )}
                {request.year && (
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>{request.year}</span>
                  </div>
                )}
                {request.mutualFriends !== undefined && request.mutualFriends > 0 && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{request.mutualFriends} mutual friends</span>
                  </div>
                )}
              </div>
              
              {/* Bio */}
              {request.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                  {request.bio}
                </p>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleAccept}
                  disabled={isAccepting || isDeclining || isLoading}
                  style={{ backgroundColor: C.success }}
                >
                  <motion.div
                    animate={{ scale: isAccepting ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.2, repeat: isAccepting ? Infinity : 0 }}
                  >
                    <Check className="h-3 w-3 mr-2" />
                  </motion.div>
                  {isAccepting ? 'Accepting...' : 'Accept'}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 transition-all duration-200"
                  onClick={handleDecline}
                  disabled={isAccepting || isDeclining || isLoading}
                >
                  <motion.div
                    animate={{ rotate: isDeclining ? [0, -10, 10, -10, 0] : 0 }}
                    transition={{ duration: 0.3, repeat: isDeclining ? Infinity : 0 }}
                  >
                    <X className="h-3 w-3 mr-2" />
                  </motion.div>
                  {isDeclining ? 'Declining...' : 'Decline'}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="hover:bg-muted/50 hover:scale-105 transition-all duration-200"
                  onClick={() => onViewProfile?.(request)}
                >
                  <Shield className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
