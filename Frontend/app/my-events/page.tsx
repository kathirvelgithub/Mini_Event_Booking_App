"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ProtectedRoute from "@/components/auth/protected-route"
import AppLayout from "@/components/layout/app-layout"
import OrganizerEventCard from "@/components/events/organizer-event-card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { Event } from "@/lib/types"
import { Loader2, Calendar, Plus } from "lucide-react"
import { eventsAPI } from "@/lib/api"

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchMyEvents()
  }, [])

  const fetchMyEvents = async () => {
    try {
      const data = await eventsAPI.getMyEvents()
      setEvents(data.events || data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load your events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="organizer">
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">My Events</h1>
                  <p className="text-muted-foreground">Events you&apos;ve created</p>
                </div>
              </div>
            </div>
            <Link href="/create-event">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Loading your events...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Calendar className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No events created yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start creating events to bring people together and manage your audience
                </p>
              </div>
              <Link href="/create-event">
                <Button className="gap-2 mt-4">
                  <Plus className="w-4 h-4" />
                  Create Your First Event
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {events.length} {events.length === 1 ? "event" : "events"} created
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <OrganizerEventCard key={event._id} event={event} />
                ))}
              </div>
            </>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
