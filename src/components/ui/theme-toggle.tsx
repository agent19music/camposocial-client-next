"use client";

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/themecontext';
import { Button } from './button';
import { motion } from 'framer-motion';

type ThemeToggleProps = {
  /** Optional class override for specific pages (e.g. landing page) */
  className?: string;
  /** Optional class override for both icons (e.g. change size) */
  iconClassName?: string;
};

export function ThemeToggle({ className = "", iconClassName = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`relative w-9 h-9 rounded-lg hover:bg-[#ff9013]/10 dark:hover:bg-[#ff9013]/20 transition-colors ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === 'dark' ? 180 : 0,
          scale: theme === 'dark' ? 0 : 1 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className={`h-5 w-5 text-amber-500 ${iconClassName}`} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === 'dark' ? 0 : -180,
          scale: theme === 'dark' ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className={`h-5 w-5 text-[#ff9013] ${iconClassName}`} />
      </motion.div>
    </Button>
  );
}

