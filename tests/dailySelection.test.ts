import { describe, it, expect } from 'vitest';
import { getDailyWords, getDailyMixNumber, MIX_ROUNDS } from '../src/utils/daily';

describe('Seeded Daily Selection', () => {
  it('should deterministically return exactly 15 unique words for a given date', () => {
    const wordsDay1 = getDailyWords('2026-03-15');
    const wordsDay1Again = getDailyWords('2026-03-15');

    expect(wordsDay1.length).toBe(MIX_ROUNDS);
    expect(wordsDay1.length).toBe(15);

    // Deterministic check
    expect(wordsDay1.map(w => w.id)).toEqual(wordsDay1Again.map(w => w.id));

    // No duplicates inside a single mix
    const ids = new Set(wordsDay1.map(w => w.id));
    expect(ids.size).toBe(15);
  });

  it('should map rounds to the correct game modes in order', () => {
    const words = getDailyWords('2026-04-01');

    // Round 1: Sound Match
    expect(words[0].modes).toContain('sound');
    // Round 2: True or Trap
    expect(words[1].modes).toContain('trap');
    // Round 3: Impostor Letter
    expect(words[2].modes).toContain('impostor');
    // Round 4: Syllable Chopper
    expect(words[3].modes).toContain('chopper');
  });

  it('should produce different sets for different calendar dates', () => {
    const wordsA = getDailyWords('2026-01-01');
    const wordsB = getDailyWords('2026-01-02');

    const idsA = wordsA.map(w => w.id).join(',');
    const idsB = wordsB.map(w => w.id).join(',');
    expect(idsA).not.toBe(idsB);
  });

  it('should correctly calculate mix number from launch date 2026-01-01', () => {
    expect(getDailyMixNumber('2026-01-01')).toBe(1);
    expect(getDailyMixNumber('2026-01-02')).toBe(2);
    expect(getDailyMixNumber('2026-01-31')).toBe(31);
  });
});
