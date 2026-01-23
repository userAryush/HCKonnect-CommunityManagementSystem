export const feedItems = [
  {
    id: '1',
    type: 'announcement',
    title: 'Club Fair 2024 Schedule Change',
    description: 'Due to weather conditions, the outdoor club fair has been moved to the main auditorium. Please check the updated map.',
    community: { id: 'c1', name: 'Student Council', logoText: 'SC' },
    author: { name: 'Admin', role: 'Moderator' },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: '2',
    type: 'event',
    title: 'Intro to React Workshop',
    description: 'Learn the basics of React, components, and state management. Bring your laptops!',
    community: { id: 'c2', name: 'Tech Club', logoText: 'TC' },
    author: { name: 'Sarah Jenkins', role: 'President' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    eventMeta: {
      date: 'Oct 15, 2024',
      time: '4:00 PM - 6:00 PM',
      location: 'Room 304, Science Block',
      format: 'In-person',
      expectedAttendees: '50+',
      speakers: [
        { name: 'Sarah Jenkins', role: 'President', org: 'Tech Club', avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random' },
        { name: 'Prof. Alan Smith', role: 'Advisor', org: 'CS Dept', avatar: 'https://ui-avatars.com/api/?name=Alan+Smith&background=random' },
      ],
      agenda: [
        { time: '4:00 PM', title: 'Introduction', note: 'Overview of React ecosystem' },
        { time: '4:30 PM', title: 'Hands-on Coding', note: 'Building first component' },
        { time: '5:30 PM', title: 'Q&A', note: 'Open floor for questions' },
      ],
      whatToExpect: [
        'Understand React basics',
        'Build a simple app',
        'Learn about hooks',
        'Networking with peers'
      ],
    },
    stats: {
      registrations: { current: 42, capacity: 50 },
    },
  },
  {
    id: '3',
    type: 'discussion',
    title: 'Best electives for 3rd semester?',
    description: 'I am confused between "Data Mining" and "Network Security". Any seniors here who can share their experience?',
    community: { id: 'c3', name: 'CS Department', logoText: 'CS' },
    author: { name: 'Mike Ross' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    tags: ['Academics', 'Advice'],
    stats: {
      likes: 12,
      comments: 8,
    },
  },
  {
    id: '4',
    type: 'resource',
    title: 'Mid-term Study Guide: Algorithms',
    description: 'Compiled notes from the last 5 lectures including solved examples for dynamic programming.',
    community: { id: 'c2', name: 'Tech Club', logoText: 'TC' },
    author: { name: 'David Lee' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    stats: {
      likes: 45,
    },
    tags: ['Study Material', 'Algorithms'],
  },
  {
    id: '5',
    type: 'post',
    title: 'Hackathon Winners Announced! 🏆',
    description: 'Congratulations to Team "BitBusters" for winning the 2024 Campus Hackathon. Check out their project demo link in comments.',
    community: { id: 'c2', name: 'Tech Club', logoText: 'TC' },
    author: { name: 'Tech Club Official' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 1 day 2 hours ago
    stats: {
      likes: 156,
      comments: 24,
    },
  },
  {
    id: '6',
    type: 'event',
    title: 'Annual Charity Run',
    description: 'Join us for a 5k run to raise funds for local shelters.',
    community: { id: 'c4', name: 'Social Service Club', logoText: 'SS' },
    author: { name: 'Emily Clark' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    eventMeta: {
      date: 'Nov 02, 2024',
      time: '7:00 AM',
      location: 'Campus Ground',
      format: 'In-person',
      expectedAttendees: '200+',
      speakers: [],
      agenda: [],
      whatToExpect: ['Fun run', 'Charity', 'Health'],
    },
    stats: {
      registrations: { current: 120, capacity: 200 },
    },
  },
]

export const upcomingEvents = [
  {
    id: 'e1',
    title: 'Intro to React Workshop',
    community: 'Tech Club',
    date: 'Oct 15',
    time: '4:00 PM',
    location: 'Room 304',
  },
  {
    id: 'e2',
    title: 'Career Fair 2024',
    community: 'Placement Cell',
    date: 'Oct 20',
    time: '10:00 AM',
    location: 'Main Hall',
  },
  {
    id: 'e3',
    title: 'Guest Lecture: AI Ethics',
    community: 'Philosophy Club',
    date: 'Oct 25',
    time: '2:00 PM',
    location: 'Auditorium',
  },
]

export const communityDetails = {
  id: 'c2',
  name: 'Tech Club',
  category: 'Technology',
  logoText: 'TC',
  memberCount: 1240,
  isPublic: true,
  vacanciesOpen: true,
  vacanciesDescription: 'We are looking for Graphic Designers and Event Coordinators. Apply now!',
  description: 'The official technology club of Herald College. We host workshops, hackathons, and tech talks.',
  members: [
    { id: 'm1', name: 'Sarah Jenkins', email: 'sarah@example.com', role: 'leader', joinDate: '2023-01-15' },
    { id: 'm2', name: 'Mike Ross', email: 'mike@example.com', role: 'moderator', joinDate: '2023-03-10' },
    { id: 'm3', name: 'David Lee', email: 'david@example.com', role: 'member', joinDate: '2023-05-20' },
  ],
  discussions: [
    { id: 'd1', title: 'React vs Vue?', createdBy: 'Alice', createdAt: '2024-10-10', status: 'active' },
    { id: 'd2', title: 'Next Hackathon Ideas', createdBy: 'Bob', createdAt: '2024-10-12', status: 'locked' },
  ]
}
