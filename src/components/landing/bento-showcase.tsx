"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

// Animation variants for the container to stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Animation variants for each grid item - subtle lift only, no shadow/glow
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 14,
    },
  },
};

// Bento Card Component - flat design, 4px lift on hover
interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  span?: "1" | "2" | "3" | "row-2" | "row-3";
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  className,
  span = "1",
}) => {
  const spanClasses = {
    "1": "",
    "2": "md:col-span-2",
    "3": "md:col-span-3",
    "row-2": "md:row-span-2",
    "row-3": "md:row-span-3",
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "rounded-2xl border border-stone-200 dark:border-stone-800",
        "bg-white dark:bg-stone-900",
        "overflow-hidden",
        "transition-colors duration-200",
        spanClasses[span],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// Placeholder Image Card with detailed alt prompts
interface PlaceholderImageProps {
  alt: string;
  aspectRatio?: "square" | "video" | "portrait" | "wide";
  bgColor?: string;
  icon?: React.ReactNode;
  label?: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  alt,
  aspectRatio = "square",
  bgColor = "bg-orange-50 dark:bg-stone-800",
  icon,
  label,
}) => {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    wide: "aspect-[2/1]",
  };

  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-center",
        aspectClasses[aspectRatio],
        bgColor
      )}
    >
      {icon && (
        <div className="text-orange-300 dark:text-stone-600">{icon}</div>
      )}
      {label && (
        <span className="absolute bottom-3 left-3 text-xs font-medium text-stone-400 dark:text-stone-500">
          {label}
        </span>
      )}
      {/* Hidden alt text for image generation prompts */}
      <span className="sr-only">{alt}</span>
    </div>
  );
};

// Product Card for Marketplace section
interface ProductCardProps {
  title: string;
  price: string;
  seller?: string;
  image?: string;
  imageAlt?: string;
  tag?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  price,
  seller,
  image,
  imageAlt,
  tag,
}) => (
  <BentoCard className="group">
    <div className="relative aspect-square bg-stone-100 dark:bg-stone-800 overflow-hidden">
      {image ? (
        <Image
          src={image}
          alt={imageAlt || title}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-600">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="8" y="8" width="32" height="32" rx="4" />
            <path d="M8 18h32" />
            <circle cx="24" cy="30" r="6" />
          </svg>
        </div>
      )}
    </div>
    <div className="p-4">
      {tag && (
        <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          {tag}
        </span>
      )}
      <h4 className="font-medium text-stone-800 dark:text-stone-100 text-sm truncate">
        {title}
      </h4>
      <p className="text-stone-800 dark:text-stone-100 font-semibold text-sm mt-1">
        {price}
      </p>
      {seller && (
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{seller}</p>
      )}
    </div>
  </BentoCard>
);

// Event Card for Events section
interface EventCardProps {
  title: string;
  date: string;
  location: string;
  image?: string;
  imageAlt?: string;
  attendees?: number;
  featured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  location,
  image,
  imageAlt,
  attendees,
  featured = false,
}) => (
  <BentoCard className={cn("group overflow-hidden", featured && "md:col-span-2 md:row-span-2")}>
    <div className={cn(
      "relative overflow-hidden bg-stone-100 dark:bg-stone-800",
      featured ? "aspect-video" : "aspect-[3/4]"
    )}>
      {image ? (
        <Image
          src={image}
          alt={imageAlt || title}
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-600">
          <svg
            width={featured ? 72 : 48}
            height={featured ? 72 : 48}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="6" y="10" width="36" height="32" rx="4" />
            <path d="M6 18h36" />
            <path d="M16 6v8M32 6v8" />
            <rect x="14" y="24" width="8" height="8" rx="1" />
            <rect x="26" y="24" width="8" height="8" rx="1" />
          </svg>
        </div>
      )}
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
          {date}
        </span>
        <span className="text-stone-300 dark:text-stone-600">•</span>
        <span className="text-xs text-stone-500 dark:text-stone-400">
          {location}
        </span>
      </div>
      <h4
        className={cn(
          "font-semibold text-stone-800 dark:text-stone-100",
          featured ? "text-lg" : "text-sm"
        )}
      >
        {title}
      </h4>
      {attendees && (
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          {attendees} attending
        </p>
      )}
    </div>
  </BentoCard>
);

// Chat Preview Card - Single message row
interface ChatPreviewProps {
  avatar?: string;
  avatarAlt?: string;
  name: string;
  message: string;
  time: string;
  unread?: number;
}

export const ChatPreview: React.FC<ChatPreviewProps> = ({
  avatar,
  avatarAlt,
  name,
  message,
  time,
  unread,
}) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 hover:-translate-y-1 transition-transform duration-200">
    <div className="relative flex-shrink-0 w-12 h-12">
      <Avatar className="w-12 h-12 rounded-full">
        <AvatarImage src={avatar || ""} alt={avatarAlt} />
        <AvatarFallback>
          {name[0]}
        </AvatarFallback>
      </Avatar>
      {unread && unread > 0 && (
        <span className="absolute -top-1 -right-2 w-5 h-5 bg-[#ff9013] text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-stone-800 dark:text-stone-100 text-sm truncate">{name}</span>
        <span className="text-xs text-stone-500 dark:text-stone-400 flex-shrink-0">{time}</span>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-400 truncate">{message}</p>
    </div>
  </div>
);

// Stat Card
interface StatCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, icon }) => (
  <BentoCard className="p-6 flex flex-col items-center justify-center text-center">
    {icon && <div className="text-orange-500 mb-2">{icon}</div>}
    <div className="text-3xl font-bold text-stone-800 dark:text-stone-100">
      {value}
    </div>
    <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
      {label}
    </div>
  </BentoCard>
);

// User Avatar Group
interface UserAvatarGroupProps {
  count?: number;
}

const avatarImages = [
 "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/chunli.png",
 "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/billie.png",
  "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/ken.png",
  "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/dreadsguy.png",
  "https://pub-0a313ba028f9423cba4b9803d081b5db.r2.dev/app%20ui/avatars/laughafro.png",
];

export const UserAvatarGroup: React.FC<UserAvatarGroupProps> = ({
  count = 5,
}) => (
  <div className="flex -space-x-3">
    {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
      <div
        key={i}
        className="w-12 h-12 rounded-full border-2 border-white dark:border-stone-900 overflow-hidden"
      >
        <Image
          src={avatarImages[i % avatarImages.length]}
          width={100}
          height={100}
          alt={`Student avatar ${i + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
    ))}
    {count > 5 && (
      <div className="w-10 h-10 rounded-full border-2 border-white dark:border-stone-900 bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-medium text-stone-600 dark:text-stone-400">
        +{count - 5}
      </div>
    )}
  </div>
);

// Main Bento Grid Container
interface BentoGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  columns = 3,
  className,
}) => {
  const columnClasses = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={cn(
        "grid grid-cols-1 gap-4",
        columnClasses[columns],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

// Section wrapper with title
interface BentoSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const BentoSection: React.FC<BentoSectionProps> = ({
  title,
  subtitle,
  children,
  className,
}) => (
  <section className={cn("py-20 px-6 sm:px-8 lg:px-10", className)}>
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4"
          style={{ fontFamily: "Helvetica", color: "var(--color-heading)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </motion.div>
      {children}
    </div>
  </section>
);

export default BentoGrid;
