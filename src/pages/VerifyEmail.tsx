import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, loading: userLoading } = useUser();

  // If user is already authenticated, redirect to home (or photo onboarding if 0 photos)
  useEffect(() => {
    if (!userLoading && isAuthenticated) {
      const hasPhotos = currentUser?.photos && currentUser.photos.length > 0;
      navigate(hasPhotos ? '/' : '/add-photos', { replace: true });
    }
  }, [isAuthenticated, userLoading, currentUser?.photos, navigate]);

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] text-[#FFFFFF] overflow-y-auto px-5 py-8 justify-center max-w-md mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        {/* Status Badge */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#333333] border border-[#C9A84C]/40 shadow-glow-gold">
          <ShieldCheck className="w-10 h-10 text-[#C9A84C]" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C9A84C]" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold font-serif text-[#FFFFFF] tracking-tight">
            Account Active
          </h1>
          <p className="text-xs text-[#C9A84C] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Two Birds</span>
          </p>
        </div>

        <p className="text-xs text-[#FFFFFF]/80 leading-relaxed max-w-xs mx-auto font-normal">
          Your account is already active. Welcome to Two Birds! You can sign in directly or access the campus discovery feed.
        </p>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#4A4A4A] space-y-3 mt-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Sign In to Two Birds</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="w-full py-2.5 rounded-xl bg-[#333333] hover:bg-[#444444] text-xs font-semibold text-[#A0A0A0] hover:text-[#FFFFFF] transition"
          >
            Create Another Account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;


