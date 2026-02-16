'use client'

import { useContext, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useEventContext } from "@/context/eventcontext"
import { toast } from 'react-hot-toast'
import { AuthContext } from "@/context/authcontext"
import { EventTicketGroupInput } from '@/types'
import { PlusCircle, Trash2 } from 'lucide-react'

export default function AddEvent() {
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined)
  const [posterImage, setPosterImage] = useState<string | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [category, setCategory] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('')
  const [endTime, setEndTime] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addEvent } = useEventContext()
  const { currentUser } = useContext(AuthContext)
  const [ticketGroups, setTicketGroups] = useState<EventTicketGroupInput[]>([])
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPosterFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPosterImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        )
      }
    }
    return options
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!eventDate) {
      toast.error('Please select an event date')
      return
    }

    if (!startTime || !endTime) {
      toast.error('Please select start and end times')
      return
    }

    if (!category) {
      toast.error('Please select a category')
      return
    }

    setIsSubmitting(true)

    const formData = new FormData(e.target as HTMLFormElement)

    const maxQuantityPerGroup = ticketGroups.reduce((acc, group) => {
      const perGroup = Math.max(1, group.ticketsPerGroup || 1)
      return acc + group.quantity * perGroup
    }, 0)

    if (ticketGroups.length > 0 && maxQuantityPerGroup <= 0) {
      toast.error('Please ensure ticket groups have available tickets')
      setIsSubmitting(false)
      return
    }

    // Format the date as YYYY-MM-DD
    const formattedDate = eventDate.toISOString().split('T')[0]

    // Convert 24-hour time to 12-hour format with AM/PM as expected by backend
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour}:${minutes} ${ampm}`
    }

    const event = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      date_of_event: formattedDate,
      start_time: formatTime(startTime),
      end_time: formatTime(endTime),
      entry_fee: parseFloat(formData.get('entryFee') as string) || 0,
      category: category,
      location: formData.get('location') as string,
      poster: posterImage || '',
      posterFile: posterFile, // Include the actual file for upload
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: currentUser?.id as string,
      comments: [],
      ticketGroups,
    }

    try {
      const success = await addEvent(event)
      if (success) {
        // Reset form
        setEventDate(undefined)
        setPosterImage(null)
        setPosterFile(null)
        setCategory('')
        setStartTime('')
        setEndTime('')
        setIsOpen(false)
        setTicketGroups([])

        toast.success('Event added successfully')
      } else {
        toast.error('Failed to add event. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting event:', error)
      toast.error('Failed to add event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button >Add Event</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-2xl max-w-[90vw] max-h-[75vh] overflow-y-auto fixed top-[8%] left-1/2 -translate-x-1/2 translate-y-0 sm:top-1/2 sm:-translate-y-1/2">
        <Card className="w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add New Event</DialogTitle>
          </DialogHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" name="title" placeholder="Enter event title" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Enter event description" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fun">Fun</SelectItem>
                    <SelectItem value="Educational">Educational</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime} required>
                    <SelectTrigger id="startTime">
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions()}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime} required>
                    <SelectTrigger id="endTime">
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions()}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Enter event location" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryFee">Base Entry Fee</Label>
                <Input id="entryFee" name="entryFee" type="number" placeholder="Enter entry fee" min="0" step="0.01" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ticket_link">Ticket Purchase Link (optional)</Label>
                <Input
                  id="ticket_link"
                  name="ticket_link"
                  type="url"
                  placeholder="https://ticketplatform.com/your-event"
                />
                <p className="text-xs text-muted-foreground">
                  External link where attendees can purchase tickets
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="poster">Event Poster</Label>
                <Input id="poster" name="poster" type="file" accept="image/*" onChange={handleImageChange} />
                {posterImage && (
                  <div className="mt-2">
                    <Image src={posterImage} alt="Event poster preview" width={200} height={200} className="rounded-md" />
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Adding Event...' : 'Add Event'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}