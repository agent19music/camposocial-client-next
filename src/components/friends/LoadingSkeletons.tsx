"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const FriendCardSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <Card className="glass-card border-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar Skeleton */}
            <div className="relative flex-shrink-0">
              <Skeleton className="w-14 h-14 rounded-full" />
              {/* Status indicator skeleton */}
              <Skeleton className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full" />
            </div>
            
            {/* Content Skeleton */}
            <div className="flex-1 space-y-2">
              {/* Name and username */}
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              
              {/* Details */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-1 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              
              {/* Bio */}
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              
              {/* Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ActivityItemSkeleton: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="flex items-start gap-3 p-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
    </motion.div>
  );
};
