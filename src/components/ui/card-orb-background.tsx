"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/themecontext";

// Color schemes for different card moods
const COLOR_SCHEMES = {
  lavender: ["#C4A8C8", "#B8A0C8", "#D4B8C8"],
  peach: ["#F5D4B8", "#E8C8A8", "#F8B888"],
  pink: ["#F4A8B8", "#D4B8C8", "#F5D4B8"],
  mixed: ["#C4A8C8", "#F4A8B8", "#F8B888", "#F4C878"],
  coral: ["#F8B888", "#E8C8A8", "#F4A8B8"],
  gold: ["#F4C878", "#F5E6D3", "#E8C8A8"],
};

export type OrbColorScheme = keyof typeof COLOR_SCHEMES;

interface CardOrbConfig {
  id: number;
  color: string;
  size: number;
  x: number;
  y: number;
  delay: number;
}

interface CardOrbBackgroundProps {
  colorScheme?: OrbColorScheme;
  orbCount?: number;
  className?: string;
  animated?: boolean;
}

export function CardOrbBackground({
  colorScheme = "mixed",
  orbCount = 3,
  className = "",
  animated = true,
}: CardOrbBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const colors = COLOR_SCHEMES[colorScheme];

  // Generate stable orb configurations using a seed based on props
  const orbs = useMemo<CardOrbConfig[]>(() => {
    // Deterministic positions for consistent rendering
    const positions = [
      { x: 15, y: 20 },
      { x: 75, y: 70 },
      { x: 50, y: 40 },
      { x: 85, y: 15 },
    ];

    return Array.from({ length: Math.min(orbCount, 4) }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      size: 60 + i * 20, // 60-120px
      x: positions[i].x,
      y: positions[i].y,
      delay: i * 0.5,
    }));
  }, [orbCount, colors]);

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {orbs.map((orb) =>
        animated ? (
          <motion.div
            key={orb.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isDark ? [0.12, 0.2, 0.12] : [0.2, 0.35, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 6 + orb.id * 2,
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
              filter: "blur(40px)",
              transform: "translate(-50%, -50%)",
            }}
          />
        ) : (
          <div
            key={orb.id}
            className={`absolute rounded-full ${
              isDark ? "mix-blend-soft-light opacity-15" : "mix-blend-screen opacity-25"
            }`}
            style={{
              backgroundColor: orb.color,
              width: orb.size,
              height: orb.size,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              filter: "blur(40px)",
              transform: "translate(-50%, -50%)",
            }}
          />
        )
      )}
    </div>
  );
}

export default CardOrbBackground;
