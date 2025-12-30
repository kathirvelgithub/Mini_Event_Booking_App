# Quick Reference Guide - Frontend UI Flow

## 🎯 At a Glance

Your Mini Event Booking Platform frontend **perfectly implements** the UI flow specification. Here's what works:

### ✅ What's Working

| Feature | Status | File |
|---------|--------|------|
| User Sign Up | ✅ Complete | `components/auth/signup.tsx` |
| User Login | ✅ Complete | `components/auth/login.tsx` |
| Dashboard | ✅ Complete | `app/dashboard/page.tsx` |
| Browse Events | ✅ Complete | Event Cards |
| RSVP to Events | ✅ Complete | `event-card.tsx` |
| Cancel RSVP | ✅ Complete | `event-card.tsx` |
| Event Full Logic | ✅ Complete | Capacity checking |
| My RSVPs | ✅ Complete | `app/my-rsvps/page.tsx` |
| My Events (Org) | ✅ Complete | `app/my-events/page.tsx` |
| Create Event (Org) | ✅ Complete | `app/create-event/page.tsx` |
| Role-Based Access | ✅ Complete | `protected-route.tsx` |
| Logout | ✅ Complete | Navbar |

---

## 👥 User Roles & Permissions

### Attendee
```
Sign Up/Login ✅
Dashboard (Browse Events) ✅
RSVP/Cancel RSVP ✅
My RSVPs ✅
My Events ❌ (Hidden)
Create Event ❌ (Hidden)
```

### Organizer
```
Sign Up/Login ✅
Dashboard (Browse Events) ✅
RSVP/Cancel RSVP ✅
My RSVPs ✅
My Events ✅ (Visible, Shows Stats)
Create Event ✅ (Visible, Blue Button)
```

---

## 🗺️ Navigation Map

### Public Pages
```
/ (Home)
  ├─ /login
  └─ /signup
```

### Protected Pages
```
/dashboard (All Users)
  ├─ /my-rsvps (All Users)
  ├─ /my-events (Organizers Only)
  └─ /create-event (Organizers Only)
```

---

## 📱 Key UI Components

### Event Card (Attendee View)
```
┌─ Image/Gradient
├─ Title
├─ Description
├─ 📅 Date
├─ ⏰ Time
├─ 📍 Location
├─ 👥 Capacity Badge (30/50)
└─ [RSVP / Cancel RSVP] Button
```

### Event Card (Organizer View)
```
┌─ Image/Gradient
├─ Title
├─ Description
├─ 📅 Date
├─ ⏰ Time
├─ 📍 Location
├─ 👥 Capacity Badge (30/50)
└─ RSVPs: 30/50 (Stats Footer)
```

---

## 🎨 State Management

### Authentication
```typescript
// Stored in localStorage
{
  auth_token: "jwt_token_here",
  user: {
    id: "user_id",
    name: "John Doe",
    email: "john@email.com",
    role: "attendee" | "organizer"
  }
}
```

### Component State
- `events[]` - List of events
- `userRSVPs` - Set of event IDs user has RSVPed to
- `loading` - Boolean for loading state
- `currentRSVPs` - Count of RSVPs per event

---

## 🔄 API Endpoints Expected

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/auth/signup` | POST | Register user | Works |
| `/auth/login` | POST | Login user | Works |
| `/events` | GET | List all events | Works |
| `/events/{id}/rsvp` | POST | Join event | Works |
| `/events/{id}/rsvp` | DELETE | Leave event | Works |
| `/events` | POST | Create event | Works |
| `/rsvps/my-rsvps` | GET | User's RSVPs | Works |
| `/events/my-events` | GET | Org's events | Works |

---

## 🎯 RSVP Flow

### Step 1: User views event
```
Event shows "RSVP" button
Capacity: 30/50
Button: Enabled
```

### Step 2: User clicks RSVP
```
POST /api/events/{eventId}/rsvp
Loading: Show spinner
```

### Step 3: Success
```
Capacity: 31/50
Button: "Cancel RSVP"
Toast: "Successfully RSVP'd"
onRSVPUpdate callback
```

### Step 4: User cancels RSVP
```
DELETE /api/events/{eventId}/rsvp
Loading: Show spinner
```

### Step 5: Success
```
Capacity: 30/50
Button: "RSVP"
Toast: "RSVP cancelled"
onRSVPUpdate callback
```

---

## 🎯 Event Creation Flow (Organizer)

```
Step 1: Click "Create Event" button
  ↓
Step 2: Fill form
  - Title
  - Description
  - Date
  - Time
  - Location
  - Capacity
  - Image URL (optional)
  ↓
Step 3: Click "Create Event" button
  ↓
Step 4: Form validates
  - Check required fields
  - Check capacity > 0
  ↓
Step 5: Submit POST /api/events
  ↓
Step 6: Loading state shown
  ↓
Step 7: Success
  - Toast notification
  - Redirect to /my-events
  - Event appears in list
  ↓
Step 8: View on My Events
  - Shows RSVP count
  - Shows capacity
  - Can view attendees (future)
