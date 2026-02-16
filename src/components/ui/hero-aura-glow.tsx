"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/themecontext";
import type { HeroAuraGlowProps } from "@/types";

export function HeroAuraGlow({ className = "" }: HeroAuraGlowProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`absolute inset-0 z-[1] pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Primary hemisphere aura - lavender/peach blend from bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
        style={{
          background: isDark
            ? `radial-gradient(
                ellipse 140% 70% at 50% 100%,
                rgba(184, 160, 200, 0.25) 0%,
                rgba(196, 168, 200, 0.15) 25%,
                rgba(248, 184, 136, 0.1) 45%,
                transparent 70%
              )`
            : `radial-gradient(
                ellipse 140% 70% at 50% 100%,
                rgba(196, 168, 200, 0.45) 0%,
                rgba(184, 160, 200, 0.3) 25%,
                rgba(248, 184, 136, 0.2) 45%,
                transparent 70%
              )`,
        }}
      />

      {/* Secondary warm cream/pink overlay for depth */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
        className="absolute inset-0"
        style={{
          background: isDark
            ? `radial-gradient(
                ellipse 100% 50% at 50% 100%,
                rgba(244, 168, 184, 0.12) 0%,
                rgba(245, 230, 211, 0.08) 30%,
                transparent 60%
              )`
            : `radial-gradient(
                ellipse 100% 50% at 50% 100%,
                rgba(244, 168, 184, 0.25) 0%,
                rgba(245, 230, 211, 0.15) 30%,
                transparent 60%
              )`,
        }}
      />

      {/* Subtle animated pulse for the glow */}
      <motion.div
        animate={{
          opacity: isDark ? [0.1, 0.18, 0.1] : [0.2, 0.35, 0.2],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse 80% 40% at 50% 100%,
            rgba(244, 200, 120, 0.2) 0%,
            rgba(248, 184, 136, 0.1) 40%,
            transparent 70%
          )`,
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

export default HeroAuraGlow;
