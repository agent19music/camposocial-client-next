"use client"

import { useState, useMemo, useContext, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CircleUser, DollarSign } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EventContext } from "@/context/eventcontext"
import { Home,Calendar, PartyPopper } from "lucide-react";
import Header from "@/components/header"
import SideNav from "@/components/sidenav"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import CommentList from "@/components/comment"
import type { EventComment, EventTicketGroup } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// interface EventCardProps {
//   poster: string
//   username: string
//   userimage: string | null
//   title: string
//   description: string
//   date: string
//   entry_fee: string
//   comments: any[]
//   eventId: string
//   handleSubmit: (e: React.MouseEvent<HTMLButtonElement>, eventId: string, comment: string) => void
//   handlePurchase: (quantity: number) => void
// }
export default function SingleEventCard() {
  const [localCommentText, setLocalCommentText] = useState<string>("")
  const { selectedEvent, addCommentReply, events } = useContext(EventContext)
  const [comments, setComments] = useState<EventComment[]>(selectedEvent?.comments || [])
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [bundleQuantity, setBundleQuantity] = useState<number>(1)
  const [generalQuantity, setGeneralQuantity] = useState<number>(1)
  const router = useRouter()
  const eventId = selectedEvent ? selectedEvent.eventId || selectedEvent.id : ""

  const ticketGroups: EventTicketGroup[] = useMemo(
    () => selectedEvent?.ticketGroups || [],
    [selectedEvent?.ticketGroups]
  )

  useEffect(() => {
    setComments(selectedEvent?.comments || [])
    const firstGroup = selectedEvent?.ticketGroups?.[0]
    setSelectedGroupId(firstGroup ? firstGroup.id || firstGroup.name : "")
    setBundleQuantity(1)
    setGeneralQuantity(1)
  }, [selectedEvent])

  useEffect(() => {
    if (!selectedEvent || !eventId) return
    const latest = events.find(event => (event.eventId || event.id) === eventId)
    if (latest?.comments) {
      setComments(latest.comments)
    }
  }, [events, selectedEvent, eventId])

  const selectedGroup = useMemo(() => {
    return ticketGroups.find(group => (group.id || group.name) === selectedGroupId) || null
  }, [ticketGroups, selectedGroupId])

  const bundlesAvailable = selectedGroup?.quantity ?? 0
  const ticketsPerBundle = selectedGroup?.ticketsPerGroup ?? 1

  function handlePurchase() {
    if (ticketGroups.length > 0) {
      if (!selectedGroup) {
        toast.error("Please select a ticket group")
        return
      }

      if (bundleQuantity < 1 || bundleQuantity > bundlesAvailable) {
        toast.error("Please choose a valid bundle quantity")
        return
      }

      const totalTickets = bundleQuantity * ticketsPerBundle
      const totalPrice = selectedGroup.price * bundleQuantity
      toast.success(`Reserved ${totalTickets} ticket(s) in ${selectedGroup.name}`)
      return
    }

    const basePrice = Number(selectedEvent?.entry_fee || 0)
    if (generalQuantity < 1) {
      toast.error("Please select at least one ticket")
      return
    }

    const totalPrice = basePrice * generalQuantity
    toast.success(`Reserved ${generalQuantity} ticket(s) for KES ${totalPrice.toFixed(2)}`)
  }

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    if (!eventId) return

    if (!localCommentText.trim()) {
      toast.error("Comment cannot be empty")
      return
    }

    if (localCommentText.length > 300) {
      toast.error("Comment is too long (max 300 characters)")
      return
    }

    const newComment = await addCommentReply(eventId, { text: localCommentText.trim() })
    if (newComment) {
      setComments(prev => [...prev, newComment])
      setLocalCommentText("")
    }
  }

  const eventLinks = [
    { 
      label: "Coming Soon", 
      icon: <Home className="h-4 w-4" />,
      onClick: () => router.push("/comingsoon")
    },
    { 
      label: "Social Events", 
      icon: <Calendar className="h-4 w-4" />,
      onClick: () => router.push("/social-events")
    },
    { 
      label: "Fun Events", 
      icon: <PartyPopper className="h-4 w-4" />,
      onClick: () => router.push("/fun-events")
    },
  ];

  if (!selectedEvent) {
    return (
      <div className="container mx-auto p-4">
        <Header/>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Event not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
    <Header/>
    <div className="flex  flex-col md:flex-row">
{/* Left SideNav */}
 <div className="md:w-64 flex-shrink-0">
          <SideNav links = {eventLinks} />
        </div>
    <Card className="my-8 shadow-lg rounded-lg max-w-6xl mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 relative">
            <Image
              src={selectedEvent.poster || '/placeholder-event.jpg'}
              alt={selectedEvent.title || 'Event'}
              width={600}
              height={400}
              className="rounded-lg object-cover w-full h-full"
              priority={true}
            />
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-white bg-opacity-75 rounded-full p-2">
              <Avatar className="w-8 h-8">
                {selectedEvent?.userimage ? (
                  <AvatarImage src={selectedEvent?.userimage} alt={`${selectedEvent?.username}'s avatar`} />
                ) : (
                  <AvatarFallback><CircleUser className="h-5 w-5" /></AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm font-medium">{selectedEvent?.username}</span>
            </div>
          </div>

          <div className="lg:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: ' Helvetica' }}>{selectedEvent?.title}</h1>
              <p className="text mb-6">{selectedEvent?.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <span>Date: {selectedEvent?.date}</span>
                </div>
                <div className="flex items-center">
                  <span>Entry:  KES {selectedEvent?.entry_fee}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: ' Helvetica' }}>Purchase Tickets</h3>
              {ticketGroups.length > 0 ? (
                <div className="space-y-4">
                  <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select ticket group" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketGroups.map(group => (
                        <SelectItem key={group.id || group.name} value={group.id || group.name}>
                          {group.name} · KES {group.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedGroup && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Bundles</span>
                        <Input
                          type="number"
                          min={1}
                          max={Math.max(bundlesAvailable, 1)}
                          value={bundleQuantity}
                          onChange={(e) => setBundleQuantity(Math.max(1, Math.min(Number(e.target.value), Math.max(bundlesAvailable, 1))))}
                        />
                      </div>
                      <div className="rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
                        <p>{bundlesAvailable} bundle(s) available</p>
                        <p>{ticketsPerBundle} ticket(s) per bundle</p>
                      </div>
                    </div>
                  )}

                  {selectedGroup && (
                    <p className="text-sm text-muted-foreground">
                      Total: <span className="font-semibold text-foreground">KES {(selectedGroup.price * bundleQuantity).toFixed(2)}</span> · {bundleQuantity * ticketsPerBundle} ticket(s)
                    </p>
                  )}

                  <Button className="w-full sm:w-auto" onClick={handlePurchase}>
                    Reserve Tickets
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Input
                      className="w-32"
                      type="number"
                      min={1}
                      value={generalQuantity}
                      onChange={(e) => setGeneralQuantity(Math.max(1, Number(e.target.value)))}
                    />
                    <Button onClick={handlePurchase}>
                      Reserve Tickets
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Base price per ticket: <span className="font-semibold text-foreground">KES {selectedEvent?.entry_fee}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-4">Comments</h3>
          <div className="flex items-center mt-4 gap-3">
            <Input
              type="text"
              placeholder="Add a comment..."
              className="flex-grow"
              value={localCommentText}
              onChange={(e) => setLocalCommentText(e.target.value)}
            />
            <Button onClick={handleSubmit}>
              Post
            </Button>
          </div>
          <div className="mt-6">
            <CommentList eventId={eventId} comments={comments} />
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
    </div>
  )
}