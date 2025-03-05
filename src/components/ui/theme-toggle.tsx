"use client";

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/themecontext';
import { Switch } from './switch';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      <Sun 
        className={cn(
          "h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 transition-all", 
          theme === 'light' ? 'opacity-100' : 'opacity-30'
        )} 
      />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        className="theme-toggle-switch scale-90 sm:scale-100"
      />
      <Moon 
        className={cn(
          "h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 transition-all", 
          theme === 'dark' ? 'opacity-100' : 'opacity-30'
        )} 
      />
    </div>
  );
}

