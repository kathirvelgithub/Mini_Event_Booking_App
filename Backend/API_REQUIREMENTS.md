# Backend API Requirements & Logic

## Overview
This document outlines all API endpoints, request/response formats, and backend logic required for the Event Booking Platform frontend.

**Base URL**: `http://localhost:5000/api`  
**Authentication**: JWT Bearer Token (stored in localStorage as `token`)

---

## 📋 Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Event Endpoints](#event-endpoints)
3. [RSVP Endpoints](#rsvp-endpoints)
4. [User Endpoints](#user-endpoints)
5. [Database Schema](#database-schema)
6. [Business Logic Rules](#business-logic-rules)
7. [Error Handling](#error-handling)

---

## 🔐 Authentication Endpoints

### 1. POST `/auth/signup`
**Description**: Register a new user (attendee or organizer)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "attendee" // or "organizer"
}
```

**Success Response** (201):
```json
{
  "message": "User created successfully"
}
```

**Backend Logic**:
- Validate all required fields
- Check if email already exists
- Hash password using bcrypt (salt rounds: 10)
- Create user document in database
- Set default role to "attendee" if not provided
- Return success message

**Validation Rules**:
- Email must be valid format and unique
- Password minimum length: 6 characters
- Name is required
- Role must be either "attendee" or "organizer"

---

### 2. POST `/auth/login`
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "attendee"
  }
}
```

**Backend Logic**:
- Find user by email
- Compare password with hashed password using bcrypt
- Generate JWT token with payload: `{ userId: user._id, role: user.role }`
- Token expiration: 7 days
- Return token and user object (exclude password)

**JWT Configuration**:
- Secret: Use environment variable `JWT_SECRET`
- Algorithm: HS256
- Expiration: 7d

---

## 📅 Event Endpoints

### 3. GET `/events`
**Description**: Fetch all events (public access)

**Query Parameters**:
- None required

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Tech Meetup 2025",
    "description": "Join us for an exciting tech meetup...",
    "date": "2025-01-15T18:00:00.000Z",
    "location": "San Francisco Convention Center",
    "organizer": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "attendees": [],
    "maxAttendees": 100,
    "currentAttendees": 45,
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-28T15:30:00.000Z"
  }
]
```

**Backend Logic**:
- Fetch all events from database
- Sort by date (ascending - upcoming first)
- Populate organizer details (name, email)
- Calculate `currentAttendees` count from RSVPs
- Return array of events

---

### 4. POST `/events`
**Description**: Create a new event (organizers only)

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "title": "Tech Meetup 2025",
  "description": "Join us for an exciting tech meetup...",
  "date": "2025-01-15T18:00:00.000Z",
  "location": "San Francisco Convention Center",
  "maxAttendees": 100
}
```

**Success Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Tech Meetup 2025",
  "description": "Join us for an exciting tech meetup...",
  "date": "2025-01-15T18:00:00.000Z",
  "location": "San Francisco Convention Center",
  "organizer": "507f1f77bcf86cd799439012",
  "attendees": [],
  "maxAttendees": 100,
  "currentAttendees": 0,
  "createdAt": "2024-12-30T10:00:00.000Z",
  "updatedAt": "2024-12-30T10:00:00.000Z"
}
```

**Backend Logic**:
- Verify JWT token and extract user ID
- Check if user role is "organizer"
- Validate all required fields
- Date must be in the future
- Set organizer to authenticated user ID
- Create event document
- Return created event

**Authorization**:
- Only users with role "organizer" can create events
- Return 403 Forbidden if user is "attendee"

---

### 5. PUT `/events/:id`
**Description**: Update an existing event (organizer who created it only)

**Authentication**: Required (Bearer Token)

**Request Body** (all fields optional):
```json
{
  "title": "Updated Tech Meetup 2025",
  "description": "Updated description...",
  "date": "2025-01-16T18:00:00.000Z",
  "location": "Updated Location",
  "maxAttendees": 150
}
```

**Success Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Updated Tech Meetup 2025",
  "description": "Updated description...",
  "date": "2025-01-16T18:00:00.000Z",
  "location": "Updated Location",
  "organizer": "507f1f77bcf86cd799439012",
  "attendees": ["507f1f77bcf86cd799439013"],
  "maxAttendees": 150,
  "currentAttendees": 1,
  "createdAt": "2024-12-30T10:00:00.000Z",
  "updatedAt": "2024-12-30T12:00:00.000Z"
}
```

**Backend Logic**:
- Verify JWT token and extract user ID
- Find event by ID
- Check if authenticated user is the organizer of this event
- Update only provided fields
- Return updated event

**Authorization**:
- Only the organizer who created the event can update it
- Return 403 Forbidden if user is not the organizer

---

### 6. DELETE `/events/:id`
**Description**: Delete an event (organizer who created it only)

**Authentication**: Required (Bearer Token)

**Success Response** (200):
```json
{
  "message": "Event deleted successfully"
}
```

**Backend Logic**:
- Verify JWT token and extract user ID
- Find event by ID
- Check if authenticated user is the organizer of this event
- Delete all associated RSVPs
- Delete event document
- Return success message

**Authorization**:
- Only the organizer who created the event can delete it
- Return 403 Forbidden if user is not the organizer

**Side Effects**:
- All RSVPs for this event should be deleted (cascade delete)

---

## 🎫 RSVP Endpoints

### 7. POST `/rsvps`
**Description**: RSVP to an event (attendees only)

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "eventId": "507f1f77bcf86cd799439011"
}
```

**Success Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "event": "507f1f77bcf86cd799439011",
  "user": "507f1f77bcf86cd799439013",
  "status": "confirmed",
  "createdAt": "2024-12-30T12:00:00.000Z"
}
```

