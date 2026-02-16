/**
 * UI Component Types
 * Non-props types used by UI components
 * @module ui.types
 */

import type { ReactNode, ElementType } from 'react'

// ============================================================================
// Orb Color Schemes
// ============================================================================

export const ORB_COLOR_SCHEMES = {
  lavender: ['#B5A8D1', '#9B8FC7', '#8177BD'],
  peach: ['#FFB5A7', '#FFA07A', '#FF8C69'],
  pink: ['#FFB6C1', '#FFA6B5', '#FF96A9'],
  mixed: ['#B5A8D1', '#FFB5A7', '#FFB6C1'],
  coral: ['#FF7F7F', '#FF6B6B', '#FF5757'],
  gold: ['#FFD700', '#FFC700', '#FFB700'],
} as const

export type OrbColorScheme = keyof typeof ORB_COLOR_SCHEMES

// ============================================================================
// Floating/Falling Icon Types
// ============================================================================

/**
 * Icon with component reference
 */
export type IconWithComponent = {
  component: ElementType
  name: string
}

/**
 * Floating icon for background animations
 */
export type FloatingIcon = {
  x: number
  y: number
  icon: IconWithComponent
  delay: number
}

/**
 * Floating icon props
 */
export type FloatingIconProps = {
  x: number
  y: number
  icon: IconWithComponent
  delay: number
}

/**
 * Floating background props
 */
export type FloatingBackgroundProps = {
  iconCount?: number
  opacity?: number
  className?: string
}

/**
 * Falling icon for animations
 */
export type FallingIcon = {
  id: number
  src: string
  alt: string
  left: number
  duration: number
  delay: number
  size: number
  rotation: number
}

// ============================================================================
// Card Orb Types
// ============================================================================

/**
 * Card orb configuration
 */
export type CardOrbConfig = {
  id: number
  color: string
  size: number
  x: number
  y: number
  delay: number
}

/**
 * Card orb background props
 */
export type CardOrbBackgroundProps = {
  colorScheme?: OrbColorScheme
  orbCount?: number
  className?: string
  animated?: boolean
}

// ============================================================================
// Hero/Glow Types
// ============================================================================

/**
 * Hero aura glow props
 */
export type HeroAuraGlowProps = {
  className?: string
}

// ============================================================================
// OTP Input Types
// ============================================================================

/**
 * OTP input props
 */
export type OTPInputProps = {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

// ============================================================================
// Bento Grid Types (Landing Page)
// ============================================================================

/**
 * Bento card props
 */
export type BentoCardProps = {
  children: ReactNode
  className?: string
  span?: '1' | '2' | '3' | 'row-2' | 'row-3'
  withOrbs?: boolean
  orbColorScheme?: OrbColorScheme
}

/**
 * Placeholder image props
 */
export type PlaceholderImageProps = {
  alt: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide'
  bgColor?: string
  icon?: ReactNode
  label?: string
}

/**
 * Product card props for bento
 */
export type ProductCardProps = {
  title: string
  price: string
  seller?: string
  image?: string
  imageAlt?: string
  tag?: string
}

/**
 * Event card props for bento
 */
export type EventCardProps = {
  title: string
  date: string
  location: string
  image?: string
  imageAlt?: string
  attendees?: number
  featured?: boolean
}

/**
 * Chat preview props for bento
 */
export type ChatPreviewProps = {
  avatar?: string
  avatarAlt?: string
  name: string
  message: string
  time: string
  unread?: number
}

/**
 * Stat card props
 */
export type StatCardProps = {
  value: string
  label: string
  icon?: ReactNode
}

/**
 * User avatar group props
 */
export type UserAvatarGroupProps = {
  count?: number
}

/**
 * Bento grid props
 */
export type BentoGridProps = {
  children: ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

/**
 * Bento section props
 */
export type BentoSectionProps = {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

// ============================================================================
// Scroll Trail Types (Landing Page)
// ============================================================================

/**
 * Icon type for scroll trail
 */
export type IconType = 
  | 'paperplane'
  | 'shop'
  | 'ticket'
  | 'speech'
  | 'users'

/**
 * Scroll trail icon props
 */
export type ScrollTrailIconProps = {
  icon: IconType
  /** Start scroll position (0-1 relative to container) */
  scrollStart?: number
  /** End scroll position (0-1 relative to container) */
  scrollEnd?: number
  /** Direction of curve: left means icon curves left then right, right means right then left */
  curveDirection?: 'left' | 'right'
  /** Amplitude of the S-curve in pixels */
  curveAmplitude?: number
}

/**
 * Curved trail props
 */
export type CurvedTrailProps = {
  direction?: 'left' | 'right'
  className?: string
}

/**
 * Section scroll connector props
 */
export type SectionScrollConnectorProps = {
  icon: IconType
  /** Position of the icon: 'right' means icon is on right side, 'left' means left side */
  side?: 'left' | 'right'
  height?: number
}
