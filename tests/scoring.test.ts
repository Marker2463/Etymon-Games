import { describe, it, expect } from 'vitest';
import { calculateScore, calculateTotalScore } from '../src/utils/daily';

describe('Scoring Rules', () => {
  it('should award 100 points for first-try success', () => {
    expect(calculateScore('first')).toBe(100);
  });

  it('should award 50 points for second-try success', () => {
    expect(calculateScore('second')).toBe(50);
  });

  it('should award 0 points for a miss', () => {
    expect(calculateScore('miss')).toBe(0);
  });

  it('should calculate cumulative round score correctly', () => {
    const mixedResults: ('first' | 'second' | 'miss')[] = ['first', 'second', 'miss', 'first'];
    // 100 + 50 + 0 + 100 = 250
    expect(calculateTotalScore(mixedResults)).toBe(250);
  });
});
