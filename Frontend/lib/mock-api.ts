// Mock API for testing without backend
// This simulates backend responses

// Mock user database
const users: any[] = []
const events: any[] = [
  {
    _id: '1',
    title: 'Tech Conference 2024',
    description: 'Join us for an exciting tech conference featuring the latest in web development',
    date: '2024-02-15',
    time: '10:00 AM',
    location: 'New York, NY',
    capacity: 50,
    currentRSVPs: 30,
    imageUrl: '',
    organizerId: 'org1',
    organizerName: 'Tech Events Inc',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Design Workshop',
    description: 'Learn the fundamentals of modern UI/UX design',
    date: '2024-02-20',
    time: '2:00 PM',
    location: 'San Francisco, CA',
    capacity: 30,
    currentRSVPs: 30,
    imageUrl: '',
    organizerId: 'org1',
    organizerName: 'Design Academy',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    title: 'Networking Event',
    description: 'Connect with professionals in your industry',
    date: '2024-02-25',
    time: '6:00 PM',
    location: 'Boston, MA',
    capacity: 60,
    currentRSVPs: 45,
    imageUrl: '',
    organizerId: 'org2',
    organizerName: 'Network Pro',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const rsvps: any[] = []

// Mock API functions
export const mockAPI = {
  // Auth endpoints
  signup: async (data: any) => {
    await delay(500)
    const existing = users.find(u => u.email === data.email)
    if (existing) {
      throw new Error('User already exists')
    }
    const user = {
      id: Date.now().toString(),
      ...data,
    }
    users.push(user)
    return { message: 'User created successfully' }
  },

  login: async (data: any) => {
    await delay(500)
    const user = users.find(u => u.email === data.email && u.password === data.password)
    if (!user) {
      throw new Error('Invalid credentials')
    }
    return {
      token: 'mock_token_' + Date.now(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }
  },

  // Events endpoints
  getEvents: async () => {
    await delay(300)
    return { events }
  },

  createEvent: async (data: any, userId: string) => {
    await delay(500)
    const event = {
      _id: Date.now().toString(),
      ...data,
      currentRSVPs: 0,
      organizerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    events.push(event)
    return { event }
  },

  getMyEvents: async (userId: string) => {
    await delay(300)
    const myEvents = events.filter(e => e.organizerId === userId)
    return { events: myEvents }
  },

  // RSVP endpoints
  rsvp: async (eventId: string, userId: string) => {
    await delay(300)
    const event = events.find(e => e._id === eventId)
    if (!event) throw new Error('Event not found')
    if (event.currentRSVPs >= event.capacity) {
      throw new Error('Event is full')
    }
    
    const existing = rsvps.find(r => r.eventId === eventId && r.userId === userId)
    if (existing) throw new Error('Already RSVPed')

    event.currentRSVPs++
    const rsvp = {
      _id: Date.now().toString(),
      eventId,
      userId,
      createdAt: new Date().toISOString(),
    }
    rsvps.push(rsvp)
    return { message: 'RSVP successful', rsvp }
  },

  cancelRSVP: async (eventId: string, userId: string) => {
    await delay(300)
    const rsvpIndex = rsvps.findIndex(r => r.eventId === eventId && r.userId === userId)
    if (rsvpIndex === -1) throw new Error('RSVP not found')
    
    const event = events.find(e => e._id === eventId)
    if (event) event.currentRSVPs = Math.max(0, event.currentRSVPs - 1)
    
    rsvps.splice(rsvpIndex, 1)
    return { message: 'RSVP cancelled' }
  },

  getMyRSVPs: async (userId: string) => {
    await delay(300)
    const myRSVPs = rsvps.filter(r => r.userId === userId)
    const rsvpEvents = myRSVPs.map(r => {
      const event = events.find(e => e._id === r.eventId)
      return { ...r, event }
    })
    return { rsvps: rsvpEvents }
  },
}

// Helper to simulate network delay
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
