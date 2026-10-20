/**
 * Central copy catalog for Etymon
 * All user-facing strings and feedback line pools
 */

export const FIRST_TRY_FEEDBACK = [
  "Nice ear.",
  "Spot on.",
  "Sharp one.",
  "You nailed it.",
  "Well spotted.",
  "That's the one.",
] as const;

export const SECOND_TRY_FEEDBACK = [
  "Got it.",
  "Good catch.",
] as const;

export function getStreakMilestoneFeedback(streak: number): string | null {
  if (streak >= 10) return "10 in a row. Impressive.";
  if (streak >= 5) return "5 in a row. You're on a roll.";
  if (streak >= 3) return "3 in a row.";
  return null;
}

let lastFeedbackLine: string | null = null;

export function getFeedbackLine(
  tryCount: 1 | 2,
  currentStreak: number
): string {
  const milestone = getStreakMilestoneFeedback(currentStreak);
  if (milestone) {
    lastFeedbackLine = milestone;
    return milestone;
  }

  const pool = tryCount === 1 ? FIRST_TRY_FEEDBACK : SECOND_TRY_FEEDBACK;
  const available = pool.filter(line => line !== lastFeedbackLine);
  const candidates = available.length > 0 ? available : pool;

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  lastFeedbackLine = chosen;
  return chosen;
}

export function resetFeedbackMemory() {
  lastFeedbackLine = null;
}

export function getRoundMilestoneFeedback(roundIndex: number): string | null {
  if (roundIndex === 7) return "Halfway there.";
  if (roundIndex === 13) return "Last one next.";
  return null;
}

export function getDailyCompletionHeadline(correctCount: number, totalRounds = 15): string {
  if (totalRounds <= 4) {
    if (correctCount === 4) return "Perfect Mix.";
    if (correctCount === 3) return "Great Mix.";
    if (correctCount === 2) return "Solid start.";
    return "Good effort. A fresh Mix arrives at midnight.";
  }

  if (correctCount >= 15) return "Perfect Mix.";
  if (correctCount >= 12) return "Great Mix.";
  if (correctCount >= 8) return "Solid Mix.";
  return "Good effort. A fresh Mix arrives at midnight.";
}

export const COPY = {
  brand: "Etymon",
  brandTag: "GAMES",
  tagline: "Puzzles about English words that don't sound the way they look.",
  attribution: "Definitions and audio via Free Dictionary API.",

  // Navigation
  nav: {
    play: "Play",
    daily: "Daily",
    lexicon: "Lexicon",
    howItWorks: "How it works",
  },

  // Game Subtitles
  modes: {
    soundMatch: {
      title: "Sound Match",
      subtitle: "Read the word, then pick how it is really said.",
      about: "Read the word and pick its true spoken pronunciation from four respellings.",
      hintText: "Keys: 1-4 or A-D to pick answer",
    },
    trueOrTrap: {
      title: "True or Trap",
      subtitle: "Is this pronunciation real, or a trap?",
      about: "Decide whether the proposed respelling matches genuine spoken English.",
      hintText: "Keys: ← Left for Trap, → Right for True",
    },
    impostorLetter: {
      title: "Impostor Letter",
      subtitle: "Find the letter that never gets said.",
      about: "Identify the unpronounced silent letter inside the word.",
      hintText: "Keys: 1-N picks letter position · H for hint",
    },
    syllableChopper: {
      title: "Syllable Chopper",
      subtitle: "Find the written chunk that disappears when you say it.",
      about: "Identify the written syllable chunk that drops out in spoken cadence.",
      hintText: "Keys: 1-N selects chunk · Enter chops · H for hint",
    },
  },

  // Phrasing & Prompts
  prompts: {
    impostorPrompt: "Which letter is silent in this word?",
    chopperPrompt: "This word is written in {n} chunks but said in {nMinus1} syllables. Select the dropped chunk, then press Chop.",
    hearWord: "Hear word",
    hearIt: "Hear it",
    hearOption: "Hear option {letter}",
    showHint: "Show hint",
    resetSelection: "Reset",
    chopButton: "Chop selected chunk",
    nextWord: "Next word",
    seeResults: "See results",
    answerLabel: "ANSWER",
    markedBadge: "Marked",
  },

  // Daily
  daily: {
    heroKicker: "DAILY MIX No. {n}",
    heroHeading: "Today's Daily Mix",
    heroSub: "1 round with 15 words on words that don't sound like they look.",
    progressSaved: "Progress saved",
    playButton: "Play today's Mix",
    continueButton: "Continue Mix",
    resultsHeading: "Today's Mix complete",
    shareResult: "Share result",
    playArcade: "Play arcade",
    nextMixIn: "NEXT MIX IN",
  },

  // Screen Reader Announcements
  sr: {
    incorrect: "Incorrect.",
    answerReveal: "The answer is {respelling}.",
    correctAnnouncement: "Correct. {word} is pronounced {respelling}.",
  },
};
