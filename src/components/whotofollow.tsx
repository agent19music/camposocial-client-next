"use client";

import React, { useContext, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { YapContext } from '@/context/yapcontext';
import { UserContext } from '@/context/usercontext';
import { WhoToFollowSuggestion } from '@/utils/types';
import { UserPlus, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function WhoToFollow() {
  const { whotofollowSuggestions } = useContext(YapContext);
  const { sendFriendRequest, friends } = useContext(UserContext);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  const handleFollow = async (userId: string) => {
    setFollowingStates(prev => ({ ...prev, [userId]: true }));
    try {
      await sendFriendRequest(userId);
    } catch (error) {
      console.error('Error sending friend request:', error);
      setFollowingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const isFollowing = (userId: string) => {
    return followingStates[userId] || friends.some(friend => friend.id === userId);
  };

  if (!whotofollowSuggestions || whotofollowSuggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-lg">Who to follow</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {whotofollowSuggestions.slice(0, 5).map((user: WhoToFollowSuggestion, index: number) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center justify-between"
          >
            <Link 
              href={`/userprofile?username=${user.username}`}
              className="flex items-center space-x-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
              <Avatar className="w-10 h-10 ring-2 ring-background">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{user.display_name?.[0] || user.username?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                {user.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{user.bio}</p>
                )}
              </div>
            </Link>
            <Button
              size="sm"
              variant={isFollowing(user.id) ? "secondary" : "default"}
              onClick={() => handleFollow(user.id)}
              disabled={isFollowing(user.id)}
              className="ml-2"
            >
              {isFollowing(user.id) ? (
                <>
                  <UserCheck className="h-3 w-3 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-3 w-3 mr-1" />
                  Follow
                </>
              )}
            </Button>
          </motion.div>
        ))}
        
        {whotofollowSuggestions.length > 5 && (
          <Link href="/friends">
            <Button variant="ghost" className="w-full text-sm">
              Show more
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
