'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  userName?: string;
  userAvatar?: string;
}

export default function TypingIndicator({ userName, userAvatar }: TypingIndicatorProps) {
  const dotVariants = {
    initial: { y: 0 },
    animate: {
      y: [-3, 0, -3],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-end gap-2 mb-2"
    >
      {userAvatar && (
        <div className="w-8 h-8 relative">
          <Image
            src={userAvatar}
            alt={userName || 'avatar'}
            fill
            className="rounded-full object-cover"
            sizes="32px"
          />
        </div>
      )}
      
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-2">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
              className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full"
            />
          ))}
        </div>
      </div>
      
      {userName && (
        <span className="text-xs text-gray-500 ml-1">
          {userName} is typing...
        </span>
      )}
    </motion.div>
  );
}
