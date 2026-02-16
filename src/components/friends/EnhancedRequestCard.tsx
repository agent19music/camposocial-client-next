"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  User,
  Clock,
  Users,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';

import { FriendRequestExtended, EnhancedRequestCardProps } from '@/types';

export const EnhancedRequestCard: React.FC<EnhancedRequestCardProps> = ({
  request,
  onAccept,
  onDecline,
  onViewProfile,
  requestState
}) => {
  const router = useRouter();
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

    return diffHours < 24;
  };

  const handleViewProfile = () => {
    if (request.username) {
      router.push(`/yaps/profile/${request.username}`);
    } else if (onViewProfile) {
      onViewProfile(request);
    }
  };

  const handleAccept = async () => {
    await onAccept?.(request.id);
  };

  const handleDecline = async () => {
    await onDecline?.(request.id);
  };

  // Show success state
  if (requestState === 'accepted') {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ scale: [1, 1.02, 1], opacity: [1, 0.9, 1] }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 1.5 }}
        className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 p-4"
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-green-300">
            <AvatarImage src={request.avatar} alt={getDisplayName()} />
            <AvatarFallback className="bg-green-500 text-white font-semibold text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                You are now friends with {getDisplayName()}!
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show declined state
  if (requestState === 'declined') {
    return (
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: [1, 0.7, 0] }}
        exit={{ opacity: 0, scale: 0.95, x: -50 }}
        transition={{ duration: 1.0 }}
        className="rounded-xl border border-red-100 bg-red-50 dark:bg-red-950/20 p-4"
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 opacity-50">
            <AvatarImage src={request.avatar} alt={getDisplayName()} />
            <AvatarFallback className="bg-gray-300 text-white font-semibold text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" weight="fill" />
              <p className="text-sm font-medium text-red-700 dark:text-red-300 truncate">
                Request from {getDisplayName()} declined
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const isLoading = requestState === 'accepting' || requestState === 'declining';

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

        <div className="flex items-center gap-2">
          {/* New Badge */}
          {isNewRequest() && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">New</span>
            </div>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="p-1.5 h-auto rounded-lg hover:bg-muted text-muted-foreground"
            onClick={handleViewProfile}
            disabled={isLoading}
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
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
      {(request as any).mutualFriends !== undefined && (request as any).mutualFriends > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {(request as any).mutualFriends} mutual friends
          </span>
        </div>
      )}

      {/* Action Buttons - Accept and Decline stacked */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm bg-green-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-green-700 text-white"
          onClick={handleAccept}
          disabled={isLoading}
        >
          <motion.div
            animate={{ scale: requestState === 'accepting' ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.2, repeat: requestState === 'accepting' ? Infinity : 0 }}
          >
            <Check className="h-4 w-4" weight="bold" />
          </motion.div>
          {requestState === 'accepting' ? 'Accepting...' : 'Accept'}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm border-muted-foreground/20 text-muted-foreground hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
          onClick={handleDecline}
          disabled={isLoading}
        >
          <motion.div
            animate={{ rotate: requestState === 'declining' ? [0, -10, 10, -10, 0] : 0 }}
            transition={{ duration: 0.3, repeat: requestState === 'declining' ? Infinity : 0 }}
          >
            <X className="h-4 w-4" weight="bold" />
          </motion.div>
          {requestState === 'declining' ? 'Declining...' : 'Decline'}
        </Button>
      </div>
    </motion.div>
  );
};
