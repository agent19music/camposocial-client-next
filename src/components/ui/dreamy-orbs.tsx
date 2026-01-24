"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/themecontext";

// Pastel color palette from the hero illustration
const PASTEL_COLORS = [
  "#C4A8C8", // soft lavender
  "#B8A0C8", // medium lavender
  "#F5D4B8", // peachy cream
  "#E8C8A8", // warm peach
  "#F4A8B8", // soft pink
  "#F8B888", // coral orange
  "#F4C878", // golden yellow
  "#F5E6D3", // warm cream
  "#D4B8C8", // dusty mauve
];

interface OrbConfig {
  id: number;
  color: string;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  xOffset: number;
  yOffset: number;
}

interface DreamyOrbsProps {
  orbCount?: number;
  className?: string;
}

export function DreamyOrbs({ orbCount = 10, className = "" }: DreamyOrbsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Generate stable orb configurations
  const orbs = useMemo<OrbConfig[]>(() => {
    return Array.from({ length: orbCount }, (_, i) => ({
      id: i,
      color: PASTEL_COLORS[i % PASTEL_COLORS.length],
      size: 150 + Math.random() * 250, // 150-400px
      x: Math.random() * 100, // percentage
      y: Math.random() * 100, // percentage
      duration: 15 + Math.random() * 15, // 15-30s
      delay: Math.random() * 5,
      xOffset: 30 + Math.random() * 70, // 30-100px movement
      yOffset: 30 + Math.random() * 70,
    }));
  }, [orbCount]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 1.15, 1],
            x: [0, orb.xOffset, -orb.xOffset / 2, 0],
            y: [0, -orb.yOffset, orb.yOffset / 2, 0],
            opacity: isDark ? [0.15, 0.25, 0.15] : [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            repeatType: "reverse",
            delay: orb.delay,
            ease: "easeInOut",
          }}
          className={`absolute rounded-full will-change-transform ${
            isDark ? "mix-blend-soft-light" : "mix-blend-screen"
          }`}
          style={{
            backgroundColor: orb.color,
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            filter: "blur(80px)",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}

export default DreamyOrbs;
