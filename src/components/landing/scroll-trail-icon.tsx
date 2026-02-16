"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// SVG Icon Components - 56px ideal size with scale-up at curve apex
const PaperPlaneIcon = ({ className }: { className?: string }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M48.5 7.5L7 24.5L21 28L28 49L48.5 7.5Z"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M48.5 7.5L21 28"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 49V35L21 28"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M14 16.333H42L45.5 49H10.5L14 16.333Z"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M21 16.333V14C21 10.134 24.134 7 28 7C31.866 7 35 10.134 35 14V16.333"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 25.667C21 29.533 24.134 32.667 28 32.667C31.866 32.667 35 29.533 35 25.667"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TicketIcon = ({ className }: { className?: string }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M7 21V14C7 12.343 8.343 11 10 11H46C47.657 11 49 12.343 49 14V21C46.239 21 44 23.239 44 26C44 28.761 46.239 31 49 31V38C49 39.657 47.657 41 46 41H10C8.343 41 7 39.657 7 38V31C9.761 31 12 28.761 12 26C12 23.239 9.761 21 7 21Z"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M21 11V15"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="1 4"
    />
    <path
      d="M21 21V31"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="1 4"
    />
    <path
      d="M21 37V41"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="1 4"
    />
  </svg>
);

const SpeechBubbleIcon = ({ className }: { className?: string }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M7 28C7 16.402 16.402 7 28 7C39.598 7 49 16.402 49 28C49 39.598 39.598 49 28 49C24.5 49 21.2 48.1 18.3 46.5L7 49L9.5 37.7C7.9 34.8 7 31.5 7 28Z"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="18" cy="28" r="2.5" fill="#78716c" />
    <circle cx="28" cy="28" r="2.5" fill="#78716c" />
    <circle cx="38" cy="28" r="2.5" fill="#78716c" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg
    width="56"
    height="56"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="28"
      cy="18"
      r="8"
      stroke="#78716c"
      strokeWidth="2.5"
      fill="none"
    />
    <path
      d="M10 49C10 39.059 18.059 31 28 31C37.941 31 46 39.059 46 49"
      stroke="#78716c"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle
      cx="44"
      cy="14"
      r="5"
      stroke="#78716c"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M49 28C49 24.5 46.5 22 44 21"
      stroke="#78716c"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <circle
      cx="12"
      cy="14"
      r="5"
      stroke="#78716c"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M7 28C7 24.5 9.5 22 12 21"
      stroke="#78716c"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Icon type mapping
const iconComponents = {
  paperplane: PaperPlaneIcon,
  shop: ShoppingBagIcon,
  ticket: TicketIcon,
  speech: SpeechBubbleIcon,
  users: UsersIcon,
};

import type {
  IconType,
  ScrollTrailIconProps,
  CurvedTrailProps,
  SectionScrollConnectorProps,
} from "@/types";

export type { IconType };

export const ScrollTrailIcon: React.FC<ScrollTrailIconProps> = ({
  icon,
  scrollStart = 0,
  scrollEnd = 1,
  curveDirection = "right",
  curveAmplitude = 120,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Progress through this section (0 to 1)
  const progress = useTransform(
    scrollYProgress,
    [scrollStart, scrollEnd],
    [0, 1]
  );

  // Vertical position (top to bottom of container)
  const y = useTransform(progress, [0, 1], ["0%", "100%"]);

  // Horizontal S-curve using sine wave
  const amplitude = curveDirection === "left" ? -curveAmplitude : curveAmplitude;
  const x = useTransform(progress, (p) => {
    // S-curve: sin(2πp) creates a full wave, we want half for S shape
    return Math.sin(p * Math.PI * 2) * amplitude;
  });

  // Scale up at the apex of curves (when sin is at peaks)
  const scale = useTransform(progress, (p) => {
    const sineValue = Math.abs(Math.sin(p * Math.PI * 2));
    return 1 + sineValue * 0.15; // Scale from 1 to 1.15
  });

  // Slight rotation following the curve
  const rotate = useTransform(progress, (p) => {
    const cosValue = Math.cos(p * Math.PI * 2);
    return cosValue * 15 * (curveDirection === "left" ? -1 : 1);
  });

  // Opacity: fade in at start, full in middle, fade out at end
  const opacity = useTransform(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  const IconComponent = iconComponents[icon];

  // Generate the curved path for the trail
  const generateCurvePath = () => {
    const points: { x: number; y: number }[] = [];
    const steps = 50;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = 50 + Math.sin(t * Math.PI * 2) * (amplitude / 3); // Percentage X (centered at 50%)
      const py = t * 100; // Percentage Y
      points.push({ x: px, y: py });
    }

    return points;
  };

  const toSmoothPath = (points: { x: number; y: number }[]) => {
    if (!points.length) return "";

    const toSegment = (p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }) => {
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    };

    const pathParts = [`M ${points[0].x} ${points[0].y}`];

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] ?? points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] ?? points[i + 1];

      pathParts.push(toSegment(p0, p1, p2, p3));
    }

    return pathParts.join(" ");
  };

  const pathPoints = generateCurvePath();
  const smoothPath = toSmoothPath(pathPoints);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] overflow-hidden pointer-events-none hidden"
    >
      {/* Faint dotted trail path */}
      <svg
        className="absolute inset-0 w-full h-full hidden md:block"
        preserveAspectRatio="none"
      >
        <motion.path
          d={smoothPath}
          stroke="#78716c"
          strokeWidth="60"
          strokeDasharray="6 8"
          strokeLinecap="round"
          fill="none"
          opacity={0.3}
          style={{
            pathLength: progress,
          }}
        />
      </svg>

      {/* Animated icon */}
      <motion.div
        className="absolute left-1/2 top-0"
        style={{
          x,
          y,
          scale,
          rotate,
          opacity,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <IconComponent className="drop-shadow-sm" />
      </motion.div>
    </div>
  );
};

