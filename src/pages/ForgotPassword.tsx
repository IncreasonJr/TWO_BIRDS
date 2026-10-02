import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { sendPasswordReset, updatePassword, onAuthStateChange } from '../lib/authService';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { logout, authUser } = useUser();

  // Mode states: 'request' or 'reset'
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Request form state
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Reset form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check URL parameters, hash tokens, and session on mount
  useEffect(() => {
    let mounted = true;

    async function checkRecoveryState() {
      try {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(window.location.search);

        // Check for error parameters in URL (e.g. expired link)
        const errorParam = hashParams.get('error') || searchParams.get('error');
        const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
        if (errorParam || errorDesc) {
          const cleanDesc = errorDesc ? decodeURIComponent(errorDesc.replace(/\+/g, ' ')) : '';
          if (mounted) {
            setTokenError(
              cleanDesc.includes('expired') || cleanDesc.includes('invalid')
                ? 'This password reset link has expired. Please request a new one.'
                : cleanDesc || 'This password reset link has expired. Please request a new one.'
            );
          }
          return;
        }

        // Handle PKCE code exchange if present in query params
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            if (mounted) {
              setTokenError('This password reset link has expired. Please request a new one.');
            }
            return;
          }
          if (mounted && data?.session?.user) {
            setIsRecoveryMode(true);
            setRecoveryEmail(data.session.user.email || null);
            return;
          }
        }

        // Check for implicit recovery token in URL hash
        const type = hashParams.get('type') || searchParams.get('type');
        const hasAccessToken = hashParams.has('access_token');
        if (type === 'recovery' || (hasAccessToken && (type === 'recovery' || hash.includes('recovery')))) {
          if (mounted) {
            setIsRecoveryMode(true);
          }
        }

        // Check current session from Supabase or existing auth state
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          if (mounted) {
            setIsRecoveryMode(true);
            setRecoveryEmail(sessionData.session.user.email || null);
          }
        } else if (authUser?.email && mounted) {
          setIsRecoveryMode(true);
          setRecoveryEmail(authUser.email);
        }
      } catch (err) {
        console.warn('[ForgotPassword] checkRecoveryState error:', err);
      }
    }

    checkRecoveryState();

    // Listen to Supabase auth state change for PASSWORD_RECOVERY
    const { subscription } = onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setTokenError(null);
        if (session?.user?.email) {
          setRecoveryEmail(session.user.email);
        }
      } else if (event === 'SIGNED_IN' && isRecoveryMode) {
        if (session?.user?.email) {
          setRecoveryEmail(session.user.email);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [authUser, isRecoveryMode]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setStatus(null);

    const { error } = await sendPasswordReset(email.trim());
    setSubmitting(false);

    if (error) {
      let errorMsg = error.message || 'Unable to send password reset email. Please try again.';
      if (
        error.message?.toLowerCase().includes('rate limit') ||
        error.message?.toLowerCase().includes('too many')
      ) {
        errorMsg = 'Too many attempts. Please try again later.';
      }
      setStatus({
        success: false,
        message: errorMsg,
      });
    } else {
      setStatus({
        success: true,
        message: 'If that email exists, a reset link has been sent to your inbox.',
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!newPassword) {
      setStatus({ success: false, message: 'Please enter a new password.' });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword.length > 72) {
      setStatus({ success: false, message: 'Password cannot exceed 72 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ success: false, message: 'Passwords do not match. Please verify your password.' });
      return;
    }

    setSubmitting(true);
    const { success, error } = await updatePassword(newPassword);
    setSubmitting(false);

    if (!success || error) {
      setStatus({
        success: false,
        message: error?.message || 'Failed to update password. Please try again.',
      });
      return;
    }

    // Success!
    setStatus({
      success: true,
      message: 'Password updated successfully! Redirecting to sign in...',
    });

    // Sign out to force re-authentication with the new password, then redirect to /login
    setTimeout(async () => {
      try {
        await logout();
      } catch {
        // ignore
      }
      navigate('/login', { replace: true });
    }, 2000);
  };

  const handleBackToRequest = () => {
    setTokenError(null);
    setIsRecoveryMode(false);
    setStatus(null);
    setNewPassword('');
    setConfirmPassword('');
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch {}
  };

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] text-[#FFFFFF] overflow-y-auto px-5 py-8 justify-center max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {/* VIEW 1: Token Error View (Expired / Invalid Token) */}
        {tokenError && (
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#333333] border border-red-500/40 shadow-glow">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold font-serif text-[#FFFFFF] tracking-tight">
                Link Expired
              </h1>
              <p className="text-xs text-red-400 font-semibold tracking-wider uppercase">
                Two Birds Campus Access
              </p>
            </div>

            <p className="text-xs text-[#FFFFFF]/80 leading-relaxed max-w-xs mx-auto">
              {tokenError}
            </p>

            <button
              type="button"
              onClick={handleBackToRequest}
              className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Request a New Reset Link</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* VIEW 2: Reset Mode View (Set New Password) */}
        {isRecoveryMode && !tokenError && (
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#333333] border border-[#C9A84C]/40 shadow-glow-gold">
              <KeyRound className="w-8 h-8 text-[#C9A84C]" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold font-serif text-[#FFFFFF] tracking-tight">
                Set New Password
              </h1>
              <p className="text-xs text-[#C9A84C] font-semibold tracking-wider uppercase">
                Two Birds Campus Access
              </p>
            </div>

            {/* Step 5: Show Current User Info */}
            {recoveryEmail ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2A2A2A] border border-[#C9A84C]/30 text-[11px] text-[#A0A0A0]">
                <span>Resetting password for:</span>
                <span className="font-bold text-[#FFFFFF]">{recoveryEmail}</span>
              </div>
            ) : (
              <p className="text-xs text-[#FFFFFF]/80 leading-relaxed max-w-xs mx-auto">
                Enter your new account password below.
              </p>
            )}

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

            {/* Password Update Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-4 text-left">
              {/* New Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (status) setStatus(null);
                    }}
                    placeholder="••••••••"
                    minLength={6}
                    maxLength={72}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition ${
                      showNewPassword ? 'text-[#C9A84C]' : 'text-[#4A4A4A] hover:text-[#C9A84C]'
                    }`}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (status) setStatus(null);
                    }}
                    placeholder="••••••••"
                    minLength={6}
                    maxLength={72}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition ${
                      showConfirmPassword ? 'text-[#C9A84C]' : 'text-[#4A4A4A] hover:text-[#C9A84C]'
                    }`}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]" />}
                <span>{submitting ? 'Updating Password...' : 'Update Password'}</span>
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Back to Request Link */}
            <div className="pt-4 border-t border-[#4A4A4A]">
              <button
                type="button"
                onClick={handleBackToRequest}
                className="text-xs text-[#A0A0A0] hover:text-[#FFFFFF] font-semibold transition"
              >
                Need to request a different reset link? <span className="text-[#C9A84C] underline font-bold">Start Over</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: Request Mode View (Default Email Entry) */}
        {!isRecoveryMode && !tokenError && (
          <div className="space-y-5">
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
            <form onSubmit={handleRequestReset} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                  University Email (.edu or .edu.gh)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status) setStatus(null);
                    }}
                    placeholder="yourname@stanford.edu or student@ug.edu.gh"
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
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]" />}
                <span>{submitting ? 'Sending Link...' : 'Send Reset Link'}</span>
                {!submitting && <ArrowRight className="w-4 h-4" />}
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
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
