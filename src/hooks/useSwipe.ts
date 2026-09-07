import { useState, useCallback } from 'react';
import { UserProfile } from '../types';
import { MOCK_PROFILES } from '../data/mockUsers';

export function useSwipe() {
  const [profiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [swipedUserIds, setSwipedUserIds] = useState<string[]>([]);
  const [likedUserIds, setLikedUserIds] = useState<string[]>([]);
  const [newMatch, setNewMatch] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<UserProfile[]>([]);
  const [swipeCount, setSwipeCount] = useState<number>(0);

  const currentProfile = profiles[currentIndex] || null;
  const nextProfile = profiles[currentIndex + 1] || null;
  const thirdProfile = profiles[currentIndex + 2] || null;

  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up') => {
    if (!currentProfile) return;

    setSwipedUserIds((prev) => [...prev, currentProfile.id]);
    setHistory((prev) => [...prev, currentProfile]);
    setSwipeCount((prev) => prev + 1);

    if (direction === 'right' || direction === 'up') {
      setLikedUserIds((prev) => [...prev, currentProfile.id]);

      // Mutual match trigger simulation
      const isMutualMatch = currentProfile.id === 'user-1' || currentProfile.id === 'user-3' || currentProfile.id === 'user-7' || Math.random() > 0.45;
      if (isMutualMatch) {
        setNewMatch(currentProfile);
      }
    }

    setCurrentIndex((prev) => prev + 1);
  }, [currentProfile]);

  const rewind = useCallback(() => {
    if (currentIndex > 0) {
      const prevProfile = history[history.length - 1];
      if (prevProfile) {
        setSwipedUserIds((prev) => prev.filter((id) => id !== prevProfile.id));
        setLikedUserIds((prev) => prev.filter((id) => id !== prevProfile.id));
        setHistory((prev) => prev.slice(0, -1));
        setCurrentIndex((prev) => prev - 1);
      }
    }
  }, [currentIndex, history]);

  const resetFeed = useCallback(() => {
    setCurrentIndex(0);
    setSwipedUserIds([]);
    setLikedUserIds([]);
    setHistory([]);
    setNewMatch(null);
  }, []);

  const dismissMatchModal = useCallback(() => {
    setNewMatch(null);
  }, []);

  return {
    currentProfile,
    nextProfile,
    thirdProfile,
    hasMore: currentIndex < profiles.length,
    handleSwipe,
    rewind,
    canRewind: currentIndex > 0,
    newMatch,
    dismissMatchModal,
    resetFeed,
    swipeCount,
    swipedUserIds,
    likedUserIds,
    remainingCount: Math.max(0, profiles.length - currentIndex),
  };
}
