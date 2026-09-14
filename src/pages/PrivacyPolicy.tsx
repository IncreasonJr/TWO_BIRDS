import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Lock, Eye, FileText, UserCheck, AlertCircle, Mail } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] text-[#FFFFFF] overflow-hidden">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-md px-4 py-3 border-b border-[#4A4A4A] flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#FFFFFF] hover:text-[#C9A84C] transition active:scale-95 p-1 rounded-lg hover:bg-[#333333]"
        >
          <ChevronLeft className="w-5 h-5 text-[#C9A84C]" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <img
            src="/logo192.png"
            alt="Two Birds Logo"
            className="w-6 h-6 rounded-lg object-cover border border-[#C9A84C]/40 shadow-glow-gold"
          />
          <span className="font-serif font-extrabold text-base tracking-tight text-[#FFFFFF]">
            Two Birds
          </span>
        </div>

        <div className="w-12" /> {/* Spacer for balanced center alignment */}
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-md mx-auto w-full">
        {/* Page Title & Last Updated */}
        <div className="space-y-1.5 pb-2 border-b border-[#4A4A4A]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] text-[11px] font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>Campus Trust & Privacy</span>
          </div>
          <h1 className="text-2xl font-serif font-extrabold text-[#FFFFFF] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#A0A0A0] font-medium">
            Last updated: September 14, 2026
          </p>
        </div>

        {/* 1. Introduction */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>1. Introduction</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed font-normal">
            Welcome to Two Birds ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our campus dating and connections mobile application.
          </p>
        </div>

        {/* 2. Information We Collect */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2.5 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>2. Information We Collect</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            To provide genuine, verified university connections, we collect the following categories of information:
          </p>
          <ul className="space-y-1.5 text-xs text-[#FFFFFF]/80 list-disc list-inside pl-1 font-normal">
            <li><strong className="text-[#FFFFFF]">Profile Information:</strong> Name, university email (.edu), age, gender identity, major, campus/dorm affiliation, bio, and interests.</li>
            <li><strong className="text-[#FFFFFF]">Photos & Media:</strong> Images and audio voice notes you upload to your profile or send in chats.</li>
            <li><strong className="text-[#FFFFFF]">Campus Location:</strong> Approximate distance and campus proximity to help discover students nearby. We do not broadcast your exact real-time GPS coordinates.</li>
            <li><strong className="text-[#FFFFFF]">Usage & Activity:</strong> Swipe decisions (likes, passes), matches made, messaging timestamps, and app interaction data.</li>
          </ul>
        </div>

        {/* 3. How We Use Your Information */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>3. How We Use Your Information</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We use collected data solely to:
          </p>
          <ul className="space-y-1 text-xs text-[#FFFFFF]/80 list-disc list-inside pl-1">
            <li>Verify university enrollment and protect campus safety.</li>
            <li>Match you with compatible verified students.</li>
            <li>Facilitate real-time messaging, icebreakers, and voice notes.</li>
            <li>Maintain app security, prevent bot networks, and resolve technical issues.</li>
          </ul>
        </div>

        {/* 4. Sharing Your Information */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>4. Sharing Your Information</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed font-semibold text-[#C9A84C]">
            We never sell, rent, or monetize your personal data or photos to third parties or advertisers.
          </p>
          <p className="text-xs text-[#FFFFFF]/80 leading-relaxed">
            Your information is only shared in these limited scenarios:
          </p>
          <ul className="space-y-1 text-xs text-[#FFFFFF]/80 list-disc list-inside pl-1">
            <li><strong className="text-[#FFFFFF]">Other Students:</strong> Information included on your public dating card is visible to other verified students.</li>
            <li><strong className="text-[#FFFFFF]">Service Providers:</strong> Trusted cloud hosting and database vendors bound by strict data protection agreements.</li>
            <li><strong className="text-[#FFFFFF]">Legal Compliance:</strong> When required by law or to protect user safety and prevent harm.</li>
          </ul>
        </div>

        {/* 5. Your Rights */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>5. Your Rights & Choices</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            You maintain full control over your personal data:
          </p>
          <ul className="space-y-1 text-xs text-[#FFFFFF]/80 list-disc list-inside pl-1">
            <li><strong className="text-[#FFFFFF]">Access & Export:</strong> Request a copy of your personal data at any time.</li>
            <li><strong className="text-[#FFFFFF]">Correction:</strong> Edit your photos, bio, interests, and details directly in the Profile tab.</li>
            <li><strong className="text-[#FFFFFF]">Account Deletion:</strong> Delete your profile, matches, and chat history permanently from the app settings.</li>
            <li><strong className="text-[#FFFFFF]">Incognito Mode:</strong> Pause discovery to hide your profile from new students without deleting existing matches.</li>
          </ul>
        </div>

        {/* 6. Data Security */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>6. Data Security</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We employ modern encryption protocols (TLS/HTTPS in transit and AES-256 at rest) to protect your student credentials, messages, and photos. While no digital system is 100% infallible, we regularly audit our infrastructure to safeguard your information.
          </p>
        </div>

        {/* 7. Children's Privacy */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>7. Children's Privacy (18+ Only)</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            Two Birds is strictly intended for individuals who are at least <strong className="text-[#FFFFFF]">18 years of age</strong> and enrolled in an accredited higher education institution. We do not knowingly collect personal information from individuals under 18. Any account found to belong to a minor will be terminated immediately.
          </p>
        </div>

        {/* 8. Changes to This Policy */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>8. Changes to This Policy</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect improvements or regulatory changes. We will notify you of any material changes via in-app banner or email notice prior to the changes taking effect.
          </p>
        </div>

        {/* 9. Contact Us */}
        <div className="bg-[#333333] border border-[#C9A84C]/40 rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <Mail className="w-4 h-4 text-[#C9A84C]" />
            <span>9. Contact Us</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            If you have questions, privacy inquiries, or wish to exercise your data rights, please contact our Campus Data Protection team at:
          </p>
          <div className="pt-1 text-xs">
            <a
              href="mailto:support@twobirds.app"
              className="font-bold text-[#C9A84C] hover:underline flex items-center gap-1.5"
            >
              <span>support@twobirds.app</span>
            </a>
            <p className="text-[11px] text-[#A0A0A0] mt-0.5">Two Birds Campus Network • Student Privacy Office</p>
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="pt-2 pb-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-full bg-[#333333] hover:bg-[#4A4A4A] border border-[#4A4A4A] text-xs font-bold text-[#FFFFFF] transition active:scale-95"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};
