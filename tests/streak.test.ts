import { describe, it, expect } from 'vitest';
import { calculateNewStreak } from '../src/utils/daily';

describe('Streak Calculation Logic', () => {
  it('should initialize streak to 1 on the first completion', () => {
    const res = calculateNewStreak(0, null, '2026-03-10');
    expect(res.streak).toBe(1);
    expect(res.isNewDay).toBe(true);
  });

  it('should increment streak by 1 if completed on the consecutive day', () => {
    const res = calculateNewStreak(4, '2026-03-09', '2026-03-10');
    expect(res.streak).toBe(5);
    expect(res.isNewDay).toBe(true);
  });

  it('should count same-day repeat once without incrementing streak', () => {
    const res = calculateNewStreak(5, '2026-03-10', '2026-03-10');
    expect(res.streak).toBe(5);
    expect(res.isNewDay).toBe(false);
  });

  it('should reset streak to 1 if a day was skipped', () => {
    const res = calculateNewStreak(12, '2026-03-05', '2026-03-10');
    expect(res.streak).toBe(1);
    expect(res.isNewDay).toBe(true);
  });
});
