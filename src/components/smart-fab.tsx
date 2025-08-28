"use client";

import { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import { Plus, ShoppingCart, MessageSquare, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MarketplaceContext } from "@/context/marketplacecontext";
import AddYap from "@/components/addyap";
import AddEvent from "@/components/addevent";

export default function SmartFAB() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const [cartItemCount, setCartItemCount] = useState(0);
  const { updateCart } = useContext(MarketplaceContext) || { updateCart: false };

  // Effect to fetch cart item count
  useEffect(() => {
    const fetchCartItemCount = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/cart`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCartItemCount(data.cart_items?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
      }
    };

    if (pathname?.includes('/marketplace')) {
      fetchCartItemCount();
    }
  }, [pathname, updateCart]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show FAB if scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide FAB if scrolling down and past threshold
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getFABConfig = () => {
    if (pathname?.includes('/marketplace')) {
      return {
        icon: ShoppingCart,
        action: 'cart',
        badgeCount: cartItemCount,
        label: 'Cart'
      };
    } else if (pathname?.includes('/friends')) {
      return {
        icon: MessageSquare,
        action: 'message',
        badgeCount: 0, // You can add unread messages count here
        label: 'Messages'
      };
    } else {
      return {
        icon: Plus,
        action: 'add',
        badgeCount: 0,
        label: 'Add'
      };
    }
  };

  const fabConfig = getFABConfig();
  const IconComponent = fabConfig.icon;

  const handleFABClick = () => {
    if (fabConfig.action === 'cart') {
      // Navigate to cart or trigger cart modal
      window.dispatchEvent(new CustomEvent('open-cart'));
    } else if (fabConfig.action === 'message') {
      // Handle messages/DM action
      console.log('Open messages');
    } else {
      // Add action will be handled by the popover
    }
  };

  if (fabConfig.action === 'cart') {
    return (
      <div 
        className={cn(
          "lg:hidden fixed bottom-20 right-4 z-40 transition-all duration-300 ease-in-out",
          isVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-95 opacity-0"
        )}
      >
        <Button
          size="lg"
          onClick={handleFABClick}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
        >
          <div className="relative">
            <IconComponent className="h-6 w-6" />
            {fabConfig.badgeCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
                {fabConfig.badgeCount}
              </Badge>
            )}
          </div>
        </Button>
      </div>
    );
  }

  if (fabConfig.action === 'add') {
    return (
      <div 
        className={cn(
          "lg:hidden fixed bottom-20 right-4 z-40 transition-all duration-300 ease-in-out",
          isVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-95 opacity-0"
        )}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
            >
              <IconComponent className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-3 mb-2 mr-2 w-auto" side="top" align="end">
            <div className="flex flex-col gap-2 min-w-[120px]">
              <AddYap />
              <AddEvent />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "lg:hidden fixed bottom-20 right-4 z-40 transition-all duration-300 ease-in-out",
        isVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-95 opacity-0"
      )}
    >
      <Button
        size="lg"
        onClick={handleFABClick}
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
      >
        <div className="relative">
          <IconComponent className="h-6 w-6" />
          {fabConfig.badgeCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
              {fabConfig.badgeCount}
            </Badge>
          )}
        </div>
      </Button>
    </div>
  );
}
