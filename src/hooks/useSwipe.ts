import { useState, useCallback } from 'react';
import { UserProfile } from '../types';
import { MOCK_PROFILES } from '../data/mockUsers';

export function useSwipe() {
  const [profiles] = useState<UserProfile[]>(MOCK_PROFILES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [newMatch, setNewMatch] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<UserProfile[]>([]);

  const currentProfile = profiles[currentIndex] || null;

  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up') => {
    if (!currentProfile) return;

    setHistory((prev) => [...prev, currentProfile]);

    // Simulate match on like / superlike
    if ((direction === 'right' || direction === 'up') && Math.random() > 0.4) {
      setNewMatch(currentProfile);
    }

    setCurrentIndex((prev) => prev + 1);
  }, [currentProfile]);

  const rewind = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setHistory((prev) => prev.slice(0, -1));
    }
  }, [currentIndex]);

  const dismissMatchModal = useCallback(() => {
    setNewMatch(null);
  }, []);

  return {
    currentProfile,
    nextProfile: profiles[currentIndex + 1] || null,
    hasMore: currentIndex < profiles.length,
    loading: false,
    handleSwipe,
    rewind,
    canRewind: currentIndex > 0,
    newMatch,
    dismissMatchModal,
    remainingCount: Math.max(0, profiles.length - currentIndex),
  };
}
