"use client"

import { useEffect, useState } from "react"
import ProtectedRoute from "@/components/auth/protected-route"
import AppLayout from "@/components/layout/app-layout"
import EventCard from "@/components/events/event-card"
import { useToast } from "@/hooks/use-toast"
import type { Event } from "@/lib/types"
import { Loader2, Ticket } from "lucide-react"
import { rsvpsAPI } from "@/lib/api"

export default function MyRSVPsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchMyRSVPs()
  }, [])

  const fetchMyRSVPs = async () => {
    try {
      const data = await rsvpsAPI.getMyRSVPs()
      // The API might return RSVPs with populated event data
      const eventData = (data.rsvps || data).map((rsvp: any) => rsvp.event || rsvp).filter(Boolean)
      setEvents(eventData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load your RSVPs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRSVPUpdate = () => {
    fetchMyRSVPs()
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My RSVPs</h1>
                <p className="text-muted-foreground">Events you&apos;ve signed up for</p>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Loading your RSVPs...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Ticket className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No RSVPs yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  You haven&apos;t RSVP&apos;d to any events. Browse the events dashboard to find something interesting!
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {events.length} {events.length === 1 ? "event" : "events"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} userRSVPStatus={true} onRSVPUpdate={handleRSVPUpdate} />
                ))}
              </div>
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
