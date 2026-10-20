# Etymon — The Editorial Word Game of Orthographic Oddities

A responsive, zero-defect frontend word-game website celebrating the delightful discrepancies between English spelling and pronunciation. Featuring a daily 4-round challenge, 4 endless arcade modes, an etymological lexicon, audio pronunciation synthesis via the Web Speech API, and comprehensive keyboard accessibility.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned during Phase 1 clarification:
> - **Routing Mode**: Hash routing (`ROUTER_MODE = "hash"`) has been chosen to guarantee seamless preview iframe reloads without server redirect issues, while maintaining canonical URL mapping for SEO.
> - **Word Bank Expansion**: The dictionary will be populated with 38+ thoroughly verified historical and phonetic oddity words (expanding past the 21 launch minimum), while retaining the requested visible dev warning indicator alerting that the bank has fewer than 120 words.
> - **Speech Engine Strategy**: Web Speech API with automatic voice fallback (`Google US English` → `en-US` → `en*` → default), speaking custom phonetic `tts` strings (never display respellings), with a 0.9 normal / 0.6 slow rate, and a dedicated unlinked `/qa/audio` listening board.

---

## 1. Overview & Core Concept

English orthography is notoriously eccentric: *colonel* sounds like *kernel*, *doubt* has an etymological b inserted by 16th-century scholars, and *Worcestershire* collapses into three spoken syllables. **Etymon** transforms these linguistic oddities into an elegant, daily puzzle ritual and arcade challenge.

### Key Value & Experience
- **Daily Mix (4 Rounds, ~3 minutes)**: One curated word per mode (Round 1: Sound Match, Round 2: True or Trap, Round 3: Impostor Letter, Round 4: Syllable Chopper). Deterministically seeded by the player's local calendar date.
- **Four Dedicated Arcade Modes**: Endless gameplay with escalating difficulty thresholds (Difficulty 1 at streak 0–4, up to 2 at streak 5–9, difficulty 3 at 10+), live session scores, and persistent personal bests.
- **Deep Historical Etymology**: Every puzzle resolves to "Why it's said that way", featuring the IPA phonetic transcription, pronunciation audio, and a concise <=25 word backstory tracing French borrowings, Great Vowel Shift drift, or scribal additions.
- **Rich Word Lexicon**: Searchable, tag-filtered dictionary. Words played in Daily or Arcade modes unlock full etymological dossiers; locked entries display discovery teasers.
- **Deterministic & Zero-Backend**: Pure client-side execution, versioned persistence (`etymon:v1`), in-memory fallbacks, and zero external trackers or fake bots.

---

## 2. User Experience & Visual Design

Following the reference screenshots and the **Frontend Design Constitution**, Etymon embraces an editorial, scholarly book-arts aesthetic inspired by classic dictionary typography and Oxford folio editions.

### Visual Identity & Design Tokens

```
Canvas / Page:     #FDF8EC (warm parchment)
Card Surface:      #FFFFFF (crisp white)
Inset Surface:     #F4EEE1 (subtle warm tone)
Inset Hover:       #EBE3D2 (tactile hover)
Border:            #E2D8C3 (hairline rules)
Border Strong:     #CFC3AA (active frames)
Ink (Text/Action): #1F1B16 (deep graphite)
Muted Text:        #5E564A (secondary copy, 6.8:1 contrast)
Muted-2:           #6F6659 (captions, 4.5:1+ contrast)
Label Gold:        #6B5A12 (mono uppercase kickers)
Success / Error:   #2E6B3F on #DDF5E0 | #A63A2B on #F9E0DB
Mode Tints:        Gold #F2D46B | Mint #A9DDB0 | Sky #B7D4EE | Rose #F2B8AE
```

### Strict Typography Scale & Rules
- **Display Headings**: `Fraunces 700` (`clamp(1.75rem, 1.3rem + 2vw, 2.75rem)`).
- **Word Target Display**: `Fraunces 600` (`clamp(2.5rem, 1.6rem + 4vw, 4rem)`).
- **Body & Explanations**: `Inter 400-600` (15–16px, 1.5–1.7 line height).
- **Phonetics & Respellings**: `DM Mono 500` (`clamp(1.125rem, 1rem + 0.5vw, 1.375rem)`).
- **Labels & Metas**: `DM Mono 12px` uppercase, tracking `0.08em`, `label-gold` or `muted`.
- **Zero-Pill Discipline**: Informational metadata renders as clean text with typographic separators (`·`, `/`); buttons and interactive filters are structured affordances.

