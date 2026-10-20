import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WordItem } from '../data/words';
import { AdSlot } from './AdSlot';
import { ResultStrip } from './ResultStrip';
import { ArrowRight } from 'lucide-react';
import { fetchDictionaryData, DictionaryData } from '../services/dictionary';
import { COPY } from '../copy';

export interface PlayPageTemplateProps {
  modeTitle: string;
  modeSubtitle: string;
  currentWord: WordItem;
  triesRemaining: number;
  maxTries: number;
  isDaily?: boolean;
  roundNumber?: number; // 1-4
  totalRounds?: number; // 4
  arcadeStreak?: number;
  resolved: boolean;
  isCorrect?: boolean;
  tryCount?: 1 | 2;
  pointsEarned?: number;
  feedbackLine?: string | null;
  onNext: () => void;
  nextButtonLabel?: string;
  keyboardHintText: string;
  aboutText: string;
  children: React.ReactNode;
}

export const PlayPageTemplate: React.FC<PlayPageTemplateProps> = ({
  modeTitle,
  modeSubtitle,
  currentWord,
  triesRemaining,
  maxTries,
  isDaily = false,
  roundNumber = 1,
  totalRounds = 4,
  arcadeStreak = 0,
  resolved,
  isCorrect = false,
  tryCount = 1,
  pointsEarned = 0,
  feedbackLine = null,
  onNext,
  nextButtonLabel = 'Next word',
  keyboardHintText,
  aboutText,
  children,
}) => {
  const [dictData, setDictData] = useState<DictionaryData | null>(null);

  // Fetch dictionary data quietly in background
  useEffect(() => {
    let active = true;
    fetchDictionaryData(currentWord.word).then(data => {
      if (active) {
        setDictData(data);
      }
    });
    return () => {
      active = false;
    };
  }, [currentWord.word]);

  const companionModes = [
    { name: 'Daily Mix', path: '/', desc: '1 round with 15 words' },
    { name: 'Sound Match', path: '/sound-match', desc: 'Read the word, pick the sound' },
    { name: 'True or Trap', path: '/true-vs-trap', desc: 'Is this pronunciation real?' },
    { name: 'Impostor Letter', path: '/impostor-letter', desc: 'Find the silent letter' },
    { name: 'Syllable Chopper', path: '/syllable-chopper', desc: 'Slice the dropped chunk' },
  ].filter(m => m.name !== modeTitle);

  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col gap-6">
      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {resolved
          ? isCorrect
            ? COPY.sr.correctAnnouncement
                .replace('{word}', currentWord.word)
                .replace('{respelling}', currentWord.respelling)
            : COPY.sr.answerReveal.replace('{respelling}', currentWord.respelling)
          : isDaily
          ? `Word ${roundNumber} of ${totalRounds}, ${modeTitle}`
          : ''}
      </div>

      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="text-xs text-[#5E564A] font-medium flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#1F1B16] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#1F1B16] font-semibold">{modeTitle}</span>
        </nav>
        <h1 className="text-h1 text-[#1F1B16]">{modeTitle}</h1>
        <p className="text-sm md:text-base text-[#5E564A]">{modeSubtitle}</p>
      </div>

      {/* Main Content Grid: 1fr + 320px Aside */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Main Game Column */}
        <div className="flex flex-col gap-4 w-full">
          {/* Game Card */}
          <article className="w-full bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-5 sm:p-8 min-h-[560px] flex flex-col justify-between relative overflow-hidden">
            {/* Card Header Row */}
            <div className="flex flex-col gap-3 pb-4 border-b border-[#E2D8C3] mb-6">
              <div className="flex items-center justify-between">
                <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
                  {isDaily
                    ? `Word ${roundNumber} of ${totalRounds}`
                    : `Streak: ${arcadeStreak}`}
                </span>

                {/* Tries Indicator */}
                <div
                  className="flex items-center gap-1.5"
                  aria-label={`${triesRemaining} ${triesRemaining === 1 ? 'try' : 'tries'} left`}
                >
                  <span className="font-mono-respell text-[11px] uppercase tracking-wider text-[#5E564A] mr-1">
                    Tries:
                  </span>
                  {Array.from({ length: maxTries }).map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        idx < triesRemaining ? 'bg-[#1F1B16]' : 'bg-[#E2D8C3]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Continuous Progress Bar for Daily Mix */}
              {isDaily && (
                <div
                  role="progressbar"
                  aria-valuenow={roundNumber}
                  aria-valuemin={1}
                  aria-valuemax={totalRounds}
                  aria-label="Daily Mix progress"
                  className="w-full h-1.5 bg-[#F4EEE1] rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-[#1F1B16] rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, (roundNumber / totalRounds) * 100))}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Interactive Game Play Area */}
            <div className="flex-1 flex flex-col justify-center my-2">
              {children}
            </div>

            {/* Reserved Feedback Slot (min-height 176px to prevent CLS) */}
            <div className="min-h-[176px] mt-6 flex flex-col justify-end pt-4 border-t border-[#E2D8C3]">
              <ResultStrip
                resolved={resolved}
                isCorrect={isCorrect}
                word={currentWord}
                tryCount={tryCount}
                pointsEarned={pointsEarned}
                streak={arcadeStreak}
                feedbackLine={feedbackLine}
                onNext={onNext}
                nextButtonLabel={nextButtonLabel}
                audioUrl={dictData?.audioUrl}
                ipaOverride={dictData?.ipa}
                isDaily={isDaily}
                roundNumber={roundNumber}
                totalRounds={totalRounds}
              />
            </div>
          </article>

          {/* Keyboard Hint Line: normal flow below card, hidden on touch screens */}
          <div
            className="hidden [@media(hover:hover)]:flex items-center justify-between py-1 px-3 text-xs text-[#5E564A] font-mono-respell"
            aria-hidden="true"
          >
            <span>{keyboardHintText}</span>
            <span>R = Replay Audio · H = Hint</span>
          </div>

          {/* Attribution & About Section */}
          <section className="mt-4 p-5 rounded-[16px] bg-[#F4EEE1]/60 border border-[#E2D8C3] text-sm text-[#5E564A] leading-relaxed flex flex-col gap-2">
            <h2 className="font-display text-base font-semibold text-[#1F1B16]">
              About {modeTitle}
            </h2>
            <p>{aboutText}</p>
            <span className="text-[11px] font-mono-respell text-[#6F6659] pt-1">
              {COPY.attribution}
            </span>
          </section>
        </div>

        {/* Aside Rail: Sticky at 1024px, 320px fixed */}
        <aside className="w-full lg:w-[320px] sticky top-24 flex flex-col gap-6">
          <div className="w-full flex justify-center">
            <AdSlot size="300x250" />
          </div>

          <div className="w-full bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-5 flex flex-col gap-3">
            <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
              Other games
            </span>
            <div className="flex flex-col divide-y divide-[#E2D8C3]">
              {companionModes.map(cm => (
                <Link
                  key={cm.path}
                  to={cm.path}
                  className="py-2.5 flex flex-col group hover:text-[#1F1B16] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-[#1F1B16] group-hover:underline">
                      {cm.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5E564A] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="text-xs text-[#5E564A] mt-0.5">{cm.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
