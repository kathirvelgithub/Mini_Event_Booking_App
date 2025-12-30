"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, LogOut, Plus, User, Ticket, CalendarDays } from "lucide-react"
import { getUser, removeAuthToken } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const user = getUser()

  const handleLogout = () => {
    removeAuthToken()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    router.push("/login")
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b border-border/30 backdrop-blur-md bg-white/80 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">EventHub</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant={isActive("/dashboard") ? "secondary" : "ghost"} size="sm" className="gap-2">
                <CalendarDays className="w-4 h-4" />
                Events
              </Button>
            </Link>

            <Link href="/my-rsvps">
              <Button variant={isActive("/my-rsvps") ? "secondary" : "ghost"} size="sm" className="gap-2">
                <Ticket className="w-4 h-4" />
                My RSVPs
              </Button>
            </Link>

            {user?.role === "organizer" && (
              <>
                <Link href="/my-events">
                  <Button variant={isActive("/my-events") ? "secondary" : "ghost"} size="sm" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    My Events
                  </Button>
                </Link>
                <Link href="/create-event">
                  <Button size="sm" className="gap-2 ml-2">
                    <Plus className="w-4 h-4" />
                    Create Event
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.name || "User"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-primary font-medium capitalize">{user?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="md:hidden">
                <Link href="/dashboard">
                  <DropdownMenuItem>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Events
                  </DropdownMenuItem>
                </Link>
                <Link href="/my-rsvps">
                  <DropdownMenuItem>
                    <Ticket className="w-4 h-4 mr-2" />
                    My RSVPs
                  </DropdownMenuItem>
                </Link>
                {user?.role === "organizer" && (
                  <>
                    <Link href="/my-events">
                      <DropdownMenuItem>
                        <Calendar className="w-4 h-4 mr-2" />
                        My Events
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/create-event">
                      <DropdownMenuItem>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
