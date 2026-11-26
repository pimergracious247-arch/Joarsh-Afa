import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  BIBLE_BOOKS,
  findBookById,
  findBookByQuery,
  getLocalizedBookName,
} from './src/data/bibleBooks';
import { getLocalizedCategory, getQuizCategoryById } from './src/data/categories';
import { TRANSLATIONS } from './src/data/translations';
import type { AgeGroup, LanguageCode, StoryTheme, VerseItem } from './src/types';

const PORT = Number(process.env.PORT) || 3000;

const BOLLS_TRANSLATION_MAP: Record<LanguageCode, string> = {
  en: 'ESV',
  it: 'NR06',
  sw: 'SUV',
  fr: 'FRLSG',
  es: 'RV1960',
  pt: 'ARC09',
  de: 'LUT',
  ar: 'SVD',
  hi: 'HIOV',
  zh: 'CUNPS',
};

const SECONDARY_BOLLS_TRANSLATION_MAP: Partial<Record<LanguageCode, string>> = {
  en: 'WEB',
  it: 'VULG',
  fr: 'NBS',
  es: 'NVI',
  pt: 'ARA',
  de: 'SCH',
  ar: 'NAV',
  zh: 'CUNP',
};

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  it: 'Italian',
  sw: 'Swahili',
  fr: 'French',
  es: 'Spanish',
  pt: 'Portuguese',
  de: 'German',
  ar: 'Arabic',
  hi: 'Hindi',
  zh: 'Chinese (Simplified)',
};

const VALID_LANGS = new Set<LanguageCode>([
  'en',
  'it',
  'sw',
  'fr',
  'es',
  'pt',
  'de',
  'ar',
  'hi',
  'zh',
]);

function normalizeLang(input: unknown): LanguageCode {
  if (typeof input === 'string' && VALID_LANGS.has(input as LanguageCode)) {
    return input as LanguageCode;
  }
  return 'en';
}

function cleanScriptureText(raw: string): string {
  return raw
    .replace(/<S>.*?<\/S>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHighlightPrefix(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 5) return text;
  return words.slice(0, 5).join(' ');
}

interface BollsChapterVerse {
  pk?: number;
  verse: number;
  text: string;
}

interface BollsSearchRow {
  pk?: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
  translation?: string;
}

const serverChapterCache = new Map<
  string,
  { rows: BollsChapterVerse[]; usedVersion: string; cachedAt: number }
>();

async function fetchBollsChapter(
  translation: string,
  bookId: number,
  chapter: number,
  secondaryTranslation?: string
): Promise<{ rows: BollsChapterVerse[]; usedVersion: string }> {
  const cacheKey = `${translation}:${bookId}:${chapter}`;
  const cached = serverChapterCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < 1000 * 60 * 60) {
    return { rows: cached.rows, usedVersion: cached.usedVersion };
  }

  const tryFetch = async (ver: string): Promise<BollsChapterVerse[]> => {
    const resp = await fetch(
      `https://bolls.life/get-text/${encodeURIComponent(ver)}/${bookId}/${chapter}/`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!resp.ok) {
      throw new Error(`Bolls API responded ${resp.status}`);
    }
    const data = (await resp.json()) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(
      (row): row is BollsChapterVerse =>
        typeof row === 'object' &&
        row !== null &&
        typeof (row as BollsChapterVerse).verse === 'number' &&
        typeof (row as BollsChapterVerse).text === 'string'
    );
  };

  try {
    const rows = await tryFetch(translation);
    if (rows.length > 0) {
      serverChapterCache.set(cacheKey, {
        rows,
        usedVersion: translation,
        cachedAt: Date.now(),
      });
      return { rows, usedVersion: translation };
    }
  } catch {
    // try same-language secondary translation below
  }

  if (secondaryTranslation && secondaryTranslation !== translation) {
    try {
      const rows = await tryFetch(secondaryTranslation);
      if (rows.length > 0) {
        serverChapterCache.set(cacheKey, {
          rows,
          usedVersion: secondaryTranslation,
          cachedAt: Date.now(),
        });
        return { rows, usedVersion: secondaryTranslation };
      }
    } catch {
      // keep empty result without falling back to another language
    }
  }

  return { rows: [], usedVersion: translation };
}

