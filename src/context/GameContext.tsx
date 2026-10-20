import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import {
  calculateNewStreak,
  getLocalDateString,
  getWordOfTheDay,
  loadWordBank,
  getDailyWords,
  MIX_ROUNDS,
  STREAK_MIN_ROUNDS,
  logPoolStats,
} from '../utils/daily';
import { SEED_WORDS, WordItem } from '../data/words';
import { prefetchWords } from '../services/dictionary';

export interface GameSettings {
  sound: boolean;
  slowSpeech: boolean;
  keyboardShortcuts: boolean;
  haptics: boolean;
}

export interface DailyMixProgress {
  results: ('first' | 'second' | 'miss')[];
  completed: boolean;
  currentRound: number;
  wordIds?: string[];
  rounds: number; // Stored round count for this mix (15 for v2, 4 for legacy)
}

export interface GameState {
  version: number;
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  mixes: Record<string, DailyMixProgress>;
  unlockedWordIds: string[];
  personalBests: Record<string, number>;
  settings: GameSettings;
}

const STORAGE_KEY = 'etymon:v1';

const DEFAULT_STATE: GameState = {
  version: 2,
  streak: 0,
  bestStreak: 0,
  lastCompletedDate: null,
  mixes: {},
  unlockedWordIds: [],
  personalBests: {
    'sound-match': 0,
    'true-vs-trap': 0,
    'impostor-letter': 0,
    'syllable-chopper': 0,
  },
  settings: {
    sound: true,
    slowSpeech: false,
    keyboardShortcuts: true,
    haptics: true,
  },
};

type Action =
  | { type: 'LOAD_STATE'; payload: GameState }
  | { type: 'INIT_DAILY_MIX'; payload: { dateStr: string; wordIds: string[]; rounds?: number } }
  | {
      type: 'RECORD_DAILY_ROUND';
      payload: {
        dateStr: string;
        roundIndex: number;
        result: 'first' | 'second' | 'miss';
        wordId: string;
      };
    }
  | { type: 'COMPLETE_DAILY_MIX'; payload: { dateStr: string } }
  | {
      type: 'RECORD_ARCADE_STREAK';
      payload: { mode: string; streak: number; wordId: string };
    }
  | { type: 'UNLOCK_WORD'; payload: { wordId: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'RESET_DATA' };

function loadSavedState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (parsed) {
      // Migrate mixes to schema v2: each mix stores its own rounds count
      const migratedMixes: Record<string, DailyMixProgress> = {};
      if (parsed.mixes) {
        for (const [date, mix] of Object.entries(parsed.mixes as Record<string, any>)) {
          const storedRounds =
            mix.rounds ||
            (mix.wordIds ? mix.wordIds.length : mix.results ? mix.results.length : 4);
          migratedMixes[date] = {
            ...mix,
            rounds: storedRounds,
          };
        }
      }

      return {
        ...DEFAULT_STATE,
        ...parsed,
        version: 2,
        mixes: migratedMixes,
        settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
        personalBests: { ...DEFAULT_STATE.personalBests, ...(parsed.personalBests || {}) },
      };
    }
  } catch (e) {
    console.warn('Etymon: localStorage read failed, falling back to memory', e);
  }
  return DEFAULT_STATE;
}

function persistState(state: GameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Etymon: localStorage write failed', e);
  }
}

function gameReducer(state: GameState, action: Action): GameState {
  let newState: GameState = state;

  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'INIT_DAILY_MIX': {
      const { dateStr, wordIds, rounds = MIX_ROUNDS } = action.payload;
      const existing = state.mixes[dateStr];
      if (existing && existing.wordIds && existing.wordIds.length === (existing.rounds || wordIds.length)) {
        return state;
      }
      newState = {
        ...state,
        mixes: {
          ...state.mixes,
          [dateStr]: {
            results: existing?.results || [],
            completed: existing?.completed || false,
            currentRound: existing?.currentRound || 0,
            wordIds,
            rounds: existing?.rounds || rounds,
          },
        },
      };
      break;
    }

    case 'RECORD_DAILY_ROUND': {
      const { dateStr, roundIndex, result, wordId } = action.payload;
      const currentMix = state.mixes[dateStr] || {
        results: [],
        completed: false,
        currentRound: 0,
        rounds: MIX_ROUNDS,
      };

      const updatedResults = [...currentMix.results];
      updatedResults[roundIndex] = result;

      const updatedUnlocked = state.unlockedWordIds.includes(wordId)
        ? state.unlockedWordIds
        : [...state.unlockedWordIds, wordId];

      newState = {
        ...state,
        unlockedWordIds: updatedUnlocked,
        mixes: {
          ...state.mixes,
          [dateStr]: {
            ...currentMix,
            results: updatedResults,
            currentRound: roundIndex + 1,
            rounds: currentMix.rounds || MIX_ROUNDS,
          },
        },
      };
      break;
    }

    case 'COMPLETE_DAILY_MIX': {
      const { dateStr } = action.payload;
      const currentMix = state.mixes[dateStr];
      if (!currentMix) return state;

      const totalRounds = currentMix.rounds || (currentMix.wordIds ? currentMix.wordIds.length : MIX_ROUNDS);
      const qualifiesForStreak = totalRounds >= STREAK_MIN_ROUNDS || totalRounds === 4;

      let newStreak = state.streak;
      let newBestStreak = state.bestStreak;
      let newLastCompletedDate = state.lastCompletedDate;

      if (qualifiesForStreak) {
        const streakResult = calculateNewStreak(
          state.streak,
          state.lastCompletedDate,
          dateStr
        );
        newStreak = streakResult.streak;
        newBestStreak = Math.max(state.bestStreak, newStreak);
        if (streakResult.isNewDay) {
          newLastCompletedDate = dateStr;
        }
      }

      newState = {
        ...state,
        streak: newStreak,
        bestStreak: newBestStreak,
        lastCompletedDate: newLastCompletedDate,
        mixes: {
          ...state.mixes,
          [dateStr]: {
            ...currentMix,
            completed: true,
          },
        },
      };
      break;
    }

    case 'RECORD_ARCADE_STREAK': {
      const { mode, streak, wordId } = action.payload;
      const currentBest = state.personalBests[mode] || 0;
      const newBest = Math.max(currentBest, streak);

      const updatedUnlocked = state.unlockedWordIds.includes(wordId)
        ? state.unlockedWordIds
        : [...state.unlockedWordIds, wordId];

      newState = {
        ...state,
        personalBests: {
          ...state.personalBests,
          [mode]: newBest,
        },
        unlockedWordIds: updatedUnlocked,
      };
      break;
    }

    case 'UNLOCK_WORD': {
      if (state.unlockedWordIds.includes(action.payload.wordId)) return state;
      newState = {
        ...state,
        unlockedWordIds: [...state.unlockedWordIds, action.payload.wordId],
      };
      break;
    }

    case 'UPDATE_SETTINGS': {
      newState = {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
      break;
    }

    case 'RESET_DATA': {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn('Etymon: error removing key', e);
      }
      return DEFAULT_STATE;
    }

    default:
      return state;
  }

  persistState(newState);
  return newState;
}

