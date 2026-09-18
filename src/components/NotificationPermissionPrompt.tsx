import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sparkles, X, Heart } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { requestPushPermission, getPermissionStatus } from '../lib/oneSignalClient';

export const NotificationPermissionPrompt: React.FC = () => {
  const { currentUser, isAuthenticated } = useUser();
  const location = useLocation();
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) return;
    if (location.pathname !== '/') return;

    const hasPhotos = currentUser.photos && currentUser.photos.length > 0;
    if (!hasPhotos) return;

    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (getPermissionStatus() !== 'default') return;

    const storageKey = `tb_notif_prompt_dismissed_${currentUser.id}`;
    if (localStorage.getItem(storageKey) === 'true') return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentUser, isAuthenticated, location.pathname]);

  const handleEnable = async () => {
    if (!currentUser?.id) return;
    const storageKey = `tb_notif_prompt_dismissed_${currentUser.id}`;
    localStorage.setItem(storageKey, 'true');
    setVisible(false);

    try {
      await requestPushPermission();
    } catch (err) {
      console.warn('Failed to request push permission:', err);
    }
  };

  const handleDismiss = () => {
    if (currentUser?.id) {
      const storageKey = `tb_notif_prompt_dismissed_${currentUser.id}`;
      localStorage.setItem(storageKey, 'true');
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-[#1A1A1A] border border-[#C9A84C]/50 rounded-2xl p-4 shadow-2xl shadow-black/80 relative backdrop-blur-xl">
            {/* Dismiss Close Icon */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#333333] transition"
              aria-label="Dismiss prompt"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-11 h-11 rounded-2xl bg-[#333333] border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] shadow-glow-gold shrink-0">
                <Bell className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-serif font-extrabold text-sm text-[#FFFFFF] tracking-tight">
                    Never miss a match
                  </h4>
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                </div>
                <p className="text-xs text-[#A0A0A0] leading-relaxed">
                  Get instant campus alerts when someone likes you back or sends a chat message.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3.5 pt-3 border-t border-[#4A4A4A]/50 flex items-center gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#333333] transition active:scale-95"
              >
                Maybe Later
              </button>
              <button
                onClick={handleEnable}
                className="flex-1 py-2 px-3 rounded-xl bg-[#C9A84C] hover:bg-[#D4B55B] text-[#1A1A1A] text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-glow-gold transition active:scale-95"
              >
                <Heart className="w-3.5 h-3.5 fill-[#1A1A1A]" />
                <span>Enable Alerts</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPermissionPrompt;
