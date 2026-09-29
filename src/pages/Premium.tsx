import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Smartphone,
  ShieldCheck,
  ArrowLeft,
  Filter,
  Flame,
  Check,
  RotateCcw,
  Zap,
  Users,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSubscription } from '../hooks/useSubscription';
import { PremiumUpgradeModal } from '../components/PremiumUpgradeModal';
import { PremiumBadge } from '../components/PremiumBadge';

export const Premium: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const subscription = useSubscription();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const perks = [
    {
      icon: Filter,
      title: 'Gender Discovery Filter',
      desc: 'Filter campus students by Women, Men, or Everyone. Only see who you want to match with.',
      highlight: 'Prompt 3 Feature',
    },
    {
      icon: Crown,
      title: 'Verified Gold Badge',
      desc: 'Display an exclusive gold crown badge next to your name on your card, in matches, and inside chats.',
      highlight: 'Exclusive Status',
    },
    {
      icon: Zap,
      title: '3x Discovery Priority',
      desc: 'Get shown to 3x more students on your university campus so you get discovered and liked faster.',
      highlight: 'Higher Matches',
    },
    {
      icon: RotateCcw,
      title: 'Unlimited Rewinds',
      desc: 'Accidentally swiped left? Take back your last swipe anytime with zero restrictions.',
      highlight: 'Second Chances',
    },
  ];

  return (
    <div className="flex flex-col h-full flex-1 max-w-md mx-auto w-full bg-[#1A1A1A] text-[#FFFFFF] overflow-y-auto pb-10">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#1A1A1A]/95 backdrop-blur-md px-4 py-3 border-b border-[#333333] flex items-center justify-between">
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

      {/* Hero Section */}
      <div className="relative px-5 pt-6 pb-4 text-center space-y-3 overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#C9A84C]/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#C9A84C]/30 to-[#C9A84C]/10 border border-[#C9A84C] shadow-glow-gold text-[#C9A84C] mb-1"
        >
          <Crown className="w-8 h-8 fill-[#C9A84C]" />
        </motion.div>

        <h1 className="text-2xl font-serif font-extrabold text-[#FFFFFF] tracking-tight">
          Unlock the Full Campus Experience
        </h1>

        <p className="text-xs text-[#A0A0A0] max-w-xs mx-auto leading-relaxed">
          Upgrade to Two Birds Premium for powerful matching filters, exclusive gold styling, and maximum campus visibility.
        </p>

        {/* Pricing Card */}
        <div className="mt-4 p-4 rounded-3xl bg-gradient-to-b from-[#2A2A2A] to-[#222222] border border-[#C9A84C]/60 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="px-2 py-0.5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] text-[10px] font-extrabold uppercase tracking-wider">
                Monthly Pass
              </span>
              <p className="text-2xl font-serif font-extrabold text-[#C9A84C] mt-1">
                GHS 47.34 <span className="text-xs font-sans font-medium text-[#FFFFFF]/70">/ month</span>
              </p>
            </div>

            {subscription.isPremium ? (
              <div className="px-3 py-1.5 rounded-full bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs flex items-center gap-1 shadow-glow-gold">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Active
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 active:scale-95 transition"
              >
                Upgrade Now
              </button>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-[#4A4A4A]/60 flex items-center justify-between text-[11px] text-[#A0A0A0]">
            <span>Card auto-renews • MoMo manual monthly</span>
            <span className="text-[#C9A84C] font-semibold">24h Grace Period</span>
          </div>
        </div>
      </div>

      {/* Feature Perks List */}
      <div className="px-5 py-3 space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#A0A0A0] px-1">
          Everything Included
        </h2>

        {perks.map((perk, i) => {
          const Icon = perk.icon;
          return (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-[#222222] border border-[#3A3A3A] flex items-start gap-3 hover:border-[#C9A84C]/40 transition"
            >
              <div className="p-2.5 rounded-xl bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 shrink-0 mt-0.5">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-extrabold text-[#FFFFFF]">{perk.title}</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#333333] text-[#C9A84C]">
                    {perk.highlight}
                  </span>
                </div>
                <p className="text-[11px] text-[#A0A0A0] mt-1 leading-relaxed">{perk.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Live Preview Card */}
      <div className="px-5 py-3">
        <div className="p-4 rounded-3xl bg-[#262626] border border-[#4A4A4A] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FFFFFF]">
            <Sparkles className="w-4 h-4 text-[#C9A84C]" />
            <span>Live Preview: Gold Badge Appearance</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#1A1A1A] border border-[#333333] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[#C9A84C] bg-[#333333] overflow-hidden flex items-center justify-center text-xs font-bold text-[#C9A84C]">
                {currentUser?.photos?.[0] ? (
                  <img
                    src={currentUser.photos[0]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  'YOU'
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-[#FFFFFF]">
                    {currentUser?.name || 'Kofi Mensah'}
                  </span>
                  <PremiumBadge isPremium={true} size={15} />
                </div>
                <p className="text-[10px] text-[#A0A0A0]">
                  {currentUser?.major || 'Computer Science'} • {currentUser?.university || 'University of Ghana'}
                </p>
              </div>
            </div>

            <span className="text-[10px] text-[#C9A84C] font-extrabold px-2 py-1 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/30">
              Two Birds Premium
            </span>
          </div>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="px-5 pt-3">
        {subscription.isPremium ? (
          <div className="p-4 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/40 text-center space-y-1">
            <p className="text-xs font-extrabold text-[#C9A84C] flex items-center justify-center gap-1.5">
              <Crown className="w-4 h-4 fill-[#C9A84C]" /> You are a Two Birds Premium Member!
            </p>
            <p className="text-[11px] text-[#FFFFFF]/70">
              {subscription.formattedExpiry}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4 fill-[#1A1A1A]" />
            Upgrade to Premium — GHS 47.34 / month
          </button>
        )}

        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-[#888888]">
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
