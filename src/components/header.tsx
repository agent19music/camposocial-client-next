"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
  Calendar,
  MessageSquare,
  ShoppingBag,
  UserPlus,
  Plus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AddYap from '@/components/addyap'
import AddEvent from "@/components/addevent";
import { useContext } from "react";
import { AuthContext } from "@/context/authcontext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useWebSocket } from "@/context/websocket-context";
import { NotificationDot, NotificationCounter, YapNotificationBanner } from "@/components/notification-indicators";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import MobileHeader from "@/components/mobile-header";
import SmartFAB from "@/components/smart-fab";
import EnhancedMobileSideNav from "@/components/enhanced-mobile-sidenav";
import { AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
interface HeaderProps {
  onSearch?: (query: string) => void;
  onFilterSelect?: (filterId: string) => void;
  searchQuery?: string;
  activeFilter?: string;
}

const Header: FC<HeaderProps> = ({
  onSearch,
  onFilterSelect,
  searchQuery = "",
  activeFilter = "all"
}) => {
  const pathname = usePathname();
  const [activePage, setActivePage] = useState<string>("");
  const router = useRouter();

  const { currentUser, logout, isAuthenticated } = useContext(AuthContext);
  const { openAuthModal } = useAuthModal();
  const {
    notificationCounts,
    yapCounts,
    hasNewNotifications,
    hasNewYaps,
    markYapsAsSeen,
    markFriendRequestsAsSeen,
    isConnected
  } = useWebSocket();

  useEffect(() => {
    if (pathname) {
      setActivePage(pathname);
    }
  }, [pathname]);

  function headsup() {
    toast.success('heads up !!');
  }

  function takeMeToLogin() {
    router.push('/login');
  }

  function takeMeToSettings() {
    router.push('/profilesettings');
  }

  function takeMeToProfile() {
    router.push(`/yaps/profile/${currentUser?.username}`);
  }

  // Get filters based on current page
  const getPageFilters = () => {
    if (pathname?.includes('/marketplace')) {
      return [
        { id: 'all', label: 'All', active: activeFilter === 'all' },
        { id: 'art', label: 'Art', active: activeFilter === 'art' },
        { id: 'food', label: 'Food', active: activeFilter === 'food' },
        { id: 'books', label: 'Books', active: activeFilter === 'books' },
        { id: 'clothing', label: 'Clothing', active: activeFilter === 'clothing' },
        { id: 'tech', label: 'Tech', active: activeFilter === 'tech' },
      ];
    } else if (pathname?.includes('/yaps')) {
      return [
        { id: 'all', label: 'All', active: activeFilter === 'all' },
        { id: 'trending', label: 'Trending', active: activeFilter === 'trending' },
        { id: 'following', label: 'Following', active: activeFilter === 'following' },
        { id: 'recent', label: 'Recent', active: activeFilter === 'recent' },
      ];
    } else if (pathname?.includes('/events')) {
      return [
        { id: 'all', label: 'All', active: activeFilter === 'all' },
        { id: 'today', label: 'Today', active: activeFilter === 'today' },
        { id: 'this-week', label: 'This Week', active: activeFilter === 'this-week' },
        { id: 'free', label: 'Free', active: activeFilter === 'free' },
        { id: 'paid', label: 'Paid', active: activeFilter === 'paid' },
      ];
    } else if (pathname?.includes('/friends')) {
      return [
        { id: 'all', label: 'All', active: activeFilter === 'all' },
        { id: 'online', label: 'Online', active: activeFilter === 'online' },
        { id: 'mutual', label: 'Mutual Friends', active: activeFilter === 'mutual' },
        { id: 'nearby', label: 'Nearby', active: activeFilter === 'nearby' },
      ];
    }
    return [];
  };

  // Get search placeholder based on current page
  const getSearchPlaceholder = () => {
    if (pathname?.includes('/marketplace')) return 'Search products...';
    if (pathname?.includes('/yaps')) return 'Search yaps...';
    if (pathname?.includes('/events')) return 'Search events...';
    if (pathname?.includes('/friends')) return 'Search people...';
    return 'Search...';
  };

  const handleSearch = (query: string) => {
    onSearch?.(query);
  };

  const handleFilterSelect = (filterId: string) => {
    onFilterSelect?.(filterId);
  };

  // Handle navigation to yaps page and mark yaps as seen
  const handleYapsNavigation = () => {
    if (hasNewYaps) {
      markYapsAsSeen();
    }
    router.push('/yaps');
  };

  // Handle navigation to friends page and mark friend requests as seen if on requests tab
  const handleFriendsNavigation = () => {
    router.push('/friends');
  };

  // Mark friend requests as seen when user visits friends page with requests
  const handleFriendRequestsViewed = () => {
    if (notificationCounts.friend_requests > 0) {
      markFriendRequestsAsSeen();
    }
  };

  return (
    <>
      {/* Yap notification banner - shown when there are new yaps */}
      {hasNewYaps && !activePage.includes("/yaps") && (
        <YapNotificationBanner
          count={yapCounts.new_yaps_count}
          authors={yapCounts.recent_authors}
          onViewNew={handleYapsNavigation}
        />
      )}

      {/* Mobile Header with Search and Filters */}
      <MobileHeader
        searchPlaceholder={getSearchPlaceholder()}
        filters={[]}
        onSearch={handleSearch}
        onFilterSelect={handleFilterSelect}
        showSearch={true}
        showFilters={false}
      />

      {/* Smart FAB - Only show when authenticated */}
      {isAuthenticated && <SmartFAB />}

      {/* Desktop Header */}
      <header className="hidden lg:flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6 mt-2.5 relative">
        <div className="hidden lg:flex items-center justify-center space-x-4 mx-auto text-center">
          <Link href="/events">
            <Button
              variant="ghost"
              size="sm"
              className={`text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:text-white dark:hover:bg-[#ff9013]/20 ${activePage.includes("/events") ? "text-[#ff9013]" : ""
                }`}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Events
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleYapsNavigation}
            className={`relative text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:text-white dark:hover:bg-[#ff9013]/20 ${activePage.includes("/yaps") ? "text-[#ff9013]" : ""
              }`}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Yaps
            {/* Purple notification dot for new yaps */}
            <NotificationDot
              show={hasNewYaps}
              size="sm"
              position="top-right"
              className="ml-2"
            />
          </Button>

          {/* Plus Icon with Popover - Only show when authenticated */}
          {isAuthenticated && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:text-white dark:hover:bg-[#ff9013]/20"
                >
                  <Plus className="h-5 w-5 mr-2" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-2 flex flex-col justify-center place-items-center max-w-32">
                <span className="pb-3">
                  <AddYap />
                </span>
                <span>
                  <AddEvent />
                </span>
              </PopoverContent>
            </Popover>
          )}

          <Link href="/marketplace">
            <Button
              variant="ghost"
              size="sm"
              className={`text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:text-white dark:hover:bg-[#ff9013]/20 ${activePage.includes("/marketplace") ? "text-[#ff9013]" : ""
                }`}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Marketplace
            </Button>
          </Link>

          {/* Friends link - only show when authenticated */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFriendsNavigation}
              className={`relative text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:text-white dark:hover:bg-[#ff9013]/20 ${activePage.includes("/friends") ? "text-[#ff9013]" : ""
                }`}
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Friends
              {/* Purple notification dot for friend requests */}
              <NotificationDot
                show={notificationCounts.friend_requests > 0}
                size="sm"
                position="top-right"
                className="ml-2"
              />
            </Button>
          )}
        </div>

        <div className="mt-auto hidden lg:flex items-center space-x-4">
          <ThemeToggle />
          {isAuthenticated && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full hover:opacity-80 transition-opacity"
                  onClick={() => router.push(`/yaps/profile/${currentUser.username}`)}
                >
                  <Avatar className="w-10 h-10 mb-2 flex-shrink-0">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback>{currentUser?.display_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel
                  className="hover:cursor-pointer"
                  onClick={() => router.push(`/yaps/profile/${currentUser.username}`)}
                >
                  {currentUser.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={takeMeToProfile}>Profile Info</DropdownMenuItem>
                <DropdownMenuItem onClick={takeMeToSettings}>Settings</DropdownMenuItem>
                {currentUser?.is_seller && (
                  <DropdownMenuItem
                    onClick={() => {
                      const sellerDashboardUrl = process.env.NEXT_PUBLIC_SELLER_DASHBOARD_URL || 'http://localhost:3001';
                      window.location.href = sellerDashboardUrl + '/dashboard';
                    }}
                    className="text-[#ff9013] font-medium"
                  >
                    Seller Dashboard
                  </DropdownMenuItem>
                )}
                {currentUser && !currentUser?.is_seller && (
                  <DropdownMenuItem onClick={() => router.push('/marketplace/sellersignup')}>
                    Become a Seller
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => openAuthModal()}
                className="font-semibold"
              >
                Log In
              </Button>
              <Button
                onClick={() => openAuthModal()}
                className="text-white font-semibold"
                style={{ backgroundColor: 'var(--color-fun)' }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation - Simplified */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-background/95 backdrop-blur-sm border-t flex justify-around items-center h-16 z-40 pb-safe">
        {/* Mobile Side Nav Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex-col h-12 px-3 text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:text-white dark:hover:bg-[#ff9013]/20 transition-colors"
            >
              <Menu className="h-5 w-5 mb-1" />
              <span className="text-xs">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-white dark:bg-background border-r">
            <SheetTitle asChild>
              <VisuallyHidden.Root>Navigation Menu</VisuallyHidden.Root>
            </SheetTitle>
            <EnhancedMobileSideNav />
          </SheetContent>
        </Sheet>

        <Link href="/events">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col h-12 px-3 text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:bg-[#ff9013]/20 transition-colors ${activePage.includes("/events") ? "text-[#ff9013] bg-[#ff9013]/10 dark:bg-[#ff9013]/20" : ""
              }`}
          >
            <Calendar className="h-5 w-5 mb-1" />
            <span className="text-xs">Events</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleYapsNavigation}
          className={`relative flex-col h-12 px-3 text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:text-white dark:hover:bg-[#ff9013]/20 transition-colors ${activePage.includes("/yaps") ? "text-[#ff9013] bg-[#ff9013]/10 dark:bg-[#ff9013]/20" : ""
            }`}
        >
          <div className="relative">
            <MessageSquare className="h-5 w-5 mb-1" />
            {/* Purple notification dot for mobile */}
            <NotificationDot
              show={hasNewYaps}
              size="sm"
              position="top-right"
            />
          </div>
          <span className="text-xs">Yaps</span>
        </Button>

        <Link href="/marketplace">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col h-12 px-3 text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:text-white dark:hover:bg-[#ff9013]/20 transition-colors ${activePage.includes("/marketplace") ? "text-[#ff9013] bg-[#ff9013]/10 dark:bg-[#ff9013]/20" : ""
              }`}
          >
            <ShoppingBag className="h-5 w-5 mb-1" />
            <span className="text-xs">Shop</span>
          </Button>
        </Link>

        {isAuthenticated ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFriendsNavigation}
            className={`relative flex-col h-12 px-3 text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:text-white dark:hover:bg-[#ff9013]/20 transition-colors ${activePage.includes("/friends") ? "text-[#ff9013] bg-[#ff9013]/10 dark:bg-[#ff9013]/20" : ""
              }`}
          >
            <div className="relative">
              <UserPlus className="h-5 w-5 mb-1" />
              {/* Purple notification dot for mobile */}
              <NotificationDot
                show={notificationCounts.friend_requests > 0}
                size="sm"
                position="top-right"
              />
            </div>
            <span className="text-xs">Friends</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openAuthModal()}
            className="flex-col h-12 px-3 text-muted-foreground hover:bg-[#ff9013]/10 dark:hover:text-white dark:hover:bg-[#ff9013]/20 transition-colors"
          >
            <CircleUser className="h-5 w-5 mb-1" />
            <span className="text-xs">Sign In</span>
          </Button>
        )}
      </nav>
    </>
  );
};

export default Header;
