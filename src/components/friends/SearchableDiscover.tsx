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

  const displayUsers = searchQuery.trim() ? searchResults : users.slice(0, 10); // Show top 10 suggestions when not searching
  const showEmptyState = hasSearched && searchResults.length === 0 && !isSearching;

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <Card className="glass-card border-muted/50 bg-gradient-to-r from-white/50 to-purple-50/30 dark:from-gray-900/50 dark:to-purple-950/30">
        <CardContent className="p-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <motion.div
                animate={{ rotate: isSearching ? 360 : 0 }}
                transition={{ duration: 1, repeat: isSearching ? Infinity : 0, ease: "linear" }}
              >
                <Search className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            </div>
            
            <Input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10 h-12 text-lg bg-background/50 border-muted focus:border-purple-300 dark:focus:border-purple-700 transition-all duration-300"
            />
            
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="p-1 h-auto hover:bg-red-100 dark:hover:bg-red-900/50"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Search Status */}
          <AnimatePresence>
            {(searchQuery || isSearching) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 text-sm text-muted-foreground"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"
                    />
                    Searching for &ldquo;{searchQuery}&rdquo;...
                  </div>
                ) : hasSearched ? (
                  <span>
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                  </span>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
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