interface GameContextType {
  state: GameState;
  wordBank: WordItem[];
  recordDailyRound: (
    dateStr: string,
    roundIndex: number,
    result: 'first' | 'second' | 'miss',
    wordId: string
  ) => void;
  initDailyMix: (dateStr: string, wordIds: string[], rounds?: number) => void;
  completeDailyMix: (dateStr: string) => void;
  recordArcadeStreak: (mode: string, streak: number, wordId: string) => void;
  unlockWord: (wordId: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetAllData: () => void;
  isWordUnlocked: (wordId: string) => boolean;
  triggerHaptic: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, DEFAULT_STATE, loadSavedState);
  const [wordBank, setWordBank] = useState<WordItem[]>(SEED_WORDS);

  // Load word bank from URL -> localStorage cache -> seed
  useEffect(() => {
    loadWordBank().then(bank => {
      setWordBank(bank);
      logPoolStats(bank);
    });
  }, []);

  // Pre-initialize and prefetch Daily Mix
  useEffect(() => {
    const today = getLocalDateString();
    const existingMix = state.mixes[today];
    const words = getDailyWords(today, wordBank, existingMix?.wordIds);
    const wordIds = words.map(w => w.id);

    if (!existingMix || !existingMix.wordIds) {
      dispatch({
        type: 'INIT_DAILY_MIX',
        payload: { dateStr: today, wordIds, rounds: MIX_ROUNDS },
      });
    }

    // Prefetch dictionary entries for the daily words
    prefetchWords(words.map(w => w.word));
  }, [wordBank]);

  // Always ensure today's Word of the Day is unlocked automatically
  useEffect(() => {
    const today = getLocalDateString();
    const wotd = getWordOfTheDay(today, wordBank);
    if (wotd && !state.unlockedWordIds.includes(wotd.id)) {
      dispatch({ type: 'UNLOCK_WORD', payload: { wordId: wotd.id } });
    }
  }, [state.unlockedWordIds, wordBank]);

  const recordDailyRound = (
    dateStr: string,
    roundIndex: number,
    result: 'first' | 'second' | 'miss',
    wordId: string
  ) => {
    dispatch({ type: 'RECORD_DAILY_ROUND', payload: { dateStr, roundIndex, result, wordId } });
  };

  const initDailyMix = (dateStr: string, wordIds: string[], rounds?: number) => {
    dispatch({ type: 'INIT_DAILY_MIX', payload: { dateStr, wordIds, rounds } });
  };

  const completeDailyMix = (dateStr: string) => {
    dispatch({ type: 'COMPLETE_DAILY_MIX', payload: { dateStr } });
  };

  const recordArcadeStreak = (mode: string, streak: number, wordId: string) => {
    dispatch({ type: 'RECORD_ARCADE_STREAK', payload: { mode, streak, wordId } });
  };

  const unlockWord = (wordId: string) => {
    dispatch({ type: 'UNLOCK_WORD', payload: { wordId } });
  };

  const updateSettings = (settings: Partial<GameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const resetAllData = () => {
    dispatch({ type: 'RESET_DATA' });
  };

  const isWordUnlocked = (wordId: string): boolean => {
    const today = getLocalDateString();
    const wotd = getWordOfTheDay(today, wordBank);
    return wordId === wotd?.id || state.unlockedWordIds.includes(wordId);
  };

  const triggerHaptic = () => {
    if (state.settings.haptics && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore haptic failures
      }
    }
  };

  return (
    <GameContext.Provider
      value={{
        state,
        wordBank,
        recordDailyRound,
        initDailyMix,
        completeDailyMix,
        recordArcadeStreak,
        unlockWord,
        updateSettings,
        resetAllData,
        isWordUnlocked,
        triggerHaptic,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
