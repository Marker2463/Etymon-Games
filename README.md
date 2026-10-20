# Etymon — The Editorial Word Game of Orthographic Oddities

Etymon is a responsive word-game website celebrating English words that don't sound the way they look.

## Architectural Highlights

- **Framework**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router (`ROUTER_MODE = "hash"` by default).
- **Zero Backend / Complete Privacy**: Persistence uses versioned `localStorage` (`etymon:v1`) with robust in-memory fallbacks and zero telemetry.
- **Seeded Daily Challenge**: Deterministic Mulberry32 PRNG selects 4 unique words every calendar day at the player's local midnight.
- **Four Game Modes**:
  1. **Sound Match** (`/sound-match`): Read the word, then pick how it is really said.
  2. **True or Trap** (`/true-vs-trap`): Is this pronunciation real, or a trap?
  3. **Impostor Letter** (`/impostor-letter`): Find the letter that never gets said.
  4. **Syllable Chopper** (`/syllable-chopper`): Find the written chunk that disappears when you say it.
- **Linguistic Lexicon**: Comprehensive dictionary with category filters and detailed historical dossiers.
- **Web Speech Audio Engine**: Async voice loading, custom phonetic TTS strings, speed controls, and an internal `/qa/audio` audit board.
- **Accessibility & Contrast**: Strict 4.5:1+ contrast on all tokens, 3px ink focus rings, touch targets >= 48px, and WCAG 2.1.4 single-key shortcuts.

## Hosting & Routing Note

Etymon defines `ROUTER_MODE = "hash"` in `src/App.tsx` so that preview iframes and static file servers support full browser refresh without 404 errors. If switched to `ROUTER_MODE = "browser"`, the hosting provider (e.g. Cloudflare Pages, Netlify, Nginx, Vercel) must be configured to fall back to `index.html` for all unknown route requests:

```nginx
# Nginx fallback example
location / {
  try_files $uri $uri/ /index.html;
}
```

## Running Tests

```bash
npm test
```
All 15 unit tests verify seeded daily puzzle generation, streak counting, scoring logic, and share string formatting.
