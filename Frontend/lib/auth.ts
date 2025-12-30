export interface User {
  id: string
  name: string
  email: string
  role: "attendee" | "organizer"
}

export interface AuthResponse {
  token: string
  user: User
}

// Store auth token in localStorage
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

// Get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

// Remove auth token
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user")
  }
}

// Store user data
export function setUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

// Get user data
export function getUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

// Logout - clear all auth data
export function logout(): void {
  removeAuthToken()
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}

// Get authorization headers for API requests
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}
