import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ShieldCheck, Trash2, X, Check } from 'lucide-react';

interface PrivacyChoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyChoicesModal: React.FC<PrivacyChoicesModalProps> = ({ isOpen, onClose }) => {
  const { resetAllData } = useGame();
  const [cleared, setCleared] = useState(false);

  if (!isOpen) return null;

  const handleClear = () => {
    resetAllData();
    setCleared(true);
    setTimeout(() => {
      setCleared(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-choices-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-lg p-6 flex flex-col gap-4 text-[#1F1B16]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E2D8C3]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2E6B3F]" />
            <h2 id="privacy-choices-title" className="font-display text-xl font-bold text-[#1F1B16]">
              Privacy Choices
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-[8px] text-[#5E564A] hover:bg-[#F4EEE1] hover:text-[#1F1B16] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm text-[#5E564A] leading-relaxed flex flex-col gap-2">
          <p>
            Etymon stores your gameplay history, current streaks, and unlocked dictionary entries
            solely on your device inside your browser's <code className="font-mono text-xs bg-[#F4EEE1] px-1.5 py-0.5 rounded text-[#1F1B16]">localStorage</code>.
          </p>
          <p>
            We do not track you across websites, use marketing analytics, or require any user account or personal login.
          </p>
        </div>

        <div className="pt-3 border-t border-[#E2D8C3] flex flex-col gap-2">
          {cleared ? (
            <div className="flex items-center justify-center gap-2 p-3 bg-[#DDF5E0] text-[#2E6B3F] font-semibold text-sm rounded-[12px]">
              <Check className="w-4 h-4" />
              <span>Your local storage has been wiped cleanly!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[12px] bg-[#A63A2B] hover:bg-[#A63A2B]/90 text-[#FFFFFF] font-semibold text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear my saved data</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-[12px] bg-[#F4EEE1] hover:bg-[#EBE3D2] text-[#1F1B16] font-medium text-sm transition-colors text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
