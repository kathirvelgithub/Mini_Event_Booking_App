# Event Booking API - Backend

Backend API for the Event Booking Platform built with Node.js, Express, and MongoDB Atlas.

## Features

- **Authentication**: JWT-based authentication with signup/login
- **Role-based Access**: Organizers can create events, Attendees can RSVP
- **Event Management**: Create, read, update, delete events
- **RSVP System**: RSVP to events with capacity management

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- Bcrypt for password hashing

## Setup

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Configure Environment Variables

Update the `.env` file with your MongoDB Atlas connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/event-booking?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**To get your MongoDB Atlas connection string:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or allow from anywhere: 0.0.0.0/0)
5. Click "Connect" → "Connect your application"
6. Copy the connection string and replace `<username>`, `<password>`, and `<cluster>` in the `.env` file

### 3. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Events
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/events` | Get all events | No |
| GET | `/api/events/:id` | Get single event | No |
| GET | `/api/events/my-events` | Get organizer's events | Yes (Organizer) |
| POST | `/api/events` | Create new event | Yes (Organizer) |
| PUT | `/api/events/:id` | Update event | Yes (Owner) |
| DELETE | `/api/events/:id` | Delete event | Yes (Owner) |
| POST | `/api/events/:id/rsvp` | RSVP to event | Yes |
| DELETE | `/api/events/:id/rsvp` | Cancel RSVP | Yes |

### RSVPs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/rsvps/my-rsvps` | Get user's RSVPs | Yes |
| POST | `/api/rsvps` | Create RSVP | Yes |
| DELETE | `/api/rsvps/:eventId` | Cancel RSVP | Yes |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/me` | Get current user profile | Yes |

## Project Structure

```
Backend/
├── models/
│   ├── User.js         # User schema
│   ├── Event.js        # Event schema
│   ├── RSVP.js         # RSVP schema
│   └── index.js
├── routes/
│   ├── auth.js         # Authentication routes
│   ├── events.js       # Event routes
│   ├── rsvps.js        # RSVP routes
│   ├── users.js        # User routes
│   └── index.js
├── middleware/
│   ├── auth.js         # JWT & role middleware
│   └── index.js
├── .env               # Environment variables
├── .env.example       # Example env file
├── package.json
├── server.js          # Entry point
└── README.md
```

## Testing with Frontend

1. Start the backend: `npm run dev`
2. Start the frontend: `cd ../Frontend && npm run dev`
3. The frontend should connect to `http://localhost:5000/api`

## Concurrency Handling for RSVP

The RSVP system uses **MongoDB atomic operations** to prevent race conditions when multiple users attempt to RSVP for the last available spot:

```javascript
// Atomic operation: Check capacity AND add user in a SINGLE database operation
const event = await Event.findOneAndUpdate(
  {
    _id: eventId,
    // Condition 1: Has available capacity
    $expr: { $lt: [{ $size: '$attendees' }, '$maxAttendees'] },
    // Condition 2: User not already attending
    attendees: { $ne: userId }
  },
  {
    // Atomically add user to attendees array
    $addToSet: { attendees: userId }
  },
  { new: true, session }
);
```

### Why This Prevents Overbooking:
1. **Single Atomic Operation**: The capacity check and user addition happen together
2. **`$expr` with `$size`**: Compares real-time array length against max capacity
3. **MongoDB Transactions**: Ensures RSVP record and event update are consistent
4. **Unique Index**: `(event, user)` compound index prevents duplicates at database level

## Seed Data

Run `npm run seed` to create test accounts:

| Role | Email | Password |
|------|-------|----------|
| Organizer | john@organizer.com | password123 |
| Organizer | jane@organizer.com | password123 |
| Attendee | mike@attendee.com | password123 |
| Attendee | sarah@attendee.com | password123 |
| Attendee | alex@attendee.com | password123 |
