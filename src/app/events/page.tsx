"use client"
import Link from "next/link"
import { useContext, useMemo, useState } from "react"
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
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
// Removed standalone Input; search is handled via FilterPills
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import EventCard from '@/components/event';
import { MouseEvent } from "react";
import Header from "@/components/header"
import FilterPills, { FilterPill } from "@/components/filter-pills"
import { Calendar, Plus, List } from "lucide-react";
import { toast } from "react-hot-toast"
import { useEventContext } from "@/context/eventcontext"
import { AuthContext } from "@/context/authcontext"
import AddEvent from "@/components/addevent"

export default function Dashboard() {
  const { events, isLoading, setCategory, setOnchange, onchange } = useEventContext()
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const { authToken } = useContext(AuthContext)
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
  console.log("[Dashboard] Events:", events);
  const categories = useMemo(() => {
    const set = new Set<string>(["all"])
    events.forEach(e => {
      if (e.category && typeof e.category === 'string') set.add(e.category)
    })
    return Array.from(set)
  }, [events])

  const filterPills: FilterPill[] = [
    ...categories.map(cat => ({
      id: cat,
      label: cat === 'all' ? 'All' : cat,
      active: activeFilter === cat,
    })),
    { id: 'search', label: 'Search', isSearch: true },
  ]

  const handleFilterSelect = (filterId: string) => {
    setActiveFilter(filterId)
    setCategory(filterId === 'all' ? '' : filterId)
  }

  const displayEvents = useMemo(() => {
    if (!searchQuery.trim()) return events
    const q = searchQuery.toLowerCase()
    return events.filter((e: any) => {
      const fields = [e.title, e.description, e.username]
      return fields.some((f) => typeof f === 'string' && f.toLowerCase().includes(q))
    })
  }, [events, searchQuery])

  const handleSubmit = async (
    e: MouseEvent<HTMLButtonElement>,
    eventId: string,
    localCommentText: string
  ): Promise<void> => {
    e.preventDefault();

    if (!localCommentText) {
      toast.error('Comment cannot be empty')
      return;
    }

    if (localCommentText.length > 300) {
      toast.error('Comment is too long (max 300 characters)')
      return;
    }

    if (localCommentText !== '') {
      sendComment(localCommentText, eventId);
    }
  };

  const sendComment = async (commentText: string, eventId: string): Promise<void> => {
    if (!apiEndpoint || !authToken) {
      toast.error('Please login to comment')
      return
    }

    try {
      const response = await fetch(`${apiEndpoint}/comment-event/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ text: commentText, event_id: eventId }),
      });

      if (response.ok) {
        toast.success('Comment added successfully')
        setOnchange(!onchange)
      } else {
        toast.error('Failed to add comment')
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to add comment')
    }
  };

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <main className="mobile-content-padding lg:pb-4">
        <div className="flex flex-col">
          <div className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-2 justify-center items-center">
            {/* Event Filters with Search pill (mobile) */}
            <div className="w-full lg:hidden">
              <FilterPills
                filters={filterPills}
                onFilterSelect={handleFilterSelect}
                onSearchChange={setSearchQuery}
                searchQuery={searchQuery}
              />
            </div>

            {/* Event Filters with Search pill (desktop) */}
            <div className="w-full hidden lg:block">
              <FilterPills
                filters={filterPills}
                onFilterSelect={handleFilterSelect}
                onSearchChange={setSearchQuery}
                searchQuery={searchQuery}
              />
            </div>

            <div className="w-full max-w-4xl space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">No events found</p>
                    <AddEvent />
                  </div>
                </div>
              ) : (
                displayEvents.map((event, index) => (
                  <EventCard
                    key={event.eventId || index}
                    {...event}
                    event={event}
                    handleSubmit={handleSubmit}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
