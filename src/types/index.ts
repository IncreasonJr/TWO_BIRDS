export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  major: string;
  year?: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Grad Student';
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
  onlineStatus?: 'online' | 'offline' | 'recently';
  lastActive?: Date | string;
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
  userId: string;
  name: string;
  age: number;
  major: string;
  photos: string[];
  onlineStatus: 'online' | 'offline' | 'recently';
  lastActive: Date | string;
  matchedAt: Date | string;
  messages: Message[];
  users: string[];
  user: UserProfile;
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
  type?: 'text' | 'voice';
  audioUrl?: string;
  duration?: string;
}


export interface FilterSettings {
  maxDistance: number;
  gradYearRange: [number, number];
  onlyVerified: boolean;
  majorFilter: string;
}

export type NotificationType = 'match' | 'message' | 'like' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  pushEnabled: boolean;
  matchesEnabled: boolean;
  messagesEnabled: boolean;
  likesEnabled: boolean;
  updatedAt?: string;
}

