import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, Mail } from 'lucide-react';

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
            Last updated: September 18, 2026
          </p>
        </div>

        {/* 1. Introduction */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>1. Introduction</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed font-normal">
            Welcome to Two Birds ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our campus dating and connections application.
          </p>
        </div>

        {/* 2. Information We Collect */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2.5 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>2. Information We Collect</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            To provide genuine, verified college dating connections, we collect the following categories of information:
          </p>
          <ul className="space-y-1.5 text-xs text-[#FFFFFF]/80 list-disc list-inside pl-1 font-normal">
            <li><strong className="text-[#FFFFFF]">University (.edu) Email & Verification:</strong> Your official university email address ending in .edu, collected strictly to verify active university enrollment and campus safety. Your .edu email address is never shared with or displayed to other students and is never sold.</li>
            <li><strong className="text-[#FFFFFF]">Profile Information:</strong> Your name, age (18+), university name, academic major, graduation year, bio, and personal interests.</li>
            <li><strong className="text-[#FFFFFF]">Photos & Media:</strong> Images you choose to upload to your profile or audio voice notes you share in direct match chats.</li>
            <li><strong className="text-[#FFFFFF]">App Activity & Swipes:</strong> Swipe decisions (likes, passes), mutual matches, conversation messages, timestamps, and interaction history.</li>
          </ul>
        </div>

        {/* 3. How We Use Your Information */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>3. How We Use Your Information</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We use your collected information strictly for:
          </p>
          <ul className="space-y-1 text-xs text-[#FFFFFF]/80 list-disc list-inside pl-1">
            <li><strong className="text-[#FFFFFF]">Matching:</strong> Calculating compatibility and presenting student profile cards on the campus discovery feed.</li>
            <li><strong className="text-[#FFFFFF]">Messaging:</strong> Facilitating private real-time text and voice chat between mutual matches.</li>
            <li><strong className="text-[#FFFFFF]">Push Notifications:</strong> Delivering notifications (via OneSignal) for new matches, incoming messages, and account updates.</li>
            <li><strong className="text-[#FFFFFF]">Authentication & Security:</strong> Managing secure authentication and database persistence via Supabase, and enforcing campus safety policies.</li>
          </ul>
        </div>

        {/* 4. Data Sharing */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>4. Data Sharing</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed font-semibold text-[#C9A84C]">
            We NEVER sell, rent, trade, or monetize your personal data, photos, or emails to third parties or advertisers.
          </p>
          <p className="text-xs text-[#FFFFFF]/80 leading-relaxed">
            Your data is only shared in these limited situations:
          </p>
          <ul className="space-y-1 text-xs text-[#FFFFFF]/80 list-disc list-inside pl-1">
            <li><strong className="text-[#FFFFFF]">Other Students:</strong> Profile details (photos, name, age, major, bio, interests) are shown to other verified students as required for dating and matching.</li>
            <li><strong className="text-[#FFFFFF]">Infrastructure Providers:</strong> Secure hosting, database, and push notification services (Supabase, OneSignal, Vercel) operating under strict data processing standards.</li>
            <li><strong className="text-[#FFFFFF]">Legal Compliance:</strong> When required by lawful court order or to protect user safety and campus security.</li>
          </ul>
        </div>

        {/* 5. Data Retention */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>5. Data Retention</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We retain your information only as long as your account remains active. You can permanently delete your account at any time via the Profile settings ("Delete Account"). When you delete your account, your profile, photos, matches, and chat history are permanently erased from our databases and storage.
          </p>
        </div>

        {/* 6. Your Rights */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>6. Your Rights</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            You maintain full ownership and control over your personal data:
          </p>
          <ul className="space-y-1 text-xs text-[#FFFFFF]/80 list-disc list-inside pl-1">
            <li><strong className="text-[#FFFFFF]">Access:</strong> View and export your personal information directly within the app.</li>
            <li><strong className="text-[#FFFFFF]">Correction:</strong> Update your profile photos, bio, interests, and details at any time.</li>
            <li><strong className="text-[#FFFFFF]">Deletion:</strong> Completely and irreversibly delete your account and all associated records.</li>
            <li><strong className="text-[#FFFFFF]">Blocking & Moderation:</strong> Block or report any user to prevent interaction and remove all mutual communication history.</li>
          </ul>
        </div>

        {/* 7. Security */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>7. Security</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We employ modern encryption protocols (TLS/HTTPS in transit and AES-256 at rest) to protect your student credentials, messages, and photos. We enforce Row-Level Security (RLS) on our databases to guarantee that only authorized users can access their data.
          </p>
        </div>

        {/* 8. Children (18+ Only) */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>8. Children (18+ Only)</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            Two Birds is strictly intended for individuals who are at least <strong className="text-[#FFFFFF]">18 years of age</strong> and enrolled in an accredited college or university. We do not knowingly collect personal data from minors. Any account found to belong to an individual under 18 will be terminated immediately.
          </p>
        </div>

        {/* 9. Changes to This Policy */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>9. Changes to This Policy</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We may update this Privacy Policy from time to time. Any material changes will be announced within the app or via email notification prior to taking effect.
          </p>
        </div>

        {/* 10. Contact Us */}
        <div className="bg-[#333333] border border-[#C9A84C]/40 rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <Mail className="w-4 h-4 text-[#C9A84C]" />
            <span>10. Contact Us</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            If you have questions, privacy inquiries, or wish to exercise your data rights, please contact our team at:
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
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
