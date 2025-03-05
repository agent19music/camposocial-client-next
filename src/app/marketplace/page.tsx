'use client'
import React from 'react'
import ProductCard from '@/components/productcard'
import Header from '@/components/header'
import SideNav from '@/components/sidenav'
import { Paintbrush, Cookie, Book, Shirt, Monitor, Search } from "lucide-react";
import { Input } from '@/components/ui/input'
import { Warehouse } from 'lucide-react';
import { useContext } from 'react';
import { MarketplaceContext } from '@/context/marketplacecontext';
import CartComponent from '@/components/cart'
export default function Marketplace() {
 

  const marketplaceLinks = [
    { href: "/art", label: "Art ", icon: <Paintbrush className="h-4 w-4" /> },
    { href: "/food", label: "Food ", icon: <Cookie className="h-4 w-4" /> },
    { href: "/books", label: "Books", icon: <Book className="h-4 w-4" /> },
    { href: "/clothing", label: "Clothing", icon: <Shirt className="h-4 w-4" /> },
    { href: "/tech", label: "Tech", icon: <Monitor className="h-4 w-4" /> },
    { href: "/sellerdashboard/sellersignup", label: "Become a seller", icon: <Warehouse className="h-4 w-4" /> },

  ];
const {products} = useContext(MarketplaceContext)
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
            <form>
              <div className="relative mx-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products ..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-full"
                />
              </div>
            </form>
          </div>
          
          {/* Grid of products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 place-items-center justify-center  md:grid-cols-3 gap-6 lg:h-[82vh] md:h-[82vh] lg:overflow-y-scroll ">
  {products.map((product, index) => (
    <ProductCard key={index} product={product} />
  ))}
</div>

        </div>
      </div>
      <CartComponent/>
    </div>
  );
}
