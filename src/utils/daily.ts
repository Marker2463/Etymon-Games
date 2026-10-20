import {
  SEED_WORDS,
  WordItem,
  WORD_BANK_URL,
  validateWordBank,
  GameModeType,
} from '../data/words';
import {
  MIX_ROUNDS,
  ROUND_PLAN,
  MIX_MINUTES_ESTIMATE,
  STREAK_MIN_ROUNDS,
  LAUNCH_DATE,
  getPoolForMode,
  getPicksPerDayPerPool,
  PoolName,
} from '../config/dailyConfig';

export {
  MIX_ROUNDS,
  ROUND_PLAN,
  MIX_MINUTES_ESTIMATE,
  STREAK_MIN_ROUNDS,
  LAUNCH_DATE,
};

export const SITE_URL = 'https://etymon.app';
export const BANK_CACHE_KEY = 'etymon:bank:v1';

/**
 * 32-bit Murmur-like string hash
 */
export function stringHash(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/**
 * Mulberry32 seeded Pseudo-Random Number Generator
 */
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Formats a Date object to local YYYY-MM-DD
 */
export function getLocalDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Computes Daily Mix number from launch date
 */
export function getDailyMixNumber(dateStr: string): number {
  const start = new Date(LAUNCH_DATE + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/**
 * Merge word lists by id (entries in b override entries in a)
 */
export function mergeWordBanks(base: WordItem[], overrides: WordItem[]): WordItem[] {
  const map = new Map<string, WordItem>();
  for (const item of base) {
    map.set(item.id, item);
  }
  for (const item of overrides) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

/**
 * Load word bank with fallback order:
 * 1. Fetch remote (4s timeout) -> merge with seed (remote wins) -> save to localStorage cache
 * 2. Cached in localStorage "etymon:bank:v1"
 * 3. Bundled SEED_WORDS
 */
export async function loadWordBank(remoteUrl = WORD_BANK_URL): Promise<WordItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(remoteUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const validated = validateWordBank(json);
      if (validated.length > 0) {
        const merged = mergeWordBanks(SEED_WORDS, validated);
        try {
          localStorage.setItem(BANK_CACHE_KEY, JSON.stringify(merged));
        } catch {
          // Ignore quota errors
        }
        return merged;
      }
    }
  } catch {
    // Fall through to cached or seed
  }

  try {
    const cached = localStorage.getItem(BANK_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const validated = validateWordBank(parsed);
      if (validated.length > 0) {
        return mergeWordBanks(SEED_WORDS, validated);
      }
    }
  } catch {
    // Ignore parse errors
  }

  return SEED_WORDS;
}

/**
 * Checks if a word belongs to a given pool
 */
export function isWordInPool(word: WordItem, poolName: PoolName): boolean {
  if (poolName === 'pronunciation') {
    return word.modes.includes('sound') || word.modes.includes('trap');
  }
  return word.modes.includes(poolName);
}

// Memoization cache for daily simulation by bank length & requested date
const dailyReplayCache = new Map<string, WordItem[]>();

/**
 * Deterministic Daily Mix selection:
 * - If savedWordIds is provided and complete, retrieve those exact words
 * - Replays from LAUNCH_DATE to target date in ROUND_PLAN order
 * - Respects pool difficulty ramps: rounds 1-5 target 1, 6-10 target 2, 11-15 target 3
 * - Same-day rule: never pick a word already picked earlier in that day
 * - Multi-pool sync: words in two pools (like Arkansas) count as used in both
 * - Seam rule on cycle restart: used = last K picks where K = min(5, floor(eligible/3))
 */
export function getDailyWords(
  dateStr: string,
  bank: WordItem[] = SEED_WORDS,
  savedWordIds?: string[]
): WordItem[] {
  // If we have saved word IDs from when this daily mix was first created, use them directly
  if (savedWordIds && savedWordIds.length > 0) {
    const map = new Map<string, WordItem>(bank.map(w => [w.id, w]));
    const restored = savedWordIds.map(id => map.get(id)).filter((w): w is WordItem => !!w);
    if (restored.length === savedWordIds.length) {
      return restored;
    }
  }

  const cacheKey = `${dateStr}:${bank.length}`;
  const cached = dailyReplayCache.get(cacheKey);
  if (cached && cached.length === MIX_ROUNDS) {
    return cached;
  }

  // Calculate day difference from launch date
  const startDate = new Date(LAUNCH_DATE + 'T00:00:00');
  const targetDate = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.max(
    0,
    Math.round((targetDate.getTime() - startDate.getTime()) / 86400000)
  );

  const pools: Record<PoolName, { usedSet: Set<string>; recentQueue: string[] }> = {
    pronunciation: { usedSet: new Set(), recentQueue: [] },
    impostor: { usedSet: new Set(), recentQueue: [] },
    chopper: { usedSet: new Set(), recentQueue: [] },
  };

  let targetDayPicks: WordItem[] = [];

  for (let d = 0; d <= diffDays; d++) {
    const curDate = new Date(startDate.getTime() + d * 86400000);
    const curDateStr = getLocalDateString(curDate);
    const isTargetDay = d === diffDays;

    const sameDayUsed = new Set<string>();
    const currentDayPicks: WordItem[] = [];

    for (let r = 0; r < ROUND_PLAN.length; r++) {
      const mode = ROUND_PLAN[r];
      const poolName = getPoolForMode(mode);
      const poolState = pools[poolName];

      const targetDiff = r < 5 ? 1 : r < 10 ? 2 : 3;

      const eligible = bank.filter(
        w => isWordInPool(w, poolName) && (!w.addedOn || w.addedOn <= curDateStr)
      );

      const getCandidates = (strictUnused: boolean): WordItem[] => {
        const poolCandidates = eligible.filter(w => {
          if (sameDayUsed.has(w.id)) return false;
          if (strictUnused && poolState.usedSet.has(w.id)) return false;
          return true;
        });

        // 1. Prefer target difficulty
        const exactTarget = poolCandidates.filter(w => w.difficulty === targetDiff);
        if (exactTarget.length > 0) return exactTarget;

        // 2. Otherwise <= target difficulty
        const lowerTarget = poolCandidates.filter(w => w.difficulty <= targetDiff);
        if (lowerTarget.length > 0) return lowerTarget;

        // 3. Relax difficulty target
        return poolCandidates;
      };

      let candidates = getCandidates(true);

      // If empty, restart cycle with seam rule
      if (candidates.length === 0) {
        const K = Math.min(5, Math.floor(eligible.length / 3));
        const lastKPicks = poolState.recentQueue.slice(-K);
        poolState.usedSet.clear();
        for (const id of lastKPicks) {
          poolState.usedSet.add(id);
        }

        candidates = getCandidates(true);
        if (candidates.length === 0) {
          candidates = getCandidates(false);
        }
      }

      // Sort by id for deterministic stability
      candidates.sort((a, b) => a.id.localeCompare(b.id));

      const rng = mulberry32(stringHash(`${poolName}:${curDateStr}:${r}`));
      const chosen = candidates[Math.floor(rng() * candidates.length)] || eligible[0];

      sameDayUsed.add(chosen.id);
      currentDayPicks.push(chosen);

      // Multi-pool sync: if word belongs to other pools (e.g. Arkansas), mark used in both
      for (const pName of ['pronunciation', 'impostor', 'chopper'] as PoolName[]) {
        if (isWordInPool(chosen, pName)) {
          pools[pName].usedSet.add(chosen.id);
          pools[pName].recentQueue.push(chosen.id);
          if (pools[pName].recentQueue.length > 5) {
            pools[pName].recentQueue.shift();
          }
        }
      }
    }

    if (isTargetDay) {
      targetDayPicks = currentDayPicks;
    }
  }

  dailyReplayCache.set(cacheKey, targetDayPicks);
  return targetDayPicks;
}

/**
 * Word of the Day (deterministic, addedOn <= dateStr)
 */
export function getWordOfTheDay(
  dateStr: string,
  bank: WordItem[] = SEED_WORDS
): WordItem {
  const eligible = bank.filter(w => !w.addedOn || w.addedOn <= dateStr);
  const active = eligible.length > 0 ? eligible : bank;

  const seed = stringHash(`etymon-wotd-${dateStr}`);
  const rng = mulberry32(seed);
  const index = Math.floor(rng() * active.length);
  return active[index];
}

/**
 * Scoring calculation
 * Correct first try: 100
 * Correct second try: 50
 * Otherwise: 0
 */
export function calculateScore(result: 'first' | 'second' | 'miss'): number {
  if (result === 'first') return 100;
  if (result === 'second') return 50;
  return 0;
}

export function calculateTotalScore(results: ('first' | 'second' | 'miss')[]): number {
  return results.reduce((sum, r) => sum + calculateScore(r), 0);
}

/**
 * Streak calculation:
 * Streak only increments when completed rounds >= STREAK_MIN_ROUNDS (or legacy 4)
 */
export function calculateNewStreak(
  currentStreak: number,
  lastCompletedDate: string | null,
  newCompletedDate: string
): { streak: number; isNewDay: boolean } {
  if (!lastCompletedDate) {
    return { streak: 1, isNewDay: true };
  }

  if (lastCompletedDate === newCompletedDate) {
    return { streak: currentStreak, isNewDay: false };
  }

  const lastDate = new Date(lastCompletedDate + 'T00:00:00');
  const newDate = new Date(newCompletedDate + 'T00:00:00');
  const dayDiff = Math.round((newDate.getTime() - lastDate.getTime()) / 86400000);

  if (dayDiff === 1) {
    return { streak: currentStreak + 1, isNewDay: true };
  } else {
    return { streak: 1, isNewDay: true };
  }
}

/**
 * Share string generation:
 * "Etymon Daily No. N  12/15" followed by 3 lines of 5 squares
 */
export function formatShareString(
  mixNumber: number,
  results: ('first' | 'second' | 'miss')[],
  totalRounds = MIX_ROUNDS
): string {
  const correctCount = results.filter(r => r === 'first' || r === 'second').length;
  const squares = results.map(r => {
    if (r === 'first') return '🟩';
    if (r === 'second') return '🟨';
    return '⬜';
  });

  // Group squares in lines of 5
  const lines: string[] = [];
  for (let i = 0; i < squares.length; i += 5) {
    lines.push(squares.slice(i, i + 5).join(''));
  }

  return `Etymon Daily No. ${mixNumber}  ${correctCount}/${totalRounds}\n${lines.join('\n')}\n${SITE_URL}`;
}

/**
 * Formats milliseconds into HH:MM:SS
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(':');
}

export function getMsUntilLocalMidnight(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/**
 * Dev pool visibility logging:
 * Prints console.table and warns if any pool cycle is under 30 days
 */
export function logPoolStats(bank: WordItem[] = SEED_WORDS): void {
  const picks = getPicksPerDayPerPool();
  const pools: PoolName[] = ['pronunciation', 'impostor', 'chopper'];

  const stats = pools.map(p => {
    const count = bank.filter(w => isWordInPool(w, p)).length;
    const picksPerDay = picks[p];
    const cycleLength = picksPerDay > 0 ? Math.floor(count / picksPerDay) : 0;
    return {
      'Word Pool': p,
      'Total Words': count,
      'Picks / Day': picksPerDay,
      'Cycle (Days)': cycleLength,
    };
  });

  if (typeof console !== 'undefined' && console.table) {
    console.table(stats);
  }

  for (const s of stats) {
    if (s['Cycle (Days)'] < 30) {
      console.warn(
        `Word pool "${s['Word Pool']}" cycle length is ${s['Cycle (Days)']} days (< 30 days).`
      );
    }
  }
}
