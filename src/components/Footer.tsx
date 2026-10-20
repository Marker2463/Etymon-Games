import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PrivacyChoicesModal } from './PrivacyChoicesModal';
import { useGame } from '../context/GameContext';
import { COPY } from '../copy';
import { Info } from 'lucide-react';

export const Footer: React.FC = () => {
  const { wordBank } = useGame();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const launchTarget = 120;

  return (
    <>
      <footer className="w-full bg-[#FDF8EC] border-t border-[#E2D8C3] mt-auto select-none">
        <div className="max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main 4-column Grid */}
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-4 gap-8 pb-10">
            {/* Column 1: Brand & Tagline */}
            <div className="flex flex-col gap-3 min-[480px]:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold text-[#1F1B16]">{COPY.brand}</span>
                <span className="font-mono-respell text-[10px] font-medium uppercase tracking-wider text-[#6B5A12] bg-[#F4EEE1] border border-[#E2D8C3] px-1 py-0.5 rounded">
                  {COPY.brandTag}
                </span>
              </div>
              <p className="text-sm text-[#5E564A] leading-relaxed max-w-xs">
                {COPY.tagline}
              </p>
            </div>

            {/* Column 2: Play */}
            <div className="flex flex-col gap-3">
              <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
                Play
              </span>
              <ul className="flex flex-col gap-2 text-sm text-[#5E564A]">
                <li>
                  <Link to="/" className="hover:text-[#1F1B16] transition-colors">
                    Daily Mix
                  </Link>
                </li>
                <li>
                  <Link to="/sound-match" className="hover:text-[#1F1B16] transition-colors">
                    Sound Match
                  </Link>
                </li>
                <li>
                  <Link to="/true-vs-trap" className="hover:text-[#1F1B16] transition-colors">
                    True or Trap
                  </Link>
                </li>
                <li>
                  <Link to="/impostor-letter" className="hover:text-[#1F1B16] transition-colors">
                    Impostor Letter
                  </Link>
                </li>
                <li>
                  <Link to="/syllable-chopper" className="hover:text-[#1F1B16] transition-colors">
                    Syllable Chopper
                  </Link>
                </li>
                <li>
                  <Link to="/archive" className="hover:text-[#1F1B16] transition-colors">
                    Archive
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Learn */}
            <div className="flex flex-col gap-3">
              <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
                Learn
              </span>
              <ul className="flex flex-col gap-2 text-sm text-[#5E564A]">
                <li>
                  <Link to="/lexicon" className="hover:text-[#1F1B16] transition-colors">
                    Lexicon
                  </Link>
                </li>
                <li>
                  <Link to="/#wotd" className="hover:text-[#1F1B16] transition-colors">
                    Word of the Day
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-[#1F1B16] transition-colors">
                    How it works
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: About */}
            <div className="flex flex-col gap-3">
              <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
                About
              </span>
              <ul className="flex flex-col gap-2 text-sm text-[#5E564A]">
                <li>
                  <Link to="/editorial-standards" className="hover:text-[#1F1B16] transition-colors">
                    Editorial Standards
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#1F1B16] transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#1F1B16] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Dev Warning Banner */}
          {wordBank.length < launchTarget && (
            <div className="my-4 py-2 px-3 rounded-[8px] bg-[#F4EEE1] border border-[#E2D8C3] flex items-center justify-between text-xs text-[#6F6659]">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#6B5A12]" />
                <span>
                  Development notice: Active word bank currently contains {wordBank.length} entries (target: {launchTarget}).
                </span>
              </div>
              <Link to="/qa/audio" className="font-mono-respell text-[11px] underline text-[#1F1B16] hover:text-[#6B5A12]">
                Audio QA Testboard
              </Link>
            </div>
          )}

          {/* Bottom Row */}
          <div className="pt-6 border-t border-[#E2D8C3] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F6659]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <p>© {currentYear} Etymon. All rights reserved.</p>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span className="font-mono-respell text-[11px]">{COPY.attribution}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                className="underline hover:text-[#1F1B16] cursor-pointer"
              >
                Privacy choices
              </button>
            </div>
          </div>
        </div>
      </footer>

      <PrivacyChoicesModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </>
  );
};