### Answer Tile State Matrix (Strict Contract)
1. **Default**: Inset bg (`#F4EEE1`), border (`#E2D8C3`), ink text (`#1F1B16`).
2. **Hover**: Inset-hover (`#EBE3D2`), subtle scale-free transition.
3. **Selected (Pending)**: Ink bg (`#1F1B16`), page-colored text (`#FDF8EC`).
4. **Correct**: Success bg (`#DDF5E0`), 2px solid success border (`#2E6B3F`), checkmark icon, and explicit text `"Correct"`.
5. **Wrong**: Error bg (`#F9E0DB`), 2px solid error border (`#A63A2B`), X icon, and explicit text `"Not quite"`.
6. **Revealed-Correct**: 2px dashed success border (`#2E6B3F`), ink text, highlighting the true answer after a miss.
7. **Resolved-Other**: Inset bg, muted-2 text (`#6F6659`), no opacity reduction.
8. **Disabled**: Inset bg, muted-2 text, `cursor-not-allowed`, fully legible (no text fade below 4.5:1).

### Layout & Responsiveness
- **Desktop (1024px – 1920px)**: 1088px max-width container; 1fr main game card + 320px sticky aside (AdSlot 300x250 + Companion Games card). Reserved feedback slot (min-height 176px) prevents Cumulative Layout Shift (CLS).
- **Tablet & Mobile (320px – 1023px)**: Single-column flow; aside content renders gracefully below the game card; chunk and letter tiles use CSS grid and `whitespace: nowrap` to ensure letters never wrap internally even at 320px.
- **Header (72px)**: Single row with wordmark "Etymon" + mono tag "GAMES", navigation links (Play dropdown, Daily, Lexicon, How it works), streak chip with flame icon, and Settings modal trigger. Mobile drawer with focus trap and Escape handler.
- **Footer**: 4 semantic columns (Brand tagline, Play modes, Learn, About), copyright with dynamic current year, and "Privacy choices" dialog offering one-click local storage wipe.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Client-Side Seeded PRNG for Daily Mix
- **Approach**: A deterministic Mulberry32 generator seeded with the calendar date string (`YYYY-MM-DD`).
- **Why**: Allows offline play, instant loading, identical puzzles for all players globally on the same local date, and zero backend maintenance or external API failures.
- **Mitigation**: Date roll-overs happen at the player's local midnight with a live ticking countdown timer.

### Decision 2: Web Speech API with Custom Natural Phonetic Strings
- **Approach**: Hook `useSpeech` reads asynchronous voices (`speechSynthesis.getVoices()`), prioritizes `Google US English` or `en-US`, applies `cancel()` before playing, and speaks an engineered natural pronunciation string (`tts`, e.g. `"wuster sher"` for *Worcestershire*), never the display respelling or IPA symbols.
- **Why**: Native browser TTS produces natural speech without external latency or paid audio streaming APIs, while respecting the user's audio on/off and slow speech preferences.

### Decision 3: WCAG 2.1.4 Compliant Single-Key Shortcuts
- **Approach**: Keys `1-4`, `A-D`, `Left`/`Right`, `Enter`, `R`, `H` drive gameplay directly. All shortcuts are automatically suspended when focus is inside text inputs and can be toggled off globally in the Settings panel. `Space` is deliberately unbound to preserve standard native button activation.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Etymon Web App                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Bar (Logo, Nav Menu, Daily Streak Chip, Settings Popover Modal)        │
├───────────────────────────────────────┬─────────────────────────────────────┤
│  Route View (React Router Hash)       │ Sticky Aside (Desktop ≥ 1024px)     │
│  - / : Daily Mix (Ready/Play/Done)    │ - AdSlot (300x250, zero CLS)        │
│  - /sound-match : Arcade              │ - Companion Games Card              │
│  - /true-vs-trap : Arcade             │                                     │
│  - /impostor-letter : Arcade          │                                     │
│  - /syllable-chopper : Arcade         │                                     │
│  - /archive & /archive/:date          │                                     │
│  - /lexicon & /lexicon/:id            │                                     │
│  - /how-it-works, /editorial, /privacy│                                     │
├───────────────────────────────────────┴─────────────────────────────────────┤
│  Etymon State Context (useReducer + localStorage "etymon:v1")               │
│  - streak, bestStreak, lastCompletedDate, mixes[date], unlockedIds, settings│
├─────────────────────────────────────────────────────────────────────────────┤
│  Speech Synthesis Hook (useSpeech) & Keyboard Navigation Hook (useKeyboard) │
├─────────────────────────────────────────────────────────────────────────────┤
│  Curated Word Bank (38+ Verified Words, Pronunciations, Backstories, IPA)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Word Bank Schema (`src/data/words.ts`)
```typescript
export interface WordItem {
  id: string;
  word: string;
  pos: string; // e.g. "noun", "adjective"
  definition: string;
  origin: string;
  respelling: string; // e.g. "KUR-nel"
  ipa: string; // e.g. "/ˈkɝː.nəl/"
  tts: string; // e.g. "kernel" for speech synthesis
  backstory: string; // <= 25 words single sentence
  tags: ("silent-letter" | "place" | "loanword" | "dropped-syllable" | "nautical" | "name")[];
  difficulty: 1 | 2 | 3;
  modes: ("sound" | "trap" | "impostor" | "chopper")[];
  wrong?: { text: string; tts: string }[];
  silentIndex?: number; // 0-based character index
  chunks?: {
    parts: string[];
    droppedIndex: number;
    spoken: string;
  };
  hint: string;
  audioUrl?: string;
  needsReview?: boolean;
}
```