**Backend Logic**:
- Verify JWT token and extract user ID
- Check if user role is "attendee"
- Find event by eventId
- Check if event exists and is not in the past
- Check if event has reached max capacity
- Check if user has already RSVP'd to this event
- Create RSVP document
- Add user to event's attendees array
- Return created RSVP

**Validation Rules**:
- User must be an "attendee" (not organizer)
- Event must exist and be in the future
- Event must not be at max capacity
- User cannot RSVP twice to the same event
- Return appropriate error messages for each case

---

### 8. DELETE `/rsvps/:eventId`
**Description**: Cancel RSVP to an event

**Authentication**: Required (Bearer Token)

**Success Response** (200):
```json
{
  "message": "RSVP cancelled successfully"
}
```

**Backend Logic**:
- Verify JWT token and extract user ID
- Find RSVP by eventId and userId
- Delete RSVP document
- Remove user from event's attendees array
- Return success message

**Validation Rules**:
- User can only cancel their own RSVPs
- RSVP must exist

---

### 9. GET `/rsvps/user`
**Description**: Get all RSVPs for authenticated user

**Authentication**: Required (Bearer Token)

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "event": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Tech Meetup 2025",
      "description": "Join us for an exciting tech meetup...",
      "date": "2025-01-15T18:00:00.000Z",
      "location": "San Francisco Convention Center",
      "organizer": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith"
      },
      "maxAttendees": 100,
      "currentAttendees": 45
    },
    "status": "confirmed",
    "createdAt": "2024-12-30T12:00:00.000Z"
  }
]
```

**Backend Logic**:
- Verify JWT token and extract user ID
- Find all RSVPs where user matches authenticated user
- Populate event details (title, date, location, organizer)
- Sort by event date (ascending)
- Return array of RSVPs

---

## 👤 User Endpoints

### 10. GET `/users/me`
**Description**: Get authenticated user's profile

**Authentication**: Required (Bearer Token)

**Success Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "attendee",
  "createdAt": "2024-11-01T10:00:00.000Z"
}
```

**Backend Logic**:
- Verify JWT token and extract user ID
- Find user by ID
- Return user object (exclude password)

---

## 💾 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: ['attendee', 'organizer'], default: 'attendee'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes**:
- `email`: unique index

---

### Events Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  date: Date (required),
  location: String (required),
  organizer: ObjectId (ref: 'User', required),
  attendees: [ObjectId] (ref: 'User', default: []),
  maxAttendees: Number (required, min: 1),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Virtual Fields**:
- `currentAttendees`: Calculated from attendees array length

**Indexes**:
- `date`: ascending index for sorting
- `organizer`: index for organizer queries

---

### RSVPs Collection
```javascript
{
  _id: ObjectId,
  event: ObjectId (ref: 'Event', required),
  user: ObjectId (ref: 'User', required),
  status: String (enum: ['confirmed', 'cancelled'], default: 'confirmed'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes**:
- Compound unique index: `{ event: 1, user: 1 }` - Prevents duplicate RSVPs

---

## 📐 Business Logic Rules

### Event Creation
1. Only organizers can create events
2. Event date must be in the future
3. maxAttendees must be at least 1
4. All fields (title, description, date, location) are required

### RSVP Rules
1. Only attendees can RSVP (organizers cannot RSVP)
2. Users cannot RSVP to past events
3. Users cannot RSVP to full events (currentAttendees >= maxAttendees)
4. Users cannot RSVP twice to the same event
5. Users can only cancel their own RSVPs

### Event Updates
1. Only the organizer who created the event can update it
2. If updating date, new date must be in the future
3. Cannot reduce maxAttendees below currentAttendees count

### Event Deletion
1. Only the organizer who created the event can delete it
2. Deleting an event automatically cancels all RSVPs (cascade)

### Authorization
1. Protected routes require valid JWT token
2. Role-based access control:
   - Organizers: Create, update, delete their own events
   - Attendees: RSVP to events, view RSVPs
3. Users can only access their own data (RSVPs, profile)

---

## ⚠️ Error Handling

### Standard Error Response Format
```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes

