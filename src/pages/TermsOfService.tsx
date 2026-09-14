import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Scale, Mail } from 'lucide-react';

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
            Last updated: September 14, 2026
          </p>
        </div>

        {/* 1. Acceptance of Terms */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>1. Acceptance of Terms</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            By creating an account, downloading, or using Two Birds ("the App"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree with any part of these Terms, you must not access or use the App.
          </p>
        </div>

        {/* 2. Eligibility */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>2. Eligibility (18+ Only)</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            You must be at least <strong className="text-[#FFFFFF]">18 years old</strong> and an active student or affiliate of an accredited college or university to register. By registering, you warrant that you meet these criteria and possess the legal capacity to enter into this agreement.
          </p>
        </div>

        {/* 3. User Accounts */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>3. User Accounts & Verification</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information, including a valid university email address (.edu) for campus verification.
          </p>
        </div>

        {/* 4. User Conduct */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2.5 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>4. User Conduct & Campus Safety</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed font-semibold">
            Two Birds enforces a strict zero-tolerance policy against misconduct. You agree NOT to:
          </p>
          <ul className="space-y-1 text-xs text-[#FFFFFF]/80 list-disc list-inside pl-1">
            <li>Harass, bully, stalk, intimidate, or discriminate against any student.</li>
            <li>Create fake profiles, impersonate another individual, or submit fraudulent photos.</li>
            <li>Send unsolicited promotional content, commercial advertisements, or spam.</li>
            <li>Upload sexually explicit, defamatory, violent, or non-consensual media.</li>
            <li>Attempt to reverse-engineer, crawl, or scrape the application or other users' profiles.</li>
          </ul>
        </div>

        {/* 5. Content Ownership */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>5. Content Ownership & License</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            You retain all ownership rights to the photos, bios, and messages you submit. However, by uploading content, you grant Two Birds a limited, non-exclusive, royalty-free license to store, host, display, and transmit your content solely for the purpose of operating and improving the service.
          </p>
        </div>

        {/* 6. Termination */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>6. Termination</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We reserve the right to suspend or permanently ban your account at our sole discretion, without notice, if you violate these Terms or community guidelines. You may also terminate your account at any time via the Profile settings.
          </p>
        </div>

        {/* 7. Disclaimers */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>7. Disclaimers</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            The App is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Two Birds does not conduct criminal background checks or verify the offline actions of users. Always exercise caution and common sense when meeting someone in person.
          </p>
        </div>

        {/* 8. Limitation of Liability */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>8. Limitation of Liability</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            To the maximum extent permitted by applicable law, Two Birds and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access to or use of the application.
          </p>
        </div>

        {/* 9. Changes to Terms */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <span>9. Changes to Terms</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            We may revise these Terms from time to time. The most current version will always be posted within the App. Your continued use of the App following any changes constitutes your acceptance of the updated Terms.
          </p>
        </div>

        {/* 10. Contact Us */}
        <div className="bg-[#333333] border border-[#C9A84C]/40 rounded-2xl p-4 space-y-2 shadow-sm">
          <h2 className="text-sm font-bold text-[#C9A84C] flex items-center gap-2 font-serif">
            <Mail className="w-4 h-4 text-[#C9A84C]" />
            <span>10. Contact Us</span>
          </h2>
          <p className="text-xs text-[#FFFFFF]/90 leading-relaxed">
            If you have questions regarding these Terms of Service or community violations, please contact:
          </p>
          <div className="pt-1 text-xs">
            <a
              href="mailto:legal@twobirds.app"
              className="font-bold text-[#C9A84C] hover:underline flex items-center gap-1.5"
            >
              <span>legal@twobirds.app</span>
            </a>
            <p className="text-[11px] text-[#A0A0A0] mt-0.5">Two Birds Legal & Campus Relations</p>
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
