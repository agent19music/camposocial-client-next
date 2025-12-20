"use client";

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FriendCardSkeleton } from './LoadingSkeletons';
import { SuggestionCard } from './SuggestionCard';
import { useUserContext } from '@/context/usercontext';

// Custom debounced callback hook
const useDebouncedCallback = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);

  const cancelCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return Object.assign(debouncedCallback, { cancel: cancelCallback });
};

interface SearchableDiscoverProps {
  onAddFriend?: (userId: string | number) => void;
  onViewProfile?: (user: any) => void;
}

export const SearchableDiscover: React.FC<SearchableDiscoverProps> = ({
  onAddFriend,
  onViewProfile
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { searchUsers, users, isLoadingSearch } = useUserContext();

  const debouncedSearch = useDebouncedCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsers(query);
        setSearchResults(results);
        setHasSearched(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    500
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      setIsSearching(true);
      debouncedSearch(value);
    } else {
      debouncedSearch.cancel();
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setIsSearching(false);
    debouncedSearch.cancel();
  };

  const displayUsers = searchQuery.trim()
    ? searchResults
    : users.slice(0, 10);
  const showEmptyState = hasSearched && searchResults.length === 0 && !isSearching;

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="flex w-full justify-center items-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-8 rounded-full border-muted bg-muted/50 focus:bg-background"
          />
          {isSearching && (
            <div className="absolute right-2.5 top-2.5">
              <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </div>


      {/* Results Section */}
      <div className="space-y-4">
        {!searchQuery && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              People You Might Know
            </h3>
            <span className="text-sm text-muted-foreground">
              {users.length} suggestions
            </span>
          </div>
        )}

        {/* Loading State */}
        {(isSearching || isLoadingSearch) && (
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
            {[...Array(4)].map((_, index) => (
              <FriendCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {showEmptyState && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Try searching with a different name or username.
            </p>
          </motion.div>
        )}

        {/* Results Grid */}
        {displayUsers.length > 0 && !isSearching && !isLoadingSearch && (
          <motion.div
            className="grid gap-3 grid-cols-2 lg:grid-cols-3"
            layout
          >
            <AnimatePresence>
              {displayUsers.map((user, index) => (
                <motion.div
                  key={user.id || user.username}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <SuggestionCard
                    suggestion={{
                      ...user,
                      reason: searchQuery ? 'Search result' : 'Suggested for you'
                    }}
                    onAddFriend={onAddFriend}
                    onViewProfile={onViewProfile}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};
