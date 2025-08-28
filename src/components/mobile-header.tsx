"use client";

import { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterPill {
  id: string;
  label: string;
  active?: boolean;
}

interface MobileHeaderProps {
  searchPlaceholder?: string;
  filters?: FilterPill[];
  onSearch?: (query: string) => void;
  onFilterSelect?: (filterId: string) => void;
  showSearch?: boolean;
  showFilters?: boolean;
  searchQuery?: string;
}

export default function MobileHeader({
  searchPlaceholder = "Search...",
  filters = [],
  onSearch,
  onFilterSelect,
  showSearch = true,
  showFilters = true,
  searchQuery: externalSearchQuery = "",
}: MobileHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);

  // Update internal search query when external prop changes
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header if scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide header if scrolling down and past threshold
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div 
      className={cn(
        "lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b transition-transform duration-300",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 rounded-full border-muted bg-muted/50 focus:bg-background"
            />
          </div>
        </div>
      )}

      {/* Filter Pills */}
      {showFilters && filters.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={filter.active ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterSelect?.(filter.id)}
                className={cn(
                  "rounded-full px-4 py-2 whitespace-nowrap text-sm transition-all",
                  filter.active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-background border-muted hover:bg-muted/50"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
