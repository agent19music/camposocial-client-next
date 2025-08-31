"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, MessageSquare, Activity, Sparkles } from 'lucide-react';
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
    gradient: "from-purple-500 to-violet-500"
  },
  discover: {
    icon: UserPlus,
    title: "All caught up!",
    description: "We'll show new suggestions here as more students join your campus.",
    actionText: "Refresh Suggestions",
    gradient: "from-violet-500 to-purple-500"
  },
  requests: {
    icon: UserPlus,
    title: "No pending requests",
    description: "Friend requests from other students will appear here when you receive them.",
    actionText: "Find Friends",
    gradient: "from-green-500 to-emerald-500"
  },
  messages: {
    icon: MessageSquare,
    title: "No conversations yet",
    description: "Start chatting with your friends to see recent conversations here.",
    actionText: "Find Friends to Message",
    gradient: "from-blue-500 to-cyan-500"
  },
  activity: {
    icon: Activity,
    title: "No recent activity",
    description: "Friend activity like likes, comments, and interactions will appear here.",
    actionText: "View Feed",
    gradient: "from-orange-500 to-pink-500"
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
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          delay: 0.1 
        }}
        className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${state.gradient} p-4 mb-6 shadow-xl`}
      >
        <IconComponent className="w-full h-full text-white" />
      </motion.div>

      {/* Sparkles Animation */}
      <motion.div className="relative mb-4">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-8 -right-8"
        >
          <Sparkles className="h-6 w-6 text-purple-400 opacity-60" />
        </motion.div>
        
        <motion.div
          animate={{ 
            rotate: [0, -15, 15, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-4 -left-8"
        >
          <Sparkles className="h-4 w-4 text-violet-400 opacity-40" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-sm space-y-4"
      >
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
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
              className={`bg-gradient-to-r ${state.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {state.actionText}
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
