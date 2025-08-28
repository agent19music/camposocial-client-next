"use client"
import Link from "next/link"
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
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import EventCard from '@/components/event';
import { MouseEvent } from "react";
import SideNav from "@/components/sidenav"
import Header from "@/components/header"
import { Calendar, PartyPopper, Plus, List} from "lucide-react";
import { toast } from "react-hot-toast"

export default function Dashboard() {
  const eventLinks = [
    { label: "Calendar", icon: <Calendar className="h-4 w-4" />, onClick: () => toast.success("calendar") },
    { label: "Create Event", icon: <Plus className="h-4 w-4" />, onClick: () => toast.success("create") },
    { label: "My Events", icon: <List className="h-4 w-4" />, onClick: () => toast.success("myEvents") },
  ]

    const comments = [
        {
          image: null,
          username: "HappyCoder",
          text: "I love this feature! 😍🔥",
          dateCreated: "2024-08-20T10:30:00Z",
        },
        {
          image :"/yoruichipfp.jpg",
          username: "DevGuru",
          text: "Well done! Keep up the great work! 💪💻",
          dateCreated: "2024-08-21T15:45:00Z",
        },
        {
          image: null,
          username: "BugHunter",
          text: "I found a small issue, but it’s nothing major 🐞🚀",
          dateCreated: "2024-08-22T09:15:00Z",
        },
        {
          image: null,
          username: "UIWizard",
          text: "The new design looks amazing! ✨🎨",
          dateCreated: "2024-08-23T13:50:00Z",
        },
        {
          image: null,
          username: "CodeMaster",
          text: "This is super useful, thanks! 🙌📚",
          dateCreated: "2024-08-24T08:25:00Z",
        },
      ];
      const events = [
        {
          eventId: "1",
          title: "Plant your own garden",
          description: "Like plants so much you wanna love them? Pull up!",
          date: "27/03/2024",
          entry_fee: "500",
          poster: "/eventposter.png",
          username: "tayk47",
          userimage: null,
          comments: comments, // Assuming you want the same comments for each event
        },
        {
          eventId: "2",
          title: "Y2K Party",
          description: "Early 2000s themed party. Pull up!",
          date: "27/03/2024",
          entry_fee: "500",
          poster: "/y2kparty.png",
          username: "oppaStompa",
          userimage: "/wkndpfp.jpg",
          comments: comments,
        },
        {
          eventId: "3",
          title: "Ramen",
          description: "Vibe and slurp on ramen",
          date: "27/03/2024",
          entry_fee: "500",
          poster: "/ramenposter.png",
          username: "tayk47",
          userimage: "/yoruichipfp.jpg",
          comments: comments,
        },
      ];
      
      const handleSubmit = (
        e: MouseEvent<HTMLButtonElement>, 
        eventId: string, 
        localCommentText: string
      ): void => {
        e.preventDefault();
      
        if (!localCommentText) {
         
          return;
        }
      
        if (localCommentText.length > 300) {
          return;
        }
      
        if (localCommentText !== '') {
          sendComment(localCommentText, eventId);  // Assuming sendComment is defined elsewhere
        }
      };
     
      const sendComment = async (commentText: string, eventId: string): Promise<void> => {
        const apiEndpoint = "YOUR_API_ENDPOINT"; // Define your API endpoint here
        const authToken = "YOUR_AUTH_TOKEN"; // Replace with your actual token retrieval logic
      
        try {
          const response = await fetch(`${apiEndpoint}/comment-event/${eventId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken ?? ''}`,  // Safe fallback if authToken is undefined
            },
            body: JSON.stringify({ text: commentText, event_id: eventId }),
          });
      
          if (response.ok) {
           console.log("yaay");
             // Assuming setOnchange is a function elsewhere
          }
        } catch (error) {
          console.error('Error submitting comment:', error);
        }
      };
  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
    <Header />
    <main className="mobile-content-padding lg:pb-4">
    <div className="flex flex-col md:flex-row ">
      {/* Left SideNav */}
      <div className="md:w-64 flex-shrink-0">
          <SideNav links = {eventLinks} />
        </div>

    {/* Center content */}
    <div className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-2 justify-center items-center ">
      
      {/* Green area with centered input */}
      <div className="w-full flex-1   flex justify-center items-center">
        <form>
          <div className="relative mx-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-full"
            />
          </div>
        </form>
      </div>
      
      <div className="flex flex-col w-full max-w-6/12 rounded-lg border border-dashed shadow-sm overflow-y-auto lg:min-h-[780px] md:max-h-[537.6px] ">
  {events.map((event, index) => (
    <EventCard
      key={index}
    {...event}
    event={event}
    handleSubmit={handleSubmit}
    />
  ))}
</div>

    </div>

  </div>
  </main>
</div>

  )
}
