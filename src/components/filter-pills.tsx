"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

export interface FilterPill {
  id: string;
  label: string;
  active?: boolean;
  badge?: number; // For notification counts
  isSearch?: boolean; // Special search pill
}

interface FilterPillsProps {
  filters: FilterPill[];
  onFilterSelect: (filterId: string) => void;
  className?: string;
  // Optional controlled search props
  searchActive?: boolean;
  onSearchToggle?: (active: boolean) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function FilterPills({
  filters,
  onFilterSelect,
  className,
  searchActive,
  onSearchToggle,
  searchQuery,
  onSearchChange,
}: FilterPillsProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [internalSearchActive, setInternalSearchActive] = useState(false);
  const [internalQuery, setInternalQuery] = useState("");

  const isSearchActive = searchActive ?? internalSearchActive;
  const query = searchQuery ?? internalQuery;

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

  const handleToggleSearch = () => {
    const next = !isSearchActive;
    if (searchActive === undefined) setInternalSearchActive(next);
    onSearchToggle?.(next);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (searchQuery === undefined) setInternalQuery(val);
    onSearchChange?.(val);
  };

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
          {filters.map((filter) => {
            const isSearchPill = filter.isSearch || filter.id === 'search';
            if (isSearchPill) {
              return (
                <Button
                  key={filter.id}
                  variant={isSearchActive ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleSearch}
                  className={cn(
                    "relative rounded-full px-4 py-2 whitespace-nowrap text-sm transition-all",
                    isSearchActive
                      ? "text-white border-0 shadow-sm bg-fun/80"
                      : "bg-background border-muted hover:bg-fun/80 dark:hover:bg-fun/80 text-black dark:text-white"
                  )}
                >
                  <SearchIcon className="h-4 w-4 mr-2" />
                  <span>{filter.label}</span>
                  {filter.badge && filter.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                      {filter.badge > 99 ? '99+' : filter.badge}
                    </span>
                  )}
                </Button>
              );
            }
            return (
              <Button
                key={filter.id}
                variant={filter.active ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterSelect(filter.id)}
                className={cn(
                  "relative rounded-full px-4 py-2 whitespace-nowrap text-sm transition-all",
                  filter.active
                    ? "text-white border-0 shadow-sm bg-fun/80"
                    : "bg-background border-muted hover:bg-fun/80 dark:hover:bg-fun/80 text-black dark:text-white"
                )}
              >
                {filter.label}
                {filter.badge && filter.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {filter.badge > 99 ? '99+' : filter.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        {isSearchActive && (
          <div className="mt-3">
            <div className="relative max-w-2xl mx-auto">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search yaps..."
                className="w-full appearance-none bg-background pl-8 shadow-none"
                value={query}
                onChange={handleQueryChange}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
