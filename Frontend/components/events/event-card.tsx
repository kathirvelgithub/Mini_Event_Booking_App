"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, Loader2 } from "lucide-react"
import { getUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import type { Event } from "@/lib/types"
import { format } from "date-fns"
import { eventsAPI } from "@/lib/api"

interface EventCardProps {
  event: Event
  userRSVPStatus?: boolean
  onRSVPUpdate?: () => void
}

export default function EventCard({ event, userRSVPStatus = false, onRSVPUpdate }: EventCardProps) {
  const [isRSVPed, setIsRSVPed] = useState(userRSVPStatus)
  const [loading, setLoading] = useState(false)
  const [currentRSVPs, setCurrentRSVPs] = useState(event.currentRSVPs)
  const { toast } = useToast()
  const user = getUser()

  const isFull = currentRSVPs >= event.capacity
  const capacityPercentage = Math.round((currentRSVPs / event.capacity) * 100)

  const handleRSVP = async () => {
    if (loading) return
    setLoading(true)

    try {
      await eventsAPI.rsvp(event._id)

      setIsRSVPed(true)
      setCurrentRSVPs((prev) => prev + 1)
      toast({
        title: "Success!",
        description: "You have successfully RSVP'd to this event",
      })
      onRSVPUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to RSVP",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRSVP = async () => {
    if (loading) return
    setLoading(true)

    try {
      await eventsAPI.cancelRSVP(event._id)

      setIsRSVPed(false)
      setCurrentRSVPs((prev) => Math.max(0, prev - 1))
      toast({
        title: "RSVP Cancelled",
        description: "Your RSVP has been cancelled",
      })
      onRSVPUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel RSVP",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatEventDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy")
    } catch {
      return dateStr
    }
  }

  return (
    <Card className="overflow-hidden hover:border-purple-300 transition-all duration-300 group hover:shadow-xl bg-white/90 backdrop-blur">
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 overflow-hidden">
        {event.imageUrl ? (
          <img src={event.imageUrl || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-16 h-16 text-white/40" />
          </div>
        )}
        {/* Capacity Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={isFull ? "destructive" : capacityPercentage > 80 ? "default" : "secondary"}
            className="shadow-xl backdrop-blur-sm bg-white/90"
          >
            <Users className="w-3 h-3 mr-1" />
            {currentRSVPs} / {event.capacity}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Event Title */}
        <h3 className="text-xl font-bold line-clamp-2 text-balance group-hover:text-purple-600 transition-colors">
          {event.title}
        </h3>

        {/* Event Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{event.description}</p>

        {/* Event Details */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{formatEventDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-accent" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-chart-3" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        {isRSVPed ? (
          <Button
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            onClick={handleCancelRSVP}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel RSVP"
            )}
          </Button>
        ) : isFull ? (
          <Button variant="secondary" className="w-full" disabled>
            Event Full
          </Button>
        ) : (
          <Button className="w-full" onClick={handleRSVP} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Event"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
