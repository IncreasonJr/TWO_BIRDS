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
} from 'lucide-react';

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
  const [university, setUniversity] = useState('Stanford University');
  const [major, setMajor] = useState('');
  const [age, setAge] = useState<number>(20);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

      if (!university.trim()) {
        setErrorMessage('Please enter your university name');
        return;
      }

      if (university.trim().length > 100) {
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

      if (!age || Number(age) < 18) {
        setErrorMessage('You must be at least 18 years of age to join Two Birds.');
        return;
      }

      if (Number(age) > 99) {
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
          name,
          email,
          university,
          major,
          age: Number(age) || 20,
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
            <Lock className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="••••••••"
              minLength={6}
              className="w-full pl-10 pr-3 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
              required
            />
          </div>
        </div>

        {/* Confirm Password Field (Signup only) */}
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••"
                minLength={6}
                className="w-full pl-10 pr-3 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
                required
              />
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <>
            {/* University Name Field */}
            <div>
              <label className="block text-xs font-bold text-[#FFFFFF] mb-1">
                University Name *
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#C9A84C] font-medium"
                  required
                />
              </div>
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
                  Age
                </label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-[#333333] border border-[#4A4A4A] rounded-xl text-xs text-[#FFFFFF] focus:outline-none focus:border-[#C9A84C] font-medium text-center"
                  required
                />
              </div>
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
