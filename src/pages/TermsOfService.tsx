import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Scale, Mail } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
            <Scale className="w-3.5 h-3.5" />
            <span>Community Agreement</span>
          </div>
          <h1 className="text-2xl font-serif font-extrabold text-[#FFFFFF] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-[#A0A0A0] font-medium">
            Last updated: September 18, 2026
          </p>
        </div>

        {/* 1. Acceptance of Terms */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>1. Acceptance of Terms</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            By creating an account or accessing the Two Birds campus dating application ("the App"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to all terms, you must not use or access the App.
          </p>
        </div>

        {/* 2. Eligibility */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>2. Eligibility</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            To use Two Birds, you must be at least <strong className="text-[#FFFFFF]">18 years of age</strong> and hold a valid university email address ending in <strong className="text-[#C9A84C]">.edu or .edu.gh</strong>. Two Birds is exclusively for college students. Any account registered with non-university credentials or operated by non-students will be banned immediately.
          </p>
        </div>

        {/* 3. User Accounts */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>3. User Accounts</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            You are responsible for safeguarding your login credentials and for all interactions that take place under your account. You agree to provide accurate, honest profile information and to keep your university email address up to date. You may only create one account for your personal use.
          </p>
        </div>

        {/* 4. User Conduct */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2.5 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>4. User Conduct & Moderation</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed font-semibold">
            Two Birds maintains a safe, respectful campus dating culture. You agree NOT to:
          </p>
          <ul className="space-y-1 text-xs text-[#FFFFFF]/80 list-disc list-inside pl-1">
            <li>Harass, stalk, intimidate, bully, or discriminate against any student.</li>
            <li>Create fake profiles, impersonate classmates, or use misleading or stolen photos.</li>
            <li>Send unsolicited sexually explicit, defamatory, violent, or non-consensual content.</li>
            <li>Promote commercial solicitation, spam, scams, or external marketing links.</li>
            <li>Attempt to crawl, scrape, reverse-engineer, or compromise the platform.</li>
          </ul>
          <p className="text-xs text-[#FFFFFF]/80 leading-relaxed pt-1">
            Users can <strong className="text-[#C9A84C]">report</strong> or <strong className="text-[#C9A84C]">block</strong> any account at any time. Violations of conduct standards will result in immediate suspension.
          </p>
        </div>

        {/* 5. Content Ownership */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>5. Content Ownership</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            You retain ownership of all photos, bios, messages, and voice notes you upload. By submitting content to Two Birds, you grant us a worldwide, non-exclusive, royalty-free license to host, display, and transmit your content solely for the purpose of operating the matching and messaging service.
          </p>
        </div>

        {/* 6. Termination */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>6. Termination</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We reserve the right to suspend or terminate your account without prior notice for violations of these Terms or community guidelines. You may terminate your account at any time via the "Delete Account" button in your profile settings, which permanently wipes all your records.
          </p>
        </div>

        {/* 7. Disclaimers */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>7. Disclaimers</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            Two Birds is provided on an "AS IS" and "AS AVAILABLE" basis. While we require a university (.edu or .edu.gh) email address at registration, Two Birds does not conduct criminal background checks or screen user conduct outside the App. You are solely responsible for your interactions and should always practice campus safety precautions when meeting connections in person.
          </p>
        </div>

        {/* 8. Limitation of Liability */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>8. Limitation of Liability</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            To the maximum extent permitted by applicable law, Two Birds and its operators shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of or inability to use the service.
          </p>
        </div>

        {/* 9. Changes to Terms */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>9. Changes to Terms</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We reserve the right to modify these Terms at any time. Material modifications will be posted in the App or communicated via email. Continued use of the App following updates constitutes your acceptance of the revised Terms.
          </p>
        </div>

        {/* 10. Contact */}
        <div className="bg-[#333333] border border-[#C9A84C]/40 rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <Mail className="w-4 h-4 text-[#C9A84C]" />
            <span>10. Contact</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            If you have questions regarding these Terms of Service or wish to report a violation, please contact us at:
          </p>
          <div className="pt-1 text-xs">
            <a
              href="mailto:support@twobirds.app"
              className="font-bold text-[#C9A84C] hover:underline flex items-center gap-1.5"
            >
              <span>support@twobirds.app</span>
            </a>
            <p className="text-[11px] text-[#A0A0A0] mt-0.5">Two Birds Campus Relations & Safety Team</p>
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

export default TermsOfService;
