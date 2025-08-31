'use client'

import React from 'react'
import Image from 'next/image'

interface Badge {
  id: number
  name: string
  image_url: string
  is_animated: boolean
}

interface BadgeDisplayProps {
  badges: Badge[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function BadgeDisplay({ badges, size = 'md', className = '' }: BadgeDisplayProps) {
  if (!badges || badges.length === 0) {
    return null
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  }

  return (
    <div className={`flex items-center ${gapClasses[size]} ${className}`}>
      {badges.slice(0, 3).map((badge) => (
        <div 
          key={badge.id}
          className={`relative ${sizeClasses[size]} flex-shrink-0`}
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
      ))}
      {badges.length > 3 && (
        <span className="text-xs text-muted-foreground">
          +{badges.length - 3}
        </span>
      )}
    </div>
  )
}
