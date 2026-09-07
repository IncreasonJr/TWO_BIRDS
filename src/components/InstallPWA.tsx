import React, { useState, useEffect } from 'react';
import { Download, Check, Smartphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPWA: React.FC<{ variant?: 'banner' | 'button' | 'compact' }> = ({ variant = 'compact' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback hint for iOS Safari or browsers without beforeinstallprompt
      alert('To install Two Birds on your device:\n1. Tap the Share button in browser bar\n2. Select "Add to Home Screen"');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('[PWA] Install prompt error:', err);
    }
  };

  if (isInstalled) {
    if (variant === 'compact') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#C9A84C] bg-[#C9A84C]/10 px-2.5 py-1 rounded-full border border-[#C9A84C]/30">
          <Check size={12} className="text-[#C9A84C]" /> App Ready
        </span>
      );
    }
    return null;
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#D4B55B] active:scale-95 text-xs font-bold px-3 py-1.5 rounded-full shadow-glow-gold transition-all duration-200"
        title="Install Two Birds PWA"
      >
        <Download size={13} strokeWidth={2.5} />
        <span>Install</span>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleInstallClick}
        className="w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#D4B55B] font-bold py-3 px-4 rounded-xl shadow-glow-gold transition-all duration-200 active:scale-[0.98]"
      >
        <Download size={18} strokeWidth={2.5} />
        <span>Install Two Birds App</span>
      </button>
    );
  }

  // Banner variant
  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-[#333333] to-[#252525] border-b border-[#C9A84C]/40 px-4 py-2.5 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] p-1 border border-[#C9A84C]/30 flex items-center justify-center">
              <img src="/logo192.png" alt="Two Birds" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#FFFFFF]">Install Two Birds App</p>
              <p className="text-[10px] text-[#A0A0A0]">Fast access & offline support on your home screen</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#D4B55B] text-xs font-bold px-3 py-1.2 rounded-lg shadow-sm active:scale-95 transition-all"
            >
              Install
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="text-[#888888] hover:text-[#FFFFFF] p-1 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
