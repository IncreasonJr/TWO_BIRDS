import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Match, Message, UserProfile } from '../types';
import { useUser } from './UserContext';
import {
  getUserMatches,
  getMessages,
  sendMessage as sendDbMessage,
  subscribeToMessages,
  checkForMatch as checkMutualMatch,
} from '../lib/databaseService';

interface MatchContextType {
  matches: Match[];
  activeMatch: Match | null;
  activeMatchId: string;
  activeMessages: Message[];
  loadingMatches: boolean;
  loadingMessages: boolean;
  isTyping: boolean;
  typingUsers: Record<string, boolean>;
  totalUnread: number;
  setActiveMatchId: (id: string) => void;
  createMatch: (user: UserProfile) => Promise<Match | null>;
  handleSendMessage: (text: string) => Promise<void>;
  handleSendMessageFrom: (senderId: string, text: string, targetMatchId?: string) => Promise<void>;
  handleSendVoiceNote: (audioUrl: string, duration: string) => Promise<void>;
  setTypingStatus: (matchId: string, isTyping: boolean) => void;
  isMatchTyping: (matchId: string) => boolean;
  refreshMatches: () => Promise<void>;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authUser, currentUser } = useUser();
  const currentUserId = authUser?.id || currentUser?.id;

  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatchId, setActiveMatchIdState] = useState<string>('');
  const [messagesByMatch, setMessagesByMatch] = useState<Record<string, Message[]>>({});
  const [loadingMatches, setLoadingMatches] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // 1. Fetch user matches on mount or auth change
  const refreshMatches = useCallback(async () => {
    if (!currentUserId) {
      setMatches([]);
      setLoadingMatches(false);
      return;
    }

    setLoadingMatches(true);
    try {
      const dbMatches = await getUserMatches(currentUserId);
      setMatches(dbMatches);
      if (dbMatches.length > 0 && !activeMatchId) {
        setActiveMatchIdState(dbMatches[0].id);
      }
    } catch (err) {
      console.error('[MatchContext] Error loading matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  }, [currentUserId, activeMatchId]);

  useEffect(() => {
    let mounted = true;
    if (!currentUserId) {
      setMatches([]);
      setLoadingMatches(false);
      return;
    }

    getUserMatches(currentUserId).then((dbMatches) => {
      if (mounted) {
        setMatches(dbMatches);
        if (dbMatches.length > 0 && !activeMatchId) {
          setActiveMatchIdState(dbMatches[0].id);
        }
        setLoadingMatches(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [currentUserId, activeMatchId]);

  const activeMatch = useMemo(() => {
    return matches.find((m) => m.id === activeMatchId) || matches[0] || null;
  }, [matches, activeMatchId]);

  const activeMessages = useMemo(() => {
    if (!activeMatch) return [];
    return messagesByMatch[activeMatch.id] || [];
  }, [activeMatch, messagesByMatch]);

  const totalUnread = useMemo(() => {
    return matches.filter((m) => m.unread).length;
  }, [matches]);

  // 2. Fetch messages for active match & listen to realtime updates
  useEffect(() => {
    let mounted = true;
    if (!activeMatchId) return;

    getMessages(activeMatchId).then((msgs) => {
      if (mounted) {
        setMessagesByMatch((prev) => ({
          ...prev,
          [activeMatchId]: msgs,
        }));
        setLoadingMessages(false);
      }
    });

    // 3. Realtime subscription for incoming messages
    const unsubscribe = subscribeToMessages(activeMatchId, (newMsg) => {
      if (!mounted) return;

      setMessagesByMatch((prev) => {
        const existing = prev[activeMatchId] || [];
        if (existing.some((m) => m.id === newMsg.id)) return prev;
        return {
          ...prev,
          [activeMatchId]: [...existing, newMsg],
        };
      });

      // Update match preview in matches list
      setMatches((prevMatches) =>
        prevMatches.map((m) => {
          if (m.id === activeMatchId) {
            return {
              ...m,
              lastMessage: newMsg.type === 'voice' ? '🎤 Voice note' : newMsg.text,
              lastMessageTimestamp: newMsg.timestamp,
              unread: false,
            };
          }
          return m;
        })
      );
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [activeMatchId]);

  const setTypingStatus = useCallback((matchId: string, typingState: boolean) => {
    setTypingUsers((prev) => ({
      ...prev,
      [matchId]: typingState,
    }));
  }, []);

  const isMatchTyping = useCallback((matchId: string): boolean => {
    return !!typingUsers[matchId];
  }, [typingUsers]);

  const isTyping = useMemo(() => {
    return activeMatch ? !!typingUsers[activeMatch.id] : false;
  }, [activeMatch, typingUsers]);

  const setActiveMatchId = useCallback((id: string) => {
    setActiveMatchIdState(id);
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, unread: false } : m))
    );
  }, []);

  const createMatch = useCallback(async (user: UserProfile): Promise<Match | null> => {
    if (!currentUserId) return null;

    const existing = matches.find((m) => m.userId === user.id);
    if (existing) {
      setActiveMatchIdState(existing.id);
      return existing;
    }

    try {
      const matchObj = await checkMutualMatch(currentUserId, user.id);
      if (matchObj) {
        setMatches((prev) => [matchObj, ...prev]);
        setActiveMatchIdState(matchObj.id);
        return matchObj;
      }
    } catch (err) {
      console.warn('[MatchContext] createMatch error:', err);
    }
    return null;
  }, [currentUserId, matches]);

  const handleSendMessageFrom = useCallback(async (
    senderId: string,
    text: string,
    targetMatchId?: string
  ) => {
    const matchIdToUse = targetMatchId || activeMatch?.id;
    if (!matchIdToUse || !text.trim()) return;

    try {
      const newMsg = await sendDbMessage(matchIdToUse, senderId, text.trim(), 'text');
      if (newMsg) {
        setMessagesByMatch((prev) => {
          const currentList = prev[matchIdToUse] || [];
          if (currentList.some((m) => m.id === newMsg.id)) return prev;
          return {
            ...prev,
            [matchIdToUse]: [...currentList, newMsg],
          };
        });

        setMatches((prevMatches) =>
          prevMatches.map((m) => {
            if (m.id === matchIdToUse) {
              return {
                ...m,
                lastMessage: text.trim(),
                lastMessageTimestamp: newMsg.timestamp,
              };
            }
            return m;
          })
        );
      }
    } catch (err) {
      console.error('[MatchContext] Error sending message:', err);
    }
  }, [activeMatch]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!currentUserId || !text.trim()) return;
    await handleSendMessageFrom(currentUserId, text);
  }, [currentUserId, handleSendMessageFrom]);

  const handleSendVoiceNote = useCallback(async (audioUrl: string, duration: string) => {
    if (!currentUserId || !activeMatch?.id) return;
    const matchId = activeMatch.id;

    try {
      const newMsg = await sendDbMessage(matchId, currentUserId, audioUrl, 'voice');
      if (newMsg) {
        newMsg.duration = duration;
        setMessagesByMatch((prev) => ({
          ...prev,
          [matchId]: [...(prev[matchId] || []), newMsg],
        }));

        setMatches((prev) =>
          prev.map((m) => {
            if (m.id === matchId) {
              return {
                ...m,
                lastMessage: `🎤 Voice note (${duration})`,
                lastMessageTimestamp: newMsg.timestamp,
              };
            }
            return m;
          })
        );
      }
    } catch (err) {
      console.error('[MatchContext] Error sending voice note:', err);
    }
  }, [currentUserId, activeMatch]);

  return (
    <MatchContext.Provider
      value={{
        matches,
        activeMatch,
        activeMatchId,
        activeMessages,
        loadingMatches,
        loadingMessages,
        isTyping,
        typingUsers,
        totalUnread,
        setActiveMatchId,
        createMatch,
        handleSendMessage,
        handleSendMessageFrom,
        handleSendVoiceNote,
        setTypingStatus,
        isMatchTyping,
        refreshMatches,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export function useMatches() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatches must be used within a MatchProvider');
  }
  return context;
}
