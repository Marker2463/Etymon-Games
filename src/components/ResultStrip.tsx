import React, { useRef, useEffect } from 'react';
import { WordItem } from '../data/words';
import { Check, Volume2, ArrowRight } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

interface ResultStripProps {
  resolved: boolean;
  isCorrect: boolean;
  word: WordItem;
  tryCount: 1 | 2;
  pointsEarned: number;
  streak: number;
  feedbackLine: string | null;
  onNext: () => void;
  nextButtonLabel?: string;
  audioUrl?: string; // Fetched US audio if available
  ipaOverride?: string; // Live fetched IPA if entry has no curated IPA
  isDaily?: boolean;
  roundNumber?: number;
  totalRounds?: number;
}

export const ResultStrip: React.FC<ResultStripProps> = ({
  resolved,
  isCorrect,
  word,
  pointsEarned,
  feedbackLine,
  onNext,
  nextButtonLabel = 'Next word',
  audioUrl,
  ipaOverride,
  isDaily = false,
  roundNumber,
  totalRounds,
}) => {
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const { speak, isSpeaking, isSupported } = useSpeech();

  // On resolution, shift focus directly to the Next button
  useEffect(() => {
    if (resolved && nextBtnRef.current) {
      nextBtnRef.current.focus();
    }
  }, [resolved]);

  if (!resolved) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-[#6F6659]/70 italic select-none">
        {/* Empty reserved slot maintaining fixed height without shifting */}
      </div>
    );
  }

  const displayIpa = word.ipa || ipaOverride;

  return (
    <div className="w-full flex flex-col gap-2.5 animate-fade-in select-none">
      {/* Feedback line above the strip (only on correct, never on wrong) */}
      {isCorrect && feedbackLine && (
        <div className="text-sm font-semibold text-[#2E6B3F] flex items-center gap-1.5 px-1">
          <span>{feedbackLine}</span>
        </div>
      )}

      {/* Main Strip: [state icon] [word, respelling, IPA, Hear] [points chip] [Next button] */}
      <div
        className={`w-full p-4 rounded-[12px] border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
          isCorrect
            ? 'bg-[#DDF5E0] border-[#2E6B3F]'
            : 'bg-[#F4EEE1] border-[#CFC3AA]'
        }`}
      >
        {/* Left Section: State indicator + Word cluster */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          {/* State icon: Check if correct, or ANSWER mono tag if wrong */}
          {isCorrect ? (
            <div className="w-8 h-8 rounded-full bg-[#2E6B3F] text-[#FFFFFF] flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
          ) : (
            <span className="font-mono-respell text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-[6px] bg-[#1F1B16] text-[#FDF8EC] shrink-0">
              ANSWER
            </span>
          )}

          {/* Word, respelling, IPA, and Hear button */}
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 min-w-0">
            <span className="font-display text-xl font-bold text-[#1F1B16] capitalize truncate">
              {word.word}
            </span>

            <span className="font-mono-respell font-bold text-base text-[#6B5A12]">
              {word.respelling}
            </span>

            {displayIpa && (
              <span className="font-serif italic text-xs text-[#6F6659]">
                {displayIpa}
              </span>
            )}

            {isSupported && (
              <button
                type="button"
                disabled={isSpeaking}
                onClick={() => speak(word.tts, audioUrl)}
                className="p-1 rounded-[6px] hover:bg-black/5 text-[#1F1B16] inline-flex items-center transition-colors cursor-pointer"
                aria-label={`Hear ${word.word}`}
              >
                <Volume2 className="w-4 h-4 text-[#1F1B16]" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Points Chip + Next Button + Progress saved */}
        <div className="flex flex-col items-stretch sm:items-end gap-1 shrink-0">
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
            {/* Points Chip (Floats and fades if correct) */}
            {isCorrect && pointsEarned > 0 && (
              <span className="font-mono-respell text-xs font-bold px-2.5 py-1 rounded-[999px] bg-[#2E6B3F] text-[#FFFFFF] animate-pulse">
                +{pointsEarned}
              </span>
            )}

            {/* Primary Next Button */}
            <button
              ref={nextBtnRef}
              type="button"
              onClick={onNext}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-[10px] bg-[#1F1B16] text-[#FDF8EC] font-semibold text-sm hover:bg-[#1F1B16]/90 transition-colors shadow-xs cursor-pointer"
            >
              <span>{nextButtonLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Muted line under the Next button on rounds 1-14 */}
          {isDaily && roundNumber !== undefined && totalRounds !== undefined && roundNumber < totalRounds && (
            <span className="text-[11px] font-mono-respell text-[#6F6659] text-center sm:text-right select-none pr-1">
              Progress saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
