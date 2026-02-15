'use client'

import React from 'react'
import Image from 'next/image'

// Badge types: 'uni' (university), 'free' (promotional), 'commercial' (paid)
type BadgeType = 'uni' | 'free' | 'commercial'

interface Badge {
  id: number
  name: string
  image_url: string
  is_animated: boolean
  badge_type?: BadgeType
}

interface BadgeDisplayProps {
  badges: Badge[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Helper function to check if a badge is a university badge
// Uses badge_type first, falls back to URL pattern detection
const isUniBadge = (badge: Badge): boolean => {
  if (badge.badge_type) {
    return badge.badge_type === 'uni'
  }
  // Fallback to URL pattern for backward compatibility
  return badge.image_url.includes('uni-logos-badges')
}

export default function BadgeDisplay({ badges, size = 'md', className = '' }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) {
    return null
  }

  // Regular paid badge sizes
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // University badge sizes (200% bigger = 3x the size)
  const uniSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-[60px] h-[60px]',
    lg: 'w-[72px] h-[72px]'
  }

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  }

  return (
    <div className={`flex items-center ${gapClasses[size]} ${className}`}>
      {badges.slice(0, 3).map((badge) => {
        const isUni = isUniBadge(badge)
        const badgeSizeClass = isUni ? uniSizeClasses[size] : sizeClasses[size]
        
        return (
          <div 
            key={badge.id}
            className={`relative ${badgeSizeClass} flex-shrink-0`}
            title={badge.name}
          >
            <Image
              src={badge.image_url}
              alt={badge.name}
              fill
              className="object-contain"
              unoptimized={badge.is_animated}
            />
          </div>
        )
      })}
      {badges.length > 3 && (
        <span className="text-xs text-muted-foreground">
          +{badges.length - 3}
        </span>
      )}
    </div>
  )
}
