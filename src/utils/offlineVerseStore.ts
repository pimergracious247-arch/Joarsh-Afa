import type { LanguageCode, QuizQuestion, VerseItem } from '../types';

const DB_NAME = 'bible_quest_offline_v1';
const DB_VERSION = 2;
const STORE_VIEWED = 'viewedVerses';
const STORE_SAVED = 'savedVerses';
const STORE_CHAPTERS = 'cachedChapters';
const STORE_QUIZZES = 'cachedQuizBank';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openOfflineDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_VIEWED)) {
          db.createObjectStore(STORE_VIEWED, { keyPath: 'id' }).createIndex(
            'by_viewedAt',
            'viewedAt',
            { unique: false }
          );
        }
        if (!db.objectStoreNames.contains(STORE_SAVED)) {
          db.createObjectStore(STORE_SAVED, { keyPath: 'id' }).createIndex(
            'by_savedAt',
            'savedAt',
            { unique: false }
          );
        }
        if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
          db.createObjectStore(STORE_CHAPTERS, { keyPath: 'key' }).createIndex(
            'by_cachedAt',
            'cachedAt',
            { unique: false }
          );
        }
        if (!db.objectStoreNames.contains(STORE_QUIZZES)) {
          db.createObjectStore(STORE_QUIZZES, { keyPath: 'key' }).createIndex(
            'by_savedAt',
            'savedAt',
            { unique: false }
          );
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        dbPromise = null;
        resolve(null);
      };
    } catch {
      dbPromise = null;
      resolve(null);
    }
  });
  return dbPromise;
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

function requestResult<T>(req: IDBRequest<T>): Promise<T | undefined> {
  return new Promise((resolve) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(undefined);
  });
}

type StoredViewedVerse = VerseItem & { viewedAt: number };
type StoredSavedVerse = VerseItem & { savedAt: number };

export interface CachedChapterRow {
  verse: number;
  text: string;
}

export interface StoredCachedChapter {
  key: string;
  trans: string;
  bookId: number;
  chapter: number;
  rows: CachedChapterRow[];
  cachedAt: number;
}

interface StoredQuizBankEntry {
  key: string;
  lang: LanguageCode;
  scopeKey: string;
  questions: QuizQuestion[];
  savedAt: number;
}

export async function recordViewedVerse(verse: VerseItem): Promise<void> {
  const db = await openOfflineDB();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_VIEWED, 'readwrite');
    const store = tx.objectStore(STORE_VIEWED);
    const record: StoredViewedVerse = { ...verse, viewedAt: Date.now() };
    store.put(record);
    const allRows =
      ((await requestResult(store.getAll())) as StoredViewedVerse[] | undefined) ||
      [];
    if (allRows.length > 80) {
      const sortedOldestFirst = [...allRows].sort(
        (a, b) => a.viewedAt - b.viewedAt
      );
      const excessCount = sortedOldestFirst.length - 80;
      for (let i = 0; i < excessCount; i++) {
        store.delete(sortedOldestFirst[i].id);
      }
    }
    await txDone(tx);
  } catch {
    // ignore storage errors
  }
}

export async function getViewedVerses(limit = 50): Promise<VerseItem[]> {
  const db = await openOfflineDB();
  if (!db) return [];
  try {
    const all =
      ((await requestResult(
        db.transaction(STORE_VIEWED, 'readonly').objectStore(STORE_VIEWED).getAll()
      )) as StoredViewedVerse[] | undefined) || [];
    return all
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, limit)
      .map(({ viewedAt: _viewedAt, ...verse }) => verse);
  } catch {
    return [];
  }
}

export async function syncSavedVersesToIDB(verses: VerseItem[]): Promise<void> {
  const db = await openOfflineDB();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_SAVED, 'readwrite');
    const store = tx.objectStore(STORE_SAVED);
    store.clear();
    const baseTime = Date.now();
    verses.forEach((verse, idx) => {
      const record: StoredSavedVerse = { ...verse, savedAt: baseTime - idx };
      store.put(record);
    });
    await txDone(tx);
  } catch {
    // ignore storage errors
  }
}

