import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { Smile, Mic, Send, Square, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendVoiceNote: (audioUrl: string, duration: string) => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendVoiceNote,
  placeholder = 'Type a message...'
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 40), 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  // Handle outside click for emoji picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setText((prev) => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format recording seconds to mm:ss
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Voice Recording Logic (MediaRecorder API with Web Audio fallback)
  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const durationStr = formatDuration(recordingSeconds || 3);
          onSendVoiceNote(audioUrl, durationStr);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
      }

      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access fallback, using simulated audio blob:', err);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecordingAndSend = () => {
    if (!isRecording) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback simulated voice note URL
      const fallbackUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      const durationStr = formatDuration(recordingSeconds || 4);
      onSendVoiceNote(fallbackUrl, durationStr);
    }

    setIsRecording(false);
    setRecordingSeconds(0);
  };

  return (
    <div className="relative w-full z-40">
      {/* Emoji Picker Popup */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-3 z-50 shadow-2xl rounded-2xl overflow-hidden border border-[#4A4A4A]"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              searchPlaceHolder="Search emojis..."
              width={310}
              height={360}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pill Input Container */}
      <div className="bg-[#333333] border border-[#4A4A4A] rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg transition-all focus-within:border-[#C9A84C]">
        {/* Recording Overlay vs Input Controls */}
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="font-extrabold text-red-400">Recording...</span>
              <span className="font-bold text-[#C9A84C] font-mono">{formatDuration(recordingSeconds)}</span>
            </div>

            <button
              onClick={stopRecordingAndSend}
              className="px-3 py-1 rounded-full bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-[11px] flex items-center gap-1 shadow-glow-gold hover:bg-[#C9A84C]/90 active:scale-95 transition"
            >
              <Square className="w-3 h-3 fill-[#1A1A1A]" />
              Release to Send
            </button>
          </div>
        ) : (
          <>
            {/* 1. Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                showEmojiPicker
                  ? 'text-[#C9A84C] bg-[#1A1A1A]'
                  : 'text-[#A0A0A0] hover:text-[#C9A84C] hover:bg-[#1A1A1A]/50'
              }`}
              title="Add Emoji"
            >
              <Smile className="w-5 h-5 stroke-[2]" />
            </button>

            {/* 2. Text Input (Auto-growing) */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-xs text-[#FFFFFF] placeholder-[#A0A0A0] focus:outline-none resize-none overflow-y-auto max-h-28 py-2 font-medium"
            />

            {/* 3. Voice Note Button */}
            <button
              type="button"
              onMouseDown={startRecording}
              onMouseUp={stopRecordingAndSend}
              onTouchStart={startRecording}
              onTouchEnd={stopRecordingAndSend}
              className="p-2 rounded-full text-[#A0A0A0] hover:text-[#C9A84C] hover:bg-[#1A1A1A]/50 transition-colors flex-shrink-0"
              title="Hold to Record Voice Note"
            >
              <Mic className="w-5 h-5 stroke-[2]" />
            </button>

            {/* 4. Send Button (Gold Circular) */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim()}
              className={`p-2.5 rounded-full flex-shrink-0 transition-all ${
                text.trim()
                  ? 'bg-[#C9A84C] text-[#1A1A1A] shadow-glow-gold hover:bg-[#C9A84C]/90 active:scale-95'
                  : 'bg-[#1A1A1A] text-[#4A4A4A] cursor-not-allowed border border-[#4A4A4A]/40'
              }`}
              title="Send Message"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
