"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Use usePathname for more reliable client-side routing
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
  Sparkles,
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AddYap from '@/components/addyap'
import AddEvent from "@/components/addevent";
import { useContext } from "react";
import { AuthContext } from "@/context/authcontext";
import {toast} from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
const Header: FC = () => {
  const pathname = usePathname(); // Use usePathname to get the current route
  const [activePage, setActivePage] = useState<string>("");
  const router = useRouter()

  const {currentUser, logout} = useContext(AuthContext)
  useEffect(() => {
    if (pathname) {
      setActivePage(pathname); // Set active page based on the current route
    }
  }, [pathname]);

  function headsup (){
    toast.success('heads up !!')
  }
  function takeMeToLogin(){
    router.push('/login')
  }

  function takeMeToSettings(){
    router.push('/profilesettings')
  }

  function takeMeToProfile(){
    router.push('/userprofile')
  }

  const navItems = [
    { icon: Calendar, label: "Events", href: "/events" },
    { icon: MessageSquare, label: "Yaps", href: "/yaps" },
    { icon: Plus, label: "", href: "/777" },
    { icon: ShoppingBag, label: "Marketplace", href: "/marketplace" },
    { icon: UserPlus, label: "Friends", href: "/friends" },
  ];

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6 mt-2.5 relative">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col bg-background">
            <nav className="grid gap-2 text-lg font-medium">
              <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                <Package2 className="h-6 w-6" />
                <span className="sr-only">Acme Inc</span>
              </Link>
              <Link
                href="/userprofile"
                className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${
                  activePage === "/userprofile" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="#"
                className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${
                  activePage === "/orders" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                Orders
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">6</Badge>
              </Link>
              {/* Add more links as needed */}
            </nav>
            <div className="mt-auto">
              <ThemeToggle />
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden lg:flex items-center justify-center space-x-4 mx-auto text-center">
        <Link href="/events">
          <Button
            variant="ghost"
            size="sm"
            className={`text-muted-foreground hover:text-foreground ${
              activePage.includes("/events")  ? "text-foreground" : ""
            }`}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Events
          </Button>
        </Link>

        <Link href="/yaps">
          <Button
            variant="ghost"
            size="sm"
            className={`text-muted-foreground hover:text-foreground ${
              activePage.includes("/yaps") ? "text-foreground" : ""
            }`}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Yaps
          </Button>
        </Link>

        {/* Plus Icon with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-5 w-5 mr-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 flex flex-col justify-center place-items-center max-w-32">
            <span className="pb-3">
            <AddYap/>
            </span>
            <span> <AddEvent/></span>
         
          </PopoverContent>
        </Popover>

        <Link href="/marketplace">
          <Button
            variant="ghost"
            size="sm"
            className={`text-muted-foreground hover:text-foreground ${
              activePage.includes("/marketplace")  ? "text-foreground" : ""
            }`}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Marketplace
          </Button>
        </Link>

        <Link href="/friends">
          <Button
            variant="ghost"
            size="sm"
            className={`text-muted-foreground hover:text-foreground ${
              activePage.includes("/friends")  ? "text-foreground" : ""
            }`}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Friends
          </Button>
        </Link>
      </div>
      <div className="mt-auto hidden lg:flex items-center space-x-4">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
         
  {currentUser ? <DropdownMenuLabel> {currentUser.username} </DropdownMenuLabel> :
  <DropdownMenuLabel onClick={takeMeToLogin} className="hover:cursor-pointer">
Login
  </DropdownMenuLabel>
}
           <DropdownMenuSeparator />
            <DropdownMenuItem onClick={takeMeToProfile}>Profile Info</DropdownMenuItem>
            <DropdownMenuItem onClick={takeMeToSettings}>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </header>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t flex justify-around items-center h-14 z-50">
        <Link href="/events">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col text-muted-foreground hover:text-foreground ${
              activePage === "/events" ? "text-foreground" : ""
            }`}
          >
            <Calendar className="h-5 w-5 mb-1" />
            <span className="text-xs">Events</span>
          </Button>
        </Link>

        <Link href="/yaps">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col text-muted-foreground hover:text-foreground ${
              activePage === "/yaps" ? "text-foreground " : ""
            }`}
          >
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Yaps</span>
          </Button>
        </Link>

        {/* Plus Icon with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex-col text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-5 w-5 mb-1" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 flex flex-col justify-center place-items-center max-w-32">
            <span className="pb-3">
            <AddYap/>
            </span>
            <span> <AddEvent/></span>
         
          </PopoverContent>
        </Popover>

        <Link href="/marketplace">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col text-muted-foreground hover:text-foreground ${
              activePage === "/marketplace" ? "text-foreground " : ""
            }`}
          >
            <ShoppingBag className="h-5 w-5 mb-1" />
            <span className="text-xs">Marketplace</span>
          </Button>
        </Link>

        <Link href="/friends">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-col text-muted-foreground hover:text-foreground ${
              activePage === "/friends" ? "text-foreground" : ""
            }`}
          >
            <UserPlus className="h-5 w-5 mb-1" />
            <span className="text-xs">Friends</span>
          </Button>
        </Link>
      </nav>
    </>
  );
};

export default Header;
