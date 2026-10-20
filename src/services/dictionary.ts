/**
 * Service for live dictionary lookup via Free Dictionary API
 * Features:
 * - 4s AbortController timeout
 * - Max 4 concurrent requests
 * - localStorage caching ("etymon:dict:v1:{word}"): 14 days for success, 1 day for 404s
 * - US audio filter ("-us" or "_us_")
 * - Silent fallback on failure
 */

export interface DictionaryData {
  definition?: string;
  partOfSpeech?: string;
  audioUrl?: string;
  ipa?: string;
  license?: {
    name: string;
    url: string;
  };
  sourceUrls?: string[];
}

interface CacheItem {
  data: DictionaryData | null;
  timestamp: number;
  isNotFound?: boolean;
}

const CACHE_PREFIX = 'etymon:dict:v1:';
export const CACHE_TTL_SUCCESS_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
export const CACHE_TTL_404_MS = 1 * 24 * 60 * 60 * 1000; // 1 day

export function isUsAudioUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('-us') || lower.includes('_us_');
}

export function normalizeAudioUrl(url?: string): string | null {
  if (!url) return null;
  let normalized = url.trim();
  if (normalized.startsWith('//')) {
    normalized = 'https:' + normalized;
  }
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }
  return isUsAudioUrl(normalized) ? normalized : null;
}

// Concurrency queue
let activeRequests = 0;
const MAX_CONCURRENT = 4;
const requestQueue: Array<() => void> = [];

function pumpQueue() {
  while (activeRequests < MAX_CONCURRENT && requestQueue.length > 0) {
    const next = requestQueue.shift();
    if (next) {
      activeRequests++;
      next();
    }
  }
}

function runWithConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const task = () => {
      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeRequests--;
          pumpQueue();
        });
    };

    requestQueue.push(task);
    pumpQueue();
  });
}

/**
 * Check and retrieve valid cached dictionary item from localStorage
 */
export function getCachedDictionaryData(
  word: string,
  now = Date.now()
): { hit: boolean; data: DictionaryData | null } {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${word.toLowerCase().trim()}`);
    if (!raw) return { hit: false, data: null };

    const parsed: CacheItem = JSON.parse(raw);
    const age = now - parsed.timestamp;

    if (parsed.isNotFound) {
      if (age < CACHE_TTL_404_MS) {
        return { hit: true, data: null };
      }
      return { hit: false, data: null };
    }

    if (age < CACHE_TTL_SUCCESS_MS) {
      return { hit: true, data: parsed.data };
    }
    return { hit: false, data: null };
  } catch {
    return { hit: false, data: null };
  }
}

/**
 * Write to localStorage cache
 */
export function setCachedDictionaryData(
  word: string,
  data: DictionaryData | null,
  isNotFound = false,
  now = Date.now()
) {
  try {
    const item: CacheItem = {
      data,
      timestamp: now,
      isNotFound,
    };
    localStorage.setItem(
      `${CACHE_PREFIX}${word.toLowerCase().trim()}`,
      JSON.stringify(item)
    );
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Parses raw Dictionary API JSON response into DictionaryData
 */
export function parseDictionaryApiResponse(json: any): DictionaryData | null {
  if (!Array.isArray(json) || json.length === 0) return null;

  const entry = json[0];
  let definition: string | undefined;
  let partOfSpeech: string | undefined;
  let audioUrl: string | undefined;
  let ipa: string | undefined;

  // Extract first meaning & definition
  if (Array.isArray(entry.meanings) && entry.meanings.length > 0) {
    const firstMeaning = entry.meanings[0];
    partOfSpeech = firstMeaning.partOfSpeech;
    if (Array.isArray(firstMeaning.definitions) && firstMeaning.definitions.length > 0) {
      definition = firstMeaning.definitions[0].definition;
    }
  }

  // Extract phonetic & US audio
  if (entry.phonetic) {
    ipa = entry.phonetic;
  }

  if (Array.isArray(entry.phonetics)) {
    for (const ph of entry.phonetics) {
      if (!ipa && ph.text) {
        ipa = ph.text;
      }
      if (ph.audio) {
        const candidate = normalizeAudioUrl(ph.audio);
        if (candidate) {
          audioUrl = candidate;
          break; // First valid US audio found
        }
      }
    }
  }

  const license = entry.license && typeof entry.license.name === 'string'
    ? { name: entry.license.name, url: entry.license.url || '' }
    : undefined;

  const sourceUrls = Array.isArray(entry.sourceUrls) ? entry.sourceUrls : undefined;

  return {
    definition,
    partOfSpeech,
    audioUrl,
    ipa,
    license,
    sourceUrls,
  };
}

/**
 * Fetch word from Dictionary API with caching, timeout, and concurrency limit
 */
export async function fetchDictionaryData(word: string): Promise<DictionaryData | null> {
  const cleanWord = word.trim().toLowerCase();
  if (!cleanWord) return null;

  // 1. Check cache
  const cached = getCachedDictionaryData(cleanWord);
  if (cached.hit) {
    return cached.data;
  }

  // 2. Execute fetch with concurrency limit and 4s timeout
  return runWithConcurrencyLimit(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`,
        { signal: controller.signal }
      );
      clearTimeout(timer);

      if (res.status === 404) {
        setCachedDictionaryData(cleanWord, null, true);
        return null;
      }

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      const parsed = parseDictionaryApiResponse(json);
      setCachedDictionaryData(cleanWord, parsed, false);
      return parsed;
    } catch {
      // On network failure or timeout, return null silently
      return null;
    } finally {
      clearTimeout(timer);
    }
  });
}

/**
 * Prefetch an array of words in the background without blocking
 */
export function prefetchWords(words: string[]): void {
  for (const w of words) {
    fetchDictionaryData(w).catch(() => {});
  }
}
