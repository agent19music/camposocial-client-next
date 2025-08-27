"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Icons } from "@/components/icons"

const floatingIcons = [
  { component: Icons.calendar, name: 'calendar' },
  { component: Icons.heart, name: 'heart' },
  { component: Icons.globe, name: 'globe' },
  { component: Icons.messageCircle, name: 'chat' },
  { component: Icons.users, name: 'users' },
  { component: Icons.sparkles, name: 'sparkles' },
  { component: Icons.shoppingBag, name: 'shopping' }
]

interface FloatingIconProps {
  x: number
  y: number
  icon: any
  delay: number
}

function FloatingIcon({ x, y, icon, delay }: FloatingIconProps) {
  const IconComponent = icon?.component
  
  // Safety check for missing component
  if (!IconComponent) {
    return null
  }
  
  return (
    <motion.div
      className="absolute pointer-events-none w-4 h-4"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{
        opacity: [0, 0.08, 0.04, 0.06],
        scale: [0.3, 0.5, 0.4, 0.45],
        rotate: [0, 5, -3, 8],
        x: [0, Math.random() * 60 - 30, Math.random() * 40 - 20, Math.random() * 30 - 15],
        y: [0, Math.random() * 60 - 30, Math.random() * 80 - 40, Math.random() * 40 - 20],
      }}
      transition={{
        duration: 12 + Math.random() * 8,
        repeat: Infinity,
        repeatType: "reverse",
        delay: delay,
        ease: "easeInOut"
      }}
    >
      <IconComponent className="text-[#D29DF6] opacity-30 filter blur-[0.5px]" />
    </motion.div>
  )
}

interface FloatingBackgroundProps {
  iconCount?: number
  opacity?: number
  className?: string
}

export function FloatingBackground({ 
  iconCount = 60, 
  opacity = 10,
  className = ""
}: FloatingBackgroundProps) {
  const [icons, setIcons] = useState<Array<{ id: number; x: number; y: number; icon: any; delay: number }>>([])
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      const newIcons = Array.from({ length: iconCount }, (_, i) => ({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        icon: floatingIcons[Math.floor(Math.random() * floatingIcons.length)],
        delay: Math.random() * 10
      }))
      setIcons(newIcons)
    }
  }, [dimensions, iconCount])

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden opacity-${opacity} ${className}`}>
      <AnimatePresence>
        {icons.map((iconObj) => (
          <FloatingIcon key={iconObj.id} {...iconObj} />
        ))}
      </AnimatePresence>
    </div>
  )
} 