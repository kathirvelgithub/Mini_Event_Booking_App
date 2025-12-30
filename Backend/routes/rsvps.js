const express = require('express');
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/rsvps/my-rsvps - Get all RSVPs for authenticated user
router.get('/my-rsvps', auth, async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user._id, status: 'confirmed' })
      .populate({
        path: 'event',
        populate: {
          path: 'organizer',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    // Transform RSVPs to include event details
    const transformedRSVPs = rsvps
      .filter(rsvp => rsvp.event) // Filter out RSVPs with deleted events
      .map(rsvp => ({
        _id: rsvp._id,
        event: {
          _id: rsvp.event._id,
          title: rsvp.event.title,
          description: rsvp.event.description,
          date: rsvp.event.date,
          time: rsvp.event.time,
          location: rsvp.event.location,
          imageUrl: rsvp.event.imageUrl,
          organizer: rsvp.event.organizer,
          organizerName: rsvp.event.organizer?.name,
          maxAttendees: rsvp.event.maxAttendees,
          capacity: rsvp.event.maxAttendees,
          currentAttendees: rsvp.event.attendees?.length || 0,
          currentRSVPs: rsvp.event.attendees?.length || 0
        },
        status: rsvp.status,
        createdAt: rsvp.createdAt
      }));

    res.json(transformedRSVPs);
  } catch (error) {
    console.error('Get my RSVPs error:', error);
    res.status(500).json({ error: 'Error fetching your RSVPs' });
  }
});

// GET /api/rsvps/user - Alias for my-rsvps (API compatibility)
router.get('/user', auth, async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user._id, status: 'confirmed' })
      .populate({
        path: 'event',
        populate: {
          path: 'organizer',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    const transformedRSVPs = rsvps
      .filter(rsvp => rsvp.event)
      .map(rsvp => ({
        _id: rsvp._id,
        event: {
          _id: rsvp.event._id,
          title: rsvp.event.title,
          description: rsvp.event.description,
          date: rsvp.event.date,
          time: rsvp.event.time,
          location: rsvp.event.location,
          imageUrl: rsvp.event.imageUrl,
          organizer: rsvp.event.organizer,
          organizerName: rsvp.event.organizer?.name,
          maxAttendees: rsvp.event.maxAttendees,
          capacity: rsvp.event.maxAttendees,
          currentAttendees: rsvp.event.attendees?.length || 0,
          currentRSVPs: rsvp.event.attendees?.length || 0
        },
        status: rsvp.status,
        createdAt: rsvp.createdAt
      }));

    res.json(transformedRSVPs);
  } catch (error) {
    console.error('Get RSVPs error:', error);
    res.status(500).json({ error: 'Error fetching RSVPs' });
  }
});

// POST /api/rsvps - Create RSVP (alternative endpoint)
router.post('/', auth, async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is in the past
    if (new Date(event.date) <= new Date()) {
      return res.status(400).json({ error: 'Cannot RSVP to past events' });
    }

    // Check if event is at max capacity
    if (event.attendees.length >= event.maxAttendees) {
      return res.status(409).json({ error: 'Event has reached maximum capacity' });
    }

    // Check if user already RSVP'd
    const existingRSVP = await RSVP.findOne({ 
      event: event._id, 
      user: req.user._id 
    });

    if (existingRSVP) {
      return res.status(409).json({ error: "You have already RSVP'd to this event" });
    }

    // Create RSVP
    const rsvp = new RSVP({
      event: event._id,
      user: req.user._id,
      status: 'confirmed'
    });

    await rsvp.save();

    // Add user to event attendees
    event.attendees.push(req.user._id);
    await event.save();

    res.status(201).json({
      _id: rsvp._id,
      event: event._id,
      user: req.user._id,
      status: rsvp.status,
      createdAt: rsvp.createdAt
    });
  } catch (error) {
    console.error('Create RSVP error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: "You have already RSVP'd to this event" });
    }
    res.status(500).json({ error: 'Error creating RSVP' });
  }
});

// DELETE /api/rsvps/:eventId - Cancel RSVP by event ID
router.delete('/:eventId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

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
