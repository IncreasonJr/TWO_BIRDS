import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { formatGradYear, formatDistance, getZodiacEmoji } from '../utils/formatters';
import { MapPin, GraduationCap, Info, X, Star, Music, Sparkles, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface SwipeCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isFront: boolean;
  depth?: number;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe, isFront, depth = 0 }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.4, 1, 1, 1, 0.4]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-20, -120], [0, 1]);
  const superlikeOpacity = useTransform(y, [-20, -100], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y < -150 && Math.abs(info.offset.x) < 80) {
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
    const isThird = depth === 2;
    return (
      <div
        className={`absolute inset-0 rounded-3xl overflow-hidden bg-[#333333] border border-[#4A4A4A] shadow-xl pointer-events-none transition-all duration-300 ${
          isThird ? 'scale-90 translate-y-6 opacity-30 z-0' : 'scale-95 translate-y-3 opacity-60 z-10'
        }`}
      >
        <img
          src={profile.photos[0]}
          alt={profile.name}
          className="w-full h-full object-cover filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <>
      <motion.div
        style={{ x, y, rotate, opacity, scale }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.75}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        className="absolute inset-0 z-20 rounded-3xl overflow-hidden bg-[#333333] border border-[#4A4A4A] shadow-2xl cursor-grab select-none touch-none"
      >
        <div className="relative w-full h-full">
          <img
            src={profile.photos[photoIndex]}
            alt={profile.name}
            className="w-full h-full object-cover pointer-events-none"
          />

          {/* Photo Indicator Dots */}
          {profile.photos.length > 1 && (
            <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5">
              {profile.photos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i === photoIndex ? 'bg-[#C9A84C] shadow-glow-gold' : 'bg-[#FFFFFF]/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Left/Right Photo Tap Triggers */}
          {profile.photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-0 top-0 bottom-1/3 w-1/3 z-10 opacity-0 hover:opacity-100 flex items-center justify-start pl-2 text-[#FFFFFF]/70 transition"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-0 top-0 bottom-1/3 w-1/3 z-10 opacity-0 hover:opacity-100 flex items-center justify-end pr-2 text-[#FFFFFF]/70 transition"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* Card Dark Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent pointer-events-none" />

          {/* SWIPE OVERLAY STAMPS */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-10 left-8 z-30 border-4 border-[#C9A84C] text-[#C9A84C] font-extrabold text-3xl px-4 py-1 rounded-xl rotate-[-15deg] uppercase tracking-wider shadow-lg bg-[#1A1A1A]/80 backdrop-blur-sm pointer-events-none"
          >
            LIKE
          </motion.div>

          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-10 right-8 z-30 border-4 border-[#4A4A4A] text-[#FFFFFF] font-extrabold text-3xl px-4 py-1 rounded-xl rotate-[15deg] uppercase tracking-wider shadow-lg bg-[#1A1A1A]/80 backdrop-blur-sm pointer-events-none"
          >
            PASS
          </motion.div>

          <motion.div
            style={{ opacity: superlikeOpacity }}
            className="absolute bottom-36 left-1/2 -translate-x-1/2 z-30 border-4 border-[#C9A84C] text-[#C9A84C] font-extrabold text-2xl px-6 py-1 rounded-xl uppercase tracking-wider shadow-lg bg-[#1A1A1A]/90 backdrop-blur-md flex items-center gap-2 pointer-events-none"
          >
            <Star className="w-6 h-6 fill-[#C9A84C]" />
            SUPER LIKE
          </motion.div>

          {/* Student Profile Card Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4 z-20 flex flex-col gap-2 text-[#FFFFFF]">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#FFFFFF]">{profile.name}</h2>
                <span className="text-2xl font-light text-[#C9A84C]">{profile.age}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfoModal(true);
                }}
                className="p-2 rounded-full bg-[#FFFFFF]/20 hover:bg-[#FFFFFF]/30 text-[#FFFFFF] backdrop-blur-md transition shadow-md"
                title="View Full Profile"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 text-[#FFFFFF] text-sm font-semibold">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#C9A84C]" />
                <span>{profile.major}</span>
                <span className="text-[#C9A84C] font-bold">
                  {profile.year ? `• ${profile.year}` : formatGradYear(profile.gradYear)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-[#FFFFFF]/90 text-xs font-medium">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>{formatDistance(profile.distanceMiles)}</span>
              </div>
              {profile.dormOrCampus && (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
                  <span>{profile.dormOrCampus}</span>
                </div>
              )}
            </div>

            <p className="text-[#FFFFFF] text-xs font-medium line-clamp-2 leading-relaxed drop-shadow-sm px-0.5">
              "{profile.bio}"
            </p>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {profile.interests.slice(0, 4).map((interest, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#333333] text-[#FFFFFF] border border-[#4A4A4A] shadow-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded Profile Info Drawer */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1A1A1A]/85 backdrop-blur-md">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#1A1A1A] border border-[#4A4A4A] rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[88vh] overflow-y-auto text-[#FFFFFF] shadow-2xl relative"
            >
              {/* Top Handle / Close Button */}
              <div className="flex items-center justify-between border-b border-[#4A4A4A] pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-[#FFFFFF]">{profile.name}, {profile.age}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] font-bold border border-[#C9A84C]/40">
                    {profile.year || 'Student'}
                  </span>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2 rounded-full bg-[#333333] text-[#FFFFFF] hover:bg-[#4A4A4A] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photo Carousel in Modal */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#333333]">
                <img
                  src={profile.photos[photoIndex]}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                {profile.photos.length > 1 && (
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 px-4">
                    {profile.photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === photoIndex ? 'w-6 bg-[#C9A84C]' : 'w-2 bg-[#FFFFFF]/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Detail Content */}
              <div className="space-y-4 text-xs">
                {/* Major & Campus */}
                <div className="bg-[#333333] border border-[#4A4A4A] p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#FFFFFF]">
                    <GraduationCap className="w-4 h-4 text-[#C9A84C]" />
                    <span>{profile.major}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#C9A84C] font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Class of {profile.gradYear}
                    </span>
                    {profile.dormOrCampus && (
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> {profile.dormOrCampus}
                      </span>
                    )}
                  </div>
                </div>

                {/* About Me Bio */}
                <div className="bg-[#333333] border border-[#4A4A4A] p-4 rounded-2xl space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]">About Me</h4>
                  <p className="text-[#FFFFFF] text-xs leading-relaxed font-medium">{profile.bio}</p>
                </div>

                {/* Zodiac & Spotify Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {profile.zodiacSign && (
                    <div className="bg-[#333333] border border-[#4A4A4A] p-3 rounded-2xl space-y-1">
                      <span className="text-[#C9A84C] block font-bold text-[10px] uppercase">Zodiac</span>
                      <span className="font-extrabold text-[#FFFFFF]">{getZodiacEmoji(profile.zodiacSign)}</span>
                    </div>
                  )}
                  {profile.spotifyTopArtist && (
                    <div className="bg-[#333333] border border-[#4A4A4A] p-3 rounded-2xl space-y-1">
                      <span className="text-[#C9A84C] block font-bold text-[10px] uppercase flex items-center gap-1">
                        <Music className="w-3 h-3 text-[#C9A84C]" /> Spotify Top
                      </span>
                      <span className="font-extrabold text-[#FFFFFF] truncate block">{profile.spotifyTopArtist}</span>
                    </div>
                  )}
                </div>

                {/* All Interests */}
                <div className="bg-[#333333] border border-[#4A4A4A] p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs bg-[#1A1A1A] text-[#FFFFFF] border border-[#4A4A4A] font-semibold">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-md hover:bg-[#C9A84C]/90 transition"
              >
                Back to Discovery
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
