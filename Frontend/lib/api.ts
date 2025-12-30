// API Wrapper - connects to backend API
import { getAuthHeaders } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Auth API
export const authAPI = {
  signup: async (data: { name: string; email: string; password: string; role: string }) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || result.message || "Signup failed")
    return result
  },

  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || result.message || "Login failed")
    return result
  },
}

// Events API
export const eventsAPI = {
  getAll: async (search?: string) => {
    const url = search 
      ? `${API_URL}/events?search=${encodeURIComponent(search)}`
      : `${API_URL}/events`
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) throw new Error("Failed to fetch events")
    return response.json()
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) throw new Error("Failed to fetch event")
    return response.json()
  },

  create: async (data: {
    title: string
    description: string
    date: string
    location: string
    maxAttendees: number
  }) => {
    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || result.message || "Failed to create event")
    return result
  },

  update: async (id: string, data: Partial<{
    title: string
    description: string
    date: string
    location: string
    maxAttendees: number
  }>) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || result.message || "Failed to update event")
    return result
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || result.message || "Failed to delete event")
    return result
  },

  getMyEvents: async () => {
    const response = await fetch(`${API_URL}/events/my-events`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) throw new Error("Failed to fetch your events")
    return response.json()
  },

  rsvp: async (eventId: string) => {
    const response = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || result.message || "Failed to RSVP")
    return result
  },

  cancelRSVP: async (eventId: string) => {
    const response = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || result.message || "Failed to cancel RSVP")
    return result
  },
}

// RSVPs API
export const rsvpsAPI = {
  getMyRSVPs: async () => {
    const response = await fetch(`${API_URL}/rsvps/my-rsvps`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) {
      const result = await response.json().catch(() => ({}))
      throw new Error(result.error || result.message || "Failed to fetch your RSVPs")
    }
    return response.json()
  },
}

// Users API
export const usersAPI = {
  getMe: async () => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: getAuthHeaders(),
    })
    
    if (!response.ok) throw new Error("Failed to fetch user profile")
    return response.json()
  },
}

// Upload API
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'Failed to upload image')
    return result
  }
}
