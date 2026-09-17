import React from 'react';
import { ArrowLeft, Shield, Heart, UserCheck, Lock, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GUIDELINES = [
  {
    icon: Heart,
    title: '1. Respect & Kindness',
    description:
      'Treat every student with courtesy, dignity, and empathy. Harassment, hate speech, derogatory language, and bullying have zero place on our campus and will not be tolerated.',
  },
  {
    icon: UserCheck,
    title: '2. Authentic Profiles',
    description:
      'Be genuine. Use your real photos and honest college information. Creating fake accounts, impersonating classmates, or using misleading photos will result in immediate profile suspension.',
  },
  {
    icon: Lock,
    title: '3. Consent & Boundaries',
    description:
      'Always respect personal boundaries in chat, voice notes, and person. Sending unsolicited explicit media, sexually aggressive messages, or non-consensual content is strictly forbidden.',
  },
  {
    icon: MapPin,
    title: '4. Safe Campus Meetups',
    description:
      'When taking your connection offline, always meet in public, populated campus spots—like the student union, coffee shops, or library cafes. Tell a friend or roommate where you are going.',
  },
  {
    icon: Shield,
    title: '5. Campus Integrity',
    description:
      'Two Birds is an authentic community for verified university students. Commercial solicitation, promotions, spam, scams, or posting unlawful content is strictly prohibited.',
  },
  {
    icon: AlertCircle,
    title: '6. Community Moderation',
    description:
      'Look out for one another. If you experience or observe uncomfortable, harmful, or suspicious behavior, report the user immediately. All reports are 100% confidential and reviewed swiftly.',
  },
];

export const CommunityGuidelines: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#FFFFFF] flex flex-col max-w-md mx-auto relative pb-12">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#1A1A1A]/90 backdrop-blur-md border-b border-[#333333] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-[#2A2A2A] text-[#CCCCCC] hover:text-[#FFFFFF] transition"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white font-serif">Community Guidelines</h1>
        <div className="w-9" />
      </div>

      <div className="p-5 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] mx-auto shadow-glow-gold">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white font-serif">Two Birds Standards</h2>
          <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-xs mx-auto">
            Our campus community thrives when every student feels safe, valued, and respected. We ask all members to uphold these core principles.
          </p>
        </div>

        {/* Guidelines Cards */}
        <div className="space-y-3.5">
          {GUIDELINES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#242424] border border-[#333333] space-y-2 hover:border-[#4A4A4A] transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white font-serif">{item.title}</h3>
                </div>
                <p className="text-xs text-[#CCCCCC] leading-relaxed pl-1">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* Reporting Notice */}
        <div className="p-4 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 space-y-2 text-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C]">Need Help or Want to Report?</h4>
          <p className="text-xs text-[#CCCCCC] leading-relaxed">
            You can report or block any profile directly from the discovery feed or chat screen. For urgent safety concerns, please contact your university emergency services or campus security.
          </p>
        </div>

        {/* Back Button */}
        <div className="pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#DFBA5E] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider hover:brightness-105 transition"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityGuidelines;
