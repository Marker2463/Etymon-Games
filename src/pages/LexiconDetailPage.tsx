import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useSpeech } from '../hooks/useSpeech';
import { fetchDictionaryData, DictionaryData } from '../services/dictionary';
import { Volume2, ExternalLink, ArrowLeft, Unlock, Lock } from 'lucide-react';
import { COPY } from '../copy';

export const LexiconDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { wordBank, isWordUnlocked } = useGame();
  const { speak, isSupported } = useSpeech();

  const word = wordBank.find(w => w.id === id);
  const [dictData, setDictData] = useState<DictionaryData | null>(null);

  useEffect(() => {
    if (word) {
      let active = true;
      fetchDictionaryData(word.word).then(data => {
        if (active) setDictData(data);
      });
      return () => {
        active = false;
      };
    }
  }, [word]);

  if (!word) {
    return (
      <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center gap-4">
        <h1 className="text-h1 text-[#1F1B16]">Word Not Found</h1>
        <p className="text-sm text-[#5E564A]">The requested lexicon entry does not exist.</p>
        <Link to="/lexicon" className="py-2.5 px-5 rounded-[12px] bg-[#1F1B16] text-[#FDF8EC] text-sm font-semibold">
          Return to Lexicon
        </Link>
      </div>
    );
  }

  const unlocked = isWordUnlocked(word.id);
  const displayIpa = word.ipa || dictData?.ipa;

  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#5E564A] font-medium flex items-center gap-1.5">
        <Link to="/" className="hover:text-[#1F1B16] transition-colors">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link to="/lexicon" className="hover:text-[#1F1B16] transition-colors">
          Lexicon
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#1F1B16] font-semibold capitalize">{word.word}</span>
      </nav>

      {/* Main Card */}
      <article className="w-full bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-6 sm:p-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E2D8C3]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {dictData?.partOfSpeech && (
                <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
                  {dictData.partOfSpeech}
                </span>
              )}
              {unlocked ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E6B3F] bg-[#DDF5E0] px-2 py-0.5 rounded-[999px]">
                  <Unlock className="w-3 h-3" />
                  <span>Unlocked</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5E564A] bg-[#F4EEE1] px-2 py-0.5 rounded-[999px]">
                  <Lock className="w-3 h-3" />
                  <span>Locked</span>
                </span>
              )}
            </div>

            <h1 className="text-word-display text-[#1F1B16] capitalize">
              {word.word}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono-respell text-lg font-bold text-[#6B5A12]">
                {word.respelling}
              </span>
              {displayIpa && (
                <span className="font-serif italic text-base text-[#5E564A]">
                  {displayIpa}
                </span>
              )}
            </div>
          </div>

          {/* Pronunciation Audio Button */}
          <button
            type="button"
            disabled={!isSupported}
            onClick={() => speak(word.tts, dictData?.audioUrl)}
            className="inline-flex items-center gap-2 py-3 px-5 rounded-[12px] bg-[#1F1B16] hover:bg-[#1F1B16]/90 text-[#FDF8EC] font-semibold text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Volume2 className="w-4 h-4 text-[#FDF8EC]" />
            <span>Hear pronunciation</span>
          </button>
        </div>

        {/* Live Dictionary Definition */}
        {dictData?.definition && (
          <div className="p-6 rounded-[14px] bg-[#F4EEE1] border border-[#E2D8C3] flex flex-col gap-1.5">
            <span className="font-mono-respell text-[11px] text-[#6B5A12] uppercase tracking-wider font-semibold">
              Definition
            </span>
            <p className="text-base text-[#1F1B16] leading-relaxed">
              "{dictData.definition}"
            </p>
          </div>
        )}

        {/* Categorical Tags */}
        {word.tags && word.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono-respell text-xs text-[#5E564A] uppercase font-semibold mr-1">
              Category:
            </span>
            {word.tags.map(t => (
              <span
                key={t}
                className="font-mono-respell text-xs text-[#1F1B16] bg-[#F4EEE1] border border-[#CFC3AA] px-2.5 py-1 rounded-[6px]"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Dictionary API License & Source Attribution */}
        <div className="pt-6 border-t border-[#E2D8C3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#5E564A]">
          <Link
            to="/lexicon"
            className="inline-flex items-center gap-1.5 font-semibold text-[#5E564A] hover:text-[#1F1B16] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lexicon</span>
          </Link>

          <div className="flex flex-col sm:items-end gap-1 text-[11px] font-mono-respell text-[#6F6659]">
            <span>{COPY.attribution}</span>
            {dictData?.license && (
              <div className="flex items-center gap-2">
                <span>License: {dictData.license.name}</span>
                {dictData.sourceUrls && dictData.sourceUrls.length > 0 && (
                  <a
                    href={dictData.sourceUrls[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline hover:text-[#1F1B16]"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};
