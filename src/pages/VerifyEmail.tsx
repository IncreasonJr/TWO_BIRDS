import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { resendVerificationEmail } from '../lib/authService';
import { supabase } from '../lib/supabaseClient';
import { getProfile } from '../lib/databaseService';
import { useUser } from '../context/UserContext';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, currentUser, refreshProfile, loading: userLoading } = useUser();

  const emailParam = searchParams.get('email') || '';
  const [emailInput, setEmailInput] = useState(emailParam);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ success: boolean; message: string } | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // 1. If user is already authenticated and email is verified, redirect immediately
  useEffect(() => {
    if (!userLoading && isAuthenticated) {
      const hasPhotos = currentUser?.photos && currentUser.photos.length > 0;
      navigate(hasPhotos ? '/' : '/add-photos', { replace: true });
    }
  }, [isAuthenticated, userLoading, currentUser?.photos, navigate]);

  // 2. Handle verification link callback (hash tokens, query parameters, PKCE code, or OTP)
  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      // Check URL hash and query parameters
      const rawHash = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(rawHash);
      const queryParams = new URLSearchParams(window.location.search);

      // Check for error parameters first
      const errorDesc = hashParams.get('error_description') || queryParams.get('error_description');
      if (errorDesc) {
        if (isMounted) {
          setVerificationError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
          setIsVerifying(false);
        }
        return;
      }

      // Check for tokens or codes
      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
      const code = queryParams.get('code') || hashParams.get('code');
      const tokenHash = queryParams.get('token_hash') || hashParams.get('token_hash');
      const type = (queryParams.get('type') || hashParams.get('type') || 'signup') as any;

      const hasCallbackToken = !!(accessToken || code || tokenHash);
      if (!hasCallbackToken) {
        return;
      }

      if (isMounted) {
        setIsVerifying(true);
        setVerificationError(null);
      }

      try {
        if (code) {
          // Supabase PKCE flow
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash) {
          // Supabase verifyOtp token hash flow
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type === 'recovery' ? 'recovery' : 'signup',
          });
          if (otpError) throw otpError;
        } else if (accessToken && refreshToken) {
          // Supabase implicit session tokens
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setSessionError) throw setSessionError;
        }

        // Pick up authenticated session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const sessionUser = sessionData?.session?.user;
        if (sessionUser) {
          // Refresh UserContext profile
          await refreshProfile();

          // Check if user has uploaded photos yet
          const profile = await getProfile(sessionUser.id);
          const hasPhotos = profile?.photos && profile.photos.length > 0;

          if (isMounted) {
            navigate(hasPhotos ? '/' : '/add-photos', { replace: true });
          }
        } else {
          // Secondary fallback check via getUser
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            await refreshProfile();
            const profile = await getProfile(userData.user.id);
            const hasPhotos = profile?.photos && profile.photos.length > 0;
            if (isMounted) {
              navigate(hasPhotos ? '/' : '/add-photos', { replace: true });
            }
          } else {
            throw new Error('Session could not be established. Please try signing in.');
          }
        }
      } catch (err: any) {
        console.error('[VerifyEmail] Error during email verification callback:', err);
        if (isMounted) {
          setVerificationError(
            err?.message || 'Verification link is invalid or has expired. Please request a new link.'
          );
          setIsVerifying(false);
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, refreshProfile]);

  const handleResend = async () => {
    if (!emailInput.trim()) {
      setResendStatus({ success: false, message: 'Please enter your university (.edu or .edu.gh) email address.' });
      return;
    }

    setResending(true);
    setResendStatus(null);

    const { error } = await resendVerificationEmail(emailInput.trim());
    setResending(false);

    if (error) {
      setResendStatus({
        success: false,
        message: error.message || 'Unable to resend verification email. Please try again later.',
      });
    } else {
      setResendStatus({
        success: true,
        message: 'A new verification link has been sent to your university email.',
      });
    }
  };

  // Loading state when processing verification tokens
  if (isVerifying) {
    return (
      <div className="h-full flex flex-col bg-[#1A1A1A] text-[#FFFFFF] overflow-y-auto px-5 py-8 justify-center items-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#333333] border border-[#C9A84C]/40 shadow-glow-gold">
            <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold font-serif text-[#FFFFFF] tracking-tight">
              Verifying Email...
            </h1>
            <p className="text-xs text-[#C9A84C] font-semibold tracking-wider uppercase">
              Two Birds Campus Access
            </p>
          </div>

          <p className="text-xs text-[#FFFFFF]/80 leading-relaxed max-w-xs mx-auto">
            Confirming your student credentials and establishing your session. You will be redirected shortly...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] text-[#FFFFFF] overflow-y-auto px-5 py-8 justify-center max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        {/* Verification Icon Badge */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#333333] border border-[#C9A84C]/40 shadow-glow-gold">
          <Mail className="w-10 h-10 text-[#C9A84C]" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C9A84C] animate-ping" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C9A84C]" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold font-serif text-[#FFFFFF] tracking-tight">
            Check Your Inbox
          </h1>
          <p className="text-xs text-[#C9A84C] font-semibold tracking-wider uppercase">
            University Enrollment Verification
          </p>
        </div>

        <p className="text-xs text-[#FFFFFF]/80 leading-relaxed max-w-xs mx-auto font-normal">
          We've sent a secure verification link to your university email. Click the link in your email to confirm your student status and start matching on campus.
        </p>

        {/* Verification Error Alert */}
        {verificationError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2.5 text-left"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{verificationError}</span>
          </motion.div>
        )}

        {/* Email display pill */}
        {emailInput && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#333333] border border-[#4A4A4A] text-xs font-mono text-[#C9A84C]">
            <Mail className="w-3.5 h-3.5" />
            <span>{emailInput}</span>
          </div>
        )}

        {/* Resend Status Message */}
        {resendStatus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
              resendStatus.success
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/40 text-red-300'
            }`}
          >
            {resendStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{resendStatus.message}</span>
          </motion.div>
        )}

        {/* Resend section */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 text-left space-y-3 mt-6">
          <label className="block text-xs font-bold text-[#FFFFFF]">
            Didn't receive the email?
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#C9A84C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="yourname@stanford.edu or student@ug.edu.gh"
              className="w-full pl-9 pr-3 py-2 bg-[#1A1A1A] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 rounded-xl bg-[#4A4A4A] hover:bg-[#555555] text-xs font-bold text-[#FFFFFF] transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C9A84C] ${resending ? 'animate-spin' : ''}`} />
            <span>{resending ? 'Sending...' : 'Resend Verification Email'}</span>
          </button>
        </div>

        {/* Navigation back to Sign In */}
        <div className="pt-4 border-t border-[#4A4A4A]">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Back to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;

