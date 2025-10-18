"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Colors as Palette } from '@/constants/Colors';

const C = Palette;
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Check, 
  X, 
  Shield,
  Clock,
  Heart,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import { MinimalFriend } from '@/utils/types';

interface Request extends MinimalFriend {
  created_at?: string;
  requestTime?: string;
  mutualFriends?: number;
  bio?: string;
  category?: string;
  year?: string;
  requesterId?: string;
  mutualFriendIds?: string[];
}

interface EnhancedRequestCardProps {
  request: Request;
  onAccept?: (requestId: string | number) => void;
  onDecline?: (requestId: string | number) => void;
  onViewProfile?: (request: Request) => void;
  requestState?: 'accepting' | 'declining' | 'accepted' | 'declined';
}

export const EnhancedRequestCard: React.FC<EnhancedRequestCardProps> = ({ 
  request, 
  onAccept,
  onDecline,
  onViewProfile,
  requestState
}) => {
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

  const isNewRequest = () => {
    const timeString = request.requestTime || request.created_at;
    if (!timeString) return true;
    
    const requestDate = new Date(timeString);
    const now = new Date();
    const diffHours = (now.getTime() - requestDate.getTime()) / (1000 * 60 * 60);
    
    return diffHours < 24; // New if less than 24 hours old
  };

  const handleAccept = async () => {
    await onAccept?.(request.id);
  };

  const handleDecline = async () => {
    await onDecline?.(request.id);
  };

  // Show success state for accepted requests
  if (requestState === 'accepted') {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ scale: [1, 1.02, 1], opacity: [1, 0.9, 1] }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 1.5 }}
      >
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-green-300">
                <AvatarImage src={request.avatar} alt={getDisplayName()} />
                <AvatarFallback className="text-white font-semibold text-sm" style={{ backgroundColor: C.success }}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </motion.div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                    You are now friends with {getDisplayName()}!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Show declined state for declined requests  
  if (requestState === 'declined') {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: [1, 0.7, 0] }}
        exit={{ opacity: 0, scale: 0.95, x: -50 }}
        transition={{ duration: 1.0 }}
      >
        <Card className="border-red-100 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 opacity-50">
                <AvatarImage src={request.avatar} alt={getDisplayName()} />
                <AvatarFallback className="text-white font-semibold text-sm" style={{ backgroundColor: C.grayLight || '#e5e7eb' }}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 truncate">
                    Request from {getDisplayName()} declined
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const cardVariants = {
    idle: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -4 }
  };

  const isLoading = requestState === 'accepting' || requestState === 'declining';

  return (
    <motion.div
      variants={cardVariants}
      initial="idle"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <Card className={`hover:border-primary/30 transition-all duration-300 ${isLoading ? 'opacity-70' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-12 h-12 border-2 border-white dark:border-gray-800">
                <AvatarImage src={request.avatar} alt={getDisplayName()} />
                <AvatarFallback className="text-white font-semibold" style={{ backgroundColor: C.success }}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Request Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-foreground truncate">
                      {request.displayName || `${request.firstName} ${request.lastName}`}
                    </h3>
                    {isNewRequest() && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">New</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">@{request.username}</p>
                </div>
                
                {/* Request Time */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>{getTimeAgo()}</span>
                </div>
              </div>
              
              {/* Mutual Friends */}
              {(request as any).mutualFriends !== undefined && (request as any).mutualFriends > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Heart className="h-3 w-3" />
                  <span>{(request as any).mutualFriends} mutual friends</span>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <Button 
                  size="sm" 
                  className="flex-1 h-8 text-white border-0 hover:opacity-90 transition-opacity"
                  onClick={handleAccept}
                  disabled={isLoading}
                  style={{ backgroundColor: C.success }}
                >
                  <motion.div
                    animate={{ scale: requestState === 'accepting' ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.2, repeat: requestState === 'accepting' ? Infinity : 0 }}
                  >
                    <Check className="h-3 w-3 mr-1.5" />
                  </motion.div>
                  <span className="text-xs font-medium">{requestState === 'accepting' ? 'Accepting...' : 'Accept'}</span>
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 h-8 border-muted-foreground/20 text-muted-foreground hover:bg-muted/50 hover:border-red-300 hover:text-red-600 dark:hover:text-red-400 transition-all"
                  onClick={handleDecline}
                  disabled={isLoading}
                >
                  <motion.div
                    animate={{ rotate: requestState === 'declining' ? [0, -10, 10, -10, 0] : 0 }}
                    transition={{ duration: 0.3, repeat: requestState === 'declining' ? Infinity : 0 }}
                  >
                    <X className="h-3 w-3 mr-1.5" />
                  </motion.div>
                  <span className="text-xs font-medium">{requestState === 'declining' ? 'Declining...' : 'Decline'}</span>
                </Button>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 hover:bg-muted/50 transition-all"
                  onClick={() => onViewProfile?.(request)}
                  disabled={isLoading}
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
