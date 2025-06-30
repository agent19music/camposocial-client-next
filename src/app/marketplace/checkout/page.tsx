'use client'
import React from 'react'
import CheckoutComponent from '@/components/checkout'
import Header from '@/components/header'
import SideNav from '@/components/sidenav'
import { Paintbrush, Cookie, Book, Shirt, Monitor } from "lucide-react";


export default function page() {
  const marketplaceLinks = [
    { href: "/art", label: "Art ", icon: <Paintbrush className="h-4 w-4" /> },
    { href: "/food", label: "Food ", icon: <Cookie className="h-4 w-4" /> },
    { href: "/books", label: "Books", icon: <Book className="h-4 w-4" /> },
    { href: "/clothing", label: "Clothing", icon: <Shirt className="h-4 w-4" /> },
    { href: "/tech", label: "Tech", icon: <Monitor className="h-4 w-4" /> },

  ];
  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
    <Header />
    <div className="flex flex-col md:flex-row">
      {/* Left SideNav */}
    

      
      {/* Right Content */}
      <div className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-2">
    <div>
        <CheckoutComponent/>
    </div>
    </div>
    </div>
    </div>
  )
}
