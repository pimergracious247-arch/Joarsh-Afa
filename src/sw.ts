import { clientsClaim } from 'workbox-core';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  cleanupOutdatedCaches,
  matchPrecache,
  precacheAndRoute,
  type PrecacheEntry,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

interface SWExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

interface SWExtendableMessageEvent extends SWExtendableEvent {
  data: { type?: string } | null;
  ports: readonly MessagePort[];
}

interface SWWorkerGlobalScope {
  __WB_MANIFEST: Array<PrecacheEntry | string>;
  registration: ServiceWorkerRegistration;
  skipWaiting(): Promise<void>;
  addEventListener(
    type: 'install' | 'activate',
    listener: (event: SWExtendableEvent) => void
  ): void;
  addEventListener(
    type: 'message',
    listener: (event: SWExtendableMessageEvent) => void
  ): void;
}

interface CachedDailyVerse {
  id: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse: number;
  reference: string;
  highlightPrefix: string;
  text: string;
  version: string;
  themes: [string, string];
  meditation?: string;
  lang: string;
}

declare global {
  var __WB_MANIFEST: Array<PrecacheEntry | string>;
}

const sw = self as unknown as SWWorkerGlobalScope;

const DAILY_VERSES_CACHE = 'bible-daily-verses-50-v1';
const UI_ASSETS_CACHE = 'bible-ui-assets-v1';
const API_VERSES_CACHE = 'bible-verses-api-cache';
const BOLLS_CHAPTERS_CACHE = 'bible-bolls-chapters-kjv-v2';
const GOOGLE_FONTS_CACHE = 'google-fonts-cache';
const GSTATIC_FONTS_CACHE = 'gstatic-fonts-cache';
const APP_IMAGES_CACHE = 'app-images-cache';

const ACTIVE_CUSTOM_CACHES = new Set([
  DAILY_VERSES_CACHE,
  UI_ASSETS_CACHE,
  API_VERSES_CACHE,
  BOLLS_CHAPTERS_CACHE,
  GOOGLE_FONTS_CACHE,
  GSTATIC_FONTS_CACHE,
  APP_IMAGES_CACHE,
]);

const COMMON_BIBLE_UI_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './apple-touch-icon.png',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './pwa-maskable-512x512.png',
];

function resolveScopedUrl(relativePath: string): string {
  try {
    return new URL(relativePath, sw.registration.scope).href;
  } catch {
    return relativePath;
  }
}

async function preCacheDaily50VersesAndUIAssets(): Promise<void> {
  // 1. Pre-cache common Bible UI shell & icons
  try {
    const uiCache = await caches.open(UI_ASSETS_CACHE);
    await Promise.allSettled(
      COMMON_BIBLE_UI_ASSETS.map(async (assetPath) => {
        const assetUrl = resolveScopedUrl(assetPath);
        const resp = await fetch(assetUrl, { cache: 'reload' });
        if (resp.ok) {
          await uiCache.put(assetUrl, resp);
        }
      })
    );
  } catch {
    // Non-fatal if offline during background re-warm
  }

  // 2. Fonts are bundled locally via @fontsource & Workbox precache (zero external network dependency)

  // 3. Pre-cache the first 50 daily verses dataset + individual verse endpoint cache entries
  try {
    const versesUrl = resolveScopedUrl('./data/daily-verses-50.json');
    const versesCache = await caches.open(DAILY_VERSES_CACHE);
    let dataResp: Response | undefined;

    try {
      const networkResp = await fetch(versesUrl, { cache: 'reload' });
      if (networkResp.ok) {
        await versesCache.put(versesUrl, networkResp.clone());
        dataResp = networkResp;
      }
    } catch {
      dataResp =
        (await versesCache.match(versesUrl)) ||
        (await matchPrecache('data/daily-verses-50.json'));
    }

    if (!dataResp) return;
    const parsed = (await dataResp.clone().json()) as CachedDailyVerse[];
    if (!Array.isArray(parsed) || parsed.length === 0) return;

    const first50 = parsed.slice(0, 50);
    const apiCache = await caches.open(API_VERSES_CACHE);

    await Promise.allSettled(
      first50.map(async (verse) => {
        const endpointUrl = resolveScopedUrl(
          `./api/bible/verse?book=${verse.bookId}&chapter=${verse.chapter}&verse=${verse.verse}&lang=en`
        );
        const jsonResponse = new Response(JSON.stringify(verse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Offline-Precache': 'daily-verses-50',
          },
        });
        await apiCache.put(endpointUrl, jsonResponse);
      })
    );
  } catch {
    // Ignore errors so install still succeeds via Workbox precache
  }
}

async function readCachedDaily50Verses(): Promise<CachedDailyVerse[]> {
  const versesUrl = resolveScopedUrl('./data/daily-verses-50.json');
  try {
    const cache = await caches.open(DAILY_VERSES_CACHE);
    const cached =
      (await cache.match(versesUrl)) ||
      (await matchPrecache('data/daily-verses-50.json')) ||
      (await caches.match(versesUrl));
    if (!cached) return [];
    const data = (await cached.json()) as CachedDailyVerse[];
    return Array.isArray(data) ? data.slice(0, 50) : [];
  } catch {
    return [];
  }
}

