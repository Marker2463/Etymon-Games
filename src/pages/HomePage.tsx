import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import {
  getLocalDateString,
  getDailyMixNumber,
  getDailyWords,
  getWordOfTheDay,
  formatShareString,
  getMsUntilLocalMidnight,
  formatTimeRemaining,
  calculateScore,
  MIX_ROUNDS,
  ROUND_PLAN,
  MIX_MINUTES_ESTIMATE,
} from '../utils/daily';
import { AdSlot } from '../components/AdSlot';
import { PlayPageTemplate } from '../components/PlayPageTemplate';
import { SoundMatchGame } from '../components/games/SoundMatchGame';
import { TrueOrTrapGame } from '../components/games/TrueOrTrapGame';
import { ImpostorLetterGame } from '../components/games/ImpostorLetterGame';
import { SyllableChopperGame } from '../components/games/SyllableChopperGame';
import {
  Ear,
  HelpCircle,
  Search,
  Scissors,
  Volume2,
  Share2,
  Flame,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import {
  COPY,
  getDailyCompletionHeadline,
  getFeedbackLine,
  getRoundMilestoneFeedback,
} from '../copy';

export const HomePage: React.FC = () => {
  const { state, wordBank, recordDailyRound, completeDailyMix } = useGame();
  const navigate = useNavigate();
  const { speak, isSupported } = useSpeech();

  const todayStr = getLocalDateString();
  const mixNumber = getDailyMixNumber(todayStr);

  const currentMixProgress = state.mixes[todayStr] || {
    results: [],
    completed: false,
    currentRound: 0,
    rounds: MIX_ROUNDS,
  };

  const totalRounds = currentMixProgress.rounds || MIX_ROUNDS;
  const dailyWords = getDailyWords(todayStr, wordBank, currentMixProgress.wordIds);
  const wotd = getWordOfTheDay(todayStr, wordBank);

  const isCompleted = currentMixProgress.completed;
  const inProgressRoundIndex = currentMixProgress.currentRound;

  const [viewState, setViewState] = useState<'landing' | 'playing' | 'completed'>(
    isCompleted ? 'completed' : 'landing'
  );

  const [activeRound, setActiveRound] = useState<number>(
    inProgressRoundIndex < totalRounds ? inProgressRoundIndex : 0
  );
  const [roundResolved, setRoundResolved] = useState<boolean>(false);
  const [roundResult, setRoundResult] = useState<'first' | 'second' | 'miss'>('first');
  const [triesRemaining, setTriesRemaining] = useState<number>(1);
  const [feedbackLine, setFeedbackLine] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Local midnight countdown
  const [msToMidnight, setMsToMidnight] = useState<number>(getMsUntilLocalMidnight());

  useEffect(() => {
    const timer = setInterval(() => {
      setMsToMidnight(getMsUntilLocalMidnight());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentRoundMode = ROUND_PLAN[activeRound] || 'sound';
  const currentMaxTries =
    currentRoundMode === 'impostor' || currentRoundMode === 'chopper' ? 2 : 1;

  useEffect(() => {
    setTriesRemaining(currentMaxTries);
    setRoundResolved(false);
    setFeedbackLine(null);
  }, [activeRound, currentMaxTries]);

  const handleRoundResolved = (result: 'first' | 'second' | 'miss') => {
    setRoundResult(result);
    setRoundResolved(true);

    if (result === 'first' || result === 'second') {
      // Check for milestone feedback lines (round 8 = index 7, round 14 = index 13)
      const milestone = getRoundMilestoneFeedback(activeRound);
      if (milestone) {
        setFeedbackLine(milestone);
      } else {
        setFeedbackLine(getFeedbackLine(result === 'first' ? 1 : 2, state.streak));
      }
    } else {
      setFeedbackLine(null);
    }

    const word = dailyWords[activeRound];
    if (word) {
      recordDailyRound(todayStr, activeRound, result, word.id);
    }
  };

  const handleNextRound = () => {
    if (activeRound + 1 < totalRounds) {
      setActiveRound(activeRound + 1);
    } else {
      completeDailyMix(todayStr);
      setViewState('completed');
    }
  };

  const handleShare = async () => {
    const shareText = formatShareString(mixNumber, currentMixProgress.results, totalRounds);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Etymon Daily No. ${mixNumber}`,
          text: shareText,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareNotice('Copied results to clipboard!');
        setTimeout(() => setShareNotice(null), 3000);
        return;
      } catch {
        // Fallback
      }
    }

    setShareNotice('Sharing unavailable on this device.');
    setTimeout(() => setShareNotice(null), 3000);
  };

  // 1. PLAYING IN-PROGRESS STATE
  if (viewState === 'playing' && !isCompleted) {
    const currentWord = dailyWords[activeRound] || dailyWords[0];
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
        maxTries={currentMaxTries}
        isDaily={true}
        roundNumber={activeRound + 1}
        totalRounds={totalRounds}
        resolved={roundResolved}
        isCorrect={roundResult === 'first' || roundResult === 'second'}
        tryCount={tryCount}
        pointsEarned={points}
        feedbackLine={feedbackLine}
        onNext={handleNextRound}
        nextButtonLabel={activeRound + 1 === totalRounds ? COPY.prompts.seeResults : COPY.prompts.nextWord}
        keyboardHintText={currentModeInfo.hintText}
        aboutText={currentModeInfo.about}
      >
        {currentRoundMode === 'sound' && (
          <SoundMatchGame
            key={`sound-${currentWord.id}-${activeRound}`}
            word={currentWord}
            resolved={roundResolved}
            onResolve={handleRoundResolved}
          />
        )}
        {currentRoundMode === 'trap' && (
          <TrueOrTrapGame
            key={`trap-${currentWord.id}-${activeRound}`}
            word={currentWord}
            resolved={roundResolved}
            onResolve={handleRoundResolved}
          />
        )}
        {currentRoundMode === 'impostor' && (
          <ImpostorLetterGame
            key={`impostor-${currentWord.id}-${activeRound}`}
            word={currentWord}
            resolved={roundResolved}
            onResolve={handleRoundResolved}
            onTriesChange={setTriesRemaining}
          />
        )}
        {currentRoundMode === 'chopper' && (
          <SyllableChopperGame
            key={`chopper-${currentWord.id}-${activeRound}`}
            word={currentWord}
            resolved={roundResolved}
            onResolve={handleRoundResolved}
            onTriesChange={setTriesRemaining}
          />
        )}
      </PlayPageTemplate>
    );
  }

  // 2. COMPLETE RESULTS STATE
  if (viewState === 'completed' || isCompleted) {
    const results = currentMixProgress.results || [];
    const correctCount = results.filter(r => r === 'first' || r === 'second').length;
    const totalPlayed = Object.values(state.mixes).filter(m => m.completed).length;
    const headline = getDailyCompletionHeadline(correctCount, totalRounds);

    return (
      <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
            Daily Mix No. {mixNumber}
          </span>
          <h1 className="text-h1 text-[#1F1B16]">{headline}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Left Column: Results breakdown */}
          <div className="bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2D8C3] gap-4">
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-[#1F1B16]">
                  {correctCount} of {totalRounds} correct
                </span>
                <span className="text-sm text-[#5E564A] font-mono-respell">
                  About {MIX_MINUTES_ESTIMATE} minutes
                </span>
              </div>

              {/* 5x3 Result Grid (3 rows of 5, words in order) */}
              <div
                className="grid grid-cols-5 gap-1.5 self-start sm:self-auto"
                aria-label={`${totalRounds} word results`}
              >
                {results.map((res, i) => (
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

            {/* Visible Legend for Squares */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#5E564A] py-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-[4px] bg-[#DDF5E0] border border-[#2E6B3F]" />
                <span>Correct 1st try</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-[4px] bg-[#F2D46B]/50 border border-[#6B5A12]" />
                <span>Correct 2nd try</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-[4px] bg-[#F4EEE1] border border-[#CFC3AA]" />
                <span>Missed</span>
              </div>
            </div>

            {/* Collapsed <details> titled "Today's words (15)" */}
            <details className="group border border-[#E2D8C3] rounded-[12px] bg-[#F4EEE1]/40 overflow-hidden">
              <summary className="p-4 font-display font-semibold text-base text-[#1F1B16] cursor-pointer flex items-center justify-between select-none hover:bg-[#F4EEE1] transition-colors">
                <span>Today's words ({dailyWords.length})</span>
                <ChevronDown className="w-4 h-4 text-[#5E564A] group-open:rotate-180 transition-transform" />
              </summary>
              <div className="p-4 pt-0 flex flex-col divide-y divide-[#E2D8C3]">
                {dailyWords.map((w, idx) => {
                  const res = results[idx] || 'miss';
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

            {/* Action Buttons: Share & Arcade */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#E2D8C3]">
              <button
                type="button"
                onClick={handleShare}
                className="w-full sm:w-auto flex-1 py-3 px-6 rounded-[12px] bg-[#1F1B16] hover:bg-[#1F1B16]/90 text-[#FDF8EC] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{COPY.daily.shareResult}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/sound-match')}
                className="w-full sm:w-auto flex-1 py-3 px-6 rounded-[12px] bg-[#F4EEE1] hover:bg-[#EBE3D2] border border-[#CFC3AA] text-[#1F1B16] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>{COPY.daily.playArcade}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {shareNotice && (
              <div
                role="status"
                aria-live="polite"
                className="p-2.5 rounded-[8px] bg-[#DDF5E0] text-[#2E6B3F] text-xs font-semibold text-center flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{shareNotice}</span>
              </div>
            )}
          </div>

          {/* Right Column: Streak, Countdown, Stats, Ad */}
          <div className="flex flex-col gap-6 w-full lg:w-[320px]">
            <div className="bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2D8C3]">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#A63A2B] fill-[#A63A2B]" />
                  <span className="font-display font-bold text-lg text-[#1F1B16]">
                    Streak: {state.streak}
                  </span>
                </div>
                <span className="font-mono-respell text-xs text-[#5E564A]">
                  Best: {state.bestStreak}
                </span>
              </div>

              {/* Countdown (ticking each second, aria-hidden) */}
              <div className="flex flex-col items-center py-2 bg-[#F4EEE1] rounded-[12px]">
                <span className="font-mono-respell text-[10px] uppercase tracking-wider text-[#6B5A12] font-semibold">
                  {COPY.daily.nextMixIn}
                </span>
                <span
                  aria-hidden="true"
                  className="font-mono-respell text-2xl font-bold text-[#1F1B16] tracking-widest mt-0.5"
                >
                  {formatTimeRemaining(msToMidnight)}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-[#F4EEE1]/60 rounded-[10px]">
                  <span className="text-xs text-[#5E564A]">Played</span>
                  <div className="font-mono-respell text-lg font-bold text-[#1F1B16]">
                    {totalPlayed}
                  </div>
                </div>
                <div className="p-3 bg-[#F4EEE1]/60 rounded-[10px]">
                  <span className="text-xs text-[#5E564A]">Today</span>
                  <div className="font-mono-respell text-lg font-bold text-[#1F1B16]">
                    {correctCount}/{totalRounds}
                  </div>
                </div>
              </div>
            </div>

            <AdSlot size="300x250" />
          </div>
        </div>
      </div>
    );
  }

  // 3. READY / LANDING STATE
  const arcadeModesList = [
    {
      title: COPY.modes.soundMatch.title,
      path: '/sound-match',
      sub: COPY.modes.soundMatch.subtitle,
      best: state.personalBests['sound-match'] || 0,
      badge: 'Phonetic Pairings',
      tint: 'bg-[#F2D46B]',
      icon: Ear,
    },
    {
      title: COPY.modes.trueOrTrap.title,
      path: '/true-vs-trap',
      sub: COPY.modes.trueOrTrap.subtitle,
      best: state.personalBests['true-vs-trap'] || 0,
      badge: 'Auditory Bluff',
      tint: 'bg-[#A9DDB0]',
      icon: HelpCircle,
    },
    {
      title: COPY.modes.impostorLetter.title,
      path: '/impostor-letter',
      sub: COPY.modes.impostorLetter.subtitle,
      best: state.personalBests['impostor-letter'] || 0,
      badge: 'Silent Letters',
      tint: 'bg-[#B7D4EE]',
      icon: Search,
    },
    {
      title: COPY.modes.syllableChopper.title,
      path: '/syllable-chopper',
      sub: COPY.modes.syllableChopper.subtitle,
      best: state.personalBests['syllable-chopper'] || 0,
      badge: 'Spoken Cadence',
      tint: 'bg-[#F2B8AE]',
      icon: Scissors,
    },
  ];

  return (
    <div className="w-full max-w-[1088px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">
      {/* 1. Daily Mix Main Card */}
      <article className="w-full bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-6 sm:p-10 flex flex-col gap-6 relative overflow-hidden">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono-respell text-xs text-[#6B5A12] uppercase tracking-wider font-semibold">
              {COPY.daily.heroKicker.replace('{n}', String(mixNumber))}
            </span>
            {state.streak === 0 ? (
              <span className="text-xs text-[#5E564A] font-medium">
                Start your streak today
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-[#A63A2B]">
                <Flame className="w-3.5 h-3.5 fill-[#A63A2B]" />
                <span>{state.streak} day streak</span>
              </span>
            )}
          </div>

          <h1 className="text-h1 text-[#1F1B16]">{COPY.daily.heroHeading}</h1>
          <p className="text-base text-[#5E564A]">
            {COPY.daily.heroSub}
          </p>
        </div>

        {/* Four Compact Count Chips (4 Sound Match, 4 True or Trap, 4 Impostor Letter, 3 Syllable Chopper) */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="flex items-center gap-2 p-2.5 rounded-[10px] bg-[#F4EEE1] border border-[#E2D8C3]">
              <span className="w-7 h-7 rounded-[7px] bg-[#F2D46B] text-[#1F1B16] flex items-center justify-center shrink-0">
                <Ear className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-[#1F1B16]">
                4 Sound Match
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-[10px] bg-[#F4EEE1] border border-[#E2D8C3]">
              <span className="w-7 h-7 rounded-[7px] bg-[#A9DDB0] text-[#1F1B16] flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-[#1F1B16]">
                4 True or Trap
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-[10px] bg-[#F4EEE1] border border-[#E2D8C3]">
              <span className="w-7 h-7 rounded-[7px] bg-[#B7D4EE] text-[#1F1B16] flex items-center justify-center shrink-0">
                <Search className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-[#1F1B16]">
                4 Impostor Letter
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-[10px] bg-[#F4EEE1] border border-[#E2D8C3]">
              <span className="w-7 h-7 rounded-[7px] bg-[#F2B8AE] text-[#1F1B16] flex items-center justify-center shrink-0">
                <Scissors className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold text-[#1F1B16]">
                3 Syllable Chopper
              </span>
            </div>
          </div>

          <div className="font-mono-respell text-xs text-[#6F6659]">
            About {MIX_MINUTES_ESTIMATE} minutes
          </div>
        </div>

        {/* Primary Action Button */}
        <div>
          <button
            type="button"
            onClick={() => setViewState(isCompleted ? 'completed' : 'playing')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-[12px] bg-[#1F1B16] hover:bg-[#1F1B16]/90 text-[#FDF8EC] font-display text-base font-semibold transition-all cursor-pointer shadow-xs"
          >
            <span>
              {isCompleted
                ? COPY.prompts.seeResults
                : inProgressRoundIndex > 0
                ? `Continue (word ${inProgressRoundIndex + 1} of ${totalRounds})`
                : COPY.daily.playButton}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </article>

      {/* 2. Compact Word of the Day Card */}
      <section
        id="wotd"
        className="w-full bg-[#FFFFFF] rounded-[16px] border border-[#E2D8C3] shadow-etymon p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex flex-col gap-1">
          <span className="font-mono-respell text-[11px] text-[#6B5A12] uppercase tracking-wider font-semibold">
            WORD OF THE DAY
          </span>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h3 className="font-display text-2xl font-bold text-[#1F1B16] capitalize">
              {wotd.word}
            </h3>
            <span className="font-mono-respell font-bold text-sm text-[#6B5A12]">
              {wotd.respelling}
            </span>
            {wotd.ipa && (
              <span className="font-serif italic text-xs text-[#5E564A]">
                {wotd.ipa}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            disabled={!isSupported}
            onClick={() => speak(wotd.tts)}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-[10px] bg-[#F4EEE1] hover:bg-[#EBE3D2] text-xs font-semibold text-[#1F1B16] transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#1F1B16]" />
            <span>Hear</span>
          </button>

          <Link
            to={`/lexicon/${wotd.id}`}
            className="inline-flex items-center gap-1 py-2 px-3 rounded-[10px] bg-[#1F1B16] text-[#FDF8EC] text-xs font-semibold hover:bg-[#1F1B16]/90 transition-colors"
          >
            <span>See in Lexicon</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </section>

      {/* 3. Arcade Modes Cards */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-[#1F1B16]">Arcade Modes</h2>
          <span className="text-xs text-[#5E564A]">Endless practice</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {arcadeModesList.map(m => {
            const Icon = m.icon;
            return (
              <Link
                key={m.path}
                to={m.path}
                className="p-6 rounded-[16px] bg-[#FFFFFF] border border-[#E2D8C3] shadow-etymon hover:border-[#1F1B16] flex flex-col justify-between gap-4 transition-all group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-10 h-10 rounded-[10px] ${m.tint} text-[#1F1B16] flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="font-mono-respell text-[10px] uppercase tracking-wider text-[#6B5A12] font-semibold bg-[#F4EEE1] px-2 py-0.5 rounded-[4px]">
                      {m.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-bold text-[#1F1B16] group-hover:underline">
                      {m.title}
                    </h3>
                    <p className="text-xs text-[#5E564A] mt-1 leading-relaxed">
                      {m.sub}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E2D8C3] text-xs">
                  <span className="font-mono-respell text-[#5E564A]">
                    Best: <strong className="text-[#1F1B16]">{m.best}</strong>
                  </span>
                  <span className="font-semibold text-[#1F1B16] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Play <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Editorial & About Mission Banner */}
      <section className="p-6 sm:p-8 rounded-[16px] bg-[#F4EEE1] border border-[#E2D8C3] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5 max-w-xl">
          <h2 className="font-display text-xl font-bold text-[#1F1B16]">
            About Etymon
          </h2>
          <p className="text-sm text-[#5E564A] leading-relaxed">
            English spelling was codified centuries ago, but pronunciation never stopped evolving. Etymon puzzles test your ear against modern spoken English across 1 daily round of 15 words.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/how-it-works"
            className="py-2.5 px-4 rounded-[10px] bg-[#FFFFFF] border border-[#CFC3AA] text-xs font-semibold text-[#1F1B16] hover:bg-[#EBE3D2] transition-colors"
          >
            How it works
          </Link>
          <Link
            to="/editorial-standards"
            className="py-2.5 px-4 rounded-[10px] bg-[#1F1B16] text-[#FDF8EC] text-xs font-semibold hover:bg-[#1F1B16]/90 transition-colors"
          >
            Editorial standards
          </Link>
        </div>
      </section>
    </div>
  );
};
