import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import {
  getDailyMixNumber,
  getDailyWords,
  calculateScore,
  MIX_ROUNDS,
  ROUND_PLAN,
} from '../utils/daily';
import { PlayPageTemplate } from '../components/PlayPageTemplate';
import { SoundMatchGame } from '../components/games/SoundMatchGame';
import { TrueOrTrapGame } from '../components/games/TrueOrTrapGame';
import { ImpostorLetterGame } from '../components/games/ImpostorLetterGame';
import { SyllableChopperGame } from '../components/games/SyllableChopperGame';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { COPY, getFeedbackLine, getRoundMilestoneFeedback } from '../copy';

export const ArchivePlayPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const { wordBank, unlockWord, state } = useGame();

  const targetDate = date || '2026-01-01';
  const mixNumber = getDailyMixNumber(targetDate);
  const savedMix = state.mixes[targetDate];
  const words = getDailyWords(targetDate, wordBank, savedMix?.wordIds);
  const totalRounds = savedMix?.rounds || words.length || MIX_ROUNDS;

  const [activeRound, setActiveRound] = useState<number>(0);
  const [resolved, setResolved] = useState<boolean>(false);
  const [roundResult, setRoundResult] = useState<'first' | 'second' | 'miss'>('first');
  const [feedbackLine, setFeedbackLine] = useState<string | null>(null);
  const [sessionResults, setSessionResults] = useState<('first' | 'second' | 'miss')[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentRoundMode = ROUND_PLAN[activeRound] || 'sound';
  const maxTries =
    currentRoundMode === 'impostor' || currentRoundMode === 'chopper' ? 2 : 1;
  const [triesRemaining, setTriesRemaining] = useState<number>(maxTries);

  useEffect(() => {
    setTriesRemaining(maxTries);
    setResolved(false);
    setFeedbackLine(null);
  }, [activeRound, maxTries]);

  const handleResolve = (result: 'first' | 'second' | 'miss') => {
    setRoundResult(result);
    setResolved(true);

    if (result === 'first' || result === 'second') {
      const milestone = getRoundMilestoneFeedback(activeRound);
      if (milestone) {
        setFeedbackLine(milestone);
      } else {
        setFeedbackLine(getFeedbackLine(result === 'first' ? 1 : 2, 0));
      }
    } else {
      setFeedbackLine(null);
    }

    const updated = [...sessionResults];
    updated[activeRound] = result;
    setSessionResults(updated);

    const word = words[activeRound];
    if (word) {
      unlockWord(word.id);
    }
  };

  const handleNext = () => {
    if (activeRound + 1 < totalRounds) {
      setActiveRound(activeRound + 1);
    } else {
      setIsCompleted(true);
    }
  };

  if (isCompleted) {
    const correctCount = sessionResults.filter(r => r === 'first' || r === 'second').length;

    return (
      <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <nav aria-label="Breadcrumb" className="text-xs text-[#5E564A] font-medium flex items-center gap-1.5">
            <Link to="/archive" className="hover:text-[#1F1B16] transition-colors">
              Archive
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#1F1B16] font-semibold">{targetDate}</span>
          </nav>
          <h1 className="text-h1 text-[#1F1B16]">
            Archive Mix No. {mixNumber} Complete
          </h1>
        </div>

        <div className="bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2D8C3] gap-4">
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold text-[#1F1B16]">
                {correctCount} of {totalRounds} correct
              </span>
              <span className="text-xs text-[#5E564A]">
                Archive mode (does not affect active streak)
              </span>
            </div>

            {/* Result Grid */}
            <div
              className="grid grid-cols-5 gap-1.5 self-start sm:self-auto"
              aria-label={`${totalRounds} word results`}
            >
              {sessionResults.map((res, i) => (
                <div
                  key={i}
                  aria-label={`Word ${i + 1}: ${
                    res === 'first'
                      ? 'Correct 1st try'
                      : res === 'second'
                      ? 'Correct 2nd try'
                      : 'Missed'
                  }`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[6px] flex items-center justify-center font-bold text-xs ${
                    res === 'first'
                      ? 'bg-[#DDF5E0] border-2 border-[#2E6B3F] text-[#2E6B3F]'
                      : res === 'second'
                      ? 'bg-[#F2D46B]/50 border-2 border-[#6B5A12] text-[#6B5A12]'
                      : 'bg-[#F4EEE1] border-2 border-[#CFC3AA] text-[#6F6659]'
                  }`}
                >
                  {res === 'first' ? '1' : res === 'second' ? '2' : 'X'}
                </div>
              ))}
            </div>
          </div>

          {/* Collapsed <details> for words */}
          <details className="group border border-[#E2D8C3] rounded-[12px] bg-[#F4EEE1]/40 overflow-hidden">
            <summary className="p-4 font-display font-semibold text-base text-[#1F1B16] cursor-pointer flex items-center justify-between select-none hover:bg-[#F4EEE1] transition-colors">
              <span>Archive words ({words.length})</span>
              <ChevronDown className="w-4 h-4 text-[#5E564A] group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 pt-0 flex flex-col divide-y divide-[#E2D8C3]">
              {words.map((w, idx) => {
                const res = sessionResults[idx] || 'miss';
                return (
                  <Link
                    key={w.id}
                    to={`/lexicon/${w.id}`}
                    className="py-3 flex items-center justify-between group/link hover:bg-[#F4EEE1] px-2 rounded-[8px] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono-respell text-xs text-[#6B5A12] w-6">
                        R{idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-display font-semibold text-base text-[#1F1B16] capitalize group-hover/link:underline">
                          {w.word}
                        </span>
                        <span className="font-mono-respell text-xs text-[#5E564A]">
                          {w.respelling} {w.ipa && `· ${w.ipa}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#5E564A] capitalize">
                        {res === 'first' ? '1st try' : res === 'second' ? '2nd try' : 'Missed'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#5E564A] group-hover/link:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </details>

          <div className="pt-4 border-t border-[#E2D8C3] flex items-center gap-4">
            <Link
              to="/archive"
              className="py-2.5 px-4 rounded-[10px] bg-[#1F1B16] text-[#FDF8EC] text-xs font-semibold transition-colors"
            >
              Back to Archive
            </Link>
            <Link
              to="/"
              className="py-2.5 px-4 rounded-[10px] bg-[#F4EEE1] hover:bg-[#EBE3D2] text-[#1F1B16] text-xs font-semibold transition-colors"
            >
              Play Today's Mix
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentWord = words[activeRound] || words[0];
  const modeKey =
    currentRoundMode === 'sound'
      ? 'soundMatch'
      : currentRoundMode === 'trap'
      ? 'trueOrTrap'
      : currentRoundMode === 'impostor'
      ? 'impostorLetter'
      : 'syllableChopper';
  const currentModeInfo = COPY.modes[modeKey];
  const points = calculateScore(roundResult);
  const tryCount: 1 | 2 = roundResult === 'second' ? 2 : 1;

  return (
    <PlayPageTemplate
      modeTitle={currentModeInfo.title}
      modeSubtitle={currentModeInfo.subtitle}
      currentWord={currentWord}
      triesRemaining={triesRemaining}
      maxTries={maxTries}
      isDaily={true}
      roundNumber={activeRound + 1}
      totalRounds={totalRounds}
      resolved={resolved}
      isCorrect={roundResult === 'first' || roundResult === 'second'}
      tryCount={tryCount}
      pointsEarned={points}
      feedbackLine={feedbackLine}
      onNext={handleNext}
      nextButtonLabel={activeRound + 1 === totalRounds ? COPY.prompts.seeResults : COPY.prompts.nextWord}
      keyboardHintText={currentModeInfo.hintText}
      aboutText={currentModeInfo.about}
    >
      {currentRoundMode === 'sound' && (
        <SoundMatchGame
          key={`sound-${currentWord.id}-${activeRound}`}
          word={currentWord}
          resolved={resolved}
          onResolve={handleResolve}
        />
      )}
      {currentRoundMode === 'trap' && (
        <TrueOrTrapGame
          key={`trap-${currentWord.id}-${activeRound}`}
          word={currentWord}
          resolved={resolved}
          onResolve={handleResolve}
        />
      )}
      {currentRoundMode === 'impostor' && (
        <ImpostorLetterGame
          key={`impostor-${currentWord.id}-${activeRound}`}
          word={currentWord}
          resolved={resolved}
          onResolve={handleResolve}
          onTriesChange={setTriesRemaining}
        />
      )}
      {currentRoundMode === 'chopper' && (
        <SyllableChopperGame
          key={`chopper-${currentWord.id}-${activeRound}`}
          word={currentWord}
          resolved={resolved}
          onResolve={handleResolve}
          onTriesChange={setTriesRemaining}
        />
      )}
    </PlayPageTemplate>
  );
};
