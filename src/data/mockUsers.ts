import { UserProfile, Match, Message } from '../types';

export const MOCK_CURRENT_USER: UserProfile = {
  id: 'current-user',
  uid: 'current-user',
  name: 'Alex Rivera',
  email: 'alex.rivera@stanford.edu',
  age: 21,
  gender: 'Male',
  major: 'Computer Science',
  university: 'Stanford University',
  gradYear: 2026,
  bio: 'Junior studying CS + AI. Big fan of late night coding, boba, and campus pickup soccer! ⚽💻',
  photos: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
  ],
  interests: ['CS & AI', 'Boba', 'Hackathons', 'Coffee Brewing', 'Basketball'],
  verifiedCampus: true,
  distanceMiles: 0,
  zodiacSign: 'Scorpio',
  dormOrCampus: 'Meier Hall',
  createdAt: new Date().toISOString(),
};

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'user-1',
    uid: 'user-1',
    name: 'Sophia Chen',
    email: 'sophia@stanford.edu',
    age: 21,
    gender: 'Female',
    major: 'Computer Science',
    university: 'Stanford University',
    gradYear: 2026,
    bio: 'CS junior obsessed with late-night boba runs, machine learning, and indie pop concerts. Looking for a study buddy or coffee date!',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
    ],
    interests: ['CS & AI', 'Boba', 'Indie Music', 'Hackathons', 'Bouldering'],
    verifiedCampus: true,
    distanceMiles: 0.4,
    zodiacSign: 'Scorpio',
    spotifyTopArtist: 'The 1975',
    dormOrCampus: 'Mirrielees House'
  },
  {
    id: 'user-2',
    uid: 'user-2',
    name: 'Marcus Vance',
    email: 'marcus@stanford.edu',
    age: 22,
    gender: 'Male',
    major: 'Business & Finance',
    university: 'Stanford University',
    gradYear: 2025,
    bio: 'Senior student entrepreneur. When I am not working on my pitch deck, you can find me playing pickup basketball or making sourdough.',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
    ],
    interests: ['Startups', 'Basketball', 'Photography', 'Coffee Brewing', 'Travel'],
    verifiedCampus: true,
    distanceMiles: 0.8,
    zodiacSign: 'Leo',
    spotifyTopArtist: 'Drake',
    dormOrCampus: 'EVGR Quad'
  },
  {
    id: 'user-3',
    uid: 'user-3',
    name: 'Elena Rostova',
    email: 'elena@stanford.edu',
    age: 20,
    gender: 'Female',
    major: 'Biomedical Engineering',
    university: 'Stanford University',
    gradYear: 2027,
    bio: 'Pre-med sophomore. Premed life = studying in Green Library and drinking iced matcha lattes. Send me your favorite study playlist!',
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80'
    ],
    interests: ['Pre-Med', 'Matcha', 'Yoga', 'Classical Violin', 'Art Museums'],
    verifiedCampus: true,
    distanceMiles: 1.2,
    zodiacSign: 'Taurus',
    spotifyTopArtist: 'Taylor Swift',
    dormOrCampus: 'Roble Hall'
  },
  {
    id: 'user-4',
    uid: 'user-4',
    name: 'Jordan Miller',
    email: 'jordan@stanford.edu',
    age: 21,
    gender: 'Non-binary',
    major: 'Graphic Design & Film',
    university: 'Stanford University',
    gradYear: 2026,
    bio: 'Visual storyteller & film student. Let’s shoot 35mm film around campus, swap thrift store finds, and argue about cinema classics.',
    photos: [
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80'
    ],
    interests: ['Film Photography', 'Thrifting', 'Cinema', 'Design', 'Vinyl Records'],
    verifiedCampus: true,
    distanceMiles: 0.2,
    zodiacSign: 'Aquarius',
    spotifyTopArtist: 'Clairo',
    dormOrCampus: 'Kimball Hall'
  },
  {
    id: 'user-5',
    uid: 'user-5',
    name: 'Chloe Kim',
    email: 'chloe@stanford.edu',
    age: 22,
    gender: 'Female',
    major: 'Psychology & Neuroscience',
    university: 'Stanford University',
    gradYear: 2025,
    bio: 'Cognitive science senior. Passionate about brain research, ambient synth music, and weekend hiking along the dish trail.',
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
    ],
    interests: ['Neuroscience', 'Hiking', 'Synthwave', 'Art', 'Coffee'],
    verifiedCampus: true,
    distanceMiles: 0.6,
    zodiacSign: 'Gemini',
    spotifyTopArtist: 'Frank Ocean',
    dormOrCampus: 'Stern Hall'
  },
  {
    id: 'user-6',
    uid: 'user-6',
    name: 'David Patel',
    email: 'david@stanford.edu',
    age: 20,
    gender: 'Male',
    major: 'Mechanical Engineering',
    university: 'Stanford University',
    gradYear: 2027,
    bio: 'Robotics lab rat. Building autonomous drones by day, playing acoustic guitar on the quad by night.',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
    ],
    interests: ['Robotics', 'Acoustic Guitar', 'Bouldering', 'Gaming'],
    verifiedCampus: true,
    distanceMiles: 1.1,
    zodiacSign: 'Libra',
    spotifyTopArtist: 'Ed Sheeran',
    dormOrCampus: 'Wilbur Hall'
  }
];

export const MOCK_INITIAL_MATCHES: Match[] = [
  {
    id: 'match-1',
    users: ['current-user', 'user-1'],
    user: MOCK_PROFILES[0],
    matchedAt: '2 hours ago',
    lastMessage: 'Hey! Are you going to the campus hackathon this weekend?',
    lastMessageTimestamp: '10:42 AM',
    unread: true,
    online: true,
  },
  {
    id: 'match-2',
    users: ['current-user', 'user-3'],
    user: MOCK_PROFILES[2],
    matchedAt: 'Yesterday',
    lastMessage: 'I know the best matcha spot near CoHo! Let’s get coffee!',
    lastMessageTimestamp: 'Yesterday',
    unread: false,
    online: false,
  }
];

export const MOCK_INITIAL_MESSAGES: Record<string, Message[]> = {
  'match-1': [
    {
      id: 'msg-1',
      matchId: 'match-1',
      senderId: 'user-1',
      receiverId: 'current-user',
      text: 'Hey Alex! Are you studying at Green Library or the student center right now?',
      timestamp: '10:30 AM',
      isRead: true,
    },
    {
      id: 'msg-2',
      matchId: 'match-1',
      senderId: 'current-user',
      receiverId: 'user-1',
      text: 'Hey Sophia! I am over at CoHo grabbing an iced latte!',
      timestamp: '10:35 AM',
      isRead: true,
    },
    {
      id: 'msg-3',
      matchId: 'match-1',
      senderId: 'user-1',
      receiverId: 'current-user',
      text: 'Awesome! Are you going to the campus hackathon this weekend?',
      timestamp: '10:42 AM',
      isRead: true,
    }
  ],
  'match-2': [
    {
      id: 'msg-10',
      matchId: 'match-2',
      senderId: 'user-3',
      receiverId: 'current-user',
      text: 'I know the best matcha spot near CoHo! Let’s get coffee!',
      timestamp: 'Yesterday',
      isRead: true,
    }
  ]
};
