"use client";

import React, { useContext, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { YapContext } from '@/context/yapcontext';
import { AuthContext } from '@/context/authcontext';
import { WhoToFollowSuggestion } from '@/types';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function WhoToFollow() {
  const { whotofollowSuggestions } = useContext(YapContext);
  const { authToken } = useContext(AuthContext);
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const router = useRouter();
  
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleFollow = async (userId: string, username: string) => {
    if (!authToken) {
      toast.error('Please log in to follow users');
      return;
    }

    const currentlyFollowing = followingStates[userId];
    setLoadingStates(prev => ({ ...prev, [userId]: true }));

    try {
      const endpoint = currentlyFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`${apiEndpoint}/users/${userId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        setFollowingStates(prev => ({ ...prev, [userId]: !currentlyFollowing }));
        toast.success(currentlyFollowing ? `Unfollowed @${username}` : `Following @${username}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to follow user');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const isFollowing = (userId: string) => {
    return followingStates[userId] || false;
  };

  const isLoading = (userId: string) => {
    return loadingStates[userId] || false;
  };

  const goToProfile = (username: string) => {
    router.push(`/yaps/profile/${username}`);
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
            className="group flex items-center justify-between cursor-pointer"
            onClick={() => goToProfile(user.username)}
          >
            <Link 
              href={`/yaps/profile/${user.username}`}
              className="flex items-center space-x-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Avatar className="w-10 h-10 ring-2 ring-background">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback>{user.display_name?.[0] || user.username?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:underline">{user.display_name}</p>
                <p className="text-xs text-muted-foreground truncate group-hover:underline">@{user.username}</p>
                {user.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{user.bio}</p>
                )}
              </div>
            </Link>
            <Button
              size="sm"
              variant={isFollowing(user.id) ? "secondary" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                handleFollow(user.id, user.username);
              }}
              disabled={isLoading(user.id)}
              className="ml-2"
            >
              {isLoading(user.id) ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isFollowing(user.id) ? (
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
