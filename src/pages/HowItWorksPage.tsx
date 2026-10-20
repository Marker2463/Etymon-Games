import React from 'react';
import { Link } from 'react-router-dom';
import { Ear, HelpCircle, Search, Scissors, Keyboard, Volume2 } from 'lucide-react';
import { COPY } from '../copy';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="text-xs text-[#5E564A] font-medium flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#1F1B16] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#1F1B16] font-semibold">{COPY.nav.howItWorks}</span>
        </nav>
        <h1 className="text-h1 text-[#1F1B16]">How It Works</h1>
        <p className="text-base text-[#5E564A]">
          Rules, scoring mechanics, and controls for each game mode.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mode 1: Sound Match */}
        <div className="p-6 rounded-[16px] bg-[#FFFFFF] border border-[#E2D8C3] shadow-etymon flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-[8px] bg-[#F2D46B] text-[#1F1B16] flex items-center justify-center">
              <Ear className="w-4 h-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-[#1F1B16]">1. Sound Match</h2>
          </div>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            Read the target word. From four respelling options (A–D), select how it is really said. You have <strong>1 try</strong>. Use the speaker button on any option card to hear how it sounds before deciding.
          </p>
        </div>

        {/* Mode 2: True or Trap */}
        <div className="p-6 rounded-[16px] bg-[#FFFFFF] border border-[#E2D8C3] shadow-etymon flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-[8px] bg-[#A9DDB0] text-[#1F1B16] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-[#1F1B16]">2. True or Trap</h2>
          </div>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            A word is shown with a proposed pronunciation. Decide whether it is the true pronunciation or a fake trap. You have <strong>1 try</strong>. Keyboard shortcuts: <code>←</code> for Trap, <code>→</code> for True.
          </p>
        </div>

        {/* Mode 3: Impostor Letter */}
        <div className="p-6 rounded-[16px] bg-[#FFFFFF] border border-[#E2D8C3] shadow-etymon flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-[8px] bg-[#B7D4EE] text-[#1F1B16] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-[#1F1B16]">3. Impostor Letter</h2>
          </div>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            Find the letter that never gets said out loud. You have <strong>2 tries</strong>. After answering, the sound for each letter is shown under its tile.
          </p>
        </div>

        {/* Mode 4: Syllable Chopper */}
        <div className="p-6 rounded-[16px] bg-[#FFFFFF] border border-[#E2D8C3] shadow-etymon flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-[8px] bg-[#F2D46B] text-[#1F1B16] flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </span>
            <h2 className="font-display text-lg font-bold text-[#1F1B16]">4. Syllable Chopper</h2>
          </div>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            The word is written in chunks, but spoken with one fewer syllable. Select the dropped chunk and click <strong>Chop</strong>. You have <strong>2 tries</strong>.
          </p>
        </div>
      </div>

      {/* Scoring, Streaks & Keyboard Rules */}
      <div className="p-8 rounded-[16px] bg-[#FFFFFF] border border-[#E2D8C3] shadow-etymon flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-bold text-[#1F1B16]">
            Scoring & Streak Rules
          </h2>
          <ul className="list-disc list-inside text-sm text-[#5E564A] space-y-1">
            <li><strong>Solved on first try:</strong> 100 points</li>
            <li><strong>Solved on second try:</strong> 50 points</li>
            <li><strong>Unsolved:</strong> 0 points</li>
          </ul>
          <p className="text-sm text-[#5E564A] leading-relaxed mt-2">
            Your Daily Streak increases by 1 when you complete the daily round of 15 words on consecutive days. Replaying today's mix counts once. Skipping a day resets your streak to 1.
          </p>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#E2D8C3]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#6B5A12]" />
            <h3 className="font-display text-base font-bold text-[#1F1B16]">
              Keyboard Shortcuts
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#1F1B16] font-mono-respell">
            <div className="p-2.5 rounded-[8px] bg-[#F4EEE1]">
              <span className="font-bold">1–4 or A–D:</span> Answer option
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#F4EEE1]">
              <span className="font-bold">← / →:</span> Trap or True
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#F4EEE1]">
              <span className="font-bold">Enter:</span> Chop / Next word
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#F4EEE1]">
              <span className="font-bold">R / H:</span> Replay Audio / Hint
            </div>
          </div>
        </div>

        {/* Speech Audio Note */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-[#E2D8C3]">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#6B5A12]" />
            <h3 className="font-display text-base font-bold text-[#1F1B16]">
              Pronunciation Audio
            </h3>
          </div>
          <p className="text-xs text-[#5E564A] leading-relaxed">
            Audio triggers only when you click or press a key. Where available, real recordings from the Free Dictionary API are played; otherwise your browser's speech synthesis engine provides audio.
          </p>
        </div>
      </div>
    </div>
  );
};
