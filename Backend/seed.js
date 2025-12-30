const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Event = require('./models/Event');
const RSVP = require('./models/RSVP');

// Sample users
const users = [
  {
    name: 'John Organizer',
    email: 'john@organizer.com',
    password: 'password123',
    role: 'organizer'
  },
  {
    name: 'Jane Organizer',
    email: 'jane@organizer.com',
    password: 'password123',
    role: 'organizer'
  },
  {
    name: 'Mike Attendee',
    email: 'mike@attendee.com',
    password: 'password123',
    role: 'attendee'
  },
  {
    name: 'Sarah Attendee',
    email: 'sarah@attendee.com',
    password: 'password123',
    role: 'attendee'
  },
  {
    name: 'Alex Attendee',
    email: 'alex@attendee.com',
    password: 'password123',
    role: 'attendee'
  }
];

// Sample events (will be created after users)
const eventsData = [
  {
    title: 'Tech Conference 2026',
    description: 'Join us for an exciting tech conference featuring the latest innovations in AI, cloud computing, and web development. Network with industry leaders and learn about cutting-edge technologies.',
    date: new Date('2026-01-15'),
    time: '10:00 AM',
    location: 'San Francisco Convention Center, CA',
    maxAttendees: 100,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
  },
  {
    title: 'Web Development Workshop',
    description: 'Learn modern web development with React, Next.js, and Node.js. This hands-on workshop covers everything from basics to advanced concepts.',
    date: new Date('2026-01-20'),
    time: '2:00 PM',
    location: 'Tech Hub, New York, NY',
    maxAttendees: 50,
    imageUrl: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=400&fit=crop'
  },
  {
    title: 'Startup Networking Night',
    description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts. Share ideas, find co-founders, and explore investment opportunities.',
    date: new Date('2026-01-25'),
    time: '6:00 PM',
    location: 'Innovation Lab, Boston, MA',
    maxAttendees: 75,
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop'
  },
  {
    title: 'AI & Machine Learning Summit',
    description: 'Explore the future of AI and machine learning. Expert speakers will discuss neural networks, deep learning, and practical AI applications.',
    date: new Date('2026-02-05'),
    time: '9:00 AM',
    location: 'Data Science Center, Seattle, WA',
    maxAttendees: 150,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop'
  },
  {
    title: 'UX/UI Design Masterclass',
    description: 'Master the art of user experience and interface design. Learn design thinking, prototyping, and creating beautiful, functional interfaces.',
    date: new Date('2026-02-10'),
    time: '1:00 PM',
    location: 'Design Studio, Los Angeles, CA',
    maxAttendees: 40,
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop'
  },
  {
    title: 'Cloud Computing Workshop',
    description: 'Get hands-on experience with AWS, Azure, and Google Cloud. Learn to deploy, scale, and manage applications in the cloud.',
    date: new Date('2026-02-15'),
    time: '10:00 AM',
    location: 'Cloud Campus, Austin, TX',
    maxAttendees: 60,
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop'
  },
  {
    title: 'Cybersecurity Conference',
    description: 'Stay ahead of cyber threats. Learn about security best practices, ethical hacking, and protecting your digital assets.',
    date: new Date('2026-02-20'),
    time: '9:00 AM',
    location: 'Security Hub, Washington, DC',
    maxAttendees: 80,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop'
  },
  {
    title: 'Mobile App Development Bootcamp',
    description: 'Build iOS and Android apps from scratch. Learn React Native, Flutter, and mobile development best practices.',
    date: new Date('2026-02-25'),
    time: '10:00 AM',
    location: 'Mobile Lab, Chicago, IL',
    maxAttendees: 45,
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop'
  },
  {
    title: 'Data Science Meetup',
    description: 'Join data scientists and analysts for an evening of talks, demos, and networking. Topics include Python, R, and data visualization.',
    date: new Date('2026-03-01'),
    time: '6:30 PM',
    location: 'Analytics Center, Denver, CO',
    maxAttendees: 55,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop'
  },
  {
    title: 'DevOps & Infrastructure Summit',
    description: 'Learn about CI/CD, containerization, Kubernetes, and modern infrastructure practices from industry experts.',
    date: new Date('2026-03-10'),
    time: '9:00 AM',
    location: 'DevOps Arena, Portland, OR',
    maxAttendees: 70,
    imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await RSVP.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users one by one to trigger the pre-save hook for password hashing
    const createdUsers = [];
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`👥 Created ${createdUsers.length} users`);

    // Get organizers
    const organizers = createdUsers.filter(u => u.role === 'organizer');
    const attendees = createdUsers.filter(u => u.role === 'attendee');

    // Create events with organizers
    const events = eventsData.map((event, index) => ({
      ...event,
      organizer: organizers[index % organizers.length]._id
    }));

    const createdEvents = await Event.insertMany(events);
    console.log(`📅 Created ${createdEvents.length} events`);

    // Create some RSVPs
    const rsvpsToCreate = [];
    
    // Each attendee RSVPs to random events
    for (const attendee of attendees) {
      // RSVP to 2-4 random events
      const numRSVPs = Math.floor(Math.random() * 3) + 2;
      const shuffledEvents = [...createdEvents].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numRSVPs && i < shuffledEvents.length; i++) {
        const event = shuffledEvents[i];
        rsvpsToCreate.push({
          event: event._id,
          user: attendee._id,
          status: 'confirmed'
        });
        
        // Add attendee to event
        event.attendees.push(attendee._id);
      }
    }

    // Save RSVPs
    await RSVP.insertMany(rsvpsToCreate);
    console.log(`🎫 Created ${rsvpsToCreate.length} RSVPs`);

    // Update events with attendees
    for (const event of createdEvents) {
      await Event.findByIdAndUpdate(event._id, { attendees: event.attendees });
    }
    console.log('📝 Updated events with attendees');

    console.log('\n✨ Database seeded successfully!\n');
    console.log('📧 Test Accounts:');
    console.log('   Organizer: john@organizer.com / password123');
    console.log('   Organizer: jane@organizer.com / password123');
    console.log('   Attendee:  mike@attendee.com / password123');
    console.log('   Attendee:  sarah@attendee.com / password123');
    console.log('   Attendee:  alex@attendee.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
