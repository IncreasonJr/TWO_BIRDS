import { useState, useEffect, useCallback } from 'react';
import { UserProfile, Match } from '../types';
import {
  getAllProfilesExcept,
  getSwipedIds,
  saveSwipe,
  checkForMatch as checkMutualMatch,
  clearUserSwipes,
} from '../lib/databaseService';
import { useUser } from '../context/UserContext';
import { useSubscription } from './useSubscription';

export function useSwipe() {
  const { authUser, currentUser, incrementSwipes, resetSwipesCount } = useUser();
  const { isPremium } = useSubscription();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [swipedUserIds, setSwipedUserIds] = useState<string[]>([]);
  const [likedUserIds, setLikedUserIds] = useState<string[]>([]);
  const [newMatch, setNewMatch] = useState<UserProfile | null>(null);
  const [createdMatchObj, setCreatedMatchObj] = useState<Match | null>(null);
  const [history, setHistory] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const currentUserId = authUser?.id || currentUser?.id;
  const preferredGender = currentUser?.preferredGender || 'Everyone';

  // Load profiles and swiped user IDs from Supabase
  const reloadFeed = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const swiped = await getSwipedIds(currentUserId);
      setSwipedUserIds(swiped);
      const feedProfiles = await getAllProfilesExcept(currentUserId, swiped, preferredGender, isPremium);
      setProfiles(feedProfiles);
      setCurrentIndex(0);
    } catch (err) {
      console.error('[useSwipe] Error reloading feed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, preferredGender, isPremium]);

  useEffect(() => {
    let mounted = true;
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    async function fetchFeed() {
      try {
        const swiped = await getSwipedIds(currentUserId);
        if (!mounted) return;
        setSwipedUserIds(swiped);

        const feedProfiles = await getAllProfilesExcept(currentUserId, swiped, preferredGender, isPremium);
        if (!mounted) return;
        setProfiles(feedProfiles);
        setCurrentIndex(0);
      } catch (err) {
        console.error('[useSwipe] Error loading feed:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchFeed();

    return () => {
      mounted = false;
    };
  }, [currentUserId, preferredGender, isPremium]);

  const currentProfile = profiles[currentIndex] || null;
  const nextProfile = profiles[currentIndex + 1] || null;
  const thirdProfile = profiles[currentIndex + 2] || null;

  const handleSwipe = useCallback(
    async (direction: 'left' | 'right') => {
      if (!currentProfile || !currentUserId) return;

      const swipedProfile = currentProfile;
      const swipedId = swipedProfile.id;

      // Update local state immediately for snappy UI animation
      setSwipedUserIds((prev) => [...prev, swipedId]);
      setHistory((prev) => [...prev, swipedProfile]);
      setCurrentIndex((prev) => prev + 1);
      incrementSwipes();

      // Persist swipe to Supabase and await result before checking for mutual match
      const swipeDirection: 'like' | 'pass' = direction === 'right' ? 'like' : 'pass';
      try {
        const swipeRes = await saveSwipe(currentUserId, swipedId, swipeDirection);
        if (!swipeRes.success) {
          console.error('[useSwipe] saveSwipe failed:', swipeRes.error);
        }
      } catch (swipeErr) {
        console.error('[useSwipe] saveSwipe unexpected error:', swipeErr);
      }

      if (direction === 'right') {
        setLikedUserIds((prev) => [...prev, swipedId]);

        // Check for mutual match in Supabase
        try {
          const matchResult = await checkMutualMatch(currentUserId, swipedId);
          if (matchResult) {
            setCreatedMatchObj(matchResult);
            setNewMatch(swipedProfile);
          }
        } catch (matchErr) {
          console.error('[useSwipe] checkForMatch error:', matchErr);
        }
      }
    },
    [currentProfile, currentUserId, incrementSwipes]
  );

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

  const resetFeed = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentUserId) return { success: false, error: 'User not signed in' };
    setLoading(true);
    try {
      const clearRes = await clearUserSwipes(currentUserId);
      if (!clearRes.success) {
        return clearRes;
      }
      setSwipedUserIds([]);
      setLikedUserIds([]);
      setHistory([]);
      resetSwipesCount();
      const feedProfiles = await getAllProfilesExcept(currentUserId, [], preferredGender, isPremium);
      setProfiles(feedProfiles);
      setCurrentIndex(0);
      return { success: true };
    } catch (err: any) {
      console.error('[useSwipe] Error resetting feed:', err);
      return { success: false, error: err?.message || 'Failed to reset discovery feed' };
    } finally {
      setLoading(false);
    }
  }, [currentUserId, preferredGender, isPremium, resetSwipesCount]);

  const dismissMatchModal = useCallback(() => {
    setNewMatch(null);
    setCreatedMatchObj(null);
  }, []);

  return {
    profiles,
    currentProfile,
    nextProfile,
    thirdProfile,
    hasMore: currentIndex < profiles.length,
    loading,
    handleSwipe,
    rewind,
    canRewind: currentIndex > 0,
    newMatch,
    createdMatchObj,
    dismissMatchModal,
    resetFeed,
    reloadFeed,
    swipedUserIds,
    likedUserIds,
    remainingCount: Math.max(0, profiles.length - currentIndex),
  };
}
