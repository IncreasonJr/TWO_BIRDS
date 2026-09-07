import { UserProfile } from '../types';

export const INITIAL_CURRENT_USER: UserProfile = {
  id: 'current-user-001',
  uid: 'current-user-001',
  name: 'Alex Johnson',
  email: 'alex@university.edu',
  age: 21,
  gender: 'Male',
  major: 'Computer Science',
  year: 'Junior',
  university: 'Stanford University',
  gradYear: 2026,
  bio: 'Coffee addict, code enthusiast, and boba lover. Ask me about my latest project!',
  photos: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
  ],
  interests: ['CS & AI', 'Boba', 'Hackathons', 'Coffee', 'Startups'],
  verifiedCampus: true,
  distanceMiles: 0,
  location: { latitude: 37.7749, longitude: -122.4194 },
  onlineStatus: 'online',
  lastActive: new Date(),
  zodiacSign: 'Scorpio',
  dormOrCampus: 'Meier Hall',
  createdAt: new Date().toISOString(),
};
