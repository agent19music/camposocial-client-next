'use client'
import React, { useState, useCallback } from 'react'
import ProductCard from '@/components/productcard'
import Header from '@/components/header'
import FilterPills, { FilterPill } from '@/components/filter-pills'
import { Search } from "lucide-react";
import { Input } from '@/components/ui/input'
import { useContext } from 'react';
import { MarketplaceContext } from '@/context/marketplacecontext';
import { AuthContext } from '@/context/authcontext'
import { useDebounce } from '@/hooks/useDebounce'
export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")

  const { currentUser, authToken } = useContext(AuthContext);
  const { products } = useContext(MarketplaceContext)

  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (query.trim() === "") {
      setSearchResults([])
      setIsSearching(false)
      return;
    }

    setIsSearching(true)
    try {
      const response = await fetch(`${apiEndpoint}/marketplace/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.products || [])
      } else {
        console.error('Search failed:', response.statusText)
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [apiEndpoint]);

  // Use the debounce hook
  const { debouncedCallback: debouncedSearch } = useDebounce(performSearch, 300);

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    debouncedSearch(query)
  }

  // Determine which products to display
  const getFilteredProducts = () => {
    let filtered = searchQuery.trim() ? searchResults : products;

    if (activeFilter !== "all" && filtered) {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    return filtered;
  };

  const displayProducts = getFilteredProducts();

  // Filter pills for marketplace categories
  const filterPills: FilterPill[] = [
    { id: 'all', label: 'All', active: activeFilter === 'all' },
    { id: 'art', label: 'Art', active: activeFilter === 'art' },
    { id: 'food', label: 'Food', active: activeFilter === 'food' },
    { id: 'books', label: 'Books', active: activeFilter === 'books' },
    { id: 'clothing', label: 'Clothing', active: activeFilter === 'clothing' },
    { id: 'tech', label: 'Tech', active: activeFilter === 'tech' },
    { id: 'search', label: 'Search', isSearch: true },
  ];

  const handleFilterSelect = (filterId: string) => {
    setActiveFilter(filterId);
  };

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <main className="mobile-content-padding lg:pb-4">
        {/* Filter Pills - Mobile */}
        <FilterPills
          filters={filterPills}
          onFilterSelect={handleFilterSelect}
          onSearchChange={(q) => handleSearch(q)}
          searchQuery={searchQuery}
          className="lg:hidden"
        />

        <div className="flex flex-col">
          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-2">
            {/* Desktop Filter Pills */}
            <div className="hidden lg:block">
              <FilterPills
                filters={filterPills}
                onFilterSelect={handleFilterSelect}
                onSearchChange={(q) => handleSearch(q)}
                searchQuery={searchQuery}
              />
            </div>

            {/* Grid of products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 place-items-center justify-center md:grid-cols-3 gap-6 lg:h-[82vh] md:h-[82vh] lg:overflow-y-scroll">
              {displayProducts && displayProducts.length > 0 ? (
                displayProducts.map((product, index) => (
                  <ProductCard key={`${product.id}-${index}`} product={product} />
                ))
              ) : searchQuery.trim() ? (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No products found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No products available
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
