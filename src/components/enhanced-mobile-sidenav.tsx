"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  MessageSquare,
  ShoppingBag,
  UserPlus,
  User,
  Settings,
  Bookmark,
  History,
  TrendingUp,
  Star,
  ShoppingCart,
  Package,
  Users,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { AuthContext } from "@/context/authcontext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";
import { EnhancedMobileSideNavProps } from '@/types';

export default function EnhancedMobileSideNav({ className }: EnhancedMobileSideNavProps) {
  const pathname = usePathname();
  const { currentUser, logout } = useContext(AuthContext);

  const getPageSpecificItems = () => {
    if (pathname?.includes('/yaps/communities')) {
      return [
        { icon: TrendingUp, label: "Discover", href: "/yaps/communities" },
        { icon: Users, label: "My Communities", href: "/yaps/communities" },
      ];
    } else if (pathname?.includes('/yaps')) {
      return [
        { icon: TrendingUp, label: "Trending", href: "/yaps" },
        { icon: Users, label: "Following", href: "/yaps" },
      ];
    } else if (pathname?.includes('/marketplace')) {
      return [
        // Marketplace-specific links can be added when routes are implemented
      ];
    } else if (pathname?.includes('/events')) {
      return [
        // Events-specific links can be added when routes are implemented
      ];
    } else if (pathname?.includes('/friends')) {
      return [
        { icon: MessageSquare, label: "Messages", href: "/friends?tab=messages" },
        { icon: Users, label: "Friend Requests", href: "/friends?tab=requests" },
        { icon: UserPlus, label: "Discover People", href: "/friends?tab=discover" },
      ];
    }
    return [];
  };

  const mainNavItems = [
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: MessageSquare, label: "Yaps", href: "/yaps" },
    { icon: Users, label: "Communities", href: "/yaps/communities" },
    { icon: ShoppingBag, label: "Marketplace", href: "/marketplace" },
    { icon: UserPlus, label: "Friends", href: "/friends" },
  ];

  const pageSpecificItems = getPageSpecificItems();

  const profileItems = [
    { icon: User, label: "View Profile", href: "/userprofile" },
    { icon: Settings, label: "Settings", href: "/profilesettings" },
  ];

  return (
    <nav className={cn("grid gap-2 text-lg font-medium p-4", className)}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-6">
        <Image src="/camposocial_logo.png" alt="CampoSocial" width={32} height={32} />
        <span>CampoSocial</span>
      </Link>

      {/* Page-Specific Items Only */}
      {pageSpecificItems.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {pathname?.includes('/yaps/communities') && 'Communities'}
            {pathname?.includes('/yaps') && !pathname?.includes('/yaps/communities') && 'Yaps'}
            {pathname?.includes('/marketplace') && 'Shopping'}
            {pathname?.includes('/events') && 'Events'}
            {pathname?.includes('/friends') && 'Social'}
          </h3>
          {pageSpecificItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted/50",
                pathname === item.href || (item.href.includes('?') && pathname?.includes(item.href.split('?')[0]))
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Profile Section */}
      <Separator className="my-4" />
      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Profile
        </h3>
        {profileItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted/50",
              pathname === item.href
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto space-y-4 pt-4">
        {currentUser ? (
          <div className="space-y-2">
            <div className="px-3 py-2 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-foreground">{currentUser.username}</p>
              <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button asChild className="w-full">
            <Link href="/login">Login</Link>
          </Button>
        )}
        <div className="px-3">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
