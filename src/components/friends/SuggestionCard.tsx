"use client";

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserContext } from '@/context/usercontext';
import { useWebSocket } from '@/context/websocket-context';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  User,
  Users
} from '@phosphor-icons/react';
import { FriendSuggestion, SuggestionCardProps } from '@/types';

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onAddFriend,
  onViewProfile,
  isLoading = false
}) => {
  const router = useRouter();
  const [justSent, setJustSent] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { pendingRequests } = useWebSocket();

  const {
    sendFriendRequest,
    addFriend,
    friends,
    receivedRequests,
    sentRequestIds,
    fetchPendingRequests,
  } = useUserContext();

  const suggestionId = suggestion.id?.toString();

  const getInitials = () => {
    return `${suggestion.first_name?.[0] || ''}${suggestion.last_name?.[0] || ''}`.toUpperCase();
  };

  const getDisplayName = () => {
    return suggestion.display_name || `${suggestion.first_name} ${suggestion.last_name}`;
  };

  const isExistingFriend = useMemo(() => {
    if (!suggestionId) return false;
    return friends.some(friend => friend.username === suggestion.username || friend.id === suggestionId);
  }, [friends, suggestion.username, suggestionId]);

  const incomingRequest = useMemo(() => {
    if (!suggestionId) return null;
    return receivedRequests.find((request: any) => {
      const candidateIds = [
        request.requesterId,
        request.user?.id,
        request.user_id,
      ].filter(Boolean);
      return candidateIds.some((id: any) => id?.toString() === suggestionId);
    }) || null;
  }, [receivedRequests, suggestionId]);

  const isSentOrPending = useMemo(() => {
    if (!suggestionId) return false;
    if (sentRequestIds?.has(suggestionId)) return true;
    if (!Array.isArray(pendingRequests)) return false;
    return pendingRequests.some((req: any) => {
      const user = req.user || req.requester || {};
      const candidateIds = [
        user.id,
        req.user_id,
        req.userId,
        req.requester_id,
      ].filter(Boolean);
      return candidateIds.some((id: any) => id?.toString() === suggestionId);
    });
  }, [pendingRequests, suggestionId, sentRequestIds]);

  const handleAddFriend = async (userId: string) => {
    if (!userId || isExistingFriend || isSentOrPending || justSent) return;

    setJustSent(true);

    try {
      await sendFriendRequest(userId);
      onAddFriend?.(userId);
    } catch {
      setJustSent(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!incomingRequest?.id) return;
    setIsAccepting(true);
    try {
      await addFriend(incomingRequest.id);
      await fetchPendingRequests({ force: true });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleViewProfile = () => {
    if (suggestion.username) {
      router.push(`/yaps/profile/${suggestion.username}`);
    } else if (onViewProfile) {
      onViewProfile(suggestion);
    }
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="rounded-xl p-4 transition-all duration-200 bg-card border border-border"
    >
      {/* Header: Avatar + View Profile Button */}
      <div className="flex items-start justify-between mb-3">
        <div className="relative cursor-pointer" onClick={handleViewProfile}>
          <Avatar className="w-12 h-12">
            <AvatarImage src={suggestion.avatar} alt={getDisplayName()} />
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          {/* New Member Indicator */}
          {suggestion.reason === 'New member' && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card bg-pink-500" />
          )}
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
          @{suggestion.username}
        </p>
      </div>

      {/* Bio */}
      {suggestion.bio && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {suggestion.bio}
        </p>
      )}

      {/* Reason Badge */}
      {suggestion.reason && (
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0.5 border-0 mb-3 ${getReasonColor(suggestion.reason)}`}
        >
          {suggestion.reason}
        </Badge>
      )}

      {/* Mutual Friends */}
      {suggestion.mutualFriends !== undefined && suggestion.mutualFriends > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {suggestion.mutualFriends} mutual
          </span>
        </div>
      )}

      {/* Add Friend Button - Always Blue */}
      <Button
        size="sm"
        className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg font-medium text-xs sm:text-sm bg-[#4A90E2] shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-[#4A90E2]/90 text-white"
        onClick={() => {
          if (incomingRequest) {
            handleAcceptRequest();
          } else if (suggestionId) {
            handleAddFriend(suggestionId);
          }
        }}
        disabled={
          isLoading ||
          isExistingFriend ||
          isSentOrPending ||
          justSent ||
          isAccepting
        }
      >
        <UserPlus className="h-4 w-4" weight="bold" />
        <span>
          {isExistingFriend
            ? 'Friends'
            : incomingRequest
              ? (isAccepting ? 'Accepting...' : 'Accept')
              : (justSent || isSentOrPending)
                ? 'Sent'
                : 'Add Friend'}
        </span>
      </Button>
    </motion.div>
  );
};
