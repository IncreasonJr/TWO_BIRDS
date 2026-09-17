import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import {
  Camera,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  Image as ImageIcon
} from 'lucide-react';

export const AddPhotos: React.FC = () => {
  const {
    currentUser,
    uploadPhoto,
    deletePhoto,
    setPrimaryPhoto,
    isUploading,
    uploadProgress
  } = useUser();

  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);

  const photos = currentUser.photos || [];
  const hasPhotos = photos.length > 0;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      triggerToast('Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerToast('File size must be under 5MB.');
      return;
    }

    const result = await uploadPhoto(file);
    if (result.success) {
      triggerToast('Photo added to your profile!');
    } else {
      triggerToast(result.error || 'Failed to upload photo.');
    }
  };

  const handleSetPrimary = async (index: number) => {
    const res = await setPrimaryPhoto(index);
    if (res.success) {
      triggerToast('Cover photo updated');
    } else {
      triggerToast(res.error || 'Failed to update cover photo');
    }
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;
    const url = photoToDelete;
    setPhotoToDelete(null);
    const res = await deletePhoto(url);
    if (res.success) {
      triggerToast('Photo removed.');
    } else {
      triggerToast(res.error || 'Failed to remove photo.');
    }
  };

  const handleContinue = () => {
    if (!hasPhotos) {
      triggerToast('Please upload at least 1 photo to continue.');
      return;
    }
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full flex-1 max-w-md mx-auto px-4 py-5 overflow-y-auto bg-[#1A1A1A] text-[#FFFFFF] select-none justify-between space-y-4">
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

      <div className="space-y-4">
        {/* Header Hero */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#333333] border border-[#C9A84C]/40 text-[#C9A84C] shadow-glow-gold mb-1">
            <Camera className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#FFFFFF] tracking-tight font-serif">
            Add Your Photos
          </h1>
          <p className="text-xs text-[#A0A0A0] max-w-xs mx-auto leading-relaxed font-medium">
            Two Birds is an authentic student community. Add at least 1 clear photo of yourself to unlock discovery and match with peers.
          </p>
        </div>

        {/* Verification Note */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#333333] border border-[#4A4A4A] text-[11px] text-[#A0A0A0]">
          <ShieldCheck className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
          <span>Only verified university students can view your profile.</span>
        </div>

        {/* Photo Grid (Up to 6) */}
        <div className="bg-[#333333] border border-[#4A4A4A] rounded-3xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#C9A84C] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A84C]" />
              Photos ({photos.length}/6)
            </h2>
            <span className="text-[10px] text-[#A0A0A0] font-medium">
              {hasPhotos ? 'Slot 1 is your cover' : '1 photo required'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {Array.from({ length: 6 }).map((_, index) => {
              const photoUrl = photos[index];
              const isPrimary = index === 0;

              if (photoUrl) {
                return (
                  <div
                    key={index}
                    className="aspect-[3/4] rounded-2xl relative overflow-hidden border border-[#4A4A4A] group shadow-sm bg-[#1A1A1A]"
                  >
                    <img
                      src={photoUrl}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {isPrimary ? (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#C9A84C] text-[#1A1A1A] font-extrabold text-[9px] shadow-glow-gold flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current stroke-none" /> Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-[#1A1A1A]/85 hover:bg-[#C9A84C] text-[#FFFFFF] hover:text-[#1A1A1A] font-bold text-[9px] border border-[#FFFFFF]/20 transition shadow"
                      >
                        Set Cover
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setPhotoToDelete(photoUrl)}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-[#1A1A1A]/85 hover:bg-red-500 text-[#FFFFFF] transition shadow"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              }

              if (index === photos.length) {
                return (
                  <label
                    key={index}
                    className="aspect-[3/4] rounded-2xl border-2 border-dashed border-[#C9A84C]/70 hover:border-[#C9A84C] bg-[#1A1A1A]/50 hover:bg-[#C9A84C]/10 flex flex-col items-center justify-center cursor-pointer transition p-2 text-center group"
                  >
                    <div className="p-2.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] group-hover:scale-110 transition shadow-glow-gold">
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-extrabold text-[#C9A84C] mt-1.5">
                      {index === 0 ? 'Add Cover' : 'Add Photo'}
                    </span>
                    <span className="text-[8px] text-[#A0A0A0]">Max 5MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                );
              }

              return (
                <div
                  key={index}
                  className="aspect-[3/4] rounded-2xl border border-dashed border-[#4A4A4A]/50 bg-[#1A1A1A]/20 flex flex-col items-center justify-center opacity-40 text-center"
                >
                  <ImageIcon className="w-4 h-4 text-[#777777]" />
                  <span className="text-[9px] text-[#777777] font-semibold mt-1">Slot {index + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="space-y-2.5 pt-2 pb-1">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!hasPhotos || isUploading}
          className={`w-full py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition active:scale-95 shadow-lg ${
            hasPhotos && !isUploading
              ? 'bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#D4B55B] shadow-glow-gold cursor-pointer'
              : 'bg-[#333333] text-[#777777] border border-[#4A4A4A] cursor-not-allowed'
          }`}
        >
          <span>{hasPhotos ? 'Start Swiping' : 'Upload At Least 1 Photo'}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="w-full py-2.5 rounded-2xl bg-transparent hover:bg-[#333333]/40 text-[#A0A0A0] text-xs font-bold flex items-center justify-center gap-1.5 transition"
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Edit Profile Details</span>
        </button>
      </div>

      {/* Uploading Overlay */}
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
                <p className="text-xs text-[#A0A0A0] mt-1">Optimizing your picture for the campus feed</p>
              </div>

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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {photoToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-[#333333] border border-[#4A4A4A] rounded-3xl p-6 text-center space-y-4 shadow-2xl max-w-xs w-full text-[#FFFFFF]"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#FFFFFF] font-serif">Remove Photo?</h3>
                <p className="text-xs text-[#A0A0A0] mt-1.5 leading-relaxed font-medium">
                  Are you sure you want to remove this photo?
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={confirmDeletePhoto}
                  className="w-full py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-[#FFFFFF] font-extrabold text-xs shadow-md transition active:scale-95"
                >
                  Confirm Remove
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoToDelete(null)}
                  className="w-full py-2.5 rounded-2xl bg-[#1A1A1A] border border-[#4A4A4A] text-[#FFFFFF] font-bold text-xs transition hover:bg-[#1A1A1A]/80"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddPhotos;
