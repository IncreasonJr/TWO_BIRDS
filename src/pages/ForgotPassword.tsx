import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendPasswordReset } from '../lib/authService';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setStatus(null);

    const { error } = await sendPasswordReset(email.trim());
    setSubmitting(false);

    if (error) {
      setStatus({
        success: false,
        message: error.message || 'Unable to send password reset email. Please try again.',
      });
    } else {
      setStatus({
        success: true,
        message: 'If that email exists, a reset link has been sent to your inbox.',
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] text-[#FFFFFF] overflow-y-auto px-5 py-8 justify-center max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 text-center"
      >
        {/* Header Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#333333] border border-[#C9A84C]/40 shadow-glow-gold">
          <KeyRound className="w-8 h-8 text-[#C9A84C]" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold font-serif text-[#FFFFFF] tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-[#C9A84C] font-semibold tracking-wider uppercase">
            Two Birds Campus Access
          </p>
        </div>

        <p className="text-xs text-[#FFFFFF]/80 leading-relaxed max-w-xs mx-auto">
          Enter your university email address and we'll send you instructions to reset your account password.
        </p>

        {/* Status Message */}
        {status && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold text-left ${
              status.success
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/40 text-red-300'
            }`}
          >
            {status.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{status.message}</span>
          </motion.div>
        )}

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
              University Email (.edu)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@stanford.edu"
                className="w-full pl-10 pr-3 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <span>{submitting ? 'Sending Link...' : 'Send Reset Link'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to Login */}
        <div className="pt-4 border-t border-[#4A4A4A]">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-xs text-[#A0A0A0] hover:text-[#FFFFFF] font-semibold transition"
          >
            Remember your password? <span className="text-[#C9A84C] underline font-bold">Sign In</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
