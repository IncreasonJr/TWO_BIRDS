import { useState, useEffect, useCallback } from 'react';
import { UserProfile, Match } from '../types';
import {
  getAllProfilesExcept,
  getSwipedIds,
  saveSwipe,
  checkForMatch as checkMutualMatch,
} from '../lib/databaseService';
import { useUser } from '../context/UserContext';

export function useSwipe() {
  const { authUser, currentUser, incrementSwipes } = useUser();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [swipedUserIds, setSwipedUserIds] = useState<string[]>([]);
  const [likedUserIds, setLikedUserIds] = useState<string[]>([]);
  const [newMatch, setNewMatch] = useState<UserProfile | null>(null);
  const [createdMatchObj, setCreatedMatchObj] = useState<Match | null>(null);
  const [history, setHistory] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const currentUserId = authUser?.id || currentUser?.id;

  // Load profiles and swiped user IDs from Supabase
  const reloadFeed = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const swiped = await getSwipedIds(currentUserId);
      setSwipedUserIds(swiped);
      const feedProfiles = await getAllProfilesExcept(currentUserId, swiped);
      setProfiles(feedProfiles);
      setCurrentIndex(0);
    } catch (err) {
      console.error('[useSwipe] Error reloading feed:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

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

        const feedProfiles = await getAllProfilesExcept(currentUserId, swiped);
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
  }, [currentUserId]);

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

      // Persist swipe to Supabase
      const swipeDirection: 'like' | 'pass' = direction === 'right' ? 'like' : 'pass';
      saveSwipe(currentUserId, swipedId, swipeDirection).catch((err) => {
        console.warn('[useSwipe] saveSwipe background error:', err);
      });

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
          console.warn('[useSwipe] checkForMatch error:', matchErr);
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

  const resetFeed = useCallback(() => {
    reloadFeed();
  }, [reloadFeed]);

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
    swipedUserIds,
    likedUserIds,
    remainingCount: Math.max(0, profiles.length - currentIndex),
  };
}
