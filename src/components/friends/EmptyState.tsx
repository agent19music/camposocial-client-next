"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, MessageSquare, Activity,  } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface EmptyState {
  type: 'friends' | 'discover' | 'requests' | 'messages' | 'activity';
  onAction?: () => void;
}

const emptyStates = {
  friends: {
    icon: Users,
    title: "No friends yet",
    description: "Start building your campus network by discovering and connecting with classmates.",
    actionText: "Discover People",
  },
  discover: {
    icon: UserPlus,
    title: "All caught up!",
    description: "We'll show new suggestions here as more students join your campus.",
    actionText: "Refresh Suggestions",
  },
  requests: {
    icon: UserPlus,
    title: "No pending requests",
    description: "Friend requests from other students will appear here when you receive them.",
    actionText: "Find Friends",
  },
  messages: {
    icon: MessageSquare,
    title: "No conversations yet",
    description: "Start chatting with your friends to see recent conversations here.",
    actionText: "Find Friends to Message",
  },
  activity: {
    icon: Activity,
    title: "No recent activity",
    description: "Friend activity like likes, comments, and interactions will appear here.",
    actionText: "View Feed",
  }
};

export const EmptyState: React.FC<EmptyState> = ({ type, onAction }) => {
  const state = emptyStates[type];
  const IconComponent = state.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >


      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-sm space-y-4"
      >
        <h3 className="text-2xl font-bold bg-gradient-to-r bg-foreground bg-clip-text text-transparent">
          {state.title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {state.description}
        </p>
        
        {onAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onAction}
              className={`bg-primary hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {state.actionText}
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Floating Elements */}
     
    </motion.div>
  );
};
