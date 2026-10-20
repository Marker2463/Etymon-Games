import { WordItem, GameModeType } from '../data/words';
import { getPoolForMode, PoolName } from '../config/dailyConfig';

export const ARCADE_SEEN_STORAGE_KEY = 'etymon:seen:v1';
export const ARCADE_ACTIVE_STORAGE_KEY = 'etymon:arcade:active:v1';
export const TRAP_VARIANTS_STORAGE_KEY = 'etymon:trap:variants:v1';

export interface PoolLedger {
  seen: string[];
  recent: string[];
}

export type ArcadeLedgerState = Record<PoolName, PoolLedger>;

const DEFAULT_LEDGER: ArcadeLedgerState = {
  pronunciation: { seen: [], recent: [] },
  impostor: { seen: [], recent: [] },
  chopper: { seen: [], recent: [] },
};

export function loadArcadeLedger(): ArcadeLedgerState {
  try {
    const raw = localStorage.getItem(ARCADE_SEEN_STORAGE_KEY);
    if (!raw) return DEFAULT_LEDGER;
    const parsed = JSON.parse(raw);
    return {
      pronunciation: parsed.pronunciation || { seen: [], recent: [] },
      impostor: parsed.impostor || { seen: [], recent: [] },
      chopper: parsed.chopper || { seen: [], recent: [] },
    };
  } catch {
    return DEFAULT_LEDGER;
  }
}

export function saveArcadeLedger(ledger: ArcadeLedgerState): void {
  try {
    localStorage.setItem(ARCADE_SEEN_STORAGE_KEY, JSON.stringify(ledger));
  } catch {
    // Ignore quota errors
  }
}

/**
 * Mark a word as seen in the arcade ledger when ANSWERED, not when shown.
 */
export function markArcadeWordSeen(mode: GameModeType, wordId: string): void {
  const pool = getPoolForMode(mode);
  const ledger = loadArcadeLedger();
  const poolData = ledger[pool] || { seen: [], recent: [] };

  if (!poolData.seen.includes(wordId)) {
    poolData.seen.push(wordId);
  }

  poolData.recent.push(wordId);
  if (poolData.recent.length > 10) {
    poolData.recent.shift();
  }

  ledger[pool] = poolData;
  saveArcadeLedger(ledger);
}

/**
 * Persists the currently active word for an arcade mode so refresh resumes it
 */
export function getSavedActiveArcadeWordId(modeSlug: string): string | null {
  try {
    const raw = localStorage.getItem(ARCADE_ACTIVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed[modeSlug] || null;
  } catch {
    return null;
  }
}

export function setSavedActiveArcadeWordId(modeSlug: string, wordId: string): void {
  try {
    const raw = localStorage.getItem(ARCADE_ACTIVE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[modeSlug] = wordId;
    localStorage.setItem(ARCADE_ACTIVE_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore quota errors
  }
}

/**
 * True or Trap variant memory:
 * remembers which variant ('correct' | 'wrong') was last shown for a word
 */
export function getLastTrapVariant(wordId: string): 'correct' | 'wrong' | null {
  try {
    const raw = localStorage.getItem(TRAP_VARIANTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed[wordId] || null;
  } catch {
    return null;
  }
}

export function setLastTrapVariant(wordId: string, variant: 'correct' | 'wrong'): void {
  try {
    const raw = localStorage.getItem(TRAP_VARIANTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[wordId] = variant;
    localStorage.setItem(TRAP_VARIANTS_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore quota errors
  }
}

/**
 * Pick next arcade word:
 * - Eligible = words for this mode
 * - Minus seen, minus recent(10)
 * - Minus today's Daily Mix words while alternatives exist
 * - Difficulty ramp (streak < 5: 1; streak < 10: 2; else 3). If window empty, widen upward first.
 * - If exhausted, reset seen to last K = min(10, floor(eligible/3)) words
 */
export function pickNextArcadeWord(
  mode: GameModeType,
  allModeWords: WordItem[],
  streak: number,
  todayDailyWordIds: string[] = []
): WordItem {
  if (allModeWords.length === 0) {
    throw new Error(`No words available for arcade mode: ${mode}`);
  }

  const pool = getPoolForMode(mode);
  let ledger = loadArcadeLedger();
  let poolData = ledger[pool];

  const targetDifficulty = streak >= 10 ? 3 : streak >= 5 ? 2 : 1;

  const getFilteredCandidates = (seenList: string[], recentList: string[], excludeDaily: boolean) => {
    let pool = allModeWords.filter(w => !seenList.includes(w.id) && !recentList.includes(w.id));
    if (excludeDaily) {
      const withoutDaily = pool.filter(w => !todayDailyWordIds.includes(w.id));
      if (withoutDaily.length > 0) {
        pool = withoutDaily;
      }
    }

    // Try target difficulty
    let matching = pool.filter(w => w.difficulty === targetDifficulty);
    if (matching.length > 0) return matching;

    // Widen upward first
    matching = pool.filter(w => w.difficulty >= targetDifficulty);
    if (matching.length > 0) return matching;

    // Otherwise any remaining in pool
    return pool;
  };

  let candidates = getFilteredCandidates(poolData.seen, poolData.recent, true);

  // If nothing found, try allowing recent
  if (candidates.length === 0) {
    candidates = getFilteredCandidates(poolData.seen, [], true);
  }

  // If still exhausted, reset seen to last K words
  if (candidates.length === 0) {
    const K = Math.min(10, Math.floor(allModeWords.length / 3));
    const keptSeen = poolData.seen.slice(-K);
    poolData.seen = keptSeen;
    ledger[pool] = poolData;
    saveArcadeLedger(ledger);

    candidates = getFilteredCandidates(keptSeen, [], true);
    if (candidates.length === 0) {
      candidates = allModeWords;
    }
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] || allModeWords[0];
}
