import React, { useState, useMemo, useEffect } from 'react';
import { WordItem } from '../../data/words';
import { useSpeech } from '../../hooks/useSpeech';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGame } from '../../context/GameContext';
import { Volume2, Check, X } from 'lucide-react';
import { fetchDictionaryData } from '../../services/dictionary';
import { COPY } from '../../copy';

interface SoundMatchGameProps {
  word: WordItem;
  resolved: boolean;
  onResolve: (result: 'first' | 'miss') => void;
}

interface OptionItem {
  id: string;
  letter: string;
  respelling: string;
  tts: string;
  isCorrect: boolean;
}

export const SoundMatchGame: React.FC<SoundMatchGameProps> = ({
  word,
  resolved,
  onResolve,
}) => {
  const { speak, isSupported } = useSpeech();
  const { triggerHaptic } = useGame();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [definition, setDefinition] = useState<string | null>(null);
  const [partOfSpeech, setPartOfSpeech] = useState<string | null>(null);
  const [shakingOptionId, setShakingOptionId] = useState<string | null>(null);
  const [srAnnouncement, setSrAnnouncement] = useState<string | null>(null);

  // Reset state on word change
  useEffect(() => {
    setSelectedOptionId(null);
    setShakingOptionId(null);
    setSrAnnouncement(null);
    setDefinition(null);
    setPartOfSpeech(null);
  }, [word.id]);

  // Background dictionary lookup for definition & part of speech
  useEffect(() => {
    let active = true;
    fetchDictionaryData(word.word).then(data => {
      if (active && data) {
        if (data.definition) setDefinition(data.definition);
        if (data.partOfSpeech) setPartOfSpeech(data.partOfSpeech);
      }
    });
    return () => {
      active = false;
    };
  }, [word.word]);

  // Generate 4 deterministic options based on word id
  const options = useMemo<OptionItem[]>(() => {
    const list: OptionItem[] = [
      { id: 'correct', letter: '', respelling: word.respelling, tts: word.tts, isCorrect: true },
    ];

    if (word.wrong) {
      word.wrong.forEach((w, i) => {
        list.push({
          id: `wrong-${i}`,
          letter: '',
          respelling: w.text,
          tts: w.tts,
          isCorrect: false,
        });
      });
    }

    const offset = word.id.charCodeAt(0) % 4;
    const shuffled: OptionItem[] = [];
    for (let i = 0; i < 4; i++) {
      const srcIndex = (i + offset) % list.length;
      shuffled.push(list[srcIndex] || list[0]);
    }

    const letters = ['A', 'B', 'C', 'D'];
    return shuffled.map((item, idx) => ({
      ...item,
      letter: letters[idx],
    }));
  }, [word]);

  const handleSelect = (opt: OptionItem) => {
    if (resolved) return;
    setSelectedOptionId(opt.id);

    if (opt.isCorrect) {
      triggerHaptic();
      onResolve('first');
    } else {
      // 6px single shake nudge
      setShakingOptionId(opt.id);
      setTimeout(() => setShakingOptionId(null), 250);
      setSrAnnouncement(COPY.sr.incorrect);
      onResolve('miss');
    }
  };

  useKeyboard(
    {
      onOption: idx => {
        if (!resolved && options[idx]) {
          handleSelect(options[idx]);
        }
      },
      onReplay: () => {
        if (resolved) {
          speak(word.tts);
        }
      },
    },
    !resolved
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Screen Reader Error Announcement */}
      {srAnnouncement && (
        <span className="sr-only" role="alert">
          {srAnnouncement}
        </span>
      )}

      {/* Target Word Inset Panel */}
      <div className="p-6 rounded-[16px] bg-[#F4EEE1] border border-[#E2D8C3] flex flex-col items-center text-center gap-2">
        {partOfSpeech && (
          <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
            {partOfSpeech}
          </span>
        )}

        <h2 className="text-word-display text-[#1F1B16] capitalize">
          {word.word}
        </h2>

        {definition && (
          <p className="text-sm text-[#5E564A] max-w-md italic mt-1 line-clamp-2">
            "{definition}"
          </p>
        )}
      </div>

      {/* 4 Options Matrix: 2x2 at 640+, 1 col below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map(opt => {
          const isSelected = selectedOptionId === opt.id;
          const isShaking = shakingOptionId === opt.id;

          let stateStyle = 'bg-[#F4EEE1] border-[#E2D8C3] text-[#1F1B16] hover:bg-[#EBE3D2]';
          let statusIcon = null;

          if (resolved) {
            if (opt.isCorrect) {
              stateStyle =
                'bg-[#DDF5E0] border-2 border-[#2E6B3F] text-[#1F1B16] font-semibold scale-100 transition-transform duration-180';
              statusIcon = <Check className="w-4 h-4 text-[#2E6B3F]" />;
            } else if (isSelected && !opt.isCorrect) {
              stateStyle = 'bg-[#F9E0DB] border-2 border-[#A63A2B] text-[#1F1B16]';
              statusIcon = <X className="w-4 h-4 text-[#A63A2B]" />;
            } else {
              stateStyle = 'bg-[#F4EEE1] border-[#E2D8C3] text-[#6F6659]';
            }
          }

          const shakeClass = isShaking ? 'translate-x-1.5 transition-transform duration-100' : '';

          return (
            <button
              key={opt.id}
              type="button"
              disabled={resolved}
              onClick={() => handleSelect(opt)}
              aria-label={`Option ${opt.letter}: ${opt.respelling}`}
              className={`min-h-[72px] p-4 rounded-[12px] border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer disabled:cursor-default ${stateStyle} ${shakeClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-[8px] bg-[#FFFFFF] border border-[#CFC3AA] font-mono-respell font-bold text-xs text-[#1F1B16] flex items-center justify-center shrink-0">
                  {opt.letter}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-respelling text-[#1F1B16]">
                    {opt.respelling}
                  </span>
                  {statusIcon}
                </div>
              </div>

              {/* 44px Hear Option Icon Button */}
              <button
                type="button"
                aria-label={`Hear option ${opt.letter}`}
                disabled={!isSupported}
                onClick={e => {
                  e.stopPropagation();
                  speak(opt.tts);
                }}
                className="w-[44px] h-[44px] rounded-[10px] bg-[#FFFFFF] hover:bg-[#EBE3D2] border border-[#CFC3AA] flex items-center justify-center text-[#1F1B16] transition-colors shrink-0 cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-[#1F1B16]" />
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
};
