import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  ArrowLeft,
  CheckCheck,
  Trash2,
  Check,
  Loader2
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  subscribeToNotifications
} from '../lib/databaseService';
import { AppNotification, NotificationType } from '../types';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export const Notifications: React.FC = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const loadNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const items = await getUserNotifications(currentUser.id, 50);
      setNotifications(items);
    } catch (err) {
      console.warn('[Notifications] Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadNotifications();

    if (currentUser?.id) {
      const unsubscribe = subscribeToNotifications(currentUser.id, (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev.filter((n) => n.id !== newNotification.id)]);
      });
      return () => unsubscribe();
    }
  }, [currentUser?.id, loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = async () => {
    if (!currentUser?.id || unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const res = await markAllNotificationsAsRead(currentUser.id);
    if (res.success) {
      showToast('All notifications marked as read');
    } else {
      loadNotifications();
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      markNotificationAsRead(notif.id).catch((err) => {
        console.warn('Failed to mark notification as read:', err);
      });
    }

    // Direct routing based on notification type and data payload
    if (notif.type === 'message') {
      const matchId = notif.data?.matchId || notif.data?.match_id;
      if (matchId) {
        navigate(`/chat?matchId=${encodeURIComponent(matchId)}`);
      } else {
        navigate('/matches');
      }
    } else if (notif.type === 'match') {
      const matchId = notif.data?.matchId || notif.data?.match_id;
      if (matchId) {
        navigate(`/chat?matchId=${encodeURIComponent(matchId)}`);
      } else {
        navigate('/matches');
      }
    } else if (notif.type === 'like') {
      navigate('/');
    } else if (notif.data?.url) {
      navigate(notif.data.url);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const res = await deleteNotification(id);
    if (res.success) {
      showToast('Notification deleted');
    } else {
      loadNotifications();
    }
  };

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case 'match':
        return (
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-pink-500/20" />
          </div>
        );
      case 'message':
        return (
          <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center shrink-0 shadow-glow-gold">
            <MessageCircle className="w-5 h-5" />
          </div>
        );
      case 'like':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-[#4A4A4A]/20 border border-[#4A4A4A] text-[#A0A0A0] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1A1A1A] text-[#FFFFFF] overflow-hidden select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#1A1A1A]/95 backdrop-blur-md px-4 py-3 border-b border-[#4A4A4A] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#333333] transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-serif font-extrabold text-[#FFFFFF] tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#C9A84C] text-[#1A1A1A]">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 text-xs font-bold text-[#C9A84C] hover:text-[#D4B55B] px-2.5 py-1.5 rounded-lg hover:bg-[#C9A84C]/10 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </header>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#333333] border border-[#C9A84C]/50 text-[#FFFFFF] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold"
          >
            <Check className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-[#4A4A4A]/40 scrollbar-thin">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-[#A0A0A0]">
            <Loader2 className="w-7 h-7 animate-spin text-[#C9A84C]" />
            <span className="text-xs font-semibold">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#333333] border border-[#C9A84C]/30 flex items-center justify-center shadow-glow-gold">
              <Bell className="w-8 h-8 text-[#C9A84C]" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="font-serif font-extrabold text-lg text-[#FFFFFF]">
                You're all caught up! 🎉
              </h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                When you get new campus matches, messages, or likes, they'll show up here.
              </p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleNotificationClick(notif)}
              className={`px-4 py-3.5 flex items-start gap-3.5 cursor-pointer transition-colors ${
                notif.isRead
                  ? 'bg-transparent hover:bg-[#333333]/30'
                  : 'bg-[#C9A84C]/5 hover:bg-[#C9A84C]/10 border-l-2 border-l-[#C9A84C]'
              }`}
            >
              {renderIcon(notif.type)}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs font-bold truncate ${notif.isRead ? 'text-[#FFFFFF]' : 'text-[#C9A84C]'}`}>
                    {notif.title}
                  </p>
                  <span className="text-[10px] text-[#A0A0A0] whitespace-nowrap">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-[#E0E0E0] mt-0.5 line-clamp-2 leading-relaxed">
                  {notif.body}
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-center shrink-0">
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] shadow-glow-gold" />
                )}
                <button
                  onClick={(e) => handleDelete(e, notif.id)}
                  className="p-1.5 text-[#A0A0A0] hover:text-red-400 hover:bg-[#4A4A4A]/40 rounded-lg transition"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
