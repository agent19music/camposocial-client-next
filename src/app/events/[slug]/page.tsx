"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useContext } from "react"
import { EventContext } from "@/context/eventcontext"
import { Home,Calendar, PartyPopper, Repeat2, Share2 } from "lucide-react";
import Header from "@/components/header"
import SideNav from "@/components/sidenav"

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
interface Comment{
  id : string
  username : string
  userimage: string
  dateCreated : string
  text : string
  image : string

}


export default function SingleEventCard() {
  const [localCommentText, setLocalCommentText] = useState<string>("")
  const [ticketQuantity, setTicketQuantity] = useState<string>("1")
  const {selectedEvent} = useContext(EventContext)
function handlePurchase (ticketQuantity:number){
  console.log(`paid !!${ticketQuantity}`)
}
const [comments, setComments] = useState(selectedEvent.comments)

const eventLinks = [
  { href: "/comingsoon", label: "Coming Soon", icon: <Home className="h-4 w-4" /> },
  { href: "/social-events", label: "Social Events", icon: <Calendar className="h-4 w-4" /> },
  { href: "/fun-events", label: "Fun Events", icon: <PartyPopper className="h-4 w-4" /> },
];

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
              src={selectedEvent?.poster}
              alt={selectedEvent.title}
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
              <h1 className="text-3xl font-bold mb-4">{selectedEvent?.title}</h1>
              <p className="text-gray-700 mb-6">{selectedEvent?.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <span>Date: {selectedEvent?.date}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>Entry: {selectedEvent?.entry_fee}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Purchase Tickets</h3>
              <div className="flex items-center space-x-4 mb-4">
                <Select
                  value={ticketQuantity}
                  onValueChange={(value) => setTicketQuantity(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Ticket</SelectItem>
                    <SelectItem value="5">5 Tickets (Group)</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => handlePurchase(parseInt(ticketQuantity))}>
                  Purchase Tickets
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-4">Comments</h3>
          <div className="flex items-center mt-4">
            <Input
              type="text"
              placeholder="Add a comment..."
              className="flex-grow"
              value={localCommentText}
              onChange={(e) => setLocalCommentText(e.target.value)}
            />
            <Button
              className="ml-4"
              onClick={(e) => {
                handleSubmit(e, eventId, localCommentText)
                setLocalCommentText('')
              }}
            >
              Post
            </Button>
          </div>
          {comments.map((comment:Comment, index) => (
  <div key={index} className="mb-4 p-4  rounded-lg">
    <div className="flex items-center space-x-4">
      <Avatar>
        {comment.image ? (
          <AvatarImage src={comment.image} alt={`${comment.username}'s avatar`} />
        ) : (
          <AvatarFallback>{comment.username.charAt(0)}</AvatarFallback>
        )}
      </Avatar>
      <span className="font-medium">{comment.username}</span>
    </div>
    <p className="mt-2">{comment.text}</p> {/* Accessing the text property */}
    <span className="text-sm text-gray-500">{comment.dateCreated}</span>
  </div>
))}

          
        </div>
      </CardContent>
    </Card>
    </div>
    </div>
  )
}