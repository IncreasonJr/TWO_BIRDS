import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { isValidEduEmail } from '../utils/validation';
import {
  School,
  Mail,
  Lock,
  User,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';
import { GHANAIAN_UNIVERSITIES } from '../data/universities';

interface SignupProps {
  defaultMode?: 'signup' | 'login';
}

export const Signup: React.FC<SignupProps> = ({ defaultMode = 'signup' }) => {
  const navigate = useNavigate();
  const { signup, login } = useUser();
  const [mode, setMode] = useState<'signup' | 'login'>(defaultMode);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState<string>('University of Ghana (UG)');
  const [customUniversity, setCustomUniversity] = useState<string>('');
  const [major, setMajor] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('');
  const [age, setAge] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'signup') {
      // Validate university email (.edu or .edu.gh)
      if (!isValidEduEmail(email)) {
        setErrorMessage('Please use a valid university email ending in .edu or .edu.gh');
        return;
      }

      if (!name.trim()) {
        setErrorMessage('Please enter your full name');
        return;
      }

      if (name.trim().length > 60) {
        setErrorMessage('Name cannot exceed 60 characters');
        return;
      }

      const finalUniversity = (university === 'Other' ? customUniversity : university).trim();
      if (!finalUniversity) {
        setErrorMessage(university === 'Other' ? 'Please specify your university' : 'Please select your university');
        return;
      }

      if (finalUniversity.length > 100) {
        setErrorMessage('University name cannot exceed 100 characters');
        return;
      }

      if (!major.trim()) {
        setErrorMessage('Please enter your field of study or major');
        return;
      }

      if (major.trim().length > 80) {
        setErrorMessage('Major cannot exceed 80 characters');
        return;
      }

      if (!gender) {
        setErrorMessage('Please select your gender');
        return;
      }

      if (!age.trim()) {
        setErrorMessage('Please enter your age');
        return;
      }

      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 18) {
        setErrorMessage('You must be 18 or older to use Two Birds');
        return;
      }

      if (parsedAge > 99) {
        setErrorMessage('Please enter a valid age under 100.');
        return;
      }

      if (!password || password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long');
        return;
      }

      if (password.length > 72) {
        setErrorMessage('Password cannot exceed 72 characters');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify your password.');
        return;
      }

      setSubmitting(true);
      const res = await signup(
        {
          name: name.trim(),
          email: email.trim(),
          university: finalUniversity,
          major: major.trim(),
          gender,
          age: parsedAge,
        },
        password
      );
      setSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Please use a valid university email ending in .edu or .edu.gh');
      } else {
        navigate('/add-photos');
      }
    } else {
      // Login mode
      if (!email.trim()) {
        setErrorMessage('Please enter your email address');
        return;
      }

      if (!password.trim()) {
        setErrorMessage('Please enter your password');
        return;
      }

      setSubmitting(true);
      const res = await login(email, password);
      setSubmitting(false);

      if (!res.success) {
        setErrorMessage(res.error || 'Unable to log in with this account');
      } else {
        navigate('/');
      }
    }
  };

  const handleDemoLogin = async () => {
    setSubmitting(true);
    await login('alex@university.edu');
    setSubmitting(false);
    navigate('/');
  };

  return (
    <div className="h-full flex flex-col bg-[#1A1A1A] text-[#FFFFFF] overflow-y-auto px-5 py-6">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#333333] border border-[#4A4A4A] shadow-glow-gold mb-1 overflow-hidden p-1.5">
          <img
            src="/logo192.png"
            alt="Two Birds Logo"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <h1 className="text-2xl font-bold font-serif text-[#FFFFFF] tracking-tight">
          Two Birds
        </h1>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-[#333333] border border-[#4A4A4A] rounded-2xl p-1 mb-5">
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            mode === 'signup'
              ? 'bg-[#C9A84C] text-[#1A1A1A] shadow-md'
              : 'text-[#A0A0A0] hover:text-[#FFFFFF]'
          }`}
        >
          Create Account
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMessage(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            mode === 'login'
              ? 'bg-[#C9A84C] text-[#1A1A1A] shadow-md'
              : 'text-[#A0A0A0] hover:text-[#FFFFFF]'
          }`}
        >
          Sign In
        </button>
      </div>

      {/* Friendly Student Notice */}
      {mode === 'signup' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3.5 bg-[#C9A84C]/10 border border-[#C9A84C]/40 rounded-2xl flex items-start gap-3"
        >
          <ShieldCheck className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
          <p className="text-xs text-[#FFFFFF] leading-relaxed font-medium">
            Two Birds is exclusively for university students. Please use your .edu or .edu.gh email to sign up.
          </p>
        </motion.div>
      )}

      {/* Error Message Box */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-3 bg-red-500/15 border border-red-500/40 rounded-2xl flex items-center gap-2.5 text-red-300 text-xs font-semibold"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 flex-1">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
            {mode === 'signup' ? 'University Email (.edu / .edu.gh) *' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder={mode === 'signup' ? 'yourname@stanford.edu or student@ug.edu.gh' : 'name@university.edu'}
              className="w-full pl-10 pr-3 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[#FFFFFF]">
              {mode === 'signup' ? 'Password (min 6 characters) *' : 'Password *'}
            </label>
            {mode === 'login' && (
              <Link
                to="/forgot-password"
                className="text-[11px] text-[#C9A84C] hover:underline font-semibold"
              >
                Forgot Password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="••••••••"
              minLength={6}
              className="w-full pl-10 pr-10 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition ${
                showPassword ? 'text-[#C9A84C]' : 'text-[#4A4A4A] hover:text-[#C9A84C]'
              }`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field (Signup only) */}
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••"
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition ${
                  showConfirmPassword ? 'text-[#C9A84C]' : 'text-[#4A4A4A] hover:text-[#C9A84C]'
                }`}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <>
            {/* University Dropdown Field */}
            <div>
              <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                University *
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={university}
                  onChange={(e) => {
                    setUniversity(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-9 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] focus:outline-none focus:border-[#C9A84C] font-medium appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-[#2A2A2A] text-[#888888]">
                    Select your university...
                  </option>
                  {GHANAIAN_UNIVERSITIES.map((uni) => (
                    <option key={uni} value={uni} className="bg-[#2A2A2A] text-[#FFFFFF]">
                      {uni}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888]">
                  <ChevronDown className="w-4 h-4 text-[#A0A0A0]" />
                </div>
              </div>

              {/* Custom University Text Input if 'Other' is selected */}
              {university === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <input
                    type="text"
                    value={customUniversity}
                    onChange={(e) => {
                      setCustomUniversity(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Type your university name..."
                    className="w-full px-3.5 py-2.5 bg-[#2A2A2A] border border-[#C9A84C]/50 rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
                    required
                  />
                </motion.div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
                  required
                />
              </div>
            </div>

            {/* Major and Age in 2 cols */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                  Major *
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Economics"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                  Age *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={age}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      setAge(val);
                      if (errorMessage) setErrorMessage(null);
                    }
                  }}
                  placeholder="e.g. 20"
                  maxLength={3}
                  className="w-full px-3 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium text-center"
                  required
                />
              </div>
            </div>

            {/* Gender Field: I am a... */}
            <div>
              <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                I am a... *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('Male')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    gender === 'Male'
                      ? 'bg-[#C9A84C] text-[#1A1A1A] border-[#C9A84C] shadow-glow-gold'
                      : 'bg-[#333333] text-[#A0A0A0] border-[#4A4A4A] hover:text-[#FFFFFF] hover:border-[#777777]'
                  }`}
                >
                  <span>Male</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Female')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    gender === 'Female'
                      ? 'bg-[#C9A84C] text-[#1A1A1A] border-[#C9A84C] shadow-glow-gold'
                      : 'bg-[#333333] text-[#A0A0A0] border-[#4A4A4A] hover:text-[#FFFFFF] hover:border-[#777777]'
                  }`}
                >
                  <span>Female</span>
                </button>
              </div>
              <p className="text-[11px] text-[#A0A0A0] mt-1 font-medium">
                Used for matching. Not shown publicly on your profile.
              </p>
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-4 py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold hover:bg-[#C9A84C]/90 transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
        >
          {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1A1A1A]" />}
          <span>
            {submitting
              ? mode === 'signup'
                ? 'Creating Account...'
                : 'Signing In...'
              : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'}
          </span>
          {!submitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      {/* Quick Demo Access */}
      <div className="pt-4 border-t border-[#4A4A4A] mt-4 text-center">
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={submitting}
          className="text-xs text-[#A0A0A0] hover:text-[#C9A84C] font-semibold transition disabled:opacity-50"
        >
          Quick Demo: Sign in as Alex Johnson
        </button>
      </div>
    </div>
  );
};

export default Signup;