export async function getSavedVersesFromIDB(): Promise<VerseItem[]> {
  const db = await openOfflineDB();
  if (!db) return [];
  try {
    const all =
      ((await requestResult(
        db.transaction(STORE_SAVED, 'readonly').objectStore(STORE_SAVED).getAll()
      )) as StoredSavedVerse[] | undefined) || [];
    return all
      .sort((a, b) => b.savedAt - a.savedAt)
      .map(({ savedAt: _savedAt, ...verse }) => verse);
  } catch {
    return [];
  }
}

export async function getCachedChapterFromIDB(
  trans: string,
  bookId: number,
  chapter: number
): Promise<CachedChapterRow[] | null> {
  const db = await openOfflineDB();
  if (!db) return null;
  const key = `${trans}:${bookId}:${chapter}`;
  try {
    const record = (await requestResult(
      db.transaction(STORE_CHAPTERS, 'readonly').objectStore(STORE_CHAPTERS).get(key)
    )) as StoredCachedChapter | undefined;
    return record && Array.isArray(record.rows) && record.rows.length > 0
      ? record.rows
      : null;
  } catch {
    return null;
  }
}

export async function saveCachedChapterToIDB(
  trans: string,
  bookId: number,
  chapter: number,
  rows: CachedChapterRow[]
): Promise<void> {
  if (rows.length === 0) return;
  const db = await openOfflineDB();
  if (!db) return;
  const key = `${trans}:${bookId}:${chapter}`;
  try {
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    const store = tx.objectStore(STORE_CHAPTERS);
    const entry: StoredCachedChapter = {
      key,
      trans,
      bookId,
      chapter,
      rows,
      cachedAt: Date.now(),
    };
    store.put(entry);
    const allRows =
      ((await requestResult(store.getAll())) as StoredCachedChapter[] | undefined) ||
      [];
    if (allRows.length > 140) {
      const oldest = [...allRows].sort((a, b) => a.cachedAt - b.cachedAt);
      const excess = oldest.length - 140;
      for (let i = 0; i < excess; i++) {
        store.delete(oldest[i].key);
      }
    }
    await txDone(tx);
  } catch {
    // ignore storage errors
  }
}

export async function getAllCachedChaptersFromIDB(
  trans?: string
): Promise<StoredCachedChapter[]> {
  const db = await openOfflineDB();
  if (!db) return [];
  try {
    const all =
      ((await requestResult(
        db.transaction(STORE_CHAPTERS, 'readonly').objectStore(STORE_CHAPTERS).getAll()
      )) as StoredCachedChapter[] | undefined) || [];
    if (!trans) return all;
    return all.filter((entry) => entry.trans === trans);
  } catch {
    return [];
  }
}

export async function saveQuizQuestionsToOfflineBank(
  lang: LanguageCode,
  scopeKey: string,
  questions: QuizQuestion[]
): Promise<void> {
  if (questions.length === 0) return;
  const db = await openOfflineDB();
  if (!db) return;
  const key = `${lang}:${scopeKey}`;
  try {
    const tx = db.transaction(STORE_QUIZZES, 'readwrite');
    const store = tx.objectStore(STORE_QUIZZES);
    const existing = (await requestResult(
      store.get(key)
    )) as StoredQuizBankEntry | undefined;
    const mergedMap = new Map<string, QuizQuestion>();
    for (const q of questions) {
      mergedMap.set(q.question.trim().toLowerCase(), q);
    }
    for (const q of existing?.questions || []) {
      const k = q.question.trim().toLowerCase();
      if (!mergedMap.has(k)) mergedMap.set(k, q);
    }
    const merged = Array.from(mergedMap.values()).slice(0, 60);
    const entry: StoredQuizBankEntry = {
      key,
      lang,
      scopeKey,
      questions: merged,
      savedAt: Date.now(),
    };
    store.put(entry);
    await txDone(tx);
  } catch {
    // ignore storage errors
  }
}