function toVerseItem(
  bookId: number,
  chapter: number,
  verse: number,
  rawText: string,
  version: string,
  lang: LanguageCode,
  extraTheme?: string
): VerseItem {
  const bookName = getLocalizedBookName(bookId, lang);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const text = cleanScriptureText(rawText);
  return {
    id: `${bookId}:${chapter}:${verse}`,
    bookId,
    bookName,
    chapter,
    verse,
    reference: `${bookName} ${chapter}:${verse}`,
    highlightPrefix: extractHighlightPrefix(text),
    text,
    version,
    themes: extraTheme ? [extraTheme, bookName] : [t.themes.faith, t.themes.scripture],
    lang,
  };
}

interface GeneratedQuestionItem {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  reference: string;
  storyTheme: StoryTheme;
}

const VALID_THEMES = new Set<StoryTheme>([
  'noah',
  'david',
  'whale',
  'shepherd',
  'bible',
]);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      status: 'ok',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  app.get('/api/bible/chapter', async (req: Request, res: Response) => {
    try {
      const lang = normalizeLang(req.query.lang);
      const translation = BOLLS_TRANSLATION_MAP[lang] || 'ESV';
      const requestedBookId = Number(req.query.book) || 19;
      const bookMeta = findBookById(requestedBookId) || BIBLE_BOOKS[18];
      const requestedChapter = Number(req.query.chapter) || 1;
      const chapter = Math.min(Math.max(1, requestedChapter), bookMeta.chapters);
      const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

      const { rows, usedVersion } = await fetchBollsChapter(
        translation,
        bookMeta.id,
        chapter,
        SECONDARY_BOLLS_TRANSLATION_MAP[lang]
      );
      if (rows.length === 0) {
        res.status(404).json({ error: 'Chapter could not be loaded.' });
        return;
      }

      const verses = rows.map((r) =>
        toVerseItem(
          bookMeta.id,
          chapter,
          r.verse,
          r.text,
          usedVersion,
          lang,
          t.themes.scripture
        )
      );

      res.json({
        bookId: bookMeta.id,
        bookName: getLocalizedBookName(bookMeta.id, lang),
        chapter,
        totalChapters: bookMeta.chapters,
        version: usedVersion,
        verses,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load chapter.';
      res.status(502).json({ error: message });
    }
  });

  app.get('/api/bible/verse', async (req: Request, res: Response) => {
    try {
      const lang = normalizeLang(req.query.lang);
      const translation = BOLLS_TRANSLATION_MAP[lang] || 'ESV';

      const requestedBookId = Number(req.query.book) || 43;
      const bookMeta = findBookById(requestedBookId) || BIBLE_BOOKS[42];
      const requestedChapter = Number(req.query.chapter) || 3;
      const chapter = Math.min(Math.max(1, requestedChapter), bookMeta.chapters);
      const requestedVerse = req.query.verse ? Number(req.query.verse) : null;
      const isRandom = req.query.random === '1' || req.query.random === 'true';

      const seenRaw = typeof req.query.seen === 'string' ? req.query.seen : '';
      const seenSet = new Set(
        seenRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );

      const { rows, usedVersion } = await fetchBollsChapter(
        translation,
        bookMeta.id,
        chapter,
        SECONDARY_BOLLS_TRANSLATION_MAP[lang]
      );
      if (rows.length === 0) {
        res.status(404).json({ error: 'Verse chapter could not be loaded.' });
        return;
      }

      let picked = rows[0];
      if (requestedVerse) {
        picked = rows.find((r) => r.verse === requestedVerse) || rows[0];
      } else if (isRandom) {
        const unseen = rows.filter(
          (r) => !seenSet.has(`${bookMeta.id}:${chapter}:${r.verse}`)
        );
        const pool = unseen.length > 0 ? unseen : rows;
        picked = pool[Math.floor(Math.random() * pool.length)];
      }

      res.json(
        toVerseItem(
          bookMeta.id,
          chapter,
          picked.verse,
          picked.text,
          usedVersion,
          lang
        )
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to load verse.';
      res.status(502).json({ error: message });
    }
  });

  app.get('/api/bible/search', async (req: Request, res: Response) => {
    try {
      const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      if (query.length < 2) {
        res.json({ results: [] });
        return;
      }

      const lang = normalizeLang(req.query.lang);
      const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
      const translation = BOLLS_TRANSLATION_MAP[lang] || 'ESV';

      const refMatch = query.match(/^(.+?)(?:\s+|(?<=[\p{Script=Han}]))(\d+)(?:[:.,](\d+))?$/u);
      if (refMatch) {
        const matchedBook = findBookByQuery(refMatch[1]);
        if (matchedBook) {
          const chapter = Math.min(
            Math.max(1, parseInt(refMatch[2], 10)),
            matchedBook.chapters
          );
          const specificVerse = refMatch[3] ? parseInt(refMatch[3], 10) : null;
          const { rows, usedVersion } = await fetchBollsChapter(
            translation,
            matchedBook.id,
            chapter,
            SECONDARY_BOLLS_TRANSLATION_MAP[lang]
          );
          const filtered = specificVerse
            ? rows.filter((r) => r.verse === specificVerse)
            : rows;

          if (filtered.length > 0) {
            res.json({
              results: filtered.map((r) =>
                toVerseItem(
                  matchedBook.id,
                  chapter,
                  r.verse,
                  r.text,
                  usedVersion,
                  lang,
                  t.themes.scripture
                )
              ),
            });
            return;
          }
        }
      }

      const searchBookOnly = findBookByQuery(query);
      if (searchBookOnly && query.split(/\s+/).length <= 3) {
        const { rows, usedVersion } = await fetchBollsChapter(
          translation,
          searchBookOnly.id,
          1,
          SECONDARY_BOLLS_TRANSLATION_MAP[lang]
        );
        if (rows.length > 0) {
          res.json({
            results: rows.map((r) =>
              toVerseItem(
                searchBookOnly.id,
                1,
                r.verse,
                r.text,
                usedVersion,
                lang,
                t.themes.scripture
              )
            ),
          });
          return;
        }
      }

      let results: VerseItem[] = [];
      if (query.length >= 3) {
        try {
          const searchUrl = `https://bolls.life/v2/find/${encodeURIComponent(translation)}?search=${encodeURIComponent(query)}&match_case=false&match_whole=false`;
          const resp = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });
          if (resp.ok) {
            const payload = (await resp.json()) as { results?: BollsSearchRow[] } | BollsSearchRow[];
            const rawResults = Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.results)
                ? payload.results
                : [];

            results = rawResults
              .filter(
                (row): row is BollsSearchRow =>
                  typeof row === 'object' &&
                  row !== null &&
                  typeof row.book === 'number' &&
                  typeof row.chapter === 'number' &&
                  typeof row.verse === 'number' &&
                  typeof row.text === 'string'
              )
              .slice(0, 30)
              .map((row) =>
                toVerseItem(
                  row.book,
                  row.chapter,
                  row.verse,
                  row.text,
                  row.translation || translation,
                  lang,
                  t.themes.search
                )
              );
          }
        } catch {
          // fall through to cached/popular chapter search fallback
        }
      }

      if (results.length === 0) {
        const needle = query.toLowerCase();
        const popularChapters: Array<[number, number]> = [
          [19, 23],
          [43, 3],
          [40, 5],
          [45, 8],
          [20, 3],
          [1, 1],
          [46, 13],
          [50, 4],
        ];
        await Promise.all(
          popularChapters.map(([bId, ch]) =>
            fetchBollsChapter(
              translation,
              bId,
              ch,
              SECONDARY_BOLLS_TRANSLATION_MAP[lang]
            )
          )
        );
        const allowedVersions = new Set(
          [translation, SECONDARY_BOLLS_TRANSLATION_MAP[lang]].filter(Boolean)
        );
        const deduped = new Map<string, VerseItem>();
        for (const [key, entry] of serverChapterCache.entries()) {
          if (!allowedVersions.has(entry.usedVersion)) continue;
          const parts = key.split(':');
          const bId = parseInt(parts[1] || '0', 10);
          const ch = parseInt(parts[2] || '0', 10);
          if (!bId || !ch) continue;
          for (const row of entry.rows) {
            const clean = cleanScriptureText(row.text);
            if (clean.toLowerCase().includes(needle)) {
              const item = toVerseItem(
                bId,
                ch,
                row.verse,
                row.text,
                entry.usedVersion,
                lang,
                t.themes.search
              );
              if (!deduped.has(item.id)) deduped.set(item.id, item);
              if (deduped.size >= 30) break;
            }
          }
          if (deduped.size >= 30) break;
        }
        results = Array.from(deduped.values());
      }

      res.json({ results });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to search verses.';
      res.status(502).json({ error: message });
    }
  });

  const GOOGLE_TTS_LANG_MAP: Record<LanguageCode, string> = {
    en: 'en',
    it: 'it',
    sw: 'sw',
    fr: 'fr',
    es: 'es',
    pt: 'pt',
    de: 'de',
    ar: 'ar',
    hi: 'hi',
    zh: 'zh-CN',
  };

  const ttsCache = new Map<
    string,
    { buffer: Buffer; contentType: string; cachedAt: number }
  >();

  const splitTtsChunks = (raw: string, maxLen = 175): string[] => {
    const clean = raw
      .replace(/[«»“”„‟〔〕]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return [];
    if (clean.length <= maxLen) return [clean];

    const primaryParts = clean
      .split(/(?<=[.!?।؟。！？،؛,;:])\s*/)
      .map((s) => s.trim())
      .filter(Boolean);

    const chunks: string[] = [];
    let current = '';

    const pushChunk = (piece: string) => {
      const trimmed = piece.trim();
      if (trimmed) chunks.push(trimmed);
    };

    for (const part of primaryParts) {
      if (part.length <= maxLen) {
        if (current && current.length + part.length + 1 <= maxLen) {
          current = `${current} ${part}`;
        } else {
          if (current) pushChunk(current);
          current = part;
        }
        continue;
      }

      if (current) {
        pushChunk(current);
        current = '';
      }
      const words = part.split(/\s+/).filter(Boolean);
      if (words.length <= 1) {
        for (let i = 0; i < part.length; i += maxLen) {
          pushChunk(part.slice(i, i + maxLen));
        }
      } else {
        let wordBuf = '';
        for (const w of words) {
          if (w.length > maxLen) {
            if (wordBuf) {
              pushChunk(wordBuf);
              wordBuf = '';
            }
            for (let i = 0; i < w.length; i += maxLen) {
              pushChunk(w.slice(i, i + maxLen));
            }
          } else if (wordBuf && wordBuf.length + w.length + 1 <= maxLen) {
            wordBuf = `${wordBuf} ${w}`;
          } else {
            if (wordBuf) pushChunk(wordBuf);
            wordBuf = w;
          }
        }
        if (wordBuf) pushChunk(wordBuf);
      }
    }
    if (current) pushChunk(current);
    return chunks;
  };

  const handleTtsRequest = async (req: Request, res: Response) => {
    try {
      const rawText =
        req.method === 'POST'
          ? (req.body as { text?: unknown })?.text
          : req.query.text;
      const rawLang =
        req.method === 'POST'
          ? (req.body as { lang?: unknown })?.lang
          : req.query.lang;
      const rawGender =
        req.method === 'POST'
          ? (req.body as { gender?: unknown })?.gender
          : req.query.gender;

      const text =
        typeof rawText === 'string'
          ? rawText.replace(/\s+/g, ' ').trim().slice(0, 1200)
          : '';
      if (!text) {
        res.status(400).json({ error: 'Missing text parameter.' });
        return;
      }

      const lang = normalizeLang(rawLang);
      const gender = typeof rawGender === 'string' ? rawGender : 'female';
      const cacheKey = `${lang}:${gender}:${text}`;
      const cached = ttsCache.get(cacheKey);
      if (cached && Date.now() - cached.cachedAt < 1000 * 60 * 120) {
        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.send(cached.buffer);
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
          });
          const voiceName =
            gender === 'male'
              ? 'Charon'
              : gender === 'kids'
                ? 'Zephyr'
                : gender === 'teen'
                  ? 'Puck'
                  : 'Kore';
          const geminiResp = await ai.models.generateContent({
            model: 'gemini-3.8-flash-lite-tts',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text,
                    speechMetadata: {
                      style: `Speak clearly and warmly in ${LANGUAGE_LABELS[lang]}, pronouncing every word and number naturally.`,
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
            },
          });
          const inlinePart =
            geminiResp.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlinePart?.data) {
            const wavBuffer = Buffer.from(inlinePart.data, 'base64');
            const contentType = inlinePart.mimeType || 'audio/wav';
            if (ttsCache.size >= 150) {
              const oldestKey = ttsCache.keys().next().value;
              if (oldestKey) ttsCache.delete(oldestKey);
            }
            ttsCache.set(cacheKey, {
              buffer: wavBuffer,
              contentType,
              cachedAt: Date.now(),
            });
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.send(wavBuffer);
            return;
          }
        } catch {
          // Fall back to chunked MP3 synthesis below
        }
      }

      const tl = GOOGLE_TTS_LANG_MAP[lang] || 'en';
      const chunks = splitTtsChunks(text, 175);
      if (chunks.length === 0) {
        res.status(400).json({ error: 'Empty speech text.' });
        return;
      }

      const mp3Buffers: Buffer[] = [];
      for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx];
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(chunk)}&total=${chunks.length}&idx=${idx}&textlen=${chunk.length}`;
        const ttsResp = await fetch(ttsUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(6000),
        });
        if (!ttsResp.ok) {
          throw new Error(`Upstream TTS responded ${ttsResp.status}`);
        }
        const chunkBuf = Buffer.from(await ttsResp.arrayBuffer());
        if (chunkBuf.length > 0) {
          mp3Buffers.push(chunkBuf);
        }
      }

      if (mp3Buffers.length === 0) {
        res.status(502).json({ error: 'Unable to synthesize speech.' });
        return;
      }

      const combined = Buffer.concat(mp3Buffers);
      if (ttsCache.size >= 150) {
        const oldestKey = ttsCache.keys().next().value;
        if (oldestKey) ttsCache.delete(oldestKey);
      }
      ttsCache.set(cacheKey, {
        buffer: combined,
        contentType: 'audio/mpeg',
        cachedAt: Date.now(),
      });
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(combined);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to generate audio.';
      res.status(502).json({ error: message });
    }
  };

  app.get('/api/tts', handleTtsRequest);
  app.post('/api/tts', handleTtsRequest);

  app.post('/api/quiz/generate', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not set on server.',
      });
      return;
    }

    try {
      const body = (req.body || {}) as {
        lang?: unknown;
        ageGroup?: unknown;
        bookFilter?: unknown;
        categoryId?: unknown;
        askedQuestions?: unknown;
      };

      const lang = normalizeLang(body.lang);
      const languageName = LANGUAGE_LABELS[lang];
      const ageGroup: AgeGroup =
        body.ageGroup === 'kids' ||
        body.ageGroup === 'teens' ||
        body.ageGroup === 'adults'
          ? body.ageGroup
          : 'adults';
      const bookFilter =
        typeof body.bookFilter === 'string' && body.bookFilter.trim()
          ? body.bookFilter.trim()
          : 'all';
      const categoryId =
        typeof body.categoryId === 'string' ? body.categoryId.trim() : '';
      const category = categoryId ? getQuizCategoryById(categoryId) : undefined;
      const askedQuestions = Array.isArray(body.askedQuestions)
        ? body.askedQuestions
            .filter((q): q is string => typeof q === 'string')
            .slice(-18)
        : [];

      let scopeInstruction = 'Cover diverse Old and New Testament passages.';
      if (category) {
        const localizedCat = getLocalizedCategory(category, lang);
        const bookNames = category.bookIds
          .map((id) => getLocalizedBookName(id, lang))
          .filter(Boolean)
          .join(', ');
        scopeInstruction = `Focus on "${localizedCat.title}"${
          bookNames ? ` (${bookNames})` : ''
        }.${category.hardMode ? ' Include deeper prophetic details.' : ''}`;
      } else if (bookFilter !== 'all') {
        scopeInstruction = `Focus strictly on the Bible book "${getLocalizedBookName(bookFilter, lang)}".`;
      }

      const difficultyNote =
        ageGroup === 'kids'
          ? 'Keep questions friendly and clear for ages 6-11.'
          : ageGroup === 'teens'
            ? 'Make questions engaging for teens.'
            : 'Make questions thoughtful for adult readers.';

      const avoidBlock =
        askedQuestions.length > 0
          ? `Avoid repeating:\n- ${askedQuestions.join('\n- ')}`
          : '';

      const sampleRef = `${getLocalizedBookName(43, lang)} 3:16`;
      const prompt = [
        `Generate 6 concise multiple-choice Bible quiz questions in ${languageName}.`,
        `CRITICAL LANGUAGE RULE: Write 100% of every question, all 4 options, and every Scripture reference (using ${languageName} book names, e.g. "${sampleRef}") exclusively in ${languageName}. Never include English words or untranslated labels.`,
        difficultyNote,
        scopeInstruction,
        avoidBlock,
        'Each item: concise question, 4 distinct short options, correctIndex (0-3), Scripture reference, storyTheme ("noah"|"david"|"whale"|"shepherd"|"bible").',
      ]
        .filter(Boolean)
        .join('\n');

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctIndex: { type: Type.INTEGER },
                    reference: { type: Type.STRING },
                    storyTheme: { type: Type.STRING },
                  },
                  required: [
                    'question',
                    'options',
                    'correctIndex',
                    'reference',
                    'storyTheme',
                  ],
                },
              },
            },
            required: ['questions'],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({ error: 'Empty response from quiz model.' });
        return;
      }

      const parsed = JSON.parse(rawText) as {
        questions?: GeneratedQuestionItem[];
      };
      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        res.status(502).json({ error: 'Quiz model returned no questions.' });
        return;
      }

      const sanitized = parsed.questions
        .filter(
          (q) =>
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            q.options.every((opt) => typeof opt === 'string' && opt.trim().length > 0) &&
            typeof q.correctIndex === 'number' &&
            q.correctIndex >= 0 &&
            q.correctIndex <= 3 &&
            typeof q.reference === 'string'
        )
        .slice(0, 6)
        .map((q, idx) => ({
          id: `gemini-${Date.now()}-${idx}`,
          question: q.question.trim(),
          options: q.options.map((opt) => opt.trim()),
          correctIndex: Math.floor(q.correctIndex),
          reference: q.reference.trim(),
          storyTheme: VALID_THEMES.has(q.storyTheme)
            ? q.storyTheme
            : category?.storyTheme || 'bible',
        }));

      if (sanitized.length === 0) {
        res
          .status(502)
          .json({ error: 'Quiz model returned invalid question items.' });
        return;
      }

      res.json({ questions: sanitized });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Quiz generation failed.';
      const status =
        typeof (err as { status?: unknown }).status === 'number'
          ? (err as { status: number }).status
          : /429|RESOURCE_EXHAUSTED|quota/i.test(message)
            ? 429
            : 502;
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bible Quest server listening on http://localhost:${PORT}`);
  });
}

void startServer();
