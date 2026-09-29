import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  ShieldCheck,
  ArrowLeft,
  Filter,
  Check,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { PremiumUpgradeModal } from '../components/PremiumUpgradeModal';

export const Premium: React.FC = () => {
  const navigate = useNavigate();
  const subscription = useSubscription();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const perks = [
    {
      icon: Filter,
      title: 'Gender Filter',
      desc: 'Filter campus matches by Women, Men, or Everyone.',
    },
    {
      icon: Crown,
      title: 'Verified Badge',
      desc: 'Gold crown badge on profile, matches, and chats.',
    },
    {
      icon: Zap,
      title: '3x Discovery',
      desc: 'Shown to 3x more students on your campus.',
    },
    {
      icon: RotateCcw,
      title: 'Rewind Swipes',
      desc: 'Take back your last swipe anytime with zero limits.',
    },
  ];

  return (
    <div className="flex flex-col h-full flex-1 max-w-md mx-auto w-full bg-[#1A1A1A] text-[#FFFFFF] overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <header className="shrink-0 z-30 bg-[#1A1A1A]/95 backdrop-blur-md px-4 py-3 border-b border-[#333333] flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-[#2A2A2A] text-[#FFFFFF] hover:bg-[#333333] transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-[#C9A84C] fill-[#C9A84C]" />
          <span className="font-serif font-extrabold text-sm tracking-wide text-[#C9A84C]">
            Two Birds Premium
          </span>
        </div>
        <div className="w-9" />
      </header>

      {/* Hero Section: Premium Badge & Inscription with generous breathing room */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-6 overflow-hidden min-h-0 text-center">
        {/* Ambient Gold Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-44 bg-[#C9A84C]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Crown Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18 }}
          className="inline-flex items-center justify-center w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-br from-[#C9A84C]/35 to-[#C9A84C]/10 border-2 border-[#C9A84C] shadow-glow-gold text-[#C9A84C] shrink-0 mb-3"
        >
          <Crown className="w-10 h-10 sm:w-11 sm:h-11 fill-[#C9A84C]" />
        </motion.div>

        {/* Inscription */}
        <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-[#FFFFFF] tracking-tight leading-snug max-w-[270px] mx-auto">
          Unlock the full campus experience
        </h1>
      </div>

      {/* Lower Section: Shifted-down Cards & Actions */}
      <div className="shrink-0 px-4 pb-4 space-y-2.5">
        {/* 2x2 Perks Cards Grid */}
        <div className="grid grid-cols-2 gap-2">
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <div
                key={i}
                className="p-2.5 rounded-2xl bg-[#222222] border border-[#3A3A3A] flex flex-col justify-between hover:border-[#C9A84C]/40 transition shadow-sm"
              >
                <div className="p-1.5 rounded-xl bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 w-fit mb-1.5 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#FFFFFF] leading-tight">
                    {perk.title}
                  </h3>
                  <p className="text-[10px] text-[#A0A0A0] mt-0.5 leading-snug line-clamp-2">
                    {perk.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing & Upgrade Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#2A2A2A] to-[#222222] border border-[#C9A84C]/60 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="px-2 py-0.5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] text-[9px] font-extrabold uppercase tracking-wider">
                Monthly Pass
              </span>
              <p className="text-xl font-serif font-extrabold text-[#C9A84C] mt-0.5">
                GHS 47.34 <span className="text-[11px] font-sans font-medium text-[#FFFFFF]/70">/ mo</span>
              </p>
            </div>

            {subscription.isPremium ? (
              <div className="px-3 py-1.5 rounded-full bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs flex items-center gap-1 shadow-glow-gold">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Active
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 active:scale-95 transition flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 fill-[#1A1A1A]" /> Upgrade Now
              </button>
            )}
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-[#4A4A4A]/60 flex items-center justify-between text-[10px] text-[#A0A0A0] px-0.5">
            <span>
              {subscription.isPremium
                ? subscription.formattedExpiry || 'Active Premium Member'
                : 'Card auto-renews • MoMo manual'}
            </span>
            <span className="text-[#C9A84C] font-semibold">
              {subscription.isPremium ? 'Premium Active' : '24h Grace Period'}
            </span>
          </div>
        </div>

        {/* Secured By Paystack Trust Footer */}
        <div className="flex items-center justify-center gap-3 text-[10px] text-[#888888] pt-0.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A84C]" /> Secured by Paystack
          </span>
          <span>•</span>
          <span>Cancel Anytime</span>
        </div>
      </div>

      {/* Upgrade Modal */}
      <PremiumUpgradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Premium;
