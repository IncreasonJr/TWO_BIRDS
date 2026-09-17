import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldCheck, UserCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getBlockedUsers, unblockUser } from '../lib/databaseService';
import { UserProfile } from '../types';

export const BlockedUsers: React.FC = () => {
  const navigate = useNavigate();
  const { authUser, currentUser } = useUser();
  const currentUserId = authUser?.id || currentUser?.id;

  const [blockedUsers, setBlockedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchBlocked = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const users = await getBlockedUsers(currentUserId);
        if (mounted) {
          setBlockedUsers(users);
        }
      } catch (err) {
        console.error('Error fetching blocked users:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBlocked();
    return () => {
      mounted = false;
    };
  }, [currentUserId]);

  const handleUnblock = async (targetUserId: string) => {
    if (!currentUserId) return;
    setUnblockingId(targetUserId);

    const res = await unblockUser(currentUserId, targetUserId);
    if (res.success) {
      setBlockedUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    }
    setUnblockingId(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#FFFFFF] flex flex-col max-w-md mx-auto relative pb-12">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#1A1A1A]/90 backdrop-blur-md border-b border-[#333333] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-full hover:bg-[#2A2A2A] text-[#CCCCCC] hover:text-[#FFFFFF] transition"
          aria-label="Back to Profile"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white font-serif">Blocked Users</h1>
        <div className="w-9" /> {/* Spacer for balance */}
      </div>

      <div className="p-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#A0A0A0] space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#C9A84C]" />
            <p className="text-xs">Loading blocked users...</p>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-6">
            <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">No Blocked Users</h2>
              <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-xs">
                When you block someone, they will appear here. Blocked users cannot see your profile, match with you, or message you.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[#A0A0A0] px-1">
              {blockedUsers.length} blocked {blockedUsers.length === 1 ? 'user' : 'users'}
            </p>
            <AnimatePresence>
              {blockedUsers.map((user) => {
                const photo = user.photos && user.photos.length > 0 ? user.photos[0] : null;
                const isUnblocking = unblockingId === user.id;

                return (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3.5 rounded-2xl bg-[#242424] border border-[#333333] flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {photo ? (
                        <img
                          src={photo}
                          alt={user.name}
                          className="w-11 h-11 rounded-full object-cover border border-[#4A4A4A] flex-shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#333333] border border-[#4A4A4A] flex items-center justify-center text-[#C9A84C] font-extrabold text-sm flex-shrink-0 font-serif">
                          {getInitials(user.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate font-serif">
                          {user.name}
                        </h3>
                        <p className="text-xs text-[#A0A0A0] truncate">
                          {user.major ? `${user.major}` : user.university || 'Student'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleUnblock(user.id)}
                      disabled={isUnblocking}
                      className="py-1.5 px-3.5 rounded-xl bg-[#333333] hover:bg-[#444444] text-xs font-semibold text-[#CCCCCC] hover:text-[#FFFFFF] border border-[#4A4A4A] transition disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                    >
                      {isUnblocking ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-[#C9A84C]" />
                          <span>Unblock</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsers;
