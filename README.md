# Mini Event Platform

A full-stack event management application built with the MERN stack (MongoDB, Express.js, React/Next.js, Node.js).

## 🚀 Features

### Core Features
- **User Authentication**: Secure signup/login with JWT tokenization
- **Event Management**: Full CRUD operations for events
- **RSVP System**: Join/leave events with capacity enforcement
- **Responsive Design**: Works on Desktop, Tablet, and Mobile

### Event Fields
- Title, Description, Date & Time, Location
- Capacity (Maximum attendees)
- Image Upload (file upload + URL support)

### Advanced Features
- ✅ **Search & Filtering**: Search events by title, description, or location
- ✅ **User Dashboard**: View your created events and RSVPs
- ✅ **Concurrency Handling**: Atomic operations prevent overbooking
- ✅ **Role-based Access**: Organizers can create/edit, Attendees can RSVP

---

## 📋 Technical Details

### RSVP Capacity & Concurrency Handling

The system uses **MongoDB atomic operations** and **transactions** to prevent race conditions when multiple users attempt to RSVP for the last available spot.

#### Strategy: Atomic `findOneAndUpdate` with Transactions

```javascript
// POST /api/events/:id/rsvp - Uses atomic operations
router.post('/:id/rsvp', auth, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Atomic operation: Check capacity AND add user in ONE operation
    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        // Atomic conditions:
        // 1. Event has available capacity
        $expr: { $lt: [{ $size: '$attendees' }, '$maxAttendees'] },
        // 2. User not already attending
        attendees: { $ne: req.user._id }
      },
      {
        // Atomically add user to attendees
        $addToSet: { attendees: req.user._id }
      },
      { new: true, session }
    );

    if (!event) {
      await session.abortTransaction();
      // Return appropriate error (capacity full, already RSVP'd, etc.)
    }

    // Create RSVP record
    const rsvp = new RSVP({ event: event._id, user: req.user._id });
    await rsvp.save({ session });
    
    await session.commitTransaction();
    res.status(201).json({ message: 'Successfully RSVP\'d' });
  } catch (error) {
    await session.abortTransaction();
    // Handle errors
  } finally {
    session.endSession();
  }
});
```

#### Why This Works:
1. **`findOneAndUpdate`** is atomic - the capacity check and attendee addition happen in a single database operation
2. **`$expr`** with `$size` comparison ensures accurate real-time capacity checking
3. **`$addToSet`** prevents duplicate entries
4. **`$ne` condition** ensures user isn't already attending
5. **Transactions** ensure RSVP record and event update are consistent

#### Duplicate Prevention:
- Database-level: Compound unique index on `(event, user)` in RSVP collection
- Application-level: `$ne` check in atomic query + duplicate key error handling

---

## 🛠️ Running Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- npm or pnpm

### Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventdb
# JWT_SECRET=your-secret-key
# PORT=5000

# Seed the database (optional)
npm run seed

# Start the server
npm start
```

### Frontend Setup

```bash
cd Frontend

# Install dependencies
pnpm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start development server
pnpm dev
```

### Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Organizer | john@organizer.com | password123 |
| Organizer | jane@organizer.com | password123 |
| Attendee | mike@attendee.com | password123 |
| Attendee | sarah@attendee.com | password123 |

---

## 📁 Project Structure

```
├── Backend/
│   ├── server.js           # Express app setup
│   ├── models/
│   │   ├── User.js         # User schema with password hashing
│   │   ├── Event.js        # Event schema
│   │   └── RSVP.js         # RSVP schema with unique constraint
│   ├── routes/
│   │   ├── auth.js         # Signup/Login endpoints
│   │   ├── events.js       # Event CRUD + RSVP endpoints
│   │   ├── rsvps.js        # RSVP management
│   │   ├── users.js        # User profile
│   │   └── upload.js       # Image upload endpoint
│   └── middleware/
│       ├── auth.js         # JWT verification
│       └── upload.js       # Multer file upload config
│
├── Frontend/
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── dashboard/      # Events listing with search
│   │   ├── create-event/   # Create event form with image upload
│   │   ├── my-events/      # Organizer's events
│   │   └── my-rsvps/       # User's RSVPs
│   ├── components/
│   │   ├── auth/           # Auth components
│   │   ├── events/         # Event cards
│   │   ├── layout/         # App layout, navbar
│   │   └── ui/             # shadcn/ui components
│   └── lib/
│       ├── api.ts          # API wrapper functions
│       ├── auth.ts         # Auth utilities
│       └── types.ts        # TypeScript types
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events?search=query` | Search events |
| GET | `/api/events/:id` | Get single event |
| POST | `/api/events` | Create event (organizer) |
| PUT | `/api/events/:id` | Update event (owner) |
| DELETE | `/api/events/:id` | Delete event (owner) |
| GET | `/api/events/my-events` | Get user's created events |

### RSVPs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events/:id/rsvp` | RSVP to event |
| DELETE | `/api/events/:id/rsvp` | Cancel RSVP |
| GET | `/api/rsvps/my-rsvps` | Get user's RSVPs |

### Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload event image |

---

## ✅ Features Checklist

### Required Features
- [x] User Sign Up & Login
- [x] JWT Authentication
- [x] Create Events (Title, Description, Date, Time, Location, Capacity)
- [x] Image Upload for Events
- [x] View All Events Dashboard
- [x] Edit & Delete Own Events
- [x] RSVP to Events
- [x] Capacity Enforcement
- [x] Concurrency Handling (Atomic Operations)
- [x] No Duplicate RSVPs
- [x] Responsive UI (Desktop, Tablet, Mobile)

### Bonus Features
- [x] Search & Filter Events
- [x] User Dashboard (My Events)
- [x] User Dashboard (My RSVPs)
- [x] Dark/Light Theme Support
- [ ] AI Description Generation (Not implemented)

---

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **State Management**: React Hooks

---

## 📝 License

MIT