**400 Bad Request**:
- Missing required fields
- Invalid data format
- Validation errors

**401 Unauthorized**:
- Missing JWT token
- Invalid or expired token

**403 Forbidden**:
- User lacks permission for action
- Wrong role for operation (e.g., attendee trying to create event)

**404 Not Found**:
- Resource doesn't exist (event, user, RSVP)

**409 Conflict**:
- Email already exists (signup)
- User already RSVP'd to event
- Event is at max capacity

**500 Internal Server Error**:
- Database errors
- Unexpected server errors

### Error Examples

**Duplicate Email**:
```json
{
  "error": "Email already exists"
}
```

**Invalid Credentials**:
```json
{
  "error": "Invalid email or password"
}
```

**Event Full**:
```json
{
  "error": "Event has reached maximum capacity"
}
```

**Already RSVP'd**:
```json
{
  "error": "You have already RSVP'd to this event"
}
```

**Unauthorized Access**:
```json
{
  "error": "You don't have permission to perform this action"
}
```

**Wrong Role**:
```json
{
  "error": "Only organizers can create events"
}
```

---

## 🔧 Environment Variables

Create a `.env` file in backend root:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-booking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Implementation Checklist

### Phase 1: Setup
- [ ] Initialize Node.js project with Express
- [ ] Install dependencies: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv
- [ ] Set up MongoDB connection
- [ ] Configure CORS for frontend origin
- [ ] Create .env file

### Phase 2: Models
- [ ] Create User model with schema
- [ ] Create Event model with schema
- [ ] Create RSVP model with schema
- [ ] Add indexes and validation

### Phase 3: Middleware
- [ ] Create JWT authentication middleware
- [ ] Create role-based authorization middleware
- [ ] Create error handling middleware
- [ ] Create request validation middleware

### Phase 4: Routes - Authentication
- [ ] POST /api/auth/signup
- [ ] POST /api/auth/login

### Phase 5: Routes - Events
- [ ] GET /api/events (public)
- [ ] POST /api/events (organizers only)
- [ ] PUT /api/events/:id (owner only)
- [ ] DELETE /api/events/:id (owner only)

### Phase 6: Routes - RSVPs
- [ ] POST /api/rsvps (attendees only)
- [ ] DELETE /api/rsvps/:eventId
- [ ] GET /api/rsvps/user

### Phase 7: Routes - Users
- [ ] GET /api/users/me

### Phase 8: Testing
- [ ] Test all endpoints with Postman/Thunder Client
- [ ] Test authentication flow
- [ ] Test role-based access control
- [ ] Test error handling
- [ ] Test with frontend application

---

## 📦 Required Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🔒 Security Best Practices

1. **Password Hashing**: Use bcrypt with salt rounds >= 10
2. **JWT Secret**: Use strong, random secret (store in .env)
3. **Input Validation**: Validate all user inputs
4. **CORS**: Only allow frontend origin
5. **Rate Limiting**: Consider adding rate limiting for auth endpoints
6. **Environment Variables**: Never commit .env file
7. **Error Messages**: Don't expose sensitive information in errors
8. **SQL Injection**: Use Mongoose parameterized queries
9. **XSS Protection**: Sanitize user inputs
10. **HTTPS**: Use HTTPS in production

---

## 📝 Additional Notes

### Frontend Integration
- Frontend expects base URL: `http://localhost:5000/api`
- JWT token stored in localStorage with key: `token`
- User data stored in localStorage with key: `user`
- All protected requests include header: `Authorization: Bearer <token>`

### Mock Data Reference
See `lib/mock-api.ts` for example data structures that match expected API responses.

### Testing Tips
1. Start with authentication endpoints
2. Create test users (both attendee and organizer)
3. Test event CRUD operations
4. Test RSVP functionality
5. Verify role-based access control
6. Test error scenarios

---

**Document Version**: 1.0  
**Last Updated**: December 30, 2024  
**Frontend Version**: Next.js 16.0.10, React 19.2.0
