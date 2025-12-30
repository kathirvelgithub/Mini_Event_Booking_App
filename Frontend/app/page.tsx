"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Sparkles, LogOut } from "lucide-react"
import { isAuthenticated, removeAuthToken } from "@/lib/auth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    setIsAuth(isAuthenticated())
  }, [])

  const handleLogout = () => {
    removeAuthToken()
    setIsAuth(false)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-md bg-white/80 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">EventHub</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuth ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="hover:bg-purple-100">Dashboard</Button>
                </Link>
                <Button variant="outline" onClick={handleLogout} className="gap-2 border-purple-200 hover:bg-purple-50">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="hover:bg-purple-100">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 text-sm font-medium shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Discover amazing events near you</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance">
            Find Events That <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">Inspire You</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto text-balance leading-relaxed">
            Join thousands of people discovering and creating memorable experiences. Whether you&apos;re an attendee or
            organizer, EventHub has you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            {isAuth ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-10 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 py-6 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-sm transition-all">
                    Browse Events
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 bg-white/50 backdrop-blur-sm">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for both attendees and organizers
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group text-center space-y-4 p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Discover Events</h3>
            <p className="text-gray-600 leading-relaxed">
              Browse through hundreds of events and find the perfect one for you
            </p>
          </div>

          <div className="group text-center space-y-4 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Easy RSVP</h3>
            <p className="text-gray-600 leading-relaxed">
              Reserve your spot with one click and manage your RSVPs effortlessly
            </p>
          </div>

          <div className="group text-center space-y-4 p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Create Events</h3>
            <p className="text-gray-600 leading-relaxed">
              Become an organizer and host your own events with our easy-to-use tools
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-200 mt-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Calendar className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg p-1 text-white" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">EventHub</span>
          </div>
          <p className="text-gray-600">&copy; 2025 EventHub. Built with the MERN stack.</p>
        </div>
      </footer>
    </div>
  )
}
