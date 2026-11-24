import { DynamicVerseItem } from '../types';

const DB_NAME = 'bible_quest_offline_v1';
const DB_VERSION = 1;
const STORE_VIEWED = 'viewedVerses';
const STORE_SAVED = 'savedVerses';
export const MAX_VIEWED_VERSES = 50;

interface StoredViewedVerse extends DynamicVerseItem {
  viewedAt: number;
}

interface StoredSavedVerse extends DynamicVerseItem {
  savedAt: number;
}

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
          const viewedStore = db.createObjectStore(STORE_VIEWED, {
            keyPath: 'id',
          });
          viewedStore.createIndex('by_viewedAt', 'viewedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_SAVED)) {
          const savedStore = db.createObjectStore(STORE_SAVED, {
            keyPath: 'id',
          });
          savedStore.createIndex('by_savedAt', 'savedAt', { unique: false });
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

export async function recordViewedVerse(verse: DynamicVerseItem): Promise<void> {
  const db = await openOfflineDB();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_VIEWED, 'readwrite');
    const store = tx.objectStore(STORE_VIEWED);

    const record: StoredViewedVerse = {
      ...verse,
      viewedAt: Date.now(),
    };
    store.put(record);

    const allRows =
      (await requestResult<StoredViewedVerse[]>(store.getAll())) || [];
    if (allRows.length > MAX_VIEWED_VERSES) {
      const sortedOldestFirst = [...allRows].sort(
        (a, b) => a.viewedAt - b.viewedAt
      );
      const excessCount = sortedOldestFirst.length - MAX_VIEWED_VERSES;
      for (let i = 0; i < excessCount; i++) {
        store.delete(sortedOldestFirst[i].id);
      }
    }

    await txDone(tx);
  } catch {
    // ignore storage quota / private mode failures
  }
}

export async function getViewedVerses(
  limit = MAX_VIEWED_VERSES
): Promise<DynamicVerseItem[]> {
  const db = await openOfflineDB();
  if (!db) return [];

  try {
    const tx = db.transaction(STORE_VIEWED, 'readonly');
    const store = tx.objectStore(STORE_VIEWED);
    const allRows =
      (await requestResult<StoredViewedVerse[]>(store.getAll())) || [];
    return allRows
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, limit)
      .map(({ viewedAt: _viewedAt, ...verse }) => verse);
  } catch {
    return [];
  }
}

export async function syncSavedVersesToIDB(
  verses: DynamicVerseItem[]
): Promise<void> {
  const db = await openOfflineDB();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_SAVED, 'readwrite');
    const store = tx.objectStore(STORE_SAVED);
    store.clear();
    const baseTime = Date.now();
    verses.forEach((verse, idx) => {
      const record: StoredSavedVerse = {
        ...verse,
        savedAt: baseTime - idx,
      };
      store.put(record);
    });
    await txDone(tx);
  } catch {
    // ignore
  }
}

export async function getSavedVersesFromIDB(): Promise<DynamicVerseItem[]> {
  const db = await openOfflineDB();
  if (!db) return [];

  try {
    const tx = db.transaction(STORE_SAVED, 'readonly');
    const store = tx.objectStore(STORE_SAVED);
    const allRows =
      (await requestResult<StoredSavedVerse[]>(store.getAll())) || [];
    return allRows
      .sort((a, b) => b.savedAt - a.savedAt)
      .map(({ savedAt: _savedAt, ...verse }) => verse);
  } catch {
    return [];
  }
}

export async function searchOfflineVerses(
  query: string,
  extraPool: DynamicVerseItem[] = []
): Promise<DynamicVerseItem[]> {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const [viewed, saved] = await Promise.all([
    getViewedVerses(MAX_VIEWED_VERSES),
    getSavedVersesFromIDB(),
  ]);

  const deduped = new Map<string, DynamicVerseItem>();
  for (const item of [...saved, ...viewed, ...extraPool]) {
    if (!deduped.has(item.id)) {
      deduped.set(item.id, item);
    }
  }

  return Array.from(deduped.values()).filter(
    (item) =>
      item.reference.toLowerCase().includes(needle) ||
      item.text.toLowerCase().includes(needle) ||
      item.bookName.toLowerCase().includes(needle) ||
      item.themes.some((th) => th.toLowerCase().includes(needle))
  );
}
