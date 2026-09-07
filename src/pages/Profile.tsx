import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useMatches } from '../hooks/useMatches';
import {
  Camera,
  Edit3,
  Check,
  X,
  Heart,
  Flame,
  CheckCircle2,
  Shield,
  Bell,
  LogOut,
  Sparkles,
  ChevronRight,
  User as UserIcon,
  AlertCircle,
  Download
} from 'lucide-react';
import { InstallPWA } from '../components/InstallPWA';

const AVAILABLE_INTERESTS = [
  "CS & AI",
  "Pre-Med",
  "Boba",
  "Bouldering",
  "Thrifting",
  "Hackathons",
  "Startups",
  "Dogs",
  "Hiking",
  "Photography",
  "Music",
  "Gym",
  "Reading",
  "Coffee",
  "Art",
  "Cooking",
  "Travel",
  "Gaming"
];

const YEAR_OPTIONS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad Student"] as const;

export const Profile: React.FC = () => {
  const {
    currentUser,
    isUploading,
    uploadProgress,
    totalSwipes,
    completionPercentage,
    updateProfile,
    uploadPhoto
  } = useUser();

  const { matches } = useMatches();

  // Modal & Toast States
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [activePlaceholderModal, setActivePlaceholderModal] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>(currentUser.name);
  const [formMajor, setFormMajor] = useState<string>(currentUser.major);
  const [formYear, setFormYear] = useState<string>(currentUser.year || 'Junior');
  const [formBio, setFormBio] = useState<string>(currentUser.bio);
  const [formInterests, setFormInterests] = useState<string[]>(currentUser.interests || []);

  // Validation Errors
  const [errors, setErrors] = useState<{ name?: string; bio?: string; interests?: string }>({});

  const handleOpenEditor = () => {
    setFormName(currentUser.name);
    setFormMajor(currentUser.major);
    setFormYear(currentUser.year || 'Junior');
    setFormBio(currentUser.bio);
    setFormInterests([...(currentUser.interests || [])]);
    setErrors({});
    setIsEditorOpen(true);
  };

  const handleToggleInterest = (interest: string) => {
    setFormInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
    if (errors.interests) {
      setErrors((prev) => ({ ...prev, interests: undefined }));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; bio?: string; interests?: string } = {};

    if (!formName || formName.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formBio && formBio.length > 150) {
      newErrors.bio = 'Bio cannot exceed 150 characters';
    }

    if (!formInterests || formInterests.length === 0) {
      newErrors.interests = 'Select at least 1 interest tag';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateProfile({
      name: formName.trim(),
      major: formMajor.trim(),
      year: formYear as any,
      bio: formBio.trim(),
      interests: formInterests,
    });

    setIsEditorOpen(false);
    triggerToast('Profile updated successfully!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPhoto(file);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  // Helper for Initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const mainPhoto = currentUser.photos && currentUser.photos.length > 0 ? currentUser.photos[0] : null;

  return (
    <div className="flex flex-col h-full flex-1 pb-10 max-w-md mx-auto px-4 py-3 space-y-3.5 overflow-y-auto bg-[#1A1A1A] text-[#FFFFFF] select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#C9A84C] text-[#1A1A1A] text-xs font-extrabold shadow-glow-gold flex items-center gap-2 border border-[#FFFFFF]/20"
          >
            <CheckCircle2 className="w-4 h-4 text-[#1A1A1A]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP PROFILE CARD */}
      <div className="bg-[#333333] border border-[#4A4A4A] rounded-3xl p-4 sm:p-5 text-center shadow-xl relative overflow-hidden flex flex-col items-center space-y-2.5 shrink-0">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-[#C9A84C]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Responsive Circular Photo with Gold Border Ring */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#C9A84C] p-1 shadow-glow-gold relative overflow-hidden bg-[#1A1A1A] shrink-0">
            {mainPhoto ? (
              <img
                src={mainPhoto}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-2xl flex items-center justify-center">
                {getInitials(currentUser.name)}
              </div>
            )}
          </div>

          {/* Camera Upload Badge */}
          <label className="absolute bottom-0 right-0 p-2 rounded-full bg-[#C9A84C] text-[#1A1A1A] hover:scale-110 active:scale-95 shadow-md cursor-pointer transition border-2 border-[#1A1A1A]">
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* User Info */}
        <div className="space-y-0.5 z-10">
          <h1 className="text-xl font-extrabold text-[#FFFFFF] tracking-tight">
            {currentUser.name}, <span className="font-bold text-[#C9A84C]">{currentUser.age}</span>
          </h1>
          <p className="text-xs font-semibold text-[#A0A0A0]">
            {currentUser.major} • <span className="text-[#FFFFFF]">{currentUser.year}</span>
          </p>
          <p className="text-[11px] text-[#A0A0A0] font-medium pt-0.5">
            {currentUser.email}
          </p>
        </div>

        {/* Edit Button */}
        <button
          onClick={handleOpenEditor}
          className="w-full mt-1 py-2 rounded-2xl bg-[#1A1A1A] hover:bg-[#4A4A4A]/40 border border-[#C9A84C]/50 text-[#C9A84C] text-xs font-extrabold flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#C9A84C]" />
          Edit Profile
        </button>
      </div>

      {/* 2. PROFILE STATS GRID */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-2.5 text-center space-y-0.5 shadow-md">
          <div className="inline-flex p-1.5 rounded-xl bg-[#C9A84C]/15 text-[#C9A84C]">
            <Heart className="w-3.5 h-3.5 fill-[#C9A84C]" />
          </div>
          <p className="text-lg font-extrabold text-[#FFFFFF]">{matches.length}</p>
          <p className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider">Matches</p>
        </div>

        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-2.5 text-center space-y-0.5 shadow-md">
          <div className="inline-flex p-1.5 rounded-xl bg-[#C9A84C]/15 text-[#C9A84C]">
            <Flame className="w-3.5 h-3.5 fill-[#C9A84C]" />
          </div>
          <p className="text-lg font-extrabold text-[#FFFFFF]">{totalSwipes}</p>
          <p className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider">Swipes</p>
        </div>

        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-2.5 text-center space-y-0.5 shadow-md">
          <div className="inline-flex p-1.5 rounded-xl bg-[#C9A84C]/15 text-[#C9A84C]">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
          </div>
          <p className="text-lg font-extrabold text-[#C9A84C]">{completionPercentage}%</p>
          <p className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-wider">Complete</p>
        </div>
      </div>

      {/* BIO CARD */}
      <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-3.5 space-y-1 shadow-md shrink-0">
        <h3 className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-wider">About Me</h3>
        <p className="text-xs text-[#FFFFFF] font-medium leading-relaxed">
          {currentUser.bio || <span className="italic text-[#A0A0A0]">Tell us about yourself!</span>}
        </p>
      </div>

      {/* MY INTERESTS CHIPS DISPLAY */}
      <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl p-3.5 space-y-2 shadow-md shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-wider">My Interests</h3>
          <span className="text-[10px] text-[#A0A0A0] font-semibold">{currentUser.interests.length} Selected</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {currentUser.interests.map((interest) => (
            <span
              key={interest}
              className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#C9A84C] text-[#1A1A1A] shadow-sm flex items-center gap-1"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* 4. SETTINGS SECTION */}
      <div className="space-y-2 shrink-0">
        <h3 className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider px-1">Settings & Preferences</h3>

        <div className="bg-[#333333] border border-[#4A4A4A] rounded-2xl overflow-hidden divide-y divide-[#4A4A4A] shadow-md">
          {/* Edit Profile */}
          <button
            onClick={handleOpenEditor}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#4A4A4A]/30 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#1A1A1A] text-[#C9A84C]">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#FFFFFF]">Edit Profile</p>
                <p className="text-[10px] text-[#A0A0A0] font-medium">Update name, bio, major & interests</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
          </button>

          {/* Install App */}
          <div className="px-4 py-3.5 flex items-center justify-between hover:bg-[#4A4A4A]/30 transition text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#1A1A1A] text-[#C9A84C]">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#FFFFFF]">Install PWA App</p>
                <p className="text-[10px] text-[#A0A0A0] font-medium">Fast home screen access & offline mode</p>
              </div>
            </div>
            <InstallPWA variant="compact" />
          </div>

          {/* Privacy Settings */}
          <button
            onClick={() => setActivePlaceholderModal('Privacy Settings')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#4A4A4A]/30 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#1A1A1A] text-[#C9A84C]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#FFFFFF]">Privacy Settings</p>
                <p className="text-[10px] text-[#A0A0A0] font-medium">Campus visibility & incognito mode</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActivePlaceholderModal('Notifications')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#4A4A4A]/30 transition text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#1A1A1A] text-[#C9A84C]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#FFFFFF]">Notifications</p>
                <p className="text-[10px] text-[#A0A0A0] font-medium">Push alerts for new matches & chats</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
          </button>

          {/* Logout */}
          <button
            onClick={() => setActivePlaceholderModal('Logout')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#4A4A4A]/30 transition text-left text-red-400"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#1A1A1A] text-red-400">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#FFFFFF]">Logout</p>
                <p className="text-[10px] text-[#A0A0A0] font-medium">Sign out of your campus profile</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A0A0A0]" />
          </button>
        </div>
      </div>

      {/* 3. PHOTO UPLOADING SIMULATION OVERLAY */}
      <AnimatePresence>
        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#333333] border border-[#C9A84C]/50 rounded-3xl p-6 text-center space-y-4 shadow-2xl max-w-xs w-full text-[#FFFFFF]"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center border border-[#C9A84C]">
                <Camera className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#FFFFFF]">Uploading Photo...</h3>
                <p className="text-xs text-[#A0A0A0] mt-1">Optimizing profile picture for campus feed</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#1A1A1A] h-3 rounded-full overflow-hidden border border-[#4A4A4A]">
                <motion.div
                  className="bg-[#C9A84C] h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              <p className="text-xs font-bold text-[#C9A84C]">{uploadProgress}%</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. PROFILE EDITOR MODAL / DRAWER */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#1A1A1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md bg-[#333333] border-t sm:border border-[#4A4A4A] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#FFFFFF]"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#4A4A4A] flex items-center justify-between bg-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#C9A84C]" />
                  <h2 className="text-base font-extrabold text-[#FFFFFF]">Edit Profile</h2>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-full bg-[#333333] hover:bg-[#4A4A4A] text-[#A0A0A0] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveProfile} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                {/* Full Name */}
                <div>
                  <label className="block font-bold text-[#FFFFFF] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full bg-[#1A1A1A] border rounded-xl p-3 text-[#FFFFFF] focus:outline-none focus:border-[#C9A84C] font-semibold ${
                      errors.name ? 'border-red-500' : 'border-[#4A4A4A]'
                    }`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-400 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Major & Year Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#FFFFFF] mb-1">Major</label>
                    <input
                      type="text"
                      value={formMajor}
                      onChange={(e) => setFormMajor(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#4A4A4A] rounded-xl p-3 text-[#FFFFFF] focus:outline-none focus:border-[#C9A84C] font-semibold"
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#FFFFFF] mb-1">Year</label>
                    <select
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#4A4A4A] rounded-xl p-3 text-[#FFFFFF] focus:outline-none focus:border-[#C9A84C] font-semibold"
                    >
                      {YEAR_OPTIONS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#FFFFFF]">Bio</label>
                    <span className={`text-[10px] font-bold ${formBio.length > 150 ? 'text-red-400' : 'text-[#A0A0A0]'}`}>
                      {formBio.length}/150
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formBio}
                    onChange={(e) => {
                      setFormBio(e.target.value);
                      if (errors.bio) setErrors((prev) => ({ ...prev, bio: undefined }));
                    }}
                    className={`w-full bg-[#1A1A1A] border rounded-xl p-3 text-[#FFFFFF] focus:outline-none focus:border-[#C9A84C] font-medium leading-relaxed ${
                      errors.bio ? 'border-red-500' : 'border-[#4A4A4A]'
                    }`}
                    placeholder="Tell us about yourself..."
                  />
                  {errors.bio && (
                    <p className="text-[11px] text-red-400 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.bio}
                    </p>
                  )}
                </div>

                {/* Interest Tag Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-[#FFFFFF]">Interests (Select at least 1) *</label>
                    <span className="text-[10px] text-[#C9A84C] font-bold">{formInterests.length} selected</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {AVAILABLE_INTERESTS.map((interest) => {
                      const isSelected = formInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleToggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#C9A84C] text-[#1A1A1A] shadow-glow-gold'
                              : 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#4A4A4A] hover:border-[#C9A84C]/40'
                          }`}
                        >
                          {interest}
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>

                  {errors.interests && (
                    <p className="text-[11px] text-red-400 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.interests}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold flex items-center justify-center gap-2 hover:bg-[#C9A84C]/90 transition"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="w-full py-3 rounded-2xl bg-[#1A1A1A] border border-[#4A4A4A] text-[#FFFFFF] font-bold text-xs hover:bg-[#1A1A1A]/80 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PLACEHOLDER MODAL FOR SETTINGS */}
      <AnimatePresence>
        {activePlaceholderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-[#333333] border border-[#4A4A4A] rounded-3xl p-6 text-center space-y-4 shadow-2xl max-w-xs w-full text-[#FFFFFF]"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center border border-[#C9A84C]">
                <Shield className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#FFFFFF]">{activePlaceholderModal}</h3>
                <p className="text-xs text-[#A0A0A0] mt-1.5 leading-relaxed font-medium">
                  {activePlaceholderModal === 'Logout'
                    ? 'Are you sure you want to sign out of your account on Two Birds?'
                    : `${activePlaceholderModal} features are pre-configured for campus students.`}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {activePlaceholderModal === 'Logout' ? (
                  <button
                    onClick={() => {
                      setActivePlaceholderModal(null);
                      triggerToast('Signed out successfully (Simulated)');
                    }}
                    className="w-full py-2.5 rounded-2xl bg-red-500 text-[#FFFFFF] font-extrabold text-xs shadow-md"
                  >
                    Confirm Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActivePlaceholderModal(null);
                      triggerToast(`${activePlaceholderModal} saved!`);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-xs shadow-glow-gold"
                  >
                    Save Preference
                  </button>
                )}

                <button
                  onClick={() => setActivePlaceholderModal(null)}
                  className="w-full py-2.5 rounded-2xl bg-[#1A1A1A] border border-[#4A4A4A] text-[#FFFFFF] font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
