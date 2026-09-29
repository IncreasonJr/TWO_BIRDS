import React from 'react';
import { Crown, BadgeCheck } from 'lucide-react';

export interface PremiumBadgeProps {
  isPremium?: boolean;
  size?: number;
  variant?: 'crown' | 'badge';
  className?: string;
  showTooltip?: boolean;
}

/**
 * PremiumBadge
 * Displays an exclusive gold badge next to Two Birds Premium members' names.
 */
export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  isPremium = true,
  size = 15,
  variant = 'crown',
  className = '',
  showTooltip = true,
}) => {
  if (!isPremium) return null;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 text-[#C9A84C] relative group cursor-default select-none ${className}`}
      title="Two Birds Premium"
      aria-label="Two Birds Premium Member"
    >
      {variant === 'crown' ? (
        <Crown
          size={size}
          className="fill-[#C9A84C] text-[#C9A84C] drop-shadow-[0_0_6px_rgba(201,168,76,0.6)]"
        />
      ) : (
        <BadgeCheck
          size={size}
          className="fill-[#C9A84C]/20 text-[#C9A84C] drop-shadow-[0_0_6px_rgba(201,168,76,0.6)]"
        />
      )}

      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1A1A1A] text-[#C9A84C] border border-[#C9A84C]/40 text-[10px] font-extrabold whitespace-nowrap shadow-xl z-50 pointer-events-none">
          Two Birds Premium
        </span>
      )}
    </span>
  );
};

export default PremiumBadge;
