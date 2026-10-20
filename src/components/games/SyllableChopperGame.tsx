import React, { useState, useEffect } from 'react';
import { WordItem } from '../../data/words';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGame } from '../../context/GameContext';
import { Scissors, RotateCcw, Lightbulb, Check, X } from 'lucide-react';
import { COPY } from '../../copy';

interface SyllableChopperGameProps {
  word: WordItem;
  resolved: boolean;
  onResolve: (result: 'first' | 'second' | 'miss') => void;
  onTryUsed?: () => void;
  onTriesChange?: React.Dispatch<React.SetStateAction<number>>;
}

export const SyllableChopperGame: React.FC<SyllableChopperGameProps> = ({
  word,
  resolved,
  onResolve,
  onTryUsed,
  onTriesChange,
}) => {
  const { triggerHaptic } = useGame();
  const chunksData = word.chunks || {
    parts: [word.word.toLowerCase()],
    droppedIndex: 0,
    spoken: word.respelling,
  };

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [choppedIndex, setChoppedIndex] = useState<number | null>(null);
  const [wrongPickedIndices, setWrongPickedIndices] = useState<number[]>([]);
  const [shaking, setShaking] = useState<boolean>(false);
  const [srAnnouncement, setSrAnnouncement] = useState<string | null>(null);

  // Reset state when word changes to prevent persistent state leaking to next word
  useEffect(() => {
    setSelectedIndex(null);
    setAttemptCount(0);
    setShowHint(false);
    setChoppedIndex(null);
    setWrongPickedIndices([]);
    setShaking(false);
    setSrAnnouncement(null);
  }, [word.id]);

  const handleSelectChunk = (idx: number) => {
    if (resolved) return;
    setSelectedIndex(idx);
  };

  const handleChop = () => {
    if (resolved || selectedIndex === null) return;

    const newAttempts = attemptCount + 1;
    setAttemptCount(newAttempts);
    onTryUsed?.();
    onTriesChange?.(Math.max(0, 2 - newAttempts));

    if (selectedIndex === chunksData.droppedIndex) {
      triggerHaptic();
      setChoppedIndex(selectedIndex);
      const result = newAttempts === 1 ? 'first' : 'second';
      onResolve(result);
    } else {
      setWrongPickedIndices(prev => [...prev, selectedIndex]);
      setShaking(true);
      setTimeout(() => setShaking(false), 250);
      setSrAnnouncement(COPY.sr.incorrect);

      if (newAttempts >= 2) {
        setChoppedIndex(chunksData.droppedIndex);
        onResolve('miss');
      } else {
        setSelectedIndex(null);
      }
    }
  };

  const handleReset = () => {
    if (resolved) return;
    setSelectedIndex(null);
  };

  useKeyboard(
    {
      onNumberKey: num => {
        const idx = num - 1;
        if (idx >= 0 && idx < chunksData.parts.length) {
          handleSelectChunk(idx);
        }
      },
      onEnter: () => {
        if (selectedIndex !== null) {
          handleChop();
        }
      },
      onHint: () => setShowHint(true),
    },
    !resolved
  );

  const nChunks = chunksData.parts.length;
  const promptText = COPY.prompts.chopperPrompt
    .replace('{n}', String(nChunks))
    .replace('{nMinus1}', String(nChunks - 1));

  return (
    <div className="flex flex-col items-center gap-7 w-full max-w-2xl mx-auto text-center">
      {srAnnouncement && (
        <span className="sr-only" role="alert">
          {srAnnouncement}
        </span>
      )}

      {/* Purely phonetic prompt */}
      <div className="flex flex-col items-center gap-1.5">
        <p className="font-display text-lg sm:text-xl text-[#1F1B16]">
          {promptText}
        </p>
      </div>

      {/* Syllable Chunk Tiles */}
      <div className="w-full">
        <div
          className={`grid gap-3 w-full ${shaking ? 'translate-x-1.5 transition-transform duration-100' : ''}`}
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(72px, 1fr))`,
          }}
        >
          {chunksData.parts.map((chunk, idx) => {
            const isSelected = selectedIndex === idx;
            const isDropped = idx === chunksData.droppedIndex;
            const isCollapsed = choppedIndex === idx;
            const isWrong = wrongPickedIndices.includes(idx);

            let tileClasses =
              'bg-[#F4EEE1] border border-[#CFC3AA] text-[#1F1B16] hover:bg-[#EBE3D2]';

            if (isCollapsed) {
              tileClasses =
                'bg-[#F9E0DB]/40 border-2 border-dashed border-[#A63A2B] text-[#A63A2B] line-through scale-95 opacity-80';
            } else if (resolved) {
              if (isDropped) {
                tileClasses = 'bg-[#DDF5E0] border-2 border-[#2E6B3F] text-[#1F1B16] font-bold';
              } else if (isWrong) {
                tileClasses = 'bg-[#F9E0DB] border-2 border-[#A63A2B] text-[#1F1B16]';
              } else {
                tileClasses = 'bg-[#F4EEE1] border border-[#E2D8C3] text-[#6F6659]';
              }
            } else if (isWrong) {
              tileClasses = 'bg-[#F9E0DB] border-2 border-[#A63A2B] text-[#1F1B16]';
            } else if (isSelected) {
              tileClasses = 'bg-[#1F1B16] border-2 border-[#1F1B16] text-[#FDF8EC] shadow-md';
            }

            return (
              <div key={idx} className="relative flex flex-col items-center">
                <button
                  type="button"
                  disabled={resolved || isWrong}
                  onClick={() => handleSelectChunk(idx)}
                  aria-label={`Chunk ${chunk}, position ${idx + 1}`}
                  className={`w-full min-h-[96px] px-4 py-3 rounded-[16px] flex flex-col items-center justify-center transition-all cursor-pointer disabled:cursor-default select-none ${tileClasses}`}
                  style={{
                    fontSize: 'clamp(1.25rem, 5vw, 2rem)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span className="font-display font-bold tracking-wide uppercase">
                    {chunk}
                  </span>

                  {isSelected && !resolved && (
                    <span className="mt-1 font-mono-respell text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#F2B8AE] text-[#1F1B16]">
                      {COPY.prompts.markedBadge}
                    </span>
                  )}
                  {isWrong && <X className="w-4 h-4 text-[#A63A2B] mt-1" />}
                  {resolved && isDropped && <Check className="w-4 h-4 text-[#2E6B3F] mt-1" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spoken acoustic form revealed on correct */}
      {resolved && (
        <div className="p-3 bg-[#DDF5E0] border border-[#2E6B3F] rounded-[12px] flex items-center justify-center gap-2 text-sm text-[#1F1B16]">
          <span className="font-semibold">Spoken form:</span>
          <span className="font-mono-respell font-bold text-[#6B5A12]">
            {chunksData.spoken}
          </span>
        </div>
      )}

      {/* Controls */}
      {!resolved && (
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            type="button"
            disabled={selectedIndex === null}
            onClick={handleChop}
            className="inline-flex items-center gap-2 py-3 px-6 rounded-[12px] bg-[#1F1B16] text-[#FDF8EC] font-semibold text-sm hover:bg-[#1F1B16]/90 transition-colors cursor-pointer disabled:bg-[#F4EEE1] disabled:text-[#6F6659] disabled:cursor-not-allowed shadow-xs"
          >
            <Scissors className="w-4 h-4" />
            <span>{COPY.prompts.chopButton}</span>
            <kbd className="hidden sm:inline-block font-mono-respell text-[10px] bg-[#FFFFFF]/20 text-[#FDF8EC] px-1.5 py-0.5 rounded">
              Enter
            </kbd>
          </button>

          {selectedIndex !== null && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 py-3 px-4 rounded-[12px] bg-[#F4EEE1] hover:bg-[#EBE3D2] border border-[#CFC3AA] text-sm font-medium text-[#1F1B16] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{COPY.prompts.resetSelection}</span>
            </button>
          )}

          {!showHint && (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="inline-flex items-center gap-1.5 py-3 px-4 rounded-[12px] bg-[#F4EEE1] hover:bg-[#EBE3D2] border border-[#CFC3AA] text-sm font-medium text-[#1F1B16] transition-colors cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-[#6B5A12]" />
              <span>{COPY.prompts.showHint}</span>
            </button>
          )}
        </div>
      )}

      {showHint && !resolved && (
        <div className="p-3 bg-[#F4EEE1] rounded-[10px] border border-[#CFC3AA] text-xs text-[#5E564A] max-w-sm">
          <span className="font-semibold text-[#1F1B16]">Hint: </span>
          {word.hint}
        </div>
      )}
    </div>
  );
};
