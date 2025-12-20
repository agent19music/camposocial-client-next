"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  User,
  Clock,
  Users
} from '@phosphor-icons/react';

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
  const router = useRouter();
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

  const handleViewProfile = () => {
    if (request.username) {
      router.push(`/yaps/profile/${request.username}`);
    } else if (onViewProfile) {
      onViewProfile(request);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`rounded-xl p-4 transition-all duration-200 bg-card border border-border ${isLoading ? 'opacity-70' : ''}`}
    >
      {/* Header: Avatar + View Profile Button */}
      <div className="flex items-start justify-between mb-3">
        <div className="relative cursor-pointer" onClick={handleViewProfile}>
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.avatar} alt={getDisplayName()} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="p-1.5 h-auto rounded-lg hover:bg-muted text-muted-foreground"
          onClick={handleViewProfile}
        >
          <User className="h-4 w-4" />
        </Button>
      </div>

      {/* Name & Handle */}
      <div className="mb-2">
        <h3
          className="font-semibold text-foreground text-sm truncate cursor-pointer hover:underline"
          onClick={handleViewProfile}
        >
          {getDisplayName()}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          @{request.username}
        </p>
      </div>

      {/* Bio */}
      {request.bio && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {request.bio}
        </p>
      )}

      {/* Request Time */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
        <Clock className="h-3 w-3" />
        <span>{getTimeAgo()}</span>
      </div>

      {/* Mutual Friends */}
      {request.mutualFriends !== undefined && request.mutualFriends > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {request.mutualFriends} mutual friends
          </span>
        </div>
      )}

      {/* Action Buttons - Accept and Decline */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm bg-green-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-green-700 text-white"
          onClick={handleAccept}
          disabled={isAccepting || isDeclining || isLoading}
        >
          <motion.div
            animate={{ scale: isAccepting ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.2, repeat: isAccepting ? Infinity : 0 }}
          >
            <Check className="h-4 w-4" weight="bold" />
          </motion.div>
          {isAccepting ? 'Accepting...' : 'Accept'}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm border-muted-foreground/20 text-muted-foreground hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
          onClick={handleDecline}
          disabled={isAccepting || isDeclining || isLoading}
        >
          <motion.div
            animate={{ rotate: isDeclining ? [0, -10, 10, -10, 0] : 0 }}
            transition={{ duration: 0.3, repeat: isDeclining ? Infinity : 0 }}
          >
            <X className="h-4 w-4" weight="bold" />
          </motion.div>
          {isDeclining ? 'Declining...' : 'Decline'}
        </Button>
      </div>
    </motion.div>
  );
};
