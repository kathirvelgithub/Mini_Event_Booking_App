const express = require('express');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const { auth, isOrganizer } = require('../middleware/auth');

const router = express.Router();

// GET /api/events - Fetch all events (public) with optional search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    // Build query
    let query = {};
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex }
        ]
      };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    // Transform events to include currentAttendees
    const transformedEvents = events.map(event => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl,
      organizer: event.organizer,
      organizerId: event.organizer?._id,
      organizerName: event.organizer?.name,
      attendees: event.attendees,
      maxAttendees: event.maxAttendees,
      capacity: event.maxAttendees,
      currentAttendees: event.attendees.length,
      currentRSVPs: event.attendees.length,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    res.json(transformedEvents);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
});

// GET /api/events/my-events - Get events created by the authenticated organizer
router.get('/my-events', auth, isOrganizer, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    const transformedEvents = events.map(event => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl,
      organizer: event.organizer,
      organizerId: event.organizer?._id,
      organizerName: event.organizer?.name,
      attendees: event.attendees,
      maxAttendees: event.maxAttendees,
      capacity: event.maxAttendees,
      currentAttendees: event.attendees.length,
      currentRSVPs: event.attendees.length,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    res.json(transformedEvents);
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ error: 'Error fetching your events' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl,
      organizer: event.organizer,
      organizerId: event.organizer?._id,
      organizerName: event.organizer?.name,
      attendees: event.attendees,
      maxAttendees: event.maxAttendees,
      capacity: event.maxAttendees,
      currentAttendees: event.attendees.length,
      currentRSVPs: event.attendees.length,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Error fetching event' });
  }
});

// POST /api/events - Create a new event (organizers only)
router.post('/', auth, isOrganizer, async (req, res) => {
  try {
    const { title, description, date, time, location, capacity, maxAttendees, imageUrl } = req.body;
    
    // Support both capacity and maxAttendees
    const attendeeLimit = capacity || maxAttendees;

    // Validate required fields
    if (!title || !description || !date || !location || !attendeeLimit) {
      return res.status(400).json({ error: 'Title, description, date, location, and capacity are required' });
    }

    // Validate date is in the future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({ error: 'Event date must be in the future' });
    }

    // Validate attendeeLimit
    if (attendeeLimit < 1) {
      return res.status(400).json({ error: 'Capacity must be at least 1' });
    }

    const event = new Event({
      title,
      description,
      date: eventDate,
      time: time || '',
      location,
      imageUrl: imageUrl || '',
      maxAttendees: attendeeLimit,
      organizer: req.user._id,
      attendees: []
    });

    await event.save();

    // Populate organizer for response
    await event.populate('organizer', 'name email');

    res.status(201).json({
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl,
      organizer: event.organizer,
      organizerId: event.organizer?._id,
      organizerName: event.organizer?.name,
      attendees: event.attendees,
      maxAttendees: event.maxAttendees,
      capacity: event.maxAttendees,
      currentAttendees: 0,
      currentRSVPs: 0,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Error creating event' });
  }
});

// PUT /api/events/:id - Update an event (owner only)
router.put('/:id', auth, isOrganizer, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You don't have permission to update this event" });
    }

    const { title, description, date, time, location, maxAttendees } = req.body;

    // Validate date if provided
    if (date) {
      const eventDate = new Date(date);
      if (eventDate <= new Date()) {
        return res.status(400).json({ error: 'Event date must be in the future' });
      }
      event.date = eventDate;
    }

    // Validate maxAttendees if provided
    if (maxAttendees !== undefined) {
      if (maxAttendees < event.attendees.length) {
        return res.status(400).json({ 
          error: `Cannot reduce capacity below current attendees (${event.attendees.length})` 
        });
      }
      event.maxAttendees = maxAttendees;
    }

    // Update other fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (time) event.time = time;
    if (location) event.location = location;

    await event.save();
    await event.populate('organizer', 'name email');

    res.json({
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl,
      organizer: event.organizer,
      organizerId: event.organizer?._id,
      organizerName: event.organizer?.name,
      attendees: event.attendees,
      maxAttendees: event.maxAttendees,
      capacity: event.maxAttendees,
      currentAttendees: event.attendees.length,
      currentRSVPs: event.attendees.length,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Error updating event' });
  }
});

// DELETE /api/events/:id - Delete an event (owner only)
router.delete('/:id', auth, isOrganizer, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You don't have permission to delete this event" });
    }

    // Delete all associated RSVPs (cascade delete)
    await RSVP.deleteMany({ event: event._id });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// POST /api/events/:id/rsvp - RSVP to an event
// Uses atomic operations to prevent race conditions and overbooking
router.post('/:id/rsvp', auth, async (req, res) => {
  const session = await require('mongoose').startSession();
  
  try {
    session.startTransaction();

    // Use findOneAndUpdate with atomic conditions to prevent race conditions
    // This ensures capacity is checked AND user is added in a single atomic operation
    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        // Atomic conditions: event exists, has capacity, user not already attending
        $expr: { $lt: [{ $size: '$attendees' }, '$maxAttendees'] },
        attendees: { $ne: req.user._id }
      },
      {
        // Atomically add user to attendees array
        $addToSet: { attendees: req.user._id }
      },
      { 
        new: true, 
        session,
        runValidators: true
      }
    );

    if (!event) {
      await session.abortTransaction();
      
      // Determine the specific error
      const existingEvent = await Event.findById(req.params.id);
      
      if (!existingEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }
      
      if (new Date(existingEvent.date) <= new Date()) {
        return res.status(400).json({ error: 'Cannot RSVP to past events' });
      }
      
      if (existingEvent.attendees.includes(req.user._id)) {
        return res.status(409).json({ error: "You have already RSVP'd to this event" });
      }
      
      if (existingEvent.attendees.length >= existingEvent.maxAttendees) {
        return res.status(409).json({ error: 'Event has reached maximum capacity' });
      }
      
      return res.status(400).json({ error: 'Unable to RSVP to this event' });
    }

    // Check if event is in the past (additional validation)
    if (new Date(event.date) <= new Date()) {
      await session.abortTransaction();
      // Rollback the attendee addition
      await Event.findByIdAndUpdate(event._id, {
        $pull: { attendees: req.user._id }
      });
      return res.status(400).json({ error: 'Cannot RSVP to past events' });
    }

    // Create RSVP record
    const rsvp = new RSVP({
      event: event._id,
      user: req.user._id,
      status: 'confirmed'
    });

    await rsvp.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      _id: rsvp._id,
      event: event._id,
      user: req.user._id,
      status: rsvp.status,
      createdAt: rsvp.createdAt,
      message: 'Successfully RSVP\'d to event'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('RSVP error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ error: "You have already RSVP'd to this event" });
    }
    res.status(500).json({ error: 'Error creating RSVP' });
  } finally {
    session.endSession();
  }
});

// DELETE /api/events/:id/rsvp - Cancel RSVP
router.delete('/:id/rsvp', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Find and delete RSVP
    const rsvp = await RSVP.findOneAndDelete({ 
      event: event._id, 
      user: req.user._id 
    });

    if (!rsvp) {
      return res.status(404).json({ error: 'RSVP not found' });
    }

    // Remove user from event attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.toString() !== req.user._id.toString()
    );
    await event.save();

    res.json({ message: 'RSVP cancelled successfully' });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ error: 'Error cancelling RSVP' });
  }
});

module.exports = router;
