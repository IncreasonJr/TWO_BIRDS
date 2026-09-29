import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Lock,
  Crown,
  Check,
  X,
  Users,
  Sparkles,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSubscription } from '../hooks/useSubscription';

interface GenderFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgradeModal: () => void;
  onFilterChanged?: (gender: 'Women' | 'Men' | 'Everyone') => void;
}

const FILTER_OPTIONS: { label: 'Women' | 'Men' | 'Everyone'; description: string }[] = [
  { label: 'Women', description: 'Show female students only' },
  { label: 'Men', description: 'Show male students only' },
  { label: 'Everyone', description: 'Show all campus students' },
];

export const GenderFilter: React.FC<GenderFilterProps> = ({
  isOpen,
  onClose,
  onOpenUpgradeModal,
  onFilterChanged,
}) => {
  const { currentUser, updateProfile } = useUser();
  const { isPremium } = useSubscription();

  const currentSelection: 'Women' | 'Men' | 'Everyone' =
    (currentUser?.preferredGender as any) || 'Everyone';

  const [selected, setSelected] = useState<'Women' | 'Men' | 'Everyone'>(currentSelection);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSelectOption = async (option: 'Women' | 'Men' | 'Everyone') => {
    if (!isPremium) {
      onOpenUpgradeModal();
      return;
    }

    setSelected(option);
    setIsSaving(true);
    try {
      await updateProfile({ preferredGender: option });
      if (onFilterChanged) {
        onFilterChanged(option);
      }
    } catch (err) {
      console.error('Failed to update preferred gender:', err);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal / Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-sm bg-[#1F1F1F] border border-[#C9A84C]/50 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl overflow-hidden text-[#FFFFFF] z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#333333]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center border border-[#C9A84C]/40">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold font-serif text-[#FFFFFF]">Discovery Filter</h3>
                <p className="text-[10px] text-[#A0A0A0]">Who would you like to see?</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-[#333333] text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#4A4A4A] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-4 space-y-3">
            {isPremium ? (
              // Premium: Active Filter Options
              <div className="space-y-2">
                {FILTER_OPTIONS.map((opt) => {
                  const isSelected = selected === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectOption(opt.label)}
                      disabled={isSaving}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#C9A84C]/15 border-[#C9A84C] shadow-glow-gold'
                          : 'bg-[#2A2A2A] border-[#4A4A4A] hover:border-[#777777]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-[#C9A84C] text-[#1A1A1A]' : 'bg-[#1A1A1A] text-[#A0A0A0]'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-[#C9A84C]' : 'text-[#FFFFFF]'}`}>
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-[#A0A0A0] font-medium">{opt.description}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#C9A84C] text-[#1A1A1A] flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Free User: Locked Version
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#2A2A2A] border border-[#4A4A4A] text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#FFFFFF]">Gender Filter is a Premium Feature</h4>
                    <p className="text-[11px] text-[#A0A0A0] mt-1 leading-relaxed">
                      Upgrade to Two Birds Premium to filter your campus discovery feed by Women, Men, or Everyone.
                    </p>
                  </div>
                </div>

                {/* Disabled preview of options */}
                <div className="space-y-2 opacity-50 pointer-events-none">
                  {FILTER_OPTIONS.map((opt) => (
                    <div
                      key={opt.label}
                      className="p-3 rounded-2xl bg-[#2A2A2A] border border-[#4A4A4A] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-[#A0A0A0]" />
                        <span className="text-xs font-bold text-[#FFFFFF]">{opt.label}</span>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-[#A0A0A0]" />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpgradeModal();
                  }}
                  className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 fill-[#1A1A1A]" />
                  <span>Upgrade to Premium to Filter</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A0A0A0] pt-1">
            <Sparkles className="w-3 h-3 text-[#C9A84C]" />
            <span>Preferences are applied instantly to your card feed</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
