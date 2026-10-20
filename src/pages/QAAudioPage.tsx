import React from 'react';
import { useGame } from '../context/GameContext';
import { useSpeech } from '../hooks/useSpeech';
import { Volume2 } from 'lucide-react';
import { COPY } from '../copy';

export const QAAudioPage: React.FC = () => {
  const { wordBank } = useGame();
  const { speak, isSupported } = useSpeech();

  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 pb-4 border-b border-[#E2D8C3]">
        <h1 className="text-h1 text-[#1F1B16]">Audio QA Testboard</h1>
        <p className="text-sm text-[#5E564A]">
          Internal listening board listing every target word TTS string and incorrect option TTS string for auditing speech synthesis quality.
        </p>
        <span className="text-xs font-mono-respell text-[#6B5A12]">
          {COPY.attribution}
        </span>
        {!isSupported && (
          <p className="text-xs text-[#A63A2B] font-semibold">
            Speech synthesis is unavailable in this environment.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wordBank.map(word => (
          <div
            key={word.id}
            className="p-4 rounded-[12px] bg-[#FFFFFF] border border-[#E2D8C3] shadow-etymon flex flex-col gap-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E2D8C3]">
              <div className="flex items-baseline gap-2">
                <strong className="font-display text-lg capitalize text-[#1F1B16]">{word.word}</strong>
                <span className="font-mono-respell text-xs text-[#6B5A12] font-semibold">{word.respelling}</span>
              </div>
              <span className="text-[11px] font-mono-respell text-[#6F6659]">Diff: {word.difficulty}</span>
            </div>

            {/* Target Pronunciation */}
            <div className="flex items-center justify-between bg-[#F4EEE1] p-2.5 rounded-[8px]">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono-respell text-[#6B5A12] font-semibold">Target Word TTS</span>
                <span className="text-xs font-mono-respell font-bold text-[#1F1B16]">"{word.tts}"</span>
              </div>
              <button
                type="button"
                disabled={!isSupported}
                onClick={() => speak(word.tts)}
                className="p-2 rounded-[8px] bg-[#1F1B16] text-[#FDF8EC] hover:bg-[#1F1B16]/80 transition-colors cursor-pointer"
                aria-label={`Play target audio for ${word.word}`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Wrong Options TTS */}
            {word.wrong && word.wrong.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-mono-respell text-[#6F6659] font-semibold">Option Traps TTS</span>
                <div className="flex flex-col gap-1">
                  {word.wrong.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1 px-2 rounded-[6px] hover:bg-[#F4EEE1]/60 text-xs"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono-respell text-[#1F1B16]">{item.text}</span>
                        <span className="font-mono-respell text-[11px] text-[#5E564A]">("{item.tts}")</span>
                      </div>
                      <button
                        type="button"
                        disabled={!isSupported}
                        onClick={() => speak(item.tts)}
                        className="p-1 rounded-[6px] hover:bg-[#EBE3D2] text-[#1F1B16] transition-colors cursor-pointer"
                        aria-label={`Play audio for ${item.text}`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
