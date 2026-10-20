import React, { useState, useMemo, useEffect } from 'react';
import { WordItem } from '../data/words';
import { useGame } from '../context/GameContext';
import { PlayPageTemplate } from '../components/PlayPageTemplate';
import { SoundMatchGame } from '../components/games/SoundMatchGame';
import { TrueOrTrapGame } from '../components/games/TrueOrTrapGame';
import { ImpostorLetterGame } from '../components/games/ImpostorLetterGame';
import { SyllableChopperGame } from '../components/games/SyllableChopperGame';
import { prefetchWords } from '../services/dictionary';
import { getFeedbackLine } from '../copy';
import { calculateScore, getLocalDateString } from '../utils/daily';
import {
  pickNextArcadeWord,
  markArcadeWordSeen,
  getSavedActiveArcadeWordId,
  setSavedActiveArcadeWordId,
} from '../utils/arcade';

interface ArcadeGamePageProps {
  mode: 'sound' | 'trap' | 'impostor' | 'chopper';
  modeTitle: string;
  modeSlug: string;
  modeSubtitle: string;
  keyboardHintText: string;
  aboutText: string;
}

export const ArcadeGamePage: React.FC<ArcadeGamePageProps> = ({
  mode,
  modeTitle,
  modeSlug,
  modeSubtitle,
  keyboardHintText,
  aboutText,
}) => {
  const { state, wordBank, recordArcadeStreak } = useGame();

  const [sessionStreak, setSessionStreak] = useState<number>(0);
  const [resolved, setResolved] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<'first' | 'second' | 'miss'>('first');
  const [feedbackLine, setFeedbackLine] = useState<string | null>(null);

  const eligibleWords = useMemo(() => {
    return wordBank.filter(w => w.modes.includes(mode));
  }, [wordBank, mode]);

  const todayStr = getLocalDateString();
  const todayDailyWordIds = state.mixes[todayStr]?.wordIds || [];

  // Resume the persisted active arcade word on reload or pick initial
  const [currentWord, setCurrentWord] = useState<WordItem>(() => {
    const savedId = getSavedActiveArcadeWordId(modeSlug);
    if (savedId) {
      const found = eligibleWords.find(w => w.id === savedId);
      if (found) return found;
    }
    const initial = pickNextArcadeWord(mode, eligibleWords, 0, todayDailyWordIds);
    setSavedActiveArcadeWordId(modeSlug, initial.id);
    return initial;
  });

  const maxTries = mode === 'impostor' || mode === 'chopper' ? 2 : 1;
  const [triesRemaining, setTriesRemaining] = useState<number>(maxTries);

  // Prefetch next 3 arcade words
  useEffect(() => {
    const nextCandidates = eligibleWords
      .filter(w => w.id !== currentWord.id)
      .slice(0, 3)
      .map(w => w.word);
    prefetchWords(nextCandidates);
  }, [currentWord.id, eligibleWords]);

  const handleResolve = (result: 'first' | 'second' | 'miss') => {
    const correct = result === 'first' || result === 'second';
    setIsCorrect(correct);
    setLastResult(result);
    setResolved(true);

    // Mark seen in the arcade ledger when ANSWERED, not when shown
    markArcadeWordSeen(mode, currentWord.id);

    if (correct) {
      const newStreak = sessionStreak + 1;
      setSessionStreak(newStreak);
      setFeedbackLine(getFeedbackLine(result === 'first' ? 1 : 2, newStreak));
      recordArcadeStreak(modeSlug, newStreak, currentWord.id);
    } else {
      setFeedbackLine(null);
      setSessionStreak(0);
      recordArcadeStreak(modeSlug, sessionStreak, currentWord.id);
    }
  };

  const handleNextWord = () => {
    const nextWord = pickNextArcadeWord(mode, eligibleWords, sessionStreak, todayDailyWordIds);
    setSavedActiveArcadeWordId(modeSlug, nextWord.id);
    setCurrentWord(nextWord);
    setResolved(false);
    setIsCorrect(false);
    setFeedbackLine(null);
    setTriesRemaining(maxTries);
  };

  const pointsEarned = calculateScore(lastResult);
  const tryCount: 1 | 2 = lastResult === 'second' ? 2 : 1;

  return (
    <PlayPageTemplate
      modeTitle={modeTitle}
      modeSubtitle={modeSubtitle}
      currentWord={currentWord}
      triesRemaining={triesRemaining}
      maxTries={maxTries}
      isDaily={false}
      arcadeStreak={sessionStreak}
      resolved={resolved}
      isCorrect={isCorrect}
      tryCount={tryCount}
      pointsEarned={pointsEarned}
      feedbackLine={feedbackLine}
      onNext={handleNextWord}
      nextButtonLabel="Next word"
      keyboardHintText={keyboardHintText}
      aboutText={aboutText}
    >
      {mode === 'sound' && (
        <SoundMatchGame
          key={`sound-${currentWord.id}`}
          word={currentWord}
          resolved={resolved}
          onResolve={handleResolve}
        />
      )}
      {mode === 'trap' && (
        <TrueOrTrapGame
          key={`trap-${currentWord.id}`}
          word={currentWord}
          resolved={resolved}
          onResolve={handleResolve}
        />
      )}
      {mode === 'impostor' && (
        <ImpostorLetterGame
          key={`impostor-${currentWord.id}`}
          word={currentWord}
          resolved={resolved}
          onResolve={handleResolve}
          onTriesChange={setTriesRemaining}
        />
      )}
      {mode === 'chopper' && (
        <SyllableChopperGame
          key={`chopper-${currentWord.id}`}
          word={currentWord}
          resolved={resolved}
          onResolve={handleResolve}
          onTriesChange={setTriesRemaining}
        />
      )}
    </PlayPageTemplate>
  );
};
