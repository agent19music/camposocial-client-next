import type React from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { 
  Bookmark, 
  History, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Star, 
  Calendar, 
  MapPin, 
  Bell, 
  MessageSquare, 
  UserPlus, 
  Heart 
} from "lucide-react"

interface NavLink {
  label: string
  icon: React.ReactNode
  onClick: () => void
  badgeCount?: number
}

interface SideNavProps {
  links: NavLink[]
  variant?: "default" | "compact"
}

export default function SideNav({ links, variant = "default" }: SideNavProps) {
  const pathname = usePathname();

  // Get additional features based on current page
  const getExtraFeatures = () => {
    if (pathname?.includes('/yaps')) {
      return [
        { icon: <Bookmark className="h-4 w-4" />, label: "Bookmarked Yaps", onClick: () => console.log("bookmarks"), badgeCount: 5 },
        { icon: <TrendingUp className="h-4 w-4" />, label: "Trending", onClick: () => console.log("trending") },
        { icon: <Users className="h-4 w-4" />, label: "Following", onClick: () => console.log("following") },
        { icon: <History className="h-4 w-4" />, label: "Your Yaps", onClick: () => console.log("history") },
      ];
    } else if (pathname?.includes('/marketplace')) {
      return [
        { icon: <ShoppingCart className="h-4 w-4" />, label: "Cart", onClick: () => console.log("cart"), badgeCount: 3 },
        { icon: <Package className="h-4 w-4" />, label: "Orders", onClick: () => console.log("orders") },
        { icon: <CreditCard className="h-4 w-4" />, label: "Payment Methods", onClick: () => console.log("payments") },
        { icon: <Star className="h-4 w-4" />, label: "Wishlist", onClick: () => console.log("wishlist"), badgeCount: 12 },
        { icon: <History className="h-4 w-4" />, label: "Order History", onClick: () => console.log("history") },
      ];
    } else if (pathname?.includes('/events')) {
      return [
        { icon: <Calendar className="h-4 w-4" />, label: "My Events", onClick: () => console.log("my-events") },
        { icon: <Bookmark className="h-4 w-4" />, label: "Saved Events", onClick: () => console.log("saved"), badgeCount: 2 },
        { icon: <History className="h-4 w-4" />, label: "Event History", onClick: () => console.log("history") },
        { icon: <MapPin className="h-4 w-4" />, label: "Nearby Events", onClick: () => console.log("nearby") },
        { icon: <Bell className="h-4 w-4" />, label: "Event Reminders", onClick: () => console.log("reminders") },
      ];
    } else if (pathname?.includes('/friends')) {
      return [
        { icon: <MessageSquare className="h-4 w-4" />, label: "Messages", onClick: () => console.log("messages"), badgeCount: 7 },
        { icon: <Users className="h-4 w-4" />, label: "Friend Requests", onClick: () => console.log("requests"), badgeCount: 3 },
        { icon: <UserPlus className="h-4 w-4" />, label: "Discover People", onClick: () => console.log("discover") },
        { icon: <Heart className="h-4 w-4" />, label: "Friend Activity", onClick: () => console.log("activity") },
      ];
    }
    return [];
  };

  const extraFeatures = getExtraFeatures();

  return (
    <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4", variant === "compact" ? "gap-1" : "gap-2")}>
      {/* Main links */}
      {links.map((link, index) => (
        <Button
          key={index}
          variant="ghost"
          className={cn(
            "justify-start text-muted-foreground transition-all hover:text-primary",
            variant === "compact" ? "px-2 py-1.5" : "px-3 py-2",
          )}
          onClick={link.onClick}
        >
          {link.icon}
          {link.label && <span className="ml-3">{link.label}</span>}
          {link.badgeCount !== undefined && (
            <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
              {link.badgeCount}
            </Badge>
          )}
        </Button>
      ))}

      {/* Extra features section */}
      {extraFeatures.length > 0 && (
        <>
          <Separator className="my-3" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Quick Access
            </h4>
            {extraFeatures.map((feature, index) => (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "justify-start text-muted-foreground transition-all hover:text-primary w-full",
                  variant === "compact" ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm",
                )}
                onClick={feature.onClick}
              >
                {feature.icon}
                <span className="ml-3">{feature.label}</span>
                {feature.badgeCount !== undefined && (
                  <Badge className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs bg-purple-500 text-white">
                    {feature.badgeCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </>
      )}
    </nav>
  )
}

