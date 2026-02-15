"use client";

import { useState, useEffect, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus, ShoppingCart, MessageSquare, UserPlus } from "lucide-react";
import { UsersThree, Compass, UsersThreeIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MarketplaceContext } from "@/context/marketplacecontext";
import { useCommunity } from "@/context/CommunityContext";
import AddYap from "@/components/addyap";
import AddEvent from "@/components/addevent";
import AddCommunity from "@/components/addcommunity";

export default function SmartFAB() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);
  const { updateCart } = useContext(MarketplaceContext) || { updateCart: false };
  const { myCommunities, fetchMyCommunities } = useCommunity();

  // Fetch user's communities for the FAB
  useEffect(() => {
    if (pathname === '/yaps') {
      fetchMyCommunities();
    }
  }, [pathname, fetchMyCommunities]);

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
      // No FAB on friends page
      return null;
    } else if (pathname === '/yaps') {
      // Main yaps page - show communities FAB
      return {
        icon: UsersThree,
        action: 'communities',
        badgeCount: 0,
        label: 'Communities'
      };
    } else if (pathname?.includes('/yaps/communities')) {
      return {
        icon: Plus,
        action: 'add-community',
        badgeCount: 0,
        label: 'Add'
      };
    } else if (pathname?.includes('/events')) {
      return {
        icon: Plus,
        action: 'add-event',
        badgeCount: 0,
        label: 'Add'
      };
    }
  };

  const fabConfig = getFABConfig();

  // No FAB to show (e.g., on friends page)
  if (!fabConfig) return null;

  const IconComponent = fabConfig.icon;

  const handleFABClick = () => {
    if (fabConfig.action === 'cart') {
      // Navigate to cart or trigger cart modal
      window.dispatchEvent(new CustomEvent('open-cart'));
    } else if (fabConfig.action === 'message') {
      // Handle messages/DM action
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

  // Communities FAB for main /yaps page
  if (fabConfig.action === 'communities') {
    return (
      <div
        className={cn(
          "lg:hidden fixed bottom-20 right-4 z-40 transition-all duration-300 ease-in-out",
          isVisible ? "translate-y-0 scale-100" : "translate-y-2 scale-95 opacity-0"
        )}
      >
        <Popover open={isCommunitiesOpen} onOpenChange={setIsCommunitiesOpen}>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
            >
              <UsersThreeIcon className="h-6 w-6"  />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 mb-2 mr-2 w-56" side="top" align="end">
            <div className="flex flex-col gap-1">
              {/* Discover option */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11"
                onClick={() => {
                  setIsCommunitiesOpen(false);
                  router.push('/yaps/communities');
                }}
              >
                <Compass className="h-5 w-5" weight="regular" />
                <span>Discover</span>
              </Button>

              {/* User's communities - show single community directly or "My Communities" */}
              {myCommunities.length === 1 ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11"
                  onClick={() => {
                    setIsCommunitiesOpen(false);
                    router.push(`/yaps/communities/${myCommunities[0].slug}`);
                  }}
                >
                  <div className="relative w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-muted">
                    {myCommunities[0].icon_image ? (
                      <Image
                        src={myCommunities[0].icon_image}
                        alt={myCommunities[0].name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                        {myCommunities[0].name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="truncate">{myCommunities[0].name}</span>
                </Button>
              ) : myCommunities.length > 1 ? (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">My Communities</div>
                  {myCommunities.slice(0, 3).map((community) => (
                    <Button
                      key={community.id}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-10"
                      onClick={() => {
                        setIsCommunitiesOpen(false);
                        router.push(`/yaps/communities/${community.slug}`);
                      }}
                    >
                      <div className="relative w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-muted">
                        {community.icon_image ? (
                          <Image
                            src={community.icon_image}
                            alt={community.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                            {community.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="truncate">{community.name}</span>
                    </Button>
                  ))}
                  {myCommunities.length > 3 && (
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-xs text-muted-foreground h-8"
                      onClick={() => {
                        setIsCommunitiesOpen(false);
                        router.push('/yaps/communities');
                      }}
                    >
                      View all ({myCommunities.length})
                    </Button>
                  )}
                </>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Add action for communities page
  if (fabConfig.action === 'add-community') {
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
            <div className="flex flex-col gap-2 min-w-[160px]">
              <AddCommunity />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  if (fabConfig.action === 'add-event') {
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
