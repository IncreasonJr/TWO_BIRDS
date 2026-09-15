import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { UserProfile } from '../types';
import { INITIAL_CURRENT_USER } from '../data/currentUser';
import { MOCK_PROFILES } from '../data/mockUsers';
import { isValidEduEmail } from '../utils/validation';

export interface SignupData {
  name: string;
  email: string;
  university: string;
  major: string;
  age?: number;
  gender?: string;
  bio?: string;
}

interface UserContextType {
  currentUser: UserProfile;
  isAuthenticated: boolean;
  isUploading: boolean;
  uploadProgress: number;
  totalSwipes: number;
  completionPercentage: number;
  updateProfile: (data: Partial<UserProfile>) => void;
  uploadPhoto: (file: File) => void;
  incrementSwipes: () => void;
  signup: (data: SignupData) => { success: boolean; error?: string };
  login: (email: string) => { success: boolean; error?: string };
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_CURRENT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [totalSwipes, setTotalSwipes] = useState<number>(14); // baseline mock swipes count

  const completionPercentage = useMemo(() => {
    let score = 0;
    const totalChecks = 6;
    if (currentUser.photos && currentUser.photos.length > 0) score++;
    if (currentUser.name && currentUser.name.trim().length >= 2) score++;
    if (currentUser.bio && currentUser.bio.trim().length >= 5) score++;
    if (currentUser.major && currentUser.major.trim().length > 0) score++;
    if (currentUser.year) score++;
    if (currentUser.interests && currentUser.interests.length >= 3) score++;

    return Math.round((score / totalChecks) * 100);
  }, [currentUser]);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...data,
    }));
  }, []);

  const uploadPhoto = useCallback((file: File) => {
    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 250);

    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        setUploadProgress(100);
        const newPhotoUrl = reader.result as string;
        setCurrentUser((prev) => ({
          ...prev,
          photos: [newPhotoUrl, ...prev.photos.slice(1)],
        }));

        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 400);
      }, 1100);
    };
    reader.readAsDataURL(file);
  }, []);

  const incrementSwipes = useCallback(() => {
    setTotalSwipes((prev) => prev + 1);
  }, []);

  const signup = useCallback((data: SignupData) => {
    if (!isValidEduEmail(data.email)) {
      return {
        success: false,
        error: 'Please use a valid university email (.edu) to sign up',
      };
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      uid: `user-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      university: data.university.trim() || 'Stanford University',
      major: data.major.trim() || 'Undecided',
      age: data.age || 21,
      gender: data.gender || 'Other',
      bio: data.bio?.trim() || 'Excited to connect with fellow students on campus!',
      photos: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
      ],
      interests: ['Campus Life', 'Coffee', 'Study Groups'],
      verifiedCampus: true,
      distanceMiles: 0,
      location: { latitude: 37.4275, longitude: -122.1697 },
      onlineStatus: 'online',
      lastActive: new Date(),
      gradYear: 2026,
      createdAt: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return { success: true };
  }, []);

  const login = useCallback((email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      return { success: false, error: 'Please enter your email address' };
    }
    // Check if matching current user
    if (trimmed === currentUser.email.toLowerCase()) {
      setIsAuthenticated(true);
      return { success: true };
    }
    // Check mock users without blocking non-.edu
    const foundMock = MOCK_PROFILES.find((p) => p.email.toLowerCase() === trimmed);
    if (foundMock) {
      setCurrentUser(foundMock);
      setIsAuthenticated(true);
      return { success: true };
    }
    // General login fallback for existing users
    setCurrentUser((prev) => ({
      ...prev,
      email: trimmed,
    }));
    setIsAuthenticated(true);
    return { success: true };
  }, [currentUser]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isUploading,
        uploadProgress,
        totalSwipes,
        completionPercentage,
        updateProfile,
        uploadPhoto,
        incrementSwipes,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
