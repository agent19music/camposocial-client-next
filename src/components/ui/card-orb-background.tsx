"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/themecontext";
import type { OrbColorScheme, CardOrbConfig, CardOrbBackgroundProps } from "@/types";
import { ORB_COLOR_SCHEMES } from "@/types";

export type { OrbColorScheme };

export function CardOrbBackground({
  colorScheme = "mixed",
  orbCount = 3,
  className = "",
  animated = true,
}: CardOrbBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const colors = ORB_COLOR_SCHEMES[colorScheme];

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