// Inject Workbox precache manifest (app shell, JS/CSS bundles, Bible images, icons, daily-verses-50.json)
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
void sw.skipWaiting();
clientsClaim();

sw.addEventListener('install', (event) => {
  event.waitUntil(
    preCacheDaily50VersesAndUIAssets().then(() => sw.skipWaiting())
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              !key.startsWith('workbox-') && !ACTIVE_CUSTOM_CACHES.has(key)
          )
          .map((oldKey) => caches.delete(oldKey))
      )
    )
  );
});

sw.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void sw.skipWaiting();
    return;
  }
  if (event.data?.type === 'PRECACHE_DAILY_VERSES') {
    event.waitUntil(
      preCacheDaily50VersesAndUIAssets().then(() => {
        event.ports?.[0]?.postMessage({ ok: true });
      })
    );
  }
});

// App navigation offline support
registerRoute(
  new NavigationRoute(
    async ({ request }) => {
      try {
        const precached = await matchPrecache('index.html');
        if (precached) return precached;
      } catch {
        // Fallback for dev server where index.html is not in precache manifest
      }
      try {
        return await fetch(request);
      } catch {
        const uiCache = await caches.open(UI_ASSETS_CACHE);
        return (
          (await uiCache.match(resolveScopedUrl('./index.html'))) ||
          (await caches.match(resolveScopedUrl('./index.html'))) ||
          Response.error()
        );
      }
    },
    { denylist: [/^\/api\//] }
  )
);

// Daily 50 Verses JSON — always available offline immediately
registerRoute(
  ({ url }) => url.pathname.endsWith('/data/daily-verses-50.json'),
  new CacheFirst({
    cacheName: DAILY_VERSES_CACHE,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Common Bible UI images, story art, and static bundled fonts/assets
registerRoute(
  ({ request, url }) =>
    request.destination === 'image' ||
    /\/(?:src\/)?assets\/.*/i.test(url.pathname) ||
    /\.(?:png|jpg|jpeg|svg|webp|ico|woff|woff2)$/i.test(url.pathname),
  new CacheFirst({
    cacheName: APP_IMAGES_CACHE,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Client-side Bolls.life chapter cache for offline reading continuity
registerRoute(
  ({ url }) => url.origin === 'https://bolls.life',
  new NetworkFirst({
    cacheName: BOLLS_CHAPTERS_CACHE,
    networkTimeoutSeconds: 2,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 150,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// /api/bible/verse with network-first + cache + 50-verse offline synthesis fallback
const verseApiStrategy = new NetworkFirst({
  cacheName: API_VERSES_CACHE,
  networkTimeoutSeconds: 2,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 120,
      maxAgeSeconds: 60 * 60 * 24 * 30,
    }),
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
  ],
});

registerRoute(
  ({ url }) => /\/api\/bible\/verse$/i.test(url.pathname),
  async ({ event, request, url }) => {
    try {
      const response = await verseApiStrategy.handle({
        event,
        request,
      } as Parameters<typeof verseApiStrategy.handle>[0]);
      if (response && response.ok) {
        return response;
      }
    } catch {
      // Offline or timed out -> serve from pre-cached 50 daily verses below
    }

    const daily50 = await readCachedDaily50Verses();
    if (daily50.length > 0) {
      const reqBook = Number(url.searchParams.get('book') || '0');
      const reqChapter = Number(url.searchParams.get('chapter') || '0');
      const reqVerse = Number(url.searchParams.get('verse') || '0');
      const seenSet = new Set(
        (url.searchParams.get('seen') || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );

      let matched =
        (reqBook && reqChapter && reqVerse
          ? daily50.find(
              (v) =>
                v.bookId === reqBook &&
                v.chapter === reqChapter &&
                v.verse === reqVerse
            )
          : undefined) ||
        (reqBook ? daily50.find((v) => v.bookId === reqBook) : undefined);

      if (!matched) {
        const unseen = daily50.filter((v) => !seenSet.has(v.id));
        const pool = unseen.length > 0 ? unseen : daily50;
        matched = pool[Math.floor(Math.random() * pool.length)];
      }

      return new Response(JSON.stringify(matched), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Offline verse unavailable.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
);

// /api/bible/search with network-first + offline search across the 50 pre-cached daily verses
const searchApiStrategy = new NetworkFirst({
  cacheName: 'bible-search-api-cache',
  networkTimeoutSeconds: 2,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 30,
      maxAgeSeconds: 60 * 60 * 24 * 7,
    }),
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
  ],
});

registerRoute(
  ({ url }) => /\/api\/bible\/search$/i.test(url.pathname),
  async ({ event, request, url }) => {
    try {
      const response = await searchApiStrategy.handle({
        event,
        request,
      } as Parameters<typeof searchApiStrategy.handle>[0]);
      if (response && response.ok) {
        return response;
      }
    } catch {
      // Offline -> search pre-cached 50 daily verses
    }

    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const daily50 = await readCachedDaily50Verses();
    const results =
      q.length < 2
        ? []
        : daily50.filter(
            (v) =>
              v.reference.toLowerCase().includes(q) ||
              v.bookName.toLowerCase().includes(q) ||
              v.text.toLowerCase().includes(q) ||
              v.themes.some((t) => t.toLowerCase().includes(q)) ||
              (v.meditation && v.meditation.toLowerCase().includes(q))
          );

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
);
