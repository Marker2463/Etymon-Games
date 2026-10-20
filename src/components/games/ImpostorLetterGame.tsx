import React, { useState, useEffect } from 'react';
import { WordItem } from '../../data/words';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGame } from '../../context/GameContext';
import { Lightbulb, X, Check } from 'lucide-react';
import { COPY } from '../../copy';

interface ImpostorLetterGameProps {
  word: WordItem;
  resolved: boolean;
  onResolve: (result: 'first' | 'second' | 'miss') => void;
  onTryUsed?: () => void;
  onTriesChange?: React.Dispatch<React.SetStateAction<number>>;
}

export const ImpostorLetterGame: React.FC<ImpostorLetterGameProps> = ({
  word,
  resolved,
  onResolve,
  onTryUsed,
  onTriesChange,
}) => {
  const { triggerHaptic } = useGame();
  const letters = word.word.toUpperCase().split('');
  const silentIdx = word.silentIndex ?? 0;

  const [pickedIndices, setPickedIndices] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [shakingIdx, setShakingIdx] = useState<number | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState<string | null>(null);

  // Reset state when word changes to prevent persistent picks leaking to next word
  useEffect(() => {
    setPickedIndices([]);
    setShowHint(false);
    setShakingIdx(null);
    setSrAnnouncement(null);
  }, [word.id]);

  const handleTileClick = (index: number) => {
    if (resolved || pickedIndices.includes(index)) return;

    const newPicks = [...pickedIndices, index];
    setPickedIndices(newPicks);
    onTryUsed?.();
    onTriesChange?.(Math.max(0, 2 - newPicks.length));

    if (index === silentIdx) {
      triggerHaptic();
      const result = newPicks.length === 1 ? 'first' : 'second';
      onResolve(result);
    } else {
      setShakingIdx(index);
      setTimeout(() => setShakingIdx(null), 250);
      setSrAnnouncement(COPY.sr.incorrect);

      if (newPicks.length >= 2) {
        onResolve('miss');
      }
    }
  };

  useKeyboard(
    {
      onNumberKey: num => {
        const idx = num - 1;
        if (idx >= 0 && idx < letters.length) {
          handleTileClick(idx);
        }
      },
      onHint: () => setShowHint(true),
    },
    !resolved
  );

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto text-center">
      {srAnnouncement && (
        <span className="sr-only" role="alert">
          {srAnnouncement}
        </span>
      )}

      {/* Prompt Line (Not H1) */}
      <div className="flex flex-col items-center gap-1">
        <p className="font-display text-xl sm:text-2xl font-semibold text-[#1F1B16]">
          {COPY.prompts.impostorPrompt}
        </p>
      </div>

      {/* Row of Letter Tiles */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 w-full">
        {letters.map((letter, idx) => {
          const isSilent = idx === silentIdx;
          const isPicked = pickedIndices.includes(idx);
          const isShaking = shakingIdx === idx;

          let tileState =
            'bg-[#F4EEE1] border border-[#CFC3AA] text-[#1F1B16] hover:bg-[#EBE3D2]';

          if (resolved) {
            if (isSilent) {
              if (isPicked) {
                // Picked correctly
                tileState = 'bg-[#DDF5E0] border-2 border-[#2E6B3F] text-[#1F1B16]';
              } else {
                // Revealed correct after missing
                tileState = 'bg-[#DDF5E0] border-2 border-dashed border-[#2E6B3F] text-[#1F1B16]';
              }
            } else if (isPicked) {
              // Wrong pick
              tileState = 'bg-[#F9E0DB] border-2 border-[#A63A2B] text-[#1F1B16]';
            } else {
              tileState = 'bg-[#F4EEE1] border border-[#E2D8C3] text-[#6F6659]';
            }
          } else if (isPicked) {
            tileState = 'bg-[#F9E0DB] border-2 border-[#A63A2B] text-[#1F1B16]';
          }

          const shakeClass = isShaking ? 'translate-x-1.5 transition-transform duration-100' : '';

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                disabled={resolved || isPicked}
                onClick={() => handleTileClick(idx)}
                aria-label={`Letter ${letter}, position ${idx + 1}`}
                style={{
                  width: 'clamp(56px, 14vw, 84px)',
                  height: 'clamp(56px, 14vw, 84px)',
                }}
                className={`rounded-[16px] font-display font-bold text-2xl sm:text-3xl flex flex-col items-center justify-center transition-colors cursor-pointer disabled:cursor-default select-none shadow-xs ${tileState} ${shakeClass}`}
              >
                <span>{letter}</span>
                {isPicked && !isSilent && (
                  <X className="w-4 h-4 text-[#A63A2B] mt-0.5" />
                )}
                {resolved && isSilent && (
                  <Check className="w-4 h-4 text-[#2E6B3F] mt-0.5" />
                )}
              </button>

              {/* Phonetic caption revealed only after resolution */}
              {resolved && (
                <span className="font-mono-respell text-xs text-[#6F6659] min-h-[18px]">
                  {isSilent ? '—' : `/${letter.toLowerCase()}/`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Purely Phonetic Hint Controls */}
      <div className="flex flex-col items-center gap-2 pt-2">
        {!showHint && !resolved ? (
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-[10px] bg-[#F4EEE1] hover:bg-[#EBE3D2] border border-[#CFC3AA] text-xs font-semibold text-[#1F1B16] transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#6B5A12]" />
            <span>Show hint</span>
            <kbd className="hidden sm:inline-block font-mono-respell text-[10px] bg-[#FFFFFF] px-1 rounded text-[#5E564A]">
              H
            </kbd>
          </button>
        ) : (
          showHint && (
            <div className="p-3 bg-[#F4EEE1] rounded-[10px] border border-[#CFC3AA] text-xs text-[#5E564A] max-w-sm">
              <span className="font-semibold text-[#1F1B16]">Hint: </span>
              {word.hint}
            </div>
          )
        )}
      </div>
    </div>
  );
};
