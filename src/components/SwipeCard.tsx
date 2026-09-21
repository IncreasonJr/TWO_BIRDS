import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { getZodiacEmoji } from '../utils/formatters';
import { GraduationCap, Info, X, Music, School, ChevronLeft, ChevronRight, MoreVertical, Shield, Ban } from 'lucide-react';
import { ReportModal } from './ReportModal';
import { BlockModal } from './BlockModal';

interface SwipeCardProps {
  profile: UserProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  isFront: boolean;
  depth?: number;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe, isFront, depth = 0 }) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.4, 1, 1, 1, 0.4]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-20, -120], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  const photos = Array.isArray(profile.photos) ? profile.photos : [];
  const currentPhoto = photos.length > 0 ? photos[photoIndex] : null;
  const firstPhoto = photos.length > 0 ? photos[0] : null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 1) {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photos.length > 1) {
      setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
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
        {firstPhoto ? (
          <img
            src={firstPhoto}
            alt={`${profile.name}'s photo preview`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover filter brightness-90"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#333333] via-[#1A1A1A] to-[#1A1A1A] flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[#C9A84C]/20 border-2 border-[#C9A84C] text-[#C9A84C] flex items-center justify-center font-extrabold text-3xl font-serif">
              {getInitials(profile.name)}
            </div>
          </div>
        )}
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
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt={`${profile.name}'s profile photo`}
              decoding="async"
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#333333] via-[#1A1A1A] to-[#0D0D0D] flex flex-col items-center justify-center relative pointer-events-none">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#C9A84C] to-[#E5C77A] text-[#1A1A1A] shadow-glow-gold flex items-center justify-center font-extrabold text-3xl font-serif mb-16 border-2 border-[#FFFFFF]/20">
                {getInitials(profile.name)}
              </div>
              <div className="absolute top-6 px-3 py-1 rounded-full bg-[#333333]/80 border border-[#C9A84C]/40 text-[#C9A84C] text-[10px] font-bold">
                Campus Student
              </div>
            </div>
          )}

          {/* Photo Indicator Dots */}
          {photos.length > 1 && (
            <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5">
              {photos.map((_, i) => (
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
          {photos.length > 1 && (
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

          {/* Student Profile Card Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4 z-20 flex flex-col gap-2 text-[#FFFFFF]">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-extrabold tracking-tight text-[#FFFFFF]">{profile.name}</h2>
                <span className="text-2xl font-light text-[#C9A84C]">{profile.age}</span>
              </div>

              <div className="flex items-center gap-2">
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

                {/* More Options / Safety Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu((prev) => !prev);
                    }}
                    className="p-2 rounded-full bg-[#1A1A1A]/70 hover:bg-[#1A1A1A]/90 text-[#FFFFFF] backdrop-blur-md transition shadow-md border border-[#4A4A4A]"
                    title="Safety Options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        className="absolute right-0 bottom-full mb-2 w-44 rounded-2xl bg-[#1A1A1A]/95 backdrop-blur-md border border-[#4A4A4A] shadow-2xl p-1.5 z-50 flex flex-col gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setShowReportModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#CCCCCC] hover:text-[#FFFFFF] hover:bg-[#2A2A2A] rounded-xl transition text-left"
                        >
                          <Shield className="w-4 h-4 text-[#C9A84C]" />
                          <span>Report {profile.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMenu(false);
                            setShowBlockModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition text-left"
                        >
                          <Ban className="w-4 h-4 text-red-400" />
                          <span>Block {profile.name}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[#FFFFFF] text-sm font-semibold">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#C9A84C]" />
                <span>{profile.major}</span>
              </div>
            </div>

            {profile.university && (
              <div className="flex items-center gap-1.5 text-[#FFFFFF]/90 text-xs font-medium">
                <School className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>{profile.university}</span>
              </div>
            )}

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
                  <h3 className="text-xl font-extrabold text-[#FFFFFF] font-serif">{profile.name}, {profile.age}</h3>
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
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt={`${profile.name}'s detailed profile photo`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#333333] via-[#1A1A1A] to-[#0D0D0D] flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#C9A84C] text-[#1A1A1A] flex items-center justify-center font-extrabold text-2xl font-serif">
                      {getInitials(profile.name)}
                    </div>
                  </div>
                )}
                {photos.length > 1 && (
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 px-4">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        aria-label={`View photo ${i + 1} of ${photos.length}`}
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
                {/* Major & University */}
                <div className="bg-[#333333] border border-[#4A4A4A] p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#FFFFFF]">
                    <GraduationCap className="w-4 h-4 text-[#C9A84C]" />
                    <span>{profile.major}</span>
                  </div>
                  {profile.university && (
                    <div className="flex items-center gap-1.5 text-xs text-[#C9A84C] font-semibold">
                      <School className="w-3.5 h-3.5" />
                      <span>{profile.university}</span>
                    </div>
                  )}
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
                {/* Safety & Moderation Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#4A4A4A]/60 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInfoModal(false);
                      setShowReportModal(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-[#A0A0A0] hover:text-[#C9A84C] transition py-1"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>Report Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInfoModal(false);
                      setShowBlockModal(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition py-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Block User</span>
                  </button>
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

      {/* Safety Modals */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetUserId={profile.id}
        targetUserName={profile.name}
      />
      <BlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        targetUserId={profile.id}
        targetUserName={profile.name}
        onBlockSuccess={() => {
          onSwipe('left');
        }}
      />
    </>
  );
};