### Four Game Mechanics
1. **Sound Match (`/sound-match`)**:
   - 1 try. Word displayed with part of speech and definition.
   - Four options (A–D) showing respellings with an inline 44px speaker button.
   - No IPA or syllable counts shown prior to submission.
2. **True or Trap (`/true-vs-trap`)**:
   - 1 try. Word paired with a proposed respelling (50% true, 50% trap).
   - Equal-weight "Trap" (warning icon) and "True" (check icon) buttons. Left/Right keyboard shortcuts.
3. **Impostor Letter (`/impostor-letter`)**:
   - 2 tries. Letter tiles as buttons with `clamp(56px, 14vw, 96px)` sizing.
   - On resolution, reveals IPA sound badge beneath each tile; silent letter tile marked with correct state.
4. **Syllable Chopper (`/syllable-chopper`)**:
   - 2 tries. Multi-syllable word broken into written chunks.
   - User selects the written chunk that disappears in speech; marked with `#F2B8AE` badge.
   - Clicking "Chop" collapses the chunk and reveals the spoken syllable form.

### Test Strategy (Vitest)
- `tests/dailySelection.test.ts`: Validates Mulberry32 deterministic 4-word selection across varied dates, difficulty gating, and uniqueness.
- `tests/streak.test.ts`: Verifies consecutive-day increments, same-day idempotency, missed-day resets, and archive-play isolation.
- `tests/scoring.test.ts`: Checks 100 pts for first try, 50 pts for second try, 0 for misses.
- `tests/shareString.test.ts`: Validates emoji square formatting (🟩 green, 🟨 yellow, ⬜ white) and text template.

---

## 5. Execution Steps

1. **Setup & Dependencies**: Add `react-router-dom` and `vitest`. Configure fonts (`Fraunces`, `Inter`, `DM Mono`) and Tailwind theme design tokens.
2. **Data Layer**: Implement complete `words.ts` with 38+ verified words, Mulberry32 PRNG generator, and Daily Mix selector.
3. **State & Storage**: Implement `EtymonContext` with versioned `etymon:v1` localStorage schema, fallback handling, and settings management.
4. **Audio & Keyboard Hooks**: Implement `useSpeech` Web Speech synthesis with async voice selection and `useKeyboard` shortcut listener.
5. **UI Components**: Build responsive Shell (Header, Mobile Menu, Footer, AdSlot, Settings Modal, Privacy Choices Modal).
6. **Game Engines**: Implement Sound Match, True or Trap, Impostor Letter, and Syllable Chopper components adhering to the exact State Matrix.
7. **Pages**: Construct Home/Daily (`/`), Arcade routes, Archive, Lexicon (`/lexicon` & `/lexicon/:id`), How It Works, Editorial Standards, Contact, Privacy, 404, and `/qa/audio`.
8. **SEO & Static Assets**: Configure dynamic `<title>`, `<meta>`, canonical URLs, JSON-LD, `sitemap.xml`, and `robots.txt`.
9. **Unit Testing & Verification**: Write and run Vitest suite, compile applet, test keyboard navigation, and verify 320px–1920px responsiveness.
