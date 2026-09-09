import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export const UpdateNotification: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const handleSWUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<ServiceWorkerRegistration>;
      const registration = customEvent.detail;
      if (registration && registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowNotification(true);
      }
    };

    window.addEventListener('swUpdated', handleSWUpdated);

    // Also check on load if navigator.serviceWorker has a waiting worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          setWaitingWorker(reg.waiting);
          setShowNotification(true);
        }
      });
    }

    return () => {
      window.removeEventListener('swUpdated', handleSWUpdated);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowNotification(false);
    // Reload page to activate new service worker & new assets
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          className="fixed top-4 inset-x-4 max-w-md mx-auto z-[60] bg-[#333333] border border-[#C9A84C]/50 rounded-2xl p-4 shadow-2xl text-[#FFFFFF] backdrop-blur-md"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/40 shadow-glow-gold flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#C9A84C] animate-pulse" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-sm font-extrabold text-[#C9A84C] tracking-tight">
                New Version Available!
              </h4>
              <p className="text-xs text-[#FFFFFF]/80 mt-0.5 font-medium leading-relaxed">
                An update for Two Birds is ready. Update now to get the latest features and fixes.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 rounded-xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#D4B55B] active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Now</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="px-3.5 py-2 rounded-xl bg-[#1A1A1A] text-[#A0A0A0] hover:text-[#FFFFFF] border border-[#4A4A4A] text-xs font-bold transition active:scale-95"
                >
                  Later
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-full text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#1A1A1A] transition flex-shrink-0"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