```

---

## 🚨 Error Handling

### Network Errors
```
Try-catch block catches error
Toast shows: "Error: [error message]"
User can retry action
```

### Validation Errors
```
Form validation before submit
Toast shows: "Invalid Capacity: ..."
Form prevents submission
```

### Auth Errors
```
Token expired → Redirect to /login
Wrong role → Redirect to /dashboard
Not authenticated → Redirect to /login
```

---

## 💾 Local Storage Structure

```javascript
{
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": "{\"id\":\"123\",\"name\":\"John\",\"email\":\"john@email.com\",\"role\":\"attendee\"}"
}
```

---

## 🎨 Responsive Breakpoints

| Device | Grid Columns | View |
|--------|-------------|------|
| Mobile | 1 | Single column |
| Tablet | 2 | Two columns |
| Desktop | 3 | Three columns |

---

## 🔐 Protected Routes

### Attendee Can Access
```
✅ /dashboard
✅ /my-rsvps
❌ /my-events → Redirects to /dashboard
❌ /create-event → Redirects to /dashboard
```

### Organizer Can Access
```
✅ /dashboard
✅ /my-rsvps
✅ /my-events
✅ /create-event
```

---

## 🎭 Component Props

### EventCard Props
```typescript
{
  event: Event              // Event object
  userRSVPStatus?: boolean  // Is user already RSVP'd?
  onRSVPUpdate?: () => void // Callback after RSVP change
}
```

### OrganizerEventCard Props
```typescript
{
  event: Event  // Event object
}
```

### ProtectedRoute Props
```typescript
{
  children: ReactNode
  requiredRole?: "attendee" | "organizer"
}
```

---

## 🌐 Environment Variables

```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional (has defaults)
# NODE_ENV=development
```

---

## 📊 Data Models

### User
```typescript
{
  id: string
  name: string
  email: string
  role: "attendee" | "organizer"
}
```

### Event
```typescript
{
  _id: string
  title: string
  description: string
  date: string              // ISO date
  time: string              // HH:MM format
  location: string
  capacity: number          // Max attendees
  currentRSVPs: number      // Current attendees
  imageUrl?: string
  organizerId: string       // Creator's ID
  organizerName?: string
  createdAt: string
  updatedAt: string
}
```

### RSVP
```typescript
{
  _id: string
  eventId: string
  userId: string
  userName: string
  userEmail: string
  createdAt: string
}
```

---

## 🎯 Common Tasks

### Login an Attendee
```
1. Go to /login
2. Email: attendee@email.com
3. Password: password123
4. Click "Log In"
5. Redirected to /dashboard
```

### Login as Organizer
```
1. Go to /login
2. Email: organizer@email.com
3. Password: password123
4. Click "Log In"
5. Redirected to /dashboard
6. See "Create Event" button
```

### RSVP to Event
```
1. Navigate to /dashboard
2. Find event card
3. Click "RSVP" button
4. See success toast
5. Button changes to "Cancel RSVP"
6. Capacity increments
```

### Create Event (Organizer)
```
1. Navigate to /create-event
2. Fill all form fields
3. Enter capacity (must be > 0)
4. Click "Create Event"
5. Success message
6. Redirect to /my-events
7. New event appears
```

### View My RSVPs
```
1. Navigate to /my-rsvps
2. See all events you RSVP'd to
3. Can cancel RSVP from here
4. Shows count of RSVPs
```

### View My Events (Organizer)
```
1. Navigate to /my-events
2. See all events you created
3. See RSVP count for each
4. Can create new event
5. Shows "Create Your First Event" if empty
```

---

## 🎨 Color/Status Reference

### Capacity Badge Colors
```
0-79% full   → Secondary badge (gray/blue)
80-99% full  → Default badge (orange/yellow)
100% full    → Destructive badge (red)
```

### Button States
```
Enabled     → Clickable, color visible
Disabled    → Grayed out, not clickable
Loading     → Spinner shown, disabled
Hover       → Color changes, shadow effect
```

---

## 🐛 Debugging Tips

### Check Auth Status
```javascript
// In browser console
localStorage.getItem('auth_token')      // Check token
localStorage.getItem('user')            // Check user data
```

### Check Current User
```typescript
import { getUser } from '@/lib/auth'
const user = getUser()
console.log(user.role)  // "attendee" or "organizer"
```

### Check API Calls
```
Open DevTools → Network tab
Look for requests to /api/events, /api/auth/*, etc.
Check response status and data
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Can't login | Check API URL in `.env.local` |
| Routes not working | Check if backend API is running |
| No events showing | Check `/api/events` endpoint |
| RSVP not working | Check auth token is set |
| Can't create event | Check user role = "organizer" |

---

## 🚀 Running the App

```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev

# Build for production
npm run build

# Start production server
npm start
```

**Access:** http://localhost:3000

---

## ✨ Features Summary

✅ User Authentication (Sign Up, Login, Logout)
✅ Two Roles (Attendee, Organizer)
✅ Event Browsing & Discovery
✅ RSVP Management (Join/Leave events)
✅ Capacity Tracking & Full Event Handling
✅ Event Creation (Organizers only)
✅ My RSVPs Page (View all RSVPed events)
✅ My Events Page (View created events)
✅ Role-Based Access Control
✅ Responsive Design (Mobile/Tablet/Desktop)
✅ Loading & Empty States
✅ Error Handling & Toast Notifications
✅ Professional UI with Radix Components

---

## 🎉 Status

**Frontend Status: 100% COMPLETE** ✅

All features from the UI flow specification are implemented, working, and production-ready!
