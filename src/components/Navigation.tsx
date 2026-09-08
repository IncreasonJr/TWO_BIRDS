import React from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BottomNav } from './BottomNav';

export const TopNavbar: React.FC = () => {
  const { isInstalled, promptInstall } = usePWAInstall();

  if (isInstalled) {
    // Show ONLY centered Logo + Two Birds title after installation
    return (
      <header className="sticky top-0 z-40 bg-[#1A1A1A] text-[#FFFFFF] px-4 py-2.5 flex items-center justify-center shadow-md border-b border-[#4A4A4A]">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo192.png"
            alt="Two Birds Logo"
            className="h-8 w-8 object-cover rounded-xl shadow-glow-gold border border-[#C9A84C]/30"
          />
          <span className="font-extrabold text-xl tracking-tight text-[#FFFFFF]">
            Two Birds
          </span>
        </div>
      </header>
    );
  }

  // Website mode (not installed yet): Show Logo + Two Birds on left, Install button on right
  return (
    <header className="sticky top-0 z-40 bg-[#1A1A1A] text-[#FFFFFF] px-4 py-2.5 flex items-center justify-between shadow-md border-b border-[#4A4A4A]">
      <div className="flex items-center gap-2.5">
        <img
          src="/logo192.png"
          alt="Two Birds Logo"
          className="h-8 w-8 object-cover rounded-xl shadow-glow-gold border border-[#C9A84C]/30"
        />
        <span className="font-extrabold text-xl tracking-tight text-[#FFFFFF]">
          Two Birds
        </span>
      </div>

      <button
        onClick={promptInstall}
        className="flex items-center gap-1.5 bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#D4B55B] active:scale-95 text-xs font-bold px-3 py-1.5 rounded-full shadow-glow-gold transition-all duration-200"
        title="Install Two Birds PWA"
      >
        <Download size={13} strokeWidth={2.5} />
        <span>Install</span>
      </button>
    </header>
  );
};

export const BottomTabNav = BottomNav;
export { BottomNav };