export async function getQuizQuestionsFromOfflineBank(
  lang: LanguageCode,
  scopeKey: string,
  excludeQuestions: string[],
  count = 6
): Promise<QuizQuestion[]> {
  const db = await openOfflineDB();
  if (!db) return [];
  const exactKey = `${lang}:${scopeKey}`;
  const askedSet = new Set(excludeQuestions.map((q) => q.trim().toLowerCase()));
  try {
    const store = db
      .transaction(STORE_QUIZZES, 'readonly')
      .objectStore(STORE_QUIZZES);
    const exactEntry = (await requestResult(
      store.get(exactKey)
    )) as StoredQuizBankEntry | undefined;

    let pool: QuizQuestion[] = exactEntry?.questions
      ? [...exactEntry.questions]
      : [];

    if (pool.length < count) {
      const allEntries =
        ((await requestResult(store.getAll())) as StoredQuizBankEntry[] | undefined) ||
        [];
      const sameLangPool = allEntries
        .filter((e) => e.lang === lang && e.key !== exactKey)
        .flatMap((e) => e.questions);
      pool = [...pool, ...sameLangPool];
    }

    if (pool.length === 0) return [];

    const deduped = new Map<string, QuizQuestion>();
    for (const q of pool) {
      const k = q.question.trim().toLowerCase();
      if (!deduped.has(k)) deduped.set(k, q);
    }
    const uniquePool = Array.from(deduped.values());
    const fresh = uniquePool.filter(
      (q) => !askedSet.has(q.question.trim().toLowerCase())
    );
    const source = fresh.length >= count ? fresh : uniquePool;
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  } catch {
    return [];
  }
}

const PRECACHE_DAILY_VERSES_URL = './data/daily-verses-50.json';
let cachedDaily50Verses: VerseItem[] | null = null;
let daily50FetchPromise: Promise<VerseItem[]> | null = null;

export async function loadPreCachedDailyVerses(): Promise<VerseItem[]> {
  if (cachedDaily50Verses && cachedDaily50Verses.length > 0) {
    return cachedDaily50Verses;
  }
  if (typeof window === 'undefined') return [];
  if (daily50FetchPromise) return daily50FetchPromise;

  daily50FetchPromise = (async () => {
    try {
      const resp = await fetch(PRECACHE_DAILY_VERSES_URL);
      if (!resp.ok) return [];
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        cachedDaily50Verses = (data as VerseItem[]).slice(0, 50);
        return cachedDaily50Verses;
      }
      return [];
    } catch {
      return [];
    } finally {
      daily50FetchPromise = null;
    }
  })();

  return daily50FetchPromise;
}

export function getLoadedPreCachedDailyVerses(): VerseItem[] {
  return cachedDaily50Verses || [];
}

export async function hydrateOfflineDailyVerses(): Promise<VerseItem[]> {
  const daily50 = await loadPreCachedDailyVerses();
  if (daily50.length === 0) return [];
  const db = await openOfflineDB();
  if (!db) return daily50;

  try {
    const tx = db.transaction(STORE_VIEWED, 'readwrite');
    const store = tx.objectStore(STORE_VIEWED);
    const existing =
      ((await requestResult(store.getAll())) as StoredViewedVerse[] | undefined) ||
      [];
    if (existing.length < 50) {
      const existingIds = new Set(existing.map((item) => item.id));
      const baseSeedTimestamp = Date.now() - 86400000;
      let slotsRemaining = 50 - existing.length;
      for (let i = 0; i < daily50.length && slotsRemaining > 0; i++) {
        const verse = daily50[i];
        if (existingIds.has(verse.id)) continue;
        store.put({ ...verse, viewedAt: baseSeedTimestamp - i });
        existingIds.add(verse.id);
        slotsRemaining -= 1;
      }
    }
    await txDone(tx);
  } catch {
    // ignore storage errors
  }
  return daily50;
}

export async function searchOfflineVerses(
  query: string,
  extraPool: VerseItem[] = []
): Promise<VerseItem[]> {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  const [viewed, saved, daily50] = await Promise.all([
    getViewedVerses(50),
    getSavedVersesFromIDB(),
    loadPreCachedDailyVerses(),
  ]);
  const deduped = new Map<string, VerseItem>();
  for (const item of [...saved, ...viewed, ...daily50, ...extraPool]) {
    if (!deduped.has(item.id)) deduped.set(item.id, item);
  }
  return Array.from(deduped.values()).filter(
    (item) =>
      item.reference.toLowerCase().includes(needle) ||
      item.text.toLowerCase().includes(needle) ||
      item.bookName.toLowerCase().includes(needle) ||
      item.themes.some((th) => th.toLowerCase().includes(needle)) ||
      (item.meditation ? item.meditation.toLowerCase().includes(needle) : false)
  );
}
