import React, { useState, useMemo, useEffect } from 'react';
import { WordItem } from '../../data/words';
import { useSpeech } from '../../hooks/useSpeech';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGame } from '../../context/GameContext';
import { Volume2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { COPY } from '../../copy';
import { getLastTrapVariant, setLastTrapVariant } from '../../utils/arcade';

interface TrueOrTrapGameProps {
  word: WordItem;
  resolved: boolean;
  onResolve: (result: 'first' | 'miss') => void;
}

export const TrueOrTrapGame: React.FC<TrueOrTrapGameProps> = ({
  word,
  resolved,
  onResolve,
}) => {
  const { speak, isSupported } = useSpeech();
  const { triggerHaptic } = useGame();
  const [userChoice, setUserChoice] = useState<'true' | 'trap' | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [srAnnouncement, setSrAnnouncement] = useState<string | null>(null);

  // Reset choice state when word changes
  useEffect(() => {
    setUserChoice(null);
    setIsShaking(false);
    setSrAnnouncement(null);
  }, [word.id]);

  const proposal = useMemo(() => {
    let preferVariant: 'correct' | 'wrong';
    const lastVariant = getLastTrapVariant(word.id);
    if (lastVariant === 'correct') {
      preferVariant = 'wrong';
    } else if (lastVariant === 'wrong') {
      preferVariant = 'correct';
    } else {
      preferVariant = word.id.charCodeAt(0) % 2 === 0 ? 'correct' : 'wrong';
    }

    if (preferVariant === 'correct' || !word.wrong || word.wrong.length === 0) {
      setLastTrapVariant(word.id, 'correct');
      return {
        respelling: word.respelling,
        tts: word.tts,
        isTrue: true,
      };
    }

    const wrongIndex = (word.id.charCodeAt(word.id.length - 1) || 0) % word.wrong.length;
    const wrongItem = word.wrong[wrongIndex] || word.wrong[0];
    setLastTrapVariant(word.id, 'wrong');
    return {
      respelling: wrongItem.text,
      tts: wrongItem.tts,
      isTrue: false,
    };
  }, [word]);

  const handlePick = (choice: 'true' | 'trap') => {
    if (resolved) return;
    setUserChoice(choice);
    const correctChoice = proposal.isTrue ? 'true' : 'trap';
    const isMatch = choice === correctChoice;

    if (isMatch) {
      triggerHaptic();
      onResolve('first');
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 250);
      setSrAnnouncement(COPY.sr.incorrect);
      onResolve('miss');
    }
  };

  useKeyboard(
    {
      onLeft: () => handlePick('trap'),
      onRight: () => handlePick('true'),
      onReplay: () => speak(proposal.tts),
    },
    !resolved
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-xl mx-auto items-center text-center">
      {srAnnouncement && (
        <span className="sr-only" role="alert">
          {srAnnouncement}
        </span>
      )}

      {/* Target Word */}
      <div className="flex flex-col items-center gap-1.5">
        <h2 className="text-word-display text-[#1F1B16] capitalize">
          {word.word}
        </h2>
      </div>

      {/* Proposed Pronunciation Card */}
      <div className="w-full p-6 rounded-[16px] bg-[#F4EEE1] border border-[#E2D8C3] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-start text-left">
          <span className="font-mono-respell text-[11px] text-[#6B5A12] uppercase tracking-wider font-semibold">
            PROPOSED PRONUNCIATION
          </span>
          <span className="text-respelling text-[#1F1B16] mt-1 font-bold">
            {proposal.respelling}
          </span>
        </div>

        {/* Hear It Button */}
        <button
          type="button"
          onClick={() => speak(proposal.tts)}
          disabled={!isSupported}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-[12px] bg-[#FFFFFF] hover:bg-[#EBE3D2] border border-[#CFC3AA] text-[#1F1B16] font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <Volume2 className="w-4 h-4 text-[#1F1B16]" />
          <span>Hear it</span>
          <kbd className="hidden sm:inline-block font-mono-respell text-[10px] bg-[#F4EEE1] px-1 rounded text-[#5E564A]">
            R
          </kbd>
        </button>
      </div>

      {/* Equal-Weight Trap / True Buttons */}
      <div className={`grid grid-cols-2 gap-4 w-full ${isShaking ? 'translate-x-1.5 transition-transform duration-100' : ''}`}>
        {/* TRAP BUTTON */}
        <button
          type="button"
          disabled={resolved}
          onClick={() => handlePick('trap')}
          className={`min-touch-target p-4 rounded-[12px] border text-center flex items-center justify-center gap-2.5 font-display text-lg font-semibold transition-colors cursor-pointer disabled:cursor-default ${
            resolved
              ? !proposal.isTrue
                ? 'bg-[#DDF5E0] border-2 border-[#2E6B3F] text-[#1F1B16]'
                : userChoice === 'trap'
                ? 'bg-[#F9E0DB] border-2 border-[#A63A2B] text-[#1F1B16]'
                : 'bg-[#F4EEE1] border-[#E2D8C3] text-[#6F6659]'
              : 'bg-[#F4EEE1] hover:bg-[#EBE3D2] border-[#CFC3AA] text-[#1F1B16]'
          }`}
        >
          {resolved && userChoice === 'trap' && proposal.isTrue ? (
            <X className="w-5 h-5 text-[#A63A2B]" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-[#6B5A12]" />
          )}
          <span>Trap</span>
          <kbd className="hidden sm:inline-block font-mono-respell text-[10px] bg-[#FFFFFF] border border-[#CFC3AA] px-1.5 py-0.5 rounded text-[#5E564A]">
            ←
          </kbd>
        </button>

        {/* TRUE BUTTON */}
        <button
          type="button"
          disabled={resolved}
          onClick={() => handlePick('true')}
          className={`min-touch-target p-4 rounded-[12px] border text-center flex items-center justify-center gap-2.5 font-display text-lg font-semibold transition-colors cursor-pointer disabled:cursor-default ${
            resolved
              ? proposal.isTrue
                ? 'bg-[#DDF5E0] border-2 border-[#2E6B3F] text-[#1F1B16]'
                : userChoice === 'true'
                ? 'bg-[#F9E0DB] border-2 border-[#A63A2B] text-[#1F1B16]'
                : 'bg-[#F4EEE1] border-[#E2D8C3] text-[#6F6659]'
              : 'bg-[#F4EEE1] hover:bg-[#EBE3D2] border-[#CFC3AA] text-[#1F1B16]'
          }`}
        >
          {resolved && userChoice === 'true' && !proposal.isTrue ? (
            <X className="w-5 h-5 text-[#A63A2B]" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#2E6B3F]" />
          )}
          <span>True</span>
          <kbd className="hidden sm:inline-block font-mono-respell text-[10px] bg-[#FFFFFF] border border-[#CFC3AA] px-1.5 py-0.5 rounded text-[#5E564A]">
            →
          </kbd>
        </button>
      </div>
    </div>
  );
};
