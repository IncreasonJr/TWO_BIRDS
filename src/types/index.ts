export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  major: string;
  university: string;
  gradYear: number;
  bio: string;
  photos: string[];
  interests: string[];
  verifiedCampus: boolean;
  distanceMiles: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  zodiacSign?: string;
  spotifyTopArtist?: string;
  dormOrCampus?: string;
  createdAt?: string;
}

export interface SwipeAction {
  id?: string;
  fromUserId: string;
  targetUserId: string;
  type: 'like' | 'pass' | 'superlike';
  timestamp: string;
}

export interface Match {
  id: string;
  users: string[];
  user: UserProfile;
  matchedAt: string;
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unread: boolean;
  online: boolean;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface FilterSettings {
  maxDistance: number;
  gradYearRange: [number, number];
  onlyVerified: boolean;
  majorFilter: string;
}
