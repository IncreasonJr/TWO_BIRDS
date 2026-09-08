import React from 'react';
import { RotateCcw, X, Heart } from 'lucide-react';

interface SwipeControlsProps {
  onPass: () => void;
  onLike: () => void;
  onRewind: () => void;
  canRewind: boolean;
  disabled?: boolean;
}

export const SwipeControls: React.FC<SwipeControlsProps> = ({
  onPass,
  onLike,
  onRewind,
  canRewind,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-10 pt-1.5 pb-0 px-4 z-30 shrink-0 w-full bg-[#1A1A1A] select-none">
      {/* 1. Refresh / Rewind Button */}
      <button
        onClick={onRewind}
        disabled={!canRewind || disabled}
        className={`p-3 rounded-full bg-[#333333] border-2 border-[#4A4A4A] text-[#C9A84C] transition-all ${
          canRewind && !disabled
            ? 'hover:scale-110 active:scale-95 shadow-md hover:border-[#C9A84C]'
            : 'opacity-40 cursor-not-allowed'
        }`}
        title="Rewind"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* 2. Pass / Dislike (X) Button */}
      <button
        onClick={onPass}
        disabled={disabled}
        className={`p-3 rounded-full bg-[#333333] border-2 border-[#4A4A4A] text-[#FFFFFF] transition-all shadow-md ${
          disabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-[#4A4A4A]/40 hover:scale-110 active:scale-95'
        }`}
        title="Pass"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* 3. Like (Heart) Button */}
      <button
        onClick={onLike}
        disabled={disabled}
        className={`p-3 rounded-full bg-[#C9A84C] border-2 border-[#C9A84C] text-[#1A1A1A] transition-all shadow-glow-gold ${
          disabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:scale-110 active:scale-95'
        }`}
        title="Like"
      >
        <Heart className="w-5 h-5 fill-[#1A1A1A] stroke-[#1A1A1A]" />
      </button>
    </div>
  );
};
