import { describe, it, expect } from 'vitest';
import {
  validateWordEntry,
  validateWordBank,
  WordItem,
} from '../src/data/words';
import {
  mergeWordBanks,
  getDailyWords,
} from '../src/utils/daily';
import {
  isUsAudioUrl,
  normalizeAudioUrl,
  parseDictionaryApiResponse,
} from '../src/services/dictionary';

describe('Word Bank Validation & Hybrid Merge', () => {
  it('rejects entries with invalid mode requirements', () => {
    // Sound entry with only 2 wrong options instead of 3
    const badSound = {
      id: 'test-sound',
      word: 'test',
      respelling: 'TEST',
      tts: 'test',
      difficulty: 1,
      modes: ['sound'],
      addedOn: '2026-01-01',
      wrong: [{ text: 'wrong1', tts: 'wrong1' }],
    };
    expect(validateWordEntry(badSound)).toBeNull();

    // Impostor entry with silentIndex out of bounds
    const badImpostor = {
      id: 'test-impostor',
      word: 'debt',
      respelling: 'DET',
      tts: 'det',
      difficulty: 1,
      modes: ['impostor'],
      silentIndex: 10,
      addedOn: '2026-01-01',
    };
    expect(validateWordEntry(badImpostor)).toBeNull();

    // Chopper entry where parts do not join to equal word
    const badChopper = {
      id: 'test-chopper',
      word: 'camera',
      respelling: 'KAM-ruh',
      tts: 'kam ruh',
      difficulty: 1,
      modes: ['chopper'],
      chunks: {
        parts: ['cam', 'ra'], // missing 'e'
        droppedIndex: 1,
        spoken: 'KAM-ruh',
      },
      addedOn: '2026-01-01',
    };
    expect(validateWordEntry(badChopper)).toBeNull();
  });

  it('accepts valid entries and applies fallback defaults', () => {
    const validEntry = {
      id: 'knight',
      word: 'knight',
      respelling: 'NITE',
      tts: 'night',
      difficulty: 1,
      modes: ['impostor'],
      silentIndex: 0,
      addedOn: '2026-01-01',
    };
    const validated = validateWordEntry(validEntry);
    expect(validated).not.toBeNull();
    expect(validated?.id).toBe('knight');
    expect(validated?.hint).toBe('Say it aloud, slowly. Which part do you never use?');
  });

  it('merges remote and base entries with remote winning on collision', () => {
    const base: WordItem[] = [
      {
        id: 'victual',
        word: 'victual',
        respelling: 'VIT-el',
        tts: 'vittle',
        difficulty: 2,
        modes: ['sound'],
        tags: [],
        hint: 'Say it aloud, slowly. Which part do you never use?',
        addedOn: '2026-01-01',
        wrong: [
          { text: 'A', tts: 'a' },
          { text: 'B', tts: 'b' },
          { text: 'C', tts: 'c' },
        ],
      },
    ];

    const remote: WordItem[] = [
      {
        id: 'victual',
        word: 'victual',
        respelling: 'VIT-uhl-UPDATED',
        tts: 'vittle',
        difficulty: 2,
        modes: ['sound'],
        tags: ['updated'],
        hint: 'Say it aloud, slowly. Which part do you never use?',
        addedOn: '2026-01-01',
        wrong: [
          { text: 'A', tts: 'a' },
          { text: 'B', tts: 'b' },
          { text: 'C', tts: 'c' },
        ],
      },
      {
        id: 'new-word',
        word: 'newword',
        respelling: 'NOO-wurd',
        tts: 'new word',
        difficulty: 1,
        modes: ['impostor'],
        silentIndex: 0,
        tags: [],
        hint: 'Say it aloud, slowly. Which part do you never use?',
        addedOn: '2026-01-01',
      },
    ];

    const merged = mergeWordBanks(base, remote);
    expect(merged.length).toBe(2);
    const victual = merged.find(w => w.id === 'victual');
    expect(victual?.respelling).toBe('VIT-uhl-UPDATED');
  });

  it('resumes from savedWordIds for daily stability', () => {
    const savedIds = ['island', 'subtle', 'cologne', 'family'];
    const restored = getDailyWords('2026-05-20', undefined, savedIds);
    expect(restored.map(w => w.id)).toEqual(savedIds);
  });
});

describe('Dictionary Service Utilities', () => {
  it('filters US audio URLs correctly', () => {
    expect(isUsAudioUrl('https://api.dictionaryapi.dev/media/pronunciations/en/test-us.mp3')).toBe(true);
    expect(isUsAudioUrl('https://api.dictionaryapi.dev/media/pronunciations/en/word_us_1.mp3')).toBe(true);
    expect(isUsAudioUrl('https://api.dictionaryapi.dev/media/pronunciations/en/test-uk.mp3')).toBe(false);
    expect(isUsAudioUrl('')).toBe(false);
  });

  it('normalizes protocol relative URLs and ensures https', () => {
    const normalized = normalizeAudioUrl('//ssl.gstatic.com/dictionary/static/sounds/20200429/test-us.mp3');
    expect(normalized).toBe('https://ssl.gstatic.com/dictionary/static/sounds/20200429/test-us.mp3');
  });

  it('parses free dictionary api response and extracts first definition', () => {
    const mockApiResponse = [
      {
        word: 'colonel',
        phonetic: '/ˈkɜːrnəl/',
        phonetics: [
          {
            text: '/ˈkɜːrnəl/',
            audio: 'https://api.dictionaryapi.dev/media/pronunciations/en/colonel-us.mp3',
          },
        ],
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [
              {
                definition: 'An officer of high rank in the army, marines, or air force.',
              },
            ],
          },
        ],
        license: {
          name: 'CC BY-SA 3.0',
          url: 'https://creativecommons.org/licenses/by-sa/3.0',
        },
        sourceUrls: ['https://en.wiktionary.org/wiki/colonel'],
      },
    ];

    const parsed = parseDictionaryApiResponse(mockApiResponse);
    expect(parsed).not.toBeNull();
    expect(parsed?.definition).toBe('An officer of high rank in the army, marines, or air force.');
    expect(parsed?.partOfSpeech).toBe('noun');
    expect(parsed?.audioUrl).toBe('https://api.dictionaryapi.dev/media/pronunciations/en/colonel-us.mp3');
    expect(parsed?.license?.name).toBe('CC BY-SA 3.0');
    expect(parsed?.sourceUrls?.[0]).toBe('https://en.wiktionary.org/wiki/colonel');
  });
});
