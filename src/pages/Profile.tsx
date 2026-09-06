import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserProfile } from '../types';
import { MOCK_CURRENT_USER } from '../data/mockUsers';
import { ShieldCheck, GraduationCap, Edit3, Check, Camera, LogOut, Award } from 'lucide-react';
import { formatGradYear } from '../utils/formatters';

interface ProfileFormData {
  name: string;
  major: string;
  university: string;
  gradYear: number;
  bio: string;
  dormOrCampus: string;
}

const AVAILABLE_INTERESTS = [
  'CS & AI', 'Pre-Med', 'Boba', 'Bouldering', 'Thrifting',
  'Hackathons', 'Coffee Brewing', 'Indie Music', 'Vinyl Records',
  'Basketball', 'Yoga', 'Film Photography', 'Startups'
];

export const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_CURRENT_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { register, handleSubmit } = useForm<ProfileFormData>({
    defaultValues: {
      name: userProfile.name,
      major: userProfile.major,
      university: userProfile.university,
      gradYear: userProfile.gradYear,
      bio: userProfile.bio,
      dormOrCampus: userProfile.dormOrCampus || '',
    }
  });

  const onSubmit = (data: ProfileFormData) => {
    setUserProfile((prev) => ({
      ...prev,
      ...data,
      gradYear: Number(data.gradYear),
    }));
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUrl = reader.result as string;
        setUserProfile((prev) => ({
          ...prev,
          photos: [newUrl, ...prev.photos.slice(1)],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (interest: string) => {
    setUserProfile((prev) => {
      const exists = prev.interests.includes(interest);
      const updated = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: updated };
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-md mx-auto px-4 py-3 space-y-4 overflow-y-auto bg-[#F5F4F4] text-[#532E16]">
      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-[#F3B250]/20 border border-[#F3B250] text-[#532E16] text-xs font-bold text-center flex items-center justify-center gap-2">
          <Check className="w-4 h-4 text-[#F3B250]" /> Profile updated!
        </div>
      )}

      {/* Header Card */}
      <div className="bg-[#F5F4F4] border-2 border-[#C67D43]/30 p-5 rounded-3xl relative overflow-hidden text-center space-y-3 shadow-md">
        <div className="relative inline-block mx-auto">
          <img
            src={userProfile.photos[0]}
            alt={userProfile.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-[#F5F4F4] shadow-md"
          />
          <label className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#F3B250] hover:bg-[#F3B250]/90 text-[#532E16] shadow-md cursor-pointer transition">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-extrabold text-[#532E16]">{userProfile.name}, {userProfile.age}</h2>
            {userProfile.verifiedCampus && (
              <span className="p-1 rounded-full bg-[#F3B250]/20 text-[#532E16] border border-[#F3B250]" title="Verified Student">
                <ShieldCheck className="w-4 h-4 text-[#C67D43]" />
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-[#C67D43] font-bold mt-1">
            <GraduationCap className="w-4 h-4" />
            <span>{userProfile.major} • {formatGradYear(userProfile.gradYear)}</span>
          </div>

          <p className="text-[11px] text-[#532E16]/70 font-medium mt-0.5">{userProfile.university}</p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="w-full py-2.5 rounded-2xl bg-[#532E16]/5 hover:bg-[#532E16]/10 border border-[#C67D43]/30 text-[#532E16] text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <Edit3 className="w-4 h-4 text-[#C67D43]" />
          {isEditing ? 'Cancel Editing' : 'Edit Profile & Major'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-[#F5F4F4] border-2 border-[#C67D43]/30 p-5 rounded-3xl space-y-4 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#C67D43] border-b border-[#C67D43]/20 pb-2">
            Edit Profile
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#532E16] font-semibold mb-1">Full Name</label>
              <input
                {...register('name', { required: 'Name required' })}
                className="w-full bg-[#532E16]/5 border border-[#C67D43]/40 rounded-xl p-2.5 text-[#532E16] focus:outline-none focus:border-[#F3B250]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#532E16] font-semibold mb-1">Major</label>
                <input
                  {...register('major', { required: 'Major required' })}
                  className="w-full bg-[#532E16]/5 border border-[#C67D43]/40 rounded-xl p-2.5 text-[#532E16] focus:outline-none focus:border-[#F3B250]"
                />
              </div>

              <div>
                <label className="block text-[#532E16] font-semibold mb-1">Grad Year</label>
                <input
                  type="number"
                  {...register('gradYear', { valueAsNumber: true })}
                  className="w-full bg-[#532E16]/5 border border-[#C67D43]/40 rounded-xl p-2.5 text-[#532E16] focus:outline-none focus:border-[#F3B250]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#532E16] font-semibold mb-1">Dorm / Quad</label>
              <input
                {...register('dormOrCampus')}
                className="w-full bg-[#532E16]/5 border border-[#C67D43]/40 rounded-xl p-2.5 text-[#532E16] focus:outline-none focus:border-[#F3B250]"
              />
            </div>

            <div>
              <label className="block text-[#532E16] font-semibold mb-1">Bio</label>
              <textarea
                rows={3}
                {...register('bio')}
                className="w-full bg-[#532E16]/5 border border-[#C67D43]/40 rounded-xl p-2.5 text-[#532E16] focus:outline-none focus:border-[#F3B250]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[#F3B250] text-[#532E16] font-bold text-xs shadow-md flex items-center justify-center gap-2 hover:bg-[#F3B250]/90 transition"
          >
            <Check className="w-4 h-4" /> Save Profile Changes
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="bg-[#F5F4F4] border border-[#F3B250]/50 p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#F3B250]/20 text-[#532E16]">
                <Award className="w-5 h-5 text-[#C67D43]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#532E16]">Campus Verification Active</h4>
                <p className="text-[10px] text-[#C67D43] font-medium">{userProfile.email}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#F3B250]/20 text-[#532E16] border border-[#F3B250]/40">
              Verified
            </span>
          </div>

          <div className="bg-[#F5F4F4] border border-[#C67D43]/20 p-4 rounded-2xl space-y-1.5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C67D43]">Bio</h4>
            <p className="text-xs text-[#532E16] leading-relaxed font-medium">{userProfile.bio}</p>
          </div>

          <div className="bg-[#F5F4F4] border border-[#C67D43]/20 p-4 rounded-2xl space-y-2 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C67D43]">My Interests</h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = userProfile.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-[#F3B250] text-[#532E16] shadow-sm'
                        : 'bg-[#532E16]/5 text-[#C67D43] border border-[#C67D43]/20'
                    }`}
                  >
                    {interest} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => alert('Log out simulated.')}
            className="w-full py-3 rounded-2xl bg-[#C67D43]/15 border border-[#C67D43]/30 text-[#532E16] hover:bg-[#C67D43]/25 text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4 text-[#C67D43]" /> Log Out of Account
          </button>
        </div>
      )}
    </div>
  );
};
