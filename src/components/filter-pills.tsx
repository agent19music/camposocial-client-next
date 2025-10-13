"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterPill {
  id: string;
  label: string;
  active?: boolean;
  badge?: number; // For notification counts
}

interface FilterPillsProps {
  filters: FilterPill[];
  onFilterSelect: (filterId: string) => void;
  className?: string;
}

export default function FilterPills({ filters, onFilterSelect, className }: FilterPillsProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show pills if scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide pills if scrolling down and past threshold
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  if (filters.length === 0) return null;

  return (
    <div 
      className={cn(
        "sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b transition-all duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full",
        className
      )}
    >
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={filter.active ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterSelect(filter.id)}
              className={cn(
                "relative rounded-full px-4 py-2 whitespace-nowrap text-sm transition-all",
                  filter.active 
                    ? "text-white border-0 shadow-sm" 
                  : "bg-background border-muted hover:bg-muted/50 hover:border-purple-300 dark:hover:border-purple-700"
              )}
            >
              {filter.label}
              {/* Badge for notification count */}
              {filter.badge && filter.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  {filter.badge > 99 ? '99+' : filter.badge}
                </span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
