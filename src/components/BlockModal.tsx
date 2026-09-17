import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { blockUser } from '../lib/databaseService';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  onBlockSuccess: () => void;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  onBlockSuccess,
}) => {
  const { currentUser, authUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBlock = async () => {
    const blockerId = authUser?.id || currentUser?.id;
    if (!blockerId) {
      setErrorMessage('You must be signed in to block a user.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await blockUser(blockerId, targetUserId);

    setIsSubmitting(false);
    if (result.success) {
      onBlockSuccess();
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to block user. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            className="bg-[#1A1A1A] border border-[#4A4A4A] rounded-3xl w-full max-w-sm overflow-hidden flex flex-col relative shadow-2xl p-6 space-y-5"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#242424] text-[#A0A0A0] hover:text-[#FFFFFF] border border-[#333333] transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Warning Icon */}
            <div className="flex flex-col items-center text-center pt-2 space-y-3">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <Ban className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Block {targetUserName}?</h3>
                <p className="text-xs text-[#A0A0A0] mt-2 leading-relaxed px-1">
                  They will not be able to see your profile or send you messages. Any existing match and chat history will be removed. They will not be notified that you blocked them.
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleBlock}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-950/40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Blocking...</span>
                  </>
                ) : (
                  <span>Block {targetUserName}</span>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-[#242424] hover:bg-[#2F2F2F] text-[#CCCCCC] text-xs font-medium border border-[#3A3A3A] transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BlockModal;
