import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatches } from '../hooks/useMatches';
import { ChatInput } from '../components/ChatInput';
import { TypingIndicator } from '../components/TypingIndicator';

import {
  ArrowLeft,
  Coffee,
  BookOpen,
  Music,
  Sparkles,
  MessageSquare,
  X,
  GraduationCap,
  Award,
  MapPin,
  Compass,
  Disc,
  Home as HomeIcon,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatGradYear } from '../utils/formatters';
import { Message } from '../types';

const ICEBREAKERS = [
  { text: "Library study session?", icon: BookOpen },
  { text: "Grab boba on quad?", icon: Coffee },
  { text: "Music recs?", icon: Music },
  { text: "Study together?", icon: Sparkles },
  { text: "Coffee run?", icon: Coffee },
];

const VoiceMessageBubble: React.FC<{ msg: Message; isMe: boolean }> = ({ msg, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.warn('Audio play error:', err));
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {msg.audioUrl && (
        <audio
          ref={audioRef}
          src={msg.audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      <button
        onClick={togglePlay}
        className={`p-2 rounded-full transition-transform active:scale-95 flex-shrink-0 ${
          isMe
            ? 'bg-[#1A1A1A] text-[#C9A84C]'
            : 'bg-[#C9A84C] text-[#1A1A1A] shadow-glow-gold'
        }`}
        title={isPlaying ? 'Pause Voice Note' : 'Play Voice Note'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current stroke-[2.5]" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5 stroke-[2.5]" />
        )}
      </button>

      {/* Animated Waveform Visualization */}
      <div className="flex items-center gap-0.5 flex-1 min-w-[100px] h-6">
        {[40, 70, 30, 90, 60, 40, 85, 50, 65, 35, 80, 55, 90, 45].map((h, i) => (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              isMe ? 'bg-[#1A1A1A]' : 'bg-[#C9A84C]'
            } ${isPlaying ? 'animate-pulse' : 'opacity-70'}`}
            style={{
              height: isPlaying ? `${Math.max(20, (h + (i % 3) * 15) % 100)}%` : `${h}%`,
              animationDelay: `${i * 0.08}s`
            }}
          />
        ))}
      </div>

      <span className={`text-[10px] font-extrabold flex items-center gap-1 ${isMe ? 'text-[#1A1A1A]' : 'text-[#C9A84C]'}`}>
        <Volume2 className="w-3 h-3" />
        {msg.duration || '0:05'}
      </span>
    </div>
  );
};

export const Chat: React.FC = () => {
  const { activeMatch, activeMessages, isTyping, handleSendMessage, handleSendVoiceNote } = useMatches();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, isTyping]);

  const handleIcebreakerClick = (suggestion: string) => {
    if (!activeMatch) return;
    handleSendMessage(suggestion);
  };

  if (!activeMatch) {
    return (
      <div className="flex flex-col items-center justify-center h-full flex-1 p-6 text-center space-y-3 bg-[#1A1A1A] text-[#FFFFFF]">
        <div className="w-14 h-14 rounded-full bg-[#333333] border border-[#4A4A4A] flex items-center justify-center text-[#C9A84C]">
          <MessageSquare className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-[#FFFFFF]">No active match selected.</p>
        <button
          onClick={() => navigate('/matches')}
          className="px-5 py-2.5 rounded-full bg-[#C9A84C] text-[#1A1A1A] text-xs font-extrabold shadow-glow-gold transition"
        >
          Go to Matches
        </button>
      </div>
    );
  }

  const matchUser = activeMatch.user || {
    name: activeMatch.name,
    age: activeMatch.age,
    major: activeMatch.major,
    photos: activeMatch.photos,
    bio: "Student at Stanford University.",
    university: "Stanford University",
    gradYear: 2026,
    interests: ["Student", "Campus"],
    verifiedCampus: true,
  };

  const matchPhotos = matchUser.photos && matchUser.photos.length > 0 ? matchUser.photos : activeMatch.photos;

  return (
    <div className="flex flex-col h-full flex-1 max-w-md mx-auto relative overflow-hidden bg-[#1A1A1A] text-[#FFFFFF] select-none">
      {/* Match Header (Top) */}
      <div className="bg-[#1A1A1A] border-b border-[#4A4A4A] px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/matches')}
            className="p-1.5 rounded-full hover:bg-[#333333] text-[#FFFFFF] transition"
            title="Back to Matches"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Clickable Profile Picture & Info */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2.5 group text-left transition hover:opacity-90"
            title="View Profile"
          >
            <div className="relative">
              <img
                src={matchPhotos[0]}
                alt={activeMatch.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A84C] group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-[#FFFFFF] group-hover:text-[#C9A84C] transition-colors">
                {activeMatch.name}
              </h3>
              <p className="text-[10px] text-[#A0A0A0] font-semibold">
                {activeMatch.major}
              </p>
            </div>
          </button>
        </div>

        {/* View Profile Button Chip */}
        <button
          onClick={() => setIsProfileOpen(true)}
          className="px-3 py-1 rounded-full bg-[#333333] hover:bg-[#4A4A4A] border border-[#C9A84C]/50 text-[#C9A84C] text-[10px] font-bold transition active:scale-95"
        >
          View Profile
        </button>
      </div>

      {/* Message Feed Area (Scrollable Only Here) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 space-y-3.5">
        {/* Match Header Card Watermark */}
        <div
          onClick={() => setIsProfileOpen(true)}
          className="p-4 rounded-2xl bg-[#333333] border border-[#4A4A4A] hover:border-[#C9A84C]/60 transition cursor-pointer text-center space-y-2 mb-4 group shadow-sm"
        >
          <p className="text-xs text-[#FFFFFF]">
            You matched with <span className="font-bold text-[#C9A84C] group-hover:underline">{activeMatch.name}</span>!
          </p>
          {matchUser.interests && (
            <div className="flex justify-center flex-wrap gap-1.5">
              {matchUser.interests.map((tag, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#FFFFFF] border border-[#4A4A4A] font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-[10px] text-[#C9A84C] font-bold pt-1">Tap to view full profile →</p>
        </div>

        {/* Empty Message State */}
        {activeMessages.length === 0 && (
          <div className="text-center py-8 space-y-1">
            <p className="text-xs font-bold text-[#C9A84C]">Say hi to your match!</p>
            <p className="text-[11px] text-[#A0A0A0]">Break the ice with a text or voice note below.</p>
          </div>
        )}

        {/* Chat Bubbles */}
        {activeMessages.map((msg) => {
          const isMe = msg.senderId === 'current-user';
          const isVoice = msg.type === 'voice';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[80%]">
                {!isMe && (
                  <img
                    src={matchPhotos[0]}
                    alt={activeMatch.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#C9A84C] mb-1 flex-shrink-0"
                  />
                )}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm break-words overflow-hidden max-w-full ${
                    isMe
                      ? 'bg-[#C9A84C] text-[#1A1A1A] font-bold rounded-br-none shadow-glow-gold'
                      : 'bg-[#333333] border border-[#4A4A4A] text-[#FFFFFF] rounded-bl-none font-medium'
                  }`}
                >
                  {isVoice ? (
                    <VoiceMessageBubble msg={msg} isMe={isMe} />
                  ) : (
                    <span className="break-words whitespace-pre-wrap">{msg.text}</span>
                  )}
                </div>
              </div>
              <span className="text-[9px] text-[#A0A0A0] px-1 mt-1 font-semibold">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <TypingIndicator
              name={activeMatch.name}
              avatarUrl={matchPhotos[0]}
            />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Icebreaker Suggestions (Sticky Bottom) */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-[#4A4A4A] bg-[#1A1A1A] flex-shrink-0">
        {ICEBREAKERS.map((item, index) => {
          const IconComp = item.icon;
          return (
            <button
              key={index}
              onClick={() => handleIcebreakerClick(item.text)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#333333] border border-[#C9A84C]/50 hover:border-[#C9A84C] text-[11px] text-[#FFFFFF] font-medium transition shadow-sm"
            >
              <IconComp className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>{item.text}</span>
            </button>
          );
        })}
      </div>

      {/* ENHANCED CHAT INPUT COMPONENT (Fixed Sticky at Bottom) */}
      <div className="px-3 pt-1.5 pb-[15px] bg-[#1A1A1A] z-30 shadow-lg flex-shrink-0">
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendVoiceNote={handleSendVoiceNote}
          placeholder={`Message ${activeMatch.name.split(' ')[0]}...`}
        />
      </div>

      {/* MATCH PROFILE DETAIL MODAL */}
      <AnimatePresence>
        {isProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1A1A1A]/85 backdrop-blur-md">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-[#1A1A1A] border-t sm:border border-[#4A4A4A] rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-[#FFFFFF] relative"
            >
              {/* Modal Top Bar */}
              <div className="px-4 py-3 bg-[#333333] border-b border-[#4A4A4A] flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C] shadow-glow-gold" />
                  <h3 className="text-xs font-extrabold text-[#FFFFFF] uppercase tracking-wider">
                    {activeMatch.name}'s Profile
                  </h3>
                </div>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="p-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#4A4A4A] text-[#FFFFFF] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                {/* Photo Gallery Carousel */}
                <div className="relative rounded-3xl overflow-hidden h-72 w-full bg-[#333333] border border-[#4A4A4A] shadow-md">
                  <img
                    src={matchPhotos[photoIndex] || matchPhotos[0]}
                    alt={matchUser.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Photo Counter */}
                  {matchPhotos.length > 1 && (
                    <>
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1A1A1A]/80 text-[#FFFFFF] text-[10px] font-bold border border-[#4A4A4A]">
                        {photoIndex + 1} / {matchPhotos.length}
                      </div>

                      <div className="absolute inset-y-0 left-0 flex items-center p-2">
                        <button
                          onClick={() => setPhotoIndex((prev) => (prev > 0 ? prev - 1 : matchPhotos.length - 1))}
                          className="p-1.5 rounded-full bg-[#1A1A1A]/70 text-[#FFFFFF] hover:bg-[#1A1A1A] transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="absolute inset-y-0 right-0 flex items-center p-2">
                        <button
                          onClick={() => setPhotoIndex((prev) => (prev < matchPhotos.length - 1 ? prev + 1 : 0))}
                          className="p-1.5 rounded-full bg-[#1A1A1A]/70 text-[#FFFFFF] hover:bg-[#1A1A1A] transition"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Overlay Gradient Name Info */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/60 to-transparent p-4 flex flex-col justify-end">
                    <h2 className="text-2xl font-extrabold text-[#FFFFFF]">
                      {matchUser.name}, <span className="text-[#C9A84C]">{matchUser.age}</span>
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-[#C9A84C] font-bold mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>{matchUser.major} {matchUser.gradYear ? `• ${formatGradYear(matchUser.gradYear)}` : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Campus Verification Badge */}
                <div className="bg-[#333333] border border-[#C9A84C]/40 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#C9A84C]/20 text-[#C9A84C]">
                      <Award className="w-4 h-4 text-[#C9A84C]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#FFFFFF]">Verified Student</h4>
                      <p className="text-[10px] text-[#A0A0A0] font-medium">{matchUser.university || 'Stanford University'}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/40">
                    Verified
                  </span>
                </div>

                {/* Bio Card */}
                <div className="bg-[#333333] border border-[#4A4A4A] p-4 rounded-2xl space-y-1.5 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]">Bio</h4>
                  <p className="text-xs text-[#FFFFFF] leading-relaxed font-medium">
                    {matchUser.bio || "Student at Stanford University."}
                  </p>
                </div>

                {/* Interests Chips */}
                {matchUser.interests && matchUser.interests.length > 0 && (
                  <div className="bg-[#333333] border border-[#4A4A4A] p-4 rounded-2xl space-y-2 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchUser.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#C9A84C] text-[#1A1A1A] shadow-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extra Student Highlights */}
                <div className="grid grid-cols-2 gap-2">
                  {matchUser.zodiacSign && (
                    <div className="bg-[#333333] border border-[#4A4A4A] p-3 rounded-2xl flex items-center gap-2.5 text-xs text-[#FFFFFF] font-bold">
                      <Compass className="w-4 h-4 text-[#C9A84C]" />
                      <span>{matchUser.zodiacSign}</span>
                    </div>
                  )}

                  {matchUser.spotifyTopArtist && (
                    <div className="bg-[#333333] border border-[#4A4A4A] p-3 rounded-2xl flex items-center gap-2.5 text-xs text-[#FFFFFF] font-bold">
                      <Disc className="w-4 h-4 text-[#C9A84C]" />
                      <span className="truncate">{matchUser.spotifyTopArtist}</span>
                    </div>
                  )}

                  {matchUser.dormOrCampus && (
                    <div className="bg-[#333333] border border-[#4A4A4A] p-3 rounded-2xl flex items-center gap-2.5 text-xs text-[#FFFFFF] font-bold">
                      <HomeIcon className="w-4 h-4 text-[#C9A84C]" />
                      <span className="truncate">{matchUser.dormOrCampus}</span>
                    </div>
                  )}

                  <div className="bg-[#333333] border border-[#4A4A4A] p-3 rounded-2xl flex items-center gap-2.5 text-xs text-[#FFFFFF] font-bold">
                    <MapPin className="w-4 h-4 text-[#C9A84C]" />
                    <span>0.5 miles away</span>
                  </div>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="p-4 bg-[#333333] border-t border-[#4A4A4A]">
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold flex items-center justify-center gap-2 hover:bg-[#C9A84C]/90 transition"
                >
                  Back to Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
