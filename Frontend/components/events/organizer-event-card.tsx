"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import type { Event } from "@/lib/types"
import { format } from "date-fns"

interface OrganizerEventCardProps {
  event: Event
}

export default function OrganizerEventCard({ event }: OrganizerEventCardProps) {
  const isFull = event.currentRSVPs >= event.capacity
  const capacityPercentage = Math.round((event.currentRSVPs / event.capacity) * 100)

  const formatEventDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy")
    } catch {
      return dateStr
    }
  }

  return (
    <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300">
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-accent/10 to-background overflow-hidden">
        {event.imageUrl ? (
          <img src={event.imageUrl || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        {/* Capacity Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            variant={isFull ? "destructive" : capacityPercentage > 80 ? "default" : "secondary"}
            className="shadow-lg"
          >
            <Users className="w-3 h-3 mr-1" />
            {event.currentRSVPs} / {event.capacity}
          </Badge>
        </div>
      </div>

      <CardContent className="p-5 space-y-3">
        {/* Event Title */}
        <h3 className="text-lg font-semibold line-clamp-2 text-balance">{event.title}</h3>

        {/* Event Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

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

      <CardFooter className="p-5 pt-0 bg-secondary/30">
        <div className="w-full flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total RSVPs:</span>
          <span className="font-semibold text-primary">
            {event.currentRSVPs} / {event.capacity}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
