import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Smartphone,
  ShieldCheck,
  X,
  AlertCircle,
  RefreshCw,
  Zap,
  Filter,
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { initializePaystackPayment } from '../lib/paystackClient';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRenewal?: boolean;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  isRenewal = false,
}) => {
  const { currentUser, refreshProfile } = useUser();
  const [selectedChannel, setSelectedChannel] = useState<'card' | 'mobile_money'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successExpiresAt, setSuccessExpiresAt] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartPayment = async () => {
    if (!currentUser?.id || !currentUser.email) {
      setErrorMessage('Please ensure you are logged in with a valid account.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    await initializePaystackPayment({
      email: currentUser.email,
      userId: currentUser.id,
      channelPreference: selectedChannel,
      onSuccess: async (res) => {
        setIsProcessing(false);
        setIsSuccess(true);
        if (res.expiresAt) {
          setSuccessExpiresAt(res.expiresAt);
        }
        await refreshProfile();
      },
      onCancel: () => {
        setIsProcessing(false);
      },
      onError: (err) => {
        setIsProcessing(false);
        setErrorMessage(err);
      },
    });
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    setIsProcessing(false);
    onClose();
  };

  const formattedExpiry = successExpiresAt
    ? new Date(successExpiresAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '30 days from today';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-[#1F1F1F] border border-[#C9A84C]/60 rounded-3xl p-5 shadow-2xl overflow-hidden text-[#FFFFFF] z-10"
        >
          {/* Ambient Gold Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-28 bg-[#C9A84C]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-[#333333] text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#4A4A4A] transition"
          >
            <X className="w-4 h-4" />
          </button>

          {!isSuccess ? (
            <div className="space-y-4">
              {/* Header Badge */}
              <div className="text-center space-y-1 pt-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#C9A84C]/20 border border-[#C9A84C] text-[#C9A84C] shadow-glow-gold mb-1">
                  <Crown className="w-6 h-6 fill-[#C9A84C]" />
                </div>
                <h2 className="text-xl font-serif font-extrabold tracking-tight text-[#FFFFFF]">
                  {isRenewal ? 'Renew Two Birds Premium' : 'Upgrade to Premium'}
                </h2>
                <p className="text-xs text-[#A0A0A0]">
                  Unlock exclusive campus features & prioritize your profile.
                </p>
              </div>

              {/* Price Banner */}
              <div className="p-3.5 rounded-2xl bg-[#2A2A2A] border border-[#4A4A4A] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                    Monthly Subscription
                  </p>
                  <p className="text-2xl font-serif font-extrabold text-[#C9A84C]">
                    GHS 47.34 <span className="text-xs font-sans text-[#FFFFFF]/70">/ month</span>
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-[10px] font-extrabold">
                  30 Days
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2 py-1">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-[#C9A84C]/20 text-[#C9A84C] shrink-0 mt-0.5">
                    <Filter className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#FFFFFF]">Gender Filter</p>
                    <p className="text-[11px] text-[#A0A0A0]">
                      Filter discovery feed by Males, Females, or Mixed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-[#C9A84C]/20 text-[#C9A84C] shrink-0 mt-0.5">
                    <Crown className="w-3.5 h-3.5 fill-[#C9A84C]" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#FFFFFF]">Verified Gold Badge</p>
                    <p className="text-[11px] text-[#A0A0A0]">
                      Stand out on campus with an elite gold badge & styling.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-[#C9A84C]/20 text-[#C9A84C] shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-[#C9A84C]" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#FFFFFF]">Priority Discovery Boost</p>
                    <p className="text-[11px] text-[#A0A0A0]">
                      Get seen 3x faster by campus students in your area.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Channel Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-bold text-[#A0A0A0] uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('card')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition ${
                      selectedChannel === 'card'
                        ? 'border-[#C9A84C] bg-[#C9A84C]/10 shadow-glow-gold'
                        : 'border-[#4A4A4A] bg-[#2A2A2A] hover:border-[#777777]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard
                        className={`w-4 h-4 ${
                          selectedChannel === 'card' ? 'text-[#C9A84C]' : 'text-[#A0A0A0]'
                        }`}
                      />
                      <span className="text-[9px] font-extrabold text-[#C9A84C] uppercase">
                        Auto-Renew
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#FFFFFF]">Bank Card</p>
                      <p className="text-[10px] text-[#A0A0A0]">Visa / Mastercard</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChannel('mobile_money')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition ${
                      selectedChannel === 'mobile_money'
                        ? 'border-[#C9A84C] bg-[#C9A84C]/10 shadow-glow-gold'
                        : 'border-[#4A4A4A] bg-[#2A2A2A] hover:border-[#777777]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Smartphone
                        className={`w-4 h-4 ${
                          selectedChannel === 'mobile_money' ? 'text-[#C9A84C]' : 'text-[#A0A0A0]'
                        }`}
                      />
                      <span className="text-[9px] font-bold text-[#A0A0A0] uppercase">
                        Manual
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#FFFFFF]">Mobile Money</p>
                      <p className="text-[10px] text-[#A0A0A0]">MTN / Voda / AT</p>
                    </div>
                  </button>
                </div>
                <p className="text-[10px] text-[#A0A0A0] pt-0.5">
                  {selectedChannel === 'card'
                    ? 'Card charges renew automatically every month. Cancel anytime in settings.'
                    : 'Mobile Money requires manual monthly renewal. We will send reminders before expiry.'}
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/50 flex items-center gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleStartPayment}
                disabled={isProcessing}
                className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#1A1A1A]" />
                    <span>Connecting Paystack...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#1A1A1A]" />
                    <span>Pay GHS 47.34 with Paystack</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#777777]">
                <span>Secured by Paystack</span>
                <span>•</span>
                <span>256-bit Bank Grade Security</span>
              </div>
            </div>
          ) : (
            /* Success Celebration State */
            <div className="text-center space-y-4 py-4">
              <motion.div
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-16 h-16 mx-auto rounded-full bg-[#C9A84C]/20 border-2 border-[#C9A84C] text-[#C9A84C] flex items-center justify-center shadow-glow-gold"
              >
                <Sparkles className="w-8 h-8 fill-[#C9A84C]" />
              </motion.div>

              <div className="space-y-1">
                <h3 className="text-2xl font-serif font-extrabold text-[#FFFFFF]">
                  Welcome to Premium! 🎉
                </h3>
                <p className="text-xs text-[#A0A0A0]">
                  Your subscription is now active through <span className="text-[#C9A84C] font-bold">{formattedExpiry}</span>.
                </p>
              </div>

              <div className="p-3 bg-[#2A2A2A] rounded-2xl border border-[#4A4A4A] text-left space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-[#C9A84C]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-[#FFFFFF]">Gender filter unlocked</span>
                </div>
                <div className="flex items-center gap-2 text-[#C9A84C]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-[#FFFFFF]">Verified Gold badge active</span>
                </div>
                <div className="flex items-center gap-2 text-[#C9A84C]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-[#FFFFFF]">3x Discovery boost enabled</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 active:scale-95 transition"
              >
                Start Exploring with Premium
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
