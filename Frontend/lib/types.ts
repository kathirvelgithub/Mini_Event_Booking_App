export interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  capacity: number
  currentRSVPs: number
  imageUrl?: string
  organizerId: string
  organizerName?: string
  createdAt: string
  updatedAt: string
}

export interface RSVP {
  _id: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  createdAt: string
}
