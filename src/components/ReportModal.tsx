import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { reportUser } from '../lib/databaseService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  onReportSuccess?: () => void;
}

const REPORT_REASONS = [
  'Inappropriate messages or behavior',
  'Fake profile or impersonation',
  'Underage (under 18)',
  'Harassment or bullying',
  'Spam or commercial activity',
  'Other',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  onReportSuccess,
}) => {
  const { currentUser, authUser } = useUser();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetState = () => {
    setSelectedReason('');
    setDetails('');
    setIsSubmitting(false);
    setIsSuccess(false);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setErrorMessage('Please select a reason for reporting.');
      return;
    }

    const reporterId = authUser?.id || currentUser?.id;
    if (!reporterId) {
      setErrorMessage('You must be signed in to submit a report.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await reportUser(reporterId, targetUserId, selectedReason, details);

    setIsSubmitting(false);
    if (result.success) {
      setIsSuccess(true);
      if (onReportSuccess) {
        onReportSuccess();
      }
    } else {
      setErrorMessage(result.error || 'Failed to submit report. Please try again.');
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
            className="bg-[#1A1A1A] border border-[#4A4A4A] rounded-3xl w-full max-w-md overflow-hidden flex flex-col relative shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#242424] text-[#A0A0A0] hover:text-[#FFFFFF] border border-[#333333] transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {isSuccess ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mx-auto text-[#C9A84C] mt-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Report Submitted</h3>
                <p className="text-sm text-[#A0A0A0] max-w-xs mx-auto leading-relaxed">
                  Thank you for keeping our campus community safe. Our moderation team will review your report promptly.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleClose}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#DFBA5E] text-[#1A1A1A] font-semibold hover:brightness-105 transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start gap-3 pr-8">
                  <div className="p-2.5 rounded-xl bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20 flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Report {targetUserName}</h3>
                    <p className="text-xs text-[#A0A0A0] mt-0.5">
                      Select a reason why you are reporting this user.
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

                {/* Reasons List */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#C9A84C] uppercase tracking-wider">
                    Reason
                  </label>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {REPORT_REASONS.map((reason) => {
                      const isSelected = selectedReason === reason;
                      return (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => setSelectedReason(reason)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition border flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#C9A84C]/15 border-[#C9A84C] text-[#FFFFFF]'
                              : 'bg-[#242424] border-[#333333] text-[#CCCCCC] hover:border-[#4A4A4A]'
                          }`}
                        >
                          <span>{reason}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-[#C9A84C] bg-[#C9A84C]'
                                : 'border-[#4A4A4A]'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Details Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#A0A0A0]">
                    Additional details (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide any additional context for our team..."
                    className="w-full bg-[#242424] border border-[#333333] focus:border-[#C9A84C] text-xs text-white rounded-xl p-3 placeholder-[#666666] outline-none transition resize-none"
                    maxLength={500}
                  />
                </div>

                {/* Confidentiality Notice */}
                <div className="p-3 rounded-xl bg-[#242424]/80 border border-[#333333] flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                  <p className="text-[11px] text-[#A0A0A0] leading-snug">
                    Reports are confidential. {targetUserName} will not know you reported them.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#2A2A2A] hover:bg-[#333333] text-[#CCCCCC] text-xs font-medium border border-[#444444] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedReason}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#DFBA5E] text-[#1A1A1A] text-xs font-semibold hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Report</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
