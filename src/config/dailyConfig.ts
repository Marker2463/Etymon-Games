import { GameModeType } from '../data/words';

export const MIX_ROUNDS = 15;

export const ROUND_PLAN: GameModeType[] = [
  'sound',
  'trap',
  'impostor',
  'chopper',
  'sound',
  'trap',
  'impostor',
  'chopper',
  'sound',
  'trap',
  'impostor',
  'chopper',
  'sound',
  'trap',
  'impostor',
];

export const MIX_MINUTES_ESTIMATE = 8;
export const STREAK_MIN_ROUNDS = 15;
export const LAUNCH_DATE = '2026-01-01';

export type PoolName = 'pronunciation' | 'impostor' | 'chopper';

export function getPoolForMode(mode: GameModeType): PoolName {
  if (mode === 'sound' || mode === 'trap') return 'pronunciation';
  return mode;
}

export function getPicksPerDayPerPool(plan = ROUND_PLAN): Record<PoolName, number> {
  const counts: Record<PoolName, number> = {
    pronunciation: 0,
    impostor: 0,
    chopper: 0,
  };
  for (const mode of plan) {
    counts[getPoolForMode(mode)]++;
  }
  return counts;
}

export function getModeCountInPlan(mode: GameModeType, plan = ROUND_PLAN): number {
  return plan.filter(m => m === mode).length;
}
