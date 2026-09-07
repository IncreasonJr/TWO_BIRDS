import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Home as HomeIcon } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center bg-[#1A1A1A] text-[#FFFFFF] space-y-5">
      <div className="w-20 h-20 rounded-full bg-[#333333] border border-[#C9A84C]/40 text-[#C9A84C] flex items-center justify-center shadow-glow-gold">
        <Sparkles className="w-10 h-10 text-[#C9A84C]" />
      </div>

      <div className="space-y-2 max-w-xs">
        <h1 className="text-4xl font-extrabold text-[#C9A84C]">404</h1>
        <h2 className="text-xl font-bold text-[#FFFFFF]">Page Not Found</h2>
        <p className="text-xs text-[#A0A0A0] leading-relaxed">
          Looks like this page flew away! Return to the discovery feed to find your match.
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] text-xs font-extrabold shadow-glow-gold flex items-center gap-2 hover:bg-[#D4B55B] transition active:scale-95"
      >
        <HomeIcon size={16} />
        Back to Discovery
      </button>
    </div>
  );
};
