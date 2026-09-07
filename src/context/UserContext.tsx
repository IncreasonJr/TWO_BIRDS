import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { UserProfile } from '../types';
import { INITIAL_CURRENT_USER } from '../data/currentUser';

interface UserContextType {
  currentUser: UserProfile;
  isUploading: boolean;
  uploadProgress: number;
  totalSwipes: number;
  completionPercentage: number;
  updateProfile: (data: Partial<UserProfile>) => void;
  uploadPhoto: (file: File) => void;
  incrementSwipes: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_CURRENT_USER);
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

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isUploading,
        uploadProgress,
        totalSwipes,
        completionPercentage,
        updateProfile,
        uploadPhoto,
        incrementSwipes,
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
