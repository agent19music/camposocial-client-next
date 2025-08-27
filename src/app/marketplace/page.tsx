'use client'
import React, { useState, useCallback } from 'react'
import ProductCard from '@/components/productcard'
import Header from '@/components/header'
import SideNav from '@/components/sidenav'
import { Paintbrush, Cookie, Book, Shirt, Monitor, Search } from "lucide-react";
import { Input } from '@/components/ui/input'
import { Warehouse } from 'lucide-react';
import { useContext } from 'react';
import { MarketplaceContext } from '@/context/marketplacecontext';
import { AuthContext } from '@/context/authcontext'
import CartComponent from '@/components/cart'
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce'
export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const router = useRouter();
  const { currentUser } = useContext(AuthContext);
  const { products } = useContext(MarketplaceContext)
  
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

  const marketplaceLinks = [
    { label: "Art", icon: <Paintbrush className="h-4 w-4" />, onClick: () => router.push("/art") },
    { label: "Food", icon: <Cookie className="h-4 w-4" />, onClick: () => router.push("/food") },
    { label: "Books", icon: <Book className="h-4 w-4" />, onClick: () => router.push("/books") },
    { label: "Clothing", icon: <Shirt className="h-4 w-4" />, onClick: () => router.push("/clothing") },
    { label: "Tech", icon: <Monitor className="h-4 w-4" />, onClick: () => router.push("/tech") },
    currentUser?.is_seller
      ? { label: "My Dashboard", icon: <Warehouse className="h-4 w-4" />, onClick: () => router.push("/sellerdashboard") }
      : { label: "Become a seller", icon: <Warehouse className="h-4 w-4" />, onClick: () => router.push("/sellerdashboard/sellersignup") },
  ];

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
  const displayProducts = searchQuery.trim() ? searchResults : products
  // Array to simulate 21 products
  // console.log(products);
  

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <div className="flex flex-col md:flex-row">
        {/* Left SideNav */}
      
        <div className="md:w-64 flex-shrink-0">
          <SideNav links = {marketplaceLinks} />
        </div>
 
        
        {/* Right Content */}
        <div className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-2">
          
          {/* Search bar */}
          <div className="w-full flex justify-center items-center">
            <div className="relative mx-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products ..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-full"
              />
              {isSearching && (
                <div className="absolute right-2.5 top-2.5">
                  <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
          
          {/* Grid of products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 place-items-center justify-center  md:grid-cols-3 gap-6 lg:h-[82vh] md:h-[82vh] lg:overflow-y-scroll ">
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
      <CartComponent/>
    </div>
  );
}
