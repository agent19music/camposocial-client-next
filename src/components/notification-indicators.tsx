"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NotificationDotProps, NotificationCounterProps, YapNotificationBannerProps } from '@/types';

export const NotificationDot: React.FC<NotificationDotProps> = ({
  show,
  count,
  size = 'sm',
  position = 'top-right',
  className
}) => {
  if (!show) return null;

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1'
  };

  return (
    <div className={cn(
      'absolute rounded-full bg-purple-500 dark:bg-purple-400',
      'animate-pulse shadow-lg border-2 border-background',
      sizeClasses[size],
      positionClasses[position],
      className
    )}>
      {count && count > 0 && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};

export const NotificationCounter: React.FC<NotificationCounterProps> = ({
  count,
  maxCount = 99,
  size = 'sm',
  variant = 'purple',
  className
}) => {
  if (count <= 0) return null;

  const sizeClasses = {
    sm: 'h-5 w-5 text-xs',
    md: 'h-6 w-6 text-sm',
    lg: 'h-7 w-7 text-base'
  };

  const variantClasses = {
    purple: 'bg-purple-500 dark:bg-purple-400 text-white',
    red: 'bg-red-500 dark:bg-red-400 text-white',
    blue: 'bg-blue-500 dark:bg-blue-400 text-white',
    green: 'bg-green-500 dark:bg-green-400 text-white'
  };

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div className={cn(
      'flex items-center justify-center rounded-full font-bold shadow-lg',
      'border-2 border-background animate-pulse',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {displayCount}
    </div>
  );
};

export const YapNotificationBanner: React.FC<YapNotificationBannerProps> = ({
  count,
  authors,
  onViewNew,
  className
}) => {
  if (count <= 0) return null;

  return (
    <div className={cn(
      'fixed top-20 left-1/2 transform -translate-x-1/2 z-50',
      'bg-background/95 backdrop-blur-sm border rounded-full',
      'px-4 py-2 shadow-lg max-w-sm w-auto',
      'animate-in slide-in-from-top duration-300',
      className
    )}>
      <button
        onClick={onViewNew}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity w-full"
      >
        {/* Author avatars */}
        <div className="flex -space-x-2">
          {authors.slice(0, 3).map((author, index) => (
            <div
              key={author.id}
              className="w-6 h-6 rounded-full border-2 border-background overflow-hidden"
              style={{ zIndex: 10 - index }}
            >
              {author.avatar ? (
                <Image
                  src={author.avatar}
                  alt={author.display_name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {author.display_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Text */}
        <span className="text-sm font-medium text-foreground">
          {count} new yap{count !== 1 ? 's' : ''}
        </span>

        {/* Purple dot indicator */}
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
      </button>
    </div>
  );
};
