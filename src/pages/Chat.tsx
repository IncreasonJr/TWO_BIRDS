import React, { useState, useRef, useEffect } from 'react';
import { useMatches } from '../hooks/useMatches';
import { Send, ShieldCheck, ArrowLeft, Coffee, BookOpen, Music, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Chat: React.FC = () => {
  const { activeMatch, activeMessages, handleSendMessage } = useMatches();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const onSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    handleSendMessage(inputText);
    setInputText('');
  };

  const handleIcebreakerClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  if (!activeMatch) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-7rem)] p-6 text-center text-[#C67D43] space-y-3 bg-[#F5F4F4]">
        <p className="text-sm font-medium">No active match selected.</p>
        <button
          onClick={() => navigate('/matches')}
          className="px-4 py-2 rounded-xl bg-[#F3B250] text-[#532E16] text-xs font-bold shadow-md"
        >
          Go to Matches
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-md mx-auto relative overflow-hidden bg-[#F5F4F4] text-[#532E16]">
      {/* Header Bar */}
      <div className="bg-[#532E16] text-[#F5F4F4] px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/matches')}
            className="p-1.5 rounded-full hover:bg-[#F5F4F4]/10 text-[#F5F4F4] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <img
              src={activeMatch.user.photos[0]}
              alt={activeMatch.user.name}
              className="w-10 h-10 rounded-full object-cover border border-[#F3B250]"
            />
            {activeMatch.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#F3B250] border border-[#532E16]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-[#F5F4F4]">{activeMatch.user.name}</h3>
              <ShieldCheck className="w-3.5 h-3.5 text-[#F3B250]" />
            </div>
            <p className="text-[10px] text-[#F3B250]">
              {activeMatch.user.major} • {activeMatch.user.university}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3B250]/20 border border-[#F3B250]/30 text-[#F3B250] text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F3B250] animate-pulse" />
          Online
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        {/* Match Header Watermark */}
        <div className="p-4 rounded-2xl bg-[#532E16]/5 border border-[#C67D43]/20 text-center space-y-2 mb-4">
          <p className="text-xs text-[#532E16]">
            You matched with <span className="font-bold text-[#532E16]">{activeMatch.user.name}</span>!
          </p>
          <div className="flex justify-center gap-1.5">
            {activeMatch.user.interests.map((tag, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3B250]/20 text-[#532E16] border border-[#F3B250]/40 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Chat Bubbles */}
        {activeMessages.map((msg) => {
          const isMe = msg.senderId === 'current-user' || msg.senderId === activeMatch.users[0];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-[#F3B250] text-[#532E16] font-medium rounded-br-none shadow-md'
                    : 'bg-[#F5F4F4] border-2 border-[#C67D43]/40 text-[#532E16] rounded-bl-none font-medium'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-[#C67D43] px-1 mt-1 font-semibold">
                {msg.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Campus Icebreaker Chips (SVG Icons, Zero Emojis) */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-[#C67D43]/20 bg-[#F5F4F4]">
        <button
          onClick={() => handleIcebreakerClick("Hey! Are you studying at the campus library today?")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#532E16]/5 hover:bg-[#F3B250]/20 text-[11px] text-[#532E16] border border-[#C67D43]/30 font-medium transition"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#C67D43]" />
          Library study session?
        </button>
        <button
          onClick={() => handleIcebreakerClick("Wanna grab coffee or boba between classes?")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#532E16]/5 hover:bg-[#F3B250]/20 text-[11px] text-[#532E16] border border-[#C67D43]/30 font-medium transition"
        >
          <Coffee className="w-3.5 h-3.5 text-[#F3B250]" />
          Grab boba on quad?
        </button>
        <button
          onClick={() => handleIcebreakerClick("What is your favorite study playlist right now?")}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#532E16]/5 hover:bg-[#F3B250]/20 text-[11px] text-[#532E16] border border-[#C67D43]/30 font-medium transition"
        >
          <Music className="w-3.5 h-3.5 text-[#C67D43]" />
          Music recs?
        </button>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={onSend}
        className="p-3 bg-[#F5F4F4] border-t border-[#C67D43]/20 flex items-center gap-2 z-30"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${activeMatch.user.name.split(' ')[0]}...`}
          className="flex-1 bg-[#532E16]/5 border border-[#C67D43]/30 rounded-2xl px-4 py-2.5 text-xs text-[#532E16] placeholder-[#C67D43]/60 focus:outline-none focus:border-[#F3B250] transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-2.5 rounded-2xl transition-all ${
            inputText.trim()
              ? 'bg-[#F3B250] text-[#532E16] shadow-md hover:bg-[#F3B250]/90 active:scale-95'
              : 'bg-[#532E16]/10 text-[#532E16]/40 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
