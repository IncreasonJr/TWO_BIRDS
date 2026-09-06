import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipe } from '../hooks/useSwipe';
import { SwipeCard } from '../components/SwipeCard';
import { Heart, X, Star, RotateCcw, Sparkles, SlidersHorizontal, MessageCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const {
    currentProfile,
    nextProfile,
    hasMore,
    handleSwipe,
    rewind,
    canRewind,
    newMatch,
    dismissMatchModal
  } = useSwipe();

  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] justify-between px-4 pt-3 pb-2 max-w-md mx-auto relative overflow-hidden bg-[#F5F4F4]">
      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#532E16]/10 text-[#532E16] border border-[#C67D43]/30 font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C67D43]" />
          Filter
        </button>
        {['All', 'Same Major', 'Class of 2026', 'Under 1 Mile'].map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 font-semibold ${
              activeFilter === tag
                ? 'bg-[#F3B250] text-[#532E16] shadow-md'
                : 'bg-[#532E16]/5 text-[#C67D43] hover:bg-[#532E16]/10 border border-[#C67D43]/20'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Card Stack Area */}
      <div className="relative flex-1 my-3 w-full max-h-[500px]">
        {hasMore && currentProfile ? (
          <>
            {nextProfile && (
              <SwipeCard
                key={nextProfile.id}
                profile={nextProfile}
                onSwipe={() => {}}
                isFront={false}
              />
            )}

            <SwipeCard
              key={currentProfile.id}
              profile={currentProfile}
              onSwipe={handleSwipe}
              isFront={true}
            />
          </>
        ) : (
          <div className="h-full rounded-3xl bg-[#F5F4F4] border-2 border-[#C67D43]/30 flex flex-col items-center justify-center p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#F3B250]/20 text-[#532E16] flex items-center justify-center border border-[#F3B250]/40">
              <Sparkles className="w-8 h-8 text-[#F3B250]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#532E16]">That's everyone for now!</h3>
              <p className="text-xs text-[#C67D43] max-w-xs mt-1">
                You've seen all verified students nearby on your campus network. Check back later or adjust your filter radius!
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-[#F3B250] text-[#532E16] text-xs font-bold shadow-md hover:bg-[#F3B250]/90 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Campus Feed
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons Bar */}
      <div className="flex items-center justify-around py-2 px-2">
        <button
          onClick={rewind}
          disabled={!canRewind}
          className={`p-3 rounded-full bg-[#F5F4F4] border border-[#C67D43]/30 text-[#C67D43] transition-all ${
            canRewind ? 'hover:scale-110 active:scale-95 shadow-md hover:bg-[#F3B250]/20' : 'opacity-40 cursor-not-allowed'
          }`}
          title="Rewind"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleSwipe('left')}
          disabled={!hasMore}
          className="p-4 rounded-full bg-[#F5F4F4] border-2 border-[#C67D43] text-[#C67D43] hover:bg-[#C67D43]/10 hover:scale-110 active:scale-95 transition-all shadow-md"
          title="Pass"
        >
          <X className="w-7 h-7 stroke-[2.5]" />
        </button>

        <button
          onClick={() => handleSwipe('up')}
          disabled={!hasMore}
          className="p-3 rounded-full bg-[#F5F4F4] border-2 border-[#F3B250] text-[#532E16] hover:bg-[#F3B250]/20 hover:scale-110 active:scale-95 transition-all shadow-md"
          title="Super Like"
        >
          <Star className="w-6 h-6 fill-[#F3B250] text-[#F3B250]" />
        </button>

        <button
          onClick={() => handleSwipe('right')}
          disabled={!hasMore}
          className="p-4 rounded-full bg-[#F3B250] border-2 border-[#F3B250] text-[#532E16] hover:scale-110 active:scale-95 transition-all shadow-lg"
          title="Like"
        >
          <Heart className="w-7 h-7 fill-[#532E16] stroke-[#532E16]" />
        </button>
      </div>

      {/* IT'S A MATCH CELEBRATION MODAL */}
      <AnimatePresence>
        {newMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-sm bg-[#F5F4F4] border-2 border-[#F3B250] rounded-3xl p-6 text-center space-y-5 shadow-2xl text-[#532E16]"
            >
              <div className="inline-flex p-3 rounded-full bg-[#F3B250]/20 text-[#532E16] mb-1 border border-[#F3B250]/40">
                <Sparkles className="w-8 h-8 text-[#F3B250]" />
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-[#532E16]">
                  It's a Match!
                </h2>
                <p className="text-xs text-[#C67D43] mt-1 font-medium">
                  You and <span className="font-bold text-[#532E16]">{newMatch.name}</span> liked each other!
                </p>
              </div>

              <div className="flex items-center justify-center -space-x-4 py-2">
                <div className="w-20 h-20 rounded-full border-4 border-[#F5F4F4] overflow-hidden shadow-md">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" alt="You" className="w-full h-full object-cover" />
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-[#F5F4F4] overflow-hidden shadow-md z-10">
                  <img src={newMatch.photos[0]} alt={newMatch.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    dismissMatchModal();
                    navigate('/chat');
                  }}
                  className="w-full py-3 rounded-2xl bg-[#F3B250] text-[#532E16] font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:bg-[#F3B250]/90 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send a Message
                </button>
                <button
                  onClick={dismissMatchModal}
                  className="w-full py-2.5 rounded-2xl bg-[#532E16]/10 text-[#532E16] text-xs font-semibold hover:bg-[#532E16]/20 transition"
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
