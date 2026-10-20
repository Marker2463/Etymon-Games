import { describe, it, expect } from 'vitest';
import { formatShareString } from '../src/utils/daily';

describe('Share String Generation', () => {
  it('should format share text with mix number, fraction, emoji squares, and site url', () => {
    const results: ('first' | 'second' | 'miss')[] = [
      'first', 'second', 'miss', 'first', 'first',
      'first', 'second', 'miss', 'first', 'first',
      'first', 'second', 'miss', 'first', 'first',
    ];
    // 12 correct out of 15
    const shareText = formatShareString(42, results);

    expect(shareText).toContain('Etymon Daily No. 42  12/15');
    expect(shareText).toContain('🟩🟨⬜');
    expect(shareText).toContain('https://etymon.app');
  });

  it('should format perfect score with 15 green squares', () => {
    const results: ('first' | 'second' | 'miss')[] = Array(15).fill('first');
    const shareText = formatShareString(15, results);

    expect(shareText).toContain('Etymon Daily No. 15  15/15');
    expect(shareText).toContain('🟩🟩🟩🟩🟩');
  });

  it('should format zero score with 15 white squares', () => {
    const results: ('first' | 'second' | 'miss')[] = Array(15).fill('miss');
    const shareText = formatShareString(9, results);

    expect(shareText).toContain('Etymon Daily No. 9  0/15');
    expect(shareText).toContain('⬜⬜⬜⬜⬜');
  });
});
