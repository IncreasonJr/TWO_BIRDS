import { useState } from 'react';
import { Match, Message } from '../types';
import { MOCK_INITIAL_MATCHES, MOCK_INITIAL_MESSAGES } from '../data/mockUsers';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>(MOCK_INITIAL_MATCHES);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(MOCK_INITIAL_MATCHES[0]?.id || null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(MOCK_INITIAL_MESSAGES);

  const activeMatch = matches.find((m) => m.id === activeMatchId) || null;
  const activeMessages = activeMatchId ? messagesMap[activeMatchId] || [] : [];

  const handleSendMessage = (text: string) => {
    if (!activeMatchId || !text.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      matchId: activeMatchId,
      senderId: 'current-user',
      receiverId: activeMatch?.user.id || 'partner',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    // Append to local messages state
    setMessagesMap((prev) => ({
      ...prev,
      [activeMatchId]: [...(prev[activeMatchId] || []), newMsg],
    }));

    // Update match preview in local matches state
    setMatches((prev) =>
      prev.map((m) =>
        m.id === activeMatchId
          ? {
              ...m,
              lastMessage: text,
              lastMessageTimestamp: newMsg.timestamp,
            }
          : m
      )
    );

    // Simulate response after 1.5 seconds
    setTimeout(() => {
      const replyMsg: Message = {
        id: `reply-${Date.now()}`,
        matchId: activeMatchId,
        senderId: activeMatch?.user.id || 'partner',
        receiverId: 'current-user',
        text: `That sounds awesome! Let's meet up at the campus quad after my lecture! 🎉`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true,
      };

      setMessagesMap((prev) => ({
        ...prev,
        [activeMatchId]: [...(prev[activeMatchId] || []), replyMsg],
      }));

      setMatches((prev) =>
        prev.map((m) =>
          m.id === activeMatchId
            ? {
                ...m,
                lastMessage: replyMsg.text,
                lastMessageTimestamp: replyMsg.timestamp,
              }
            : m
        )
      );
    }, 1500);
  };

  return {
    matches,
    activeMatch,
    activeMatchId,
    setActiveMatchId,
    activeMessages,
    handleSendMessage,
    loadingMatches: false,
    totalUnread: matches.filter((m) => m.unread).length,
  };
}
