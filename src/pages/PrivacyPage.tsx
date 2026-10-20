import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HardDrive, Cookie } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="text-xs text-[#5E564A] font-medium flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#1F1B16] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#1F1B16] font-semibold">Privacy</span>
        </nav>
        <h1 className="text-h1 text-[#1F1B16]">Privacy Policy</h1>
        <p className="text-base text-[#5E564A]">
          How Etymon stores your gameplay progress and respects your privacy.
        </p>
      </div>

      <div className="bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-6 sm:p-10 flex flex-col gap-6 text-[#1F1B16]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[#2E6B3F]" />
            <h2 className="font-display text-lg font-bold">100% Client-Side Local Storage</h2>
          </div>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            Etymon does not collect personal information, email addresses, names, or device fingerprints. All application state—including your streak counter, completed Daily Mix results, unlocked lexicon entries, and sound preferences—is saved exclusively inside your browser's local storage under the versioned key <code className="font-mono text-xs bg-[#F4EEE1] px-1.5 py-0.5 rounded text-[#1F1B16]">etymon:v1</code>.
          </p>
        </div>

        <div className="pt-4 border-t border-[#E2D8C3] flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-[#6B5A12]" />
            <h2 className="font-display text-lg font-bold">No Third-Party Trackers or Cookies</h2>
          </div>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            We do not use tracking cookies, analytics pixels, or commercial tracking scripts. When you play a game or look up a word, no data is broadcast to external telemetry services.
          </p>
        </div>

        <div className="pt-4 border-t border-[#E2D8C3] flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1F1B16]" />
            <h2 className="font-display text-lg font-bold">Wiping Your Saved Data</h2>
          </div>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            You maintain full sovereignty over your data. You can wipe all game records at any time via the <strong>Settings</strong> panel or the <strong>Privacy choices</strong> link located in the footer.
          </p>
        </div>
      </div>
    </div>
  );
};
