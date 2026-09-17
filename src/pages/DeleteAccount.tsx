import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { deleteAccount } from '../lib/databaseService';

export const DeleteAccount: React.FC = () => {
  const navigate = useNavigate();
  const { authUser, currentUser, logout } = useUser();
  const currentUserId = authUser?.id || currentUser?.id;

  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed || !currentUserId) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const result = await deleteAccount(currentUserId);
      if (result.success) {
        await logout();
        navigate('/signup');
      } else {
        setErrorMessage(result.error || 'Failed to delete account. Please try again.');
        setIsDeleting(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#FFFFFF] flex flex-col max-w-md mx-auto relative pb-12">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#1A1A1A]/90 backdrop-blur-md border-b border-[#333333] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-full hover:bg-[#2A2A2A] text-[#CCCCCC] hover:text-[#FFFFFF] transition"
          aria-label="Back to Profile"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-white font-serif">Delete Account</h1>
        <div className="w-9" />
      </div>

      <div className="p-5 space-y-6 flex-1 flex flex-col">
        {/* Warning Badge */}
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto mt-2">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-extrabold text-white font-serif">Are you sure?</h2>
          <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-sm mx-auto">
            This action is permanent and cannot be reversed. Once your account is deleted, all your data will be permanently wiped.
          </p>
        </div>

        {/* Warning List */}
        <div className="p-4 rounded-2xl bg-[#242424] border border-red-500/30 space-y-3">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>What will be deleted</span>
          </h3>
          <ul className="text-xs text-[#CCCCCC] space-y-2 list-disc list-inside leading-relaxed">
            <li>Your profile details and verified campus status</li>
            <li>All uploaded profile photos from storage</li>
            <li>All matches and mutual connections</li>
            <li>All conversation messages and voice notes</li>
            <li>Your swipe history and interactions</li>
          </ul>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Confirmation Input */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-medium text-[#CCCCCC] block">
            To confirm deletion, please type <span className="font-bold text-red-400">DELETE</span> below:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            disabled={isDeleting}
            className="w-full bg-[#242424] border border-[#3A3A3A] focus:border-red-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition placeholder-[#666666]"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3 mt-auto">
          <button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-950/40"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting Account...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete My Account</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/profile')}
            disabled={isDeleting}
            className="w-full py-3 px-4 rounded-xl bg-[#242424] hover:bg-[#2F2F2F] text-[#CCCCCC] text-xs font-medium border border-[#3A3A3A] transition"
          >
            Keep My Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
