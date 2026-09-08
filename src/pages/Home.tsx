import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipe } from '../hooks/useSwipe';
import { useMatches } from '../hooks/useMatches';
import { SwipeCard } from '../components/SwipeCard';
import { SwipeControls } from '../components/SwipeControls';
import { Heart, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const {
    currentProfile,
    nextProfile,
    thirdProfile,
    hasMore,
    handleSwipe,
    rewind,
    canRewind,
    newMatch,
    dismissMatchModal,
    resetFeed
  } = useSwipe();

  const { createMatch } = useMatches();
  const navigate = useNavigate();

  // Auto-dismiss match modal after 3 seconds if not clicked
  useEffect(() => {
    if (newMatch) {
      const timer = setTimeout(() => {
        dismissMatchModal();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newMatch, dismissMatchModal]);

  return (
    <div className="flex flex-col h-full flex-1 justify-between px-3 pt-2 pb-[15px] max-w-md mx-auto w-full relative overflow-hidden bg-[#1A1A1A]">
      {/* 3-Card Stack Area */}
      <div className="relative flex-1 mb-1.5 w-full h-full min-h-0 overflow-hidden">
        {hasMore && currentProfile ? (
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
              onSwipe={handleSwipe}
              isFront={true}
              depth={0}
            />
          </>
        ) : (
          <div className="h-full rounded-3xl bg-[#333333] border border-[#4A4A4A] flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-xl text-[#FFFFFF]">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1A] text-[#C9A84C] flex items-center justify-center border border-[#C9A84C]/40 shadow-glow-gold">
              <Sparkles className="w-8 h-8 text-[#C9A84C]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#FFFFFF]">That's everyone for now!</h3>
              <p className="text-xs text-[#FFFFFF]/70 max-w-xs mt-1">
                You've seen all available student profiles on Two Birds. Check back later or restart your feed!
              </p>
            </div>
            <button
              onClick={resetFeed}
              className="px-6 py-2.5 rounded-full bg-[#C9A84C] text-[#1A1A1A] text-xs font-extrabold shadow-md hover:bg-[#C9A84C]/90 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Discovery Feed
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons Bar (3 Buttons: Rewind, Pass, Like) */}
      <SwipeControls
        onRewind={rewind}
        canRewind={canRewind}
        onPass={() => handleSwipe('left')}
        onLike={() => handleSwipe('right')}
        disabled={!hasMore}
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
                <h2 className="text-3xl font-extrabold text-[#C9A84C] tracking-tight">
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
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" alt="You" className="w-full h-full object-cover" />
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
                  <img src={newMatch.photos[0]} alt={newMatch.name} className="w-full h-full object-cover" />
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => {
                    if (newMatch) createMatch(newMatch);
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
    </div>
  );
};
