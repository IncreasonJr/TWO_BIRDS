import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { UserProfile } from '../types';
import { formatGradYear, formatDistance, getZodiacEmoji } from '../utils/formatters';
import { ShieldCheck, MapPin, GraduationCap, Info, X, Star, Music, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isFront: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe, isFront }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-20, -120], [0, 1]);
  const superlikeOpacity = useTransform(y, [-20, -100], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y < -120 && Math.abs(info.offset.x) < 80) {
      onSwipe('up');
    } else if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile.photos.length > 1) {
      setPhotoIndex((prev) => (prev + 1) % profile.photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile.photos.length > 1) {
      setPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
    }
  };

  if (!isFront) {
    return (
      <div className="absolute inset-0 rounded-3xl overflow-hidden bg-[#F5F4F4] border-2 border-[#C67D43]/20 shadow-lg pointer-events-none scale-95 translate-y-3 opacity-60">
        <img
          src={profile.photos[0]}
          alt={profile.name}
          className="w-full h-full object-cover filter brightness-90"
        />
      </div>
    );
  }

  return (
    <>
      <motion.div
        style={{ x, y, rotate, opacity }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        className="absolute inset-0 rounded-3xl overflow-hidden bg-[#F5F4F4] border-2 border-[#C67D43]/30 shadow-2xl cursor-grab select-none touch-none"
      >
        <div className="relative w-full h-full">
          <img
            src={profile.photos[photoIndex]}
            alt={profile.name}
            className="w-full h-full object-cover pointer-events-none"
          />

          {profile.photos.length > 1 && (
            <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5">
              {profile.photos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i === photoIndex ? 'bg-[#F3B250] shadow-glow-amber' : 'bg-[#F5F4F4]/50'
                  }`}
                />
              ))}
            </div>
          )}

          {profile.photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-0 top-0 bottom-1/3 w-1/2 z-10 opacity-0 hover:opacity-100 flex items-center justify-start pl-2 text-[#F5F4F4]/70"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-0 top-0 bottom-1/3 w-1/2 z-10 opacity-0 hover:opacity-100 flex items-center justify-end pr-2 text-[#F5F4F4]/70"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#532E16] via-[#532E16]/40 to-transparent pointer-events-none" />

          {/* SWIPE OVERLAY STAMPS (ZERO EMOJIS) */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-10 left-8 z-30 border-4 border-[#F3B250] text-[#F3B250] font-extrabold text-3xl px-4 py-1 rounded-xl rotate-[-15deg] uppercase tracking-wider shadow-lg bg-[#532E16]/60 backdrop-blur-sm"
          >
            LIKE
          </motion.div>

          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-10 right-8 z-30 border-4 border-[#C67D43] text-[#C67D43] font-extrabold text-3xl px-4 py-1 rounded-xl rotate-[15deg] uppercase tracking-wider shadow-lg bg-[#532E16]/60 backdrop-blur-sm"
          >
            PASS
          </motion.div>

          <motion.div
            style={{ opacity: superlikeOpacity }}
            className="absolute bottom-36 left-1/2 -translate-x-1/2 z-30 border-4 border-[#F3B250] text-[#F3B250] font-extrabold text-2xl px-6 py-1 rounded-xl uppercase tracking-wider shadow-lg bg-[#532E16]/80 backdrop-blur-md flex items-center gap-2"
          >
            <Star className="w-6 h-6 fill-[#F3B250]" />
            SUPER LIKE
          </motion.div>

          {/* Student Profile Card Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-5 z-20 flex flex-col gap-2.5 text-[#F5F4F4]">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold tracking-tight text-[#F5F4F4]">{profile.name}</h2>
                <span className="text-2xl font-light text-[#F3B250]">{profile.age}</span>
                {profile.verifiedCampus && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F3B250]/20 text-[#F3B250] text-xs font-semibold border border-[#F3B250]/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Student
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfoModal(true);
                }}
                className="p-2 rounded-full bg-[#F5F4F4]/15 hover:bg-[#F5F4F4]/25 text-[#F5F4F4] backdrop-blur-md transition"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-[#F5F4F4]/90 text-sm font-medium">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#F3B250]" />
                <span>{profile.major}</span>
                <span className="text-[#F3B250] font-semibold">{formatGradYear(profile.gradYear)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[#F5F4F4]/70 text-xs">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F3B250]" />
                <span>{formatDistance(profile.distanceMiles)}</span>
              </div>
              {profile.dormOrCampus && (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#F3B250]" />
                  <span>{profile.dormOrCampus}</span>
                </div>
              )}
            </div>

            <p className="text-[#F5F4F4]/90 text-xs line-clamp-2 leading-relaxed bg-[#532E16]/40 p-2.5 rounded-xl backdrop-blur-sm border border-[#F5F4F4]/10">
              "{profile.bio}"
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.interests.slice(0, 4).map((interest, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F3B250]/20 text-[#F5F4F4] border border-[#F3B250]/30"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Detail Drawer Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#050505]/75 backdrop-blur-md">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="w-full max-w-md bg-[#F5F4F4] border-2 border-[#C67D43]/30 rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto text-[#532E16]"
          >
            <div className="flex items-center justify-between border-b border-[#C67D43]/20 pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#532E16]">{profile.name}, {profile.age}</h3>
                <p className="text-xs text-[#C67D43] font-medium">{profile.university}</p>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-2 rounded-full bg-[#532E16]/10 text-[#532E16] hover:bg-[#532E16]/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C67D43] mb-1">About Me</h4>
                <p className="text-[#532E16] leading-relaxed bg-[#532E16]/5 p-3 rounded-xl border border-[#C67D43]/10">{profile.bio}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#532E16]/5 p-3 rounded-xl border border-[#C67D43]/10 space-y-1">
                  <span className="text-[#C67D43] block font-semibold">Zodiac</span>
                  <span className="font-bold text-[#532E16]">{getZodiacEmoji(profile.zodiacSign)}</span>
                </div>
                {profile.spotifyTopArtist && (
                  <div className="bg-[#532E16]/5 p-3 rounded-xl border border-[#C67D43]/10 space-y-1">
                    <span className="text-[#C67D43] block font-semibold flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-[#F3B250]" /> Spotify Top
                    </span>
                    <span className="font-bold text-[#532E16]">{profile.spotifyTopArtist}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C67D43] mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs bg-[#F3B250]/20 text-[#532E16] border border-[#F3B250]/40 font-medium">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-3 rounded-2xl bg-[#F3B250] text-[#532E16] font-bold text-sm shadow-md hover:bg-[#F3B250]/90 transition"
            >
              Back to Swipe
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
