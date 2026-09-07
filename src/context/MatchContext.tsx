import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Match, Message, UserProfile } from '../types';
import { MOCK_MATCHES } from '../data/mockMatches';

const AUTO_RESPONSES = [
  "That's so cool! Tell me more.",
  "Haha, I totally get that!",
  "Oh wow, same here!",
  "No way, me too! 😁",
  "That's awesome! We should chat more."
];

interface MatchContextType {
  matches: Match[];
  activeMatch: Match | null;
  activeMatchId: string;
  activeMessages: Message[];
  isTyping: boolean;
  typingUsers: Record<string, boolean>;
  totalUnread: number;
  setActiveMatchId: (id: string) => void;
  createMatch: (user: UserProfile) => Match;
  handleSendMessage: (text: string) => void;
  handleSendMessageFrom: (senderId: string, text: string) => void;
  handleSendVoiceNote: (audioUrl: string, duration: string) => void;
  setTypingStatus: (matchId: string, isTyping: boolean) => void;
  isMatchTyping: (matchId: string) => boolean;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [activeMatchId, setActiveMatchIdState] = useState<string>(MOCK_MATCHES[0]?.id || '');
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  const activeMatch = useMemo(() => {
    return matches.find((m) => m.id === activeMatchId) || matches[0] || null;
  }, [matches, activeMatchId]);

  const activeMessages = useMemo(() => {
    return activeMatch?.messages || [];
  }, [activeMatch]);

  const totalUnread = useMemo(() => {
    return matches.filter((m) => m.unread).length;
  }, [matches]);

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

  const createMatch = useCallback((user: UserProfile): Match => {
    const existing = matches.find((m) => m.userId === user.id);
    if (existing) {
      setActiveMatchIdState(existing.id);
      return existing;
    }

    const newMatchObj: Match = {
      id: `match-${Date.now()}`,
      userId: user.id,
      name: user.name,
      age: user.age,
      major: user.major,
      photos: user.photos,
      onlineStatus: 'online',
      lastActive: new Date(),
      matchedAt: 'Just now',
      users: ['current-user', user.id],
      user: user,
      lastMessage: 'Matched! Send the first message.',
      lastMessageTimestamp: 'Just now',
      unread: true,
      online: true,
      messages: [],
    };

    setMatches((prev) => [newMatchObj, ...prev]);
    setActiveMatchIdState(newMatchObj.id);
    return newMatchObj;
  }, [matches]);

  const handleSendMessageFrom = useCallback((senderId: string, text: string) => {
    if (!activeMatch || !text.trim()) return;

    const isCurrentUserSender = senderId === 'current-user';
    const receiverId = isCurrentUserSender ? activeMatch.userId : 'current-user';

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      matchId: activeMatch.id,
      senderId: senderId,
      receiverId: receiverId,
      text: text.trim(),
      timestamp: timeString,
      isRead: true,
      type: 'text'
    };

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === activeMatch.id) {
          return {
            ...m,
            lastMessage: text.trim(),
            lastMessageTimestamp: timeString,
            messages: [...m.messages, newMessage],
          };
        }
        return m;
      })
    );
  }, [activeMatch]);

  const handleSendVoiceNote = useCallback((audioUrl: string, duration: string) => {
    if (!activeMatch) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const voiceMessage: Message = {
      id: `voice-${Date.now()}`,
      matchId: activeMatch.id,
      senderId: 'current-user',
      receiverId: activeMatch.userId,
      text: `🎤 Voice note (${duration})`,
      timestamp: timeString,
      isRead: true,
      type: 'voice',
      audioUrl: audioUrl,
      duration: duration
    };

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === activeMatch.id) {
          return {
            ...m,
            lastMessage: `🎤 Voice note (${duration})`,
            lastMessageTimestamp: timeString,
            messages: [...m.messages, voiceMessage],
          };
        }
        return m;
      })
    );

    // Trigger typing indicator for active match
    const matchId = activeMatch.id;
    const matchUserId = activeMatch.userId;
    setTypingStatus(matchId, true);

    const randomDelay = Math.floor(Math.random() * 1500) + 1500; // 1.5 - 3 seconds

    setTimeout(() => {
      setTypingStatus(matchId, false);
      const replyText = "Loved your voice note! 🎧";
      handleSendMessageFrom(matchUserId, replyText);
    }, randomDelay);
  }, [activeMatch, handleSendMessageFrom, setTypingStatus]);

  const handleSendMessage = useCallback((text: string) => {
    if (!activeMatch || !text.trim()) return;

    handleSendMessageFrom('current-user', text);

    // Trigger typing indicator for active match
    const matchId = activeMatch.id;
    const matchUserId = activeMatch.userId;
    setTypingStatus(matchId, true);

    const randomDelay = Math.floor(Math.random() * 1500) + 1500; // 1.5 - 3 seconds

    setTimeout(() => {
      setTypingStatus(matchId, false);
      const replyText = AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)];
      handleSendMessageFrom(matchUserId, replyText);
    }, randomDelay);
  }, [activeMatch, handleSendMessageFrom, setTypingStatus]);

  return (
    <MatchContext.Provider
      value={{
        matches,
        activeMatch,
        activeMatchId,
        activeMessages,
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
