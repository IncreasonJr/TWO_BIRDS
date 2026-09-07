import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  name: string;
  avatarUrl?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ name, avatarUrl }) => {
  const firstName = name ? name.split(' ')[0] : 'Match';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-1.5 max-w-[85%] my-1.5"
    >
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt={name}
          className="w-6 h-6 rounded-full object-cover border border-[#C9A84C] mb-1 flex-shrink-0"
        />
      )}

      {/* Bubble matching Dark Gray received style */}
      <div className="px-4 py-2.5 rounded-2xl rounded-bl-none bg-[#333333] border border-[#4A4A4A] text-xs shadow-sm flex items-center gap-2">
        <span className="font-bold text-[#FFFFFF]">{firstName}</span>
        <span className="text-[#A0A0A0] font-medium">is typing</span>

        {/* Animated Gold Dots */}
        <span className="inline-flex items-center gap-1 ml-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    </motion.div>
  );
};
