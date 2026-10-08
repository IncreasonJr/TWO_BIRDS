import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipe } from '../hooks/useSwipe';
import { useMatches } from '../hooks/useMatches';
import { useUser } from '../context/UserContext';
import { useSubscription } from '../hooks/useSubscription';
import { SwipeCard } from '../components/SwipeCard';
import { SwipeControls } from '../components/SwipeControls';
import { GenderFilter } from '../components/GenderFilter';
import { PremiumUpgradeModal } from '../components/PremiumUpgradeModal';
import { Heart, Sparkles, MessageCircle, RefreshCw, Filter, X, Users, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BANNER_STORAGE_KEY = 'twobirds_dismiss_premium_banner';

export const Home: React.FC = () => {
  const {
    profiles,
    currentProfile,
    nextProfile,
    thirdProfile,
    hasMore,
    loading,
    handleSwipe,
    rewind,
    canRewind,
    newMatch,
    createdMatchObj,
    dismissMatchModal,
    resetFeed,
    reloadFeed,
    swipedUserIds,
  } = useSwipe();

  const { createMatch, setActiveMatchId, addMatch } = useMatches();
  const { currentUser } = useUser();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      const res = await resetFeed();
      if (res.success) {
        setIsResetModalOpen(false);
        showToast('Discovery feed reset!');
      } else {
        showToast(res.error || 'Failed to reset discovery feed');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to reset discovery feed');
    } finally {
      setIsResetting(false);
    }
  };

  const isDbEmpty = swipedUserIds.length === 0 && profiles.length === 0;

  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BANNER_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const onSwipeAction = (direction: 'left' | 'right') => {
    handleSwipe(direction);
  };

  // Sync newly created match into MatchContext immediately
  useEffect(() => {
    if (createdMatchObj) {
      addMatch(createdMatchObj);
    }
  }, [createdMatchObj, addMatch]);

  // Auto-dismiss match modal after 4 seconds if not clicked
  useEffect(() => {
    if (newMatch) {
      const timer = setTimeout(() => {
        dismissMatchModal();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [newMatch, dismissMatchModal]);

  return (
    <div className="flex flex-col h-full flex-1 justify-between px-3 pt-2 pb-[15px] max-w-md mx-auto w-full relative overflow-hidden bg-transparent">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#333333] border border-[#C9A84C]/50 text-[#FFFFFF] px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold pointer-events-none"
          >
            <Check className="w-3.5 h-3.5 text-[#C9A84C]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Free User Upsell Banner */}
      {!isPremium && !isBannerDismissed && (
        <div className="mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-[#2A2A2A] via-[#333333] to-[#2A2A2A] border border-[#C9A84C]/40 flex items-center justify-between gap-2 shadow-md shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#C9A84C] shrink-0" />
            <p className="text-[11px] text-[#FFFFFF] font-medium truncate">
              ✨ Filter by gender and see your ideal matches — <span className="text-[#C9A84C] font-semibold">Upgrade to Premium</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-[#C9A84C] text-[#1A1A1A] text-[10px] font-extrabold shadow-sm hover:bg-[#C9A84C]/90 transition active:scale-95"
            >
              Upgrade
            </button>
            <button
              onClick={handleDismissBanner}
              className="p-1 text-[#A0A0A0] hover:text-[#FFFFFF] transition"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Discovery Top Bar with Gender Filter Button */}
      <div className="flex items-center justify-between px-1 mb-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Discover</span>
          {isPremium && currentUser?.preferredGender && currentUser.preferredGender !== 'Everyone' && (
            <span className="px-2 py-0.5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C] text-[10px] font-extrabold">
              {currentUser.preferredGender}
            </span>
          )}
        </div>

        <button
          onClick={() => setIsFilterOpen(true)}
          className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
            isPremium && currentUser?.preferredGender && currentUser.preferredGender !== 'Everyone'
              ? 'bg-[#C9A84C]/15 border-[#C9A84C] text-[#C9A84C] shadow-glow-gold'
              : 'bg-[#2A2A2A] border-[#4A4A4A] text-[#D0D0D0] hover:text-[#FFFFFF] hover:border-[#777777]'
          }`}
          title="Filter discovery feed"
          aria-label="Filter discovery feed"
        >
          <Filter className="w-3.5 h-3.5 text-[#C9A84C]" />
          <span className="text-[11px]">
            {isPremium && currentUser?.preferredGender && currentUser.preferredGender !== 'Everyone'
              ? currentUser.preferredGender
              : 'Filter'}
          </span>
        </button>
      </div>

      {/* 3-Card Stack Area */}
      <div className="relative flex-1 mb-[12px] w-full min-h-0 overflow-hidden">
        {loading ? (
          <div className="h-full rounded-3xl bg-[#333333] border border-[#4A4A4A] flex flex-col items-center justify-center p-8 text-center space-y-3 shadow-xl text-[#FFFFFF]">
            <div className="w-14 h-14 rounded-full bg-[#1A1A1A] text-[#C9A84C] flex items-center justify-center border border-[#C9A84C]/40 shadow-glow-gold">
              <RefreshCw className="w-6 h-6 animate-spin text-[#C9A84C]" />
            </div>
            <p className="text-xs font-semibold text-[#A0A0A0]">Loading student profiles...</p>
          </div>
        ) : hasMore && currentProfile ? (
          <>
            {thirdProfile && (
              <SwipeCard
                key={thirdProfile.id}
                profile={thirdProfile}
                onSwipe={() => {}}
                isFront={false}
                depth={2}
              />
            )}

            {nextProfile && (
              <SwipeCard
                key={nextProfile.id}
                profile={nextProfile}
                onSwipe={() => {}}
                isFront={false}
                depth={1}
              />
            )}

            <SwipeCard
              key={currentProfile.id}
              profile={currentProfile}
              onSwipe={onSwipeAction}
              isFront={true}
              depth={0}
            />
          </>
        ) : isDbEmpty ? (
          <div className="h-full rounded-3xl bg-[#333333] border border-[#4A4A4A] flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-xl text-[#FFFFFF]">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] text-[#C9A84C] flex items-center justify-center border border-[#C9A84C]/40 shadow-glow-gold">
              <Users className="w-8 h-8 text-[#C9A84C]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#FFFFFF] font-serif">No students on campus yet.</h3>
              <p className="text-xs text-[#FFFFFF]/70 max-w-xs mt-1">
                Invite your friends to join Two Birds and start connecting!
              </p>
            </div>
            <button
              onClick={() => reloadFeed()}
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#C9A84C] text-[#1A1A1A] text-xs font-extrabold shadow-md hover:bg-[#C9A84C]/90 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        ) : (
          <div className="h-full rounded-3xl bg-[#333333] border border-[#4A4A4A] flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-xl text-[#FFFFFF]">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] text-[#C9A84C] flex items-center justify-center border border-[#C9A84C]/40 shadow-glow-gold">
              <Sparkles className="w-8 h-8 text-[#C9A84C]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#FFFFFF] font-serif">That's everyone for now!</h3>
              <p className="text-xs text-[#FFFFFF]/70 max-w-xs mt-1">
                You've seen all available student profiles on Two Birds. Check back later or restart your feed!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs justify-center">
              <button
                onClick={() => setIsResetModalOpen(true)}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#C9A84C] text-[#1A1A1A] text-xs font-extrabold shadow-md hover:bg-[#C9A84C]/90 flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Discovery Feed
              </button>
              <button
                onClick={() => reloadFeed()}
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#2A2A2A] border border-[#4A4A4A] text-[#D0D0D0] hover:text-[#FFFFFF] hover:border-[#777777] text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons Bar (3 Buttons: Rewind, Pass, Like) */}
      <SwipeControls
        onRewind={rewind}
        canRewind={canRewind}
        onPass={() => onSwipeAction('left')}
        onLike={() => onSwipeAction('right')}
        disabled={loading || !hasMore}
      />

      {/* "IT'S A MATCH!" CELEBRATION MODAL */}
      <AnimatePresence>
        {newMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="w-full max-w-sm bg-[#333333] border border-[#4A4A4A] rounded-3xl p-6 text-center space-y-5 shadow-2xl text-[#FFFFFF] relative overflow-hidden"
            >
              {/* Sparkle particle background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#C9A84C]/20 rounded-full blur-3xl pointer-events-none" />

              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="inline-flex p-3 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/40 shadow-glow-gold"
              >
                <Sparkles className="w-8 h-8 text-[#C9A84C]" />
              </motion.div>

              <div>
                <h2 className="text-3xl font-extrabold text-[#C9A84C] tracking-tight font-serif">
                  It's a Match!
                </h2>
                <p className="text-xs text-[#FFFFFF]/80 mt-1.5 font-medium">
                  You and <span className="font-bold text-[#FFFFFF]">{newMatch.name}</span> liked each other!
                </p>
              </div>

              {/* Side by Side User Photos */}
              <div className="flex items-center justify-center -space-x-4 py-3 relative">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-20 rounded-full border-4 border-[#333333] overflow-hidden shadow-lg"
                >
                  <img
                    src={currentUser.photos?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                    alt={currentUser.name || "You"}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                <div className="z-20 p-2 rounded-full bg-[#C9A84C] text-[#1A1A1A] shadow-glow-gold border-2 border-[#1A1A1A]">
                  <Heart className="w-4 h-4 fill-[#1A1A1A] stroke-[#1A1A1A]" />
                </div>

                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-20 rounded-full border-4 border-[#333333] overflow-hidden shadow-glow-gold z-10"
                >
                  <img
                    src={newMatch.photos?.[0] || '/logo192.png'}
                    alt={newMatch.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={async () => {
                    if (createdMatchObj) {
                      addMatch(createdMatchObj);
                      setActiveMatchId(createdMatchObj.id);
                    } else if (newMatch) {
                      const created = await createMatch(newMatch);
                      if (created) {
                        setActiveMatchId(created.id);
                      }
                    }
                    dismissMatchModal();
                    navigate('/chat');
                  }}
                  className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold flex items-center justify-center gap-2 hover:bg-[#C9A84C]/90 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </button>
                <button
                  onClick={dismissMatchModal}
                  className="w-full py-2.5 rounded-2xl bg-[#1A1A1A] text-[#FFFFFF] border border-[#4A4A4A] text-xs font-bold hover:bg-[#1A1A1A]/80 transition"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gender Filter Modal */}
      <GenderFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onOpenUpgradeModal={() => {
          setIsFilterOpen(false);
          setIsUpgradeModalOpen(true);
        }}
        onFilterChanged={() => {
          reloadFeed();
        }}
      />

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      {/* Reset Discovery Feed Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="bg-[#1A1A1A] border border-[#4A4A4A] rounded-3xl w-full max-w-sm overflow-hidden flex flex-col relative shadow-2xl p-6 space-y-5 text-[#FFFFFF]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/40 shadow-glow-gold shrink-0">
                  <RefreshCw className="w-5 h-5 text-[#C9A84C]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#FFFFFF]">Reset Discovery Feed?</h3>
                  <p className="text-[11px] text-[#A0A0A0]">Start fresh with campus profiles</p>
                </div>
              </div>

              <p className="text-xs text-[#FFFFFF]/80 leading-relaxed">
                Reset your discovery feed? You'll see everyone again, including people you passed on.
              </p>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  disabled={isResetting}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#4A4A4A] bg-[#2A2A2A] text-xs font-bold text-[#FFFFFF] hover:bg-[#333333] transition active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={isResetting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#C9A84C] text-[#1A1A1A] text-xs font-extrabold hover:bg-[#C9A84C]/90 shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Reset Feed</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
