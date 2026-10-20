import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Search, Lock, Unlock, Volume2, ArrowRight } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { COPY } from '../copy';

export const LexiconPage: React.FC = () => {
  const { wordBank, isWordUnlocked } = useGame();
  const { speak, isSupported } = useSpeech();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filterTags = [
    { id: 'all', label: 'All Words' },
    { id: 'misleading', label: 'Odd spellings' },
    { id: 'silent-letter', label: 'Silent Letters' },
    { id: 'place', label: 'Place Names' },
    { id: 'loanword', label: 'Loanwords' },
    { id: 'dropped-syllable', label: 'Dropped Syllables' },
    { id: 'name', label: 'Names' },
    { id: 'nautical', label: 'Nautical' },
  ];

  const filteredWords = useMemo(() => {
    return wordBank.filter(w => {
      const matchesSearch =
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.respelling.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === 'all' || w.tags.includes(selectedTag as any);

      return matchesSearch && matchesTag;
    }).sort((a, b) => a.word.localeCompare(b.word));
  }, [wordBank, searchQuery, selectedTag]);

  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="text-xs text-[#5E564A] font-medium flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#1F1B16] transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#1F1B16] font-semibold">{COPY.nav.lexicon}</span>
        </nav>
        <h1 className="text-h1 text-[#1F1B16]">The Lexicon</h1>
        <p className="text-sm text-[#5E564A]">
          An index of English words that don't sound the way they look. Encounter words in Daily or Arcade modes to unlock their entries.
        </p>
      </div>

      {/* Controls: Search & Filter Chips */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#5E564A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search words, respellings..."
            aria-label="Search lexicon"
            className="w-full pl-10 pr-4 py-2.5 rounded-[12px] bg-[#FFFFFF] border border-[#E2D8C3] text-sm text-[#1F1B16] placeholder:text-[#6F6659] shadow-2xs focus:border-[#1F1B16] focus:ring-0 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="toolbar" aria-label="Filter words by category">
          {filterTags.map(tab => {
            const isActive = selectedTag === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTag(tab.id)}
                className={`py-1.5 px-3 rounded-[999px] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1F1B16] text-[#FDF8EC]'
                    : 'bg-[#F4EEE1] text-[#1F1B16] hover:bg-[#EBE3D2] border border-[#E2D8C3]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Word Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map(word => {
          const unlocked = isWordUnlocked(word.id);

          return (
            <div
              key={word.id}
              className={`rounded-[16px] border p-5 flex flex-col justify-between transition-all ${
                unlocked
                  ? 'bg-[#FFFFFF] border-[#E2D8C3] shadow-etymon hover:border-[#1F1B16]'
                  : 'bg-[#F4EEE1]/60 border-[#E2D8C3] opacity-85'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono-respell text-[10px] uppercase text-[#6B5A12] font-semibold">
                    {word.tags[0] || 'word'}
                  </span>
                  {unlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-[#2E6B3F]">
                      <Unlock className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-[#6F6659]">
                      <Lock className="w-3 h-3" />
                      <span>Play to unlock</span>
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="font-display text-xl font-bold text-[#1F1B16] capitalize">
                    {word.word}
                  </h3>
                  {unlocked && (
                    <span className="font-mono-respell text-xs font-semibold text-[#6B5A12]">
                      {word.respelling}
                    </span>
                  )}
                </div>

                {unlocked ? (
                  word.ipa && (
                    <span className="font-serif italic text-xs text-[#6F6659]">
                      {word.ipa}
                    </span>
                  )
                ) : (
                  <p className="text-xs text-[#6F6659] italic">
                    Encounter this word in Daily or Arcade modes to unlock.
                  </p>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-[#E2D8C3] flex items-center justify-between">
                {unlocked ? (
                  <>
                    <button
                      type="button"
                      disabled={!isSupported}
                      onClick={() => speak(word.tts)}
                      className="p-1.5 rounded-[8px] hover:bg-[#F4EEE1] text-[#1F1B16] transition-colors cursor-pointer"
                      aria-label={`Hear pronunciation of ${word.word}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    <Link
                      to={`/lexicon/${word.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F1B16] hover:underline"
                    >
                      <span>View entry</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/sound-match"
                    className="text-xs font-semibold text-[#6B5A12] hover:underline flex items-center gap-1"
                  >
                    <span>Play Arcade</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attribution */}
      <div className="pt-4 border-t border-[#E2D8C3] text-xs font-mono-respell text-[#6F6659]">
        {COPY.attribution}
      </div>
    </div>
  );
};
