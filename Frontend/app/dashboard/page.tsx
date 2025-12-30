"use client"

import { useEffect, useState, useCallback } from "react"
import ProtectedRoute from "@/components/auth/protected-route"
import AppLayout from "@/components/layout/app-layout"
import EventCard from "@/components/events/event-card"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Event } from "@/lib/types"
import { Loader2, Search, X } from "lucide-react"
import { eventsAPI, rsvpsAPI } from "@/lib/api"
import { getUser, logout } from "@/lib/auth"

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [userRSVPs, setUserRSVPs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const { toast } = useToast()

  const fetchEvents = useCallback(async (search?: string) => {
    try {
      if (search) setSearchLoading(true)
      const data = await eventsAPI.getAll(search)
      setEvents(data.events || data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setSearchLoading(false)
    }
  }, [toast])

  const fetchUserRSVPs = useCallback(async () => {
    const user = getUser()
    if (!user) return
    
    try {
      const data = await rsvpsAPI.getMyRSVPs()
      const rsvpEventIds = new Set((data.rsvps || data).map((rsvp: any) => rsvp.eventId || rsvp.event?._id))
      setUserRSVPs(rsvpEventIds)
    } catch (error: any) {
      // If user not found, clear auth and redirect to login
      if (error.message?.includes("User not found") || error.message?.includes("Invalid token")) {
        logout()
        return
      }
      // Silently fail for other errors - not critical
      console.error("Failed to fetch user RSVPs:", error)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
    fetchUserRSVPs()
  }, [fetchEvents, fetchUserRSVPs])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents(searchQuery || undefined)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery, fetchEvents])

  const handleRSVPUpdate = () => {
    fetchEvents(searchQuery || undefined)
    fetchUserRSVPs()
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Discover Events</h1>
            <p className="text-muted-foreground">Browse and RSVP to upcoming events in your area</p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-11 bg-white/80 border-purple-200 focus:border-purple-400"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Results Info */}
          {searchQuery && !loading && (
            <p className="text-sm text-muted-foreground">
              {searchLoading ? (
                "Searching..."
              ) : (
                <>Found {events.length} event{events.length !== 1 ? 's' : ''} for "{searchQuery}"</>
              )}
            </p>
          )}

          {/* Events Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <span className="text-3xl">{searchQuery ? "🔍" : "📅"}</span>
              </div>
              <h3 className="text-xl font-semibold">
                {searchQuery ? "No events found" : "No events yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No events match "${searchQuery}". Try a different search term.`
                  : "Check back later for upcoming events"
                }
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={clearSearch}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  userRSVPStatus={userRSVPs.has(event._id)}
                  onRSVPUpdate={handleRSVPUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