// Simplified curved path with SVG for the trail visual
export const CurvedTrail: React.FC<CurvedTrailProps> = ({
  direction = "right",
  className = "",
}) => {
  const amplitude = direction === "left" ? -30 : 30;
  
  return (
    <svg
      className={`w-full h-full ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        d={`M 50 0 
            C ${50 + amplitude} 25, ${50 - amplitude} 50, 50 50
            C ${50 + amplitude} 75, ${50 - amplitude} 100, 50 100`}
        stroke="#78716c"
        strokeWidth="0.5"
        strokeDasharray="2 3"
        strokeLinecap="round"
        fill="none"
        opacity={0.4}
      />
    </svg>
  );
};

// Full section scroll connector with fixed icon on side and animated curved line
export const SectionScrollConnector: React.FC<SectionScrollConnectorProps> = ({
  icon,
  side = "right",
  height = 200,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Progress mapped to visible range - fills as we scroll toward the icon
  const progress = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);

  // Trail path length animation
  const pathLength = useTransform(progress, [0, 1], [0, 1]);

  const IconComponent = iconComponents[icon];

  // Generate smooth curve path from center to the side where icon is
  // If side is "right", curve goes from left-center to right where icon sits
  // If side is "left", curve goes from right-center to left where icon sits
  const curvePath = side === "right"
    ? `M 10 0 Q 30 50, 75 100`  // Start left, curve to right
    : `M 90 0 Q 70 50, 25 100`; // Start right, curve to left

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-visible pointer-events-none hidden"
      style={{ height }}
    >
      {/* Curved line that fills on scroll */}
      <svg
        className="absolute inset-0 w-full h-full hidden md:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Background trail (always visible, very faint) */}
        <path
          d={curvePath}
          stroke="#78716c"
          strokeWidth="0.4"
          strokeLinecap="round"
          fill="none"
          opacity={0.15}
        />
        {/* Animated trail that fills as we scroll toward the icon */}
        <motion.path
          d={curvePath}
          stroke="#78716c"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity={0.6}
          style={{
            pathLength,
          }}
        />
      </svg>

      {/* Fixed muted icon on the side */}
      <div
        className={`absolute bottom-0 ${side === "right" ? "right-8 md:right-16 lg:right-24" : "left-8 md:left-16 lg:left-24"}`}
        style={{ transform: "translateY(50%)" }}
      >
        <div className="opacity-40">
          <IconComponent />
        </div>
      </div>
    </div>
  );
};

export default ScrollTrailIcon;
