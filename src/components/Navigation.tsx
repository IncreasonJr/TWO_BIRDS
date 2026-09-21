import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Download, Bell } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useUser } from '../context/UserContext';
import { getUnreadNotificationCount, subscribeToNotifications } from '../lib/databaseService';
import { BottomNav } from './BottomNav';

export const TopNavbar: React.FC = () => {
  const { isInstalled, promptInstall } = usePWAInstall();
  const { currentUser, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!currentUser?.id || !isAuthenticated) return;

    let isMounted = true;
    const fetchCount = () => {
      getUnreadNotificationCount(currentUser.id)
        .then((count) => {
          if (isMounted) setUnreadCount(count);
        })
        .catch((err) => console.warn('Failed to fetch unread notification count:', err));
    };

    fetchCount();

    const unsubscribe = subscribeToNotifications(currentUser.id, () => {
      fetchCount();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [currentUser?.id, isAuthenticated, location.pathname]);

  const renderBellButton = () => (
    <button
      onClick={() => navigate('/notifications')}
      className="relative p-1.5 rounded-xl text-[#FFFFFF] hover:text-[#C9A84C] hover:bg-[#333333] transition"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#C9A84C] text-[#1A1A1A] text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-glow-gold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );

  if (isInstalled) {
    // Show Logo + Two Birds title centered with Notifications bell on right
    return (
      <header className="sticky top-0 z-40 bg-[#1A1A1A] text-[#FFFFFF] px-4 py-2.5 flex items-center justify-between shadow-md border-b border-[#4A4A4A]">
        <div className="w-8" />
        <div className="flex items-center gap-2.5">
          <img
            src="/logo192.png"
            alt="Two Birds Logo"
            className="h-8 w-8 object-cover rounded-xl shadow-glow-gold border border-[#C9A84C]/30"
          />
          <span className="font-serif font-extrabold text-xl tracking-tight text-[#FFFFFF]">
            Two Birds
          </span>
        </div>
        <div>
          {renderBellButton()}
        </div>
      </header>
    );
  }

  // Website mode (not installed yet): Show Logo + Two Birds on left, Bell + Install button on right
  return (
    <header className="sticky top-0 z-40 bg-[#1A1A1A] text-[#FFFFFF] px-4 py-2.5 flex items-center justify-between shadow-md border-b border-[#4A4A4A]">
      <div className="flex items-center gap-2.5">
        <img
          src="/logo192.png"
          alt="Two Birds Logo"
          className="h-8 w-8 object-cover rounded-xl shadow-glow-gold border border-[#C9A84C]/30"
        />
        <span className="font-serif font-extrabold text-xl tracking-tight text-[#FFFFFF]">
          Two Birds
        </span>
      </div>

      <div className="flex items-center gap-2">
        {renderBellButton()}
        <button
          onClick={promptInstall}
          className="flex items-center gap-1.5 bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#D4B55B] active:scale-95 text-xs font-bold px-3 py-1.5 rounded-full shadow-glow-gold transition-all duration-200"
          title="Install Two Birds PWA"
          aria-label="Install Two Birds PWA"
        >
          <Download size={13} strokeWidth={2.5} />
          <span>Install</span>
        </button>
      </div>
    </header>
  );
};

export const BottomTabNav = BottomNav;
export { BottomNav };
